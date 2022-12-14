import React from 'react';
import dayjs from 'dayjs';
import DateRange from '../DateRange';
import renderer from 'react-test-renderer';

let testRenderer = null;
let instance = null;
const endDate = dayjs();
const startDate = endDate.subtract(7, 'day');

const commonProps = {
  ranges: [{ startDate, endDate, key: 'selection' }],
  onChange: () => {},
  moveRangeOnFirstSelection: false,
};

const compareRanges = (newRange, assertionRange) => {
  ['startDate', 'endDate'].forEach(key => {
    if (!newRange[key] || !assertionRange[key]) {
      console.log(newRange[key], assertionRange[key]);
      return expect(newRange[key]).toEqual(assertionRange[key]);
    }
    return expect(dayjs(newRange[key]).isSame(dayjs(assertionRange[key]), 'day')).toEqual(true);
  });
};

beforeEach(() => {
  testRenderer = renderer.create(<DateRange {...commonProps} />);
  instance = testRenderer.getInstance();
});

describe('DateRange', () => {
  test('Should resolve', () => {
    expect(DateRange).toEqual(expect.anything());
  });

  test('calculate new selection by resetting end date', () => {
    const methodResult = instance.calcNewSelection(endDate.subtract(10, 'day'), true);
    compareRanges(methodResult.range, {
      startDate: endDate.subtract(10, 'day'),
      endDate: endDate.subtract(10, 'day'),
    });
  });

  test('calculate new selection by resetting end date if start date is not before', () => {
    const methodResult = instance.calcNewSelection(endDate.add(2, 'day'), true);
    compareRanges(methodResult.range, {
      startDate: endDate.add(2, 'day'),
      endDate: endDate.add(2, 'day'),
    });
  });

  test('calculate new selection based on moveRangeOnFirstSelection prop', () => {
    testRenderer.update(<DateRange {...commonProps} moveRangeOnFirstSelection />);
    const methodResult = instance.calcNewSelection(endDate.subtract(10, 'day'), true);
    compareRanges(methodResult.range, {
      startDate: endDate.subtract(10, 'day'),
      endDate: endDate.subtract(3, 'day'),
    });
  });

  test('calculate new selection by retaining end date, based on retainEndDateOnFirstSelection prop', () => {
    testRenderer.update(<DateRange {...commonProps} retainEndDateOnFirstSelection />);
    const methodResult = instance.calcNewSelection(endDate.subtract(10, 'day'), true);
    compareRanges(methodResult.range, {
      startDate: endDate.subtract(10, 'day'),
      endDate,
    });
  });
});
