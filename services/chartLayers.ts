import { ChartData, SiHuaType, Star } from '../types';
import { getFlowStarPositions, getGregorianYearFlow, getSiHua, HEAVENLY_STEMS, getGregorianYearStemIndex } from './ziweiEngine';

export type LayerScope = 'natal' | 'decade' | 'year';

export interface LayerMarker {
  palaceIndex: number;
  key: string;
  label: string;
  title: string;
  scope: LayerScope;
}

export interface LayerSelection {
  showDecade: boolean;
  showYear: boolean;
  decadeIndex: number | null;
  year: number;
}

export const NATAL_FLOW_STAR_NAMES = ['祿存', '擎羊', '陀羅', '天馬'] as const;

export const LAYER_CHIP_CLASS: Record<LayerScope, string> = {
  natal: 'bg-amber-100 text-amber-800 border-amber-300',
  decade: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  year: 'bg-purple-100 text-purple-800 border-purple-300',
};

const DECADE_FLOW: { field: 'luCun' | 'qingYang' | 'tuoLuo' | 'tianMa'; key: string; label: string; title: string }[] = [
  { field: 'luCun', key: 'decade-lu', label: '大祿', title: '大限祿存' },
  { field: 'qingYang', key: 'decade-yang', label: '大羊', title: '大限擎羊' },
  { field: 'tuoLuo', key: 'decade-tuo', label: '大陀', title: '大限陀羅' },
  { field: 'tianMa', key: 'decade-ma', label: '大馬', title: '大限天馬' },
];

const YEAR_FLOW: { field: 'luCun' | 'qingYang' | 'tuoLuo' | 'tianMa'; key: string; label: string; title: string }[] = [
  { field: 'luCun', key: 'year-lu', label: '流祿', title: '流年祿存' },
  { field: 'qingYang', key: 'year-yang', label: '流羊', title: '流年擎羊' },
  { field: 'tuoLuo', key: 'year-tuo', label: '流陀', title: '流年陀羅' },
  { field: 'tianMa', key: 'year-ma', label: '流馬', title: '流年天馬' },
];

export const isNatalFlowStar = (name: string): boolean =>
  (NATAL_FLOW_STAR_NAMES as readonly string[]).includes(name);

/** Column stars for the chart. Hiding 本命 drops 祿存/羊/陀/天馬 and does not mutate the chart. */
export const visibleColumnStars = (stars: readonly Star[], showNatal: boolean): Star[] => {
  if (showNatal) return [...stars];
  return stars.filter((star) => !isNatalFlowStar(star.name));
};

export const decadeSiHuaFor = (chart: ChartData, decadeIndex: number | null): Record<string, SiHuaType> => {
  if (decadeIndex === null) return {};
  const palace = chart.palaces[decadeIndex];
  return palace ? getSiHua(palace.heavenlyStem) : {};
};

export const yearSiHuaFor = (year: number): Record<string, SiHuaType> =>
  getSiHua(HEAVENLY_STEMS[getGregorianYearStemIndex(year)]);

export const formatGregorianYear = (year: number): string => {
  const flow = getGregorianYearFlow(year);
  return `${year} ${flow.stem}${flow.branch}`;
};

/**
 * Decade and year 祿存 / 羊 / 陀 / 天馬 for the palaces they land in.
 * Natal copies stay on the chart stars themselves.
 */
export const layerMarkers = (chart: ChartData, selection: LayerSelection): LayerMarker[] => {
  const markers: LayerMarker[] = [];

  if (selection.showDecade && selection.decadeIndex !== null) {
    const palace = chart.palaces[selection.decadeIndex];
    const flow = palace ? getFlowStarPositions(palace.heavenlyStem, palace.earthlyBranch) : null;
    if (flow) {
      for (const spec of DECADE_FLOW) {
        markers.push({
          palaceIndex: flow[spec.field],
          key: spec.key,
          label: spec.label,
          title: spec.title,
          scope: 'decade',
        });
      }
    }
  }

  if (selection.showYear) {
    const flow = getGregorianYearFlow(selection.year);
    for (const spec of YEAR_FLOW) {
      markers.push({
        palaceIndex: flow[spec.field],
        key: spec.key,
        label: spec.label,
        title: spec.title,
        scope: 'year',
      });
    }
  }

  return markers;
};

export const markersByPalace = (markers: readonly LayerMarker[]): LayerMarker[][] => {
  const buckets: LayerMarker[][] = Array.from({ length: 12 }, () => []);
  for (const marker of markers) {
    buckets[marker.palaceIndex].push(marker);
  }
  return buckets;
};
