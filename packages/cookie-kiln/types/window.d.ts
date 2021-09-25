/// <reference path="./game.d.ts" />

declare interface Window {
	onCookieKilnLoad?: Promise<Game>;
}
