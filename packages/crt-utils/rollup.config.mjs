import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const extensions = ['.js', '.ts'];

export default {
	input: 'src/index.ts',
	output: [
		{
			file: 'dist/index.cjs',
			format: 'cjs',
			exports: 'named',
			sourcemap: true,
		},
		{
			file: 'dist/index.js',
			format: 'es',
			sourcemap: true,
		},
	],
	plugins: [
		resolve({ extensions }),
		commonjs(),
		babel({
			extensions,
			babelHelpers: 'bundled',
			presets: [
				['@babel/preset-env', { targets: { ie: '11' }, modules: false }],
				'@babel/preset-typescript',
			],
			exclude: 'node_modules/**',
		}),
		terser(),
	],
};
