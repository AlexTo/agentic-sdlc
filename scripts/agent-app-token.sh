#!/usr/bin/env bash
set -euo pipefail

# Mints a GitHub App installation token for the agents and hands it to Agent
# Canvas, so the automations and their conversations act as the app. An
# installation token lasts one hour: run this every 45 minutes or so.
#
#   ./scripts/agent-app-token.sh
#
# Reads, from the environment or from ~/.config/agent-app/env:
#
#   AGENT_APP_ID               the app's ID (its settings page, "About")
#   AGENT_APP_INSTALLATION_ID  the number at the end of the installation's
#                              settings URL (.../installations/<id>)
#   AGENT_APP_KEY              the app's private key (.pem). Keep it outside
#                              Agent Canvas: agents only ever see the token
#   AGENT_APP_TOKEN_FILE       optional: also write the token here (mode 600)
#   CANVAS_URL                 default http://127.0.0.1:8000
#   CANVAS_SECRET              default GITHUB_PERSONAL_ACCESS_TOKEN, the
#                              secret the automations read
#   CANVAS_API_KEY_FILE        default ~/.openhands/agent-canvas/api-key.txt
#
# Needs openssl, curl and jq. While Agent Canvas is down, it only mints (and
# writes the token file): the next run updates the secret.

CONFIG="${AGENT_APP_CONFIG:-$HOME/.config/agent-app/env}"
if [[ -r "$CONFIG" ]]; then
  # shellcheck disable=SC1090
  source "$CONFIG"
fi

: "${AGENT_APP_ID:?Set AGENT_APP_ID}"
: "${AGENT_APP_INSTALLATION_ID:?Set AGENT_APP_INSTALLATION_ID}"
: "${AGENT_APP_KEY:?Set AGENT_APP_KEY to the app private key file}"
CANVAS_URL="${CANVAS_URL:-http://127.0.0.1:8000}"
CANVAS_SECRET="${CANVAS_SECRET:-GITHUB_PERSONAL_ACCESS_TOKEN}"
CANVAS_API_KEY_FILE="${CANVAS_API_KEY_FILE:-$HOME/.openhands/agent-canvas/api-key.txt}"

# A JSON Web Token signed with the app's key proves to GitHub this is the app.
b64() { openssl base64 -A | tr '+/' '-_' | tr -d '='; }
now=$(date +%s)
header=$(printf '{"alg":"RS256","typ":"JWT"}' | b64)
payload=$(printf '{"iat":%d,"exp":%d,"iss":"%s"}' \
  $((now - 60)) $((now + 540)) "$AGENT_APP_ID" | b64)
signature=$(printf '%s.%s' "$header" "$payload" |
  openssl dgst -sha256 -sign "$AGENT_APP_KEY" | b64)

# Trade it for an installation token, limited to the repositories the app is
# installed on and to the app's permissions.
response=$(curl -fsS -X POST \
  -H "Authorization: Bearer $header.$payload.$signature" \
  -H 'Accept: application/vnd.github+json' \
  -H 'X-GitHub-Api-Version: 2022-11-28' \
  "https://api.github.com/app/installations/$AGENT_APP_INSTALLATION_ID/access_tokens")
token=$(jq -er .token <<<"$response")
echo "Token minted, expires $(jq -r .expires_at <<<"$response")"

if [[ -n "${AGENT_APP_TOKEN_FILE:-}" ]]; then
  (
    umask 077
    printf '%s\n' "$token" >"$AGENT_APP_TOKEN_FILE.tmp"
  )
  mv "$AGENT_APP_TOKEN_FILE.tmp" "$AGENT_APP_TOKEN_FILE"
  echo "Token written to $AGENT_APP_TOKEN_FILE"
fi

if [[ ! -r "$CANVAS_API_KEY_FILE" ]]; then
  echo "No Agent Canvas key at $CANVAS_API_KEY_FILE: secret not updated"
  exit 0
fi
if jq -n --arg name "$CANVAS_SECRET" --arg value "$token" \
  '{name: $name, value: $value,
    description: "GitHub App installation token, refreshed by agent-app-token.sh"}' |
  curl -fsS -o /dev/null -X PUT "$CANVAS_URL/api/settings/secrets" \
    -H "X-Session-API-Key: $(cat "$CANVAS_API_KEY_FILE")" \
    -H 'Content-Type: application/json' --data-binary @-; then
  echo "Agent Canvas secret $CANVAS_SECRET updated"
else
  echo "Agent Canvas not reachable at $CANVAS_URL: secret not updated this run"
fi
