describe("Kiln Hooks", () => {
	it("Can register a working 'ticker' hook", () => {
		const tickerText = "Hello, world!";
		const tickerMod: CookieKiln.Mod = (ctx) =>
			ctx.hook("ticker", (): string[] => [tickerText]);

		cy.cookieClicker();
		cy.freezeRandom(0.999).as("RandomStub");
		cy.window().should("have.property", "Game").as("Game");
		cy.get<Game>("@Game").then((Game: Game) => {
			Game.registerKilnMod("tickerMod", tickerMod);
			cy.get<Game>("@Game")
				.should("have.property", "kilnData")
				.and("have.property", "mods")
				.and("have.property", "tickerMod");
			Game.getNewTicker();
			cy.get("#commentsText").contains(tickerText);
		});
		cy.unfreezeRandom();
	});
});
