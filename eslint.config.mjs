import nextConfig from "eslint-config-next";

export default [
  ...nextConfig,
  {
    rules: {
      // Allow any type in specific cases (existing codebase convention)
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
