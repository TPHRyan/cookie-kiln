import path from "path";

export const PROJECT_DIR = path.resolve(path.join(module.path, ".."));
export const ROOT_DIR = path.resolve(module.path);
export const ASSETS_DIR = path.join(ROOT_DIR, "public");
export const COOKIE_CLICKER_UPSTREAM_HOST = "orteil.dashnet.org";
export const COOKIE_CLICKER_UPSTREAM_SITE = `https://${COOKIE_CLICKER_UPSTREAM_HOST}/cookieclicker`;
export const VERSIONS_FILE = path.join(ROOT_DIR, "versions.json");
