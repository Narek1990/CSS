"use strict";

const assert = require("assert/strict");
const test = require("node:test");
const {
  attemptWebsiteSso,
  buildNativeTelegramSsoPreview,
  buildSsoContext,
  buildSsoPreview,
  renderPayload
} = require("../src/website-sso");

test("builds EsportesNew SSO context from Telegram user", () => {
  const context = buildSsoContext({
    websiteUrl: "https://esportesnew.com/",
    sso: {
      usernameTemplate: "{{telegram_username}}",
      defaultLanguage: "en"
    }
  }, {
    id: 42,
    username: "narek_telegram",
    first_name: "Narek",
    language_code: "pt-BR"
  });

  assert.equal(context.username, "narek_telegram");
  assert.equal(context.language, "pt-br");
});

test("renders nested SSO payload templates", () => {
  assert.deepEqual(renderPayload({
    userName: "{{username}}",
    profile: {
      telegramId: "{{telegram_id}}"
    }
  }, {
    username: "player",
    telegram_id: "42"
  }), {
    userName: "player",
    profile: {
      telegramId: "42"
    }
  });
});

test("previews login and signup payloads without sending requests", () => {
  const preview = buildSsoPreview({
    websiteUrl: "https://esportesnew.com/",
    sso: {
      usernameTemplate: "{{telegram_username}}",
      defaultLanguage: "en"
    }
  }, {
    id: 42,
    username: "player",
    language_code: "es"
  });

  assert.equal(preview.username, "player");
  assert.equal(preview.loginEndpoint, "https://esportesnew.com/api/identity/api/v1/playeraccount/login");
  assert.equal(preview.telegramLoginEndpoint, "https://esportesnew.com/api/identity/api/v1/playeraccount/login-telegram");
  assert.equal(preview.browserLogin.mode, "website-native-telegram-webapp");
  assert.equal(preview.browserLogin.effectiveLaunchMode, "direct");
  assert.equal(preview.passwordGenerated, true);
  assert.ok(preview.loginPayload.password.startsWith("TgA1!"));
  assert.deepEqual({
    ...preview.signupPayload,
    password: "{{masked}}",
    confirmPassword: "{{masked}}"
  }, {
    userName: "player",
    language: "es",
    password: "{{masked}}",
    confirmPassword: "{{masked}}"
  });
  assert.equal(preview.signupPayload.password, preview.loginPayload.password);
  assert.equal(preview.signupPayload.confirmPassword, preview.loginPayload.password);
});

test("auto-adds generated password to login payloads that were saved without one", () => {
  const preview = buildSsoPreview({
    websiteId: "esportesnew",
    botId: "esportesnew-bot",
    websiteUrl: "https://esportesnew.com/",
    webhookSecretToken: "stable-webhook-secret",
    sso: {
      usernameTemplate: "{{telegram_username}}",
      loginPayload: {
        username: "{{username}}",
        returnUrl: "/"
      }
    }
  }, {
    id: 619995858,
    username: "player_one",
    language_code: "en"
  });

  assert.equal(preview.loginPayload.username, "player_one");
  assert.ok(preview.loginPayload.password.startsWith("TgA1!"));
  assert.equal(preview.signupPayload.password, preview.loginPayload.password);
});

test("generated SSO password is tied to Telegram user id, not mutable username", () => {
  const config = {
    websiteId: "esportesnew",
    botId: "esportesnew-bot",
    websiteUrl: "https://esportesnew.com/",
    webhookSecretToken: "stable-webhook-secret",
    sso: {
      usernameTemplate: "{{telegram_username}}"
    }
  };
  const first = buildSsoPreview(config, {
    id: 619995858,
    username: "first_username",
    language_code: "en"
  });
  const second = buildSsoPreview(config, {
    id: 619995858,
    username: "changed_username",
    language_code: "en"
  });

  assert.equal(first.loginPayload.password, second.loginPayload.password);
  assert.notEqual(first.username, second.username);
});

test("describes the AzenPlay-style native Telegram WebApp SSO sequence", () => {
  const preview = buildNativeTelegramSsoPreview({
    websiteUrl: "https://esportesnew.com/",
    launchMode: "wrapper",
    sso: {
      enabled: true,
      nativeTelegramLoginEnabled: true,
      telegramLoginEndpoint: "/api/identity/api/v1/playeraccount/login-telegram",
      meSigninEndpoint: "/api/v1/me/signin",
      nativeReturnUrl: "/"
    }
  });

  assert.equal(preview.enabled, true);
  assert.equal(preview.effectiveLaunchMode, "direct");
  assert.equal(preview.iframeSupported, false);
  assert.equal(preview.loginEndpoint, "https://esportesnew.com/api/identity/api/v1/playeraccount/login-telegram");
  assert.equal(preview.meSigninUrl, "https://esportesnew.com/api/v1/me/signin?returnUrl=%2F");
  assert.match(preview.warning, /Iframe wrapper mode is bypassed/);
});

test("logs in after signup when old login payload omitted password", async (t) => {
  const originalFetch = global.fetch;
  const requests = [];
  const responses = [
    { ok: false, status: 404, body: { message: "User not found" } },
    { ok: false, status: 404, body: { message: "User not found" } },
    { ok: true, status: 200, body: { ok: true } },
    { ok: true, status: 200, body: { ok: true } }
  ];

  t.after(() => {
    global.fetch = originalFetch;
  });
  global.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    const response = responses.shift();

    return {
      ok: response.ok,
      status: response.status,
      text: async () => JSON.stringify(response.body)
    };
  };

  const result = await attemptWebsiteSso({
    websiteId: "esportesnew",
    botId: "esportesnew-bot",
    websiteUrl: "https://esportesnew.com/",
    webhookSecretToken: "stable-webhook-secret",
    sso: {
      serverLoginEnabled: true,
      signupFallbackEnabled: true,
      usernameTemplate: "{{telegram_username}}",
      loginPayload: {
        username: "{{username}}",
        returnUrl: "/",
        rememberlogin: false
      },
      signupPayload: {
        userName: "{{username}}",
        language: "{{language}}"
      }
    }
  }, {
    id: 619995858,
    username: "new_player",
    language_code: "en"
  });

  assert.equal(result.ok, true);
  assert.equal(result.action, "login_after_signup");
  assert.equal(result.attempts.length, 4);
  assert.equal(result.attempts[0].skipped, undefined);
  assert.ok(requests[0].password.startsWith("TgA1!"));
  assert.notEqual(requests[1].password, requests[0].password);
  assert.equal(requests[2].password, requests[0].password);
  assert.equal(requests[3].password, requests[0].password);
});

test("tries legacy generated password before duplicate-user signup fallback", async (t) => {
  const originalFetch = global.fetch;
  const requests = [];
  const responses = [
    { ok: false, status: 404, body: { message: "User not found" } },
    { ok: true, status: 200, body: { ok: true } }
  ];

  t.after(() => {
    global.fetch = originalFetch;
  });
  global.fetch = async (_url, options) => {
    requests.push(JSON.parse(options.body));
    const response = responses.shift();

    return {
      ok: response.ok,
      status: response.status,
      text: async () => JSON.stringify(response.body)
    };
  };

  const result = await attemptWebsiteSso({
    websiteId: "esportesnew",
    botId: "esportesnew-bot",
    websiteUrl: "https://esportesnew.com/",
    webhookSecretToken: "stable-webhook-secret",
    botUsername: "esportesnew_bot",
    sso: {
      serverLoginEnabled: true,
      signupFallbackEnabled: true,
      usernameTemplate: "{{telegram_username}}"
    }
  }, {
    id: 619995858,
    username: "old_player",
    language_code: "en"
  });

  assert.equal(result.ok, true);
  assert.equal(result.action, "login_legacy_password");
  assert.equal(result.attempts.length, 2);
  assert.notEqual(requests[0].password, requests[1].password);
});

test("records failed EsportesNew signup response after generated-password login fails", async (t) => {
  const originalFetch = global.fetch;
  t.after(() => {
    global.fetch = originalFetch;
  });
  global.fetch = async () => ({
    ok: false,
    status: 500,
    text: async () => JSON.stringify({ message: "Internal Exception" })
  });

  const result = await attemptWebsiteSso({
    websiteUrl: "https://esportesnew.com/",
    sso: {
      serverLoginEnabled: true,
      signupFallbackEnabled: true,
      usernameTemplate: "{{telegram_username}}",
      signupPayload: {
        userName: "{{username}}",
        language: "{{language}}"
      }
    }
  }, {
    id: 516395245,
    username: "Goravanes",
    language_code: "en"
  });

  assert.equal(result.ok, false);
  assert.equal(result.username, "Goravanes");
  assert.equal(result.reason, "Signup failed HTTP 500: Internal Exception");
  assert.equal(result.attempts.length, 3);
  assert.equal(result.attempts[0].action, "login");
  assert.equal(result.attempts[0].skipped, undefined);
  assert.equal(result.attempts[0].status, 500);
  assert.equal(result.attempts[1].action, "login_legacy_password");
  assert.equal(result.attempts[1].status, 500);
  assert.equal(result.attempts[2].action, "signup");
  assert.equal(result.attempts[2].status, 500);
});

test("diagnoses duplicate website user when generated-password login fails", async (t) => {
  const originalFetch = global.fetch;
  const responses = [
    { status: 404, body: { message: "User not found" } },
    { status: 404, body: { message: "User not found" } },
    { status: 409, body: { message: "Duplicate Users" } }
  ];

  t.after(() => {
    global.fetch = originalFetch;
  });
  global.fetch = async () => {
    const response = responses.shift();

    return {
      ok: false,
      status: response.status,
      text: async () => JSON.stringify(response.body)
    };
  };

  const result = await attemptWebsiteSso({
    websiteUrl: "https://esportesnew.com/",
    sso: {
      serverLoginEnabled: true,
      signupFallbackEnabled: true,
      usernameTemplate: "{{telegram_username}}"
    }
  }, {
    id: 1356077488,
    username: "narek9998",
    language_code: "en"
  });

  assert.equal(result.ok, false);
  assert.equal(result.action, "login");
  assert.equal(result.code, "duplicate_user_login_failed");
  assert.equal(result.username, "narek9998");
  assert.match(result.reason, /username already exists/);
  assert.match(result.nextStep, /tg_\{\{telegram_id\}\}/);
  assert.equal(result.attempts.length, 3);
  assert.equal(result.attempts[0].status, 404);
  assert.equal(result.attempts[1].action, "login_legacy_password");
  assert.equal(result.attempts[1].status, 404);
  assert.equal(result.attempts[2].status, 409);
});
