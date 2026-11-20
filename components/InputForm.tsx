import React, { useState } from 'react';
import { UserInput, Gender, CalendarType } from '../types';
import { HOURS } from '../services/ziweiEngine';
import { constrainBirthInput, daysInLunarMonth, lunarMonthOptions } from '../services/birthCalendar';
import {
  SavedBirthRecord,
  birthRecordTitle,
  deleteBirthRecord,
  formatBirthRecordLabel,
  loadBirthRecords,
  loadLastBirthRecordId,
  rememberLastBirthRecord,
  sameBirthIdentity,
  upsertBirthRecord,
} from '../services/birthRecords';
import { ICONS } from '../constants';

const SOLAR_MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` }));

const EMPTY_INPUT: UserInput = {
  name: '',
  gender: Gender.MALE,
  year: 1990,
  month: 1,
  day: 1,
  hourIndex: 0,
  calendarType: CalendarType.SOLAR,
};

interface Props {
  onSubmit: (data: UserInput) => void;
}

function inputFromLastRecord(): UserInput {
  const records = loadBirthRecords();
  const lastId = loadLastBirthRecordId();
  const last = lastId ? records.find((record) => record.id === lastId) : undefined;
  return last ? constrainBirthInput(last.input) : { ...EMPTY_INPUT };
}

const InputForm: React.FC<Props> = ({ onSubmit }) => {
  const [records, setRecords] = useState<SavedBirthRecord[]>(() => loadBirthRecords());
  const [formData, setFormData] = useState<UserInput>(() => inputFromLastRecord());

  const updateForm = (patch: Partial<UserInput>) => {
    setFormData((prev) => constrainBirthInput({ ...prev, ...patch }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = constrainBirthInput(formData);
    const result = upsertBirthRecord(next);
    if (result.saved || result.records.length > 0) {
      setRecords(result.records);
    }
    onSubmit(next);
  };

  const applyRecord = (record: SavedBirthRecord) => {
    setFormData(constrainBirthInput(record.input));
    rememberLastBirthRecord(record.id);
  };

  const handleDelete = (id: string) => {
    setRecords(deleteBirthRecord(id));
  };

  const monthOptions = formData.calendarType === CalendarType.LUNAR
    ? lunarMonthOptions(formData.year)
    : SOLAR_MONTHS;
  const dayCount = formData.calendarType === CalendarType.LUNAR
    ? daysInLunarMonth(formData.year, formData.month)
    : 31;

  return (
    <div className="min-h-screen flex justify-center bg-slate-50 px-4 pt-[env(safe-area-inset-top)] pb-4 relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute w-[500px] h-[500px] bg-purple-100 rounded-full blur-[80px] -top-20 -left-20 opacity-50 mix-blend-multiply animate-pulse"></div>
      <div className="absolute w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[80px] bottom-0 right-0 opacity-50 mix-blend-multiply"></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 my-auto">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-indigo-50 text-indigo-600 mb-4 shadow-sm">
            {ICONS.Sparkles}
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">紫微斗數</h1>
          <p className="text-slate-500 text-sm tracking-wide">輸入生辰，開啟您的命運織錦</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">姓名 Name</label>
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="請輸入姓名"
              value={formData.name}
              onChange={(e) => updateForm({ name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">性別 Gender</label>
              <div className="flex bg-slate-100 p-1.5 rounded-xl">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.gender === Gender.MALE ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => updateForm({ gender: Gender.MALE })}
                >
                  男
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.gender === Gender.FEMALE ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => updateForm({ gender: Gender.FEMALE })}
                >
                  女
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">曆法 Type</label>
              <div className="flex bg-slate-100 p-1.5 rounded-xl">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.calendarType === CalendarType.SOLAR ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => updateForm({ calendarType: CalendarType.SOLAR })}
                >
                  陽曆
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.calendarType === CalendarType.LUNAR ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => updateForm({ calendarType: CalendarType.LUNAR })}
                >
                  農曆
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">生年 Year</label>
              <input
                type="number"
                min="1900"
                max="2100"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-center text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                value={formData.year}
                onChange={(e) => updateForm({ year: parseInt(e.target.value, 10) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">月 Month</label>
              <div className="relative">
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-center text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none transition-all"
                  value={formData.month}
                  onChange={(e) => updateForm({ month: parseInt(e.target.value, 10) })}
                >
                  {monthOptions.map((month) => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">日 Day</label>
              <div className="relative">
                <select
                   className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-center text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none transition-all"
                   value={formData.day}
                   onChange={(e) => updateForm({ day: parseInt(e.target.value, 10) })}
                >
                  {Array.from({ length: dayCount }, (_, i) => i + 1).map(d => (
                    <option key={d} value={d}>{d}日</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">出生時辰 Hour</label>
            <div className="relative">
              <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none transition-all"
                value={formData.hourIndex}
                onChange={(e) => updateForm({ hourIndex: parseInt(e.target.value, 10) })}
              >
                {HOURS.map((h, i) => (
                  <option key={i} value={i}>{h}時 ({i * 2 - 1 < 0 ? 23 : i * 2 - 1}:00 - {i * 2 + 1}:00)</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <SavedBirthList
            records={records}
            current={formData}
            onApply={applyRecord}
            onDelete={handleDelete}
          />

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transform transition-all active:scale-[0.98]"
          >
            排盤起例
          </button>
        </form>
      </div>
    </div>
  );
};

function SavedBirthList({
  records,
  current,
  onApply,
  onDelete,
}: {
  records: SavedBirthRecord[];
  current: UserInput;
  onApply: (record: SavedBirthRecord) => void;
  onDelete: (id: string) => void;
}) {
  if (records.length === 0) return null;

  return (
    <div>
      <p className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">已存生辰 Saved</p>
      <ul className="max-h-44 overflow-y-auto overscroll-contain space-y-1.5 pr-0.5">
        {records.map((record) => {
          const title = birthRecordTitle(record.input);
          const label = formatBirthRecordLabel(record.input);
          const named = record.input.name.trim().length > 0;
          const active = sameBirthIdentity(current, record.input);
          return (
            <li key={record.id} className="flex items-stretch gap-1.5">
              <button
                type="button"
                onClick={() => onApply(record)}
                aria-current={active ? 'true' : undefined}
                className={`flex-1 min-w-0 min-h-[44px] text-left rounded-xl px-3 py-2 border transition-all ${active ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-200 hover:bg-indigo-50/60 hover:border-indigo-100'}`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className={`shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-white ${record.input.gender === Gender.MALE ? 'text-indigo-600' : 'text-pink-600'}`}>
                    {record.input.gender}
                  </span>
                  <span className="truncate text-sm font-medium text-slate-800">{title}</span>
                </span>
                {named && (
                  <span className="block text-xs text-slate-500 truncate mt-0.5">{label}</span>
                )}
              </button>
              <button
                type="button"
                aria-label={`刪除${title}`}
                onClick={() => onDelete(record.id)}
                className="shrink-0 min-w-[44px] px-3 rounded-xl border border-slate-200 text-sm text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50"
              >
                刪除
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[11px] text-slate-400">只存在這台裝置的瀏覽器裡</p>
    </div>
  );
}

export default InputForm;
