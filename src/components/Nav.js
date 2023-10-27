/**
 * @typedef {import('../declarations/types').NavProps} NavProps
 * @typedef {import("../declarations/types").NavItem} NavItem
 */

import { a, li, nav, ol } from '../libs/makeElement';
import { cx } from '../utils/dom/cx';

import s from './Nav.scss';

/**
 *
 * @param {NavProps} props
 * @returns
 */
export const Nav = (props) => {
    /**
     * @name buildNavItem
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
