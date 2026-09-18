(function () {
  "use strict";

  var TARGET_NETWORK = "ERC20";
  var initialized = false;
  var retryTimer = null;
  var attempts = 0;
  var MAX_ATTEMPTS = 80;

  function getText(node) {
    return node ? node.textContent.replace(/\s+/g, " ").trim() : "";
  }

  function getNetworkField() {
    var labels = document.querySelectorAll("label");

    for (var i = 0; i < labels.length; i += 1) {
      if (getText(labels[i]) !== "Network") {
        continue;
      }

      var fieldId = labels[i].htmlFor;
      var field = fieldId ? document.getElementById(fieldId) : null;

      if (field) {
        return field;
      }
    }

    return null;
  }

  function getCurrentValue(field) {
    return getText(field.querySelector(".sl-select__single-value"));
  }

  function getTargetOption() {
    var options = document.querySelectorAll(
      '[id^="react-select-"][id$="-listbox"] .sl-select__option'
    );

    for (var i = 0; i < options.length; i += 1) {
      if (getText(options[i]) === TARGET_NETWORK) {
        return options[i];
      }
    }

    return null;
  }

  function retry() {
    attempts += 1;

    if (attempts < MAX_ATTEMPTS) {
      schedule();
    }
  }

  function schedule() {
    if (initialized || retryTimer) {
      return;
    }

    retryTimer = window.setTimeout(function () {
      retryTimer = null;
      initializeNetwork();
    }, 250);
  }

  function selectOption(option) {
    option.dispatchEvent(
      new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        view: window
      })
    );
    option.click();
  }

  function waitForOption(field, count) {
    if (initialized) {
      return;
    }

    var option = getTargetOption();

    if (option) {
      selectOption(option);
      waitForSelection(field, 0);
      return;
    }

    if (count < 30) {
      window.setTimeout(function () {
        waitForOption(field, count + 1);
      }, 50);
      return;
    }

    retry();
  }

  function waitForSelection(field, count) {
    if (getCurrentValue(field) === TARGET_NETWORK) {
      initialized = true;
      return;
    }

    if (count < 20) {
      window.setTimeout(function () {
        waitForSelection(field, count + 1);
      }, 50);
      return;
    }

    retry();
  }

  function initializeNetwork() {
    if (initialized) {
      return;
    }

    var field = getNetworkField();

    if (!field) {
      retry();
      return;
    }

    if (getCurrentValue(field) === TARGET_NETWORK) {
      initialized = true;
      return;
    }

    var option = getTargetOption();

    if (option) {
      selectOption(option);
      waitForSelection(field, 0);
      return;
    }

    var control = field.querySelector(".sl-select__control");

    if (!control) {
      retry();
      return;
    }

    control.click();
    waitForOption(field, 0);
  }

  function boot() {
    if (!document.body) {
      schedule();
      return;
    }

    new MutationObserver(function () {
      if (!initialized) {
        schedule();
      }
    }).observe(document.body, {
      childList: true,
      subtree: true
    });

    schedule();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
