import Koa from "koa";
import send from "koa-send";

import { ASSETS_DIR } from "./environment";
import { fallbackOnLiveServerMiddleware } from "./lib/fallback-live.middleware";
import { indexHtmlMiddleware } from "./lib/index.middleware";

export function createServer(): Koa {
	const app = new Koa();
	app.use(fallbackOnLiveServerMiddleware);
	app.use(indexHtmlMiddleware);
	app.use(async (ctx) => await send(ctx, ctx.path, { root: ASSETS_DIR }));
	return app;
}

export default createServer;
