export function defineMod(mod: CookieKiln.Mod): CookieKiln.Mod {
	return mod;
}

export async function loadMod(
	name: string,
	mod: CookieKiln.Mod,
): Promise<void> {
	async function _loadMod(attempt = 1) {
		if (!unsafeWindow.onCookieKilnLoad) {
			if (attempt > 10) {
				throw new Error(
					"Expected kiln to be installed on Game, but window.onCookieKilnLoad not found!",
				);
			} else {
				setTimeout(() => _loadMod(attempt + 1), 100);
				return;
			}
		}
		const Game = await unsafeWindow.onCookieKilnLoad;
		if (undefined === Game.registerKilnMod) {
			throw new Error(
				"Expected kiln to be installed on Game, but method registerKilnMod(mod) not found!",
			);
		}
		Game.registerKilnMod(name, mod);
	}
	return _loadMod();
}
