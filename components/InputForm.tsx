import React, { useState } from 'react';
import { UserInput, Gender, CalendarType } from '../types';
import { HOURS } from '../services/ziweiEngine';
import { ICONS } from '../constants';

interface Props {
  onSubmit: (data: UserInput) => void;
}

const InputForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<UserInput>({
    name: '',
    gender: Gender.MALE,
    year: 1990,
    month: 1,
    day: 1,
    hourIndex: 0,
    calendarType: CalendarType.SOLAR,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 pt-[env(safe-area-inset-top)] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute w-[500px] h-[500px] bg-purple-100 rounded-full blur-[80px] -top-20 -left-20 opacity-50 mix-blend-multiply animate-pulse"></div>
      <div className="absolute w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[80px] bottom-0 right-0 opacity-50 mix-blend-multiply"></div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl border border-white rounded-3xl shadow-2xl p-8 z-10 my-4">
        <div className="text-center mb-10">
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
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              placeholder="請輸入姓名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">性別 Gender</label>
              <div className="flex bg-slate-100 p-1.5 rounded-xl">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.gender === Gender.MALE ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setFormData({ ...formData, gender: Gender.MALE })}
                >
                  男
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.gender === Gender.FEMALE ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setFormData({ ...formData, gender: Gender.FEMALE })}
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
                  onClick={() => setFormData({ ...formData, calendarType: CalendarType.SOLAR })}
                >
                  陽曆
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${formData.calendarType === CalendarType.LUNAR ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  onClick={() => setFormData({ ...formData, calendarType: CalendarType.LUNAR })}
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
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">月 Month</label>
              <div className="relative">
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-center text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none appearance-none transition-all"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{m}月</option>
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
                   onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
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
                onChange={(e) => setFormData({ ...formData, hourIndex: parseInt(e.target.value) })}
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

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 transform transition-all active:scale-[0.98] mt-4"
          >
            排盤起例
          </button>
        </form>
      </div>
    </div>
  );
};

export default InputForm;