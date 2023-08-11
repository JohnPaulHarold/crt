/**
 * a DOM diffing approach
 * @link https://github.com/cferdinandi/reef/blob/master/src/components/render.js
 * @author Chris Ferdinandi
 * @license MIT
 * @description some additions, mostly ES5 safe loops and Array methods.
 * @description Also, a fix for a focus loss issue seen
 * @todo when ES5 is no longer a concern, rewrite back to for..of loops
 * @todo when ES5 is no longer a concern, restore Array find, includes
 * @todo fix the remaining type checks and remove @ts-ignore
 */

/**
 * @typedef {{delegate: (elem: Node, att: string, val: string) => void}} ReefEvents
 */

/**
 * @typedef {{[index: string]: string} & Node} IndexedNode
 */

/**
 * @typedef {{[index: string]: string} & HTMLElement} IndexedHTMLElement
 */

import { collectionToArray } from '../utils/collectionToArray';

// Form fields and attributes that can be modified by users
// They also have implicit values that make it hard to know if they were changed by the user or developer
let formFields = ['input', 'option', 'textarea'];
let formAtts = ['value', 'checked', 'selected'];
let formAttsNoVal = ['checked', 'selected'];

/**
 * Convert a template string into HTML DOM nodes
 * @param {string} str The template string
 * @return {Node} The template HTML
 */
export function stringToHTML(str) {
    // Create document
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, 'text/html');

    // If there are items in the head, move them to the body
    if (doc.head && doc.head.childNodes.length) {
        collectionToArray(doc.head.childNodes)
            .reverse()
            .forEach(function (node) {
                doc.body.insertBefore(node, doc.body.firstChild);
            });
    }

    return doc.body || document.createElement('body');
}

/**
 * Check if an attribute string has a stringified falsy value
 * @param {string} str The string
 * @return {boolean} If true, value is falsy
 */
function isFalsy(str) {
    return [
        'false',
        'null',
        'undefined',
        '0',
        '-0',
        'NaN',
        '0n',
        '-0n',
    ].includes(str);
}

/**
 * Check if attribute should be skipped (sanitize properties)
 * @param {string} name The attribute name
 * @param {string} value The attribute value
 * @param {ReefEvents} [events] If true, inline events are allowed
 * @return {boolean} If true, skip the attribute
 */
function skipAttribute(name, value, events) {
    let val = value.replace(/\s+/g, '').toLowerCase();

    if (['src', 'href', 'xlink:href'].includes(name)) {
        if (val.includes('javascript:') || val.includes('data:text/html'))
            return true;
    }

    if (name.startsWith('@on') || name.startsWith('#on')) return true;

    if (!events && name.startsWith('on')) return true;

    return false;
}

/**
 * Add an attribute to an element
 * @param {IndexedHTMLElement} elem The element
 * @param {string} att The attribute
 * @param {string} val The value
 * @param {ReefEvents} [events] If true, inline events are allowed
 */
function addAttribute(elem, att, val, events) {
    // Sanitize dangerous attributes
    if (skipAttribute(att, val, events)) return;

    // note: the `events` arg is a reef specific feature I think
    // If there's a Listeners object, handle delegation
    if (events && events.delegate) {
        events.delegate(elem, att, val);
        return;
    }

    // If it's a form attribute, set the property directly
    if (formAtts.includes(att)) {
        elem[att] = att === 'value' ? val : ' ';
    }

    // Update the attribute
    elem.setAttribute(att, val);
}

/**
 * Remove an attribute from an element
 * @param {IndexedHTMLElement} elem The element
 * @param {string} att The attribute
 */
function removeAttribute(elem, att) {
    // If it's a form attribute, remove the property directly
    if (formAtts.includes(att)) {
        elem[att] = '';
    }

    // Remove the attribute
    elem.removeAttribute(att);
}

/**
 * Compare the existing node attributes to the template node attributes and make updates
 * @param {IndexedHTMLElement} template The new template
 * @param {IndexedHTMLElement} existing The existing DOM node
 * @param {ReefEvents} [events] If true, inline events allowed
 * @description
 */
function diffAttributes(template, existing, events) {
    // If the node is not an element, bail
    if (template.nodeType !== Node.ELEMENT_NODE) return;

    // note: this if check added to satisfy static type checks
    // if (template instanceof HTMLElement && existing instanceof HTMLElement) {
    let templateAtts = template.attributes;
    let existingAtts = existing.attributes;

    for (const prop in templateAtts) {
        if (Object.prototype.hasOwnProperty.call(templateAtts, prop)) {
            const name = templateAtts[prop].name;
            const value = templateAtts[prop].value;

            // Skip [#*] attributes
            if (name.startsWith('#')) continue;

            // Skip user-editable form field attributes
            if (
                formAtts.includes(name) &&
                formFields.includes(template.tagName.toLowerCase())
            )
                continue;

            // Convert [@*] names to their real attribute name
            let attName = name.startsWith('@') ? name.slice(1) : name;

            // If its a no-value property and it's falsy remove it
            if (formAttsNoVal.includes(attName) && isFalsy(value)) {
                removeAttribute(existing, attName);
                continue;
            }

            // Otherwise, add the attribute
            addAttribute(existing, attName, value, events);
        }
    }

    for (const prop in existingAtts) {
        if (Object.prototype.hasOwnProperty.call(existingAtts, prop)) {
            const name = existingAtts[prop].name;

            // If the attribute exists in the template, skip it
            // if (nametemplateAtts[name]) continue;

            // alternate type fix for the above
            if (name in templateAtts) continue;

            // Skip reef-on* attributes if there's a matching listener in the template
            // if (name.startsWith('reef-on') && templateAtts[name.replace('reef-', '')]) continue;

            // Skip user-editable form field attributes
            if (
                formAtts.includes(name) &&
                formFields.includes(existing.tagName.toLowerCase())
            ) {
                continue;
            }

            // Otherwise, remove it
            removeAttribute(existing, name);
        }
    }
    // }
}

/**
 * Add default attributes to a newly created element
 * @param {IndexedHTMLElement} elem The element
 * @param {ReefEvents} [events]
 */
function addDefaultAtts(elem, events) {
    // Only run on elements
    if (elem.nodeType !== Node.ELEMENT_NODE) return;

    // Remove [@*] and [#*] attributes and replace them with the plain attributes
    // Remove unsafe HTML attributes
    // note: this if check added to satisfy static type checks
    const elemAtts = elem.attributes;

    for (const prop in elemAtts) {
        if (Object.prototype.hasOwnProperty.call(elemAtts, prop)) {
            const name = elemAtts[prop].name;
            const value = elemAtts[prop].value;

            // If the attribute should be skipped, remove it
            if (skipAttribute(name, value, events)) {
                removeAttribute(elem, name);
                continue;
            }

            // If there's a Listeners object, handle delegation
            if (events && events.delegate) {
                events.delegate(elem, name, value);
                removeAttribute(elem, name);
                continue;
            }

            // If the attribute isn't a [@*] or [#*], skip it
            if (!name.startsWith('@') && !name.startsWith('#')) continue;

            // Get the plain attribute name
            let attName = name.slice(1);

            // Remove the [@*] or [#*] attribute
            removeAttribute(elem, name);

            // If it's a no-value attribute and its falsy, skip it
            if (formAttsNoVal.includes(attName) && isFalsy(value)) continue;

            // Add the plain attribute
            addAttribute(elem, attName, value, events);
        }
    }

    // If there are child elems, recursively add defaults to them
    if (elem.childNodes) {
        for (let i = 0, l = elem.childNodes.length; i < l; i++) {
            const node = elem.childNodes[i];
            // @ts-ignore
            addDefaultAtts(node, events);
        }
    }
}

/**
 * Get the content from a node
 * @param {Node} node The node
 * @return {string|null} The content
 */
function getNodeContent(node) {
    return node.childNodes && node.childNodes.length ? null : node.textContent;
}

/**
 * Check if two nodes are different
 * @param {Node} node1 The first node
 * @param {Node} node2 The second node
 * @return {boolean} If true, they're not the same node
 */
function isDifferentNode(node1, node2) {
    return (
        (typeof node1.nodeType === 'number' &&
            node1.nodeType !== node2.nodeType) ||
        (node1 instanceof HTMLElement &&
            node2 instanceof HTMLElement &&
            typeof node1.tagName === 'string' &&
            node1.tagName !== node2.tagName) ||
        (node1 instanceof HTMLElement &&
            node2 instanceof HTMLElement &&
            typeof node1.id === 'string' &&
            node1.id !== node2.id) ||
        ((node1 instanceof HTMLImageElement ||
            node1 instanceof HTMLMediaElement) &&
            (node2 instanceof HTMLImageElement ||
                node2 instanceof HTMLMediaElement) &&
            typeof node1.src === 'string' &&
            node1.src !== node2.src)
    );
}

/**
 * Check if the desired node is further ahead in the DOM existingNodes
 * @param {Node} node The node to look for
 * @param {NodeList} existingNodes The DOM existingNodes
 * @param {number} index The indexing index
 * @return {Node|undefined} How many nodes ahead the target node is
 */
function aheadInTree(node, existingNodes, index) {
    return collectionToArray(existingNodes)
        .slice(index + 1)
        .find(function (branch) {
            return !isDifferentNode(node, branch);
        });
}

/**
 * If there are extra elements in DOM, remove them
 * @param {NodeListOf<ChildNode>} existingNodes The existing DOM
 * @param {NodeListOf<ChildNode>} templateNodes The template
 */
function trimExtraNodes(existingNodes, templateNodes) {
    let extra = existingNodes.length - templateNodes.length;
    if (extra < 1) {
        return;
    }

    for (; extra > 0; extra--) {
        existingNodes[existingNodes.length - 1].remove();
    }
}

/**
 * Remove scripts from HTML
 * @param {Node} elem The element to remove scripts from
 * @returns {boolean}
 */
function removeScripts(elem) {
    // note: instanceof check added fto satisfy type checking
    let scripts =
        elem instanceof HTMLElement && elem.querySelectorAll('script');

    if (scripts && scripts.length > 0) {
        for (let i = 0, l = scripts.length; i < l; i++) {
            scripts[i].remove();
        }

        return true;
    }

    return false;
}

/**
 *
 * @param {Node} node
 * @param {NodeListOf<ChildNode>} nodes
 * @param {number} index
 */
function moveNode(node, nodes, index) {
    const isFocused = node === document.activeElement;
    nodes[index].before(node);

    if (isFocused && node instanceof HTMLElement) {
        node.focus();
    }
}

/**
 * Diff the existing DOM node versus the template
 * @param {HTMLElement} template The template HTML
 * @param {HTMLElement} existing The current DOM HTML
 * @param {ReefEvents} [events] If true, inline events allowed
 */
export function diff(template, existing, events) {
    // Get the nodes in the template and existing UI
    let templateNodes = template.childNodes;
    let existingNodes = existing.childNodes;

    // Don't inject scripts
    if (removeScripts(template)) return;

    // Loop through each node in the template and compare it to the matching element in the UI
    templateNodes.forEach(function (node, index) {
        // If element doesn't exist, create it
        if (!existingNodes[index]) {
            let clone = node.cloneNode(true);
            // @ts-ignore
            addDefaultAtts(clone, events);
            existing.append(clone);

            return;
        }

        // If there is, but it's not the same node type, insert the new node before the existing one
        if (isDifferentNode(node, existingNodes[index])) {
            // Check if node exists further in the tree
            let ahead = aheadInTree(node, existingNodes, index);

            // If not, insert the node before the current one
            if (!ahead) {
                let clone = node.cloneNode(true);
                // @ts-ignore
                addDefaultAtts(clone, events);

                moveNode(clone, existingNodes, index);
                // existingNodes[index].before(clone);
                return;
            }

            // Otherwise, move it to the current spot
            // todo: if the `ahead` node is the `activeElement` then
            // the duplicate will remove focus state from both and chuck it back to `body`
            moveNode(ahead, existingNodes, index);
            //existingNodes[index].before(ahead);
        }

        // If attributes are different, update them
        // @ts-ignore
        diffAttributes(node, existingNodes[index], events);

        // Stop diffing if a native web component
        if (node.nodeName.includes('-')) return;

        // If content is different, update it
        let templateContent = getNodeContent(node);
        if (
            templateContent &&
            templateContent !== getNodeContent(existingNodes[index])
        ) {
            existingNodes[index].textContent = templateContent;
        }

        // If there shouldn't be child nodes but there are, remove them
        if (!node.childNodes.length && existingNodes[index].childNodes.length) {
            // @ts-ignore
            existingNodes[index].innerHTML = '';
            return;
        }

        // If DOM is empty and shouldn't be, build it up
        // This uses a document fragment to minimize reflows
        if (!existingNodes[index].childNodes.length && node.childNodes.length) {
            let fragment = document.createDocumentFragment();
            // @ts-ignore
            diff(node, fragment, events);
            existingNodes[index].appendChild(fragment);
            return;
        }

        // If there are nodes within it, recursively diff those
        if (node.childNodes.length) {
            // @ts-ignore
            diff(node, existingNodes[index], events);
        }
    });

    // If extra elements in DOM, remove them
    trimExtraNodes(existingNodes, templateNodes);
}
