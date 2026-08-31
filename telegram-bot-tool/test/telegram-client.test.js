"use strict";

const assert = require("assert/strict");
const test = require("node:test");
const {
  botCommandPublishSets,
  botApiCommands,
  buildLaunchUrl,
  getButtonLabel,
  getCommandDescription,
  getCommandConfig,
  getMenuButton,
  inlineKeyboard,
  renderSsoFallbackText,
  renderWelcomeText,
  replyKeyboard
} = require("../src/telegram-client");

const config = {
  websiteUrl: "https://esportesnew.com/",
  publicBaseUrl: "https://bot.esportesnew.com",
  launchMode: "direct",
  menuButtonId: "deposit",
  buttons: [
    {
      id: "play",
      label: "Play",
      type: "web_app",
      placement: "inline",
      url: "/",
      row: 0,
      enabled: true
    },
    {
      id: "deposit",
      label: "Deposit",
      labels: {
        default: "Deposit",
        pt: "Deposito"
      },
      type: "web_app",
      placement: "both",
      url: "/en/home?m=deposit",
      row: 1,
      enabled: true
    },
    {
      id: "history",
      label: "History",
      type: "url",
      placement: "inline",
      url: "/en/profile/transactions",
      row: 2,
      enabled: true
    },
    {
      id: "disabled",
      label: "Disabled",
      type: "web_app",
      placement: "inline",
      url: "/disabled",
      row: 3,
      enabled: false
    }
  ]
};

test("builds inline buttons from managed config", () => {
  const keyboard = inlineKeyboard(config);

  assert.deepEqual(keyboard.inline_keyboard.map((row) => row.map((button) => button.text)), [
    ["Play"],
    ["Deposit"],
    ["History"]
  ]);
  assert.equal(keyboard.inline_keyboard[0][0].web_app.url, "https://esportesnew.com/");
  assert.equal(keyboard.inline_keyboard[2][0].url, "https://esportesnew.com/en/profile/transactions");
});

test("reply keyboard uses only Mini App buttons", () => {
  const keyboard = replyKeyboard(config, { language_code: "pt-BR" });

  assert.deepEqual(keyboard.keyboard.map((row) => row.map((button) => button.text)), [
    ["Deposito"]
  ]);
});

test("inline keyboard and button lookup use Telegram user language", () => {
  const keyboard = inlineKeyboard(config, { language_code: "pt" });

  assert.equal(getButtonLabel(config.buttons[1], "pt-BR"), "Deposito");
  assert.equal(keyboard.inline_keyboard[1][0].text, "Deposito");
});

test("bot commands publish only Telegram-supported fields", () => {
  const commands = botApiCommands([
    {
      command: "start",
      description: "Start Telegram SSO",
      descriptions: {
        default: "Start Telegram SSO",
        hy: "Սկսել"
      },
      enabled: true,
      action: "sso",
      responseText: "Internal"
    },
    {
      command: "hidden",
      description: "Hidden",
      enabled: false,
      action: "none"
    }
  ]);

  assert.deepEqual(commands, [
    {
      command: "start",
      description: "Start Telegram SSO"
    }
  ]);
});

test("bot command publish sets include language-specific menu descriptions", () => {
  const commands = [
    {
      command: "start",
      description: "Start Telegram SSO",
      descriptions: {
        default: "Start Telegram SSO",
        hy: "Սկսել բոտը"
      },
      enabled: true
    },
    {
      command: "menu",
      description: "Show menu",
      descriptions: {
        default: "Show menu",
        hy: "Ցույց տալ մենյուն"
      },
      enabled: true
    }
  ];
  const sets = botCommandPublishSets(commands);

  assert.deepEqual(sets, [
    {
      languageCode: "",
      commands: [
        { command: "start", description: "Start Telegram SSO" },
        { command: "menu", description: "Show menu" }
      ]
    },
    {
      languageCode: "hy",
      commands: [
        { command: "start", description: "Սկսել բոտը" },
        { command: "menu", description: "Ցույց տալ մենյուն" }
      ]
    }
  ]);
  assert.equal(getCommandDescription(commands[0], "hy-AM"), "Սկսել բոտը");
});

test("configured command actions are selected from slash commands", () => {
  const command = getCommandConfig({
    commands: [
      { command: "login", description: "Sign in", enabled: true, action: "sso" }
    ]
  }, "/login@esportesnew_bot");

  assert.equal(command.action, "sso");
});

test("menu button follows selected managed button", () => {
  assert.equal(getMenuButton(config).label, "Deposit");
});

test("wrapper launch URL carries target path", () => {
  const url = buildLaunchUrl({
    ...config,
    launchMode: "wrapper"
  }, "/en/home?m=deposit");

  assert.equal(url, "https://bot.esportesnew.com/miniapp?target=https%3A%2F%2Fesportesnew.com%2Fen%2Fhome%3Fm%3Ddeposit");
});

test("welcome text follows Telegram user language with default fallback", () => {
  const welcomeConfig = {
    welcomeParseMode: "HTML",
    welcomeText: "Default {{first_name}}",
    welcomeMessages: {
      default: "Default {{first_name}}",
      en: "Hello <b>{{first_name}}</b>",
      pt: "Ola {{first_name}}"
    }
  };

  assert.equal(renderWelcomeText(welcomeConfig, { first_name: "Narek", language_code: "en-US" }), "Hello <b>Narek</b>");
  assert.equal(renderWelcomeText(welcomeConfig, { first_name: "Joao", language_code: "pt" }), "Ola Joao");
  assert.equal(renderWelcomeText(welcomeConfig, { first_name: "Ani", language_code: "hy" }), "Default Ani");
});

test("SSO fallback text keeps backend failure private for Telegram users", () => {
  const text = renderSsoFallbackText({
    appTitle: "EsportesNew",
    welcomeParseMode: "HTML"
  }, {
    first_name: "Gor",
    username: "Goravanes"
  }, {
    ok: false,
    username: "Goravanes",
    reason: "Signup failed HTTP 500: Internal Exception"
  });

  assert.equal(text.includes("Internal Exception"), false);
  assert.equal(text.includes("Telegram sign-in for <b>Goravanes</b> is not completed yet."), true);
  assert.equal(text.includes("open EsportesNew inside Telegram"), true);
});
