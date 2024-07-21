import { timeFormat } from 'd3-time-format';

// 日付を月/日または日で表示する関数
export const formatDate = (date: Date, isFirstOfMonth: boolean) => {
  if (isFirstOfMonth) {
    return timeFormat('%-m/%-d')(date);
  }
  return timeFormat('%-d')(date);
};

// 月の初めの日付を判定するための関数
export const getFirstOfMonthTicks = (dates: Date[]) => {
  const months = new Set();
  return dates.map(date => {
    const month = date.getMonth();
    const year = date.getFullYear();
    const key = `${year}-${month}`;
    if (!months.has(key)) {
      months.add(key);
      return { date, isFirstOfMonth: true };
    }
    return { date, isFirstOfMonth: false };
  });
};
