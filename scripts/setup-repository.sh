#!/usr/bin/env bash
set -euo pipefail

# Sets up a GitHub repository for the agentic workflow: everything a fork
# doesn't copy, and everything the docs' "Configure the repository" step lists.
# Safe to run again: each step sets the same state.
#
#   ./scripts/setup-repository.sh [--dry-run] [owner/repo] [agent]
#
#   owner/repo  defaults to `gh repo set-default`, else the origin remote
#   agent       who the agents act as: the name of your GitHub App, as in its
#               URL (github.com/apps/<name>). Its bot login, `<name>[bot]`, is
#               saved as the AGENT_APP_LOGIN variable so the glue trusts the
#               app's reviews. Install the app on the repository yourself.
#               A user account's name is invited with write access instead
#               (accept the invitation while signed in as it)
#   --dry-run   print the gh commands instead of running them
#
# Needs the gh CLI, signed in as an owner or admin of the repository.
#
# It:
# - turns on Issues and Actions (a fork starts with both off)
# - creates or updates every label the workflows and agents use
# - protects main: a pull request with one approval, stale approvals
#   dismissed, and the PR checks required
# - keeps Actions from opening or approving pull requests
# - limits interactions to collaborators for six months, so a stranger's
#   comment can't reach the agents. It expires: run this again before then
# - serves the docs site from GitHub Actions on GitHub Pages
# - names the agents' GitHub App, or invites their account, if you give one

DRY_RUN=false
ARGS=()
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    -h | --help)
      sed -n '4,19p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) ARGS+=("$arg") ;;
  esac
done

REPO="${ARGS[0]:-}"
BOT="${ARGS[1]:-}"
if [[ -z "$REPO" ]]; then
  REPO="$(gh repo set-default --view 2>/dev/null || true)"
fi
if [[ -z "$REPO" ]]; then
  REPO="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
fi

# The checks branch protection requires: PR Checks' jobs and UI Screenshots.
REQUIRED_CHECKS=(
  'Checks (lint)'
  'Checks (test)'
  'Checks (build)'
  'Tasks format'
  'Invariant coverage'
  'E2E tests'
  'UI Screenshots'
)

run() {
  if $DRY_RUN; then
    {
      printf '+'
      printf ' %q' "$@"
      printf '\n'
    } >&2
  else
    "$@"
  fi
}

# run_json <json> <gh args...>: like run, with <json> as the request body.
run_json() {
  local body="$1"
  shift
  if $DRY_RUN; then
    {
      printf '+'
      printf ' %q' "$@"
      printf ' <<< %s\n' "$(printf '%s' "$body" | jq -c .)"
    } >&2
  else
    printf '%s' "$body" | "$@" --input -
  fi
}

label() {
  run gh label create "$1" --repo "$REPO" --force --color "$2" --description "$3" >/dev/null
}

echo "Setting up $REPO"

echo "- Issues and Actions"
run gh repo edit "$REPO" --enable-issues >/dev/null
run gh api -X PUT "repos/$REPO/actions/permissions" -F enabled=true >/dev/null

echo "- Labels"
label spec-ready 0e8a16 "Merging this spec PR starts the agent"
label openhands 5319e7 "OpenHands implements this issue"
label openhands-review 5319e7 "OpenHands reviews this PR's head"
label openhands-test 5319e7 "OpenHands tests this merged PR on the deployed stage"
label skip-deploy-test c5def5 "Open no test issue when this PR is deployed"
label no-ui-screenshots c5def5 "Waives the UI Screenshots check: a UI change with nothing to look at"
label no-new-invariant c5def5 "Waives the Invariant coverage check: no rule spans the new writer"
label priority:high b60205 "Start this issue before others in the same poll"
for n in 1 2 3 4 5; do
  label "ci-fix-$n" fbca04 "CI fix-up attempt $n of 5"
  label "review-fix-$n" fbca04 "Review fix-up attempt $n of 5"
done
label ci-fix-exhausted d93f0b "CI fix-ups used up; a person takes over"
label review-fix-exhausted d93f0b "Review fix-ups used up; a person takes over"

echo "- Branch protection on main"
checks_json="$(printf '%s\n' "${REQUIRED_CHECKS[@]}" | jq -R . | jq -s -c .)"
run_json "{
  \"required_status_checks\": { \"strict\": false, \"contexts\": $checks_json },
  \"enforce_admins\": false,
  \"required_pull_request_reviews\": {
    \"dismiss_stale_reviews\": true,
    \"required_approving_review_count\": 1
  },
  \"restrictions\": null
}" gh api -X PUT "repos/$REPO/branches/main/protection" >/dev/null

# Off: the same setting would let a workflow approve a pull request. Archive
# Specs pushes its branch and warns with a link for a maintainer to open it.
echo "- Workflow tokens read-only, and may not open or approve pull requests"
run gh api -X PUT "repos/$REPO/actions/permissions/workflow" \
  -f default_workflow_permissions=read -F can_approve_pull_request_reviews=false >/dev/null

echo "- Interactions limited to collaborators for six months"
run gh api -X PUT "repos/$REPO/interaction-limits" \
  -f limit=collaborators_only -f expiry=six_months >/dev/null

echo "- GitHub Pages from Actions"
if ! $DRY_RUN && gh api "repos/$REPO/pages" >/dev/null 2>&1; then
  run gh api -X PUT "repos/$REPO/pages" -f build_type=workflow >/dev/null
else
  run gh api -X POST "repos/$REPO/pages" -f build_type=workflow >/dev/null
fi

# A GitHub App may be named with or without its `[bot]` suffix.
if [[ -n "$BOT" && "$BOT" != *'[bot]' ]] &&
  gh api "apps/$BOT" --silent 2>/dev/null; then
  BOT="$BOT[bot]"
fi
if [[ "$BOT" == *'[bot]' ]]; then
  echo "- AGENT_APP_LOGIN set to $BOT"
  run gh variable set AGENT_APP_LOGIN --repo "$REPO" --body "$BOT"
  echo "  Install the app on $REPO if you haven't: an app needs no invitation."
elif [[ -n "$BOT" ]]; then
  echo "- $BOT invited with write access"
  run gh api -X PUT "repos/$REPO/collaborators/$BOT" -f permission=push >/dev/null
  echo "  Accept the invitation while signed in as $BOT."
fi

echo "Done. The interaction limit ends six months from today: run this again before then."
