import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import url from '@rollup/plugin-url';

const ts = new Date().getTime();
const jsBundleName = `bundle.${ts}.js`;
const cssBundleName = `bundle.${ts}.css`;

export default {
	input: 'src/index.js',
	output: {
		name: 'crtExample',
		file: `dist/${jsBundleName}`,
		format: 'iife',
		sourcemap: true,
	},
	plugins: [
		resolve(),
		commonjs(),
		postcss({
			extract: cssBundleName,
			modules: true,
			use: ['sass'],
		}),
		url({
			include: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif'],
			limit: 0, // all files will be copied to dist
			destDir: 'dist/assets',
		}),
		babel({
			babelHelpers: 'bundled',
			exclude: 'node_modules/**',
		}),
		copy({
			targets: [
				{ src: 'public/reset.css', dest: 'dist' },
				{ src: 'public/polyfills', dest: 'dist' },
				{
					src: 'public/index.html',
					dest: 'dist',
					transform: (contents) =>
						contents
							.toString()
							.replace('__TITLE__', 'CRT Example')
							.replace('__SCRIPT__', `${jsBundleName}?ts=${ts}`)
							.replace('__STYLE__', `${cssBundleName}?ts=${ts}`),
				},
			],
			hook: 'buildStart', // Run copy before the bundle is generated
		}),
	],
};
