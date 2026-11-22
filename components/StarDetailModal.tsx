import React from 'react';
import { Palace, SiHuaType, StarType, Scope } from '../types';
import { STAR_STYLES, STAR_ABBREVIATIONS } from '../constants';
import { isNatalFlowStar, LAYER_CHIP_CLASS, LayerMarker } from '../services/chartLayers';
import { X, BookOpen } from 'lucide-react';

interface Props {
  palace: Palace;
  onClose: () => void;
  showNatalLayer: boolean;
  layerMarkers: LayerMarker[];
  decadeSiHua: Record<string, SiHuaType>;
  yearSiHua: Record<string, SiHuaType>;
  flyingSiHua: Record<string, SiHuaType>;
}

const StarDetailModal: React.FC<Props> = ({
  palace,
  onClose,
  showNatalLayer,
  layerMarkers,
  decadeSiHua,
  yearSiHua,
  flyingSiHua,
}) => {
  const priority = { [StarType.MAJOR]: 0, [StarType.AUXILIARY]: 1, [StarType.BAD]: 2, [StarType.MINOR]: 3 };
  const sortedStars = [...palace.stars]
    .filter((star) => showNatalLayer || !isNatalFlowStar(star.name))
    .sort((a, b) => (priority[a.type as StarType] ?? 4) - (priority[b.type as StarType] ?? 4));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end sm:justify-center p-0 sm:p-4">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
      />

      <div className="relative w-full sm:w-[450px] h-full bg-white shadow-2xl overflow-y-auto sm:rounded-2xl border-l sm:border border-slate-200">
        <div className="sticky top-0 bg-white/95 backdrop-blur z-20 px-6 py-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <BookOpen size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">星曜圖鑑</span>
            </div>
            <h2 className="text-3xl font-serif text-slate-800 font-bold">{palace.name}</h2>
            <p className="text-slate-500 text-sm mt-1">{palace.heavenlyStem}{palace.earthlyBranch}宮 · {palace.decadeRange[0]}-{palace.decadeRange[1]}歲</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors" aria-label="關閉">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 pb-20 space-y-8">
          {layerMarkers.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
                疊加
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {layerMarkers.map((marker) => (
                  <span
                    key={marker.key}
                    title={marker.title}
                    className={`text-xs font-bold px-1.5 py-0.5 rounded border ${LAYER_CHIP_CLASS[marker.scope]}`}
                  >
                    {marker.label}
                  </span>
                ))}
              </div>
            </div>
          )}

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
                    {groupStars.map((star) => (
                      <div key={star.name} className="flex items-start p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1 gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className={`text-lg font-bold ${STAR_STYLES[star.name] || 'text-slate-500'}`}>{star.name}</span>
                                <span className="text-xs text-slate-400">({STAR_ABBREVIATIONS[star.name] || star.name})</span>
                              </div>

                              <div className="flex flex-wrap gap-1 justify-end">
                                {showNatalLayer && isNatalFlowStar(star.name) && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded border border-amber-200">本命</span>
                                )}
                                {showNatalLayer && star.scopeSiHua?.[Scope.NATAL] && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded border border-amber-200">本命{star.scopeSiHua[Scope.NATAL]}</span>
                                )}
                                {decadeSiHua[star.name] && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-cyan-100 text-cyan-700 rounded border border-cyan-200">大限{decadeSiHua[star.name]}</span>
                                )}
                                {yearSiHua[star.name] && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 rounded border border-purple-200">流年{yearSiHua[star.name]}</span>
                                )}
                                {flyingSiHua[star.name] && (
                                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded border border-emerald-200">宮干{flyingSiHua[star.name]}</span>
                                )}
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
