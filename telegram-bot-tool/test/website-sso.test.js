"use strict";

const assert = require("assert/strict");
const test = require("node:test");
const { attemptWebsiteSso, buildSsoContext, buildSsoPreview, renderPayload } = require("../src/website-sso");

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
  assert.equal(result.attempts.length, 2);
  assert.equal(result.attempts[0].action, "login");
  assert.equal(result.attempts[0].skipped, undefined);
  assert.equal(result.attempts[0].status, 500);
  assert.equal(result.attempts[1].action, "signup");
  assert.equal(result.attempts[1].status, 500);
});
