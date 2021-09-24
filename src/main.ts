import { engines as pkgEngines, version as pkgVersion } from "../package.json";

import { installKiln } from "./kiln";

function cookieClickerVersionIsValid(
	actualVersion: number,
	requiredVersionString: string,
): boolean {
	if ("<=" !== requiredVersionString.slice(0, 2)) {
		return false;
	}
	const requiredVersion = parseFloat(requiredVersionString.slice(2));
	return !isNaN(requiredVersion) && actualVersion <= requiredVersion;
}

function createMod(Game: Game): CookieClickerMod {
	return {
		init() {
			const kilnVersionIdentifier = `Cookie Kiln v${pkgVersion}.`;
			if (
				!cookieClickerVersionIsValid(
					Game.version,
					pkgEngines["cookie-clicker"],
				)
			) {
				console.warn(
					`${kilnVersionIdentifier} not loaded, unsupported Cookie Clicker version ${Game.version}!`,
				);
			}
			installKiln(Game);
			console.log(`Loaded ${kilnVersionIdentifier}`);
			console.log(`Running on Cookie Clicker v${Game.version}.`);
		},
		save(): string {
			return "";
		},
		load(_data: string) {},
	};
}

unsafeWindow.onCookieKilnLoad = new Promise<Game>((resolve, reject) => {
	const loadCookieKiln = () => {
		const Game = unsafeWindow.Game;
		if (Game?.ready) {
			try {
				Game.registerMod("CookieKiln", createMod(Game));
				resolve(Game);
			} catch (e) {
				reject(e);
			}
		} else {
			setTimeout(loadCookieKiln, 1);
		}
	};
	loadCookieKiln();
});
