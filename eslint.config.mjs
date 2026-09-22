import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
export default tseslint.config({ignores:["**/node_modules/**","**/.next/**","**/out/**","**/dist/**","**/coverage/**","**/test-results/**","**/next-env.d.ts"]},js.configs.recommended,...tseslint.configs.recommended,{files:["**/*.{ts,tsx}"],languageOptions:{parserOptions:{ecmaFeatures:{jsx:true}},globals:{...globals.node,...globals.browser}},rules:{"@typescript-eslint/no-explicit-any":"off","@typescript-eslint/no-unused-vars":["error",{argsIgnorePattern:"^_"}]}});
