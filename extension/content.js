/**
 * Content Script
 * 
 * Purpose: Acts as a bridge between the page and the extension.
 * Manages sidebar injection, visibility, and communication.
 * 
 * Lifecycle:
 * 1. Loads when page loads (document_idle)
 * 2. Creates sidebar iframe when toggled
 * 3. Extracts job text and passes to sidebar
 * 4. Handles show/hide animations
 */

/**
 * Job Text Extraction Function
 * 
 * Purpose: Extract clean job posting text from the current page DOM.
 * This is NOT web scraping - we only read what's visible on the page
 * the user has already opened.
 */
function extractJobText() {
  // Selectors to EXCLUDE (common noise elements)
  const excludeSelectors = [
    'nav',
    'header',
    'footer',
    '[role="navigation"]',
    '[role="banner"]',
    '[role="contentinfo"]',
    '.navigation',
    '.navbar',
    '.header',
    '.footer',
    '.sidebar',
    '.advertisement',
    '.ad',
    '.cookie-banner',
    '.modal',
    '.popup'
  ];

  // Remove excluded elements temporarily by cloning the body
  const bodyClone = document.body.cloneNode(true);
  
  excludeSelectors.forEach(selector => {
    const elements = bodyClone.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  // Try to find main job content area using common patterns
  const mainContentSelectors = [
    'main',
    '[role="main"]',
    '.job-description',
    '.job-details',
    '.posting-description',
    '#job-description',
    '#job-details',
    'article',
    '.content'
  ];

  let jobContent = null;
  
  for (const selector of mainContentSelectors) {
    const element = bodyClone.querySelector(selector);
    if (element) {
      jobContent = element;
      break;
    }
  }

  // Fallback: use the entire cleaned body
  if (!jobContent) {
    jobContent = bodyClone;
  }

  // Extract text and clean it
  let rawText = jobContent.innerText || jobContent.textContent || '';
  
  // Clean up the text
  const cleanedText = rawText
    .replace(/\s+/g, ' ')           // Replace multiple spaces with single space
    .replace(/\n+/g, '\n')          // Replace multiple newlines with single newline
    .trim();                        // Remove leading/trailing whitespace

  // Extract job title (try common patterns)
  const titleSelectors = [
    'h1',
    '.job-title',
    '.posting-title',
    '[data-job-title]',
    '.title'
  ];

  let jobTitle = 'Job Posting';
  for (const selector of titleSelectors) {
    const titleElement = document.querySelector(selector);
    if (titleElement && titleElement.innerText) {
      jobTitle = titleElement.innerText.trim();
      break;
    }
  }

  // Return structured data
  return {
    title: jobTitle,
    content: cleanedText,
    url: window.location.href,
    extractedAt: new Date().toISOString()
  };
}

// State management
let sidebar = null;
let sidebarVisible = false;

/**
 * Create and inject the sidebar iframe
 */
function createSidebar() {
  if (sidebar) {
    return sidebar;
  }

  // Create iframe element
  sidebar = document.createElement('iframe');
  sidebar.id = 'job-summary-sidebar';
  sidebar.src = chrome.runtime.getURL('sidebar/sidebar.html');
  
  // Styling for the iframe
  Object.assign(sidebar.style, {
    position: 'fixed',
    top: '0',
    right: '-400px', // Start off-screen
    width: '380px',
    height: '100vh',
    border: 'none',
    zIndex: '2147483647', // Maximum z-index
    boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
    transition: 'right 0.3s ease-in-out',
    background: 'white'
  });

  document.body.appendChild(sidebar);

  // Wait for sidebar to load before setting up communication
  sidebar.addEventListener('load', () => {
    console.log('[Content] Sidebar iframe loaded');
  });

  return sidebar;
}

/**
 * Show the sidebar with animation
 */
function showSidebar() {
  if (!sidebar) {
    createSidebar();
  }

  // Trigger animation
  requestAnimationFrame(() => {
    sidebar.style.right = '0';
  });

  sidebarVisible = true;

  // Extract job text and send to sidebar
  setTimeout(() => {
    extractAndSendJobData();
  }, 100);
}

/**
 * Hide the sidebar with animation
 */
function hideSidebar() {
  if (sidebar) {
    sidebar.style.right = '-400px';
  }
  sidebarVisible = false;
}

/**
 * Toggle sidebar visibility
 */
function toggleSidebar() {
  if (sidebarVisible) {
    hideSidebar();
  } else {
    showSidebar();
  }
}

/**
 * Extract job text from the page and send to sidebar
 */
function extractAndSendJobData() {
  try {
    const jobData = extractJobText();
    
    // Send to sidebar iframe
    if (sidebar && sidebar.contentWindow) {
      sidebar.contentWindow.postMessage({
        type: 'JOB_DATA',
        data: jobData
      }, '*');
      
      console.log('[Content] Job data sent to sidebar');
    }
  } catch (error) {
    console.error('[Content] Error extracting job data:', error);
  }
}

/**
 * Listen for messages from background script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleSidebar') {
    toggleSidebar();
    sendResponse({ success: true });
  }
  
  return true;
});

/**
 * Listen for messages from sidebar iframe
 */
window.addEventListener('message', (event) => {
  // Security: verify the message is from our sidebar
  if (event.source !== sidebar?.contentWindow) {
    return;
  }

  if (event.data.type === 'CLOSE_SIDEBAR') {
    hideSidebar();
  }

  if (event.data.type === 'REQUEST_JOB_DATA') {
    extractAndSendJobData();
  }
});

console.log('[Content] Job Summary extension content script loaded');
