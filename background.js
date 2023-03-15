console.log("AutoReplies extension is running!");

chrome.runtime.onInstalled.addListener(function() {
  console.log("AutoReplies extension has been installed!");
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log("Received message:", message);
});
