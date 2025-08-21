/**
 * A very basic VDOM diffing engine.
 * This is not a full-featured implementation, but demonstrates the core concepts
 * needed to solve the focus-loss issue.
 */

/**
 * Diffs the attributes of two elements and updates the real DOM element.
 * @param {HTMLElement} vdom
 * @param {HTMLElement} dom
 */
function diffAttributes(vdom, dom) {
    // --- Attributes ---
    const vdomAttrs = vdom.attributes;
    const domAttrs = dom.attributes;

    // Set new or changed attributes
    for (let i = 0; i < vdomAttrs.length; i++) {
        const attr = vdomAttrs[i];
        if (dom.getAttribute(attr.name) !== attr.value) {
            dom.setAttribute(attr.name, attr.value);
        }
    }

    // Remove old attributes
    for (let i = domAttrs.length - 1; i >= 0; i--) {
        const attr = domAttrs[i];
        if (!vdom.hasAttribute(attr.name)) dom.removeAttribute(attr.name);
    }

    // --- Properties ---
    // This is a targeted fix for properties that don't reflect as attributes,
    // like event handlers or the `value` of an input, which can become stale.
    // A more comprehensive VDOM implementation would track props explicitly.
    const propsToSync = [
        'onclick',
        'onkeydown',
        'onkeyup',
        'onkeypress',
        'onfocus',
        'onblur',
        'onchange',
        'onsubmit',
        'oninput',
        'value',
        'checked',
        'selected',
    ];

    const anyDom = /** @type {any} */ (dom);
    const anyVdom = /** @type {any} */ (vdom);

    for (let i = 0; i < propsToSync.length; i++) {
        const prop = propsToSync[i];
        // Update property if it's different on the new VDOM.
        // This also handles removal, as a non-existent property on `vdom` will be
        // `undefined`, causing the property on `dom` to be set to `undefined`.
        // @ts-ignore - The type checker struggles with dynamic property access on DOM elements. This code is safe because we are iterating over a known list of valid properties.
        if (anyVdom[prop] !== anyDom[prop]) {
            // @ts-ignore - See above.
            anyDom[prop] = anyVdom[prop];
        }
    }
}

/**
 * Diffs the children of two elements and updates the real DOM element.
 * @param {HTMLElement} vdom
 * @param {HTMLElement} dom
 */
function diffChildren(vdom, dom) {
    const vdomChildren = Array.from(vdom.childNodes);
    const domChildren = Array.from(dom.childNodes);
    const maxLen = Math.max(vdomChildren.length, domChildren.length);

    for (let i = 0; i < maxLen; i++) {
        const vChild = vdomChildren[i];
        const dChild = domChildren[i];

        if (!vChild) {
            // The new VDOM has fewer children, so remove the extra real DOM node.
            dChild.remove();
        } else if (!dChild) {
            // The new VDOM has more children, so add the new node.
            dom.appendChild(vChild);
        } else {
            // Both nodes exist, so diff them recursively.
            _diff(vChild, dChild);
        }
    }
}

/**
 * The internal diffing function that recursively compares two nodes.
 * @param {Node} vdom
 * @param {Node} dom
 */
function _diff(vdom, dom) {
    // If the nodes are of different types or tags, replace the old with the new.
    if (vdom.nodeType !== dom.nodeType || vdom.nodeName !== dom.nodeName) {
        // Use the parentNode to replace the child, which is more compatible than `replaceWith`.
        if (dom.parentNode) {
            dom.parentNode.replaceChild(vdom, dom);
        }
        return;
    }

    // If they are text nodes, update the content if it's different.
    if (
        vdom.nodeType === Node.TEXT_NODE &&
        vdom.textContent !== dom.textContent
    ) {
        dom.textContent = vdom.textContent;
        return;
    }

    // If they are element nodes, diff their attributes and children.
    if (vdom.nodeType === Node.ELEMENT_NODE) {
        // @ts-ignore - The type checker struggles to infer that after the `nodeType` check, vdom and dom are HTMLElements.
        diffAttributes(vdom, dom);
        // @ts-ignore - See above.
        diffChildren(vdom, dom);
    }
}

/**
 * Removes script tags from an element.
 * @param {HTMLElement} elem
 */
function removeScripts(elem) {
    const scripts = elem.querySelectorAll('script');
    for (let i = 0, l = scripts.length; i < l; i++) {
        scripts[i].remove();
    }
}

/**
 * Public diff function that wraps the core logic with focus management.
 * @param {Node} vdom
 * @param {Node} dom
 */
export function diff(vdom, dom) {
    // Sanitize VDOM by removing script tags before diffing.
    if (vdom.nodeType === Node.ELEMENT_NODE) {
        // @ts-ignore - The type checker struggles to infer that after the `nodeType` check, vdom is an HTMLElement.
        removeScripts(vdom);
    }

    // 1. Before diffing, check if the active element is inside the tree we're about to change.
    const activeElement = document.activeElement;
    const wasFocused =
        activeElement && dom.contains(activeElement) && activeElement.id;
    const activeElementId = wasFocused ? activeElement.id : null;

    // 2. Perform the actual diffing.
    _diff(vdom, dom);

    // 3. After diffing, if an element was focused, find it by its ID and restore focus.
    if (activeElementId) {
        const newElementToFocus = document.getElementById(activeElementId);
        if (newElementToFocus) {
            newElementToFocus.focus();
        }
    }
}

/**
 * Converts an HTML string into a single DOM element.
 * @param {string} html
 * @returns {Node | null}
 */
export function stringToHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}
