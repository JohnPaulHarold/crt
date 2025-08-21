/**
 * @vitest-environment jsdom
 */
import { describe, expect, test, afterEach } from 'vitest';
import { normaliseEventTarget } from './normaliseEventTarget.js';

describe('normaliseEventTarget', () => {
    afterEach(() => {
        // Clean up the DOM after each test
        document.body.innerHTML = '';
    });

    test('should return event.target if it is a valid element', () => {
        const button = document.createElement('button');
        const event = /** @type {MouseEvent} */ ({ target: button });
        const result = normaliseEventTarget(event);
        expect(result).toBe(button);
    });

    test('should return document.activeElement if event.target is the window', () => {
        // Setup: create an element and make it the active element
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();

        expect(document.activeElement).toBe(input);

        // Simulate an event where the target is the window
        const event = /** @type {MouseEvent} */ ({ target: window });
        const result = normaliseEventTarget(event);

        // Expect the fallback to the active element
        expect(result).toBe(input);
    });

    test('should return document.activeElement if event.target is null', () => {
        // Setup: create an element and make it the active element
        const link = document.createElement('a');
        document.body.appendChild(link);
        // An `<a>` tag must have an `href` to be focusable in jsdom
        link.href = '#';
        link.focus();

        expect(document.activeElement).toBe(link);

        // Simulate an event where the target is null
        const event = /** @type {MouseEvent} */ ({ target: null });
        const result = normaliseEventTarget(event);

        // Expect the fallback to the active element
        expect(result).toBe(link);
    });
});
