import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import url from '@rollup/plugin-url';
import postcss from 'rollup-plugin-postcss';
import postcssModules from 'postcss-modules';

import serve from 'rollup-plugin-serve'
import copy from 'rollup-plugin-copy'

import pkg from './package.json' assert { type: 'json' };

const extensions = [
  '.js', '.ts'
];

const name = 'crt';

const urlPlugin = url({
  // Where to put files
  destDir: 'dist/assets/',
  // Path to put infront of files (in code)
  publicPath: process.env.NODE_ENV === "development"
    ? 'http://localhost:10001/dist/assets/'
    : './assets/',
  // File name once copied
  fileName: '[name][extname]',
  // Kinds of files to process
  include: [
    '**/*.svg',
    '**/*.png',
    '**/*.gif',
    '**/*.jpg',
    '**/*.jpeg',
  ]
});

const copyPlugin = copy({
  targets: [
    {
      src: 'src/static/*.css',
      dest: 'dist/',
    },
    {
      src: 'src/static/index.html',
      dest: 'dist/',
      transform: (contents, filename) => {
        return contents
          .toString()
          .replace('__STYLE__', 'bundle.iife.css')
          .replace('__SCRIPT__', 'bundle.iife.js')
          .replace('__TITLE__', 'CRT app');
      }
    },
  ]
});

const cssExportMap = {};

export default {
  // Specify here external modules which you don't want to 
  // include in your bundle (for instance: 'lodash', 'moment' etc.)
  // https://rollupjs.org/guide/en/#external
  external: [],

  // the entry point
  input: 'src/main.js',

  output: [
    {
      sourcemap: true,
      file: pkg.main,
      format: 'cjs',
    },
    {
      sourcemap: true,
      file: pkg.module,
      format: 'es',
    },
    {
      sourcemap: true,
      file: pkg.browser,
      format: 'iife',
      name,
      // https://rollupjs.org/guide/en/#outputglobals
      globals: {},
    }
  ],

  plugins: [
    resolve({ extensions }),
    commonjs({ transformMixedEsModules: true }),
    urlPlugin,
    copyPlugin,
    postcss({
      modules: true,
      getExportNamed: false,
      getExport(id) {
        return cssExportMap[id];
      },
      extract: true,
    }),
    babel({
      extensions,
      babelHelpers: 'bundled',
      include: [
        'src/**/*',
      ],
    }),
    serve({
      open: true,
      contentBase: 'dist'
    })
  ]
};