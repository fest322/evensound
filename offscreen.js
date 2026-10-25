// Захват звука вкладки и обработка через AudioWorklet.
// Пока вкладка захвачена, Chrome сам глушит её прямой звук,
// поэтому слышно только обработанный вариант — без эха и задвоения.

const sessions = new Map(); // tabId -> { ctx, stream, node, meter }

async function start(tabId, streamId, params) {
  stop(tabId);
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } },
    video: false,
  });

  // Сессию регистрируем сразу: если дальше что-то упадёт, stop() отпустит захват,
  // иначе вкладка останется захваченной и без звука.
  const ctx = new AudioContext({ latencyHint: 'interactive' });
  const session = { ctx, stream, node: null, meter: null };
  sessions.set(tabId, session);
  try {
    await ctx.audioWorklet.addModule('worklet.js');
    const source = ctx.createMediaStreamSource(stream);
    session.node = new AudioWorkletNode(ctx, 'evensound', {
      numberOfInputs: 1,
      numberOfOutputs: 1,
      outputChannelCount: [2],
      channelCount: 2,
      channelCountMode: 'explicit',
      channelInterpretation: 'speakers',
      processorOptions: { params },
    });
    source.connect(session.node).connect(ctx.destination);
    await ctx.resume();
  } catch (err) {
    stop(tabId);
    throw err;
  }

  session.node.port.onmessage = (e) => {
    if (e.data.type === 'meter') session.meter = e.data;
  };
  for (const track of stream.getAudioTracks()) {
    track.addEventListener('ended', () => {
      stop(tabId);
      chrome.runtime.sendMessage({ target: 'background', type: 'ended', tabId });
    });
  }
}

function stop(tabId) {
  const session = sessions.get(tabId);
  if (!session) return;
  sessions.delete(tabId);
  session.stream.getTracks().forEach((t) => t.stop());
  session.ctx.close();
}

async function handle(msg) {
  switch (msg.type) {
    case 'start':
      await start(msg.tabId, msg.streamId, msg.params);
      return { ok: true };
    case 'stop':
      stop(msg.tabId);
      return { ok: true };
    case 'params':
      for (const s of sessions.values()) s.node?.port.postMessage({ type: 'params', params: msg.params });
      return { ok: true };
    case 'status': {
      const s = sessions.get(msg.tabId);
      return { active: Boolean(s), meter: s?.meter ?? null, latencyMs: s ? Math.round((s.ctx.baseLatency + (s.ctx.outputLatency || 0)) * 1000) : null };
    }
  }
  return { error: `неизвестная команда ${msg.type}` };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.target !== 'offscreen') return false;
  handle(msg).then(sendResponse, (err) => sendResponse({ error: String(err?.message ?? err) }));
  return true;
});
