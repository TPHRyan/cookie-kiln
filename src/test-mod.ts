import { createElement, createTextNode, defineMod } from "../kiln-helpers";

export const testMod = defineMod((ctx) =>
	ctx
		.hook("init", function () {
			const testOverlayElement = createElement("div");
			testOverlayElement.setAttribute("id", "overlay-test");
			testOverlayElement.appendChild(createTextNode("Hello, world!"));
			this.addOverlayElement(testOverlayElement);
			this.addStyles(`
			#overlay-test {
				margin-left: 5px;
				margin-top: 5px;
			}
		`);
		})
		.hook("ticker", (Game) => [
			`You have registered ${
				Object.keys(Game.kilnData.hooks).length
			} kinds of hooks!`,
		]),
);

export default testMod;
