document.addEventListener('DOMContentLoaded', () => {
  // Get the HTML elements we need to access
const toggleButton = document.getElementById('toggle');
const authButton = document.getElementById('auth-button');

// Load the saved state
chrome.storage.sync.get(['enabled'], (result) => {
  if (result.enabled) {
    toggleButton.innerText = 'ON';
    toggleButton.classList.add('on');
  } else {
    toggleButton.innerText = 'OFF';
    toggleButton.classList.remove('on');
  }
});

// Add a click event listener to the toggle button
toggleButton.addEventListener('click', () => {
  chrome.storage.sync.get(['enabled'], (result) => {
    const enabled = !result.enabled;
    chrome.storage.sync.set({ enabled }, () => {
      if (enabled) {
        toggleButton.innerText = 'ON';
        toggleButton.classList.add('on');
      } else {
        toggleButton.innerText = 'OFF';
        toggleButton.classList.remove('on');
      }
    });
  });
});

// Add a click event listener to the authenticate button
authButton.addEventListener('click', () => {
  // Open the authorization page in a new tab
  chrome.tabs.create({ url: 'https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=<your_client_id>&redirect_uri=<your_redirect_uri>&state=<your_state>' });
});

// Handle the authorization response
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'authorization_response') {
    const { code } = message.payload;
    // Exchange the authorization code for an access token and refresh token
    // Your implementation here
  }
});

});
