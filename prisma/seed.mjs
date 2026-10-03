import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleWordLists = [
  {
    name: 'Animal Phonemes',
    description: 'Target animal vocabulary grouped by distinctive consonant and vowel phonemes',
    words: [
      { english: 'sheep', phonemes: 'sh-ee-p', items: ['sh', 'ee', 'p'] },
      { english: 'fish', phonemes: 'f-i-sh', items: ['f', 'i', 'sh'] },
      { english: 'shark', phonemes: 'sh-ar-k', items: ['sh', 'ar', 'k'] },
      { english: 'duck', phonemes: 'd-u-ck', items: ['d', 'u', 'ck'] },
      { english: 'whale', phonemes: 'wh-ae-l', items: ['wh', 'ae', 'l'] },
      { english: 'frog', phonemes: 'f-r-o-g', items: ['f', 'r', 'o', 'g'] },
      { english: 'snake', phonemes: 's-n-ae-k', items: ['s', 'n', 'ae', 'k'] },
    ]
  },
  {
    name: 'Consonant Digraphs (/sh/, /ch/, /th/)',
    description: 'Primary school foundation digraphs for early reading development',
    words: [
      { english: 'ship', phonemes: 'sh-i-p', items: ['sh', 'i', 'p'] },
      { english: 'shop', phonemes: 'sh-o-p', items: ['sh', 'o', 'p'] },
      { english: 'chat', phonemes: 'ch-a-t', items: ['ch', 'a', 't'] },
      { english: 'chin', phonemes: 'ch-i-n', items: ['ch', 'i', 'n'] },
      { english: 'thin', phonemes: 'th-i-n', items: ['th', 'i', 'n'] },
      { english: 'moth', phonemes: 'm-o-th', items: ['m', 'o', 'th'] },
      { english: 'bath', phonemes: 'b-a-th', items: ['b', 'a', 'th'] },
      { english: 'rich', phonemes: 'r-i-ch', items: ['r', 'i', 'ch'] },
    ]
  },
  {
    name: 'Long Vowel Teams (/ee/, /oa/, /ai/)',
    description: 'Vowel digraphs commonly used in Grade 2-3 phonics curricula',
    words: [
      { english: 'rain', phonemes: 'r-ai-n', items: ['r', 'ai', 'n'] },
      { english: 'sail', phonemes: 's-ai-l', items: ['s', 'ai', 'l'] },
      { english: 'boat', phonemes: 'b-oa-t', items: ['b', 'oa', 't'] },
      { english: 'coat', phonemes: 'c-oa-t', items: ['c', 'oa', 't'] },
      { english: 'tree', phonemes: 't-r-ee', items: ['t', 'r', 'ee'] },
      { english: 'seed', phonemes: 's-ee-d', items: ['s', 'ee', 'd'] },
      { english: 'train', phonemes: 't-r-ai-n', items: ['t', 'r', 'ai', 'n'] },
    ]
  },
  {
    name: 'Consonant Blends & Clusters',
    description: 'Initial and final consonant blends (/st/, /bl/, /gr/, /sp/)',
    words: [
      { english: 'stop', phonemes: 's-t-o-p', items: ['s', 't', 'o', 'p'] },
      { english: 'star', phonemes: 's-t-ar', items: ['s', 't', 'ar'] },
      { english: 'blue', phonemes: 'b-l-oo', items: ['b', 'l', 'oo'] },
      { english: 'black', phonemes: 'b-l-a-ck', items: ['b', 'l', 'a', 'ck'] },
      { english: 'green', phonemes: 'g-r-ee-n', items: ['g', 'r', 'ee', 'n'] },
      { english: 'spin', phonemes: 's-p-i-n', items: ['s', 'p', 'i', 'n'] },
      { english: 'fast', phonemes: 'f-a-s-t', items: ['f', 'a', 's', 't'] },
    ]
  }
];

async function main() {
  console.log('--- Clearing previous seed data ---');
  await prisma.telemetrySession.deleteMany();
  await prisma.generationLog.deleteMany();
  await prisma.phonemeItem.deleteMany();
  await prisma.word.deleteMany();
  await prisma.activityConfiguration.deleteMany();
  await prisma.wordList.deleteMany();

  console.log('--- Seeding Curated Word Lists & Structured Phonemes ---');
  const createdLists = [];
  for (const listData of sampleWordLists) {
    const list = await prisma.wordList.create({
      data: {
        name: listData.name,
        description: listData.description,
        words: {
          create: listData.words.map((w) => ({
            english: w.english,
            phonemes: w.phonemes,
            phonemeItems: {
              create: w.items.map((symbol, idx) => ({
                symbol,
                position: idx
              }))
            }
          }))
        }
      },
      include: { words: true }
    });
    createdLists.push(list);
    console.log(`Created WordList: ${list.name} with ${list.words.length} words`);
  }

  console.log('--- Seeding Activity Configurations ---');
  const activities = [
    {
      name: 'Animal Phoneme Wordle Challenge',
      activityType: 'WORDLE',
      wordListId: createdLists[0].id,
      difficulty: 'medium',
      maxGuesses: 6,
      hintsEnabled: true,
      outputTitle: 'Animal Sounds Guessing Game'
    },
    {
      name: 'Digraph Discovery Word Search',
      activityType: 'WORD_SEARCH',
      wordListId: createdLists[1].id,
      difficulty: 'easy',
      rows: 10,
      cols: 10,
      hintsEnabled: true,
      showAnswers: false,
      outputTitle: 'Find the Digraphs'
    },
    {
      name: 'Vowel Teams Advanced Wordle',
      activityType: 'WORDLE',
      wordListId: createdLists[2].id,
      difficulty: 'hard',
      maxGuesses: 5,
      hintsEnabled: false,
      outputTitle: 'Mastering Long Vowels'
    },
    {
      name: 'Mega Blends Classroom Word Search',
      activityType: 'WORD_SEARCH',
      wordListId: createdLists[3].id,
      difficulty: 'medium',
      rows: 12,
      cols: 12,
      hintsEnabled: true,
      showAnswers: false,
      outputTitle: 'Consonant Blends Hunt'
    },
    {
      name: 'Quick Digraph Wordle Drill',
      activityType: 'WORDLE',
      wordListId: createdLists[1].id,
      difficulty: 'easy',
      maxGuesses: 6,
      hintsEnabled: true,
      outputTitle: 'Daily Digraph Practice'
    },
    {
      name: 'Animal Habitat Word Search',
      activityType: 'WORD_SEARCH',
      wordListId: createdLists[0].id,
      difficulty: 'easy',
      rows: 10,
      cols: 10,
      hintsEnabled: true,
      showAnswers: true,
      outputTitle: 'Animal Habitat Grid'
    }
  ];

  const createdActivities = [];
  for (const act of activities) {
    const created = await prisma.activityConfiguration.create({ data: act });
    createdActivities.push(created);
  }
  console.log(`Created ${createdActivities.length} Activity Configurations`);

  console.log('--- Generating 350+ Simulated Historical Generation Logs ---');
  const errorReasons = [
    'Empty word list provided for activity generator',
    'Grid dimension 8x8 too small for 10 target words',
    'Wordle target word length constraint violation',
    'Placement conflict exceeded 500 retry iterations'
  ];

  const now = Date.now();
  const generationLogsData = [];

  for (let i = 0; i < 360; i++) {
    const isWordSearch = Math.random() > 0.42; // slightly more word search
    const isSuccess = Math.random() > 0.11; // ~89% success rate
    const actType = isWordSearch ? 'WORD_SEARCH' : 'WORDLE';
    const linkedAct = createdActivities[Math.floor(Math.random() * createdActivities.length)];
    
    // Spread timestamps across the last 14 days
    const timeOffsetDays = Math.random() * 14;
    const logTime = new Date(now - timeOffsetDays * 86400000);

    const duration = isWordSearch
      ? Math.floor(Math.random() * 65) + 15 // 15-80ms
      : Math.floor(Math.random() * 25) + 5;  // 5-30ms

    generationLogsData.push({
      activityType: actType,
      activityId: linkedAct.id,
      status: isSuccess ? 'SUCCESS' : 'FAILED',
      durationMs: duration,
      errorMessage: isSuccess ? null : errorReasons[Math.floor(Math.random() * errorReasons.length)],
      wordCount: Math.floor(Math.random() * 6) + 4,
      timestamp: logTime
    });
  }

  await prisma.generationLog.createMany({ data: generationLogsData });
  console.log(`Seeded ${generationLogsData.length} Generation Logs (Successes + Failures)`);

  console.log('--- Generating 600+ Simulated Telemetry User Sessions ---');
  const pages = [
    { path: '/dashboard', weight: 0.30, avgTime: 95 },
    { path: '/word-search', weight: 0.28, avgTime: 145 },
    { path: '/wordle', weight: 0.22, avgTime: 120 },
    { path: '/activities', weight: 0.12, avgTime: 65 },
    { path: '/about', weight: 0.08, avgTime: 35 }
  ];

  const devices = ['desktop', 'desktop', 'desktop', 'mobile', 'tablet'];
  const telemetryData = [];

  for (let i = 0; i < 620; i++) {
    const rand = Math.random();
    let accumulated = 0;
    let chosenPage = pages[0];
    for (const p of pages) {
      accumulated += p.weight;
      if (rand <= accumulated) {
        chosenPage = p;
        break;
      }
    }

    const timeOffsetDays = Math.random() * 14;
    const sessionTime = new Date(now - timeOffsetDays * 86400000);
    // Gaussian-like variance around avgTime
    const duration = Math.max(12, Math.round(chosenPage.avgTime + (Math.random() - 0.5) * 60));
    const device = devices[Math.floor(Math.random() * devices.length)];

    telemetryData.push({
      sessionId: `sess_${Math.random().toString(36).substring(2, 10)}`,
      pagePath: chosenPage.path,
      durationSeconds: duration,
      deviceType: device,
      timestamp: sessionTime
    });
  }

  await prisma.telemetrySession.createMany({ data: telemetryData });
  console.log(`Seeded ${telemetryData.length} Telemetry Sessions`);

  console.log('✅ All simulated data successfully initialized for Assessment 3!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
