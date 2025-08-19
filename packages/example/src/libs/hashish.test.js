/**
 * @vitest-environment jsdom
 */

import { describe, expect, test, vi } from 'vitest';
import { hashish } from './hashish';

describe('hashish', () => {
    test('it registers handlers', () => {
        const vc = vi.fn();
        const cb = vi.fn();
        const id = 'xyz';
        const r = {
            pattern: `/${id}`,
            id,
            viewClass: vc,
        };
        const evt = new HashChangeEvent('hashchange', {
            newURL: window.location.origin + `#/${id}`,
        });

        hashish.config(window.location.pathname);
        hashish.registerRoute(r, cb);

        window.dispatchEvent(evt);
        const expectation = { params: {}, search: {}, pattern: `/${id}` };
        expect(cb).toHaveBeenCalledWith(expectation);
    });

    test('it handles a custom "hash"', () => {
        const vc = vi.fn();
        const cb = vi.fn();
        const id = 'xyz';
        const r = {
            pattern: `/${id}`,
            id,
            viewClass: vc,
        };
        const evt = new HashChangeEvent('hashchange', {
            newURL: window.location.origin + `!#/${id}`,
        });

        hashish.config(window.location.pathname, '!#');
        hashish.registerRoute(r, cb);

        window.dispatchEvent(evt);
        const expectation = { params: {}, search: {}, pattern: `/${id}` };
        expect(cb).toHaveBeenCalledWith(expectation);
    });
});
