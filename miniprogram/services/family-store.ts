import { WORDS } from '../data/words';

const STORAGE_KEY = 'family_demo_v2';
const AUDIO_DIR_NAME = 'family-audio';

export type FamilyRecording = {
  wordId: string;
  localTerm: string;
  audioPath: string;
  duration: number;
  recordedAt: number;
  recordedBy: string;
};

export type RecordedWord = {
  id: string;
  term: string;
  meaning: string;
  localTerm: string;
  audioPath: string;
  duration: number;
  recordedAt: number;
};

export type FamilyQuestion = {
  wordId: string;
  term: string;
  localTerm: string;
  meaning: string;
  audioPath: string;
  options: Array<{ id: string; text: string; correct: boolean }>;
};

type FamilyState = {
  version: number;
  familyName: string;
  hometown: string;
  recordings: Record<string, FamilyRecording>;
};

function defaultState(): FamilyState {
  return {
    version: 2,
    familyName: '我们家的家乡话',
    hometown: '示例家乡',
    recordings: {},
  };
}

function loadState(): FamilyState {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY);
    if (raw && raw.version === 2) {
      return {
        ...defaultState(),
        ...raw,
        recordings: raw.recordings || {},
      };
    }
  } catch (err) {
    // 本地数据损坏时回到初始状态。
  }
  return defaultState();
}

let state = loadState();

function save(): void {
  wx.setStorageSync(STORAGE_KEY, state);
}

function audioDir(): string {
  const base = wx.env && wx.env.USER_DATA_PATH ? wx.env.USER_DATA_PATH : '';
  return base ? `${base}/${AUDIO_DIR_NAME}` : '';
}

function ensureAudioDir(): boolean {
  const dir = audioDir();
  if (!dir) return false;
  const fs = wx.getFileSystemManager();
  try {
    fs.accessSync(dir);
  } catch (err) {
    fs.mkdirSync(dir, true);
  }
  return true;
}

function fileExists(path: string): boolean {
  if (!path) return false;
  try {
    wx.getFileSystemManager().accessSync(path);
    return true;
  } catch (err) {
    return false;
  }
}

export function saveRecordingFile(
  tempFilePath: string,
  wordId: string
): string {
  if (!ensureAudioDir()) {
    throw new Error('本地文件目录不可用');
  }
  const dest = `${audioDir()}/${wordId}-${Date.now()}.mp3`;
  wx.getFileSystemManager().copyFileSync(tempFilePath, dest);
  return dest;
}

export function deleteAudioFile(path: string): void {
  if (!path) return;
  try {
    wx.getFileSystemManager().unlinkSync(path);
  } catch (err) {
    // 文件可能已被清理，忽略。
  }
}

export function getRecording(wordId: string): FamilyRecording | null {
  const recording = state.recordings[wordId];
  if (!recording) return null;
  if (!fileExists(recording.audioPath)) return null;
  return recording;
}

export function getRecordedWords(): RecordedWord[] {
  const out: RecordedWord[] = [];
  Object.values(state.recordings).forEach((recording) => {
    const word = WORDS.find((w) => w.id === recording.wordId);
    if (!word || !fileExists(recording.audioPath)) return;
    out.push({
      id: word.id,
      term: word.term,
      meaning: word.meaning,
      localTerm: recording.localTerm || word.term,
      audioPath: recording.audioPath,
      duration: recording.duration,
      recordedAt: recording.recordedAt,
    });
  });
  return out.sort((a, b) => b.recordedAt - a.recordedAt);
}

export function saveRecording(
  wordId: string,
  localTerm: string,
  audioPath: string,
  duration: number
): void {
  const old = state.recordings[wordId];
  state.recordings[wordId] = {
    wordId,
    localTerm: localTerm.trim(),
    audioPath,
    duration: Math.max(1, Math.round(duration)),
    recordedAt: Date.now(),
    recordedBy: '爷爷',
  };
  if (old && old.audioPath && old.audioPath !== audioPath) {
    deleteAudioFile(old.audioPath);
  }
  save();
}

export function removeRecording(wordId: string): void {
  const recording = state.recordings[wordId];
  if (!recording) return;
  deleteAudioFile(recording.audioPath);
  delete state.recordings[wordId];
  save();
}

export function resetFamily(): void {
  Object.values(state.recordings).forEach((recording) => {
    deleteAudioFile(recording.audioPath);
  });
  state = defaultState();
  wx.removeStorageSync(STORAGE_KEY);
  save();
}

export function getFamilyOverview(): {
  familyName: string;
  hometown: string;
  recordedCount: number;
  totalWords: number;
  percent: number;
  recordings: RecordedWord[];
  recent: RecordedWord[];
  hasRecordings: boolean;
} {
  const recordings = getRecordedWords();
  return {
    familyName: state.familyName,
    hometown: state.hometown,
    recordedCount: recordings.length,
    totalWords: WORDS.length,
    percent: WORDS.length
      ? Math.round((recordings.length / WORDS.length) * 100)
      : 0,
    recordings,
    recent: recordings.slice(0, 3),
    hasRecordings: recordings.length > 0,
  };
}

export function getFamilyMembers(): Array<{
  id: string;
  name: string;
  role: string;
  initial: string;
  status: string;
}> {
  return [
    {
      id: 'grandpa',
      name: '爷爷',
      role: '长辈 · 录音',
      initial: '爷',
      status: '录音中',
    },
    {
      id: 'mom',
      name: '妈妈',
      role: '管理员',
      initial: '妈',
      status: '已加入',
    },
    {
      id: 'kid',
      name: '小语',
      role: '学习者',
      initial: '语',
      status: '已加入',
    },
  ];
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

function isSimilar(a: string, b: string): boolean {
  const x = a.replace(/[（）()；;、，,\s]/g, '');
  const y = b.replace(/[（）()；;、，,\s]/g, '');
  return x === y || x.includes(y) || y.includes(x);
}

export function getFamilyPracticeQuestions(count: number = 5): FamilyQuestion[] {
  const recorded = getRecordedWords();
  if (!recorded.length) return [];

  return shuffle(recorded)
    .slice(0, count)
    .map((item) => {
      const word = WORDS.find((w) => w.id === item.id);
      if (!word) return null;
      const pool = WORDS.filter(
        (w) => w.id !== word.id && !isSimilar(w.meaning, word.meaning)
      );
      const distractors = shuffle(pool).slice(0, 3);
      const options = shuffle([word, ...distractors]).map((w, index) => ({
        id: `${word.id}-opt-${index}-${w.id}`,
        text: w.meaning,
        correct: w.id === word.id,
      }));
      return {
        wordId: word.id,
        term: word.term,
        localTerm: item.localTerm,
        meaning: word.meaning,
        audioPath: item.audioPath,
        options,
      };
    })
    .filter((q): q is FamilyQuestion => Boolean(q));
}

export function getRecordedCount(): number {
  return getRecordedWords().length;
}
