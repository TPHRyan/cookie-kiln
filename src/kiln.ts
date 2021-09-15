import styles from "./style.css";
import { createElement, createTextNode, getDocument } from "../kiln-helpers";

import BaseModContext = CookieKiln.BaseModContext;
import InitHook = CookieKiln.InitHook;
import VoidHook = CookieKiln.VoidHook;
import KilnMethods = CookieKiln.KilnMethods;

const OVERLAY_ID = "kiln-overlay";

const ALLOWED_HOOKS: { [K in CookieKiln.Hook | CookieKiln.InitHook]: true } = {
	check: true,
	click: true,
	create: true,
	draw: true,
	init: true,
	logic: true,
	reincarnate: true,
};

function addHook<
	Hook extends CookieKiln.Hook | InitHook,
	Context extends BaseModContext,
>(
	modHooks: CookieKiln.RuntimeHooks,
	hook: Hook,
	handler: Hook extends VoidHook
		? CookieKiln.HandlerFor<Hook, Context>
		: CookieKiln.InitHandler<Context>,
	modContext: KilnMethods & Context,
) {
	if ("init" === hook) {
		return;
	}
	const nonInitHook: CookieKiln.Hook = hook;
	const boundHandler = handler.bind(modContext);
	if (undefined === modHooks[nonInitHook]) {
		modHooks[nonInitHook] = [boundHandler];
	} else {
		modHooks[nonInitHook]!.push(handler);
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
				addHook(
					modHooks,
					hook,
					handler,
					modContext as KilnMethods & Context,
				);
			} else {
				console.warn(`[${name}]: Unknown hook name ${hook}!`);
			}
			return setupContext;
		},
	};
	mod(setupContext);
	const modHookEntries = Object.entries(modHooks) as [
		CookieKiln.Hook | CookieKiln.InitHook,
		CookieKiln.BoundHandler[] | undefined,
	][];
	modHooks.init?.forEach((handler) => handler.call(modContext, this));
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
				addHook(this.kilnData.hooks, hook, handler, modContext);
				handler.call(modContext, this);
			});
		} else {
			handlers.forEach((handler) =>
				addHook(this.kilnData.hooks, hook, handler, modContext),
			);
		}
	});
}

function registerKilnVoidHook(hook: CookieKiln.VoidHook, Game: Game): void {
	Game.registerHook(hook, () => {
		Game.kilnData.hooks[hook]?.forEach((handler) => handler(Game));
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

	addStyles();
	Game.kilnData.elements.overlay = initOverlay(getGameElement());
}
