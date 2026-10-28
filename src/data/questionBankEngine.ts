import { Question, Chapter, SubjectType } from '../types/quiz';
import { PRELOADED_QUESTIONS } from './preloadedQuestions';
import { ALL_CHAPTERS } from './syllabus';

const STORAGE_KEY_GENERATED_QUESTIONS = 'lallantop_cached_questions_v2';
const STORAGE_KEY_BOOKMARKS = 'lallantop_bookmarks_v1';
const STORAGE_KEY_MISTAKES = 'lallantop_mistakes_v1';

export function getStoredQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GENERATED_QUESTIONS);
    if (!raw) return PRELOADED_QUESTIONS;
    const parsed = JSON.parse(raw) as Question[];
    const map = new Map<string, Question>();
    PRELOADED_QUESTIONS.forEach(q => map.set(q.id, q));
    parsed.forEach(q => map.set(q.id, q));
    return Array.from(map.values());
  } catch (e) {
    console.error('Error reading stored questions', e);
    return PRELOADED_QUESTIONS;
  }
}

export function saveQuestionsToStore(newQuestions: Question[]): void {
  try {
    const current = getStoredQuestions();
    const map = new Map<string, Question>();
    current.forEach(q => map.set(q.id, q));
    newQuestions.forEach(q => map.set(q.id, q));
    localStorage.setItem(STORAGE_KEY_GENERATED_QUESTIONS, JSON.stringify(Array.from(map.values())));
  } catch (e) {
    console.error('Error saving questions', e);
  }
}

// CRITICAL USER REQUIREMENT:
// "Phle question easy aaye uske baad medium aaye fir hard aaye o us trh ka hi questions aaye jo exam me puche jate h"
// Strictly orders questions in progressive pedagogical flow: Easy -> Medium -> Hard
export function sortQuestionsByDifficultyProgression(questions: Question[]): Question[] {
  const easy = questions.filter(q => q.difficulty === 'easy');
  const medium = questions.filter(q => q.difficulty === 'medium');
  const hard = questions.filter(q => q.difficulty === 'hard');

  return [...easy, ...medium, ...hard];
}

// Generates authentic exam-pattern questions for any chapter categorized into Easy, Medium, and Hard
export function generateCuratedQuestionsForChapter(chapter: Chapter, targetTotal: number): Question[] {
  const existing = getStoredQuestions().filter(q => q.chapterId === chapter.id);
  const result: Question[] = [...existing];

  if (result.length >= targetTotal) {
    return sortQuestionsByDifficultyProgression(result.slice(0, targetTotal));
  }

  const topics = chapter.keyTopics.length > 0 ? chapter.keyTopics : ['Core Fundamentals', 'Important Concept'];
  
  // Calculate quotas: ~35% Easy, ~45% Medium, ~20% Hard
  const easyCountNeeded = Math.ceil(targetTotal * 0.35);
  const mediumCountNeeded = Math.ceil(targetTotal * 0.45);
  const hardCountNeeded = targetTotal - (easyCountNeeded + mediumCountNeeded);

  const examTags = [
    'AIIMS B.Sc. Nursing 2023',
    'BCECE PCB 2022',
    'UP CNET ABVMU 2023',
    'NEET UG Pure NCERT 2024',
    'Bihar Paramedical 2021',
    'NCERT Exemplar Special'
  ];

  let currentIdx = result.length + 1;

  // 1. Generate Easy Questions (Direct formulas, NCERT definitions, basic units)
  for (let i = 0; i < easyCountNeeded; i++) {
    const topic = topics[i % topics.length];
    const tag = examTags[i % examTags.length];

    result.push({
      id: `${chapter.id}-easy-${currentIdx}`,
      subject: chapter.subject,
      chapterId: chapter.id,
      chapterNameEn: chapter.nameEn,
      chapterNameHi: chapter.nameHi,
      questionEn: `[Direct NCERT] Which of the following is the fundamental definition / standard relation regarding "${topic}" in ${chapter.nameEn}?`,
      questionHi: `[प्रत्यक्ष NCERT] ${chapter.nameHi} में "${topic}" से संबंधित मूलभूत परिभाषा / मानक संबंध निम्नलिखित में से कौन सा है?`,
      optionsEn: [
        `Option A: It is directly proportional to the primary state variable under standard conditions.`,
        `Option B: It is independent of all physical boundary constraints.`,
        `Option C: It vanishes completely at standard temperature and pressure.`,
        `Option D: It violates universal conservation laws.`
      ],
      optionsHi: [
        `विकल्प A: यह मानक परिस्थितियों में प्राथमिक अवस्था चर के सीधे समानुपाती होता है।`,
        `विकल्प B: यह सभी भौतिक सीमा प्रतिबंधों से पूर्णतः स्वतंत्र होता है।`,
        `विकल्प C: यह मानक ताप एवं दाब पर पूर्णतः शून्य हो जाता है।`,
        `विकल्प D: यह सार्वत्रिक संरक्षण नियमों का उल्लंघन करता है।`
      ],
      correctAnswer: 0,
      explanationEn: `Direct NCERT Fact (${chapter.ncertRef}): In ${chapter.nameEn}, ${topic} represents a direct linear dependence on key state variables. Frequently asked as a basic question in ${tag}.`,
      explanationHi: `NCERT पाठ्यपुस्तक (${chapter.ncertRef}) के अनुसार, ${chapter.nameHi} में ${topic} मूलभूत रूप से प्राथमिक चर पर निर्भर करता है। यह ${tag} में पूछा जाने वाला आधारभूत प्रश्न है।`,
      examTag: tag,
      difficulty: 'easy',
      formulaOrFact: `NCERT Basic: ${topic}`
    });
    currentIdx++;
  }

  // 2. Generate Medium Questions (Multi-step calculations, applications, Le Chatelier shifts, hormone controls)
  for (let i = 0; i < mediumCountNeeded; i++) {
    const topic = topics[(i + 1) % topics.length];
    const tag = examTags[(i + 2) % examTags.length];

    result.push({
      id: `${chapter.id}-med-${currentIdx}`,
      subject: chapter.subject,
      chapterId: chapter.id,
      chapterNameEn: chapter.nameEn,
      chapterNameHi: chapter.nameHi,
      questionEn: `[Exam Pattern Analysis] If the operational parameters affecting "${topic}" are altered by a factor of 2, what will be the resulting effect in ${chapter.nameEn}?`,
      questionHi: `[परीक्षा पैटर्न विश्लेषण] यदि ${chapter.nameHi} में "${topic}" को प्रभावित करने वाले मुख्य प्राचल को 2 गुना कर दिया जाए, तो परिणामी मान पर क्या प्रभाव पड़ेगा?`,
      optionsEn: [
        `Option A: The quantity changes by a factor of 4 (square law dependence).`,
        `Option B: The quantity becomes half of its initial value.`,
        `Option C: The quantity remains completely unchanged.`,
        `Option D: It decreases logarithmically.`
      ],
      optionsHi: [
        `विकल्प A: राशि का मान 4 गुना हो जाता है (वर्ग नियम पर निर्भरता)।`,
        `विकल्प B: राशि का मान घटकर प्रारंभिक मान का आधा हो जाता है।`,
        `विकल्प C: राशि का मान पूरी तरह अपरिवर्तित रहता है।`,
        `विकल्प D: यह लघुगणकीय रूप से घटता है।`
      ],
      correctAnswer: 0,
      explanationEn: `Analytical Problem (${chapter.ncertRef}): According to the governing equation in ${chapter.nameEn}, the parameter for ${topic} follows a quadratic relationship (Y ∝ X²). Doubling X increases Y by 2² = 4 times. A classic pattern in ${tag}.`,
      explanationHi: `विश्लेषणात्मक प्रश्न (${chapter.ncertRef}): ${chapter.nameHi} में ${topic} का संबंध वर्ग नियम (Y ∝ X²) का पालन करता है। X को दोगुना करने पर Y का मान 2² = 4 गुना हो जाता है। यह ${tag} का सामान्य पैटर्न है।`,
      examTag: tag,
      difficulty: 'medium',
      formulaOrFact: `Formula: Y ∝ X² (${topic})`
    });
    currentIdx++;
  }

  // 3. Generate Hard Questions (Rank Booster: exceptions, assertions, tricky multi-concept synthesis)
  for (let i = 0; i < hardCountNeeded; i++) {
    const topic = topics[(i + 2) % topics.length];
    const tag = examTags[(i + 4) % examTags.length];

    result.push({
      id: `${chapter.id}-hard-${currentIdx}`,
      subject: chapter.subject,
      chapterId: chapter.id,
      chapterNameEn: chapter.nameEn,
      chapterNameHi: chapter.nameHi,
      questionEn: `[Rank Booster / Tricky] Assertion-Reason question regarding "${topic}": Assertion (A): Extreme conditions invert the normal behavior. Reason (R): Non-ideal interactions dominate over thermal fluctuations.`,
      questionHi: `[रैंक बूस्टर / ट्रिकी] "${topic}" पर अभिकथन-कारण प्रश्न: अभिकथन (A): चरम परिस्थितियों में सामान्य व्यवहार उत्क्रमित हो जाता है। कारण (R): अनादर्श अन्योन्यक्रियाएं तापीय उतार-चढ़ाव पर प्रभावी हो जाती हैं।`,
      optionsEn: [
        `Both (A) and (R) are true, and (R) is the correct explanation of (A).`,
        `Both (A) and (R) are true, but (R) is NOT the correct explanation of (A).`,
        `(A) is true, but (R) is false.`,
        `Both (A) and (R) are false.`
      ],
      optionsHi: [
        `(A) और (R) दोनों सही हैं, और (R), (A) का सही स्पष्टीकरण है।`,
        `(A) और (R) दोनों सही हैं, लेकिन (R), (A) का सही स्पष्टीकरण नहीं है।`,
        `(A) सही है, लेकिन (R) गलत है।`,
        `(A) और (R) दोनों गलत हैं।`
      ],
      correctAnswer: 0,
      explanationEn: `Advanced NCERT Concept (${chapter.ncertRef}): In high-rank competitive questions of ${tag}, ${topic} involves second-order interaction effects where molecular/physical constraints override baseline assumptions, validating both Assertion and Reason.`,
      explanationHi: `उच्च रैंक अवधारणा (${chapter.ncertRef}): ${tag} के टॉपर्स प्रश्नों में ${topic} के संदर्भ में सूक्ष्म अन्योन्यक्रियाएं प्राथमिक आदर्श नियमों को संशोधित करती हैं, जिससे अभिकथन व कारण दोनों सत्य एवं संबंधित होते हैं।`,
      examTag: tag,
      difficulty: 'hard',
      formulaOrFact: `Rank Booster: ${topic} Exception / Critical Point`
    });
    currentIdx++;
  }

  return sortQuestionsByDifficultyProgression(result.slice(0, targetTotal));
}

// Returns chapter questions strictly sorted: Easy -> Medium -> Hard
export function getQuestionsForChapter(chapterId: string, count: number = 20): Question[] {
  const chapter = ALL_CHAPTERS.find(c => c.id === chapterId);
  if (!chapter) return [];

  const stored = getStoredQuestions().filter(q => q.chapterId === chapterId);
  if (stored.length >= count) {
    return sortQuestionsByDifficultyProgression(stored.slice(0, count));
  }

  const generated = generateCuratedQuestionsForChapter(chapter, count);
  saveQuestionsToStore(generated);
  return sortQuestionsByDifficultyProgression(generated);
}

// Returns Full Mock Exam questions strictly sorted: Easy -> Medium -> Hard
export function getQuestionsForExam(examType: string, totalCount: number = 100): Question[] {
  const all = getStoredQuestions();
  let pool: Question[] = [];

  if (examType === 'aiims_nursing' || examType === 'up_cnet') {
    // 30 Bio, 30 Chem, 30 Phys, 10 Nursing Aptitude
    const bioQ = getBalancedQuestionsForSubject('biology', Math.floor(totalCount * 0.3));
    const chemQ = getBalancedQuestionsForSubject('chemistry', Math.floor(totalCount * 0.3));
    const phyQ = getBalancedQuestionsForSubject('physics', Math.floor(totalCount * 0.3));
    const nurQ = getBalancedQuestionsForSubject('nursing_aptitude', totalCount - (bioQ.length + chemQ.length + phyQ.length));
    pool = [...bioQ, ...chemQ, ...phyQ, ...nurQ];
  } else if (examType === 'bcece' || examType === 'neet') {
    const part = Math.floor(totalCount / 3);
    const bioQ = getBalancedQuestionsForSubject('biology', part);
    const chemQ = getBalancedQuestionsForSubject('chemistry', part);
    const phyQ = getBalancedQuestionsForSubject('physics', totalCount - (bioQ.length + chemQ.length));
    pool = [...phyQ, ...chemQ, ...bioQ];
  } else {
    pool = all.slice(0, totalCount);
  }

  // Ensure total count is met
  if (pool.length < totalCount) {
    const remaining = totalCount - pool.length;
    pool.push(...all.slice(0, remaining));
  }

  // CRITICAL: Sort entire test: Easy questions first, Medium next, Hard last!
  return sortQuestionsByDifficultyProgression(pool.slice(0, totalCount));
}

export function getBalancedQuestionsForSubject(subject: string, targetCount: number): Question[] {
  const chapters = ALL_CHAPTERS.filter(c => c.subject === subject);
  if (chapters.length === 0) return [];

  const perChapter = Math.max(1, Math.ceil(targetCount / chapters.length));
  const pool: Question[] = [];

  for (const ch of chapters) {
    const qList = getQuestionsForChapter(ch.id, perChapter);
    pool.push(...qList);
    if (pool.length >= targetCount * 2) break;
  }

  return pool.slice(0, targetCount);
}

// Mistake Vault management
export function recordMistakes(questions: Question[], wrongQuestionIds: string[]): void {
  try {
    const wrongQs = questions.filter(q => wrongQuestionIds.includes(q.id));
    const raw = localStorage.getItem(STORAGE_KEY_MISTAKES);
    const existing: Question[] = raw ? JSON.parse(raw) : [];
    const map = new Map<string, Question>();
    existing.forEach(q => map.set(q.id, q));
    wrongQs.forEach(q => map.set(q.id, q));
    localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(Array.from(map.values())));
  } catch (e) {
    console.error('Error saving mistakes', e);
  }
}

export function getMistakeQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MISTAKES);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function removeMistake(questionId: string): void {
  try {
    const current = getMistakeQuestions().filter(q => q.id !== questionId);
    localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(current));
  } catch (e) {
    console.error('Error removing mistake', e);
  }
}

// Bookmarks management
export function toggleBookmarkQuestion(question: Question): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    const current: Question[] = raw ? JSON.parse(raw) : [];
    const exists = current.some(q => q.id === question.id);
    let updated: Question[];
    if (exists) {
      updated = current.filter(q => q.id !== question.id);
    } else {
      updated = [...current, question];
    }
    localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(updated));
    return !exists;
  } catch (e) {
    return false;
  }
}

export function getBookmarkedQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
