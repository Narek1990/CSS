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
    button.style.setProperty("--mini-game-index", String(number));
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
    var hiddenNumber = getRandomIndex(10);
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

  function injectLuckyNumber() {
    document.querySelectorAll('[data-mj="widget-info-panel-container"]').forEach(function (container) {
      if (container.querySelector('[data-esportesnow-mini-game="true"]')) {
        return;
      }

      container.insertBefore(createMiniGame(), container.firstChild);
    });
  }

  function apply() {
    applyScheduled = false;
    ensureStylesheet();
    injectLuckyNumber();
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
