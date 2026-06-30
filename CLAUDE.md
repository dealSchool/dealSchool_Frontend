# CLAUDE.md — Project Rules

## Critical File Protection

**NEVER delete, overwrite, clear, or modify `.env.local` under any circumstances.**

- Do not remove it as part of cleanup, refactoring, or "removing sensitive files"
- Do not truncate or empty it
- Do not add it to any delete/clean scripts
- This file holds environment variables required for the app to run and must always be preserved exactly as-is
