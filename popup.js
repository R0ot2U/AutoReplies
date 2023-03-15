const POLL_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
let statusElement = null;

function handleAuthenticateButtonClick() {
  // Get the user's Salesforce domain from the options page
  chrome.storage.sync.get(['domain'], ({ domain }) => {
    if (!domain) {
      setStatusMessage('Please enter your Salesforce domain in the options page.');
      return;
    }

    // Get the Salesforce session ID from cookies
    chrome.cookies.get({ url: `https://${domain}.my.salesforce.com`, name: 'sid' }, (cookie) => {
      if (!cookie || !cookie.value) {
        setStatusMessage('Please log in to Salesforce first.');
        return;
      }

      const sessionId = cookie.value;
      // Store the sessionId in storage
      chrome.storage.sync.set({ sessionId }, () => {
        setStatusMessage('Authentication successful.');
      });
    });
  });
}

function verifySessionId() {
  // Get the user's Salesforce domain from the options page
  chrome.storage.sync.get(['domain', 'sessionId'], ({ domain, sessionId }) => {
    if (!domain || !sessionId) {
      setStatusMessage('Please authenticate with Salesforce first.');
      return;
    }

    // Check if the Salesforce session ID is still valid
    chrome.cookies.get({ url: `https://${domain}.my.salesforce.com`, name: 'sid' }, (cookie) => {
      if (!cookie || !cookie.value || cookie.value !== sessionId) {
        setStatusMessage('Session ID invalid or expired. Please log in to Salesforce again.');
        chrome.storage.sync.remove(['sessionId']);
        return;
      }

      setStatusMessage('Session ID verified.');
    });
  });
}

function setStatusMessage(message) {
  statusElement.textContent = message;
}

function getSid() {
  // Get the Salesforce session ID from storage
  chrome.storage.sync.get('sessionId', ({ sessionId }) => {
    if (!sessionId) {
      setStatusMessage('Please authenticate with Salesforce first.');
      return;
    }

    setStatusMessage(`Salesforce session ID: ${sessionId}`);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  statusElement = document.getElementById('status');
  document.getElementById('authenticate').addEventListener('click', handleAuthenticateButtonClick);
  document.getElementById('show-sid').addEventListener('click', getSid);

  // Verify the session ID periodically
  setInterval(() => {
    verifySessionId();
  }, POLL_INTERVAL);
});
