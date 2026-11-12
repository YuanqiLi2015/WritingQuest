// Grade 6 to Grade 12 Comprehensive English Writing Curriculum & Prompt Library

export const GRADE_CURRICULUM = {
  6: {
    grade: 6,
    stageBadge: 'Middle School • Foundation',
    title: 'Grade 6: Narrative Voice & Paragraph Architecture',
    subtitle: 'Building sensory narratives, clear topic sentences, and structured PEEL paragraphs.',
    targetWordCount: 300,
    targetWordRange: '250–350 words',
    sentenceLengthTarget: '12–16 words/sentence',
    coreSkills: [
      'PEEL Paragraph Structure (Point, Evidence, Explain, Link)',
      'Show-Don’t-Tell Sensory Imagery (Sight, Sound, Action)',
      'Clear Topic Sentences & Concluding Wrap-Ups',
      'Avoiding Run-on Sentences & Comma Splices'
    ],
    phraseBank: [
      'For instance,',
      'Specifically,',
      'As a result,',
      'In addition,',
      'On the other hand,',
      'This experience taught me that',
      'Most importantly,',
      'Consequently,'
    ],
    starterVocabulary: [
      { word: 'resilient', pos: 'adj.', definition: 'Able to recover quickly from difficult conditions or setbacks.', sample: 'Becoming a resilient learner means treating mistakes as stepping stones.' },
      { word: 'vivid', pos: 'adj.', definition: 'Producing powerful feelings or strong, clear images in the mind.', sample: 'She described her first day at the new school in vivid detail.' },
      { word: 'perspective', pos: 'noun', definition: 'A particular attitude toward or way of regarding something; a point of view.', sample: 'Listening to my teammate changed my perspective on leadership.' }
    ],
    prompts: [
      {
        id: 'g6-narrative-perspective',
        genre: 'Personal Narrative',
        difficulty: 'Core',
        title: 'A Moment That Changed My Perspective',
        promptText: 'Write a personal narrative about a specific moment when you realized something wasn’t what it seemed at first. Use sensory details (what you saw, heard, and felt) to put the reader in the scene, and conclude by reflecting on what this moment taught you.',
        checklist: [
          'Opens with a vivid sensory hook (dialogue, action, or setting)',
          'Organizes events chronologically with clear transition words',
          'Includes at least one moment of internal reflection',
          'Ends with a takeaway explaining how your perspective shifted'
        ],
        modelExcerpt: 'The rusted gate at the edge of Mrs. Gable’s garden always creaked like a warning. For two summers, my friends and I pedaled past her porch as fast as our bicycle chains would allow, convinced she was the neighborhood grumble. That changed on a rainy Tuesday in October when my Labrador slipped his leash and bolted straight through her marigolds...',
        sampleDraft: 'I used to think that learning to play the cello was going to be easy because I already knew how to play the piano. On the first day of orchestra practice, I sat in the front row holding the huge wooden instrument. It felt very heavy and awkward in my hands.\n\nWhen Mr. Rivera asked us to play an open D string, my bow skidded across the bridge and made a loud screeching sound like a startled seagull. My face turned bright red and I wanted to pack up my case and quit right away. I thought I was really bad at string instruments.\n\nAfter class, Mr. Rivera showed me how to relax my right wrist and let the weight of my arm sink into the string. When I pulled the bow across again, a warm, deep note filled the room. That afternoon taught me that struggling at the beginning does not mean you are failing; it means you are starting to grow.'
      },
      {
        id: 'g6-expository-invention',
        genre: 'Expository',
        difficulty: 'Core',
        title: 'How One Everyday Invention Reshaped Human Life',
        promptText: 'Select one everyday invention (such as the printing press, the bicycle, eyeglasses, or the public library) and explain how it transformed daily life for ordinary people. Organize your essay with an introduction, two focused body paragraphs using the PEEL method, and a conclusion.',
        checklist: [
          'Clear thesis statement naming the invention and two key impacts',
          'Each body paragraph begins with a focused topic sentence',
          'Uses concrete historical or real-world facts as evidence',
          'Maintains an informative, objective third-person tone'
        ],
        modelExcerpt: 'Before the invention of affordable eyeglasses in the thirteenth century, millions of skilled craftspeople, scholars, and weavers saw their working lives end as soon as their eyesight dimmed. By bending light through two simple curved lenses, spectacles did far more than sharpen blurry letters—they doubled the creative lifespan of humanity.',
        sampleDraft: 'Many people walk past bicycles every day without thinking twice, but the invention of the modern safety bicycle in the 1880s changed daily life forever. Before bicycles became safe and affordable, most people could only travel as far as they could walk unless they owned an expensive horse. The bicycle gave ordinary citizens freedom of movement and transformed how communities connected.\n\nFirst, the bicycle allowed workers and students to travel much farther in less time. A factory worker or schoolteacher could live several miles away from work and still arrive on time. For instance, paved roads were actually improved in many towns because cyclists campaigned for smoother streets.\n\nIn addition, the bicycle promoted independence and healthier lifestyles. Young people and women gained a reliable way to explore neighboring towns and attend community events on their own. Ultimately, this simple two-wheeled machine proved that smart engineering can make society fairer and more connected.'
      },
      {
        id: 'g6-persuasive-school',
        genre: 'Argumentative',
        difficulty: 'Stretch',
        title: 'A Proposal to Improve Our School Community',
        promptText: 'Write a persuasive essay addressed to your school principal proposing one meaningful change to improve student learning or well-being (for example: a courtyard garden, a 20-minute maker block, or peer tutoring clubs). Support your claim with clear reasons and address one concern the principal might have.',
        checklist: [
          'States a clear, actionable proposal in the introduction',
          'Supports the proposal with at least two distinct, practical benefits',
          'Politely addresses one practical objection (such as cost or schedule time)',
          'Ends with a respectful call to action'
        ],
        modelExcerpt: 'Every day at 12:25 p.m., three hundred sixth graders pour out of the cafeteria carrying surplus unopened apples, milk cartons, and granola bars that end up in plastic trash bins. By establishing a student-run Share Table and courtyard compost station, Oakridge Middle School can cut cafeteria waste in half while teaching hands-on environmental stewardship.',
        sampleDraft: 'Our middle school should create a twenty-minute "Quiet Reading and Reset Block" right after lunch every day. Right now, students rush directly from a noisy cafeteria into their afternoon math and science classes without a moment to calm their minds. Adding a short reading block would improve both focus and reading stamina across Grade 6.\n\nWhen students read a book of their own choice for twenty minutes, their vocabulary and comprehension grow naturally. Furthermore, quiet reading lowers stress after a busy morning so students can pay better attention during afternoon lessons.\n\nSome teachers might worry that a twenty-minute reading block takes away instructional time. However, adding just three minutes to the end of the school day and trimming passing periods by one minute easily covers the time. In the end, calmer and more focused students will learn even more in every class.'
      }
    ]
  },

  7: {
    grade: 7,
    stageBadge: 'Middle School • Developing',
    title: 'Grade 7: Argumentative Claims & Analytical Structure',
    subtitle: 'Crafting debatable thesis statements, addressing counterclaims, and varying sentence syntax.',
    targetWordCount: 380,
    targetWordRange: '320–420 words',
    sentenceLengthTarget: '14–18 words/sentence',
    coreSkills: [
      'Debatable Thesis Statements with Clear Reasons',
      'Addressing & Refuting a Counterclaim',
      'Compound & Complex Sentence Variety (Subordinating Conjunctions)',
      'Comparative & Analytical Transitions'
    ],
    phraseBank: [
      'Although some argue that,',
      'Upon closer examination,',
      'Furthermore, evidence suggests that',
      'In contrast to this view,',
      'Consequently,',
      'This distinction matters because',
      'Notably,',
      'Ultimately, the evidence demonstrates that'
    ],
    starterVocabulary: [
      { word: 'counterproductive', pos: 'adj.', definition: 'Having the opposite of the desired effect.', sample: 'Cramming late at night is counterproductive because sleep deprivation impairs memory.' },
      { word: 'cultivate', pos: 'verb', definition: 'To try to acquire or develop a quality, sentiment, or skill.', sample: 'Team sports cultivate discipline and mutual trust among middle schoolers.' },
      { word: 'dilemma', pos: 'noun', definition: 'A situation in which a difficult choice has to be made between two or more alternatives.', sample: 'The protagonist faces a moral dilemma between loyalty to a friend and honesty.' }
    ],
    prompts: [
      {
        id: 'g7-arg-four-day-week',
        genre: 'Argumentative',
        difficulty: 'Core',
        title: 'Should Middle Schools Adopt a Four-Day School Week?',
        promptText: 'Several school districts have experimented with a four-day school week (Monday through Thursday, with slightly longer school days) to reduce burnout and give students Friday for independent projects, athletics, or rest. Write an argumentative essay taking a clear position on whether middle schools should adopt a four-day week.',
        checklist: [
          'Ends the introduction with a debatable thesis statement',
          'Supports the claim with two distinct evidence-based body paragraphs',
          'Includes a dedicated counterclaim and rebuttal paragraph or section',
          'Uses subordinating conjunctions (Although, While, Because) to vary sentence openings'
        ],
        modelExcerpt: 'While a three-day weekend every week sounds like every seventh grader’s dream, compressing thirty-five hours of learning into four marathon school days creates more exhaustion than relief. Rather than adopting a four-day schedule that stretches classes past 4:30 p.m., middle schools should keep a balanced five-day calendar that protects adolescents’ focus and family routines.',
        sampleDraft: 'Across the country, several school districts have switched to a four-day school week to save money and reduce student stress. Although having every Friday off sounds appealing at first, middle schools should keep a traditional five-day schedule because longer daily hours hurt student concentration and create childcare hardships for working families.\n\nFirst, twelve- and thirteen-year-old students learn best in steady, manageable blocks rather than eight-hour marathon days. To make up for lost Fridays, four-day schools have to add nearly ninety minutes to Monday through Thursday. By 3:30 p.m., most seventh graders are already mentally tired; stretching math and writing past 4:30 p.m. would lead to lower comprehension.\n\nSupporters of the four-day week argue that an extra day off gives students time for rest and hobbies. However, without structured Friday programs, many students spend those unsupervised hours on screens, and working parents struggle to arrange Friday supervision. Ultimately, a well-paced five-day week serves middle school learners best.'
      },
      {
        id: 'g7-lit-moral-dilemma',
        genre: 'Literary Analysis',
        difficulty: 'Core',
        title: 'Courage Under Pressure: Analyzing a Character’s Choice',
        promptText: 'Think of a memorable character from a novel or short story you have read who faces a difficult moral choice. Write a literary analysis essay explaining how the character’s decision reveals their deeper values and advances the central theme of the story.',
        checklist: [
          'Identifies the work, author, character, and thematic claim in the introduction',
          'Avoids mere plot summary by focusing on *why* the character acts',
          'Integrates specific textual moments or details as evidence',
          'Explains what universal human truth the character’s choice illuminates'
        ],
        modelExcerpt: 'True courage rarely announces itself with fanfare; more often, it begins as a quiet refusal to look away. When Jonas in Lois Lowry’s The Giver chooses to bear the painful memories of his community rather than return to comfortable ignorance, Lowry demonstrates that genuine empathy requires willingness to share in others’ suffering.',
        sampleDraft: 'In many stories, a character’s true identity is only revealed when they have to choose between personal safety and helping someone else. When a protagonist risks their own comfort to stand up for an outsider, their choice shows how empathy can overcome fear.\n\nAt the beginning of the story, the main character wants nothing more than to blend in with the popular crowd in the seventh-grade hallway. However, when he witnesses his classmates mocking a new student’s accent during lunch, he faces a sharp moral dilemma. Stay silent and protect his social standing, or speak up and risk becoming a target himself.\n\nBy choosing to sit beside the new student and invite him into his science lab group, the protagonist discovers that self-respect matters more than approval from bullies. Through this turning point, the author shows readers that integrity is built in small, everyday acts of courage.'
      },
      {
        id: 'g7-narrative-comfort-zone',
        genre: 'Personal Narrative',
        difficulty: 'Stretch',
        title: 'Stepping Outside My Comfort Zone',
        promptText: 'Write a vivid narrative about a time you volunteered for—or were pushed into—an unfamiliar challenge where success was uncertain. Use dialogue, pacing, and sensory language to build tension and reveal how the experience reshaped your confidence.',
        checklist: [
          'Uses purposeful pacing to slow down at the climax of the experience',
          'Includes properly punctuated dialogue that reveals personality or tension',
          'Replaces generic adjectives ("scary", "nice") with concrete verbs and imagery',
          'Connects the opening hook to the final reflective insight'
        ],
        modelExcerpt: '"Next debate speaker to the podium—affirmative side, three minutes," the timekeeper called out. My index cards trembled so hard against my palm that the bullet points blurred into blue stripes.',
        sampleDraft: '"Are you sure you want to enter the 400-meter freestyle?" Coach Morales asked, glancing up from her clipboard at the crowded pool deck. The water smelled sharply of chlorine, and the echoing whistles of the starter referee made my stomach flip. Until that Saturday meet, I had never raced anything longer than a 100-meter sprint.\n\nWhen the buzzer sounded, I dove in cleanly, matching the fast pace of the swimmer in Lane 4. For the first four laps, my lungs felt strong. By lap ten, however, my shoulders burned like lead weights and every breath felt too short. I wanted to grab the lane line and stop.\n\nInstead, I focused on counting four strokes per breath, one wall at a time. Touching the final touchpad in fourth place, I realized I had swum sixteen continuous laps faster than I ever thought possible. Stepping outside my comfort zone taught me that endurance is as much a mental habit as a physical one.'
      }
    ]
  },

  8: {
    grade: 8,
    stageBadge: 'Middle School • Capstone',
    title: 'Grade 8: Evidence-Based CER & High School Readiness',
    subtitle: 'Mastering Claim-Evidence-Reasoning (CER), nuanced thesis statements, and formal academic register.',
    targetWordCount: 450,
    targetWordRange: '400–500 words',
    sentenceLengthTarget: '15–20 words/sentence',
    coreSkills: [
      'Nuanced Thesis Statements (Concession + Claim + Reasoning)',
      'CER Framework (Claim, Specific Evidence, Analytical Reasoning)',
      'Formal Academic Tone & Precision Diction',
      'Refuting Counterarguments with Evidence'
    ],
    phraseBank: [
      'While it is undeniably true that,',
      'This evidence underscores how',
      'Beyond the immediate effects,',
      'Critics of this approach contend that',
      'However, this perspective overlooks',
      'Consequently, a closer analysis reveals',
      'From a broader societal standpoint,',
      'Thus, the correlation between'
    ],
    starterVocabulary: [
      { word: 'ubiquitous', pos: 'adj.', definition: 'Present, appearing, or found everywhere.', sample: 'Smartphones have become ubiquitous in modern middle and high schools.' },
      { word: 'mitigate', pos: 'verb', definition: 'To make less severe, serious, or painful.', sample: 'Clear digital boundaries can mitigate the distraction of social notifications.' },
      { word: 'catalyst', pos: 'noun', definition: 'A person or thing that precipitates an event or significant change.', sample: 'The tournament defeat served as a catalyst for our team’s renewed work ethic.' }
    ],
    prompts: [
      {
        id: 'g8-arg-social-media',
        genre: 'Argumentative',
        difficulty: 'Core',
        title: 'Does Social Media Strengthen or Weaken Teen Friendships?',
        promptText: 'Digital platforms allow adolescents to stay in constant contact across distances, yet researchers also warn that curated feeds and streak culture can replace genuine face-to-face connection. Write a nuanced argumentative essay evaluating whether social media ultimately strengthens or weakens teen friendships.',
        checklist: [
          'Opens with a nuanced thesis using a concession clause ("While..., ultimately...")',
          'Applies the CER (Claim-Evidence-Reasoning) framework in every body paragraph',
          'Distinguishes between passive scrolling and active communication',
          'Maintains an objective, academic tone free of slang'
        ],
        modelExcerpt: 'Although social media platforms bridge geographic distance and help shy adolescents find niche communities, the algorithmic design of modern feeds ultimately weakens the depth of teen friendships by substituting performative metrics—such as streaks and likes—for vulnerable, unscripted conversation.',
        sampleDraft: 'Today, nearly every eighth grader carries a digital town square in their pocket. While social media apps allow teenagers to share updates instantly and stay in touch with friends who move away, an overreliance on digital platforms ultimately weakens teen friendships by replacing authentic conversation with superficial metrics.\n\nFirst, algorithm-driven features turn friendship into a public scoreboard. On apps built around daily streaks and view counts, adolescents often message ten people a single word just to keep a number alive rather than asking how a friend is truly feeling. Consequently, communication becomes a chore focused on maintaining streaks instead of building empathy.\n\nFurthermore, texting removes vocal tone and facial expressions, which makes misunderstandings escalate quickly. Admittedly, online group chats can help shy students bond over shared hobbies like coding or music. However, when screen time crowds out unscripted, face-to-face time after school, teens lose the practice needed to navigate real-world disagreements. To preserve deep friendships, adolescents must treat digital tools as a bridge to in-person connection, not a replacement for it.'
      },
      {
        id: 'g8-lit-setting-conflict',
        genre: 'Literary Analysis',
        difficulty: 'Core',
        title: 'More Than a Backdrop: How Setting Shapes Conflict and Theme',
        promptText: 'In strong literature, the setting is never merely decorative; it actively pressures characters and shapes the central conflict. Choose a novel or short story and analyze how the author uses physical, historical, or social setting to drive the protagonist’s struggle and illuminate the work’s theme.',
        checklist: [
          'Treats setting as an active force rather than a static stage',
          'Embeds brief, precise textual details smoothly into analytical sentences',
          'Provides at least two sentences of reasoning for every piece of evidence',
          'Links the physical environment to the psychological or moral shift in the character'
        ],
        modelExcerpt: 'In Ray Bradbury’s "All Summer in a Day," the relentless seven-year rainstorm on Venus is far more than meteorological scenery; it acts as an oppressive psychological force that erodes the children’s empathy and turns Margot’s memory of the sun into a source of unbearable envy.',
        sampleDraft: 'In literature, an author’s choice of setting often acts like an invisible character that pushes the protagonist toward a decisive test. When an environment is isolated, harsh, or rigidly controlled, it magnifies internal doubts and forces characters to reveal who they truly are.\n\nFor instance, in stories set in dystopian or tightly monitored communities, the uniformity of the streets and schedules reflects society’s fear of individuality. Every grey building and curfew bell reminds the protagonist that questioning rules carries a high cost. Because the physical environment leaves nowhere to hide, even a small act of curiosity—such as keeping a forbidden journal—becomes an act of rebellion.\n\nMoreover, when the protagonist finally steps beyond the boundary of that restrictive setting, the shift in landscape mirrors their internal awakening. By contrasting a claustrophobic town with an unpredictable natural wilderness, the author underscores the theme that genuine freedom requires accepting uncertainty.'
      },
      {
        id: 'g8-expo-environmental-habits',
        genre: 'Expository',
        difficulty: 'Stretch',
        title: 'The Hidden Ripple Effect of Everyday Consumer Choices',
        promptText: 'From fast fashion to single-use electronics packaging, small daily conveniences often carry unseen global footprints. Write an investigative expository essay examining the cause-and-effect chain behind one everyday consumer habit and explaining how informed choices can mitigate its impact.',
        checklist: [
          'Traces a clear cause-and-effect chain from individual habit to global impact',
          'Uses domain-specific vocabulary accurately (e.g., lifecycle, supply chain, mitigation)',
          'Balances problem analysis with realistic, evidence-based solutions',
          'Maintains cohesive transitions between macro statistics and everyday actions'
        ],
        modelExcerpt: 'A ten-dollar cotton t-shirt purchased on a Saturday afternoon appears effortless on the store rack, yet its journey from irrigated fields to textile dyehouses consumes roughly 2,700 liters of freshwater—enough for one person to drink for two and a half years.',
        sampleDraft: 'Every trend cycle, millions of inexpensive garments fill shopping mall racks under the business model known as fast fashion. While ultra-cheap clothing allows consumers to update their wardrobes every month, the hidden environmental cost of rapid textile production damages water ecosystems and accelerates landfill waste.\n\nThe environmental footprint begins long before a shirt reaches a hanger. Producing conventional cotton requires vast quantities of freshwater and synthetic pesticides, while dyeing synthetic fabrics like polyester releases microfibers into rivers. Because fast-fashion items are stitched cheaply to match fleeting online trends, the average garment is worn fewer than ten times before being discarded.\n\nFortunately, consumers and communities can mitigate this cycle through deliberate habits. Choosing durable basics, organizing school clothing swaps, and repairing torn seams extend the lifecycle of each garment by years. When young consumers prioritize longevity over impulse trends, they send a powerful signal that sustainability matters.'
      }
    ]
  },

  9: {
    grade: 9,
    stageBadge: 'High School • Freshman',
    title: 'Grade 9: Literary Analysis & Thesis-Driven Rhetoric',
    subtitle: 'Transitioning to high school analytical essays, seamless quotation weaving, and rhetorical precision.',
    targetWordCount: 500,
    targetWordRange: '450–550 words',
    sentenceLengthTarget: '16–22 words/sentence',
    coreSkills: [
      'Seamless Quotation Weaving (Context + Embedded Quote + Warrant)',
      'Analytical Commentary Over Plot Summary (The 2:1 Ratio)',
      'Concession & Rebuttal Architecture in Argumentation',
      'Eliminating Passive Voice & Wordiness'
    ],
    phraseBank: [
      'Far from being a mere coincidence,',
      'By juxtaposing these two moments,',
      'While proponents of this policy emphasize,',
      'Beneath this surface justification lies',
      'Consequently, the author exposes',
      'In doing so, the text challenges the assumption that',
      'More specifically,',
      'Ultimately, this tension reveals'
    ],
    starterVocabulary: [
      { word: 'hubris', pos: 'noun', definition: 'Excessive pride or self-confidence that leads a protagonist to disregard limits.', sample: 'Odysseus’s hubris when taunting Polyphemus brings Poseidon’s wrath upon his crew.' },
      { word: 'ambivalent', pos: 'adj.', definition: 'Having mixed feelings or contradictory ideas about something or someone.', sample: 'Many educators remain ambivalent about unmonitored AI tools in ninth-grade classrooms.' },
      { word: 'exemplify', pos: 'verb', definition: 'To serve as a typical or illuminating example of a broader principle.', sample: 'Atticus Finch’s quiet cross-examination exemplifies moral steadfastness under social pressure.' }
    ],
    prompts: [
      {
        id: 'g9-lit-tragic-flaw',
        genre: 'Literary Analysis',
        difficulty: 'Core',
        title: 'Ambition, Hubris, or Awakening: Analyzing Character Complexity',
        promptText: 'High school literature moves beyond simple heroes and villains to explore morally complex characters. Select a protagonist from a work of literature (such as The Odyssey, Romeo and Juliet, Of Mice and Men, To Kill a Mockingbird, or another class text) and analyze how an internal flaw or competing loyalty drives the central tragedy or awakening of the work.',
        checklist: [
          'Opens with a conceptual hook and a thesis that argues *how* character complexity shapes theme',
          'Weaves short phrases or quotes naturally into your own grammatical sentence structure',
          'Unpacks specific word choices (diction) or imagery rather than retelling plot events',
          'Uses literary present tense consistently throughout the essay'
        ],
        modelExcerpt: 'In Homer’s Odyssey, Odysseus’s greatest threat is not the one-eyed giant blocking the cave entrance, but his own hunger for immortal renown. When he shouts his true name across the churning waves—"tell him Odysseus, raider of cities, took your eye"—his heroic cleverness curdles into hubris, demonstrating that unchecked pride endangers the very community a leader swears to protect.',
        sampleDraft: 'Great literature rarely presents heroes who are entirely flawless; instead, authors use a protagonist’s internal contradictions to expose deeper truths about human nature. When a character’s admirable determination crosses the line into stubborn pride, their downfall warns readers how easily strength can become a liability.\n\nEarly in the narrative, the protagonist relies on quick wit and confidence to rescue companions from seemingly impossible traps. However, success breeds a dangerous sense of invulnerability. Rather than escaping quietly once safety is secured, the hero insists on boasting to the defeated adversary so that future generations will sing of the victory. This pivotal lapse in judgment transforms a strategic triumph into a prolonged curse.\n\nBy tracing the costly consequences of that single boast, the author illustrates that true leadership requires humility alongside courage. Only after enduring years of loss does the protagonist learn that protecting one’s people matters far more than burnishing one’s personal legend.'
      },
      {
        id: 'g9-arg-ai-classrooms',
        genre: 'Argumentative',
        difficulty: 'Core',
        title: 'Should Generative AI Tools Be Permitted in High School Classrooms?',
        promptText: 'As generative AI becomes widely accessible, high schools are divided: some ban AI tools entirely to protect foundational thinking skills, while others integrate AI as a Socratic tutor and research partner. Write a well-reasoned argumentative essay defending a clear policy on how high schools should handle AI in the classroom.',
        checklist: [
          'Establishes a qualified, nuanced thesis (avoiding simplistic "all good" or "all bad" extremes)',
          'Distinguishes clearly between cognitive offloading (ghostwriting) and Socratic scaffolding',
          'Concedes the strongest valid concern of the opposing side before refuting it',
          'Proposes concrete guardrails that align with educational goals'
        ],
        modelExcerpt: 'Banning artificial intelligence from high school classrooms altogether prepares students for a world that no longer exists, yet allowing unrestricted use risks atrophying the very cognitive muscles adolescence is meant to build. High schools should adopt a guided-inquiry policy that permits AI for Socratic brainstorming and rubric feedback while strictly prohibiting AI-generated prose.',
        sampleDraft: 'When pocket calculators first entered high school math classes in the 1970s, teachers feared students would forget how to reason with numbers. Today, generative artificial intelligence sparks an even sharper debate in English and history departments. While unrestricted AI use can tempt students to bypass the hard work of thinking, high schools should not impose blanket bans; instead, they should permit AI strictly as a Socratic feedback coach while prohibiting AI-generated drafting.\n\nWriting is not merely a way to record finished thoughts—it is the process through which students discover what they actually think. When a ninth grader wrestles with an awkward thesis sentence, that productive struggle builds analytical pathways in the brain. If a student asks a chatbot to write an essay from scratch, they lose that cognitive growth.\n\nHowever, completely outlawing AI ignores its value as an individualized tutor. Not every student has access to a private writing coach at 8:00 p.m. to ask why a transition feels abrupt or whether a counterclaim is convincing. By training students to use AI for diagnostic questions and rubric critiques while requiring in-class or version-tracked drafting, schools can safeguard academic integrity while preparing graduates for a technological future.'
      },
      {
        id: 'g9-narrative-mentor',
        genre: 'Personal Narrative',
        difficulty: 'Stretch',
        title: 'An Unlikely Teacher: A Lesson Learned Outside the Classroom',
        promptText: 'Some of our most enduring lessons come from unexpected mentors—a younger sibling, a quiet grandparent, a tough coach, or even a mistake made while working on a project. Write a reflective narrative essay that brings a specific scene to life and explores the subtle wisdom you gained.',
        checklist: [
          'Uses contrast or juxtaposition between initial assumptions and final insight',
          'Crafts figurative language (metaphor, simile, personification) with restraint and originality',
          'Varies sentence length deliberately—using short sentences for impact and longer sentences for reflection',
          'Concludes with thematic resonance rather than a cliché moral'
        ],
        modelExcerpt: 'My grandfather never owned a measuring tape that still had numbers on the first three inches, yet every dovetail joint in his garage workshop slid together with the hush of a closing vault.',
        sampleDraft: 'My ten-year-old brother Leo speaks in quiet observations rather than loud announcements, which meant that for most of my freshman year, I barely listened to his advice. I assumed that being four years older automatically made me the expert on everything from bike repairs to time management.\n\nThat illusion fell apart on the Sunday night before my ninth-grade biology fair. Surrounded by crumpled poster board and half-printed graphs, I was furiously re-gluing headers that refused to sit straight. Leo leaned against my doorframe, watching me mutter at a ruler. "You’re measuring from the edge of the table instead of the edge of the paper," he said softly.\n\nI froze, ruler in hand. He was right; the table had a beveled rim that threw every measurement off by quarter of an inch. Sitting on the carpet beside him as we re-aligned the grid together, I realized how often impatience blinds us to simple truths right in front of us—and how wisdom has very little to do with age.'
      }
    ]
  },

  10: {
    grade: 10,
    stageBadge: 'High School • Sophomore',
    title: 'Grade 10: Rhetorical Analysis & Multi-Perspective Synthesis',
    subtitle: 'Analyzing ethos, pathos, and logos, synthesizing competing sources, and mastering parallel syntax.',
    targetWordCount: 550,
    targetWordRange: '480–600 words',
    sentenceLengthTarget: '17–23 words/sentence',
    coreSkills: [
      'Rhetorical Triangle Analysis (Ethos, Pathos, Logos & Kairos)',
      'Synthesizing Multiple Viewpoints into a Cohesive Line of Reasoning',
      'Parallel Structure, Antithesis, and Purposeful Subordination',
      'Analyzing Authorial Tone, Diction, and Syntax Choices'
    ],
    phraseBank: [
      'By anchoring the argument in shared civic values,',
      'This rhetorical shift from empirical data to personal testimony',
      'While both perspectives acknowledge the urgency of,',
      'Crucially, the speaker’s use of parallel syntax reinforces',
      'Rather than framing the issue as a zero-sum conflict,',
      'This concession strengthens the author’s credibility by',
      'Viewed through this lens,',
      'Ultimately, the synthesis of these competing priorities suggests'
    ],
    starterVocabulary: [
      { word: 'juxtaposition', pos: 'noun', definition: 'The fact of two things being seen or placed close together with contrasting effect.', sample: 'The speaker’s juxtaposition of wartime austerity with future prosperity galvanized the audience.' },
      { word: 'pragmatic', pos: 'adj.', definition: 'Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.', sample: 'A pragmatic policy balances technological innovation with consumer privacy safeguards.' },
      { word: 'corroborate', pos: 'verb', definition: 'To confirm or give support to a statement, theory, or finding.', sample: 'Independent longitudinal studies corroborate the link between green spaces and mental health.' }
    ],
    prompts: [
      {
        id: 'g10-rhetoric-speech',
        genre: 'Rhetorical Analysis',
        difficulty: 'Core',
        title: 'The Architecture of Persuasion: Rhetorical Analysis of a Speech',
        promptText: 'Select a notable historical or contemporary speech or persuasive essay (or analyze the provided rhetorical scenario on civic responsibility and exploration). Write a rhetorical analysis examining how the speaker uses specific rhetorical choices—such as juxtaposition, appeals to shared values (ethos), emotional resonance (pathos), and logical structure (logos)—to move a skeptical audience toward action.',
        checklist: [
          'Identifies the rhetorical situation (Speaker, Audience, Exigence, Purpose) in the introduction',
          'Focuses on *rhetorical choices* (verbs like juxtaposes, concedes, amplifies) rather than just listing devices',
          'Explains *why* each choice is persuasive to the specific target audience',
          'Traces how the argument evolves from opening hook to final call to action'
        ],
        modelExcerpt: 'Facing a public skeptical of investing billions in deep-space exploration while domestic cities face economic strain, the speaker avoids dismissive lecturing. Instead, by opening with a concession to everyday fiscal anxieties before juxtaposing the cost of a single satellite with the medical breakthroughs it yields on Earth, the address transforms spaceflight from an abstract luxury into a pragmatic civic necessity.',
        sampleDraft: 'Persuading a divided audience requires more than assembling a list of statistics; a skilled speaker must align their proposal with the audience’s deepest values. In addressing skeptical citizens who question the value of public arts funding during tight budget years, the speaker constructs a compelling case by blending pragmatic economic logic with an appeal to shared community identity.\n\nFirst, the speaker establishes credibility by openly acknowledging the audience’s financial concerns. Rather than dismissing taxpayers who prioritize roads and hospitals, the opening paragraph validates fiscal responsibility. This strategic concession disarms resistance and positions the speaker as a reasonable steward of public resources.\n\nHaving earned the audience’s trust, the speaker pivots using sharp juxtaposition—contrasting a shuttered downtown theater with a vibrant evening street where local restaurants thrive alongside student performances. By linking cultural programs directly to small-business vitality and youth mentorship, the speech reframes the arts not as a decorative expense, but as an engine of civic renewal.'
      },
      {
        id: 'g10-synthesis-privacy',
        genre: 'Argumentative',
        difficulty: 'Core',
        title: 'Convenience vs. Autonomy: Balancing Smart Technology and Personal Privacy',
        promptText: 'From biometric school IDs to predictive health wearables and smart city sensors, data-driven systems promise safety and efficiency at the cost of continuous data collection. Write a synthesis-style argumentative essay examining where society should draw the boundary between technological convenience and individual privacy.',
        checklist: [
          'Frames the core tension between collective efficiency/safety and individual autonomy',
          'Evaluates concrete scenarios where data collection is beneficial vs. intrusive',
          'Establishes clear ethical criteria (such as informed consent, transparency, and data minimization)',
          'Uses parallel structure and varied transitions to connect complex ideas'
        ],
        modelExcerpt: 'Convenience is the quietest currency in modern life: we trade our location history for faster traffic routes, our biometric patterns for instant unlocking, and our reading habits for curated recommendations. While data-driven systems undeniably enhance public safety and medical diagnostics, democratic institutions must enforce strict opt-in transparency and data minimization so that efficiency never erodes human autonomy.',
        sampleDraft: 'Every day, modern citizens make invisible bargains with technology: we trade location data for real-time transit routing, biometric scans for faster boarding, and browsing histories for personalized recommendations. While smart systems offer undeniable gains in medical prevention and public safety, society must establish strict boundaries around informed consent and data minimization lest convenience quietly erodes personal autonomy.\n\nOn one hand, aggregated data can solve problems no individual could tackle alone. Wearable health monitors can detect irregular heart rhythms days before a patient feels symptoms, and smart traffic grids reduce urban emissions. In these contexts, carefully anonymized data serves the public good.\n\nHowever, the calculus shifts dramatically when data collection becomes mandatory, opaque, or permanent. When schools or employers track biometric attention metrics or sell behavioral profiles to third-party brokers, individuals begin to self-censor out of fear of constant surveillance. Therefore, the ethical boundary must rest on three pillars: explicit opt-in consent, strict prohibition of secondary data resale, and the right to erase personal records.'
      },
      {
        id: 'g10-lit-individual-society',
        genre: 'Literary Analysis',
        difficulty: 'Stretch',
        title: 'The Individual vs. The Collective: Comparative Literary Analysis',
        promptText: 'Across world literature, authors repeatedly return to the friction between individual conscience and societal conformity. Analyze how a literary work explores the cost of standing apart from the crowd—and whether the text ultimately portrays nonconformity as liberating, tragic, or both.',
        checklist: [
          'Articulates a sophisticated thematic thesis that captures moral ambiguity',
          'Analyzes symbolic objects, recurring motifs, or structural shifts in the text',
          'Avoids moralizing clichés by grounding every claim in textual nuance',
          'Demonstrates syntactic maturity through appositives and participial phrases'
        ],
        modelExcerpt: 'Conformity offers a seductive shelter: so long as an individual echoes the chorus of the town, they are spared the burden of moral accountability. Yet as the narrative reveals through its recurring imagery of locked shutters and whispered verdicts, the price of that shelter is the slow erosion of the self.',
        sampleDraft: 'Human beings are wired both for belonging and for self-determination, a paradox that lies at the heart of enduring literature. When a society demands unquestioning conformity as the price of security, the individual who listens to their own conscience faces an agonizing choice between social exile and spiritual compromise.\n\nThroughout the narrative, the author uses the motif of public ceremonies and uniform dress to illustrate how collective rituals suppress independent thought. Characters who repeat approved slogans are rewarded with comfort and status, yet their conversations remain hollow and guarded. In contrast, the protagonist’s quiet refusal to participate—initially sparked by a single unanswered question—exposes the fragility of the community’s consensus.\n\nCrucially, the author refuses to romanticize rebellion as effortless triumph. Standing apart costs the protagonist friendships, certainty, and peace of mind. Nevertheless, by juxtaposing the protagonist’s hard-won clarity with the townspeople’s anxious conformity, the work affirms that authentic moral agency is worth the loneliness it sometimes demands.'
      }
    ]
  },

  11: {
    grade: 11,
    stageBadge: 'High School • AP & Junior Rigor',
    title: 'Grade 11: AP English Language, Line of Reasoning & Stylistic Maturity',
    subtitle: 'Mastering AP Lang FRQ argumentation, synthesis, rhetorical sophistication, and syntactic control.',
    targetWordCount: 600,
    targetWordRange: '520–680 words',
    sentenceLengthTarget: '18–24 words/sentence',
    coreSkills: [
      'Sustained Line of Reasoning & Faultless Logical Transitions',
      'AP-Style Qualification, Concession, and Nuanced Refutation',
      'Deploying Specific Historical, Literary, and Contemporary Evidence',
      'Rhetorical Sophistication: Subordination, Periodic Sentences & Modifiers'
    ],
    phraseBank: [
      'To reduce this complex phenomenon to a binary choice is to overlook',
      'History repeatedly demonstrates that when institutions prioritize',
      'Granted, stability requires a baseline of shared norms; nevertheless,',
      'This distinction between constructive dissent and reckless defiance',
      'Corroborating this principle in the contemporary sphere,',
      'Far from undermining social cohesion, principled questioning',
      'Consequently, the decisive criterion is not whether,',
      'In the final analysis,'
    ],
    starterVocabulary: [
      { word: 'recalcitrant', pos: 'adj.', definition: 'Having an obstinately uncooperative attitude toward authority or discipline.', sample: 'What entrenched institutions dismiss as recalcitrant behavior is often the first spark of moral reform.' },
      { word: 'ephemeral', pos: 'adj.', definition: 'Lasting for a very short time; transitory.', sample: 'Viral outrage is often ephemeral, whereas institutional reform requires sustained civic commitment.' },
      { word: 'catalyze', pos: 'verb', definition: 'To cause or accelerate a significant transformation or action.', sample: 'Principled dissent has repeatedly catalyzed the expansion of constitutional rights.' }
    ],
    prompts: [
      {
        id: 'g11-ap-disobedience',
        genre: 'AP Open Argument',
        difficulty: 'AP Level',
        title: 'AP Lang Argument: The Role of Principled Dissent in Human Progress',
        promptText: 'In 1891, Irish author Oscar Wilde observed, "Disobedience, in the eyes of anyone who has read history, is man’s original virtue. It is through disobedience that progress has been made." Write an essay that argues your position on the extent to which Wilde’s claim about disobedience and progress is valid. Use specific evidence from your reading, history, or contemporary observation to establish a sustained line of reasoning.',
        checklist: [
          'Establishes a defensible, qualified thesis that defines the conditions under which dissent drives progress',
          'Supports claims with concrete, specific historical, scientific, or literary evidence (not vague generalizations)',
          'Develops a clear Line of Reasoning where each paragraph builds logically upon the previous one',
          'Demonstrates AP Sophistication Point qualities: nuance, tension exploration, and vivid rhetorical style'
        ],
        modelExcerpt: 'Unbridled defiance for its own sake fractures the social contract, yet history confirms that institutions rarely correct their own blind spots voluntarily. Oscar Wilde’s assertion rings profoundly true when "disobedience" is understood not as lawless impulse, but as principled dissent—the willingness of individuals, from Galileo Galilei to the Greensboro lunch-counter students, to challenge orthodoxy in service of a higher empirical or moral truth.',
        sampleDraft: 'Social order depends on shared laws, which makes obedience feel like the foundation of civilization. Yet as Oscar Wilde observed, history rarely advances through comfortable consensus alone. While reckless defiance can destabilize communities, Wilde’s claim holds profound validity when disobedience takes the form of principled, conscience-driven dissent against unjust laws or stagnant scientific dogma.\n\nIn the realm of civic justice, entrenched power structures almost never reform themselves without external friction. When Rosa Parks and the organizers of the 1955 Montgomery Bus Boycott refused to comply with municipal segregation ordinances, critics labeled their actions disruptive to public order. Yet by peacefully violating an unjust statute while accepting legal consequences, they exposed the moral contradiction between American constitutional ideals and Jim Crow reality—catalyzing the Civil Rights Act.\n\nSimilarly, intellectual progress requires the courage to disobey prevailing orthodoxy. Had Ignaz Semmelweis quietly deferred to nineteenth-century medical authorities who mocked his insistence on handwashing in Vienna hospitals, antiseptic medicine would have been delayed for decades. Admittedly, society cannot function if citizens disregard traffic laws or public safety norms at whim. The decisive boundary lies in purpose: self-serving lawlessness erodes community, whereas principled disobedience—anchored in evidence and human dignity—remains humanity’s indispensable engine of progress.'
      },
      {
        id: 'g11-ap-synthesis-third-places',
        genre: 'AP Synthesis',
        difficulty: 'AP Level',
        title: 'AP Synthesis: The Future of Public Libraries and Civic "Third Places"',
        promptText: 'Sociologist Ray Oldenburg coined the term "third places" to describe public spaces outside of home (first place) and work/school (second place) where people gather across socioeconomic lines without being required to spend money. In an era of digital streaming, e-books, and commercialized urban spaces, evaluate what role public libraries and physical third places should play in twenty-first-century communities.',
        checklist: [
          'Synthesizes economic, technological, and civic perspectives into an original thesis',
          'Avoids nostalgia by addressing how physical spaces must adapt to digital realities',
          'Weighs municipal budget trade-offs against long-term social capital',
          'Uses sophisticated transitions that highlight causal and comparative relationships'
        ],
        modelExcerpt: 'If a public library were merely a warehouse for paperbacks, the rise of instant digital downloads would indeed render its brick-and-mortar branches obsolete. Yet reducing libraries to book circulation misunderstands their deepest civic function: as one of the last non-commercial "third places" in modern life, the contemporary library serves as vital social infrastructure that bridges the digital divide and combats epidemic isolation.',
        sampleDraft: 'In an age when millions of texts can be downloaded onto a tablet in seconds, critics periodically question why municipalities continue to fund brick-and-mortar public libraries. However, viewing the library merely as a warehouse for paper books mistakes its inventory for its mission. In the twenty-first century, physical libraries and civic "third places" are more indispensable than ever because they provide non-commercial community infrastructure, bridge socioeconomic digital divides, and counter the isolation of algorithmic life.\n\nMost modern urban spaces require an admission ticket: even sitting in a coffee shop demands a six-dollar purchase. Public libraries remain one of the rare democratic sanctuaries where a retired citizen, a high school student studying for AP exams, and an entrepreneur seeking broadband access share the same table as equals. By removing financial barriers to knowledge and gathering, libraries cultivate trust across generational and economic lines.\n\nFurthermore, rather than competing with digital technology, modern libraries democratize access to it—offering 3D printers, quiet telehealth booths, and media literacy workshops. While municipal budgets must always weigh costs carefully, defunding physical third places is a false economy that erodes the civic fabric holding communities together.'
      },
      {
        id: 'g11-rhetoric-irony-commentary',
        genre: 'Rhetorical Analysis',
        difficulty: 'Stretch',
        title: 'Satire, Irony, and Juxtaposition in Social Criticism',
        promptText: 'When direct condemnation fails to pierce public apathy, writers often turn to irony, understatement, or sharp juxtaposition to expose hypocrisy. Analyze how a writer or essayist deploys ironic contrast and tone to compel readers to confront an uncomfortable societal truth.',
        checklist: [
          'Distinguishes between the surface persona/tone and the underlying moral critique',
          'Analyzes how specific syntactic patterns (such as understatement or periodic sentences) create ironic tension',
          'Explains why indirect satire can disarm a defensive audience more effectively than direct lecturing',
          'Maintains analytical precision throughout'
        ],
        modelExcerpt: 'Direct moral scolding often invites an audience to raise its shields; irony, by contrast, slips past the reader’s defenses disguised as polite agreement before springing its trap.',
        sampleDraft: 'When an audience has grown numb to familiar moral lectures, a writer who shouts louder rarely succeeds in changing minds. Instead, skilled social critics often turn to irony and controlled understatement—adopting a calm, seemingly reasonable tone to describe an absurd reality until the reader is forced to recognize the contradiction for themselves.\n\nBy juxtaposing polished corporate euphemisms with the stark human cost they conceal, the essayist exposes how language can be weaponized to dull empathy. Rather than declaring outright that an institution is callous, the author simply places its cheerful press release side by side with the lived experience of ordinary workers. This structural contrast allows the evidence to indict the policy without the writer sounding shrill.\n\nUltimately, ironic juxtaposition transforms the reader from a passive spectator into an active judge. Because the audience must mentally bridge the gap between what is said and what is meant, the resulting insight feels self-discovered—and therefore far harder to dismiss.'
      }
    ]
  },

  12: {
    grade: 12,
    stageBadge: 'High School • Senior & College Bound',
    title: 'Grade 12: College Application Essays & Capstone Academic Prose',
    subtitle: 'Crafting authentic Common App personal statements, philosophical arguments, and university-ready style.',
    targetWordCount: 650,
    targetWordRange: '550–650 words (Common App Standard)',
    sentenceLengthTarget: '18–25 words/sentence',
    coreSkills: [
      'Common App Narrative Arc: Concrete Micro-Scene → Intellectual Curiosity → Reflection',
      'Authentic Voice, Vulnerability & Avoiding Admissions Clichés',
      'Philosophical & Interdisciplinary Argumentation',
      'Publication-Ready Stylistic Polish, Rhythm & Cadence'
    ],
    phraseBank: [
      'What initially appeared to be a contradiction revealed itself as',
      'Beneath the mechanics of this craft lies a deeper question:',
      'Paradoxically, the constraint itself became the catalyst for',
      'To interrogate this assumption is to recognize that',
      'Rather than seeking tidy resolution,',
      'In retrospect, that unscripted failure taught me how to',
      'This interplay between precision and improvisation',
      'Ultimately, intellectual vitality begins where certainty ends'
    ],
    starterVocabulary: [
      { word: 'serendipity', pos: 'noun', definition: 'The occurrence and development of events by chance in a happy or beneficial way.', sample: 'Scientific breakthroughs often emerge from the intersection of rigorous preparation and serendipity.' },
      { word: 'paradigm', pos: 'noun', definition: 'A typical example, pattern, or foundational framework of thought.', sample: 'Viewing failure as diagnostic data rather than personal defeat shifted my entire learning paradigm.' },
      { word: 'ineffable', pos: 'adj.', definition: 'Too great or extreme to be expressed or described in words.', sample: 'Music captures the ineffable nuances of grief and hope where ordinary speech falls short.' }
    ],
    prompts: [
      {
        id: 'g12-common-app-identity',
        genre: 'College Essay (Common App)',
        difficulty: 'Capstone',
        title: 'Common App Personal Statement: The Craft, Curiosity, or Corner of the World That Shaped You',
        promptText: 'Some students have a background, identity, interest, or talent that is so meaningful they believe their application would be incomplete without it. Or recount a time when you faced a challenge, setback, or failure. Write a 550–650 word personal essay that anchors in a vivid, specific micro-moment and reveals how your mind works, what you value, and how you engage with the world.',
        checklist: [
          'Opens *in medias res* with an unmistakable personal detail rather than a dictionary definition or sweeping platitude',
          'Follows the 30% Scene / 70% Reflection & Intellectual Insight balance prized by university admissions officers',
          'Shows intellectual vitality—how a concrete habit, craft, or question connects to how you think and learn',
          'Ends with forward-looking resonance and authentic voice'
        ],
        modelExcerpt: 'Every Saturday morning at 6:15 a.m., before the first customer rings the brass bell at my family’s repair shop, I sort damaged watch movements into plastic ice-cube trays. A stopped mechanical watch rarely suffers from a dramatic catastrophe; nine times out of ten, a microscopic speck of dried oil on the escapement wheel has halted three hundred gears in silent protest.',
        sampleDraft: 'On the inside cover of my spiral sketchbook, I keep a running list of things I have accidentally burned, curdled, or collapsed in our kitchen: three batches of sourdough starter, one batch of caramel that fused to a cast-iron skillet, and a lemon meringue pie that wept puddle-like tears across the counter. For a long time, I treated recipes like algebra equations—convinced that if I measured flour to the gram, the oven owed me perfection.\n\nMy perspective shifted during my junior year when I began documenting *why* each bake failed rather than hiding the evidence. When my sourdough loaves emerged flat as river stones, I learned how ambient humidity alters fermentation rates and how gluten networks respond to folding intervals. Kitchen chemistry turned my frustration into curiosity: a collapsed loaf was no longer an indictment of my effort, but a message from wild yeast waiting to be decoded.\n\nThat habit of treating messy results as diagnostic clues soon spilled out of the kitchen and into my physics lab and community robotics team. When our autonomous sensor array kept drifting three degrees left during regional trials, I didn’t panic; I pulled out my notebook and isolated variables one by one—just like adjusting hydration on a humid July afternoon. Ultimately, baking taught me that mastery is rarely the absence of error; it is the willingness to stay curious when the recipe goes off-script.'
      },
      {
        id: 'g12-arg-productivity-creativity',
        genre: 'Philosophical Argument',
        difficulty: 'Capstone',
        title: 'The Optimization Trap: Does Hyper-Productivity Undermine Human Creativity?',
        promptText: 'Modern culture increasingly measures human worth through quantifiable optimization—tracked habits, speed-listened podcasts, and relentless resume building. Write a sophisticated argumentative essay examining whether our obsession with efficiency and measurable output enriches or impoverishes genuine human creativity and reflection.',
        checklist: [
          'Formulates an original, conceptually rich thesis that distinguishes purposeful craft from compulsive optimization',
          'Integrates interdisciplinary evidence (philosophy, psychology, history of science, or literature)',
          'Uses varied syntactic cadences—pairing long analytical sentences with crisp, memorable aphorisms',
          'Addresses the legitimate value of discipline while critiquing instrumentalism'
        ],
        modelExcerpt: 'When every waking hour is audited for return on investment, daydreaming begins to look like a moral failing. Yet the history of human discovery—from Archimedes’ bathhouse insight to Virginia Woolf’s unstructured walks through London—suggests that our deepest creative breakthroughs require the very thing optimization culture seeks to eliminate: unhurried, non-transactional solitude.',
        sampleDraft: 'We live in an era that treats the human mind like an operating system in perpetual need of an efficiency patch. Students listen to lectures at double speed, track reading in páginas-per-minute apps, and justify hobbies by how neatly they fit onto a resume. While disciplined habits undeniably help us execute known tasks, our cultural obsession with relentless optimization ultimately starves genuine creativity by eliminating the unstructured solitude where original thought germinates.\n\nCreativity is fundamentally non-linear; it relies on what neuroscientists call the brain’s default mode network, which activates only when we stop focusing on immediate external deliverables. Historically, breakthroughs in both science and art have emerged from periods of apparent idleness—Charles Darwin walking his gravel Sandwalk path, or poets letting half-formed metaphors simmer in silence. Had these thinkers optimized every fifteen-minute block for measurable output, they might have answered more correspondence, but they would have discovered far less.\n\nGranted, discipline and craftsmanship are essential once an insight takes shape; inspiration without execution remains a daydream. Yet when society reduces every human activity—friendship, reading, nature walks—to a productivity metric, we confuse motion with meaning. Protecting unscripted, unmeasured space is not laziness; it is the precondition for intellectual originality.'
      },
      {
        id: 'g12-lit-mirror-hammer',
        genre: 'Capstone Literary Essay',
        difficulty: 'Capstone',
        title: 'Mirror or Hammer: What Is the Moral Responsibility of Literature and Art?',
        promptText: 'Writers and critics have long debated whether literature’s highest duty is aesthetic fidelity—holding an impartial mirror up to human nature—or moral intervention, acting as a hammer to reshape society. Write a seminar-level critical essay exploring how great literature navigates the tension between artistic autonomy and ethical responsibility.',
        checklist: [
          'Synthesizes aesthetic and ethical frameworks into a cohesive philosophical argument',
          'Anchors abstract claims in concrete literary examples and close reading',
          'Demonstrates command of academic register without falling into pretentious jargon',
          'Resolves the prompt’s binary by showing how deep empathy bridges aesthetics and ethics'
        ],
        modelExcerpt: 'When art is drafted as a political pamphlet, it flattens human contradiction into propaganda; yet when art retreats into sterile formalism, it risks becoming an ornament to injustice. The most enduring literature resolves this paradox not by preaching a thesis, but by expanding the reader’s capacity for radical empathy.',
        sampleDraft: 'For centuries, literary critics have been divided by a false binary: should a novel serve as a neutral mirror reflecting human life as it is, or as a hammer forged to reshape an unjust world? When writers treat literature purely as a megaphone for a predetermined slogan, characters flatten into mouthpieces and art degenerates into propaganda. Yet the greatest works of literature prove that aesthetic honesty and moral force are not opposites; by rendering human complexity without flinching, literature transforms the mirror itself into a catalyst for ethical awakening.\n\nConsider how enduring fiction depicts suffering or injustice. A political speech tells us what policy to support, but a novel invites us to inhabit the interior life of a stranger whose history, fears, and contradictions differ radically from our own. Because the author honors artistic complexity—allowing characters to be flawed, hesitant, and fully human—the reader cannot easily look away or categorize them as abstractions.\n\nThus, literature fulfills its deepest civic responsibility precisely by refusing to simplify. By expanding the boundaries of our imagination and dismantling the stereotypes that make cruelty easy, honest art changes how we see one another long after the book is closed.'
      }
    ]
  }
};
