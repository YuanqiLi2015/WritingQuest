import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, 'public');
const ENV_PATH = path.join(__dirname, '.env');

// Load .env file if present
async function loadEnvFile() {
  try {
    const content = await fs.readFile(ENV_PATH, 'utf8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      const val = line.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && !(key in process.env)) {
        process.env[key] = val;
      }
    }
  } catch {
    // .env is optional
  }
}

await loadEnvFile();

const ALLOWED_MODELS = new Set(['gemini-3.8-flash', 'gemini-3.8-pro']);

function normalizeModel(modelName) {
  if (ALLOWED_MODELS.has(modelName)) return modelName;
  if (typeof modelName === 'string' && modelName.includes('pro')) return 'gemini-3.8-pro';
  return 'gemini-3.8-flash';
}

let runtimeApiKey = process.env.GEMINI_API_KEY || '';
let runtimeModel = normalizeModel(process.env.GEMINI_MODEL);
const PORT = Number(process.env.PORT) || 3456;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const GRADE_PEDAGOGY = {
  6: {
    label: 'Grade 6 (Middle School Foundations)',
    expectations: 'Clear topic sentences, concrete sensory details, basic paragraph unity (PEEL structure), fundamental transition words, and complete sentences without run-ons or fragments.',
    tone: 'Warm, encouraging, clear, and accessible to an 11-12 year old learner.'
  },
  7: {
    label: 'Grade 7 (Developing Analytical & Argumentative Voice)',
    expectations: 'Defensible claims, acknowledging a basic counterclaim, integrating specific examples, compound/complex sentence variety, and vivid active verbs.',
    tone: 'Supportive, constructive, and step-by-step for a 12-13 year old middle school writer.'
  },
  8: {
    label: 'Grade 8 (High School Readiness & CER Mastery)',
    expectations: 'Nuanced thesis statements, Claim-Evidence-Reasoning (CER) body paragraphs, explicit refutation of opposing views, formal academic register, and smooth inter-paragraph transitions.',
    tone: 'Engaging, intellectually respectful, and focused on bridging middle school to high school expectations.'
  },
  9: {
    label: 'Grade 9 (High School Freshman — Literary & Rhetorical Foundations)',
    expectations: 'Multi-paragraph thesis-driven essays, seamless quote integration (no dropped quotes), literary/rhetorical analysis beyond plot summary, and concise active prose.',
    tone: 'Collegial high school writing coach emphasizing analytical depth over summary.'
  },
  10: {
    label: 'Grade 10 (High School Sophomore — Rhetorical Appeals & Synthesis)',
    expectations: 'Rhetorical precision (ethos, pathos, logos), synthesizing multiple perspectives, sophisticated subordination and parallel structure, and nuanced diction.',
    tone: 'Rigorous yet encouraging mentor pushing for rhetorical awareness and stylistic control.'
  },
  11: {
    label: 'Grade 11 (Junior — AP English Language & SAT Essay Rigor)',
    expectations: 'AP Lang FRQ standards: defensible thesis with a clear line of reasoning, nuanced qualification/concession, specific historical/literary/contemporary evidence, and mature syntactic variety.',
    tone: 'AP English Language coach focusing on line of reasoning, rhetorical sophistication, and intellectual precision.'
  },
  12: {
    label: 'Grade 12 (Senior — College Common App & Capstone Academic Prose)',
    expectations: 'Authentic personal voice or seminar-level critical argument, counter-intuitive insight, philosophical depth, organic transitions, and publication-grade stylistic polish.',
    tone: 'University writing center advisor / admissions essay mentor focusing on voice, originality, and intellectual vitality.'
  }
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

async function persistEnvConfig(apiKey, model) {
  const lines = [
    '# Google Gemini API Configuration',
    `GEMINI_API_KEY=${apiKey}`,
    `GEMINI_MODEL=${normalizeModel(model)}`,
    `PORT=${PORT}`,
    ''
  ];
  await fs.writeFile(ENV_PATH, lines.join('\n'), 'utf8');
}

async function callSingleInteraction({ apiKey, apiModel, thinkingLevel, systemInstruction, userPrompt }) {
  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/interactions';
  const payload = {
    model: apiModel,
    system_instruction: systemInstruction,
    input: userPrompt,
    response_format: {
      type: 'text',
      mime_type: 'application/json'
    }
  };
  if (thinkingLevel) {
    payload.generation_config = { thinking_level: thinkingLevel };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 18000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'Api-Revision': '2026-05-20'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      const errText = await response.text();
      let parsedMessage = `Gemini API Error (${response.status})`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.error?.message) {
          parsedMessage = errJson.error.message;
        }
      } catch {
        if (errText) parsedMessage = errText.slice(0, 300);
      }
      const err = new Error(parsedMessage);
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    let rawText = data?.output_text || '';
    if (!rawText && Array.isArray(data?.steps)) {
      const modelSteps = data.steps.filter(s => s.type === 'model_output');
      const lastStep = modelSteps[modelSteps.length - 1];
      rawText = (lastStep?.content || [])
        .filter(c => c.type === 'text' && c.text)
        .map(c => c.text)
        .join('');
    }
    if (!rawText) {
      throw new Error('Gemini API returned an empty response.');
    }

    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  } finally {
    clearTimeout(timer);
  }
}

async function callGeminiJson({ apiKey, model, systemInstruction, userPrompt }) {
  const chosenModel = normalizeModel(model || runtimeModel);
  try {
    return await callSingleInteraction({
      apiKey,
      apiModel: chosenModel,
      thinkingLevel: chosenModel === 'gemini-3.8-pro' ? 'high' : 'low',
      systemInstruction,
      userPrompt
    });
  } catch (err) {
    if (chosenModel === 'gemini-3.8-pro') {
      return await callSingleInteraction({
        apiKey,
        apiModel: 'gemini-3.8-flash',
        thinkingLevel: 'high',
        systemInstruction,
        userPrompt
      });
    }
    throw err;
  }
}

// Intelligent local fallback coach so the app works immediately even before a key is added
function buildLocalCoachResponse({ mode, grade, promptTitle, promptText, outline, chatMessage }) {
  const g = Number(grade) || 8;
  const pedagogy = GRADE_PEDAGOGY[g] || GRADE_PEDAGOGY[8];

  if (mode === 'brainstorm') {
    return {
      source: 'local-coach',
      coachGreeting: `Let's unlock a strong ${pedagogy.label} angle for "${promptTitle || 'your essay'}". Answer these guiding questions in your own words—never worry about perfection on the first pass!`,
      socraticQuestions: [
        g <= 8
          ? `What is one specific real-life moment, book, or observation that made you care about "${promptTitle}"?`
          : `What conventional wisdom about "${promptTitle}" do most people accept without questioning—and how might you challenge or qualify it?`,
        g <= 8
          ? `If someone disagreed with your main claim, what is the strongest point they would bring up?`
          : `What tension or trade-off lies at the heart of this issue, and which concrete historical, literary, or contemporary evidence best illustrates it?`,
        `By the end of your essay, what single takeaway or shift in perspective do you want your reader to carry with them?`
      ],
      thesisTemplates: g <= 8
        ? [
            `Although many people assume [common view], [your claim] because [Reason A] and [Reason B].`,
            `Through [specific experience/text], it becomes clear that [central insight], showing us that [broader significance].`
          ]
        : [
            `While [counter-perspective] holds merit in [limited context], ultimately [qualified claim] because [mechanistic reason], which reveals [broader implication].`,
            `By examining [specific evidence/tension], we see that [complex claim]—not merely because of [surface factor], but because [deeper insight].`
          ],
      suggestedAngles: [
        `Angle 1 (Concrete & Personal): Anchor the opening in a vivid micro-moment or case study before zooming out to your main argument.`,
        `Angle 2 (Counter-Intuitive): Begin by acknowledging what seems obviously true on the surface, then pivot to a deeper overlooked consequence.`,
        `Angle 3 (Systems & Impact): Examine how this issue affects both individual character and the broader community over time.`
      ]
    };
  }

  if (mode === 'outline-review') {
    const hasThesis = Boolean(outline?.thesis && outline.thesis.trim().length > 15);
    const bodyCount = [outline?.body1, outline?.body2, outline?.body3].filter(b => b && b.trim().length > 10).length;
    return {
      source: 'local-coach',
      overallVerdict: hasThesis && bodyCount >= 2
        ? `Strong structural foundation for Grade ${g}! Your thesis sets a clear direction and your body points establish a logical progression.`
        : `Good start for Grade ${g}! Let's sharpen your central thesis and make sure each body paragraph has both specific evidence and analytical reasoning.`,
      thesisFeedback: hasThesis
        ? `Your working thesis ("${outline.thesis.slice(0, 90)}...") states a position. To elevate it for Grade ${g}, ensure it answers "HOW" or "WHY" (the line of reasoning) rather than just stating a topic.`
        : `Your outline needs a clear, debatable thesis statement. Try combining a concession ("Although...") with your core claim and primary reason.`,
      paragraphSuggestions: [
        `Hook & Opening: Make sure your hook connects directly to the core tension of your thesis within 2–3 sentences.`,
        `Body Paragraphs (${bodyCount}/3 drafted): For each body paragraph, pair one concrete example with 2–3 sentences of analysis explaining *why* that evidence proves your thesis.`,
        g >= 9
          ? `Counterargument / Nuance: Don't just dismiss the opposing view—concede where it has partial validity, then show why your argument outweighs it.`
          : `Counterargument / Reflection: Acknowledge one objection a reader might have and explain how your evidence answers it.`
      ],
      polishedThesisSuggestion: hasThesis
        ? `Refined Grade ${g} Pattern: "Although ${outline.counter ? outline.counter.slice(0, 50) : 'some argue otherwise'}, ${outline.thesis.replace(/\.$/, '')} because it fundamentally shapes how individuals think, act, and grow."`
        : `Draft a working thesis first so I can help you refine its syntax and precision!`
    };
  }

  // Interactive Socratic Tutor Chat
  return {
    source: 'local-coach',
    reply: `Great question for a Grade ${g} writer! Looking at your current focus on "${promptTitle || 'your essay'}", remember our key goal: ${pedagogy.expectations} Instead of handing you a pre-written paragraph, let me ask: what is the single strongest piece of evidence or vivid detail you want to spotlight in this section? Tell me in one sentence, and we'll craft the transition together!`,
    followUpPrompt: `Try drafting one topic sentence that links back to your thesis, then test how it sounds aloud.`
  };
}

// Comprehensive local linguistic & rubric evaluator fallback
function buildLocalEssayEvaluation({ grade, promptTitle, genre, essayTitle, essayText }) {
  const g = Number(grade) || 8;
  const text = (essayText || '').trim();
  const words = text.match(/\b[a-zA-Z'-]+\b/g) || [];
  const wordCount = words.length;
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 3);

  const targetWords = g <= 6 ? 300 : g <= 8 ? 420 : g <= 10 ? 520 : 620;
  const avgSentenceLen = sentences.length ? Math.round(wordCount / sentences.length) : 0;

  const transitionWords = [
    'furthermore', 'moreover', 'however', 'consequently', 'nevertheless',
    'therefore', 'specifically', 'conversely', 'ultimately', 'meanwhile',
    'nonetheless', 'subsequently', 'for instance', 'in contrast', 'although', 'whereas'
  ];
  const lowerText = text.toLowerCase();
  const usedTransitions = transitionWords.filter(t => lowerText.includes(t));

  // Score calculation calibrated to grade
  const lengthRatio = Math.min(1.05, wordCount / Math.max(200, targetWords * 0.85));
  const paraBonus = paragraphs.length >= 4 ? 1.5 : paragraphs.length >= 3 ? 0.8 : 0;
  const transitionBonus = Math.min(2, usedTransitions.length * 0.45);
  const sentenceVarietyBonus = avgSentenceLen >= 13 && avgSentenceLen <= 24 ? 1.2 : 0.4;

  const ideasScore = Math.max(5, Math.min(10, Math.round(5.5 + lengthRatio * 2.5 + paraBonus)));
  const orgScore = Math.max(5, Math.min(10, Math.round(5.2 + paraBonus * 1.4 + transitionBonus)));
  const evidenceScore = Math.max(5, Math.min(10, Math.round(5.0 + lengthRatio * 2.8 + (lowerText.includes('for example') || lowerText.includes('for instance') || lowerText.includes('because') ? 1.2 : 0))));
  const styleScore = Math.max(5, Math.min(10, Math.round(5.4 + sentenceVarietyBonus + transitionBonus * 0.8)));
  const totalScore = ideasScore + orgScore + evidenceScore + styleScore;

  const letterGrade =
    totalScore >= 37 ? 'A' :
    totalScore >= 34 ? 'A-' :
    totalScore >= 31 ? 'B+' :
    totalScore >= 28 ? 'B' :
    totalScore >= 25 ? 'B-' : 'C+';

  // Generate concrete sentence-level revisions from the student's actual sentences
  const lineEdits = [];
  const weakPatterns = [
    {
      regex: /\b(very|really)\s+([a-z]+)\b/i,
      category: 'Word Choice & Diction',
      explain: `In Grade ${g} academic writing, replacing intensifiers like "very" or "really" with a single precise verb or adjective strengthens your voice.`
    },
    {
      regex: /\b(I think|I believe|In my opinion)\b/i,
      category: 'Rhetorical Authority',
      explain: `Stating your claim directly without hedging ("I think" / "In my opinion") makes your thesis sound more authoritative and persuasive.`
    },
    {
      regex: /\b(things|stuff|a lot of|good|bad)\b/i,
      category: 'Precision & Specificity',
      explain: `Vague nouns and adjectives ("things", "a lot of", "good/bad") dilute your analysis. Replace them with concrete, domain-specific terms.`
    },
    {
      regex: /\b(there is|there are|it is)\b/i,
      category: 'Sentence Fluency & Active Voice',
      explain: `Expletive constructions ("There is/are", "It is") delay the real subject of your sentence. Lead with a concrete actor and an active verb.`
    }
  ];

  for (const s of sentences) {
    if (lineEdits.length >= 4) break;
    for (const pat of weakPatterns) {
      const m = s.match(pat.regex);
      if (m) {
        let improved = s
          .replace(/\b(I think that|I think|I believe that|I believe|In my opinion,?)\s*/gi, '')
          .replace(/\ba lot of\b/gi, g >= 9 ? 'myriad' : 'numerous')
          .replace(/\bvery important\b/gi, g >= 9 ? 'indispensable' : 'crucial')
          .replace(/\breally important\b/gi, g >= 9 ? 'paramount' : 'essential')
          .replace(/\bvery good\b/gi, 'compelling')
          .replace(/\bvery bad\b/gi, 'detrimental')
          .replace(/\bthings\b/gi, 'factors');
        if (improved.length > 0) {
          improved = improved.charAt(0).toUpperCase() + improved.slice(1);
        }
        if (improved === s) {
          improved = `Moreover, ${s.charAt(0).toLowerCase() + s.slice(1)}`;
        }
        lineEdits.push({
          original: s,
          revised: improved,
          category: pat.category,
          explanation: pat.explain
        });
        break;
      }
    }
  }

  if (lineEdits.length < 3 && sentences.length > 0) {
    const targetSentence = sentences[0];
    lineEdits.push({
      original: targetSentence,
      revised: g >= 9
        ? `While conventional perspectives often overlook this nuance, ${targetSentence.charAt(0).toLowerCase() + targetSentence.slice(1)}`
        : `Specifically, ${targetSentence.charAt(0).toLowerCase() + targetSentence.slice(1)}`,
      category: 'Sentence Variety & Flow',
      explanation: `Adding a subordinate clause or transitional opener creates smoother rhythm and signals how this sentence advances your line of reasoning.`
    });
  }
  if (lineEdits.length < 3 && sentences.length > 2) {
    const lastSent = sentences[sentences.length - 1];
    lineEdits.push({
      original: lastSent,
      revised: `Ultimately, ${lastSent.charAt(0).toLowerCase() + lastSent.slice(1).replace(/\.$/, '')}—a realization that reshapes how we understand ${promptTitle ? promptTitle.toLowerCase() : 'this issue'}.`,
      category: 'Conclusion & Resonance',
      explanation: `A strong Grade ${g} conclusion zooms out from your immediate argument to leave the reader with a lasting thematic or societal insight.`
    });
  }

  const vocabUpgrades = g <= 8
    ? [
        { basicWord: 'important', upgrade: 'pivotal', partOfSpeech: 'adj.', definition: 'Of crucial importance in relation to the development or success of something.', sampleSentence: 'Developing independent study habits plays a pivotal role in middle school success.' },
        { basicWord: 'show', upgrade: 'illustrate', partOfSpeech: 'verb', definition: 'To serve as a clear example of a broader truth or argument.', sampleSentence: 'This historical episode illustrates how perseverance overcomes initial failure.' },
        { basicWord: 'change', upgrade: 'transform', partOfSpeech: 'verb', definition: 'To make a thorough or dramatic change in form, appearance, or character.', sampleSentence: 'Access to community libraries can transform how young readers view the world.' },
        { basicWord: 'hard', upgrade: 'formidable', partOfSpeech: 'adj.', definition: 'Inspiring respect or intense effort through being impressively large, powerful, or challenging.', sampleSentence: 'Balancing athletics and academics presents a formidable challenge for students.' }
      ]
    : [
        { basicWord: 'important', upgrade: 'indispensable', partOfSpeech: 'adj.', definition: 'Absolutely necessary; essential to the integrity of an argument or system.', sampleSentence: 'Free inquiry remains an indispensable pillar of democratic education.' },
        { basicWord: 'show', upgrade: 'underscore', partOfSpeech: 'verb', definition: 'To emphasize or draw critical attention to a foundational truth.', sampleSentence: 'The protagonist’s moral hesitation underscores the ambiguity of ambition.' },
        { basicWord: 'harmful', upgrade: 'deleterious', partOfSpeech: 'adj.', definition: 'Causing subtle or cumulative harm or damage.', sampleSentence: 'Algorithmic echo chambers exert a deleterious effect on public discourse.' },
        { basicWord: 'complex', upgrade: 'multifaceted', partOfSpeech: 'adj.', definition: 'Having many distinct aspects, dimensions, or competing nuances.', sampleSentence: 'Addressing climate resilience requires a multifaceted policy framework.' }
      ];

  return {
    source: 'local-coach',
    gradeEvaluated: g,
    totalScore,
    maxScore: 40,
    letterGrade,
    executiveSummary: `Evaluated against Grade ${g} (${GRADE_PEDAGOGY[g]?.label || 'Academic'}) standards. Your draft contains ${wordCount} words across ${paragraphs.length} paragraph(s) with an average sentence length of ${avgSentenceLen} words. ${
      wordCount < targetWords * 0.7
        ? `Expanding your body paragraphs with deeper evidence and commentary toward the ~${targetWords}-word Grade ${g} target will significantly boost your score.`
        : `You have established a solid structure; focusing next on syntactic variety and deeper analytical commentary will elevate this draft to top-tier Grade ${g} prose.`
    }`,
    dimensions: [
      {
        name: 'Thesis, Ideas & Content',
        score: ideasScore,
        maxScore: 10,
        strength: 'Establishes a clear focus aligned with the writing prompt and maintains thematic relevance.',
        growthArea: g >= 9
          ? 'Push your central thesis beyond a binary claim by introducing a qualification ("Although X, ultimately Y because Z").'
          : 'Make sure your opening paragraph ends with a crystal-clear thesis statement that previews your main reasons.',
        actionStep: 'Rewrite your thesis sentence so it explicitly states both your claim and the underlying "why" (mechanism).'
      },
      {
        name: 'Organization & Transitions',
        score: orgScore,
        maxScore: 10,
        strength: paragraphs.length >= 4
          ? `Well-segmented multi-paragraph structure (${paragraphs.length} paragraphs) that separates introduction, body, and conclusion.`
          : `Clear progression of thought from opening to closing.`,
        growthArea: usedTransitions.length < 3
          ? 'Transitions between sentences and paragraphs rely on basic connectors rather than logical bridge phrases.'
          : 'Ensure each body paragraph opens with a conceptual topic sentence rather than jumping straight into a plot detail or fact.',
        actionStep: `Incorporate at least two analytical transitions (e.g., "Consequently," "In contrast," "Beneath this surface tension") to guide the reader.`
      },
      {
        name: 'Evidence & Analytical Reasoning',
        score: evidenceScore,
        maxScore: 10,
        strength: 'Includes supporting observations that connect to the central topic.',
        growthArea: g >= 9
          ? 'Follow the "2-to-1 Commentary Rule": for every sentence of evidence or example, provide at least two sentences unpacking its deeper implications.'
          : 'Use the PEEL/CER method consistently: after giving an example, explain how that example proves your topic sentence.',
        actionStep: 'Add one concrete historical, literary, or real-world detail to your second body paragraph and explain its significance.'
      },
      {
        name: 'Sentence Fluency, Diction & Conventions',
        score: styleScore,
        maxScore: 10,
        strength: `Average sentence length of ${avgSentenceLen} words demonstrates ${avgSentenceLen >= 12 ? 'solid syntactic control' : 'clear, direct expression'}.`,
        growthArea: 'Replace general verbs and conversational modifiers with precise, grade-calibrated academic vocabulary.',
        actionStep: 'Combine two short adjacent sentences using a participial phrase or subordinating conjunction ("While...", "Triggered by...").'
      }
    ],
    lineEdits,
    vocabularyUpgrades: vocabUpgrades,
    nextDraftChallenge: `Revision Quest for Grade ${g}: Apply at least 2 inline sentence revisions below, weave 2 power vocabulary words into your body paragraphs, and verify that your conclusion answers "Why does this matter in the bigger picture?"`
  };
}

const SYNC_STORE_PATH = path.join(__dirname, '.sync-store.json');

async function loadSyncStore() {
  try {
    const raw = await fs.readFile(SYNC_STORE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveSyncStore(store) {
  try {
    await fs.writeFile(SYNC_STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save sync store:', err);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    // API: Cloud Sync Storage
    if (url.pathname === '/api/sync' && req.method === 'GET') {
      const rawCode = url.searchParams.get('syncCode') || '';
      const syncCode = rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
      if (!syncCode || syncCode.length < 4) {
        return sendJson(res, 400, { ok: false, error: 'Invalid sync code. Must be at least 4 characters.' });
      }
      const store = await loadSyncStore();
      const record = store[syncCode];
      if (!record) {
        return sendJson(res, 200, { ok: true, isConfigured: true, found: false, syncCode });
      }
      return sendJson(res, 200, {
        ok: true,
        isConfigured: true,
        found: true,
        syncCode,
        payload: record.payload,
        updatedAt: record.updatedAt || Date.now()
      });
    }

    if (url.pathname === '/api/sync' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const syncCode = (body.syncCode || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
      if (!syncCode || syncCode.length < 4) {
        return sendJson(res, 400, { ok: false, error: 'Invalid sync code. Must be at least 4 characters.' });
      }
      if (!body.payload) {
        return sendJson(res, 400, { ok: false, error: 'Missing sync payload.' });
      }
      const store = await loadSyncStore();
      store[syncCode] = {
        syncCode,
        updatedAt: body.updatedAt || Date.now(),
        payload: body.payload
      };
      await saveSyncStore(store);
      return sendJson(res, 200, {
        ok: true,
        isConfigured: true,
        syncCode,
        updatedAt: store[syncCode].updatedAt
      });
    }

    // API: Get or update Gemini configuration
    if (url.pathname === '/api/config' && req.method === 'GET') {
      const hasServerKey = Boolean(runtimeApiKey && runtimeApiKey.trim().length > 8);
      const maskedKey = hasServerKey
        ? `${runtimeApiKey.slice(0, 4)}••••••${runtimeApiKey.slice(-4)}`
        : '';
      return sendJson(res, 200, {
        hasServerKey,
        maskedKey,
        model: normalizeModel(runtimeModel)
      });
    }

    if (url.pathname === '/api/config' && req.method === 'POST') {
      const body = await readJsonBody(req);
      if (typeof body.apiKey === 'string') {
        runtimeApiKey = body.apiKey.trim();
      }
      if (typeof body.model === 'string' && body.model.trim()) {
        runtimeModel = normalizeModel(body.model.trim());
      }
      await persistEnvConfig(runtimeApiKey, runtimeModel);
      const hasServerKey = Boolean(runtimeApiKey && runtimeApiKey.trim().length > 8);
      const maskedKey = hasServerKey
        ? `${runtimeApiKey.slice(0, 4)}••••••${runtimeApiKey.slice(-4)}`
        : '';
      return sendJson(res, 200, {
        ok: true,
        hasServerKey,
        maskedKey,
        model: runtimeModel
      });
    }

    // API: AI Socratic Coach (Brainstorming, Outline Review, Tutor Chat)
    if (url.pathname === '/api/ai/coach' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const effectiveKey = (body.apiKey || runtimeApiKey || '').trim();
      const effectiveModel = normalizeModel(body.model || runtimeModel);
      const grade = Number(body.grade) || 8;
      const pedagogy = GRADE_PEDAGOGY[grade] || GRADE_PEDAGOGY[8];

      if (!effectiveKey) {
        const fallback = buildLocalCoachResponse(body);
        return sendJson(res, 200, fallback);
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
        return sendJson(res, 200, { source: 'gemini-api', model: effectiveModel, ...result });
      } catch (apiErr) {
        const fallback = buildLocalCoachResponse(body);
        return sendJson(res, 200, {
          ...fallback,
          model: effectiveModel,
          apiFallbackReason: apiErr.message || 'Fallback to built-in coach'
        });
      }
    }

    // API: 4D Rubric & Line-by-Line Essay Evaluation
    if (url.pathname === '/api/ai/evaluate' && req.method === 'POST') {
      const body = await readJsonBody(req);
      const effectiveKey = (body.apiKey || runtimeApiKey || '').trim();
      const effectiveModel = normalizeModel(body.model || runtimeModel);
      const grade = Number(body.grade) || 8;
      const pedagogy = GRADE_PEDAGOGY[grade] || GRADE_PEDAGOGY[8];

      if (!effectiveKey) {
        const fallback = buildLocalEssayEvaluation(body);
        return sendJson(res, 200, fallback);
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
        return sendJson(res, 200, { source: 'gemini-api', model: effectiveModel, ...result });
      } catch (apiErr) {
        const fallback = buildLocalEssayEvaluation(body);
        return sendJson(res, 200, {
          ...fallback,
          model: effectiveModel,
          apiFallbackReason: apiErr.message || 'Fallback to built-in evaluator'
        });
      }
    }

    // Static file serving
    let reqPath = url.pathname === '/' ? '/index.html' : url.pathname;
    const safePath = path.normalize(reqPath).replace(/^(\.\.[/\\])+/, '');
    const fullPath = path.join(PUBLIC_DIR, safePath);

    try {
      const stat = await fs.stat(fullPath);
      if (stat.isFile()) {
        const ext = path.extname(fullPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const content = await fs.readFile(fullPath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return;
      }
    } catch {
      // Fallback to index.html for SPA navigation
    }

    const indexContent = await fs.readFile(path.join(PUBLIC_DIR, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(indexContent);
  } catch (err) {
    sendJson(res, 500, { error: err.message || 'Internal Server Error' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`WritingQuest server running at http://localhost:${PORT}`);
});
