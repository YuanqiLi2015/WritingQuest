import { GRADE_CURRICULUM } from './curriculum.js';

const STORAGE_KEY = 'writingquest_state_v1';

const state = {
  currentGrade: 8,
  activeTab: 'curriculum',
  selectedPromptId: 'g8-arg-social-media',
  customPrompts: [],
  outlinesByPrompt: {},
  draftsByPrompt: {},
  lastEvaluation: null,
  xp: 120,
  vocabVault: [
    {
      word: 'ubiquitous',
      basicWord: 'everywhere',
      pos: 'adj.',
      definition: 'Present, appearing, or found everywhere.',
      sample: 'Smartphones have become ubiquitous in modern middle and high schools.',
      grade: 8,
      mastered: false
    },
    {
      word: 'mitigate',
      basicWord: 'lessen',
      pos: 'verb',
      definition: 'To make less severe, serious, or painful.',
      sample: 'Clear digital boundaries can mitigate the distraction of social notifications.',
      grade: 8,
      mastered: false
    },
    {
      word: 'indispensable',
      basicWord: 'very important',
      pos: 'adj.',
      definition: 'Absolutely necessary; essential to the integrity of an argument or system.',
      sample: 'Free inquiry remains an indispensable pillar of democratic education.',
      grade: 10,
      mastered: false
    }
  ],
  revisionNotebook: [],
  essayHistory: [],
  apiKey: '',
  model: 'gemini-3.8-flash',
  hasServerKey: false,
  maskedServerKey: '',
  studentName: '',
  timerSeconds: 25 * 60,
  timerInterval: null,
  currentQuizWord: null,
  syncCode: '',
  lastSyncedAt: 0,
  isSyncing: false,
  autoSyncTimer: null
};

const ALLOWED_MODELS = new Set(['gemini-3.8-flash', 'gemini-3.8-pro']);

function normalizeModel(modelName) {
  if (ALLOWED_MODELS.has(modelName)) return modelName;
  if (typeof modelName === 'string' && modelName.includes('pro')) return 'gemini-3.8-pro';
  return 'gemini-3.8-flash';
}

// Load persisted state from localStorage
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.currentGrade && GRADE_CURRICULUM[saved.currentGrade]) {
      state.currentGrade = Number(saved.currentGrade);
    }
    if (saved.selectedPromptId) state.selectedPromptId = saved.selectedPromptId;
    if (Array.isArray(saved.customPrompts)) state.customPrompts = saved.customPrompts;
    if (saved.outlinesByPrompt) state.outlinesByPrompt = saved.outlinesByPrompt;
    if (saved.draftsByPrompt) state.draftsByPrompt = saved.draftsByPrompt;
    if (saved.lastEvaluation) state.lastEvaluation = saved.lastEvaluation;
    if (typeof saved.xp === 'number') state.xp = saved.xp;
    if (Array.isArray(saved.vocabVault) && saved.vocabVault.length > 0) state.vocabVault = saved.vocabVault;
    if (Array.isArray(saved.revisionNotebook)) state.revisionNotebook = saved.revisionNotebook;
    if (Array.isArray(saved.essayHistory)) state.essayHistory = saved.essayHistory;
    if (typeof saved.apiKey === 'string') state.apiKey = saved.apiKey;
    state.model = normalizeModel(saved.model);
    if (typeof saved.studentName === 'string') state.studentName = saved.studentName;
    if (typeof saved.syncCode === 'string') state.syncCode = saved.syncCode;
    if (typeof saved.lastSyncedAt === 'number') state.lastSyncedAt = saved.lastSyncedAt;
  } catch {
    // Ignore corrupted storage
  }
}

function saveState() {
  try {
    const serializable = {
      currentGrade: state.currentGrade,
      selectedPromptId: state.selectedPromptId,
      customPrompts: state.customPrompts,
      outlinesByPrompt: state.outlinesByPrompt,
      draftsByPrompt: state.draftsByPrompt,
      lastEvaluation: state.lastEvaluation,
      xp: state.xp,
      vocabVault: state.vocabVault,
      revisionNotebook: state.revisionNotebook,
      essayHistory: state.essayHistory,
      apiKey: state.apiKey,
      model: state.model,
      studentName: state.studentName,
      syncCode: state.syncCode,
      lastSyncedAt: state.lastSyncedAt
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  } catch {
    // Ignore quota errors
  }
}

function showToast(message) {
  const banner = document.getElementById('toast-banner');
  if (!banner) return;
  banner.textContent = message;
  banner.hidden = false;
  clearTimeout(banner._hideTimer);
  banner._hideTimer = setTimeout(() => {
    banner.hidden = true;
  }, 3200);
}

function awardXp(amount, reason) {
  state.xp += amount;
  saveState();
  renderScholarRank();
  if (reason) {
    showToast(`+${amount} XP — ${reason}`);
  }
}

function renderScholarRank() {
  const level = Math.max(1, Math.floor(state.xp / 100) + 1);
  const titles = [
    'Novice Scribe',
    'Paragraph Architect',
    'Evidence Analyst',
    'Rhetoric Scholar',
    'Dialectic Fellow',
    'Master Essayist'
  ];
  const title = titles[Math.min(titles.length - 1, level - 1)];
  const levelEl = document.getElementById('scholar-level-text');
  const xpEl = document.getElementById('scholar-xp-text');
  if (levelEl) {
    levelEl.textContent = state.studentName
      ? `${state.studentName} • Lv.${level} ${title}`
      : `Lv.${level} ${title}`;
  }
  if (xpEl) {
    xpEl.textContent = `${state.xp} XP`;
  }
}

function getAllPromptsForGrade(grade) {
  const basePrompts = GRADE_CURRICULUM[grade]?.prompts || [];
  const custom = state.customPrompts.filter(p => Number(p.grade) === Number(grade));
  return [...custom, ...basePrompts];
}

function getActivePrompt() {
  const gradePrompts = getAllPromptsForGrade(state.currentGrade);
  const found = gradePrompts.find(p => p.id === state.selectedPromptId);
  if (found) return found;
  if (gradePrompts.length > 0) {
    state.selectedPromptId = gradePrompts[0].id;
    return gradePrompts[0];
  }
  return GRADE_CURRICULUM[8].prompts[0];
}

// Navigation between the 5 workflow tabs
function switchTab(tabName) {
  state.activeTab = tabName;
  const tabButtons = document.querySelectorAll('.workflow-tab');
  tabButtons.forEach(btn => {
    const isMatch = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isMatch);
    if (isMatch) {
      btn.setAttribute('aria-current', 'step');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  const sections = {
    curriculum: document.getElementById('view-curriculum'),
    outline: document.getElementById('view-outline'),
    editor: document.getElementById('view-editor'),
    critique: document.getElementById('view-critique'),
    portfolio: document.getElementById('view-portfolio')
  };

  Object.entries(sections).forEach(([key, sectionEl]) => {
    if (!sectionEl) return;
    const active = key === tabName;
    sectionEl.hidden = !active;
    sectionEl.classList.toggle('active', active);
  });

  if (tabName === 'outline') {
    renderOutlineStudio();
  } else if (tabName === 'editor') {
    renderEditorStudio();
  } else if (tabName === 'critique') {
    renderCritiqueView();
  } else if (tabName === 'portfolio') {
    renderPortfolioView();
  }
}

// Render Grade Selector & Stage 1 Curriculum
function renderCurriculumView() {
  const gradeData = GRADE_CURRICULUM[state.currentGrade] || GRADE_CURRICULUM[8];
  const activePrompt = getActivePrompt();

  // Highlight grade pill
  document.querySelectorAll('.grade-pill').forEach(btn => {
    const isCurrent = Number(btn.dataset.grade) === state.currentGrade;
    btn.classList.toggle('active', isCurrent);
    btn.setAttribute('aria-pressed', String(isCurrent));
  });

  document.getElementById('grade-stage-badge').textContent = gradeData.stageBadge;
  document.getElementById('curriculum-heading').textContent = gradeData.title;
  document.getElementById('grade-subtitle-text').textContent = gradeData.subtitle;
  document.getElementById('grade-target-words').textContent = gradeData.targetWordRange;
  document.getElementById('grade-target-sentence').textContent = gradeData.sentenceLengthTarget;
  document.getElementById('active-prompt-summary').textContent = activePrompt.title;

  const skillsListEl = document.getElementById('grade-skills-list');
  skillsListEl.innerHTML = '';
  gradeData.coreSkills.forEach(skill => {
    const li = document.createElement('li');
    li.textContent = skill;
    skillsListEl.appendChild(li);
  });

  renderPromptCards();
}

function renderPromptCards() {
  const container = document.getElementById('prompt-cards-container');
  const searchQuery = (document.getElementById('prompt-search-input')?.value || '').trim().toLowerCase();
  const genreFilter = document.getElementById('genre-filter-select')?.value || 'all';

  const prompts = getAllPromptsForGrade(state.currentGrade).filter(p => {
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery) ||
      p.promptText.toLowerCase().includes(searchQuery) ||
      p.genre.toLowerCase().includes(searchQuery);

    const matchesGenre =
      genreFilter === 'all' ||
      p.genre.toLowerCase().includes(genreFilter.toLowerCase()) ||
      (genreFilter === 'Literary Analysis' && p.genre.includes('Rhetorical')) ||
      (genreFilter === 'Personal Narrative' && p.genre.includes('College'));

    return matchesSearch && matchesGenre;
  });

  container.innerHTML = '';

  if (prompts.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state-box';
    empty.textContent = 'No prompts match your search filter. Try clearing the search or create a custom school prompt!';
    container.appendChild(empty);
    return;
  }

  prompts.forEach(prompt => {
    const isSelected = prompt.id === state.selectedPromptId;
    const card = document.createElement('article');
    card.className = `prompt-card${isSelected ? ' selected' : ''}`;
    card.dataset.promptId = prompt.id;
    card.tabIndex = 0;
    card.setAttribute('aria-current', isSelected ? 'true' : 'false');

    const topDiv = document.createElement('div');
    topDiv.innerHTML = `
      <div class="prompt-card-meta">
        <span class="genre-pill">${escapeHtml(prompt.genre)}</span>
        <div class="prompt-meta-right">
          <span class="difficulty-pill">Grade ${state.currentGrade} • ${escapeHtml(prompt.difficulty || 'Core')}</span>
        </div>
      </div>
      <h3>${escapeHtml(prompt.title)}</h3>
      <p class="prompt-card-desc">${escapeHtml(prompt.promptText)}</p>
    `;

    const bottomDiv = document.createElement('div');
    if (prompt.modelExcerpt) {
      const details = document.createElement('details');
      details.className = 'model-excerpt-details';
      details.innerHTML = `
        <summary>Inspect High-Scoring Model Opening</summary>
        <blockquote>"${escapeHtml(prompt.modelExcerpt)}"</blockquote>
      `;
      bottomDiv.appendChild(details);
    }

    const actions = document.createElement('div');
    actions.className = 'prompt-card-actions';

    const proceedBtn = document.createElement('button');
    proceedBtn.type = 'button';
    proceedBtn.className = 'btn primary small';
    proceedBtn.textContent = 'Proceed to Brainstorm & Outline';
    proceedBtn.addEventListener('click', e => {
      e.stopPropagation();
      selectPrompt(prompt.id);
      switchTab('outline');
    });

    actions.appendChild(proceedBtn);
    bottomDiv.appendChild(actions);

    card.addEventListener('click', () => {
      if (state.selectedPromptId !== prompt.id) {
        selectPrompt(prompt.id, { notify: true });
      }
    });

    card.addEventListener('keydown', e => {
      if (e.target === card && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        selectPrompt(prompt.id, { notify: true });
      }
    });

    card.append(topDiv, bottomDiv);
    container.appendChild(card);
  });
}

function selectPrompt(promptId, { notify = false } = {}) {
  state.selectedPromptId = promptId;
  saveState();

  const activePrompt = getActivePrompt();
  const summaryEl = document.getElementById('active-prompt-summary');
  if (summaryEl) {
    summaryEl.textContent = activePrompt.title;
  }

  document.querySelectorAll('.prompt-card').forEach(card => {
    const isSel = card.dataset.promptId === promptId;
    card.classList.toggle('selected', isSel);
    card.setAttribute('aria-current', isSel ? 'true' : 'false');
  });

  if (notify) {
    showToast(`Selected topic: "${activePrompt.title}"`);
  }
}

// STAGE 2: Socratic Brainstorm & Outline Studio
function renderOutlineStudio() {
  const prompt = getActivePrompt();
  document.getElementById('outline-prompt-title').textContent = `Grade ${state.currentGrade} • ${prompt.genre}: ${prompt.title}`;

  const savedOutline = state.outlinesByPrompt[prompt.id] || {
    hook: '',
    thesis: '',
    body1: '',
    body2: '',
    body3: '',
    counter: '',
    conclusion: ''
  };

  document.getElementById('outline-hook').value = savedOutline.hook || '';
  document.getElementById('outline-thesis').value = savedOutline.thesis || '';
  document.getElementById('outline-body1').value = savedOutline.body1 || '';
  document.getElementById('outline-body2').value = savedOutline.body2 || '';
  document.getElementById('outline-body3').value = savedOutline.body3 || '';
  document.getElementById('outline-counter').value = savedOutline.counter || '';
  document.getElementById('outline-conclusion').value = savedOutline.conclusion || '';
}

function collectCurrentOutline() {
  const prompt = getActivePrompt();
  const data = {
    hook: document.getElementById('outline-hook').value.trim(),
    thesis: document.getElementById('outline-thesis').value.trim(),
    body1: document.getElementById('outline-body1').value.trim(),
    body2: document.getElementById('outline-body2').value.trim(),
    body3: document.getElementById('outline-body3').value.trim(),
    counter: document.getElementById('outline-counter').value.trim(),
    conclusion: document.getElementById('outline-conclusion').value.trim()
  };
  state.outlinesByPrompt[prompt.id] = data;
  saveState();
  return data;
}

function buildClientCoachFallback({ mode, grade, promptTitle, outline }) {
  const g = Number(grade) || 8;
  if (mode === 'brainstorm') {
    return {
      source: 'local-coach',
      coachGreeting: `Let's unlock a strong Grade ${g} angle for "${promptTitle || 'your essay'}". Answer these guiding questions in your own words!`,
      socraticQuestions: [
        g <= 8
          ? `What is one specific real-life moment, book, or observation that made you care about "${promptTitle}"?`
          : `What conventional wisdom about "${promptTitle}" do most people accept without questioning—and how might you challenge or qualify it?`,
        `If a skeptical reader disagreed with your main claim, what is the strongest objection they would raise?`,
        `By the end of your essay, what single takeaway or shift in perspective do you want your reader to carry with them?`
      ],
      thesisTemplates: [
        `Although many people assume [common view], ultimately [your claim] because [Reason A] and [Reason B].`,
        `By examining [specific evidence/tension], we see that [central claim]—revealing [broader significance].`
      ],
      suggestedAngles: [
        `Angle 1 (Concrete Micro-Scene): Anchor the opening in a vivid moment or case study before zooming out to your thesis.`,
        `Angle 2 (Counter-Intuitive Pivot): Acknowledge what seems obviously true on the surface, then reveal an overlooked consequence.`,
        `Angle 3 (Long-Term Impact): Examine how this issue shapes both individual character and the broader community.`
      ]
    };
  }
  if (mode === 'outline-review') {
    const hasThesis = Boolean(outline?.thesis && outline.thesis.trim().length > 15);
    return {
      source: 'local-coach',
      overallVerdict: hasThesis
        ? `Strong structural foundation for Grade ${g}! Your working thesis establishes a clear direction.`
        : `Good start for Grade ${g}! Let's sharpen your thesis statement and pair each body point with concrete evidence.`,
      thesisFeedback: hasThesis
        ? `Ensure your thesis answers "HOW" or "WHY" (your line of reasoning) rather than just stating a position.`
        : `Try combining a concession clause ("Although...") with your main claim and primary reason.`,
      paragraphSuggestions: [
        `Connect your opening hook directly to the core tension of your thesis within 2–3 sentences.`,
        `In each body paragraph, follow every piece of evidence with at least two sentences of analytical explanation.`,
        `Address the strongest opposing viewpoint fairly before showing why your reasoning outweighs it.`
      ],
      polishedThesisSuggestion: hasThesis
        ? `Refined Grade ${g} Pattern: "Although some argue otherwise, ${outline.thesis.replace(/\.$/, '')} because it fundamentally shapes how individuals think, act, and grow."`
        : `Draft a working thesis statement above to see a tailored refinement!`
    };
  }
  return {
    source: 'local-coach',
    reply: `Great question for a Grade ${g} writer! Focus on pairing one concrete example with two sentences of analysis explaining *why* that detail proves your thesis.`,
    followUpPrompt: `Try reading your topic sentence aloud—does it link back to your central thesis?`
  };
}

function sanitizeRepetitions(text) {
  if (!text) return text;
  let prev;
  let res = text;
  let loops = 0;
  do {
    prev = res;
    loops++;
    // Remove repeated transitional words with commas (e.g. "Specifically, specifically,", "Ultimately, ultimately,")
    res = res.replace(/\b([A-Za-z]+),\s+\1,\s*/gi, (m, word) => `${word}, `);
    // Remove duplicate adjacent word followed by comma (e.g. "Specifically, specifically have")
    res = res.replace(/\b([A-Za-z]+),\s+\1\b/gi, (m, word) => `${word}`);
    // Remove duplicated em-dash or hyphen phrases (e.g. "—a realization that reshapes...—a realization that reshapes...")
    res = res.replace(/(—\s*[^—]+?)\s*\1+/g, '$1');
  } while (res !== prev && loops < 5);
  return res;
}

function buildClientEvaluateFallback({ grade, promptTitle, essayText }) {
  const g = Number(grade) || 8;
  const rawText = (essayText || '').trim();
  const text = sanitizeRepetitions(rawText);
  const words = text.match(/\b[a-zA-Z'-]+\b/g) || [];
  const wordCount = words.length;
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 3);
  const targetWords = g <= 6 ? 300 : g <= 8 ? 420 : g <= 10 ? 520 : 620;
  const avgSentenceLen = sentences.length ? Math.round(wordCount / sentences.length) : 0;

  const lengthRatio = Math.min(1.05, wordCount / Math.max(200, targetWords * 0.85));
  const paraBonus = paragraphs.length >= 4 ? 1.5 : paragraphs.length >= 3 ? 0.8 : 0;
  const ideasScore = Math.max(6, Math.min(10, Math.round(5.8 + lengthRatio * 2.5 + paraBonus)));
  const orgScore = Math.max(6, Math.min(10, Math.round(5.6 + paraBonus * 1.5)));
  const evidenceScore = Math.max(6, Math.min(10, Math.round(5.5 + lengthRatio * 2.8)));
  const styleScore = Math.max(6, Math.min(10, Math.round(6.0 + (avgSentenceLen >= 13 ? 2.2 : 1.0))));
  const totalScore = ideasScore + orgScore + evidenceScore + styleScore;
  const letterGrade = totalScore >= 37 ? 'A' : totalScore >= 34 ? 'A-' : totalScore >= 31 ? 'B+' : 'B';

  const lineEdits = [];
  const handledSentences = new Set();

  // 1. Detect accidental duplicate words or repeated clauses (e.g., "Specifically, specifically" or repeated em-dash phrases)
  const rawSentences = rawText.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 3);
  for (const s of rawSentences) {
    const cleaned = sanitizeRepetitions(s);
    if (cleaned !== s) {
      lineEdits.push({
        original: s,
        revised: cleaned,
        category: 'Diction & Redundancy',
        explanation: 'Remove accidental duplicate transition words or repeated clauses to ensure clean, precise, and academically formal syntax.'
      });
      handledSentences.add(s);
      handledSentences.add(cleaned);
      if (lineEdits.length >= 3) break;
    }
  }

  // 2. Sentence Variety & Flow: only suggest if sentence lacks transition and is not a rhetorical question
  const transitionOpenerRegex = /^(specifically|ultimately|moreover|furthermore|however|consequently|therefore|for instance|for example|in addition|while|although|meanwhile|first|second|finally|as a result|by|when|if|after|before)\b/i;

  if (lineEdits.length < 2) {
    const candidate = sentences.find((s, idx) => {
      if (handledSentences.has(s)) return false;
      if (s.endsWith('?')) return false; // Avoid prepending transitions to rhetorical questions
      if (transitionOpenerRegex.test(s)) return false; // Already has a transition!
      if (idx === sentences.length - 1 && sentences.length > 1) return false;
      return s.length >= 20 && s.length <= 120;
    });

    if (candidate) {
      const opener = g >= 9 ? 'In particular, ' : 'For instance, ';
      const revised = `${opener}${candidate.charAt(0).toLowerCase() + candidate.slice(1)}`;
      if (revised !== candidate && !candidate.toLowerCase().startsWith(opener.toLowerCase().trim())) {
        lineEdits.push({
          original: candidate,
          revised,
          category: 'Sentence Variety & Flow',
          explanation: 'Adding a transitional opener connects this sentence smoothly to your ongoing line of reasoning.'
        });
        handledSentences.add(candidate);
      }
    }
  }

  // 3. Conclusion & Resonance: only if the last sentence does NOT already have a conclusion transition or em-dash realization
  if (lineEdits.length < 3 && sentences.length > 2) {
    const lastSent = sentences[sentences.length - 1];
    if (!handledSentences.has(lastSent)) {
      const hasConclusionWord = /^(ultimately|in conclusion|finally|overall|to conclude)\b/i.test(lastSent);
      const hasEmDashOrResonance = /[—–-]{1,2}|\b(realization|reshapes|underscores|transforms|proves)\b/i.test(lastSent);

      if (!hasConclusionWord && !hasEmDashOrResonance) {
        const cleanBase = lastSent.replace(/\.$/, '');
        const revised = `Ultimately, ${cleanBase.charAt(0).toLowerCase() + cleanBase.slice(1)}—a critical step toward achieving lasting positive impact.`;
        lineEdits.push({
          original: lastSent,
          revised,
          category: 'Conclusion & Resonance',
          explanation: `A strong Grade ${g} conclusion zooms out from your immediate argument to leave the reader with a lasting thematic or societal insight.`
        });
        handledSentences.add(lastSent);
      }
    }
  }

  return {
    source: 'local-coach',
    gradeEvaluated: g,
    totalScore,
    maxScore: 40,
    letterGrade,
    executiveSummary: `Evaluated against Grade ${g} standards (${wordCount} words across ${paragraphs.length} paragraphs, avg. ${avgSentenceLen} words/sentence). Strong thematic focus; expanding analytical commentary and transition variety will elevate this draft further.`,
    dimensions: [
      {
        name: 'Thesis, Ideas & Content',
        score: ideasScore,
        maxScore: 10,
        strength: 'Establishes a clear focus aligned with the prompt.',
        growthArea: 'Introduce a qualification clause ("Although X, ultimately Y because Z") to deepen nuance.',
        actionStep: 'Refine your thesis so it states both your claim and the underlying mechanism.'
      },
      {
        name: 'Organization & Transitions',
        score: orgScore,
        maxScore: 10,
        strength: `Structured across ${paragraphs.length} paragraph(s) with clear progression.`,
        growthArea: 'Use conceptual bridge sentences between body paragraphs.',
        actionStep: 'Add analytical transitions ("Consequently,", "In contrast,") at paragraph turns.'
      },
      {
        name: 'Evidence & Analytical Reasoning',
        score: evidenceScore,
        maxScore: 10,
        strength: 'Includes relevant examples connected to the central claim.',
        growthArea: 'Apply the 2:1 commentary ratio—two sentences of analysis for every piece of evidence.',
        actionStep: 'Unpack *how* your second body paragraph example proves your thesis.'
      },
      {
        name: 'Sentence Fluency, Diction & Conventions',
        score: styleScore,
        maxScore: 10,
        strength: `Average sentence length of ${avgSentenceLen} words shows steady syntactic control.`,
        growthArea: 'Replace conversational modifiers with precise academic verbs and adjectives.',
        actionStep: 'Combine two short adjacent sentences using a participial or subordinate clause.'
      }
    ],
    lineEdits,
    vocabularyUpgrades: [
      { basicWord: 'important', upgrade: g >= 9 ? 'indispensable' : 'pivotal', partOfSpeech: 'adj.', definition: 'Absolutely essential or crucial to the outcome.', sampleSentence: 'Critical inquiry plays a pivotal role in academic growth.' },
      { basicWord: 'show', upgrade: g >= 9 ? 'underscore' : 'illustrate', partOfSpeech: 'verb', definition: 'To emphasize or clarify through a concrete example.', sampleSentence: 'This turning point underscores the protagonist’s moral resolve.' },
      { basicWord: 'lessen', upgrade: 'mitigate', partOfSpeech: 'verb', definition: 'To make less severe, harmful, or painful.', sampleSentence: 'Thoughtful habits can mitigate digital distraction.' }
    ],
    nextDraftChallenge: `Apply the inline sentence revisions below and weave 2 vocabulary power-up words into your body paragraphs!`
  };
}

async function requestCoachApi(payload) {
  try {
    const res = await fetch('./api/ai/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Backend unavailable');
    return await res.json();
  } catch {
    return buildClientCoachFallback(payload);
  }
}

async function requestEvaluateApi(payload) {
  try {
    const res = await fetch('./api/ai/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Backend unavailable');
    return await res.json();
  } catch {
    return buildClientEvaluateFallback(payload);
  }
}

async function handleGenerateBrainstorm() {
  const btn = document.getElementById('generate-brainstorm-btn');
  const prompt = getActivePrompt();
  btn.disabled = true;
  btn.textContent = 'Thinking...';

  try {
    const data = await requestCoachApi({
      mode: 'brainstorm',
      grade: state.currentGrade,
      promptTitle: prompt.title,
      promptText: prompt.promptText,
      apiKey: state.apiKey,
      model: state.model
    });

    document.getElementById('coach-greeting-text').textContent = data.coachGreeting || '';

    const qList = document.getElementById('socratic-questions-list');
    qList.innerHTML = '';
    (data.socraticQuestions || []).forEach(q => {
      const li = document.createElement('li');
      li.textContent = q;
      qList.appendChild(li);
    });

    const tList = document.getElementById('thesis-templates-list');
    tList.innerHTML = '';
    (data.thesisTemplates || []).forEach(t => {
      const li = document.createElement('li');
      const code = document.createElement('code');
      code.textContent = t;
      li.appendChild(code);
      tList.appendChild(li);
    });

    const aList = document.getElementById('suggested-angles-list');
    aList.innerHTML = '';
    (data.suggestedAngles || []).forEach(a => {
      const li = document.createElement('li');
      li.textContent = a;
      aList.appendChild(li);
    });

    awardXp(15, 'Completed Socratic Brainstorming');
  } catch (err) {
    showToast(`Coach Notice: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Spark Ideas with AI';
  }
}

async function handleReviewOutline() {
  const btn = document.getElementById('review-outline-btn');
  const prompt = getActivePrompt();
  const outline = collectCurrentOutline();

  btn.disabled = true;
  btn.textContent = 'Reviewing Outline...';

  try {
    const data = await requestCoachApi({
      mode: 'outline-review',
      grade: state.currentGrade,
      promptTitle: prompt.title,
      outline,
      apiKey: state.apiKey,
      model: state.model
    });

    const box = document.getElementById('outline-ai-feedback-box');
    box.hidden = false;
    document.getElementById('outline-verdict-text').textContent = data.overallVerdict || '';
    document.getElementById('outline-thesis-feedback').textContent = data.thesisFeedback || '';
    document.getElementById('outline-polished-thesis').textContent = data.polishedThesisSuggestion || '';

    const sList = document.getElementById('outline-suggestions-list');
    sList.innerHTML = '';
    (data.paragraphSuggestions || []).forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      sList.appendChild(li);
    });

    awardXp(20, 'Reviewed Essay Outline');
  } catch (err) {
    showToast(`Outline Coach Error: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = 'AI Review My Outline';
  }
}

// STAGE 3: Smart Drafting Studio
function renderEditorStudio() {
  const gradeData = GRADE_CURRICULUM[state.currentGrade] || GRADE_CURRICULUM[8];
  const prompt = getActivePrompt();

  document.getElementById('editor-prompt-text').textContent = `${prompt.title} — ${prompt.promptText}`;

  const checklistEl = document.getElementById('editor-checklist');
  checklistEl.innerHTML = '';
  (prompt.checklist || gradeData.coreSkills).forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    checklistEl.appendChild(li);
  });

  // Phrase bank chips
  const chipsContainer = document.getElementById('phrase-bank-chips');
  chipsContainer.innerHTML = '';
  gradeData.phraseBank.forEach(phrase => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'phrase-chip';
    btn.textContent = phrase;
    btn.addEventListener('click', () => insertPhraseIntoDraft(`${phrase} `));
    chipsContainer.appendChild(btn);
  });

  // Outline reference preview
  const outline = state.outlinesByPrompt[prompt.id];
  const previewEl = document.getElementById('editor-outline-preview');
  if (outline && Object.values(outline).some(Boolean)) {
    previewEl.innerHTML = `
      <dl class="outline-preview-list">
        ${outline.hook ? `<dt><strong>Hook:</strong></dt><dd>${escapeHtml(outline.hook)}</dd>` : ''}
        ${outline.thesis ? `<dt><strong>Thesis:</strong></dt><dd>${escapeHtml(outline.thesis)}</dd>` : ''}
        ${outline.body1 ? `<dt><strong>Body 1:</strong></dt><dd>${escapeHtml(outline.body1)}</dd>` : ''}
        ${outline.body2 ? `<dt><strong>Body 2:</strong></dt><dd>${escapeHtml(outline.body2)}</dd>` : ''}
        ${outline.counter ? `<dt><strong>Counter/Turn:</strong></dt><dd>${escapeHtml(outline.counter)}</dd>` : ''}
        ${outline.conclusion ? `<dt><strong>Conclusion:</strong></dt><dd>${escapeHtml(outline.conclusion)}</dd>` : ''}
      </dl>
    `;
  } else {
    previewEl.innerHTML = `<p class="muted-sub">No outline notes saved for this prompt yet. You can build an outline in Stage 2 anytime.</p>`;
  }

  // Load saved draft for this prompt
  const savedDraft = state.draftsByPrompt[prompt.id] || {
    title: prompt.title,
    body: ''
  };
  const cleanBody = sanitizeRepetitions(savedDraft.body || '');
  if (cleanBody !== (savedDraft.body || '')) {
    savedDraft.body = cleanBody;
    state.draftsByPrompt[prompt.id] = savedDraft;
    saveState();
  }
  document.getElementById('essay-title-input').value = savedDraft.title || prompt.title;
  document.getElementById('essay-draft-textarea').value = savedDraft.body || '';

  updateLiveTelemetry();
}

function insertPhraseIntoDraft(phrase) {
  const textarea = document.getElementById('essay-draft-textarea');
  const start = textarea.selectionStart ?? textarea.value.length;
  const end = textarea.selectionEnd ?? textarea.value.length;
  const before = textarea.value.slice(0, start);
  const after = textarea.value.slice(end);
  const prefix = before.length > 0 && !/\s$/.test(before) ? ' ' : '';
  textarea.value = `${before}${prefix}${phrase}${after}`;
  textarea.focus();
  const newPos = (before + prefix + phrase).length;
  textarea.setSelectionRange(newPos, newPos);
  persistCurrentDraft();
  updateLiveTelemetry();
}

function persistCurrentDraft() {
  const prompt = getActivePrompt();
  state.draftsByPrompt[prompt.id] = {
    title: document.getElementById('essay-title-input').value,
    body: document.getElementById('essay-draft-textarea').value
  };
  saveState();
}

function updateLiveTelemetry() {
  const gradeData = GRADE_CURRICULUM[state.currentGrade] || GRADE_CURRICULUM[8];
  const text = (document.getElementById('essay-draft-textarea')?.value || '').trim();
  const words = text ? (text.match(/\b[a-zA-Z'-]+\b/g) || []) : [];
  const wordCount = words.length;
  const paragraphs = text ? text.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).length : 0;
  const sentences = text ? text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 2).length : 0;
  const avgSent = sentences > 0 ? Math.round(wordCount / sentences) : 0;

  const transitionMarkers = [
    'however', 'furthermore', 'moreover', 'consequently', 'therefore',
    'nevertheless', 'for instance', 'for example', 'specifically', 'ultimately',
    'although', 'while', 'in contrast', 'conversely', 'notably', 'admittedly'
  ];
  const lower = text.toLowerCase();
  const transitionsUsed = transitionMarkers.filter(t => lower.includes(t)).length;

  const target = gradeData.targetWordCount || 450;
  document.getElementById('metric-words').textContent = `${wordCount} / ${target}`;
  const bar = document.getElementById('word-progress-bar');
  bar.max = target;
  bar.value = Math.min(target, wordCount);

  document.getElementById('metric-paragraphs').textContent = String(paragraphs);
  document.getElementById('metric-sentences').textContent = String(sentences);
  document.getElementById('metric-avg-sentence').textContent = `${avgSent} words`;
  document.getElementById('metric-transitions').textContent = `${transitionsUsed} used`;
}

async function handleTutorChat(e) {
  e.preventDefault();
  const input = document.getElementById('tutor-chat-input');
  const sendBtn = document.getElementById('tutor-chat-send-btn');
  const question = input.value.trim();
  if (!question) return;

  const log = document.getElementById('tutor-chat-log');
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user';
  userBubble.textContent = question;
  log.appendChild(userBubble);
  log.scrollTop = log.scrollHeight;
  input.value = '';
  sendBtn.disabled = true;

  try {
    const prompt = getActivePrompt();
    const essayText = document.getElementById('essay-draft-textarea').value;
    const data = await requestCoachApi({
      mode: 'chat',
      grade: state.currentGrade,
      promptTitle: prompt.title,
      essayText,
      chatMessage: question,
      apiKey: state.apiKey,
      model: state.model
    });
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble ai';
    aiBubble.textContent = data.reply
      ? `${data.reply}${data.followUpPrompt ? ` 💡 Next step: ${data.followUpPrompt}` : ''}`
      : (data.error || 'Could not reach the AI coach.');
    log.appendChild(aiBubble);
    log.scrollTop = log.scrollHeight;
  } catch (err) {
    const errBubble = document.createElement('div');
    errBubble.className = 'chat-bubble ai';
    errBubble.textContent = `Tutor error: ${err.message}`;
    log.appendChild(errBubble);
  } finally {
    sendBtn.disabled = false;
  }
}

// STAGE 4: 4D Rubric & Line-by-Line Critique
async function handleEvaluateEssay() {
  const prompt = getActivePrompt();
  const essayTitle = document.getElementById('essay-title-input').value.trim() || prompt.title;
  const essayText = document.getElementById('essay-draft-textarea').value.trim();

  if (essayText.length < 40) {
    showToast('Please write at least a few sentences (or click "Load Sample Student Draft") before running AI Evaluation!');
    switchTab('editor');
    return;
  }

  const evalBtn = document.getElementById('evaluate-essay-btn');
  const reEvalBtn = document.getElementById('re-evaluate-btn');
  evalBtn.disabled = true;
  reEvalBtn.disabled = true;
  evalBtn.textContent = 'Analyzing Essay...';
  reEvalBtn.textContent = 'Analyzing Essay...';

  try {
    const evaluation = await requestEvaluateApi({
      grade: state.currentGrade,
      promptTitle: prompt.title,
      genre: prompt.genre,
      promptText: prompt.promptText,
      essayTitle,
      essayText,
      apiKey: state.apiKey,
      model: state.model
    });

    state.lastEvaluation = evaluation;
    const wordCount = (essayText.match(/\b[a-zA-Z'-]+\b/g) || []).length;

    state.essayHistory.unshift({
      id: `eval-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      grade: state.currentGrade,
      promptId: prompt.id,
      title: essayTitle,
      totalScore: evaluation.totalScore || 32,
      letterGrade: evaluation.letterGrade || 'B+',
      wordCount,
      body: essayText
    });
    if (state.essayHistory.length > 20) state.essayHistory.pop();

    awardXp(40, `Evaluated Grade ${state.currentGrade} Essay (${evaluation.letterGrade})`);
    saveState();
    switchTab('critique');
  } catch (err) {
    showToast(`Evaluation Error: ${err.message}`);
  } finally {
    evalBtn.disabled = false;
    reEvalBtn.disabled = false;
    evalBtn.textContent = 'Evaluate & Coach Essay (AI) ✨';
    reEvalBtn.textContent = 'Run AI Evaluation Now';
  }
}

function renderCritiqueView() {
  const ev = state.lastEvaluation;
  if (!ev) return;

  document.getElementById('critique-grade-badge').textContent = `Grade ${ev.gradeEvaluated || state.currentGrade} Rubric Assessment`;
  document.getElementById('critique-engine-badge').textContent =
    ev.source === 'gemini-api' ? `Google Gemini (${ev.model || state.model})` : 'Built-in Linguistic Coach';
  document.getElementById('critique-executive-summary').textContent = ev.executiveSummary || '';
  document.getElementById('critique-mission-text').textContent = ev.nextDraftChallenge || '';
  document.getElementById('critique-letter-grade').textContent = ev.letterGrade || 'B+';
  document.getElementById('critique-total-score').textContent = `${ev.totalScore || 0} / ${ev.maxScore || 40}`;

  // 4D Rubric Accordions using exclusive `<details name="rubric-accordion">`
  const accContainer = document.getElementById('rubric-accordions-container');
  accContainer.innerHTML = '';
  (ev.dimensions || []).forEach((dim, idx) => {
    const details = document.createElement('details');
    details.name = 'rubric-accordion';
    details.className = 'rubric-details';
    if (idx === 0) details.open = true;

    details.innerHTML = `
      <summary>
        <span>${escapeHtml(dim.name)}</span>
        <strong class="dim-score-pill">${Number(dim.score)} / ${Number(dim.maxScore || 10)}</strong>
      </summary>
      <div class="rubric-details-body">
        <p><strong>Strength:</strong> ${escapeHtml(dim.strength)}</p>
        <p><strong>Growth Area:</strong> ${escapeHtml(dim.growthArea)}</p>
        <p><strong>Action Step:</strong> ${escapeHtml(dim.actionStep)}</p>
      </div>
    `;
    accContainer.appendChild(details);
  });

  // Sentence-by-sentence Line Edits
  const editsContainer = document.getElementById('line-edits-container');
  editsContainer.innerHTML = '';
  const edits = ev.lineEdits || [];
  if (edits.length === 0) {
    editsContainer.innerHTML = `<div class="empty-state-box">No line-level issues flagged in this pass.</div>`;
  } else {
    edits.forEach(edit => {
      const card = document.createElement('div');
      card.className = 'line-edit-card';
      card.innerHTML = `
        <span class="edit-category-tag">${escapeHtml(edit.category || 'Revision')}</span>
        <div class="sentence-diff">
          <p class="sent-original">"${escapeHtml(edit.original)}"</p>
          <p class="sent-revised">→ "${escapeHtml(edit.revised)}"</p>
        </div>
        <p class="edit-explanation">${escapeHtml(edit.explanation)}</p>
      `;

      const btnRow = document.createElement('div');
      btnRow.className = 'btn-group';

      const applyBtn = document.createElement('button');
      applyBtn.type = 'button';
      applyBtn.className = 'btn primary small';
      applyBtn.textContent = 'Apply to My Draft';
      applyBtn.addEventListener('click', () => {
        const draftEl = document.getElementById('essay-draft-textarea');
        if (draftEl.value.includes(edit.original)) {
          let updated = draftEl.value.replace(edit.original, edit.revised);
          updated = sanitizeRepetitions(updated);
          draftEl.value = updated;
          persistCurrentDraft();
          updateLiveTelemetry();
          applyBtn.textContent = '✓ Applied to Draft';
          applyBtn.disabled = true;
          awardXp(10, 'Applied Inline Sentence Revision');
        } else {
          showToast('Sentence already modified in your draft.');
        }
      });

      const saveNoteBtn = document.createElement('button');
      saveNoteBtn.type = 'button';
      saveNoteBtn.className = 'btn secondary small';
      saveNoteBtn.textContent = '+ Save to Notebook';
      saveNoteBtn.addEventListener('click', () => {
        state.revisionNotebook.unshift({
          category: edit.category || 'Style & Syntax',
          original: edit.original,
          revised: edit.revised,
          explanation: edit.explanation,
          grade: state.currentGrade
        });
        saveState();
        saveNoteBtn.textContent = '✓ Saved';
        saveNoteBtn.disabled = true;
        awardXp(5, 'Saved Revision Pattern to Notebook');
      });

      btnRow.append(applyBtn, saveNoteBtn);
      card.appendChild(btnRow);
      editsContainer.appendChild(card);
    });
  }

  // Vocabulary Power-Ups
  const vocabGrid = document.getElementById('critique-vocab-grid');
  vocabGrid.innerHTML = '';
  (ev.vocabularyUpgrades || []).forEach(v => {
    const card = document.createElement('div');
    card.className = 'vocab-card';
    card.innerHTML = `
      <div>
        <div class="vocab-pair">
          <span class="vocab-basic">${escapeHtml(v.basicWord || '')}</span>
          <span>→</span>
          <span class="vocab-upgrade">${escapeHtml(v.upgrade)}</span>
          <small class="muted-sub">(${escapeHtml(v.partOfSpeech || 'word')})</small>
        </div>
        <p class="edit-explanation">${escapeHtml(v.definition)}</p>
        <p class="muted-sub"><em>"${escapeHtml(v.sampleSentence)}"</em></p>
      </div>
    `;
    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'btn secondary small';
    const alreadySaved = state.vocabVault.some(item => item.word.toLowerCase() === v.upgrade.toLowerCase());
    saveBtn.textContent = alreadySaved ? '✓ In Vocabulary Vault' : '+ Save to Vocabulary Vault';
    saveBtn.disabled = alreadySaved;
    saveBtn.addEventListener('click', () => {
      state.vocabVault.unshift({
        word: v.upgrade,
        basicWord: v.basicWord,
        pos: v.partOfSpeech || 'word',
        definition: v.definition,
        sample: v.sampleSentence,
        grade: state.currentGrade,
        mastered: false
      });
      saveState();
      saveBtn.textContent = '✓ In Vocabulary Vault';
      saveBtn.disabled = true;
      awardXp(10, `Added "${v.upgrade}" to Vocabulary Vault`);
    });
    card.appendChild(saveBtn);
    vocabGrid.appendChild(card);
  });
}

// STAGE 5: Growth Portfolio & Vocabulary Vault
function renderPortfolioView() {
  const count = state.essayHistory.length;
  const totalWords = state.essayHistory.reduce((acc, item) => acc + (item.wordCount || 0), 0);
  const avgScore = count > 0
    ? (state.essayHistory.reduce((acc, item) => acc + (item.totalScore || 0), 0) / count).toFixed(1)
    : '—';

  document.getElementById('stat-essays-count').textContent = String(count);
  document.getElementById('stat-avg-score').textContent = count > 0 ? `${avgScore} / 40` : '— / 40';
  document.getElementById('stat-total-words').textContent = totalWords.toLocaleString();
  document.getElementById('stat-vocab-count').textContent = `${state.vocabVault.length} words`;

  // Render Vocabulary Vault
  const vocabList = document.getElementById('vocab-vault-list');
  vocabList.innerHTML = '';
  state.vocabVault.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'vault-item';
    div.innerHTML = `
      <div class="panel-header">
        <strong>${escapeHtml(item.word)} <small class="muted-sub">(${escapeHtml(item.pos || 'word')} • G${item.grade || state.currentGrade})</small></strong>
        <button type="button" class="btn ghost small" data-idx="${idx}">${item.mastered ? '★ Mastered' : 'Mark Mastered'}</button>
      </div>
      <p>${escapeHtml(item.definition)}</p>
      <p class="muted-sub"><em>"${escapeHtml(item.sample)}"</em></p>
    `;
    div.querySelector('button').addEventListener('click', () => {
      state.vocabVault[idx].mastered = !state.vocabVault[idx].mastered;
      saveState();
      renderPortfolioView();
    });
    vocabList.appendChild(div);
  });

  // Render Saved Revision Notebook
  const revList = document.getElementById('revision-notebook-list');
  revList.innerHTML = '';
  if (state.revisionNotebook.length === 0) {
    revList.innerHTML = `<div class="empty-state-box">Save sentence improvements from Stage 4 to build your personal revision log!</div>`;
  } else {
    state.revisionNotebook.forEach(note => {
      const div = document.createElement('div');
      div.className = 'vault-item';
      div.innerHTML = `
        <span class="edit-category-tag">${escapeHtml(note.category)} (G${note.grade})</span>
        <p class="sent-original">"${escapeHtml(note.original)}"</p>
        <p class="sent-revised">→ "${escapeHtml(note.revised)}"</p>
        <p class="muted-sub">${escapeHtml(note.explanation)}</p>
      `;
      revList.appendChild(div);
    });
  }

  // Render Evaluated Essay History
  const histList = document.getElementById('essay-history-list');
  histList.innerHTML = '';
  if (state.essayHistory.length === 0) {
    histList.innerHTML = `<div class="empty-state-box">No evaluated essays yet. Submit your first draft in Stage 3!</div>`;
  } else {
    state.essayHistory.forEach(entry => {
      const div = document.createElement('div');
      div.className = 'vault-item';
      div.innerHTML = `
        <div class="panel-header">
          <strong>${escapeHtml(entry.title)}</strong>
          <span class="dim-score-pill">${escapeHtml(entry.letterGrade)} (${entry.totalScore}/40)</span>
        </div>
        <p class="muted-sub">Grade ${entry.grade} • ${entry.wordCount} words • ${escapeHtml(entry.date)}</p>
      `;
      histList.appendChild(div);
    });
  }

  renderVocabQuizQuestion();
}

function renderVocabQuizQuestion() {
  const pool = [...state.vocabVault];
  Object.values(GRADE_CURRICULUM).forEach(g => {
    (g.starterVocabulary || []).forEach(v => {
      if (!pool.some(p => p.word.toLowerCase() === v.word.toLowerCase())) {
        pool.push({ ...v, grade: g.grade });
      }
    });
  });

  if (pool.length < 3) return;
  const target = pool[Math.floor(Math.random() * pool.length)];
  state.currentQuizWord = target;

  const distractors = pool
    .filter(w => w.word.toLowerCase() !== target.word.toLowerCase())
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [target, ...distractors].sort(() => Math.random() - 0.5);

  document.getElementById('quiz-prompt-text').innerHTML =
    `Which academic word means: <strong>"${escapeHtml(target.definition)}"</strong>?`;
  const feedbackEl = document.getElementById('quiz-feedback-text');
  feedbackEl.textContent = '';

  const optsContainer = document.getElementById('quiz-options-container');
  optsContainer.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn secondary small';
    btn.textContent = opt.word;
    btn.addEventListener('click', () => {
      if (opt.word === target.word) {
        feedbackEl.textContent = `✓ Correct! "${target.word}": ${target.sample}`;
        awardXp(10, `Mastered Vocabulary Quiz: "${target.word}"`);
      } else {
        feedbackEl.textContent = `Not quite—try another option! Hint: It starts with "${target.word.charAt(0).toUpperCase()}".`;
      }
    });
    optsContainer.appendChild(btn);
  });
}

// Theme Toggle (Two-state control per `dark-mode` guidance: System default vs pinned opposite)
function initThemeControl() {
  const metaScheme = document.querySelector('meta[name="color-scheme"]');
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const toggleLabel = document.getElementById('theme-toggle-label');
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function getEffectiveScheme() {
    const pinned = localStorage.getItem('color-scheme');
    if (pinned === 'light' || pinned === 'dark') return pinned;
    return mediaQuery.matches ? 'dark' : 'light';
  }

  function updateThemeButtonUI() {
    const current = getEffectiveScheme();
    toggleLabel.textContent = current === 'dark' ? '☀️ Light' : '🌙 Dark';
  }

  toggleBtn.addEventListener('click', () => {
    const systemScheme = mediaQuery.matches ? 'dark' : 'light';
    const current = getEffectiveScheme();
    const targetScheme = current === 'dark' ? 'light' : 'dark';

    if (targetScheme === systemScheme) {
      // Revert to system setting
      localStorage.removeItem('color-scheme');
      metaScheme.content = 'light dark';
      document.documentElement.style.colorScheme = 'light dark';
      delete document.documentElement.dataset.theme;
    } else {
      // Pin the explicit opposite scheme
      localStorage.setItem('color-scheme', targetScheme);
      metaScheme.content = targetScheme;
      document.documentElement.style.colorScheme = targetScheme;
      document.documentElement.dataset.theme = targetScheme;
    }
    updateThemeButtonUI();
  });

  mediaQuery.addEventListener('change', () => {
    updateThemeButtonUI();
  });

  updateThemeButtonUI();
}

// Light-dismiss dialog fallback per `light-dismiss-a-dialog` guidance
function attachDialogLightDismissFallbacks() {
  document.querySelectorAll('dialog').forEach(dialog => {
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      });
    }
  });
}

// Server API Configuration Sync
async function syncApiConfig() {
  try {
    const res = await fetch('/api/config');
    if (!res.ok) return;
    const data = await res.json();
    state.hasServerKey = Boolean(data.hasServerKey);
    state.maskedServerKey = data.maskedKey || '';
    if (data.model && !state.model) {
      state.model = data.model;
    }
    updateApiStatusBadge();
  } catch {
    updateApiStatusBadge();
  }
}

function updateHeaderSettingsDot() {
  const headerDot = document.getElementById('header-settings-dot');
  if (!headerDot) return;
  const isApiConnected = Boolean((state.apiKey && state.apiKey.length > 8) || state.hasServerKey);
  const hasSyncCode = Boolean(state.syncCode);
  headerDot.classList.toggle('connected', isApiConnected || hasSyncCode);
  headerDot.classList.toggle('syncing', state.isSyncing);
}

function updateApiStatusBadge() {
  const dot = document.getElementById('api-status-dot');
  const label = document.getElementById('api-status-label');
  const hint = document.getElementById('server-key-hint');
  const isConnected = Boolean((state.apiKey && state.apiKey.length > 8) || state.hasServerKey);

  if (dot) dot.classList.toggle('connected', isConnected);
  if (label) label.textContent = isConnected ? `Gemini Ready (${state.model})` : 'Set Gemini API Key';
  if (hint && state.hasServerKey) {
    hint.textContent = `Server key active (${state.maskedServerKey}). Enter a new key above only if you wish to replace it.`;
  }
  updateHeaderSettingsDot();
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ==========================================
// MULTI-DEVICE CLOUD SYNC ENGINE (Solution B)
// ==========================================

function getSyncPayload() {
  // Always capture the live DOM values from active outline and editor into state first
  try {
    collectCurrentOutline();
    persistCurrentDraft();
  } catch {
    // Ignore DOM read errors if elements are absent
  }

  return {
    version: 1,
    studentName: state.studentName,
    currentGrade: state.currentGrade,
    selectedPromptId: state.selectedPromptId,
    customPrompts: state.customPrompts,
    outlinesByPrompt: state.outlinesByPrompt,
    draftsByPrompt: state.draftsByPrompt,
    lastEvaluation: state.lastEvaluation,
    xp: state.xp,
    vocabVault: state.vocabVault,
    revisionNotebook: state.revisionNotebook,
    essayHistory: state.essayHistory,
    model: state.model
  };
}

function hasLocalContent() {
  const hasOutlines = Object.values(state.outlinesByPrompt || {}).some(
    o => o && Object.values(o).some(v => typeof v === 'string' && v.trim().length > 0)
  );
  const hasDrafts = Object.values(state.draftsByPrompt || {}).some(
    d => d && typeof d.body === 'string' && d.body.trim().length > 0
  );
  const hasHistory = Array.isArray(state.essayHistory) && state.essayHistory.length > 0;
  return hasOutlines || hasDrafts || hasHistory || (state.xp && state.xp > 120);
}

function applySyncPayload(payload) {
  if (!payload || typeof payload !== 'object') return false;

  if (typeof payload.studentName === 'string') {
    state.studentName = payload.studentName;
  }
  if (payload.currentGrade && GRADE_CURRICULUM[payload.currentGrade]) {
    state.currentGrade = Number(payload.currentGrade);
  }
  if (payload.selectedPromptId) {
    state.selectedPromptId = payload.selectedPromptId;
  }
  if (Array.isArray(payload.customPrompts)) {
    state.customPrompts = payload.customPrompts;
  }
  if (payload.outlinesByPrompt && typeof payload.outlinesByPrompt === 'object') {
    state.outlinesByPrompt = {
      ...state.outlinesByPrompt,
      ...payload.outlinesByPrompt
    };
  }
  if (payload.draftsByPrompt && typeof payload.draftsByPrompt === 'object') {
    state.draftsByPrompt = {
      ...state.draftsByPrompt,
      ...payload.draftsByPrompt
    };
  }
  if (payload.lastEvaluation) {
    state.lastEvaluation = payload.lastEvaluation;
  }
  if (typeof payload.xp === 'number') {
    state.xp = Math.max(state.xp, payload.xp);
  }
  if (Array.isArray(payload.vocabVault)) {
    const map = new Map();
    state.vocabVault.forEach(item => {
      if (item && item.word) map.set(item.word.toLowerCase(), item);
    });
    payload.vocabVault.forEach(item => {
      if (item && item.word) map.set(item.word.toLowerCase(), item);
    });
    state.vocabVault = Array.from(map.values());
  }
  if (Array.isArray(payload.revisionNotebook)) {
    const set = new Set(state.revisionNotebook.map(r => `${r.date}_${r.weakness}`));
    payload.revisionNotebook.forEach(item => {
      const key = `${item.date}_${item.weakness}`;
      if (!set.has(key)) {
        state.revisionNotebook.push(item);
        set.add(key);
      }
    });
  }
  if (Array.isArray(payload.essayHistory)) {
    const existingIds = new Set(state.essayHistory.map(h => h.id));
    payload.essayHistory.forEach(item => {
      if (item && item.id && !existingIds.has(item.id)) {
        state.essayHistory.push(item);
        existingIds.add(item.id);
      }
    });
    state.essayHistory.sort((a, b) => (b.id || '').localeCompare(a.id || ''));
  }
  if (payload.model) {
    state.model = normalizeModel(payload.model);
  }

  saveState();
  renderScholarRank();
  renderCurriculumView();
  renderOutlineStudio();
  renderEditorStudio();
  renderPortfolioView();
  switchTab(state.activeTab || 'curriculum');
  return true;
}

function formatTimeAgo(ts) {
  if (!ts) return 'Never';
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  return new Date(ts).toLocaleDateString();
}

function describeLocalProgress() {
  const prompt = getActivePrompt();
  const draft = state.draftsByPrompt[prompt.id]?.body || '';
  const wordCount = (draft.match(/\b[a-zA-Z'-]+\b/g) || []).length;
  const outline = state.outlinesByPrompt[prompt.id] || {};
  const outlineCount = Object.values(outline).filter(v => typeof v === 'string' && v.trim().length > 0).length;
  return `${wordCount} words, ${outlineCount} outline items`;
}

function ensureActiveSyncCode() {
  const codeInput = document.getElementById('sync-code-input');
  const entered = (codeInput?.value || '').trim();
  if (entered.length >= 4) {
    state.syncCode = entered.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
    saveState();
  }
  return state.syncCode;
}

function updateSyncUI() {
  const dot = document.getElementById('cloud-sync-dot');
  const label = document.getElementById('cloud-sync-label');
  const modalChip = document.getElementById('modal-sync-chip');
  const modalDetail = document.getElementById('modal-sync-detail');
  const codeInput = document.getElementById('sync-code-input');
  const pushBtn = document.getElementById('manual-push-btn');
  const pullBtn = document.getElementById('manual-pull-btn');
  const disconnectBtn = document.getElementById('disconnect-sync-btn');
  const connectBtn = document.getElementById('connect-sync-btn');

  const currentCode = ensureActiveSyncCode();
  const hasCode = Boolean(currentCode);

  if (dot) {
    dot.classList.toggle('connected', hasCode);
    dot.classList.toggle('syncing', state.isSyncing);
  }
  if (label) {
    if (state.isSyncing) {
      label.textContent = 'Syncing...';
    } else if (hasCode) {
      label.textContent = `Sync: ${currentCode}`;
    } else {
      label.textContent = '☁️ Cloud Sync';
    }
  }

  if (modalChip) {
    if (hasCode) {
      modalChip.className = 'status-chip success';
      modalChip.textContent = `✓ Active Code: ${currentCode}`;
    } else {
      modalChip.className = 'status-chip';
      modalChip.textContent = '○ Not Connected';
    }
  }

  if (modalDetail) {
    if (hasCode) {
      modalDetail.textContent = `Manual Cloud Sync ready for "${currentCode}". Local draft: ${describeLocalProgress()}. Last synced: ${formatTimeAgo(state.lastSyncedAt)}.`;
    } else {
      modalDetail.textContent = 'Enter your family sync code below, then click "Push to Cloud" (to upload) or "Pull from Cloud" (to download).';
    }
  }

  if (codeInput && !codeInput.matches(':focus')) {
    codeInput.value = currentCode || '';
  }

  if (pushBtn) pushBtn.disabled = !hasCode || state.isSyncing;
  if (pullBtn) pullBtn.disabled = !hasCode || state.isSyncing;
  if (disconnectBtn) disconnectBtn.disabled = !hasCode || state.isSyncing;
  if (connectBtn) {
    connectBtn.disabled = state.isSyncing;
    connectBtn.textContent = hasCode ? 'Save Code' : 'Set Sync Code';
  }
  updateHeaderSettingsDot();
}

async function pushToCloud({ silent = false } = {}) {
  const activeCode = ensureActiveSyncCode();
  if (!activeCode) {
    if (!silent) showToast('Please enter a sync code (e.g. ALEX-2026) first.');
    return false;
  }
  state.isSyncing = true;
  updateSyncUI();

  try {
    const payload = getSyncPayload();
    const res = await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        syncCode: activeCode,
        updatedAt: Date.now(),
        payload
      })
    });

    const data = await res.json().catch(() => ({}));
    if (data.ok) {
      state.lastSyncedAt = data.updatedAt || Date.now();
      saveState();
      updateSyncUI();
      if (!silent) {
        showToast(`☁️ Cloud saved! [${activeCode}] (${describeLocalProgress()})`);
      }
      return true;
    } else if (data.isConfigured === false) {
      const msg = data.message || 'Upstash Redis storage is not connected or requires Redeploy in Vercel.';
      if (!silent) {
        showToast(`⚠️ Sync Notice: ${msg}`);
      }
      const modalDetail = document.getElementById('modal-sync-detail');
      if (modalDetail) {
        modalDetail.innerHTML = `<span style="color:var(--danger, #ef4444);font-weight:600;">⚠️ Upstash Redis not active.</span> In Vercel, go to <strong>Deployments</strong> &rarr; click <strong>Redeploy</strong> to activate the connected database.`;
      }
      return false;
    } else {
      if (!silent) {
        showToast(`Sync notice: ${data.error || 'Failed to save to cloud'}`);
      }
      return false;
    }
  } catch (err) {
    if (!silent) {
      showToast(`Cloud Sync offline: ${err.message}`);
    }
    return false;
  } finally {
    state.isSyncing = false;
    updateSyncUI();
  }
}

async function pullFromCloud({ silent = false } = {}) {
  const activeCode = ensureActiveSyncCode();
  if (!activeCode) {
    if (!silent) showToast('Please enter a sync code (e.g. ALEX-2026) first.');
    return false;
  }
  state.isSyncing = true;
  updateSyncUI();

  try {
    const res = await fetch(`/api/sync?syncCode=${encodeURIComponent(activeCode)}`);
    const data = await res.json().catch(() => ({}));
    if (data.ok) {
      if (data.found && data.payload) {
        applySyncPayload(data.payload);
        state.lastSyncedAt = data.updatedAt || Date.now();
        saveState();
        updateSyncUI();
        if (!silent) {
          showToast(`☁️ Pulled from cloud! [${activeCode}] (${describeLocalProgress()})`);
        }
        return true;
      } else {
        if (!silent) {
          showToast(`ℹ️ No draft found in cloud for code "${activeCode}". Please check code or click "Push to Cloud" on your other device first.`);
        }
        return false;
      }
    } else if (data.isConfigured === false) {
      const msg = data.message || 'Upstash Redis storage is not connected or requires Redeploy in Vercel.';
      if (!silent) {
        showToast(`⚠️ Sync Notice: ${msg}`);
      }
      const modalDetail = document.getElementById('modal-sync-detail');
      if (modalDetail) {
        modalDetail.innerHTML = `<span style="color:var(--danger, #ef4444);font-weight:600;">⚠️ Upstash Redis not active.</span> In Vercel, go to <strong>Deployments</strong> &rarr; click <strong>Redeploy</strong> to activate the connected database.`;
      }
      return false;
    } else {
      if (!silent) {
        showToast(`Sync error: ${data.error || 'Failed to fetch from cloud'}`);
      }
      return false;
    }
  } catch (err) {
    if (!silent) {
      showToast(`Cloud Sync offline: ${err.message}`);
    }
    return false;
  } finally {
    state.isSyncing = false;
    updateSyncUI();
  }
}

// Background auto-sync intentionally disabled per user preference — manual sync only
function triggerAutoSync() {}

// Initialize all event listeners
function initApp() {
  loadState();
  initThemeControl();
  attachDialogLightDismissFallbacks();
  renderScholarRank();
  renderCurriculumView();
  syncApiConfig();

  // Grade Ribbon Selector
  document.getElementById('grade-selector-list').addEventListener('click', e => {
    const btn = e.target.closest('.grade-pill');
    if (!btn) return;
    const newGrade = Number(btn.dataset.grade);
    if (!GRADE_CURRICULUM[newGrade]) return;
    state.currentGrade = newGrade;
    const prompts = getAllPromptsForGrade(newGrade);
    if (prompts.length > 0) {
      state.selectedPromptId = prompts[0].id;
    }
    saveState();
    renderCurriculumView();
    if (state.activeTab === 'outline') renderOutlineStudio();
    if (state.activeTab === 'editor') renderEditorStudio();
    showToast(`Switched to Grade ${newGrade} Curriculum Standards`);
  });

  // Workflow Stage Tabs
  document.getElementById('workflow-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.workflow-tab');
    if (!btn) return;
    switchTab(btn.dataset.tab);
  });

  // Search & Genre Filter
  document.getElementById('prompt-search-input').addEventListener('input', renderPromptCards);
  document.getElementById('genre-filter-select').addEventListener('change', renderPromptCards);

  // Outline Studio events
  document.getElementById('generate-brainstorm-btn').addEventListener('click', handleGenerateBrainstorm);
  document.getElementById('review-outline-btn').addEventListener('click', handleReviewOutline);
  document.getElementById('outline-form').addEventListener('input', collectCurrentOutline);

  const outlineForm = document.getElementById('outline-form');
  if (outlineForm) {
    const outlineFields = outlineForm.querySelectorAll('.form-field');
    outlineFields.forEach(field => {
      field.addEventListener('click', e => {
        const textarea = field.querySelector('textarea');
        if (textarea && e.target !== textarea) {
          textarea.focus();
        }
      });
    });
  }

  document.getElementById('send-outline-to-editor-btn').addEventListener('click', () => {
    const outline = collectCurrentOutline();
    const prompt = getActivePrompt();

    const intro = [outline.hook, outline.thesis].filter(Boolean).join(' ');
    const paragraphs = [
      intro,
      outline.body1,
      outline.body2,
      outline.body3,
      outline.counter,
      outline.conclusion
    ].filter(p => typeof p === 'string' && p.trim().length > 0);

    const scaffold = paragraphs.join('\n\n');

    if (scaffold.trim().length > 0) {
      const currentDraft = (state.draftsByPrompt[prompt.id]?.body || '').trim();
      if (currentDraft && currentDraft !== scaffold) {
        const confirmed = confirm(
          'Transfer your outline sections into the Drafting Studio? This will update your draft with the outline paragraphs.'
        );
        if (!confirmed) {
          switchTab('editor');
          return;
        }
      }

      state.draftsByPrompt[prompt.id] = {
        title: state.draftsByPrompt[prompt.id]?.title || prompt.title,
        body: scaffold
      };
      saveState();
      showToast('Outline loaded into Drafting Studio paragraphs!');
    }

    switchTab('editor');
  });

  // Editor Studio events
  document.getElementById('essay-title-input').addEventListener('input', persistCurrentDraft);
  document.getElementById('essay-draft-textarea').addEventListener('input', () => {
    persistCurrentDraft();
    updateLiveTelemetry();
  });

  // Sample Student Draft Reference Modal (Study only — never overwrites student's active draft)
  const sampleDraftDialog = document.getElementById('sample-draft-dialog');
  const loadSampleDraftBtn = document.getElementById('load-sample-draft-btn');
  const closeSampleDraftBtn = document.getElementById('close-sample-draft-btn');
  const closeSampleDraftFooterBtn = document.getElementById('close-sample-draft-footer-btn');
  const copySampleDraftBtn = document.getElementById('copy-sample-draft-btn');

  function openSampleDraftModal() {
    const prompt = getActivePrompt();
    const sample = prompt.sampleDraft || prompt.modelExcerpt || '';
    if (!sample) {
      showToast('No sample draft available for this prompt yet.');
      return;
    }

    const titleEl = document.getElementById('sample-draft-prompt-title');
    const genreEl = document.getElementById('sample-genre-badge');
    const gradeEl = document.getElementById('sample-grade-badge');
    const wordCountEl = document.getElementById('sample-word-count-badge');
    const bodyEl = document.getElementById('sample-draft-body');

    if (titleEl) titleEl.textContent = `Model Essay: ${prompt.title}`;
    if (genreEl) genreEl.textContent = prompt.genre || 'Essay';
    if (gradeEl) gradeEl.textContent = `Grade ${state.currentGrade}`;

    const words = (sample.match(/\b[a-zA-Z'-]+\b/g) || []).length;
    if (wordCountEl) wordCountEl.textContent = `${words} words`;

    if (bodyEl) {
      bodyEl.innerHTML = '';
      const paragraphs = sample.split(/\n\s*\n/);
      paragraphs.forEach(p => {
        const trimmed = p.trim();
        if (trimmed) {
          const pEl = document.createElement('p');
          pEl.textContent = trimmed;
          bodyEl.appendChild(pEl);
        }
      });
    }

    if (sampleDraftDialog && !sampleDraftDialog.open) {
      sampleDraftDialog.showModal();
    }
  }

  if (loadSampleDraftBtn) {
    loadSampleDraftBtn.addEventListener('click', openSampleDraftModal);
  }
  if (closeSampleDraftBtn) {
    closeSampleDraftBtn.addEventListener('click', () => sampleDraftDialog?.close());
  }
  if (closeSampleDraftFooterBtn) {
    closeSampleDraftFooterBtn.addEventListener('click', () => sampleDraftDialog?.close());
  }
  if (copySampleDraftBtn) {
    copySampleDraftBtn.addEventListener('click', async () => {
      const prompt = getActivePrompt();
      const sample = prompt.sampleDraft || prompt.modelExcerpt || '';
      if (sample) {
        try {
          await navigator.clipboard.writeText(sample);
          showToast('Sample essay copied to clipboard!');
        } catch {
          showToast('Failed to copy to clipboard.');
        }
      }
    });
  }

  document.getElementById('evaluate-essay-btn').addEventListener('click', handleEvaluateEssay);
  document.getElementById('re-evaluate-btn').addEventListener('click', handleEvaluateEssay);
  document.getElementById('tutor-chat-form').addEventListener('submit', handleTutorChat);

  // Writing Timer
  const timerDisplay = document.getElementById('timer-display');
  const timerToggleBtn = document.getElementById('timer-toggle-btn');
  const timerResetBtn = document.getElementById('timer-reset-btn');

  function formatTimer(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  timerToggleBtn.addEventListener('click', () => {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      timerToggleBtn.textContent = 'Resume';
    } else {
      timerToggleBtn.textContent = 'Pause';
      state.timerInterval = setInterval(() => {
        if (state.timerSeconds > 0) {
          state.timerSeconds -= 1;
          timerDisplay.textContent = formatTimer(state.timerSeconds);
        } else {
          clearInterval(state.timerInterval);
          state.timerInterval = null;
          timerToggleBtn.textContent = 'Start Timer';
          awardXp(25, 'Completed 25-Minute Focused Writing Sprint!');
        }
      }, 1000);
    }
  });

  timerResetBtn.addEventListener('click', () => {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
    state.timerSeconds = 25 * 60;
    timerDisplay.textContent = formatTimer(state.timerSeconds);
    timerToggleBtn.textContent = 'Start Timer';
  });

  // Portfolio & Vocabulary Quiz
  document.getElementById('next-quiz-word-btn').addEventListener('click', renderVocabQuizQuestion);
  document.getElementById('seed-grade-vocab-btn').addEventListener('click', () => {
    const gradeVocab = GRADE_CURRICULUM[state.currentGrade]?.starterVocabulary || [];
    let added = 0;
    gradeVocab.forEach(v => {
      if (!state.vocabVault.some(item => item.word.toLowerCase() === v.word.toLowerCase())) {
        state.vocabVault.unshift({
          word: v.word,
          pos: v.pos,
          definition: v.definition,
          sample: v.sample,
          grade: state.currentGrade,
          mastered: false
        });
        added += 1;
      }
    });
    saveState();
    renderPortfolioView();
    showToast(added > 0 ? `Added ${added} Grade ${state.currentGrade} core words to your Vault!` : `All Grade ${state.currentGrade} core words are already in your Vault.`);
  });

  // Unified Settings Modal Dialog (`showModal()`)
  const settingsDialog = document.getElementById('settings-dialog');
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const apiStatusBtn = document.getElementById('api-status-btn');
  const cloudSyncBtn = document.getElementById('cloud-sync-btn');

  function openSettingsModal() {
    document.getElementById('gemini-api-key-input').value = state.apiKey || '';
    document.getElementById('gemini-model-select').value = normalizeModel(state.model);
    document.getElementById('student-name-input').value = state.studentName || '';
    updateSyncUI();
    if (!settingsDialog.open) {
      settingsDialog.showModal();
    }
  }

  if (openSettingsBtn) {
    openSettingsBtn.addEventListener('click', openSettingsModal);
  }

  if (apiStatusBtn) {
    apiStatusBtn.addEventListener('click', () => {
      openSettingsModal();
      document.getElementById('gemini-api-key-input')?.focus();
    });
  }

  if (cloudSyncBtn) {
    cloudSyncBtn.addEventListener('click', () => {
      openSettingsModal();
      const syncSection = document.getElementById('cloud-sync-section');
      syncSection?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      document.getElementById('sync-code-input')?.focus();
    });
  }

  document.getElementById('close-settings-btn').addEventListener('click', () => settingsDialog.close());
  document.getElementById('cancel-settings-btn').addEventListener('click', () => settingsDialog.close());

  document.getElementById('settings-form').addEventListener('submit', async e => {
    e.preventDefault();
    const enteredKey = document.getElementById('gemini-api-key-input').value.trim();
    const chosenModel = document.getElementById('gemini-model-select').value;
    const studentName = document.getElementById('student-name-input').value.trim();

    if (enteredKey) {
      state.apiKey = enteredKey;
    }
    state.model = chosenModel;
    state.studentName = studentName;
    saveState();
    renderScholarRank();

    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: enteredKey || undefined,
          model: chosenModel
        })
      });
      await syncApiConfig();
    } catch {
      updateApiStatusBadge();
    }

    showToast('Profile & Gemini AI settings saved!');
  });

  // Custom School Prompt Modal (`showModal()`)
  const customPromptDialog = document.getElementById('custom-prompt-dialog');
  document.getElementById('open-custom-prompt-btn').addEventListener('click', () => {
    customPromptDialog.showModal();
  });
  document.getElementById('close-custom-prompt-btn').addEventListener('click', () => customPromptDialog.close());
  document.getElementById('cancel-custom-prompt-btn').addEventListener('click', () => customPromptDialog.close());

  document.getElementById('custom-prompt-form').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('custom-prompt-title').value.trim();
    const genre = document.getElementById('custom-prompt-genre').value;
    const promptText = document.getElementById('custom-prompt-instructions').value.trim();
    if (!title || !promptText) return;

    const newPrompt = {
      id: `custom-${Date.now()}`,
      grade: state.currentGrade,
      genre,
      difficulty: 'Custom Assignment',
      title,
      promptText,
      checklist: GRADE_CURRICULUM[state.currentGrade]?.coreSkills || []
    };

    state.customPrompts.unshift(newPrompt);
    state.selectedPromptId = newPrompt.id;
    saveState();
    customPromptDialog.close();
    document.getElementById('custom-prompt-form').reset();
    renderCurriculumView();
    switchTab('outline');
    showToast(`Created custom Grade ${state.currentGrade} prompt: "${title}"`);
  });

  // Multi-Device Cloud Sync Controls (Inside Unified Settings Dialog)
  const cloudSyncForm = document.getElementById('cloud-sync-form');
  const syncCodeInput = document.getElementById('sync-code-input');
  const generateSyncCodeBtn = document.getElementById('generate-sync-code-btn');
  const manualPushBtn = document.getElementById('manual-push-btn');
  const manualPullBtn = document.getElementById('manual-pull-btn');
  const disconnectSyncBtn = document.getElementById('disconnect-sync-btn');

  if (syncCodeInput) {
    syncCodeInput.addEventListener('input', () => {
      ensureActiveSyncCode();
      updateSyncUI();
    });
  }

  if (generateSyncCodeBtn && syncCodeInput) {
    generateSyncCodeBtn.addEventListener('click', () => {
      const prefixes = ['ALEX', 'QUEST', 'WRITER', 'SCHOLAR', 'ESSAY', 'LEO'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randNum = Math.floor(1000 + Math.random() * 9000);
      syncCodeInput.value = `${prefix}-${randNum}`;
      ensureActiveSyncCode();
      updateSyncUI();
      showToast(`Generated code: ${state.syncCode}`);
    });
  }

  if (cloudSyncForm) {
    cloudSyncForm.addEventListener('submit', async e => {
      e.preventDefault();
      const code = ensureActiveSyncCode();
      if (!code || code.length < 4) {
        showToast('Please enter a valid sync code (at least 4 characters).');
        return;
      }
      updateSyncUI();
      showToast(`Sync code set to "${code}". Click "Push to Cloud" or "Pull from Cloud" to sync manually.`);
    });
  }

  if (manualPushBtn) {
    manualPushBtn.addEventListener('click', () => pushToCloud({ silent: false }));
  }

  if (manualPullBtn) {
    manualPullBtn.addEventListener('click', () => pullFromCloud({ silent: false }));
  }

  if (disconnectSyncBtn) {
    disconnectSyncBtn.addEventListener('click', () => {
      if (confirm('Disconnect this device from cloud sync? Your local draft will stay safe on this device.')) {
        state.syncCode = '';
        state.lastSyncedAt = 0;
        saveState();
        if (syncCodeInput) syncCodeInput.value = '';
        updateSyncUI();
        showToast('Cloud sync disconnected.');
      }
    });
  }

  // Initial Sync UI state (manual sync only — no background auto-pull)
  updateSyncUI();
}

initApp();
