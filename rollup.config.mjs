// official plugins
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import url from '@rollup/plugin-url';
import terser from '@rollup/plugin-terser';

// 3rd party
// postcss
import postcss from 'rollup-plugin-postcss';
import autoprefixer from 'autoprefixer';

import bundleWorker from 'rollup-plugin-bundle-worker';
import copy from 'rollup-plugin-copy';

import pkg from './package.json' assert { type: 'json' };

const extensions = ['.js', '.ts'];

const name = 'crt';

const ts = new Date().getTime();

const urlPlugin = url({
    // Where to put files
    destDir: 'dist/assets/',
    // Path to put infront of files (in code)
    publicPath:
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:10001/assets/'
            : './assets/',
    // File name once copied
    fileName: '[name][extname]',
    // Kinds of files to process
    include: ['**/*.svg', '**/*.png', '**/*.gif', '**/*.jpg', '**/*.jpeg'],
});

const copyPlugin = copy({
    targets: [
        {
            src: 'src/static/*.css',
            dest: 'dist/',
        },
        {
            src: 'src/static/polyfills/*.js',
            dest: 'dist/',
        },
        {
            src: 'src/static/index.html',
            dest: 'dist/',
            transform: (contents) => {
                return (
                    contents
                        .toString()
                        // .replace('__BOOT__', `boot.${ts}.js?ts=${ts}`)
                        .replace('__STYLE__', `bundle.${ts}.iife.css?ts=${ts}`)
                        .replace('__SCRIPT__', `bundle.${ts}.iife.js?ts=${ts}`)
                        .replace('__TITLE__', 'CRT app')
                );
            },
        },
    ],
});

export default {
    // Specify here external modules which you don't want to
    // include in your bundle (for instance: 'lodash', 'moment' etc.)
    // https://rollupjs.org/guide/en/#external
    external: [],

    // the entry point
    input: 'src/main.js',

    output: [
        // {
        //     sourcemap: true,
        //     file: pkg.main,
        //     format: 'cjs',
        // },
        // {
        //     sourcemap: true,
        //     file: pkg.module,
        //     format: 'es',
        // },
        {
            sourcemap: true,
            file: `${pkg.browser.replace('iife', `${ts}.iife`)}`,
            format: 'iife',
            // https://rollupjs.org/guide/en/#outputglobals
            globals: {},
        },
    ],

    plugins: [
        resolve({ extensions }),
        commonjs({ transformMixedEsModules: true }),
        urlPlugin,
        copyPlugin,
        postcss({
            plugins: [autoprefixer()],
            modules: true,
            extract: true,
            minimize: true,
            sourceMap: true,
        }),
        bundleWorker(),
        babel({
            extensions,
            babelHelpers: 'bundled',
            include: ['src/**/*'],
        }),
        terser(),
    ],
};
