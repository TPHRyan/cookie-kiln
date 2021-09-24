import { Server } from "http";
import Koa from "koa";
import send from "koa-send";

import { ASSETS_DIR } from "./environment";
import { fallbackOnLiveServerMiddleware } from "./lib/fallback-live.middleware";
import { indexHtmlMiddleware } from "./lib/index.middleware";
import { injectKilnMiddleware } from "./lib/inject-kiln.middleware";

export function createServer(): Koa {
	const app = new Koa();
	app.use(injectKilnMiddleware)
		.use(fallbackOnLiveServerMiddleware)
		.use(indexHtmlMiddleware)
		.use(async (ctx) => await send(ctx, ctx.path, { root: ASSETS_DIR }));
	return app;
}

export function runServer(port: number, hostname?: string): Server {
	const app = createServer();
	const server = app.listen(port, hostname);
	const displayHostname = hostname ?? "localhost";
	console.log(`Server now running at http://${displayHostname}:${port}.`);
	return server;
}

export default { create: createServer, run: runServer };
