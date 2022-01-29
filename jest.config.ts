import * as path from "path";
import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  moduleFileExtensions: ["ts", "tsx", "js"],
  preset: "ts-jest/presets/default-esm",
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    ".d.spec.tsx?$": "dts-jest/transform",
    ".spec.tsx?$": "ts-jest",
  },
  setupFiles: ["./setupJest.ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
    _dts_jest_: {
      compiler_options: path.resolve(__dirname, "./tsconfig.json"),
    },
  },
};

export default config;
