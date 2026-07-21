class SlotCollections extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.activeIndex = 0;
    this.isAnimating = false;

    this.collections = [
      {
        name: "Dragons",
        title: "Dragons Collection",
        subtitle: "Mystic reels, icy beasts and legendary wins.",
        url: "/en/casino/all?search=dragon",
        hero: "https://raw.githubusercontent.com/SyuzannaMartirosyan/codePublic/refs/heads/main/images/dragon_11zon.webp",
        glow: "#FD224E",
        games: [
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/178328.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/194473.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/183017.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/194505.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/175878.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/176598.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp"
        ]
      },
      {
        name: "Olympus",
        title: "Olympus Collection",
        subtitle: "Gods, lightning and powerful bonus features.",
        url: "/en/casino/all?search=olympus ",
        hero: "https://raw.githubusercontent.com/SyuzannaMartirosyan/codePublic/refs/heads/main/images/olymp_11zon.webp",
        glow: "#ff5a78",
        games: [
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/36071.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/171080.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/193801.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/194648.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/180626.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp"
        ]
      },
      { 
        name: "Egypt",
        title: "Egypt Collection",
        subtitle: "Ancient treasures, pharaohs and golden spins.",
        url: "/en/casino/all?search=egypt",
        hero: "https://raw.githubusercontent.com/SyuzannaMartirosyan/codePublic/refs/heads/main/images/egypt_11zon.webp",
        glow: "#c9163f",
        games: [
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/60420.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/193502.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/193602.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/195433.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/194563.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp",
          "https://dmbobet.com/api/cmsgateway/api/v1/AssetsSite/gameimage/194562.webp?folder=VerticalGameImages&width=427&height=576&Quality=90&format=webp"
        ]
      }
    ];

    this.handleResize = (() => {
      let timeout;

      return () => {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
          this.updateSlide(true);
        }, 150);
      };
    })();
  }

  connectedCallback() {
    const inheritedDirection =
      document.documentElement.getAttribute("dir") ||
      window.getComputedStyle(this).direction;

    this.setAttribute("dir", inheritedDirection === "rtl" ? "rtl" : "ltr");
    this.render();
    this.updateSlide(true);
    this.bindEvents();

    window.addEventListener("resize", this.handleResize);
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.handleResize);
  }

  get current() {
    return this.collections[this.activeIndex];
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        * { box-sizing: border-box; }

        :host {
          display: block;
          width: 100%;
          font-family: 'Rubik';
        }

        :host([dir="rtl"]) {
          direction: rtl;
        }

        .collection-widget {
          position: relative;
          max-width: 96%;
          min-height: 390px;
          margin: 0 auto;
          border-radius: 20px;
          overflow: visible;
          color: #fff;
        }

        .card-bg {
          position: absolute;
          inset: 0;
          top: 60px;
          overflow: hidden;
          border-radius: 20px;
          background:
            linear-gradient(357deg,rgba(0, 53, 87, 1) 0%, rgba(22, 19, 66, 0.2) 100%);
          box-shadow: 0 26px 80px rgba(0,0,0,.4);
        }

        .card-bg::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(255,255,255,.08), transparent 40%),
            radial-gradient(circle at 70% 45%, rgba(255,255,255,.12), transparent 35%);
          pointer-events: none;
        }

        .glow {
          position: absolute;
          width: 520px;
          height: 320px;
          right: 5%;
          top: 50%;
          transform: translateY(-50%);
          border-radius: 50%;
          background: var(--glow);
          filter: blur(70px);
          opacity: .55;
          transition: background .9s ease, opacity .9s ease, transform .9s ease;
          z-index: 1;
        }

        .content-layer {
          position: relative;
          z-index: 3;
          width: 58%;
          padding: 80px 20px;
          min-height: 390px;
          transition: opacity .45s ease, transform .45s ease;
        }

        .content-layer.is-changing {
          opacity: 0;
          transform: translateY(18px);
        }

        .eyebrow {
          margin: 0 0 10px;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
          color: rgba(255,255,255,.58);
        }

        .title {
          min-height: 40px;
          margin: 0;
          font-size: clamp(24px, 3.8vw, 40px);
          line-height: .94;
          font-weight: 950;
          letter-spacing: -.04em;
        }

        .title::after {
          content: "|";
          margin-left: 4px;
          opacity: .8;
          animation: blink .8s infinite;
        }

        @keyframes blink {
          50% { opacity: 0; }
        }

        .subtitle {
          margin: 0px 0 8px;
          font-size: 15px;
          line-height: 1.5;
          color: rgba(255,255,255,.72);
        }

        .games {
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
        }

        .game {
          width: 74px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 10px 24px rgba(0,0,0,.28);
        }

        .game img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }

        .tag {
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.12);
          backdrop-filter: blur(8px);
          font-size: 12px;
          font-weight: 800;
        }

        .btn {
          border: 0;
          border-radius: 16px;
          padding: 13px 24px;
          cursor: pointer;
          color: #fff;
          background: linear-gradient(180deg, #ff5a78, #FD224E);
          font-weight: 950;
          box-shadow:
            0 12px 34px rgba(253, 34, 78, .34),
            inset 0 1px 0 rgba(255, 255, 255, .22);
          transition: transform .22s ease, box-shadow .22s ease, filter .22s ease;
        }

        .btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.06) saturate(1.08);
          box-shadow:
            0 16px 40px rgba(253, 34, 78, .44),
            0 0 26px rgba(253, 34, 78, .22),
            inset 0 1px 0 rgba(255, 255, 255, .28);
        }

        .hero-layer {
          position: absolute;
          z-index: 4;
          right: -36px;
          bottom: 0px;
          width: 44%;
          pointer-events: none;
          filter: drop-shadow(0 28px 42px rgba(0,0,0,.45));
          transition: opacity .55s ease, transform .65s cubic-bezier(.2,.8,.2,1);
        }

        .hero-layer.is-changing {
          opacity: 0;
          transform: translateX(50px) scale(.96);
        }

        .hero-layer img {
          max-height: 460px;
          max-width: 460px;
          width: 100%;
          display: block;
        }

        .nav {
          position: absolute;
          z-index: 7;
          right: 24px;
          top: 80px;
          display: flex;
          gap: 8px;
        }

        .arrow {
          background: none #FD224E;
          backface-visibility: hidden;
          font-weight: normal;
          font-style: normal;
          line-height: 1;
          text-align: center;
          vertical-align: center;
          font-size: 24px;
          transition: color 0.3s;
          display: inline-flex;
          cursor: pointer;
          border-radius: 12px;
          border: 0px;
          color: rgb(255, 255, 255);
          width: 40px;
          min-width: 40px;
          height: 40px;
          padding: 0px;
          justify-content: center;
          align-items: center;
          box-shadow:
            0 10px 22px rgba(253, 34, 78, .28),
            inset 0 1px 0 rgba(255,255,255,.2);
          transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
        }

        .arrow:hover {
          transform: translateY(-1px);
          filter: brightness(1.06);
          box-shadow:
            0 14px 28px rgba(253, 34, 78, .38),
            0 0 20px rgba(253, 34, 78, .24),
            inset 0 1px 0 rgba(255,255,255,.26);
        }

        .tabs {
          position: absolute;
          z-index: 7;
          left: 24px;
          bottom: 26px;
          display: flex;
          gap: 8px;
        }

        .tab {
          border: 1px solid rgba(253, 34, 78, .22);
          border-radius: 12px;
          padding: 8px 13px;
          cursor: pointer;
          background: rgba(44, 14, 28, .82);
          color: rgba(255,255,255,.62);
          font-weight: 900;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.08);
          transition: background .2s ease, color .2s ease, box-shadow .2s ease, transform .2s ease;
        }

        .tab:hover {
          color: #fff;
          transform: translateY(-1px);
          background: rgba(253, 34, 78, .24);
          box-shadow: 0 8px 18px rgba(253, 34, 78, .14);
        }

        .tab.active {
          background: linear-gradient(180deg, #ff5a78, #FD224E);
          color: #fff;
          border-color: rgba(255,255,255,.18);
          box-shadow:
            0 10px 22px rgba(253, 34, 78, .32),
            inset 0 1px 0 rgba(255,255,255,.2);
        }

        :host([dir="rtl"]) .content-layer {
          margin-left: auto;
          text-align: right;
        }

        :host([dir="rtl"]) .title::after {
          margin-right: 4px;
          margin-left: 0;
        }

        :host([dir="rtl"]) .games,
        :host([dir="rtl"]) .tags {
          direction: rtl;
          justify-content: flex-start;
        }

        :host([dir="rtl"]) .hero-layer {
          right: auto;
          left: -36px;
        }

        :host([dir="rtl"]) .hero-layer.is-changing {
          transform: translateX(-50px) scale(.96);
        }

        :host([dir="rtl"]) .glow {
          right: auto;
          left: 5%;
        }

        :host([dir="rtl"]) .nav {
          right: auto;
          left: 24px;
        }

        :host([dir="rtl"]) .tabs {
          right: 24px;
          left: auto;
        }

        @media (max-width: 720px) {


        .card-bg {
        
          top: 0px !important;}

          .subtitle {
            text-align: center;
          }

          .games {
            justify-content: center;
          }

          .eyebrow {
            text-align: center;
          }

          .title {
            text-align: center;
          }

          .collection-widget {
            max-width: 96%;
            min-height: 400px;
            max-width: 100vw;
            overflow: hidden;
          }

          .card-bg {
            border-radius: 24px;
          }

          .content-layer {
            width: 100%;
       padding: 20px 40px 200px;
          }

          .hero-layer {
            width: 80%;
            right: -78px;
            bottom: 18px;
            opacity: .95;
          }

          .glow {
            width: 420px;
            height: 420px;
            right: -80px;
            top: 58%;
          }

          .tabs {
            left: 40px;
            right: 24px;
            bottom: 20px;
            overflow-x: auto;
          }

          .nav {
            top: auto;
            bottom: 70px;
            right: 24px;
          }

          :host([dir="rtl"]) .hero-layer {
            right: auto;
            left: -78px;
          }

          :host([dir="rtl"]) .glow {
            right: auto;
            left: -80px;
          }

          :host([dir="rtl"]) .tabs {
            right: 40px;
            left: 24px;
          }

          :host([dir="rtl"]) .nav {
            right: auto;
            left: 24px;
          }
        }
      </style>

      <section class="collection-widget">
        <div class="card-bg"></div>
        <div class="glow"></div>

        <div class="nav">
          <button class="arrow" data-prev>‹</button>
          <button class="arrow" data-next>›</button>
        </div>

        <div class="content-layer">
          <p class="eyebrow">Slot Collection</p>
          <h2 class="title" data-title></h2>
          <p class="subtitle" data-subtitle></p>
          <div class="games" data-games></div>
        
          <button class="btn">All Games</button>
        </div>

        <div class="hero-layer">
          <img data-hero src="" alt="">
        </div>

        <div class="tabs">
          ${this.collections.map((item, i) => `
            <button class="tab" data-tab="${i}">${item.name}</button>
          `).join("")}
        </div>
      </section>
    `;
  }

  bindEvents() {
    this.shadowRoot.querySelector("[data-next]").onclick = () => this.goTo(this.activeIndex + 1);
    this.shadowRoot.querySelector("[data-prev]").onclick = () => this.goTo(this.activeIndex - 1);

    this.shadowRoot.querySelectorAll("[data-tab]").forEach(btn => {
      btn.onclick = () => this.goTo(Number(btn.dataset.tab));
    });

    this.shadowRoot.querySelector(".btn").onclick = () => {
      window.location.href = this.current.url;
    };
  }

  goTo(index) {
    if (this.isAnimating) return;

    const nextIndex = (index + this.collections.length) % this.collections.length;
    if (nextIndex === this.activeIndex) return;

    this.isAnimating = true;

    const content = this.shadowRoot.querySelector(".content-layer");
    const hero = this.shadowRoot.querySelector(".hero-layer");

    content.classList.add("is-changing");
    hero.classList.add("is-changing");

    setTimeout(() => {
      this.activeIndex = nextIndex;
      this.updateSlide();

      setTimeout(() => {
        content.classList.remove("is-changing");
        hero.classList.remove("is-changing");
        this.isAnimating = false;
      }, 80);
    }, 420);
  }

  updateSlide(first = false) {
    const item = this.current;
    const root = this.shadowRoot.querySelector(".collection-widget");

    root.style.setProperty("--glow", item.glow);

    this.shadowRoot.querySelector("[data-subtitle]").textContent = item.subtitle;

    this.shadowRoot.querySelector("[data-hero]").src = item.hero;
    this.shadowRoot.querySelector("[data-hero]").alt = item.title;

    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const maxGames = isMobile ? 4 : 7;

  
this.shadowRoot.querySelector("[data-games]").innerHTML =
  item.games
    .slice(0, maxGames)
    .map(src => `
      <div class="game">
        <img src="${src}" alt="">
      </div>
    `)
    .join("");

    this.shadowRoot.querySelectorAll("[data-tab]").forEach((btn, i) => {
      btn.classList.toggle("active", i === this.activeIndex);
    });

    this.typeTitle(item.title, first);
  }

  typeTitle(text, instant = false) {
    const title = this.shadowRoot.querySelector("[data-title]");
    title.textContent = "";

    if (instant) {
      title.textContent = text;
      return;
    }

    let i = 0;
    const speed = 28;

    const timer = setInterval(() => {
      title.textContent += text[i];
      i++;

      if (i >= text.length) {
        clearInterval(timer);
      }
    }, speed);
  }
}

if (!customElements.get("slot-collections")) customElements.define("slot-collections", SlotCollections);

class SeaBonusWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.ticking = false;
  }

  connectedCallback() {

    this.render();
    this.cacheElements();
    this.bindEvents();
    this.update();
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.requestUpdate);
    window.removeEventListener("resize", this.requestUpdate);
  }

  get backWaveSrc() {
    return this.getAttribute("back-wave-src") || "./img/wave-back.png";
  }

  get frontWaveSrc() {
    return this.getAttribute("front-wave-src") || "./img/wave-front.png";
  }

  get promoLink() {
    return this.getAttribute("promo-link") || "/promotions";
  }

  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: 100%;
        }

        * {
          box-sizing: border-box;
        }

        .sea-widget {
          position: relative;
          width: 100%;
          max-width: none;
          height: clamp(340px, 28vw, 460px);
          margin: 64px 0;
          overflow: hidden;
          border-radius: 22px;
          background:
            radial-gradient(circle at 78% 42%, rgba(253, 34, 78, .30), transparent 30%),
            radial-gradient(circle at 25% 20%, rgba(255, 98, 126, .12), transparent 28%),
            linear-gradient(120deg, #06070f 0%, #120711 44%, #280813 100%);
          box-shadow:
            0 22px 60px rgba(253, 34, 78, 0.20),
            0 12px 36px rgba(0,0,0,.38),
            inset 0 1px 0 rgba(255,255,255,.12);
        }

        .sea-widget::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background:
            linear-gradient(90deg, rgba(253,34,78,.08) 1px, transparent 1px),
            linear-gradient(0deg, rgba(255,255,255,.045) 1px, transparent 1px);
          background-size: 84px 100%, 100% 54px;
          mask-image: linear-gradient(180deg, transparent 0%, #000 12%, #000 82%, transparent 100%);
          opacity: .58;
        }

        .sea-widget::after {
          content: "";
          position: absolute;
          left: -12%;
          right: -12%;
          bottom: -38%;
          height: 70%;
          z-index: 1;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 50% 0%, rgba(255, 106, 134, .18), transparent 40%),
            linear-gradient(90deg, transparent 0 47%, rgba(255,255,255,.18) 49% 51%, transparent 53% 100%),
            linear-gradient(180deg, rgba(253,34,78,.12), rgba(4,5,12,.74));
          transform: perspective(760px) rotateX(62deg);
          transform-origin: 50% 0%;
          filter: blur(.2px);
        }

    
        .wave-layer {
          position: absolute;
          inset: 0;
          will-change: transform;
          pointer-events: none;
        }


        .wave-layer--back {
          background:
            radial-gradient(circle at 36% 64%, rgba(253,34,78,.36), transparent 22%),
            radial-gradient(circle at 78% 54%, rgba(255,196,206,.12), transparent 26%),
            linear-gradient(100deg, transparent 0%, rgba(253,34,78,.15) 42%, transparent 76%);
          z-index: 2;
          opacity: 0.85;
          mix-blend-mode: screen;
        }

        .speed-burst {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          background:
            repeating-linear-gradient(
              102deg,
              transparent 0 64px,
              rgba(255,255,255,.12) 66px 68px,
              transparent 72px 148px
            );
          opacity: .2;
          mix-blend-mode: screen;
          will-change: transform, opacity;
        }

        .chase-sprite {
          position: absolute;
          z-index: 5;
          pointer-events: none;
          transform-origin: 50% 90%;
          will-change: transform, filter;
          filter:
            saturate(1.15)
            contrast(1.06)
            drop-shadow(0 22px 18px rgba(0,0,0,.42))
            drop-shadow(0 0 22px rgba(253,34,78,.24));
        }

        .chase-sprite svg {
          display: block;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .chase-sprite--mascot {
          left: 6%;
          bottom: 6%;
          width: clamp(210px, 22vw, 360px);
          aspect-ratio: 1.12;
        }

        .chase-sprite--rabbit {
          left: 64%;
          bottom: 13%;
          width: clamp(118px, 12vw, 190px);
          aspect-ratio: 1;
        }

        .runner-leg,
        .rabbit-leg {
          transform-box: fill-box;
          transform-origin: 50% 0%;
          animation: dmbo-run-leg .32s linear infinite alternate;
        }

        .runner-leg--back,
        .rabbit-leg--back {
          animation-delay: -.16s;
        }

        .runner-arm {
          transform-box: fill-box;
          transform-origin: 50% 8%;
          animation: dmbo-run-arm .34s ease-in-out infinite alternate;
        }

        .runner-arm--back {
          animation-delay: -.17s;
        }

        .rabbit-ear {
          transform-box: fill-box;
          transform-origin: 50% 90%;
          animation: dmbo-ear-flop .42s ease-in-out infinite alternate;
        }

        .dust {
          position: absolute;
          z-index: 4;
          left: 12%;
          bottom: 13%;
          width: clamp(170px, 18vw, 270px);
          height: 34px;
          pointer-events: none;
          background:
            radial-gradient(circle, rgba(253,34,78,.32) 0 8px, transparent 9px),
            radial-gradient(circle, rgba(255,255,255,.18) 0 5px, transparent 6px),
            radial-gradient(circle, rgba(253,34,78,.22) 0 7px, transparent 8px);
          background-size: 70px 28px, 46px 22px, 58px 26px;
          background-position: 0 8px, 48px 3px, 116px 10px;
          background-repeat: no-repeat;
          filter: blur(1px);
          opacity: .72;
          will-change: transform, opacity;
        }

        @keyframes dmbo-run-leg {
          from { transform: rotate(18deg); }
          to { transform: rotate(-20deg); }
        }

        @keyframes dmbo-run-arm {
          from { transform: rotate(-18deg); }
          to { transform: rotate(20deg); }
        }

        @keyframes dmbo-ear-flop {
          from { transform: rotate(-8deg); }
          to { transform: rotate(12deg); }
        }

        .wave-layer--front {
          z-index: 6;
          opacity: 0.5;
          background:
            repeating-linear-gradient(
              108deg,
              transparent 0 72px,
              rgba(253,34,78,.18) 74px 78px,
              transparent 82px 160px
            ),
            linear-gradient(90deg, rgba(5,2,8,.26), transparent 36%, rgba(5,2,8,.38));
          mix-blend-mode: screen;
        }

        .sea-cta {
          position: absolute;
          right: 34px;
          top: 50%;
          width: min(360px, 42%);
          padding: 26px;
          border-radius: 8px;
          z-index: 9;
          color: #fff;
          opacity: 0;
          transform: translate(30px, -50%) scale(0.96);
          transition: 0.7s ease;
          background:rgb(3 22 45 / 50%);
            backdrop-filter: blur(8px);
          border: 1px solid rgba(253, 34, 78, .34);
          box-shadow: 0 18px 44px rgba(0,0,0,.34), 0 0 28px rgba(253,34,78,.18);
        }

        .sea-widget.is-finished .sea-cta {
          opacity: 1;
          transform: translate(0, -50%) scale(1);
        }

        .sea-cta__title {
          margin: 0 0 10px;
          font-size: 28px;
          line-height: 1.05;
        }

        .sea-cta__text {
          margin: 0 0 18px;
          font-size: 15px;
          line-height: 1.45;
          opacity: 0.9;
        }

        .sea-cta__btn {
          display: inline-flex;
          align-items: center;
          font-family: Rubik;
          justify-content: center;
          min-height: 44px;
          padding: 0 22px;
          border-radius: 16px;
          color: #fff;
          background: linear-gradient(180deg, #ff5a78, #FD224E);
          text-decoration: none;
          font-weight: 700;
          transition: 0.25s ease;
          box-shadow: 0 10px 24px rgba(253,34,78,.30);
        }

        .sea-cta__btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 24px rgba(255,255,255,0.28);
        }

        @media (max-width: 700px) {

        .wave-layer--front {
    z-index: 6;}
          .sea-widget {
            height: 320px;
            width: 100%;
            margin: 42px 0;
            border-radius: 16px;
          }

          .chase-sprite--mascot {
            left: -8%;
            bottom: 4%;
            width: 260px;
          }

          .chase-sprite--rabbit {
            left: 58%;
            bottom: 15%;
            width: 130px;
          }

          .dust {
            left: 2%;
            bottom: 10%;
          }

          .sea-cta {
            right: 16px;
            left: 16px;
            top: 16px;
            width: auto;
            padding: 18px;
            transform: translateY(-20px) scale(0.96);
          }

          .sea-widget.is-finished .sea-cta {
            transform: translateY(0) scale(1);
          }

          .sea-cta__title {
            font-size: 22px;
          }

          .sea-cta__text {
            font-size: 14px;
          }
        }
      </style>

      <section class="sea-widget">
        <div class="wave-layer wave-layer--back"></div>
        <div class="speed-burst"></div>
        <div class="dust"></div>

        <div class="chase-sprite chase-sprite--mascot" aria-hidden="true">
          <svg viewBox="0 0 220 210" role="img">
            <defs>
              <linearGradient id="dmboBody" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stop-color="#ff6b86"/>
                <stop offset=".58" stop-color="#FD224E"/>
                <stop offset="1" stop-color="#8f0927"/>
              </linearGradient>
              <linearGradient id="dmboGold" x1="0" x2="1">
                <stop offset="0" stop-color="#ffe3a5"/>
                <stop offset="1" stop-color="#d79a25"/>
              </linearGradient>
            </defs>
            <ellipse cx="92" cy="188" rx="78" ry="12" fill="rgba(0,0,0,.28)"/>
            <g class="runner-leg runner-leg--back">
              <path d="M92 133 C76 151 64 166 45 181" stroke="#1c1220" stroke-width="17" stroke-linecap="round"/>
              <path d="M45 181 L22 181" stroke="#FD224E" stroke-width="15" stroke-linecap="round"/>
            </g>
            <g class="runner-leg">
              <path d="M114 132 C126 154 139 169 159 184" stroke="#271525" stroke-width="18" stroke-linecap="round"/>
              <path d="M159 184 L187 184" stroke="#ff5a78" stroke-width="15" stroke-linecap="round"/>
            </g>
            <path d="M68 69 C88 37 137 37 158 70 C177 99 160 145 121 151 C78 158 45 106 68 69Z" fill="url(#dmboBody)" stroke="url(#dmboGold)" stroke-width="5"/>
            <path d="M89 83 C105 66 132 66 146 86 C154 98 150 124 128 132 C101 142 77 112 89 83Z" fill="#120813" opacity=".82"/>
            <text x="103" y="118" font-size="42" font-weight="900" font-family="Arial, sans-serif" fill="#fff">D</text>
            <path d="M83 48 L67 16 L108 39" fill="#FD224E" stroke="url(#dmboGold)" stroke-width="4"/>
            <path d="M139 48 L167 18 L156 61" fill="#FD224E" stroke="url(#dmboGold)" stroke-width="4"/>
            <circle cx="101" cy="70" r="7" fill="#fff"/>
            <circle cx="132" cy="71" r="7" fill="#fff"/>
            <circle cx="104" cy="72" r="3" fill="#111"/>
            <circle cx="135" cy="73" r="3" fill="#111"/>
            <path d="M111 88 C121 96 132 96 143 88" fill="none" stroke="#ffe3a5" stroke-width="5" stroke-linecap="round"/>
            <g class="runner-arm runner-arm--back">
              <path d="M75 100 C48 98 35 83 24 68" fill="none" stroke="#271525" stroke-width="15" stroke-linecap="round"/>
              <circle cx="22" cy="66" r="9" fill="#FD224E"/>
            </g>
            <g class="runner-arm">
              <path d="M150 100 C176 93 188 75 199 58" fill="none" stroke="#271525" stroke-width="15" stroke-linecap="round"/>
              <circle cx="201" cy="56" r="9" fill="#ff5a78"/>
            </g>
          </svg>
        </div>

        <div class="chase-sprite chase-sprite--rabbit" aria-hidden="true">
          <svg viewBox="0 0 160 150" role="img">
            <defs>
              <linearGradient id="rabbitFur" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stop-color="#fff7f8"/>
                <stop offset="1" stop-color="#f3b8c4"/>
              </linearGradient>
            </defs>
            <ellipse cx="74" cy="135" rx="56" ry="8" fill="rgba(0,0,0,.28)"/>
            <g class="rabbit-ear">
              <path d="M63 38 C51 0 62 -9 82 31" fill="url(#rabbitFur)" stroke="#FD224E" stroke-width="4"/>
            </g>
            <g class="rabbit-ear" style="animation-delay:-.18s">
              <path d="M89 40 C93 2 111 -5 110 42" fill="url(#rabbitFur)" stroke="#FD224E" stroke-width="4"/>
            </g>
            <path d="M34 91 C39 57 79 39 114 59 C142 75 132 119 93 127 C57 134 29 119 34 91Z" fill="url(#rabbitFur)" stroke="#FD224E" stroke-width="4"/>
            <circle cx="105" cy="80" r="6" fill="#17111c"/>
            <circle cx="119" cy="92" r="5" fill="#FD224E"/>
            <path d="M117 96 C132 99 144 105 154 116" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
            <g class="rabbit-leg rabbit-leg--back">
              <path d="M66 118 C47 127 34 129 17 126" stroke="#f7ced5" stroke-width="13" stroke-linecap="round"/>
            </g>
            <g class="rabbit-leg">
              <path d="M93 119 C113 128 127 130 145 126" stroke="#f7ced5" stroke-width="13" stroke-linecap="round"/>
            </g>
            <circle cx="37" cy="83" r="16" fill="#fff4f6"/>
          </svg>
        </div>

        <div class="wave-layer wave-layer--front"></div>

        <div class="sea-cta">
          <h2 class="sea-cta__title">Catch the bonus!</h2>
          <p class="sea-cta__text">
            Follow the lucky rabbit and grab the DMBObet welcome reward.
          </p>
          <a href="${this.promoLink}" class="sea-cta__btn">
            Claim bonus
          </a>
        </div>
      </section>
    `;
  }

  cacheElements() {
    this.widget = this.shadowRoot.querySelector(".sea-widget");
    this.backWave = this.shadowRoot.querySelector(".wave-layer--back");
    this.frontWave = this.shadowRoot.querySelector(".wave-layer--front");
    this.speedBurst = this.shadowRoot.querySelector(".speed-burst");
    this.dust = this.shadowRoot.querySelector(".dust");
    this.mascot = this.shadowRoot.querySelector(".chase-sprite--mascot");
    this.rabbit = this.shadowRoot.querySelector(".chase-sprite--rabbit");
  }

  bindEvents() {
    this.requestUpdate = () => {
      if (!this.ticking) {
        requestAnimationFrame(() => this.update());
        this.ticking = true;
      }
    };

    window.addEventListener("scroll", this.requestUpdate, { passive: true });
    window.addEventListener("resize", this.requestUpdate);
  }

  update() {
    if (!this.widget) return;

    const rect = this.widget.getBoundingClientRect();
    const windowH = window.innerHeight;

    const start = windowH * 0.85;
    const end = -rect.height * 0.25;

    const progress = this.clamp(
      (start - rect.top) / (start - end),
      0,
      1
    );

    const widgetW = this.widget.offsetWidth;
    const mascotStart = -widgetW * 0.04;
    const mascotEnd = widgetW * 0.34;
    const rabbitStart = widgetW * 0.72;
    const rabbitEnd = widgetW * 0.52;
    const mascotX = mascotStart + (mascotEnd - mascotStart) * progress;
    const rabbitX = rabbitStart + (rabbitEnd - rabbitStart) * progress;
    const bobMascot = Math.sin(progress * Math.PI * 12) * 7;
    const bobRabbit = Math.sin(progress * Math.PI * 13) * 9;
    const chaseTension = Math.sin(progress * Math.PI);

    this.backWave.style.transform = `
      translateX(${progress * 34}px)
      translateY(${Math.sin(progress * Math.PI * 2) * 4}px)
    `;

    this.frontWave.style.transform = `
      translateX(${-progress * 180}px)
      translateY(${progress * 6}px)
    `;

    if (this.speedBurst) {
      this.speedBurst.style.transform = `translateX(${-progress * 240}px)`;
      this.speedBurst.style.opacity = String(0.16 + chaseTension * 0.18);
    }

    if (this.dust) {
      this.dust.style.transform = `
        translate3d(${mascotX * 0.92}px, ${Math.sin(progress * Math.PI * 8) * 4}px, 0)
        scaleX(${1 + chaseTension * 0.38})
      `;
      this.dust.style.opacity = String(0.46 + chaseTension * 0.34);
    }

    if (this.mascot) {
      this.mascot.style.transform = `
        translate3d(${mascotX}px, ${bobMascot}px, 0)
        rotate(${Math.sin(progress * Math.PI * 8) * 2.3}deg)
        scale(${1 + chaseTension * 0.055})
      `;
    }

    if (this.rabbit) {
      this.rabbit.style.transform = `
        translate3d(${rabbitX}px, ${bobRabbit}px, 0)
        rotate(${Math.sin(progress * Math.PI * 9) * -3.4}deg)
        scale(${1 + chaseTension * 0.08})
      `;
    }

    if (progress > 0.40) {
      this.widget.classList.add("is-finished");
    } else {
      this.widget.classList.remove("is-finished");
    }

    this.ticking = false;
  }
}

if (!customElements.get("sea-bonus-widget")) customElements.define("sea-bonus-widget", SeaBonusWidget); 
(function () {
  const WIDGETS = [
    {
      tagName: "slot-collections",
      targetSelector: '[data-mj="widget-collection-slider"]',
      instanceId: "custom-slot-collections-widget",
      position: "before",
      attributes: {}
    },
    {
      tagName: "sea-bonus-widget",
      targetSelector: '[data-mj="widget-top-providers"]',
      instanceId: "custom-sea-bonus-widget",
      position: "before",
      attributes: {
        "promo-link": "/en/promotions/welcome-bonus"
      }
    }
  ];

  let scheduled = false;
  let observer;

  function getPageDirection() {
    return document.documentElement.getAttribute("dir") === "rtl" ? "rtl" : "ltr";
  }

  function getLanguagePrefix() {
    const segment = location.pathname.split("/").filter(Boolean)[0];
    return segment && /^[a-z]{2}(?:-[a-z]{2})?$/i.test(segment)
      ? `/${segment}`
      : "/en";
  }

  function isHomePage() {
    const path = location.pathname.toLowerCase();
    const hasHomeWidgetTarget = Boolean(
      document.querySelector(
        '[data-mj="widget-top-providers"], [data-mj="widget-collection-slider"]'
      )
    );

    return (
      path === "/" ||
      path === "/test.html" ||
      /^\/[a-z]{2}(?:-[a-z]{2})?\/?$/i.test(path) ||
      hasHomeWidgetTarget
    );
  }

  function applyAttributes(element, attributes = {}) {
    Object.entries(attributes).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
  }

  function removeWidget(config) {
    const widget = document.getElementById(config.instanceId);
    if (widget) widget.remove();
  }

  function insertWidget(config) {
    if (!isHomePage()) {
      removeWidget(config);
      return false;
    }

    const {
      tagName,
      targetSelector,
      instanceId,
      position = "before",
      attributes = {}
    } = config;

    const target = document.querySelector(targetSelector);
    if (!target || !target.parentNode) return false;

    let widget = document.getElementById(instanceId);

    if (!widget) {
      widget = document.createElement(tagName);
      widget.id = instanceId;
    }

    applyAttributes(widget, attributes);
    widget.setAttribute("dir", getPageDirection());

    if (instanceId === "custom-sea-bonus-widget") {
      widget.setAttribute(
        "promo-link",
        `${getLanguagePrefix()}/promotions/welcome-bonus`
      );
    }

    const isCorrectPosition =
      position === "before"
        ? widget.nextElementSibling === target
        : widget.previousElementSibling === target;

    if (isCorrectPosition) return true;

    if (position === "after") {
      target.parentNode.insertBefore(widget, target.nextSibling);
    } else {
      target.parentNode.insertBefore(widget, target);
    }

    console.log(`[WIDGET-INJECTOR] ${tagName} inserted / restored`);
    return true;
  }

  function syncWidgets() {
    if (!isHomePage()) {
      WIDGETS.forEach(removeWidget);
      return;
    }

    WIDGETS.forEach(insertWidget);
  }

  function scheduleSync() {
    if (scheduled) return;

    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      syncWidgets();
    });
  }

  function startWidgetInjector() {
    if (!document.body || observer) return;

    syncWidgets();

    observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.addEventListener("popstate", scheduleSync);
    window.addEventListener("hashchange", scheduleSync);

    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function () {
      originalPushState.apply(this, arguments);
      scheduleSync();
    };

    history.replaceState = function () {
      originalReplaceState.apply(this, arguments);
      scheduleSync();
    };
  }

  if (document.body) {
    startWidgetInjector();
  } else {
    document.addEventListener("DOMContentLoaded", startWidgetInjector, {
      once: true
    });
  }
})();

(function () {
  const modalBodySelector =
    '.modal[role="alertdialog"].app-ltr-1hznvn2 .app-ltr-p2ly1m';
  let scheduled = false;

  function syncBonusModalState() {
    scheduled = false;

    document.querySelectorAll(modalBodySelector).forEach((modalBody) => {
      const content = (modalBody.textContent || "").replace(/\s+/g, " ").trim();

      modalBody.classList.toggle(
        "dmbobet-bonus-calculating",
        /calculating offers/i.test(content)
      );
    });
  }

  function scheduleBonusModalSync() {
    if (scheduled) return;

    scheduled = true;
    requestAnimationFrame(syncBonusModalState);
  }

  syncBonusModalState();

  new MutationObserver(scheduleBonusModalSync).observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });
})();

(function initDmbobetAccountAccordion() {
  const version = 2;
  const previousController = window.__dmbobetAccountAccordionController;

  if (previousController && previousController.version === version) return;
  if (previousController && typeof previousController.destroy === "function") {
    previousController.destroy();
  }

  window.__dmbobetAccountAccordionReady = version;

  const menuSelector = '[data-mj="account-menu"]';
  const arrowSelector =
    'button[aria-label^="arrow_"], button[name^="arrow_"]';
  const activeClass = "dmb-account-active";
  const closingClass = "dmb-account-is-closing";
  let activeItemIndex = null;
  let observer = null;
  let syncScheduled = false;
  let closingOtherMenus = false;

  function isOpenButton(button) {
    return (
      button.getAttribute("aria-label") === "arrow_up" ||
      button.getAttribute("name") === "arrow_up"
    );
  }

  function getDirectMenuItem(button, menu) {
    const item = button.closest("li");
    return item && item.parentElement === menu ? item : null;
  }

  function getDirectMenuItems(menu) {
    return Array.from(menu.children).filter(
      (element) => element.tagName === "LI"
    );
  }

  function applyVisualState(menu) {
    if (!menu || !menu.isConnected) return;

    const hasActiveIndex =
      Number.isInteger(activeItemIndex) && activeItemIndex >= 0;

    getDirectMenuItems(menu).forEach((item, index) => {
      item.classList.toggle(
        activeClass,
        hasActiveIndex && index === activeItemIndex
      );
    });
  }

  function syncAllMenus() {
    syncScheduled = false;

    const menus = document.querySelectorAll(menuSelector);
    menus.forEach(applyVisualState);

    if (!menus.length && activeItemIndex !== null) {
      activeItemIndex = null;
      stopObserver();
    }
  }

  function scheduleVisualSync() {
    if (syncScheduled) return;
    syncScheduled = true;
    requestAnimationFrame(syncAllMenus);
  }

  function startObserver() {
    if (observer) return;

    observer = new MutationObserver(scheduleVisualSync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-label", "name"]
    });
  }

  function stopObserver() {
    if (!observer) return;
    observer.disconnect();
    observer = null;
  }

  function closeOtherItems(menu, currentItem) {
    if (!menu || closingOtherMenus) return;

    closingOtherMenus = true;

    try {
      menu.querySelectorAll(arrowSelector).forEach((button) => {
        const item = getDirectMenuItem(button, menu);

        if (item && item !== currentItem && isOpenButton(button)) {
          button.click();
        }
      });
    } finally {
      closingOtherMenus = false;
    }
  }

  function hasInjectedSubmenus() {
    return Array.from(document.querySelectorAll(menuSelector)).some((menu) =>
      Array.from(menu.children).some((element) => element.tagName !== "LI")
    );
  }

  function releaseClosingState(attempt = 0) {
    if (!document.body.classList.contains(closingClass)) return;

    if (hasInjectedSubmenus() && attempt < 10) {
      setTimeout(() => releaseClosingState(attempt + 1), 60);
      return;
    }

    document.body.classList.remove(closingClass);
  }

  function handleAccountMenuClick(event) {
    if (closingOtherMenus) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest(arrowSelector);
    if (!button) return;

    const menu = button.closest(menuSelector);
    if (!menu) return;

    const currentItem = getDirectMenuItem(button, menu);
    if (!currentItem) return;

    const itemIndex = getDirectMenuItems(menu).indexOf(currentItem);
    const isClosingCurrentItem = isOpenButton(button);

    if (isClosingCurrentItem) {
      activeItemIndex = null;
      document.body.classList.add(closingClass);
      syncAllMenus();
      stopObserver();

      setTimeout(releaseClosingState, 60);

      return;
    }

    document.body.classList.remove(closingClass);
    activeItemIndex = itemIndex;
    applyVisualState(menu);
    startObserver();

    /* Close existing sections before React opens the requested section. */
    closeOtherItems(menu, currentItem);

    /* Reapply ownership whenever React replaces the menu node or its children. */
    scheduleVisualSync();
  }

  document.addEventListener("click", handleAccountMenuClick, true);

  window.__dmbobetAccountAccordionController = {
    version,
    destroy() {
      document.removeEventListener("click", handleAccountMenuClick, true);
      stopObserver();
      document.body.classList.remove(closingClass);
      document
        .querySelectorAll(`${menuSelector} > li.${activeClass}`)
        .forEach((item) => item.classList.remove(activeClass));
    }
  };
})();

(function initDmbobetMobileBottomNavGuard() {
  const version = 1;
  const previousController = window.__dmbobetMobileBottomNavGuardController;

  if (previousController && previousController.version === version) return;
  if (previousController && typeof previousController.destroy === "function") {
    previousController.destroy();
  }

  const mobileQuery = "(max-width: 991px)";
  const navSelector = '[data-mj="bottom-nav"]';
  const restoredAttribute = "data-dmbobet-bottom-nav-restored";
  const managedAttribute = "data-dmbobet-bottom-nav-managed";
  const storageKey = "dmbobet:last-mobile-bottom-nav";
  const managedProperties = [
    "display",
    "visibility",
    "opacity",
    "position",
    "left",
    "right",
    "top",
    "bottom",
    "width",
    "max-width",
    "height",
    "min-height",
    "margin-bottom",
    "padding-bottom",
    "transform",
    "translate",
    "pointer-events",
    "overflow",
    "z-index"
  ];
  let observer = null;
  let scheduled = false;

  function isMobile() {
    if (window.matchMedia) {
      return window.matchMedia(mobileQuery).matches;
    }

    return window.innerWidth <= 991;
  }

  function getStoredMarkup() {
    try {
      return sessionStorage.getItem(storageKey) || localStorage.getItem(storageKey);
    } catch (error) {
      return "";
    }
  }

  function storeMarkup(nav) {
    if (!nav || nav.hasAttribute(restoredAttribute)) return;

    try {
      sessionStorage.setItem(storageKey, nav.outerHTML);
      localStorage.setItem(storageKey, nav.outerHTML);
    } catch (error) {
      /* Storage can be blocked in private mode; the live nav still gets pinned. */
    }
  }

  function setImportant(element, property, value) {
    if (
      element.style.getPropertyValue(property) === value &&
      element.style.getPropertyPriority(property) === "important"
    ) {
      return;
    }

    element.style.setProperty(property, value, "important");
  }

  function clearManagedStyles(element) {
    if (!element || element.getAttribute(managedAttribute) !== "true") return;

    managedProperties.forEach((property) => {
      element.style.removeProperty(property);
    });
    element.removeAttribute(managedAttribute);
  }

  function pinElement(element, asFixedNav, displayValue) {
    if (!element) return;

    element.setAttribute(managedAttribute, "true");
    setImportant(element, "display", displayValue || (asFixedNav ? "block" : "flex"));
    setImportant(element, "visibility", "visible");
    setImportant(element, "opacity", "1");
    setImportant(element, "left", "0");
    setImportant(element, "right", "0");
    setImportant(element, "top", "auto");
    setImportant(element, "bottom", "0");
    setImportant(element, "width", "100%");
    setImportant(element, "max-width", "100%");
    setImportant(element, "height", "auto");
    setImportant(element, "min-height", "0");
    setImportant(element, "margin-bottom", "0");
    setImportant(element, "padding-bottom", "0");
    setImportant(element, "transform", "none");
    setImportant(element, "translate", "none");
    setImportant(element, "pointer-events", "auto");
    setImportant(element, "overflow", "visible");

    if (asFixedNav) {
      setImportant(element, "position", "fixed");
      setImportant(element, "z-index", "2147483000");
    } else {
      setImportant(element, "position", "relative");
    }
  }

  function pinNav(nav) {
    if (!nav) return;

    pinElement(nav, true);

    Array.from(nav.children).forEach((child) => pinElement(child, false, "block"));

    const inner = nav.querySelector('[class~="app-ltr-ja3k2i"]');
    if (inner) {
      pinElement(inner, false, "flex");
      setImportant(inner, "display", "flex");
    }

    nav.querySelectorAll('a[data-mj="bottom-nav-item"]').forEach((item) => {
      setImportant(item, "display", "inline-flex");
      setImportant(item, "visibility", "visible");
      setImportant(item, "opacity", "1");
      setImportant(item, "pointer-events", "auto");
    });
  }

  function getNativeNavs() {
    return Array.from(document.querySelectorAll(navSelector)).filter(
      (nav) => !nav.hasAttribute(restoredAttribute)
    );
  }

  function removeRestoredNavs() {
    document
      .querySelectorAll(`${navSelector}[${restoredAttribute}="true"]`)
      .forEach((nav) => nav.remove());
  }

  function restoreCachedNav() {
    if (!document.body || document.querySelector(navSelector)) return null;

    const markup = getStoredMarkup();
    if (!markup) return null;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = markup.trim();

    const nav = wrapper.querySelector(navSelector);
    if (!nav) return null;

    nav.setAttribute(restoredAttribute, "true");
    document.body.appendChild(nav);
    return nav;
  }

  function cleanupDesktopState() {
    document
      .querySelectorAll(`[${managedAttribute}="true"]`)
      .forEach(clearManagedStyles);
    removeRestoredNavs();
  }

  function syncBottomNav() {
    scheduled = false;

    if (!isMobile()) {
      cleanupDesktopState();
      return;
    }

    const nativeNavs = getNativeNavs();

    if (nativeNavs.length) {
      removeRestoredNavs();
      nativeNavs.forEach((nav) => {
        storeMarkup(nav);
        pinNav(nav);
      });
      return;
    }

    const restoredNav = restoreCachedNav();
    if (restoredNav) pinNav(restoredNav);
  }

  function scheduleSync() {
    if (scheduled) return;

    scheduled = true;
    requestAnimationFrame(syncBottomNav);
  }

  function patchHistory(method) {
    const original = history[method];
    if (!original || original.__dmbobetBottomNavGuardPatched) return;

    history[method] = function () {
      const result = original.apply(this, arguments);
      scheduleSync();
      return result;
    };
    history[method].__dmbobetBottomNavGuardPatched = true;
  }

  function start() {
    if (!document.body) return;

    scheduleSync();

    observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style", "aria-hidden"]
    });

    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    window.addEventListener("orientationchange", scheduleSync);
    window.addEventListener("popstate", scheduleSync);
    window.addEventListener("hashchange", scheduleSync);
    patchHistory("pushState");
    patchHistory("replaceState");
  }

  window.__dmbobetMobileBottomNavGuardController = {
    version,
    destroy() {
      if (observer) observer.disconnect();
      observer = null;
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("orientationchange", scheduleSync);
      window.removeEventListener("popstate", scheduleSync);
      window.removeEventListener("hashchange", scheduleSync);
      cleanupDesktopState();
    }
  };

  if (document.body) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  }
})();
