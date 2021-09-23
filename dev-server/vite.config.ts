import { defineConfig, ViteDevServer } from "vite";

import { serveMissingAssetsMiddleware } from "./assets.serve";
import { prepareIndexHtml } from "./prepare-index";

export default defineConfig({
	plugins: [
		{
			name: "kiln-dev-server",
			async buildStart(): Promise<void> {
				await prepareIndexHtml();
			},
			configureServer(server: ViteDevServer): () => void {
				return () =>
					server.middlewares.use(serveMissingAssetsMiddleware);
			},
		},
	],
});
