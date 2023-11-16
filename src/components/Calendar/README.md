#### Example: Basic Calendar
```jsx inside Markdown
import {useState} from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const [state, setState] = useState([
    {
      startDate: dayjs(),
      endDate:  dayjs(),
      color: '#000',
      textColor: 'red'
    }
  ]);

<Calendar
  readOnly
  showDateDisplay={false}
  displayMode="dateRange"
  onChange={item => {}}
  ranges={state}
  maxDate={dayjs()}
  weekStartsOn={0}
  locale="fr"
/>