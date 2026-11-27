import {
  RecordedWord,
  getFamilyOverview,
  removeRecording,
} from '../../services/family-store';

Page({
  data: {
    words: [] as RecordedWord[],
    count: 0,
    totalWords: 0,
    percent: 0,
    hasRecordings: false,
    playingId: '',
  },

  audioCtx: null as any,

  onShow() {
    wx.setNavigationBarTitle({ title: '家庭词库' });
    this.refresh();
  },

  onUnload() {
    this.stopPlayback();
  },

  refresh() {
    const overview = getFamilyOverview();
    this.setData({
      words: overview.recordings,
      count: overview.recordedCount,
      totalWords: overview.totalWords,
      percent: overview.percent,
      hasRecordings: overview.hasRecordings,
    });
  },

  play(event: any) {
    const id = event.currentTarget.dataset.id as string;
    const word = this.data.words.find((item) => item.id === id);
    if (!word) return;
    if (this.data.playingId === id) {
      this.stopPlayback();
      return;
    }
    this.playPath(word.audioPath, id);
  },

  playPath(path: string, id: string) {
    this.stopPlayback();
    const ctx = wx.createInnerAudioContext();
    ctx.src = path;
    ctx.obeyMuteSwitch = false;
    ctx.onEnded(() => {
      this.setData({ playingId: '' });
    });
    ctx.onError(() => {
      this.setData({ playingId: '' });
      wx.showToast({ title: '播放失败', icon: 'none' });
    });
    ctx.play();
    this.audioCtx = ctx;
    this.setData({ playingId: id });
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
    if (this.data.playingId) {
      this.setData({ playingId: '' });
    }
  },

  rerecord(event: any) {
    const id = event.currentTarget.dataset.id as string;
    wx.navigateTo({
      url: `/pages/family-record/index?wordId=${id}`,
    });
  },

  remove(event: any) {
    const id = event.currentTarget.dataset.id as string;
    const word = this.data.words.find((item) => item.id === id);
    const label = word ? word.localTerm : '这条';
    wx.showModal({
      title: '删除录音',
      content: `删除「${label}」的录音？`,
      confirmText: '删除',
      confirmColor: '#DF6747',
      success: (res) => {
        if (!res.confirm) return;
        this.stopPlayback();
        removeRecording(id);
        this.refresh();
        wx.showToast({ title: '已删除', icon: 'none' });
      },
    });
  },

  goRecord() {
    wx.navigateTo({ url: '/pages/family-record/index' });
  },

  goFamily() {
    wx.navigateBack();
  },
});
