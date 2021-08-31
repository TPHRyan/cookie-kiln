import typescript from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import metablock from "rollup-plugin-userscript-metablock";

import pkg from "./package.json";

export default {
	input: "src/main.ts",
	output: {
		file: "dist/cookie-kiln.userscript.js",
		format: "iife",
	},
	plugins: [
		typescript(),
		metablock({
			manager: "tampermonkey",
			override: {
				version: pkg.version,
			},
		}),
	],
} as RollupOptions;
