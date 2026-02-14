export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  category: string;
}

export const FLASHCARDS: Flashcard[] = [
  {
    id: '1',
    term: 'RTE',
    definition: 'Release Train Engineer - A servant leader who facilitates ART events and processes, and assists the teams in delivering value.',
    category: 'Roles',
  },
  {
    id: '2',
    term: 'ART',
    definition: 'Agile Release Train - A long-lived team of Agile teams that, along with stakeholders, develops and delivers solutions.',
    category: 'Structure',
  },
  {
    id: '3',
    term: 'WSJF',
    definition: 'Weighted Shortest Job First - A prioritization model used to sequence jobs (e.g., features, capabilities) for maximum economic benefit.',
    category: 'Prioritization',
  },
  {
    id: '4',
    term: 'PI',
    definition: 'Program Increment - A timebox during which an ART delivers incremental value in the form of working, tested software.',
    category: 'Planning',
  },
  {
    id: '5',
    term: 'PI Planning',
    definition: 'A cadence-based event where the ART gathers to align on priorities and create their PI plan.',
    category: 'Events',
  },
  {
    id: '6',
    term: 'Iteration',
    definition: 'A standard, fixed-duration timebox (typically 2 weeks) where Agile teams deliver incremental value.',
    category: 'Planning',
  },
  {
    id: '7',
    term: 'Feature',
    definition: 'A service that fulfills a stakeholder need and provides business value. Features are sized to fit in a single PI.',
    category: 'Backlog',
  },
  {
    id: '8',
    term: 'Enabler',
    definition: 'Work that supports the activities needed to extend the Architectural Runway or explore technical uncertainty.',
    category: 'Backlog',
  },
  {
    id: '9',
    term: 'Spike',
    definition: 'A time-boxed period used to research a concept or create a simple prototype to reduce risk or uncertainty.',
    category: 'Practices',
  },
  {
    id: '10',
    term: 'System Demo',
    definition: 'A significant event where the ART demonstrates the integrated work of all teams to stakeholders.',
    category: 'Events',
  },
  {
    id: '11',
    term: 'Inspect and Adapt',
    definition: 'A significant event held at the end of each PI where the ART reflects and identifies improvement actions.',
    category: 'Events',
  },
  {
    id: '12',
    term: 'Architectural Runway',
    definition: 'Existing technical infrastructure that supports the implementation of high-priority features without excessive redesign.',
    category: 'Technical',
  },
];
