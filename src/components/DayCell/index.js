/* eslint-disable no-fallthrough */
import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import dayjs from '../../timeEngine';

class DayCell extends Component {
  constructor(props, context) {
    super(props, context);
    this.active = React.createRef(false);
  }

  handleKeyEvent = event => {
    const { day, onMouseDown, onMouseUp, readOnly } = this.props;
    if (readOnly) return;
    if ([13 /* space */, 32 /* enter */].includes(event.keyCode)) {
      if (event.type === 'keydown') onMouseDown(day);
      else onMouseUp(day);
    }
  };
  handleMouseEvent = event => {
    const {
      day,
      disabled,
      onPreviewChange,
      onMouseEnter,
      onMouseDown,
      onMouseUp,
      readOnly,
      selecting,
    } = this.props;
    if (disabled) {
      onPreviewChange();
      return;
    }

    switch (event.type) {
      case 'mouseenter':
        if (readOnly) break;
        onMouseEnter(day);
        onPreviewChange(day);
        break;
      case 'mousedown':
        if (readOnly) break;
        this.active.current = true;
        !selecting && onMouseDown(day);
        break;
      case 'mouseup':
        event.stopPropagation();
        this.active.current = false;
        !readOnly && onMouseUp(day);
        break;
      case 'focus':
        !readOnly && onPreviewChange(day);
        break;
    }
  };
  getClassNames = () => {
    const {
      isPassive,
      isToday,
      isWeekend,
      isStartOfWeek,
      isEndOfWeek,
      isStartOfMonth,
      isEndOfMonth,
      disabled,
      styles,
    } = this.props;
    return classnames(styles.day, {
      [styles.dayPassive]: isPassive,
      [styles.dayDisabled]: disabled,
      [styles.dayToday]: isToday,
      [styles.dayWeekend]: isWeekend,
      [styles.dayStartOfWeek]: isStartOfWeek,
      [styles.dayEndOfWeek]: isEndOfWeek,
      [styles.dayStartOfMonth]: isStartOfMonth,
      [styles.dayEndOfMonth]: isEndOfMonth,
      [styles.dayActive]: this.active.current,
      [styles.dayReadOnly]: this.props.readOnly,
    });
  };
  renderPreviewPlaceholder = () => {
    const { preview, day, styles, focusedRange } = this.props;
    if (!preview) return null;
    if (preview.startDate.isAfter(preview.endDate)) {
      const start = preview.startDate;
      preview.startDate = preview.endDate;
      preview.endDate = start;
    }
    const startDate = preview.startDate ? preview.startDate : null;
    const endDate = preview.endDate ? preview.endDate : null;
    const isInRange = day.isBetween(startDate, endDate, 'day');
    const isStartEdge = !isInRange && day.isSame(startDate, 'day');
    const isEndEdge = !isInRange && day.isSame(endDate, 'day');
    return (
      <span
        className={classnames({
          [styles.dayStartPreview]: isStartEdge,
          [styles.dayInPreview]: isInRange,
          [styles.dayEndPreview]: isEndEdge,
        })}
        style={{ color: focusedRange.selectorColor || preview.color }}
      />
    );
  };

  checkDayInRange = (day, range) => {
    let startDate = range.startDate || this.props.now;
    let endDate = range.endDate || this.props.now;
    if (endDate?.isBefore(startDate, 'day')) {
      [startDate, endDate] = [endDate, startDate];
    }
    startDate = startDate ? startDate.endOf('day') : null;
    endDate = endDate ? endDate.startOf('day') : null;
    const isInRange =
      (!startDate || day.isAfter(startDate, 'day')) && (!endDate || day.isBefore(endDate, 'day'));
    const isStartEdge = !isInRange && day.isSame(startDate, 'day');
    const isEndEdge = !isInRange && day.isSame(endDate, 'day');
    return { isInRange, isStartEdge, isEndEdge };
  };

  renderSelectionPlaceholders = () => {
    const { styles, ranges, day, displayMode, date, color } = this.props;
    if (displayMode === 'date') {
      let isSelected = day.isSame(date, 'day');
      return isSelected ? <span className={styles.selected} style={{ color }} /> : null;
    }
    const inRanges = ranges.reduce((result, range) => {
      const { isInRange, isStartEdge, isEndEdge } = this.checkDayInRange(day, range);
      if (isInRange || isStartEdge || isEndEdge) {
        return [
          ...result,
          {
            isStartEdge,
            isEndEdge,
            isInRange,
            ...range,
          },
        ];
      }
      return result;
    }, []);

    return inRanges.map((range, i) => (
      <span
        key={i}
        className={classnames({
          [styles.startEdge]: range.isStartEdge,
          [styles.endEdge]: range.isEndEdge,
          [styles.inRange]: range.isInRange,
        })}
        style={{ color: range.color || this.props.color }}
      />
    ));
  };

  getTextColor = () => {
    const { ranges, day } = this.props;
    return ranges.reduce((textColor, range) => {
      const { isInRange, isStartEdge, isEndEdge } = this.checkDayInRange(day, range);
      return isInRange || isStartEdge || isEndEdge ? range.textColor : textColor;
    }, null);
  };

  render() {
    const { dayContentRenderer, focusedRange } = this.props;
    return (
      <button
        type="button"
        onMouseEnter={this.handleMouseEvent}
        onMouseLeave={this.handleMouseEvent}
        onFocus={this.handleMouseEvent}
        onMouseDown={this.handleMouseEvent}
        onMouseUp={this.handleMouseEvent}
        onBlur={this.handleMouseEvent}
        onPauseCapture={this.handleMouseEvent}
        onKeyDown={this.handleKeyEvent}
        onKeyUp={this.handleKeyEvent}
        className={this.getClassNames(this.props.styles)}
        {...(this.props.disabled || this.props.isPassive ? { tabIndex: -1 } : {})}
        style={{ color: focusedRange.selectorColor || focusedRange.color || this.props.color }}>
        {this.renderSelectionPlaceholders()}
        {this.renderPreviewPlaceholder()}
        <span className={this.props.styles.dayNumber}>
          {dayContentRenderer?.(this.props.day) || (
            <span style={{ color: this.getTextColor() }}>{this.props.day.date()}</span>
          )}
        </span>
      </button>
    );
  }
}

DayCell.defaultProps = {
  now: dayjs().utc(true),
  selecting: false,
};

export const rangeShape = PropTypes.shape({
  startDate: PropTypes.object,
  endDate: PropTypes.object,
  color: PropTypes.string,
  textColor: PropTypes.string,
  selectorColor: PropTypes.string,
  key: PropTypes.string,
  autoFocus: PropTypes.bool,
  disabled: PropTypes.bool,
  showDateDisplay: PropTypes.bool,
});

DayCell.propTypes = {
  day: PropTypes.object.isRequired,
  dayDisplayFormat: PropTypes.string,
  date: PropTypes.object,
  ranges: PropTypes.arrayOf(rangeShape),
  focusedRange: rangeShape,
  preview: PropTypes.shape({
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    color: PropTypes.string,
  }),
  onPreviewChange: PropTypes.func,
  previewColor: PropTypes.string,
  disabled: PropTypes.bool,
  isPassive: PropTypes.bool,
  isToday: PropTypes.bool,
  isWeekend: PropTypes.bool,
  isStartOfWeek: PropTypes.bool,
  isEndOfWeek: PropTypes.bool,
  isStartOfMonth: PropTypes.bool,
  isEndOfMonth: PropTypes.bool,
  color: PropTypes.string,
  displayMode: PropTypes.oneOf(['dateRange', 'date']),
  styles: PropTypes.object,
  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onMouseEnter: PropTypes.func,
  dayContentRenderer: PropTypes.func,
  now: PropTypes.object,
  readOnly: PropTypes.bool,
  selecting: PropTypes.bool,
};

export default DayCell;
