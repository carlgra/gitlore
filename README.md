# gitlore

Turn your git history into engaging narratives, devlogs, and stories.

gitlore reads your commits, diffs, and file stats, then assembles a structured prompt that any LLM can turn into a compelling narrative. Choose from 13 styles — from technical deep-dives to epic hero's journeys to comedic retellings.

```bash
gitlore --since "1 month ago" --style comedy
```

## How It Works

gitlore is a **prompt builder**, not an LLM wrapper. It extracts structured data from your git history and outputs a prompt designed for narrative generation.

Use it with:
- **Claude Code** as a `/gitlore` slash command — the narrative is generated right in your conversation
- **Any LLM** — copy the output into ChatGPT, Claude, or whatever you use
- **Direct API** — pass `--api` with an `ANTHROPIC_API_KEY` for standalone generation

## Install

```bash
npm install -g @carlgra/gitlore
```

Or run without installing:

```bash
npx @carlgra/gitlore --since "2 weeks ago" --style devlog
```

Once installed globally, the command is just `gitlore`:

```bash
gitlore --since "2 weeks ago" --style devlog
```

### From source

```bash
git clone https://github.com/carlgra/gitlore.git
cd gitlore
npm install
npm run build
npm link         # makes `gitlore` available globally
```

## Styles

### Professional

| Style | Description | Strapline |
|---|---|---|
| `devlog` | Casual first-person developer journal | *your git history, in your own words* |
| `technical` | Detailed deep-dive for engineers | *because the architecture deserves documentation* |
| `stakeholder` | Executive summary, no jargon | *translating commits into outcomes* |
| `changelog` | Keep a Changelog format | *your git log, but readable* |
| `release-notes` | User-facing release notes | *shipping notes that people actually read* |

### Narrative Story Arcs

| Style | Description | Strapline |
|---|---|---|
| `heros-journey` | Epic monomyth — trials and transformation | *every codebase has an epic waiting to be told* |
| `quest` | Adventuring party on a mission | *the adventure was in the commits all along* |
| `comedy` | The absurdity of software engineering | *because your git history is funnier than you think* |
| `tragedy` | Noble ambition undone by hubris | *not every merge has a happy ending* |
| `overcoming-the-monster` | Defeating a terrifying bug | *the bug was inside the codebase all along* |
| `voyage-and-return` | Venturing into unfamiliar tech | *you left as a developer, you came back as an engineer* |
| `rebirth` | Rewrite rising from the ashes | *from rm -rf to rebirth* |
| `rags-to-riches` | Prototype to production | *from hacky prototype to production, one commit at a time* |

You can also add custom tone and audience:

```bash
gitlore --style comedy --tone "dry british sarcasm"
gitlore --style heros-journey --audience "non-technical founders"
```

## Examples

### Comedy: A Kubernetes homelab project

> **Act II: The Namespace Incident**
>
> 9:19 AM: "renaming namespace to deploy kafka to." The namespace changes from `astra-infra` to `astra`.
>
> 9:21 AM — *two minutes later*: "renaming namespace to deploy kafka to default." The namespace changes from `astra` to `default`.
>
> Let's just take a moment to appreciate this three-commit, four-minute saga. Graham changed a single YAML field from `astra-infra` → `astra` → `default`. Three commits. Three push events. One namespace. The git history reads like someone arguing with themselves and losing.

### Hero's Journey: A SaaS platform

> The threshold was crossed in rapid succession: multi-role users, multi-practice client support, tenant middleware rewrites. There was no going back. The data model had changed. The auth flow had changed. Every subsequent feature would build on this new multi-tenant foundation — or break against it.

### Technical: The same SaaS platform

> The extraction layer uses `git.raw()` with a custom format string and `--numstat`. The custom delimiter approach (`---GITLORE_COMMIT_SEP---`) avoids NUL byte corruption issues that occur when `simple-git` processes binary-safe delimiters through Node.js string handling.

## Usage

```
gitlore [options]

Options:
  --since <date>        Start date ("2 weeks ago", "2024-03-01")
  --until <date>        End date (default: now)
  --branch <name>       Scope to a specific branch
  --author <name>       Filter by author (repeatable)
  --path <glob>         Scope to file paths (repeatable)
  --style <preset>      Narrative style (default: devlog)
  --tone <description>  Custom tone ("sarcastic", "formal")
  --audience <who>      Target audience hint
  --out <file>          Write to file
  --no-merges           Skip merge commits
  --api                 Call Claude API directly (requires ANTHROPIC_API_KEY)
  --verbose             Debug output
```

## Using gitlore with your AI tool

gitlore is a CLI that emits a structured prompt. Any LLM or AI coding tool can take it from there — the integration is just "run the command, feed the output to the model".

### Claude Code (recommended — tightest integration)

gitlore ships with a Claude Code skill so you can run it as a `/gitlore` slash command.

Install the skill once, user-level so it works in every repo:

```bash
mkdir -p ~/.claude/skills
cp -r <path-to-gitlore-checkout>/.claude/skills/gitlore ~/.claude/skills/
```

Then, in any Claude Code session inside a git repo:

```
/gitlore --since "1 week ago" --style comedy
```

Claude runs the CLI, reads its output, and writes the narrative directly into your conversation.

The skill calls `npx @carlgra/gitlore $ARGUMENTS` by default. If you installed from source via `npm link`, edit `~/.claude/skills/gitlore/SKILL.md` to call `gitlore $ARGUMENTS` directly and skip the npx fetch.

### Windsurf, Cursor, or any AI IDE with a terminal

These don't have a skill system, so use gitlore as a regular CLI and hand the output to the AI panel.

```bash
npx @carlgra/gitlore --since "1 week ago" --style comedy > gitlore-prompt.txt
```

Then in the AI chat panel, attach `gitlore-prompt.txt` (or paste its contents) and say something like *"follow this prompt and write the narrative"*. The AI follows the system prompt baked into the output and writes the story.

### ChatGPT, Claude.ai, or any web chat UI

```bash
npx @carlgra/gitlore --since "1 week ago" --style comedy | pbcopy
```

(Use `xclip -selection clipboard` on Linux, or just `> gitlore-prompt.txt` and open the file.)

Paste into the chat. The model does the rest.

### Direct API (no chat UI at all)

If you just want the narrative printed to your terminal:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npx @carlgra/gitlore --since "1 week ago" --style comedy --api
```

The `--api` flag sends the prompt to Claude and prints the narrative directly — useful for scripts, CI jobs, and weekly-digest emails.

## Contributing

**The easiest way to contribute is by adding new styles.** Each style is a single object in `src/generate/styles.ts` — a name, description, strapline, and system prompt. No TypeScript knowledge required.

Ideas for new styles: `noir`, `fairy-tale`, `nature-documentary`, `sports-commentary`, `war-correspondent`, `sci-fi-captains-log`...

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT
