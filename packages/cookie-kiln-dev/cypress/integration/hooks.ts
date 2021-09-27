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
			ctx.hook("cookiesPerClick", () => cookiesPerClick);
		const cpcModName = "cookiesPerClickMod";

		cy.cookieClicker();
		cy.get("@Game").then((Game) => {
			Game.registerKilnMod(cpcModName, cpcMod);
			cy.wrap(Game).should("have.kilnMod", cpcModName);
			cy.get("#bigCookie").click();
			cy.get("#cookies").contains(`${formattedCookiesPerClick} cookies`);
		});
	});
	it("Can register a working 'cps' hook", () => {
		const cpsRate = 442;
		const createMod: CookieKiln.Mod = (ctx) =>
			ctx.hook("cps", () => cpsRate);
		const cpsModName = "cpsMod";

		cy.cookieClicker();
		cy.get("@Game").then((Game) => {
			Game.registerKilnMod(cpsModName, createMod);
			cy.wrap(Game).should("have.kilnMod", cpsModName);
			cy.get("#cookies").contains(`per second : ${cpsRate}`);
		});
	});
	it("Can register a working 'create' hook", () => {
		const initializedMessage = "The game has been initialized.";
		const createMod: CookieKiln.Mod = (ctx) =>
			ctx.hook("create", (Game) =>
				Game.Notify("Created", initializedMessage),
			);
		const createModName = "createMod";

		cy.cookieClicker();
		cy.get("@Game").then((Game) => {
			Game.registerKilnMod(createModName, createMod);
			cy.wrap(Game).should("have.kilnMod", createModName);
			cy.contains(initializedMessage);
		});
	});
	it("Can register a working 'draw' hook", () => {
		const drawnMessage = "The game has been drawn!";
		const drawMod: CookieKiln.Mod = (ctx) =>
			ctx.hook("draw", (Game) => Game.Notify("Draw", drawnMessage));
		const drawModName = "drawMod";

		cy.cookieClicker();
		cy.get("@Game").then((Game) => {
			Game.registerKilnMod(drawModName, drawMod);
			cy.wrap(Game).should("have.kilnMod", drawModName);
			cy.contains(drawnMessage);
		});
	});
	it("Can register a working 'logic' hook", () => {
		const logicMessage = "Game logic has been run.";
		const logicMod: CookieKiln.Mod = (ctx) =>
			ctx.hook("logic", (Game) => Game.Notify("Logic", logicMessage));
		const logicModName = "logicMod";

		cy.cookieClicker();
		cy.get("@Game").then((Game) => {
			Game.registerKilnMod(logicModName, logicMod);
			cy.wrap(Game).should("have.kilnMod", logicModName);
			cy.contains(logicMessage);
		});
	});
	it("Can register a working 'reincarnate' hook", () => {
		const reincarnateMessage = "You have reincarnated!";
		const reincarnateMod: CookieKiln.Mod = (ctx) =>
			ctx.hook("reincarnate", (Game) =>
				Game.Notify("Reincarnated", reincarnateMessage),
			);
		const reincarnateModName = "reincarnateMod";

		cy.cookieClicker();
		cy.get("@Game").then((Game) => {
			Game.registerKilnMod(reincarnateModName, reincarnateMod);
			cy.wrap(Game).should("have.kilnMod", reincarnateModName);
			Game.Ascend(true);
			Game.AscendTimer = Game.AscendDuration;
			cy.contains("Reincarnate", { matchCase: false })
				.should("be.visible")
				.then(() => {
					Game.Reincarnate(true);
					Game.ReincarnateTimer = Game.ReincarnateDuration;
					cy.contains(reincarnateMessage);
				});
		});
	});
	it("Can register a working 'reset' hook", () => {
		const resetMessage = "The game has been reset!";
		const resetMod: CookieKiln.Mod = (ctx) =>
			ctx.hook("reset", (hardReset, Game) =>
				Game.Notify("Reset", resetMessage),
			);
		const resetModName = "resetMod";

		cy.cookieClicker();
		cy.get("@Game").then((Game) => {
			Game.registerKilnMod(resetModName, resetMod);
			cy.wrap(Game).should("have.kilnMod", resetModName);
			Game.HardReset(2);
			cy.contains(resetMessage);
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
