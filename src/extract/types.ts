export interface FileChange {
  file: string;
  insertions: number;
  deletions: number;
  binary: boolean;
}

export interface Commit {
  hash: string;
  shortHash: string;
  message: string;
  body: string;
  author: { name: string; email: string };
  date: Date;
  parents: string[];
  refs: string[];
  files: FileChange[];
  diff?: string;
}

export interface RepoStats {
  totalCommits: number;
  totalFiles: number;
  totalInsertions: number;
  totalDeletions: number;
  authors: { name: string; commits: number }[];
  topFiles: { file: string; changes: number }[];
}

export interface GitHistory {
  repoName: string;
  commits: Commit[];
  stats: RepoStats;
  dateRange: { since: Date; until: Date };
}

export interface ExtractOptions {
  since: string;
  until?: string;
  branch?: string;
  authors?: string[];
  paths?: string[];
  includeMerges?: boolean;
}
