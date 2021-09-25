// ***********************************************
// For examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add(
	"cookieClicker",
	(): Cypress.Chainable<Cypress.AUTWindow> => {
		cy.visit(Cypress.env("COOKIE_CLICKER_SERVER"));
		cy.get("div#loader").should("not.exist");
		cy.window()
			.should("have.property", "Game")
			.as("Game")
			.and("have.property", "drawT")
			.and("be.greaterThan", 0);
		cy.get("@Game").should("have.property", "kilnData");
		return cy.window();
	},
);

Cypress.Commands.add(
	"freezeRandom",
	(value: number): Cypress.Chainable<Cypress.Agent<sinon.SinonStub>> => {
		cy.window().then((win) => {
			const stub = cy.stub(win.Math, "random").as("Math.random");
			stub.callsFake(() => value);
		});
		return cy.get<Cypress.Agent<sinon.SinonStub>>("@Math.random");
	},
);

Cypress.Commands.add("unfreezeRandom", (): Cypress.Chainable<null> => {
	cy.get<Cypress.Agent<sinon.SinonStub>>("@Math.random").then((randomStub) =>
		randomStub.restore(),
	);
	return cy.end();
});
