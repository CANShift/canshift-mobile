import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

const KEEP_COMMENT_PATTERN =
  /^[\s/]*(eslint-(disable|enable)|@ts-(expect-error|ignore|nocheck)|@typescript-eslint|<reference)/;

const noCommentsPlugin = {
  rules: {
    "no-comments": {
      meta: {
        type: "problem",
        docs: {
          description: "Disallow comments; allow only load-bearing directives.",
        },
        schema: [],
        messages: {
          forbidden:
            "Comments are forbidden in this package. Allowed directives: eslint-*, @ts-expect-error.",
        },
      },
      create(context) {
        return {
          Program() {
            for (const comment of context.sourceCode.getAllComments()) {
              if (KEEP_COMMENT_PATTERN.test(comment.value)) continue;
              context.report({ loc: comment.loc, messageId: "forbidden" });
            }
          },
        };
      },
    },
  },
};

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  prettierConfig,
  {
    plugins: { "no-comments": noCommentsPlugin },
    files: ["src/**/*.{ts,tsx}", "index.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: false },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "prefer-const": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-comments/no-comments": "error",
      "func-style": ["error", "expression"],
      "max-depth": ["error", 3],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/**/*.test.{ts,tsx}", "src/**/__tests__/**"],
    rules: {
      "max-lines-per-function": [
        "error",
        { max: 30, skipBlankLines: true, skipComments: true },
      ],
      "max-lines": ["error", { max: 300, skipBlankLines: true }],
      "max-depth": ["error", 2],
      complexity: ["error", 10],
    },
  },
  {
    files: ["**/*.{js,cjs,ts}"],
    ignores: ["src/**", "index.ts"],
    plugins: { "no-comments": noCommentsPlugin },
    languageOptions: tseslint.configs.disableTypeChecked.languageOptions,
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      "no-comments/no-comments": "error",
    },
  },
  {
    files: ["**/*.{js,cjs}"],
    ignores: ["src/**"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "writable",
        __dirname: "readonly",
        process: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".expo/**",
      "ios/**",
      "android/**",
      "assets/**",
      "coverage/**",
      "eslint.config.mjs",
    ],
  },
);
