import axios, { AxiosResponse } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";
import { CookieJar } from "tough-cookie";

import {
	COOKIE_CLICKER_UPSTREAM_HOST,
	COOKIE_CLICKER_UPSTREAM_SITE,
} from "../environment";

const cookieJar = new CookieJar();
const httpClient = wrapper(axios.create({ jar: cookieJar }));

function resolveUrl(resourcePath: string): string {
	let cleanPath = resourcePath.startsWith("/")
		? resourcePath.slice(1)
		: resourcePath;
	cleanPath = cleanPath.endsWith("/") ? cleanPath.slice(0, -1) : cleanPath;
	return `${COOKIE_CLICKER_UPSTREAM_SITE}/${cleanPath}`;
}

function getUpstreamHeaders(
	originalHeaders: IncomingHttpHeaders,
): IncomingHttpHeaders {
	const newHeaders: IncomingHttpHeaders = {
		accept: "*/*",
		"accept-encoding": "gzip",
		connection: "keep-alive",
		host: COOKIE_CLICKER_UPSTREAM_HOST,
		referer: COOKIE_CLICKER_UPSTREAM_SITE,
	};
	for (const key of [
		"connection",
		"accept",
		"accept-language",
		"range",
		"user-agent",
	]) {
		if (originalHeaders[key]) {
			newHeaders[key] = originalHeaders[key];
		}
	}
	return newHeaders;
}

async function sendRequestToLiveServer(
	url: string,
	headers: IncomingHttpHeaders,
): Promise<AxiosResponse> {
	const response = await httpClient.get(url, {
		headers: getUpstreamHeaders(headers),
		responseType: "arraybuffer",
	});
	if (response.status < 200 || response.status >= 300) {
		throw new Error(
			`Received a failure code when fetching resource from ${url}: ${response.status}`,
		);
	}
	return response;
}

export async function fetchLiveResource(
	resourcePath: string,
	requestHeaders: IncomingHttpHeaders = {},
): Promise<[Buffer, OutgoingHttpHeaders]> {
	const url = resolveUrl(resourcePath);
	console.log(`Fetching resource from ${url}`);
	const response = await sendRequestToLiveServer(url, requestHeaders);
	const responseHeaders: OutgoingHttpHeaders = {};
	if (response.headers["content-type"]) {
		responseHeaders["Content-Type"] = response.headers["content-type"];
	}
	const resource: Buffer = response.data;
	responseHeaders["Content-Length"] = String(resource.length);
	return [resource, responseHeaders];
}
