import React, { useState, useMemo } from 'react';
import { ChartData, Palace as PalaceType, SiHuaType } from '../types';
import Palace, { HighlightStatus } from './Palace';
import StarDetailModal from './StarDetailModal';
import { ToggleLeft, ToggleRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { getSiHua, getLuCunPosition, HEAVENLY_STEMS } from '../services/ziweiEngine';

interface Props {
  data: ChartData;
  userName: string;
  onReset: () => void;
}

const Chart: React.FC<Props> = ({ data, userName, onReset }) => {
  const [selectedPalaceIndex, setSelectedPalaceIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showSelfSiHua, setShowSelfSiHua] = useState<boolean>(false); // Toggle Palace Si Hua
  const [showDecade, setShowDecade] = useState<boolean>(true); // Toggle Decade Highlight
  const [showDecadeStars, setShowDecadeStars] = useState<boolean>(false); // Toggle Decade Lu/Yang/Tuo

  // Visual Grid Mapping (Si at Top-Left)
  const gridMapping = [
    5, 6, 7, 8,
    4, -1, -1, 9,
    3, -1, -1, 10,
    2, 1, 0, 11
  ];

  // Calculate Flying Si Hua (Palace Si Hua based on selected palace)
  const flyingSiHua = useMemo(() => {
    if (!showSelfSiHua || selectedPalaceIndex === null) {
      return {};
    }
    const selectedPalace = data.palaces[selectedPalaceIndex];
    if (!selectedPalace) return {};
    return getSiHua(selectedPalace.heavenlyStem);
  }, [showSelfSiHua, selectedPalaceIndex, data.palaces]);

  // Calculate Decade Stars (Lu/Yang/Tuo) positions
  const decadeStarsMap = useMemo(() => {
    if (!showDecadeStars || !data.decadeStem) return {};
    
    const stemIndex = HEAVENLY_STEMS.indexOf(data.decadeStem);
    if (stemIndex === -1) return {};

    const luPos = getLuCunPosition(stemIndex);
    const yangPos = (luPos + 1) % 12;
    const tuoPos = (luPos - 1 + 12) % 12; // Handle negative modulo

    const map: Record<number, string[]> = {};
    const add = (idx: number, name: string) => {
        if (!map[idx]) map[idx] = [];
        map[idx].push(name);
    };

    add(luPos, '祿存');
    add(yangPos, '擎羊');
    add(tuoPos, '陀羅');
    return map;
  }, [showDecadeStars, data.decadeStem]);

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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-1 md:p-4 flex flex-col items-center">
      {/* Header / Toolbar */}
      <div className="w-full max-w-6xl flex flex-wrap justify-between items-center mb-2 px-1 gap-2">
        <div className="flex items-center gap-2 md:gap-4">
            <button onClick={onReset} className="text-slate-500 hover:text-slate-800 text-sm font-medium flex items-center transition-colors">
              <span className="mr-1">←</span> 重置
            </button>
            <h2 className="text-sm md:text-lg font-serif text-slate-700 tracking-widest block">
               {data.formattedDate} · {data.element}
            </h2>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">
             {/* Decade Frame Toggle */}
             <button 
                onClick={() => setShowDecade(!showDecade)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${showDecade ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-400 border-slate-200'}`}
             >
                {showDecade ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                大限框
             </button>

              {/* Decade Stars Toggle */}
             <button 
                onClick={() => setShowDecadeStars(!showDecadeStars)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${showDecadeStars ? 'bg-pink-50 text-pink-600 border-pink-200' : 'bg-white text-slate-400 border-slate-200'}`}
             >
                <Sparkles className="w-3 h-3" />
                大限祿羊陀
             </button>

             {/* Self Si Hua Toggle */}
             <button 
                onClick={() => setShowSelfSiHua(!showSelfSiHua)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${showSelfSiHua ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
             >
                {showSelfSiHua ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                宮干四化
             </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-6xl aspect-[3/4] md:aspect-[4/3] grid grid-cols-4 grid-rows-4 gap-px bg-slate-300 border border-slate-300 shadow-xl rounded-lg overflow-hidden">
        {gridMapping.map((branchIdx, i) => {
          if (branchIdx === -1) {
            if (i === 5) { // Center render position
               return (
                 <div key={i} className="col-span-2 row-span-2 bg-slate-50 flex flex-col justify-center items-center text-center p-4 relative overflow-hidden">
                    {/* Background Pattern */}
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
          const isDecade = branchIdx === data.currentDecadeIndex;
          const decadeStarsForPalace = decadeStarsMap[branchIdx];

          return (
            <Palace 
              key={branchIdx} 
              palace={palace} 
              onClick={() => handlePalaceClick(branchIdx)}
              highlightStatus={getHighlightStatus(branchIdx)}
              isCurrentDecade={isDecade}
              showDecade={showDecade}
              showSelfSiHua={showSelfSiHua}
              flyingSiHua={flyingSiHua}
              decadeStars={decadeStarsForPalace}
            />
          );
        })}
      </div>

      {/* Removed Legends */}

      {/* Detail Modal */}
      {showModal && selectedPalace && (
        <StarDetailModal 
          palace={selectedPalace} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
};

export default Chart;