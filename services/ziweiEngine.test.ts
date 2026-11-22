import { describe, expect, it } from 'vitest';
import { CalendarType, Gender, Scope, SiHuaType } from '../types';
import { decadeSiHuaFor, layerMarkers, visibleColumnStars, yearSiHuaFor } from './chartLayers';
import {
  calculateChart,
  EARTHLY_BRANCHES,
  getFlowStarPositions,
  getGregorianYearBranchIndex,
  getGregorianYearFlow,
  getGregorianYearStemIndex,
  getSiHua,
  getTianMaPosition,
  HEAVENLY_STEMS,
} from './ziweiEngine';

const HOUR = 0;
const GENDER = Gender.MALE;
const FIXED_NOW = new Date(2024, 5, 1);

describe('calculateChart calendar type', () => {
  it('treats the same numeric year/month/day as a different date for lunar vs solar', () => {
    const solar = calculateChart(1990, 1, 15, HOUR, GENDER, CalendarType.SOLAR, FIXED_NOW);
    const lunar = calculateChart(1990, 1, 15, HOUR, GENDER, CalendarType.LUNAR, FIXED_NOW);

    // 陽曆 1990-01-15 is 己巳年十二月十九; 農曆 1990-01-15 is 庚午年正月十五.
    expect(solar.formattedDate).toContain('己巳年十二月十九');
    expect(solar.birthYearStem + solar.birthYearBranch).toBe('己巳');
    expect(solar.mingGongIndex).toBe(1);

    expect(lunar.formattedDate).toContain('庚午年正月十五');
    expect(lunar.birthYearStem + lunar.birthYearBranch).toBe('庚午');
    expect(lunar.mingGongIndex).toBe(2);

    expect(solar.formattedDate).not.toBe(lunar.formattedDate);
    expect(solar.mingGongIndex).not.toBe(lunar.mingGongIndex);
  });

  it('converts a known solar date to the lunar date used by the engine', () => {
    // 2024-02-10 is 甲辰年正月初一.
    const springFestival = calculateChart(2024, 2, 10, HOUR, GENDER, CalendarType.SOLAR, FIXED_NOW);
    expect(springFestival.formattedDate).toContain('甲辰年正月初一');
    expect(springFestival.birthYearStem).toBe('甲');
    expect(springFestival.birthYearBranch).toBe('辰');

    // Same conversion lunar-javascript documents for 2019-05-01: 己亥年三月廿七.
    const documented = calculateChart(2019, 5, 1, HOUR, GENDER, CalendarType.SOLAR, FIXED_NOW);
    expect(documented.formattedDate).toContain('己亥年三月廿七');
    expect(documented.birthYearStem + documented.birthYearBranch).toBe('己亥');
  });

  it('defaults to the solar calendar when calendar type is omitted', () => {
    const explicit = calculateChart(2024, 2, 10, HOUR, GENDER, CalendarType.SOLAR, FIXED_NOW);
    const implicit = calculateChart(2024, 2, 10, HOUR, GENDER);
    expect(implicit.formattedDate).toBe(explicit.formattedDate);
    expect(implicit.formattedDate).toContain('甲辰年正月初一');
  });

  it('accepts a leap lunar month as a negative month', () => {
    // lunar-javascript: solar 2020-05-24 is 二〇二〇年闰四月初二.
    const fromSolar = calculateChart(2020, 5, 24, HOUR, GENDER, CalendarType.SOLAR, FIXED_NOW);
    const fromLeap = calculateChart(2020, -4, 2, HOUR, GENDER, CalendarType.LUNAR, FIXED_NOW);
    const fromRegular = calculateChart(2020, 4, 2, HOUR, GENDER, CalendarType.LUNAR, FIXED_NOW);

    expect(fromSolar.formattedDate).toContain('庚子年閏四月初二');
    expect(fromLeap.formattedDate).toContain('庚子年閏四月初二');
    expect(fromLeap.birthYearStem + fromLeap.birthYearBranch).toBe('庚子');
    expect(fromLeap.mingGongIndex).toBe(fromSolar.mingGongIndex);

    expect(fromRegular.formattedDate).toContain('庚子年四月初二');
    expect(fromRegular.formattedDate).not.toContain('閏');
    expect(fromRegular.formattedDate).not.toBe(fromLeap.formattedDate);
  });
});

const CHEN_DA_WEN = {
  year: 1990,
  month: 1,
  day: 1,
  hour: 0,
  gender: Gender.MALE,
  calendar: CalendarType.SOLAR,
  now: new Date(2026, 10, 21),
};

const branchOf = (index: number) => EARTHLY_BRANCHES[index];

describe('本命 / 大限 / 流年 layers', () => {
  const chart = () => calculateChart(
    CHEN_DA_WEN.year,
    CHEN_DA_WEN.month,
    CHEN_DA_WEN.day,
    CHEN_DA_WEN.hour,
    CHEN_DA_WEN.gender,
    CHEN_DA_WEN.calendar,
    CHEN_DA_WEN.now,
  );

  it('keeps 陳大文 natal star placement, including 祿存 / 羊 / 陀 / 天馬', () => {
    const result = chart();
    expect(result.formattedDate).toContain('己巳年十二月初五');
    expect(result.birthYearStem + result.birthYearBranch).toBe('己巳');
    expect(result.element).toBe('水二局');

    const starsByBranch = Object.fromEntries(
      result.palaces.map((palace) => [palace.earthlyBranch, palace.stars.map((star) => star.name)]),
    );
    expect(starsByBranch).toEqual({
      子: ['太陽', '天魁', '天姚', '陰煞'],
      丑: ['天府', '華蓋'],
      寅: ['天機', '太陰'],
      卯: ['紫微', '貪狼', '左輔', '火星'],
      辰: ['巨門', '文曲', '天喜'],
      巳: ['天相', '陀羅'],
      午: ['天梁', '祿存', '咸池'],
      未: ['廉貞', '七殺', '擎羊', '寡宿'],
      申: ['天鉞', '天刑'],
      酉: [],
      戌: ['天同', '文昌', '鈴星', '紅鸞', '大耗'],
      亥: ['武曲', '破軍', '天馬', '右弼', '地劫', '天空', '孤辰'],
    });

    const natal = getFlowStarPositions(result.birthYearStem, result.birthYearBranch);
    expect(branchOf(natal!.luCun)).toBe('午');
    expect(branchOf(natal!.qingYang)).toBe('未');
    expect(branchOf(natal!.tuoLuo)).toBe('巳');
    expect(branchOf(natal!.tianMa)).toBe('亥');
    expect(natal!.tianMa).toBe(getTianMaPosition(EARTHLY_BRANCHES.indexOf('巳')));

    const siHuaOf = (name: string) => {
      const palace = result.palaces.find((item) => item.stars.some((star) => star.name === name));
      return palace?.stars.find((star) => star.name === name)?.scopeSiHua?.[Scope.NATAL];
    };
    expect(siHuaOf('武曲')).toBe(SiHuaType.LU);
    expect(siHuaOf('貪狼')).toBe(SiHuaType.QUAN);
    expect(siHuaOf('天梁')).toBe(SiHuaType.KE);
    expect(siHuaOf('文曲')).toBe(SiHuaType.JI);
  });

  it('places the reference decade and year 祿存 / 羊 / 陀 / 天馬 from the existing stem and branch rules', () => {
    const result = chart();
    expect(result.referenceYear).toBe(2026);
    expect(result.currentDecadeIndex).toBe(10);
    expect(result.palaces[10].name).toBe('子女');
    expect(result.palaces[10].decadeRange).toEqual([32, 41]);
    expect(result.decadeStem).toBe('甲');
    expect(result.decadeBranch).toBe('戌');
    expect(result.yearStem).toBe('丙');
    expect(result.yearBranch).toBe('午');

    expect(result.decadeFlow).toEqual({
      stem: '甲',
      branch: '戌',
      luCun: EARTHLY_BRANCHES.indexOf('寅'),
      qingYang: EARTHLY_BRANCHES.indexOf('卯'),
      tuoLuo: EARTHLY_BRANCHES.indexOf('丑'),
      tianMa: EARTHLY_BRANCHES.indexOf('申'),
    });
    expect(result.yearFlow).toEqual(getGregorianYearFlow(2026));
    expect(result.yearFlow).toEqual({
      stem: '丙',
      branch: '午',
      luCun: EARTHLY_BRANCHES.indexOf('巳'),
      qingYang: EARTHLY_BRANCHES.indexOf('午'),
      tuoLuo: EARTHLY_BRANCHES.indexOf('辰'),
      tianMa: EARTHLY_BRANCHES.indexOf('申'),
    });

    expect(getSiHua('甲')).toEqual(decadeSiHuaFor(result, 10));
    expect(yearSiHuaFor(2026)['天同']).toBe(SiHuaType.LU);
    expect(yearSiHuaFor(2026)['天機']).toBe(SiHuaType.QUAN);
    expect(yearSiHuaFor(2026)['文昌']).toBe(SiHuaType.KE);
    expect(yearSiHuaFor(2026)['廉貞']).toBe(SiHuaType.JI);
  });

  it('moves decade and year layers when another 大限 or 流年 is chosen, without rewriting natal stars', () => {
    const result = chart();
    const natalStars = result.palaces.map((palace) => palace.stars.map((star) => ({
      name: star.name,
      natal: star.scopeSiHua?.[Scope.NATAL] ?? null,
    })));

    const otherDecade = getFlowStarPositions('乙', '亥');
    expect(result.palaces[11].heavenlyStem + result.palaces[11].earthlyBranch).toBe('乙亥');
    expect(otherDecade).toEqual({
      stem: '乙',
      branch: '亥',
      luCun: EARTHLY_BRANCHES.indexOf('卯'),
      qingYang: EARTHLY_BRANCHES.indexOf('辰'),
      tuoLuo: EARTHLY_BRANCHES.indexOf('寅'),
      tianMa: EARTHLY_BRANCHES.indexOf('巳'),
    });

    const otherYear = getGregorianYearFlow(2024);
    expect(otherYear).toEqual({
      stem: '甲',
      branch: '辰',
      luCun: EARTHLY_BRANCHES.indexOf('寅'),
      qingYang: EARTHLY_BRANCHES.indexOf('卯'),
      tuoLuo: EARTHLY_BRANCHES.indexOf('丑'),
      tianMa: EARTHLY_BRANCHES.indexOf('寅'),
    });

    const hiddenNatal = visibleColumnStars(result.palaces[6].stars, false);
    expect(hiddenNatal.map((star) => star.name)).toEqual(['天梁', '咸池']);
    expect(visibleColumnStars(result.palaces[6].stars, true).map((star) => star.name)).toEqual(['天梁', '祿存', '咸池']);

    const markers = layerMarkers(result, {
      showDecade: true,
      showYear: true,
      decadeIndex: 11,
      year: 2024,
    });
    const labelAt = (branch: string) => markers
      .filter((marker) => branchOf(marker.palaceIndex) === branch)
      .map((marker) => marker.label);

    expect(labelAt('卯')).toEqual(['大祿', '流羊']);
    expect(labelAt('辰')).toEqual(['大羊']);
    expect(labelAt('寅')).toEqual(['大陀', '流祿', '流馬']);
    expect(labelAt('巳')).toEqual(['大馬']);
    expect(labelAt('丑')).toEqual(['流陀']);
    expect(decadeSiHuaFor(result, 11)['天機']).toBe(SiHuaType.LU);
    expect(yearSiHuaFor(2024)['廉貞']).toBe(SiHuaType.LU);

    expect(result.palaces.map((palace) => palace.stars.map((star) => ({
      name: star.name,
      natal: star.scopeSiHua?.[Scope.NATAL] ?? null,
    })))).toEqual(natalStars);
    expect(result.decadeFlow?.branch).toBe('戌');
    expect(result.yearFlow.branch).toBe('午');
  });

  it('keeps the Gregorian year stem formula and derives the branch from the same epoch', () => {
    expect(HEAVENLY_STEMS[getGregorianYearStemIndex(2024)]).toBe('甲');
    expect(HEAVENLY_STEMS[getGregorianYearStemIndex(2026)]).toBe('丙');
    expect(HEAVENLY_STEMS[getGregorianYearStemIndex(3)]).toBe('癸');
    expect(EARTHLY_BRANCHES[getGregorianYearBranchIndex(2024)]).toBe('辰');
    expect(EARTHLY_BRANCHES[getGregorianYearBranchIndex(2026)]).toBe('午');
    expect(EARTHLY_BRANCHES[getGregorianYearBranchIndex(3)]).toBe('亥');
    expect(getFlowStarPositions('不', '存')).toBeNull();
  });
});
