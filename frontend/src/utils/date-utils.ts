import dayjs, {Dayjs} from 'dayjs';

export function formatDate(date?: Date | null) {
  if (!date) {
    return '';
  }

  return dayjs(date).format('YYYY/MM/DD');
}

export function dateFromNow(date?: Date) {
  if (!date) {
    return '';
  }

  return dayjs(date).fromNow();
}

export function formatDateToHoursAndMinutes(date?: Date) {
  if (!date) {
    return '';
  }

  return dayjs(date).format('HH:mm A');
}

export function getMonthAndYear(date?: Date) {
  if (!date) {
    return '';
  }

  return dayjs(date).format('MMMM YYYY');
}

export function findDateDifference(date: Dayjs) {
  const difference = dayjs.duration(dayjs(date).diff(new Date()));

  const years =
    (difference as any).$d.years < 0 ? 0 : (difference as any).$d.years;
  const months =
    (difference as any).$d.months < 0 ? 0 : (difference as any).$d.months;
  const days =
    (difference as any).$d.days < 0 ? 0 : (difference as any).$d.days;
  const hours =
    (difference as any).$d.hours < 0 ? 0 : (difference as any).$d.hours;
  const minutes =
    (difference as any).$d.minutes < 0 ? 0 : (difference as any).$d.minutes;
  const seconds =
    (difference as any).$d.seconds < 0 ? 0 : (difference as any).$d.seconds;

  return {months, days, hours, minutes, seconds, years};
}

export function formatDateToString(date?: Date) {
  if (!date) {
    return '';
  }

  return dayjs(date).format('YYYY-MM-DD');
}
