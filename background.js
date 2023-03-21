console.log("AutoReplies extension is running!");

chrome.runtime.onInstalled.addListener(function() {
  console.log("AutoReplies extension has been installed!");
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("Received message:", message);
});


async function getChatterFeed(sessionId, domain) {
  console.log('domain: '+domain);
  const apiVersion = '57.0'; // Replace with the desired API version
  const apiUrl = `https://${domain}.my.salesforce.com/services/data/v${apiVersion}/chatter/feeds/news/me/feed-elements`;

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${sessionId}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.ok) {
    const data = await response.json();
    console.log('Chatter Feed:', data);
  } else {
    console.error(`Error: ${response.status} ${response.statusText}`);
  }
}

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'chatterApi') {
    port.onMessage.addListener(async (message) => {
      if (message.action === 'getChatterFeed') {
        const sessionId = message.sessionId;
        const domain = message.domain;
        await getChatterFeed(sessionId, domain);
        port.postMessage({ result: 'Chatter Feed requested' });
      }
    });
  }
});


// Function to reply to a Chatter post
async function replyToChatterPost(sessionId, domain, postId, replyText) {
  const apiVersion = '57.0'; // Replace with the desired API version
  const apiUrl = `https://${domain}.my.salesforce.com/services/data/v${apiVersion}/chatter/feed-elements/${postId}/capabilities/comments/items`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sessionId}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "body": {
        "messageSegments": [
          {
            "type": "Text",
            "text": replyText
          }
        ]
      }
    })
  });

  if (response.ok) {
    const data = await response.json();
    console.log('Chatter Reply:', data);
  } else {
    console.error(`Error: ${response.status} ${response.statusText}`);
  }
}

// Function to process the Chatter feed
async function processChatterFeed(domain, sessionId, sobjects, profiles, keywords, response) {
  const apiVersion = '57.0'; // Replace with the desired API version

  const chatterFeedUrl = `https://${domain}.my.salesforce.com/services/data/v${apiVersion}/chatter/feeds/news/me/feed-items`;

  const feedResponse = await fetch(chatterFeedUrl, {
    headers: {
      'Authorization': `Bearer ${sessionId}`
    }
  });

  if (!feedResponse.ok) {
    console.error(`Error: ${feedResponse.status} ${feedResponse.statusText}`);
    return;
  }

  const feedData = await feedResponse.json();

  for (const feedItem of feedData.elements) {
    const feedSobject = feedItem.parent.objectType;

    if (sobjects.includes(feedSobject)) {
      const feedBody = feedItem.body.text.toLowerCase();
      const hasKeyword = keywords.some(keyword => feedBody.includes(keyword.toLowerCase()));

      if (hasKeyword) {
        const profileResponse = await fetch(feedItem.actor.url, {
          headers: {
            'Authorization': `Bearer ${sessionId}`
          }
        });

        if (!profileResponse.ok) {
          console.error(`Error: ${profileResponse.status} ${profileResponse.statusText}`);
          continue;
        }

        const profileData = await profileResponse.json();

        if (profiles.includes(profileData.UserProfile.Name)) {
          await replyToChatterPost(sessionId, domain, feedItem.id, response);
        }
      }
    }
  }
}

// Function to periodically scan the Chatter feed
async function scanChatterFeed() {
  const { domainList, sobjects, profiles, keywords, response } = await new Promise(resolve => {
    chrome.storage.local.get(['domainList', 'sobjects', 'profiles', 'keywords', 'response'], resolve);
  });

  for (const domain of domainList) {
    const sessionId = await getSessionId(domain);
    if (sessionId) {
      await processChatterFeed(domain, sessionId, sobjects, profiles, keywords, response);
    }
  }

  // Schedule the next scan
  const interval = Math.max(15, await getScanInterval()) * 60 * 1000;
  setTimeout(scanChatterFeed, interval);
}

// Start the periodic scanning
scanChatterFeed();


// Function to listen for a manual sync request
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'manual_sync') {
    scanChatterFeed();
    sendResponse({ success: true });
  }
});

// Function to get the scanning interval in minutes
async function getScanInterval() {
  const { scanInterval } = await new Promise(resolve => {
    chrome.storage.local.get(['scanInterval'], resolve);
  });
  return scanInterval || 15;
};

