import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

const extensions = ['.js', '.ts'];

export default {
	input: {
		index: 'src/index.ts',
		server: 'src/server.ts',
	},
	output: [
		{
			dir: 'dist',
			format: 'cjs',
			entryFileNames: '[name].cjs',
			exports: 'named',
			sourcemap: true,
		},
		{
			dir: 'dist',
			format: 'es',
			entryFileNames: '[name].js',
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
