import { DEFAULT_PARAMS } from './dsp.js';

// Пресет задаёт положение ползунков и скрытые параметры обработки.
// Названия и описания — ключи переводов из _locales.
export const PRESETS = {
  soft: {
    labelKey: 'preset_soft',
    descKey: 'preset_soft_desc',
    ui: { boost: 8, clarity: 0 },
    base: { levelerAmount: 0.7, compOffsetDb: 10, compRatio: 2, levelerReleaseSec: 2.5 },
  },
  cinema: {
    labelKey: 'preset_cinema',
    descKey: 'preset_cinema_desc',
    ui: { boost: 15, clarity: 50 },
    base: {},
  },
  night: {
    labelKey: 'preset_night',
    descKey: 'preset_night_desc',
    ui: { boost: 20, clarity: 80 },
    base: { levelerAmount: 1, targetDb: -22, compOffsetDb: 3, compRatio: 8, levelerAttackSec: 0.2, levelerReleaseSec: 1.0 },
  },
};

export const DEFAULT_UI = { preset: 'cinema', ...PRESETS.cinema.ui, volume: 0, lang: 'auto', tuningOpen: false };

export function isPresetModified(ui) {
  const preset = PRESETS[ui.preset] ?? PRESETS.cinema;
  return ui.boost !== preset.ui.boost || ui.clarity !== preset.ui.clarity;
}

export function buildParams(ui, bypass = false) {
  const preset = PRESETS[ui.preset] ?? PRESETS.cinema;
  const clarity = ui.clarity / 100;
  return {
    ...DEFAULT_PARAMS,
    ...preset.base,
    maxBoostDb: ui.boost,
    sideGain: 1 - 0.6 * clarity,
    dialogEqDb: 6 * clarity,
    outputDb: ui.volume,
    bypass,
  };
}
