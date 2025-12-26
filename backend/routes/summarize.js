/**
 * Summarize Route
 * 
 * Purpose: Handle POST requests to generate job summaries
 * 
 * Expected request body:
 * {
 *   jobText: string,
 *   length: "short" | "medium" | "detailed",
 *   focus: "skills" | "qualifications" | "responsibilities" | "balanced",
 *   format: "bullets" | "paragraph"
 * }
 */

const express = require('express');
const router = express.Router();
const { generateJobSummary } = require('../services/geminiService');

/**
 * POST /summarize
 * Generate a structured job summary from job posting text
 */
router.post('/', async (req, res) => {
  try {
    // Validate request body
    const { jobText, length, focus, format } = req.body;

    // Validation
    if (!jobText || typeof jobText !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid jobText field'
      });
    }

    if (jobText.trim().length < 50) {
      return res.status(400).json({
        error: 'Job text is too short (minimum 50 characters)'
      });
    }

    if (jobText.length > 50000) {
      return res.status(400).json({
        error: 'Job text is too long (maximum 50,000 characters)'
      });
    }

    // Validate options
    const validLengths = ['short', 'medium', 'detailed'];
    const validFocus = ['skills', 'qualifications', 'responsibilities', 'balanced'];
    const validFormats = ['bullets', 'paragraph'];

    if (length && !validLengths.includes(length)) {
      return res.status(400).json({
        error: `Invalid length. Must be one of: ${validLengths.join(', ')}`
      });
    }

    if (focus && !validFocus.includes(focus)) {
      return res.status(400).json({
        error: `Invalid focus. Must be one of: ${validFocus.join(', ')}`
      });
    }

    if (format && !validFormats.includes(format)) {
      return res.status(400).json({
        error: `Invalid format. Must be one of: ${validFormats.join(', ')}`
      });
    }

    // Generate summary using Gemini service
    const summary = await generateJobSummary(jobText, {
      length: length || 'medium',
      focus: focus || 'balanced',
      format: format || 'bullets'
    });

    // Return successful response
    res.json({
      summary,
      metadata: {
        length: length || 'medium',
        focus: focus || 'balanced',
        format: format || 'bullets',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('[Summarize Route] Error:', error);

    // Return error response
    res.status(500).json({
      error: 'Failed to generate summary',
      message: error.message
    });
  }
});

module.exports = router;
