import {
  GRADE_PEDAGOGY,
  normalizeModel,
  callGeminiJson,
  buildLocalCoachResponse
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
    return res.status(200).json(buildLocalCoachResponse(body));
  }

  const systemInstruction = [
    `You are an elite Socratic English Writing Tutor for ${pedagogy.label}.`,
    `Pedagogical Standard: ${pedagogy.expectations}`,
    `Tone: ${pedagogy.tone}`,
    `CRITICAL RULE: Respond strictly in pure English. Never write the full essay for the student; guide them through probing questions, structural feedback, and concise patterns. Always return valid JSON matching the requested schema.`
  ].join('\n');

  let userPrompt = '';
  if (body.mode === 'brainstorm') {
    userPrompt = `Generate Socratic brainstorming guidance for a Grade ${grade} student working on the prompt: "${body.promptTitle}" (${body.promptText || ''}).
Return JSON with this exact structure:
{
  "coachGreeting": "string (1-2 encouraging sentences tailored to Grade ${grade})",
  "socraticQuestions": ["string", "string", "string"],
  "thesisTemplates": ["string (fill-in-the-blank thesis frame 1)", "string (fill-in-the-blank thesis frame 2)"],
  "suggestedAngles": ["string", "string", "string"]
}`;
  } else if (body.mode === 'outline-review') {
    userPrompt = `Review this Grade ${grade} student's essay outline for the prompt "${body.promptTitle}":
Hook: ${body.outline?.hook || '(empty)'}
Thesis: ${body.outline?.thesis || '(empty)'}
Body 1: ${body.outline?.body1 || '(empty)'}
Body 2: ${body.outline?.body2 || '(empty)'}
Body 3: ${body.outline?.body3 || '(empty)'}
Counterargument/Turn: ${body.outline?.counter || '(empty)'}
Conclusion: ${body.outline?.conclusion || '(empty)'}

Return JSON with this exact structure:
{
  "overallVerdict": "string",
  "thesisFeedback": "string",
  "paragraphSuggestions": ["string", "string", "string"],
  "polishedThesisSuggestion": "string"
}`;
  } else {
    userPrompt = `The Grade ${grade} student is working on "${body.promptTitle || 'an English essay'}".
Student's current draft excerpt: "${(body.essayText || '').slice(0, 1200)}"
Student asks the AI Writing Coach: "${body.chatMessage || 'How can I improve my essay?'}"

Respond as a Socratic writing tutor (do NOT ghostwrite their essay; explain the principle, give a brief illustrative example, and ask a guiding follow-up question).
Return JSON with this exact structure:
{
  "reply": "string",
  "followUpPrompt": "string"
}`;
  }

  try {
    const result = await callGeminiJson({
      apiKey: effectiveKey,
      model: effectiveModel,
      systemInstruction,
      userPrompt
    });
    return res.status(200).json({ source: 'gemini-api', model: effectiveModel, ...result });
  } catch (apiErr) {
    const fallback = buildLocalCoachResponse(body);
    return res.status(200).json({
      ...fallback,
      model: effectiveModel,
      apiFallbackReason: apiErr.message || 'Fallback to built-in coach'
    });
  }
}
