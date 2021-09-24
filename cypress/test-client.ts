import cypress from "cypress";

export async function launchClient(serverUrl: string): Promise<void> {
	console.log("Launching cypress client...");
	await cypress.open({
		config: {
			env: {
				COOKIE_CLICKER_SERVER: serverUrl,
			},
		},
	});
	console.log("Cypress closed.");
}
