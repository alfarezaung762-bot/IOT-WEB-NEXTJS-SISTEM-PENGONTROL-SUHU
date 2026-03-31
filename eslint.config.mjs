import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  ...compat.config({
    overrides: [
      {
        files: ["components/ui/**/*.{ts,tsx}"],
        rules: {
          "@typescript-eslint/no-unused-vars": "off",
        },
      },
    ],
    extends: [
      "next",
      "plugin:react-hooks/recommended",
      "plugin:@typescript-eslint/recommended",
    ],
    rules: {
      "react/no-unescaped-entities": "off",
      "@next/next/no-page-custom-font": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "off",
      // Tambahkan baris di bawah ini untuk mematikan error "any" di seluruh file
      "@typescript-eslint/no-explicit-any": "off",
    },
  }),
];

export default eslintConfig;