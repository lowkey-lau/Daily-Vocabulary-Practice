import {
  FamilyStage,
  RecordedWord,
  getFamilyMembers,
  getFamilyOverview,
  resetFamily,
} from '../../services/family-store';

Page({
  data: {
    familyName: '',
    hometown: '',
    recordedCount: 0,
    totalWords: 0,
    percent: 0,
    recent: [] as RecordedWord[],
    hasRecordings: false,
    stages: [] as FamilyStage[],
    members: [] as Array<{
      id: string;
      name: string;
      role: string;
      initial: string;
      status: string;
    }>,
  },

  onShow() {
    wx.setNavigationBarTitle({ title: '家庭词库' });
    this.refresh();
  },

  refresh() {
    const overview = getFamilyOverview();
    this.setData({
      familyName: overview.familyName,
      hometown: overview.hometown,
      recordedCount: overview.recordedCount,
      totalWords: overview.totalWords,
      percent: overview.percent,
      recent: overview.recent,
      hasRecordings: overview.hasRecordings,
      stages: overview.stages,
      members: getFamilyMembers(),
    });
  },

  startRecording() {
    wx.navigateTo({ url: '/pages/family-record/index' });
  },

  openWords() {
    wx.navigateTo({ url: '/pages/family-words/index' });
  },

  startPractice() {
    if (!this.data.hasRecordings) {
      wx.showToast({ title: '先让长辈录几个词', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/family-practice/index' });
  },

  resetFamily() {
    wx.showModal({
      title: '清空家庭录音',
      content: '会删除本机所有长辈录音和词库记录，无法恢复。',
      confirmText: '清空',
      confirmColor: '#DF6747',
      success: (res) => {
        if (!res.confirm) return;
        resetFamily();
        this.refresh();
        wx.showToast({ title: '已清空', icon: 'none' });
      },
    });
  },
});
