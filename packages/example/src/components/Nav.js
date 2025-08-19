import { a, li, nav, ul } from 'crt';
import { routes } from '../routes.js';

import s from './Nav.scss';

export function Nav() {
    return nav(
        { id: 'main-nav', className: s.nav, 'data-back-stop': 'true' },
        ul(
            {},
            Object.keys(routes)
                .filter((key) => routes[key].nav)
                .map((key) => {
                    const route = routes[key];
                    const href = route.navId
                        ? route.pattern.replace('{id}', route.navId)
                        : route.pattern;

                    return li(
                        {},
                        a(
                            { href: `#${href}`, id: `nav-${key.toLowerCase()}` },
                            route.title
                        )
                    );
                })
        )
    );
}