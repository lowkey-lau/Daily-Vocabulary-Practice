import {
  Question,
  buildPlanResult,
  buildWrongResult,
  getQuestions,
  getSettings,
  saveResult,
  submitAnswer,
} from '../../services/store';
import { getRecording } from '../../services/family-store';

type OptionView = {
  id: string;
  text: string;
  letter: string;
  state: string;
};

Page({
  data: {
    mode: 'plan',
    questions: [] as Question[],
    index: 0,
    total: 0,
    question: null as Question | null,
    options: [] as OptionView[],
    answered: false,
    showFeedback: false,
    isCorrect: false,
    selectedId: '',
    feedbackTitle: '',
    progressPercent: 0,
    isLast: false,
    startAt: 0,
    sessionCorrect: 0,
    sessionWrongIds: [] as string[],
    hasFamilyAudio: false,
    familyAudioPath: '',
    isPlaying: false,
  },

  audioCtx: null as any,

  onLoad(options: Record<string, string>) {
    const mode = options.mode === 'wrong' ? 'wrong' : 'plan';
    const questions = getQuestions(mode);

    if (!questions.length) {
      wx.showToast({
        title: mode === 'wrong' ? '错词本是空的' : '今天没有新词',
        icon: 'none',
      });
      setTimeout(() => wx.navigateBack(), 900);
      return;
    }

    wx.setNavigationBarTitle({
      title: mode === 'wrong' ? '错词复习' : '今日练习',
    });

    this.setData({
      mode,
      questions,
      total: questions.length,
      index: 0,
      startAt: Date.now(),
      sessionCorrect: 0,
      sessionWrongIds: [],
    });
    this.renderQuestion(0, questions);

    if (wx.enableAlertBeforeUnload) {
      wx.enableAlertBeforeUnload({
        message: '退出后已答的进度会保留，确定离开吗？',
      });
    }
  },

  renderQuestion(index: number, list?: Question[]) {
    const questions = list || this.data.questions;
    const question = questions[index];
    if (!question) return;
    const letters = ['A', 'B', 'C', 'D'];
    const familyRecording = getRecording(question.wordId);
    this.stopAudio();

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
      showFeedback: false,
      isCorrect: false,
      selectedId: '',
      feedbackTitle: '',
      isLast: index === questions.length - 1,
      progressPercent: Math.round(((index + 1) / questions.length) * 100),
      hasFamilyAudio: Boolean(familyRecording),
      familyAudioPath: familyRecording ? familyRecording.audioPath : '',
      isPlaying: false,
    });
  },

  onSelect(event: WechatMiniprogram.TouchEvent) {
    if (this.data.answered) return;
    const id = event.currentTarget.dataset.id as string;
    const question = this.data.question;
    if (!question) return;

    const selected = question.options.find((option) => option.id === id);
    if (!selected) return;

    const correct = selected.correct;
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

    submitAnswer(question.wordId, correct, this.data.mode === 'plan');

    const settings = getSettings();
    if (settings.sound && wx.vibrateShort) {
      wx.vibrateShort({ type: correct ? 'light' : 'medium' });
    }

    const sessionWrongIds = correct
      ? this.data.sessionWrongIds
      : [...this.data.sessionWrongIds, question.wordId];

    this.setData({
      options,
      answered: true,
      showFeedback: true,
      isCorrect: correct,
      selectedId: id,
      feedbackTitle: correct ? '答对了' : '再记一次',
      sessionCorrect: this.data.sessionCorrect + (correct ? 1 : 0),
      sessionWrongIds,
    });
  },

  onContinue() {
    const next = this.data.index + 1;
    if (next >= this.data.total) {
      this.finish();
      return;
    }
    this.renderQuestion(next);
  },

  finish() {
    this.stopAudio();
    if (wx.disableAlertBeforeUnload) {
      wx.disableAlertBeforeUnload();
    }
    const duration = Math.max(
      1,
      Math.round((Date.now() - this.data.startAt) / 1000)
    );
    const result =
      this.data.mode === 'wrong'
        ? buildWrongResult(
            this.data.sessionCorrect,
            this.data.total,
            this.data.sessionWrongIds,
            duration
          )
        : buildPlanResult(duration);
    saveResult(result);
    wx.redirectTo({ url: '/pages/result/index' });
  },

  onAudio() {
    if (!this.data.familyAudioPath) {
      wx.showToast({ title: '这个字还没有长辈录音', icon: 'none' });
      return;
    }
    if (this.data.isPlaying) {
      this.stopAudio();
      return;
    }
    this.playAudio(this.data.familyAudioPath);
  },

  playAudio(path: string) {
    this.stopAudio();
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

  stopAudio() {
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

  onExit() {
    wx.navigateBack();
  },

  onUnload() {
    this.stopAudio();
    if (wx.disableAlertBeforeUnload) {
      wx.disableAlertBeforeUnload();
    }
  },
});
