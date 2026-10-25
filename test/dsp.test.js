// Синтетический «фильм»: тихий диалог → громкий бой → снова диалог.
// Проверяем, что после обработки разброс громкости сильно меньше, пиков нет,
// а речь после боя быстро возвращается к нормальному уровню.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LevelerDSP } from '../dsp.js';
import { buildParams, DEFAULT_UI, PRESETS } from '../presets.js';

const FS = 48000;

function rand(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32 * 2 - 1;
  };
}

function makeMovie() {
  const sec = (s) => Math.round(s * FS);
  const parts = [
    { kind: 'dialog', len: sec(8), rmsDb: -36 },
    { kind: 'battle', len: sec(8), rmsDb: -8 },
    { kind: 'dialog', len: sec(8), rmsDb: -36 },
  ];
  const total = parts.reduce((a, p) => a + p.len, 0);
  const L = new Float32Array(total);
  const R = new Float32Array(total);
  const rnd = rand(42);
  let pos = 0;
  for (const p of parts) {
    const amp = Math.pow(10, p.rmsDb / 20) * Math.sqrt(3);
    for (let i = 0; i < p.len; i++) {
      const t = (pos + i) / FS;
      if (p.kind === 'dialog') {
        // Речь в центре, слоги ~4 раза в секунду, лёгкий фон по краям.
        const syllable = 0.5 + 0.5 * Math.sin(2 * Math.PI * 4 * t);
        const voice = amp * syllable * rnd() * 1.4;
        L[pos + i] = voice + amp * 0.05 * rnd();
        R[pos + i] = voice + amp * 0.05 * rnd();
      } else {
        // Бой: широкий шум по краям плюс резкие выстрелы каждые 0.7 с.
        const shot = ((pos + i) % sec(0.7)) < sec(0.03) ? 4 : 1;
        L[pos + i] = amp * shot * rnd();
        R[pos + i] = amp * shot * rnd();
      }
    }
    pos += p.len;
  }
  return { L, R };
}

function run(params) {
  const { L, R } = makeMovie();
  const dsp = new LevelerDSP(FS, params);
  const outL = new Float32Array(L.length);
  const outR = new Float32Array(R.length);
  const block = 128;
  for (let i = 0; i < L.length; i += block) {
    const end = Math.min(i + block, L.length);
    dsp.process(L.subarray(i, end), R.subarray(i, end), outL.subarray(i, end), outR.subarray(i, end));
  }
  return { inL: L, inR: R, outL, outR };
}

function rmsDb(L, R, fromSec, toSec) {
  let sum = 0;
  const a = Math.round(fromSec * FS);
  const b = Math.round(toSec * FS);
  for (let i = a; i < b; i++) sum += (L[i] * L[i] + R[i] * R[i]) / 2;
  return 10 * Math.log10(sum / (b - a) + 1e-12);
}

const cinema = buildParams(DEFAULT_UI);

test('разница между диалогом и боем сильно сокращается', () => {
  const { inL, inR, outL, outR } = run(cinema);
  const inDialog = rmsDb(inL, inR, 4, 8);
  const inBattle = rmsDb(inL, inR, 10, 16);
  const outDialog = rmsDb(outL, outR, 4, 8);
  const outBattle = rmsDb(outL, outR, 10, 16);
  console.log(`  вход:  диалог ${inDialog.toFixed(1)} дБ, бой ${inBattle.toFixed(1)} дБ, разница ${(inBattle - inDialog).toFixed(1)}`);
  console.log(`  выход: диалог ${outDialog.toFixed(1)} дБ, бой ${outBattle.toFixed(1)} дБ, разница ${(outBattle - outDialog).toFixed(1)}`);
  assert.ok(inBattle - inDialog > 25);
  assert.ok(outBattle - outDialog < 8, 'бой должен быть не более чем на 8 дБ громче диалога');
  assert.ok(outDialog > -26, 'диалог должен подняться ближе к целевому уровню');
});

test('выход никогда не превышает потолок лимитера', () => {
  const { outL, outR } = run(cinema);
  const ceiling = Math.pow(10, cinema.ceilingDb / 20);
  let peak = 0;
  for (let i = 0; i < outL.length; i++) peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]));
  assert.ok(peak <= ceiling + 1e-6, `пик ${peak} выше потолка ${ceiling}`);
});

test('после боя речь возвращается к нормальной громкости за пару секунд', () => {
  const { outL, outR } = run(cinema);
  const settled = rmsDb(outL, outR, 21, 24);
  const afterBattle = rmsDb(outL, outR, 18.5, 19.5);
  console.log(`  диалог через 2.5 с после боя ${afterBattle.toFixed(1)} дБ, установившийся ${settled.toFixed(1)} дБ`);
  assert.ok(settled - afterBattle < 4);
});

test('оригинал при сравнении звучит на той же громкости, что и обработанный', () => {
  const { L, R } = makeMovie();
  const dsp = new LevelerDSP(FS, cinema);
  const outL = new Float32Array(L.length);
  const outR = new Float32Array(R.length);
  const block = 128;
  const switchAt = 6 * FS; // 6 с тихого диалога с обработкой, потом держим «оригинал»
  for (let i = 0; i < 8 * FS; i += block) {
    if (i === switchAt) dsp.setParams({ bypass: true });
    dsp.process(L.subarray(i, i + block), R.subarray(i, i + block), outL.subarray(i, i + block), outR.subarray(i, i + block));
  }
  const processed = rmsDb(outL, outR, 4, 6);
  const original = rmsDb(outL, outR, 6.1, 8);
  const raw = rmsDb(L, R, 6.1, 8);
  console.log(`  обработанный ${processed.toFixed(1)} дБ, оригинал при сравнении ${original.toFixed(1)} дБ (без выравнивания был бы ${raw.toFixed(1)})`);
  assert.ok(Math.abs(processed - original) < 1.5);

  // Оригинал — это вход, умноженный на постоянный коэффициент (с задержкой лимитера), без обработки.
  const delay = Math.round(0.005 * FS);
  const i0 = Math.round(7 * FS);
  const ratio = outL[i0 + delay] / L[i0];
  for (let i = i0; i < i0 + 1000; i++) {
    if (Math.abs(L[i]) > 1e-3) assert.ok(Math.abs(outL[i + delay] / L[i] - ratio) < 1e-3);
  }
});

test('все пресеты дают ровный звук', () => {
  for (const [key, preset] of Object.entries(PRESETS)) {
    const { outL, outR } = run(buildParams({ ...DEFAULT_UI, preset: key, ...preset.ui }));
    const diff = rmsDb(outL, outR, 10, 16) - rmsDb(outL, outR, 4, 8);
    console.log(`  ${key}: бой громче диалога на ${diff.toFixed(1)} дБ`);
    assert.ok(diff < 15);
  }
});

test('обработка быстрее реального времени с большим запасом', () => {
  const dsp = new LevelerDSP(FS, cinema);
  const L = new Float32Array(128).map(() => Math.random() * 0.1);
  const out = new Float32Array(128);
  const blocks = Math.round(60 * FS / 128);
  const start = performance.now();
  for (let i = 0; i < blocks; i++) dsp.process(L, L, out, out);
  const ms = performance.now() - start;
  console.log(`  минута звука обработана за ${ms.toFixed(0)} мс`);
  assert.ok(ms < 3000);
});
