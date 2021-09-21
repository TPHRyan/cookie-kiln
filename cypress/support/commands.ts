// ***********************************************
// For examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

Cypress.Commands.add(
	"cookieClicker",
	(): Cypress.Chainable<Cypress.AUTWindow> => {
		// TODO: Add simple local server to run a local copy of CC
		//    with NO modified code, to avoid changes and using production server
		cy.visit("https://orteil.dashnet.org/cookieclicker/");
		cy.contains("Got it!").click();
		return cy.window();
	},
);
