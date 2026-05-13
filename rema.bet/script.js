(function () {
  "use strict";

  var observer;
  var tablistSelector = 'ul[role="tablist"].app-ltr-17pv0q3, ul[role="tablist"].css-17pv0q3';
  var tabButtonSelector =
    'li.app-ltr-1u3sjyo > button[role="tab"], li.css-1u3sjyo > button[role="tab"]';

  function getButtonText(button) {
    return (button && button.textContent ? button.textContent : "").trim().toLowerCase();
  }

  function activatePhoneTab(tablist) {
    if (!tablist || tablist.getAttribute("data-rema-phone-applied") === "true") {
      return;
    }

    var buttons = Array.prototype.slice.call(
      tablist.querySelectorAll(tabButtonSelector)
    );

    if (buttons.length < 2) {
      return;
    }

    var phoneButton = buttons.find(function (button) {
      return getButtonText(button) === "phone";
    });

    if (!phoneButton) {
      return;
    }

    if (phoneButton.getAttribute("aria-current") !== "page") {
      phoneButton.click();
    }

    tablist.setAttribute("data-rema-phone-applied", "true");
  }

  function scan(root) {
    if (!root || !root.querySelectorAll) {
      return;
    }

    root.querySelectorAll(tablistSelector).forEach(activatePhoneTab);
  }

  function init() {
    scan(document);

    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node && node.nodeType === 1) {
            if (node.matches && node.matches(tablistSelector)) {
              activatePhoneTab(node);
            }

            scan(node);
          }
        });
      });
    });

    observer.observe(document.documentElement, {
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
