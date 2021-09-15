declare interface Window {
	onCookieKilnLoad?: Promise<Game>;
}

declare namespace CookieKiln {
	interface BaseModContext extends Record<string, unknown> {}

	type InitHandler<Context extends BaseModContext = BaseModContext> = (
		this: Partial<Context>,
		game: Game,
	) => void;

	interface HookFunction<Context extends BaseModContext = BaseModContext> {
		(hook: "init", handler: InitHandler<Context>): SetupContext<Context>;
	}

	type _HooksLookup<Context extends BaseModContext = BaseModContext> = {
		[key: string]: Function;
		init: InitHandler<Context>;
	};
	type Hook = Parameters<HookFunction>[0];
	type HandlerFor<
		K extends Hook,
		Context extends BaseModContext = BaseModContext,
	> = _HooksLookup<Context>[K];

	interface SetupContext<Context extends BaseModContext = BaseModContext> {
		hook: HookFunction<Context>;
	}

	interface Mod<Context extends BaseModContext = BaseModContext> {
		(ctx: SetupContext<Context>): SetupContext<Context> | void;
	}

	interface RuntimeHooks<Context extends BaseModContext = BaseModContext> {
		[key: string]: Function[] | undefined;
		init?: _HooksLookup<Context>["init"][];
	}
}

interface Game {
	kilnHooks: CookieKiln.RuntimeHooks;

	registerKilnMod<
		Context extends CookieKiln.BaseModContext = CookieKiln.BaseModContext,
	>(
		name: string,
		mod: CookieKiln.Mod<Context>,
	): void;
}
