#!/bin/zsh
# SessionEnd: commit any changes and upload them to GitHub.
cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || cd "$(dirname "$0")/../.."
git add -A
git diff --cached --quiet || git commit -q -m "Auto-save $(date '+%Y-%m-%d %H:%M')"
# Push in the background so a slow upload isn't cut off when the session closes.
git remote get-url origin >/dev/null 2>&1 && \
  nohup git push -q origin main >> .claude/git-sync.log 2>&1 &
exit 0
