(function () {
  var href = "https://cdn.jsdelivr.net/gh/Narek1990/CSS@main/omnicasinon/omnicasinon.css?v=" + Date.now();
  var existing = document.querySelector('link[data-omnicasinon-css="true"]');

  if (existing) {
    existing.href = href;
    return;
  }

  document.head.appendChild(
    Object.assign(document.createElement("link"), {
      rel: "stylesheet",
      href: href,
      "data-omnicasinon-css": "true"
    })
  );
})();
