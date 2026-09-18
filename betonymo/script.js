(function () {
  "use strict";

  var TARGET_NETWORK = "ERC20";
  var retryTimer = null;
  var pendingSelection = false;
  var keyboardAttempted = false;
  var userInteracted = false;

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

  function isEnforcing() {
    return !userInteracted;
  }

  function cancelRetry() {
    if (retryTimer) {
      window.clearTimeout(retryTimer);
      retryTimer = null;
    }
  }

  function schedule() {
    if (!isEnforcing() || retryTimer || pendingSelection) {
      return;
    }

    retryTimer = window.setTimeout(function () {
      retryTimer = null;
      initializeNetwork();
    }, 300);
  }

  function retry() {
    pendingSelection = false;
    keyboardAttempted = false;

    if (isEnforcing()) {
      schedule();
    }
  }

  function dispatchMouse(target, type) {
    target.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        view: window,
        buttons: 1
      })
    );
  }

  function openControl(control) {
    dispatchMouse(control, "mousedown");
    dispatchMouse(control, "mouseup");
    control.click();
  }

  function selectOption(option) {
    dispatchMouse(option, "mousemove");
    dispatchMouse(option, "mousedown");
    dispatchMouse(option, "mouseup");
    option.click();
  }

  function dispatchKey(target, key, code, keyCode) {
    target.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: key,
        code: code,
        keyCode: keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
      })
    );
  }

  function selectWithKeyboard(field) {
    var input = field.querySelector('input[role="combobox"]');

    if (!input) {
      return false;
    }

    input.focus();
    dispatchKey(input, "Home", "Home", 36);
    dispatchKey(input, "ArrowDown", "ArrowDown", 40);
    dispatchKey(input, "ArrowDown", "ArrowDown", 40);
    dispatchKey(input, "Enter", "Enter", 13);
    return true;
  }

  function waitForOption(field, count) {
    if (!isEnforcing()) {
      pendingSelection = false;
      return;
    }

    var option = getTargetOption();

    if (option) {
      selectOption(option);
      waitForSelection(field, 0);
      return;
    }

    if (count < 40) {
      window.setTimeout(function () {
        waitForOption(field, count + 1);
      }, 50);
      return;
    }

    if (!keyboardAttempted) {
      keyboardAttempted = true;

      if (selectWithKeyboard(field)) {
        waitForSelection(field, 0);
        return;
      }
    }

    retry();
  }

  function waitForSelection(field, count) {
    if (!isEnforcing()) {
      pendingSelection = false;
      return;
    }

    if (getCurrentValue(field) === TARGET_NETWORK) {
      pendingSelection = false;
      keyboardAttempted = false;
      return;
    }

    if (count < 40) {
      window.setTimeout(function () {
        waitForSelection(field, count + 1);
      }, 50);
      return;
    }

    if (!keyboardAttempted) {
      keyboardAttempted = true;

      if (selectWithKeyboard(field)) {
        waitForSelection(field, 0);
        return;
      }
    }

    retry();
  }

  function initializeNetwork() {
    if (!isEnforcing() || pendingSelection) {
      return;
    }

    var field = getNetworkField();

    if (!field) {
      schedule();
      return;
    }

    if (getCurrentValue(field) === TARGET_NETWORK) {
      keyboardAttempted = false;
      return;
    }

    pendingSelection = true;

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

    openControl(control);
    waitForOption(field, 0);
  }

  function handleTrustedInteraction(event) {
    if (!event.isTrusted || userInteracted) {
      return;
    }

    var field = getNetworkField();

    if (field && field.contains(event.target)) {
      userInteracted = true;
      pendingSelection = false;
      cancelRetry();
    }
  }

  function boot() {
    if (!document.body) {
      schedule();
      return;
    }

    document.addEventListener("pointerdown", handleTrustedInteraction, true);
    document.addEventListener("keydown", handleTrustedInteraction, true);

    new MutationObserver(function () {
      if (!isEnforcing()) {
        return;
      }

      var field = getNetworkField();

      if (field && getCurrentValue(field) !== TARGET_NETWORK) {
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
