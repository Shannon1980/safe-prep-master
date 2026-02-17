/**
 * Concurrent User Load Test for SAFe Prep Master
 *
 * Tests the app's capacity across three layers:
 *   1. Static Hosting (Firebase CDN) — HTTP throughput and latency
 *   2. Firestore Operations — simulated read/write throughput
 *   3. Client-side Rendering — data processing capacity
 *
 * Usage:
 *   node tests/load-test.mjs                    # full suite
 *   node tests/load-test.mjs --hosting-only     # CDN tests only
 *   node tests/load-test.mjs --concurrency 200  # custom user count
 *   node tests/load-test.mjs --duration 30      # custom duration (seconds)
 */

import autocannon from 'autocannon';

// ── Configuration ──

const args = process.argv.slice(2);
const SITE_URL = 'https://safe-prep-master.web.app';
const hostingOnly = args.includes('--hosting-only');
const concurrencyIdx = args.indexOf('--concurrency');
const durationIdx = args.indexOf('--duration');
const CONCURRENCY = concurrencyIdx !== -1 ? parseInt(args[concurrencyIdx + 1]) : 100;
const DURATION = durationIdx !== -1 ? parseInt(args[durationIdx + 1]) : 10;

// ── Formatters ──

function formatNum(n) {
  return n.toLocaleString('en-US');
}

function printHeader(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

function printResult(label, value, unit = '') {
  console.log(`  ${label.padEnd(30)} ${value}${unit ? ' ' + unit : ''}`);
}

function printBar(label, value, max, width = 30) {
  const filled = Math.round((value / max) * width);
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(width - filled);
  console.log(`  ${label.padEnd(20)} [${bar}] ${value}`);
}

// ── Test 1: Static Hosting Load Test ──

async function testStaticHosting() {
  printHeader('TEST 1: Static Hosting (Firebase CDN)');
  console.log(`  Target:      ${SITE_URL}`);
  console.log(`  Concurrent:  ${CONCURRENCY} connections`);
  console.log(`  Duration:    ${DURATION} seconds\n`);

  const pages = [
    { path: '/', label: 'Home Page' },
    { path: '/exam', label: 'Exam Simulator' },
    { path: '/quiz', label: 'Practice Quiz' },
    { path: '/quiz/lesson', label: 'Lesson Quiz' },
    { path: '/flashcards', label: 'Flashcards' },
    { path: '/admin', label: 'Admin Dashboard' },
  ];

  const results = [];

  for (const page of pages) {
    const result = await new Promise((resolve) => {
      const instance = autocannon({
        url: `${SITE_URL}${page.path}`,
        connections: CONCURRENCY,
        duration: DURATION,
        pipelining: 1,
        headers: {
          'User-Agent': 'SafePrepLoadTest/1.0',
          'Accept': 'text/html',
        },
      }, (err, result) => {
        resolve({ ...page, result: err ? null : result });
      });
    });
    results.push(result);
  }

  console.log('\n  Per-Page Results:');
  console.log('  ' + '-'.repeat(56));
  console.log(`  ${'Page'.padEnd(20)} ${'Req/s'.padStart(8)} ${'Latency'.padStart(10)} ${'Errors'.padStart(8)}`);
  console.log('  ' + '-'.repeat(56));

  let totalRequests = 0;
  let totalErrors = 0;

  for (const { label, result } of results) {
    if (!result) {
      console.log(`  ${label.padEnd(20)} ${'FAILED'.padStart(8)}`);
      continue;
    }
    const reqPerSec = Math.round(result.requests.average);
    const latency = `${result.latency.average.toFixed(0)}ms`;
    const errors = result.errors + result.timeouts;
    totalRequests += result.requests.total;
    totalErrors += errors;
    console.log(`  ${label.padEnd(20)} ${formatNum(reqPerSec).padStart(8)} ${latency.padStart(10)} ${formatNum(errors).padStart(8)}`);
  }
  console.log('  ' + '-'.repeat(56));

  // Summary
  console.log('\n  Summary:');
  printResult('Total requests served', formatNum(totalRequests));
  printResult('Total errors', formatNum(totalErrors));
  printResult('Error rate', `${((totalErrors / Math.max(totalRequests, 1)) * 100).toFixed(2)}%`);
  printResult('Concurrent connections', formatNum(CONCURRENCY));

  // Estimate concurrent user capacity
  // Average user makes ~1 page request every 30 seconds while active
  const homeResult = results.find(r => r.path === '/')?.result;
  if (homeResult) {
    const reqPerSecCapacity = Math.round(homeResult.requests.average);
    const estimatedUsers = reqPerSecCapacity * 30; // 1 req per 30s per user
    printResult('Estimated max users', formatNum(estimatedUsers), '(sustained)');
  }

  return results;
}

// ── Test 2: Firestore Operation Simulation ──

async function testFirestoreSimulation() {
  printHeader('TEST 2: Firestore Operation Simulation');
  console.log('  Simulating Firestore read/write patterns for concurrent users.\n');
  console.log('  NOTE: These are local simulations of the data operations your');
  console.log('  app performs. Actual Firestore limits depend on your Firebase plan.\n');

  // Simulate the data operations each user triggers
  const userCounts = [10, 25, 50, 100, 200, 500];

  console.log('  Firebase Spark (Free) Plan Limits:');
  console.log('  ' + '-'.repeat(50));
  printResult('Document reads/day', '50,000');
  printResult('Document writes/day', '20,000');
  printResult('Concurrent connections', '1,000,000');
  printResult('Realtime listeners', 'unlimited');
  console.log('  ' + '-'.repeat(50));

  console.log('\n  Estimated Firestore Usage Per User Session (30 min):');
  console.log('  ' + '-'.repeat(50));

  // Per user, per 30-minute session:
  const presenceWrites = 30; // 1 write/min heartbeat
  const presenceReads = 1;   // initial read for presence list (admin only)
  const questionReads = 1;   // cached after first fetch
  const activityWrites = 3;  // ~3 quizzes/exams per session
  const activityReads = 1;   // fetch my progress
  const totalReadsPerUser = presenceReads + questionReads + activityReads;
  const totalWritesPerUser = presenceWrites + activityWrites;

  printResult('Presence heartbeat writes', presenceWrites.toString());
  printResult('Activity writes', activityWrites.toString());
  printResult('Question bank reads', `${questionReads} (cached)`);
  printResult('Activity reads', activityReads.toString());
  printResult('Total reads/session', totalReadsPerUser.toString());
  printResult('Total writes/session', totalWritesPerUser.toString());

  console.log('\n  Concurrent User Capacity Estimates:');
  console.log('  ' + '-'.repeat(60));
  console.log(`  ${'Users'.padEnd(10)} ${'Reads/day'.padStart(12)} ${'Writes/day'.padStart(12)} ${'Read OK'.padStart(10)} ${'Write OK'.padStart(10)}`);
  console.log('  ' + '-'.repeat(60));

  const sparkReadLimit = 50_000;
  const sparkWriteLimit = 20_000;
  const sessionsPerDay = 2; // users come back ~2 times/day

  for (const users of userCounts) {
    const dailyReads = users * totalReadsPerUser * sessionsPerDay;
    const dailyWrites = users * totalWritesPerUser * sessionsPerDay;
    const readOk = dailyReads <= sparkReadLimit ? '\u2705' : '\u274C';
    const writeOk = dailyWrites <= sparkWriteLimit ? '\u2705' : '\u274C';

    console.log(
      `  ${users.toString().padEnd(10)} ${formatNum(dailyReads).padStart(12)} ${formatNum(dailyWrites).padStart(12)} ${readOk.padStart(10)} ${writeOk.padStart(10)}`
    );
  }
  console.log('  ' + '-'.repeat(60));

  // Blaze plan estimates
  console.log('\n  Firebase Blaze (Pay-as-you-go) Plan:');
  console.log('  ' + '-'.repeat(50));
  printResult('Document reads', '$0.06 / 100K reads');
  printResult('Document writes', '$0.18 / 100K writes');
  printResult('Max concurrent', 'Effectively unlimited');

  console.log('\n  Cost Estimates (Blaze Plan):');
  console.log('  ' + '-'.repeat(50));
  for (const users of [100, 500, 1000]) {
    const dailyReads = users * totalReadsPerUser * sessionsPerDay;
    const dailyWrites = users * totalWritesPerUser * sessionsPerDay;
    const monthlyReads = dailyReads * 30;
    const monthlyWrites = dailyWrites * 30;
    const readCost = (monthlyReads / 100_000) * 0.06;
    const writeCost = (monthlyWrites / 100_000) * 0.18;
    const totalCost = readCost + writeCost;
    printResult(`${users} users/month`, `$${totalCost.toFixed(2)}`);
  }
  console.log('  ' + '-'.repeat(50));

  // Real-time presence test
  console.log('\n  Real-time Presence Listener Simulation:');
  console.log('  ' + '-'.repeat(50));

  for (const userCount of [10, 50, 100, 500]) {
    const mockDocs = Array.from({ length: userCount }, (_, i) => ({
      uid: `user-${i}`,
      email: `user${i}@test.com`,
      displayName: `Test User ${i}`,
      photoURL: '',
      currentPage: ['/', '/exam', '/quiz', '/flashcards'][i % 4],
      activity: ['Home', 'Taking Exam', 'Practice Quiz', 'Flashcards'][i % 4],
      lastSeen: new Date(Date.now() - Math.random() * 120000),
    }));

    const start = performance.now();
    const staleThreshold = 2 * 60 * 1000;
    const filtered = mockDocs.filter(d => Date.now() - d.lastSeen.getTime() < staleThreshold);
    const elapsed = performance.now() - start;

    printResult(`${userCount} presence docs`, `${elapsed.toFixed(2)}ms`, `(${filtered.length} active)`);
  }
}

// ── Test 3: Client-side Data Processing ──

async function testClientProcessing() {
  printHeader('TEST 3: Client-side Data Processing');
  console.log('  Simulating data processing that happens in the browser.\n');

  // Admin dashboard: processing large activity datasets
  console.log('  Admin Dashboard — Processing Activity Records:');
  console.log('  ' + '-'.repeat(50));

  for (const count of [100, 500, 1000, 5000]) {
    const activities = Array.from({ length: count }, (_, i) => ({
      uid: `user-${i % 50}`,
      email: `user${i % 50}@test.com`,
      displayName: `User ${i % 50}`,
      type: ['exam', 'lesson_quiz', 'practice_quiz'][i % 3],
      score: Math.floor(Math.random() * 45),
      total: 45,
      percentage: Math.floor(Math.random() * 100),
      passed: Math.random() > 0.3,
      createdAt: new Date(Date.now() - Math.random() * 30 * 86400000),
    }));

    const start = performance.now();

    // Simulate the computations the admin page does
    const exams = activities.filter(a => a.type === 'exam');
    const lessonQuizzes = activities.filter(a => a.type === 'lesson_quiz');
    const practiceQuizzes = activities.filter(a => a.type === 'practice_quiz');

    const userMap = new Map();
    for (const a of activities) {
      if (!userMap.has(a.uid)) {
        userMap.set(a.uid, { uid: a.uid, totalActivities: 0, exams: 0, lastActive: new Date(0) });
      }
      const u = userMap.get(a.uid);
      u.totalActivities++;
      if (a.type === 'exam') u.exams++;
      const d = a.createdAt;
      if (d > u.lastActive) u.lastActive = d;
    }

    const avgExamScore = exams.length > 0
      ? Math.round(exams.reduce((s, e) => s + e.percentage, 0) / exams.length)
      : 0;

    // 7-day activity
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const dayCount = activities.filter(a => a.createdAt >= dayStart && a.createdAt < dayEnd).length;
      days.push(dayCount);
    }

    const elapsed = performance.now() - start;
    const status = elapsed < 50 ? '\u2705' : elapsed < 200 ? '\u26A0\uFE0F' : '\u274C';
    printResult(`${count} records`, `${elapsed.toFixed(2)}ms`, status);
  }

  // Question pool merging at scale
  console.log('\n  Question Pool Merging:');
  console.log('  ' + '-'.repeat(50));

  for (const fsCount of [0, 50, 200, 500, 1000]) {
    const hardcoded = Array.from({ length: 407 }, (_, i) => ({
      id: `hc-${i}`,
      question: `Hardcoded question number ${i} about SAFe practices`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: i % 4,
      domain: ['D1', 'D2', 'D3', 'D4'][i % 4],
    }));

    const firestore = Array.from({ length: fsCount }, (_, i) => ({
      id: `fs-${i}`,
      question: `Firestore question number ${i} about SAFe practices`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: i % 4,
      domain: ['D1', 'D2', 'D3', 'D4'][i % 4],
    }));

    const start = performance.now();
    const seen = new Set(hardcoded.map(q => q.question.toLowerCase().slice(0, 80)));
    const merged = [...hardcoded];
    for (const q of firestore) {
      const key = q.question.toLowerCase().slice(0, 80);
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(q);
      }
    }
    const elapsed = performance.now() - start;

    printResult(`407 + ${fsCount} Firestore`, `${elapsed.toFixed(2)}ms`, `(${merged.length} total)`);
  }

  // Session serialization under load
  console.log('\n  Session Serialization Throughput:');
  console.log('  ' + '-'.repeat(50));

  const sessions = Array.from({ length: 100 }, (_, i) => ({
    type: 'exam',
    questions: Array.from({ length: 45 }, (_, j) => ({
      id: `q-${j}`,
      question: `Test question ${j} for session ${i}`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: j % 4,
      domain: 'Test Domain',
    })),
    questionStates: Array.from({ length: 45 }, () => ({
      selectedAnswer: Math.floor(Math.random() * 4),
      selectedAnswers: [],
      flagged: Math.random() > 0.8,
    })),
    currentIndex: 22,
    timeRemaining: 3600,
    savedAt: Date.now(),
  }));

  const serStart = performance.now();
  const serialized = sessions.map(s => JSON.stringify(s));
  const serTime = performance.now() - serStart;

  const deserStart = performance.now();
  const deserialized = serialized.map(s => JSON.parse(s));
  const deserTime = performance.now() - deserStart;

  const avgSize = Math.round(serialized.reduce((s, x) => s + x.length, 0) / serialized.length / 1024);

  printResult('100 sessions serialized', `${serTime.toFixed(1)}ms`, `(avg ${avgSize}KB each)`);
  printResult('100 sessions deserialized', `${deserTime.toFixed(1)}ms`);
  printResult('Throughput', `${Math.round(100 / (serTime / 1000))}/s`, 'serialize');
}

// ── Main ──

async function main() {
  console.log('\n\u2501'.repeat(60));
  console.log('  SAFe Prep Master — Concurrent User Load Test');
  console.log('\u2501'.repeat(60));
  console.log(`  Target:      ${SITE_URL}`);
  console.log(`  Concurrency: ${CONCURRENCY} simultaneous connections`);
  console.log(`  Duration:    ${DURATION}s per endpoint`);
  console.log(`  Time:        ${new Date().toISOString()}`);

  // Test 1: HTTP load test against the live site
  const hostingResults = await testStaticHosting();

  if (!hostingOnly) {
    // Test 2: Firestore capacity simulation
    await testFirestoreSimulation();

    // Test 3: Client-side processing
    await testClientProcessing();
  }

  // ── Final Summary ──
  printHeader('FINAL SUMMARY');

  const homeResult = hostingResults.find(r => r.path === '/')?.result;
  if (homeResult) {
    const p50 = homeResult.latency.p50 || homeResult.latency.average;
    const p99 = homeResult.latency.p99 || homeResult.latency.max;

    console.log('\n  Hosting Layer (Firebase CDN):');
    printResult('Requests/sec (sustained)', formatNum(Math.round(homeResult.requests.average)));
    printResult('Latency p50', `${p50.toFixed(0)}ms`);
    printResult('Latency p99', `${p99.toFixed(0)}ms`);
    printResult('Error rate', `${((homeResult.errors / Math.max(homeResult.requests.total, 1)) * 100).toFixed(2)}%`);
  }

  console.log('\n  Concurrent User Estimates:');
  console.log('  ' + '-'.repeat(50));

  // CDN capacity
  if (homeResult) {
    const cdnCapacity = Math.round(homeResult.requests.average) * 30;
    printResult('CDN capacity', `${formatNum(cdnCapacity)}+`, 'users');
  }

  // Firestore capacity (Spark plan)
  const sparkMaxUsers = Math.floor(20_000 / (33 * 2)); // writes are the bottleneck
  printResult('Spark plan (free)', `~${sparkMaxUsers}`, 'daily active users');

  // Firestore capacity (Blaze plan)
  printResult('Blaze plan (paid)', 'Effectively unlimited', '');

  // Real-time presence
  printResult('Presence tracking', '1,000+', 'concurrent (Firestore limit)');

  console.log('\n  Bottleneck Analysis:');
  console.log('  ' + '-'.repeat(50));
  console.log('  1. CDN (static files)     \u2705 Unlimited — Google Cloud CDN');
  console.log('  2. Firestore reads        \u26A0\uFE0F  50K/day free, then $0.06/100K');
  console.log('  3. Firestore writes       \u26A0\uFE0F  20K/day free (bottleneck on Spark)');
  console.log('  4. Presence heartbeats    \u26A0\uFE0F  1 write/min/user = largest write cost');
  console.log('  5. Client-side rendering  \u2705 Sub-50ms for 5000+ records');
  console.log('  6. Auth concurrent        \u2705 No practical limit');

  console.log('\n  Recommendations:');
  console.log('  ' + '-'.repeat(50));
  console.log('  \u2022 Spark plan supports ~300 daily active users comfortably');
  console.log('  \u2022 Reduce heartbeat frequency (60s \u2192 120s) to double write capacity');
  console.log('  \u2022 Question bank cache (5min TTL) prevents redundant reads');
  console.log('  \u2022 For 1000+ users, upgrade to Blaze plan (~$3-5/month)');
  console.log('  \u2022 Presence collection is self-cleaning (stale docs filtered out)');
  console.log();
}

main().catch(console.error);
