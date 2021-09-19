import InitHandler = CookieKiln.InitHandler;

import {
	addPredefinedStyles,
	addStyles,
	getGameElement,
	initOverlay,
} from "./dom";
import {
	addHook,
	addHookIfVanilla,
	ALLOWED_HOOKS,
	BaseModContext,
	registerKilnVoidHook,
	registerRateHook,
	registerResetHook,
	registerTickerHook,
	VanillaHook,
} from "./hooks";

function createModContext<Context extends BaseModContext>(
	Game: Game,
): CookieKiln.KilnMethods & Partial<Context> {
	const methods: CookieKiln.KilnMethods = {
		addOverlayElement(element: HTMLElement): void {
			const overlay = Game.kilnData.elements.overlay;
			overlay.appendChild(element);
		},
		addStyles,
	};
	const context: Partial<Context> = {};
	return {
		...methods,
		...context,
	};
}

function createHookHasHappened(Game: Game): boolean {
	// The game sets this value right before calling the 'create' hook
	return Game.vanilla === 0;
}

function registerKilnMod<Context extends BaseModContext = BaseModContext>(
	this: Game,
	name: string,
	mod: CookieKiln.Mod<Context>,
) {
	const modHooks: CookieKiln.SetupHooks<Context> = {};
	const modContext = createModContext<Context>(this);
	const setupContext: CookieKiln.SetupContext<Context> = {
		hook: (hook, handler) => {
			if (ALLOWED_HOOKS[hook]) {
				addHook(hook, handler, modHooks);
			} else {
				console.warn(`[${name}]: Unknown hook name ${hook}!`);
			}
			return setupContext;
		},
	};
	mod(setupContext);
	modHooks.init?.forEach((handler: InitHandler<Context>) =>
		handler.call(modContext, this),
	);
	const modHookEntries = Object.entries(modHooks) as [
		VanillaHook,
		CookieKiln.VanillaHandler<Context>[] | undefined,
	][];
	const doCreate = createHookHasHappened(this);
	modHookEntries.forEach(([hook, handlers]) => {
		if (!ALLOWED_HOOKS[hook] || !handlers) {
			return;
		}
		if ("create" === hook && doCreate) {
			console.log(
				`Running "create" hooks for mod \"${name}\" as create hook has already been called.`,
			);
			handlers.forEach((handler) => {
				const createHandler = handler as CookieKiln.BoundHandlerFor<
					"create",
					Context
				>;
				addHookIfVanilla(
					this.kilnData.hooks,
					hook,
					createHandler,
					modContext,
				);
				createHandler.call(modContext, this);
			});
		} else {
			handlers.forEach((handler) =>
				addHookIfVanilla(
					this.kilnData.hooks,
					hook,
					handler,
					modContext,
				),
			);
		}
	});
}

export function installKiln(Game: Game): void {
	Game.kilnData = {
		elements: {},
		hooks: {},
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
	Game.kilnData.elements.overlay = initOverlay(getGameElement());
}
