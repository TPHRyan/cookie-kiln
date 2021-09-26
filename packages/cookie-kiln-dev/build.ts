import { OutputOptions, rollup } from "rollup";

import config from "./rollup.config";

async function build() {
	const bundle = await rollup(config);
	await bundle.write(config.output as OutputOptions);
	await bundle.close();
}

build().then();
