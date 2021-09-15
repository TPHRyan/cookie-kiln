type BaseModContext = CookieKiln.BaseModContext;

const allowedHooks: { [K in CookieKiln.Hook]: boolean } = {
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

function registerKilnMod<Context extends BaseModContext = BaseModContext>(
	this: Game,
	name: string,
	mod: CookieKiln.Mod<Context>,
) {
	const modHooks: CookieKiln.RuntimeHooks<Context> = {};
	const setupContext: CookieKiln.SetupContext<Context> = {
		hook: (hook, handler) => {
			if (allowedHooks[hook]) {
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
		if (!allowedHooks[hook] || !handlers) {
			return;
		}
		handlers.forEach((handler) =>
			addHook(
				this.kilnHooks,
				hook,
				handler as CookieKiln.HandlerFor<typeof hook, Context>,
			),
		);
	});
	const modContext: Partial<Context> = {};
	modHooks.init?.forEach((handler) => handler.call(modContext, this));
}

export function installKiln(Game: Game): void {
	Game.kilnHooks = {};
	Game.registerKilnMod = registerKilnMod;
}
