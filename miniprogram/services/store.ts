import { BOOK, WORDS, Word } from '../data/words';

const STORAGE_KEY = 'daily_vocab_demo_v2';
const STATE_VERSION = 2;
const DAY_MS = 24 * 60 * 60 * 1000;
const BOX_INTERVALS = [0, 1, 3, 7, 15, 30];

export type WordState = {
  box: number;
  correct: number;
  wrong: number;
  correctStreak: number;
  dueAt: number;
  status: 'learning' | 'mastered';
  lastSeen: number;
};

export type WrongEntry = {
  count: number;
  streak: number;
  lastAt: number;
};

export type Settings = {
  dailyNew: number;
  sound: boolean;
};

export type DayRecord = {
  date: string;
  answered: number;
  correct: number;
  planIds: string[];
  answeredIds: string[];
  wrongIds: string[];
  newIds: string[];
  reviewIds: string[];
};

export type SessionResult = {
  mode: 'plan' | 'wrong';
  correct: number;
  total: number;
  duration: number;
  wrongIds: string[];
  newIds: string[];
  reviewIds: string[];
  date: string;
};

export type QuestionOption = {
  id: string;
  text: string;
  correct: boolean;
};

export type Question = {
  wordId: string;
  term: string;
  reading: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
  options: QuestionOption[];
};

export type HomeData = {
  bookTitle: string;
  bookSubtitle: string;
  learned: number;
  mastered: number;
  totalWords: number;
  planTotal: number;
  answered: number;
  remaining: number;
  completed: boolean;
  hasPlan: boolean;
  progressPercent: number;
  bookPercent: number;
  streak: number;
  remainingNew: number;
  planNewCount: number;
  planReviewCount: number;
};

type AppState = {
  version: number;
  settings: Settings;
  currentBookId: string;
  wordStates: Record<string, WordState>;
  day: DayRecord;
  history: Record<string, { answered: number; correct: number }>;
  streak: { lastDate: string; days: number };
  wrong: Record<string, WrongEntry>;
  lastResult: SessionResult | null;
};

function defaultState(): AppState {
  return {
    version: STATE_VERSION,
    settings: { dailyNew: 5, sound: true },
    currentBookId: BOOK.id,
    wordStates: {},
    day: {
      date: '',
      answered: 0,
      correct: 0,
      planIds: [],
      answeredIds: [],
      wrongIds: [],
      newIds: [],
      reviewIds: [],
    },
    history: {},
    streak: { lastDate: '', days: 0 },
    wrong: {},
    lastResult: null,
  };
}

function loadState(): AppState {
  try {
    const parsed = wx.getStorageSync(STORAGE_KEY);
    if (parsed && parsed.version === STATE_VERSION) {
      const base = defaultState();
      return {
        ...base,
        ...parsed,
        settings: { ...base.settings, ...(parsed.settings || {}) },
        day: { ...base.day, ...(parsed.day || {}) },
        streak: { ...base.streak, ...(parsed.streak || {}) },
        wordStates: parsed.wordStates || {},
        history: parsed.history || {},
        wrong: parsed.wrong || {},
        lastResult: parsed.lastResult || null,
      };
    }
  } catch (err) {
    // 本地数据损坏时回到初始状态，Demo 不做迁移。
  }
  return defaultState();
}

let state: AppState = loadState();

function save(): void {
  wx.setStorageSync(STORAGE_KEY, state);
}

export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function nextDue(now: number, box: number): number {
  const days = BOX_INTERVALS[Math.min(box, BOX_INTERVALS.length - 1)];
  return startOfDay(now) + Math.max(days, 1) * DAY_MS;
}

function startOfTomorrow(now: number): number {
  return startOfDay(now) + DAY_MS;
}

function shuffle<T>(list: T[]): T[] {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

function interleave(a: string[], b: string[]): string[] {
  const out: string[] = [];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i += 1) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

function findWord(id: string): Word | undefined {
  return WORDS.find((w) => w.id === id);
}

function isSimilar(a: string, b: string): boolean {
  const x = a.replace(/[（）()；;、，,\s]/g, '');
  const y = b.replace(/[（）()；;、，,\s]/g, '');
  return x === y || x.includes(y) || y.includes(x);
}

export function ensureDay(): AppState {
  const today = dateKey();
  if (state.day.date === today) return state;

  const learnedIds = new Set(Object.keys(state.wordStates));
  const newIds = WORDS.filter((w) => !learnedIds.has(w.id))
    .slice(0, state.settings.dailyNew)
    .map((w) => w.id);

  const now = Date.now();
  const reviewIds = Object.entries(state.wordStates)
    .filter(([, s]) => s.status !== 'mastered' && s.dueAt <= now)
    .sort((a, b) => a[1].dueAt - b[1].dueAt)
    .map(([id]) => id)
    .filter((id) => !newIds.includes(id))
    .slice(0, 10);

  const planned = interleave(newIds, reviewIds).slice(0, 10);
  const plannedSet = new Set(planned);

  state.day = {
    date: today,
    answered: 0,
    correct: 0,
    planIds: planned,
    answeredIds: [],
    wrongIds: [],
    newIds: newIds.filter((id) => plannedSet.has(id)),
    reviewIds: reviewIds.filter((id) => plannedSet.has(id)),
  };
  save();
  return state;
}

function buildQuestion(word: Word): Question {
  const pool = WORDS.filter(
    (w) => w.id !== word.id && !isSimilar(w.meaning, word.meaning)
  );
  const samePos = shuffle(pool.filter((w) => w.pos === word.pos));
  const distractors: Word[] = samePos.slice(0, 2);

  if (distractors.length < 3) {
    const picked = new Set(distractors.map((w) => w.id));
    const extra = shuffle(pool.filter((w) => !picked.has(w.id))).slice(
      0,
      3 - distractors.length
    );
    distractors.push(...extra);
  }

  if (distractors.length < 3) {
    const picked = new Set(distractors.map((w) => w.id));
    const fallback = shuffle(
      WORDS.filter((w) => w.id !== word.id && !picked.has(w.id))
    ).slice(0, 3 - distractors.length);
    distractors.push(...fallback);
  }

  const options = shuffle([word, ...distractors]).map((w, index) => ({
    id: `${word.id}-opt-${index}-${w.id}`,
    text: w.meaning,
    correct: w.id === word.id,
  }));

  return {
    wordId: word.id,
    term: word.term,
    reading: word.reading,
    meaning: word.meaning,
    example: word.example,
    exampleMeaning: word.exampleMeaning,
    options,
  };
}

export function getQuestions(mode: 'plan' | 'wrong'): Question[] {
  ensureDay();

  if (mode === 'wrong') {
    return getWrongWords()
      .slice(0, 10)
      .map((item) => findWord(item.id))
      .filter((w): w is Word => Boolean(w))
      .map((w) => buildQuestion(w));
  }

  return state.day.planIds
    .filter((id) => !state.day.answeredIds.includes(id))
    .map((id) => findWord(id))
    .filter((w): w is Word => Boolean(w))
    .map((w) => buildQuestion(w));
}

function touchStreak(): void {
  const today = dateKey();
  if (state.streak.lastDate === today) return;
  const yesterday = dateKey(new Date(Date.now() - DAY_MS));
  if (state.streak.lastDate === yesterday) {
    state.streak.days += 1;
  } else {
    state.streak.days = 1;
  }
  state.streak.lastDate = today;
}

export function submitAnswer(
  wordId: string,
  correct: boolean,
  inPlan: boolean
): void {
  ensureDay();
  const now = Date.now();
  const existing = state.wordStates[wordId];
  const ws: WordState = existing || {
    box: 0,
    correct: 0,
    wrong: 0,
    correctStreak: 0,
    dueAt: 0,
    status: 'learning',
    lastSeen: 0,
  };

  ws.lastSeen = now;
  if (correct) {
    ws.correct += 1;
    ws.correctStreak += 1;
    ws.box = Math.min(ws.box + 1, 5);
    ws.dueAt = nextDue(now, ws.box);
    if (ws.box >= 5 && ws.correct >= 3) {
      ws.status = 'mastered';
    }
  } else {
    ws.wrong += 1;
    ws.correctStreak = 0;
    ws.box = 0;
    ws.dueAt = startOfTomorrow(now);
    ws.status = 'learning';
  }
  state.wordStates[wordId] = ws;

  if (inPlan && !state.day.answeredIds.includes(wordId)) {
    state.day.answeredIds.push(wordId);
    state.day.answered += 1;
    if (correct) state.day.correct += 1;
  }

  if (!correct && !state.day.wrongIds.includes(wordId)) {
    state.day.wrongIds.push(wordId);
  }

  const today = dateKey();
  const history = state.history[today] || { answered: 0, correct: 0 };
  history.answered += 1;
  if (correct) history.correct += 1;
  state.history[today] = history;

  if (correct) {
    const wrong = state.wrong[wordId];
    if (wrong) {
      wrong.streak += 1;
      if (wrong.streak >= 3) {
        delete state.wrong[wordId];
      }
    }
  } else {
    const wrong = state.wrong[wordId] || { count: 0, streak: 0, lastAt: 0 };
    wrong.count += 1;
    wrong.streak = 0;
    wrong.lastAt = now;
    state.wrong[wordId] = wrong;
  }

  touchStreak();
  save();
}

function displayStreak(): number {
  const today = dateKey();
  const yesterday = dateKey(new Date(Date.now() - DAY_MS));
  if (
    state.streak.lastDate === today ||
    state.streak.lastDate === yesterday
  ) {
    return state.streak.days;
  }
  return 0;
}

export function getHome(): HomeData {
  ensureDay();
  const total = state.day.planIds.length;
  const answered = state.day.answeredIds.length;
  const remaining = Math.max(0, total - answered);
  const learned = Object.keys(state.wordStates).length;
  const mastered = Object.values(state.wordStates).filter(
    (s) => s.status === 'mastered'
  ).length;
  const remainingNew = WORDS.filter(
    (w) => !state.wordStates[w.id]
  ).length;

  return {
    bookTitle: BOOK.title,
    bookSubtitle: BOOK.subtitle,
    learned,
    mastered,
    totalWords: WORDS.length,
    planTotal: total,
    answered,
    remaining,
    completed: total > 0 && remaining === 0,
    hasPlan: total > 0,
    progressPercent: total > 0 ? Math.round((answered / total) * 100) : 0,
    bookPercent: WORDS.length
      ? Math.round((learned / WORDS.length) * 100)
      : 0,
    streak: displayStreak(),
    remainingNew,
    planNewCount: state.day.newIds.length,
    planReviewCount: state.day.reviewIds.length,
  };
}

export function addExtraWords(count: number): number {
  ensureDay();
  const inPlan = new Set(state.day.planIds);
  const learned = new Set(Object.keys(state.wordStates));
  const candidates = WORDS.filter(
    (w) => !learned.has(w.id) && !inPlan.has(w.id)
  ).slice(0, count);

  candidates.forEach((w) => {
    state.day.planIds.push(w.id);
    state.day.newIds.push(w.id);
  });
  if (candidates.length) save();
  return candidates.length;
}

export function buildPlanResult(duration: number): SessionResult {
  ensureDay();
  return {
    mode: 'plan',
    correct: state.day.correct,
    total: state.day.planIds.length,
    duration,
    wrongIds: state.day.wrongIds.slice(),
    newIds: state.day.newIds.slice(),
    reviewIds: state.day.reviewIds.slice(),
    date: state.day.date,
  };
}

export function buildWrongResult(
  correct: number,
  total: number,
  wrongIds: string[],
  duration: number
): SessionResult {
  return {
    mode: 'wrong',
    correct,
    total,
    duration,
    wrongIds: wrongIds.slice(),
    newIds: [],
    reviewIds: [],
    date: dateKey(),
  };
}

export function saveResult(result: SessionResult): void {
  state.lastResult = result;
  save();
}

export function getLastResult(): SessionResult | null {
  return state.lastResult;
}

export function getWordsByIds(
  ids: string[]
): Array<{ id: string; term: string; reading: string; meaning: string }> {
  const out: Array<{
    id: string;
    term: string;
    reading: string;
    meaning: string;
  }> = [];
  ids.forEach((id) => {
    const word = findWord(id);
    if (word) {
      out.push({
        id: word.id,
        term: word.term,
        reading: word.reading,
        meaning: word.meaning,
      });
    }
  });
  return out;
}

export function getWrongWords(): Array<{
  id: string;
  term: string;
  reading: string;
  meaning: string;
  count: number;
}> {
  const out: Array<{
    id: string;
    term: string;
    reading: string;
    meaning: string;
    count: number;
  }> = [];

  Object.entries(state.wrong)
    .sort((a, b) => b[1].count - a[1].count || b[1].lastAt - a[1].lastAt)
    .forEach(([id, entry]) => {
      const word = findWord(id);
      if (word) {
        out.push({
          id,
          term: word.term,
          reading: word.reading,
          meaning: word.meaning,
          count: entry.count,
        });
      }
    });
  return out;
}

export function getWrongCount(): number {
  return Object.keys(state.wrong).length;
}

export function getStatistics(): {
  days: Array<{
    key: string;
    label: string;
    answered: number;
    correct: number;
    height: number;
    isToday: boolean;
  }>;
  totalAnswered: number;
  accuracy: number;
  learned: number;
  mastered: number;
  streak: number;
  wrongCount: number;
} {
  ensureDay();
  const days: Array<{
    key: string;
    label: string;
    answered: number;
    correct: number;
    height: number;
    isToday: boolean;
  }> = [];

  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const record = state.history[key] || { answered: 0, correct: 0 };
    days.push({
      key,
      label: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
      answered: record.answered,
      correct: record.correct,
      height: 0,
      isToday: i === 0,
    });
  }

  const max = Math.max(1, ...days.map((d) => d.answered));
  days.forEach((d) => {
    d.height = d.answered === 0 ? 4 : Math.max(12, Math.round((d.answered / max) * 100));
  });

  const totalAnswered = Object.values(state.history).reduce(
    (sum, h) => sum + h.answered,
    0
  );
  const totalCorrect = Object.values(state.history).reduce(
    (sum, h) => sum + h.correct,
    0
  );

  return {
    days,
    totalAnswered,
    accuracy: totalAnswered
      ? Math.round((totalCorrect / totalAnswered) * 100)
      : 0,
    learned: Object.keys(state.wordStates).length,
    mastered: Object.values(state.wordStates).filter(
      (s) => s.status === 'mastered'
    ).length,
    streak: displayStreak(),
    wrongCount: Object.keys(state.wrong).length,
  };
}

export function getBookDetail(): {
  title: string;
  subtitle: string;
  description: string;
  level: string;
  totalWords: number;
  learned: number;
  mastered: number;
  percent: number;
  samples: Array<{ term: string; reading: string; meaning: string }>;
} {
  ensureDay();
  const learned = Object.keys(state.wordStates).length;
  const mastered = Object.values(state.wordStates).filter(
    (s) => s.status === 'mastered'
  ).length;
  return {
    title: BOOK.title,
    subtitle: BOOK.subtitle,
    description: BOOK.description,
    level: BOOK.level,
    totalWords: WORDS.length,
    learned,
    mastered,
    percent: WORDS.length
      ? Math.round((learned / WORDS.length) * 100)
      : 0,
    samples: WORDS.slice(0, 3).map((w) => ({
      term: w.term,
      reading: w.reading,
      meaning: w.meaning,
    })),
  };
}

export function getSettings(): Settings {
  return { ...state.settings };
}

export function setDailyNew(value: number): void {
  const allowed = [3, 5, 10];
  if (!allowed.includes(value)) return;
  state.settings.dailyNew = value;
  if (state.day.answered === 0) {
    state.day.date = '';
    save();
    ensureDay();
  } else {
    save();
  }
}

export function setSound(value: boolean): void {
  state.settings.sound = value;
  save();
}

export function resetAll(): void {
  state = defaultState();
  wx.removeStorageSync(STORAGE_KEY);
  save();
  ensureDay();
}
