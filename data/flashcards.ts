export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  category: string;
}

export const FLASHCARDS: Flashcard[] = [
  // ============================================================
  // LESSON 1: Introducing Scrum in SAFe
  // ============================================================
  {
    id: '1',
    term: 'Agile Manifesto',
    definition: 'A declaration of four core values: Individuals & interactions over processes & tools, Working software over comprehensive documentation, Customer collaboration over contract negotiation, Responding to change over following a plan.',
    category: 'Lesson 1 – Agile Basics',
  },
  {
    id: '2',
    term: 'Three Pillars of Scrum',
    definition: 'Transparency, Inspection, and Adaptation — the foundational principles that support the Scrum Values.',
    category: 'Lesson 1 – Scrum Basics',
  },
  {
    id: '3',
    term: 'Scrum Values',
    definition: 'Focus, Openness, Respect, Commitment, and Courage — the five values that guide Scrum team behavior.',
    category: 'Lesson 1 – Scrum Basics',
  },
  {
    id: '4',
    term: 'Iteration',
    definition: 'A fixed-duration timebox (typically 2 weeks in SAFe) where Agile Teams define, build, integrate, and test stories from their Iteration Backlog. The SAFe equivalent of a Scrum Sprint.',
    category: 'Lesson 1 – Scrum Basics',
  },
  {
    id: '5',
    term: 'Team Sync',
    definition: 'A 15-minute daily event where team members sync on progress toward iteration goals. The SAFe equivalent of the Daily Scrum.',
    category: 'Lesson 1 – Scrum Basics',
  },
  {
    id: '6',
    term: 'Team Backlog',
    definition: 'An ordered list of all work for the Agile Team. Created by the team, owned and prioritized by the Product Owner. Represents opportunities, not commitments.',
    category: 'Lesson 1 – Scrum Basics',
  },
  {
    id: '7',
    term: 'Vertical Slices',
    definition: 'Implementing stories as thin, end-to-end slices of functionality. Enables short feedback cycles, refined understanding, and more frequent integration.',
    category: 'Lesson 1 – Scrum Basics',
  },
  {
    id: '8',
    term: 'Agile Team',
    definition: 'A cross-functional, self-organizing team of 10 or fewer members that can define, build, test, and deploy increments of value. Includes two specialty roles: Scrum Master and Product Owner.',
    category: 'Lesson 1 – Agile Team',
  },
  {
    id: '9',
    term: 'Agile Release Train (ART)',
    definition: 'A virtual organization of 5–12 Agile Teams (50–125+ people) synchronized on a common cadence (PI), aligned to a common mission via a single ART backlog.',
    category: 'Lesson 1 – Agile Team',
  },
  {
    id: '10',
    term: 'Built-in Quality Practices',
    definition: 'Shift learning left, Pairing and peer review, Collective ownership and T-shaped skills, Artifact standards and Definition of Done (DoD), and Workflow automation.',
    category: 'Lesson 1 – Agile Team',
  },

  // ============================================================
  // LESSON 2: Characterizing the Role of the Scrum Master
  // ============================================================
  {
    id: '11',
    term: 'Scrum Master Responsibilities',
    definition: 'Five key areas: Facilitating PI Planning, Supporting Iteration Execution, Improving Flow, Building High-Performing Teams, and Improving ART Performance.',
    category: 'Lesson 2 – SM Role',
  },
  {
    id: '12',
    term: 'Servant Leadership',
    definition: '"The great leader is seen as servant first." A Scrum Master listens, empathizes, supports personal development, persuades rather than uses authority, thinks beyond day-to-day, and appreciates openness.',
    category: 'Lesson 2 – SM Role',
  },
  {
    id: '13',
    term: 'Coach Sync',
    definition: 'A weekly (or more frequent) 30–60 minute event facilitated by the RTE where Scrum Masters share visibility into risks, dependencies, progress, and impediments.',
    category: 'Lesson 2 – Events',
  },
  {
    id: '14',
    term: 'PO Sync',
    definition: 'A weekly 30–60 minute event where Product Owners, Product Managers, and stakeholders review progress and re-align ART priorities as needed.',
    category: 'Lesson 2 – Events',
  },
  {
    id: '15',
    term: 'Tuckman\'s Stages',
    definition: 'Four stages of team development: Forming (coming together), Storming (conflict), Norming (establishing norms), and Performing (high performance).',
    category: 'Lesson 2 – High-Performing Teams',
  },
  {
    id: '16',
    term: 'Five Dysfunctions of a Team',
    definition: 'Lencioni\'s model: Absence of Trust → Fear of Conflict → Lack of Commitment → Avoidance of Accountability → Inattention to Results. Trust is the foundational issue.',
    category: 'Lesson 2 – High-Performing Teams',
  },
  {
    id: '17',
    term: 'Working Agreements',
    definition: 'Team-created agreements that facilitate conflict management. Examples: respect opinions, seek consensus, avoid blocking the team, support team decisions.',
    category: 'Lesson 2 – High-Performing Teams',
  },

  // ============================================================
  // LESSON 3: Experiencing PI Planning
  // ============================================================
  {
    id: '18',
    term: 'PI Planning',
    definition: 'A 2-day cadence-based event every 8–12 weeks that serves as the heartbeat of the ART. Everyone plans together, aligning teams to a shared mission and vision.',
    category: 'Lesson 3 – PI Planning',
  },
  {
    id: '19',
    term: 'PI Objectives',
    definition: 'Business summaries of what each team intends to deliver in the upcoming PI. Often directly relate to features. Business Owners assign values from 1 (low) to 10 (high).',
    category: 'Lesson 3 – PI Planning',
  },
  {
    id: '20',
    term: 'Uncommitted Objectives',
    definition: 'Planned objectives not included in the commitment, providing a guard band for predictability. They are planned work (not "just in case"), and count when calculating load.',
    category: 'Lesson 3 – PI Planning',
  },
  {
    id: '21',
    term: 'Feature',
    definition: 'A service that fulfills a stakeholder need, justified by a benefit hypothesis. Has acceptance criteria. Fits in one PI for one ART.',
    category: 'Lesson 3 – Backlog',
  },
  {
    id: '22',
    term: 'User Story',
    definition: 'A small increment of value developed in days. Uses the user-voice form: "As a [user], I want [goal] so that [benefit]." Stories fit in one iteration for one team.',
    category: 'Lesson 3 – Backlog',
  },
  {
    id: '23',
    term: 'INVEST',
    definition: 'Criteria for good stories: Independent, Negotiable, Valuable, Estimable, Small, and Testable.',
    category: 'Lesson 3 – Stories',
  },
  {
    id: '24',
    term: 'Three Cs',
    definition: 'Card (written description), Conversation (details discussed with PO), and Confirmation (acceptance criteria) — the three elements of a good user story.',
    category: 'Lesson 3 – Stories',
  },
  {
    id: '25',
    term: 'Story Points',
    definition: 'A relative estimate representing Volume, Complexity, Knowledge, and Uncertainty. Not connected to any specific unit of measure. Use the modified Fibonacci scale.',
    category: 'Lesson 3 – Estimation',
  },
  {
    id: '26',
    term: 'Estimating Poker',
    definition: 'A technique combining expert opinion, analogy, and disaggregation. All members participate, discuss differences, and re-estimate using Fibonacci cards (1, 2, 3, 5, 8, 13, 20, 40, 100).',
    category: 'Lesson 3 – Estimation',
  },
  {
    id: '27',
    term: 'ROAM',
    definition: 'A framework for categorizing PI risks: Resolved (no longer a concern), Owned (someone took responsibility), Accepted (release may be compromised), Mitigated (plan to adjust).',
    category: 'Lesson 3 – PI Planning',
  },
  {
    id: '28',
    term: 'Confidence Vote',
    definition: 'A vote (1–5 fingers) taken by each team and the ART at the end of PI Planning. Teams commit to do everything in their power to meet objectives, and to escalate immediately if not achievable.',
    category: 'Lesson 3 – PI Planning',
  },
  {
    id: '29',
    term: 'Enabler Stories',
    definition: 'Stories that build groundwork for future work. Four types: Infrastructure, Architecture, Exploration, and Compliance.',
    category: 'Lesson 3 – Backlog',
  },
  {
    id: '30',
    term: 'Spike',
    definition: 'A time-boxed exploration enabler to gain knowledge, reduce risk, or increase estimate reliability. Can be technical (researching an approach) or functional (understanding user interaction).',
    category: 'Lesson 3 – Backlog',
  },

  // ============================================================
  // LESSON 4: Facilitating Iteration Execution
  // ============================================================
  {
    id: '31',
    term: 'Iteration Planning',
    definition: 'A 4-hour (or less) event to sequence and estimate stories, establish capacity, apply capacity allocation, and commit to iteration goals.',
    category: 'Lesson 4 – Planning',
  },
  {
    id: '32',
    term: 'Capacity Allocation',
    definition: 'Balancing work types: new user stories vs. maintenance/refactors. Helps alleviate velocity degradation from technical debt. Can change at iteration or PI boundaries.',
    category: 'Lesson 4 – Planning',
  },
  {
    id: '33',
    term: 'Iteration Goals',
    definition: 'Goals that provide clarity, commitment, and management information. They align team members to a common purpose and align teams to PI objectives.',
    category: 'Lesson 4 – Planning',
  },
  {
    id: '34',
    term: 'Backlog Refinement',
    definition: 'A 1–2 hour session per iteration. The PO presents candidate stories, the team discusses, estimates, splits stories as needed, and clarifies acceptance criteria.',
    category: 'Lesson 4 – Refinement',
  },
  {
    id: '35',
    term: 'Iteration Review',
    definition: 'A 1–2 hour event demonstrating every story, spike, refactor, and NFR. Shows working software to stakeholders and collects feedback. Facilitated by the Scrum Master.',
    category: 'Lesson 4 – Review',
  },
  {
    id: '36',
    term: 'Iteration Retrospective',
    definition: 'A 1-hour (or less) event for the Agile Team only. Two parts: Quantitative (metrics review) and Qualitative (what went well, what didn\'t, what to improve/preserve).',
    category: 'Lesson 4 – Retrospective',
  },
  {
    id: '37',
    term: 'Flow Velocity',
    definition: 'Measures the number of backlog items completed in a given timeframe (e.g., story points per iteration).',
    category: 'Lesson 4 – Flow Metrics',
  },
  {
    id: '38',
    term: 'Flow Load',
    definition: 'Indicates how many items are currently in the system. Visualized with a cumulative flow diagram.',
    category: 'Lesson 4 – Flow Metrics',
  },
  {
    id: '39',
    term: 'Flow Distribution',
    definition: 'Measures the amount of each type of work (stories, enablers, maintenance) in the system over time.',
    category: 'Lesson 4 – Flow Metrics',
  },
  {
    id: '40',
    term: 'Eight Flow Accelerators',
    definition: '1) Visualize & limit WIP, 2) Address bottlenecks, 3) Minimize handoffs, 4) Get faster feedback, 5) Work in smaller batches, 6) Reduce queue lengths, 7) Optimize time in the zone, 8) Remediate legacy policies.',
    category: 'Lesson 4 – Flow',
  },
  {
    id: '41',
    term: 'CALMR (DevOps)',
    definition: 'Culture of shared responsibility, Automation of the Continuous Delivery Pipeline, Lean flow accelerates delivery, Measurement of flow/quality/value, Recovery reduces risk and preserves value.',
    category: 'Lesson 4 – DevOps',
  },

  // ============================================================
  // LESSON 5: Finishing the PI
  // ============================================================
  {
    id: '42',
    term: 'IP Iteration',
    definition: 'Innovation and Planning iteration: provides time for innovation, hackathons, infrastructure improvements, PI Planning preparation, and serves as a capacity guard band for cadence-based delivery.',
    category: 'Lesson 5 – IP Iteration',
  },
  {
    id: '43',
    term: 'Hackathon',
    definition: 'A 1–2 day event during IP iteration where teams work on new ideas. People work on whatever they want with whomever, as long as it reflects the company mission. Teams demo results afterward.',
    category: 'Lesson 5 – IP Iteration',
  },
  {
    id: '44',
    term: 'Inspect & Adapt (I&A)',
    definition: 'A 3–4 hour event at the end of each PI with three parts: PI System Demo, Quantitative & Qualitative Measurement, and Problem-Solving Workshop.',
    category: 'Lesson 5 – I&A',
  },
  {
    id: '45',
    term: 'Problem-Solving Workshop',
    definition: 'Part of I&A: Agree on the problem, use Pareto analysis to identify the biggest root cause, apply 5 Whys, restate the problem, brainstorm solutions, and identify improvement backlog items.',
    category: 'Lesson 5 – I&A',
  },
  {
    id: '46',
    term: 'ART Predictability Measure',
    definition: 'Compares planned business value against actual business value achieved across all team PI objectives. Target is an effective process control range (80–100%).',
    category: 'Lesson 5 – I&A',
  },

  // ============================================================
  // LESSON 6: AI for Scrum Masters
  // ============================================================
  {
    id: '47',
    term: 'AI Risks: Bias, Hallucination, Data Leaks',
    definition: 'Bias: unfair outcomes from biased training data. Hallucination: AI creates wrong/nonsensical outputs. Data Leaks: confidential info exposed via third-party AI tools.',
    category: 'Lesson 6 – AI',
  },
  {
    id: '48',
    term: 'RAG (Retrieval Augmented Generation)',
    definition: 'A technique allowing an LLM to access and use information from a specific trusted knowledge base to generate more accurate and relevant answers.',
    category: 'Lesson 6 – AI',
  },
  {
    id: '49',
    term: 'AI Prompt Structure',
    definition: 'Five basic components: Goal (what you want to accomplish), Role (persona for the AI), Task (what to do), Context (background info), Details (specific requirements).',
    category: 'Lesson 6 – AI',
  },
  {
    id: '50',
    term: 'Responsible AI',
    definition: 'Three dimensions: Trustworthy (privacy, security, reliability, accuracy), Explainable (transparency, interpretability, accountability), Human-centric (safety, fairness, ethics, inclusiveness, sustainability).',
    category: 'Lesson 6 – AI',
  },

  // ============================================================
  // KEY ROLES
  // ============================================================
  {
    id: '51',
    term: 'RTE (Release Train Engineer)',
    definition: 'A servant leader who facilitates ART events and processes, assists teams in delivering value, and drives continuous improvement at the ART level.',
    category: 'Roles',
  },
  {
    id: '52',
    term: 'Product Owner',
    definition: 'Connects with the customer, contributes to vision and roadmap, manages and prioritizes the team backlog, supports the team in delivering value, and gets/applies fast feedback.',
    category: 'Roles',
  },
  {
    id: '53',
    term: 'WSJF',
    definition: 'Weighted Shortest Job First — a prioritization model used to sequence jobs (features, capabilities) for maximum economic benefit. Cost of Delay divided by job duration.',
    category: 'Prioritization',
  },
  {
    id: '54',
    term: 'Program Increment (PI)',
    definition: 'A timebox (typically 8–12 weeks, with 10 being common) during which an ART delivers incremental value in the form of working, tested software.',
    category: 'Planning',
  },
  {
    id: '55',
    term: 'Architectural Runway',
    definition: 'Existing technical infrastructure that supports implementation of high-priority features without excessive redesign and delay.',
    category: 'Technical',
  },
];
