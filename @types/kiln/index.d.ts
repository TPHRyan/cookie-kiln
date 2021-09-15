declare interface Window {
	onCookieKilnLoad?: Promise<Game>;
}

declare namespace CookieKiln {
	interface KilnMethods {
		addOverlayElement(element: HTMLElement): void;
		addStyles(css: string): void;
	}

	interface BaseModContext extends Record<string, unknown> {}

	type InitHook = "init";
	type VoidHook =
		| "check"
		| "click"
		| "create"
		| "draw"
		| "logic"
		| "reincarnate";
	type Hook = VoidHook;

	type BoundHandler = (game: Game) => void;

	type InitHandler<Context extends BaseModContext> = (
		this: KilnMethods & Partial<Context>,
		game: Game,
	) => void;

	type VoidHandler<Context extends BaseModContext> = (
		this: KilnMethods & Context,
		game: Game,
	) => void;

	interface HookFunction<Context extends BaseModContext = BaseModContext> {
		(hook: InitHook, handler: InitHandler<Context>): SetupContext<Context>;
		(hook: VoidHook, handler: VoidHandler<Context>): SetupContext<Context>;
	}

	type _HooksLookup<Context extends BaseModContext = BaseModContext> = {
		check: VoidHandler<Context>;
		click: VoidHandler<Context>;
		create: VoidHandler<Context>;
		draw: VoidHandler<Context>;
		logic: VoidHandler<Context>;
		reincarnate: VoidHandler<Context>;
	};
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

	type RuntimeHooks<Context extends BaseModContext = BaseModContext> = {
		[K in Hook]?: BoundHandler[];
	};

	type SetupHooks<Context extends BaseModContext = BaseModContext> = {
		[K in Hook | InitHook]?: K extends InitHook
			? InitHandler<Context>[]
			: VoidHandler<Context>[];
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
