/// <reference path="./game.d.ts" />
/// <reference path="./hooks.d.ts" />
/// <reference path="./methods.d.ts" />
/// <reference path="./mods.d.ts" />

declare interface Window {
	onCookieKilnLoad?: Promise<Game>;
}
