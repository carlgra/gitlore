import type { GitHistory } from "../extract/types.js";

export function renderMarkdown(
  narrative: string,
  history: GitHistory
): string {
  const parts: string[] = [];

  // Metadata header
  parts.push("---");
  parts.push(`repo: ${history.repoName}`);
  parts.push(
    `period: ${history.dateRange.since.toLocaleDateString()} – ${history.dateRange.until.toLocaleDateString()}`
  );
  parts.push(`commits: ${history.stats.totalCommits}`);
  parts.push(`generated: ${new Date().toISOString()}`);
  parts.push("---");
  parts.push("");

  // The narrative itself
  parts.push(narrative);
  parts.push("");

  return parts.join("\n");
}
