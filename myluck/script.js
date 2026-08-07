(function () {
  "use strict";

  var BUTTON_SELECTOR = '[data-mj="register-button"]';
  var READY_ATTR = "data-myluck-3d-register-ready";
  var OVERLAY_ATTR = "data-myluck-3d-enhancement";

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function createLetters(text) {
    return String(text)
      .split("")
      .map(function (letter, index) {
        return (
          '<span data-label="' +
          escapeHtml(letter) +
          '" style="--i:' +
          (index + 1) +
          '">' +
          escapeHtml(letter) +
          "</span>"
        );
      })
      .join("");
  }

  function getRegisterButtonMarkup() {
    return (
      '<span class="myluck-3d-overlay" ' +
      OVERLAY_ATTR +
      '="true" aria-hidden="true">' +
      '<span class="myluck-3d-bg"></span>' +
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 342 208" height="208" width="342" class="myluck-3d-splash" aria-hidden="true" focusable="false">' +
      '<path stroke-linecap="round" stroke-width="3" d="M54.1054 99.7837C54.1054 99.7837 40.0984 90.7874 26.6893 97.6362C13.2802 104.485 1.5 97.6362 1.5 97.6362"></path>' +
      '<path stroke-linecap="round" stroke-width="3" d="M285.273 99.7841C285.273 99.7841 299.28 90.7879 312.689 97.6367C326.098 104.486 340.105 95.4893 340.105 95.4893"></path>' +
      '<path stroke-linecap="round" stroke-width="3" stroke-opacity="0.3" d="M281.133 64.9917C281.133 64.9917 287.96 49.8089 302.934 48.2295C317.908 46.6501 319.712 36.5272 319.712 36.5272"></path>' +
      '<path stroke-linecap="round" stroke-width="3" stroke-opacity="0.3" d="M281.133 138.984C281.133 138.984 287.96 154.167 302.934 155.746C317.908 157.326 319.712 167.449 319.712 167.449"></path>' +
      '<path stroke-linecap="round" stroke-width="3" d="M230.578 57.4476C230.578 57.4476 225.785 41.5051 236.061 30.4998C246.337 19.4945 244.686 12.9998 244.686 12.9998"></path>' +
      '<path stroke-linecap="round" stroke-width="3" d="M230.578 150.528C230.578 150.528 225.785 166.471 236.061 177.476C246.337 188.481 244.686 194.976 244.686 194.976"></path>' +
      '<path stroke-linecap="round" stroke-width="3" stroke-opacity="0.3" d="M170.392 57.0278C170.392 57.0278 173.89 42.1322 169.571 29.54C165.252 16.9478 168.751 2.05227 168.751 2.05227"></path>' +
      '<path stroke-linecap="round" stroke-width="3" stroke-opacity="0.3" d="M170.392 150.948C170.392 150.948 173.89 165.844 169.571 178.436C165.252 191.028 168.751 205.924 168.751 205.924"></path>' +
      '<path stroke-linecap="round" stroke-width="3" d="M112.609 57.4476C112.609 57.4476 117.401 41.5051 107.125 30.4998C96.8492 19.4945 98.5 12.9998 98.5 12.9998"></path>' +
      '<path stroke-linecap="round" stroke-width="3" d="M112.609 150.528C112.609 150.528 117.401 166.471 107.125 177.476C96.8492 188.481 98.5 194.976 98.5 194.976"></path>' +
      '<path stroke-linecap="round" stroke-width="3" stroke-opacity="0.3" d="M62.2941 64.9917C62.2941 64.9917 55.4671 49.8089 40.4932 48.2295C25.5194 46.6501 23.7159 36.5272 23.7159 36.5272"></path>' +
      '<path stroke-linecap="round" stroke-width="3" stroke-opacity="0.3" d="M62.2941 145.984C62.2941 145.984 55.4671 161.167 40.4932 162.746C25.5194 164.326 23.7159 174.449 23.7159 174.449"></path>' +
      "</svg>" +
      '<span class="myluck-3d-wrap" data-myluck-3d-inner="true">' +
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 221 42" height="42" width="221" class="myluck-3d-path" aria-hidden="true" focusable="false">' +
      '<path stroke-linecap="round" stroke-width="3" d="M182.674 2H203C211.837 2 219 9.16344 219 18V24C219 32.8366 211.837 40 203 40H18C9.16345 40 2 32.8366 2 24V18C2 9.16344 9.16344 2 18 2H47.8855"></path>' +
      "</svg>" +
      '<span class="myluck-3d-outline" aria-hidden="true"></span>' +
      '<span class="myluck-3d-content">' +
      '<span class="myluck-3d-char myluck-3d-state-1">' +
      createLetters("JoinToday") +
      "</span>" +
      '<span class="myluck-3d-icon" aria-hidden="true"><span></span></span>' +
      '<span class="myluck-3d-char myluck-3d-state-2">' +
      createLetters("JoinNow") +
      "</span>" +
      "</span>" +
      "</span>" +
      "</span>"
    );
  }

  function createEnhancement() {
    var template = document.createElement("template");
    template.innerHTML = getRegisterButtonMarkup();
    return template.content.firstElementChild;
  }

  function enhanceButton(button) {
    if (!button || button.nodeType !== 1) {
      return;
    }

    if (
      button.getAttribute(READY_ATTR) === "true" &&
      button.querySelector("[" + OVERLAY_ATTR + "='true']")
    ) {
      return;
    }

    if (!button.hasAttribute("data-myluck-original-label")) {
      button.setAttribute(
        "data-myluck-original-label",
        (button.textContent || "").trim() || "Register"
      );
    }

    button.classList.add("myluck-3d-button");
    button.setAttribute(READY_ATTR, "true");
    button.setAttribute("aria-label", "Join now");

    if (!button.querySelector("[" + OVERLAY_ATTR + "='true']")) {
      button.appendChild(createEnhancement());
    }
  }

  function enhanceAll() {
    document.querySelectorAll(BUTTON_SELECTOR).forEach(enhanceButton);
  }

  function start() {
    enhanceAll();

    var scheduled = false;
    var observer = new MutationObserver(function () {
      if (scheduled) {
        return;
      }

      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        enhanceAll();
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
