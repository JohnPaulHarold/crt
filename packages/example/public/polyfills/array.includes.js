// @ts-nocheck
/**
 * Array.prototype.includes() polyfill
 * @author Chris Ferdinandi
 * @license MIT
 */
if (!Array.prototype.includes) {
	Array.prototype.includes = function (search, start) {
		'use strict';
		if (search instanceof RegExp) {
			throw TypeError('first argument must not be a RegExp');
		}
		if (start === undefined) {
			start = 0;
		}
		return this.indexOf(search, start) !== -1;
	};
}
