const { readFile } = require('fs').promises;
const { join } = require('path');

/**
 * Create a verified commit with changed plugin dist files using GitHub API
 *
 * @param {object} params - GitHub Actions context objects
 * @param {object} params.github - Authenticated Octokit instance
 * @param {object} params.context - GitHub Actions context
 * @param {object} params.core - @actions/core utilities
 * @param {object} params.exec - @actions/exec utilities
 */
module.exports = async ({ github, context, core, exec }) => {
  const { owner, repo } = context.repo;

  core.info('Checking for changed files in plugins/*/dist/...');

  // Detect changed files using git status
  let changedFiles = '';
  await exec.exec('git', ['status', '--porcelain'], {
    listeners: {
      stdout: (data) => {
        changedFiles += data.toString();
      }
    }
  });

  // Parse git status output and filter for plugin dist files
  const distFilePattern = /plugins\/[^/]+\/dist\/.*\.js$/;
  const files = changedFiles
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      // git status format: "XY filename" where XY are status codes
      const match = line.match(/^(.{2})\s+(.+)$/);
      return match ? match[2] : null;
    })
    .filter(file => file && distFilePattern.test(file));

  if (files.length === 0) {
    core.info('No plugin dist files changed. Skipping commit.');
    return;
  }

  core.info(`Found ${files.length} changed plugin dist file(s):`);
  files.forEach(file => core.info(`  - ${file}`));

  // Get current branch from context
  const branch = process.env.GITHUB_HEAD_REF || context.ref.replace('refs/heads/', '');
  core.info(`Creating commit on branch: ${branch}`);

  // Get current branch reference
  const refResponse = await github.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${branch}`
  });
  const currentCommitSha = refResponse.data.object.sha;
  core.info(`Current commit SHA: ${currentCommitSha}`);

  // Get current commit to access tree
  const commitResponse = await github.rest.git.getCommit({
    owner,
    repo,
    commit_sha: currentCommitSha
  });
  const baseTreeSha = commitResponse.data.tree.sha;
  core.info(`Base tree SHA: ${baseTreeSha}`);

  // Create blobs for each changed file
  core.info('Creating blobs for changed files...');
  const treeItems = await Promise.all(
    files.map(async (file) => {
      const filePath = join(process.cwd(), file);
      const content = await readFile(filePath);
      const base64Content = content.toString('base64');

      const blobResponse = await github.rest.git.createBlob({
        owner,
        repo,
        content: base64Content,
        encoding: 'base64'
      });

      core.info(`  Created blob for ${file}: ${blobResponse.data.sha}`);

      return {
        path: file,
        mode: '100644',
        type: 'blob',
        sha: blobResponse.data.sha
      };
    })
  );

  // Create tree with new blobs based on current tree
  core.info('Creating tree...');
  const treeResponse = await github.rest.git.createTree({
    owner,
    repo,
    base_tree: baseTreeSha,
    tree: treeItems
  });
  core.info(`Created tree: ${treeResponse.data.sha}`);

  // Create commit
  const commitMessage = 'chore: rebuild plugin dist files';
  core.info(`Creating commit with message: "${commitMessage}"`);
  const newCommitResponse = await github.rest.git.createCommit({
    owner,
    repo,
    message: commitMessage,
    tree: treeResponse.data.sha,
    parents: [currentCommitSha]
  });
  core.info(`Created commit: ${newCommitResponse.data.sha}`);

  // Update branch reference
  core.info(`Updating branch ${branch} to new commit...`);
  await github.rest.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommitResponse.data.sha
  });

  core.info('✅ Successfully committed plugin dist files with verified signature');
  core.setOutput('commit_sha', newCommitResponse.data.sha);
  core.setOutput('files_committed', files.length);
};
