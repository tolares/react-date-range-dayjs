This component extends all the props of **[Calendar](#calendar)** component. In addition to those props, it has the following props: 

| Prop Name  |  Type |
|---|---|
|  **moveRangeOnFirstSelection** |  boolean |
|  **retainEndDateOnFirstSelection** |  boolean |
|  **onRangeFocusChange** |  function |
|  **rangeColors**  |  array |
|  **ranges**  |  array |


#### Example: Editable Date Inputs
```jsx inside Markdown
import {useState} from 'react';
import dayjs from 'dayjs';

const [state, setState] = useState([
    {
      startDate: dayjs(),
      endDate: null,
      key: 'selection'
    }
  ]);
<DateRange
  editableDateInputs={true}
  onChange={item => setState([item.selection])}
  moveRangeOnFirstSelection={false}
  ranges={state}
/>
```
