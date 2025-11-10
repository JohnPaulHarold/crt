import { a, li, nav, ul } from '../html.js';
import s from './Nav.scss';

export interface NavItem {
	id: string;
	title?: string;
	href: string;
}

export interface NavProps {
	blockExit?: string;
	id: string;
	navItems: NavItem[];
	backStop?: boolean;
}

/**
 * @param props
 */
export function Nav({ id, navItems, blockExit, backStop }: NavProps): HTMLElement {
	const dataset: Record<string, string> = {};
	if (blockExit) dataset.blockExit = blockExit;
	if (backStop) dataset.backStop = 'true';

	const props = Object.assign(
		{
			id,
			className: s.nav,
		},
		Object.keys(dataset).length && { dataset }
	);

	return (
		nav(
			props,
			ul(
				{},
				navItems.map((item) =>
					li({}, a({ href: item.href, id: item.id }, item.title))
				)
			)
		)
	);
}
