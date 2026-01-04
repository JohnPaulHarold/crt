import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const args = process.argv.slice(2);
const pkgDir = args[0];
const bumpType = args[1];
const __dirname = dirname(fileURLToPath(import.meta.url));

if (!pkgDir || !['patch', 'minor', 'major'].includes(bumpType)) {
	console.error(
		'Usage: node scripts/release.js <package-directory> <patch|minor|major>'
	);
	console.error('Example: node scripts/release.js crt patch');
	process.exit(1);
}

const packagePath = join(__dirname, '../packages', pkgDir, 'package.json');

if (!existsSync(packagePath)) {
	console.error(`Package not found at: ${packagePath}`);
	process.exit(1);
}

const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
const currentVersion = pkg.version;
const pkgName = pkg.name;

// Helper to bump version
const bumpVersion = (version, type) => {
	const parts = version.split('.').map(Number);
	if (type === 'major') {
		parts[0]++;
		parts[1] = 0;
		parts[2] = 0;
	} else if (type === 'minor') {
		parts[1]++;
		parts[2] = 0;
	} else {
		parts[2]++;
	}
	return parts.join('.');
};

const newVersion = bumpVersion(currentVersion, bumpType);

console.log(`\n🚀 Releasing ${pkgName}`);
console.log(`   ${currentVersion} -> ${newVersion}\n`);

// 1. Update package.json
pkg.version = newVersion;
writeFileSync(packagePath, JSON.stringify(pkg, null, '\t') + '\n');
console.log('✅ Updated package.json');

try {
	// 2. Build
	console.log('🛠  Building...');
	execSync(`npm run build -w ${pkgName}`, { stdio: 'inherit' });

	// 3. Git Commit & Tag
	const tagName = `${pkgDir}-v${newVersion}`;
	console.log(`📦 Committing and Tagging (${tagName})...`);
	execSync(`git add packages/${pkgDir}/package.json`, { stdio: 'inherit' });
	execSync(`git commit -m "chore(release): ${pkgName} v${newVersion}"`, {
		stdio: 'inherit',
	});
	execSync(`git tag -a ${tagName} -m "Release ${pkgName} v${newVersion}"`, {
		stdio: 'inherit',
	});

	// 4. Publish
	console.log('🚀 Publishing to npm...');
	// Note: --access public is required for scoped packages (@johnpaulharold/...) initially
	execSync(`npm publish -w ${pkgName} --access public`, { stdio: 'inherit' });

	console.log(`\n✨ Successfully released ${pkgName}@${newVersion}\n`);
	console.log("Don't forget to push your tags:");
	console.log('git push && git push --tags');
} catch (error) {
	const errMsg = error instanceof Error ? error.message : String(error);
	console.error('\n❌ Release failed. Rolling back package.json... ' + errMsg);
	pkg.version = currentVersion;
	writeFileSync(packagePath, JSON.stringify(pkg, null, '\t') + '\n');
	process.exit(1);
}
