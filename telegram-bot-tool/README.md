# Telegram Bot Website Manager

This tool connects Telegram bots to websites such as `https://esportesnew.com/`, creates Telegram Web App buttons, validates Telegram Mini App sign-in data, and keeps a small local list of Telegram users who open the Mini App or message a bot.

It is intentionally dependency-free and runs on Node 18+.

## What It Does

- Verifies a Telegram bot token with `getMe`.
- Manages several websites from one dashboard.
- Connects one Telegram bot per website profile.
- Sets bot commands: `/start`, `/app`, `/keyboard`.
- Manages predefined slash commands such as `/start`, `/login`, `/password`, and `/menu`.
- Sets the private-chat menu button with `setChatMenuButton`.
- Manages a separate button list per bot: add, edit, disable, delete, reorder, choose row, and choose button type.
- Stores language-specific labels for each Telegram button.
- Adds a rich welcome-message editor with per-language Telegram HTML messages.
- Sends a single welcome message with inline buttons, matching the simple bot shown in the recording.
- Can also send reply-keyboard Web App buttons when a button's placement is set to **Reply Keyboard** or **Both**.
- Hosts `/miniapp`, an optional wrapper that loads `https://esportesnew.com/` in an iframe.
- Validates `Telegram.WebApp.initData` on the server before creating a local session token.
- Stores config and Telegram users in `.data/`, which is ignored by git.

Telegram opens Mini Apps in its own webview. Opening the site directly is usually better than wrapping it in an iframe, especially because the live EsportesNew page already loads Telegram's Web App script. Use wrapper mode only when you need this tool to sit between Telegram and the website.

## Setup

1. Copy the example environment file:

   ```sh
   cp .env.example .env
   ```

2. Edit `.env`:

   ```sh
   PORT=8787
   HOST=127.0.0.1
   WEBSITE_URL=https://esportesnew.com/
   PUBLIC_BASE_URL=https://bot.esportesnew.com
   TELEGRAM_BOT_TOKEN=123456:your-token-here
   ADMIN_TOKEN=change-this-before-deploy
   LAUNCH_MODE=direct
   ```

3. Run the tool:

   ```sh
   npm start
   ```

4. Open the admin panel:

   ```text
   http://localhost:8787
   ```

5. Choose a website and bot profile, press **Verify Bot**, edit the button list, then press **Publish to Telegram**.

## Connecting The Bot

There are two levels of connection:

1. **Token connection**: choose the website, paste the connected bot token, then verify. This confirms the tool can call Telegram as that website's bot.
2. **Webhook connection**: set `PUBLIC_BASE_URL` to the public HTTPS URL where this tool is hosted, then publish. This lets Telegram deliver `/start` and button callback updates to the tool.

Local URLs such as `http://127.0.0.1:8787` cannot be used by Telegram as a webhook. For a quick test, expose the local server with an HTTPS tunnel and use that tunnel URL as `PUBLIC_BASE_URL`. For production, deploy the tool and use a stable URL such as `https://bot.esportesnew.com`.

The `.env` values are only startup defaults for a new/empty config. After the dashboard saves a website or bot profile, the saved admin-panel values are used instead of rewriting them from `.env`.

After changing `PUBLIC_BASE_URL`, restart the tool or save the value in the dashboard, then press **Publish to Telegram** again. The **Check Connection** button shows whether the token is valid and whether the webhook is live.

## Button Manager

Each website's connected bot has its own buttons. A new website starts with the same simple shape as your sample bot:

- `Play`
- `Deposit`
- `History`

Each button has:

- **Label**: the text Telegram displays.
- **Type**: `Mini App`, `Browser URL`, or `Callback`.
- **Placement**: `Inline`, `Reply Keyboard`, or `Both`.
- **Row**: buttons with the same row number appear side by side; different rows stack vertically.
- **URL or Path**: use a full HTTPS URL or a site-relative path such as `/en/home?m=deposit`.
- **Callback Data**: used only for callback buttons.

The preview panel shows the message and buttons before you publish. `Publish to Telegram` updates commands, the chat menu button, and the webhook for the selected website's bot. New `/start` messages use the latest saved buttons and language-specific welcome message for that bot.

Button labels are language-aware. Choose a language in **Language Content**, then edit each button label in the **Buttons** panel. Telegram users receive the matching button labels based on their `language_code`; if there is no match, the bot uses the default label.

## Command Manager

Use **Commands** to configure published Telegram slash commands and how the bot responds to them.

Default commands:

- `/start`: starts the Telegram Mini App SSO flow and shows the configured buttons.
- `/login`: starts the same Telegram Mini App SSO flow.
- `/password`: sends a password-reset link.
- `/menu` and `/app`: show the welcome message and inline buttons.
- `/keyboard`: shows reply-keyboard Web App buttons.
- `/chat`, `/language`, and `/logout`: available as predefined disabled presets that can be enabled and customized.

Each command can be enabled or disabled, given a Telegram menu description, and assigned an action: Telegram SSO, Welcome + Buttons, Reply Keyboard, Password Reset, Custom Reply, or No Reply. The Telegram preview includes a command-menu block similar to the menu shown when users type `/`.

Command descriptions are language-aware. Choose a language in **Language Content**, edit each command's **Menu Description**, then press **Publish to Telegram**. The tool publishes the default command menu and each configured language menu with Telegram's `language_code`.

## Multiple Websites

Use **Add Website** to create another website profile. Each website stores:

- Website name and app title.
- Website URL.
- Public bot-tool URL.
- Direct-site or iframe-wrapper launch mode.
- Mini App and webhook paths.
- One connected Telegram bot token.
- Bot name, such as `esportesnew_bot`.
- Display name, such as `esportesnew.com`.
- Per-language welcome messages.
- Menu button choice.
- Managed Telegram buttons.

The webhook URL includes the website ID and bot ID, so one public tool can receive updates for each website's connected bot separately.

## Welcome Message Editor

The welcome editor stores Telegram HTML. Choose a language, edit that message, and save. Telegram users receive the message matching their `language_code`; if there is no match, the bot uses **Default**.

The toolbar supports bold, italic, underline, strikethrough, code, links, and clear formatting. You can still use placeholders:

```text
{{first_name}}
{{last_name}}
{{username}}
```

The dashboard escapes typed text before sending it to Telegram, while preserving allowed formatting tags.

## Public HTTPS Requirement

Telegram Bot API Web App URLs must be HTTPS. For production, deploy this tool to a Node host at a public URL such as:

```text
https://bot.esportesnew.com
```

On most production hosts, set `HOST=0.0.0.0` so the platform can route traffic to the Node process.

For local testing, expose the server through a temporary HTTPS tunnel and set `PUBLIC_BASE_URL` to that tunnel URL.

## BotFather Steps

Create or open your bot in `@BotFather`, then configure:

- `/setdomain` with `esportesnew.com` if you use Telegram Login Widget or direct website auth.
- `/setmenubutton` if you want to configure the menu button manually instead of using this tool.
- Bot Settings > Configure Mini App > Enable Mini App if you want the profile-level **Launch app** button and `https://t.me/<botusername>?startapp` direct links.

This tool can set commands, webhook, and the chat menu button through the Bot API, but the profile-level Main Mini App still belongs in BotFather.

## Sign Up / Sign In Integration

The live EsportesNew frontend already performs Telegram SSO when opened inside Telegram. It calls:

```text
/api/identity/api/v1/playeraccount/login-telegram
```

with `Telegram.WebApp.initData`, then calls:

```text
/api/v1/me/signin?returnUrl=/
```

For that reason, the safest `/start` behavior is to open the site as a Telegram Mini App. Telegram supplies signed `initData` only inside the Mini App webview, and the website can then create its own first-party session.

This is the same flow used by the public AzenPlay frontend: open the website directly as a Telegram WebApp, post the raw `window.Telegram.WebApp.initData` string to `login-telegram` with `application/x-www-form-urlencoded`, then call `me/signin`. If **Website native Telegram login** is enabled in the admin panel, the tool publishes direct website `web_app` URLs even when wrapper mode is selected, because iframe mode does not give the EsportesNew page the Telegram init data it needs for this login.

The route `POST /api/auth/telegram` in this tool receives:

```json
{
  "initData": "Telegram.WebApp.initData"
}
```

It validates the Telegram signature using the bot token. If valid, it upserts the Telegram user into `.data/users.json` and returns:

```json
{
  "ok": true,
  "user": {
    "id": 42,
    "first_name": "Narek",
    "username": "narek"
  },
  "sessionToken": "..."
}
```

To connect this to the real EsportesNew account system, the website backend needs an endpoint that uses the same validation logic from `src/telegram-auth.js`, then creates or logs in the website user and sets the website's normal session cookie. A separate `bot.esportesnew.com` service cannot create a first-party `esportesnew.com` login session unless the production website backend accepts and exchanges the validated Telegram session.

The admin panel also includes an optional server-side SSO fallback. It can build payloads from the Telegram user and try:

```text
/api/identity/api/v1/playeraccount/login
/api/user/api/v1.0/fastSignUp/signup
```

The default username template is `{{telegram_username}}`. The fallback is disabled until you enable it because normal login requires a password template and fast signup can create real player accounts. Use **Preview SSO Payload** before enabling live signup fallback.

If the password template is empty, the tool automatically generates a stable password for each Telegram user and bot. The default signup payload sends `userName`, `language`, `password`, and `confirmPassword`, then retries login after a successful signup. The Telegram player never needs to type this password.

## Wrapper Mode

Set:

```sh
LAUNCH_MODE=wrapper
```

or choose **Wrapper** in the admin panel. Telegram will open:

```text
https://bot.esportesnew.com/miniapp
```

The wrapper validates Telegram identity and embeds `https://esportesnew.com/` in an iframe. After sign-in it posts this message to the iframe:

```js
{
  source: "esportesnew-telegram-bot-tool",
  type: "telegram-auth",
  user,
  sessionToken
}
```

The website must add a `message` listener if it wants to consume that session.

When a managed button has a deep link, wrapper mode opens `/miniapp?target=<encoded-url>` and only allows targets on the configured EsportesNew origin.

## Security Notes

- Do not commit `.env` or `.data/`.
- Rotate the bot token if it is ever pasted into a chat, ticket, screenshot, or public repo.
- Use `ADMIN_TOKEN` in production so the dashboard cannot be used by visitors.
- Keep Telegram init data short-lived; this tool defaults to 24 hours.

## Useful Commands

```sh
npm test
npm run check
npm start
```

References: Telegram Mini Apps documentation and Telegram Bot API documentation.
