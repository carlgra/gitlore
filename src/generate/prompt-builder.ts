import type { GitHistory } from "../extract/types.js";
import { getStyle } from "./styles.js";

export interface PromptOptions {
  style: string;
  tone?: string;
  audience?: string;
}

export interface BuiltPrompt {
  system: string;
  user: string;
}

export function buildPrompt(
  history: GitHistory,
  options: PromptOptions
): BuiltPrompt {
  const style = getStyle(options.style);

  // System prompt
  let system = style.systemPrompt;
  if (options.tone) {
    system += `\n\nAdditional tone guidance: ${options.tone}`;
  }
  if (options.audience) {
    system += `\n\nTarget audience: ${options.audience}`;
  }

  // User prompt with structured data
  const user = buildUserPrompt(history);

  return { system, user };
}

function buildUserPrompt(history: GitHistory): string {
  const { repoName, commits, stats, dateRange } = history;

  const parts: string[] = [];

  // Repository context
  parts.push(`## Repository Context`);
  parts.push(`- **Repository**: ${repoName}`);
  parts.push(
    `- **Period**: ${dateRange.since.toLocaleDateString()} to ${dateRange.until.toLocaleDateString()}`
  );
  parts.push(`- **Total commits**: ${stats.totalCommits}`);
  parts.push(`- **Files changed**: ${stats.totalFiles}`);
  parts.push(
    `- **Lines**: +${stats.totalInsertions} / -${stats.totalDeletions}`
  );

  if (stats.authors.length > 0) {
    parts.push(
      `- **Contributors**: ${stats.authors.map((a) => `${a.name} (${a.commits} commits)`).join(", ")}`
    );
  }

  if (stats.topFiles.length > 0) {
    parts.push(`\n### Most Active Files`);
    for (const f of stats.topFiles.slice(0, 5)) {
      parts.push(`- \`${f.file}\` (${f.changes} changes)`);
    }
  }

  // Commits (chronological)
  parts.push(`\n## Commits (chronological, oldest first)\n`);

  // Reverse to chronological order (git log is newest-first)
  const chronological = [...commits].reverse();

  let totalDiffSize = 0;
  const MAX_TOTAL_DIFF = 100_000; // ~100KB of diff content

  for (const commit of chronological) {
    parts.push(`### ${commit.shortHash} — ${commit.message}`);
    parts.push(`- **Author**: ${commit.author.name}`);
    parts.push(`- **Date**: ${commit.date.toLocaleString()}`);

    if (commit.body) {
      parts.push(`- **Details**: ${commit.body.trim()}`);
    }

    if (commit.files.length > 0) {
      parts.push(`- **Files** (${commit.files.length}):`);
      for (const f of commit.files) {
        const stat = f.binary
          ? "binary"
          : `+${f.insertions} -${f.deletions}`;
        parts.push(`  - \`${f.file}\` (${stat})`);
      }
    }

    // Include diff if within budget
    if (commit.diff && totalDiffSize + commit.diff.length < MAX_TOTAL_DIFF) {
      totalDiffSize += commit.diff.length;
      parts.push(`\n<diff>\n${commit.diff}\n</diff>`);
    }

    parts.push(""); // blank line between commits
  }

  // Instructions
  parts.push(`## Writing Instructions`);
  parts.push(
    `Generate a compelling narrative based on the git history above. Guidelines:`
  );
  parts.push(`- Focus on the story: what was built, why, and what challenges arose`);
  parts.push(
    `- Emphasize: new features, architectural decisions, significant bug fixes`
  );
  parts.push(
    `- De-emphasize: dependency bumps, auto-generated files, trivial formatting changes`
  );
  parts.push(`- Use specific details from the commits to make the narrative concrete`);
  parts.push(`- Structure the output with markdown headers and sections`);
  parts.push(
    `- If the history tells a clear story arc (problem → solution, or iterative refinement), highlight that`
  );

  return parts.join("\n");
}
