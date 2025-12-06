export enum Gender {
  MALE = '男',
  FEMALE = '女',
}

export enum CalendarType {
  LUNAR = '農曆',
  SOLAR = '陽曆',
}

export enum StarType {
  MAJOR = 'MAJOR',       // 14 Main Stars
  AUXILIARY = 'AUXILIARY', // Ji Xing (Zuo, You, etc.)
  BAD = 'BAD',           // Sha Xing (Yang, Tuo, etc.)
  MINOR = 'MINOR',       // Small stars
}

export enum SiHuaType {
  NONE = 'NONE',
  LU = '祿',
  QUAN = '權',
  KE = '科',
  JI = '忌',
}

export enum Scope {
  NATAL = 'NATAL', // 本命
  DECADE = 'DECADE', // 大限
  YEAR = 'YEAR', // 流年
  SELF = 'SELF', // 自化 (宮干)
}

export interface Star {
  name: string;
  type: StarType;
  brightness?: string; // Miao, Wang, Ping, Xian, etc.
  scopeSiHua?: {
    [key in Scope]?: SiHuaType;
  };
  description?: string;
  color?: string; // Hex override for specific stars
}

export interface Palace {
  index: number; // 0-11, where 0 is typically Zi (Rat) or arbitrary internal index
  earthlyBranch: string; // Zi, Chou, Yin...
  heavenlyStem: string; // Jia, Yi, Bing...
  name: string; // Ming, Brothers, Spouse...
  stars: Star[];
  decadeRange: [number, number]; // e.g., [14, 23]
}

export interface ChartData {
  palaces: Palace[];
  mingGongIndex: number;
  shenGongIndex: number;
  currentDecadeIndex?: number; // Added for identifying current decade palace
  element: string; // Five Elements (Water 2, Wood 3...)
  birthYearStem: string;
  birthYearBranch: string;
  decadeStem?: string; // For current decade calculations
  decadeBranch?: string;
  yearStem?: string; // For current year calculations
  yearBranch?: string;
  formattedDate: string; // e.g. 乙已年十月十日午時
}

export interface UserInput {
  name: string;
  gender: Gender;
  year: number;
  month: number;
  day: number;
  hourIndex: number; // 0 (Zi) to 11 (Hai)
  calendarType: CalendarType;
}