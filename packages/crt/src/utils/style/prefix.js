export const transformProp = (function () {
    const testEl = document.createElement('div');
    if (testEl.style.transform == null) {
        const vendors = ['webkit', 'Webkit', 'Moz', 'ms'];
        for (const vendor in vendors) {
            // @ts-ignore
            if (testEl.style[vendors[vendor] + 'Transform'] !== undefined) {
                return vendors[vendor] + 'Transform';
            }
        }
    }
    return 'transform';
})();
