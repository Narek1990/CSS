(function () {
  "use strict";

  var pickerVersion = 2;

  if (window.__esportesnowRandomGamePickerLoaded === pickerVersion) {
    return;
  }

  window.__esportesnowRandomGamePickerLoaded = pickerVersion;

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/esportesnow";
  var cssHref = baseUrl + "/esportesnow.css";
  var backgroundUrl = baseUrl + "/assets/random.png?v=" + pickerVersion;
  var applyScheduled = false;

  function escapeCssUrl(value) {
    return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  function ensureStylesheet() {
    var existing = document.querySelector('link[data-esportesnow-css="true"]');
    var link;

    if (existing) {
      if (existing.getAttribute("href") !== cssHref) {
        existing.href = cssHref;
      }

      return;
    }

    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssHref;
    link.setAttribute("data-esportesnow-css", "true");
    document.head.appendChild(link);
  }

  function ensureRandomPickerBackgroundStyles() {
    var styleId = "esportesnow-random-picker-background-style";
    var style = document.getElementById(styleId);
    var fallbackUrl = "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/esportesnow/assets/random.png";
    var css =
      'html body .esportesnow-random-picker{' +
      '--esportesnow-random-picker-bg:url("' + escapeCssUrl(backgroundUrl) + '");' +
      'background:linear-gradient(90deg,rgba(4,13,22,.92) 0%,rgba(4,13,22,.76) 42%,rgba(4,13,22,.25) 68%,rgba(4,13,22,.08) 100%),var(--esportesnow-random-picker-bg,url("' + fallbackUrl + '")) center center/cover no-repeat!important;' +
      'background-color:#061018!important;' +
      '}' +
      'html body .esportesnow-random-picker::before{' +
      'background:radial-gradient(circle at 73% 52%,rgba(255,220,97,.22),transparent 18%),radial-gradient(circle at 72% 52%,rgba(72,230,255,.2),transparent 34%),linear-gradient(90deg,rgba(2,16,24,.26),transparent 68%)!important;' +
      'opacity:.92!important;' +
      '}' +
      '@media(max-width:768px){html body .esportesnow-random-picker{' +
      'background:linear-gradient(180deg,rgba(4,13,22,.84) 0%,rgba(4,13,22,.5) 52%,rgba(4,13,22,.18) 100%),var(--esportesnow-random-picker-bg,url("' + fallbackUrl + '")) 68% center/cover no-repeat!important;' +
      '}}';

    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      style.setAttribute("data-esportesnow-random-picker-background", "true");
      document.head.appendChild(style);
    }

    if (style.textContent !== css) {
      style.textContent = css;
    }
  }

  function applyRandomPickerBackground(picker) {
    if (!picker) {
      return;
    }

    picker.style.setProperty(
      "--esportesnow-random-picker-bg",
      'url("' + backgroundUrl + '")'
    );
    picker.setAttribute("data-random-picker-background", "random.png");
  }

  function syncRandomPickerBackgrounds() {
    document
      .querySelectorAll('[data-esportesnow-random-picker="true"]')
      .forEach(applyRandomPickerBackground);
  }

  function getRandomIndex(max) {
    var buffer;

    if (!max) {
      return 0;
    }

    if (window.crypto && window.crypto.getRandomValues) {
      buffer = new Uint32Array(1);
      window.crypto.getRandomValues(buffer);
      return buffer[0] % max;
    }

    return Math.floor(Math.random() * max);
  }

  function getPickerAudioContext() {
    var AudioContextConstructor = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextConstructor) {
      return null;
    }

    if (!window.__esportesnowRandomPickerAudioContext) {
      window.__esportesnowRandomPickerAudioContext = new AudioContextConstructor();
    }

    return window.__esportesnowRandomPickerAudioContext;
  }

  function playPickerTone(frequency, duration, type, gainValue, delay, endFrequency) {
    var context = getPickerAudioContext();
    var oscillator;
    var gain;
    var startAt;

    if (!context) {
      return;
    }

    startAt = context.currentTime + (delay || 0);
    oscillator = context.createOscillator();
    gain = context.createGain();
    oscillator.type = type || "sine";
    oscillator.frequency.setValueAtTime(frequency, startAt);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startAt + duration);
    }
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(gainValue || 0.04, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  function playPickerNoise(duration, gainValue, delay) {
    var context = getPickerAudioContext();
    var buffer;
    var data;
    var source;
    var filter;
    var gain;
    var startAt;
    var sampleCount;
    var index;

    if (!context) {
      return;
    }

    sampleCount = Math.max(1, Math.floor(context.sampleRate * duration));
    buffer = context.createBuffer(1, sampleCount, context.sampleRate);
    data = buffer.getChannelData(0);

    for (index = 0; index < sampleCount; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
    }

    startAt = context.currentTime + (delay || 0);
    source = context.createBufferSource();
    filter = context.createBiquadFilter();
    gain = context.createGain();
    source.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2200, startAt);
    filter.Q.setValueAtTime(3.8, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(gainValue || 0.02, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start(startAt);
    source.stop(startAt + duration + 0.02);
  }

  function playRandomPickerSound(type) {
    var context = getPickerAudioContext();

    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      context.resume();
    }

    if (type === "shuffle") {
      playPickerTone(380 + getRandomIndex(360), 0.052, "triangle", 0.026, 0, 620 + getRandomIndex(480));
      playPickerNoise(0.045, 0.012, 0.005);
      return;
    }

    if (type === "start") {
      playPickerTone(96, 0.18, "sine", 0.045, 0, 64);
      playPickerTone(330, 0.11, "triangle", 0.035, 0.02, 620);
      playPickerTone(520, 0.13, "sine", 0.028, 0.11, 860);
      playPickerNoise(0.12, 0.016, 0.03);
      return;
    }

    if (type === "reveal") {
      playPickerTone(240, 0.34, "sawtooth", 0.026, 0, 880);
      playPickerTone(720, 0.15, "triangle", 0.036, 0.08, 1220);
      playPickerTone(1080, 0.12, "sine", 0.026, 0.2, 1680);
      playPickerNoise(0.22, 0.018, 0.02);
      return;
    }

    if (type === "selected") {
      [523.25, 659.25, 783.99, 1046.5].forEach(function (frequency, index) {
        playPickerTone(frequency, 0.34 + index * 0.035, index % 2 ? "triangle" : "sine", 0.034, index * 0.055);
      });
      playPickerTone(1567.98, 0.24, "sine", 0.024, 0.24);
      playPickerNoise(0.18, 0.012, 0.05);
      return;
    }

    if (type === "play") {
      playPickerTone(880, 0.08, "triangle", 0.036, 0, 1320);
      playPickerTone(440, 0.1, "sine", 0.026, 0.05, 330);
    }
  }

  function getPickerSections() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-mj="widget-game-slider"]')).filter(function (section) {
      var title = section.querySelector('[data-mj="widget-game-slider-header"] p');
      return title && /game\s*picker/i.test(title.textContent || "");
    });
  }

  function getGameIdFromImage(src) {
    var match = (src || "").match(/gameimage\/([^/?#]+)\.(?:webp|png|jpe?g)/i);
    return match && match[1];
  }

  function getGameHref(game) {
    var langMatch = window.location.pathname.match(/^\/([a-z]{2})(?:\/|$)/i);
    var lang = langMatch ? langMatch[1] : "en";
    var routeRoot = /^\/[a-z]{2}\/g-casinos\//i.test(window.location.pathname)
      ? "/" + lang + "/g-casinos/casinos"
      : "/" + lang + "/home/casinos";

    if (game.href) {
      return game.href;
    }

    return game.id ? routeRoot + "/game/" + encodeURIComponent(game.id) : "";
  }

  function collectPickerGames() {
    var games = [];
    var seen = {};

    getPickerSections().forEach(function (section) {
      section.querySelectorAll('[data-mj="widget-game-card"]').forEach(function (card) {
        var img = card.querySelector("img[src]");
        var link = card.closest("a[href]");
        var src = img && img.getAttribute("src");
        var title = img && (img.getAttribute("alt") || "").trim();
        var id = getGameIdFromImage(src);
        var key = (id || src) + "|" + title;

        if (!img || !src || !title || seen[key]) {
          return;
        }

        seen[key] = true;
        games.push({
          card: card,
          href: link && link.href,
          id: id,
          image: src,
          title: title
        });
      });
    });

    return games;
  }

  function updateRandomPickerCard(picker, game) {
    var image = picker.querySelector(".esportesnow-random-picker-card-img");
    var title = picker.querySelector(".esportesnow-random-picker-card-title");

    if (image) {
      image.src = game.image;
      image.alt = game.title;
    }

    if (title) {
      title.textContent = game.title;
    }
  }

  function playSelectedRandomGame(picker) {
    var selectedIndex = Number(picker.getAttribute("data-selected-game-index"));
    var games = picker.__esportesnowGames || [];
    var selected = games[selectedIndex];
    var href;

    if (!selected) {
      return;
    }

    playRandomPickerSound("play");
    href = getGameHref(selected);

    if (href) {
      window.location.href = href;
      return;
    }

    selected.card.dispatchEvent(new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window
    }));
  }

  function setButtonText(button, text) {
    if (button) {
      button.textContent = text;
    }
  }

  function runRandomPicker(picker) {
    var games = collectPickerGames();
    var button = picker.querySelector(".esportesnow-random-picker-button");
    var status = picker.querySelector(".esportesnow-random-picker-status");
    var cycles = 24;
    var cycle = 0;
    var finalIndex;

    if (!games.length) {
      if (status) {
        status.textContent = "Game list is still loading. Try again in a moment.";
      }
      return;
    }

    picker.__esportesnowGames = games;
    playRandomPickerSound("start");
    picker.removeAttribute("data-selected-game-index");
    picker.setAttribute("data-state", "ready");
    void picker.offsetWidth;
    picker.setAttribute("data-state", "loading");

    if (button) {
      button.disabled = true;
    }

    setButtonText(button, "Loading...");

    if (status) {
      status.textContent = "Opening the portal and shuffling games...";
    }

    var interval = window.setInterval(function () {
      var previewIndex = getRandomIndex(games.length);
      updateRandomPickerCard(picker, games[previewIndex]);
      if (cycle % 3 === 0) {
        playRandomPickerSound("shuffle");
      }
      cycle += 1;

      if (cycle < cycles) {
        return;
      }

      window.clearInterval(interval);
      finalIndex = getRandomIndex(games.length);
      picker.setAttribute("data-selected-game-index", String(finalIndex));
      updateRandomPickerCard(picker, games[finalIndex]);
      picker.setAttribute("data-state", "settling");
      void picker.offsetWidth;
      picker.setAttribute("data-state", "revealing");

      if (status) {
        status.textContent = "The portal has chosen...";
      }

      playRandomPickerSound("reveal");

      window.setTimeout(function () {
        picker.setAttribute("data-state", "selected");
        playRandomPickerSound("selected");

        if (button) {
          button.disabled = false;
        }

        setButtonText(button, "Shuffle");

        if (status) {
          status.textContent = games[finalIndex].title + " is ready. Tap the glowing card to play.";
        }
      }, 650);
    }, 68);
  }

  function createRandomGamePicker() {
    var picker = document.createElement("div");
    var intro = document.createElement("div");
    var badge = document.createElement("span");
    var title = document.createElement("strong");
    var subtitle = document.createElement("p");
    var stage = document.createElement("button");
    var ring;
    var spark;
    var card = document.createElement("span");
    var image = document.createElement("img");
    var cardTitle = document.createElement("span");
    var play = document.createElement("span");
    var button = document.createElement("button");
    var status = document.createElement("p");

    picker.className = "esportesnow-random-picker";
    picker.setAttribute("data-esportesnow-random-picker", "true");
    picker.setAttribute("data-state", "ready");
    applyRandomPickerBackground(picker);

    intro.className = "esportesnow-random-picker-intro";
    badge.className = "esportesnow-random-picker-badge";
    badge.textContent = "Random Game Picker";
    title.textContent = "Not sure what to play?";
    subtitle.textContent = "Try your luck on a random game from this list.";

    stage.type = "button";
    stage.className = "esportesnow-random-picker-stage";
    stage.setAttribute("aria-label", "Play selected random game");
    stage.addEventListener("click", function () {
      if (picker.getAttribute("data-state") === "selected") {
        playSelectedRandomGame(picker);
      }
    });

    ring = document.createElement("span");
    ring.className = "esportesnow-random-picker-fx-ring";
    ring.setAttribute("aria-hidden", "true");
    stage.appendChild(ring);

    for (var sparkIndex = 0; sparkIndex < 10; sparkIndex += 1) {
      spark = document.createElement("span");
      spark.className = "esportesnow-random-picker-spark";
      spark.setAttribute("aria-hidden", "true");
      spark.style.setProperty("--spark-index", String(sparkIndex));
      spark.style.setProperty("--spark-x", String(50 + Math.cos((sparkIndex / 10) * Math.PI * 2) * 42) + "%");
      spark.style.setProperty("--spark-y", String(52 + Math.sin((sparkIndex / 10) * Math.PI * 2) * 34) + "%");
      spark.style.setProperty("--spark-delay", String(sparkIndex * 0.065) + "s");
      spark.style.setProperty("--spark-size", String(4 + (sparkIndex % 3) * 2) + "px");
      stage.appendChild(spark);
    }

    card.className = "esportesnow-random-picker-card";
    image.className = "esportesnow-random-picker-card-img";
    image.alt = "";
    image.loading = "lazy";
    image.decoding = "async";
    cardTitle.className = "esportesnow-random-picker-card-title";
    cardTitle.textContent = "Mystery Game";
    play.className = "esportesnow-random-picker-play";
    play.textContent = "\u25B6";

    card.appendChild(image);
    card.appendChild(cardTitle);
    card.appendChild(play);
    stage.appendChild(card);

    intro.appendChild(badge);
    intro.appendChild(title);
    intro.appendChild(subtitle);

    button.type = "button";
    button.className = "esportesnow-random-picker-button";
    button.textContent = "Find a game";
    button.addEventListener("click", function () {
      runRandomPicker(picker);
    });

    status.className = "esportesnow-random-picker-status";
    status.setAttribute("aria-live", "polite");
    status.textContent = "The portal is waiting. Press the button to shuffle.";

    picker.appendChild(intro);
    picker.appendChild(stage);
    picker.appendChild(button);
    picker.appendChild(status);

    return picker;
  }

  function injectRandomGamePicker() {
    if (!getPickerSections().length) {
      return;
    }

    document.querySelectorAll('[data-mj="widget-info-panel-container"]').forEach(function (container) {
      if (container.querySelector('[data-esportesnow-random-picker="true"]')) {
        return;
      }

      var picker = createRandomGamePicker();
      var miniGame = container.querySelector('[data-esportesnow-mini-game="true"]');

      if (miniGame) {
        container.insertBefore(picker, miniGame);
        return;
      }

      container.insertBefore(picker, container.firstChild);
    });
  }

  function apply() {
    applyScheduled = false;
    ensureStylesheet();
    ensureRandomPickerBackgroundStyles();
    injectRandomGamePicker();
    syncRandomPickerBackgrounds();
  }

  function scheduleApply() {
    if (applyScheduled) {
      return;
    }

    applyScheduled = true;
    requestAnimationFrame(apply);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleApply, { once: true });
  } else {
    scheduleApply();
  }

  new MutationObserver(scheduleApply).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
