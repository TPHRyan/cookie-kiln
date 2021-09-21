import BaseModContext = CookieKiln.BaseModContext;
import CustomHook = CookieKiln.CustomHook;
import HandlerFor = CookieKiln.HandlerFor;
import InitHandler = CookieKiln.InitHandler;
import VanillaHandlerFor = CookieKiln.VanillaHandlerFor;
import VanillaHook = CookieKiln.VanillaHook;
import WithKilnMethods = CookieKiln.WithKilnMethods;

export const ALLOWED_HOOKS: { [key: string]: boolean | undefined } & {
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

export function isValidHook(
	hookName: string,
): hookName is CustomHook | VanillaHook {
	return true === ALLOWED_HOOKS[hookName];
}

export function addHookIfVanilla<Hook extends CustomHook | VanillaHook>(
	modHooks: CookieKiln.RuntimeHooks,
	hook: Hook,
	handler: Hook extends VanillaHook
		? VanillaHandlerFor<Hook>
		: HandlerFor<Hook>,
	modContext: WithKilnMethods<BaseModContext>,
): void {
	if ("init" === hook) {
		return;
	}
	const vanillaHook: VanillaHook = hook;
	addVanillaHook(
		vanillaHook,
		handler as VanillaHandlerFor<typeof vanillaHook>,
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
	modHooks: CookieKiln.RuntimeHooks,
	modContext: WithKilnMethods<Context>,
): void {
	const boundHandler = handler.bind(modContext) as CookieKiln.BoundHandler<
		VanillaHandlerFor<Hook, Context>
	>;
	if (undefined === modHooks[vanillaHook]) {
		modHooks[vanillaHook] = [boundHandler] as CookieKiln.RuntimeHooks[Hook];
	} else {
		(modHooks[vanillaHook] as CookieKiln.BoundHandler<
			VanillaHandlerFor<Hook, Context>
		>[])!.push(boundHandler);
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

function hasCreateHookHappened(Game: Game): boolean {
	// The game sets this value right before calling the 'create' hook
	return Game.vanilla === 0;
}

type HookAndHandlers<Context extends BaseModContext = BaseModContext> = {
	hook: CookieKiln.VanillaHook;
	handlers?: CookieKiln.VanillaHandler<Context>[];
};

function generateValidRuntimeHooks<
	Context extends BaseModContext = BaseModContext,
>(
	{ hook, handlers }: HookAndHandlers<Context>,
	setupData: CookieKiln.ModSetupData<Context>,
	Game: Game,
	doCreate: boolean = false,
): CookieKiln.RuntimeHooks {
	const runtimeHooks: CookieKiln.RuntimeHooks = {};
	if (!isValidHook(hook) || !handlers) {
		return {};
	}
	const modContext = setupData.context;
	if ("create" === hook && doCreate) {
		console.debug(
			`Running "create" hooks for mod \"${setupData.name}\" as create hook has already been called.`,
		);
		handlers.forEach((handler) => {
			const createHandler = handler as CookieKiln.BoundHandlerFor<
				"create",
				Context
			>;
			addHookIfVanilla(runtimeHooks, hook, createHandler, modContext);
			createHandler.call(modContext, Game);
		});
	} else {
		handlers.forEach((handler) =>
			addHookIfVanilla(runtimeHooks, hook, handler, modContext),
		);
	}
	return runtimeHooks;
}

export function processHooks<Context extends BaseModContext = BaseModContext>(
	setupData: CookieKiln.ModSetupData<Context>,
	Game: Game,
): CookieKiln.RuntimeHooks {
	setupData.hooks.init?.forEach((handler: InitHandler<Context>) =>
		handler.call(setupData.context, Game),
	);
	const modHookEntries = Object.entries(setupData.hooks) as [
		CookieKiln.VanillaHook,
		CookieKiln.VanillaHandler<Context>[] | undefined,
	][];
	return modHookEntries.reduce(
		(currentHooks: CookieKiln.RuntimeHooks, [hook, handlers]) => ({
			...currentHooks,
			...generateValidRuntimeHooks(
				{ hook, handlers },
				setupData,
				Game,
				hasCreateHookHappened(Game),
			),
		}),
		{},
	);
}
