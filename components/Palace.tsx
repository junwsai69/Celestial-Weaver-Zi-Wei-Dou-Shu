import React from 'react';
import { Palace as PalaceType, SiHuaType, Scope, Star } from '../types';
import { STAR_STYLES, STAR_ABBREVIATIONS, PALACE_ABBREVIATIONS, ZI_WEI_SERIES, TIAN_FU_SERIES, MIDDLE_GROUP } from '../constants';

export type HighlightStatus = 'focused' | 'related' | null;

interface Props {
  palace: PalaceType;
  onClick: () => void;
  highlightStatus: HighlightStatus;
  isCurrentDecade?: boolean;
  showDecade: boolean;
  showSelfSiHua: boolean;
  flyingSiHua?: Record<string, SiHuaType>;
}

// Compact Si Hua Badge
const getSiHuaBadge = (type: SiHuaType, scope: Scope) => {
  if (type === SiHuaType.NONE) return null;
  
  // Increased size from text-[7px] to text-[10px] and adjusted dimensions
  const baseClasses = "text-[10px] font-bold leading-none px-1 rounded flex items-center justify-center min-w-[14px] h-[14px] mb-0.5 shadow-sm";
  
  switch (scope) {
    case Scope.NATAL: 
      return <span className={`${baseClasses} bg-amber-100 text-amber-700 border border-amber-300`}>{type}</span>;
    case Scope.DECADE: 
      return <span className={`${baseClasses} bg-cyan-100 text-cyan-600 border border-cyan-300`}>{type}</span>;
    case Scope.YEAR: 
      return <span className={`${baseClasses} bg-purple-100 text-purple-700 border border-purple-300`}>{type}</span>;
    case Scope.SELF:
      return <span className={`${baseClasses} bg-emerald-100 text-emerald-700 border border-emerald-300`}>{type}</span>;
    default:
      return null;
  }
};

const Palace: React.FC<Props> = ({ palace, onClick, highlightStatus, isCurrentDecade, showDecade, flyingSiHua }) => {
  
  // 1. Group Stars
  const ziWeiStars = palace.stars.filter(s => ZI_WEI_SERIES.includes(s.name));
  const tianFuStars = palace.stars.filter(s => TIAN_FU_SERIES.includes(s.name));
  const middleStars = palace.stars.filter(s => MIDDLE_GROUP.includes(s.name));
  const bottomStars = palace.stars.filter(s => 
    !ZI_WEI_SERIES.includes(s.name) && 
    !TIAN_FU_SERIES.includes(s.name) && 
    !MIDDLE_GROUP.includes(s.name)
  );

  // Helper to render a star block
  const renderStarBlock = (star: Star, sizeClass: string = "text-base") => {
    const dynamicSiHua = flyingSiHua?.[star.name];
    const nameStr = STAR_ABBREVIATIONS[star.name] || star.name;
    const styleClass = STAR_STYLES[star.name] || 'text-slate-500';

    return (
      <div key={star.name} className="flex flex-col items-center mx-[1px] mb-0.5">
        <span className={`${sizeClass} leading-none ${styleClass}`}>
          {nameStr}
        </span>
        {/* Stacked Si Hua */}
        <div className="flex flex-col items-center mt-[1px]">
           {star.scopeSiHua?.[Scope.NATAL] && getSiHuaBadge(star.scopeSiHua[Scope.NATAL]!, Scope.NATAL)}
           {star.scopeSiHua?.[Scope.DECADE] && getSiHuaBadge(star.scopeSiHua[Scope.DECADE]!, Scope.DECADE)}
           {star.scopeSiHua?.[Scope.YEAR] && getSiHuaBadge(star.scopeSiHua[Scope.YEAR]!, Scope.YEAR)}
           {dynamicSiHua && getSiHuaBadge(dynamicSiHua, Scope.SELF)}
        </div>
      </div>
    );
  };

  // Dynamic Styles
  let containerClasses = "bg-white border-gray-200 hover:border-indigo-300";
  let decadeStyle = "";

  if (highlightStatus === 'focused') {
    containerClasses = "bg-indigo-50 border-indigo-600 shadow-md ring-1 ring-indigo-200";
    if (showDecade && isCurrentDecade) {
       containerClasses = "bg-pink-100 border-red-400 shadow-md";
    }
  } else if (highlightStatus === 'related') {
    containerClasses = "bg-indigo-50/40 border-indigo-300 border-dashed";
  }

  if (showDecade && isCurrentDecade) {
    if (highlightStatus !== 'focused') {
        decadeStyle = "border-2 border-red-500";
    } else {
        decadeStyle = "border-2 border-red-500 ring-0"; 
    }
  }

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col justify-between h-full border p-0.5 md:p-1 cursor-pointer transition-colors duration-200 overflow-hidden select-none ${containerClasses} ${decadeStyle}`}
    >
      <div className="flex-1 flex flex-col">
        {/* Top Row */}
        <div className="flex justify-between items-start w-full relative z-10">
          <div className="flex flex-wrap justify-start max-w-[50%]">
             {ziWeiStars.map(s => renderStarBlock(s, "text-sm md:text-base font-bold"))}
          </div>
          <div className="flex flex-wrap justify-end max-w-[50%]">
             {tianFuStars.map(s => renderStarBlock(s, "text-sm md:text-base font-bold"))}
          </div>
        </div>

        {/* Middle Row */}
        {middleStars.length > 0 && (
          <div className="flex justify-center items-center w-full my-0.5 relative z-10">
            {middleStars.map(s => renderStarBlock(s, "text-xs md:text-sm font-bold"))}
          </div>
        )}

        {/* Bottom Row */}
        <div className="flex flex-wrap justify-start items-end content-end mt-auto gap-x-0.5 relative z-10">
           {bottomStars.map(s => renderStarBlock(s, "text-[10px] md:text-xs"))}
        </div>
      </div>

      {/* Footer: Palace Info */}
      <div className="border-t border-slate-200/50 pt-0.5 mt-0.5 flex justify-between items-end relative z-10">
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
             <span className={`text-[9px] md:text-[10px] font-mono block ${showDecade && isCurrentDecade ? 'text-red-600 font-bold' : 'text-slate-400'}`}>
               {palace.decadeRange[0]}-{palace.decadeRange[1]}
             </span>
        </div>
      </div>
    </div>
  );
};

export default Palace;