import babel from "@rollup/plugin-babel";
import jsonPlugin from "@rollup/plugin-json";
import typescriptPlugin from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import cssPlugin from "rollup-plugin-import-css";
import metablockPlugin from "rollup-plugin-userscript-metablock";

import { version as pkgVersion } from "./package.json";

export default {
	input: "src/main.ts",
	output: {
		file: "dist/cookie-kiln.userscript.js",
		format: "iife",
		preferConst: true,
	},
	plugins: [
		cssPlugin(),
		jsonPlugin({
			preferConst: true,
		}),
		typescriptPlugin(),
		babel({
			babelHelpers: "bundled",
		}),
		metablockPlugin({
			manager: "tampermonkey",
			override: {
				version: pkgVersion,
			},
		}),
	],
} as RollupOptions;
