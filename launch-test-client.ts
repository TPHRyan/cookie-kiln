import { Server } from "http";
import net from "net";

import { launchClient } from "./cypress/integration-tests";
import { runServer } from "./dev-server/server";

function isPortAvailable(port: number): Promise<boolean> {
	return new Promise<boolean>((resolve) => {
		const listenServer = net.createServer((socket) =>
			socket.end(`Checking port ${port}`),
		);
		listenServer.on("error", () => resolve(false));
		listenServer.on("listening", () => {
			listenServer.close();
			resolve(true);
		});
		listenServer.listen(port);
	});
}

const DEV_SERVER_HOSTNAME = "localhost";
const DEV_SERVER_PORT = 8777;
const DEV_SERVER_URL = `http://${DEV_SERVER_HOSTNAME}:${DEV_SERVER_PORT}`;

async function launchTestClient(): Promise<void> {
	const server: Server | null = (await isPortAvailable(DEV_SERVER_PORT))
		? runServer(DEV_SERVER_PORT, DEV_SERVER_HOSTNAME)
		: null;
	if (null === server) {
		console.log("Detected dev server already running!");
	}
	await launchClient(DEV_SERVER_URL);
	if (null !== server) {
		console.log("Stopping server...");
		return new Promise((resolve, reject) => {
			server.close((err) => (err ? reject(err) : resolve()));
		});
	}
}

launchTestClient().then();
