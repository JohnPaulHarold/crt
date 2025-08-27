import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import serve from 'rollup-plugin-serve';
import config from './rollup.config.mjs';

// Resolve the path to the monorepo root's .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const PORT = process.env.PORT || 3000; // Use PORT from .env or default to 3000

config.plugins.push(
	serve({
		open: true,
		port: PORT,
		contentBase: 'dist',
	})
);

export default config;
