import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DateRange from '../DateRange';
import DefinedRange from '../DefinedRange';
import { checkProps, findNextRangeIndex, generateStyles } from '../../utils';
import classnames from 'classnames';
import coreStyles from '../../styles';
import { defaultInputRanges, defaultStaticRanges } from '../../defaultRanges';
import dayjs from '../../timeEngine';

class DateRangePicker extends Component {
  constructor(props) {
    super(props);
    checkProps(props.ranges, 'DateRangePicker');
    this.state = {
      focusedRange: [findNextRangeIndex(props.ranges), 0],
    };
    this.styles = generateStyles([coreStyles, props.classNames]);
  }
  render() {
    const { focusedRange } = this.state;
    return (
      <div className={classnames(this.styles.dateRangePickerWrapper, this.props.className)}>
        {
          <DefinedRange
            focusedRange={focusedRange}
            onPreviewChange={value =>
              this.dateRange.updatePreview(
                value ? this.dateRange.calcNewSelection(value, typeof value === 'string') : null
              )
            }
            {...this.props}
            range={this.props.ranges[focusedRange[0]]}
            className={undefined}
            inputRanges={defaultInputRanges(this.props.now)}
            staticRanges={defaultStaticRanges(this.props.now)}
          />
        }
        <DateRange
          onRangeFocusChange={focusedRange => this.setState({ focusedRange })}
          focusedRange={focusedRange}
          {...this.props}
          ref={t => (this.dateRange = t)}
          className={undefined}
        />
      </div>
    );
  }
}

DateRangePicker.defaultProps = {
  now: dayjs().utc(true),
  maxDate: dayjs()
    .utc(true)
    .add(20, 'year'),
  minDate: dayjs()
    .utc(true)
    .subtract(100, 'year'),
};

DateRangePicker.propTypes = {
  ...DateRange.propTypes,
  ...DefinedRange.propTypes,
  className: PropTypes.string,
};

export default DateRangePicker;
