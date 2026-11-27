import { BOOK, UPCOMING_BOOKS } from '../../data/words';
import { getBookDetail } from '../../services/store';

Page({
  data: {
    book: {
      title: BOOK.title,
      subtitle: BOOK.subtitle,
      description: BOOK.description,
    },
    upcoming: UPCOMING_BOOKS,
    learned: 0,
    totalWords: 0,
    percent: 0,
    mastered: 0,
    hasProgress: false,
  },

  onShow() {
    wx.setNavigationBarTitle({ title: '词书' });
    this.refresh();
  },

  refresh() {
    const detail = getBookDetail();
    this.setData({
      learned: detail.learned,
      totalWords: detail.totalWords,
      percent: detail.percent,
      mastered: detail.mastered,
      hasProgress: detail.learned > 0,
    });
  },

  openBook() {
    wx.navigateTo({ url: '/pages/book-detail/index' });
  },

  start() {
    wx.navigateTo({ url: '/pages/practice/index?mode=plan' });
  },

  showComing() {
    wx.showToast({ title: '更多词书筹备中', icon: 'none' });
  },
});
