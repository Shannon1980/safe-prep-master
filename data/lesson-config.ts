import { QUIZ_QUESTIONS } from './quiz-questions';
import { EXAM_QUESTIONS } from './exam-questions';

export interface LessonSection {
  id: string;
  name: string;
  studyTips: string[];
}

export interface LessonConfig {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  sections: LessonSection[];
}

export const LESSONS: LessonConfig[] = [
  {
    id: 1,
    title: 'Introducing Scrum in SAFe',
    shortTitle: 'Scrum in SAFe',
    description: 'Learn the basics of Agile, Scrum, and how they apply within the SAFe framework.',
    sections: [
      {
        id: 'agile-basics',
        name: 'Agile Basics',
        studyTips: [
          'Review the four values and twelve principles of the Agile Manifesto',
          'Understand incremental vs waterfall delivery approaches',
          'Know that Lean product development is one of SAFe\'s three bodies of knowledge',
        ],
      },
      {
        id: 'scrum-basics',
        name: 'Scrum Basics',
        studyTips: [
          'Know the three pillars of Scrum: Transparency, Inspection, Adaptation',
          'Memorize the five Scrum values: Focus, Openness, Respect, Commitment, Courage',
          'Understand SAFe terminology mapping (Sprint→Iteration, Daily Scrum→Team Sync)',
          'Know the recommended iteration length (2 weeks) and concept of vertical slices',
          'Remember: transparency means the process is visible to all stakeholders',
        ],
      },
      {
        id: 'agile-team',
        name: 'Agile Team & ART',
        studyTips: [
          'Know the composition of an Agile Team (10 or fewer members, cross-functional)',
          'Understand what an ART is (5-12 teams, 50-125+ people, synchronized on a common cadence)',
          'Review built-in quality practices: pairing, peer review, collective ownership',
          'Know the two specialty roles: Scrum Master and Product Owner',
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'Characterizing the Role of the Scrum Master',
    shortTitle: 'SM/TC Role',
    description: 'Understand the Scrum Master role, servant leadership, and building high-performing teams.',
    sections: [
      {
        id: 'sm-role',
        name: 'SM Responsibilities',
        studyTips: [
          'Know the five key SM responsibilities: Facilitate PI Planning, Support Iteration Execution, Improve Flow, Build High-Performing Teams, Improve ART Performance',
          'Understand behaviors to move toward (facilitator, asking the team) and away from (directing, fixing problems)',
          'What falls OUTSIDE SM responsibility: estimating stories, assigning work to team members',
          'SM provides most value by removing impediments and leading relentless improvement',
          'SM is effective by using scrum methods, SAFe principles, and supporting delivery using Agile practices',
        ],
      },
      {
        id: 'servant-leadership',
        name: 'Servant Leadership',
        studyTips: [
          'The SM is a servant leader above all else',
          'Servant leader traits: listen, empathize, persuade (not authority), think beyond day-to-day, appreciate openness',
          'Servant leaders use persuasion instead of authority',
          'Growth comes from facilitating the growth of others',
          'SM servant leadership helps the team become high-performing',
        ],
      },
      {
        id: 'high-performing-teams',
        name: 'High-Performing Teams',
        studyTips: [
          'Memorize Tuckman\'s stages: Forming, Storming, Norming, Performing',
          'Know Lencioni\'s Five Dysfunctions — Absence of Trust is the foundational issue',
          'Business Owners help address "Avoidance of Accountability"',
          'SAFe handles "Fear of Conflict" by using Scrum to create a safe environment for conflict',
          'Review conflict resolution: meet with parties, identify needs, find common ground',
        ],
      },
      {
        id: 'events',
        name: 'ART-Level Events',
        studyTips: [
          'Coach Sync is facilitated by the RTE, provides visibility into risks and progress',
          'Scrum of Scrums reviews the ART\'s progress toward PI Objectives',
          'PO Sync aligns product priorities across the ART',
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Experiencing PI Planning',
    shortTitle: 'PI Planning',
    description: 'Master PI Planning, objectives, stories, estimation, and the program board.',
    sections: [
      {
        id: 'pi-planning',
        name: 'PI Planning Event',
        studyTips: [
          'PI Planning is 2 days, every 8-12 weeks — the heartbeat of the ART',
          'SM role: maintain timeboxes, facilitate coordination, manage program board, ensure honest confidence votes',
          'Common anti-patterns: pressure to overcommit, detailed plan becomes the goal over alignment',
          'SM facilitates coordination with other teams for dependencies in team breakout #1',
          'Face-to-face conversation is the Agile Manifesto principle that describes PI Planning\'s importance',
        ],
      },
      {
        id: 'pi-objectives',
        name: 'PI Objectives & Confidence',
        studyTips: [
          'PI objectives create a near-term focus and vision',
          'Understand committed vs uncommitted objectives (guard band for predictability)',
          'Business Owners assign value (1-10) to PI objectives',
          'Confidence vote builds shared commitment to the plan',
          'ROAM categorizes risks: Resolved, Owned, Accepted, Mitigated',
        ],
      },
      {
        id: 'stories-estimation',
        name: 'Stories & Estimation',
        studyTips: [
          'INVEST criteria: Independent, Negotiable, Valuable, Estimable, Small, Testable',
          'Three Cs of user stories: Card, Conversation, Confirmation',
          'Story point factors: Volume, Complexity, Knowledge, Uncertainty',
          'SM key responsibility during estimation: ensure everyone participates (not ensure accuracy)',
          'A common reason teams can\'t estimate: the story lacks acceptance criteria',
        ],
      },
      {
        id: 'backlog',
        name: 'Features & Backlog',
        studyTips: [
          'Features are justified by a benefit hypothesis — fully evaluated when the customer uses it in production',
          'Product Management owns feature priorities during PI Planning',
          'Four types of enabler stories: Infrastructure, Architecture, Exploration, Compliance',
          'Spikes are time-boxed research activities to reduce risk',
          'Product Management clarifies scope of feature work (not technical specs)',
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Facilitating Iteration Execution',
    shortTitle: 'Iteration Execution',
    description: 'Learn about iteration events, flow metrics, DevOps, and continuous improvement.',
    sections: [
      {
        id: 'iteration-planning',
        name: 'Iteration Planning',
        studyTips: [
          'Timebox is 4 hours or less per iteration',
          'Capacity allocation: balance new stories with maintenance and refactors',
          'Iteration planning is complete when the team commits to the plan',
          'Velocity counts only completed stories (50% of a story = 0 points)',
          'Anti-pattern: creating unrealistic commitments',
        ],
      },
      {
        id: 'team-sync',
        name: 'Team Sync & Daily Events',
        studyTips: [
          'Three questions: What did I do yesterday? What will I do today? Any impediments?',
          '15-minute timebox for the Team Sync',
          'System demo occurs after every iteration',
          'Poor Team Syncs are a symptom of deeper problems (collaboration, ownership, conflict)',
        ],
      },
      {
        id: 'backlog-refinement',
        name: 'Backlog Refinement',
        studyTips: [
          'Timebox: 1-2 hours per iteration',
          'Anti-pattern: team sees stories for the first time during Iteration Planning (not doing refinement)',
          'PO presents candidate stories, team discusses, estimates, and splits as needed',
        ],
      },
      {
        id: 'review-retro',
        name: 'Iteration Review & Retrospective',
        studyTips: [
          'Only Agile Team members attend the retrospective — no external stakeholders',
          'Retrospective has two parts: Quantitative (metrics) and Qualitative (what went well/didn\'t)',
          'Review anti-pattern: demo is mainly slides/talk instead of working software',
          'The iteration review demonstrates working software and collects stakeholder feedback',
        ],
      },
      {
        id: 'flow-devops',
        name: 'Flow & DevOps',
        studyTips: [
          'CALMR: Culture, Automation, Lean flow, Measurement, Recovery',
          'C in CALMR stands for Culture',
          'WIP limits balance work against available capacity to improve throughput',
          'Flow velocity measures the number of backlog items completed in a timeframe',
          'Know the eight flow accelerators (visualize & limit WIP, address bottlenecks, etc.)',
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'Finishing the PI',
    shortTitle: 'Finishing the PI',
    description: 'Understand the IP iteration, Inspect & Adapt, and driving relentless improvement.',
    sections: [
      {
        id: 'ip-iteration',
        name: 'Innovation & Planning Iteration',
        studyTips: [
          'IP iteration is for: innovation, hackathons, infrastructure improvements, PI prep, capacity guard band',
          'Anti-pattern: planning work for the IP iteration during PI Planning',
          'Consequences of skipping IP: technical debt grows, burnout, no time to plan or innovate',
          'SM responsibility during IP: facilitate team preparation for the PI system demo',
        ],
      },
      {
        id: 'inspect-adapt',
        name: 'Inspect & Adapt',
        studyTips: [
          'Three parts: PI System Demo, Quantitative/Qualitative Measurement, Problem-Solving Workshop',
          'Pareto analysis identifies the biggest root cause in the problem-solving workshop',
          '5 Whys and Fishbone diagrams are recommended for root cause analysis',
          'ART predictability: planned business value vs actual business value achieved',
          'SM supports by providing facilitation to breakout groups focused on specific problems',
        ],
      },
      {
        id: 'improvement',
        name: 'Relentless Improvement',
        studyTips: [
          'Two primary opportunities: Iteration Retrospective and Inspect & Adapt event',
          'SM leads team efforts in relentless improvement',
          'Use Fishbone diagrams and 5 Whys for root cause analysis',
        ],
      },
    ],
  },
  {
    id: 6,
    title: 'AI for Scrum Masters',
    shortTitle: 'AI for SMs',
    description: 'Learn about AI tools, responsible AI, and building an AI-augmented workforce.',
    sections: [
      {
        id: 'ai-basics',
        name: 'AI Fundamentals',
        studyTips: [
          'Three common AI risks: Bias, Hallucination, Data Leaks',
          'RAG = Retrieval Augmented Generation — uses a trusted knowledge base for better answers',
          'Five components of an AI prompt: Goal, Role, Task, Context, Details',
        ],
      },
      {
        id: 'responsible-ai',
        name: 'Responsible AI',
        studyTips: [
          'Three dimensions: Trustworthy, Explainable, Human-centric',
          'Five steps to AI-augmented workforce: Identify tools, Ensure responsible use, Measure impact, Invest in upskilling, Foster innovation culture',
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Question-to-lesson mapping for exam questions
// ---------------------------------------------------------------------------
const EXAM_QUESTION_LESSON_MAP: Record<string, { lesson: number; section: string }> = {
  // Domain 1 → Lesson 1
  'd1-1': { lesson: 1, section: 'agile-basics' },
  'd1-2': { lesson: 1, section: 'agile-basics' },
  'd1-3': { lesson: 1, section: 'agile-basics' },
  'd1-4': { lesson: 1, section: 'scrum-basics' },
  'd1-5': { lesson: 1, section: 'scrum-basics' },
  'd1-6': { lesson: 1, section: 'scrum-basics' },
  'd1-7': { lesson: 1, section: 'agile-team' },
  'd1-8': { lesson: 1, section: 'agile-team' },
  'd1-9': { lesson: 1, section: 'agile-team' },
  'd1-10': { lesson: 1, section: 'scrum-basics' },
  'd1-11': { lesson: 4, section: 'flow-devops' },
  'd1-12': { lesson: 1, section: 'scrum-basics' },
  'd1-13': { lesson: 1, section: 'agile-team' },
  'd1-14': { lesson: 1, section: 'scrum-basics' },
  'd1-15': { lesson: 1, section: 'agile-basics' },

  // Domain 2 → Lesson 2
  'd2-1': { lesson: 2, section: 'servant-leadership' },
  'd2-2': { lesson: 2, section: 'sm-role' },
  'd2-3': { lesson: 2, section: 'sm-role' },
  'd2-4': { lesson: 2, section: 'high-performing-teams' },
  'd2-5': { lesson: 2, section: 'high-performing-teams' },
  'd2-6': { lesson: 2, section: 'high-performing-teams' },
  'd2-7': { lesson: 2, section: 'high-performing-teams' },
  'd2-8': { lesson: 2, section: 'servant-leadership' },
  'd2-9': { lesson: 2, section: 'events' },
  'd2-10': { lesson: 2, section: 'sm-role' },
  'd2-11': { lesson: 2, section: 'servant-leadership' },
  'd2-12': { lesson: 2, section: 'high-performing-teams' },
  'd2-13': { lesson: 2, section: 'high-performing-teams' },
  'd2-14': { lesson: 2, section: 'sm-role' },
  'd2-15': { lesson: 2, section: 'sm-role' },

  // Domain 3 → Lesson 4
  'd3-1': { lesson: 4, section: 'iteration-planning' },
  'd3-2': { lesson: 4, section: 'iteration-planning' },
  'd3-3': { lesson: 4, section: 'team-sync' },
  'd3-4': { lesson: 4, section: 'review-retro' },
  'd3-5': { lesson: 4, section: 'review-retro' },
  'd3-6': { lesson: 4, section: 'backlog-refinement' },
  'd3-7': { lesson: 4, section: 'backlog-refinement' },
  'd3-8': { lesson: 4, section: 'review-retro' },
  'd3-9': { lesson: 4, section: 'review-retro' },
  'd3-10': { lesson: 4, section: 'team-sync' },
  'd3-11': { lesson: 4, section: 'iteration-planning' },
  'd3-12': { lesson: 4, section: 'iteration-planning' },

  // Domain 4 → Lessons 3 and 5
  'd4-1': { lesson: 3, section: 'pi-planning' },
  'd4-2': { lesson: 3, section: 'pi-objectives' },
  'd4-3': { lesson: 3, section: 'pi-objectives' },
  'd4-4': { lesson: 3, section: 'pi-objectives' },
  'd4-5': { lesson: 3, section: 'pi-objectives' },
  'd4-6': { lesson: 3, section: 'pi-objectives' },
  'd4-7': { lesson: 5, section: 'inspect-adapt' },
  'd4-8': { lesson: 5, section: 'ip-iteration' },
  'd4-9': { lesson: 3, section: 'pi-planning' },
  'd4-10': { lesson: 5, section: 'inspect-adapt' },
  'd4-11': { lesson: 3, section: 'stories-estimation' },
  'd4-12': { lesson: 5, section: 'inspect-adapt' },
  'd4-13': { lesson: 3, section: 'pi-planning' },
  'd4-14': { lesson: 3, section: 'backlog' },
  'd4-15': { lesson: 5, section: 'ip-iteration' },

  // LNF Study Questions
  'lnf-1': { lesson: 2, section: 'sm-role' },
  'lnf-2': { lesson: 2, section: 'servant-leadership' },
  'lnf-3': { lesson: 2, section: 'sm-role' },
  'lnf-4': { lesson: 2, section: 'high-performing-teams' },
  'lnf-5': { lesson: 2, section: 'servant-leadership' },
  'lnf-6': { lesson: 2, section: 'servant-leadership' },
  'lnf-7': { lesson: 2, section: 'sm-role' },
  'lnf-8': { lesson: 2, section: 'sm-role' },
  'lnf-9': { lesson: 2, section: 'sm-role' },
  'lnf-10': { lesson: 2, section: 'sm-role' },
  'lnf-11': { lesson: 2, section: 'high-performing-teams' },
  'lnf-12': { lesson: 2, section: 'servant-leadership' },
  'lnf-13': { lesson: 2, section: 'high-performing-teams' },
  'lnf-14': { lesson: 2, section: 'sm-role' },
  'lnf-15': { lesson: 2, section: 'sm-role' },
  'lnf-16': { lesson: 2, section: 'sm-role' },
  'lnf-17': { lesson: 2, section: 'sm-role' },
  'lnf-18': { lesson: 1, section: 'agile-basics' },
  'lnf-19': { lesson: 1, section: 'scrum-basics' },
  'lnf-20': { lesson: 4, section: 'flow-devops' },
  'lnf-21': { lesson: 1, section: 'agile-basics' },
  'lnf-22': { lesson: 1, section: 'scrum-basics' },
  'lnf-23': { lesson: 3, section: 'backlog' },
  'lnf-24': { lesson: 1, section: 'agile-basics' },
  'lnf-25': { lesson: 1, section: 'scrum-basics' },
  'lnf-26': { lesson: 4, section: 'team-sync' },
  'lnf-27': { lesson: 4, section: 'iteration-planning' },
  'lnf-28': { lesson: 4, section: 'iteration-planning' },
  'lnf-29': { lesson: 3, section: 'stories-estimation' },
  'lnf-30': { lesson: 3, section: 'stories-estimation' },
  'lnf-31': { lesson: 5, section: 'inspect-adapt' },
  'lnf-32': { lesson: 2, section: 'events' },
  'lnf-33': { lesson: 3, section: 'pi-planning' },
  'lnf-34': { lesson: 5, section: 'ip-iteration' },
  'lnf-35': { lesson: 3, section: 'pi-objectives' },
  'lnf-36': { lesson: 5, section: 'ip-iteration' },
  'lnf-37': { lesson: 3, section: 'pi-planning' },
  'lnf-38': { lesson: 3, section: 'pi-planning' },
  'lnf-39': { lesson: 3, section: 'pi-objectives' },
  'lnf-40': { lesson: 3, section: 'backlog' },
  'lnf-41': { lesson: 3, section: 'pi-planning' },
  'lnf-42': { lesson: 5, section: 'inspect-adapt' },
  'lnf-43': { lesson: 5, section: 'improvement' },
  'lnf-44': { lesson: 3, section: 'pi-planning' },


  // AI-Generated Questions
  'gen-L1-1': { lesson: 1, section: 'agile-basics' },
  'gen-L1-2': { lesson: 1, section: 'agile-basics' },
  'gen-L1-3': { lesson: 1, section: 'agile-basics' },
  'gen-L1-4': { lesson: 1, section: 'agile-basics' },
  'gen-L1-5': { lesson: 1, section: 'agile-basics' },
  'gen-L1-6': { lesson: 1, section: 'agile-basics' },
  'gen-L1-7': { lesson: 1, section: 'agile-basics' },
  'gen-L1-8': { lesson: 1, section: 'agile-basics' },
  'gen-L1-9': { lesson: 1, section: 'agile-basics' },
  'gen-L1-10': { lesson: 1, section: 'agile-basics' },
  'gen-L1-11': { lesson: 1, section: 'agile-basics' },
  'gen-L1-12': { lesson: 1, section: 'agile-basics' },
  'gen-L1-13': { lesson: 1, section: 'agile-basics' },
  'gen-L1-14': { lesson: 1, section: 'agile-basics' },
  'gen-L1-15': { lesson: 1, section: 'agile-basics' },
  'gen-L1-16': { lesson: 1, section: 'agile-basics' },
  'gen-L1-17': { lesson: 1, section: 'agile-basics' },
  'gen-L1-18': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-19': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-20': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-21': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-22': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-23': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-24': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-25': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-26': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-27': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-28': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-29': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-30': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-31': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-32': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-33': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-34': { lesson: 1, section: 'scrum-basics' },
  'gen-L1-35': { lesson: 1, section: 'agile-team' },
  'gen-L1-36': { lesson: 1, section: 'agile-team' },
  'gen-L1-37': { lesson: 1, section: 'agile-team' },
  'gen-L1-38': { lesson: 1, section: 'agile-team' },
  'gen-L1-39': { lesson: 1, section: 'agile-team' },
  'gen-L1-40': { lesson: 1, section: 'agile-team' },
  'gen-L1-41': { lesson: 1, section: 'agile-team' },
  'gen-L1-42': { lesson: 1, section: 'agile-team' },
  'gen-L1-43': { lesson: 1, section: 'agile-team' },
  'gen-L1-44': { lesson: 1, section: 'agile-team' },
  'gen-L1-45': { lesson: 1, section: 'agile-team' },
  'gen-L1-46': { lesson: 1, section: 'agile-team' },
  'gen-L1-47': { lesson: 1, section: 'agile-team' },
  'gen-L1-48': { lesson: 1, section: 'agile-team' },
  'gen-L1-49': { lesson: 1, section: 'agile-team' },
  'gen-L1-50': { lesson: 1, section: 'agile-team' },
  'gen-L1-51': { lesson: 1, section: 'agile-team' },
  'gen-L2-52': { lesson: 2, section: 'sm-role' },
  'gen-L2-53': { lesson: 2, section: 'sm-role' },
  'gen-L2-54': { lesson: 2, section: 'sm-role' },
  'gen-L2-55': { lesson: 2, section: 'sm-role' },
  'gen-L2-56': { lesson: 2, section: 'sm-role' },
  'gen-L2-57': { lesson: 2, section: 'sm-role' },
  'gen-L2-58': { lesson: 2, section: 'sm-role' },
  'gen-L2-59': { lesson: 2, section: 'sm-role' },
  'gen-L2-60': { lesson: 2, section: 'sm-role' },
  'gen-L2-61': { lesson: 2, section: 'sm-role' },
  'gen-L2-62': { lesson: 2, section: 'sm-role' },
  'gen-L2-63': { lesson: 2, section: 'sm-role' },
  'gen-L2-64': { lesson: 2, section: 'sm-role' },
  'gen-L2-65': { lesson: 2, section: 'servant-leadership' },
  'gen-L2-66': { lesson: 2, section: 'servant-leadership' },
  'gen-L2-67': { lesson: 2, section: 'servant-leadership' },
  'gen-L2-68': { lesson: 2, section: 'servant-leadership' },
  'gen-L2-69': { lesson: 2, section: 'servant-leadership' },
  'gen-L2-70': { lesson: 2, section: 'servant-leadership' },
  'gen-L2-71': { lesson: 2, section: 'servant-leadership' },
  'gen-L2-72': { lesson: 2, section: 'servant-leadership' },
  'gen-L2-73': { lesson: 2, section: 'servant-leadership' },
  'gen-L2-74': { lesson: 2, section: 'servant-leadership' },
  'gen-L2-75': { lesson: 2, section: 'servant-leadership' },
  'gen-L2-76': { lesson: 2, section: 'servant-leadership' },
  'gen-L2-77': { lesson: 2, section: 'servant-leadership' },
  'gen-L2-78': { lesson: 2, section: 'high-performing-teams' },
  'gen-L2-79': { lesson: 2, section: 'high-performing-teams' },
  'gen-L2-80': { lesson: 2, section: 'high-performing-teams' },
  'gen-L2-81': { lesson: 2, section: 'high-performing-teams' },
  'gen-L2-82': { lesson: 2, section: 'high-performing-teams' },
  'gen-L2-83': { lesson: 2, section: 'high-performing-teams' },
  'gen-L2-84': { lesson: 2, section: 'high-performing-teams' },
  'gen-L2-85': { lesson: 2, section: 'high-performing-teams' },
  'gen-L2-86': { lesson: 2, section: 'high-performing-teams' },
  'gen-L2-87': { lesson: 2, section: 'high-performing-teams' },
  'gen-L2-88': { lesson: 2, section: 'high-performing-teams' },
  'gen-L2-89': { lesson: 2, section: 'high-performing-teams' },
  'gen-L2-90': { lesson: 2, section: 'high-performing-teams' },
  'gen-L2-91': { lesson: 2, section: 'events' },
  'gen-L2-92': { lesson: 2, section: 'events' },
  'gen-L2-93': { lesson: 2, section: 'events' },
  'gen-L2-94': { lesson: 2, section: 'events' },
  'gen-L2-95': { lesson: 2, section: 'events' },
  'gen-L2-96': { lesson: 2, section: 'events' },
  'gen-L2-97': { lesson: 2, section: 'events' },
  'gen-L2-98': { lesson: 2, section: 'events' },
  'gen-L2-99': { lesson: 2, section: 'events' },
  'gen-L2-100': { lesson: 2, section: 'events' },
  'gen-L2-101': { lesson: 2, section: 'events' },
  'gen-L2-102': { lesson: 2, section: 'events' },
  'gen-L2-103': { lesson: 2, section: 'events' },
  'gen-L3-104': { lesson: 3, section: 'pi-planning' },
  'gen-L3-105': { lesson: 3, section: 'pi-planning' },
  'gen-L3-106': { lesson: 3, section: 'pi-planning' },
  'gen-L3-107': { lesson: 3, section: 'pi-planning' },
  'gen-L3-108': { lesson: 3, section: 'pi-planning' },
  'gen-L3-109': { lesson: 3, section: 'pi-planning' },
  'gen-L3-110': { lesson: 3, section: 'pi-planning' },
  'gen-L3-111': { lesson: 3, section: 'pi-planning' },
  'gen-L3-112': { lesson: 3, section: 'pi-planning' },
  'gen-L3-113': { lesson: 3, section: 'pi-planning' },
  'gen-L3-114': { lesson: 3, section: 'pi-planning' },
  'gen-L3-115': { lesson: 3, section: 'pi-planning' },
  'gen-L3-116': { lesson: 3, section: 'pi-planning' },
  'gen-L3-117': { lesson: 3, section: 'pi-objectives' },
  'gen-L3-118': { lesson: 3, section: 'pi-objectives' },
  'gen-L3-119': { lesson: 3, section: 'pi-objectives' },
  'gen-L3-120': { lesson: 3, section: 'pi-objectives' },
  'gen-L3-121': { lesson: 3, section: 'pi-objectives' },
  'gen-L3-122': { lesson: 3, section: 'pi-objectives' },
  'gen-L3-123': { lesson: 3, section: 'pi-objectives' },
  'gen-L3-124': { lesson: 3, section: 'pi-objectives' },
  'gen-L3-125': { lesson: 3, section: 'pi-objectives' },
  'gen-L3-126': { lesson: 3, section: 'pi-objectives' },
  'gen-L3-127': { lesson: 3, section: 'pi-objectives' },
  'gen-L3-128': { lesson: 3, section: 'pi-objectives' },
  'gen-L3-129': { lesson: 3, section: 'pi-objectives' },
  'gen-L3-130': { lesson: 3, section: 'stories-estimation' },
  'gen-L3-131': { lesson: 3, section: 'stories-estimation' },
  'gen-L3-132': { lesson: 3, section: 'stories-estimation' },
  'gen-L3-133': { lesson: 3, section: 'stories-estimation' },
  'gen-L3-134': { lesson: 3, section: 'stories-estimation' },
  'gen-L3-135': { lesson: 3, section: 'stories-estimation' },
  'gen-L3-136': { lesson: 3, section: 'stories-estimation' },
  'gen-L3-137': { lesson: 3, section: 'stories-estimation' },
  'gen-L3-138': { lesson: 3, section: 'stories-estimation' },
  'gen-L3-139': { lesson: 3, section: 'stories-estimation' },
  'gen-L3-140': { lesson: 3, section: 'stories-estimation' },
  'gen-L3-141': { lesson: 3, section: 'stories-estimation' },
  'gen-L3-142': { lesson: 3, section: 'stories-estimation' },
  'gen-L3-143': { lesson: 3, section: 'backlog' },
  'gen-L3-144': { lesson: 3, section: 'backlog' },
  'gen-L3-145': { lesson: 3, section: 'backlog' },
  'gen-L3-146': { lesson: 3, section: 'backlog' },
  'gen-L3-147': { lesson: 3, section: 'backlog' },
  'gen-L3-148': { lesson: 3, section: 'backlog' },
  'gen-L3-149': { lesson: 3, section: 'backlog' },
  'gen-L3-150': { lesson: 3, section: 'backlog' },
  'gen-L3-151': { lesson: 3, section: 'backlog' },
  'gen-L3-152': { lesson: 3, section: 'backlog' },
  'gen-L3-153': { lesson: 3, section: 'backlog' },
  'gen-L3-154': { lesson: 3, section: 'backlog' },
  'gen-L3-155': { lesson: 3, section: 'backlog' },
  'gen-L4-156': { lesson: 4, section: 'iteration-planning' },
  'gen-L4-157': { lesson: 4, section: 'iteration-planning' },
  'gen-L4-158': { lesson: 4, section: 'iteration-planning' },
  'gen-L4-159': { lesson: 4, section: 'iteration-planning' },
  'gen-L4-160': { lesson: 4, section: 'iteration-planning' },
  'gen-L4-161': { lesson: 4, section: 'iteration-planning' },
  'gen-L4-162': { lesson: 4, section: 'iteration-planning' },
  'gen-L4-163': { lesson: 4, section: 'iteration-planning' },
  'gen-L4-164': { lesson: 4, section: 'iteration-planning' },
  'gen-L4-165': { lesson: 4, section: 'iteration-planning' },
  'gen-L4-166': { lesson: 4, section: 'team-sync' },
  'gen-L4-167': { lesson: 4, section: 'team-sync' },
  'gen-L4-168': { lesson: 4, section: 'team-sync' },
  'gen-L4-169': { lesson: 4, section: 'team-sync' },
  'gen-L4-170': { lesson: 4, section: 'team-sync' },
  'gen-L4-171': { lesson: 4, section: 'team-sync' },
  'gen-L4-172': { lesson: 4, section: 'team-sync' },
  'gen-L4-173': { lesson: 4, section: 'team-sync' },
  'gen-L4-174': { lesson: 4, section: 'team-sync' },
  'gen-L4-175': { lesson: 4, section: 'team-sync' },
  'gen-L4-176': { lesson: 4, section: 'backlog-refinement' },
  'gen-L4-177': { lesson: 4, section: 'backlog-refinement' },
  'gen-L4-178': { lesson: 4, section: 'backlog-refinement' },
  'gen-L4-179': { lesson: 4, section: 'backlog-refinement' },
  'gen-L4-180': { lesson: 4, section: 'backlog-refinement' },
  'gen-L4-181': { lesson: 4, section: 'backlog-refinement' },
  'gen-L4-182': { lesson: 4, section: 'backlog-refinement' },
  'gen-L4-183': { lesson: 4, section: 'backlog-refinement' },
  'gen-L4-184': { lesson: 4, section: 'backlog-refinement' },
  'gen-L4-185': { lesson: 4, section: 'backlog-refinement' },
  'gen-L4-186': { lesson: 4, section: 'review-retro' },
  'gen-L4-187': { lesson: 4, section: 'review-retro' },
  'gen-L4-188': { lesson: 4, section: 'review-retro' },
  'gen-L4-189': { lesson: 4, section: 'review-retro' },
  'gen-L4-190': { lesson: 4, section: 'review-retro' },
  'gen-L4-191': { lesson: 4, section: 'review-retro' },
  'gen-L4-192': { lesson: 4, section: 'review-retro' },
  'gen-L4-193': { lesson: 4, section: 'review-retro' },
  'gen-L4-194': { lesson: 4, section: 'review-retro' },
  'gen-L4-195': { lesson: 4, section: 'review-retro' },
  'gen-L4-196': { lesson: 4, section: 'flow-devops' },
  'gen-L4-197': { lesson: 4, section: 'flow-devops' },
  'gen-L4-198': { lesson: 4, section: 'flow-devops' },
  'gen-L4-199': { lesson: 4, section: 'flow-devops' },
  'gen-L4-200': { lesson: 4, section: 'flow-devops' },
  'gen-L4-201': { lesson: 4, section: 'flow-devops' },
  'gen-L4-202': { lesson: 4, section: 'flow-devops' },
  'gen-L4-203': { lesson: 4, section: 'flow-devops' },
  'gen-L4-204': { lesson: 4, section: 'flow-devops' },
  'gen-L4-205': { lesson: 4, section: 'flow-devops' },
  'gen-L5-206': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-207': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-208': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-209': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-210': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-211': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-212': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-213': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-214': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-215': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-216': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-217': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-218': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-219': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-220': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-221': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-222': { lesson: 5, section: 'ip-iteration' },
  'gen-L5-223': { lesson: 5, section: 'improvement' },
  'gen-L5-224': { lesson: 5, section: 'improvement' },
  'gen-L5-225': { lesson: 5, section: 'improvement' },
  'gen-L5-226': { lesson: 5, section: 'improvement' },
  'gen-L5-227': { lesson: 5, section: 'improvement' },
  'gen-L5-228': { lesson: 5, section: 'improvement' },
  'gen-L5-229': { lesson: 5, section: 'improvement' },
  'gen-L5-230': { lesson: 5, section: 'improvement' },
  'gen-L5-231': { lesson: 5, section: 'improvement' },
  'gen-L5-232': { lesson: 5, section: 'improvement' },
  'gen-L5-233': { lesson: 5, section: 'improvement' },
  'gen-L5-234': { lesson: 5, section: 'improvement' },
  'gen-L5-235': { lesson: 5, section: 'improvement' },
  'gen-L5-236': { lesson: 5, section: 'improvement' },
  'gen-L5-237': { lesson: 5, section: 'improvement' },
  'gen-L5-238': { lesson: 5, section: 'improvement' },
  'gen-L5-239': { lesson: 5, section: 'improvement' },
  'gen-L6-240': { lesson: 6, section: 'ai-basics' },
  'gen-L6-241': { lesson: 6, section: 'ai-basics' },
  'gen-L6-242': { lesson: 6, section: 'ai-basics' },
  'gen-L6-243': { lesson: 6, section: 'ai-basics' },
  'gen-L6-244': { lesson: 6, section: 'ai-basics' },
  'gen-L6-245': { lesson: 6, section: 'ai-basics' },
  'gen-L6-246': { lesson: 6, section: 'ai-basics' },
  'gen-L6-247': { lesson: 6, section: 'ai-basics' },
  'gen-L6-248': { lesson: 6, section: 'ai-basics' },
  'gen-L6-249': { lesson: 6, section: 'ai-basics' },
  'gen-L6-250': { lesson: 6, section: 'ai-basics' },
  'gen-L6-251': { lesson: 6, section: 'ai-basics' },
  'gen-L6-252': { lesson: 6, section: 'ai-basics' },
  'gen-L6-253': { lesson: 6, section: 'ai-basics' },
  'gen-L6-254': { lesson: 6, section: 'ai-basics' },
  'gen-L6-255': { lesson: 6, section: 'ai-basics' },
  'gen-L6-256': { lesson: 6, section: 'ai-basics' },
  'gen-L6-257': { lesson: 6, section: 'ai-basics' },
  'gen-L6-258': { lesson: 6, section: 'ai-basics' },
  'gen-L6-259': { lesson: 6, section: 'ai-basics' },
  'gen-L6-260': { lesson: 6, section: 'ai-basics' },
  'gen-L6-261': { lesson: 6, section: 'ai-basics' },
  'gen-L6-262': { lesson: 6, section: 'ai-basics' },
  'gen-L6-263': { lesson: 6, section: 'ai-basics' },
  'gen-L6-264': { lesson: 6, section: 'ai-basics' },
  'gen-L6-265': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-266': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-267': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-268': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-269': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-270': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-271': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-272': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-273': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-274': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-275': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-276': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-277': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-278': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-279': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-280': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-281': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-282': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-283': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-284': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-285': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-286': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-287': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-288': { lesson: 6, section: 'responsible-ai' },
  'gen-L6-289': { lesson: 6, section: 'responsible-ai' },
  'gen-L5-ia-1': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-2': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-3': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-4': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-5': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-6': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-7': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-8': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-9': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-10': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-11': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-12': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-13': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-14': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-15': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-16': { lesson: 5, section: 'inspect-adapt' },
  'gen-L5-ia-17': { lesson: 5, section: 'inspect-adapt' },
};

// ---------------------------------------------------------------------------
// Unified question type for lesson quizzes
// ---------------------------------------------------------------------------
export interface LessonQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  correctIndices?: number[];
  multiSelect?: number;
  section: string;
  source: 'quiz' | 'exam';
}

// Parse lesson number and section from quiz question topic field
function parseQuizQuestionLesson(topic: string): { lesson: number; section: string } | null {
  const match = topic.match(/^Lesson (\d+)\s*[–-]\s*(.+)$/);
  if (!match) return null;
  const lesson = parseInt(match[1]);
  const sectionName = match[2].trim();

  const sectionMap: Record<string, Record<string, string>> = {
    '1': { 'Agile Basics': 'agile-basics', 'Scrum Basics': 'scrum-basics', 'Agile Team': 'agile-team' },
    '2': { 'SM Role': 'sm-role', 'Events': 'events', 'High-Performing Teams': 'high-performing-teams' },
    '3': { 'PI Planning': 'pi-planning', 'Features': 'backlog' },
    '4': {
      'Iteration Planning': 'iteration-planning',
      'Team Sync': 'team-sync',
      'Backlog Refinement': 'backlog-refinement',
      'Iteration Review': 'review-retro',
      'Retrospective': 'review-retro',
      'DevOps': 'flow-devops',
      'Flow': 'flow-devops',
      'Commitment': 'iteration-planning',
    },
    '5': { 'IP Iteration': 'ip-iteration', 'Inspect & Adapt': 'inspect-adapt' },
    '6': { 'AI for SMs': 'ai-basics' },
  };

  const map = sectionMap[lesson.toString()];
  const sectionId = map?.[sectionName] || sectionName.toLowerCase().replace(/\s+/g, '-');
  return { lesson, section: sectionId };
}

/**
 * Collect all questions for a given lesson from both question banks.
 * Returns shuffled questions with section tags for per-section scoring.
 */
export function getLessonQuestions(lessonId: number): LessonQuizQuestion[] {
  const questions: LessonQuizQuestion[] = [];
  const seenTexts = new Set<string>();

  // Collect from practice quiz questions
  for (const q of QUIZ_QUESTIONS) {
    const parsed = parseQuizQuestionLesson(q.topic);
    if (parsed && parsed.lesson === lessonId) {
      const key = q.question.toLowerCase().slice(0, 80);
      if (!seenTexts.has(key)) {
        seenTexts.add(key);
        questions.push({
          id: `quiz-${q.id}`,
          question: q.question,
          options: [...q.options],
          correctIndex: q.correctIndex,
          section: parsed.section,
          source: 'quiz',
        });
      }
    }
  }

  // Collect from exam questions
  for (const q of EXAM_QUESTIONS) {
    const mapping = EXAM_QUESTION_LESSON_MAP[q.id];
    if (mapping && mapping.lesson === lessonId) {
      const key = q.question.toLowerCase().slice(0, 80);
      if (!seenTexts.has(key)) {
        seenTexts.add(key);
        questions.push({
          id: `exam-${q.id}`,
          question: q.question,
          options: [...q.options],
          correctIndex: q.correctIndex,
          correctIndices: q.correctIndices ? [...q.correctIndices] : undefined,
          multiSelect: q.multiSelect,
          section: mapping.section,
          source: 'exam',
        });
      }
    }
  }

  // Shuffle
  return questions.sort(() => Math.random() - 0.5);
}

/**
 * Get questions for a specific section within a lesson, capped at 10.
 * If externalPool is provided, uses that instead of the hardcoded bank.
 */
export function getSectionQuestions(lessonId: number, sectionId: string, externalPool?: LessonQuizQuestion[]): LessonQuizQuestion[] {
  const all = externalPool ?? getLessonQuestions(lessonId);
  const sectionQs = all.filter((q) => q.section === sectionId);
  const shuffled = sectionQs.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10);
}

/**
 * Get the question count for a specific section (before the 10-cap).
 * If externalPool is provided, uses that instead of the hardcoded bank.
 */
export function getSectionQuestionCount(lessonId: number, sectionId: string, externalPool?: LessonQuizQuestion[]): number {
  const all = externalPool ?? getLessonQuestions(lessonId);
  return all.filter((q) => q.section === sectionId).length;
}

/**
 * Get the total question count per lesson (for display in lesson cards).
 * If externalPool is provided, returns its length.
 */
export function getLessonQuestionCount(lessonId: number, externalPool?: LessonQuizQuestion[]): number {
  return externalPool ? externalPool.length : getLessonQuestions(lessonId).length;
}
