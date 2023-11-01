import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DateRange from '../DateRange';
import DefinedRange from '../DefinedRange';
import { findNextRangeIndex, generateStyles } from '../../utils';
import classnames from 'classnames';
import coreStyles from '../../styles';
import dayjs from 'dayjs';
import { defaultInputRanges, defaultStaticRanges } from '../../defaultRanges';

class DateRangePicker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedRange: [findNextRangeIndex(props.ranges), 0],
    };
    this.styles = generateStyles([coreStyles, props.classNames]);
  }
  render() {
    const { focusedRange } = this.state;
    // All calendar calculations are based on the current date aka `now`. However, operations with dayjs() objects
    // with timezone properties are costly and slow, visible when interacting with the UI; one hack is to do the
    // conversion, remove the timezone and convert it back to a simple dayjs object. Here, we are removing the timezone
    // data in case it's provided.
    // Possible cause: https://github.com/iamkun/dayjs/issues/1236
    const now = dayjs((this.props.now || dayjs()).format('YYYY-MM-DD'));
    return (
      <div className={classnames(this.styles.dateRangePickerWrapper, this.props.className)}>
        {<DefinedRange
          focusedRange={focusedRange}
          onPreviewChange={value =>
            this.dateRange.updatePreview(
              value ? this.dateRange.calcNewSelection(value, typeof value === 'string') : null
            )
          }
          {...this.props}
          range={this.props.ranges[focusedRange[0]]}
          className={undefined}
          now={now}
          inputRanges={defaultInputRanges(now)}
          staticRanges={defaultStaticRanges(now)}
        />}
        <DateRange
          onRangeFocusChange={focusedRange => this.setState({ focusedRange })}
          focusedRange={focusedRange}
          {...this.props}
          ref={t => (this.dateRange = t)}
          className={undefined}
          now={now}
        />
      </div>
    );
  }
}

DateRangePicker.defaultProps = {
  now: dayjs(),
};

DateRangePicker.propTypes = {
  ...DateRange.propTypes,
  ...DefinedRange.propTypes,
  className: PropTypes.string,
};

export default DateRangePicker;
