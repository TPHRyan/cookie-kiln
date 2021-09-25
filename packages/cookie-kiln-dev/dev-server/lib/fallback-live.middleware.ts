import Koa from "koa";
import { serveBinaryAsset, ServedAsset, serveTextAsset } from "./assets.serve";
import { isNodeError } from "./typechecks";

const majorAssetRE = /\/[A-Za-z0-9-_]+\.(css|js)/g;

async function fallbackOnLiveServer(
	ctx: Koa.Context,
	originalError: unknown,
): Promise<void> {
	if ("GET" !== ctx.method) {
		throw originalError;
	}
	let responseData: ServedAsset | null = null;
	if (ctx.url.startsWith("/img/") || ctx.url.startsWith("/snd/")) {
		responseData = await serveBinaryAsset(ctx.url, ctx.request.headers);
	} else if (ctx.url.match(majorAssetRE)) {
		responseData = await serveTextAsset(ctx.url, ctx.request.headers);
	}
	if (null === responseData) {
		throw originalError;
	}
	ctx.body = responseData.asset;
	if (responseData.headers) {
		ctx.set(responseData.headers);
	}
}
export async function fallbackOnLiveServerMiddleware(
	ctx: Koa.Context,
	next: Koa.Next,
): Promise<void> {
	try {
		await next();
	} catch (e) {
		if (isNodeError(e) && "ENOENT" === e.code) {
			await fallbackOnLiveServer(ctx, e);
		} else {
			throw e;
		}
	}
}
