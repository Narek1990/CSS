"use strict";

const assert = require("assert/strict");
const test = require("node:test");
const { buildSsoContext, buildSsoPreview, renderPayload } = require("../src/website-sso");

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
  assert.deepEqual(preview.signupPayload, {
    userName: "player",
    language: "es"
  });
});
