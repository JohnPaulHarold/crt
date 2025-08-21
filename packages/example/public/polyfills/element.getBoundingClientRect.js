// @ts-nocheck
Element.prototype._getBoundingClientRect =
	Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function () {
	const rect = Element.prototype._getBoundingClientRect.call(this);
	rect.x = rect.left;
	rect.y = rect.top;
	return rect;
};
