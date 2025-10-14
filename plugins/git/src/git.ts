import { exec } from "child_process";

export async function isGitAvailable(): Promise<boolean> {
  try {
    return new Promise((resolve) => {
      exec("git status", (error) => {
        resolve(!error);
      });
    });
  } catch {
    return false;
  }
}

export async function getChangedFilesCount(): Promise<number> {
  return new Promise((resolve, reject) => {
    exec("git status --porcelain", (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      const changedFiles = stdout
        .split("\n")
        .filter((line) => line.trim() !== "");
      resolve(changedFiles.length);
    });
  });
}

export async function getChangedLinesCount(): Promise<number> {
  return new Promise((resolve, reject) => {
    exec("git diff --numstat", (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }
      const lines = stdout
        .split("\n")
        .filter((line) => line.trim() !== "")
        .map((line) => {
          const parts = line.split("\t");
          const added = parseInt(parts[0] || "0", 10);
          const deleted = parseInt(parts[1] || "0", 10);
          return (isNaN(added) ? 0 : added) + (isNaN(deleted) ? 0 : deleted);
        });
      const totalChangedLines = lines.reduce((acc, curr) => acc + curr, 0);
      resolve(totalChangedLines);
    });
  });
}

export async function getUntrackedLinesCount(): Promise<number> {
  return new Promise((resolve, reject) => {
    exec(
      "git ls-files --others --exclude-standard | xargs wc -l",
      (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }

        const lines = stdout
          .split("\n")
          .filter((line) => line.trim() !== "" && !line.includes("total"))
          .map((line) => {
            const parts = line.trim().split(/\s+/);
            return parseInt(parts[0] || "0", 10);
          });
        const totalUntrackedLines = lines.reduce((acc, curr) => acc + curr, 0);
        resolve(totalUntrackedLines);
      },
    );
  });
}
