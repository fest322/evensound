// Обработка звука фильма: фокус на речи, медленное выравнивание громкости,
// компрессор и лимитер с предпросмотром. Без зависимостей от браузера,
// чтобы тот же код работал в AudioWorklet и в тестах под Node.

export const DEFAULT_PARAMS = {
  bypass: false,
  targetDb: -20,          // к какому среднему уровню тянуть звук (RMS, дБFS)
  levelerAmount: 0.85,    // доля разницы с targetDb, которую убирает выравнивание (1 — полностью)
  maxBoostDb: 15,         // насколько максимум поднимать тихие сцены
  maxCutDb: 25,           // насколько максимум опускать громкие
  gateDb: -50,            // тише этого — пауза/тишина, усиление не трогаем
  levelerAttackSec: 0.3,  // как быстро убавлять, когда стало громко
  levelerReleaseSec: 1.5, // как быстро прибавлять, когда стало тихо
  levelerRiseDbPerSec: 12, // минимальная скорость подъёма, если речь сильно ниже цели
  compOffsetDb: 6,        // порог компрессора относительно targetDb
  compRatio: 4,
  sideGain: 0.7,          // <1 приглушает «боковые» звуки, речь в центре выходит вперёд
  dialogEqDb: 3,          // подъём полосы разборчивости речи (~2.5 кГц) в центре
  outputDb: 0,
  ceilingDb: -1,          // выше этого уровня сигнал не пропускается никогда
};

const dbToLin = (db) => Math.pow(10, db / 20);
const linToDb = (lin) => 20 * Math.log10(lin + 1e-12);
const timeCoef = (sec, fs) => 1 - Math.exp(-1 / (sec * fs));

class Biquad {
  constructor() {
    this.b0 = 1; this.b1 = 0; this.b2 = 0; this.a1 = 0; this.a2 = 0;
    this.z1 = 0; this.z2 = 0;
  }

  setHighpass(fs, freq, q) {
    const w0 = 2 * Math.PI * freq / fs;
    const cos = Math.cos(w0);
    const alpha = Math.sin(w0) / (2 * q);
    const a0 = 1 + alpha;
    this.b0 = (1 + cos) / 2 / a0;
    this.b1 = -(1 + cos) / a0;
    this.b2 = (1 + cos) / 2 / a0;
    this.a1 = -2 * cos / a0;
    this.a2 = (1 - alpha) / a0;
  }

  setPeaking(fs, freq, q, gainDb) {
    const A = Math.pow(10, gainDb / 40);
    const w0 = 2 * Math.PI * freq / fs;
    const cos = Math.cos(w0);
    const alpha = Math.sin(w0) / (2 * q);
    const a0 = 1 + alpha / A;
    this.b0 = (1 + alpha * A) / a0;
    this.b1 = -2 * cos / a0;
    this.b2 = (1 - alpha * A) / a0;
    this.a1 = -2 * cos / a0;
    this.a2 = (1 - alpha / A) / a0;
  }

  process(x) {
    const y = this.b0 * x + this.z1;
    this.z1 = this.b1 * x - this.a1 * y + this.z2;
    this.z2 = this.b2 * x - this.a2 * y;
    return y;
  }
}

export class LevelerDSP {
  constructor(sampleRate, params = {}) {
    this.fs = sampleRate;

    this.dialogEq = new Biquad();
    this.detectHpL = new Biquad();
    this.detectHpR = new Biquad();
    this.detectHpL.setHighpass(this.fs, 60, 0.707);
    this.detectHpR.setHighpass(this.fs, 60, 0.707);

    // Уровень для выравнивания: средняя мощность в скользящем окне 0.4 с
    // из блоков по 10 мс. Окно, а не экспонента: громкий бой полностью
    // уходит из оценки через 0.4 с, и речь после него поднимается быстро.
    this.blockLen = Math.round(0.01 * this.fs);
    this.blockSums = new Float64Array(40);
    this.blockIndex = 0;
    this.blockAcc = 0;
    this.blockFill = 0;
    this.windowSum = 0;
    this.meanSquare = 0;
    this.levelDb = -120;
    this.levelerGainDb = 0;

    this.compAtt = timeCoef(0.005, this.fs);
    this.compRel = timeCoef(0.2, this.fs);
    this.compEnv = 0;
    this.compGrDb = 0;

    // Лимитер видит сигнал на 5 мс вперёд и успевает плавно убавить перед пиком.
    this.lookahead = Math.round(0.005 * this.fs);
    this.delayL = new Float32Array(this.lookahead + 1);
    this.delayR = new Float32Array(this.lookahead + 1);
    this.delayPos = 0;
    const cap = this.lookahead + 2;
    this.dqVal = new Float32Array(cap);
    this.dqPos = new Float64Array(cap);
    this.dqHead = 0;
    this.dqLen = 0;
    this.sampleIndex = 0;
    this.limGain = 1;
    this.limAtt = timeCoef(this.lookahead / 3 / this.fs, this.fs);
    this.limRel = timeCoef(0.1, this.fs);

    // Средняя громкость входа и выхода за последние ~3 с: по ней оригинал
    // при сравнении играет на той же громкости, что и обработанный звук.
    this.matchCoef = timeCoef(3, this.fs);
    this.matchIn = 0;
    this.matchOut = 0;

    this.setParams(params);
  }

  setParams(params) {
    this.p = { ...DEFAULT_PARAMS, ...this.p, ...params };
    const p = this.p;
    this.dialogEq.setPeaking(this.fs, 2500, 0.8, p.dialogEqDb);
    this.levAtt = timeCoef(p.levelerAttackSec, this.fs);
    this.levRel = timeCoef(p.levelerReleaseSec, this.fs);
    this.levRiseStep = p.levelerRiseDbPerSec / this.fs;
    this.outputLin = dbToLin(p.outputDb);
    this.ceilingLin = dbToLin(p.ceilingDb);
  }

  meter() {
    return {
      inputDb: this.levelDb,
      levelerGainDb: this.levelerGainDb,
      compGrDb: this.compGrDb,
      limiterGrDb: linToDb(this.limGain),
      bypass: this.p.bypass,
    };
  }

  process(inL, inR, outL, outR) {
    const p = this.p;
    if (p.bypass) {
      // Оригинал без обработки, но на той же средней громкости — сравнивается характер звука,
      // а не «что громче». Лимитер оставляем только как защиту от перегруза.
      const g = this.matchIn > 1e-10 ? Math.sqrt(this.matchOut / this.matchIn) : 1;
      const matchGain = Math.min(dbToLin(24), Math.max(dbToLin(-24), g));
      for (let i = 0; i < inL.length; i++) this.limit(inL[i] * matchGain, inR[i] * matchGain, outL, outR, i);
      return;
    }

    const compThreshDb = p.targetDb + p.compOffsetDb;
    const compSlope = 1 / p.compRatio - 1;
    const knee = 6;

    for (let i = 0; i < inL.length; i++) {
      // 1. Речь в фильмах почти всегда в центре: середину подчёркиваем, края приглушаем.
      let mid = (inL[i] + inR[i]) * 0.5;
      const side = (inL[i] - inR[i]) * 0.5 * p.sideGain;
      mid = this.dialogEq.process(mid);
      let l = mid + side;
      let r = mid - side;

      // 2. Медленное выравнивание: тянем средний уровень к targetDb.
      const hl = this.detectHpL.process(l);
      const hr = this.detectHpR.process(r);
      this.blockAcc += (hl * hl + hr * hr) * 0.5;
      if (++this.blockFill === this.blockLen) {
        const n = this.blockSums.length;
        this.windowSum += this.blockAcc - this.blockSums[this.blockIndex];
        this.blockSums[this.blockIndex] = this.blockAcc;
        this.blockIndex = (this.blockIndex + 1) % n;
        this.meanSquare = Math.max(0, this.windowSum) / (n * this.blockLen);
        this.levelDb = 10 * Math.log10(this.meanSquare + 1e-12);
        this.blockAcc = 0;
        this.blockFill = 0;
      }
      if (this.levelDb > p.gateDb) {
        const wanted = Math.min(p.maxBoostDb, Math.max(-p.maxCutDb, (p.targetDb - this.levelDb) * p.levelerAmount));
        const diff = wanted - this.levelerGainDb;
        if (diff < 0) {
          this.levelerGainDb += diff * this.levAtt;
        } else {
          // После боя речь сильно ниже цели — поднимаем не медленнее заданной скорости.
          const minStep = diff > 6 ? this.levRiseStep : 0;
          this.levelerGainDb += Math.min(diff, Math.max(diff * this.levRel, minStep));
        }
      }
      const levGain = dbToLin(this.levelerGainDb);
      l *= levGain;
      r *= levGain;

      // 3. Компрессор ловит то, что выравниватель не успел: выстрелы, удары.
      const peak = Math.max(Math.abs(l), Math.abs(r));
      this.compEnv += (peak - this.compEnv) * (peak > this.compEnv ? this.compAtt : this.compRel);
      const over = linToDb(this.compEnv) - compThreshDb;
      let gr = 0;
      if (over >= knee / 2) gr = compSlope * over;
      else if (over > -knee / 2) gr = compSlope * (over + knee / 2) ** 2 / (2 * knee);
      this.compGrDb = gr;
      const g = dbToLin(gr) * this.outputLin;
      l *= g;
      r *= g;

      this.limit(l, r, outL, outR, i);

      const mc = this.matchCoef;
      this.matchIn += ((inL[i] * inL[i] + inR[i] * inR[i]) - this.matchIn) * mc;
      this.matchOut += ((outL[i] * outL[i] + outR[i] * outR[i]) - this.matchOut) * mc;
    }
  }

  // 4. Лимитер с предпросмотром: минимум нужного усиления за окно N+1 сэмплов.
  limit(l, r, outL, outR, i) {
    const N = this.lookahead;
    const cap = this.dqVal.length;
    const absPeak = Math.max(Math.abs(l), Math.abs(r));
    const required = absPeak > this.ceilingLin ? this.ceilingLin / absPeak : 1;
    const t = this.sampleIndex++;
    while (this.dqLen > 0 && this.dqVal[(this.dqHead + this.dqLen - 1) % cap] >= required) this.dqLen--;
    const tail = (this.dqHead + this.dqLen) % cap;
    this.dqVal[tail] = required;
    this.dqPos[tail] = t;
    this.dqLen++;
    while (this.dqPos[this.dqHead] < t - N) {
      this.dqHead = (this.dqHead + 1) % cap;
      this.dqLen--;
    }
    const target = this.dqVal[this.dqHead];
    this.limGain += (target - this.limGain) * (target < this.limGain ? this.limAtt : this.limRel);

    this.delayL[this.delayPos] = l;
    this.delayR[this.delayPos] = r;
    this.delayPos = (this.delayPos + 1) % this.delayL.length;
    const dl = this.delayL[this.delayPos] * this.limGain;
    const dr = this.delayR[this.delayPos] * this.limGain;
    const c = this.ceilingLin;
    outL[i] = dl > c ? c : dl < -c ? -c : dl;
    outR[i] = dr > c ? c : dr < -c ? -c : dr;
  }
}
