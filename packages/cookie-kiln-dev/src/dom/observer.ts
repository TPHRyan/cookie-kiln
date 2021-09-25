import { getGameElement } from "cookie-kiln";

type MutationHandler = (
	element: HTMLElement,
	mutations: MutationRecord[],
) => HTMLElement;

export interface DomObserver {
	registerHook(selector: string, handler: MutationHandler): void;

	unregisterHook(selector: string, handler: MutationHandler): void;

	reset(): void;
}

export function createDomObserver(): DomObserver {
	console.debug("Setting up DOM observation for efficient hooks.");
	const selectorMap = new Map<string, HTMLElement>();
	const selectorHookMap = new WeakMap<HTMLElement, MutationHandler[]>();
	const gameElement = getGameElement();

	const nativeObserver = new MutationObserver((mutations) => {
		if (mutations.length < 1) {
			return;
		}
		const target = mutations[0].target;
		if (target instanceof HTMLElement && selectorHookMap.has(target)) {
			(selectorHookMap.get(target) ?? []).reduce(
				(element: HTMLElement, handler: MutationHandler) =>
					handler(element, mutations),
				target,
			);
		}
	});

	function fetchElement(selector: string): HTMLElement | null {
		const existingElement = selectorMap.get(selector);
		if (existingElement) {
			return existingElement;
		}
		const element = gameElement.querySelector(selector);
		if (element instanceof HTMLElement) {
			selectorMap.set(selector, element);
			nativeObserver.observe(element, {
				childList: true,
			});
			return element;
		}
		return null;
	}
	return {
		registerHook(selector: string, handler: MutationHandler): void {
			const selectorElement = fetchElement(selector);
			if (null !== selectorElement) {
				const selectorHooks =
					selectorHookMap.get(selectorElement) ?? [];
				selectorHooks.push(handler);
				selectorHookMap.set(selectorElement, selectorHooks);
			} else {
				console.warn(
					`Tried to observe element ${selector}, which could not be found.`,
				);
			}
		},
		unregisterHook(selector: string, handler: MutationHandler): void {
			const selectorElement = selectorMap.get(selector);
			if (selectorElement instanceof HTMLElement) {
				const selectorHooks =
					selectorHookMap.get(selectorElement) ?? [];
				const handlerIndex = selectorHooks.indexOf(handler);
				if (handlerIndex > -1) {
					selectorHooks.splice(handlerIndex, 1);
					if (selectorHooks.length > 0) {
						selectorHookMap.set(selectorElement, selectorHooks);
					} else {
						selectorHookMap.delete(selectorElement);
						selectorMap.delete(selector);
					}
				}
			}
		},
		reset(): void {
			selectorMap.forEach((element, selector) => {
				selectorHookMap.delete(element);
				selectorMap.delete(selector);
			});
		},
	};
}
