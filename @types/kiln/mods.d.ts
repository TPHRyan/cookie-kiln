/// <reference path="./common.d.ts" />
/// <reference path="./hooks.d.ts" />
/// <reference path="./methods.d.ts" />

declare namespace CookieKiln {
	interface SetupContext<Context extends BaseModContext = BaseModContext> {
		hook: HookFunction<Context>;
	}

	interface Mod<Context extends BaseModContext = BaseModContext> {
		(ctx: SetupContext<Context>): SetupContext<Context> | void;
	}

	interface ModSetupData<Context extends BaseModContext> {
		name: string;
		context: WithKilnMethods<Partial<Context>>;
		hooks: SetupHooks<Context>;
	}
	interface ModData {
		context: WithKilnMethods<BaseModContext>;
		hooks: RuntimeHooks;
	}
	type Mods = Record<string, ModData>;
}
