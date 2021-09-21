import BaseModContext = CookieKiln.BaseModContext;
import CustomHook = CookieKiln.CustomHook;
import HandlerFor = CookieKiln.HandlerFor;
import VanillaHook = CookieKiln.VanillaHook;
import WithKilnMethods = CookieKiln.WithKilnMethods;

import { isValidHook, processHooks } from "./hooks";
import { addStyles } from "./dom";

function createModContext<Context extends BaseModContext>(
	Game: Game,
): WithKilnMethods<Partial<Context>> {
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

function addHookToSetupData<
	Hook extends CookieKiln.CustomHook | CookieKiln.VanillaHook,
	Context extends BaseModContext,
>(
	hook: Hook,
	handler: HandlerFor<Hook, Context>,
	setupData: CookieKiln.ModSetupData<Context>,
): void {
	if (!isValidHook(hook)) {
		console.warn(`[${setupData.name}]: Unknown hook name ${hook}!`);
		return;
	}
	const modHooks = setupData.hooks;
	if (undefined === modHooks[hook]) {
		modHooks[hook] = [handler] as CookieKiln.SetupHooks<Context>[Hook];
	} else {
		modHooks[hook]!.push(
			handler as HandlerFor<CustomHook & VanillaHook, Context>,
		);
	}
}

function createSetupContext<Context extends BaseModContext>(
	setupData: CookieKiln.ModSetupData<Context>,
): CookieKiln.SetupContext<Context> {
	const setupContext: CookieKiln.SetupContext<Context> = {
		hook: (hook, handler) => {
			addHookToSetupData(hook, handler, setupData);
			return setupContext;
		},
	};
	return setupContext;
}

export function registerKilnMod<
	Context extends BaseModContext = BaseModContext,
>(this: Game, name: string, mod: CookieKiln.Mod<Context>) {
	const setupData: CookieKiln.ModSetupData<Context> = {
		name,
		context: createModContext<Context>(this),
		hooks: {},
	};
	mod(createSetupContext(setupData));
	const runtimeHooks = processHooks(setupData, this);
	this.kilnData.hooks = { ...this.kilnData.hooks, ...runtimeHooks };
	this.kilnData.mods[name] = {
		context: setupData.context,
		hooks: runtimeHooks,
	};
	console.debug(`[Kiln] Registered mod "${name}".`);
}
