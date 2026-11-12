(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/esportesnow";

  var href = baseUrl + "/esportesnow.css";
  var existing = document.querySelector('link[data-esportesnow-css="true"]');
  var maxWidthSelector = "[data-mj='content-wrapper'], [data-mj='widget-banner-container'], [data-mj='widget-bet-win-container'], [data-mj='widget-game-slider-container'], [data-mj='widget-collection-slider-container'], [data-mj='widget-fixed-image-banner-container'], [data-mj='widget-phoenix-sport-container'], [data-mj='widget-top-providers'] > div, [data-mj='header'] > div:has(> [data-mj='custom-header'])";
  var hiddenElementSelector = ".css-1qulnur, [class~='css-1qulnur'], .app-ltr-1qulnur, [class~='app-ltr-1qulnur']";
  var hiddenElementCss = 'html body .css-1qulnur, html body [class~="css-1qulnur"], html body .app-ltr-1qulnur, html body [class~="app-ltr-1qulnur"] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; width: 0 !important; min-width: 0 !important; height: 0 !important; min-height: 0 !important; overflow: hidden !important; }';
  var heroBannerImageSelector = '[data-mj="widget-banner-item"] [data-mj="widget-banner-link"] img, [data-mj="widget-banner-item"] img[src*="/AssetsSite/"]';
  var betWinGameDetails = {
    "61412": { title: "Ghost Father", provider: "Peter&Sons" },
    "73693": { title: "Gunpowder", provider: "Peter&Sons" },
    "81965": { title: "Steamworks", provider: "Peter&Sons" },
    "82640": { title: "Muddy Waters", provider: "Peter&Sons" }
  };
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

  function buildAssetUrl(fileName) {
    return baseUrl + "/" + fileName + "?v=" + Date.now();
  }

  function ensureCompanionScript(fileName, loadedFlagName, queuedFlagName, readySelector, requiredLoadedValue) {
    var script;

    if (window[queuedFlagName]) {
      return;
    }

    if (requiredLoadedValue) {
      if (window[loadedFlagName] === requiredLoadedValue) {
        return;
      }
    } else if (window[loadedFlagName]) {
      return;
    }

    if (!requiredLoadedValue && readySelector && document.querySelector(readySelector)) {
      window[loadedFlagName] = true;
      return;
    }

    window[queuedFlagName] = true;
    script = document.createElement("script");
    script.src = buildAssetUrl(fileName);
    script.async = false;
    script.setAttribute("data-esportesnow-companion", fileName);
    script.onload = function () {
      window[queuedFlagName] = false;
    };
    script.onerror = function () {
      window[queuedFlagName] = false;
    };
    (document.head || document.documentElement).appendChild(script);
  }

  function ensureCompanionScripts() {
    ensureCompanionScript(
      "random-game-picker.js",
      "__esportesnowRandomGamePickerLoaded",
      "__esportesnowRandomGamePickerQueued",
      '[data-esportesnow-random-picker="true"]',
      2
    );
    ensureCompanionScript(
      "lucky-number.js",
      "__esportesnowLuckyNumberLoaded",
      "__esportesnowLuckyNumberQueued",
      '[data-esportesnow-mini-game="true"]'
    );
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

  function getGameImageId(src) {
    var match = (src || "").match(/gameimage\/([^/?#]+?)(?:\.(?:webp|png|jpe?g))?(?:[?#]|$)/i);
    return match ? match[1] : "";
  }

  function collectGameTitles() {
    var titles = {};

    document.querySelectorAll('img[src*="/gameimage/"][alt]').forEach(function (image) {
      var id = getGameImageId(image.getAttribute("src"));
      var title = (image.getAttribute("alt") || "").trim();

      if (id && title) {
        titles[id] = title;
      }
    });

    return titles;
  }

  function createBetWinMeta(title, provider) {
    var meta = document.createElement("div");
    var titleElement = document.createElement("span");
    var providerElement = document.createElement("span");

    meta.className = "esportesnow-bet-win-meta";
    titleElement.className = "esportesnow-bet-win-title";
    providerElement.className = "esportesnow-bet-win-provider";
    titleElement.textContent = title;
    providerElement.textContent = provider;
    meta.appendChild(titleElement);
    meta.appendChild(providerElement);

    return meta;
  }

  function markBetWinLayout(card, image, info, userRow, amountRow) {
    if (!card || !image || !info || !userRow) return;

    var imageContainer = image && image.parentElement;
    var item = card && card.parentElement;
    var track = item && item.parentElement;
    var amount = amountRow && amountRow.querySelector("p");
    var currency = amountRow && amountRow.querySelector("object");

    card.classList.add("esportesnow-bet-win-card");
    image.classList.add("esportesnow-bet-win-image-element");
    imageContainer.classList.add("esportesnow-bet-win-image");
    info.classList.add("esportesnow-bet-win-info");
    userRow.classList.add("esportesnow-bet-win-user");

    if (amountRow) amountRow.classList.add("esportesnow-bet-win-amount");
    if (amount) amount.classList.add("esportesnow-bet-win-value");
    if (currency) currency.classList.add("esportesnow-bet-win-currency");
    if (item) {
      item.classList.add("esportesnow-bet-win-item");
      item.style.setProperty("flex", "0 0 270px", "important");
      item.style.setProperty("width", "270px", "important");
      item.style.setProperty("min-width", "270px", "important");
      item.style.setProperty("max-width", "270px", "important");
    }
    if (track) {
      track.classList.add("esportesnow-bet-win-track");
      track.style.setProperty("display", "flex", "important");
      track.style.setProperty("flex-flow", "row nowrap", "important");
      track.style.setProperty("width", "max-content", "important");
      track.style.setProperty("min-width", "100%", "important");
    }
  }

  function injectBetWinGameDetails() {
    var pageTitles = collectGameTitles();

    document.querySelectorAll('[data-mj="widget-bet-win"] img[src*="/gameimage/"]').forEach(function (image) {
      var imageContainer = image.parentElement;
      var card = imageContainer && imageContainer.parentElement;
      var userRow = card && card.querySelector('p:has(i[aria-label="user"])');
      var info = userRow && userRow.parentElement;
      var currency = info && info.querySelector('object[data*="/AssetTemplateSite/"]');
      var amountRow = currency && currency.parentElement;
      var id = image && getGameImageId(image.getAttribute("src"));
      var defaults = id ? betWinGameDetails[id] : null;
      var title = (id && pageTitles[id]) || (defaults && defaults.title) || "Casino Game";
      var provider = (defaults && defaults.provider) || "Provider";
      var signature = [
        id || "",
        title,
        provider,
        userRow ? userRow.textContent.trim() : "",
        amountRow ? amountRow.textContent.trim() : ""
      ].join("|");
      var meta;

      if (!info || !userRow) {
        return;
      }

      markBetWinLayout(card, image, info, userRow, amountRow);

      meta = info.querySelector(".esportesnow-bet-win-meta");

      if (!meta) {
        meta = createBetWinMeta(title, provider);
        info.insertBefore(meta, userRow);
        return;
      }

      meta.querySelector(".esportesnow-bet-win-title").textContent = title;
      meta.querySelector(".esportesnow-bet-win-provider").textContent = provider;

      if (card.dataset.esportesnowBetWinSignature && card.dataset.esportesnowBetWinSignature !== signature) {
        card.classList.remove("esportesnow-bet-win-refreshing");
        void card.offsetWidth;
        card.classList.add("esportesnow-bet-win-refreshing");
        window.setTimeout(function () {
          if (card.isConnected) {
            card.classList.remove("esportesnow-bet-win-refreshing");
          }
        }, 380);
      }

      card.dataset.esportesnowBetWinSignature = signature;
    });
  }

  function applyOverrides() {
    applyScheduled = false;
    ensureCompanionScripts();
    injectHiddenElementCss();
    injectHeroHotspots();
    injectBetWinGameDetails();

    document.querySelectorAll(maxWidthSelector).forEach(function (element) {
      element.style.setProperty("max-width", "none", "important");
    });

  }

  function scheduleApplyOverrides() {
    if (applyScheduled) {
      return;
    }

    applyScheduled = true;
    requestAnimationFrame(applyOverrides);
  }

  if (existing) {
    if (existing.getAttribute("href") !== href) {
      existing.href = href;
    }
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
