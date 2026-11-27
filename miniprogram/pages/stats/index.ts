import { getStatistics } from '../../services/store';

Page({
  data: {
    stats: null as ReturnType<typeof getStatistics> | null,
  },

  onShow() {
    wx.setNavigationBarTitle({ title: '学习统计' });
    this.setData({ stats: getStatistics() });
  },

  goPractice() {
    wx.navigateTo({ url: '/pages/practice/index?mode=plan' });
  },

  goWrong() {
    wx.navigateTo({ url: '/pages/wrongbook/index' });
  },
});
