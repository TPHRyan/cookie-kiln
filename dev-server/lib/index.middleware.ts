import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import Koa from "koa";
import path from "path";

import { ROOT_DIR } from "../environment";
import { fetchLiveResource } from "./live-server.client";
import { transformIndexHtml } from "./index.transform";

const INDEX_PATH = "/index.html";

async function prepareIndexHtml(path: string): Promise<string> {
	if (existsSync(path)) {
		return await readFile(path, { encoding: "utf-8" });
	}
	console.log("index.html not found, preparing...");

	const [indexContent] = await fetchLiveResource(INDEX_PATH);
	const transformedContent = await transformIndexHtml(
		indexContent.toString(),
	);
	await writeFile(path, transformedContent);

	console.log("Prepared index.html");
	return transformedContent;
}

export async function indexHtmlMiddleware(
	ctx: Koa.Context,
	next: Koa.Next,
): Promise<void> {
	if (ctx.url === "/" || ctx.url === INDEX_PATH) {
		const indexPath = path.join(ROOT_DIR, INDEX_PATH);
		ctx.body = await prepareIndexHtml(indexPath);
	} else {
		await next();
	}
}
