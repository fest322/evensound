// Маршрутизатор: popup ⇄ offscreen-документ, где живёт обработка звука.
// Сервис-воркер может засыпать, поэтому состояние вкладок хранится в offscreen.

async function hasOffscreen() {
  const contexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] });
  return contexts.length > 0;
}

async function ensureOffscreen() {
  if (await hasOffscreen()) return;
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['USER_MEDIA'],
    justification: 'Обработка звука захваченной вкладки',
  });
}

function toOffscreen(msg) {
  return chrome.runtime.sendMessage({ ...msg, target: 'offscreen' });
}

function setBadge(tabId, on) {
  chrome.action.setBadgeText({ tabId, text: on ? 'ON' : '' }).catch(() => {});
  if (on) chrome.action.setBadgeBackgroundColor({ tabId, color: '#2e7d32' }).catch(() => {});
}

// Пока вкладка захвачена, Chrome разворачивает видео только на размер вкладки.
// Поэтому, когда страница уходит в полноэкранный режим, разворачиваем на весь экран само окно,
// а при выходе возвращаем окну прежнее состояние.
async function watchFullscreen(tabId) {
  await chrome.scripting.executeScript({ target: { tabId }, files: ['fullscreen.js'] }).catch(() => {});
}

async function onPageFullscreen(tab, on) {
  const key = `fs:${tab.windowId}`;
  if (on) {
    const status = await handle({ type: 'status', tabId: tab.id });
    if (!status?.active) return;
    const win = await chrome.windows.get(tab.windowId);
    if (win.state === 'fullscreen') return;
    await chrome.storage.session.set({ [key]: win.state });
    await chrome.windows.update(tab.windowId, { state: 'fullscreen' });
  } else {
    const { [key]: prev } = await chrome.storage.session.get(key);
    if (!prev) return;
    await chrome.storage.session.remove(key);
    await chrome.windows.update(tab.windowId, { state: prev });
  }
}

async function handle(msg, sender) {
  switch (msg.type) {
    case 'start': {
      await ensureOffscreen();
      const res = await toOffscreen({ type: 'start', tabId: msg.tabId, streamId: msg.streamId, params: msg.params });
      if (!res?.error) {
        setBadge(msg.tabId, true);
        watchFullscreen(msg.tabId);
      }
      return res;
    }
    case 'stop':
      if (await hasOffscreen()) await toOffscreen({ type: 'stop', tabId: msg.tabId });
      setBadge(msg.tabId, false);
      return { ok: true };
    case 'params':
      if (await hasOffscreen()) await toOffscreen({ type: 'params', params: msg.params });
      return { ok: true };
    case 'status':
      if (!(await hasOffscreen())) return { active: false };
      return toOffscreen({ type: 'status', tabId: msg.tabId });
    case 'watch':
      await watchFullscreen(msg.tabId);
      return { ok: true };
    case 'fullscreen':
      if (sender?.tab) await onPageFullscreen(sender.tab, msg.on);
      return { ok: true };
    case 'ended':
      setBadge(msg.tabId, false);
      return { ok: true };
  }
  return { error: `неизвестная команда ${msg.type}` };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.target !== 'background') return false;
  handle(msg, sender).then(sendResponse, (err) => sendResponse({ error: String(err?.message ?? err) }));
  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  handle({ type: 'stop', tabId });
});
