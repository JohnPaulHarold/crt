// @ts-nocheck
/**
 * String.prototype.startsWith() polyfill
 */
if (!String.prototype.startsWith) {
	String.prototype.startsWith = function (search, pos) {
		return this.slice(pos || 0, search.length) === search;
	};
}
