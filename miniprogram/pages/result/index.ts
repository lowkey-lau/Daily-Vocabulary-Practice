import {
  addExtraWords,
  getHome,
  getLastResult,
  getWrongCount,
  getWordsByIds,
} from '../../services/store';

Page({
  data: {
    hasResult: false,
    mode: 'plan',
    modeLabel: '今日练习',
    correct: 0,
    total: 0,
    accuracy: 0,
    starCount: 0,
    stars: [] as Array<{ id: number; on: boolean }>,
    message: '',
    newCount: 0,
    reviewCount: 0,
    durationText: '',
    wrongWords: [] as Array<{
      id: string;
      term: string;
      reading: string;
      meaning: string;
    }>,
    hasWrong: false,
    canAgain: false,
    streak: 0,
    dateLabel: '',
    isPerfect: false,
  },

  onLoad() {
    wx.setNavigationBarTitle({ title: '练习结果' });
    this.refresh();
  },

  refresh() {
    const result = getLastResult();
    if (!result) {
      this.setData({ hasResult: false });
      return;
    }

    const accuracy = result.total
      ? Math.round((result.correct / result.total) * 100)
      : 0;
    const starCount = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;
    const wrongWords = getWordsByIds(result.wrongIds);
    const home = getHome();
    const durationText =
      result.duration >= 60
        ? `${Math.floor(result.duration / 60)} 分 ${result.duration % 60} 秒`
        : `${result.duration} 秒`;
    const message =
      accuracy >= 90
        ? '记得好稳，继续保持。'
        : accuracy >= 70
        ? '不错，再练几个会更熟。'
        : '没关系，错词会再出现。';

    let newCount = 0;
    let reviewCount = 0;
    if (result.mode === 'wrong') {
      reviewCount = result.total;
    } else {
      newCount = result.newIds.length;
      reviewCount = result.reviewIds.length;
    }

    const canAgain =
      result.mode === 'wrong'
        ? getWrongCount() > 0
        : home.remaining > 0 || home.remainingNew > 0;

    this.setData({
      hasResult: true,
      mode: result.mode,
      modeLabel: result.mode === 'wrong' ? '错词复习' : '今日练习',
      correct: result.correct,
      total: result.total,
      accuracy,
      starCount,
      stars: [1, 2, 3].map((i) => ({ id: i, on: i <= starCount })),
      message,
      newCount,
      reviewCount,
      durationText,
      wrongWords,
      hasWrong: wrongWords.length > 0,
      canAgain,
      streak: home.streak,
      dateLabel: result.date,
      isPerfect: accuracy === 100 && result.total > 0,
    });
  },

  again() {
    if (this.data.mode === 'wrong') {
      if (!getWrongCount()) {
        wx.showToast({ title: '错词都复习完啦', icon: 'none' });
        return;
      }
      wx.redirectTo({ url: '/pages/practice/index?mode=wrong' });
      return;
    }

    const home = getHome();
    if (home.remaining > 0) {
      wx.redirectTo({ url: '/pages/practice/index?mode=plan' });
      return;
    }
    if (home.remainingNew > 0) {
      addExtraWords(3);
      wx.redirectTo({ url: '/pages/practice/index?mode=plan' });
      return;
    }
    wx.showToast({ title: '都学完啦', icon: 'none' });
  },

  reviewWrong() {
    if (!getWrongCount()) {
      wx.showToast({ title: '错词本是空的', icon: 'none' });
      return;
    }
    wx.redirectTo({ url: '/pages/practice/index?mode=wrong' });
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/index' });
  },
});
