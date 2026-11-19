import { describe, expect, it } from 'vitest';
import { CalendarType, Gender, UserInput } from '../types';
import { constrainBirthInput, daysInLunarMonth, lunarMonthOptions } from './birthCalendar';

function input(overrides: Partial<UserInput> = {}): UserInput {
  return {
    name: '測試',
    gender: Gender.MALE,
    year: 2020,
    month: 4,
    day: 2,
    hourIndex: 0,
    calendarType: CalendarType.LUNAR,
    ...overrides,
  };
}

describe('lunar month entry', () => {
  it('offers the leap month for a lunar year that has one', () => {
    const options = lunarMonthOptions(2020);
    expect(options.map((option) => option.value)).toEqual([1, 2, 3, 4, -4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(options.find((option) => option.value === -4)?.label).toBe('閏4月');
    expect(daysInLunarMonth(2020, -4)).toBe(29);
  });

  it('lists only months 1–12 when the lunar year has no leap month', () => {
    expect(lunarMonthOptions(2024).map((option) => option.value)).toEqual(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    );
  });

  it('keeps a leap month that exists and drops one that does not', () => {
    expect(constrainBirthInput(input({ year: 2020, month: -4, day: 2 })).month).toBe(-4);
    expect(constrainBirthInput(input({ year: 2024, month: -4, day: 2 })).month).toBe(4);
    expect(constrainBirthInput(input({ calendarType: CalendarType.SOLAR, month: -4 })).month).toBe(4);
  });

  it('clamps the day to the length of the leap month', () => {
    expect(constrainBirthInput(input({ year: 2020, month: -4, day: 30 })).day).toBe(29);
  });
});
