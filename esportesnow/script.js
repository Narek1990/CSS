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

  function injectBetWinGameDetails() {
    var pageTitles = collectGameTitles();

    document.querySelectorAll('[data-mj="widget-bet-win"] [class~="app-ltr-27yrbd"]').forEach(function (card) {
      var image = card.querySelector('img[src*="/gameimage/"]');
      var info = card.querySelector('[class~="app-ltr-yawtgd"]');
      var userRow = info && info.querySelector('[class~="app-ltr-1dx9dwl"]');
      var amountRow = info && info.querySelector('[class~="app-ltr-1blkpw5"]');
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
    injectHiddenElementCss();
    injectHeroHotspots();
    injectBetWinGameDetails();

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
