#!/usr/bin/env node
// Starts OpenHands Agent Canvas so its agents act as your GitHub App.
//
//   pnpm agent-canvas             start Agent Canvas and keep the token fresh
//   pnpm agent-canvas --once      mint one token, store it, and exit (for a
//                                 timer, when Agent Canvas runs as a service)
//   pnpm agent-canvas --reset     ask for the App ID and private key again
//
// The first run asks for the app's App ID and the private key (.pem) you
// downloaded, and keeps both in ~/.config/agent-app/, readable only by you.
// `--app-id <id> --key <file>` answers without the questions.
//
// Each run it:
// - finds the app's name and where it is installed, with the private key
// - starts Agent Canvas with the app as the author of every commit
//   (GIT_AUTHOR_* and GIT_COMMITTER_*), so GitHub credits commits to the app
// - mints an installation token, which lasts one hour, and stores it in Agent
//   Canvas as the secret GITHUB_PERSONAL_ACCESS_TOKEN, again every 45 minutes.
//   The automations and their conversations read that secret.
//
// The private key never enters Agent Canvas: an agent only ever holds a token
// that is gone within the hour.
//
// For tests and unusual setups: AGENT_APP_HOME, GITHUB_API_URL, CANVAS_URL,
// CANVAS_SECRET, CANVAS_API_KEY_FILE and AGENT_CANVAS_COMMAND.

import { spawn } from 'node:child_process';
import { createSign } from 'node:crypto';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';

const HOME = process.env.AGENT_APP_HOME ?? join(homedir(), '.config/agent-app');
const CONFIG = join(HOME, 'config.json');
const KEY = join(HOME, 'private-key.pem');
const GITHUB = process.env.GITHUB_API_URL ?? 'https://api.github.com';
const CANVAS = process.env.CANVAS_URL ?? 'http://127.0.0.1:8000';
const SECRET = process.env.CANVAS_SECRET ?? 'GITHUB_PERSONAL_ACCESS_TOKEN';
const CANVAS_KEY_FILE =
  process.env.CANVAS_API_KEY_FILE ??
  join(homedir(), '.openhands/agent-canvas/api-key.txt');
const CANVAS_COMMAND = process.env.AGENT_CANVAS_COMMAND ?? 'agent-canvas';

const REFRESH_MS = 45 * 60 * 1000;
const RETRY_MS = 60 * 1000;
const STARTUP_RETRY_MS = 5 * 1000;

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const at = args.indexOf(name);
  return at === -1 ? undefined : args[at + 1];
};

const log = (message) => console.log(`[agent-app] ${message}`);
const fail = (message) => {
  console.error(`[agent-app] ${message}`);
  process.exit(1);
};

/** Asks for the App ID and the key once, and keeps them in HOME. */
const configure = async () => {
  if (!flag('--reset') && existsSync(CONFIG) && existsSync(KEY)) {
    return JSON.parse(readFileSync(CONFIG, 'utf8'));
  }
  let appId = option('--app-id');
  let keyFile = option('--key');
  if (!appId || !keyFile) {
    const lines = createInterface({ input: process.stdin })[
      Symbol.asyncIterator
    ]();
    const ask = async (question) => {
      process.stdout.write(question);
      const { value, done } = await lines.next();
      if (done) {
        fail('No answer. Pass --app-id <id> --key <file> instead.');
      }
      return value.trim();
    };
    console.log(
      "First run: which GitHub App do the agents act as? Both answers are on the app's settings page.",
    );
    appId ||= await ask('App ID (a number): ');
    keyFile ||= await ask('Path to the private key you downloaded (.pem): ');
    lines.return?.();
  }
  if (!/^\d+$/.test(appId)) {
    fail(
      `"${appId}" is not an App ID: it is the number at the top of the app's settings page.`,
    );
  }
  keyFile = resolve(
    keyFile.replace(/^~(?=\/)/, homedir()).replace(/^'|'$/g, ''),
  );
  if (!existsSync(keyFile)) {
    fail(`No file at ${keyFile}.`);
  }
  if (!readFileSync(keyFile, 'utf8').includes('PRIVATE KEY')) {
    fail(`${keyFile} is not a private key (.pem).`);
  }
  mkdirSync(HOME, { recursive: true, mode: 0o700 });
  copyFileSync(keyFile, KEY);
  chmodSync(KEY, 0o600);
  const config = { appId };
  writeFileSync(CONFIG, `${JSON.stringify(config, null, 2)}\n`, {
    mode: 0o600,
  });
  return { ...config, savedFrom: keyFile };
};

/** A JSON Web Token signed with the app's key proves to GitHub this is the app. */
const appJwt = (appId) => {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const body = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({
    iat: now - 60,
    exp: now + 540,
    iss: appId,
  })}`;
  const signature = createSign('RSA-SHA256')
    .update(body)
    .sign(readFileSync(KEY), 'base64url');
  return `${body}.${signature}`;
};

const github = async (path, { method = 'GET', token } = {}) => {
  const response = await fetch(`${GITHUB}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'agent-app-launcher',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub ${method} ${path}: ${response.status} ${text}`);
  }
  return response.json();
};

/** The app's name, its bot login and commit address, and where it is installed. */
const describeApp = async ({ appId }) => {
  let app;
  try {
    app = await github('/app', { token: appJwt(appId) });
  } catch (error) {
    rmSync(CONFIG, { force: true });
    rmSync(KEY, { force: true });
    fail(
      `GitHub did not accept App ID ${appId} with this private key. Check both and run this again.\n${error.message}`,
    );
  }
  const installations = await github('/app/installations', {
    token: appJwt(appId),
  });
  if (installations.length === 0) {
    fail(
      `The app "${app.slug}" isn't installed anywhere yet. Install it on your fork: ${app.html_url}/installations/new`,
    );
  }
  if (installations.length > 1) {
    log(
      `The app is installed on ${installations.length} accounts; using ${installations[0].account.login}.`,
    );
  }
  const login = `${app.slug}[bot]`;
  const bot = await github(`/users/${encodeURIComponent(login)}`);
  return {
    login,
    email: `${bot.id}+${login}@users.noreply.github.com`,
    installationId: installations[0].id,
    account: installations[0].account.login,
  };
};

const mintToken = ({ appId }, installationId) =>
  github(`/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    token: appJwt(appId),
  });

/** Stores the token in Agent Canvas. False while Agent Canvas isn't up yet. */
const storeSecret = async (token) => {
  if (!existsSync(CANVAS_KEY_FILE)) {
    return false;
  }
  try {
    const response = await fetch(`${CANVAS}/api/settings/secrets`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-API-Key': readFileSync(CANVAS_KEY_FILE, 'utf8').trim(),
      },
      body: JSON.stringify({
        name: SECRET,
        value: token,
        description:
          'GitHub App installation token, refreshed every 45 minutes by start-agent-canvas.mjs',
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
};

// A token minted but not stored yet, kept while Agent Canvas is still starting.
let pending;

/** Mints and stores a token. Returns how long to wait before the next one. */
const refresh = async (config, app, { waitingForCanvas }) => {
  try {
    pending ??= await mintToken(config, app.installationId);
  } catch (error) {
    log(`Could not mint a token, trying again in a minute. ${error.message}`);
    return RETRY_MS;
  }
  if (await storeSecret(pending.token)) {
    log(`Token stored in the ${SECRET} secret, expires ${pending.expires_at}.`);
    pending = undefined;
    return REFRESH_MS;
  }
  if (!waitingForCanvas) {
    pending = undefined;
    log(`Agent Canvas isn't answering at ${CANVAS}: secret not updated.`);
  }
  return waitingForCanvas ? STARTUP_RETRY_MS : RETRY_MS;
};

const main = async () => {
  const config = await configure();
  const app = await describeApp(config);
  log(`Agents act as ${app.login}, installed on ${app.account}.`);
  if (config.savedFrom) {
    log(
      `App ID and key saved in ${HOME}. You can delete ${config.savedFrom} now.`,
    );
  }

  if (flag('--once')) {
    const wait = await refresh(config, app, { waitingForCanvas: false });
    process.exit(wait === REFRESH_MS ? 0 : 1);
  }

  const canvas = spawn(CANVAS_COMMAND, [], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: app.login,
      GIT_COMMITTER_NAME: app.login,
      GIT_AUTHOR_EMAIL: app.email,
      GIT_COMMITTER_EMAIL: app.email,
    },
  });
  canvas.on('error', (error) => {
    fail(
      error.code === 'ENOENT'
        ? 'agent-canvas is not installed. Run: npm install -g @openhands/agent-canvas'
        : `Could not start agent-canvas: ${error.message}`,
    );
  });
  canvas.on('exit', (code) => process.exit(code ?? 0));
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => canvas.kill(signal));
  }

  // Until the first token is stored, Agent Canvas is probably still starting.
  let stored = false;
  const loop = async () => {
    const wait = await refresh(config, app, { waitingForCanvas: !stored });
    stored ||= wait === REFRESH_MS;
    setTimeout(loop, wait);
  };
  loop();
};

main().catch((error) => fail(error.message));
