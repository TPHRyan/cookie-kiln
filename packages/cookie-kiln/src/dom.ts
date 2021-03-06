export function getDocument(): Document {
	const doc = document ?? window.document;
	if (!doc) {
		throw new Error(
			"Element operations are only supported using window.document at this time.",
		);
	}
	return doc;
}

export function getGameElement(): HTMLDivElement {
	const gameElement = document.querySelector<HTMLDivElement>("#game");
	if (null !== gameElement) {
		return gameElement;
	}
	throw new Error('No element found with id "game"!');
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
	tagName: K,
	options?: ElementCreationOptions,
): HTMLElementTagNameMap[K] {
	return getDocument().createElement(tagName, options);
}

export function createTextNode(data: string): Text {
	return getDocument().createTextNode(data);
}
