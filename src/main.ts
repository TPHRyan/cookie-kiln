import { engines as pkgEngines, version as pkgVersion } from "../package.json";
import { installKiln } from "./kiln";
import { defineMod } from "../kiln-helpers";
import { loadMod } from "../kiln-helpers/mod";

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

function loadTestMod(): void {
	loadMod(
		"KilnTestMod",
		defineMod((ctx) =>
			ctx.hook("init", () => {
				console.log("Hello, world!");
			}),
		),
	)
		.then()
		.catch((reason) => {
			throw reason;
		});
}

unsafeWindow.onCookieKilnLoad = new Promise<Game>((resolve, reject) => {
	const loadModInterval = setInterval(() => {
		const Game = unsafeWindow.Game;
		if (Game?.ready) {
			try {
				Game.registerMod("CookieKiln", createMod(Game));
				clearInterval(loadModInterval);
				resolve(Game);
			} catch (e) {
				reject(e);
			}
		}
	}, 10);
});

loadTestMod();
