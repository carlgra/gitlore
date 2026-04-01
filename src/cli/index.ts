import { Command } from "commander";
import { generate } from "./commands/generate.js";

const program = new Command();

program
  .name("pbj")
  .description("Generate engaging narratives from git history")
  .version("0.1.0");

program
  .command("generate", { isDefault: true })
  .description("Generate a narrative from git history")
  .option("--since <date>", "Start date (ISO or natural: \"2 weeks ago\")")
  .option("--until <date>", "End date (default: now)")
  .option("--branch <name>", "Scope to a specific branch")
  .option("--author <name>", "Filter by author (repeatable)", collect, [])
  .option("--path <glob>", "Scope to file paths (repeatable)", collect, [])
  .option("--style <preset>", "Style: devlog | technical | stakeholder | changelog | release-notes | heros-journey | quest | comedy | tragedy | overcoming-the-monster | voyage-and-return | rebirth | rags-to-riches", "devlog")
  .option("--tone <description>", "Freeform tone instruction")
  .option("--audience <who>", "Target audience hint")
  .option("--out <file>", "Write to file (default: stdout)")
  .option("--api", "Call Claude API directly (requires ANTHROPIC_API_KEY)")
  .option("--model <model>", "Claude model to use (with --api)", "claude-sonnet-4-20250514")
  .option("--max-tokens <n>", "Max output tokens (with --api)", "4096")
  .option("--stream", "Stream output as it generates (with --api)")
  .option("--no-merges", "Skip merge commits")
  .option("--verbose", "Debug output")
  .action(generate);

function collect(value: string, previous: string[]): string[] {
  return previous.concat([value]);
}

export function run(argv: string[]) {
  program.parse(argv);
}
