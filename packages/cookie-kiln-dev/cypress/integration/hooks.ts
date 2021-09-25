describe("Kiln Hooks", () => {
	it("Can register a working 'check' hook", () => {
		const updatedCookieCount = 123456;
		const formattedCookieCount = new Intl.NumberFormat().format(
			updatedCookieCount,
		);
		const checkMod: CookieKiln.Mod = (ctx) =>
			ctx.hook("check", (Game) => {
				Game.cookies = updatedCookieCount;
			});

		cy.cookieClicker();
		cy.window().should("have.property", "Game").as("Game");
		cy.get<Game>("@Game").then((Game: Game) => {
			Game.registerKilnMod("checkMod", checkMod);
			cy.get<Game>("@Game")
				.should("have.property", "kilnData")
				.and("have.property", "mods")
				.and("have.property", "checkMod");
			cy.get<Game>("@Game").then((Game) => {
				const divisor = Game.fps * 5;
				const nextCheckT =
					Game.T * (Math.ceil(Game.T / divisor) * divisor);
				Game.T = nextCheckT - 100;
				cy.get("@Game")
					.should("have.property", "T")
					.and("be.gte", nextCheckT);
				cy.get("#cookies").contains(`${formattedCookieCount} cookies`);
			});
		});
	});
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
