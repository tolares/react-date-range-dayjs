/* eslint-disable no-fallthrough */
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { getMonthDisplayRange, getIntervals } from '../../utils';
import DayCell, { rangeShape } from '../DayCell';
import dayjs from '../../timeEngine';

function renderWeekdays(now, styles) {
  const startOfWeek = now.startOf('week');
  const endOfWeek = now.endOf('week');
  return (
    <div className={styles.weekDays}>
      {getIntervals(startOfWeek, endOfWeek).map((day, i) => (
        <span className={styles.weekDay} key={i}>
          {dayjs.weekdaysShort()[day.day()]}
        </span>
      ))}
    </div>
  );
}

class Month extends PureComponent {
  render() {
    const { displayMode, focusedRange, drag, styles, disabledDates, disabledDay, now, dateOptions } = this.props;
    if (dateOptions.weekStartsOn != null) {
      dayjs.updateLocale(dateOptions.locale, {
        weekStart: dateOptions.weekStartsOn,
      });
      now.$locale().weekStart = dateOptions.weekStartsOn;
    }
    dayjs.locale(dateOptions.locale);
    const minDate = this.props.minDate?.startOf('day');
    const maxDate = this.props.maxDate?.endOf('day');
    const monthDisplay = getMonthDisplayRange(
      this.props.month,
      this.props.dateOptions,
      this.props.fixedHeight
    );
    let ranges = this.props.ranges;
    if (displayMode === 'dateRange' && drag.status) {
      let { startDate, endDate } = drag.range;
      ranges = ranges.map((range, i) => {
        if (i !== focusedRange[0]) return range;
        return {
          ...range,
          startDate,
          endDate,
        };
      });
    }
    const showPreview = this.props.showPreview && !drag.disablePreview;
    return (
      <div className={styles.month} style={this.props.style}>
        {this.props.showMonthName ? (
          <div className={styles.monthName}>{dayjs.months()[this.props.month.month()]}</div>
        ) : null}
        {this.props.showWeekDays && renderWeekdays(now, styles)}
        <div className={styles.days} onMouseLeave={this.props.onMouseLeave}>
          {getIntervals(monthDisplay.start, monthDisplay.end).map((day, index) => {
            const isStartOfMonth = day.isSame(monthDisplay.startDateOfMonth, 'day');
            const isEndOfMonth = day.isSame(monthDisplay.endDateOfMonth, 'day');
            const isOutsideMinMax =
              (minDate && day.isBefore(minDate, 'day')) || (maxDate && day.isAfter(maxDate, 'day'));
            const isDisabledSpecifically = disabledDates.some(disabledDate =>
              disabledDate.isSame(day, 'day')
            );
            const isDisabledDay = disabledDay(day);
            return (
              <DayCell
                {...this.props}
                ranges={ranges}
                day={day}
                now={now}
                preview={showPreview ? this.props.preview : null}
                isWeekend={day.day() == 0 || day.day() == 6}
                isToday={day.isSame(now, 'day')}
                isStartOfWeek={day.isSame(day.startOf('week'), 'day')}
                isEndOfWeek={day.isSame(day.endOf('week'), 'day')}
                isStartOfMonth={isStartOfMonth}
                isEndOfMonth={isEndOfMonth}
                key={index}
                disabled={isOutsideMinMax || isDisabledSpecifically || isDisabledDay}
                isPassive={
                  !day.isBetween(
                    monthDisplay.startDateOfMonth.subtract(1, 'day'),
                    monthDisplay.endDateOfMonth.add(1, 'day'),
                    'day'
                  )
                }
                styles={styles}
                onMouseDown={this.props.onDragSelectionStart}
                onMouseUp={this.props.onDragSelectionEnd}
                onMouseEnter={this.props.onDragSelectionMove}
                dragRange={drag.range}
                drag={drag.status}
                selecting={this.props.selecting}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

Month.defaultProps = {
  now: dayjs(),
  readOnly: false,
  selecting: false,
};

Month.propTypes = {
  style: PropTypes.object,
  styles: PropTypes.object,
  month: PropTypes.object,
  drag: PropTypes.object,
  dateOptions: PropTypes.object,
  disabledDates: PropTypes.array,
  disabledDay: PropTypes.func,
  preview: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
  }),
  showPreview: PropTypes.bool,
  displayMode: PropTypes.oneOf(['dateRange', 'date']),
  minDate: PropTypes.object,
  maxDate: PropTypes.object,
  ranges: PropTypes.arrayOf(rangeShape),
  focusedRange: PropTypes.arrayOf(PropTypes.number),
  onDragSelectionStart: PropTypes.func,
  onDragSelectionEnd: PropTypes.func,
  onDragSelectionMove: PropTypes.func,
  onMouseLeave: PropTypes.func,
  monthDisplayFormat: PropTypes.string,
  weekdayDisplayFormat: PropTypes.string,
  dayDisplayFormat: PropTypes.string,
  showWeekDays: PropTypes.bool,
  showMonthName: PropTypes.bool,
  fixedHeight: PropTypes.bool,
  now: PropTypes.object,
  readOnly: PropTypes.bool,
  selecting: PropTypes.bool,
};

export default Month;
