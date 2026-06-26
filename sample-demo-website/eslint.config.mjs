import nextPlugin from "@next/eslint-plugin-next";

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "out/**"]
  },
  {
    ...nextPlugin.flatConfig.coreWebVitals
  },
  {
    files: ["app/**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    }
  }
];

export default eslintConfig;
