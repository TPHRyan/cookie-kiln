describe("Kiln Hooks", () => {
	it("Can register a working 'check' hook", () => {
		const updatedCookieCount = 915781;
		const formattedCookieCount = new Intl.NumberFormat().format(
			updatedCookieCount,
		);
		const checkMod: CookieKiln.Mod = (ctx) =>
			ctx.hook("check", (Game) => {
				Game.cookies = updatedCookieCount;
			});
		const checkModName = "checkMod";

		cy.cookieClicker();
		cy.get("@Game").then((Game: Game) => {
			Game.registerKilnMod(checkModName, checkMod);
			cy.wrap(Game).should("have.kilnMod", checkModName);
			const divisor = Game.fps * 5;
			const nextCheckT = Game.T * (Math.ceil(Game.T / divisor) * divisor);
			Game.T = nextCheckT - 100;
			cy.wrap(Game)
				.should("have.property", "T")
				.and("be.gte", nextCheckT);
			cy.get("#cookies").contains(`${formattedCookieCount} cookies`);
		});
	});
	it("Can register a working 'click' hook", () => {
		const notifyMessage = "The cookie was clicked.";
		const clickMod: CookieKiln.Mod = (ctx) =>
			ctx.hook("click", (Game) => {
				Game.Notify("Clicked", notifyMessage);
			});
		const clickModName = "clickMod";

		cy.cookieClicker();
		cy.get("@Game").then((Game: Game) => {
			Game.registerKilnMod(clickModName, clickMod);
			cy.wrap(Game).should("have.kilnMod", clickModName);
			cy.get("#bigCookie").click();
			cy.contains(notifyMessage);
		});
	});
	it("Can register a working 'cookiesPerClick' hook", () => {
		const cookiesPerClick = 934949;
		const formattedCookiesPerClick = new Intl.NumberFormat().format(
			cookiesPerClick,
		);
		const cpcMod: CookieKiln.Mod = (ctx) =>
			ctx.hook("cookiesPerClick", () => {
				console.log("<<<cookiesPerClick>>>");
				return cookiesPerClick;
			});
		const cpcModName = "cookiesPerClickMod";

		cy.cookieClicker();
		cy.get("@Game").then((Game) => {
			Game.registerKilnMod(cpcModName, cpcMod);
			cy.wrap(Game).should("have.kilnMod", cpcModName);
			cy.get("#bigCookie").click();
			cy.get("#cookies").contains(`${formattedCookiesPerClick} cookies`);
		});
	});
	it("Can register a working 'ticker' hook", () => {
		const tickerText = "Hello, world!";
		const tickerMod: CookieKiln.Mod = (ctx) =>
			ctx.hook("ticker", (): string[] => [tickerText]);
		const tickerModName = "tickerMod";

		cy.cookieClicker().freezeRandom(0.999);
		cy.get("@Game").then((Game: Game) => {
			Game.registerKilnMod(tickerModName, tickerMod);
			cy.wrap(Game).should("have.kilnMod", tickerModName);
			Game.getNewTicker();
			cy.get("#commentsText").contains(tickerText);
		});
		cy.unfreezeRandom();
	});
});
