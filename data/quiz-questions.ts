export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ============================================================
  // LESSON 1: Introducing Scrum in SAFe
  // ============================================================
  {
    id: '1',
    question: 'What is the primary benefit of incremental delivery over a Waterfall approach?',
    options: [
      'Fast feedback and early value delivery',
      'Less documentation is needed',
      'Fewer team members are required',
      'The project scope never changes',
    ],
    correctIndex: 0,
    topic: 'Lesson 1 – Agile Basics',
  },
  {
    id: '2',
    question: 'Which of the following is NOT one of the four values of the Agile Manifesto?',
    options: [
      'Comprehensive testing over manual verification',
      'Individuals and interactions over processes and tools',
      'Working software over comprehensive documentation',
      'Responding to change over following a plan',
    ],
    correctIndex: 0,
    topic: 'Lesson 1 – Agile Basics',
  },
  {
    id: '3',
    question: 'What are the three pillars of Scrum?',
    options: [
      'Transparency, Inspection, and Adaptation',
      'Focus, Commitment, and Courage',
      'Planning, Execution, and Review',
      'Communication, Collaboration, and Coordination',
    ],
    correctIndex: 0,
    topic: 'Lesson 1 – Scrum Basics',
  },
  {
    id: '4',
    question: 'Which five values does Scrum emphasize?',
    options: [
      'Focus, Openness, Respect, Commitment, and Courage',
      'Trust, Transparency, Teamwork, Quality, and Speed',
      'Simplicity, Feedback, Communication, Courage, and Respect',
      'Inspection, Adaptation, Transparency, Commitment, and Focus',
    ],
    correctIndex: 0,
    topic: 'Lesson 1 – Scrum Basics',
  },
  {
    id: '5',
    question: 'In SAFe, what is the equivalent of a Scrum "Sprint"?',
    options: [
      'Iteration',
      'Program Increment',
      'Release Train',
      'Innovation Cycle',
    ],
    correctIndex: 0,
    topic: 'Lesson 1 – Scrum Basics',
  },
  {
    id: '6',
    question: 'What is the SAFe equivalent of the "Daily Scrum"?',
    options: [
      'Team Sync',
      'Coach Sync',
      'ART Sync',
      'PO Sync',
    ],
    correctIndex: 0,
    topic: 'Lesson 1 – Scrum Basics',
  },
  {
    id: '7',
    question: 'What is the recommended iteration length in SAFe?',
    options: [
      'Two weeks',
      'One week',
      'Three weeks',
      'Four weeks',
    ],
    correctIndex: 0,
    topic: 'Lesson 1 – Scrum Basics',
  },
  {
    id: '8',
    question: 'Who owns and prioritizes the Team Backlog?',
    options: [
      'The Product Owner',
      'The Scrum Master',
      'The RTE',
      'The Development Team',
    ],
    correctIndex: 0,
    topic: 'Lesson 1 – Scrum Basics',
  },
  {
    id: '9',
    question: 'How many members does a typical Agile Team in SAFe contain?',
    options: [
      '10 or fewer',
      'Exactly 7',
      '15 to 20',
      '5 or fewer',
    ],
    correctIndex: 0,
    topic: 'Lesson 1 – Agile Team',
  },
  {
    id: '10',
    question: 'What are the two specialty roles on an Agile Team in SAFe?',
    options: [
      'Scrum Master and Product Owner',
      'RTE and Product Manager',
      'System Architect and UX Designer',
      'Tech Lead and QA Lead',
    ],
    correctIndex: 0,
    topic: 'Lesson 1 – Agile Team',
  },
  {
    id: '11',
    question: 'An Agile Release Train (ART) is a virtual organization of how many teams?',
    options: [
      '5 to 12 teams (50–125+ individuals)',
      '2 to 4 teams (10–40 individuals)',
      '15 to 20 teams (200+ individuals)',
      'Exactly 10 teams (100 individuals)',
    ],
    correctIndex: 0,
    topic: 'Lesson 1 – Agile Team',
  },
  {
    id: '12',
    question: 'Which of the following is NOT a built-in quality practice in SAFe?',
    options: [
      'Status reporting to management',
      'Pairing and peer review',
      'Collective ownership and T-shaped skills',
      'Workflow automation',
    ],
    correctIndex: 0,
    topic: 'Lesson 1 – Agile Team',
  },
  {
    id: '13',
    question: 'What is the primary purpose of implementing stories in vertical slices?',
    options: [
      'To enable short feedback cycles and frequent integration',
      'To reduce the number of team members needed',
      'To eliminate the need for testing',
      'To allow parallel Waterfall execution',
    ],
    correctIndex: 0,
    topic: 'Lesson 1 – Scrum Basics',
  },

  // ============================================================
  // LESSON 2: Characterizing the Role of the Scrum Master
  // ============================================================
  {
    id: '14',
    question: 'What are the five key responsibilities of a Scrum Master in SAFe?',
    options: [
      'Facilitating PI Planning, Supporting Iteration Execution, Improving Flow, Building High-Performing Teams, Improving ART Performance',
      'Writing user stories, Managing the backlog, Assigning tasks, Testing software, Deploying code',
      'Sprint Planning, Sprint Review, Sprint Retrospective, Daily Scrum, Backlog Refinement',
      'Architecture design, Code review, Release management, Stakeholder communication, Budget planning',
    ],
    correctIndex: 0,
    topic: 'Lesson 2 – SM Role',
  },
  {
    id: '15',
    question: 'What type of leadership does a Scrum Master practice?',
    options: [
      'Servant leadership',
      'Command-and-control leadership',
      'Autocratic leadership',
      'Transactional leadership',
    ],
    correctIndex: 0,
    topic: 'Lesson 2 – SM Role',
  },
  {
    id: '16',
    question: 'Which behavior should a Scrum Master move TOWARD according to SAFe?',
    options: [
      'Being a facilitator instead of a subject matter expert',
      'Driving toward specific outcomes chosen by the Scrum Master',
      'Knowing the answer and telling the team',
      'Directing team members on what to work on',
    ],
    correctIndex: 0,
    topic: 'Lesson 2 – SM Role',
  },
  {
    id: '17',
    question: 'Who facilitates the Coach Sync?',
    options: [
      'The RTE',
      'The Product Owner',
      'The Scrum Master',
      'The System Architect',
    ],
    correctIndex: 0,
    topic: 'Lesson 2 – Events',
  },
  {
    id: '18',
    question: 'What is the timebox for the Team Sync (Daily Stand-up) in SAFe?',
    options: [
      '15 minutes',
      '30 minutes',
      '1 hour',
      '45 minutes',
    ],
    correctIndex: 0,
    topic: 'Lesson 2 – Events',
  },
  {
    id: '19',
    question: 'According to Patrick Lencioni, what is the foundational dysfunction of a team?',
    options: [
      'Absence of Trust',
      'Fear of Conflict',
      'Lack of Commitment',
      'Inattention to Results',
    ],
    correctIndex: 0,
    topic: 'Lesson 2 – High-Performing Teams',
  },
  {
    id: '20',
    question: 'What are the four stages of team development according to Tuckman?',
    options: [
      'Forming, Storming, Norming, Performing',
      'Planning, Executing, Reviewing, Adapting',
      'Starting, Growing, Maturing, Declining',
      'Building, Testing, Deploying, Maintaining',
    ],
    correctIndex: 0,
    topic: 'Lesson 2 – High-Performing Teams',
  },
  {
    id: '21',
    question: 'What is the Scrum Master\'s approach to resolving conflicts?',
    options: [
      'Meet with conflicting parties, identify what each wants and why, find common ground',
      'Make the decision for the team to avoid wasting time',
      'Escalate all conflicts to the RTE immediately',
      'Ignore the conflict and let the team sort it out',
    ],
    correctIndex: 0,
    topic: 'Lesson 2 – High-Performing Teams',
  },

  // ============================================================
  // LESSON 3: Experiencing PI Planning
  // ============================================================
  {
    id: '22',
    question: 'How long is PI Planning and how often does it occur?',
    options: [
      '2 days, every 8–12 weeks',
      '1 day, every 4 weeks',
      '3 days, every 6 months',
      '1 week, every quarter',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – PI Planning',
  },
  {
    id: '23',
    question: 'What are PI objectives?',
    options: [
      'Business summaries of what each team intends to deliver in the upcoming PI',
      'Detailed technical specifications for each feature',
      'Individual performance goals for team members',
      'Budget allocations for the next quarter',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – PI Planning',
  },
  {
    id: '24',
    question: 'What is the purpose of uncommitted objectives in PI Planning?',
    options: [
      'To improve the predictability of delivering business value by providing a guard band',
      'To assign extra work to high-performing teams',
      'To replace committed objectives when things go wrong',
      'To track technical debt items separately',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – PI Planning',
  },
  {
    id: '25',
    question: 'What does INVEST stand for in the context of writing good user stories?',
    options: [
      'Independent, Negotiable, Valuable, Estimable, Small, Testable',
      'Iterative, Necessary, Verified, Essential, Scoped, Tracked',
      'Incremental, Notable, Viable, Efficient, Simple, Timely',
      'Integrated, Normalized, Valid, Executable, Secure, Tested',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – PI Planning',
  },
  {
    id: '26',
    question: 'What are the three Cs of a good user story?',
    options: [
      'Card, Conversation, Confirmation',
      'Context, Criteria, Completion',
      'Customer, Code, Commitment',
      'Clarity, Completeness, Correctness',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – PI Planning',
  },
  {
    id: '27',
    question: 'What factors does a story point estimate represent?',
    options: [
      'Volume, Complexity, Knowledge, and Uncertainty',
      'Time, Cost, Quality, and Scope',
      'Lines of code, Test cases, Bug count, and Risk',
      'Hours, Days, Sprints, and Releases',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – PI Planning',
  },
  {
    id: '28',
    question: 'What does ROAM stand for when categorizing PI risks?',
    options: [
      'Resolved, Owned, Accepted, Mitigated',
      'Reviewed, Organized, Assigned, Managed',
      'Reported, Observed, Analyzed, Monitored',
      'Ranked, Outlined, Addressed, Minimized',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – PI Planning',
  },
  {
    id: '29',
    question: 'What does a confidence vote measure at the end of PI Planning?',
    options: [
      'Each team\'s confidence in meeting their agreed-to PI objectives',
      'How well the RTE facilitated the planning event',
      'Whether stakeholders approve the budget',
      'Individual team member satisfaction with the plan',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – PI Planning',
  },
  {
    id: '30',
    question: 'Who assigns business value (1–10) to team PI objectives?',
    options: [
      'Business Owners',
      'Product Owners',
      'Scrum Masters',
      'The RTE',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – PI Planning',
  },
  {
    id: '31',
    question: 'What are the four types of enabler stories?',
    options: [
      'Infrastructure, Architecture, Exploration, and Compliance',
      'Technical, Functional, Design, and Testing',
      'Backend, Frontend, Database, and Integration',
      'User, System, Performance, and Security',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – PI Planning',
  },
  {
    id: '32',
    question: 'What is a spike in SAFe?',
    options: [
      'A time-boxed research activity to reduce risk or increase estimate reliability',
      'A sudden increase in team velocity',
      'An emergency production bug fix',
      'A mandatory code review process',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – PI Planning',
  },
  {
    id: '33',
    question: 'What is the Scrum Master\'s role during PI Planning?',
    options: [
      'Maintain timeboxes, facilitate coordination, ensure honest confidence votes, and manage the ART planning board',
      'Write all user stories and assign them to developers',
      'Present the product vision and prioritize features',
      'Make all architectural decisions for the team',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – PI Planning',
  },
  {
    id: '34',
    question: 'What is a common anti-pattern during PI Planning?',
    options: [
      'Pressure is put on the team to overcommit',
      'Teams identify risks and dependencies',
      'Business Owners assign business value to objectives',
      'Teams collaborate across the ART',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – PI Planning',
  },

  // ============================================================
  // LESSON 4: Facilitating Iteration Execution
  // ============================================================
  {
    id: '35',
    question: 'What is the timebox for Iteration Planning?',
    options: [
      'Four hours or less per iteration',
      'Two hours maximum',
      'One full day',
      'Thirty minutes',
    ],
    correctIndex: 0,
    topic: 'Lesson 4 – Iteration Planning',
  },
  {
    id: '36',
    question: 'What is the purpose of capacity allocation in SAFe?',
    options: [
      'To balance internal work like maintenance and refactors with new user stories',
      'To assign specific tasks to individual team members',
      'To determine how many meetings to schedule',
      'To calculate the project budget',
    ],
    correctIndex: 0,
    topic: 'Lesson 4 – Iteration Planning',
  },
  {
    id: '37',
    question: 'What three questions does each person answer during the Team Sync?',
    options: [
      'What did I do yesterday, what will I do today, and are there any impediments?',
      'What is my task, who should I pair with, and when will I finish?',
      'What feature am I on, what is the priority, and who is my reviewer?',
      'What is the scope, what is the deadline, and what is the risk?',
    ],
    correctIndex: 0,
    topic: 'Lesson 4 – Team Sync',
  },
  {
    id: '38',
    question: 'What is the timebox for a Backlog Refinement session?',
    options: [
      '1–2 hours per iteration',
      '4 hours per iteration',
      '15 minutes daily',
      '1 full day per PI',
    ],
    correctIndex: 0,
    topic: 'Lesson 4 – Backlog Refinement',
  },
  {
    id: '39',
    question: 'What is the primary purpose of the Iteration Review?',
    options: [
      'To demonstrate working software and collect stakeholder feedback',
      'To assign work for the next iteration',
      'To review team performance metrics',
      'To update the project timeline',
    ],
    correctIndex: 0,
    topic: 'Lesson 4 – Iteration Review',
  },
  {
    id: '40',
    question: 'Who should be invited to the Iteration Retrospective?',
    options: [
      'Only Agile Team members—no other stakeholders',
      'All ART stakeholders and Business Owners',
      'Only the Scrum Master and Product Owner',
      'Management and executives',
    ],
    correctIndex: 0,
    topic: 'Lesson 4 – Retrospective',
  },
  {
    id: '41',
    question: 'What does the CALMR approach to DevOps stand for?',
    options: [
      'Culture, Automation, Lean flow, Measurement, Recovery',
      'Collaboration, Agility, Lean, Management, Resilience',
      'Continuous, Automated, Lightweight, Managed, Reliable',
      'Code, Architecture, Logging, Monitoring, Reporting',
    ],
    correctIndex: 0,
    topic: 'Lesson 4 – DevOps',
  },
  {
    id: '42',
    question: 'Which of the following is one of the eight flow accelerators in SAFe?',
    options: [
      'Visualize and limit WIP',
      'Increase batch sizes for efficiency',
      'Add more status reporting',
      'Extend iteration lengths',
    ],
    correctIndex: 0,
    topic: 'Lesson 4 – Flow',
  },
  {
    id: '43',
    question: 'What does flow velocity measure?',
    options: [
      'The number of backlog items completed in a given timeframe',
      'How fast team members type code',
      'The speed of the CI/CD pipeline',
      'How quickly meetings are completed',
    ],
    correctIndex: 0,
    topic: 'Lesson 4 – Flow',
  },
  {
    id: '44',
    question: 'What is the purpose of WIP (Work in Process) limits?',
    options: [
      'To balance WIP against available capacity and improve throughput',
      'To limit the number of team members who can work simultaneously',
      'To restrict which teams can access the backlog',
      'To cap the total number of features in a PI',
    ],
    correctIndex: 0,
    topic: 'Lesson 4 – Flow',
  },
  {
    id: '45',
    question: 'What is a common anti-pattern during the Iteration Review?',
    options: [
      'The demo is mainly talk/slides instead of working software',
      'Different team members take turns presenting',
      'Stakeholders provide feedback during the demo',
      'The team celebrates accomplishments',
    ],
    correctIndex: 0,
    topic: 'Lesson 4 – Iteration Review',
  },

  // ============================================================
  // LESSON 5: Finishing the PI
  // ============================================================
  {
    id: '46',
    question: 'What is the Innovation and Planning (IP) iteration used for?',
    options: [
      'Innovation, hackathons, PI Planning preparation, and as a capacity guard band',
      'Only for fixing production bugs',
      'Vacation time for the team',
      'Writing documentation and reports',
    ],
    correctIndex: 0,
    topic: 'Lesson 5 – IP Iteration',
  },
  {
    id: '47',
    question: 'What are the three parts of the Inspect & Adapt (I&A) event?',
    options: [
      'PI System Demo, Quantitative/Qualitative Measurement, and Problem-Solving Workshop',
      'Sprint Review, Retrospective, and Planning',
      'Code Review, Architecture Review, and Budget Review',
      'Team Assessment, Manager Feedback, and Goal Setting',
    ],
    correctIndex: 0,
    topic: 'Lesson 5 – Inspect & Adapt',
  },
  {
    id: '48',
    question: 'What is the timebox for the Inspect & Adapt event?',
    options: [
      'Three to four hours per PI',
      'One full day per PI',
      'Thirty minutes per iteration',
      'Two days per PI',
    ],
    correctIndex: 0,
    topic: 'Lesson 5 – Inspect & Adapt',
  },
  {
    id: '49',
    question: 'What happens without the IP iteration?',
    options: [
      'Technical debt grows, people burn out, and there is no time to plan or innovate',
      'Teams deliver more features per PI',
      'Velocity increases significantly',
      'Stakeholders receive more frequent demos',
    ],
    correctIndex: 0,
    topic: 'Lesson 5 – IP Iteration',
  },
  {
    id: '50',
    question: 'What tool is used in the problem-solving workshop to identify the biggest root cause?',
    options: [
      'Pareto analysis',
      'SWOT analysis',
      'Risk matrix',
      'Gantt chart',
    ],
    correctIndex: 0,
    topic: 'Lesson 5 – Inspect & Adapt',
  },
  {
    id: '51',
    question: 'How is ART predictability measured?',
    options: [
      'By comparing planned business value against actual business value achieved for PI objectives',
      'By counting the number of features completed',
      'By measuring individual developer productivity',
      'By tracking the number of meetings held',
    ],
    correctIndex: 0,
    topic: 'Lesson 5 – Inspect & Adapt',
  },

  // ============================================================
  // LESSON 6: AI for Scrum Masters
  // ============================================================
  {
    id: '52',
    question: 'What are the three common risks of AI mentioned in the SAFe Scrum Master course?',
    options: [
      'Bias, Hallucination, and Data Leaks',
      'Speed, Accuracy, and Cost',
      'Complexity, Scalability, and Maintenance',
      'Privacy, Performance, and Availability',
    ],
    correctIndex: 0,
    topic: 'Lesson 6 – AI for SMs',
  },
  {
    id: '53',
    question: 'What does RAG stand for in the context of AI?',
    options: [
      'Retrieval Augmented Generation',
      'Rapid Agile Generation',
      'Responsive AI Gateway',
      'Risk Assessment Guide',
    ],
    correctIndex: 0,
    topic: 'Lesson 6 – AI for SMs',
  },
  {
    id: '54',
    question: 'What are the five components of a basic AI prompt structure?',
    options: [
      'Goal, Role, Task, Context, and Details',
      'Input, Process, Output, Feedback, and Iterate',
      'Question, Data, Model, Result, and Verify',
      'Subject, Verb, Object, Tone, and Format',
    ],
    correctIndex: 0,
    topic: 'Lesson 6 – AI for SMs',
  },
  {
    id: '55',
    question: 'What are the three dimensions of Responsible AI?',
    options: [
      'Trustworthy, Explainable, and Human-centric',
      'Fast, Accurate, and Cheap',
      'Automated, Scalable, and Reliable',
      'Open-source, Proprietary, and Hybrid',
    ],
    correctIndex: 0,
    topic: 'Lesson 6 – AI for SMs',
  },
  {
    id: '56',
    question: 'What are the five steps to develop an AI-augmented workforce?',
    options: [
      'Identify AI tools, Ensure responsible use, Measure impact, Invest in upskilling, Foster innovation culture',
      'Buy AI tools, Train developers, Deploy models, Monitor output, Scale globally',
      'Define requirements, Select vendors, Implement, Test, Go live',
      'Plan, Execute, Review, Adapt, Repeat',
    ],
    correctIndex: 0,
    topic: 'Lesson 6 – AI for SMs',
  },

  // ============================================================
  // MIXED / CROSS-LESSON QUESTIONS
  // ============================================================
  {
    id: '57',
    question: 'What does RTE stand for in SAFe?',
    options: [
      'Release Train Engineer',
      'Release Team Executive',
      'Rapid Test Environment',
      'Release Tracking Engine',
    ],
    correctIndex: 0,
    topic: 'Roles',
  },
  {
    id: '58',
    question: 'What does WSJF stand for?',
    options: [
      'Weighted Shortest Job First',
      'Work Stream Job Flow',
      'Weekly Sprint Job Forecast',
      'Weighted Sprint Job Factor',
    ],
    correctIndex: 0,
    topic: 'Prioritization',
  },
  {
    id: '59',
    question: 'A team meets its commitments by doing everything they said they would do, OR by:',
    options: [
      'Immediately raising the concern if it isn\'t feasible',
      'Working overtime until all objectives are met',
      'Dropping the lowest-priority objective silently',
      'Waiting until the next PI Planning to report issues',
    ],
    correctIndex: 0,
    topic: 'Lesson 4 – Commitment',
  },
  {
    id: '60',
    question: 'What is the purpose of a Feature\'s benefit hypothesis?',
    options: [
      'To justify development costs and provide business perspective for decision-making',
      'To describe the technical implementation approach',
      'To assign story points to the feature',
      'To document the testing strategy',
    ],
    correctIndex: 0,
    topic: 'Lesson 3 – Features',
  },
];
