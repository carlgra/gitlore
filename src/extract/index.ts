import simpleGit from "simple-git";
import { basename } from "node:path";
import type {
  Commit,
  ExtractOptions,
  FileChange,
  GitHistory,
  RepoStats,
} from "./types.js";

const git = simpleGit();

// Use a delimiter unlikely to appear in commit messages
const COMMIT_SEP = "---PBJ_COMMIT_SEP---";
const FIELD_SEP = "---PBJ_FIELD---";

export async function extractHistory(
  options: ExtractOptions
): Promise<GitHistory> {
  const { since, until, branch, authors, paths, includeMerges = true } = options;

  const repoName = await getRepoName();

  const format = ["%H", "%h", "%s", "%an", "%ae", "%aI", "%P", "%D"].join(FIELD_SEP) + COMMIT_SEP;

  const logArgs = [
    "log",
    `--format=${format}`,
    "--numstat",
    `--since=${since}`,
  ];
  if (until) logArgs.push(`--until=${until}`);
  if (!includeMerges) logArgs.push("--no-merges");
  if (branch) logArgs.push(branch);

  let raw: string;
  try {
    raw = await git.raw(logArgs);
  } catch (err: any) {
    if (err?.message?.includes("does not have any commits")) {
      return emptyHistory(repoName);
    }
    throw err;
  }

  if (!raw || !raw.trim()) {
    return emptyHistory(repoName);
  }

  let commits = parseRawLog(raw);

  // Filter by author
  if (authors && authors.length > 0) {
    const authorSet = new Set(authors.map((a) => a.toLowerCase()));
    commits = commits.filter(
      (c) =>
        authorSet.has(c.author.name.toLowerCase()) ||
        authorSet.has(c.author.email.toLowerCase())
    );
  }

  // Filter by path
  if (paths && paths.length > 0) {
    commits = commits.filter((c) =>
      c.files.some((f) => paths.some((p) => f.file.includes(p)))
    );
  }

  // Fetch diffs for commits with manageable file counts
  for (const commit of commits) {
    if (commit.files.length > 0 && commit.files.length <= 50) {
      try {
        const fullDiff = await git.diff([`${commit.hash}~1`, commit.hash]);
        if (fullDiff.length < 50_000) {
          commit.diff = fullDiff;
        }
      } catch {
        // First commit in repo, etc.
      }
    }
  }

  const stats = computeStats(commits);

  const sinceDate = commits.length > 0
    ? new Date(Math.min(...commits.map((c) => c.date.getTime())))
    : new Date();
  const untilDate = commits.length > 0
    ? new Date(Math.max(...commits.map((c) => c.date.getTime())))
    : new Date();

  return { repoName, commits, stats, dateRange: { since: sinceDate, until: untilDate } };
}

function parseRawLog(raw: string): Commit[] {
  const commits: Commit[] = [];
  const lines = raw.split("\n");

  let current: Omit<Commit, "files"> | null = null;
  let currentFiles: FileChange[] = [];

  function pushCurrent() {
    if (current) {
      commits.push({ ...current, files: currentFiles });
    }
  }

  for (const line of lines) {
    // Check if this line contains a commit header (has our separator)
    if (line.includes(COMMIT_SEP)) {
      // Strip the separator suffix
      const headerLine = line.replace(COMMIT_SEP, "");
      const parts = headerLine.split(FIELD_SEP);
      if (parts.length < 6) continue;

      // Push previous commit before starting new one
      pushCurrent();

      const [hash, shortHash, message, authorName, authorEmail, dateStr, parentStr, refsStr] = parts;
      current = {
        hash,
        shortHash,
        message,
        body: "",
        author: { name: authorName, email: authorEmail },
        date: new Date(dateStr),
        parents: parentStr ? parentStr.split(" ").filter(Boolean) : [],
        refs: refsStr ? refsStr.split(",").map((r) => r.trim()).filter(Boolean) : [],
        diff: undefined,
      };
      currentFiles = [];
      continue;
    }

    // Check if this is a numstat line
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
    if (match && current) {
      currentFiles.push({
        file: match[3],
        insertions: match[1] === "-" ? 0 : parseInt(match[1], 10),
        deletions: match[2] === "-" ? 0 : parseInt(match[2], 10),
        binary: match[1] === "-",
      });
    }
  }

  // Don't forget the last commit
  pushCurrent();

  return commits;
}

function emptyHistory(repoName: string): GitHistory {
  return {
    repoName,
    commits: [],
    stats: { totalCommits: 0, totalFiles: 0, totalInsertions: 0, totalDeletions: 0, authors: [], topFiles: [] },
    dateRange: { since: new Date(), until: new Date() },
  };
}

async function getRepoName(): Promise<string> {
  try {
    const remotes = await git.getRemotes(true);
    const origin = remotes.find((r) => r.name === "origin");
    if (origin?.refs.fetch) {
      const match = origin.refs.fetch.match(/\/([^/]+?)(?:\.git)?$/);
      if (match) return match[1];
    }
  } catch {
    // fall through
  }
  return basename(process.cwd());
}

function computeStats(commits: Commit[]): RepoStats {
  const authorMap = new Map<string, number>();
  const fileMap = new Map<string, number>();
  let totalInsertions = 0;
  let totalDeletions = 0;
  const allFiles = new Set<string>();

  for (const commit of commits) {
    authorMap.set(commit.author.name, (authorMap.get(commit.author.name) ?? 0) + 1);
    for (const file of commit.files) {
      allFiles.add(file.file);
      fileMap.set(file.file, (fileMap.get(file.file) ?? 0) + 1);
      totalInsertions += file.insertions;
      totalDeletions += file.deletions;
    }
  }

  return {
    totalCommits: commits.length,
    totalFiles: allFiles.size,
    totalInsertions,
    totalDeletions,
    authors: [...authorMap.entries()]
      .map(([name, count]) => ({ name, commits: count }))
      .sort((a, b) => b.commits - a.commits),
    topFiles: [...fileMap.entries()]
      .map(([file, changes]) => ({ file, changes }))
      .sort((a, b) => b.changes - a.changes)
      .slice(0, 10),
  };
}

export type { GitHistory, Commit, ExtractOptions } from "./types.js";
