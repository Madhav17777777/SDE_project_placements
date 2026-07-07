// Vitest + Testing Library setup, referenced by vite.config.js `test.setupFiles`.
// Component tests are written in Phase 9; this file just wires up the
// jest-dom matchers (toBeInTheDocument, etc.) so they don't need re-importing
// in every test file.
import '@testing-library/jest-dom';
