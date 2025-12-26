/**
 * Sidebar JavaScript
 * 
 * Purpose: Manage user interactions, API calls, and summary rendering
 * 
 * Flow:
 * 1. Receive job data from content script
 * 2. User configures summary options
 * 3. Make API call to backend
 * 4. Render structured summary
 */

// Config
const API_BASE_URL = 'http://localhost:3000';

// State
let currentJobData = null;
let isProcessing = false;

// DOM Elements
const summarizeBtn = document.getElementById('summarizeBtn');
const closeBtn = document.getElementById('closeBtn');
const retryBtn = document.getElementById('retryBtn');
const lengthSelect = document.getElementById('lengthSelect');
const focusSelect = document.getElementById('focusSelect');
const formatSelect = document.getElementById('formatSelect');
const summaryArea = document.getElementById('summaryArea');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');

/**
 * Initialize the sidebar
 */
function init() {
  // Event listeners
  summarizeBtn.addEventListener('click', handleSummarize);
  closeBtn.addEventListener('click', handleClose);
  retryBtn.addEventListener('click', handleSummarize);

  // Listen for job data from content script
  window.addEventListener('message', handleMessage);

  // Request job data on load
  requestJobData();

  console.log('[Sidebar] Initialized');
}

/**
 * Handle messages from content script
 */
function handleMessage(event) {
  const { type, data } = event.data;

  if (type === 'JOB_DATA') {
    currentJobData = data;
    console.log('[Sidebar] Received job data:', data.title);
    
    // Enable the summarize button
    summarizeBtn.disabled = false;
  }
}

/**
 * Request job data from content script
 */
function requestJobData() {
  window.parent.postMessage({
    type: 'REQUEST_JOB_DATA'
  }, '*');
}

/**
 * Handle close button click
 */
function handleClose() {
  window.parent.postMessage({
    type: 'CLOSE_SIDEBAR'
  }, '*');
}

/**
 * Handle summarize button click
 */
async function handleSummarize() {
  if (!currentJobData || isProcessing) {
    return;
  }

  if (!currentJobData.content || currentJobData.content.trim().length < 50) {
    showError('Not enough content detected on this page. Please navigate to a job posting.');
    return;
  }

  // Get user preferences
  const options = {
    length: lengthSelect.value,
    focus: focusSelect.value,
    format: formatSelect.value
  };

  // Show loading state
  showLoading();
  isProcessing = true;
  summarizeBtn.disabled = true;

  try {
    const summary = await callSummarizeAPI(currentJobData.content, options);
    showSummary(summary);
  } catch (error) {
    console.error('[Sidebar] Error:', error);
    showError(error.message || 'Failed to generate summary. Please try again.');
  } finally {
    isProcessing = false;
    summarizeBtn.disabled = false;
  }
}

/**
 * Call the backend API to generate summary
 */
async function callSummarizeAPI(jobText, options) {
  const response = await fetch(`${API_BASE_URL}/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jobText,
      length: options.length,
      focus: options.focus,
      format: options.format
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  return data.summary;
}

/**
 * Show loading state
 */
function showLoading() {
  summaryArea.style.display = 'none';
  errorState.style.display = 'none';
  loadingState.style.display = 'flex';
}

/**
 * Show error state
 */
function showError(message) {
  summaryArea.style.display = 'none';
  loadingState.style.display = 'none';
  errorMessage.textContent = message;
  errorState.style.display = 'flex';
}

/**
 * Show summary
 */
function showSummary(summary) {
  loadingState.style.display = 'none';
  errorState.style.display = 'none';
  summaryArea.style.display = 'block';

  // Build HTML for summary
  const html = buildSummaryHTML(summary);
  summaryArea.innerHTML = html;
}

/**
 * Build HTML for summary display
 */
function buildSummaryHTML(summary) {
  const format = formatSelect.value;
  
  let html = '<div class="summary-content">';

  // Role Overview
  if (summary.roleOverview) {
    html += `
      <div class="summary-section">
        <h3>Role Overview</h3>
        <p>${escapeHtml(summary.roleOverview)}</p>
      </div>
    `;
  }

  // Required Skills
  if (summary.requiredSkills && summary.requiredSkills.length > 0) {
    html += `
      <div class="summary-section">
        <h3>Required Skills</h3>
        ${format === 'bullets' 
          ? `<ul>${summary.requiredSkills.map(skill => `<li>${escapeHtml(skill)}</li>`).join('')}</ul>`
          : `<p>${summary.requiredSkills.map(escapeHtml).join(', ')}</p>`
        }
      </div>
    `;
  }

  // Qualifications
  if (summary.qualifications && summary.qualifications.length > 0) {
    html += `
      <div class="summary-section">
        <h3>Qualifications</h3>
        ${format === 'bullets'
          ? `<ul>${summary.qualifications.map(qual => `<li>${escapeHtml(qual)}</li>`).join('')}</ul>`
          : `<p>${summary.qualifications.map(escapeHtml).join(', ')}</p>`
        }
      </div>
    `;
  }

  // Nice to Have
  if (summary.niceToHave && summary.niceToHave.length > 0) {
    html += `
      <div class="summary-section">
        <h3>Nice to Have</h3>
        ${format === 'bullets'
          ? `<ul>${summary.niceToHave.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
          : `<p>${summary.niceToHave.map(escapeHtml).join(', ')}</p>`
        }
      </div>
    `;
  }

  // Tech Stack
  if (summary.techStack) {
    const allTech = [
      ...(summary.techStack.languages || []),
      ...(summary.techStack.frameworks || []),
      ...(summary.techStack.tools || []),
      ...(summary.techStack.cloud || [])
    ];

    if (allTech.length > 0) {
      html += `
        <div class="summary-section">
          <h3>Tech Stack Detected</h3>
          <div class="tech-stack-grid">
            ${allTech.map(tech => `<span class="tech-tag">${escapeHtml(tech)}</span>`).join('')}
          </div>
        </div>
      `;
    }
  }

  html += '</div>';
  return html;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
