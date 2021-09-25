/// <reference types="cypress" />

declare namespace Cypress {
	interface Chainable<Subject> {
		cookieClicker(): Chainable<AUTWindow>;
		freezeRandom(value: number): Agent<sinon.SinonStub>;
		unfreezeRandom(): Chainable<null>;
	}
}
