import {
  GRADE_PEDAGOGY,
  normalizeModel,
  callGeminiJson,
  buildLocalEssayEvaluation
} from '../_shared.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const effectiveKey = (body.apiKey || process.env.GEMINI_API_KEY || '').trim();
  const effectiveModel = normalizeModel(body.model || process.env.GEMINI_MODEL);
  const grade = Number(body.grade) || 8;
  const pedagogy = GRADE_PEDAGOGY[grade] || GRADE_PEDAGOGY[8];

  if (!effectiveKey) {
    return res.status(200).json(buildLocalEssayEvaluation(body));
  }

  const systemInstruction = [
    `You are a rigorous yet supportive English Writing Assessment Specialist for ${pedagogy.label}.`,
    `Grade-Level Expectations: ${pedagogy.expectations}`,
    `Tone: ${pedagogy.tone}`,
    `All feedback MUST be in pure English and calibrated specifically to Grade ${grade} expectations. Return strictly valid JSON.`
  ].join('\n');

  const userPrompt = `Evaluate the following Grade ${grade} student essay.
Prompt Title: ${body.promptTitle || 'Custom Essay Assignment'}
Genre: ${body.genre || 'Academic Essay'}
Prompt Instructions: ${body.promptText || 'Write a well-structured essay.'}
Student Essay Title: ${body.essayTitle || 'Untitled'}
Student Essay Draft:
"""
${body.essayText || ''}
"""

Return a JSON object with this exact schema:
{
  "gradeEvaluated": ${grade},
  "totalScore": number (sum of the 4 dimension scores, out of 40),
  "maxScore": 40,
  "letterGrade": "string (e.g. A, A-, B+, B, B-, C+)",
  "executiveSummary": "string (3-4 sentences summarizing overall strengths and primary area for growth for a Grade ${grade} writer)",
  "dimensions": [
    {
      "name": "Thesis, Ideas & Content",
      "score": number (1-10),
      "maxScore": 10,
      "strength": "string",
      "growthArea": "string",
      "actionStep": "string"
    },
    {
      "name": "Organization & Transitions",
      "score": number (1-10),
      "maxScore": 10,
      "strength": "string",
      "growthArea": "string",
      "actionStep": "string"
    },
    {
      "name": "Evidence & Analytical Reasoning",
      "score": number (1-10),
      "maxScore": 10,
      "strength": "string",
      "growthArea": "string",
      "actionStep": "string"
    },
    {
      "name": "Sentence Fluency, Diction & Conventions",
      "score": number (1-10),
      "maxScore": 10,
      "strength": "string",
      "growthArea": "string",
      "actionStep": "string"
    }
  ],
  "lineEdits": [
    {
      "original": "exact sentence from the student's draft",
      "revised": "improved version calibrated for Grade ${grade}",
      "category": "Grammar & Mechanics | Word Choice & Diction | Sentence Variety & Flow | Logic & Evidence",
      "explanation": "clear pedagogical explanation of why the revision is stronger"
    }
  ],
  "vocabularyUpgrades": [
    {
      "basicWord": "simpler word used or relevant to the draft",
      "upgrade": "Grade ${grade} power vocabulary word",
      "partOfSpeech": "adj. | verb | noun | adv.",
      "definition": "clear English definition",
      "sampleSentence": "example sentence related to the essay topic"
    }
  ],
  "nextDraftChallenge": "string (1 concrete, motivating revision mission for the student)"
}`;

  try {
    const result = await callGeminiJson({
      apiKey: effectiveKey,
      model: effectiveModel,
      systemInstruction,
      userPrompt
    });
    return res.status(200).json({ source: 'gemini-api', model: effectiveModel, ...result });
  } catch (apiErr) {
    const fallback = buildLocalEssayEvaluation(body);
    return res.status(200).json({
      ...fallback,
      model: effectiveModel,
      apiFallbackReason: apiErr.message || 'Fallback to built-in evaluator'
    });
  }
}
