import { getBookDetail } from '../../services/store';

Page({
  data: {
    detail: null as ReturnType<typeof getBookDetail> | null,
  },

  onShow() {
    wx.setNavigationBarTitle({ title: '词书详情' });
    this.setData({ detail: getBookDetail() });
  },

  start() {
    wx.navigateTo({ url: '/pages/practice/index?mode=plan' });
  },
});
