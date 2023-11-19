
import { shallowEqualObjects } from 'shallow-equal';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import ReactList from 'react-list';

import dayjs from './../../timeEngine';
import { ariaLabelsShape } from '../../accessibility';
import { calcFocusDate, generateStyles, getMonthDisplayRange, getIntervals, checkProps } from '../../utils';
import { rangeShape } from '../DayCell';
import coreStyles from '../../styles';
import DateInput from '../DateInput';
import Month from '../Month';
import styles from '../../styles';


class Calendar extends PureComponent {
  constructor(props, context) {
    super(props, context);
    checkProps(props, 'Calendar')
    this.dateOptions = { locale: props.locale };
    if (props.weekStartsOn !== undefined) this.dateOptions.weekStartsOn = props.weekStartsOn;
    if (this.dateOptions.weekStartsOn != null) {
      dayjs.updateLocale(this.dateOptions.locale, {
        weekStart: this.dateOptions.weekStartsOn,
      });
      this.props.now.$locale().weekStart = this.dateOptions.weekStartsOn;
    }
    dayjs.locale(this.dateOptions.locale);
    this.styles = generateStyles([coreStyles, props.classNames]);
    this.listSizeCache = {};
    this.isFirstRender = true;
    this.state = {
      monthNames: this.getMonthNames(),
      focusedDate: calcFocusDate(null, props),
      drag: {
        status: false,
        range: { startDate: null, endDate: null },
        disablePreview: false
      },
      scrollArea: this.calcScrollArea(props)
    };
  }
  getMonthNames() {
    return [...Array(12).keys()].map(i => dayjs.months()[i]);
  }

  calcScrollArea(props) {
    const { direction, months, scroll } = props;
    if (!scroll.enabled) return { enabled: false };

    const longMonthHeight = scroll.longMonthHeight || scroll.monthHeight;
    if (direction === 'vertical') {
      return {
        enabled: true,
        monthHeight: scroll.monthHeight || 220,
        longMonthHeight: longMonthHeight || 260,
        calendarWidth: 'auto',
        calendarHeight: (scroll.calendarHeight || longMonthHeight || 240) * months
      };
    }
    return {
      enabled: true,
      monthWidth: scroll.monthWidth || 332,
      calendarWidth: (scroll.calendarWidth || scroll.monthWidth || 332) * months,
      monthHeight: longMonthHeight || 300,
      calendarHeight: longMonthHeight || 300
    };
  }
  focusToDate = (date, props = this.props, preventUnnecessary = true) => {
    if (!props.scroll.enabled) {
      if (preventUnnecessary && props.preventSnapRefocus) {
        const focusedDateDiff = date.diff(this.state.focusedDate, 'month');
        const isAllowedForward = props.calendarFocus === 'forwards' && focusedDateDiff >= 0;
        const isAllowedBackward = props.calendarFocus === 'backwards' && focusedDateDiff <= 0;
        if ((isAllowedForward || isAllowedBackward) && Math.abs(focusedDateDiff) < props.months) {
          return;
        }
      }
      this.setState({ focusedDate: date });
      return;
    }
    const targetMonthIndex = date.diff(props.minDate, 'month');
    const visibleMonths = this.list.getVisibleRange();
    if (preventUnnecessary && visibleMonths.includes(targetMonthIndex)) return;
    this.isFirstRender = true;
    this.list.scrollTo(targetMonthIndex);
    this.setState({ focusedDate: date });
  };
  updateShownDate = (props = this.props) => {
    const newProps = props.scroll.enabled
      ? {
          ...props,
          months: this.list.getVisibleRange().length
        }
      : props;
    const newFocus = calcFocusDate(this.state.focusedDate, newProps);
    this.focusToDate(newFocus, newProps);
  };
  updatePreview = val => {
    if (!val) {
      this.setState({ preview: null });
      return;
    }
    const preview = {
      startDate: val,
      endDate: val,
      color: this.props.color
    };
    this.setState({ preview });
  };
  componentDidMount() {
    if (this.props.scroll.enabled) {
      // prevent react-list's initial render focus problem
      setTimeout(() => this.focusToDate(this.state.focusedDate));
    }
  }

  componentDidUpdate(prevProps) {
    const propMapper = {
      dateRange: 'ranges',
      date: 'date'
    };
    const targetProp = propMapper[this.props.displayMode];
    if (this.props[targetProp] !== prevProps[targetProp]) {
      this.updateShownDate(this.props);
    }

    if (prevProps.locale !== this.props.locale || prevProps.weekStartsOn !== this.props.weekStartsOn) {
      this.dateOptions = { locale: this.props.locale };
      if (this.props.weekStartsOn !== undefined) this.dateOptions.weekStartsOn = this.props.weekStartsOn;
      if (this.dateOptions.weekStartsOn != null) {
        dayjs.updateLocale(this.dateOptions.locale, {
          weekStart: this.dateOptions.weekStartsOn,
        });
       this.props.now.$locale().weekStart = this.dateOptions.weekStartsOn;
      }
      dayjs.locale(this.dateOptions.locale);
      this.setState({
        monthNames: this.getMonthNames()
      });
    }

    if (!shallowEqualObjects(prevProps.scroll, this.props.scroll)) {
      this.setState({ scrollArea: this.calcScrollArea(this.props) });
    }
  }

  changeShownDate = (value, mode = 'set') => {
    const { focusedDate } = this.state;
    const { onShownDateChange, minDate, maxDate } = this.props;
    const modeMapper = {
      monthOffset: () => focusedDate.add(value, 'month'),
      setMonth: () => focusedDate.month(value),
      setYear: () => focusedDate.year(value),
      set: () => value,
    };
    const newDate = dayjs.min(
      dayjs.max(modeMapper[mode](), minDate),
      maxDate
    );
    this.focusToDate(newDate, this.props, false);
    onShownDateChange && onShownDateChange(newDate);
  };
  handleRangeFocusChange = (rangesIndex, rangeItemIndex) => {
    this.props.onRangeFocusChange && this.props.onRangeFocusChange([rangesIndex, rangeItemIndex]);
  };
  handleScroll = () => {
    const { onShownDateChange, minDate } = this.props;
    const { focusedDate } = this.state;
    const { isFirstRender } = this;

    const visibleMonths = this.list.getVisibleRange();
    // prevent scroll jump with wrong visible value
    if (visibleMonths[0] === undefined) return;
    const visibleMonth = minDate.add(visibleMonths[0] || 0, 'month');
    const isFocusedToDifferent = !visibleMonth.isSame(focusedDate, 'month');
    if (isFocusedToDifferent && !isFirstRender) {
      this.setState({ focusedDate: visibleMonth });
      onShownDateChange && onShownDateChange(visibleMonth);
    }
    this.isFirstRender = false;
  };
  renderMonthAndYear = (focusedDate, changeShownDate, props) => {
    const { showMonthArrow, minDate, maxDate, showMonthAndYearPickers, ariaLabels } = props;
    const upperYearLimit = (maxDate || Calendar.defaultProps.maxDate).year();
    const lowerYearLimit = (minDate || Calendar.defaultProps.minDate).year();
    const styles = this.styles;
    return (
      <div onMouseUp={e => e.stopPropagation()} className={styles.monthAndYearWrapper}>
        {showMonthArrow ? (
          <button
            type="button"
            className={classnames(styles.nextPrevButton, styles.prevButton)}
            onClick={() => changeShownDate(-1, 'monthOffset')}
            aria-label={ariaLabels.prevButton}
          >
            <i />
          </button>
        ) : null}
        {showMonthAndYearPickers ? (
          <span className={styles.monthAndYearPickers}>
            <span className={styles.monthPicker}>
              <select
                value={focusedDate.month()}
                onChange={e => changeShownDate(e.target.value, 'setMonth')}
                aria-label={ariaLabels.monthPicker}
              >
                {this.state.monthNames.map((monthName, i) => (
                  <option key={i} value={i}>
                    {monthName}
                  </option>
                ))}
              </select>
            </span>
            <span className={styles.monthAndYearDivider} />
            <span className={styles.yearPicker}>
              <select
                value={focusedDate.year()}
                onChange={e => changeShownDate(e.target.value, 'setYear')}
                aria-label={ariaLabels.yearPicker}
              >
                {new Array(upperYearLimit - lowerYearLimit + 1).fill(upperYearLimit).map((val, i) => {
                  const year = val - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </span>
          </span>
        ) : (
          <span className={styles.monthAndYearPickers}>
            {this.state.monthNames[focusedDate.getMonth()]} {focusedDate.year()}
          </span>
        )}
        {showMonthArrow ? (
          <button
            type="button"
            className={classnames(styles.nextPrevButton, styles.nextButton)}
            onClick={() => changeShownDate(+1, 'monthOffset')}
            aria-label={ariaLabels.nextButton}
          >
            <i />
          </button>
        ) : null}
      </div>
    );
  };
  renderWeekdays() {
    let currentDate = this.props.now.startOf('week');
    const closeTime = this.props.now.endOf('week');
    const dateRanges = getIntervals(currentDate, closeTime);
    return (
      <div className={this.styles.weekDays}>
        {dateRanges.map((day, i) => (
          <span className={this.styles.weekDay} key={i}>
            {dayjs.weekdaysShort()[day.day()]}
          </span>
        ))}
      </div>
    );
  }
  renderDateDisplay = () => {
    const {
      focusedRange,
      color,
      ranges,
      rangeColors,
      dateDisplayFormat,
      editableDateInputs,
      startDatePlaceholder,
      endDatePlaceholder,
      ariaLabels
    } = this.props;

    const defaultColor = rangeColors[focusedRange[0]] || color;
    const styles = this.styles;

    return (
      <div className={styles.dateDisplayWrapper}>
        {ranges.map((range, i) => {
          if (range.showDateDisplay === false || (range.disabled && !range.showDateDisplay)) return null;
          return (
            <div className={styles.dateDisplay} key={i} style={{ color: range.color || defaultColor }}>
              <DateInput
                className={classnames(styles.dateDisplayItem, {
                  [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 0
                })}
                readOnly={!editableDateInputs}
                disabled={range.disabled}
                value={range.startDate}
                placeholder={startDatePlaceholder}
                dateOptions={this.dateOptions}
                dateDisplayFormat={dateDisplayFormat}
                ariaLabel={
                  ariaLabels.dateInput &&
                  ariaLabels.dateInput[range.key] &&
                  ariaLabels.dateInput[range.key].startDate
                }
                onChange={this.onDragSelectionEnd}
                onFocus={() => this.handleRangeFocusChange(i, 0)}
              />
              <DateInput
                className={classnames(styles.dateDisplayItem, {
                  [styles.dateDisplayItemActive]: focusedRange[0] === i && focusedRange[1] === 1
                })}
                readOnly={!editableDateInputs}
                disabled={range.disabled}
                value={range.endDate}
                placeholder={endDatePlaceholder}
                dateOptions={this.dateOptions}
                dateDisplayFormat={dateDisplayFormat}
                ariaLabel={
                  ariaLabels.dateInput &&
                  ariaLabels.dateInput[range.key] &&
                  ariaLabels.dateInput[range.key].endDate
                }
                onChange={this.onDragSelectionEnd}
                onFocus={() => this.handleRangeFocusChange(i, 1)}
              />
            </div>
          );
        })}
      </div>
    );
  };
  onDragSelectionStart = date => {
    const { onChange, dragSelectionEnabled } = this.props;
    if(!dragSelectionEnabled) return onChange && onChange(date);

    this.setState({
      drag: {
        status: true,
        range: { startDate: date, endDate: date },
        disablePreview: true
      },
      selecting: true,
    });
  };

  onDragSelectionEnd = date => {
    const { updateRange, displayMode, onChange, dragSelectionEnabled } = this.props;

    if (!dragSelectionEnabled) return;

    if (displayMode === 'date' || !this.state.drag.status) {
      if (this.props.focusedRange[1] === 1) {
        this.setState({
          selecting: false
        }, () => onChange && onChange(date));
      } else {
        onChange && onChange(date);
      }
      return;
    }
    const newRange = {
      startDate: this.state.drag.range.startDate,
      endDate: date
    };

    if (displayMode !== 'dateRange' || newRange.startDate.isSame(date, 'day')) {
      this.setState({ drag: { status: false, range: {} }, selecting: true }, () => onChange && onChange(date));
    } else {
      this.setState({ drag: { status: false, range: {} }, selecting: false }, () => {
        updateRange && updateRange(newRange);
      });
    }
  };
  onDragSelectionMove = date => {
    const { drag } = this.state;
    if (!drag.status || !this.props.dragSelectionEnabled) return;
    this.setState({
      drag: {
        status: drag.status,
        range: { startDate: drag.range.startDate, endDate: date },
        disablePreview: true
      }
    });
  };

  estimateMonthSize = (index, cache) => {
    const { direction, minDate } = this.props;
    const { scrollArea } = this.state;
    if (cache) {
      this.listSizeCache = cache;
      if (cache[index]) return cache[index];
    }
    if (direction === 'horizontal') return scrollArea.monthWidth;
    const monthStep = minDate.add(index, 'month');
    const { start, end } = getMonthDisplayRange(monthStep, this.dateOptions);
    const isLongMonth = end.diff(start, 'day') + 1 > 7 * 5;
    return isLongMonth ? scrollArea.longMonthHeight : scrollArea.monthHeight;
  };
  render() {
    const {
      showDateDisplay,
      onPreviewChange,
      scroll,
      direction,
      disabledDates,
      disabledDay,
      maxDate,
      minDate,
      rangeColors,
      color,
      navigatorRenderer,
      className,
      preview,
      readOnly,
    } = this.props;
    const { scrollArea, focusedDate } = this.state;
    const isVertical = direction === 'vertical';
    const monthAndYearRenderer = navigatorRenderer || this.renderMonthAndYear;

    const ranges = this.props.ranges.map((range, i) => ({
      ...range,
      color: range.color || rangeColors[i] || color
    }));
    return (
      <div
        className={classnames(this.styles.calendarWrapper, className,
          {
            [styles.calendarWrapperSelecting]: this.state.selecting
          })}
        onMouseUp={() => {
          if(readOnly) return;
          this.setState({ drag: { status: false, range: {} } })}
        }
        onMouseLeave={() => {
          if(readOnly) return;
          this.setState({ drag: { status: false, range: {} } });
        }}
      >
        {showDateDisplay && this.renderDateDisplay()}
        {monthAndYearRenderer(focusedDate, this.changeShownDate, this.props)}
        {scroll.enabled ? (
          <div>
            {isVertical && this.renderWeekdays(this.dateOptions)}
            <div
              className={classnames(
                this.styles.infiniteMonths,
                isVertical ? this.styles.monthsVertical : this.styles.monthsHorizontal
              )}
              onMouseLeave={() => onPreviewChange && !readOnly && onPreviewChange()}
              style={{
                width: scrollArea.calendarWidth + 11,
                height: scrollArea.calendarHeight + 11
              }}
              onScroll={this.handleScroll}
            >
              <ReactList
                length={maxDate.endOf('month').diff(minDate.startOf('month'),'month')}
                treshold={500}
                type="variable"
                ref={target => (this.list = target)}
                itemSizeEstimator={this.estimateMonthSize}
                axis={isVertical ? 'y' : 'x'}
                itemRenderer={(index, key) => {
                  const monthStep = minDate.add(index, 'month');
                  return (
                    <Month
                      {...this.props}
                      selecting={this.state.selecting}
                      onPreviewChange={onPreviewChange || this.updatePreview}
                      preview={preview || this.state.preview}
                      ranges={ranges}
                      key={key}
                      drag={this.state.drag}
                      dateOptions={this.dateOptions}
                      disabledDates={disabledDates}
                      disabledDay={disabledDay}
                      month={monthStep}
                      onDragSelectionStart={this.onDragSelectionStart}
                      onDragSelectionEnd={this.onDragSelectionEnd}
                      onDragSelectionMove={this.onDragSelectionMove}
                      onMouseLeave={() => onPreviewChange && onPreviewChange()}
                      styles={this.styles}
                      style={
                        isVertical
                          ? { height: this.estimateMonthSize(index) }
                          : {
                              height: scrollArea.monthHeight,
                              width: this.estimateMonthSize(index)
                            }
                      }
                      showMonthName
                      showWeekDays={!isVertical}
                    />
                  );
                }}
              />
            </div>
          </div>
        ) : (
          <div
            className={classnames(
              this.styles.months,
              isVertical ? this.styles.monthsVertical : this.styles.monthsHorizontal
            )}
          >
            {new Array(this.props.months).fill(null).map((_, i) => {
              let monthStep = this.state.focusedDate.add(i, 'month');
              if (this.props.calendarFocus === 'backwards') {
                monthStep = this.state.focusedDate.subtract(this.props.months - 1 - i, 'month');
              }
              return (
                <Month
                  {...this.props}
                  selecting={this.state.selecting}
                  onPreviewChange={onPreviewChange || this.updatePreview}
                  preview={preview || this.state.preview}
                  ranges={ranges}
                  key={i}
                  drag={this.state.drag}
                  dateOptions={this.dateOptions}
                  disabledDates={disabledDates}
                  disabledDay={disabledDay}
                  month={monthStep}
                  onDragSelectionStart={this.onDragSelectionStart}
                  onDragSelectionEnd={this.onDragSelectionEnd}
                  onDragSelectionMove={this.onDragSelectionMove}
                  onMouseLeave={() => onPreviewChange && onPreviewChange()}
                  styles={this.styles}
                  showWeekDays={!isVertical || i === 0}
                  showMonthName={!isVertical || i > 0}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

Calendar.defaultProps = {
  showMonthArrow: true,
  showMonthAndYearPickers: true,
  disabledDates: [],
  disabledDay: () => {},
  classNames: {},
  locale: 'en-US',
  ranges: [],
  focusedRange: [0, 0],
  dateDisplayFormat: 'MMM d, yyyy',
  monthDisplayFormat: 'MMM yyyy',
  weekdayDisplayFormat: 'E',
  dayDisplayFormat: 'd',
  showDateDisplay: true,
  showPreview: true,
  displayMode: 'date',
  months: 1,
  color: '#3d91ff',
  scroll: {
    enabled: false
  },
  direction: 'vertical',
  maxDate: dayjs().utc(true).add(20, 'year'),
  minDate: dayjs().utc(true).subtract(100, 'year'),
  rangeColors: ['#3d91ff', '#3ecf8e', '#fed14c'],
  startDatePlaceholder: 'Early',
  endDatePlaceholder: 'Continuous',
  editableDateInputs: false,
  dragSelectionEnabled: true,
  fixedHeight: false,
  calendarFocus: 'forwards',
  preventSnapRefocus: false,
  ariaLabels: {},
  now: dayjs().utc(true),
  readOnly: false,
};

Calendar.propTypes = {
  showMonthArrow: PropTypes.bool,
  showMonthAndYearPickers: PropTypes.bool,
  disabledDates: PropTypes.array,
  disabledDay: PropTypes.func,
  minDate: PropTypes.object,
  maxDate: PropTypes.object,
  date: PropTypes.object,
  onChange: PropTypes.func,
  onPreviewChange: PropTypes.func,
  onRangeFocusChange: PropTypes.func,
  classNames: PropTypes.object,
  locale: PropTypes.string,
  shownDate: PropTypes.object,
  onShownDateChange: PropTypes.func,
  ranges: PropTypes.arrayOf(rangeShape),
  preview: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    color: PropTypes.string
  }),
  dateDisplayFormat: PropTypes.string,
  monthDisplayFormat: PropTypes.string,
  weekdayDisplayFormat: PropTypes.string,
  weekStartsOn: PropTypes.number,
  dayDisplayFormat: PropTypes.string,
  focusedRange: PropTypes.arrayOf(PropTypes.number),
  initialFocusedRange: PropTypes.arrayOf(PropTypes.number),
  months: PropTypes.number,
  className: PropTypes.string,
  showDateDisplay: PropTypes.bool,
  showPreview: PropTypes.bool,
  displayMode: PropTypes.oneOf(['dateRange', 'date']),
  color: PropTypes.string,
  updateRange: PropTypes.func,
  scroll: PropTypes.shape({
    enabled: PropTypes.bool,
    monthHeight: PropTypes.number,
    longMonthHeight: PropTypes.number,
    monthWidth: PropTypes.number,
    calendarWidth: PropTypes.number,
    calendarHeight: PropTypes.number
  }),
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  startDatePlaceholder: PropTypes.string,
  endDatePlaceholder: PropTypes.string,
  navigatorRenderer: PropTypes.func,
  rangeColors: PropTypes.arrayOf(PropTypes.string),
  editableDateInputs: PropTypes.bool,
  dragSelectionEnabled: PropTypes.bool,
  fixedHeight: PropTypes.bool,
  calendarFocus: PropTypes.string,
  preventSnapRefocus: PropTypes.bool,
  ariaLabels: ariaLabelsShape,
  now: PropTypes.object,
  readOnly: PropTypes.bool,
};

export default Calendar;
