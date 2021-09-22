import axios from "axios";
import { existsSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import type { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";
import path from "path";
import { defineConfig, ViteDevServer } from "vite";

const ASSETS_DIR = path.join(module.path, "public");
const COOKIE_CLICKER_MAIN_SITE = "https://orteil.dashnet.org/cookieclicker";
const VERSIONS_FILE = path.join(module.path, "versions.json");

const versionRE = /\?v=([0-9.]+).*$/s;
const extractVersion = (url: string): [string, string | null] => {
	const match = url.match(versionRE);
	return [url.replace(versionRE, ""), match ? match[1] : null];
};

async function getVersions(): Promise<Record<string, string>> {
	if (!existsSync(VERSIONS_FILE)) {
		await writeFile(VERSIONS_FILE, "{}", { encoding: "utf-8" });
	}
	return JSON.parse(await readFile(VERSIONS_FILE, { encoding: "utf-8" }));
}

async function updateVersion(
	assetPath: string,
	newVersion: string | null,
): Promise<void> {
	if (newVersion) {
		const versions = await getVersions();
		versions[assetPath] = newVersion;
		return await writeFile(VERSIONS_FILE, JSON.stringify(versions), {
			encoding: "utf-8",
		});
	}
}

function guessMimeType(filePath: string): string {
	switch (path.extname(filePath)) {
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "mp3":
		case "mpeg":
			return "audio/mpeg";
		case "png":
			return "image/png";
		default:
			return "application/octet-stream";
	}
}

async function getStaticAsset(
	assetPath: string,
): Promise<[Uint8Array, OutgoingHttpHeaders]> {
	const fileData = await readFile(path.join(ASSETS_DIR, assetPath));
	const headers: OutgoingHttpHeaders = {
		"content-type": guessMimeType(assetPath),
		"content-length": String(fileData.length),
	};
	return [fileData, headers];
}

function resolveUrl(assetPath: string): string {
	return `${COOKIE_CLICKER_MAIN_SITE}${assetPath}`;
}

async function fetchLiveAsset(
	assetPath: string,
	requestHeaders: IncomingHttpHeaders,
): Promise<[Uint8Array, OutgoingHttpHeaders]> {
	const url = resolveUrl(assetPath);
	console.log(`Fetching asset from ${url}`);
	const assetResponse = await axios.get(url, {
		headers: requestHeaders,
		responseType: "arraybuffer",
	});
	if (assetResponse.status < 200 || assetResponse.status >= 300) {
		throw new Error(
			`Received a failure code when fetching asset from ${url}: ${assetResponse.status}`,
		);
	}
	const headers: OutgoingHttpHeaders = {};
	if (assetResponse.headers["content-type"]) {
		headers["Content-Type"] = assetResponse.headers["content-type"];
	}
	const asset: Uint8Array = assetResponse.data;
	headers["Content-Length"] = String(asset.length);
	return [asset, headers];
}

async function cacheAsset(destPath: string, data: Uint8Array): Promise<void> {
	const cachedPath = path.join(ASSETS_DIR, destPath);
	await writeFile(cachedPath, data);
	console.log(`Cached an asset at ${cachedPath}.`);
}

async function handleBinaryAsset(
	assetPath: string,
	requestHeaders: IncomingHttpHeaders,
): Promise<[Uint8Array, OutgoingHttpHeaders]> {
	const versions = await getVersions();
	const [cleanPath, version] = extractVersion(assetPath);
	if (versions[cleanPath] === version) {
		return getStaticAsset(assetPath);
	}
	const [asset, headers] = await fetchLiveAsset(assetPath, requestHeaders);
	await cacheAsset(cleanPath, asset);
	await updateVersion(cleanPath, version);
	return [asset, headers];
}

export default defineConfig({
	plugins: [
		{
			name: "kiln-dev-server",
			configureServer(server: ViteDevServer): () => void {
				return () => {
					server.middlewares.use(async (req, res, next) => {
						if ("GET" !== req.method) {
							return next();
						}
						if (req.url?.startsWith("/img/")) {
							let asset: Uint8Array;
							let headers: OutgoingHttpHeaders;
							try {
								[asset, headers] = await handleBinaryAsset(
									req.url,
									req.headers,
								);
							} catch (e) {
								return next();
							}
							res.writeHead(200, headers);
							res.end(asset);
						} else {
							return next();
						}
					});
				};
			},
		},
	],
});
