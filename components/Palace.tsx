import React from 'react';
import { Palace as PalaceType, SiHuaType, Scope, Star } from '../types';
import { STAR_STYLES, STAR_ABBREVIATIONS, PALACE_ABBREVIATIONS, ZI_WEI_SERIES, TIAN_FU_SERIES, MIDDLE_GROUP } from '../constants';
import { isNatalFlowStar, LAYER_CHIP_CLASS, LayerMarker } from '../services/chartLayers';

export type HighlightStatus = 'focused' | 'related' | null;

interface Props {
  palace: PalaceType;
  onClick: () => void;
  highlightStatus: HighlightStatus;
  isDecadePalace: boolean;
  showNatalLayer: boolean;
  showDecadeLayer: boolean;
  flyingSiHua?: Record<string, SiHuaType>;
  decadeSiHua: Record<string, SiHuaType>;
  yearSiHua: Record<string, SiHuaType>;
  layerMarkers: LayerMarker[];
}

const badgeClass = "text-[10px] font-bold leading-none px-1 rounded flex items-center justify-center min-w-[14px] h-[14px] mb-0.5 shadow-sm";

const getSiHuaBadge = (type: SiHuaType, scope: Scope) => {
  if (type === SiHuaType.NONE) return null;

  switch (scope) {
    case Scope.NATAL:
      return <span className={`${badgeClass} bg-amber-100 text-amber-700 border border-amber-300`}>{type}</span>;
    case Scope.DECADE:
      return <span className={`${badgeClass} bg-cyan-100 text-cyan-700 border border-cyan-300`}>{type}</span>;
    case Scope.YEAR:
      return <span className={`${badgeClass} bg-purple-100 text-purple-700 border border-purple-300`}>{type}</span>;
    case Scope.SELF:
      return <span className={`${badgeClass} bg-emerald-100 text-emerald-700 border border-emerald-300`}>{type}</span>;
    default:
      return null;
  }
};

const Palace: React.FC<Props> = ({
  palace,
  onClick,
  highlightStatus,
  isDecadePalace,
  showNatalLayer,
  showDecadeLayer,
  flyingSiHua,
  decadeSiHua,
  yearSiHua,
  layerMarkers,
}) => {
  const columnStars = palace.stars.filter((star) => showNatalLayer || !isNatalFlowStar(star.name));
  const ziWeiStars = columnStars.filter(s => ZI_WEI_SERIES.includes(s.name));
  const tianFuStars = columnStars.filter(s => TIAN_FU_SERIES.includes(s.name));
  const middleStars = columnStars.filter(s => MIDDLE_GROUP.includes(s.name));
  const bottomStars = columnStars.filter(s =>
    !ZI_WEI_SERIES.includes(s.name) &&
    !TIAN_FU_SERIES.includes(s.name) &&
    !MIDDLE_GROUP.includes(s.name)
  );

  const renderStarBlock = (starName: string, starObj?: Star, sizeClass: string = "text-base") => {
    const dynamicSiHua = starObj ? flyingSiHua?.[starObj.name] : undefined;
    const nameStr = STAR_ABBREVIATIONS[starName] || starName;
    const styleClass = STAR_STYLES[starName] || 'text-slate-500';
    const isYinSha = starName === '陰煞';
    const containerClass = isYinSha
      ? "flex flex-col items-center justify-center -space-y-1 mx-1"
      : "flex flex-col items-center mx-[1px] mb-0.5";
    const natalSiHua = showNatalLayer ? starObj?.scopeSiHua?.[Scope.NATAL] : undefined;
    const decadeType = starObj ? decadeSiHua[starObj.name] : undefined;
    const yearType = starObj ? yearSiHua[starObj.name] : undefined;
    const showNatalTag = showNatalLayer && isNatalFlowStar(starName);

    return (
      <div key={starName} className={containerClass}>
        <span className={`${sizeClass} leading-none ${styleClass} ${isYinSha ? 'writing-vertical-rl text-[10px] md:text-xs tracking-tighter py-1' : ''}`}>
          {nameStr}
        </span>
        {(showNatalTag || natalSiHua || decadeType || yearType || dynamicSiHua) && (
          <div className="flex flex-col items-center mt-[1px]">
            {showNatalTag && (
              <span className={`${badgeClass} bg-amber-100 text-amber-800 border border-amber-300`}>本</span>
            )}
            {natalSiHua && getSiHuaBadge(natalSiHua, Scope.NATAL)}
            {decadeType && getSiHuaBadge(decadeType, Scope.DECADE)}
            {yearType && getSiHuaBadge(yearType, Scope.YEAR)}
            {dynamicSiHua && getSiHuaBadge(dynamicSiHua, Scope.SELF)}
          </div>
        )}
      </div>
    );
  };

  const showDecadeFrame = showDecadeLayer && isDecadePalace;
  let containerClasses = "bg-white border-slate-200 hover:border-indigo-300";

  if (highlightStatus === 'focused') {
    containerClasses = showDecadeFrame
      ? "bg-cyan-50 border-cyan-600 shadow-md ring-1 ring-cyan-200"
      : "bg-indigo-50 border-indigo-600 shadow-md ring-1 ring-indigo-200";
  } else if (highlightStatus === 'related') {
    containerClasses = "bg-indigo-50/40 border-indigo-300 border-dashed";
  }

  const frameClasses = showDecadeFrame ? "border-2 border-cyan-500" : "";

  return (
    <div
      onClick={onClick}
      title={showDecadeFrame ? `大限 ${palace.heavenlyStem}${palace.earthlyBranch}` : undefined}
      className={`relative flex flex-col justify-between h-full border p-0.5 md:p-1 cursor-pointer transition-colors duration-200 overflow-hidden select-none ${containerClasses} ${frameClasses}`}
    >
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-start w-full relative z-10">
          <div className="flex flex-wrap justify-start max-w-[50%]">
             {ziWeiStars.map(s => renderStarBlock(s.name, s, "text-sm md:text-base font-bold"))}
          </div>
          <div className="flex flex-wrap justify-end max-w-[50%]">
             {tianFuStars.map(s => renderStarBlock(s.name, s, "text-sm md:text-base font-bold"))}
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center w-full my-0.5 relative z-10">
            {middleStars.map(s => renderStarBlock(s.name, s, "text-xs md:text-sm font-bold"))}
        </div>

        <div className="flex flex-wrap justify-start items-end content-end gap-x-0.5 relative z-10">
           {bottomStars.map(s => renderStarBlock(s.name, s, "text-[10px] md:text-xs"))}
        </div>
      </div>

      {layerMarkers.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mt-0.5 shrink-0 relative z-10" aria-label="層星">
          {layerMarkers.map((marker) => (
            <span
              key={marker.key}
              title={marker.title}
              className={`text-[10px] md:text-xs font-bold leading-none px-0.5 py-px rounded border whitespace-nowrap ${LAYER_CHIP_CLASS[marker.scope]}`}
            >
              {marker.label}
            </span>
          ))}
        </div>
      )}

      <div className="border-t border-slate-200/50 pt-0.5 mt-0.5 flex justify-between items-end relative z-10 shrink-0">
        <div className="text-left leading-none">
             <div className="text-[10px] md:text-xs font-light text-slate-800 font-serif">
               {palace.heavenlyStem}
             </div>
        </div>

        <div className="flex flex-col items-center flex-1">
            <span className={`text-xs md:text-sm font-serif font-light ${highlightStatus === 'focused' ? 'text-indigo-800' : 'text-slate-800'}`}>
              {PALACE_ABBREVIATIONS[palace.name] || palace.name}
            </span>
        </div>

        <div className="text-right leading-none">
             <span className={`text-[9px] md:text-[10px] font-mono block ${showDecadeFrame ? 'text-cyan-700 font-bold' : 'text-slate-400'}`}>
               {palace.decadeRange[0]}-{palace.decadeRange[1]}
             </span>
        </div>
      </div>
    </div>
  );
};

export default Palace;
