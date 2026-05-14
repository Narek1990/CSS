(function () {
  "use strict";

  var observer;
  var maxAttempts = 12;
  var tablistSelector = 'ul[role="tablist"].app-ltr-17pv0q3, ul[role="tablist"].css-17pv0q3';
  var tabButtonSelector =
    'li[role="presentation"] > button[role="tab"]';

  function getButtonText(button) {
    return (button && button.textContent ? button.textContent : "").trim().toLowerCase();
  }

  function getTabState(tablist) {
    var buttons = Array.prototype.slice.call(tablist.querySelectorAll(tabButtonSelector));
    var emailButton = buttons.find(function (button) {
      return getButtonText(button) === "email";
    });
    var phoneButton = buttons.find(function (button) {
      return getButtonText(button) === "phone";
    });

    if (!emailButton || !phoneButton) {
      return null;
    }

    var emailItem = emailButton.closest('li[role="presentation"]');
    var phoneItem = phoneButton.closest('li[role="presentation"]');

    if (!emailItem || !phoneItem) {
      return null;
    }

    return {
      emailButton: emailButton,
      phoneButton: phoneButton,
      emailItem: emailItem,
      phoneItem: phoneItem,
      phoneFirst: tablist.firstElementChild === phoneItem,
      phoneActive: phoneButton.getAttribute("aria-current") === "page"
    };
  }

  function markDone(tablist) {
    tablist.setAttribute("data-rema-phone-applied", "true");
  }

  function enforceTabState(tablist, attempt) {
    if (!tablist) {
      return;
    }

    if (tablist.getAttribute("data-rema-phone-applied") === "true") {
      return;
    }

    var state = getTabState(tablist);

    if (!state) {
      return;
    }

    if (!state.phoneFirst) {
      tablist.insertBefore(state.phoneItem, state.emailItem);
    }

    if (!state.phoneActive) {
      state.phoneButton.click();
    }

    state = getTabState(tablist);

    if (state && state.phoneFirst && state.phoneActive) {
      markDone(tablist);
      return;
    }

    if (attempt < maxAttempts) {
      window.setTimeout(function () {
        enforceTabState(tablist, attempt + 1);
      }, 80);
    }
  }

  function findTablistFromNode(node) {
    if (!node || node.nodeType !== 1) {
      return null;
    }

    if (node.matches && node.matches(tablistSelector)) {
      return node;
    }

    if (node.closest) {
      var closestTablist = node.closest(tablistSelector);
      if (closestTablist) {
        return closestTablist;
      }
    }

    if (node.querySelector) {
      return node.querySelector(tablistSelector);
    }

    return null;
  }

  function init() {
    var initialTablist = document.querySelector(tablistSelector);
    if (initialTablist) {
      enforceTabState(initialTablist, 0);
    }

    observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i += 1) {
        for (var j = 0; j < mutations[i].addedNodes.length; j += 1) {
          var tablist = findTablistFromNode(mutations[i].addedNodes[j]);
          if (tablist) {
            enforceTabState(tablist, 0);
            return;
          }
        }
      }
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
