#!/bin/zsh
# SessionStart: download any changes from GitHub before working.
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.."
git remote get-url origin >/dev/null 2>&1 || exit 0
git fetch -q origin 2>/dev/null || { echo "git-sync: could not reach GitHub, working offline."; exit 0; }
if git pull -q --rebase --autostash origin main 2>/dev/null; then
  echo "git-sync: up to date with GitHub ($(git log -1 --format='%h %s'))."
else
  git rebase --abort 2>/dev/null
  echo "git-sync: WARNING could not merge GitHub changes automatically, resolve with git."
fi
exit 0
