"use strict";

const form = document.querySelector("#configForm");
const output = document.querySelector("#output");
const connectionStatus = document.querySelector("#connectionStatus");
const savedState = document.querySelector("#savedState");
const launchUrl = document.querySelector("#launchUrl");
const tokenState = document.querySelector("#tokenState");
const webhookState = document.querySelector("#webhookState");
const usersBody = document.querySelector("#usersBody");
const buttonsList = document.querySelector("#buttonsList");
const menuButtonId = document.querySelector("#menuButtonId");
const messagePreview = document.querySelector("#messagePreview");
const inlinePreview = document.querySelector("#inlinePreview");
const replyPreview = document.querySelector("#replyPreview");
const websiteSelect = document.querySelector("#websiteSelect");
const botSelect = document.querySelector("#botSelect");
const welcomeEditor = document.querySelector("#welcomeEditor");
const profileState = document.querySelector("#profileState");
const previewBotName = document.querySelector("#previewBotName");
const previewAvatar = document.querySelector("#previewAvatar");

let appConfig = {
  activeWebsiteId: "esportesnew",
  activeBotId: "esportesnew-bot",
  websites: []
};
let buttons = [];
let hydrating = false;
const pendingTokens = new Map();

function adminHeaders() {
  const token = window.localStorage.getItem("telegramToolAdminToken") || "";
  const headers = {
    "content-type": "application/json"
  };

  if (token) {
    headers["x-admin-token"] = token;
  }

  return headers;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...adminHeaders(),
      ...(options.headers || {})
    }
  });
  const result = await response.json().catch(() => ({
    ok: false,
    error: response.statusText
  }));

  if (!response.ok || !result.ok) {
    throw new Error(result.error || response.statusText);
  }

  return result;
}

function print(value) {
  output.textContent = JSON.stringify(value, null, 2);
}

function setStatus(text, state) {
  connectionStatus.textContent = text;
  connectionStatus.dataset.state = state || "";
}

function markDirty() {
  if (!hydrating) {
    savedState.textContent = "Unsaved";
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function slugify(value, fallback) {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/^@/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || fallback;
}

function uniqueId(value, existing, fallback) {
  const base = slugify(value, fallback);
  let candidate = base;
  let counter = 2;

  while (existing.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  existing.add(candidate);
  return candidate;
}

function option(value, label, selectedValue) {
  return `<option value="${escapeHtml(value)}"${value === selectedValue ? " selected" : ""}>${escapeHtml(label)}</option>`;
}

function defaultButtons(websiteUrl) {
  const base = websiteUrl || "https://esportesnew.com/";

  return [
    {
      id: "play",
      label: "Play",
      type: "web_app",
      placement: "inline",
      url: base,
      callbackData: "play",
      row: 0,
      enabled: true
    },
    {
      id: "deposit",
      label: "Deposit",
      type: "web_app",
      placement: "inline",
      url: "/en/home?m=deposit",
      callbackData: "deposit",
      row: 1,
      enabled: true
    },
    {
      id: "history",
      label: "History",
      type: "web_app",
      placement: "inline",
      url: "/en/profile/transactions",
      callbackData: "history",
      row: 2,
      enabled: true
    }
  ];
}

function normalizeButton(button, index, usedIds) {
  const label = String(button.label || "Open").trim().slice(0, 64) || "Open";
  const id = uniqueId(button.id || label, usedIds, `button-${index + 1}`);
  const type = ["web_app", "url", "callback"].includes(button.type) ? button.type : "web_app";
  const placement = ["inline", "reply", "both"].includes(button.placement) ? button.placement : "inline";
  const row = Number.isFinite(Number(button.row)) ? Number(button.row) : index;

  return {
    id,
    label,
    type,
    placement,
    url: String(button.url || "").trim(),
    callbackData: String(button.callbackData || button.callback_data || id).trim().slice(0, 64),
    row,
    enabled: button.enabled !== false
  };
}

function normalizeButtons(sourceButtons) {
  const usedIds = new Set();

  return (Array.isArray(sourceButtons) && sourceButtons.length ? sourceButtons : defaultButtons(currentWebsite().websiteUrl))
    .map((button, index) => normalizeButton(button, index, usedIds));
}

function normalizeBot(bot, index, website) {
  const source = bot || {};

  return {
    id: source.id || `bot-${index + 1}`,
    label: source.label || source.username || `Bot ${index + 1}`,
    username: String(source.username || "").replace(/^@/, ""),
    telegramBotToken: source.telegramBotToken || "",
    hasTelegramBotToken: Boolean(source.hasTelegramBotToken || source.telegramBotToken),
    webhookSecretToken: source.webhookSecretToken || "",
    menuButtonText: source.menuButtonText || "Play",
    menuButtonId: source.menuButtonId || "play",
    welcomeText: source.welcomeText || "Hello {{first_name}},\n\nWelcome. Choose an action below.",
    welcomeParseMode: "HTML",
    buttons: normalizeButtons(source.buttons || defaultButtons(website.websiteUrl)),
    commands: Array.isArray(source.commands) && source.commands.length ? source.commands : [
      { command: "start", description: "Open website" },
      { command: "app", description: "Launch the website" },
      { command: "keyboard", description: "Show Telegram app button" }
    ]
  };
}

function normalizeWebsite(website, index) {
  const source = website || {};
  const bots = Array.isArray(source.bots) && source.bots.length ? source.bots : [];
  const normalized = {
    id: source.id || (index === 0 ? "esportesnew" : `website-${index + 1}`),
    name: source.name || source.appTitle || `Website ${index + 1}`,
    appTitle: source.appTitle || source.name || `Website ${index + 1}`,
    websiteUrl: source.websiteUrl || "https://esportesnew.com/",
    publicBaseUrl: source.publicBaseUrl || "",
    launchMode: ["direct", "wrapper"].includes(source.launchMode) ? source.launchMode : "direct",
    miniAppPath: source.miniAppPath || "/miniapp",
    webhookPath: source.webhookPath || "/telegram/webhook",
    activeBotId: source.activeBotId || "",
    bots: []
  };

  normalized.bots = (bots.length ? bots : [createBot(normalized, 0)])
    .map((bot, botIndex) => normalizeBot(bot, botIndex, normalized));
  normalized.activeBotId = normalized.bots.some((bot) => bot.id === source.activeBotId)
    ? source.activeBotId
    : normalized.bots[0].id;

  return normalized;
}

function normalizeAppConfig(config) {
  const source = config || {};
  const websites = Array.isArray(source.websites) && source.websites.length ? source.websites : [];

  appConfig = {
    activeWebsiteId: source.activeWebsiteId || "esportesnew",
    activeBotId: source.activeBotId || "",
    websites: (websites.length ? websites : [createWebsite(0)]).map(normalizeWebsite)
  };

  if (!appConfig.websites.some((website) => website.id === appConfig.activeWebsiteId)) {
    appConfig.activeWebsiteId = appConfig.websites[0].id;
  }

  const website = currentWebsite();

  if (!website.bots.some((bot) => bot.id === appConfig.activeBotId)) {
    appConfig.activeBotId = website.activeBotId || website.bots[0].id;
  }

  website.activeBotId = appConfig.activeBotId;
  return appConfig;
}

function currentWebsite() {
  return appConfig.websites.find((website) => website.id === appConfig.activeWebsiteId) || appConfig.websites[0] || createWebsite(0);
}

function currentBot() {
  const website = currentWebsite();

  return website.bots.find((bot) => bot.id === appConfig.activeBotId) || website.bots.find((bot) => bot.id === website.activeBotId) || website.bots[0];
}

function selectedProfile() {
  return {
    website: currentWebsite(),
    bot: currentBot()
  };
}

function profileKey(website, bot) {
  return `${website.id}:${bot.id}`;
}

function selectedPayload(extra = {}) {
  const { website, bot } = selectedProfile();

  return {
    websiteId: website.id,
    botId: bot.id,
    ...extra
  };
}

function selectedPath(path) {
  const { website, bot } = selectedProfile();
  const params = new URLSearchParams({
    websiteId: website.id,
    botId: bot.id
  });

  return `${path}?${params.toString()}`;
}

function createWebsite(index) {
  const current = appConfig.websites && appConfig.websites.length ? currentWebsite() : null;
  const existingIds = new Set((appConfig.websites || []).map((website) => website.id));
  const id = uniqueId(`website-${index + 1}`, existingIds, `website-${index + 1}`);
  const website = {
    id,
    name: "New Website",
    appTitle: "New Website",
    websiteUrl: "https://esportesnew.com/",
    publicBaseUrl: current ? current.publicBaseUrl : "",
    launchMode: "direct",
    miniAppPath: "/miniapp",
    webhookPath: "/telegram/webhook",
    activeBotId: "",
    bots: []
  };
  const bot = createBot(website, 0);

  website.bots = [bot];
  website.activeBotId = bot.id;
  return website;
}

function createBot(website, index) {
  const current = appConfig.websites && appConfig.websites.length ? currentBot() : null;
  const existingIds = new Set((website.bots || []).map((bot) => bot.id));
  const id = uniqueId(`bot-${index + 1}`, existingIds, `bot-${index + 1}`);
  const sourceButtons = current && current.buttons ? clone(current.buttons) : defaultButtons(website.websiteUrl);

  return {
    id,
    label: `Bot ${index + 1}`,
    username: "",
    telegramBotToken: "",
    hasTelegramBotToken: false,
    webhookSecretToken: "",
    menuButtonText: current ? current.menuButtonText : "Play",
    menuButtonId: current ? current.menuButtonId : "play",
    welcomeText: current ? current.welcomeText : "Hello {{first_name}},\n\nWelcome. Choose an action below.",
    welcomeParseMode: "HTML",
    buttons: sourceButtons,
    commands: current && current.commands ? clone(current.commands) : [
      { command: "start", description: "Open website" },
      { command: "app", description: "Launch the website" },
      { command: "keyboard", description: "Show Telegram app button" }
    ]
  };
}

function fillSelectors() {
  const website = currentWebsite();

  websiteSelect.innerHTML = appConfig.websites
    .map((item) => option(item.id, item.name, website.id))
    .join("");
  botSelect.innerHTML = website.bots
    .map((item) => option(item.id, item.username ? `${item.label} (@${item.username})` : item.label, appConfig.activeBotId))
    .join("");
}

function fillForm() {
  const { website, bot } = selectedProfile();
  const mode = website.launchMode || "direct";
  const modeInput = form.querySelector(`input[name="launchMode"][value="${mode}"]`);

  hydrating = true;
  form.websiteName.value = website.name || "";
  form.appTitle.value = website.appTitle || website.name || "";
  form.websiteUrl.value = website.websiteUrl || "https://esportesnew.com/";
  form.publicBaseUrl.value = website.publicBaseUrl || "";
  form.miniAppPath.value = website.miniAppPath || "/miniapp";
  form.webhookPath.value = website.webhookPath || "/telegram/webhook";
  form.botLabel.value = bot.label || "";
  form.telegramBotToken.value = pendingTokens.get(profileKey(website, bot)) || "";
  form.menuButtonText.value = bot.menuButtonText || "Play";

  if (modeInput) {
    modeInput.checked = true;
  }

  buttons = normalizeButtons(bot.buttons);
  setEditorHtml(bot.welcomeText || "");
  form.welcomeText.value = bot.welcomeText || "";
  renderButtons(bot.menuButtonId || "play");
  renderPreview();
  updateFacts();
  hydrating = false;
}

function syncCurrentFormToState() {
  if (hydrating || !appConfig.websites.length) {
    return;
  }

  const { website, bot } = selectedProfile();
  const token = form.telegramBotToken.value.trim();

  website.name = form.websiteName.value.trim() || website.name || "Website";
  website.appTitle = form.appTitle.value.trim() || website.name;
  website.websiteUrl = form.websiteUrl.value.trim() || website.websiteUrl || "https://esportesnew.com/";
  website.publicBaseUrl = form.publicBaseUrl.value.trim();
  website.miniAppPath = cleanPath(form.miniAppPath.value, "/miniapp");
  website.webhookPath = cleanPath(form.webhookPath.value, "/telegram/webhook");
  website.launchMode = new FormData(form).get("launchMode") || "direct";
  website.activeBotId = bot.id;
  appConfig.activeWebsiteId = website.id;
  appConfig.activeBotId = bot.id;

  bot.label = form.botLabel.value.trim() || bot.label || "Bot";
  bot.menuButtonText = form.menuButtonText.value.trim() || "Play";
  bot.menuButtonId = menuButtonId.value;
  bot.welcomeText = editorToTelegramHtml();
  bot.welcomeParseMode = "HTML";
  bot.buttons = normalizeButtons(buttons);
  form.welcomeText.value = bot.welcomeText;

  if (token) {
    pendingTokens.set(profileKey(website, bot), token);
    bot.telegramBotToken = token;
    bot.hasTelegramBotToken = true;
  }
}

function cleanPath(value, fallback) {
  const raw = String(value || fallback || "/").trim() || fallback || "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;

  return withSlash.replace(/\/+$/, "") || "/";
}

function prepareConfigForSave() {
  syncCurrentFormToState();
  const payload = clone(appConfig);

  payload.websites.forEach((website) => {
    website.bots.forEach((bot) => {
      const pendingToken = pendingTokens.get(profileKey(website, bot));

      if (pendingToken) {
        bot.telegramBotToken = pendingToken;
      }
    });
  });

  return payload;
}

async function saveConfig(options = {}) {
  const result = await api("/api/config", {
    method: "POST",
    body: JSON.stringify(prepareConfigForSave())
  });

  pendingTokens.clear();
  normalizeAppConfig(result.config);
  fillSelectors();

  if (options.refill !== false) {
    fillForm();
  } else {
    updateFacts();
  }

  savedState.textContent = "Saved";

  if (options.printResult) {
    print(result);
  }

  return result;
}

function createButton() {
  const index = buttons.length + 1;

  return normalizeButton({
    id: `button-${index}`,
    label: "New Button",
    type: "web_app",
    placement: "inline",
    url: form.websiteUrl.value.trim() || "https://esportesnew.com/",
    callbackData: `button-${index}`,
    row: buttons.length,
    enabled: true
  }, buttons.length, new Set(buttons.map((button) => button.id)));
}

function renderButtons(selectedMenuId) {
  buttonsList.innerHTML = buttons.map((button, index) => {
    return `
      <article class="button-row" data-index="${index}">
        <div class="button-row-top">
          <label class="toggle">
            <input type="checkbox" data-field="enabled" ${button.enabled ? "checked" : ""}>
            <span>Enabled</span>
          </label>
          <div class="move-actions">
            <button type="button" class="icon-btn" data-action="up" ${index === 0 ? "disabled" : ""} title="Move up">Up</button>
            <button type="button" class="icon-btn" data-action="down" ${index === buttons.length - 1 ? "disabled" : ""} title="Move down">Down</button>
            <button type="button" class="icon-btn danger-text" data-action="delete" title="Delete">Delete</button>
          </div>
        </div>
        <div class="button-fields">
          <label>
            <span>Label</span>
            <input data-field="label" maxlength="64" value="${escapeHtml(button.label)}">
          </label>
          <label>
            <span>Type</span>
            <select data-field="type">
              ${option("web_app", "Mini App", button.type)}
              ${option("url", "Browser URL", button.type)}
              ${option("callback", "Callback", button.type)}
            </select>
          </label>
          <label>
            <span>Placement</span>
            <select data-field="placement">
              ${option("inline", "Inline", button.placement)}
              ${option("reply", "Reply Keyboard", button.placement)}
              ${option("both", "Both", button.placement)}
            </select>
          </label>
          <label>
            <span>Row</span>
            <input data-field="row" type="number" min="0" value="${escapeHtml(button.row)}">
          </label>
          <label class="wide-field">
            <span>URL or Path</span>
            <input data-field="url" placeholder="/en/home?m=deposit" value="${escapeHtml(button.url)}">
          </label>
          <label>
            <span>Callback Data</span>
            <input data-field="callbackData" maxlength="64" value="${escapeHtml(button.callbackData)}">
          </label>
        </div>
      </article>
    `;
  }).join("");

  renderMenuOptions(selectedMenuId);
}

function renderMenuOptions(selectedMenuId) {
  const webAppButtons = buttons.filter((button) => button.enabled && button.type === "web_app");
  const fallback = webAppButtons[0] ? webAppButtons[0].id : "";
  const selected = webAppButtons.some((button) => button.id === selectedMenuId) ? selectedMenuId : fallback;

  menuButtonId.innerHTML = webAppButtons.length
    ? webAppButtons.map((button) => option(button.id, button.label, selected)).join("")
    : option("", "No Mini App buttons", "");
  menuButtonId.value = selected;
}

function renderPreview() {
  const { website, bot } = selectedProfile();
  const message = (form.welcomeText.value || editorToTelegramHtml() || "Welcome. Choose an action below.")
    .replaceAll("{{first_name}}", "Narek")
    .replaceAll("{{last_name}}", "")
    .replaceAll("{{username}}", "narek_0909");
  const inlineButtons = buttons.filter((button) => button.enabled && ["inline", "both"].includes(button.placement));
  const replyButtons = buttons.filter((button) => button.enabled && ["reply", "both"].includes(button.placement) && button.type === "web_app");

  previewBotName.textContent = bot.username ? `@${bot.username}` : (form.botLabel.value || bot.label || "Telegram bot");
  previewAvatar.textContent = (form.appTitle.value || website.appTitle || website.name || "T").slice(0, 1).toUpperCase();
  messagePreview.innerHTML = sanitizeHtml(message).replace(/\n/g, "<br>");
  inlinePreview.innerHTML = renderPreviewRows(inlineButtons);
  replyPreview.innerHTML = replyButtons.length
    ? `<div class="reply-title">Reply keyboard</div>${renderPreviewRows(replyButtons)}`
    : "";
  launchUrl.textContent = buildPreviewUrl(menuButtonId.value);
  profileState.textContent = `${form.websiteName.value || website.name} / ${form.botLabel.value || bot.label}`;
}

function renderPreviewRows(sourceButtons) {
  const rows = [];

  sourceButtons
    .slice()
    .sort((left, right) => {
      if (left.row !== right.row) {
        return left.row - right.row;
      }

      return String(left.id).localeCompare(String(right.id));
    })
    .forEach((button) => {
      const rowIndex = Math.max(0, Number(button.row) || 0);
      rows[rowIndex] = rows[rowIndex] || [];
      rows[rowIndex].push(`<span class="preview-button">${escapeHtml(button.label)}<small>${button.type === "web_app" ? "Mini App" : button.type}</small></span>`);
    });

  return rows.filter(Boolean).map((row) => `<div class="preview-row">${row.join("")}</div>`).join("");
}

function buildPreviewUrl(buttonId) {
  const { website, bot } = selectedProfile();
  const button = buttons.find((item) => item.id === buttonId) || buttons.find((item) => item.type === "web_app");
  const target = button && button.url ? button.url : form.websiteUrl.value.trim();

  if (!target) {
    return "-";
  }

  try {
    const websiteUrl = new URL(form.websiteUrl.value.trim() || website.websiteUrl || "https://esportesnew.com/");
    const resolvedTarget = new URL(target, websiteUrl).toString();

    if (new FormData(form).get("launchMode") !== "wrapper") {
      return resolvedTarget;
    }

    const publicBaseUrl = form.publicBaseUrl.value.trim();
    const miniAppPath = cleanPath(form.miniAppPath.value || website.miniAppPath, "/miniapp");

    if (!publicBaseUrl) {
      return `${miniAppPath}?websiteId=${encodeURIComponent(website.id)}&botId=${encodeURIComponent(bot.id)}&target=${encodeURIComponent(resolvedTarget)}`;
    }

    const wrapperUrl = new URL(miniAppPath, publicBaseUrl);
    wrapperUrl.searchParams.set("websiteId", website.id);
    wrapperUrl.searchParams.set("botId", bot.id);
    wrapperUrl.searchParams.set("target", resolvedTarget);

    return wrapperUrl.toString();
  } catch (_error) {
    return target;
  }
}

function updateFacts() {
  const { website, bot } = selectedProfile();
  const pendingToken = pendingTokens.get(profileKey(website, bot));

  profileState.textContent = `${website.name || "Website"} / ${bot.label || "Bot"}`;
  tokenState.textContent = pendingToken
    ? "New token ready to save"
    : (bot.hasTelegramBotToken || bot.telegramBotToken ? bot.telegramBotToken || "Saved" : "Not saved");
  webhookState.textContent = website.publicBaseUrl ? "Ready to publish" : "Needs public HTTPS URL";
}

function setEditorHtml(value) {
  const raw = String(value || "");

  if (!/<[a-z][\s\S]*>/i.test(raw)) {
    welcomeEditor.innerHTML = escapeHtml(raw).replace(/\n/g, "<br>");
    return;
  }

  welcomeEditor.innerHTML = sanitizeHtml(raw).replace(/\n/g, "<br>");
}

function editorToTelegramHtml() {
  const html = Array.from(welcomeEditor.childNodes)
    .map(nodeToTelegramHtml)
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return html || "";
}

function nodeToTelegramHtml(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml(node.nodeValue);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const tag = node.tagName.toLowerCase();
  const content = Array.from(node.childNodes).map(nodeToTelegramHtml).join("");

  if (tag === "br") {
    return "\n";
  }

  if (tag === "div") {
    return `${content}\n`;
  }

  if (tag === "p") {
    return `${content}\n\n`;
  }

  if (tag === "b" || tag === "strong") {
    return `<b>${content}</b>`;
  }

  if (tag === "i" || tag === "em") {
    return `<i>${content}</i>`;
  }

  if (tag === "u") {
    return `<u>${content}</u>`;
  }

  if (tag === "s" || tag === "strike" || tag === "del") {
    return `<s>${content}</s>`;
  }

  if (tag === "code") {
    return `<code>${content}</code>`;
  }

  if (tag === "pre") {
    return `<pre>${content}</pre>`;
  }

  if (tag === "a") {
    const href = safeHref(node.getAttribute("href"));

    return href ? `<a href="${escapeHtml(href)}">${content}</a>` : content;
  }

  return content;
}

function sanitizeHtml(value) {
  const template = document.createElement("template");

  template.innerHTML = String(value || "");
  return Array.from(template.content.childNodes).map(sanitizeNode).join("");
}

function sanitizeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml(node.nodeValue);
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const tag = node.tagName.toLowerCase();
  const content = Array.from(node.childNodes).map(sanitizeNode).join("");

  if (tag === "br") {
    return "\n";
  }

  if (tag === "div" || tag === "p") {
    return `${content}\n`;
  }

  if (["b", "strong", "i", "em", "u", "s", "strike", "del", "code", "pre"].includes(tag)) {
    return `<${tag}>${content}</${tag}>`;
  }

  if (tag === "a") {
    const href = safeHref(node.getAttribute("href"));

    return href ? `<a href="${escapeHtml(href)}">${content}</a>` : content;
  }

  return content;
}

function safeHref(value) {
  try {
    const url = new URL(value || "", form.websiteUrl.value || "https://esportesnew.com/");

    if (!["https:", "http:"].includes(url.protocol)) {
      return "";
    }

    return url.toString();
  } catch (_error) {
    return "";
  }
}

function wrapSelection(tagName) {
  const selection = window.getSelection();

  if (!selection || !selection.rangeCount) {
    return;
  }

  const range = selection.getRangeAt(0);
  const wrapper = document.createElement(tagName);

  try {
    range.surroundContents(wrapper);
  } catch (_error) {
    wrapper.appendChild(range.extractContents());
    range.insertNode(wrapper);
  }

  selection.removeAllRanges();
  range.selectNodeContents(wrapper);
  selection.addRange(range);
}

function updateButtonFromField(target) {
  const row = target.closest(".button-row");

  if (!row) {
    return;
  }

  const index = Number(row.dataset.index);
  const field = target.dataset.field;

  if (!field || !buttons[index]) {
    return;
  }

  if (field === "enabled") {
    buttons[index][field] = target.checked;
  } else if (field === "row") {
    buttons[index][field] = Number(target.value) || 0;
  } else {
    buttons[index][field] = target.value;
  }

  buttons[index] = normalizeButton(buttons[index], index, new Set(buttons.filter((_, itemIndex) => itemIndex !== index).map((button) => button.id)));
  renderMenuOptions(menuButtonId.value);
  syncCurrentFormToState();
  renderPreview();
  markDirty();
}

async function checkConnection(printResult = true) {
  const result = await api(selectedPath("/api/bot/status"));
  const status = result.status;

  if (!status.tokenSaved) {
    setStatus("Token missing", "error");
    webhookState.textContent = "Paste token, save config";
  } else if (status.connected && status.bot) {
    setStatus(`@${status.bot.username} connected`, "ready");
    webhookState.textContent = status.webhook && status.webhook.url ? status.webhook.url : "Connected";
  } else if (status.bot) {
    setStatus(`@${status.bot.username} token OK`, "ready");
    webhookState.textContent = status.nextStep || (status.publicBaseUrlSet ? "Webhook not active" : "Needs public HTTPS URL");
  }

  if (status.launchUrl) {
    launchUrl.textContent = status.launchUrl;
  }

  if (printResult) {
    print(result);
  }

  return result;
}

async function loadUsers() {
  const result = await api(selectedPath("/api/users"));
  const rows = result.users.map((user) => {
    const name = [user.first_name, user.last_name].filter(Boolean).join(" ");
    return `
      <tr>
        <td>${escapeHtml(user.id)}</td>
        <td>${escapeHtml(name || "-")}</td>
        <td>${escapeHtml(user.username || "-")}</td>
        <td>${escapeHtml(user.botUsername ? `@${user.botUsername}` : (user.botLabel || user.botId || "-"))}</td>
        <td>${escapeHtml(user.source || "-")}</td>
        <td>${escapeHtml(user.lastSeenAt || "-")}</td>
      </tr>
    `;
  });

  usersBody.innerHTML = rows.length
    ? rows.join("")
    : '<tr><td colspan="6">No users yet.</td></tr>';
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  savedState.textContent = "Saving";

  try {
    const result = await saveConfig({ printResult: true });
    setStatus("Saved", "ready");
    print(result);
  } catch (error) {
    savedState.textContent = "Failed";
    print({ error: error.message });
  }
});

form.addEventListener("input", () => {
  syncCurrentFormToState();
  renderPreview();
  updateFacts();
  markDirty();
});

form.addEventListener("change", () => {
  syncCurrentFormToState();
  renderPreview();
  updateFacts();
  markDirty();
});

welcomeEditor.addEventListener("input", () => {
  syncCurrentFormToState();
  renderPreview();
  markDirty();
});

document.querySelector(".editor-toolbar").addEventListener("click", (event) => {
  const action = event.target.dataset.format;

  if (!action) {
    return;
  }

  welcomeEditor.focus();

  if (action === "code") {
    wrapSelection("code");
  } else if (action === "createLink") {
    const requestedHref = window.prompt("Link URL", form.websiteUrl.value.trim());

    if (requestedHref === null) {
      return;
    }

    const href = safeHref(requestedHref);

    if (href) {
      document.execCommand("createLink", false, href);
    }
  } else {
    document.execCommand(action, false, null);
  }

  syncCurrentFormToState();
  renderPreview();
  markDirty();
});

websiteSelect.addEventListener("change", () => {
  syncCurrentFormToState();
  appConfig.activeWebsiteId = websiteSelect.value;
  appConfig.activeBotId = currentWebsite().activeBotId || currentWebsite().bots[0].id;
  fillSelectors();
  fillForm();
  markDirty();
  checkConnection(false).catch(() => {});
  loadUsers().catch((error) => print({ error: error.message }));
});

botSelect.addEventListener("change", () => {
  syncCurrentFormToState();
  const website = currentWebsite();

  appConfig.activeBotId = botSelect.value;
  website.activeBotId = botSelect.value;
  fillSelectors();
  fillForm();
  markDirty();
  checkConnection(false).catch(() => {});
  loadUsers().catch((error) => print({ error: error.message }));
});

document.querySelector("#addWebsite").addEventListener("click", () => {
  syncCurrentFormToState();
  const website = createWebsite(appConfig.websites.length);

  appConfig.websites.push(website);
  appConfig.activeWebsiteId = website.id;
  appConfig.activeBotId = website.activeBotId;
  fillSelectors();
  fillForm();
  markDirty();
});

document.querySelector("#addBot").addEventListener("click", () => {
  syncCurrentFormToState();
  const website = currentWebsite();
  const bot = createBot(website, website.bots.length);

  website.bots.push(bot);
  website.activeBotId = bot.id;
  appConfig.activeBotId = bot.id;
  fillSelectors();
  fillForm();
  markDirty();
});

buttonsList.addEventListener("input", (event) => {
  updateButtonFromField(event.target);
});

buttonsList.addEventListener("change", (event) => {
  if (event.target.matches("select, input[type='checkbox']")) {
    updateButtonFromField(event.target);
  }
});

buttonsList.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  const row = event.target.closest(".button-row");

  if (!action || !row) {
    return;
  }

  const index = Number(row.dataset.index);

  if (action === "delete") {
    buttons.splice(index, 1);
  }

  if (action === "up" && index > 0) {
    [buttons[index - 1], buttons[index]] = [buttons[index], buttons[index - 1]];
  }

  if (action === "down" && index < buttons.length - 1) {
    [buttons[index + 1], buttons[index]] = [buttons[index], buttons[index + 1]];
  }

  renderButtons(menuButtonId.value);
  syncCurrentFormToState();
  renderPreview();
  markDirty();
});

document.querySelector("#addButton").addEventListener("click", () => {
  syncCurrentFormToState();
  buttons.push(createButton());
  renderButtons(menuButtonId.value);
  syncCurrentFormToState();
  renderPreview();
  markDirty();
});

document.querySelector("#verifyBot").addEventListener("click", async () => {
  try {
    savedState.textContent = "Saving";
    syncCurrentFormToState();
    const { website, bot } = selectedProfile();
    const pendingToken = pendingTokens.get(profileKey(website, bot));
    const config = prepareConfigForSave();
    const result = await api("/api/bot/verify", {
      method: "POST",
      body: JSON.stringify(selectedPayload({
        config,
        ...(pendingToken ? { telegramBotToken: pendingToken } : {})
      }))
    });

    pendingTokens.clear();
    normalizeAppConfig(result.config);
    fillSelectors();
    fillForm();
    setStatus(result.bot.username ? `@${result.bot.username} verified` : "Verified", "ready");
    savedState.textContent = "Saved";
    print(result);
  } catch (error) {
    savedState.textContent = "Failed";
    setStatus("Bot error", "error");
    print({ error: error.message });
  }
});

document.querySelector("#checkConnection").addEventListener("click", async () => {
  try {
    savedState.textContent = "Saving";
    await saveConfig();
    await checkConnection();
  } catch (error) {
    savedState.textContent = "Failed";
    setStatus("Connection error", "error");
    print({ error: error.message });
  }
});

document.querySelector("#setupBot").addEventListener("click", async () => {
  try {
    savedState.textContent = "Saving";
    await saveConfig();
    const result = await api("/api/bot/setup", {
      method: "POST",
      body: JSON.stringify(selectedPayload())
    });

    normalizeAppConfig(result.config);
    fillSelectors();
    fillForm();
    launchUrl.textContent = result.launchUrl || "-";
    webhookState.textContent = result.webhookUrl || result.webhookSkippedReason || "Menu/button configured";
    setStatus("Telegram setup done", "ready");
    savedState.textContent = "Saved";
    print(result);
    await checkConnection(false);
  } catch (error) {
    savedState.textContent = "Failed";
    setStatus("Setup failed", "error");
    print({ error: error.message });
  }
});

document.querySelector("#sendTest").addEventListener("click", async () => {
  const chatId = document.querySelector("#chatId").value.trim();

  try {
    await saveConfig();
    const result = await api("/api/bot/send-test", {
      method: "POST",
      body: JSON.stringify(selectedPayload({
        chatId,
        message: form.welcomeText.value.trim()
      }))
    });
    print(result);
  } catch (error) {
    print({ error: error.message });
  }
});

document.querySelector("#deleteWebhook").addEventListener("click", async () => {
  try {
    const result = await api("/api/bot/delete-webhook", {
      method: "POST",
      body: JSON.stringify(selectedPayload())
    });
    webhookState.textContent = "Deleted";
    print(result);
  } catch (error) {
    print({ error: error.message });
  }
});

document.querySelector("#refreshUsers").addEventListener("click", () => {
  loadUsers().catch((error) => print({ error: error.message }));
});

async function loadConfig() {
  try {
    const result = await api("/api/config");

    normalizeAppConfig(result.config);
    fillSelectors();
    fillForm();
    launchUrl.textContent = result.launchUrl || buildPreviewUrl(currentBot().menuButtonId);
    savedState.textContent = "Loaded";
    setStatus("Ready", "ready");
    checkConnection(false).catch(() => {});
  } catch (error) {
    if (String(error.message).includes("Admin token")) {
      const token = window.prompt("Admin token");
      if (token) {
        window.localStorage.setItem("telegramToolAdminToken", token);
        await loadConfig();
      }
      return;
    }

    setStatus("Config error", "error");
    print({ error: error.message });
  }
}

loadConfig()
  .then(loadUsers)
  .catch((error) => print({ error: error.message }));
