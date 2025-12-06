import React from 'react';
import { Sparkles, Moon, Sun, Scroll, Star, Info, RotateCw, AlertTriangle } from 'lucide-react';

export const ICONS = {
  Sparkles: <Sparkles className="w-4 h-4" />,
  Moon: <Moon className="w-4 h-4" />,
  Sun: <Sun className="w-4 h-4" />,
  Scroll: <Scroll className="w-5 h-5" />,
  Star: <Star className="w-4 h-4" />,
  Info: <Info className="w-4 h-4" />,
  Rotate: <RotateCw className="w-4 h-4" />,
  Alert: <AlertTriangle className="w-4 h-4" />,
};

// Star Abbreviations (Single Character)
export const STAR_ABBREVIATIONS: {[key: string]: string} = {
  '紫微': '紫',
  '天機': '機',
  '太陽': '陽',
  '武曲': '武',
  '天同': '同',
  '廉貞': '廉',
  '天府': '府',
  '太陰': '陰',
  '貪狼': '貪',
  '巨門': '巨',
  '天相': '相',
  '天梁': '梁',
  '七殺': '殺',
  '破軍': '破',
  '左輔': '左',
  '右弼': '右',
  '文曲': '曲',
  '文昌': '昌',
  '天魁': '魁',
  '天鉞': '鉞',
  '地空': '空', // Map classic names if needed, usually engine uses 地空/天空
  '天空': '空',
  '地劫': '劫',
  '火星': '火',
  '鈴星': '鈴',
  '天馬': '馬',
  '祿存': '祿',
  '擎羊': '羊',
  '陀羅': '陀', // Engine uses 陀羅
  '紅鸞': '紅',
  '天喜': '喜',
  '天刑': '刑',
  '天姚': '姚',
  '咸池': '咸',
  '大耗': '耗',
  '華蓋': '華',
  '孤辰': '孤',
  '寡宿': '寡',
  // '陰煞': '陰煞' // Keep full name for Yin Sha implicitly by not listing it
};

// Palace Name Abbreviations (Single Character)
export const PALACE_ABBREVIATIONS: {[key: string]: string} = {
  '命宮': '命',
  '兄弟': '兄',
  '夫妻': '夫',
  '子女': '子',
  '財帛': '財',
  '疾厄': '疾',
  '遷移': '遷',
  '交友': '友',
  '官祿': '官',
  '田宅': '田',
  '福德': '福',
  '父母': '父',
};

// Group Definitions for Layout
export const ZI_WEI_SERIES = ['紫微', '天機', '太陽', '武曲', '天同', '廉貞'];
export const TIAN_FU_SERIES = ['天府', '太陰', '貪狼', '巨門', '天相', '天梁', '七殺', '破軍'];
// Added Lu Cun to Middle Group
export const MIDDLE_GROUP = ['左輔', '右弼', '文昌', '文曲', '祿存'];

// Simplified Colors mapping
// Major: Black
// Lucky (Ji): Blue
// Bad (Sha): Red
// Others: Dark Grey
export const STAR_STYLES: {[key: string]: string} = {
  // Major Stars (Zi Wei / Tian Fu Systems) - Black
  '紫微': 'text-slate-900 font-bold',
  '天機': 'text-slate-900 font-bold',
  '太陽': 'text-slate-900 font-bold',
  '武曲': 'text-slate-900 font-bold',
  '天同': 'text-slate-900 font-bold',
  '廉貞': 'text-slate-900 font-bold',
  '天府': 'text-slate-900 font-bold',
  '太陰': 'text-slate-900 font-bold',
  '貪狼': 'text-slate-900 font-bold',
  '巨門': 'text-slate-900 font-bold',
  '天相': 'text-slate-900 font-bold',
  '天梁': 'text-slate-900 font-bold',
  '七殺': 'text-slate-900 font-bold',
  '破軍': 'text-slate-900 font-bold',

  // Lucky Stars (Six Ji) - Blue
  '左輔': 'text-blue-700 font-bold',
  '右弼': 'text-blue-700 font-bold',
  '天魁': 'text-blue-700 font-bold',
  '天鉞': 'text-blue-700 font-bold',
  '文昌': 'text-blue-700 font-bold',
  '文曲': 'text-blue-700 font-bold',

  // Lu Cun - Orange (Special Request)
  '祿存': 'text-orange-600 font-bold',

  // Bad Stars (Six Sha) - Red
  '天空': 'text-red-600 font-bold',
  '地空': 'text-red-600 font-bold',
  '地劫': 'text-red-600 font-bold',
  '擎羊': 'text-red-600 font-bold',
  '陀羅': 'text-red-600 font-bold',
  '火星': 'text-red-600 font-bold',
  '鈴星': 'text-red-600 font-bold',
  
  // Others - Dark Grey / Slate
  '天馬': 'text-slate-600 font-medium',
  '紅鸞': 'text-slate-600 font-medium',
  '天喜': 'text-slate-600 font-medium',
  '天刑': 'text-slate-600 font-medium',
  '天姚': 'text-slate-600 font-medium',
  '咸池': 'text-slate-600 font-medium',
  '大耗': 'text-slate-600 font-medium',
  '華蓋': 'text-slate-600 font-medium',
  '孤辰': 'text-slate-600 font-medium',
  '寡宿': 'text-slate-600 font-medium',
  '陰煞': 'text-slate-600 font-medium',
};

export const LUCKY_STARS = ['左輔', '右弼', '天魁', '天鉞', '文昌', '文曲'];
export const BAD_STARS = ['天空', '地劫', '擎羊', '陀羅', '火星', '鈴星', '地空'];
export const SPECIAL_STARS = ['祿存', '天馬', '紅鸞', '天喜', '天刑', '天姚', '咸池', '大耗', '華蓋', '孤辰'];