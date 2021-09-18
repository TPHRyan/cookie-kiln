import styles from "./style.css";
import { createElement, createTextNode, getDocument } from "../kiln-helpers";

import BaseModContext = CookieKiln.BaseModContext;
import CustomHook = CookieKiln.CustomHook;
import VanillaHook = CookieKiln.VanillaHook;
import HandlerFor = CookieKiln.HandlerFor;
import VanillaHandlerFor = CookieKiln.VanillaHandlerFor;
import InitHandler = CookieKiln.InitHandler;

const OVERLAY_ID = "kiln-overlay";

const ALLOWED_HOOKS: {
	[K in CustomHook | VanillaHook]: true;
} = {
	check: true,
	click: true,
	cookiesPerClick: true,
	cps: true,
	create: true,
	draw: true,
	init: true,
	logic: true,
	reincarnate: true,
	reset: true,
	ticker: true,
};

function addHookIfVanilla<
	Hook extends CustomHook | VanillaHook,
	Context extends BaseModContext,
>(
	modHooks: CookieKiln.RuntimeHooks<Context>,
	hook: Hook,
	handler: Hook extends VanillaHook
		? VanillaHandlerFor<Hook, Context>
		: HandlerFor<Hook, Context>,
	modContext: CookieKiln.WithKilnMethods<Context>,
): void {
	if ("init" === hook) {
		return;
	}
	const vanillaHook: VanillaHook = hook;
	addVanillaHook(
		vanillaHook,
		handler as VanillaHandlerFor<typeof vanillaHook, Context>,
		modHooks,
		modContext,
	);
}

function addVanillaHook<
	Hook extends VanillaHook,
	Context extends BaseModContext,
>(
	vanillaHook: Hook,
	handler: VanillaHandlerFor<Hook, Context>,
	modHooks: CookieKiln.RuntimeHooks<Context>,
	modContext: CookieKiln.WithKilnMethods<Context>,
): void {
	const boundHandler = handler.bind(modContext) as CookieKiln.BoundHandler<
		VanillaHandlerFor<Hook, Context>
	>;
	if (undefined === modHooks[vanillaHook]) {
		modHooks[vanillaHook] = [
			boundHandler,
		] as CookieKiln.RuntimeHooks<Context>[Hook];
	} else {
		(modHooks[vanillaHook] as CookieKiln.BoundHandler<
			VanillaHandlerFor<Hook, Context>
		>[])!.push(boundHandler);
	}
}

function addHook<
	Hook extends CustomHook | VanillaHook,
	Context extends BaseModContext,
>(
	hook: Hook,
	handler: HandlerFor<Hook, Context>,
	modHooks: CookieKiln.SetupHooks<Context>,
): void {
	if (undefined === modHooks[hook]) {
		modHooks[hook] = [handler] as CookieKiln.SetupHooks<Context>[Hook];
	} else {
		modHooks[hook]!.push(
			handler as HandlerFor<CustomHook & VanillaHook, Context>,
		);
	}
}

function createModContext<Context extends BaseModContext>(
	Game: Game,
): CookieKiln.KilnMethods & Partial<Context> {
	const methods: CookieKiln.KilnMethods = {
		addOverlayElement(element: HTMLElement): void {
			const overlay = Game.kilnData.elements.overlay;
			overlay.appendChild(element);
		},
		addStyles(css: string): void {
			const doc = getDocument();
			const head = doc.querySelector("head");
			const styleElement = createElement("style");
			styleElement.setAttribute("type", "text/css");
			styleElement.appendChild(createTextNode(css));
			head?.appendChild(styleElement);
		},
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

type VoidHook = {
	[K in VanillaHook]: CookieKiln.VoidHandler<BaseModContext> extends HandlerFor<K>
		? K
		: never;
}[VanillaHook];
function registerKilnVoidHook(hook: VoidHook, Game: Game): void {
	Game.registerHook(hook, () =>
		Game.kilnData.hooks[hook]?.forEach((handler) => handler(Game)),
	);
}

function registerRateHook(hook: "cookiesPerClick" | "cps", Game: Game): void {
	Game.registerHook(hook, (rate: number): number => {
		if (undefined === Game.kilnData.hooks[hook]) {
			return rate;
		} else {
			return Game.kilnData.hooks[hook]!.reduce(
				(
					currentRate: number,
					currentHandler: (rate: number, Game: Game) => number,
				) => currentHandler(currentRate, Game),
				rate,
			);
		}
	});
}

function registerResetHook(Game: Game): void {
	Game.registerHook("reset", (hardReset): void =>
		Game.kilnData.hooks.reset?.forEach((handler) =>
			handler(hardReset, Game),
		),
	);
}
function registerTickerHook(Game: Game): void {
	Game.registerHook("ticker", (): string[] => {
		if (undefined === Game.kilnData.hooks.ticker) {
			return [];
		}
		return Game.kilnData.hooks.ticker.flatMap((handler) => handler(Game));
	});
}

function addStyles(): void {
	const headElement = document.querySelector<HTMLHeadElement>("head");
	const styleElement = createElement("style");
	styleElement.setAttribute("type", "text/css");
	styleElement.appendChild(createTextNode(styles));
	headElement?.appendChild(styleElement);
}

function getGameElement(): HTMLDivElement {
	const gameElement = document.querySelector<HTMLDivElement>("#game");
	if (null !== gameElement) {
		return gameElement;
	}
	throw new Error('No element found with id "game"!');
}

function initOverlay(gameElement: HTMLDivElement): HTMLDivElement {
	console.debug("Initializing overlay element.");
	let overlayElement = gameElement.querySelector<HTMLDivElement>(OVERLAY_ID);
	if (overlayElement === null) {
		overlayElement = createElement("div");
		gameElement.appendChild(overlayElement);
	}
	overlayElement.setAttribute("id", OVERLAY_ID);
	return overlayElement;
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

	addStyles();
	Game.kilnData.elements.overlay = initOverlay(getGameElement());
}
