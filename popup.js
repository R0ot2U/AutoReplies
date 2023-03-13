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
    // Send a message to the background script to get the sessionId
    chrome.runtime.sendMessage({ type: 'get_session_id' }, (response) => {
      // Use the sessionId to make requests to Salesforce
      const sessionId = response.sessionId;
      // Your implementation here
    });
  });
});
