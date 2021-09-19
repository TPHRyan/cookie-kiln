import styles from "../style.css";
import {
	createElement,
	createTextNode,
	getDocument,
	getGameElement,
} from "../../kiln-helpers";

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

export function initOverlay(): HTMLDivElement {
	console.debug("Initializing overlay element.");
	const gameElement = getGameElement();
	let overlayElement = gameElement.querySelector<HTMLDivElement>(OVERLAY_ID);
	if (overlayElement === null) {
		overlayElement = createElement("div");
		gameElement.appendChild(overlayElement);
	}
	overlayElement.setAttribute("id", OVERLAY_ID);
	return overlayElement;
}
