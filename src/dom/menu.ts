import { DomObserver } from "./observer";
import { createElement } from "../../kiln-helpers";

function insertMenuTitleElement(subsection: HTMLDivElement): HTMLDivElement {
	let settingsTitle: HTMLDivElement | null = null;
	let insertAfter: Element | null = null;
	let lastElement: HTMLDivElement | null = null;
	for (const divElement of subsection.querySelectorAll("div")) {
		if (divElement.parentElement !== subsection) {
			continue;
		}
		if (divElement.classList.contains("title")) {
			const titleText = divElement.textContent?.toLowerCase();
			if ("settings" === titleText) {
				settingsTitle = divElement;
			} else if (null !== settingsTitle) {
				insertAfter = lastElement;
			}
			lastElement = divElement;
		} else if (divElement.classList.contains("listing")) {
			lastElement = divElement;
		}
	}
	insertAfter = insertAfter ?? lastElement;
	const menuTitleElement = createElement("div");
	menuTitleElement.classList.add("title");
	menuTitleElement.innerText = "Mods";
	if (insertAfter) {
		insertAfter.after(menuTitleElement);
	} else {
		subsection.appendChild(menuTitleElement);
	}
	return menuTitleElement;
}

function renderModListItem(
	name: string,
	_context?: CookieKiln.ModContext,
): HTMLLIElement {
	const itemElement = createElement("li");

	const modNameElement = createElement("span");
	modNameElement.innerText = name;

	const optionsButtonElement = createElement("a");
	optionsButtonElement.classList.add("option");
	optionsButtonElement.innerText = "Options";

	const removeButtonElement = createElement("a");
	removeButtonElement.classList.add("option");
	removeButtonElement.classList.add("warning");
	removeButtonElement.classList.add("close");
	removeButtonElement.innerText = "x";

	itemElement.appendChild(modNameElement);
	itemElement.appendChild(optionsButtonElement);
	itemElement.appendChild(removeButtonElement);
	return itemElement;
}

function renderModList(_mods: CookieKiln.Mods): HTMLDivElement {
	const modListContainer = createElement("div");
	modListContainer.classList.add("listing");
	const modListElement = createElement("ul");
	modListElement.classList.add("kiln-mod-list");
	modListContainer.appendChild(modListElement);
	modListElement.appendChild(renderModListItem("Test Mod 1"));
	modListElement.appendChild(renderModListItem("Test Mod 2"));
	modListElement.appendChild(renderModListItem("Test Mod 3"));
	return modListContainer;
}

function renderModMenu(
	subsection: HTMLDivElement,
	mods: CookieKiln.Mods,
): void {
	insertMenuTitleElement(subsection).after(renderModList(mods));
}

export function createModMenu(
	domObserver: DomObserver,
	mods: CookieKiln.Mods,
): void {
	domObserver.registerHook("#menu", (element, mutations) => {
		mutations
			.filter((mutation) => "childList" === mutation.type)
			.forEach((mutation) => {
				let sectionName: string | null = null;
				const subsections: HTMLDivElement[] = [];
				mutation.addedNodes.forEach((node) => {
					if (node instanceof HTMLDivElement) {
						if (
							node.classList.contains("section") &&
							node.TEXT_NODE === node.firstChild?.nodeType
						) {
							sectionName =
								node.firstChild.textContent?.toLowerCase() ??
								null;
						} else if (
							node.classList.contains("subsection") &&
							node.firstChild instanceof HTMLDivElement &&
							node.firstChild.classList.contains("title")
						) {
							subsections.push(node);
						}
					}
				});
				if ("options" === sectionName && subsections.length > 0) {
					for (const subsection of subsections) {
						const subsectionName =
							subsection.firstChild?.firstChild?.textContent?.toLowerCase();
						if ("general" === subsectionName) {
							renderModMenu(subsection, mods);
							break;
						}
					}
				}
			});
		return element;
	});
}
