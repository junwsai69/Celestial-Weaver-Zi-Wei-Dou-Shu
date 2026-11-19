import { LunarMonth, LunarYear } from 'lunar-javascript';
import { CalendarType, UserInput } from '../types';

export interface MonthOption {
  value: number;
  label: string;
}

const REGULAR_MONTHS: MonthOption[] = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}月`,
}));

export function lunarLeapMonth(year: number): number {
  if (!Number.isInteger(year)) return 0;
  try {
    const leap = LunarYear.fromYear(year).getLeapMonth();
    return typeof leap === 'number' && leap >= 1 && leap <= 12 ? leap : 0;
  } catch {
    return 0;
  }
}

/** Month choices for 農曆. A leap month is a negative value, matching lunar-javascript. */
export function lunarMonthOptions(year: number): MonthOption[] {
  const leap = lunarLeapMonth(year);
  if (!leap) return [...REGULAR_MONTHS];
  const options: MonthOption[] = [];
  for (const month of REGULAR_MONTHS) {
    options.push(month);
    if (month.value === leap) {
      options.push({ value: -leap, label: `閏${leap}月` });
    }
  }
  return options;
}

export function daysInLunarMonth(year: number, month: number): number {
  if (!Number.isInteger(year) || !Number.isInteger(month) || month === 0) return 30;
  try {
    const lunarMonth = LunarMonth.fromYm(year, month);
    const count = lunarMonth?.getDayCount?.();
    return typeof count === 'number' && count > 0 ? count : 30;
  } catch {
    return 30;
  }
}

function clampSolarMonth(month: number): number {
  const abs = Math.abs(month);
  if (!Number.isInteger(abs)) return 1;
  return Math.min(12, Math.max(1, abs));
}

/** Drop a leap month that the selected year does not have, and keep the day inside that month. */
export function constrainBirthInput(input: UserInput): UserInput {
  let month = input.month;
  let day = input.day;

  if (input.calendarType === CalendarType.SOLAR) {
    month = clampSolarMonth(month);
  } else {
    const options = lunarMonthOptions(input.year);
    if (!options.some((option) => option.value === month)) {
      const abs = Math.abs(month);
      month = options.some((option) => option.value === abs) ? abs : 1;
    }
  }

  const maxDay = input.calendarType === CalendarType.LUNAR
    ? daysInLunarMonth(input.year, month)
    : 31;
  if (!Number.isInteger(day) || day < 1) day = 1;
  if (day > maxDay) day = maxDay;

  if (month === input.month && day === input.day) return input;
  return { ...input, month, day };
}
