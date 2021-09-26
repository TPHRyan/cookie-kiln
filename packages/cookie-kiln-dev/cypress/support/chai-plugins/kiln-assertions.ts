const Assertion = chai.Assertion;

export function chaiKilnAssertions(
	_chai: Chai.ChaiStatic,
	utils: Chai.ChaiUtils,
) {
	function assertKilnModPresent(name: string): void {
		new Assertion(this._obj).to.have.property("kilnData");
		new Assertion(this._obj.kilnData).to.have.property("mods");
		new Assertion(this._obj.kilnData.mods).to.have.property(name);
	}

	utils.addMethod(Assertion.prototype, "kilnMod", assertKilnModPresent);
}
