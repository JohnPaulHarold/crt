/**
 * @param {boolean} feature
 * @param {string[] | string} classes
 * @param {{valid: any, invalid: any}} css
 */
export function getClassesWithFeature(feature, classes, css) {
  return `${Array.isArray(classes) ? classes.join(", ") : classes} ${
    feature ? css.valid : css.invalid
  }`;
}
