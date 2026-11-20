import { CalendarType, Gender, UserInput } from '../types';
import { HOURS } from './ziweiEngine';

export const BIRTH_RECORDS_STORAGE_KEY = 'celestial-weaver.birthRecords';
export const LAST_BIRTH_RECORD_STORAGE_KEY = 'celestial-weaver.lastBirthRecordId';

export interface SavedBirthRecord {
  id: string;
  savedAt: number;
  input: UserInput;
}

export interface BirthRecordStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface UpsertBirthRecordResult {
  records: SavedBirthRecord[];
  saved: SavedBirthRecord | null;
}

const CHINESE_MONTHS = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
const CHINESE_DAYS = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
];

interface NormalizedRecord {
  record: SavedBirthRecord;
  changed: boolean;
}

function resolveStorage(storage?: BirthRecordStorage): BirthRecordStorage | null {
  if (storage) return storage;
  try {
    if (typeof localStorage === 'undefined') return null;
    const probe = '__ziwei_birth_records_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return null;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function integer(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) ? value : null;
}

function createId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to a timestamp id when crypto is unavailable.
  }
  return `rec_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function cloneInput(input: UserInput): UserInput {
  return {
    name: input.name,
    gender: input.gender,
    year: input.year,
    month: input.month,
    day: input.day,
    hourIndex: input.hourIndex,
    calendarType: input.calendarType,
  };
}

/** Same person and birth moment, including 農曆閏月 stored as a negative month. */
export function sameBirthIdentity(a: UserInput, b: UserInput): boolean {
  return a.name === b.name
    && a.gender === b.gender
    && a.year === b.year
    && a.month === b.month
    && a.day === b.day
    && a.hourIndex === b.hourIndex
    && a.calendarType === b.calendarType;
}

function calendarTypeFrom(value: unknown): { calendarType: CalendarType; defaulted: boolean } | null {
  if (value === undefined || value === null || value === '') {
    return { calendarType: CalendarType.SOLAR, defaulted: true };
  }
  if (value === CalendarType.LUNAR) return { calendarType: CalendarType.LUNAR, defaulted: false };
  if (value === CalendarType.SOLAR) return { calendarType: CalendarType.SOLAR, defaulted: false };
  return null;
}

/**
 * Accept a stored birth input without filling in a missing year, month, or day.
 * A missing calendarType defaults to 陽曆 and leaves the numeric date untouched,
 * including a negative month.
 */
function normalizeInput(source: Record<string, unknown>): { input: UserInput; defaultedCalendar: boolean } | null {
  const year = integer(source.year);
  const month = integer(source.month);
  const day = integer(source.day);
  const hourIndex = integer(source.hourIndex);
  if (year === null || month === null || day === null || hourIndex === null) return null;
  if (month === 0 || month < -12 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (hourIndex < 0 || hourIndex > 11) return null;
  if (typeof source.name !== 'string') return null;
  if (source.gender !== Gender.MALE && source.gender !== Gender.FEMALE) return null;

  const calendar = calendarTypeFrom(source.calendarType);
  if (!calendar) return null;

  return {
    defaultedCalendar: calendar.defaulted,
    input: {
      name: source.name,
      gender: source.gender,
      year,
      month,
      day,
      hourIndex,
      calendarType: calendar.calendarType,
    },
  };
}

function normalizeStoredRecord(value: unknown, usedIds: Set<string>): NormalizedRecord | null {
  if (!isPlainObject(value)) return null;
  const nestedInput = value.input;
  const nested = isPlainObject(nestedInput);
  const source = nested ? nestedInput : value;
  const normalized = normalizeInput(source);
  if (!normalized) return null;

  let changed = !nested || normalized.defaultedCalendar;
  let id = typeof value.id === 'string' ? value.id.trim() : '';
  if (!id || usedIds.has(id)) {
    id = createId();
    changed = true;
  }
  usedIds.add(id);

  let savedAt = 0;
  if (typeof value.savedAt === 'number' && Number.isFinite(value.savedAt)) {
    savedAt = value.savedAt;
  } else {
    changed = true;
  }

  return {
    changed,
    record: { id, savedAt, input: normalized.input },
  };
}

function readRecords(store: BirthRecordStorage): SavedBirthRecord[] {
  try {
    const raw = store.getItem(BIRTH_RECORDS_STORAGE_KEY);
    if (raw == null || raw.trim() === '') return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const usedIds = new Set<string>();
    const records: SavedBirthRecord[] = [];
    let changed = false;
    for (const item of parsed) {
      const normalized = normalizeStoredRecord(item, usedIds);
      if (!normalized) {
        changed = true;
        continue;
      }
      if (normalized.changed) changed = true;
      records.push(normalized.record);
    }

    records.sort((a, b) => b.savedAt - a.savedAt || a.id.localeCompare(b.id));
    if (changed) {
      try {
        store.setItem(BIRTH_RECORDS_STORAGE_KEY, JSON.stringify(records));
      } catch {
        // Keep the records that could be read even when the browser refuses writes.
      }
    }
    return records;
  } catch {
    return [];
  }
}

export function loadBirthRecords(storage?: BirthRecordStorage): SavedBirthRecord[] {
  const store = resolveStorage(storage);
  if (!store) return [];
  return readRecords(store);
}

export function loadLastBirthRecordId(storage?: BirthRecordStorage): string | null {
  const store = resolveStorage(storage);
  if (!store) return null;
  try {
    const id = store.getItem(LAST_BIRTH_RECORD_STORAGE_KEY);
    return id ? id : null;
  } catch {
    return null;
  }
}

export function rememberLastBirthRecord(id: string, storage?: BirthRecordStorage): void {
  const store = resolveStorage(storage);
  if (!store) return;
  try {
    store.setItem(LAST_BIRTH_RECORD_STORAGE_KEY, id);
  } catch {
    // Prefill is optional when storage is blocked.
  }
}

export function upsertBirthRecord(
  input: UserInput,
  storage?: BirthRecordStorage,
  now: number = Date.now(),
): UpsertBirthRecordResult {
  const store = resolveStorage(storage);
  if (!store) return { records: [], saved: null };

  const existing = readRecords(store);
  const match = existing.find((record) => sameBirthIdentity(record.input, input));
  const saved: SavedBirthRecord = {
    id: match?.id ?? createId(),
    savedAt: now,
    input: cloneInput(input),
  };
  const records = [saved, ...existing.filter((record) => record.id !== saved.id)];

  try {
    store.setItem(BIRTH_RECORDS_STORAGE_KEY, JSON.stringify(records));
    try {
      store.setItem(LAST_BIRTH_RECORD_STORAGE_KEY, saved.id);
    } catch {
      // The record list is already stored.
    }
    return { records, saved };
  } catch {
    return { records: existing, saved: null };
  }
}

export function deleteBirthRecord(id: string, storage?: BirthRecordStorage): SavedBirthRecord[] {
  const store = resolveStorage(storage);
  if (!store) return [];

  const existing = readRecords(store);
  const records = existing.filter((record) => record.id !== id);
  if (records.length === existing.length) return existing;

  try {
    store.setItem(BIRTH_RECORDS_STORAGE_KEY, JSON.stringify(records));
    try {
      if (store.getItem(LAST_BIRTH_RECORD_STORAGE_KEY) === id) {
        store.removeItem(LAST_BIRTH_RECORD_STORAGE_KEY);
      }
    } catch {
      // The list itself was updated.
    }
    return records;
  } catch {
    return existing;
  }
}

function chineseMonth(month: number): string {
  return CHINESE_MONTHS[Math.abs(month) - 1] ?? String(Math.abs(month));
}

function chineseDay(day: number): string {
  return CHINESE_DAYS[day - 1] ?? String(day);
}

/** Label used when a record has no name. Leap months follow the chart wording, e.g. 閏四月. */
export function formatBirthRecordLabel(input: UserInput): string {
  const hour = HOURS[input.hourIndex] ?? String(input.hourIndex);
  if (input.calendarType === CalendarType.LUNAR) {
    const leap = input.month < 0 ? '閏' : '';
    return `農曆 ${input.year}年${leap}${chineseMonth(input.month)}月${chineseDay(input.day)} ${hour}時`;
  }
  return `陽曆 ${input.year}年${input.month}月${input.day}日 ${hour}時`;
}

export function birthRecordTitle(input: UserInput): string {
  const name = input.name.trim();
  return name || formatBirthRecordLabel(input);
}
