export enum CommitLogic {
  AND = "AND",
  OR = "OR",
}

/**
 * Configuration for enforceing Claude Code to not commit large changes.
 */
export type CommitConfig = {
  threshold: {
    enabled: boolean;
    maxFilesChanged?: number;
    maxLinesChanged?: number;
    logic?: CommitLogic;
    blockReason?: string;
  };
};

export type Rubric = {
  name?: string;
  pattern: string;
  path: string;
};

export type RubricConfig = {
  enforce?: boolean;
  rules?: Rubric[];
  reviewMessage?: string;
};

export type Config = {
  commit?: CommitConfig;
  rubric?: RubricConfig;
};
