"use strict";

class TelegramBotApi {
  constructor(token) {
    this.token = String(token || "").trim();

    if (!this.token) {
      throw new Error("Telegram bot token is required.");
    }

    this.baseUrl = `https://api.telegram.org/bot${this.token}`;
  }

  async request(method, payload) {
    const response = await fetch(`${this.baseUrl}/${method}`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload || {})
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result || !result.ok) {
      const description = result && result.description ? result.description : response.statusText;
      throw new Error(`${method} failed: ${description}`);
    }

    return result.result;
  }

  getMe() {
    return this.request("getMe");
  }

  getWebhookInfo() {
    return this.request("getWebhookInfo");
  }

  setMyCommands(commands) {
    return this.request("setMyCommands", { commands });
  }

  setChatMenuButton(text, url) {
    return this.request("setChatMenuButton", {
      menu_button: {
        type: "web_app",
        text,
        web_app: { url }
      }
    });
  }

  setWebhook(url, secretToken) {
    return this.request("setWebhook", {
      url,
      secret_token: secretToken,
      allowed_updates: ["message", "callback_query", "inline_query", "chat_join_request"]
    });
  }

  deleteWebhook() {
    return this.request("deleteWebhook", { drop_pending_updates: false });
  }

  answerCallbackQuery(callbackQueryId, text) {
    return this.request("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
      text: text || ""
    });
  }

  sendMessage(chatId, text, replyMarkup, parseMode) {
    const payload = {
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
      reply_markup: replyMarkup
    };

    if (parseMode) {
      payload.parse_mode = parseMode;
    }

    return this.request("sendMessage", payload);
  }
}

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function ensureAbsoluteHttpsUrl(value, label) {
  let url;

  try {
    url = new URL(value);
  } catch (_error) {
    throw new Error(`${label} must be a valid absolute URL.`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`${label} must use HTTPS for Telegram Mini Apps.`);
  }

  return url.toString();
}

function resolveWebsiteUrl(value, config, label = "Button URL") {
  const websiteUrl = ensureAbsoluteHttpsUrl(config.websiteUrl, "Website URL");
  const raw = String(value || "").trim();
  let url;

  try {
    url = raw ? new URL(raw, websiteUrl) : new URL(websiteUrl);
  } catch (_error) {
    throw new Error(`${label} must be a valid URL or website-relative path.`);
  }

  if (url.protocol !== "https:") {
    throw new Error(`${label} must use HTTPS for Telegram Mini Apps.`);
  }

  return url.toString();
}

function buildLaunchUrl(config, targetUrl) {
  const websiteUrl = resolveWebsiteUrl(targetUrl, config, "Launch URL");

  if (config.launchMode !== "wrapper") {
    return websiteUrl;
  }

  const publicBaseUrl = ensureAbsoluteHttpsUrl(config.publicBaseUrl, "Public Base URL");
  const miniAppUrl = new URL(config.miniAppPath || "/miniapp", trimTrailingSlash(publicBaseUrl));
  miniAppUrl.searchParams.set("target", websiteUrl);

  if (config.websiteId) {
    miniAppUrl.searchParams.set("websiteId", config.websiteId);
  }

  if (config.botId) {
    miniAppUrl.searchParams.set("botId", config.botId);
  }

  return miniAppUrl.toString();
}

function buildWebhookUrl(config) {
  const publicBaseUrl = ensureAbsoluteHttpsUrl(config.publicBaseUrl, "Public Base URL");
  const webhookPath = config.webhookPath || "/telegram/webhook";
  const webhookSecretToken = config.webhookSecretToken || "";
  const pathParts = [
    webhookPath.replace(/\/+$/, ""),
    config.websiteId ? encodeURIComponent(config.websiteId) : "",
    config.botId ? encodeURIComponent(config.botId) : "",
    encodeURIComponent(webhookSecretToken)
  ].filter(Boolean);
  const url = new URL(pathParts.join("/"), trimTrailingSlash(publicBaseUrl));

  return url.toString();
}

function sortButtons(buttons) {
  return [...(buttons || [])].sort((left, right) => {
    if (left.row !== right.row) {
      return left.row - right.row;
    }

    return String(left.id).localeCompare(String(right.id));
  });
}

function buttonMatchesPlacement(button, placement) {
  return button.enabled !== false && (button.placement === placement || button.placement === "both");
}

function buttonToInlineMarkup(button, config) {
  if (button.type === "callback") {
    return {
      text: button.label,
      callback_data: button.callbackData || button.id
    };
  }

  if (button.type === "url") {
    return {
      text: button.label,
      url: resolveWebsiteUrl(button.url, config)
    };
  }

  return {
    text: button.label,
    web_app: { url: buildLaunchUrl(config, button.url) }
  };
}

function groupButtonsByRow(buttons, mapper) {
  const rows = [];

  sortButtons(buttons).forEach((button) => {
    const rowIndex = Math.max(0, Number(button.row) || 0);

    rows[rowIndex] = rows[rowIndex] || [];
    rows[rowIndex].push(mapper(button));
  });

  return rows.filter(Boolean);
}

function getInlineButtons(config) {
  return (config.buttons || []).filter((button) => buttonMatchesPlacement(button, "inline"));
}

function getReplyButtons(config) {
  return (config.buttons || []).filter((button) => buttonMatchesPlacement(button, "reply") && button.type === "web_app");
}

function getMenuButton(config) {
  const buttons = config.buttons || [];
  const selected = buttons.find((button) => button.enabled !== false && button.id === config.menuButtonId && button.type === "web_app");

  if (selected) {
    return selected;
  }

  return buttons.find((button) => button.enabled !== false && button.type === "web_app") || null;
}

function inlineKeyboard(config) {
  const buttons = getInlineButtons(config);

  if (!buttons.length) {
    return undefined;
  }

  return {
    inline_keyboard: groupButtonsByRow(buttons, (button) => buttonToInlineMarkup(button, config))
  };
}

function replyKeyboard(config) {
  const buttons = getReplyButtons(config);

  if (!buttons.length) {
    return undefined;
  }

  return {
    keyboard: groupButtonsByRow(buttons, (button) => ({
      text: button.label,
      web_app: { url: buildLaunchUrl(config, button.url) }
    })),
    resize_keyboard: true,
    one_time_keyboard: false,
    input_field_placeholder: "Open EsportesNew"
  };
}

function normalizeLanguageCode(value) {
  return String(value || "")
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();
}

function selectWelcomeText(config, user) {
  const messages = config.welcomeMessages && typeof config.welcomeMessages === "object"
    ? config.welcomeMessages
    : {};
  const languageCode = normalizeLanguageCode(user && user.language_code);
  const shortLanguage = languageCode.split("-")[0];

  return messages[languageCode]
    || messages[shortLanguage]
    || messages.default
    || config.welcomeText
    || "";
}

function renderWelcomeText(config, user) {
  const useHtml = (config.welcomeParseMode || config.parseMode) === "HTML";
  const serialize = useHtml ? escapeHtml : String;
  const firstName = serialize(user && user.first_name ? user.first_name : "there");
  const lastName = serialize(user && user.last_name ? user.last_name : "");
  const username = serialize(user && user.username ? user.username : "");

  return String(selectWelcomeText(config, user))
    .replaceAll("{{first_name}}", firstName)
    .replaceAll("{{last_name}}", lastName)
    .replaceAll("{{username}}", username);
}

async function sendLaunchMessages(client, chatId, config, user) {
  return client.sendMessage(chatId, renderWelcomeText(config, user), inlineKeyboard(config), config.welcomeParseMode || config.parseMode);
}

async function handleTelegramUpdate(update, config, store) {
  const client = new TelegramBotApi(config.telegramBotToken);
  const callbackQuery = update.callback_query;
  const message = update.message || update.edited_message;

  if (callbackQuery) {
    if (callbackQuery.from && callbackQuery.from.id) {
      store.upsertTelegramUser(callbackQuery.from, "callback_query", config);
    }

    await client.answerCallbackQuery(callbackQuery.id, "Done");

    if (callbackQuery.message && callbackQuery.message.chat) {
      await sendLaunchMessages(client, callbackQuery.message.chat.id, config, callbackQuery.from);
    }

    return { handled: true, type: "callback_query" };
  }

  if (!message || !message.chat) {
    return { handled: false };
  }

  if (message.web_app_data) {
    await client.sendMessage(
      message.chat.id,
      `Received website data: <code>${escapeHtml(message.web_app_data.data || "")}</code>`,
      undefined,
      "HTML"
    );
    return { handled: true, type: "web_app_data" };
  }

  const text = (message.text || "").trim();

  if (message.from && message.from.id) {
    store.upsertTelegramUser(message.from, "bot_message", config);
  }

  if (text === "/start" || text.startsWith("/start ")) {
    await sendLaunchMessages(client, message.chat.id, config, message.from);
    return { handled: true, type: "start" };
  }

  if (text === "/app") {
    await client.sendMessage(message.chat.id, "Choose an action below.", inlineKeyboard(config));
    return { handled: true, type: "app" };
  }

  if (text === "/keyboard") {
    await client.sendMessage(message.chat.id, "The launch button is now on your Telegram keyboard.", replyKeyboard(config));
    return { handled: true, type: "keyboard" };
  }

  return { handled: false };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = {
  TelegramBotApi,
  buildLaunchUrl,
  buildWebhookUrl,
  getMenuButton,
  handleTelegramUpdate,
  inlineKeyboard,
  replyKeyboard,
  renderWelcomeText,
  resolveWebsiteUrl,
  sendLaunchMessages
};
