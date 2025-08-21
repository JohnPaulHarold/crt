import { exec } from 'child_process';

const targets = [
	'node_modules/',
	'coverage/',
	'packages/*/dist',
	'packages/*/node_modules',
].join(' ');

exec(`rm -rf ${targets}`, (error, _, stderr) => {
	if (error) {
		console.log(`[nuked] error: ${error.message}`);
		return;
	}

	if (stderr) {
		console.log(`[nuked] stderr ${stderr}`);
		return;
	}

	console.log(`[nuked] ${targets}`);
});
