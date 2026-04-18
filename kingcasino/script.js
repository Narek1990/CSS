(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/kingcasino";

  var href = baseUrl + "/kingcasino.css?v=" + Date.now();
  var existing = document.querySelector("link[data-kingcasino-css=\"true\"]");
  var wideContainerSelector = ".css-11xzi44 .css-1huuf1k";
  var labelSelector = ".css-0 .css-10a4mqi";
  var buttonIconSelector = "button.sl-icon.css-1tev38v, button .sl-icon.css-1tev38v, .sl-icon.css-1tev38v, .sl-icon.css-1tev38v svg";
  var buttonIconSvg = "<svg data-kingcasino-button-svg=\"true\" fill=\"none\" height=\"14\" viewBox=\"0 0 19 14\" width=\"19\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M1.26049 13.5939H8.30622C8.86214 13.5939 9.31284 13.1433 9.31284 12.5874C9.31284 12.0315 8.86214 11.5808 8.30622 11.5808H1.26049C0.70458 11.5808 0.253944 12.0315 0.253944 12.5874C0.253944 13.1433 0.70458 13.5939 1.26049 13.5939ZM1.26049 8.17949H17.365C17.9209 8.17949 18.3715 7.72887 18.3715 7.17296C18.3715 6.61704 17.9209 6.16642 17.365 6.16642H1.26045C0.704542 6.16642 0.253906 6.61704 0.253906 7.17296C0.253906 7.72887 0.70458 8.17949 1.26049 8.17949ZM1.26049 2.76505H17.365C17.9209 2.76505 18.3715 2.31441 18.3715 1.7585C18.3715 1.20259 17.9209 0.751953 17.365 0.751953H1.26045C0.704542 0.751953 0.253906 1.20259 0.253906 1.7585C0.253906 2.31441 0.70458 2.76505 1.26049 2.76505Z\" fill=\"#E8E5FF\"></path></svg>";
  var applyScheduled = false;

  function ensureStylesheet() {
    if (existing) {
      existing.href = href;
      return;
    }

    document.head.appendChild(
      Object.assign(document.createElement("link"), {
        rel: "stylesheet",
        href: href,
        "data-kingcasino-css": "true"
      })
    );
  }

  function createButtonIconSvg() {
    var template = document.createElement("template");
    template.innerHTML = buttonIconSvg;
    return template.content.firstElementChild;
  }

  function setButtonIconPosition(element) {
    if (!element || !element.style) {
      return;
    }

    element.style.setProperty("position", "absolute", "important");
    element.style.setProperty("top", "13px", "important");
    element.style.setProperty("left", "13px", "important");
    element.style.setProperty("right", "auto", "important");
    element.style.setProperty("bottom", "auto", "important");
    element.style.setProperty("min-width", "43px", "important");
    element.style.setProperty("min-height", "47px", "important");
    element.style.setProperty("width", "19px", "important");
    element.style.setProperty("height", "14px", "important");
    element.style.setProperty("z-index", "10", "important");
  }

  function replaceButtonIconSvg(element) {
    var targetSvg = element.matches("svg") ? element : element.querySelector("svg");
    var replacement;

    if (targetSvg && targetSvg.getAttribute("data-kingcasino-button-svg") === "true") {
      setButtonIconPosition(targetSvg);
      return;
    }

    replacement = createButtonIconSvg();

    if (targetSvg) {
      replacement.setAttribute("class", targetSvg.getAttribute("class") || "");
      targetSvg.replaceWith(replacement);
      setButtonIconPosition(replacement);
      return;
    }

    element.appendChild(replacement);
    setButtonIconPosition(replacement);
  }

  function applyOverrides() {
    applyScheduled = false;

    document.querySelectorAll(wideContainerSelector).forEach(function (element) {
      element.style.setProperty("padding", "0", "important");
    });

    document.querySelectorAll(labelSelector).forEach(function (element) {
      element.style.setProperty("width", "181px", "important");
      element.style.setProperty("margin-left", "53px", "important");
    });

    document.querySelectorAll(buttonIconSelector).forEach(function (element) {
      replaceButtonIconSvg(element);

      if (!element.matches("svg")) {
        element.querySelectorAll("svg").forEach(setButtonIconPosition);
      } else {
        setButtonIconPosition(element);
      }
    });
  }

  function scheduleApplyOverrides() {
    if (applyScheduled) {
      return;
    }

    applyScheduled = true;
    requestAnimationFrame(applyOverrides);
  }

  function init() {
    ensureStylesheet();
    applyOverrides();
    new MutationObserver(scheduleApplyOverrides).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
