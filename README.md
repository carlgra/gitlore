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

gitlore is not yet published to npm. For now, install from source:

```bash
git clone https://github.com/carlgra/gitlore.git
cd gitlore
npm install
npm run build
npm link         # makes `gitlore` available globally
```

Then from any git repo:

```bash
gitlore --since "2 weeks ago" --style devlog
```

To uninstall later: `npm unlink -g gitlore`.

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

## Claude Code Skill

gitlore ships with a Claude Code skill so you can run it as a `/gitlore` slash command.

**Install the skill** — copy the skill folder into your Claude Code skills directory:

```bash
# User-level (available in every project)
mkdir -p ~/.claude/skills
cp -r .claude/skills/gitlore ~/.claude/skills/

# Or project-level (only in the current repo)
mkdir -p .claude/skills
cp -r <path-to-gitlore>/.claude/skills/gitlore .claude/skills/
```

The skill runs `npx tsx bin/gitlore.ts`, so it expects to be invoked from inside a checkout of this repo (or any repo where `gitlore` is installed as a dependency). If you installed gitlore globally via `npm link` above, you can edit `~/.claude/skills/gitlore/SKILL.md` to call `gitlore $ARGUMENTS` directly instead.

**Use it:**

```
/gitlore --since "1 week ago" --style comedy
```

Claude extracts the git history, builds the prompt, and writes the narrative right in your conversation.

## Contributing

**The easiest way to contribute is by adding new styles.** Each style is a single object in `src/generate/styles.ts` — a name, description, strapline, and system prompt. No TypeScript knowledge required.

Ideas for new styles: `noir`, `fairy-tale`, `nature-documentary`, `sports-commentary`, `war-correspondent`, `sci-fi-captains-log`...

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT
