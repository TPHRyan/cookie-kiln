import {
	registerKilnVoidHook,
	registerRateHook,
	registerResetHook,
	registerTickerHook,
} from "./hooks";
import {
	addPredefinedStyles,
	createDomObserver,
	createModMenu,
	initOverlay,
} from "./dom";
import { registerKilnMod } from "./mod";

export function installKiln(Game: Game): void {
	Game.kilnData = {
		elements: {},
		hooks: {},
		menus: {},
		mods: {},
	};
	Game.registerKilnMod = registerKilnMod;

	registerKilnVoidHook("check", Game);
	registerKilnVoidHook("click", Game);
	registerKilnVoidHook("create", Game);
	registerKilnVoidHook("draw", Game);
	registerKilnVoidHook("logic", Game);
	registerKilnVoidHook("reincarnate", Game);

	registerRateHook("cookiesPerClick", Game);
	registerRateHook("cps", Game);

	registerResetHook(Game);
	registerTickerHook(Game);

	addPredefinedStyles();
	Game.kilnData.elements.overlay = initOverlay();

	const domObserver = createDomObserver();
	createModMenu(domObserver, Game.kilnData.mods);
}
