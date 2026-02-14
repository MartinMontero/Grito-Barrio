import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: [
      'src/tests/unit/**/*.test.ts',
      'src/tests/integration/**/*.test.ts',
      'src/tests/e2e/**/*.test.ts',
      'src/tests/accessibility/**/*.test.ts',
      'src/tests/performance/**/*.test.ts',
      'src/tests/security/**/*.test.ts',
      'src/tests/offline/**/*.test.ts',
    ],
    exclude: [
      'node_modules',
      'dist',
      'build',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
    reporters: ['verbose'],
    testTimeout: 10000,
    hookTimeout: 10000,
    deps: {
      inline: [/@testing-library/],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
    },
  },
})
