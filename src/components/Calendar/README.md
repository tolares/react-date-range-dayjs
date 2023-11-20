#### Example: Basic Calendar
```jsx inside Markdown
import {useState} from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const [state, setState] = useState([
    {
      startDate: dayjs().utc(true),
      endDate:  dayjs().utc(true),
      color: '#000',
      textColor: 'red',
      key: 'selection'
    }
  ]);

<Calendar
  dragSelectionEnabled={false}
  showDateDisplay={false}
  displayMode="dateRange"
  onChange={item => setState([{
    startDate: item,
    endDate: item,
    key:'selection'
  }])}
  ranges={state}
  maxDate={dayjs().utc(true)}
  weekStartsOn={0}
  locale="fr"
/>