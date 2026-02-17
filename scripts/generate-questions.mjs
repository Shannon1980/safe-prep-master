import { GoogleGenAI } from '@google/genai';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_KEY = 'AIzaSyAHDDkPbJl0FVVsenO5sjovPikWSymJG4M';
const ai = new GoogleGenAI({ apiKey: API_KEY });

const LESSON_DOMAIN_MAP = {
  1: 'Introducing Scrum in SAFe',
  2: 'Defining the SM/TC Role',
  3: 'Supporting ART Events',
  4: 'Supporting Team Events',
  5: 'Supporting ART Events',
  6: 'Introducing Scrum in SAFe',
};

const LESSONS = [
  {
    id: 1,
    title: 'Introducing Scrum in SAFe',
    sections: [
      { id: 'agile-basics', name: 'Agile Basics', tips: [
        'Review the four values and twelve principles of the Agile Manifesto',
        'Understand incremental vs waterfall delivery approaches',
        'Know that Lean product development is one of SAFe\'s three bodies of knowledge',
      ]},
      { id: 'scrum-basics', name: 'Scrum Basics', tips: [
        'Know the three pillars of Scrum: Transparency, Inspection, Adaptation',
        'Memorize the five Scrum values: Focus, Openness, Respect, Commitment, Courage',
        'Understand SAFe terminology mapping (Sprint→Iteration, Daily Scrum→Team Sync)',
        'Know the recommended iteration length (2 weeks) and concept of vertical slices',
      ]},
      { id: 'agile-team', name: 'Agile Team & ART', tips: [
        'Know the composition of an Agile Team (10 or fewer members, cross-functional)',
        'Understand what an ART is (5-12 teams, 50-125+ people, synchronized on a common cadence)',
        'Review built-in quality practices: pairing, peer review, collective ownership',
      ]},
    ],
  },
  {
    id: 2,
    title: 'Characterizing the Role of the Scrum Master',
    sections: [
      { id: 'sm-role', name: 'SM Responsibilities', tips: [
        'Know the five key SM responsibilities: Facilitate PI Planning, Support Iteration Execution, Improve Flow, Build High-Performing Teams, Improve ART Performance',
        'Understand behaviors to move toward (facilitator, asking the team) and away from (directing, fixing problems)',
        'What falls OUTSIDE SM responsibility: estimating stories, assigning work to team members',
      ]},
      { id: 'servant-leadership', name: 'Servant Leadership', tips: [
        'The SM is a servant leader above all else',
        'Servant leader traits: listen, empathize, persuade (not authority), think beyond day-to-day',
        'Servant leaders use persuasion instead of authority',
      ]},
      { id: 'high-performing-teams', name: 'High-Performing Teams', tips: [
        'Memorize Tuckman\'s stages: Forming, Storming, Norming, Performing',
        'Know Lencioni\'s Five Dysfunctions — Absence of Trust is the foundational issue',
        'Review conflict resolution: meet with parties, identify needs, find common ground',
      ]},
      { id: 'events', name: 'ART-Level Events', tips: [
        'Coach Sync is facilitated by the RTE, provides visibility into risks and progress',
        'Scrum of Scrums reviews the ART\'s progress toward PI Objectives',
        'PO Sync aligns product priorities across the ART',
      ]},
    ],
  },
  {
    id: 3,
    title: 'Experiencing PI Planning',
    sections: [
      { id: 'pi-planning', name: 'PI Planning Event', tips: [
        'PI Planning is 2 days, every 8-12 weeks — the heartbeat of the ART',
        'SM role: maintain timeboxes, facilitate coordination, manage program board',
        'Common anti-patterns: pressure to overcommit, detailed plan becomes the goal over alignment',
      ]},
      { id: 'pi-objectives', name: 'PI Objectives & Confidence', tips: [
        'PI objectives create a near-term focus and vision',
        'Understand committed vs uncommitted objectives',
        'Business Owners assign value (1-10) to PI objectives',
        'ROAM categorizes risks: Resolved, Owned, Accepted, Mitigated',
      ]},
      { id: 'stories-estimation', name: 'Stories & Estimation', tips: [
        'INVEST criteria: Independent, Negotiable, Valuable, Estimable, Small, Testable',
        'Three Cs of user stories: Card, Conversation, Confirmation',
        'Story point factors: Volume, Complexity, Knowledge, Uncertainty',
      ]},
      { id: 'backlog', name: 'Features & Backlog', tips: [
        'Features are justified by a benefit hypothesis',
        'Product Management owns feature priorities during PI Planning',
        'Four types of enabler stories: Infrastructure, Architecture, Exploration, Compliance',
      ]},
    ],
  },
  {
    id: 4,
    title: 'Facilitating Iteration Execution',
    sections: [
      { id: 'iteration-planning', name: 'Iteration Planning', tips: [
        'Timebox is 4 hours or less per iteration',
        'Capacity allocation: balance new stories with maintenance and refactors',
        'Velocity counts only completed stories (50% of a story = 0 points)',
      ]},
      { id: 'team-sync', name: 'Team Sync & Daily Events', tips: [
        'Three questions: What did I do yesterday? What will I do today? Any impediments?',
        '15-minute timebox for the Team Sync',
        'System demo occurs after every iteration',
      ]},
      { id: 'backlog-refinement', name: 'Backlog Refinement', tips: [
        'Timebox: 1-2 hours per iteration',
        'PO presents candidate stories, team discusses, estimates, and splits as needed',
      ]},
      { id: 'review-retro', name: 'Iteration Review & Retrospective', tips: [
        'Only Agile Team members attend the retrospective',
        'Retrospective: Quantitative (metrics) and Qualitative (what went well/didn\'t)',
        'The iteration review demonstrates working software and collects stakeholder feedback',
      ]},
      { id: 'flow-devops', name: 'Flow & DevOps', tips: [
        'CALMR: Culture, Automation, Lean flow, Measurement, Recovery',
        'WIP limits balance work against available capacity to improve throughput',
        'Know the eight flow accelerators',
      ]},
    ],
  },
  {
    id: 5,
    title: 'Finishing the PI',
    sections: [
      { id: 'ip-iteration', name: 'Innovation & Planning Iteration', tips: [
        'IP iteration is for: innovation, hackathons, infrastructure improvements, PI prep',
        'Anti-pattern: planning work for the IP iteration during PI Planning',
        'Consequences of skipping IP: technical debt grows, burnout',
      ]},
      { id: 'inspect-adapt', name: 'Inspect & Adapt', tips: [
        'Three parts: PI System Demo, Quantitative/Qualitative Measurement, Problem-Solving Workshop',
        'Pareto analysis identifies the biggest root cause',
        '5 Whys and Fishbone diagrams for root cause analysis',
      ]},
      { id: 'improvement', name: 'Relentless Improvement', tips: [
        'Two primary opportunities: Iteration Retrospective and Inspect & Adapt event',
        'SM leads team efforts in relentless improvement',
      ]},
    ],
  },
  {
    id: 6,
    title: 'AI for Scrum Masters',
    sections: [
      { id: 'ai-basics', name: 'AI Fundamentals', tips: [
        'Three common AI risks: Bias, Hallucination, Data Leaks',
        'RAG = Retrieval Augmented Generation',
        'Five components of an AI prompt: Goal, Role, Task, Context, Details',
      ]},
      { id: 'responsible-ai', name: 'Responsible AI', tips: [
        'Three dimensions: Trustworthy, Explainable, Human-centric',
        'Five steps to AI-augmented workforce: Identify tools, Ensure responsible use, Measure impact, Invest in upskilling, Foster innovation culture',
      ]},
    ],
  },
];

async function generateForSection(lesson, section, questionsPerSection) {
  const domain = LESSON_DOMAIN_MAP[lesson.id];
  const prompt = `You are an expert SAFe 6.0 Scrum Master certification exam question writer.

Generate exactly ${questionsPerSection} unique, challenging multiple-choice questions for the SAFe Scrum Master 6.0 certification exam.

LESSON: ${lesson.title}
SECTION: ${section.name}
EXAM DOMAIN: ${domain}

Key concepts to test (use these as inspiration but create diverse questions):
${section.tips.map(t => '- ' + t).join('\n')}

REQUIREMENTS:
- Each question MUST have exactly 4 answer options
- Exactly ONE correct answer per question (no multi-select)
- Vary the position of the correct answer across questions (don't always use index 0 or 3)
- Questions should test APPLICATION of knowledge, not just recall
- Include scenario-based questions where appropriate
- Make wrong answers plausible but clearly distinguishable for someone who studied
- Questions must be distinct from each other — no duplicates or near-duplicates
- Use official SAFe 6.0 terminology
- DO NOT repeat standard questions like "What are the three pillars of Scrum?" — create unique angles

Return ONLY a valid JSON array. Each element:
{
  "question": "the question text",
  "options": ["A", "B", "C", "D"],
  "correctIndex": 0
}

No markdown, no explanation, just the JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });
    const text = response.text || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error(`  [FAIL] No JSON found for L${lesson.id}/${section.id}`);
      return [];
    }
    const questions = JSON.parse(jsonMatch[0]);
    return questions
      .filter(q =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctIndex === 'number' &&
        q.correctIndex >= 0 &&
        q.correctIndex <= 3
      )
      .map((q, i) => ({
        ...q,
        lessonId: lesson.id,
        sectionId: section.id,
        domain,
      }));
  } catch (err) {
    console.error(`  [ERROR] L${lesson.id}/${section.id}:`, err.message);
    return [];
  }
}

async function main() {
  console.log('Starting question generation...\n');
  const allQuestions = [];
  let globalIndex = 0;

  for (const lesson of LESSONS) {
    console.log(`\n=== Lesson ${lesson.id}: ${lesson.title} ===`);
    const sectionCount = lesson.sections.length;
    const perSection = Math.ceil(50 / sectionCount);

    for (const section of lesson.sections) {
      console.log(`  Generating ${perSection} questions for "${section.name}"...`);
      const questions = await generateForSection(lesson, section, perSection);
      for (const q of questions) {
        globalIndex++;
        q.id = `gen-L${lesson.id}-${globalIndex}`;
      }
      allQuestions.push(...questions);
      console.log(`  Got ${questions.length} valid questions`);

      // Rate limit
      await new Promise(r => setTimeout(r, 1500));
    }
  }

  console.log(`\n\nTotal generated: ${allQuestions.length} questions`);

  // Deduplicate
  const seen = new Set();
  const deduped = allQuestions.filter(q => {
    const key = q.question.toLowerCase().slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`After dedup: ${deduped.length} questions`);

  const outPath = join(__dirname, 'generated-questions.json');
  writeFileSync(outPath, JSON.stringify(deduped, null, 2));
  console.log(`Written to ${outPath}`);
}

main().catch(console.error);
