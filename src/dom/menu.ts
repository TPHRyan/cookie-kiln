import { DomObserver } from "./observer";
import { createElement } from "../../kiln-helpers";

function renderModMenu(
	modMenu: CookieKiln.ModMenu,
	subsection: HTMLDivElement,
): void {
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
	menuTitleElement.innerText = modMenu.title;
	if (insertAfter) {
		insertAfter.after(menuTitleElement);
	} else {
		subsection.appendChild(menuTitleElement);
	}
	let lastMenuElement: HTMLElement = menuTitleElement;
	modMenu.entries.forEach((entry) => {
		const itemElement = createElement("div");
		itemElement.classList.add("listing");
		switch (entry.type) {
			case "modList":
				const modLabelElement = createElement("label");
				modLabelElement.innerText = "<MODS>";
				itemElement.appendChild(modLabelElement);
				break;
			case "text":
				const textFrame = createElement("div");
				textFrame.classList.add("framed");
				textFrame.style.width = "fit-content";
				textFrame.innerText = entry.value;
				itemElement.appendChild(textFrame);
				break;
			default:
				return;
		}
		lastMenuElement.after(itemElement);
		lastMenuElement = itemElement;
	});
}

export function createModMenu(domObserver: DomObserver): CookieKiln.ModMenu {
	const modMenu: CookieKiln.ModMenu = {
		title: "Mods",
		entries: [
			{ type: "modList" },
			{ type: "text", value: "Hello, world!" },
		],
	};
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
							renderModMenu(modMenu, subsection);
							break;
						}
					}
				}
			});
		return element;
	});
	return modMenu;
}
