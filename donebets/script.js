(function () {
  "use strict";

  var notVerifiedSelector = "a.app-ltr-1a59aej, a.app-rtl-1a59aej";
  var statusCardSelector = ".app-ltr-1mfp3qc, .app-rtl-1mfp3qc";
  var depositButtonSelector = 'button[aria-label="deposit"][name="deposit"].sl-icon';
  var accountMenuSelector = 'ul[data-mj="account-menu"]';
  var cashbackMovedAttribute = "data-donebets-cashback-moved";
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

  function buildCashbackHref() {
    var url = new URL(window.location.href);
    url.searchParams.set("m", "account");
    url.searchParams.set("t", "instant_cashback");
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

  function isNotificationsMenuItem(item) {
    var link = item && item.querySelector ? item.querySelector("a") : null;

    return link && normalizeText(link).toLowerCase() === "notifications";
  }

  function isCashbackMenuLink(link) {
    var href;

    if (!link) {
      return false;
    }

    href = link.getAttribute("href") || "";

    return href.indexOf("instant_cashback") !== -1 || normalizeText(link).toLowerCase() === "cashback";
  }

  function createCashbackIcon() {
    var svgNamespace = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNamespace, "svg");
    var circle = document.createElementNS(svgNamespace, "path");
    var arrow = document.createElementNS(svgNamespace, "path");
    var value = document.createElementNS(svgNamespace, "path");

    svg.setAttribute("xmlns", svgNamespace);
    svg.setAttribute("fill", "none");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    circle.setAttribute("d", "M12 21a9 9 0 1 0-8.485-6");
    circle.setAttribute("stroke", "currentColor");
    circle.setAttribute("stroke-width", "2");
    circle.setAttribute("stroke-linecap", "round");
    circle.setAttribute("stroke-linejoin", "round");

    arrow.setAttribute("d", "M3 7v5h5");
    arrow.setAttribute("stroke", "currentColor");
    arrow.setAttribute("stroke-width", "2");
    arrow.setAttribute("stroke-linecap", "round");
    arrow.setAttribute("stroke-linejoin", "round");

    value.setAttribute("d", "M12 7v10m2.5-7.5c-.45-.67-1.23-1-2.25-1-1.35 0-2.25.72-2.25 1.75 0 1.07.75 1.5 2.25 1.75s2.25.68 2.25 1.75c0 1.03-.9 1.75-2.25 1.75-1.02 0-1.8-.33-2.25-1");
    value.setAttribute("stroke", "currentColor");
    value.setAttribute("stroke-width", "1.6");
    value.setAttribute("stroke-linecap", "round");
    value.setAttribute("stroke-linejoin", "round");

    svg.appendChild(circle);
    svg.appendChild(arrow);
    svg.appendChild(value);

    return svg;
  }

  function enhanceCashbackMenuItem(item, notificationsItem, topLevelItem) {
    var link = item && item.querySelector ? item.querySelector("a") : null;
    var notificationsLink = notificationsItem && notificationsItem.querySelector("a");
    var templateLink;
    var content;
    var icon;
    var label;
    var href;

    if (!link || !notificationsLink) {
      return;
    }

    if (
      link.getAttribute("data-donebets-cashback-ready") === "true" &&
      link.querySelector('[data-donebets-cashback-icon="true"]') &&
      link.querySelector('[data-donebets-cashback-label="true"]')
    ) {
      return;
    }

    href = link.getAttribute("href");
    templateLink = notificationsLink.cloneNode(true);
    content = templateLink.firstElementChild;
    icon = content && content.querySelector("i");
    label = content && content.querySelector("p");

    if (!content || !icon || !label) {
      return;
    }

    if (topLevelItem) {
      item.className = topLevelItem.className + " donebets-cashback-menu-item";
    } else {
      item.classList.add("donebets-cashback-menu-item");
    }

    link.className = notificationsLink.className + " donebets-cashback-menu-link";
    link.setAttribute("href", href || "");
    link.setAttribute("data-donebets-cashback-link", "true");
    link.setAttribute("data-donebets-cashback-ready", "true");

    while (link.firstChild) {
      link.removeChild(link.firstChild);
    }

    label.textContent = "Cashback";
    label.setAttribute("data-donebets-cashback-label", "true");

    icon.setAttribute("role", "img");
    icon.setAttribute("aria-label", "cashback");
    icon.setAttribute("name", "cashback");
    icon.setAttribute("data-donebets-cashback-icon", "true");

    while (icon.firstChild) {
      icon.removeChild(icon.firstChild);
    }

    icon.appendChild(createCashbackIcon());
    link.appendChild(content);
  }

  function createCashbackMenuItem(notificationsItem) {
    var item = notificationsItem.cloneNode(true);
    var link = item.querySelector("a");

    item.removeAttribute("data-mj");
    item.setAttribute("data-donebets-cashback-generated", "true");

    if (link) {
      link.removeAttribute("data-mj");
      link.setAttribute("href", buildCashbackHref());
    }

    return item;
  }

  function moveCashbackMenu() {
    document.querySelectorAll(accountMenuSelector).forEach(function (accountMenu) {
      var notificationsItem;
      var cashbackItem;
      var generatedItem;
      var topLevelItem;

      Array.prototype.some.call(accountMenu.children, function (item) {
        if (item.tagName === "LI" && isNotificationsMenuItem(item)) {
          notificationsItem = item;
          return true;
        }

        return false;
      });

      if (!notificationsItem) {
        return;
      }

      Array.prototype.some.call(accountMenu.children, function (item) {
        if (item.tagName === "LI" && item !== notificationsItem) {
          topLevelItem = item;
          return true;
        }

        return false;
      });

      Array.prototype.some.call(accountMenu.querySelectorAll("li"), function (item) {
        var link = item.querySelector("a");

        if (
          item !== notificationsItem &&
          item.getAttribute("data-donebets-cashback-generated") !== "true" &&
          isCashbackMenuLink(link)
        ) {
          cashbackItem = item;
          return true;
        }

        return false;
      });

      generatedItem = accountMenu.querySelector('li[data-donebets-cashback-generated="true"]');

      if (cashbackItem && generatedItem && generatedItem !== cashbackItem) {
        generatedItem.parentNode.removeChild(generatedItem);
        generatedItem = null;
      }

      if (!cashbackItem) {
        cashbackItem = generatedItem || createCashbackMenuItem(notificationsItem);

        if (!generatedItem) {
          accountMenu.insertBefore(cashbackItem, notificationsItem.nextElementSibling);
        }
      }

      if (
        cashbackItem.parentElement !== accountMenu ||
        cashbackItem.previousElementSibling !== notificationsItem
      ) {
        accountMenu.insertBefore(cashbackItem, notificationsItem.nextElementSibling);
      }

      cashbackItem.setAttribute(cashbackMovedAttribute, "true");
      enhanceCashbackMenuItem(cashbackItem, notificationsItem, topLevelItem);
    });
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

    moveCashbackMenu();
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
