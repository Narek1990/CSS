(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/esportes";

  var href = baseUrl + "/esportes.css?v=" + Date.now();
  var existing = document.querySelector('link[data-esportes-css="true"]');
  var maxWidthSelector = ".css-fkpkqq, [data-mj='widget-banner-container'], [data-mj='widget-bet-win-container'], .css-i58pjb";
  var spanColorSelector = ".css-l5xv05 .css-25j2b4 span";
  var wideContainerSelector = ".css-11xzi44 .css-1huuf1k";
  var narrowContainerSelector = ".css-11xzi44 .css-17u1px6";
  var wideContainerIconSelector = ".css-11xzi44 .css-1huuf1k .sl-icon.css-1nqq47m";
  var shadowContainerSelector = ".css-fkpkqq .css-1pyebjd";
  var providerCardSelector = '[data-mj="widget-top-providers-slider"] .css-rlbnh9 .css-s4hrud, [data-mj="widget-top-providers-slider"] [class~="css-rlbnh9"] [class~="css-s4hrud"]';
  var hiddenElementSelector = ".css-1qulnur, [class~='css-1qulnur']";
  var hiddenElementCss = 'html body .css-1qulnur, html body [class~="css-1qulnur"] { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; width: 0 !important; min-width: 0 !important; height: 0 !important; min-height: 0 !important; overflow: hidden !important; }';
  var menuIconSelector = ".sl-icon.css-17sgcqa, .sl-icon.css-potlfm";
  var menuSvg = '<svg data-esportes-svg="true" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" height="14" viewBox="0 0 19 14" width="19" xmlns="http://www.w3.org/2000/svg"><path d="M1.26049 13.5939H8.30622C8.86214 13.5939 9.31284 13.1433 9.31284 12.5874C9.31284 12.0315 8.86214 11.5808 8.30622 11.5808H1.26049C0.70458 11.5808 0.253944 12.0315 0.253944 12.5874C0.253944 13.1433 0.70458 13.5939 1.26049 13.5939ZM1.26049 8.17949H17.365C17.9209 8.17949 18.3715 7.72887 18.3715 7.17296C18.3715 6.61704 17.9209 6.16642 17.365 6.16642H1.26045C0.704542 6.16642 0.253906 6.61704 0.253906 7.17296C0.253906 7.72887 0.70458 8.17949 1.26049 8.17949ZM1.26049 2.76505H17.365C17.9209 2.76505 18.3715 2.31441 18.3715 1.7585C18.3715 1.20259 17.9209 0.751953 17.365 0.751953H1.26045C0.704542 0.751953 0.253906 1.20259 0.253906 1.7585C0.253906 2.31441 0.70458 2.76505 1.26049 2.76505Z" fill="#E8E5FF"></path></svg>';
  var buttonIconSelector = "button.sl-icon.css-lk14jz, button .sl-icon.css-lk14jz, .sl-icon.css-lk14jz svg";
  var buttonIconSvg = menuSvg.replace('data-esportes-svg="true" xmlns:xlink="http://www.w3.org/1999/xlink" ', 'data-esportes-button-svg="true" ');
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

    if (targetSvg.getAttribute("data-esportes-svg") === "true") {
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

    if (targetSvg && targetSvg.getAttribute("data-esportes-button-svg") === "true") {
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
    var style = document.querySelector('style[data-esportes-inline-css="true"]');

    if (style) {
      if (style.textContent !== hiddenElementCss) {
        style.textContent = hiddenElementCss;
      }

      return;
    }

    style = document.createElement("style");
    style.setAttribute("data-esportes-inline-css", "true");
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

  function styleProviderCard(element) {
    element.style.setProperty("overflow", "hidden", "important");
    element.style.setProperty("border", "1px solid rgb(0 107 170 / 32%)", "important");
    element.style.setProperty("border-radius", "18px", "important");
    element.style.setProperty("background", "radial-gradient(circle at 20% 10%, rgb(0 143 255 / 20%), transparent 34%), radial-gradient(circle at 85% 20%, rgba(70, 130, 255, 0.18), transparent 32%), radial-gradient(circle at 50% 100%, rgb(0 90 255 / 14%), transparent 42%), rgb(5 10 14 / 72%)", "important");
    element.style.setProperty("box-shadow", "0 18px 45px rgba(0, 0, 0, 0.34), 0 0 28px rgb(80 120 174 / 24%), inset 0 1px 0 rgba(255, 255, 255, 0.16), inset 0 0 26px rgb(0 90 170 / 10%)", "important");
    element.style.setProperty("backdrop-filter", "blur(16px) saturate(1.35)", "important");
    element.style.setProperty("-webkit-backdrop-filter", "blur(16px) saturate(1.35)", "important");
    element.style.setProperty("transition", "border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease", "important");
  }

  function applyOverrides() {
    applyScheduled = false;
    injectHiddenElementCss();

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

    document.querySelectorAll(providerCardSelector).forEach(styleProviderCard);

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
    applyOverrides();
    return;
  }

  var link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-esportes-css", "true");
  document.head.appendChild(link);

  applyOverrides();

  new MutationObserver(scheduleApplyOverrides).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "style"],
    childList: true,
    subtree: true
  });
})();
