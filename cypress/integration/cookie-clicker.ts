describe("Cookie Clicker", () => {
	it("Can load successfully", () => {
		cy.cookieClicker();
	});

	it("Can click cookies", () => {
		cy.cookieClicker();
		cy.get("#bigCookie").click();
		cy.contains("1 cookie");
	});
});
