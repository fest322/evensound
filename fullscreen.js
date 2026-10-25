// Сообщает расширению, когда страница входит в полноэкранный режим и выходит из него.
// Плееры во фреймах тоже ловятся: событие доходит до документа верхнего уровня.
// Скрипт могут внедрить повторно (после перезапуска расширения) — старый обработчик снимаем.

document.removeEventListener('fullscreenchange', globalThis.__evensoundOnFullscreen ?? (() => {}));

globalThis.__evensoundOnFullscreen = () => {
  try {
    chrome.runtime.sendMessage({ target: 'background', type: 'fullscreen', on: Boolean(document.fullscreenElement) }).catch(() => {});
  } catch {
    // Расширение перезапустили, этот экземпляр скрипта больше не нужен.
  }
};

document.addEventListener('fullscreenchange', globalThis.__evensoundOnFullscreen);
