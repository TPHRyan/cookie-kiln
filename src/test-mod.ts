import { defineMod } from "../kiln-helpers";

export const testMod = defineMod((ctx) =>
	ctx.hook("ticker", (Game) => [
		`You have registered ${
			Object.keys(Game.kilnData.hooks).length
		} kinds of hooks!`,
	]),
);

export default testMod;
