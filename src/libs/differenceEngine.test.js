/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import { diff, stringToHTML } from './differenceEngine';

describe('differenceEngine', () => {
    test('it adds various attributes', () => {
        const existing = stringToHTML(`
            <div>
                <ul>
                    <li>1</li>
                    <li>2</li>
                    <li>3</li>
                    <li>4</li>
                </ul>
            </div>
        `);

        const template = stringToHTML(`
            <div class="x">
                <ul>
                    <li id='a'>1</li>
                    <li id='b'>2</li>
                    <li id='c'>3</li>
                    <li id='d'>4</li>
                </ul>
            </div>
        `);

        diff(template, existing);

        expect(existing).toEqual(template);
        expect(existing.querySelector('.x')).toBeTruthy();
        ['a', 'b', 'c', 'd'].forEach((id) => {
            expect(existing.querySelector(`li#${id}`)).toBeTruthy();
        });
    });

    test('it removes various attributes', () => {
        const existing = stringToHTML(`
            <div class="x">
                <ul>
                    <li id='a'>1</li>
                    <li id='b'>2</li>
                    <li id='c'>3</li>
                    <li id='d'>4</li>
                </ul>
            </div>
        `);

        const template = stringToHTML(`
            <div>
                <ul>
                    <li id='a1'>1</li>
                    <li id='b'>2</li>
                    <li id='c1'>3</li>
                    <li id='d'>4</li>
                </ul>
            </div>
        `);

        diff(template, existing);

        expect(existing).toEqual(template);
        expect(existing.querySelector('.x')).toBeFalsy();
        ['a1', 'b', 'c1', 'd'].forEach((id) => {
            expect(existing.querySelector(`li#${id}`)).toBeTruthy();
        });
    });

    test('it removes class tokens', () => {
        const existing = stringToHTML(`
            <div class="x y z"></div>
        `);

        const template = stringToHTML(`
            <div class="x y"></div>
        `);

        diff(template, existing);

        expect(existing).toEqual(template);
        expect(existing.querySelector('.z')).toBeFalsy();
    });

    test('it adds class tokens', () => {
        const existing = stringToHTML(`
            <div class="x y"></div>
        `);

        const template = stringToHTML(`
            <div class="x y z"></div>
        `);

        diff(template, existing);

        expect(existing).toEqual(template);
        expect(existing.querySelector('.z')).toBeTruthy();
    });

    test('it adds nodes', () => {
        const existing = stringToHTML(`
            <div class="x">
                <ul>
                    <li id='a'>1</li>
                    <li id='b'>2</li>
                </ul>
            </div>
        `);

        const template = stringToHTML(`
            <div class="x">
                <img class="image" src="path/to/image.img" />
                <ul>
                    <li id='a'>1</li>
                    <li id='b'>2</li>
                    <li id='c'>3</li>
                    <li id='d'>4</li>
                </ul>
            </div>
        `);

        diff(template, existing);

        expect(existing.querySelector('.image')).toBeTruthy();
        expect(existing).toEqual(template);
    });

    test('it removes nodes', () => {
        const existing = stringToHTML(`
            <div class="x">
                <img class="image" src="path/to/image.img" />
                <ul>
                    <li id='a'>1</li>
                    <li id='b'>2</li>
                    <li id='c'>3</li>
                    <li id='d'>4</li>
                </ul>
            </div>
        `);

        const template = stringToHTML(`
            <div class="x">
                <ul>
                    <li id='a'>1</li>
                    <li id='b'>2</li>
                </ul>
            </div>
        `);

        diff(template, existing);

        expect(existing).toEqual(template);
        expect(existing.querySelector('.image')).toBeFalsy();
        ['a', 'b'].forEach((id) => {
            expect(existing.querySelector(`li#${id}`)).toBeTruthy();
        });
        ['c', 'd'].forEach((id) => {
            expect(existing.querySelector(`li#${id}`)).toBeFalsy();
        });
    });

    test('it removes script tags', () => {
        const existing = stringToHTML(`
            <div class="x"></div>
        `);

        const template = stringToHTML(`
            <div class="x">
                <script>document.write("x")</script>
            </div>
        `);
        diff(template, existing);
        expect(existing).not.toEqual(template);
        expect(existing.getElementsByTagName('script')).toHaveLength(0);
    });
});
