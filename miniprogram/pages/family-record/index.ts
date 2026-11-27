import { WORDS, Word } from '../../data/words';
import {
  deleteAudioFile,
  getFamilyOverview,
  getRecording,
  saveRecording,
  saveRecordingFile,
} from '../../services/family-store';

const MAX_SECONDS = 15;

Page({
  data: {
    word: null as Word | null,
    index: 0,
    total: WORDS.length,
    recordedCount: 0,
    progressPercent: 0,
    isRecording: false,
    isPlaying: false,
    hasTake: false,
    seconds: 0,
    audioPath: '',
    localTerm: '',
    permissionDenied: false,
    permissionChecked: false,
    lastWord: false,
  },

  recorder: null as any,
  audioCtx: null as any,
  timer: null as any,
  recordStartedAt: 0,
  pendingPath: '',
  savedPath: '',
  unloaded: false,

  onLoad(options: Record<string, string>) {
    wx.setNavigationBarTitle({ title: '长辈录音' });
    this.unloaded = false;
    this.initRecorder();
    this.preparePermission();

    let startIndex = 0;
    if (options.wordId) {
      const found = WORDS.findIndex((w) => w.id === options.wordId);
      if (found >= 0) startIndex = found;
    } else {
      const firstUnrecorded = WORDS.findIndex((w) => !getRecording(w.id));
      if (firstUnrecorded >= 0) startIndex = firstUnrecorded;
    }
    this.loadWord(startIndex);
  },

  onShow() {
    if (this.data.permissionChecked) {
      this.preparePermission();
    }
  },

  onUnload() {
    this.unloaded = true;
    this.clearTimer();
    if (this.data.isRecording && this.recorder) {
      try {
        this.recorder.stop();
      } catch (err) {
        // 忽略退出时的停止失败。
      }
    }
    this.stopPlayback();
    if (this.pendingPath && this.pendingPath !== this.savedPath) {
      deleteAudioFile(this.pendingPath);
    }
  },

  initRecorder() {
    const recorder = wx.getRecorderManager();
    recorder.onStart(() => {
      this.setData({ isRecording: true });
    });
    recorder.onStop((res: any) => {
      this.handleRecorderStop(res);
    });
    recorder.onError(() => {
      this.clearTimer();
      this.setData({ isRecording: false });
      wx.showToast({ title: '录音失败，请用真机试试', icon: 'none' });
    });
    this.recorder = recorder;
  },

  preparePermission() {
    wx.getSetting({
      success: (res) => {
        const auth = res.authSetting['scope.record'];
        if (auth === true) {
          this.setData({ permissionDenied: false, permissionChecked: true });
          return;
        }
        if (auth === false) {
          this.setData({ permissionDenied: true, permissionChecked: true });
          return;
        }
        wx.authorize({
          scope: 'scope.record',
          success: () => {
            this.setData({ permissionDenied: false, permissionChecked: true });
          },
          fail: () => {
            this.setData({ permissionDenied: true, permissionChecked: true });
          },
        });
      },
      fail: () => {
        this.setData({ permissionChecked: true });
      },
    });
  },

  openSettings() {
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.record']) {
          this.setData({ permissionDenied: false });
        }
      },
    });
  },

  loadWord(index: number) {
    const word = WORDS[index];
    if (!word) return;
    const existing = getRecording(word.id);
    this.stopPlayback();
    this.savedPath = existing ? existing.audioPath : '';
    this.pendingPath = '';
    this.setData({
      word,
      index,
      total: WORDS.length,
      recordedCount: getFamilyOverview().recordedCount,
      progressPercent: Math.round(((index + 1) / WORDS.length) * 100),
      isRecording: false,
      isPlaying: false,
      hasTake: Boolean(existing),
      seconds: existing ? existing.duration : 0,
      audioPath: existing ? existing.audioPath : '',
      localTerm: existing ? existing.localTerm : '',
      lastWord: index === WORDS.length - 1,
    });
  },

  startTimer() {
    this.clearTimer();
    this.timer = setInterval(() => {
      const seconds = Math.min(
        MAX_SECONDS,
        Math.floor((Date.now() - this.recordStartedAt) / 1000)
      );
      this.setData({ seconds });
    }, 250);
  },

  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  onRecordTap() {
    if (this.data.permissionDenied) {
      wx.showModal({
        title: '需要麦克风权限',
        content: '请在设置里打开麦克风权限后再录音。',
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) this.openSettings();
        },
      });
      return;
    }
    if (this.data.isRecording) {
      this.recorder.stop();
      return;
    }
    if (!this.data.word || !this.recorder) return;

    this.stopPlayback();
    this.pendingPath = '';
    this.recordStartedAt = Date.now();
    this.setData({ isRecording: true, isPlaying: false, seconds: 0 });

    try {
      this.recorder.start({
        duration: MAX_SECONDS * 1000,
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 48000,
        format: 'mp3',
      });
      this.startTimer();
    } catch (err) {
      this.clearTimer();
      this.setData({ isRecording: false });
      wx.showToast({ title: '开始录音失败', icon: 'none' });
    }
  },

  handleRecorderStop(res: any) {
    if (this.unloaded) return;
    this.clearTimer();
    this.setData({ isRecording: false });
    const word = this.data.word;
    const tempFilePath = res && res.tempFilePath;
    if (!word || !tempFilePath) {
      wx.showToast({ title: '没有录到声音，再试一次', icon: 'none' });
      return;
    }

    const duration = Math.min(
      MAX_SECONDS,
      Math.max(
        1,
        Math.round((res.duration || Date.now() - this.recordStartedAt) / 1000)
      )
    );

    let audioPath = '';
    try {
      audioPath = saveRecordingFile(tempFilePath, word.id);
    } catch (err) {
      wx.showToast({ title: '保存录音失败，请重试', icon: 'none' });
      return;
    }

    this.pendingPath = audioPath;
    this.setData({
      audioPath,
      seconds: duration,
      hasTake: true,
      isPlaying: false,
    });
    this.playPath(audioPath);
  },

  playTake() {
    if (!this.data.audioPath || this.data.isRecording) return;
    if (this.data.isPlaying) {
      this.stopPlayback();
      return;
    }
    this.playPath(this.data.audioPath);
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

  onLocalTermInput(event: any) {
    this.setData({ localTerm: event.detail.value });
  },

  saveAndNext() {
    const word = this.data.word;
    if (!word || !this.data.hasTake || !this.data.audioPath) {
      wx.showToast({ title: '先录一段', icon: 'none' });
      return;
    }
    saveRecording(
      word.id,
      this.data.localTerm,
      this.data.audioPath,
      this.data.seconds
    );
    this.savedPath = this.data.audioPath;
    this.pendingPath = '';
    this.setData({ recordedCount: getFamilyOverview().recordedCount });
    wx.showToast({ title: '保存好了', icon: 'none' });
    this.goNext();
  },

  goNext() {
    if (this.data.index + 1 >= WORDS.length) {
      wx.showModal({
        title: '这一轮过完了',
        content: '可以回家庭主页看看进度，也可以再回来补录。',
        showCancel: false,
        confirmText: '回家庭',
        success: () => {
          wx.navigateBack();
        },
      });
      return;
    }
    this.loadWord(this.data.index + 1);
  },

  skip() {
    if (this.pendingPath && this.pendingPath !== this.savedPath) {
      deleteAudioFile(this.pendingPath);
    }
    this.pendingPath = '';
    this.goNext();
  },

  goBack() {
    wx.navigateBack();
  },
});
