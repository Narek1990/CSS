(function () {
  "use strict";

  var observer;
  var scheduled = false;
  var delayedRun = 0;
  var modalSelector = [
    '[data-mj="auth-modal"]',
    '.modal[role="alertdialog"]',
    '[role="alertdialog"]',
    '[aria-modal="true"]',
    '.css-1fg8vzl'
  ].join(", ");
  var tablistSelector = [
    'ul[role="tablist"].app-ltr-17pv0q3',
    'ul[role="tablist"].css-17pv0q3',
    'ul[role="tablist"]'
  ].join(", ");
  var tabButtonSelector = 'li[role="presentation"] > button[role="tab"], button[role="tab"]';
  var initializedAttr = "data-marakibet-auth-tabs-initialized";

  function getButtonText(button) {
    return (button && button.textContent ? button.textContent : "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function isEmailTab(text) {
    return text === "email" || text === "e-mail" || text === "e-posta";
  }

  function isPhoneTab(text) {
    return text === "phone" || text === "telefon" || text === "telephone" || text === "phone number";
  }

  function getTabButtons(tablist) {
    return Array.prototype.slice.call(tablist.querySelectorAll(tabButtonSelector));
  }

  function findButtons(tablist) {
    var buttons = getTabButtons(tablist);
    var emailButton = buttons.find(function (button) {
      return isEmailTab(getButtonText(button));
    });
    var phoneButton = buttons.find(function (button) {
      return isPhoneTab(getButtonText(button));
    });

    return {
      emailButton: emailButton,
      phoneButton: phoneButton
    };
  }

  function getTabItem(button) {
    return button ? button.closest('li[role="presentation"]') || button : null;
  }

  function reorderTabs(tablist, phoneButton, emailButton) {
    if (!tablist || !phoneButton || !emailButton) {
      return;
    }

    var phoneItem = getTabItem(phoneButton);
    var emailItem = getTabItem(emailButton);

    if (!phoneItem || !emailItem || phoneItem === emailItem) {
      return;
    }

    if (tablist.firstElementChild !== phoneItem) {
      tablist.insertBefore(phoneItem, emailItem);
    }
  }

  function initializeTabState(tablist) {
    if (!tablist) {
      return;
    }

    var buttonSet = findButtons(tablist);
    var emailButton = buttonSet.emailButton;
    var phoneButton = buttonSet.phoneButton;

    if (!emailButton || !phoneButton) {
      return;
    }

    reorderTabs(tablist, phoneButton, emailButton);

    if (tablist.getAttribute(initializedAttr) === "true") {
      return;
    }

    if (phoneButton.getAttribute("aria-current") !== "page") {
      phoneButton.click();
    }

    tablist.setAttribute(initializedAttr, "true");
  }

  function handleModal(modal) {
    var tablists = Array.prototype.slice.call(modal.querySelectorAll(tablistSelector));
    tablists.forEach(initializeTabState);
  }

  function run() {
    scheduled = false;

    Array.prototype.slice.call(document.querySelectorAll(modalSelector)).forEach(handleModal);

    if (delayedRun) {
      window.clearTimeout(delayedRun);
    }

    delayedRun = window.setTimeout(function () {
      Array.prototype.slice.call(document.querySelectorAll(modalSelector)).forEach(handleModal);
    }, 120);
  }

  function scheduleRun() {
    if (scheduled) {
      return;
    }

    scheduled = true;
    window.requestAnimationFrame(run);
  }

  function init() {
    scheduleRun();

    observer = new MutationObserver(function () {
      scheduleRun();
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "aria-current", "aria-modal"]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
