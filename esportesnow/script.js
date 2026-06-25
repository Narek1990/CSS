(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/esportesnow";

  var href = baseUrl + "/esportesnow.css?v=" + Date.now();
  var existing = document.querySelector('link[data-esportesnow-css="true"]');
  var maxWidthSelector = ".css-fkpkqq, [data-mj='widget-banner-container'], [data-mj='widget-bet-win-container'], .css-i58pjb";
  var spanColorSelector = ".css-l5xv05 .css-25j2b4 span";
  var wideContainerSelector = ".css-11xzi44 .css-1huuf1k";
  var narrowContainerSelector = ".css-11xzi44 .css-17u1px6";
  var wideContainerIconSelector = ".css-11xzi44 .css-1huuf1k .sl-icon.css-1nqq47m";
  var shadowContainerSelector = ".css-fkpkqq .css-1pyebjd";
  var hiddenElementSelector = ".css-1qulnur, [class~='css-1qulnur']";
  var hiddenElementCss = 'html body .css-1qulnur, html body [class~="css-1qulnur"] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; width: 0 !important; min-width: 0 !important; height: 0 !important; min-height: 0 !important; overflow: hidden !important; }';
  var menuIconSelector = ".sl-icon.css-17sgcqa, .sl-icon.css-potlfm";
  var menuSvg = '<svg data-esportesnow-svg="true" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" height="14" viewBox="0 0 19 14" width="19" xmlns="http://www.w3.org/2000/svg"><path d="M1.26049 13.5939H8.30622C8.86214 13.5939 9.31284 13.1433 9.31284 12.5874C9.31284 12.0315 8.86214 11.5808 8.30622 11.5808H1.26049C0.70458 11.5808 0.253944 12.0315 0.253944 12.5874C0.253944 13.1433 0.70458 13.5939 1.26049 13.5939ZM1.26049 8.17949H17.365C17.9209 8.17949 18.3715 7.72887 18.3715 7.17296C18.3715 6.61704 17.9209 6.16642 17.365 6.16642H1.26045C0.704542 6.16642 0.253906 6.61704 0.253906 7.17296C0.253906 7.72887 0.70458 8.17949 1.26049 8.17949ZM1.26049 2.76505H17.365C17.9209 2.76505 18.3715 2.31441 18.3715 1.7585C18.3715 1.20259 17.9209 0.751953 17.365 0.751953H1.26045C0.704542 0.751953 0.253906 1.20259 0.253906 1.7585C0.253906 2.31441 0.70458 2.76505 1.26049 2.76505Z" fill="#E8E5FF"></path></svg>';
  var buttonIconSelector = "button.sl-icon.css-lk14jz, button .sl-icon.css-lk14jz, .sl-icon.css-lk14jz svg";
  var buttonIconSvg = menuSvg.replace('data-esportesnow-svg="true" xmlns:xlink="http://www.w3.org/1999/xlink" ', 'data-esportesnow-button-svg="true" ');
  var heroBannerImageSelector = 'img[src*="9a71eac1-6e1c-4a81-a769-4f3044a33921"]';
  var heroHotspots = [
    {
      className: "esportesnow-hero-hotspot-register",
      href: "https://esportesnew.com/en/home?m=registration&t=email&returnUrl=/en/home",
      label: "Register"
    },
    {
      className: "esportesnow-hero-hotspot-casino",
      href: "https://esportesnew.com/en/home/casinos",
      label: "Casino"
    },
    {
      className: "esportesnow-hero-hotspot-sportsbook",
      href: "https://esportesnew.com/en/g-sports/sports",
      label: "Sportsbook"
    }
  ];
  var applyScheduled = false;

  function createMenuSvg() {
    var template = document.createElement("template");
    template.innerHTML = menuSvg;
    return template.content.firstElementChild;
  }

  function createButtonIconSvg() {
    var template = document.createElement("template");
    template.innerHTML = buttonIconSvg;
    return template.content.firstElementChild;
  }

  function setMenuIconPosition(element) {
    var isPotlfmIcon = element.classList && element.classList.contains("css-potlfm");

    element.style.setProperty("position", "absolute", "important");
    element.style.setProperty("right", isPotlfmIcon ? "207px" : "201px", "important");
    element.style.setProperty("top", isPotlfmIcon ? "15px" : "19px", "important");
    element.style.setProperty("left", "auto", "important");
    element.style.setProperty("bottom", "auto", "important");
    element.style.setProperty("z-index", "10", "important");
  }

  function replaceMenuSvg(element) {
    var targetSvg = element.matches("svg") ? element : element.querySelector("svg");

    if (!targetSvg) {
      return;
    }

    if (targetSvg.getAttribute("data-esportesnow-svg") === "true") {
      setMenuIconPosition(targetSvg);
      return;
    }

    var replacement = createMenuSvg();
    replacement.setAttribute("class", targetSvg.getAttribute("class") || element.getAttribute("class") || "sl-icon css-potlfm");
    targetSvg.replaceWith(replacement);
    setMenuIconPosition(replacement);
  }

  function replaceButtonIconSvg(element) {
    var targetSvg = element.matches("svg") ? element : element.querySelector("svg");
    var replacement;

    if (targetSvg && targetSvg.getAttribute("data-esportesnow-button-svg") === "true") {
      return;
    }

    replacement = createButtonIconSvg();

    if (targetSvg) {
      replacement.setAttribute("class", targetSvg.getAttribute("class") || "");
      targetSvg.replaceWith(replacement);
      return;
    }

    element.appendChild(replacement);
  }

  function injectHiddenElementCss() {
    var style = document.querySelector('style[data-esportesnow-inline-css="true"]');

    if (style) {
      if (style.textContent !== hiddenElementCss) {
        style.textContent = hiddenElementCss;
      }

      return;
    }

    style = document.createElement("style");
    style.setAttribute("data-esportesnow-inline-css", "true");
    style.textContent = hiddenElementCss;
    document.head.appendChild(style);
  }

  function hideElement(element) {
    element.style.setProperty("display", "none", "important");
    element.style.setProperty("visibility", "hidden", "important");
    element.style.setProperty("opacity", "0", "important");
    element.style.setProperty("pointer-events", "none", "important");
    element.style.setProperty("width", "0", "important");
    element.style.setProperty("min-width", "0", "important");
    element.style.setProperty("height", "0", "important");
    element.style.setProperty("min-height", "0", "important");
    element.style.setProperty("overflow", "hidden", "important");
  }

  function createHeroHotspot(config) {
    var link = document.createElement("a");
    link.className = "esportesnow-hero-hotspot " + config.className;
    link.href = config.href;
    link.setAttribute("aria-label", config.label);
    link.setAttribute("title", config.label);
    link.setAttribute("data-esportesnow-hero-hotspot", config.className);
    return link;
  }

  function injectHeroHotspots() {
    document.querySelectorAll(heroBannerImageSelector).forEach(function (image) {
      var slide = image.closest('[data-mj="widget-banner-item"]');

      if (!slide || slide.getAttribute("data-esportesnow-hero-hotspots") === "true") {
        return;
      }

      slide.classList.add("esportesnow-hero-hotspots-ready");

      heroHotspots.forEach(function (hotspot) {
        if (!slide.querySelector('[data-esportesnow-hero-hotspot="' + hotspot.className + '"]')) {
          slide.appendChild(createHeroHotspot(hotspot));
        }
      });

      slide.setAttribute("data-esportesnow-hero-hotspots", "true");
    });
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

  function getRandomDigit() {
    return getRandomIndex(10);
  }

  function getMiniGameAudioContext() {
    var AudioContextConstructor = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextConstructor) {
      return null;
    }

    if (!window.__esportesnowMiniGameAudioContext) {
      window.__esportesnowMiniGameAudioContext = new AudioContextConstructor();
    }

    return window.__esportesnowMiniGameAudioContext;
  }

  function playMiniGameSound(type) {
    var context = getMiniGameAudioContext();
    var now;
    var gain;
    var oscillator;
    var frequencies = {
      tap: [520, 760],
      reset: [420, 620],
      lose: [230, 160],
      win: [620, 880, 1180]
    };
    var tones = frequencies[type] || frequencies.tap;

    if (!context) {
      return;
    }

    if (context.state === "suspended" && context.resume) {
      context.resume();
    }

    now = context.currentTime;
    tones.forEach(function (frequency, index) {
      oscillator = context.createOscillator();
      gain = context.createGain();

      oscillator.type = type === "lose" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(frequency, now + (index * 0.085));
      gain.gain.setValueAtTime(0.0001, now + (index * 0.085));
      gain.gain.exponentialRampToValueAtTime(type === "win" ? 0.085 : 0.055, now + 0.025 + (index * 0.085));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.115 + (index * 0.085));

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now + (index * 0.085));
      oscillator.stop(now + 0.14 + (index * 0.085));
    });
  }

  function createMiniGameButton(number, game) {
    var button = document.createElement("button");

    button.type = "button";
    button.className = "esportesnow-mini-game-number";
    button.textContent = String(number);
    button.setAttribute("aria-label", "Guess number " + number);

    button.addEventListener("click", function () {
      var hiddenNumber = Number(game.getAttribute("data-hidden-number"));
      var isWinner = hiddenNumber === number;
      var numbers = game.querySelectorAll(".esportesnow-mini-game-number");
      var result = game.querySelector(".esportesnow-mini-game-result");
      var hidden = game.querySelector(".esportesnow-mini-game-hidden-value");

      playMiniGameSound("tap");

      numbers.forEach(function (item) {
        item.disabled = true;
        item.setAttribute("data-disabled", "true");
      });

      button.setAttribute(isWinner ? "data-win" : "data-lose", "true");
      game.setAttribute("data-revealed", "true");
      game.setAttribute("data-state", isWinner ? "win" : "lose");

      if (hidden) {
        hidden.textContent = String(hiddenNumber);
      }

      if (result) {
        result.textContent = isWinner
          ? "JACKPOT! You matched the hidden number. iPhone prize unlocked."
          : "So close. Hidden number was " + hiddenNumber + ". Try again and catch the iPhone prize.";
      }

      window.setTimeout(function () {
        playMiniGameSound(isWinner ? "win" : "lose");
      }, 95);
    });

    return button;
  }

  function resetMiniGame(game) {
    var hiddenNumber = getRandomDigit();
    var hidden = game.querySelector(".esportesnow-mini-game-hidden-value");
    var result = game.querySelector(".esportesnow-mini-game-result");

    game.setAttribute("data-hidden-number", String(hiddenNumber));
    game.setAttribute("data-revealed", "false");
    game.setAttribute("data-state", "ready");

    if (hidden) {
      hidden.textContent = "?";
    }

    if (result) {
      result.textContent = "Pick one number. Match the hidden digit and win the iPhone prize.";
    }

    game.querySelectorAll(".esportesnow-mini-game-number").forEach(function (button) {
      button.disabled = false;
      button.removeAttribute("data-disabled");
      button.removeAttribute("data-win");
      button.removeAttribute("data-lose");
    });
  }

  function createMiniGame() {
    var game = document.createElement("div");
    var intro = document.createElement("div");
    var badge = document.createElement("span");
    var title = document.createElement("strong");
    var subtitle = document.createElement("p");
    var display = document.createElement("div");
    var displayLabel = document.createElement("span");
    var hiddenValue = document.createElement("b");
    var numbers = document.createElement("div");
    var result = document.createElement("p");
    var reset = document.createElement("button");
    var prize = document.createElement("div");
    var phone = document.createElement("div");
    var phoneScreen = document.createElement("div");
    var prizeText = document.createElement("span");
    var coin;

    game.className = "esportesnow-mini-game";
    game.setAttribute("data-esportesnow-mini-game", "true");

    intro.className = "esportesnow-mini-game-intro";
    badge.className = "esportesnow-mini-game-badge";
    badge.textContent = "Lucky Number";
    title.textContent = "Guess the hidden number";
    subtitle.textContent = "The system hides one digit from 0 to 9. Choose wisely.";

    reset.type = "button";
    reset.className = "esportesnow-mini-game-reset";
    reset.textContent = "Play again";
    reset.addEventListener("click", function () {
      playMiniGameSound("reset");
      resetMiniGame(game);
    });

    display.className = "esportesnow-mini-game-display";
    displayLabel.textContent = "Hidden number";
    hiddenValue.className = "esportesnow-mini-game-hidden-value";
    hiddenValue.textContent = "?";
    display.appendChild(displayLabel);
    display.appendChild(hiddenValue);

    intro.appendChild(badge);
    intro.appendChild(title);
    intro.appendChild(subtitle);
    intro.appendChild(reset);
    intro.appendChild(display);

    numbers.className = "esportesnow-mini-game-numbers";
    for (var number = 0; number <= 9; number += 1) {
      numbers.appendChild(createMiniGameButton(number, game));
    }

    result.className = "esportesnow-mini-game-result";
    result.setAttribute("aria-live", "polite");

    prize.className = "esportesnow-mini-game-prize";
    prize.setAttribute("aria-hidden", "true");

    phone.className = "esportesnow-mini-game-phone";
    phoneScreen.className = "esportesnow-mini-game-phone-screen";
    phoneScreen.textContent = "iPhone";
    phone.appendChild(phoneScreen);

    prizeText.className = "esportesnow-mini-game-prize-text";
    prizeText.textContent = "Prize unlocked";

    prize.appendChild(phone);
    prize.appendChild(prizeText);

    for (var coinIndex = 0; coinIndex < 10; coinIndex += 1) {
      coin = document.createElement("i");
      coin.className = "esportesnow-mini-game-coin";
      coin.style.setProperty("--coin-index", String(coinIndex));
      prize.appendChild(coin);
    }

    game.appendChild(intro);
    game.appendChild(numbers);
    game.appendChild(result);
    game.appendChild(prize);

    resetMiniGame(game);
    return game;
  }

  function hasExplicitPickerSection() {
    return Array.prototype.slice.call(document.querySelectorAll('[data-mj="widget-game-slider"]')).some(function (section) {
      var title = section.querySelector('[data-mj="widget-game-slider-header"] p');
      return title && /game\s*picker/i.test(title.textContent || "");
    });
  }

  function getPickerSections() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('[data-mj="widget-game-slider"]'));
    var pickerSections = sections.filter(function (section) {
      var title = section.querySelector('[data-mj="widget-game-slider-header"] p');
      return title && /game\s*picker/i.test(title.textContent || "");
    });

    return pickerSections.length ? pickerSections : sections;
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

        if (!img || !src || !title || seen[src + "|" + title]) {
          return;
        }

        seen[src + "|" + title] = true;
        games.push({
          card: card,
          href: link && link.href,
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

    if (!selected) {
      return;
    }

    if (selected.href) {
      window.location.href = selected.href;
      return;
    }

    selected.card.dispatchEvent(new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window
    }));
  }

  function runRandomPicker(picker) {
    var games = collectPickerGames();
    var button = picker.querySelector(".esportesnow-random-picker-button");
    var status = picker.querySelector(".esportesnow-random-picker-status");
    var cycles = 18;
    var cycle = 0;
    var finalIndex;

    if (!games.length) {
      if (status) {
        status.textContent = "Game list is still loading. Try again in a moment.";
      }
      return;
    }

    picker.__esportesnowGames = games;
    picker.setAttribute("data-state", "loading");

    if (button) {
      button.disabled = true;
      button.textContent = "Loading...";
    }

    if (status) {
      status.textContent = "Opening the portal and shuffling games...";
    }

    var interval = window.setInterval(function () {
      var previewIndex = getRandomIndex(games.length);
      updateRandomPickerCard(picker, games[previewIndex]);
      cycle += 1;

      if (cycle < cycles) {
        return;
      }

      window.clearInterval(interval);
      finalIndex = getRandomIndex(games.length);
      picker.setAttribute("data-selected-game-index", String(finalIndex));
      updateRandomPickerCard(picker, games[finalIndex]);
      picker.setAttribute("data-state", "selected");

      if (button) {
        button.disabled = false;
        button.textContent = "Shuffle";
      }

      if (status) {
        status.textContent = games[finalIndex].title + " is ready. Tap the card to play.";
      }
    }, 74);
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
    play.textContent = "▶";

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

  function injectMiniGame() {
    document.querySelectorAll('[data-mj="widget-info-panel-container"]').forEach(function (container) {
      var existingRandomPicker = container.querySelector('[data-esportesnow-random-picker="true"]');
      var existingMiniGame = container.querySelector('[data-esportesnow-mini-game="true"]');
      var shouldShowRandomPicker = hasExplicitPickerSection();

      if (shouldShowRandomPicker && existingRandomPicker) {
        return;
      }

      if (!shouldShowRandomPicker && (existingMiniGame || existingRandomPicker)) {
        return;
      }

      if (shouldShowRandomPicker && existingMiniGame) {
        existingMiniGame.remove();
      }

      container.insertBefore(shouldShowRandomPicker ? createRandomGamePicker() : createMiniGame(), container.firstChild);
    });
  }

  function applyOverrides() {
    applyScheduled = false;
    injectHiddenElementCss();
    injectHeroHotspots();
    injectMiniGame();

    document.querySelectorAll(maxWidthSelector).forEach(function (element) {
      element.style.setProperty("max-width", "none", "important");
    });

    document.querySelectorAll(spanColorSelector).forEach(function (element) {
      element.style.setProperty("color", "#c9c4c4", "important");
    });

    document.querySelectorAll(wideContainerSelector).forEach(function (element) {
      element.style.setProperty("padding", "0", "important");
      element.style.setProperty("width", "260px", "important");
    });

    document.querySelectorAll(narrowContainerSelector).forEach(function (element) {
      element.style.setProperty("padding", "0", "important");
      element.style.setProperty("width", "80px", "important");
    });

    document.querySelectorAll(wideContainerIconSelector).forEach(function (element) {
      element.style.removeProperty("width");
      element.style.removeProperty("min-width");
      element.style.removeProperty("height");
      element.style.setProperty("width", "auto", "important");
      element.style.setProperty("min-width", "0", "important");
      element.style.setProperty("height", "auto", "important");
    });

    document.querySelectorAll(shadowContainerSelector).forEach(function (element) {
      element.style.setProperty("box-shadow", "none", "important");
    });

    document.querySelectorAll(hiddenElementSelector).forEach(function (element) {
      hideElement(element);
    });

    document.querySelectorAll(menuIconSelector).forEach(function (element) {
      setMenuIconPosition(element);
      replaceMenuSvg(element);

      if (!element.matches("svg")) {
        element.querySelectorAll("svg").forEach(setMenuIconPosition);
      }
    });

    document.querySelectorAll(buttonIconSelector).forEach(replaceButtonIconSvg);
  }

  function scheduleApplyOverrides() {
    if (applyScheduled) {
      return;
    }

    applyScheduled = true;
    requestAnimationFrame(applyOverrides);
  }

  if (existing) {
    existing.href = href;
  } else {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-esportesnow-css", "true");
    document.head.appendChild(link);
  }

  applyOverrides();

  new MutationObserver(scheduleApplyOverrides).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style"],
    childList: true,
    subtree: true
  });
})();
