(function () {
  var ACTIVE_CLASS = "codex-lobby-active";
  var LIST_SELECTOR = '[data-mj="lobby-catalog-category-slider-list"]';
  var ITEM_SELECTOR = '[data-mj="lobby-catalog-category-item"]';

  function normalizePath(path) {
    if (!path) return "/";
    return path.replace(/\/+$/, "") || "/";
  }

  function samePath(href, currentPath) {
    try {
      var url = new URL(href, window.location.origin);
      return normalizePath(url.pathname) === normalizePath(currentPath);
    } catch (error) {
      return false;
    }
  }

  function setActive(items, activeItem) {
    items.forEach(function (item) {
      var isActive = item === activeItem;
      item.classList.toggle(ACTIVE_CLASS, isActive);
      if (isActive) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });
  }

  function getVisibleItems(list) {
    return Array.prototype.slice
      .call(list.querySelectorAll(ITEM_SELECTOR))
      .filter(function (item) {
        var parent = item.closest("li");
        return parent && window.getComputedStyle(parent).display !== "none";
      });
  }

  function syncActiveState() {
    var list = document.querySelector(LIST_SELECTOR);
    if (!list) return;

    var items = getVisibleItems(list);
    if (!items.length) return;

    var currentPath = normalizePath(window.location.pathname);
    var matchedItem = items.find(function (item) {
      return samePath(item.getAttribute("href"), currentPath);
    });

    setActive(items, matchedItem || items[0]);
  }

  function bindClicks() {
    var list = document.querySelector(LIST_SELECTOR);
    if (!list || list.dataset.codexLobbyBound === "true") return;

    list.dataset.codexLobbyBound = "true";
    list.addEventListener("click", function (event) {
      var item = event.target.closest(ITEM_SELECTOR);
      if (!item || !list.contains(item)) return;

      setActive(getVisibleItems(list), item);
    });
  }

  function init() {
    bindClicks();
    syncActiveState();
  }

  var observer = new MutationObserver(function () {
    init();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.addEventListener("popstate", syncActiveState);
  window.addEventListener("hashchange", syncActiveState);
})();
