import dayjs from './timeEngine';

const defineds = (now = dayjs().utc(true)) => ({
  startOfWeek: now.startOf('week'),
  endOfWeek: now.endOf('week'),
  startOfLastWeek: now.subtract(7, 'day').startOf('day'),
  endOfLastWeek: now.subtract(7, 'day').endOf('week'),
  startOfToday: now.startOf('day'),
  endOfToday: now.endOf('day'),
  startOfYesterday: now.subtract(1, 'day').startOf('day'),
  endOfYesterday: now.subtract(1, 'day').endOf('day'),
  startOfMonth: now.startOf('month'),
  endOfMonth: now.endOf('month'),
  startOfLastMonth: now.subtract(1, 'month').startOf('month'),
  endOfLastMonth: now.subtract(1, 'month').endOf('month'),
});

const staticRangeHandler = {
  range: {},
  isSelected(range) {
    const definedRange = this.range();
    return (
      definedRange.startDate.isSame(range.startDate, 'day') &&
      definedRange.endDate.isSame(range.endDate, 'day')
    );
  },
};

export function createStaticRanges(ranges) {
  return ranges.map(range => ({ ...staticRangeHandler, ...range }));
}

export const defaultStaticRanges = (now = dayjs().utc(true)) =>
  (defineds =>
    createStaticRanges([
      {
        label: 'Today',
        range: () => ({
          startDate: defineds.startOfToday,
          endDate: defineds.endOfToday,
        }),
      },
      {
        label: 'Yesterday',
        range: () => ({
          startDate: defineds.startOfYesterday,
          endDate: defineds.endOfYesterday,
        }),
      },

      {
        label: 'This Week',
        range: () => ({
          startDate: defineds.startOfWeek,
          endDate: defineds.endOfWeek,
        }),
      },
      {
        label: 'Last Week',
        range: () => ({
          startDate: defineds.startOfLastWeek,
          endDate: defineds.endOfLastWeek,
        }),
      },
      {
        label: 'This Month',
        range: () => ({
          startDate: defineds.startOfMonth,
          endDate: defineds.endOfMonth,
        }),
      },
      {
        label: 'Last Month',
        range: () => ({
          startDate: defineds.startOfLastMonth,
          endDate: defineds.endOfLastMonth,
        }),
      },
    ]))(defineds(now));

export const defaultInputRanges = (now = dayjs().utc(true)) =>
  (defineds => [
    {
      label: 'days up to today',
      range(value) {
        return {
          startDate: defineds.startOfToday.add((Math.max(Number(value), 1) - 1) * -1, 'day'),
          endDate: defineds.endOfToday,
        };
      },
      getCurrentValue(range) {
        if (!dayjs(range.endDate).isSame(defineds.endOfToday, 'day')) return '-';
        if (!range.startDate) return '∞';
        return dayjs(defineds.endOfToday).diff(defineds.endOfToday, range.startDate, 'day') + 1;
      },
    },
    {
      label: 'days starting today',
      range(value) {
        const today = now;
        return {
          startDate: today,
          endDate: today.add(Math.max(Number(value), 1) - 1, 'day'),
        };
      },
      getCurrentValue(range) {
        if (!dayjs(defineds.startOfToday).isSame(dayjs(range.startDate), 'day')) return '-';
        if (!range.endDate) return '∞';
        return dayjs(range.endDate).diff(defineds.startOfToday, 'day') + 1;
      },
    },
  ])(defineds(now));
