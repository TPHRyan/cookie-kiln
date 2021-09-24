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
			.and("have.property", "drawT")
			.and("be.greaterThan", 0);
		return cy.window();
	},
);
