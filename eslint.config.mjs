import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

// docs/DESIGN.md section 9. Each restriction names the only files that may import the module.
const ICONS = { group: ["react-icons", "react-icons/*"], message: "Use <Icon> from components/ui/Icon." };
const IMAGE = { group: ["next/image"], message: "Use <Photo>, <Avatar>, <LogoRow> or a layout component." };
const FONT = { group: ["next/font/*"], message: "Fonts are declared once, in app/fonts.ts." };
const restrict = (...patterns) => ({ "no-restricted-imports": ["error", { patterns }] });

export default defineConfig([
  globalIgnores([".next/**", ".vercel/**", "out/**", "build/**", "next-env.d.ts"]),
  { extends: [...nextCoreWebVitals] },
  { files: ["**/*.{ts,tsx}"], rules: restrict(ICONS, IMAGE, FONT) },
  { files: ["components/ui/Icon.tsx"], rules: restrict(IMAGE, FONT) },
  {
    files: ["components/ui/Avatar.tsx", "components/ui/Photo.tsx", "components/ui/LogoRow.tsx", "components/chess/FaceOff.tsx", "components/layout/*.tsx"],
    rules: restrict(ICONS, FONT),
  },
  { files: ["app/fonts.ts"], rules: restrict(ICONS, IMAGE) },
]);
