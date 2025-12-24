export interface ComponentProps {
	id?: string;
	className?: string;
	dataset?: Record<string, string>;
	style?: Partial<CSSStyleDeclaration>;
	onclick?: (event: MouseEvent) => void;
	onfocus?: (event: FocusEvent) => void;
	onblur?: (event: FocusEvent) => void;
	onkeydown?: (event: KeyboardEvent) => void;
	onkeyup?: (event: KeyboardEvent) => void;
	onkeypress?: (event: KeyboardEvent) => void;
	// Add an index signature to allow for any other string-keyed properties.
	[key: string]: unknown;
}

export interface ViewOptions {
	id: string;
	preserveAttributes?: string[];
}

export interface BaseViewInstance {
	id: string;
	viewEl: Element | null;
	preserveAttributes: string[];
	attach: (parentEl: Element) => void;
	detach: () => void;
	hydrate: (element: Element) => void;
	render: () => Element;
	viewDidLoad?: () => void;
	destructor?: () => void;
}

export interface ReadonlySignaler<T> {
	getValue: () => T;
	wait: (callback: (instance: ReadonlySignaler<T>) => void) => void;
	unwait: (callback: (instance: ReadonlySignaler<T>) => void) => void;
}
export interface SignalerInstance<T> extends ReadonlySignaler<T> {
	setValue: (newValue: T) => void;
}

export type keydownCallback = (event: KeyboardEvent | MouseEvent) => void;
export type CreateTextNodeCallback = (text: string) => Node;
export type CreateAppendChildCallback = (parent: Node, child: Node) => void;
export type SetAttributeCallback = (
	el: Element,
	name: string,
	value: string
) => void;
export type RemoveAttributeCallback = (el: Element, name: string) => void;
export type RemoveChildCallback = (parent: Node, child: Node) => void;
export type ReplaceChildCallback = (
	parent: Node,
	newChild: Node,
	oldChild: Node
) => void;
export type SetStylesCallback = (
	el: Element,
	styles: Record<string, string | number>
) => void;
export type SetDataCallback = (
	el: Element,
	dataset: Record<string, string>
) => void;
export type SetAriaCallback = (
	el: Element,
	aria: Record<string, string | number | boolean | undefined | null>
) => void;

export interface Platform {
	isBrowser: boolean;
	isServer: boolean;
	createElement: <K extends keyof HTMLElementTagNameMap>(
		tagName: K
	) => HTMLElementTagNameMap[K];
	createTextNode: CreateTextNodeCallback;
	appendChild: CreateAppendChildCallback;
	setAttribute: SetAttributeCallback;
	removeAttribute: RemoveAttributeCallback;
	removeChild: RemoveChildCallback;
	replaceChild: ReplaceChildCallback;
	setStyles: SetStylesCallback;
	setData: SetDataCallback;
	setAria: SetAriaCallback;
}
