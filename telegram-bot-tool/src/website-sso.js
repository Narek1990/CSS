"use strict";

const DEFAULT_SSO_CONFIG = {
  enabled: true,
  serverLoginEnabled: false,
  signupFallbackEnabled: false,
  usernameTemplate: "{{telegram_username}}",
  passwordTemplate: "",
  defaultLanguage: "en",
  loginEndpoint: "/api/identity/api/v1/playeraccount/login",
  signupEndpoint: "/api/user/api/v1.0/fastSignUp/signup",
  telegramLoginEndpoint: "/api/identity/api/v1/playeraccount/login-telegram",
  passwordResetPath: "/en/forgot-password",
  loginPayload: {
    username: "{{username}}",
    password: "{{password}}",
    returnUrl: "/",
    rememberlogin: false
  },
  signupPayload: {
    userName: "{{username}}",
    language: "{{language}}"
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeSsoConfig(sso) {
  const source = sso && typeof sso === "object" && !Array.isArray(sso) ? sso : {};

  return {
    enabled: source.enabled !== false,
    serverLoginEnabled: Boolean(source.serverLoginEnabled),
    signupFallbackEnabled: Boolean(source.signupFallbackEnabled),
    usernameTemplate: String(source.usernameTemplate || DEFAULT_SSO_CONFIG.usernameTemplate).trim() || DEFAULT_SSO_CONFIG.usernameTemplate,
    passwordTemplate: String(source.passwordTemplate || ""),
    defaultLanguage: cleanLanguage(source.defaultLanguage || DEFAULT_SSO_CONFIG.defaultLanguage),
    loginEndpoint: cleanEndpoint(source.loginEndpoint, DEFAULT_SSO_CONFIG.loginEndpoint),
    signupEndpoint: cleanEndpoint(source.signupEndpoint, DEFAULT_SSO_CONFIG.signupEndpoint),
    telegramLoginEndpoint: cleanEndpoint(source.telegramLoginEndpoint, DEFAULT_SSO_CONFIG.telegramLoginEndpoint),
    passwordResetPath: cleanEndpoint(source.passwordResetPath, DEFAULT_SSO_CONFIG.passwordResetPath),
    loginPayload: normalizePayload(source.loginPayload, DEFAULT_SSO_CONFIG.loginPayload),
    signupPayload: normalizePayload(source.signupPayload, DEFAULT_SSO_CONFIG.signupPayload)
  };
}

function normalizePayload(value, fallback) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return clone(fallback);
  }

  return clone(value);
}

function cleanEndpoint(value, fallback) {
  const raw = String(value || fallback || "").trim();

  if (!raw) {
    return fallback;
  }

  if (/^https:\/\//i.test(raw) || raw.startsWith("/")) {
    return raw;
  }

  return `/${raw}`;
}

function cleanLanguage(value) {
  const language = String(value || DEFAULT_SSO_CONFIG.defaultLanguage)
    .trim()
    .replace(/_/g, "-")
    .toLowerCase();

  return /^[a-z]{2,3}(-[a-z0-9]{2,8})?$/.test(language) ? language : DEFAULT_SSO_CONFIG.defaultLanguage;
}

function cleanUsername(value, fallback) {
  const username = String(value || "")
    .replace(/^@/, "")
    .trim()
    .replace(/[^a-zA-Z0-9_.-]/g, "_")
    .slice(0, 64);

  return username || fallback;
}

function buildSsoContext(config, user) {
  const sso = normalizeSsoConfig(config && config.sso);
  const telegramId = user && user.id ? String(user.id) : "";
  const telegramUsername = cleanUsername(user && user.username, telegramId ? `tg_${telegramId}` : "telegram_user");
  const language = cleanLanguage((user && user.language_code) || sso.defaultLanguage);
  const firstName = String((user && user.first_name) || "").trim();
  const lastName = String((user && user.last_name) || "").trim();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const context = {
    telegram_id: telegramId,
    telegram_username: telegramUsername,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName,
    language,
    website_url: config && config.websiteUrl ? config.websiteUrl : "",
    bot_username: config && config.botUsername ? config.botUsername : ""
  };

  context.username = cleanUsername(renderTemplate(sso.usernameTemplate, context), telegramUsername);
  context.password = renderTemplate(sso.passwordTemplate, context);

  return context;
}

function renderTemplate(value, context) {
  return String(value || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_match, key) => {
    return context[key] === undefined || context[key] === null ? "" : String(context[key]);
  });
}

function renderPayload(value, context) {
  if (typeof value === "string") {
    return renderTemplate(value, context);
  }

  if (Array.isArray(value)) {
    return value.map((item) => renderPayload(item, context));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, renderPayload(entry, context)]));
  }

  return value;
}

function resolveWebsiteEndpoint(config, endpoint) {
  const baseUrl = new URL(config.websiteUrl);
  const target = new URL(endpoint, baseUrl);

  if (target.protocol !== "https:") {
    throw new Error("EsportesNew SSO endpoints must use HTTPS.");
  }

  return target.toString();
}

function buildSsoPreview(config, user) {
  const sso = normalizeSsoConfig(config && config.sso);
  const context = buildSsoContext(config || {}, user || {});

  return {
    enabled: sso.enabled,
    serverLoginEnabled: sso.serverLoginEnabled,
    signupFallbackEnabled: sso.signupFallbackEnabled,
    username: context.username,
    language: context.language,
    loginEndpoint: resolveWebsiteEndpoint(config, sso.loginEndpoint),
    signupEndpoint: resolveWebsiteEndpoint(config, sso.signupEndpoint),
    telegramLoginEndpoint: resolveWebsiteEndpoint(config, sso.telegramLoginEndpoint),
    passwordResetUrl: resolveWebsiteEndpoint(config, sso.passwordResetPath),
    loginPayload: renderPayload(sso.loginPayload, context),
    signupPayload: renderPayload(sso.signupPayload, context)
  };
}

async function attemptWebsiteSso(config, user) {
  const sso = normalizeSsoConfig(config && config.sso);

  if (!sso.enabled || !sso.serverLoginEnabled) {
    return {
      ok: false,
      skipped: true,
      reason: "Server-side login/signup fallback is disabled."
    };
  }

  const preview = buildSsoPreview(config, user);
  const attempts = [];

  if (preview.loginPayload.password) {
    const login = await postJson(preview.loginEndpoint, preview.loginPayload);
    attempts.push(summarizeAttempt("login", login));

    if (login.ok) {
      return {
        ok: true,
        action: "login",
        username: preview.username,
        attempts
      };
    }
  } else {
    attempts.push({
      action: "login",
      ok: false,
      skipped: true,
      reason: "Login password template is empty."
    });
  }

  if (!sso.signupFallbackEnabled) {
    return {
      ok: false,
      action: "login",
      username: preview.username,
      attempts,
      reason: "Signup fallback is disabled."
    };
  }

  const signup = await postJson(preview.signupEndpoint, preview.signupPayload);
  attempts.push(summarizeAttempt("signup", signup));

  if (!signup.ok) {
    return {
      ok: false,
      action: "signup",
      username: preview.username,
      attempts,
      reason: signup.message
    };
  }

  if (preview.loginPayload.password) {
    const retryLogin = await postJson(preview.loginEndpoint, preview.loginPayload);
    attempts.push(summarizeAttempt("login_after_signup", retryLogin));

    if (retryLogin.ok) {
      return {
        ok: true,
        action: "login_after_signup",
        username: preview.username,
        attempts
      };
    }
  }

  return {
    ok: true,
    action: "signup",
    username: preview.username,
    attempts
  };
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  const json = safeJson(text);

  return {
    ok: response.ok,
    status: response.status,
    message: response.ok ? "" : extractMessage(json, text),
    data: response.ok ? json : undefined
  };
}

function summarizeAttempt(action, attempt) {
  return {
    action,
    ok: attempt.ok,
    status: attempt.status,
    message: attempt.message || ""
  };
}

function safeJson(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch (_error) {
    return null;
  }
}

function extractMessage(json, text) {
  if (json && json.message) {
    return String(json.message);
  }

  if (json && json.title) {
    return String(json.title);
  }

  if (json && json.errors) {
    return JSON.stringify(json.errors);
  }

  return String(text || "Request failed.").slice(0, 500);
}

module.exports = {
  DEFAULT_SSO_CONFIG,
  attemptWebsiteSso,
  buildSsoContext,
  buildSsoPreview,
  normalizeSsoConfig,
  renderPayload,
  renderTemplate
};
