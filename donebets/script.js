(function () {
  "use strict";

  var notVerifiedSelector = "a.app-ltr-1a59aej, a.app-rtl-1a59aej";
  var statusCardSelector = ".app-ltr-1mfp3qc, .app-rtl-1mfp3qc";
  var headerSpecialSelector = '[data-mj="header-special-button"]';
  var depositIconSelector = 'button[aria-label="deposit"][name="deposit"], button[name="deposit"].sl-icon';
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
  var wheelImageSrc = (function () {
    var scriptSource = document.currentScript && document.currentScript.src;

    try {
      if (scriptSource) {
        return new URL("assets/wheel_96x96-enhanced.gif", scriptSource).href;
      }
    } catch (error) {
      /* Fall through to the public CDN URL. */
    }

    return "https://cdn.jsdelivr.net/gh/Narek1990/CSS@refs/heads/main/donebets/assets/wheel_96x96-enhanced.gif";
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

  function enhanceHeaderSpecialButton(anchor) {
    var image;

    if (!anchor || !anchor.querySelector) {
      return;
    }

    image = anchor.querySelector("img");

    if (!image) {
      return;
    }

    if (image.getAttribute("data-donebets-special-wheel") !== "true") {
      image.alt = "Special icon";
      image.classList.add("donebets-special-wheel-icon");
      image.setAttribute("data-donebets-special-wheel", "true");
      image.setAttribute("fetchpriority", "high");
      image.decoding = "async";
      image.loading = "eager";
    }

    if (image.parentElement) {
      image.parentElement.classList.add("donebets-special-wheel-wrap");
    }

    if (image.src !== wheelImageSrc) {
      image.removeAttribute("srcset");
      image.src = wheelImageSrc;
    }
  }

  function enhanceDepositIconButton(button) {
    var image;

    if (!button || button.tagName !== "BUTTON") {
      return;
    }

    image = button.querySelector('img[data-donebets-deposit-icon="true"]') || document.createElement("img");
    image.alt = "Deposit";
    image.className = "donebets-deposit-icon";
    image.setAttribute("data-donebets-deposit-icon", "true");
    image.setAttribute("fetchpriority", "high");
    image.decoding = "async";
    image.loading = "eager";

    if (image.src !== wheelImageSrc) {
      image.removeAttribute("srcset");
      image.src = wheelImageSrc;
    }

    button.textContent = "";
    button.appendChild(image);
    button.classList.add("donebets-deposit-icon-button");
    button.setAttribute("data-donebets-deposit-icon-ready", "true");
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

    if (node.matches && node.matches(headerSpecialSelector)) {
      enhanceHeaderSpecialButton(node);
    }

    if (node.matches && node.matches(depositIconSelector)) {
      enhanceDepositIconButton(node);
    }

    if (node.querySelectorAll) {
      node.querySelectorAll(notVerifiedSelector).forEach(enhanceNotVerifiedLink);
      node.querySelectorAll(headerSpecialSelector).forEach(enhanceHeaderSpecialButton);
      node.querySelectorAll(depositIconSelector).forEach(enhanceDepositIconButton);
    }

    if (node.matches && node.matches(statusCardSelector)) {
      enhanceVipStatusCard(node);
    }

    if (node.closest) {
      enhanceVipStatusCard(node.closest(statusCardSelector));
      enhanceHeaderSpecialButton(node.closest(headerSpecialSelector));
      enhanceDepositIconButton(node.closest(depositIconSelector));
    }

    if (node.tagName === "P" && node.parentElement) {
      enhanceVipStatusCard(node.parentElement);
    }

    if (node.querySelectorAll) {
      node.querySelectorAll(statusCardSelector).forEach(enhanceVipStatusCard);
      enhanceVipStatusFromText(node);
    }
  }

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
})();
