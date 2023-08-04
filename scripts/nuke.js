const { exec } = require('child_process');

const targets = ['node_modules/', 'dist'].join(' ');

exec(`rm -rf ${targets}`, (error, stdout, stderr) => {
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
