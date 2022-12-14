import classnames from 'classnames';
import dayjs from 'dayjs';

export function calcFocusDate(currentFocusedDate, props) {
  const { shownDate, date, months, ranges, focusedRange, displayMode } = props;
  // find primary date according the props
  let targetInterval;
  if (displayMode === 'dateRange') {
    const range = ranges[focusedRange[0]] || {};
    targetInterval = {
      start: range.startDate,
      end: range.endDate,
    };
  } else {
    targetInterval = {
      start: date,
      end: date,
    };
  }
  targetInterval.start = (dayjs(targetInterval.start) || dayjs()).startOf('month');
  targetInterval.end = (dayjs(targetInterval.end) || dayjs(targetInterval.start)).endOf('month');
  const targetDate = targetInterval.start || targetInterval.end || shownDate || dayjs();

  // initial focus
  if (!currentFocusedDate) return shownDate || targetDate;

  // // just return targetDate for native scrolled calendars
  // if (props.scroll.enabled) return targetDate;
  if (targetInterval.start.diff(targetInterval.end, 'month') > months) {
    // don't change focused if new selection in view area
    return currentFocusedDate;
  }
  return targetDate;
}

export function findNextRangeIndex(ranges, currentRangeIndex = -1) {
  const nextIndex = ranges.findIndex(
    (range, i) => i > currentRangeIndex && range.autoFocus !== false && !range.disabled
  );
  if (nextIndex !== -1) return nextIndex;
  return ranges.findIndex(range => range.autoFocus !== false && !range.disabled);
}

export function getMonthDisplayRange(date, dateOptions, fixedHeight) {
  const startDateOfMonth = dayjs(date).startOf('month');
  const endDateOfMonth = dayjs(date).endOf('month');
  const startDateOfCalendar = startDateOfMonth.startOf('isoWeek');
  let endDateOfCalendar = endDateOfMonth.endOf('isoWeek');
  if (fixedHeight && endDateOfCalendar.diff(startDateOfCalendar, 'day') <= 34) {
    endDateOfCalendar = endDateOfCalendar.add(7, 'day');
  }

  return {
    start: startDateOfCalendar,
    end: endDateOfCalendar,
    startDateOfMonth,
    endDateOfMonth,
  };
}

export function generateStyles(sources) {
  if (!sources.length) return {};
  const generatedStyles = sources
    .filter(source => Boolean(source))
    .reduce((styles, styleSource) => {
      Object.keys(styleSource).forEach(key => {
        styles[key] = classnames(styles[key], styleSource[key]);
      });
      return styles;
    }, {});
  return generatedStyles;
}

export function getIntervals(currentDay, closeDay) {
  var currentDate = dayjs(currentDay);
  var closeTime = dayjs(closeDay);
  const dateRanges = [];
  while (currentDate.isBefore(closeTime, 'day') || currentDate.isSame(closeTime, 'day')) {
    dateRanges.push(currentDate.format());
    currentDate = currentDate.add(1, 'day');
  }
  return dateRanges;
}
