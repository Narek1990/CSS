(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/spinwin";

  var AVIATOR_WIDGET_TAG = "spinwin-aviator-scroll-widget";
  var AVIATOR_WIDGET_ID = "custom-aviator-scroll-widget";
  var AVIATOR_SOURCE_ATTRIBUTE = "data-spinwin-aviator-source";
  var AVIATOR_VIDEO_SRC = baseUrl + "/assets/aviator-scroll.mp4";
  var AVIATOR_POSTER_SRC = baseUrl + "/assets/aviator-scroll-poster.webp";
  var COLLECTION_IMAGE_BY_KEY = {
    animal: "animal-collection-464x225.svg",
    book: "book-collection-464x225.svg",
    candy: "candy-collection-464x225.svg",
    dragon: "dragon-collection-464x225.svg",
    egypt: "egypt-collection-464x225.svg",
    fishing: "fishing-hunting-collection-464x225.svg",
    "fishing-hunting": "fishing-hunting-collection-464x225.svg",
    hunting: "fishing-hunting-collection-464x225.svg",
    lucky: "lucky-collection-464x225.svg",
    olympus: "olympus-collection-464x225.svg"
  };
  var AVIATOR_INLINE_POSTER = "data:image/webp;base64,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";

  function ensureStylesheet() {
    var href = baseUrl + "/spinwin.css";
    var managed = document.querySelector('link[data-spinwin-css="true"]');

    if (managed) {
      if (managed.href.split("?")[0] !== href) {
        managed.href = href;
      }

      return;
    }

    var external = document.querySelector('link[href*="/spinwin/spinwin.css"]');

    if (external) {
      external.setAttribute("data-spinwin-css-external", "true");
      return;
    }

    document.head.appendChild(
      Object.assign(document.createElement("link"), {
        rel: "stylesheet",
        href: href,
        "data-spinwin-css": "true"
      })
    );
  }

  function preloadAviatorPoster() {
    if (document.querySelector('link[data-spinwin-aviator-poster="true"]')) {
      return;
    }

    document.head.appendChild(
      Object.assign(document.createElement("link"), {
        rel: "preload",
        as: "image",
        href: AVIATOR_POSTER_SRC,
        "data-spinwin-aviator-poster": "true"
      })
    );
  }

  function addBodyFlag() {
    document.body.setAttribute("data-spinwin-theme", "true");
  }

  function enableSingleCurrencyToggle() {
    var modalTitles = document.querySelectorAll(".modal .app-ltr-1vtec85");

    modalTitles.forEach(function (title) {
      if (!title || title.textContent.trim() !== "Wallet Settings") {
        return;
      }

      var modal = title.closest(".modal");

      if (!modal) {
        return;
      }

      var toggle = modal.querySelector('input[type="checkbox"][aria-label="Show all in single currency"]');

      if (!toggle || toggle.checked || toggle.disabled) {
        return;
      }

      toggle.click();
      toggle.dispatchEvent(new Event("input", { bubbles: true }));
      toggle.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  function addFixedBannerDepositLink() {
    document.querySelectorAll('[data-mj="widget-fixed-image-banner-container"]').forEach(function (container) {
      var image = container.querySelector("img");
      var link = container.querySelector(".spinwin-fixed-banner-deposit");

      if (!image) {
        return;
      }

      if (!link) {
        link = document.createElement("a");
        link.className = "spinwin-fixed-banner-deposit";
        container.appendChild(link);
      }

      link.href = "/en/home/promotions/first-deposit";
      link.setAttribute("aria-label", "Deposit promotion");
    });
  }

  function replaceCollectionImages() {
    document.querySelectorAll('[data-mj="widget-collection-slider-item"]').forEach(function (item) {
      var link = item.querySelector("a[href]");
      var image = item.querySelector("img");

      if (!link || !image) {
        return;
      }

      var searchTerm = "";

      try {
        searchTerm = new URL(link.getAttribute("href"), document.baseURI).searchParams.get("search") || "";
      } catch (error) {
        return;
      }

      var key = searchTerm
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      var filename = COLLECTION_IMAGE_BY_KEY[key];

      if (!filename) {
        return;
      }

      var assetUrl = baseUrl + "/assets/" + filename;

      image.removeAttribute("srcset");
      image.removeAttribute("sizes");

      if (image.getAttribute("src") !== assetUrl) {
        image.src = assetUrl;
      }

      image.dataset.spinwinCollectionImage = key;
      image.alt = searchTerm.trim() + " collection";
    });
  }

  function getMaskUrl(icon) {
    var maskImage = icon.style.maskImage || icon.style.webkitMaskImage;

    if (!maskImage || maskImage === "none") {
      maskImage = window.getComputedStyle(icon).maskImage || window.getComputedStyle(icon).webkitMaskImage;
    }

    if (!maskImage || maskImage === "none") {
      return "";
    }

    var match = maskImage.match(/url\((['"]?)(.*?)\1\)/);

    return match ? match[2] : "";
  }

  function showOriginalSidebarIcons() {
    document.querySelectorAll([
      '[data-mj="sidebar-content"] [class~="app-ltr-1trb7go"]',
      '[data-mj="sidebar"] [class~="app-ltr-1trb7go"]',
      '[data-mj="bottom-nav"] span[style*="mask-image"]',
      '[data-mj="lobby-catalog-category-item"] span',
      '[data-mj="lobby-catalog-mobile-category-chip"] span',
      '[data-mj="lobby-catalog-category-list"] span',
      '[data-mj="lobby-catalog-mobile-categories"] span',
      '[data-mj="widget-pages"] span',
      '[data-mj="widget-pages-item"] span'
    ].join(",")).forEach(function (icon) {
      if (icon.dataset.spinwinOriginalIcon === "true") {
        return;
      }

      var url = getMaskUrl(icon);

      if (!url) {
        return;
      }

      icon.dataset.spinwinOriginalIcon = "true";
      icon.style.backgroundImage = 'url("' + url + '")';
      icon.style.backgroundColor = "transparent";
      icon.style.backgroundPosition = "center";
      icon.style.backgroundRepeat = "no-repeat";
      icon.style.backgroundSize = "contain";
      icon.style.maskImage = "none";
      icon.style.webkitMaskImage = "none";
    });
  }

  class SpinwinAviatorScrollWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.frameCount = 301;
      this.frameRate = 30;
      this.ticking = false;
      this.lastFrame = -1;
      this.pendingFrame = 0;
      this.mediaLoaded = false;
      this.seekInProgress = false;
      this.requestUpdate = this.requestUpdate.bind(this);
      this.onMetadata = this.onMetadata.bind(this);
      this.onData = this.onData.bind(this);
      this.onSeeked = this.onSeeked.bind(this);
      this.loadMedia = this.loadMedia.bind(this);
    }

    connectedCallback() {
      this.mediaLoaded = false;
      this.seekInProgress = false;
      this.lastFrame = -1;
      this.pendingFrame = 0;
      this.render();
      this.video = this.shadowRoot.querySelector("video");
      this.frame = this.shadowRoot.querySelector(".aviator-frame");
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.posterSrc = this.getAttribute("poster-src") || AVIATOR_POSTER_SRC;

      this.video.muted = true;
      this.video.defaultMuted = true;
      this.video.playsInline = true;
      this.video.poster = this.posterSrc;
      this.frame.style.backgroundImage =
        'url("' + this.posterSrc + '"), url("' + AVIATOR_INLINE_POSTER + '")';
      this.video.addEventListener("loadedmetadata", this.onMetadata);
      this.video.addEventListener("loadeddata", this.onData);
      this.video.addEventListener("seeked", this.onSeeked);

      if (!this.reducedMotion && "IntersectionObserver" in window) {
        this.viewportObserver = new IntersectionObserver((entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.loadMedia();
            this.viewportObserver.disconnect();
          }
        }, { rootMargin: "900px 0px" });
        this.viewportObserver.observe(this);
      } else if (!this.reducedMotion) {
        this.loadMedia();
      }

      if (!this.reducedMotion) {
        window.addEventListener("scroll", this.requestUpdate, { passive: true });
        window.addEventListener("resize", this.requestUpdate);
      }

      this.update();
    }

    disconnectedCallback() {
      window.removeEventListener("scroll", this.requestUpdate);
      window.removeEventListener("resize", this.requestUpdate);

      if (this.viewportObserver) {
        this.viewportObserver.disconnect();
      }

      if (this.video) {
        this.video.removeEventListener("loadedmetadata", this.onMetadata);
        this.video.removeEventListener("loadeddata", this.onData);
        this.video.removeEventListener("seeked", this.onSeeked);
      }
    }

    render() {
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            width: 100%;
            margin: clamp(24px, 3vw, 48px) 0;
            contain: layout style;
          }

          * {
            box-sizing: border-box;
          }

          .aviator-frame {
            position: relative;
            width: 100%;
            aspect-ratio: 960 / 233;
            overflow: hidden;
            border: 1px solid rgba(125, 88, 255, .20);
            border-radius: clamp(14px, 1.4vw, 24px);
            background: #18002d center / cover no-repeat;
            box-shadow:
              0 22px 54px rgba(16, 0, 38, .34),
              0 0 34px rgba(79, 31, 255, .15),
              inset 0 1px 0 rgba(255, 255, 255, .12);
            isolation: isolate;
          }

          .aviator-frame::after {
            content: "";
            position: absolute;
            inset: 0;
            z-index: 2;
            pointer-events: none;
            border-radius: inherit;
            background:
              linear-gradient(110deg, rgba(255,255,255,.08), transparent 22% 74%, rgba(87,42,255,.10)),
              linear-gradient(180deg, transparent 68%, rgba(22,0,45,.16));
            opacity: calc(.24 + (var(--aviator-progress, 0) * .20));
          }

          video {
            position: absolute;
            inset: 0;
            z-index: 1;
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
            pointer-events: none;
            transform: translateZ(0);
            opacity: 0;
            transition: opacity .18s ease;
          }

          .aviator-frame.is-media-ready video {
            opacity: 1;
          }

          @media (max-width: 700px) {
            :host {
              margin: 22px 0;
            }

            .aviator-frame {
              border-radius: 12px;
              box-shadow: 0 12px 30px rgba(16, 0, 38, .30);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .aviator-frame::after {
              opacity: .24;
            }
          }
        </style>

        <div
          class="aviator-frame"
          role="img"
          aria-label="Aviator — win up to 4.7 million per flight"
        >
          <video preload="none" muted playsinline aria-hidden="true"></video>
        </div>
      `;
    }

    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }

    onMetadata() {
      this.video.pause();
      this.update(true);
    }

    onData() {
      this.frame.classList.add("is-media-ready");
      this.update(true);
    }

    onSeeked() {
      this.seekInProgress = false;

      if (this.pendingFrame !== this.lastFrame) {
        this.seekToPendingFrame();
      }
    }

    loadMedia() {
      if (this.mediaLoaded || !this.video) return;

      this.mediaLoaded = true;
      this.video.preload = "auto";
      this.video.src = this.getAttribute("video-src") || AVIATOR_VIDEO_SRC;
      this.video.load();
    }

    requestUpdate() {
      if (this.ticking) return;

      this.ticking = true;
      requestAnimationFrame(() => this.update());
    }

    update(force) {
      if (!this.frame || !this.video) {
        this.ticking = false;
        return;
      }

      var rect = this.frame.getBoundingClientRect();
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      var start = viewportHeight * 0.88;
      var end = -rect.height * 0.20;
      var progress = this.clamp((start - rect.top) / (start - end), 0, 1);
      var frameIndex = this.reducedMotion ? 0 : Math.round(progress * (this.frameCount - 1));

      this.frame.style.setProperty("--aviator-progress", progress.toFixed(4));
      this.pendingFrame = frameIndex;
      this.seekToPendingFrame(force);
      this.ticking = false;
    }

    seekToPendingFrame(force) {
      if (!this.video || this.video.readyState < 1 || this.seekInProgress) {
        return;
      }

      var frameIndex = this.pendingFrame;

      if (force || frameIndex !== this.lastFrame) {
        var sourceDuration = (this.frameCount - 1) / this.frameRate;
        var usableDuration = Number.isFinite(this.video.duration)
          ? Math.min(sourceDuration, Math.max(0, this.video.duration - 0.001))
          : sourceDuration;
        var targetTime = usableDuration * (frameIndex / (this.frameCount - 1));

        if (Math.abs(this.video.currentTime - targetTime) > 0.008) {
          this.seekInProgress = true;

          try {
            this.video.currentTime = targetTime;
          } catch (error) {
            this.seekInProgress = false;
            return;
          }
        }

        this.lastFrame = frameIndex;
      }
    }
  }

  if (!customElements.get(AVIATOR_WIDGET_TAG)) {
    customElements.define(AVIATOR_WIDGET_TAG, SpinwinAviatorScrollWidget);
  }

  function findSpinwinInfoPanel() {
    return Array.prototype.find.call(
      document.querySelectorAll('[data-mj="widget-info-panel"]'),
      function (panel) {
        var firstParagraph = panel.querySelector("p");

        return firstParagraph && firstParagraph.textContent.trim().toLowerCase() === "spin win";
      }
    );
  }

  function restoreAviatorSource(panel) {
    panel.removeAttribute(AVIATOR_SOURCE_ATTRIBUTE);
    panel.hidden = false;
  }

  function syncAviatorScrollWidget() {
    var target = findSpinwinInfoPanel();
    var widget = document.getElementById(AVIATOR_WIDGET_ID);

    document.querySelectorAll("[" + AVIATOR_SOURCE_ATTRIBUTE + '=\"true\"]').forEach(function (panel) {
      if (panel !== target) {
        restoreAviatorSource(panel);
      }
    });

    if (!target || !target.parentNode) {
      if (widget) widget.remove();
      return;
    }

    target.setAttribute(AVIATOR_SOURCE_ATTRIBUTE, "true");
    target.hidden = true;

    if (!widget) {
      widget = document.createElement(AVIATOR_WIDGET_TAG);
      widget.id = AVIATOR_WIDGET_ID;
    }

    widget.setAttribute("video-src", baseUrl + "/assets/aviator-scroll.mp4");
    widget.setAttribute("poster-src", baseUrl + "/assets/aviator-scroll-poster.webp");

    if (widget.nextElementSibling !== target) {
      target.parentNode.insertBefore(widget, target);
    }
  }

  function runCriticalEnhancements() {
    addBodyFlag();
    addFixedBannerDepositLink();
    replaceCollectionImages();
    syncAviatorScrollWidget();
  }

  function runDeferredEnhancements() {
    enableSingleCurrencyToggle();
    showOriginalSidebarIcons();
  }

  var criticalFrame = 0;
  var deferredHandle = 0;
  var observer = new MutationObserver(scheduleEnhancements);

  function observeDom() {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function scheduleDeferredEnhancements() {
    if (deferredHandle) return;

    var run = function () {
      deferredHandle = 0;
      runDeferredEnhancements();
    };

    if ("requestIdleCallback" in window) {
      deferredHandle = window.requestIdleCallback(run, { timeout: 600 });
    } else {
      deferredHandle = window.setTimeout(run, 100);
    }
  }

  function scheduleEnhancements() {
    if (criticalFrame) return;

    criticalFrame = requestAnimationFrame(function () {
      criticalFrame = 0;
      observer.disconnect();
      runCriticalEnhancements();
      observeDom();
      scheduleDeferredEnhancements();
    });
  }

  function init() {
    ensureStylesheet();
    preloadAviatorPoster();
    runCriticalEnhancements();
    scheduleDeferredEnhancements();
    observeDom();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
