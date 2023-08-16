import { exec } from 'child_process';

const targets = ['node_modules/', 'dist'].join(' ');

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
