/// <reference types="cypress" />

declare namespace Cypress {
	interface Chainer<Subject> {
		(chainer: "have.kilnMod", name: string): Chainable<Subject>;
		(chainer: "not.have.kilnMod", name: string): Chainable<Subject>;
	}
}

declare namespace Chai {
	interface Assertion {
		kilnMod: KilnMod;
	}

	interface KilnMod {
		(name: string, message?: string): Assertion;
	}
}
