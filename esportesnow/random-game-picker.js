(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/esportesnow";
  var cssHref = baseUrl + "/esportesnow.css?v=" + Date.now();
  var applyScheduled = false;

  function ensureStylesheet() {
    var existing = document.querySelector('link[data-esportesnow-css="true"]');
    var link;

    if (existing) {
      if (existing.href !== cssHref) {
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

  function playPickerTone(frequency, duration, type, gainValue, delay) {
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
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(gainValue || 0.04, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
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
      playPickerTone(420 + getRandomIndex(260), 0.055, "square", 0.026, 0);
      return;
    }

    if (type === "start") {
      playPickerTone(360, 0.08, "triangle", 0.032, 0);
      playPickerTone(520, 0.1, "sine", 0.028, 0.06);
      return;
    }

    if (type === "reveal") {
      playPickerTone(520, 0.12, "triangle", 0.04, 0);
      playPickerTone(780, 0.16, "triangle", 0.035, 0.08);
      return;
    }

    if (type === "selected") {
      playPickerTone(660, 0.12, "sine", 0.045, 0);
      playPickerTone(990, 0.18, "sine", 0.04, 0.1);
      playPickerTone(1320, 0.22, "triangle", 0.028, 0.21);
      return;
    }

    if (type === "play") {
      playPickerTone(740, 0.09, "triangle", 0.04, 0);
      playPickerTone(420, 0.11, "sine", 0.03, 0.06);
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
    var card = document.createElement("span");
    var image = document.createElement("img");
    var cardTitle = document.createElement("span");
    var play = document.createElement("span");
    var button = document.createElement("button");
    var status = document.createElement("p");

    picker.className = "esportesnow-random-picker";
    picker.setAttribute("data-esportesnow-random-picker", "true");
    picker.setAttribute("data-state", "ready");

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

      container.insertBefore(createRandomGamePicker(), container.firstChild);
    });
  }

  function apply() {
    applyScheduled = false;
    ensureStylesheet();
    injectRandomGamePicker();
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
