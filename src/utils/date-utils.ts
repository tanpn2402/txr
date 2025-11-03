import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

export const getStartOfWeek = (date: string | Date = new Date(), format = 'YYYY-MM-DD') => {
  const startOfWeek = dayjs(date).startOf('isoWeek');
  return startOfWeek.format(format);
};

export function getWeekdays(date: string | Date = new Date(), format = 'YYYY-MM-DD') {
  const startOfWeek = dayjs(date).startOf('isoWeek');
  return Array.from({ length: 5 }, (_, i) => startOfWeek.add(i, 'day').format(format));
}
