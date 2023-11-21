import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { checkProps, findNextRangeIndex, generateStyles } from '../../utils';
import { rangeShape } from '../DayCell';
import Calendar from '../Calendar';
import coreStyles from '../../styles';
import dayjs from '../../timeEngine';

class DateRange extends Component {
  constructor(props, context) {
    super(props, context);
    checkProps(props, 'DateRange');
    this.state = {
      focusedRange: props.initialFocusedRange || [findNextRangeIndex(props.ranges), 0],
      preview: null,
    };
    this.styles = generateStyles([coreStyles, props.classNames]);
  }
  calcNewSelection = (value, isSingleValue = true) => {
    const focusedRange = this.props.focusedRange || this.state.focusedRange;
    const {
      ranges,
      onChange,
      maxDate,
      moveRangeOnFirstSelection,
      retainEndDateOnFirstSelection,
      disabledDates,
      now,
    } = this.props;
    const focusedRangeIndex = focusedRange[0];
    const selectedRange = ranges[focusedRangeIndex];
    if (!selectedRange || !onChange) return {};
    let { startDate, endDate } = selectedRange;
    let nextFocusRange;
    if (!isSingleValue) {
      startDate = value.startDate;
      endDate = value.endDate;
    } else if (focusedRange[1] === 0) {
      // startDate selection
      const dayOffset = (endDate || now).diff(startDate, 'day');
      const calculateEndDate = () => {
        if (moveRangeOnFirstSelection) {
          return value.add(dayOffset, 'day');
        }
        if (retainEndDateOnFirstSelection) {
          if (!endDate || value.isBefore(endDate, 'day')) {
            return endDate;
          }
          return value;
        }
        return value || now;
      };
      startDate = value;
      endDate = calculateEndDate();
      if (maxDate) endDate = dayjs.min([endDate, maxDate]);
      nextFocusRange = [focusedRange[0], 1];
    } else {
      endDate = value;
    }

    // reverse dates if startDate before endDate
    let isStartDateSelected = focusedRange[1] === 0;

    const inValidDatesWithinRange = disabledDates.filter(disabledDate =>
      disabledDate.isBetween(startDate, endDate, 'day')
    );

    if (inValidDatesWithinRange.length > 0) {
      if (isStartDateSelected) {
        startDate = dayjs.max(inValidDatesWithinRange).add(1, 'day');
      } else {
        endDate = dayjs.min(inValidDatesWithinRange).subtract(1, 'day');
      }
    }

    if (!nextFocusRange) {
      const nextFocusRangeIndex = findNextRangeIndex(this.props.ranges, focusedRange[0]);
      nextFocusRange = [nextFocusRangeIndex, 0];
    }
    return {
      wasValid: !(inValidDatesWithinRange.length > 0),
      range: { startDate, endDate },
      nextFocusRange: nextFocusRange,
    };
  };
  setSelection = (value, isSingleValue) => {
    const { onChange, ranges, onRangeFocusChange } = this.props;
    const focusedRange = this.props.focusedRange || this.state.focusedRange;
    const focusedRangeIndex = focusedRange[0];
    const selectedRange = ranges[focusedRangeIndex];
    if (!selectedRange) return;
    const newSelection = this.calcNewSelection(value, isSingleValue);
    onChange({
      [selectedRange.key || `range${focusedRangeIndex + 1}`]: {
        ...selectedRange,
        ...newSelection.range,
      },
    });
    this.setState({
      focusedRange: newSelection.nextFocusRange,
      preview: null,
    });
    onRangeFocusChange && onRangeFocusChange(newSelection.nextFocusRange);
  };
  handleRangeFocusChange = focusedRange => {
    this.setState({ focusedRange });
    this.props.onRangeFocusChange && this.props.onRangeFocusChange(focusedRange);
  };
  updatePreview = (val, predefined) => {
    if (!val) {
      this.setState({ preview: null });
      return;
    }
    const { rangeColors, ranges } = this.props;
    const focusedRange = this.props.focusedRange || this.state.focusedRange;
    const color = ranges[focusedRange[0]]?.color || rangeColors[focusedRange[0]] || color;
    this.setState({ preview: { ...val.range, color, predefined } });
  };
  render() {
    return (
      <Calendar
        now={this.props.now}
        focusedRange={this.state.focusedRange}
        onRangeFocusChange={this.handleRangeFocusChange}
        preview={this.state.preview}
        onPreviewChange={value => {
          this.updatePreview(value ? this.calcNewSelection(value) : null);
        }}
        {...this.props}
        displayMode="dateRange"
        className={classnames(this.styles.dateRangeWrapper, this.props.className)}
        onChange={this.setSelection}
        updateRange={val => this.setSelection(val, false)}
        ref={target => {
          this.calendar = target;
        }}
      />
    );
  }
}

DateRange.defaultProps = {
  classNames: {},
  ranges: [],
  moveRangeOnFirstSelection: false,
  retainEndDateOnFirstSelection: false,
  rangeColors: ['#3d91ff', '#3ecf8e', '#fed14c'],
  disabledDates: [],
  now: dayjs().utc(true),
  readOnly: false,
};

DateRange.propTypes = {
  ...Calendar.propTypes,
  onChange: PropTypes.func,
  onRangeFocusChange: PropTypes.func,
  className: PropTypes.string,
  ranges: PropTypes.arrayOf(rangeShape),
  moveRangeOnFirstSelection: PropTypes.bool,
  retainEndDateOnFirstSelection: PropTypes.bool,
  now: PropTypes.object,
  readOnly: PropTypes.bool,
};

export default DateRange;
