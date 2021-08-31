import pkg from "../package.json";

interface CookieKilnMod extends CookieClickerMod {}

function createMod(Game: Game): CookieKilnMod {
	return {
		init() {
			console.log(`Loaded Cookie Kiln v${pkg.version}.`);
			console.log(`Running on Cookie Clicker v${Game.version}.`);
		},
		save(): string {
			return "";
		},
		load(_data: string) {},
	};
}

const loadModInterval = setInterval(() => {
	const Game = unsafeWindow.Game;
	if (Game?.ready) {
		Game.registerMod("CookieKiln", createMod(Game));
		clearInterval(loadModInterval);
	}
}, 100);
