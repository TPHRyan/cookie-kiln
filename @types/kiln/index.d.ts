declare interface Window {
	onCookieKilnLoad?: Promise<Game>;
}

declare namespace CookieKiln {
	interface KilnMethods {
		addOverlayElement(element: HTMLElement): void;
		addStyles(css: string): void;
	}

	interface BaseModContext extends Record<string, unknown> {}
	type WithKilnMethods<Context extends BaseModContext> = KilnMethods &
		Context;

	type VoidHandler<Context extends BaseModContext> = (
		this: WithKilnMethods<Context>,
		game: Game,
	) => void;

	type _VanillaModHooks<Context extends BaseModContext = BaseModContext> = {
		check: VoidHandler<Context>;
		click: VoidHandler<Context>;
		cookiesPerClick: (
			this: WithKilnMethods<Context>,
			cookiesPerClick: number,
			game: Game,
		) => number;
		cps: (
			this: WithKilnMethods<Context>,
			cps: number,
			game: Game,
		) => number;
		create: VoidHandler<Context>;
		draw: VoidHandler<Context>;
		logic: VoidHandler<Context>;
		reincarnate: VoidHandler<Context>;
		reset: (
			this: WithKilnMethods<Context>,
			hardReset: boolean,
			game: Game,
		) => void;
		ticker: (this: WithKilnMethods<Context>, game: Game) => string[];
	};

	type VanillaHook = {
		[K in keyof _VanillaModHooks]: K extends keyof _VanillaModHooks
			? K
			: never;
	}[keyof _VanillaModHooks];

	type VanillaHandler<Context extends BaseModContext> = {
		[K in keyof _VanillaModHooks]: K extends keyof _VanillaModHooks
			? _VanillaModHooks[K]
			: never;
	}[keyof _VanillaModHooks];

	type _CustomModHooks<Context extends BaseModContext = BaseModContext> = {
		init: (this: WithKilnMethods<Partial<Context>>, game: Game) => void;
	};

	type CustomHook = {
		[K in keyof _CustomModHooks]: K extends keyof _CustomModHooks
			? K
			: never;
	}[keyof _CustomModHooks];

	type CustomHandler<Context extends BaseModContext> = {
		[K in keyof _CustomModHooks]: K extends keyof _CustomModHooks
			? _CustomModHooks[K]
			: never;
	}[keyof _CustomModHooks];

	type InitHook = "init";
	type InitHandler<Context extends BaseModContext> =
		_CustomModHooks[InitHook];

	type HandlerFor<
		H extends CustomHook | VanillaHook,
		Context extends BaseModContext = BaseModContext,
	> = H extends keyof _CustomModHooks<Context>
		? _CustomModHooks<Context>[H]
		: H extends keyof _VanillaModHooks<Context>
		? _VanillaModHooks<Context>[H]
		: never;
	type VanillaHandlerFor<
		H extends VanillaHook,
		Context extends BaseModContext = BaseModContext,
	> = HandlerFor<H, Context> extends VanillaHandler<Context>
		? HandlerFor<H, Context>
		: never;

	type BoundHandler<Handler extends VanillaHandler<any>> = Handler extends (
		this: any,
		...args: infer Args
	) => infer R
		? (...args: Args) => R
		: never;

	type BoundHandlerFor<
		Hook extends VanillaHook,
		Context extends BaseModContext,
	> = Hook extends VanillaHook
		? BoundHandler<VanillaHandlerFor<Hook, Context>>
		: never;

	type HookFunction<Context extends BaseModContext> = <
		Hook extends CustomHook | VanillaHook = CustomHook | VanillaHook,
	>(
		hook: Hook,
		handler: HandlerFor<Hook, Context>,
	) => SetupContext<Context>;

	interface SetupContext<Context extends BaseModContext = BaseModContext> {
		hook: HookFunction<Context>;
	}

	interface Mod<Context extends BaseModContext = BaseModContext> {
		(ctx: SetupContext<Context>): SetupContext<Context> | void;
	}

	type RuntimeHooks<Context extends BaseModContext = BaseModContext> = {
		[K in VanillaHook]?: BoundHandler<VanillaHandlerFor<K, Context>>[];
	};

	type SetupHooks<Context extends BaseModContext = BaseModContext> = {
		[K in CustomHook | VanillaHook]?: HandlerFor<K, Context>[];
	};
}

interface Game {
	kilnData: {
		[key: string]: unknown;
		elements: Record<string, HTMLElement>;
		hooks: CookieKiln.RuntimeHooks;
	};

	registerKilnMod<
		Context extends CookieKiln.BaseModContext = CookieKiln.BaseModContext,
	>(
		name: string,
		mod: CookieKiln.Mod<Context>,
	): void;
}
