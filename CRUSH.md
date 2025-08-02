# CRUSH.md - Codebase Guidelines

This document outlines the conventions and commands for working with this Chrome Extension codebase.

## Build/Lint/Test Commands

- **Build**: This project is a plain JavaScript Chrome Extension and does not have a dedicated build step. It runs directly in the browser.
- **Lint**: No specific linting configuration found. Adhere to the code style guidelines below.
- **Test**: No automated test suite found. Manual testing is performed by loading the extension in Chrome:
  1. Open `chrome://extensions`
  2. Enable "Developer mode"
  3. Click "Load unpacked" and select the project folder.
- **Running a single test**: Since there is no automated test suite, individual features must be tested manually in the browser.

## Code Style Guidelines

- **Imports**: Standard JavaScript module imports (ESM/CommonJS) are not used. Chrome API functions are accessed globally (e.g., `chrome.storage`, `chrome.declarativeNetRequest`).
- **Formatting**:
  - Indentation: Use 2 spaces.
  - Semicolons: Use semicolons at the end of statements.
  - Braces: K&R style (opening brace on the same line as the control statement).
- **Types**: Plain JavaScript is used. JSDoc comments are used for some function parameters and return types (e.g., `/** @param {string[]} patterns */`). Follow this convention for clarity.
- **Naming Conventions**:
  - Variables and Functions: `camelCase` (e.g., `urlInput`, `addPattern`).
  - Constants: `SCREAMING_SNAKE_CASE` for global constants (e.g., `RULE_ID_START`).
  - Private-like functions: Prefix with `_` for internal functions if needed (though not strictly enforced, follow existing patterns).
- **Error Handling**:
  - User-facing errors: Use `alert()` for simple notifications (e.g., "Already blocked.").
  - Debugging: Use `console.log()` for outputting information during development.
- **Comments**:
  - Use block comments (`/* ... */`) for sectioning code (e.g., "1. Static quick-adds").
  - Use inline comments (`//`) for brief explanations of logic.
  - Add JSDoc comments for functions to describe parameters and purpose.
- **General**:
  - Keep functions concise and focused on a single responsibility.
  - Avoid external dependencies to maintain the lightweight nature of the extension.
  - Prioritize readability and simplicity.
