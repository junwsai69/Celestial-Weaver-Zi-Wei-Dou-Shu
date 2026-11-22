import React, { useMemo, useState } from 'react';
import { ChartData } from '../types';
import Palace, { HighlightStatus } from './Palace';
import StarDetailModal from './StarDetailModal';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import { getSiHua } from '../services/ziweiEngine';
import {
  decadeSiHuaFor,
  formatGregorianYear,
  layerMarkers,
  markersByPalace,
  yearSiHuaFor,
} from '../services/chartLayers';

interface Props {
  data: ChartData;
  userName: string;
  onReset: () => void;
}

const YEAR_START = 1924;
const YEAR_END = 2100;

const yearChoices = (referenceYear: number): number[] => {
  const start = Math.min(YEAR_START, referenceYear);
  const end = Math.max(YEAR_END, referenceYear);
  const years: number[] = [];
  for (let year = start; year <= end; year += 1) years.push(year);
  return years;
};

const defaultDecadeIndex = (data: ChartData): number => {
  if (data.currentDecadeIndex !== undefined) return data.currentDecadeIndex;
  return [...data.palaces].sort((a, b) => a.decadeRange[0] - b.decadeRange[0])[0].index;
};

const layerChipClass = (active: boolean, activeClass: string) =>
  `px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
    active ? activeClass : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
  }`;

const Chart: React.FC<Props> = ({ data, userName, onReset }) => {
  const [selectedPalaceIndex, setSelectedPalaceIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showSelfSiHua, setShowSelfSiHua] = useState<boolean>(false);
  // 本命 starts on. 大限 and 流年 start off so the chart is readable, and stack when turned on.
  const [showNatal, setShowNatal] = useState<boolean>(true);
  const [showDecade, setShowDecade] = useState<boolean>(false);
  const [showYear, setShowYear] = useState<boolean>(false);
  const [selectedDecadeIndex, setSelectedDecadeIndex] = useState<number>(() => defaultDecadeIndex(data));
  const [selectedYear, setSelectedYear] = useState<number>(data.referenceYear);

  const gridMapping = [
    5, 6, 7, 8,
    4, -1, -1, 9,
    3, -1, -1, 10,
    2, 1, 0, 11
  ];

  const flyingSiHua = useMemo(() => {
    if (!showSelfSiHua || selectedPalaceIndex === null) return {};
    const selectedPalace = data.palaces[selectedPalaceIndex];
    if (!selectedPalace) return {};
    return getSiHua(selectedPalace.heavenlyStem);
  }, [showSelfSiHua, selectedPalaceIndex, data.palaces]);

  const decadeOptions = useMemo(
    () => [...data.palaces].sort((a, b) => a.decadeRange[0] - b.decadeRange[0]),
    [data.palaces]
  );

  const years = useMemo(() => yearChoices(data.referenceYear), [data.referenceYear]);

  const selection = useMemo(() => ({
    showDecade,
    showYear,
    decadeIndex: selectedDecadeIndex,
    year: selectedYear,
  }), [showDecade, showYear, selectedDecadeIndex, selectedYear]);

  const markers = useMemo(() => markersByPalace(layerMarkers(data, selection)), [data, selection]);

  const decadeSiHua = useMemo(
    () => (showDecade ? decadeSiHuaFor(data, selectedDecadeIndex) : {}),
    [showDecade, data, selectedDecadeIndex]
  );

  const yearSiHua = useMemo(
    () => (showYear ? yearSiHuaFor(selectedYear) : {}),
    [showYear, selectedYear]
  );

  const handlePalaceClick = (index: number) => {
    if (selectedPalaceIndex === index) {
      setShowModal(true);
    } else {
      setSelectedPalaceIndex(index);
      setShowModal(false);
    }
  };

  const getHighlightStatus = (index: number): HighlightStatus => {
    if (selectedPalaceIndex === null) return null;
    if (selectedPalaceIndex === index) return 'focused';
    const relatedIndices = [
      (selectedPalaceIndex + 4) % 12,
      (selectedPalaceIndex + 8) % 12,
      (selectedPalaceIndex + 6) % 12
    ];
    if (relatedIndices.includes(index)) return 'related';
    return null;
  };

  const selectedPalace = selectedPalaceIndex !== null ? data.palaces[selectedPalaceIndex] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-1 md:p-4 flex flex-col items-center pb-10">
      <div className="w-full max-w-6xl mb-2 px-1 gap-2 pt-[max(env(safe-area-inset-top),1rem)] sticky top-0 bg-slate-50/95 backdrop-blur z-20 pb-2">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <button type="button" onClick={onReset} className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center transition-colors shrink-0">
                <span className="mr-1">←</span> 重置
              </button>
              <h2 className="text-sm md:text-lg font-serif text-slate-700 tracking-widest truncate">
                 {data.formattedDate} · {data.element}
              </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
            <button
              type="button"
              aria-pressed={showNatal}
              onClick={() => setShowNatal(!showNatal)}
              className={layerChipClass(showNatal, 'bg-amber-50 text-amber-800 border-amber-300')}
            >
              本命
            </button>
            <button
              type="button"
              aria-pressed={showDecade}
              onClick={() => setShowDecade(!showDecade)}
              className={layerChipClass(showDecade, 'bg-cyan-50 text-cyan-800 border-cyan-300')}
            >
              大限
            </button>
            <button
              type="button"
              aria-pressed={showYear}
              onClick={() => setShowYear(!showYear)}
              className={layerChipClass(showYear, 'bg-purple-50 text-purple-800 border-purple-300')}
            >
              流年
            </button>
            <button
              type="button"
              aria-pressed={showSelfSiHua}
              onClick={() => setShowSelfSiHua(!showSelfSiHua)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${showSelfSiHua ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
            >
              {showSelfSiHua ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              宮干四化
            </button>
          </div>
        </div>

        {(showDecade || showYear || (showSelfSiHua && selectedPalaceIndex === null)) && (
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            {showDecade && (
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-800 w-full min-w-0 min-[900px]:w-auto">
                <span className="shrink-0">大限</span>
                <select
                  aria-label="選擇大限"
                  className="w-full min-w-0 min-[900px]:w-auto text-[11px] font-medium text-slate-700 bg-white border border-cyan-200 rounded-md px-1.5 py-1"
                  value={selectedDecadeIndex}
                  onChange={(event) => setSelectedDecadeIndex(Number(event.target.value))}
                >
                  {decadeOptions.map((palace) => (
                    <option key={palace.index} value={palace.index}>
                      {palace.decadeRange[0]}-{palace.decadeRange[1]}歲 {palace.name} {palace.heavenlyStem}{palace.earthlyBranch}
                      {palace.index === data.currentDecadeIndex ? '（現）' : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {showYear && (
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-purple-800 w-full min-w-0 min-[900px]:w-auto">
                <span className="shrink-0">流年</span>
                <select
                  aria-label="選擇流年"
                  className="w-full min-w-0 min-[900px]:w-auto text-[11px] font-medium text-slate-700 bg-white border border-purple-200 rounded-md px-1.5 py-1"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {formatGregorianYear(year)}
                      {year === data.referenceYear ? '（今年）' : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {showSelfSiHua && selectedPalaceIndex === null && (
              <span className="text-[11px] text-emerald-700">點選宮位，以該宮天干飛四化</span>
            )}
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl aspect-[3/4] md:aspect-[4/3] grid grid-cols-4 grid-rows-4 gap-px bg-slate-300 border border-slate-300 shadow-xl rounded-lg overflow-hidden">
        {gridMapping.map((branchIdx, i) => {
          if (branchIdx === -1) {
            if (i === 5) {
               return (
                 <div key="center" className="col-span-2 row-span-2 bg-slate-50 flex flex-col justify-center items-center text-center p-4 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                    <div className="z-10">
                      <h1 className="text-2xl md:text-5xl font-serif font-bold text-slate-800 mb-2 tracking-widest">
                        {userName}
                      </h1>
                      <div className="w-12 md:w-16 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mx-auto mb-2 md:mb-4 rounded-full"></div>
                      <div className="text-xs md:text-base text-slate-500 font-mono space-y-0.5 md:space-y-1">
                        <p>{data.formattedDate}</p>
                        <p className="font-bold text-slate-600">{data.element}</p>
                      </div>
                    </div>
                 </div>
               );
            }
            return null;
          }

          const palace = data.palaces[branchIdx];

          return (
            <Palace
              key={`palace-${branchIdx}`}
              palace={palace}
              onClick={() => handlePalaceClick(branchIdx)}
              highlightStatus={getHighlightStatus(branchIdx)}
              isDecadePalace={branchIdx === selectedDecadeIndex}
              showNatalLayer={showNatal}
              showDecadeLayer={showDecade}
              flyingSiHua={flyingSiHua}
              decadeSiHua={decadeSiHua}
              yearSiHua={yearSiHua}
              layerMarkers={markers[branchIdx]}
            />
          );
        })}
      </div>

      {showModal && selectedPalace && (
        <StarDetailModal
          palace={selectedPalace}
          onClose={() => setShowModal(false)}
          showNatalLayer={showNatal}
          layerMarkers={markers[selectedPalace.index]}
          decadeSiHua={decadeSiHua}
          yearSiHua={yearSiHua}
          flyingSiHua={flyingSiHua}
        />
      )}
    </div>
  );
};

export default Chart;
