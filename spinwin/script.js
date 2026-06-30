(function () {
  "use strict";

  var currentScript = document.currentScript;
  var baseUrl = currentScript && currentScript.src
    ? currentScript.src.split("?")[0].replace(/\/[^/]+$/, "")
    : "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/spinwin";

  var AVIATOR_WIDGET_TAG = "spinwin-aviator-scroll-widget";
  var AVIATOR_WIDGET_ID = "custom-aviator-scroll-widget";
  var AVIATOR_SOURCE_ATTRIBUTE = "data-spinwin-aviator-source";

  function ensureStylesheet() {
    var href = baseUrl + "/spinwin.css?v=" + Date.now();
    var existing = document.querySelector('link[data-spinwin-css="true"]');

    if (existing) {
      existing.href = href;
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
      this.requestUpdate = this.requestUpdate.bind(this);
      this.onMetadata = this.onMetadata.bind(this);
    }

    connectedCallback() {
      this.render();
      this.video = this.shadowRoot.querySelector("video");
      this.frame = this.shadowRoot.querySelector(".aviator-frame");
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      this.video.muted = true;
      this.video.defaultMuted = true;
      this.video.playsInline = true;
      this.video.poster = this.getAttribute("poster-src") || baseUrl + "/assets/aviator-scroll-poster.webp";
      this.video.src = this.getAttribute("video-src") || baseUrl + "/assets/aviator-scroll.mp4";
      this.video.addEventListener("loadedmetadata", this.onMetadata);
      this.video.load();

      window.addEventListener("scroll", this.requestUpdate, { passive: true });
      window.addEventListener("resize", this.requestUpdate);
      this.update();
    }

    disconnectedCallback() {
      window.removeEventListener("scroll", this.requestUpdate);
      window.removeEventListener("resize", this.requestUpdate);

      if (this.video) {
        this.video.removeEventListener("loadedmetadata", this.onMetadata);
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
          <video preload="auto" muted playsinline aria-hidden="true"></video>
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

      if ((force || frameIndex !== this.lastFrame) && this.video.readyState >= 1) {
        var sourceDuration = (this.frameCount - 1) / this.frameRate;
        var usableDuration = Number.isFinite(this.video.duration)
          ? Math.min(sourceDuration, Math.max(0, this.video.duration - 0.001))
          : sourceDuration;
        var targetTime = usableDuration * (frameIndex / (this.frameCount - 1));

        if (Math.abs(this.video.currentTime - targetTime) > 0.008) {
          this.video.currentTime = targetTime;
        }

        this.lastFrame = frameIndex;
      }

      this.ticking = false;
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

  function runEnhancements() {
    addBodyFlag();
    enableSingleCurrencyToggle();
    addFixedBannerDepositLink();
    showOriginalSidebarIcons();
    syncAviatorScrollWidget();
  }

  var observer = new MutationObserver(runEnhancements);

  function init() {
    ensureStylesheet();
    runEnhancements();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
