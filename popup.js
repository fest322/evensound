import { PRESETS, DEFAULT_UI, buildParams, isPresetModified } from './presets.js';
import { LANGUAGES, resolveLang, loadMessages, t, translatePage } from './i18n.js';

const $ = (id) => document.getElementById(id);
const toBackground = (msg) => chrome.runtime.sendMessage({ ...msg, target: 'background' });
const signed = (n) => (n > 0 ? `+${n}` : `${n}`);
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

let ui = { ...DEFAULT_UI };
let tab;
let active = false;
let comparing = false;

function renderPower() {
  document.body.classList.toggle('is-on', active);
  $('power').setAttribute('aria-checked', String(active));
  $('status').textContent = active ? t('status_on') : t('status_off');
  $('statusHint').textContent = active ? t('status_hint_on') : t('status_hint_off');
  $('now').hidden = !active;
}

function render() {
  renderPower();
  const modified = isPresetModified(ui);
  for (const btn of $('modes').children) {
    const selected = btn.dataset.key === ui.preset;
    btn.setAttribute('aria-checked', String(selected));
    btn.querySelector('.mode-badge').textContent = selected && modified ? t('preset_modified') : '';
  }
  $('boost').value = ui.boost;
  $('clarity').value = ui.clarity;
  $('volume').value = ui.volume;
  $('boostVal').textContent = ui.boost === 0 ? t('boost_off') : t('boost_value', { n: ui.boost });
  $('clarityVal').textContent = `${ui.clarity}%`;
  $('volumeVal').textContent = t('volume_value', { n: signed(ui.volume) });
  $('reset').disabled = !modified;
  $('tuning').open = ui.tuningOpen;
  $('compare').textContent = comparing ? t('compare_active') : t('compare_hold');
  $('compare').classList.toggle('active', comparing);
}

function sendParams() {
  return toBackground({ type: 'params', params: buildParams(ui, comparing) });
}

async function saveUi() {
  render();
  await chrome.storage.local.set({ ui });
  await sendParams();
}

function setComparing(on) {
  if (comparing === on) return;
  comparing = on;
  render();
  sendParams();
}

function showError(text) {
  $('error').textContent = text ?? '';
  $('reloadTab').hidden = true;
}

async function startCapture() {
  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
  const res = await toBackground({ type: 'start', tabId: tab.id, streamId, params: buildParams(ui) });
  if (res?.error) throw new Error(res.error);
}

let busy = false;

async function togglePower() {
  if (busy) return;
  busy = true;
  $('power').disabled = true;
  showError();
  try {
    if (active) {
      await toBackground({ type: 'stop', tabId: tab.id });
      active = false;
      return;
    }
    try {
      await startCapture();
    } catch (err) {
      if (!/active stream/i.test(err.message)) throw err;
      // Вкладку держит наш же прошлый захват — снимаем его и пробуем ещё раз.
      await toBackground({ type: 'stop', tabId: tab.id });
      await new Promise((r) => setTimeout(r, 300));
      await startCapture();
    }
    active = true;
  } catch (err) {
    if (/active stream/i.test(err.message)) {
      // Chrome иногда считает вкладку захваченной после перезапуска расширения — помогает только перезагрузка вкладки.
      showError(t('error_busy'));
      $('reloadTab').hidden = false;
    } else if (/chrome pages|chrome:\/\/|webstore|cannot be captured/i.test(err.message)) {
      showError(t('error_restricted'));
    } else {
      showError(t('error_capture', { msg: err.message }));
    }
  } finally {
    busy = false;
    $('power').disabled = false;
    render();
  }
}

const dbToPercent = (db) => clamp((db + 60) / 60 * 100, 0, 100);

function renderMeter(m) {
  if (!m) {
    $('barIn').style.width = '0';
    $('barOut').style.width = '0';
    $('state').textContent = t('state_waiting');
    return;
  }
  const silent = m.inputDb < -60;
  const change = m.bypass ? 0 : m.levelerGainDb + m.compGrDb + m.limiterGrDb;
  const outDb = m.inputDb + change + (m.bypass ? 0 : ui.volume);
  $('barIn').style.width = `${dbToPercent(m.inputDb)}%`;
  $('barOut').style.width = `${dbToPercent(outDb)}%`;

  if (m.bypass) $('state').textContent = t('compare_active');
  else if (silent) $('state').textContent = t('state_silence');
  else if (Math.abs(change) < 3) $('state').textContent = t('state_even');
  else {
    // «Тихая/громкая сцена» — только при заметной правке; до 8 дБ это лёгкая подстройка.
    const n = Math.round(Math.abs(change));
    const key = change > 0 ? (n > 8 ? 'state_raise' : 'state_raise_slight') : (n > 8 ? 'state_lower' : 'state_lower_slight');
    $('state').textContent = t(key, { n });
  }
}

async function refresh() {
  const status = await toBackground({ type: 'status', tabId: tab.id });
  const wasActive = active;
  active = Boolean(status?.active);
  if (wasActive !== active) render();
  if (active) renderMeter(status.meter);
}

function buildModes() {
  $('modes').replaceChildren();
  for (const [key, preset] of Object.entries(PRESETS)) {
    const btn = document.createElement('button');
    btn.className = 'mode';
    btn.dataset.key = key;
    btn.setAttribute('role', 'radio');
    btn.innerHTML = '<span class="mode-name"></span><span class="mode-desc"></span><span class="mode-badge"></span>';
    btn.querySelector('.mode-name').textContent = t(preset.labelKey);
    btn.querySelector('.mode-desc').textContent = t(preset.descKey);
    btn.addEventListener('click', () => {
      ui = { ...ui, preset: key, ...preset.ui };
      saveUi();
    });
    $('modes').append(btn);
  }
}

function buildLanguages() {
  const select = $('lang');
  select.replaceChildren(new Option(t('lang_auto'), 'auto'));
  for (const [code, name] of Object.entries(LANGUAGES)) select.append(new Option(name, code));
  select.value = ui.lang;
}

async function applyLanguage() {
  await loadMessages(resolveLang(ui.lang));
  translatePage();
  buildModes();
  buildLanguages();
  render();
}

async function init() {
  [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const stored = await chrome.storage.local.get('ui');
  ui = { ...DEFAULT_UI, ...stored.ui };
  $('version').textContent = `v${chrome.runtime.getManifest().version}`;
  await applyLanguage();

  $('power').addEventListener('click', togglePower);
  $('reloadTab').addEventListener('click', async () => {
    await chrome.tabs.reload(tab.id);
    window.close();
  });

  for (const id of ['boost', 'clarity', 'volume']) {
    $(id).addEventListener('input', () => {
      ui[id] = Number($(id).value);
      saveUi();
    });
  }
  $('reset').addEventListener('click', () => {
    ui = { ...ui, ...PRESETS[ui.preset].ui };
    saveUi();
  });
  $('tuning').addEventListener('toggle', () => {
    ui.tuningOpen = $('tuning').open;
    chrome.storage.local.set({ ui });
  });
  $('lang').addEventListener('change', async () => {
    ui.lang = $('lang').value;
    await chrome.storage.local.set({ ui });
    applyLanguage();
  });

  // Сравнение работает, пока кнопку держат: отпустили — обработка снова включена.
  const compare = $('compare');
  compare.addEventListener('pointerdown', (e) => {
    compare.setPointerCapture(e.pointerId);
    setComparing(true);
  });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    compare.addEventListener(ev, () => setComparing(false));
  }
  compare.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      setComparing(true);
    }
  });
  compare.addEventListener('keyup', () => setComparing(false));
  window.addEventListener('blur', () => setComparing(false));

  await refresh();
  // Если popup закрыли, держа кнопку сравнения, обработка не должна остаться на паузе.
  if (active) sendParams();
  setInterval(refresh, 250);
}

init();
