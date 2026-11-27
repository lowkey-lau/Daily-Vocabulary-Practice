import {
  getHome,
  getSettings,
  resetAll,
  setDailyNew,
  setSound,
} from '../../services/store';

Page({
  data: {
    dailyOptions: [3, 5, 10],
    dailyNew: 5,
    sound: true,
    learned: 0,
    mastered: 0,
    totalWords: 0,
    streak: 0,
    version: '0.1.0',
    showAbout: false,
  },

  onShow() {
    wx.setNavigationBarTitle({ title: '我的' });
    this.refresh();
  },

  refresh() {
    const home = getHome();
    const settings = getSettings();
    this.setData({
      dailyNew: settings.dailyNew,
      sound: settings.sound,
      learned: home.learned,
      mastered: home.mastered,
      totalWords: home.totalWords,
      streak: home.streak,
    });
  },

  chooseDaily(event: any) {
    const value = Number(event.currentTarget.dataset.n);
    setDailyNew(value);
    this.refresh();
    wx.showToast({ title: `每天 ${value} 个`, icon: 'none' });
  },

  toggleSound(event: any) {
    const value = Boolean(event.detail.value);
    setSound(value);
    this.setData({ sound: value });
  },

  goStats() {
    wx.navigateTo({ url: '/pages/stats/index' });
  },

  goWrong() {
    wx.navigateTo({ url: '/pages/wrongbook/index' });
  },

  toggleAbout() {
    this.setData({ showAbout: !this.data.showAbout });
  },

  clearData() {
    wx.showModal({
      title: '清除学习数据',
      content: '会清空本机的学习记录、错词本和设置，且无法恢复。',
      confirmText: '清除',
      confirmColor: '#DF6747',
      success: (res) => {
        if (!res.confirm) return;
        resetAll();
        this.refresh();
        wx.showToast({ title: '已清除', icon: 'none' });
      },
    });
  },
});
