# EvenSound — материалы для Chrome Web Store

Всё, что нужно вставить в Developer Dashboard. Файлы картинок лежат рядом:
`screenshots/`, `promo-440x280*.png`. ZIP — `dist/evensound-<версия>.zip`.

---

## Вкладка «Store listing»

**Краткое описание** — берётся из манифеста (`extDescription` в `_locales`), отдельно вводить не нужно.

**Category:** Tools (Инструменты). Альтернатива — Accessibility, если захотите делать упор на разборчивость речи.

**Language:** основной — English. Для остальных языков в Dashboard: «Add localization» → вставить подробное описание и скриншоты на этом языке.

**Иконка магазина:** `icons/icon128.png`
**Скриншоты (1280×800):** `screenshots/<язык>-1.png`, `-2.png`, `-3.png`
**Small promo tile (440×280):** `promo-440x280.png` (английская); для русской локализации — `promo-440x280-ru.png`

### Подробное описание — English

```
EvenSound evens out movie sound in your browser: loud scenes get quieter, conversations get louder. You can finally put the remote down.

WHY I MADE IT
My friends and I often watch movies from a laptop hooked up to the TV. With newer films it was always the same: people whisper, so you turn it up; a shootout starts, so you scramble to turn it down. Movies are mixed for cinemas, where the gap between quiet and loud is huge. At home it's just annoying. I wrote EvenSound so we could stop fighting with the remote.

HOW TO USE
1. Open the tab with your movie.
2. Click the EvenSound icon and flip the switch.
3. Set your TV volume once so you can hear the dialogue. From then on, EvenSound keeps the level steady on its own.

It works per tab, so other tabs are left alone. Shortcut: Alt+Shift+L.

MODES
Gentle: close to the original, just without the extremes. Good if you want to keep the punch of the action.
Cinema: the default. Action is noticeably quieter, dialogue is louder.
Night: almost flat. For when someone next door is asleep.

Want more control? Open "Fine-tuning" for three sliders: how much to lift quiet scenes, how far to bring voices forward, and overall volume.

To hear the difference, press and hold "Hold to hear the original". While you hold it, you hear the untouched sound at the same overall volume, so you compare how it sounds, not which is louder.

WHERE IT WORKS
Any site that plays sound in a tab: YouTube, streaming services, players embedded in web pages. EvenSound doesn't care which player a site uses, because it works with the sound of the whole tab.

It can't work on Chrome's own pages (chrome://) or in the Web Store. Some services with copy protection may not work either.

QUESTIONS
Why is there a capture icon on the tab?
That's how Chrome shows that the tab's sound is being processed. Nothing is recorded.

Why does fullscreen video stay inside the browser window?
While a tab's sound is being processed, Chrome shows fullscreen video inside the window. Press F11 (Ctrl+Cmd+F on Mac) to make the whole browser fullscreen.

It got quieter after I turned it on.
That's expected: the sound is brought to an even middle level. Raise "Overall volume" in Fine-tuning, or turn up the TV once.

After an update it says the tab's sound is busy.
Reload the tab and turn EvenSound on again.

PRIVACY
The sound is processed on your computer and never leaves it. EvenSound collects nothing: no accounts, no analytics, no ads. The tab capture permission is used only to get the sound of the tab where you turn it on.

FEEDBACK
If something sounds off or a site doesn't work, leave a review or write to support. I read everything.
```

### Подробное описание — Русский

```
EvenSound выравнивает громкость фильмов в браузере: громкие сцены становятся тише, разговоры — громче. Пульт можно отложить.

ЗАЧЕМ Я ЕГО СДЕЛАЛ
Мы с друзьями часто смотрим кино с ноутбука на телевизоре. В новых фильмах всегда одно и то же: герои шепчутся — прибавляешь звук, начинается перестрелка — хватаешься за пульт, чтобы убавить. Фильмы сводят для кинотеатров, где разница между тихим и громким огромная. Дома это просто мешает. EvenSound я написал, чтобы мы перестали воевать с пультом.

КАК ПОЛЬЗОВАТЬСЯ
1. Откройте вкладку с фильмом.
2. Нажмите на значок EvenSound и включите переключатель.
3. Один раз выставьте громкость телевизора так, чтобы было слышно речь. Дальше EvenSound держит уровень сам.

Включается отдельно для каждой вкладки, остальные вкладки не трогает. Горячая клавиша — Alt+Shift+L.

РЕЖИМЫ
Мягко — почти оригинальный звук, только без крайностей. Если хочется сохранить размах экшена.
Кино — режим по умолчанию. Экшен заметно тише, диалоги громче.
Ночь — звук почти ровный. Для просмотра, когда за стенкой кто-то спит.

Если хочется точнее, откройте «Тонкую настройку». Там три ползунка: насколько поднимать тихие сцены, насколько выводить голоса вперёд и общая громкость.

Чтобы услышать разницу, зажмите кнопку «Удерживайте, чтобы услышать оригинал». Пока держите, играет исходный звук на той же средней громкости — так сравнивается характер звука, а не «что громче».

ГДЕ РАБОТАЕТ
На любом сайте, где звук идёт из вкладки: YouTube, онлайн-кинотеатры, плееры, встроенные в страницу. Какой у сайта плеер, неважно: EvenSound работает со звуком всей вкладки.

Не работает на служебных страницах Chrome (chrome://) и в самом магазине. Некоторые сервисы с защитой от копирования тоже могут не работать.

ВОПРОСЫ
Почему у вкладки появился значок захвата?
Так Chrome показывает, что звук вкладки обрабатывается. Ничего не записывается.

Почему видео во весь экран открывается внутри окна?
Пока звук вкладки обрабатывается, Chrome разворачивает видео только в пределах окна. Нажмите F11 (на Mac — Ctrl+Cmd+F), и весь браузер станет полноэкранным.

После включения стало тише.
Так и задумано: звук приводится к ровному среднему уровню. Прибавьте «Общую громкость» в тонкой настройке или один раз прибавьте звук на телевизоре.

После обновления пишет, что звук вкладки занят.
Перезагрузите вкладку и включите EvenSound снова.

КОНФИДЕНЦИАЛЬНОСТЬ
Звук обрабатывается на вашем компьютере и никуда не уходит. EvenSound ничего не собирает: нет аккаунтов, аналитики и рекламы. Разрешение на захват вкладки нужно только для того, чтобы получить звук вкладки, на которой вы его включили.

ОБРАТНАЯ СВЯЗЬ
Если что-то звучит не так или не работает на каком-то сайте, оставьте отзыв или напишите в поддержку. Я читаю всё.
```

### Подробное описание — Español

```
EvenSound equilibra el sonido de las películas en tu navegador: las escenas ruidosas bajan y las conversaciones suben. Por fin puedes dejar el mando.

POR QUÉ LO HICE
Con mis amigos solemos ver películas desde un portátil conectado a la tele. Con las películas nuevas siempre pasaba lo mismo: los personajes susurran y subes el volumen; empieza un tiroteo y corres a bajarlo. Las películas se mezclan para el cine, donde la diferencia entre lo suave y lo fuerte es enorme. En casa solo molesta. Hice EvenSound para dejar de pelearnos con el mando.

CÓMO SE USA
1. Abre la pestaña con la película.
2. Pulsa el icono de EvenSound y activa el interruptor.
3. Ajusta una vez el volumen de la tele para oír bien los diálogos. A partir de ahí, EvenSound mantiene el nivel por su cuenta.

Funciona por pestaña, así que las demás no se tocan. Atajo: Alt+Shift+L.

MODOS
Suave: casi el sonido original, solo sin extremos. Para conservar la fuerza de la acción.
Cine: el modo por defecto. La acción baja bastante y los diálogos suben.
Noche: sonido casi plano. Para cuando alguien duerme en la habitación de al lado.

¿Quieres afinar más? Abre «Ajuste fino»: tres controles para cuánto subir las escenas tranquilas, cuánto adelantar las voces y el volumen general.

Para notar la diferencia, mantén pulsado «Mantén pulsado para oír el original». Mientras lo mantienes, suena el audio sin tocar al mismo volumen medio, así comparas cómo suena y no cuál es más alto.

DÓNDE FUNCIONA
En cualquier web que reproduzca sonido en una pestaña: YouTube, plataformas de streaming, reproductores integrados en páginas. Da igual qué reproductor use la web, porque EvenSound trabaja con el sonido de toda la pestaña.

No funciona en las páginas internas de Chrome (chrome://) ni en la Web Store. Algunos servicios con protección anticopia tampoco.

PREGUNTAS
¿Por qué aparece un icono de captura en la pestaña?
Es la forma en que Chrome indica que el sonido de la pestaña se está procesando. No se graba nada.

¿Por qué el vídeo a pantalla completa se queda dentro de la ventana?
Mientras se procesa el sonido de una pestaña, Chrome muestra la pantalla completa dentro de la ventana. Pulsa F11 (Ctrl+Cmd+F en Mac) para poner todo el navegador a pantalla completa.

Al activarlo suena más bajo.
Es normal: el sonido se lleva a un nivel medio estable. Sube «Volumen general» en el ajuste fino o sube una vez la tele.

Tras una actualización dice que el sonido de la pestaña está ocupado.
Recarga la pestaña y vuelve a activar EvenSound.

PRIVACIDAD
El sonido se procesa en tu ordenador y nunca sale de él. EvenSound no recopila nada: ni cuentas, ni analíticas, ni anuncios. El permiso de captura de pestaña solo sirve para obtener el sonido de la pestaña donde lo activas.

COMENTARIOS
Si algo no suena bien o una web no funciona, deja una reseña o escribe a soporte. Lo leo todo.
```

### Подробное описание — Português (Brasil)

```
O EvenSound equilibra o som dos filmes no navegador: cenas barulhentas ficam mais baixas, conversas ficam mais altas. Dá para largar o controle.

POR QUE EU FIZ
Eu e meus amigos costumamos ver filmes num notebook ligado à TV. Com os filmes novos era sempre igual: os personagens sussurram e você aumenta o volume; começa um tiroteio e você corre para abaixar. Filmes são mixados para o cinema, onde a diferença entre o baixo e o alto é enorme. Em casa isso só atrapalha. Fiz o EvenSound para a gente parar de brigar com o controle.

COMO USAR
1. Abra a aba com o filme.
2. Clique no ícone do EvenSound e ligue a chave.
3. Ajuste uma vez o volume da TV para ouvir bem os diálogos. Daí em diante, o EvenSound mantém o nível sozinho.

Funciona por aba, as outras abas não são afetadas. Atalho: Alt+Shift+L.

MODOS
Suave: quase o som original, só sem exageros. Para manter a força da ação.
Cinema: o modo padrão. A ação fica bem mais baixa e os diálogos mais altos.
Noite: som quase plano. Para quando alguém está dormindo no quarto ao lado.

Quer mais controle? Abra "Ajuste fino": três controles para quanto realçar cenas baixas, quanto trazer as vozes para frente e o volume geral.

Para ouvir a diferença, segure o botão "Segure para ouvir o original". Enquanto segura, toca o som sem alteração no mesmo volume médio, para comparar como soa e não qual é mais alto.

ONDE FUNCIONA
Em qualquer site que toque som numa aba: YouTube, serviços de streaming, players incorporados em páginas. Não importa o player do site, porque o EvenSound trabalha com o som da aba inteira.

Não funciona nas páginas internas do Chrome (chrome://) nem na Web Store. Alguns serviços com proteção contra cópia também podem não funcionar.

PERGUNTAS
Por que aparece um ícone de captura na aba?
É assim que o Chrome mostra que o som da aba está sendo processado. Nada é gravado.

Por que o vídeo em tela cheia fica dentro da janela?
Enquanto o som de uma aba é processado, o Chrome mostra a tela cheia dentro da janela. Pressione F11 (Ctrl+Cmd+F no Mac) para deixar o navegador inteiro em tela cheia.

Ficou mais baixo depois de ligar.
É esperado: o som é levado a um nível médio estável. Aumente "Volume geral" no ajuste fino ou aumente a TV uma vez.

Depois de uma atualização aparece que o som da aba está ocupado.
Recarregue a aba e ligue o EvenSound de novo.

PRIVACIDADE
O som é processado no seu computador e nunca sai dele. O EvenSound não coleta nada: sem contas, sem análises, sem anúncios. A permissão de captura de aba serve só para obter o som da aba onde você o liga.

FEEDBACK
Se algo soar estranho ou um site não funcionar, deixe uma avaliação ou escreva para o suporte. Eu leio tudo.
```

### Подробное описание — Français

```
EvenSound équilibre le son des films dans votre navigateur : les scènes bruyantes baissent, les conversations montent. Vous pouvez enfin poser la télécommande.

POURQUOI JE L'AI FAIT
Avec mes amis, on regarde souvent des films depuis un portable branché sur la télé. Avec les films récents, c'était toujours pareil : les personnages chuchotent, on monte le son ; une fusillade commence, on se précipite pour baisser. Les films sont mixés pour le cinéma, où l'écart entre le calme et le fort est énorme. À la maison, c'est juste pénible. J'ai écrit EvenSound pour qu'on arrête de se battre avec la télécommande.

COMMENT L'UTILISER
1. Ouvrez l'onglet avec votre film.
2. Cliquez sur l'icône EvenSound et activez l'interrupteur.
3. Réglez une fois le volume de la télé pour bien entendre les dialogues. Ensuite, EvenSound maintient le niveau tout seul.

Il fonctionne onglet par onglet, les autres onglets ne sont pas touchés. Raccourci : Alt+Maj+L.

MODES
Doux : presque le son d'origine, juste sans les excès. Pour garder le punch de l'action.
Cinéma : le mode par défaut. L'action baisse nettement, les dialogues montent.
Nuit : son presque plat. Pour quand quelqu'un dort dans la pièce d'à côté.

Envie de plus de contrôle ? Ouvrez « Réglages fins » : trois curseurs pour relever les passages calmes, mettre les voix en avant et régler le volume général.

Pour entendre la différence, maintenez le bouton « Maintenez pour écouter l'original ». Tant que vous le maintenez, vous entendez le son intact au même volume moyen : on compare le rendu, pas lequel est le plus fort.

OÙ ÇA MARCHE
Sur tout site qui joue du son dans un onglet : YouTube, services de streaming, lecteurs intégrés aux pages. Peu importe le lecteur du site : EvenSound travaille sur le son de tout l'onglet.

Il ne fonctionne pas sur les pages internes de Chrome (chrome://) ni dans le Chrome Web Store. Certains services protégés contre la copie peuvent aussi ne pas fonctionner.

QUESTIONS
Pourquoi une icône de capture apparaît sur l'onglet ?
C'est ainsi que Chrome indique que le son de l'onglet est traité. Rien n'est enregistré.

Pourquoi la vidéo en plein écran reste dans la fenêtre ?
Pendant le traitement du son d'un onglet, Chrome affiche le plein écran dans la fenêtre. Appuyez sur F11 (Ctrl+Cmd+F sur Mac) pour mettre tout le navigateur en plein écran.

Le son est plus faible après activation.
C'est normal : le son est ramené à un niveau moyen stable. Montez « Volume général » dans les réglages fins, ou montez une fois la télé.

Après une mise à jour, il indique que le son de l'onglet est occupé.
Rechargez l'onglet et réactivez EvenSound.

CONFIDENTIALITÉ
Le son est traité sur votre ordinateur et n'en sort jamais. EvenSound ne collecte rien : pas de compte, pas d'analyse, pas de publicité. L'autorisation de capture d'onglet sert uniquement à obtenir le son de l'onglet où vous l'activez.

VOS RETOURS
Si quelque chose sonne mal ou si un site ne fonctionne pas, laissez un avis ou écrivez au support. Je lis tout.
```

### Подробное описание — Deutsch

```
EvenSound gleicht den Filmton im Browser aus: Laute Szenen werden leiser, Gespräche lauter. Die Fernbedienung kann liegen bleiben.

WARUM ICH ES GEBAUT HABE
Meine Freunde und ich schauen oft Filme vom Laptop auf dem Fernseher. Bei neueren Filmen war es immer dasselbe: Die Figuren flüstern, also lauter drehen; eine Schießerei beginnt, also schnell wieder leiser. Filme werden fürs Kino abgemischt, wo der Abstand zwischen leise und laut riesig ist. Zu Hause nervt das nur. Ich habe EvenSound geschrieben, damit wir nicht mehr mit der Fernbedienung kämpfen müssen.

SO GEHT'S
1. Öffnen Sie den Tab mit dem Film.
2. Klicken Sie auf das EvenSound-Symbol und legen Sie den Schalter um.
3. Stellen Sie den Fernseher einmal so ein, dass Sie die Dialoge gut hören. Danach hält EvenSound den Pegel selbst.

Es arbeitet pro Tab, andere Tabs bleiben unberührt. Tastenkürzel: Alt+Umschalt+L.

MODI
Sanft: fast der Originalton, nur ohne Extreme. Wenn die Action ihre Wucht behalten soll.
Kino: der Standard. Action wird deutlich leiser, Dialoge lauter.
Nacht: fast gleichmäßiger Ton. Wenn nebenan jemand schläft.

Mehr Kontrolle? Unter „Feineinstellung" gibt es drei Regler: wie stark leise Szenen angehoben werden, wie weit Stimmen nach vorn rücken und die Gesamtlautstärke.

Um den Unterschied zu hören, halten Sie „Gedrückt halten für Originalton" gedrückt. Solange Sie drücken, hören Sie den unveränderten Ton in gleicher Durchschnittslautstärke — so vergleichen Sie den Klang, nicht die Lautstärke.

WO ES FUNKTIONIERT
Auf jeder Website, die Ton in einem Tab abspielt: YouTube, Streaming-Dienste, in Seiten eingebettete Player. Welcher Player es ist, spielt keine Rolle, denn EvenSound arbeitet mit dem Ton des ganzen Tabs.

Auf Chromes eigenen Seiten (chrome://) und im Web Store funktioniert es nicht. Auch manche kopiergeschützte Dienste funktionieren eventuell nicht.

FRAGEN
Warum erscheint am Tab ein Aufnahme-Symbol?
So zeigt Chrome an, dass der Ton des Tabs verarbeitet wird. Es wird nichts aufgenommen.

Warum bleibt das Vollbild-Video im Browserfenster?
Während der Ton eines Tabs verarbeitet wird, zeigt Chrome Vollbild nur innerhalb des Fensters. Drücken Sie F11 (Ctrl+Cmd+F auf dem Mac), um den ganzen Browser in den Vollbildmodus zu schalten.

Nach dem Einschalten ist es leiser.
Das ist so gewollt: Der Ton wird auf ein gleichmäßiges mittleres Niveau gebracht. Erhöhen Sie „Gesamtlautstärke" in der Feineinstellung oder drehen Sie den Fernseher einmal lauter.

Nach einem Update heißt es, der Ton des Tabs sei belegt.
Laden Sie den Tab neu und schalten Sie EvenSound wieder ein.

DATENSCHUTZ
Der Ton wird auf Ihrem Computer verarbeitet und verlässt ihn nie. EvenSound sammelt nichts: keine Konten, keine Analysen, keine Werbung. Die Berechtigung zur Tab-Aufnahme dient nur dazu, den Ton des Tabs zu bekommen, in dem Sie es einschalten.

FEEDBACK
Wenn etwas komisch klingt oder eine Website nicht funktioniert, hinterlassen Sie eine Bewertung oder schreiben Sie an den Support. Ich lese alles.
```

---

## Вкладка «Privacy practices»

**Single purpose description:**
```
EvenSound evens out the audio volume of a browser tab: loud action scenes become quieter and dialogue becomes louder, so the user doesn't have to keep adjusting the volume.
```

**Permission justification — tabCapture:**
```
Used to capture the audio of the tab where the user turns EvenSound on, so that the audio can be leveled and played back. Capture starts only after the user clicks the toolbar button and enables it for that specific tab. The audio is processed locally in real time and is never recorded, stored or transmitted.
```

**Permission justification — offscreen:**
```
An offscreen document hosts the Web Audio (AudioWorklet) processing of the captured tab audio, because Manifest V3 service workers cannot process or play audio.
```

**Permission justification — storage:**
```
Stores the user's settings locally: selected mode, slider positions and interface language.
```

**Are you using remote code?** No, I am not using remote code.

**Data usage:** не отмечать ни одной категории данных (расширение ничего не собирает).
Поставить все три галочки-сертификата:
- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** https://fest322.github.io/evensound-privacy/

---

## Вкладка «Distribution»

- **Visibility:** Unlisted — на первое время, раздать ссылку друзьям. Потом переключить на Public.
- **Regions:** все.
- **Pricing:** Free.
