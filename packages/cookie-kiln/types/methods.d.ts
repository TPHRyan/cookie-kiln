/// <reference path="./common.d.ts" />

declare namespace CookieKiln {
	interface KilnMethods {
		addOverlayElement(element: HTMLElement): void;
		addStyles(css: string): void;
	}

	type WithKilnMethods<Context extends BaseModContext> = KilnMethods &
		Context;
}
