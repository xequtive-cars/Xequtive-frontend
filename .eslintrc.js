module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    "react-hooks/exhaustive-deps": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "react/display-name": "off",
  },
  overrides: [
    {
      files: ["*.d.ts"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
};
