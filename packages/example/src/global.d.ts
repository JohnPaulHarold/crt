/**
 * This file is used to provide type definitions for non-JavaScript/TypeScript assets
 * that are imported into the project. This allows TypeScript to understand the shape
 * of these modules and prevents type errors.
 */

// For CSS Modules (files ending in .scss, .css, etc.)
declare module '*.scss' {
    const content: Record<string, string>;
    export default content;
}

// For image assets (png, jpg, svg, etc.)
declare module '*.png' {
    const value: string;
    export default value;
}