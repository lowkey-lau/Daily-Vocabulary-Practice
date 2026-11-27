import { addExtraWords, getHome, getWrongCount } from '../../services/store';
import { getFamilyOverview } from '../../services/family-store';

Page({
  data: {
    todayLabel: '今天',
    bookTitle: '',
    bookSubtitle: '',
    learned: 0,
    mastered: 0,
    totalWords: 0,
    planTotal: 0,
    answered: 0,
    remaining: 0,
    completed: false,
    hasPlan: false,
    progressPercent: 0,
    bookPercent: 0,
    streak: 0,
    remainingNew: 0,
    planNewCount: 0,
    planReviewCount: 0,
    wrongCount: 0,
    familyRecorded: 0,
    familySubtitle: '让长辈录下家里的说法',
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const home = getHome();
    const recorded = getFamilyOverview().recordedCount;
    this.setData({
      ...home,
      wrongCount: getWrongCount(),
      familyRecorded: recorded,
      familySubtitle: recorded
        ? `已录 ${recorded} 个词 · 去听听`
        : '让长辈录下家里的说法',
    });
  },

  startPractice() {
    wx.navigateTo({ url: '/pages/practice/index?mode=plan' });
  },

  extraPractice() {
    const added = addExtraWords(3);
    if (!added) {
      wx.showToast({ title: '都学完啦', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: '/pages/practice/index?mode=plan' });
  },

  goBooks() {
    wx.switchTab({ url: '/pages/books/index' });
  },

  goBookDetail() {
    wx.navigateTo({ url: '/pages/book-detail/index' });
  },

  goWrong() {
    wx.navigateTo({ url: '/pages/wrongbook/index' });
  },

  goStats() {
    wx.navigateTo({ url: '/pages/stats/index' });
  },

  goFamily() {
    wx.navigateTo({ url: '/pages/family/index' });
  },
});
