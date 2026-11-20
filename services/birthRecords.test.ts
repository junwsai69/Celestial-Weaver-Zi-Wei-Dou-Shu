import { describe, expect, it } from 'vitest';
import { CalendarType, Gender, UserInput } from '../types';
import {
  BIRTH_RECORDS_STORAGE_KEY,
  LAST_BIRTH_RECORD_STORAGE_KEY,
  BirthRecordStorage,
  birthRecordTitle,
  deleteBirthRecord,
  formatBirthRecordLabel,
  loadBirthRecords,
  loadLastBirthRecordId,
  upsertBirthRecord,
} from './birthRecords';

function input(overrides: Partial<UserInput> = {}): UserInput {
  return {
    name: '陳大文',
    gender: Gender.MALE,
    year: 1990,
    month: 1,
    day: 1,
    hourIndex: 0,
    calendarType: CalendarType.SOLAR,
    ...overrides,
  };
}

function memoryStorage(initial: Record<string, string> = {}): BirthRecordStorage & {
  dump(): Record<string, string>;
} {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => (values.has(key) ? values.get(key)! : null),
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
    dump: () => Object.fromEntries(values),
  };
}

describe('birth record storage', () => {
  it('saves a full birth input, including a lunar leap month', () => {
    const storage = memoryStorage();
    const leap = input({
      name: '林小月',
      gender: Gender.FEMALE,
      year: 2020,
      month: -4,
      day: 2,
      hourIndex: 0,
      calendarType: CalendarType.LUNAR,
    });

    const result = upsertBirthRecord(leap, storage, 1_700_000_000_000);

    expect(result.saved?.input).toEqual(leap);
    expect(result.records).toHaveLength(1);
    const stored = JSON.parse(storage.dump()[BIRTH_RECORDS_STORAGE_KEY]);
    expect(stored[0].input.month).toBe(-4);
    expect(stored[0].input.calendarType).toBe('農曆');
    expect(stored[0].input).toEqual(leap);
    expect(stored[0].savedAt).toBe(1_700_000_000_000);
    expect(typeof stored[0].id).toBe('string');
    expect(loadLastBirthRecordId(storage)).toBe(stored[0].id);
  });

  it('updates the timestamp instead of duplicating the same person', () => {
    const storage = memoryStorage();
    const first = upsertBirthRecord(input(), storage, 10);
    const second = upsertBirthRecord(input({ name: '陳大文' }), storage, 20);

    expect(second.records).toHaveLength(1);
    expect(second.saved?.id).toBe(first.saved?.id);
    expect(second.saved?.savedAt).toBe(20);
    expect(loadBirthRecords(storage)).toEqual(second.records);
  });

  it('keeps a leap month distinct from the regular month and orders newest first', () => {
    const storage = memoryStorage();
    const solar = input();
    const leap = input({
      name: '林小月',
      gender: Gender.FEMALE,
      year: 2020,
      month: -4,
      day: 2,
      calendarType: CalendarType.LUNAR,
    });
    const regularFourth = input({
      name: '林小月',
      gender: Gender.FEMALE,
      year: 2020,
      month: 4,
      day: 2,
      calendarType: CalendarType.LUNAR,
    });

    upsertBirthRecord(solar, storage, 1);
    upsertBirthRecord(leap, storage, 2);
    const result = upsertBirthRecord(regularFourth, storage, 3);

    expect(result.records.map((record) => record.input.month)).toEqual([4, -4, 1]);
    expect(loadBirthRecords(storage).map((record) => record.savedAt)).toEqual([3, 2, 1]);

    const refreshed = upsertBirthRecord(leap, storage, 4);
    expect(refreshed.records).toHaveLength(3);
    expect(refreshed.records[0].input).toEqual(leap);
    expect(refreshed.records[0].savedAt).toBe(4);
  });

  it('treats gender, hour, and calendar type as part of the identity', () => {
    const storage = memoryStorage();
    upsertBirthRecord(input(), storage, 1);
    upsertBirthRecord(input({ gender: Gender.FEMALE }), storage, 2);
    upsertBirthRecord(input({ hourIndex: 6 }), storage, 3);
    upsertBirthRecord(input({ calendarType: CalendarType.LUNAR }), storage, 4);

    expect(loadBirthRecords(storage)).toHaveLength(4);
  });

  it('deletes one record and leaves the leap-month record in place', () => {
    const storage = memoryStorage();
    const solar = upsertBirthRecord(input(), storage, 1);
    const leap = upsertBirthRecord(input({
      name: '林小月',
      gender: Gender.FEMALE,
      year: 2020,
      month: -4,
      day: 2,
      calendarType: CalendarType.LUNAR,
    }), storage, 2);

    const remaining = deleteBirthRecord(solar.saved!.id, storage);

    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(leap.saved?.id);
    expect(remaining[0].input.month).toBe(-4);
    expect(remaining[0].input.calendarType).toBe(CalendarType.LUNAR);
    expect(loadBirthRecords(storage)).toEqual(remaining);
    expect(loadLastBirthRecordId(storage)).toBe(leap.saved?.id);

    deleteBirthRecord(leap.saved!.id, storage);
    expect(loadBirthRecords(storage)).toEqual([]);
    expect(loadLastBirthRecordId(storage)).toBeNull();
  });

  it('returns an empty list when storage is unavailable or JSON is corrupt', () => {
    const denied: BirthRecordStorage = {
      getItem: () => {
        throw new Error('localStorage unavailable');
      },
      setItem: () => {
        throw new Error('localStorage unavailable');
      },
      removeItem: () => {
        throw new Error('localStorage unavailable');
      },
    };

    expect(loadBirthRecords(denied)).toEqual([]);
    expect(loadLastBirthRecordId(denied)).toBeNull();
    expect(upsertBirthRecord(input(), denied, 1)).toEqual({ records: [], saved: null });
    expect(deleteBirthRecord('any', denied)).toEqual([]);

    const corrupt = memoryStorage({ [BIRTH_RECORDS_STORAGE_KEY]: '{' });
    expect(loadBirthRecords(corrupt)).toEqual([]);
    expect(corrupt.dump()[BIRTH_RECORDS_STORAGE_KEY]).toBe('{');

    const notAnArray = memoryStorage({ [BIRTH_RECORDS_STORAGE_KEY]: '{"input":{}}' });
    expect(loadBirthRecords(notAnArray)).toEqual([]);
    expect(notAnArray.dump()[BIRTH_RECORDS_STORAGE_KEY]).toBe('{"input":{}}');
  });

  it('keeps readable records when one entry in the list is corrupt', () => {
    const leap = input({
      name: '林小月',
      year: 2020,
      month: -4,
      day: 2,
      calendarType: CalendarType.LUNAR,
    });
    const storage = memoryStorage({
      [BIRTH_RECORDS_STORAGE_KEY]: JSON.stringify([
        { id: 'leap', savedAt: 2, input: leap },
        { id: 'broken', savedAt: 9, input: { name: '缺日期', gender: Gender.MALE } },
        null,
      ]),
    });

    const loaded = loadBirthRecords(storage);

    expect(loaded).toHaveLength(1);
    expect(loaded[0].input).toEqual(leap);
    expect(loaded[0].input.month).toBe(-4);
  });

  it('defaults a missing calendarType without inventing the birth date', () => {
    const storage = memoryStorage({
      [BIRTH_RECORDS_STORAGE_KEY]: JSON.stringify([
        {
          id: 'legacy',
          savedAt: 8,
          name: '舊資料',
          gender: Gender.MALE,
          year: 1988,
          month: 6,
          day: 15,
          hourIndex: 3,
        },
        {
          id: 'legacy-leap-number',
          savedAt: 7,
          input: {
            name: '舊閏月',
            gender: Gender.FEMALE,
            year: 2020,
            month: -4,
            day: 2,
            hourIndex: 0,
          },
        },
        {
          name: '缺日期',
          gender: Gender.MALE,
          month: 1,
        },
      ]),
    });

    const loaded = loadBirthRecords(storage);

    expect(loaded.map((record) => record.input)).toEqual([
      {
        name: '舊資料',
        gender: Gender.MALE,
        year: 1988,
        month: 6,
        day: 15,
        hourIndex: 3,
        calendarType: CalendarType.SOLAR,
      },
      {
        name: '舊閏月',
        gender: Gender.FEMALE,
        year: 2020,
        month: -4,
        day: 2,
        hourIndex: 0,
        calendarType: CalendarType.SOLAR,
      },
    ]);
    expect(loaded.some((record) => record.input.year === 1990 && record.input.name === '缺日期')).toBe(false);
  });

  it('still saves when an earlier write of the last-used id fails', () => {
    const storage = memoryStorage();
    const originalSet = storage.setItem.bind(storage);
    storage.setItem = (key, value) => {
      if (key === LAST_BIRTH_RECORD_STORAGE_KEY) throw new Error('quota');
      originalSet(key, value);
    };

    const result = upsertBirthRecord(input({ month: -4, calendarType: CalendarType.LUNAR }), storage, 5);

    expect(result.saved?.input.month).toBe(-4);
    expect(loadBirthRecords(storage)).toHaveLength(1);
    expect(loadLastBirthRecordId(storage)).toBeNull();
  });

  it('labels an unnamed solar date and a lunar leap day with the chart hour names', () => {
    expect(formatBirthRecordLabel(input({ name: '' }))).toBe('陽曆 1990年1月1日 子時');
    expect(formatBirthRecordLabel(input({
      name: '',
      year: 2020,
      month: -4,
      day: 2,
      calendarType: CalendarType.LUNAR,
    }))).toBe('農曆 2020年閏四月初二 子時');
    expect(birthRecordTitle(input({ name: '  ', year: 2020, month: -4, day: 2, calendarType: CalendarType.LUNAR })))
      .toBe('農曆 2020年閏四月初二 子時');
    expect(birthRecordTitle(input({ name: '林小月' }))).toBe('林小月');
    expect(formatBirthRecordLabel(input({ hourIndex: 6 }))).toBe('陽曆 1990年1月1日 午時');
  });
});
