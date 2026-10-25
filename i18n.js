// Переводы интерфейса. Тексты лежат в _locales (их же читает Chrome для манифеста),
// но грузим их сами, чтобы язык можно было сменить в popup, а не только в настройках браузера.

export const LANGUAGES = {
  ru: 'Русский',
  en: 'English',
  es: 'Español',
  pt_BR: 'Português',
  fr: 'Français',
  de: 'Deutsch',
};

let messages = {};

export function resolveLang(choice) {
  if (choice && choice !== 'auto' && LANGUAGES[choice]) return choice;
  const browser = chrome.i18n.getUILanguage().replace('-', '_');
  if (LANGUAGES[browser]) return browser;
  const base = browser.split('_')[0];
  if (base === 'pt') return 'pt_BR';
  return LANGUAGES[base] ? base : 'en';
}

export async function loadMessages(lang) {
  const res = await fetch(chrome.runtime.getURL(`_locales/${lang}/messages.json`));
  messages = await res.json();
  document.documentElement.lang = lang.replace('_', '-');
}

export function t(key, vars = {}) {
  const text = messages[key]?.message ?? key;
  return text.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? '');
}

export function translatePage(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
}
