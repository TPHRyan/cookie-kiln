export import BaseModContext = CookieKiln.BaseModContext;
import CustomHook = CookieKiln.CustomHook;
export import VanillaHook = CookieKiln.VanillaHook;
import HandlerFor = CookieKiln.HandlerFor;
import VanillaHandlerFor = CookieKiln.VanillaHandlerFor;

export const ALLOWED_HOOKS: {
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

export function addHookIfVanilla<
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

export function addHook<
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

type VoidHook = {
	[K in VanillaHook]: CookieKiln.VoidHandler<BaseModContext> extends HandlerFor<K>
		? K
		: never;
}[VanillaHook];

export function registerKilnVoidHook(hook: VoidHook, Game: Game): void {
	Game.registerHook(hook, () =>
		Game.kilnData.hooks[hook]?.forEach((handler) => handler(Game)),
	);
}

export function registerRateHook(
	hook: "cookiesPerClick" | "cps",
	Game: Game,
): void {
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

export function registerResetHook(Game: Game): void {
	Game.registerHook("reset", (hardReset): void =>
		Game.kilnData.hooks.reset?.forEach((handler) =>
			handler(hardReset, Game),
		),
	);
}

export function registerTickerHook(Game: Game): void {
	Game.registerHook("ticker", (): string[] => {
		if (undefined === Game.kilnData.hooks.ticker) {
			return [];
		}
		return Game.kilnData.hooks.ticker.flatMap((handler) => handler(Game));
	});
}
