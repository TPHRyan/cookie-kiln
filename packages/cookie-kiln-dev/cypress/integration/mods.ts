describe("registerKilnMod", () => {
	it("Can load an empty mod successfully", function () {
		cy.cookieClicker();
		cy.window().should("have.property", "Game").as("Game");
		cy.get("@Game")
			.should("have.property", "mods")
			.and("have.property", "CookieKiln");
		cy.get("@Game").should("have.property", "registerKilnMod");

		const emptyModName = "emptyMod";
		const emptyMod: CookieKiln.Mod = () => {};

		cy.window().then((win) => {
			const Game = win.Game;
			Game.registerKilnMod(emptyModName, emptyMod);
			cy.get("@Game")
				.should("have.property", "kilnData")
				.and("have.property", "mods")
				.and("have.property", emptyModName);
		});
	});
});
