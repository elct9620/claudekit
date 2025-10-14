import { defineConfig } from 'rolldown';

export default defineConfig([
  {
    input: 'src/commit.ts',
    output: {
      file: 'dist/commit.js'
    },
    platform: "node",
    tsconfig: 'tsconfig.json'
  }
]);
