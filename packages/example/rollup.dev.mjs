import serve from 'rollup-plugin-serve';
import config from './rollup.config.mjs';

config.plugins.push(
	serve({
		open: true,
		port: 20001,
		contentBase: 'dist',
	})
);

export default config;
