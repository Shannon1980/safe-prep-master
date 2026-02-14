export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: '1',
    question: 'What does RTE stand for in SAFe?',
    options: ['Release Train Engineer', 'Release Team Executive', 'Rapid Test Environment', 'Release Tracking Engine'],
    correctIndex: 0,
    topic: 'Roles',
  },
  {
    id: '2',
    question: 'What is an ART (Agile Release Train)?',
    options: [
      'A long-lived team of Agile teams that delivers value',
      'A project management methodology',
      'A type of retrospective',
      'An automated deployment tool',
    ],
    correctIndex: 0,
    topic: 'ART',
  },
  {
    id: '3',
    question: 'What does WSJF stand for?',
    options: ['Weighted Shortest Job First', 'Work Stream Job Flow', 'Weekly Sprint Job Forecast', 'Weighted Sprint Job Factor'],
    correctIndex: 0,
    topic: 'Prioritization',
  },
  {
    id: '4',
    question: 'How long is a typical SAFe Program Increment (PI)?',
    options: ['8-12 weeks', '2-4 weeks', '1 week', '6 months'],
    correctIndex: 0,
    topic: 'PI Planning',
  },
  {
    id: '5',
    question: 'What is the primary responsibility of a Scrum Master in SAFe?',
    options: [
      'Facilitating team events and removing impediments',
      'Writing user stories',
      'Managing the product backlog',
      'Defining the technical architecture',
    ],
    correctIndex: 0,
    topic: 'Roles',
  },
  {
    id: '6',
    question: 'What happens during PI Planning?',
    options: [
      'Teams plan their work for the upcoming PI and identify dependencies',
      'Only the Product Owner plans the roadmap',
      'Stakeholders vote on features',
      'The RTE assigns work to teams',
    ],
    correctIndex: 0,
    topic: 'PI Planning',
  },
  {
    id: '7',
    question: 'What is a Feature in SAFe?',
    options: [
      'A service that fulfills a stakeholder need',
      'A single user story',
      'A bug fix',
      'A technical spike',
    ],
    correctIndex: 0,
    topic: 'Backlog',
  },
  {
    id: '8',
    question: 'Who owns the Team Backlog?',
    options: ['The Product Owner', 'The Scrum Master', 'The Development Team', 'The RTE'],
    correctIndex: 0,
    topic: 'Roles',
  },
  {
    id: '9',
    question: 'What is the purpose of the Inspect and Adapt (I&A) event?',
    options: [
      'To reflect on the PI and identify improvements',
      'To deploy to production',
      'To estimate the next PI',
      'To assign new team members',
    ],
    correctIndex: 0,
    topic: 'Events',
  },
  {
    id: '10',
    question: 'In SAFe, what does "Built-in Quality" mean?',
    options: [
      'Quality is built into every step of the development process',
      'Quality is checked only at the end',
      'Quality is the responsibility of QA only',
      'Quality is optional for some features',
    ],
    correctIndex: 0,
    topic: 'Principles',
  },
];
