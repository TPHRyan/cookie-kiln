/// <reference types="cypress" />

declare namespace Cypress {
	interface Chainable<Subject> {
		cookieClicker(): Chainable<AUTWindow>;
	}
}
