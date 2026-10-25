import { LevelerDSP } from './dsp.js';

class LevelerProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.dsp = new LevelerDSP(sampleRate, options.processorOptions?.params);
    this.framesSinceMeter = 0;
    this.port.onmessage = (e) => {
      if (e.data.type === 'params') this.dsp.setParams(e.data.params);
    };
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const [outL, outR] = outputs[0];
    if (!input || input.length === 0) {
      outL.fill(0);
      outR.fill(0);
      return true;
    }
    this.dsp.process(input[0], input[1] ?? input[0], outL, outR);

    this.framesSinceMeter += outL.length;
    if (this.framesSinceMeter >= sampleRate / 10) {
      this.framesSinceMeter = 0;
      this.port.postMessage({ type: 'meter', ...this.dsp.meter() });
    }
    return true;
  }
}

registerProcessor('evensound', LevelerProcessor);
