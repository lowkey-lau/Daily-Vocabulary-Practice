import { getWrongWords } from '../../services/store';

Page({
  data: {
    words: [] as Array<{
      id: string;
      term: string;
      reading: string;
      meaning: string;
      count: number;
    }>,
    total: 0,
  },

  onShow() {
    wx.setNavigationBarTitle({ title: '错词本' });
    this.refresh();
  },

  refresh() {
    const words = getWrongWords();
    this.setData({ words, total: words.length });
  },

  review() {
    if (!this.data.total) {
      wx.showToast({ title: '错词本是空的', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/practice/index?mode=wrong' });
  },

  goPractice() {
    wx.switchTab({ url: '/pages/home/index' });
  },
});
