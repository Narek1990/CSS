(function () {
  "use strict";

  var notVerifiedSelector = "a.app-ltr-1a59aej, a.app-rtl-1a59aej";
  var statusCardSelector = ".app-ltr-1mfp3qc, .app-rtl-1mfp3qc";
  var depositButtonSelector = 'button[aria-label="deposit"][name="deposit"].sl-icon';
  var vipImageSrc = (function () {
    var scriptSource = document.currentScript && document.currentScript.src;

    try {
      if (scriptSource) {
        return new URL("assets/vip-button.png", scriptSource).href;
      }
    } catch (error) {
      /* Fall through to the public CDN URL. */
    }

    return "https://cdn.jsdelivr.net/gh/Narek1990/CSS@refs/heads/main/donebets/assets/vip-button.png";
  })();
  var depositIconSrc = (function () {
    var scriptSource = document.currentScript && document.currentScript.src;

    try {
      if (scriptSource) {
        return new URL("assets/deposit-icon.png", scriptSource).href;
      }
    } catch (error) {
      /* Fall through to the public CDN URL. */
    }

    return "https://cdn.jsdelivr.net/gh/Narek1990/CSS@refs/heads/main/donebets/assets/deposit-icon.png";
  })();
  var observer;
  var relevantMutationListeners = [];
  var relevantMutationObserver;

  function mutationTouchesSelector(mutation, selector) {
    var target =
      mutation.target && mutation.target.nodeType === 1
        ? mutation.target
        : mutation.target && mutation.target.parentElement;

    if (target && target.closest && target.closest(selector)) {
      return true;
    }

    return Array.from(mutation.addedNodes).some(function (node) {
      return (
        node.nodeType === 1 &&
        ((node.matches && node.matches(selector)) ||
          (node.querySelector && node.querySelector(selector)))
      );
    });
  }

  function observeRelevantMutations(selector, callback) {
    relevantMutationListeners.push({
      selector: selector,
      callback: callback
    });

    if (relevantMutationObserver) {
      return;
    }

    relevantMutationObserver = new MutationObserver(function (mutations) {
      relevantMutationListeners.forEach(function (listener) {
        if (
          mutations.some(function (mutation) {
            return mutationTouchesSelector(mutation, listener.selector);
          })
        ) {
          listener.callback();
        }
      });
    });

    relevantMutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function normalizeText(node) {
    return (node && node.textContent ? node.textContent : "").replace(/\s+/g, " ").trim();
  }

  function buildContactDetailsHref() {
    var url = new URL(window.location.href);
    url.searchParams.set("m", "account");
    url.searchParams.set("t", "contact_details");
    return url.pathname + url.search + url.hash;
  }

  function enhanceNotVerifiedLink(anchor) {
    var value;

    if (!anchor) {
      return;
    }

    value = (anchor.textContent || "").trim().toLowerCase();

    if (value !== "not verified") {
      return;
    }

    anchor.href = buildContactDetailsHref();
    anchor.setAttribute("data-donebets-contact-link", "true");
    anchor.style.setProperty("cursor", "pointer", "important");
  }

  function enhanceDepositButton(button) {
    var image;
    var label;
    var children;

    if (!button) {
      return;
    }

    image = button.querySelector('img[data-donebets-deposit-icon="true"]');
    label = button.querySelector('[data-donebets-deposit-label="true"]');

    if (
      button.getAttribute("data-donebets-deposit-ready") === "true" &&
      image &&
      label &&
      image.getAttribute("src") === depositIconSrc &&
      label.textContent === "DEPOSIT" &&
      button.childNodes.length === 2 &&
      button.firstChild === image &&
      button.lastChild === label
    ) {
      return;
    }

    if (!image) {
      image = document.createElement("img");
    }

    if (!label) {
      label = document.createElement("span");
    }

    image.src = depositIconSrc;
    image.alt = "";
    image.className = "donebets-deposit-icon";
    image.setAttribute("data-donebets-deposit-icon", "true");
    image.decoding = "async";
    image.loading = "eager";

    label.className = "donebets-deposit-label";
    label.setAttribute("data-donebets-deposit-label", "true");
    label.textContent = "DEPOSIT";

    children = Array.prototype.slice.call(button.childNodes);
    children.forEach(function (child) {
      if (child !== image && child !== label) {
        button.removeChild(child);
      }
    });

    if (button.firstChild !== image) {
      button.insertBefore(image, button.firstChild);
    }

    if (image.nextSibling !== label) {
      button.insertBefore(label, image.nextSibling);
    }

    button.classList.add("donebets-deposit-button");
    button.setAttribute("data-donebets-deposit-ready", "true");
  }

  function isMyStatusLabel(element) {
    return element && element.tagName === "P" && normalizeText(element) === "My Status";
  }

  function isVipStatusValue(element) {
    return element && element.tagName === "P" && normalizeText(element) === "VIP";
  }

  function enhanceVipStatusCard(card) {
    var label;
    var value;
    var image;

    if (!card || !card.querySelectorAll || card.getAttribute("data-donebets-vip-status-ready") === "true") {
      return;
    }

    card.querySelectorAll("p").forEach(function (paragraph) {
      if (!label && isMyStatusLabel(paragraph)) {
        label = paragraph;
      }

      if (!value && isVipStatusValue(paragraph)) {
        value = paragraph;
      }
    });

    if (!label || !value || value.querySelector("[data-donebets-vip-status-image]")) {
      return;
    }

    image = document.createElement("img");
    image.src = vipImageSrc;
    image.alt = "VIP";
    image.className = "donebets-vip-status-image";
    image.setAttribute("data-donebets-vip-status-image", "true");
    image.setAttribute("fetchpriority", "high");
    image.decoding = "async";
    image.loading = "eager";

    if (label.parentNode) {
      label.parentNode.removeChild(label);
    }

    if (value.parentNode) {
      value.parentNode.replaceChild(image, value);
    }
    card.setAttribute("data-donebets-vip-status-ready", "true");
  }

  function enhanceVipStatusFromText(root) {
    if (!root || !root.querySelectorAll) {
      return;
    }

    root.querySelectorAll("p").forEach(function (paragraph) {
      var text = normalizeText(paragraph);

      if ((text === "My Status" || text === "VIP") && paragraph.parentElement) {
        enhanceVipStatusCard(paragraph.parentElement);
      }
    });
  }

  function applyToNode(node) {
    if (!node || (node.nodeType !== 1 && node.nodeType !== 9)) {
      return;
    }

    if (node.matches && node.matches(notVerifiedSelector)) {
      enhanceNotVerifiedLink(node);
    }

    if (node.matches && node.matches(depositButtonSelector)) {
      enhanceDepositButton(node);
    }

    if (node.querySelectorAll) {
      node.querySelectorAll(notVerifiedSelector).forEach(enhanceNotVerifiedLink);
      node.querySelectorAll(depositButtonSelector).forEach(enhanceDepositButton);
    }

    if (node.matches && node.matches(statusCardSelector)) {
      enhanceVipStatusCard(node);
    }

    if (node.closest) {
      enhanceVipStatusCard(node.closest(statusCardSelector));
    }

    if (node.tagName === "P" && node.parentElement) {
      enhanceVipStatusCard(node.parentElement);
    }

    if (node.querySelectorAll) {
      node.querySelectorAll(statusCardSelector).forEach(enhanceVipStatusCard);
      enhanceVipStatusFromText(node);
    }
  }

  (function () {
    "use strict";

    var eventsSelector = '[data-mj="widget-phoenix-sport-container"] #ph-sport-widget .top-events';

    function findEvents(header, index) {
      var root = header.parentElement;
      var events;

      while (root && root !== document.body) {
        events = root.querySelector(eventsSelector);
        if (events) return events;
        root = root.parentElement;
      }

      return document.querySelectorAll(eventsSelector)[index] || null;
    }

    function cloneArrow(direction) {
      var name = "arrow_" + direction;
      var source = document.querySelector(
        'button[aria-label="' + name + '"][name="' + name + '"].sl-icon:not([data-inancbet-slider-control])'
      );
      var button;

      if (!source) return null;

      button = source.cloneNode(true);
      button.removeAttribute("id");
      button.removeAttribute("aria-controls");
      button.removeAttribute("data-state");
      button.removeAttribute("disabled");
      button.removeAttribute("aria-disabled");
      button.disabled = false;
      button.type = "button";
      button.tabIndex = 0;
      button.setAttribute("data-inancbet-slider-control", direction);
      button.classList.add("inancbet-slider-control");
      return button;
    }

    function scrollEvents(events, direction) {
      var card = events.querySelector(".ph-event-card");
      var styles = window.getComputedStyle(events);
      var gap = parseFloat(styles.columnGap || styles.gap) || 24;
      var distance = (card ? card.getBoundingClientRect().width : 420) + gap;

      events.scrollBy({ left: direction * distance, behavior: "smooth" });
    }

    function enableMouseDrag(events) {
      var dragging = false;
      var moved = false;
      var suppressClick = false;
      var startX = 0;
      var startScrollLeft = 0;

      if (events.getAttribute("data-inancbet-mouse-drag") === "true") return;

      events.setAttribute("data-inancbet-mouse-drag", "true");
      events.classList.add("inancbet-mouse-drag");

      events.addEventListener("pointerdown", function (event) {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        dragging = true;
        moved = false;
        startX = event.clientX;
        startScrollLeft = events.scrollLeft;
      });

      events.addEventListener("pointermove", function (event) {
        var distance;

        if (!dragging) return;
        distance = event.clientX - startX;
        if (!moved && Math.abs(distance) > 4) {
          moved = true;
          events.setPointerCapture(event.pointerId);
          events.classList.add("is-dragging");
        }
        if (!moved) return;
        event.preventDefault();
        events.scrollLeft = startScrollLeft - distance;
      });

      function stopDragging(event) {
        if (!dragging) return;
        dragging = false;
        suppressClick = moved;
        events.classList.remove("is-dragging");

        if (events.hasPointerCapture(event.pointerId)) {
          events.releasePointerCapture(event.pointerId);
        }

        window.setTimeout(function () {
          suppressClick = false;
        }, 0);
      }

      window.addEventListener("pointerup", stopDragging);
      window.addEventListener("pointercancel", stopDragging);
      events.addEventListener("click", function (event) {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
      }, true);
    }

    function addSliderButtons() {
      document.querySelectorAll('[data-mj="widget-phoenix-sport-header"]').forEach(function (header, index) {
        var actions = header.querySelector(".app-ltr-1dzjkmt, .app-rtl-1dzjkmt");
        var allLink = actions && actions.querySelector(".app-ltr-1qyij3p, .app-rtl-1qyij3p");
        var events = findEvents(header, index);
        var previousButton;
        var nextButton;
        var controls;

        if (!actions || !allLink || !events) return;

        enableMouseDrag(events);

        controls = actions.querySelector('[data-inancbet-slider-controls="true"]');
        if (controls) {
          controls.setAttribute("dir", "ltr");
          controls.style.direction = "ltr";
          return;
        }

        previousButton = cloneArrow("left");
        nextButton = cloneArrow("right");
        if (!previousButton || !nextButton) return;

        controls = document.createElement("div");
        controls.className = "inancbet-slider-controls";
        controls.setAttribute("data-inancbet-slider-controls", "true");
        controls.setAttribute("dir", "ltr");
        controls.style.direction = "ltr";
        previousButton.addEventListener("click", function () {
          var currentEvents = findEvents(header, index);
          if (currentEvents) scrollEvents(currentEvents, -1);
        });
        nextButton.addEventListener("click", function () {
          var currentEvents = findEvents(header, index);
          if (currentEvents) scrollEvents(currentEvents, 1);
        });
        controls.append(previousButton, nextButton);
        actions.insertBefore(controls, allLink.nextSibling);
      });
    }

    var scheduled = false;
    function scheduleSliderUpdate() {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        addSliderButtons();
      });
    }

    function initSliderButtons() {
      addSliderButtons();
      observeRelevantMutations(
        '[data-mj="widget-phoenix-sport-header"],' +
          '[data-mj="widget-phoenix-sport-container"],' +
          'button[aria-label="arrow_left"][name="arrow_left"].sl-icon,' +
          'button[aria-label="arrow_right"][name="arrow_right"].sl-icon',
        scheduleSliderUpdate
      );
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initSliderButtons, { once: true });
    } else {
      initSliderButtons();
    }
  })();

  function observe() {
    if (observer) {
      return;
    }

    observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(applyToNode);

        if (
          mutation.type === "characterData" &&
          mutation.target &&
          mutation.target.parentElement &&
          /^(not verified|my status|vip)$/i.test(
            normalizeText(mutation.target.parentElement)
          )
        ) {
          applyToNode(mutation.target.parentElement);
        }
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  applyToNode(document);
  observe();


  /*
   * Keep Cashback as a real top-level item directly below Notifications.
   * Donebets renders more than one account menu and may recreate them, so
   * this enhancement is applied independently to every menu instance.
   */
  (function () {
    "use strict";

    var accountMenuSelector = '[data-mj="account-menu"]';
    var accountItemSelector = '[data-mj="account-menu-item"]';
    var notificationSelector = '[data-mj="notifications-item"]';
    var cashbackHrefSelector = 'a[href*="instant_cashback"]';
    var cashbackStyleId = "donebets-cashback-menu-styles";
    var scheduled = false;

    function installCashbackStyles() {
      var style = document.getElementById(cashbackStyleId);

      if (!style) {
        style = document.createElement("style");
        style.id = cashbackStyleId;
        (document.head || document.documentElement).appendChild(style);
      }

      style.textContent =
        '[data-donebets-cashback-link="true"]{' +
        "border-radius:8px;" +
        "transition:color .16s ease;" +
        "}" +
        '[data-donebets-cashback-item="true"][data-donebets-active="true"] ' +
        '[data-donebets-cashback-link="true"]{' +
        "color:#ff5b22!important;" +
        "background-color:transparent!important;" +
        "}" +
        '[data-donebets-cashback-item="true"][data-donebets-active="true"] ' +
        '[data-donebets-cashback-link="true"] *{' +
        "color:inherit!important;" +
        "}" +
        '[data-donebets-bonuses-inactive="true"],' +
        '[data-donebets-bonuses-inactive="true"] *{' +
        "color:var(--donebets-menu-inactive-color,#f5f5f5)!important;" +
        "-webkit-text-fill-color:var(--donebets-menu-inactive-color,#f5f5f5)!important;" +
        "background-color:transparent!important;" +
        "}" +
        '[data-donebets-bonuses-inactive="true"] [fill]:not([fill="none"]){' +
        "fill:var(--donebets-menu-inactive-color,#f5f5f5)!important;" +
        "}" +
        '[data-donebets-bonuses-inactive="true"] [stroke]:not([stroke="none"]){' +
        "stroke:var(--donebets-menu-inactive-color,#f5f5f5)!important;" +
        "}" +
        '[data-donebets-bonuses-inactive="true"]::before,' +
        '[data-donebets-bonuses-inactive="true"]::after,' +
        '[data-donebets-bonuses-inactive="true"] *::before,' +
        '[data-donebets-bonuses-inactive="true"] *::after{' +
        "color:var(--donebets-menu-inactive-color,#f5f5f5)!important;" +
        "-webkit-text-fill-color:var(--donebets-menu-inactive-color,#f5f5f5)!important;" +
        "background-color:transparent!important;" +
        "}";
    }

    function normalizeText(element) {
      return (element && element.textContent ? element.textContent : "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
    }

    function belongsToMenu(element, menu) {
      return element && element.closest(accountMenuSelector) === menu;
    }

    function findOriginalCashbackItems(menu) {
      return Array.from(menu.querySelectorAll(accountItemSelector)).filter(function (item) {
        return (
          belongsToMenu(item, menu) &&
          (item.querySelector(cashbackHrefSelector) ||
            /\bcashback\b/.test(normalizeText(item)))
        );
      });
    }

    function buildCashbackHref() {
      var url = new URL(window.location.href);

      url.searchParams.set("m", "account");
      url.searchParams.set("t", "instant_cashback");

      return url.pathname + url.search + url.hash;
    }

    function isCashbackRoute() {
      return new URL(window.location.href).searchParams.get("t") ===
        "instant_cashback";
    }

    function syncCashbackActiveState() {
      var active = isCashbackRoute();

      document
        .querySelectorAll('[data-donebets-cashback-item="true"]')
        .forEach(function (item) {
          var link = item.querySelector(
            '[data-donebets-cashback-link="true"]'
          );

          item.setAttribute("data-donebets-active", String(active));

          if (!link) {
            return;
          }

          if (active) {
            link.setAttribute("aria-current", "page");
          } else {
            link.removeAttribute("aria-current");
          }
        });

      document.querySelectorAll(accountMenuSelector).forEach(function (menu) {
        var notification = menu.querySelector(notificationSelector);
        var notificationLink = notification && notification.querySelector("a");
        var notificationLabel =
          notification &&
          Array.from(notification.querySelectorAll("p, span")).find(
            function (label) {
              return normalizeText(label) === "notifications";
            }
          );
        var inactiveColor = notificationLabel
          ? window.getComputedStyle(notificationLabel).color
          : notificationLink
            ? window.getComputedStyle(notificationLink).color
          : "#f5f5f5";

        menu.querySelectorAll(accountItemSelector).forEach(function (item) {
          var labels = Array.from(item.querySelectorAll("p, span")).filter(
            function (label) {
              return normalizeText(label) === "bonuses";
            }
          );
          var isBonuses = labels.length > 0;

          if (active && isBonuses) {
            item.setAttribute("data-donebets-bonuses-inactive", "true");
            item.style.setProperty(
              "--donebets-menu-inactive-color",
              inactiveColor
            );
            labels.forEach(function (label) {
              var control = label.closest("a, button, [role='button']");

              label.setAttribute(
                "data-donebets-bonuses-inactive",
                "true"
              );

              if (control) {
                control.setAttribute(
                  "data-donebets-bonuses-inactive",
                  "true"
                );
                control.removeAttribute("aria-current");
                control.setAttribute("aria-selected", "false");
              }
            });
          } else {
            item.removeAttribute("data-donebets-bonuses-inactive");
            item.style.removeProperty("--donebets-menu-inactive-color");
            item
              .querySelectorAll(
                '[data-donebets-bonuses-inactive="true"]'
              )
              .forEach(function (element) {
                element.removeAttribute(
                  "data-donebets-bonuses-inactive"
                );
              });
          }
        });
      });
    }

    function dismissAccountDropdown() {
      var keyboardEvent;
      var mouseOptions = {
        bubbles: true,
        cancelable: true,
        view: window
      };

      keyboardEvent = new window.KeyboardEvent("keydown", {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true
      });

      document.dispatchEvent(keyboardEvent);
      document.body.dispatchEvent(
        new window.MouseEvent("mousedown", mouseOptions)
      );
      document.body.dispatchEvent(
        new window.MouseEvent("mouseup", mouseOptions)
      );
      document.body.dispatchEvent(
        new window.MouseEvent("click", mouseOptions)
      );
    }

    function navigateToCashback(event) {
      var link = event.currentTarget;
      var target;
      var route;
      var navigationEvent;

      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      target = new URL(link.href, window.location.href);

      if (target.origin !== window.location.origin) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      dismissAccountDropdown();
      route = target.pathname + target.search + target.hash;
      window.history.pushState(window.history.state, "", route);
      syncCashbackActiveState();

      if (typeof window.PopStateEvent === "function") {
        navigationEvent = new window.PopStateEvent("popstate", {
          state: window.history.state
        });
      } else {
        navigationEvent = new window.Event("popstate");
      }

      window.dispatchEvent(navigationEvent);
    }

    function createCashbackIcon() {
      var icon = document.createElement("i");

      icon.className = "sl-icon donebets-cashback-icon";
      icon.setAttribute("role", "img");
      icon.setAttribute("aria-label", "cashback");
      icon.setAttribute("name", "cashback");
      icon.setAttribute("data-donebets-cashback-icon", "true");
      icon.style.display = "inline-flex";
      icon.style.alignItems = "center";
      icon.style.justifyContent = "center";
      icon.style.width = "24px";
      icon.style.height = "24px";
      icon.style.minWidth = "24px";
      icon.style.color = "inherit";
      icon.style.flexShrink = "0";
      icon.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
        '<path fill="currentColor" d="M12.89 11.1c-1.78-.59-2.64-.96-2.64-1.9 0-1.02 1.11-1.39 1.81-1.39 1.31 0 1.79.99 1.9 1.34l1.58-.67C15.39 8.03 14.72 6.56 13 6.24V5h-2v1.26C8.52 6.82 8.51 9.12 8.51 9.22c0 2.27 2.25 2.91 3.35 3.31 1.58.56 2.28 1.07 2.28 2.03 0 1.13-1.05 1.61-1.98 1.61-1.82 0-2.34-1.87-2.4-2.09l-1.66.67c.63 2.19 2.28 2.78 2.9 2.96V19h2v-1.24c.4-.09 2.9-.59 2.9-3.22 0-1.39-.61-2.61-3.01-3.44zM3 21H1v-6h6v2H4.52A9 9 0 0 0 21 12h2c0 6.08-4.92 11-11 11-3.72 0-7.01-1.85-9-4.67V21zM1 12C1 5.92 5.92 1 12 1c3.72 0 7.01 1.85 9 4.67V3h2v6h-6V7h2.48A9 9 0 0 0 3 12H1z"/>' +
        "</svg>";

      return icon;
    }

    function createCashbackItem(notification, href) {
      var item = notification.cloneNode(true);
      var link = item.querySelector("a");
      var content = link && link.firstElementChild;
      var label;
      var oldIcon;

      if (!link || !content) {
        return null;
      }

      Array.from(link.children).forEach(function (child) {
        if (child !== content) {
          child.remove();
        }
      });

      oldIcon = content.querySelector("i, img");

      if (oldIcon) {
        oldIcon.replaceWith(createCashbackIcon());
      } else {
        content.insertBefore(createCashbackIcon(), content.firstChild);
      }

      label = content.querySelector("p, span");
      if (label) {
        label.textContent = "Cashback";
      }

      content.style.display = "flex";
      content.style.flexDirection = "row";
      content.style.alignItems = "center";

      item.removeAttribute("data-mj");
      item.removeAttribute("id");
      item.setAttribute("data-donebets-cashback-item", "true");
      item.setAttribute("data-donebets-cashback-version", "6");

      link.removeAttribute("data-mj");
      link.removeAttribute("id");
      link.setAttribute("href", href || buildCashbackHref());
      link.setAttribute("data-donebets-cashback-link", "true");
      link.addEventListener("click", navigateToCashback);

      return item;
    }

    function moveCashback(menu) {
      var notification = Array.from(menu.querySelectorAll(notificationSelector)).find(function (item) {
        return belongsToMenu(item, menu);
      });
      var originals;
      var sourceLink;
      var href;
      var cashback;
      var replacement;

      if (!notification) {
        return;
      }

      originals = findOriginalCashbackItems(menu);
      sourceLink = originals[0] && originals[0].querySelector(cashbackHrefSelector);
      href = sourceLink && sourceLink.getAttribute("href");
      cashback = menu.querySelector('[data-donebets-cashback-item="true"]');

      if (
        !cashback ||
        !belongsToMenu(cashback, menu) ||
        cashback.getAttribute("data-donebets-cashback-version") !== "6" ||
        cashback.className !== notification.className
      ) {
        replacement = createCashbackItem(notification, href);

        if (!replacement) {
          return;
        }

        if (cashback && belongsToMenu(cashback, menu)) {
          cashback.replaceWith(replacement);
        }

        cashback = replacement;
      }

      if (
        cashback.parentElement !== menu ||
        notification.nextElementSibling !== cashback
      ) {
        menu.insertBefore(cashback, notification.nextElementSibling);
      }

      if (href) {
        cashback
          .querySelector('[data-donebets-cashback-link="true"]')
          .setAttribute("href", href);
      }

      originals.forEach(function (item) {
        if (item !== cashback) {
          item.remove();
        }
      });
    }

    function apply() {
      scheduled = false;
      document.querySelectorAll(accountMenuSelector).forEach(moveCashback);
      syncCashbackActiveState();
    }

    function schedule() {
      if (scheduled) {
        return;
      }

      scheduled = true;
      window.requestAnimationFrame(apply);
    }

    installCashbackStyles();
    apply();
    window.addEventListener("popstate", schedule);

    observeRelevantMutations(accountMenuSelector, schedule);
  })();

  (function () {
    "use strict";

    var assetBase =
      "https://cdn.jsdelivr.net/gh/ArturMakaryan/main@6f9baea/Donebets/";

    var actions = [
      {
        label: "Support",
        href: "https://t.me/Donebetsteam",
        icon: "support.svg"
      },
      {
        label: "Telegram",
        href: "https://t.me/Done_Bets_Gaming",
        icon: "telegram-icon.svg"
      }
    ];

    function addHeaderActions() {
      document
        .querySelectorAll('[data-mj="header-left"]')
        .forEach(function (headerLeft) {
          var group;

          if (
            headerLeft.querySelector(
              '[data-donebets-header-actions="true"]'
            )
          ) {
            return;
          }

          group = document.createElement("div");
          group.className = "donebets-header-actions";
          group.setAttribute(
            "data-donebets-header-actions",
            "true"
          );

          actions.forEach(function (action) {
            var link = document.createElement("a");
            var icon = document.createElement("img");

            link.className = "donebets-header-action";
            link.href = action.href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.setAttribute("aria-label", action.label);
            link.title = action.label;

            icon.src = assetBase + action.icon;
            icon.alt = "";
            icon.width = 24;
            icon.height = 24;
            icon.setAttribute("aria-hidden", "true");

            link.appendChild(icon);
            group.appendChild(link);
          });

          headerLeft.appendChild(group);
        });
    }

    var scheduled = false;
    function scheduleHeaderActions() {
      if (scheduled) return;

      scheduled = true;
      requestAnimationFrame(function () {
        scheduled = false;
        addHeaderActions();
      });
    }

    function init() {
      addHeaderActions();
      observeRelevantMutations(
        '[data-mj="header-left"]',
        scheduleHeaderActions
      );
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, {
        once: true
      });
    } else {
      init();
    }
  })();
})();
