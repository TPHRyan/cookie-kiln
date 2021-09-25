/// <reference path="./common.d.ts" />
/// <reference path="./hooks.d.ts" />
/// <reference path="./mods.d.ts" />

interface Game {
	kilnData: {
		[key: string]: unknown;
		elements: Record<string, HTMLElement>;
		hooks: CookieKiln.RuntimeHooks;
		menus: Record<string, unknown>;
		mods: CookieKiln.Mods;
	};
	onMenuReal: string;

	registerKilnMod<
		Context extends CookieKiln.BaseModContext = CookieKiln.BaseModContext,
	>(
		name: string,
		mod: CookieKiln.Mod<Context>,
	): void;
}

interface Game {
	kilnData: {
		[key: string]: unknown;
		elements: Record<string, HTMLElement>;
		hooks: CookieKiln.RuntimeHooks;
		menus: Record<string, unknown>;
		mods: CookieKiln.Mods;
	};
	onMenuReal: string;

	registerKilnMod<
		Context extends CookieKiln.BaseModContext = CookieKiln.BaseModContext,
	>(
		name: string,
		mod: CookieKiln.Mod<Context>,
	): void;
}
