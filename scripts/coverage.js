import { exec } from 'child_process';
import path from 'path';

// Determine the command to open a file based on the OS
const openCommand =
    process.platform === 'darwin'
        ? 'open'
        : process.platform === 'win32'
        ? 'start'
        : 'xdg-open';

const coverageReportPath = path.join(process.cwd(), 'coverage', 'index.html');

console.log('Generating coverage report...');

// Run the test command with coverage enabled
exec('npm test -- --coverage', (error, stdout, stderr) => {
    // We pipe stdout and stderr to the console to see the test output
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    if (error) {
        console.error(`Coverage generation failed: ${error.message}`);
        return;
    }

    console.log(`\nCoverage report generated. Opening ${coverageReportPath}`);

    // If tests pass, open the coverage report
    exec(`${openCommand} ${coverageReportPath}`);
});