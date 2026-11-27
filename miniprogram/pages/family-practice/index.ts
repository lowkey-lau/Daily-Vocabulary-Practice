import {
  FamilyQuestion,
  getFamilyPracticeQuestions,
} from '../../services/family-store';
import { submitAnswer } from '../../services/store';

Page({
  data: {
    questions: [] as FamilyQuestion[],
    index: 0,
    total: 0,
    question: null as FamilyQuestion | null,
    options: [] as Array<{
      id: string;
      text: string;
      letter: string;
      state: string;
    }>,
    answered: false,
    isCorrect: false,
    selectedId: '',
    correctCount: 0,
    showResult: false,
    progressPercent: 0,
    isPlaying: false,
  },

  audioCtx: null as any,

  onLoad() {
    wx.setNavigationBarTitle({ title: '听音选义' });
    const questions = getFamilyPracticeQuestions(5);
    if (!questions.length) {
      wx.showToast({ title: '先让长辈录几个词', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 900);
      return;
    }
    this.setData({
      questions,
      total: questions.length,
      correctCount: 0,
      showResult: false,
    });
    this.renderQuestion(0, questions);
  },

  onUnload() {
    this.stopPlayback();
  },

  renderQuestion(index: number, list?: FamilyQuestion[]) {
    const questions = list || this.data.questions;
    const question = questions[index];
    if (!question) return;
    const letters = ['A', 'B', 'C', 'D'];
    this.stopPlayback();
    this.setData({
      index,
      question,
      options: question.options.map((option, i) => ({
        id: option.id,
        text: option.text,
        letter: letters[i] || '',
        state: '',
      })),
      answered: false,
      isCorrect: false,
      selectedId: '',
      showResult: false,
      progressPercent: Math.round(((index + 1) / questions.length) * 100),
    });
  },

  playPrompt() {
    if (!this.data.question) return;
    if (this.data.isPlaying) {
      this.stopPlayback();
      return;
    }
    this.playPath(this.data.question.audioPath);
  },

  playPath(path: string) {
    this.stopPlayback();
    const ctx = wx.createInnerAudioContext();
    ctx.src = path;
    ctx.obeyMuteSwitch = false;
    ctx.onEnded(() => {
      this.setData({ isPlaying: false });
    });
    ctx.onError(() => {
      this.setData({ isPlaying: false });
      wx.showToast({ title: '播放失败', icon: 'none' });
    });
    ctx.play();
    this.audioCtx = ctx;
    this.setData({ isPlaying: true });
  },

  stopPlayback() {
    if (this.audioCtx) {
      try {
        this.audioCtx.stop();
        this.audioCtx.destroy();
      } catch (err) {
        // 忽略播放器清理失败。
      }
      this.audioCtx = null;
    }
    if (this.data.isPlaying) {
      this.setData({ isPlaying: false });
    }
  },

  onSelect(event: any) {
    if (this.data.answered) return;
    const id = event.currentTarget.dataset.id as string;
    const question = this.data.question;
    if (!question) return;
    const selected = question.options.find((option) => option.id === id);
    if (!selected) return;

    const correct = selected.correct;
    submitAnswer(question.wordId, correct, false);

    const options = this.data.options.map((option) => ({
      ...option,
      state:
        option.id === id
          ? correct
            ? 'correct'
            : 'wrong'
          : option.correct
          ? 'correct'
          : 'dim',
    }));

    this.stopPlayback();
    this.setData({
      options,
      answered: true,
      isCorrect: correct,
      selectedId: id,
      correctCount: this.data.correctCount + (correct ? 1 : 0),
    });
  },

  onContinue() {
    const next = this.data.index + 1;
    if (next >= this.data.total) {
      this.stopPlayback();
      this.setData({ showResult: true });
      return;
    }
    this.renderQuestion(next);
  },

  restart() {
    const questions = getFamilyPracticeQuestions(5);
    if (!questions.length) {
      wx.showToast({ title: '先让长辈录几个词', icon: 'none' });
      return;
    }
    this.stopPlayback();
    this.setData({
      questions,
      total: questions.length,
      correctCount: 0,
      showResult: false,
    });
    this.renderQuestion(0, questions);
  },

  goFamily() {
    wx.navigateBack();
  },
});
