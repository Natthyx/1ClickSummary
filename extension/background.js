/**
 * Background Service Worker
 * 
 * Purpose: Manages extension lifecycle and handles user interactions
 * with the extension icon.
 * 
 * Flow:
 * 1. User clicks extension icon
 * 2. We send a message to the content script on the active tab
 * 3. Content script toggles the sidebar visibility
 */

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  // Don't try to inject on chrome:// or other restricted pages
  if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
    console.warn('Cannot run extension on browser internal pages');
    return;
  }

  // Send message to content script to toggle sidebar
  chrome.tabs.sendMessage(
    tab.id,
    { action: 'toggleSidebar' },
    (response) => {
      // Handle potential errors (e.g., content script not loaded yet)
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError.message);
        
        // If content script isn't loaded, inject it manually
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }).then(() => {
          // After injection, send the toggle message again
          chrome.tabs.sendMessage(tab.id, { action: 'toggleSidebar' });
        }).catch(err => {
          console.error('Failed to inject content script:', err);
        });
      }
    }
  );
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'logInfo') {
    console.log('[Background]', request.message);
  }
  
  if (request.action === 'logError') {
    console.error('[Background]', request.message);
  }
  
  return true; // Keep message channel open for async responses
});
