export const ALLOWED_MODELS = new Set(['gemini-3.8-flash', 'gemini-3.8-pro']);

export function normalizeModel(modelName) {
  if (ALLOWED_MODELS.has(modelName)) return modelName;
  if (typeof modelName === 'string' && modelName.includes('pro')) return 'gemini-3.8-pro';
  return 'gemini-3.8-flash';
}

export const GRADE_PEDAGOGY = {
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
  const timer = setTimeout(() => controller.abort(), 22000);

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

export async function callGeminiJson({ apiKey, model, systemInstruction, userPrompt }) {
  const chosenModel = normalizeModel(model);
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

export function buildLocalCoachResponse({ mode, grade, promptTitle, outline }) {
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

  return {
    source: 'local-coach',
    reply: `Great question for a Grade ${g} writer! Looking at your current focus on "${promptTitle || 'your essay'}", remember our key goal: ${pedagogy.expectations} Instead of handing you a pre-written paragraph, let me ask: what is the single strongest piece of evidence or vivid detail you want to spotlight in this section?`,
    followUpPrompt: `Try drafting one topic sentence that links back to your thesis, then test how it sounds aloud.`
  };
}

export function buildLocalEssayEvaluation({ grade, promptTitle, essayText }) {
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

  const lineEdits = [];
  if (sentences.length > 0) {
    const first = sentences[0];
    lineEdits.push({
      original: first,
      revised: g >= 9
        ? `While conventional perspectives often overlook this nuance, ${first.charAt(0).toLowerCase() + first.slice(1)}`
        : `Specifically, ${first.charAt(0).toLowerCase() + first.slice(1)}`,
      category: 'Sentence Variety & Flow',
      explanation: `Adding a subordinate clause or transitional opener creates smoother rhythm and signals how this sentence advances your line of reasoning.`
    });
  }
  if (sentences.length > 2) {
    const last = sentences[sentences.length - 1];
    lineEdits.push({
      original: last,
      revised: `Ultimately, ${last.charAt(0).toLowerCase() + last.slice(1).replace(/\.$/, '')}—a realization that reshapes how we understand ${promptTitle ? promptTitle.toLowerCase() : 'this issue'}.`,
      category: 'Conclusion & Resonance',
      explanation: `A strong Grade ${g} conclusion zooms out from your immediate argument to leave the reader with a lasting thematic or societal insight.`
    });
  }

  const vocabUpgrades = g <= 8
    ? [
        { basicWord: 'important', upgrade: 'pivotal', partOfSpeech: 'adj.', definition: 'Of crucial importance in relation to the development or success of something.', sampleSentence: 'Developing independent study habits plays a pivotal role in middle school success.' },
        { basicWord: 'show', upgrade: 'illustrate', partOfSpeech: 'verb', definition: 'To serve as a clear example of a broader truth or argument.', sampleSentence: 'This historical episode illustrates how perseverance overcomes initial failure.' },
        { basicWord: 'change', upgrade: 'transform', partOfSpeech: 'verb', definition: 'To make a thorough or dramatic change in form, appearance, or character.', sampleSentence: 'Access to community libraries can transform how young readers view the world.' }
      ]
    : [
        { basicWord: 'important', upgrade: 'indispensable', partOfSpeech: 'adj.', definition: 'Absolutely necessary; essential to the integrity of an argument or system.', sampleSentence: 'Free inquiry remains an indispensable pillar of democratic education.' },
        { basicWord: 'show', upgrade: 'underscore', partOfSpeech: 'verb', definition: 'To emphasize or draw critical attention to a foundational truth.', sampleSentence: 'The protagonist’s moral hesitation underscores the ambiguity of ambition.' },
        { basicWord: 'harmful', upgrade: 'deleterious', partOfSpeech: 'adj.', definition: 'Causing subtle or cumulative harm or damage.', sampleSentence: 'Algorithmic echo chambers exert a deleterious effect on public discourse.' }
      ];

  return {
    source: 'local-coach',
    gradeEvaluated: g,
    totalScore,
    maxScore: 40,
    letterGrade,
    executiveSummary: `Evaluated against Grade ${g} (${GRADE_PEDAGOGY[g]?.label || 'Academic'}) standards (${wordCount} words across ${paragraphs.length} paragraphs).`,
    dimensions: [
      {
        name: 'Thesis, Ideas & Content',
        score: ideasScore,
        maxScore: 10,
        strength: 'Establishes a clear focus aligned with the writing prompt and maintains thematic relevance.',
        growthArea: 'Push your central thesis beyond a binary claim by introducing a qualification ("Although X, ultimately Y because Z").',
        actionStep: 'Rewrite your thesis sentence so it explicitly states both your claim and the underlying "why" (mechanism).'
      },
      {
        name: 'Organization & Transitions',
        score: orgScore,
        maxScore: 10,
        strength: `Structured across ${paragraphs.length} paragraph(s) separating opening, body, and conclusion.`,
        growthArea: 'Ensure each body paragraph opens with a conceptual topic sentence.',
        actionStep: 'Incorporate at least two analytical transitions ("Consequently,", "In contrast,") to guide the reader.'
      },
      {
        name: 'Evidence & Analytical Reasoning',
        score: evidenceScore,
        maxScore: 10,
        strength: 'Includes supporting observations that connect to the central topic.',
        growthArea: 'Follow every piece of evidence with at least two sentences unpacking its deeper implications.',
        actionStep: 'Add one concrete historical, literary, or real-world detail to your second body paragraph and explain its significance.'
      },
      {
        name: 'Sentence Fluency, Diction & Conventions',
        score: styleScore,
        maxScore: 10,
        strength: `Average sentence length of ${avgSentenceLen} words demonstrates solid syntactic control.`,
        growthArea: 'Replace general verbs and conversational modifiers with precise academic vocabulary.',
        actionStep: 'Combine two short adjacent sentences using a participial phrase or subordinating conjunction.'
      }
    ],
    lineEdits,
    vocabularyUpgrades: vocabUpgrades,
    nextDraftChallenge: `Revision Quest for Grade ${g}: Apply the inline sentence revisions below and weave 2 power vocabulary words into your body paragraphs!`
  };
}
