---
name: pbj
description: Generate a narrative story from git history. Use when the user wants a devlog, changelog, stakeholder update, or story about recent project work.
---

# PBJ — Git History Storyteller

You are generating a narrative from git history. The structured git data and style instructions are provided below.

## Git History & Style Instructions

!`npx tsx bin/pbj.ts $ARGUMENTS`

## Your Task

Using the git history data and style instructions above, write a compelling narrative. Follow the style system prompt exactly.

Guidelines:
- Tell a **story**, not a list of commits
- Focus on the arc: what problem was being solved, how it evolved, what was learned
- Use specific details from commits and diffs to make it concrete
- Skip trivial changes (formatting, typos, dependency bumps) unless they're part of a larger story
- If there are multiple authors, weave their contributions together
- Output clean markdown suitable for a blog post or project update
