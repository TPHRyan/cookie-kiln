import { readFile } from "fs/promises";
import Koa from "koa";
import path from "path";

import { PROJECT_DIR } from "../environment";

const COOKIE_KILN_USERSCRIPT_PATH = path.join(
	PROJECT_DIR,
	"dist",
	"cookie-kiln.userscript.js",
);
const COOKIE_KILN_SCRIPT_NAME = "cookieKiln.js";
const COOKIE_KILN_SCRIPT_TAG = `
<script src="/${COOKIE_KILN_SCRIPT_NAME}"></script>
`;

const unsafeWindowRE = /unsafeWindow/g;
const userscriptHeaderRE =
	/^\s*?\/\/ ==UserScript==.*?\/\/ ==\/UserScript==\s*?\n/ms;
function transformUserScript(code: string): string {
	return code
		.replace(userscriptHeaderRE, "")
		.replace(unsafeWindowRE, "window");
}

const headCloseRE = /$\s*([\t ]*<\/head>)/ms;
export async function injectKilnMiddleware(
	ctx: Koa.Context,
	next: Koa.Next,
): Promise<void> {
	if (`/${COOKIE_KILN_SCRIPT_NAME}` === ctx.url) {
		ctx.status = 200;
		ctx.body = transformUserScript(
			await readFile(COOKIE_KILN_USERSCRIPT_PATH, {
				encoding: "utf-8",
			}),
		);
	} else {
		await next();
		if ("index.html" === ctx.state.filename) {
			const indexContent: string = String(ctx.body);
			ctx.body = indexContent.replace(
				headCloseRE,
				`${COOKIE_KILN_SCRIPT_TAG}$1`,
			);
		}
	}
}
