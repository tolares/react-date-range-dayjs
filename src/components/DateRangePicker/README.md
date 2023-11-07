This component wraps **[DefinedRange](#definedrange)** and **[Calendar](#calendar)** components together, and extends all the props of them.

#### Example: 2 Month View

```jsx inside Markdown
import { useState } from 'react';
import dayjs from 'dayjs';

const [state, setState] = useState([
  {
    startDate: dayjs(),
    endDate: dayjs().add(7, 'day'),
    key: 'selection'
  }
]);

<DateRangePicker
  onChange={item => setState([item.selection])}
  showSelectionPreview={true}
  moveRangeOnFirstSelection={false}
  months={2}
  ranges={state}
  direction="horizontal"
/>;
```

#### Example: Backwards 2 Month View with preventSnapRefocus

```jsx inside Markdown
import { useState } from 'react';
import dayjs from 'dayjs';

const [state, setState] = useState([
  {
    startDate: dayjs(),
    endDate: dayjs().add(7, 'day'),
    key: 'selection'
  }
]);

<DateRangePicker
  onChange={item => setState([item.selection])}
  showSelectionPreview={true}
  moveRangeOnFirstSelection={false}
  months={2}
  ranges={state}
  direction="horizontal"
  preventSnapRefocus={true}
  calendarFocus="backwards"
/>;
```

#### Example: Vertical Infinite

```jsx inside Markdown
import { useState } from 'react';
import dayjs from 'dayjs';

const [state, setState] = useState({
  selection: {
    startDate: dayjs(),
    endDate: null,
    key: 'selection'
  },
  compare: {
    startDate: dayjs(),
    endDate: dayjs().add(3, 'day'),
    key: 'compare'
  }
});

<DateRangePicker
  onChange={item => setState({ ...state, ...item })}
  months={1}
  minDate={dayjs().add(-300, 'day')}
  maxDate={dayjs().add(900, 'day')}
  direction="vertical"
  scroll={{ enabled: true }}
  ranges={[state.selection, state.compare]}
/>;
```

#### Example: Multiple Range

```jsx inside Markdown
import { useState } from 'react';
import dayjs from 'dayjs';

const [state, setState] = useState({
  selection1: {
    startDate: dayjs().add(1, 'day'),
    endDate: null,
    key: 'selection1'
  },
  selection2: {
    startDate: dayjs().add(4, 'day'),
    endDate: dayjs().add(8, 'day'),
    key: 'selection2'
  },
  selection3: {
    startDate: dayjs().add(8, 'day'),
    endDate: dayjs().add(10, 'day'),
    key: 'selection3',
    autoFocus: false
  }
});

<DateRangePicker
  onChange={item => setState({ ...state, ...item })}
  ranges={[state.selection1, state.selection2, state.selection3]}
/>;
```

#### Example: Insert Aria-label

```jsx inside Markdown
import { useState } from 'react';
import dayjs from 'dayjs';

const [state, setState] = useState({
  selection1: {
    startDate: dayjs().subtract(6, 'day'),
    endDate: dayjs(),
    key: 'selection1'
  },
  selection2: {
    startDate: dayjs().add(1, 'day'),
    endDate: dayjs().subtract(7, 'day'),
    key: 'selection2'
  }
});

<DateRangePicker
  onChange={item => setState({ ...state, ...item })}
  showSelectionPreview={true}
  moveRangeOnFirstSelection={false}
  months={2}
  ranges={[state.selection1, state.selection2]}
  direction="horizontal"
  ariaLabels={{
    dateInput: {
      selection1: { startDate: 'start date input of selction 1', endDate: 'end date input of selction 1' },
      selection2: { startDate: 'start date input of selction 2', endDate: 'end date input of selction 2' }
    },
    monthPicker: 'month picker',
    yearPicker: 'year picker',
    prevButton: 'previous month button',
    nextButton: 'next month button'
  }}
/>;
```

#### Example: Custom Day Cell Content

Show orange dot only for weekend

```jsx inside Markdown
import { useState } from 'react';
import dayjs from 'dayjs';

const [state, setState] = useState({
  selection1: {
    startDate: dayjs().subtract(6, 'day'),
    endDate: dayjs(),
    key: 'selection1'
  },
  selection2: {
    startDate: dayjs().add(1, 'day'),
    endDate: dayjs().subtract(7, 'day'),
    key: 'selection2'
  }
});

function customDayContent(day) {
  extraDot = null;
  if (day.isoWeekday() == 7 || day.isoWeekday() == 6) {
    extraDot = (
      <div
        style={{
          height: '5px',
          width: '5px',
          borderRadius: '100%',
          background: 'orange',
          position: 'absolute',
          top: 2,
          right: 2
        }}
      />
    );
  }
  return (
    <div>
      {extraDot}
      <span>{day.format('DD')}</span>
    </div>
  );
}

<DateRangePicker
  onChange={item => setState({ ...state, ...item })}
  showSelectionPreview={true}
  moveRangeOnFirstSelection={false}
  months={2}
  ranges={[state.selection1, state.selection2]}
  direction="horizontal"
  dayContentRenderer={customDayContent}
  ariaLabels={{
    dateInput: {
      selection1: { startDate: 'start date input of selction 1', endDate: 'end date input of selction 1' },
      selection2: { startDate: 'start date input of selction 2', endDate: 'end date input of selction 2' }
    },
    monthPicker: 'month picker',
    yearPicker: 'year picker',
    prevButton: 'previous month button',
    nextButton: 'next month button'
  }}
/>;
```

#### Example: Restrict Date Selection

Restricts access for range selection to (-30, +30) days of current date.

```jsx inside Markdown
import { useState } from 'react';
import dayjs from 'dayjs';

const [state, setState] = useState({
  selection: {
    startDate: dayjs(),
    endDate: null,
    key: 'selection'
  },
  compare: {
    startDate: dayjs(),
    endDate: dayjs().add(3, 'day'),
    key: 'compare'
  }
});

<DateRangePicker
  onChange={item => setState({ ...state, ...item })}
  months={1}
  minDate={dayjs().subtract(30, 'day')}
  maxDate={dayjs().add(30, 'day')}
  direction="vertical"
  scroll={{ enabled: true }}
  ranges={[state.selection, state.compare]}
/>;
```

#### Example: Custom current date (now)

Provide custom current date, useful when the context is related to a custom
timezone where the current date could be the next or previous date of the actual user date.

```jsx inside Markdown
import { useState } from 'react';
import dayjs from 'dayjs';

const now = dayjs().add(40, 'day');

const [state, setState] = useState({
  selection: {
    startDate: now,
    endDate: null,
    key: 'selection'
  },
  compare: {
    startDate: now,
    endDate: now.add(3, 'day'),
    key: 'compare'
  }
});

<DateRangePicker
  onChange={item => setState({ ...state, ...item })}
  months={1}
  scroll={{ enabled: false }}
  direction="vertical"
  minDate={now.subtract(50, 'day')}
  maxDate={now.add(30, 'day')}
  ranges={[state.selection, state.compare]}
  now={now}
/>;
```

#### Example: Custom range textColor

When providing a range color, sometimes we need better contrast with the date text
which by default is white, we can customize it by setting the `textColor` range property.

```jsx inside Markdown
import { useState } from 'react';
import dayjs from 'dayjs';

const now = dayjs().add(40, 'day');

const [state, setState] = useState({
  selection: {
    startDate: now,
    endDate: now.add(3, 'day'),
    key: 'selection',
  },
  compare: {
    startDate: now.subtract(1, 'week'),
    endDate: now.add(3, 'day').subtract(1, 'week'),
    key: 'compare',
    textColor: 'black',
    color: '#EEE'
  }
});

<DateRangePicker
  onChange={item => setState({ ...state, ...item })}
  months={1}
  scroll={{ enabled: false }}
  direction="vertical"
  minDate={now.subtract(50, 'day')}
  maxDate={now.add(30, 'day')}
  ranges={[state.selection, state.compare]}
  now={now}
/>;
```

#### Example: Read-Only

Disable any effect of hovering or clicking over the Calendar.

```jsx inside Markdown
import { useState } from 'react';
import dayjs from 'dayjs';

const now = dayjs().add(40, 'day');

const [state, setState] = useState({
  selection: {
    startDate: now,
    endDate: now.add(3, 'day'),
    key: 'selection',
  },
  compare: {
    startDate: now.subtract(1, 'week'),
    endDate: now.add(3, 'day').subtract(1, 'week'),
    key: 'compare',
    textColor: 'black',
    color: '#EEE'
  }
});

<DateRangePicker
  onChange={item => setState({ ...state, ...item })}
  months={1}
  scroll={{ enabled: false }}
  direction="vertical"
  minDate={now.subtract(50, 'day')}
  maxDate={now.add(30, 'day')}
  ranges={[state.selection, state.compare]}
  now={now}
  readOnly
/>;
```