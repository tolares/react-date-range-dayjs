import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import dayjs from '../../timeEngine';

class DateInput extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      invalid: false,
      changed: false,
      value: this.formatDate(props)
    };
  }

  componentDidUpdate(prevProps) {
    const { value } = prevProps;

    if (value && !value.isSame(this.props.value)) {
      this.setState({ value: this.formatDate(this.props) });
    }
  }

  formatDate({ value }) {
    if (value && dayjs.isDayjs(value)) {
      return value.format('LL');
    }
    return '';
  }

  update(value) {
    const { invalid, changed } = this.state;

    if (invalid || !changed || !value) {
      return;
    }

    const { onChange, dateDisplayFormat = 'L' } = this.props;

    if (dayjs(value).isValid()) {
      this.setState({ changed: false }, () => onChange(dayjs(value, dateDisplayFormat)));
    } else {
      this.setState({ invalid: true });
    }
  }

  onKeyDown = e => {
    const { value } = this.state;

    if (e.key === 'Enter') {
      this.update(value);
    }
  };

  onChange = e => {
    this.setState({ value: e.target.value, changed: true, invalid: false });
  };

  onBlur = () => {
    const { value } = this.state;
    this.update(value);
  };

  render() {
    const { className, readOnly, placeholder, ariaLabel, disabled, onFocus } = this.props;
    const { value, invalid } = this.state;
    return (
      <span className={classnames('rdrDateInput', readOnly ? 'rdrDateInputReadOnly' : null, className)}>
        <input
          readOnly={readOnly}
          disabled={disabled || readOnly}
          value={value}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onKeyDown={this.onKeyDown}
          onChange={this.onChange}
          onBlur={this.onBlur}
          onFocus={onFocus}
        />
        {invalid && <span className="rdrWarning">&#9888;</span>}
      </span>
    );
  }
}

DateInput.propTypes = {
  value: PropTypes.object,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  dateOptions: PropTypes.object,
  dateDisplayFormat: PropTypes.string,
  ariaLabel: PropTypes.string,
  className: PropTypes.string,
  onFocus: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  now: PropTypes.object,
};

DateInput.defaultProps = {
  readOnly: true,
  disabled: false,
  dateDisplayFormat: 'MMM D, YYYY',
  now: dayjs().utc(true),
};

export default DateInput;
