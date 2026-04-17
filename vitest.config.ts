import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  resolve: {
    // @ts-expect-error — Vitest 4 native tsconfig paths, not in TS defs yet
    tsconfigPaths: true,
  },
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    passWithNoTests: true,
  },
})
