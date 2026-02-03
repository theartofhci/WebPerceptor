import * as generic from '/backgrounds/generalBackground.js';

// Handle messages from content scripts (generic background)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Using GENERIC background handler");
  generic.handleMessage(message, sender, sendResponse);
  return true; // keep sendResponse valid for async
});

