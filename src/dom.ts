import { createElement, createTextNode, getDocument } from "../kiln-helpers";
import styles from "./style.css";

export function addPredefinedStyles(): void {
	addStyles(styles);
}

export function addStyles(css: string): void {
	const doc = getDocument();
	const headElement = doc.querySelector("head");
	const styleElement = createElement("style");
	styleElement.setAttribute("type", "text/css");
	styleElement.appendChild(createTextNode(css));
	headElement?.appendChild(styleElement);
}

const OVERLAY_ID = "kiln-overlay";

export function getGameElement(): HTMLDivElement {
	const gameElement = document.querySelector<HTMLDivElement>("#game");
	if (null !== gameElement) {
		return gameElement;
	}
	throw new Error('No element found with id "game"!');
}

export function initOverlay(gameElement: HTMLDivElement): HTMLDivElement {
	console.debug("Initializing overlay element.");
	let overlayElement = gameElement.querySelector<HTMLDivElement>(OVERLAY_ID);
	if (overlayElement === null) {
		overlayElement = createElement("div");
		gameElement.appendChild(overlayElement);
	}
	overlayElement.setAttribute("id", OVERLAY_ID);
	return overlayElement;
}
