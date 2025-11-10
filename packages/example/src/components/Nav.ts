import { ComponentProps, cx } from 'crt';
import { a, li, nav, ul } from '../html.js';
import s from './Nav.scss';

export interface NavItem {
	id: string;
	title?: string;
	href: string;
}

export interface NavProps extends ComponentProps {
	blockExit?: string;
	id: string;
	navItems: NavItem[];
	backStop?: boolean;
}

/**
 * @param props
 */
interface NavOptions {
	props: NavProps;
}

export function Nav(options: NavOptions): HTMLElement {
	const dataset: Record<string, string> = {};
	if (options.props.blockExit) dataset.blockExit = options.props.blockExit;
	if (options.props.backStop) dataset.backStop = 'true';

	const navProps: Record<string, unknown> = {
		...options.props,
		className: cx(s.nav, options.props.className),
	};

	if (Object.keys(dataset).length > 0) {
		navProps.dataset = dataset;
	}

	return nav({
		props: navProps,
		children: ul({
			children: options.props.navItems.map((item) =>
				li({
					children: a({
						props: { href: item.href, id: item.id },
						children: item.title,
					}),
				})
			),
		}),
	});
}
