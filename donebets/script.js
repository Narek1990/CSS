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

        if (actions.querySelector('[data-inancbet-slider-controls="true"]')) return;

        previousButton = cloneArrow("left");
        nextButton = cloneArrow("right");
        if (!previousButton || !nextButton) return;

        controls = document.createElement("div");
        controls.className = "inancbet-slider-controls";
        controls.setAttribute("data-inancbet-slider-controls", "true");
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
    var observer = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        addSliderButtons();
      });
    });

    function initSliderButtons() {
      observer.observe(document.body, { childList: true, subtree: true });
      addSliderButtons();
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

        if (mutation.type === "characterData" && mutation.target && mutation.target.parentElement) {
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
    var observer = new MutationObserver(function () {
      if (scheduled) return;

      scheduled = true;
      requestAnimationFrame(function () {
        scheduled = false;
        addHeaderActions();
      });
    });

    function init() {
      addHeaderActions();
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
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
})();
