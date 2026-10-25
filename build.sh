#!/usr/bin/env bash
# Собирает ZIP для Chrome Web Store: только файлы расширения, без тестов и служебных файлов.
set -euo pipefail
cd "$(dirname "$0")"

FILES=(
  manifest.json
  _locales
  i18n.js
  background.js
  offscreen.html offscreen.js
  popup.html popup.css popup.js
  worklet.js dsp.js presets.js
  icons/icon16.png icons/icon48.png icons/icon128.png
)

npm test --silent

version=$(node -p "require('./manifest.json').version")
mkdir -p dist
out="dist/evensound-${version}.zip"
rm -f "$out"
zip -q -X -r "$out" "${FILES[@]}"
echo "Готово: $out"
unzip -l "$out"
