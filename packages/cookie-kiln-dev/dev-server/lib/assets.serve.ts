import { mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { IncomingHttpHeaders, OutgoingHttpHeaders } from "http";
import path from "path";

import { ASSETS_DIR, VERSIONS_FILE } from "../environment";
import { fetchLiveResource } from "./live-server.client";

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
		case "css":
			return "text/css";
		case "js":
			return "application/javascript";
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
): Promise<[Buffer, OutgoingHttpHeaders]> {
	const fileData = await readFile(path.join(ASSETS_DIR, assetPath));
	const headers: OutgoingHttpHeaders = {
		"content-type": guessMimeType(assetPath),
		"content-length": String(fileData.length),
	};
	return [fileData, headers];
}

async function cacheAsset(destPath: string, data: Uint8Array): Promise<void> {
	const cachedPath = path.join(ASSETS_DIR, destPath);
	await mkdir(path.dirname(cachedPath), { recursive: true });
	await writeFile(cachedPath, data);
	console.log(`Cached an asset at ${cachedPath}.`);
}

async function handleAsset(
	assetPath: string,
	requestHeaders: IncomingHttpHeaders,
): Promise<[Buffer, OutgoingHttpHeaders]> {
	const versions = await getVersions();
	const [cleanPath, version] = extractVersion(assetPath);
	if (versions[cleanPath] === version) {
		try {
			return await getStaticAsset(cleanPath);
		} catch (e) {
			console.warn(
				"Error opening static asset (see below), fetching from server.",
			);
			console.warn(e);
		}
	}
	const [asset, headers] = await fetchLiveResource(assetPath, requestHeaders);
	await cacheAsset(cleanPath, asset);
	await updateVersion(cleanPath, version);
	return [asset, headers];
}

export interface ServedAsset {
	asset: Buffer | string;
	encoding?: BufferEncoding;
	headers?: Record<string, string>;
}

export async function serveBinaryAsset(
	url: string,
	requestHeaders: IncomingHttpHeaders,
): Promise<ServedAsset> {
	const [asset, headers] = await handleAsset(url, requestHeaders);
	return { asset, headers: headers as Record<string, string> };
}

export async function serveTextAsset(
	url: string,
	requestHeaders: IncomingHttpHeaders,
): Promise<ServedAsset> {
	const [asset, headers] = await handleAsset(url, requestHeaders);
	return {
		asset,
		encoding: "utf-8",
		headers: headers as Record<string, string>,
	};
}
