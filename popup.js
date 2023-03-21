let statusElement = null;

function handleAuthenticateButtonClick() {
  // Get the user's Salesforce domain from the options page
  chrome.storage.local.get(['domainList'], ({ domainList }) => {
    if (!domainList || domainList.length === 0) {
      setStatusMessage('Please add at least one domain to the options page.');
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const currentUrl = new URL(currentTab.url);
      const currentDomain = currentUrl.hostname.replace(/(?:www\.|my\.|lightning\.)?(\w+(?:-\w+)*\.(?:\w+(?:-\w+)*)+)\.(?:my\.salesforce\.com|lightning\.force\.com)/, '$1');

      console.log('currentDomain: '+currentDomain);

      // Check if the current tab domain matches one of the domains in domainList
      const matchingDomain = domainList.find((domain) => currentDomain.endsWith(domain));
      if (!matchingDomain) {
        setStatusMessage(`The current domain "${currentDomain}" is not authorized for authentication.`);
        return;
      }

      // Get the Salesforce session ID from cookies
      chrome.cookies.get({ url: `https://${matchingDomain}.my.salesforce.com`, name: 'sid' }, (cookie) => {
        if (!cookie || !cookie.value) {
          setStatusMessage('Please log in to Salesforce first.');
          return;
        }

        const sessionId = cookie.value;
        // Store the sessionId in storage with domain as key
        chrome.storage.local.get('sessionIds', ({ sessionIds }) => {
          if (!sessionIds) {
            sessionIds = {};
          }
          sessionIds[matchingDomain] = sessionId;
          chrome.storage.local.set({ sessionIds }, () => {
            setStatusMessage('Authentication successful.');
          });
        });
      });
    });
  });
}



function verifySessionId() {
  // Get the user's Salesforce domain and session ID from storage
  chrome.storage.sync.get(['domainsList', 'sessionId'], ({ domainsList, sessionId }) => {
    if (!domainsList || domainsList.length === 0 || !sessionId) {
      setStatusMessage('Please authenticate with Salesforce first.');
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const currentUrl = new URL(currentTab.url);
      const currentDomain = currentUrl.hostname.replace(/(?:www\.|my\.|lightning\.)?(\w+(?:-\w+)*\.(?:\w+(?:-\w+)*)+)\.(?:my\.salesforce\.com|lightning\.force\.com)/, '$1');

      // Check if the current tab domain matches one of the domains in domainsList
      const matchingDomain = domainsList.find((domain) => currentDomain.endsWith(domain));
      if (!matchingDomain) {
        return;
      }

      // Check if the Salesforce session ID is still valid
      chrome.cookies.get({ url: `https://${matchingDomain}.my.salesforce.com`, name: 'sid' }, (cookie) => {
        if (!cookie || !cookie.value || cookie.value !== sessionId) {
          setStatusMessage('Session ID invalid or expired. Please log in to Salesforce again.');
          chrome.storage.sync.remove(['sessionId']);
          return;
        }
      });
    });
  });
}

function getSid() {
  // Get the user's Salesforce session ID from storage
  chrome.storage.local.get(['domainList', 'sessionIds'], ({ domainList, sessionIds }) => {
    if (!sessionIds) {
      setStatusMessage('Session IDs not found.');
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const currentUrl = new URL(currentTab.url);
      const currentDomain = currentUrl.hostname.replace(/(?:www\.|my\.|lightning\.)?(\w+(?:-\w+)*\.(?:\w+(?:-\w+)*)+)\.(?:my\.salesforce\.com|lightning\.force\.com)/, '$1');

      const matchingDomain = domainList.find((domain) => currentDomain.endsWith(domain));
      if (!matchingDomain || !sessionIds[matchingDomain]) {
        setStatusMessage('Session ID not found for the current domain.');
      } else {
        setStatusMessage(`Current SID for ${matchingDomain}: ${sessionIds[matchingDomain]}`);
      }
    });
  });
}

function setStatusMessage(message) {
  statusElement.textContent = message;
}

document.addEventListener('DOMContentLoaded', () => {
  statusElement = document.getElementById('status');
  document.getElementById('authenticate').addEventListener('click', handleAuthenticateButtonClick);
  document.getElementById('show-sid').addEventListener('click', getSid);
});

document.getElementById('test-chatter').addEventListener('click', testChatterApi);

async function testChatterApi() {
  // Get the user's Salesforce session ID and domain from storage
  chrome.storage.local.get(['domainList', 'sessionIds'], ({ domainList, sessionIds }) => {
    if (!sessionIds || !domainList) {
      setStatusMessage('Session IDs or domains not found.');
      return;
    }

    const port = chrome.runtime.connect({ name: 'chatterApi' });
    port.onMessage.addListener((response) => {
      setStatusMessage(response.result);
    });

    for (const domain of domainList) {
      if (sessionIds[domain]) {
        port.postMessage({ action: 'getChatterFeed', sessionId: sessionIds[domain], domain });
      }
    }
  });
}

