/**
 * Job Text Extraction Utility
 * 
 * Purpose: Extract clean job posting text from the current page DOM.
 * This is NOT web scraping - we only read what's visible on the page
 * the user has already opened.
 * 
 * Strategy:
 * 1. Remove noise (nav, footer, ads, sidebars)
 * 2. Focus on main content areas
 * 3. Extract and clean text
 * 4. Return structured data
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

// Make it available globally for content script
if (typeof window !== 'undefined') {
  window.extractJobText = extractJobText;
}
