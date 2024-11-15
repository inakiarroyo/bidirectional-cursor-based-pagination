import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  test: {
    // Specify the testing environment. Use 'node' for API routes.
    environment: 'node',
    // Include test files with .test.ts or .test.tsx extensions inside src/__tests__
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    // Enable globals if you prefer using global test functions like describe, it, expect
    globals: true,
    // Setup files to run before the tests (optional)
    setupFiles: './vitest.setup.ts',
    // Coverage configuration (optional)
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['**/node_modules/**', '**/.next/**'],
    },
  },
  plugins: [
    // This plugin allows Vitest to understand path aliases defined in tsconfig.json
    tsconfigPaths(),
  ],
});
