describe("Cookie Clicker", () => {
	it("Can load successfully", () => {
		cy.cookieClicker();
	});

	it("Can click cookies", () => {
		cy.cookieClicker();
		cy.get("#bigCookie").should("be.visible").click();
		cy.contains("1 cookie");
	});
});
