import { describe, expect, it } from 'vitest';
import { CalendarType, Gender } from '../types';
import { calculateChart } from './ziweiEngine';

const HOUR = 0;
const GENDER = Gender.MALE;
const FIXED_NOW = new Date(2024, 5, 1);

describe('calculateChart calendar type', () => {
  it('treats the same numeric year/month/day as a different date for lunar vs solar', () => {
    const solar = calculateChart(1990, 1, 15, HOUR, GENDER, CalendarType.SOLAR, FIXED_NOW);
    const lunar = calculateChart(1990, 1, 15, HOUR, GENDER, CalendarType.LUNAR, FIXED_NOW);

    // 陽曆 1990-01-15 is 己巳年十二月十九; 農曆 1990-01-15 is 庚午年正月十五.
    expect(solar.formattedDate).toContain('己巳年十二月十九');
    expect(solar.birthYearStem + solar.birthYearBranch).toBe('己巳');
    expect(solar.mingGongIndex).toBe(1);

    expect(lunar.formattedDate).toContain('庚午年正月十五');
    expect(lunar.birthYearStem + lunar.birthYearBranch).toBe('庚午');
    expect(lunar.mingGongIndex).toBe(2);

    expect(solar.formattedDate).not.toBe(lunar.formattedDate);
    expect(solar.mingGongIndex).not.toBe(lunar.mingGongIndex);
  });

  it('converts a known solar date to the lunar date used by the engine', () => {
    // 2024-02-10 is 甲辰年正月初一.
    const springFestival = calculateChart(2024, 2, 10, HOUR, GENDER, CalendarType.SOLAR, FIXED_NOW);
    expect(springFestival.formattedDate).toContain('甲辰年正月初一');
    expect(springFestival.birthYearStem).toBe('甲');
    expect(springFestival.birthYearBranch).toBe('辰');

    // Same conversion lunar-javascript documents for 2019-05-01: 己亥年三月廿七.
    const documented = calculateChart(2019, 5, 1, HOUR, GENDER, CalendarType.SOLAR, FIXED_NOW);
    expect(documented.formattedDate).toContain('己亥年三月廿七');
    expect(documented.birthYearStem + documented.birthYearBranch).toBe('己亥');
  });

  it('defaults to the solar calendar when calendar type is omitted', () => {
    const explicit = calculateChart(2024, 2, 10, HOUR, GENDER, CalendarType.SOLAR, FIXED_NOW);
    const implicit = calculateChart(2024, 2, 10, HOUR, GENDER);
    expect(implicit.formattedDate).toBe(explicit.formattedDate);
    expect(implicit.formattedDate).toContain('甲辰年正月初一');
  });

  it('accepts a leap lunar month as a negative month', () => {
    // lunar-javascript: solar 2020-05-24 is 二〇二〇年闰四月初二.
    const fromSolar = calculateChart(2020, 5, 24, HOUR, GENDER, CalendarType.SOLAR, FIXED_NOW);
    const fromLeap = calculateChart(2020, -4, 2, HOUR, GENDER, CalendarType.LUNAR, FIXED_NOW);
    const fromRegular = calculateChart(2020, 4, 2, HOUR, GENDER, CalendarType.LUNAR, FIXED_NOW);

    expect(fromSolar.formattedDate).toContain('庚子年閏四月初二');
    expect(fromLeap.formattedDate).toContain('庚子年閏四月初二');
    expect(fromLeap.birthYearStem + fromLeap.birthYearBranch).toBe('庚子');
    expect(fromLeap.mingGongIndex).toBe(fromSolar.mingGongIndex);

    expect(fromRegular.formattedDate).toContain('庚子年四月初二');
    expect(fromRegular.formattedDate).not.toContain('閏');
    expect(fromRegular.formattedDate).not.toBe(fromLeap.formattedDate);
  });
});
