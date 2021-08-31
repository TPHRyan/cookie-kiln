import jsonPlugin from "@rollup/plugin-json";
import typescriptPlugin from "@rollup/plugin-typescript";
import { RollupOptions } from "rollup";
import metablock from "rollup-plugin-userscript-metablock";

import { version as pkgVersion } from "./package.json";
import babel from "@rollup/plugin-babel";

export default {
	input: "src/main.ts",
	output: {
		file: "dist/cookie-kiln.userscript.js",
		format: "iife",
	},
	plugins: [
		jsonPlugin({
			preferConst: true,
		}),
		typescriptPlugin(),
		babel({
			babelHelpers: "bundled",
		}),
		metablock({
			manager: "tampermonkey",
			override: {
				version: pkgVersion,
			},
		}),
	],
} as RollupOptions;
