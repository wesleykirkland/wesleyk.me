import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // Global ignores
    ignores: [
      '**/__tests__/**',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      'jest.config.js',
      'jest.setup.js',
      'coverage/**',
      'out/**',
      '.next/**',
      'node_modules/**',
      'next-env.d.ts',
      '**/node_modules/**',
      '**/.next/**',
      '**/out/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/tsconfig.tsbuildinfo',
      '**/next-env.d.ts' // Next.js generated file with triple-slash references
    ]
  }
];

export default eslintConfig;
