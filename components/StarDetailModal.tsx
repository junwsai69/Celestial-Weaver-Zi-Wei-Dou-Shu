import React from 'react';
import { Palace, StarType, Scope } from '../types';
import { STAR_STYLES, STAR_ABBREVIATIONS } from '../constants';
import { X, BookOpen } from 'lucide-react';

interface Props {
  palace: Palace;
  onClose: () => void;
}

const StarDetailModal: React.FC<Props> = ({ palace, onClose }) => {
  // Sort order: Major -> Auxiliary -> Bad -> Minor
  const sortStars = (stars: any[]) => {
    const priority = { [StarType.MAJOR]: 0, [StarType.AUXILIARY]: 1, [StarType.BAD]: 2, [StarType.MINOR]: 3 };
    return [...stars].sort((a, b) => (priority[a.type as StarType] ?? 4) - (priority[b.type as StarType] ?? 4));
  };

  const sortedStars = sortStars(palace.stars);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end sm:justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
      />
      
      {/* Modal Content */}
      <div className="relative w-full sm:w-[450px] h-full bg-white shadow-2xl overflow-y-auto sm:rounded-2xl border-l sm:border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur z-20 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <BookOpen size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">星曜圖鑑</span>
            </div>
            <h2 className="text-3xl font-serif text-slate-800 font-bold">{palace.name}</h2>
            <p className="text-slate-500 text-sm mt-1">{palace.heavenlyStem}{palace.earthlyBranch}宮 · {palace.decadeRange[0]}-{palace.decadeRange[1]}歲</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 pb-20 space-y-8">
          {/* Grouped Star List */}
          {[StarType.MAJOR, StarType.AUXILIARY, StarType.BAD, StarType.MINOR].map((type) => {
              const groupStars = sortedStars.filter(s => s.type === type);
              if (groupStars.length === 0) return null;

              const titles = {
                [StarType.MAJOR]: "主星 Major Stars",
                [StarType.AUXILIARY]: "吉星 & 輔曜 Auspicious",
                [StarType.BAD]: "煞星 Evil Stars",
                [StarType.MINOR]: "雜曜 Minor Stars"
              };

              return (
                <div key={type}>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                    {titles[type]}
                  </h3>
                  <div className="space-y-3">
                    {groupStars.map((star, i) => (
                      <div key={i} className="flex items-start p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              {/* Display Full Name here, but use Simple Color logic */}
                              <div className="flex items-center gap-2">
                                <span className={`text-lg font-bold ${STAR_STYLES[star.name] || 'text-slate-500'}`}>{star.name}</span>
                                <span className="text-xs text-slate-400">({STAR_ABBREVIATIONS[star.name] || star.name})</span>
                              </div>
                              
                              {/* Si Hua Chips */}
                              <div className="flex gap-1">
                                {star.scopeSiHua?.[Scope.NATAL] && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded border border-amber-200">本命</span>}
                                {star.scopeSiHua?.[Scope.DECADE] && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-cyan-100 text-cyan-700 rounded border border-cyan-200">大限</span>}
                                {star.scopeSiHua?.[Scope.SELF] && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded border border-emerald-200">宮干</span>}
                                {star.scopeSiHua?.[Scope.YEAR] && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded border border-purple-200">流年</span>}
                              </div>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
          })}
        </div>
      </div>
    </div>
  );
};

export default StarDetailModal;