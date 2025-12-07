import { ChartData, Palace, Star, StarType, SiHuaType, Scope, Gender, CalendarType } from '../types';
import { Lunar, Solar } from 'lunar-javascript';

// Constants
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const PALACE_NAMES = ['命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄', '遷移', '交友', '官祿', '田宅', '福德', '父母'];
export const HOURS = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Five Elements / Bureaus
const ELEMENTS = [
  { name: '水二局', number: 2 },
  { name: '木三局', number: 3 },
  { name: '金四局', number: 4 },
  { name: '土五局', number: 5 },
  { name: '火六局', number: 6 },
];

const getIndex = (i: number) => (i % 12 + 12) % 12;

// Si Hua Map
export const SI_HUA_MAP: {[key: string]: string[]} = {
  '甲': ['廉貞', '破軍', '武曲', '太陽'],
  '乙': ['天機', '天梁', '紫微', '太陰'],
  '丙': ['天同', '天機', '文昌', '廉貞'],
  '丁': ['太陰', '天同', '天機', '巨門'],
  '戊': ['貪狼', '太陰', '右弼', '天機'],
  '己': ['武曲', '貪狼', '天梁', '文曲'],
  '庚': ['太陽', '武曲', '太陰', '天相'], // Changed 天同 to 天相
  '辛': ['巨門', '太陽', '文曲', '文昌'],
  '壬': ['天梁', '紫微', '左輔', '武曲'],
  '癸': ['破軍', '巨門', '太陰', '貪狼'],
};

// Helper to get Si Hua for a specific stem
export const getSiHua = (stem: string): Record<string, SiHuaType> => {
  const stars = SI_HUA_MAP[stem];
  if (!stars) return {};
  
  const types = [SiHuaType.LU, SiHuaType.QUAN, SiHuaType.KE, SiHuaType.JI];
  const result: Record<string, SiHuaType> = {};
  
  stars.forEach((starName, index) => {
    result[starName] = types[index];
  });
  
  return result;
};

// Helper to get San He (Three Harmonies) Element
// 0=Water, 1=Metal, 2=Fire, 3=Wood (Custom enum for logic)
const getSanHe = (branchIndex: number): 'WATER' | 'METAL' | 'FIRE' | 'WOOD' => {
  const map: Record<number, 'WATER' | 'METAL' | 'FIRE' | 'WOOD'> = {
    8: 'WATER', 0: 'WATER', 4: 'WATER',   // Shen-Zi-Chen
    5: 'METAL', 9: 'METAL', 1: 'METAL',   // Si-You-Chou
    2: 'FIRE', 6: 'FIRE', 10: 'FIRE',     // Yin-Wu-Xu
    11: 'WOOD', 3: 'WOOD', 7: 'WOOD',     // Hai-Mao-Wei
  };
  return map[branchIndex];
};

// Exported for use in Chart.tsx to calculate Decade Lu/Yang/Tuo
export const getLuCunPosition = (stemIndex: number): number => {
  const luCunMap: {[key: number]: number} = {0: 2, 1: 3, 2: 5, 3: 6, 4: 5, 5: 6, 6: 8, 7: 9, 8: 11, 9: 0};
  return luCunMap[stemIndex] ?? 0;
};

// Na Yin Bureau Calculation based on Table
const getBureau = (yearStemIndex: number, mingBranchIndex: number): typeof ELEMENTS[0] => {
  const row = yearStemIndex % 5;
  const col = Math.floor(mingBranchIndex / 2);
  const table = [
    [2, 6, 3, 5, 4, 6],
    [6, 5, 4, 3, 2, 5],
    [5, 3, 2, 4, 6, 3],
    [3, 4, 6, 2, 5, 4],
    [4, 2, 5, 6, 3, 2]
  ];
  const bureauNum = table[row][col];
  return ELEMENTS.find(e => e.number === bureauNum) || ELEMENTS[0];
};

// Precise Zi Wei Star Position Algorithm
const getZiWeiPosition = (bureauNum: number, day: number): number => {
  let quotient = Math.ceil(day / bureauNum);
  let multiple = quotient * bureauNum;
  let diff = multiple - day;
  let steps = 0;
  if (diff % 2 !== 0) {
    steps = quotient - diff;
  } else {
    steps = quotient + diff;
  }
  const yinIndex = 2; // Yin is index 2
  let finalIndex = yinIndex + steps - 1;
  return getIndex(finalIndex);
};

const getChineseMonth = (m: number) => {
    const map = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"];
    return map[m - 1] || m.toString();
}

const getChineseDay = (d: number) => {
    const map = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十", 
                 "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
                 "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"];
    return map[d - 1] || d.toString();
}

export const calculateChart = (
  inYear: number,
  inMonth: number,
  inDay: number,
  hourIndex: number,
  gender: Gender,
  calendarType: CalendarType = CalendarType.SOLAR,
  currentDate: Date = new Date()
): ChartData => {
  
  let lunar;
  if (calendarType === CalendarType.SOLAR) {
     const solar = Solar.fromYmd(inYear, inMonth, inDay);
     lunar = solar.getLunar();
  } else {
     lunar = Lunar.fromYmd(inYear, inMonth, inDay);
  }
  
  const lunarYear = lunar.getYear();
  const lunarMonth = lunar.getMonth();
  const lunarDay = lunar.getDay();
  
  const yearStemIndex = lunar.getYearGanIndex(); // 0 = Jia
  const yearBranchIndex = lunar.getYearZhiIndex(); // 0 = Zi
  
  const yearStem = HEAVENLY_STEMS[yearStemIndex];
  const yearBranch = EARTHLY_BRANCHES[yearBranchIndex];
  
  const hourBranch = EARTHLY_BRANCHES[hourIndex];
  const genderPrefix = gender === Gender.MALE ? '乾造' : '坤造';
  const formattedDate = `${genderPrefix} ${yearStem}${yearBranch}年${getChineseMonth(Math.abs(lunarMonth))}月${getChineseDay(lunarDay)}${hourBranch}時`;

  // Locate Ming & Shen
  const startPos = 2; // Yin
  const mingIndex = getIndex(startPos + (Math.abs(lunarMonth) - 1) - hourIndex);
  const shenIndex = getIndex(startPos + (Math.abs(lunarMonth) - 1) + hourIndex);

  // Init Palaces
  const palaces: Palace[] = Array.from({ length: 12 }, (_, i) => {
    return {
      index: i,
      earthlyBranch: EARTHLY_BRANCHES[i],
      heavenlyStem: '',
      name: '',
      stars: [],
      decadeRange: [0, 0],
    };
  });

  PALACE_NAMES.forEach((name, offset) => {
    const palaceIdx = getIndex(mingIndex - offset);
    palaces[palaceIdx].name = name;
  });

  // Palace Stems (Five Tiger Escape)
  const stemMap: { [key: number]: number } = {
    0: 2, 5: 2, // Jia/Ji -> Bing
    1: 4, 6: 4, // Yi/Geng -> Wu
    2: 6, 7: 6, // Bing/Xin -> Geng
    3: 8, 8: 8, // Ding/Ren -> Ren
    4: 0, 9: 0, // Wu/Gui -> Jia
  };
  let startStemIdx = stemMap[yearStemIndex];
  for (let i = 0; i < 12; i++) {
    const stemIdx = (startStemIdx + (i - 2)) % 10;
    palaces[i].heavenlyStem = HEAVENLY_STEMS[stemIdx < 0 ? stemIdx + 10 : stemIdx];
  }

  // Element (Bureau)
  const mingPalaceBranchIndex = palaces[mingIndex].index; 
  const element = getBureau(yearStemIndex, mingPalaceBranchIndex);

  // Place Major Stars
  const ziWeiPos = getZiWeiPosition(element.number, lunarDay);
  const tianFuPos = getIndex(16 - ziWeiPos);

  const placeStar = (name: string, index: number, type: StarType = StarType.MAJOR) => {
    palaces[getIndex(index)].stars.push({ name, type });
  };

  placeStar('紫微', ziWeiPos);
  placeStar('天機', ziWeiPos - 1);
  placeStar('太陽', ziWeiPos - 3);
  placeStar('武曲', ziWeiPos - 4);
  placeStar('天同', ziWeiPos - 5);
  placeStar('廉貞', ziWeiPos - 8);

  placeStar('天府', tianFuPos);
  placeStar('太陰', tianFuPos + 1);
  placeStar('貪狼', tianFuPos + 2);
  placeStar('巨門', tianFuPos + 3);
  placeStar('天相', tianFuPos + 4);
  placeStar('天梁', tianFuPos + 5);
  placeStar('七殺', tianFuPos + 6);
  placeStar('破軍', tianFuPos + 10);

  // Auxiliary & Minor Stars
  const luCunPos = getLuCunPosition(yearStemIndex);
  placeStar('祿存', luCunPos, StarType.AUXILIARY);
  placeStar('擎羊', luCunPos + 1, StarType.BAD);
  placeStar('陀羅', luCunPos - 1, StarType.BAD);

  const maMap = [2, 11, 8, 5]; 
  placeStar('天馬', maMap[yearBranchIndex % 4], StarType.AUXILIARY);

  placeStar('左輔', 4 + (Math.abs(lunarMonth) - 1), StarType.AUXILIARY); 
  placeStar('右弼', 10 - (Math.abs(lunarMonth) - 1), StarType.AUXILIARY);

  placeStar('文昌', 10 - hourIndex, StarType.AUXILIARY); 
  placeStar('文曲', 4 + hourIndex, StarType.AUXILIARY);

  const kuiYueMap: {[key: number]: [number, number]} = {
    0: [1, 7], 1: [0, 8], 2: [11, 9], 3: [11, 9], 4: [1, 7],
    5: [0, 8], 6: [1, 7], 7: [6, 2], 8: [5, 3], 9: [3, 5]
  };
  const [kui, yue] = kuiYueMap[yearStemIndex] || [0,0];
  placeStar('天魁', kui, StarType.AUXILIARY);
  placeStar('天鉞', yue, StarType.AUXILIARY);

  // Ling Xing & Huo Xing
  const huoStart = [2, 3, 1, 9][yearBranchIndex % 4]; 
  // Ling Xing Logic Correction based on San He
  const sanHe = getSanHe(yearBranchIndex);
  // If Fire (Yin/Wu/Xu), Start Mao (3). Else Start Xu (10).
  const lingStartBase = sanHe === 'FIRE' ? 3 : 10;
  const lingPos = getIndex(lingStartBase + hourIndex);
  
  placeStar('火星', huoStart + hourIndex, StarType.BAD);
  placeStar('鈴星', lingPos, StarType.BAD);

  placeStar('地劫', 11 + hourIndex, StarType.BAD);
  placeStar('天空', 11 - hourIndex, StarType.BAD); 

  const luanPos = getIndex(3 - yearBranchIndex);
  placeStar('紅鸞', luanPos, StarType.AUXILIARY);
  placeStar('天喜', luanPos + 6, StarType.AUXILIARY);

  placeStar('天刑', 9 + (Math.abs(lunarMonth) - 1), StarType.BAD);
  placeStar('天姚', 1 + (Math.abs(lunarMonth) - 1), StarType.BAD);

  const xianChiPos = getIndex(9 - (yearBranchIndex % 4) * 3);
  placeStar('咸池', xianChiPos, StarType.MINOR);

  // Da Hao (Year) Logic Correction
  // Opposite of Year Branch (+6), then +1 if Yang YearStem, -1 if Yin YearStem
  const isYangYear = yearStemIndex % 2 === 0;
  const daHaoBase = getIndex(yearBranchIndex + 6);
  const daHaoPos = getIndex(daHaoBase + (isYangYear ? 1 : -1));
  placeStar('大耗', daHaoPos, StarType.BAD);

  // Hua Gai Logic Correction (San He Tomb)
  let huaGaiPos = 0;
  if (sanHe === 'WOOD') huaGaiPos = 7; // Wei
  else if (sanHe === 'WATER') huaGaiPos = 4; // Chen
  else if (sanHe === 'METAL') huaGaiPos = 1; // Chou
  else if (sanHe === 'FIRE') huaGaiPos = 10; // Xu
  placeStar('華蓋', huaGaiPos, StarType.MINOR);

  // Gu Chen / Gua Su Logic Correction (San Hui Season)
  let guPos = 0;
  let guaPos = 0;
  // Season Map: Wood->Spring(Yin2), Fire->Summer(Si5), Metal->Autumn(Shen8), Water->Winter(Hai11)
  // Gu (Front) = Next Corner, Gua (Back) = Prev Corner
  if (sanHe === 'WOOD') { // Spring -> Yin/Mao/Chen. Next: Si(5), Prev: Chou(1)
      guPos = 5; guaPos = 1;
  } else if (sanHe === 'FIRE') { // Summer -> Si/Wu/Wei. Next: Shen(8), Prev: Chen(4)
      guPos = 8; guaPos = 4;
  } else if (sanHe === 'METAL') { // Autumn -> Shen/You/Xu. Next: Hai(11), Prev: Wei(7)
      guPos = 11; guaPos = 7;
  } else if (sanHe === 'WATER') { // Winter -> Hai/Zi/Chou. Next: Yin(2), Prev: Xu(10)
      guPos = 2; guaPos = 10;
  }
  placeStar('孤辰', guPos, StarType.MINOR);
  placeStar('寡宿', guaPos, StarType.MINOR);

  // Yin Sha Logic Correction (Month based, Odd palaces)
  // Formula: (Month-1)*2 + 2 (Yin)
  const yinShaPos = getIndex(2 + (Math.abs(lunarMonth) - 1) * 2);
  placeStar('陰煞', yinShaPos, StarType.MINOR);

  // Decade Ranges
  const isYangStem = [0, 2, 4, 6, 8].includes(yearStemIndex);
  const isMale = gender === Gender.MALE;
  const isClockwise = (isYangStem && isMale) || (!isYangStem && !isMale);
  
  for (let i = 0; i < 12; i++) {
    const pIdx = isClockwise ? getIndex(mingIndex + i) : getIndex(mingIndex - i);
    const startAge = element.number + (i * 10);
    const endAge = startAge + 9;
    palaces[pIdx].decadeRange = [startAge, endAge];
  }

  // Si Hua
  const applySiHua = (stem: string, scope: Scope) => {
    const stars = SI_HUA_MAP[stem];
    if (!stars) return;
    const types = [SiHuaType.LU, SiHuaType.QUAN, SiHuaType.KE, SiHuaType.JI];
    palaces.forEach(p => {
      p.stars.forEach(s => {
        if (stars.includes(s.name)) {
          if (!s.scopeSiHua) s.scopeSiHua = {};
          s.scopeSiHua[scope] = types[stars.indexOf(s.name)];
        }
      });
    });
  };

  applySiHua(yearStem, Scope.NATAL);

  const currentYear = currentDate.getFullYear();
  const currentAge = currentYear - lunarYear + 1;
  const decadePalace = palaces.find(p => currentAge >= p.decadeRange[0] && currentAge <= p.decadeRange[1]);
  if (decadePalace) {
    applySiHua(decadePalace.heavenlyStem, Scope.DECADE);
  }

  const currentYearStemIndex = (currentYear - 4) % 10;
  const currentYearStem = HEAVENLY_STEMS[currentYearStemIndex < 0 ? currentYearStemIndex + 10 : currentYearStemIndex];
  applySiHua(currentYearStem, Scope.YEAR);

  return {
    palaces,
    mingGongIndex: mingIndex,
    shenGongIndex: shenIndex,
    currentDecadeIndex: decadePalace?.index,
    element: element.name,
    birthYearStem: yearStem,
    birthYearBranch: yearBranch,
    decadeStem: decadePalace?.heavenlyStem,
    yearStem: currentYearStem,
    formattedDate,
  };
};