import styles from "./style.css";
import { createElement, createTextNode, getDocument } from "../kiln-helpers";
import KilnMethods = CookieKiln.KilnMethods;

type BaseModContext = CookieKiln.BaseModContext;

const OVERLAY_ID = "kiln-overlay";

const ALLOWED_HOOKS: { [K in CookieKiln.Hook]: boolean } = {
	init: true,
};

function addHook<
	Hook extends CookieKiln.Hook,
	Context extends BaseModContext = BaseModContext,
>(
	modHooks: CookieKiln.RuntimeHooks<Context>,
	hook: Hook,
	handler: CookieKiln.HandlerFor<Hook, Context>,
) {
	if (undefined === modHooks[hook]) {
		modHooks[hook] = [handler];
	} else {
		modHooks[hook]!.push(handler);
	}
}

function createModContext<Context extends BaseModContext>(
	Game: Game,
): KilnMethods & Partial<Context> {
	const methods: KilnMethods = {
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

function registerKilnMod<Context extends BaseModContext = BaseModContext>(
	this: Game,
	name: string,
	mod: CookieKiln.Mod<Context>,
) {
	const modHooks: CookieKiln.RuntimeHooks<Context> = {};
	const setupContext: CookieKiln.SetupContext<Context> = {
		hook: (hook, handler) => {
			if (ALLOWED_HOOKS[hook]) {
				addHook(modHooks, hook, handler);
			} else {
				console.warn(`[${name}]: Unknown hook name ${hook}!`);
			}
			return setupContext;
		},
	};
	mod(setupContext);
	const modHookEntries = Object.entries(modHooks) as [
		CookieKiln.Hook,
		Function[] | undefined,
	][];
	modHookEntries.forEach(([hook, handlers]) => {
		if (!ALLOWED_HOOKS[hook] || !handlers) {
			return;
		}
		handlers.forEach((handler) =>
			addHook(
				this.kilnData.hooks,
				hook,
				handler as CookieKiln.HandlerFor<typeof hook, Context>,
			),
		);
	});
	modHooks.init?.forEach((handler) =>
		handler.call(createModContext(this), this),
	);
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

	addStyles();
	Game.kilnData.elements.overlay = initOverlay(getGameElement());
}
