import { a, li, nav, ol } from '../libs/makeElement';
import { cx } from '../utils/dom/cx';

import s from './Nav.scss';

/**
 * @typedef {object} NavProps
 * @property {string} [blockExit]
 * @property {string} id
 * @property {NavItem[]} navItems
 */

/**
 * @typedef {object} NavItem
 * @property {string} id
 * @property {string} [title]
 * @property {string} href
 */

/**
 *
 * @param {NavProps} props
 * @returns
 */
export const Nav = (props) => {
    /**
     * @param {NavItem} param0
     * @returns
     */
    const buildNavItem = ({ id, title, href }) => {
        return li(
            {},
            a(
                {
                    href,
                    id,
                },
                title || href
            )
        );
    };

    const navCx = cx(
        s.mainNav,
        'collapsed' // start closed
    );

    return nav(
        {
            className: navCx,
            id: props.id || 'nav-component',
            dataset: {
                blockExit: props.blockExit,
            },
        },
        ol(undefined, props.navItems.map(buildNavItem))
    );
};
