# WritingQuest — Grade 6–12 AI English Writing Tutor

An all-in-one English writing coach and assessment web application covering **Grade 6 through Grade 12**, powered by the **Google Gemini API** (`gemini-3.8-flash` / `gemini-3.8-pro`) with an integrated linguistic coach fallback.

## Key Features

1. **Grade 6–12 Standards-Aligned Curriculum (`public/curriculum.js`)**
   - **Grades 6–8 (Middle School)**: Sensory personal narratives, expository PEEL paragraphs, Claim-Evidence-Reasoning (CER), counterclaims, and high school readiness.
   - **Grades 9–10 (High School Lower)**: Literary analysis with embedded quotation weaving, rhetorical analysis (Ethos, Pathos, Logos), and multi-perspective synthesis.
   - **Grades 11–12 (AP & College Bound)**: AP English Language FRQ argumentation & synthesis, line of reasoning, Common App personal statements, and seminar-level critical essays.
   - **Custom School Assignment Builder**: Add any teacher-assigned prompt or rubric for instant coaching.

2. **Socratic Brainstorming & Architectural Outline Studio**
   - Generates probing Socratic questions, fill-in-the-blank thesis frames, and essay angles without ghostwriting the essay for the student.
   - Provides AI diagnostics on working hooks, thesis statements, body paragraph pillars, and counterarguments.

3. **Smart Drafting Studio**
   - Live writing telemetry: word count vs. grade target, paragraph count, sentence count, average sentence length, and academic transition usage.
   - Click-to-insert Grade-calibrated Academic Phrase & Transition Bank.
   - 25-minute Timed Writing Sprint clock and interactive Socratic AI Tutor chat.

4. **4-Dimension Rubric & Sentence-by-Sentence Critique**
   - Evaluates drafts across 4 dimensions (10 points each, 40 points total + Letter Grade):
     1. *Thesis, Ideas & Content*
     2. *Organization & Transitions*
     3. *Evidence & Analytical Reasoning*
     4. *Sentence Fluency, Diction & Conventions*
   - Inline sentence-by-sentence revisions with **One-Click Apply to Draft** and **Save to Revision Notebook**.
   - Grade-calibrated Vocabulary Power-Ups.

5. **Scholar Growth Portfolio & Interactive Vocabulary Vault**
   - Tracks longitudinal score history, total words written, XP & Scholar Ranks, saved sentence revision patterns, and an interactive Vocabulary Mastery Quiz.

## Quick Start

```bash
npm start
```

Then open `http://localhost:3456` in your browser.

### Configuring Google Gemini API

You can configure your Gemini API key in two ways:
- **In the Web UI**: Click **Set Gemini API Key** in the top-right header bar, paste your key from Google AI Studio, and click **Save Configuration** (automatically persisted to `.env` and browser storage).
- **Via `.env` file**: Copy `.env.example` to `.env` and set `GEMINI_API_KEY=your_api_key_here`.
