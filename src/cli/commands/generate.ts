import ora from "ora";
import chalk from "chalk";
import { writeFile } from "node:fs/promises";
import { extractHistory } from "../../extract/index.js";
import { buildPrompt } from "../../generate/prompt-builder.js";
import { generateNarrative } from "../../generate/client.js";
import { renderMarkdown } from "../../render/markdown.js";

export interface GenerateOptions {
  since?: string;
  until?: string;
  branch?: string;
  author: string[];
  path: string[];
  style: string;
  tone?: string;
  audience?: string;
  out?: string;
  model: string;
  maxTokens: string;
  stream?: boolean;
  dryRun?: boolean;
  merges: boolean;
  verbose?: boolean;
}

export async function generate(options: GenerateOptions) {
  const spinner = ora();

  try {
    // Default to 1 week ago if no date specified
    const since = options.since ?? "1 week ago";

    if (options.verbose) {
      console.log(chalk.dim("Options:"), options);
    }

    // Stage 1: Extract
    spinner.start("Reading git history...");
    const history = await extractHistory({
      since,
      until: options.until,
      branch: options.branch,
      authors: options.author,
      paths: options.path,
      includeMerges: options.merges,
    });
    spinner.succeed(
      `Found ${history.commits.length} commits (${history.dateRange.since.toLocaleDateString()} → ${history.dateRange.until.toLocaleDateString()})`
    );

    if (history.commits.length === 0) {
      console.log(chalk.yellow("No commits found in the specified range."));
      return;
    }

    // Stage 2: Build prompt
    const prompt = buildPrompt(history, {
      style: options.style,
      tone: options.tone,
      audience: options.audience,
    });

    if (options.dryRun) {
      console.log(chalk.dim("\n--- DRY RUN: Prompt that would be sent ---\n"));
      console.log(prompt.system);
      console.log("\n---\n");
      console.log(prompt.user);
      return;
    }

    // Stage 3: Generate
    spinner.start("Generating narrative...");
    const narrative = await generateNarrative(prompt, {
      model: options.model,
      maxTokens: parseInt(options.maxTokens, 10),
      stream: options.stream,
      onStream: options.stream
        ? (text: string) => {
            if (spinner.isSpinning) {
              spinner.stop();
              process.stdout.write("\n");
            }
            process.stdout.write(text);
          }
        : undefined,
    });

    if (!options.stream) {
      spinner.succeed("Narrative generated");
    }

    // Stage 4: Render
    const output = renderMarkdown(narrative, history);

    if (options.out) {
      await writeFile(options.out, output, "utf-8");
      console.log(chalk.green(`\nWritten to ${options.out}`));
    } else if (!options.stream) {
      console.log("\n" + output);
    }
  } catch (error) {
    spinner.fail("Error");
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
      if (options.verbose) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  }
}
