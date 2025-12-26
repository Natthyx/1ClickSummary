/**
 * Gemini AI Service
 * 
 * Purpose: Interface with Google's Gemini API to generate
 * structured job summaries from job posting text.
 * 
 * This module handles:
 * - API authentication
 * - Prompt engineering
 * - Response parsing
 * - Error handling
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a structured job summary using Gemini AI
 * 
 * @param {string} jobText - The raw job posting text
 * @param {object} options - Summary customization options
 * @param {string} options.length - "short" | "medium" | "detailed"
 * @param {string} options.focus - "skills" | "qualifications" | "responsibilities" | "balanced"
 * @param {string} options.format - "bullets" | "paragraph"
 * @returns {Promise<object>} Structured summary object
 */
async function generateJobSummary(jobText, options = {}) {
  const { length = 'medium', focus = 'balanced', format = 'bullets' } = options;

  // Get the generative model
  // Using gemini-1.5-flash (newer, faster model - 'gemini-pro' is deprecated)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Build the prompt
  const prompt = buildPrompt(jobText, { length, focus, format });

  try {
    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    const summary = parseResponse(text);

    return summary;
  } catch (error) {
    console.error('[Gemini Service] Error:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

/**
 * Build the prompt for Gemini
 */
function buildPrompt(jobText, options) {
  const { length, focus, format } = options;

  // Length guidelines
  const lengthGuide = {
    short: 'Be very concise. Use 2-3 items per category maximum.',
    medium: 'Be moderately detailed. Use 3-5 items per category.',
    detailed: 'Be comprehensive. Include all relevant details, 5-8 items per category.'
  };

  // Focus guidelines
  const focusGuide = {
    skills: 'Pay special attention to technical skills, tools, and technologies mentioned. Emphasize the tech stack.',
    qualifications: 'Focus heavily on educational requirements, certifications, years of experience, and qualifications.',
    responsibilities: 'Emphasize what the person will be doing day-to-day, their responsibilities and tasks.',
    balanced: 'Give equal weight to skills, qualifications, and responsibilities.'
  };

  // Format guidelines
  const formatGuide = {
    bullets: 'Return each item as a separate element in arrays. Keep items concise and skimmable.',
    paragraph: 'Combine related items into flowing sentences, but still return arrays with summarized points.'
  };

  return `You are an expert job posting analyzer. Your task is to extract and summarize key information from a job posting.

**LENGTH INSTRUCTION:** ${lengthGuide[length]}
**FOCUS INSTRUCTION:** ${focusGuide[focus]}
**FORMAT INSTRUCTION:** ${formatGuide[format]}

**CRITICAL:** You MUST respond with ONLY valid JSON. No markdown, no code blocks, no explanations. Just raw JSON.

**Required JSON Structure:**
{
  "roleOverview": "A 1-2 sentence summary of the position",
  "requiredSkills": ["skill1", "skill2", "skill3"],
  "qualifications": ["qualification1", "qualification2"],
  "niceToHave": ["nice-to-have1", "nice-to-have2"],
  "techStack": {
    "languages": ["language1", "language2"],
    "frameworks": ["framework1", "framework2"],
    "tools": ["tool1", "tool2"],
    "cloud": ["cloud-service1", "cloud-service2"]
  }
}

**Important Rules:**
1. Return ONLY JSON, nothing else
2. Use proper JSON syntax with double quotes
3. If a category has no items, use an empty array []
4. Extract tech stack from the entire posting
5. Keep items clear and professional
6. Avoid redundancy between categories

**Job Posting Text:**
${jobText}

Remember: Respond with ONLY the JSON object, nothing else.`;
}

/**
 * Parse the Gemini response into structured data
 */
function parseResponse(text) {
  try {
    // Remove markdown code blocks if present
    let cleanedText = text.trim();
    
    // Remove ```json and ``` if present
    cleanedText = cleanedText.replace(/^```json\s*/i, '');
    cleanedText = cleanedText.replace(/^```\s*/i, '');
    cleanedText = cleanedText.replace(/\s*```$/i, '');
    cleanedText = cleanedText.trim();

    // Parse JSON
    const parsed = JSON.parse(cleanedText);

    // Validate structure
    const summary = {
      roleOverview: parsed.roleOverview || 'No overview available',
      requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
      qualifications: Array.isArray(parsed.qualifications) ? parsed.qualifications : [],
      niceToHave: Array.isArray(parsed.niceToHave) ? parsed.niceToHave : [],
      techStack: {
        languages: Array.isArray(parsed.techStack?.languages) ? parsed.techStack.languages : [],
        frameworks: Array.isArray(parsed.techStack?.frameworks) ? parsed.techStack.frameworks : [],
        tools: Array.isArray(parsed.techStack?.tools) ? parsed.techStack.tools : [],
        cloud: Array.isArray(parsed.techStack?.cloud) ? parsed.techStack.cloud : []
      }
    };

    return summary;
  } catch (error) {
    console.error('[Parse Error] Raw response:', text);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

module.exports = {
  generateJobSummary
};
