const { spawnSync } = require('child_process');
const path = require('path');

console.log('Installing workspace dependencies...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('[1/2] Installing backend dependencies...');
const bRes = spawnSync(npmCmd, ['install'], {
  cwd: path.resolve(__dirname, '../../backend'),
  stdio: 'inherit',
  shell: true,
});

if (bRes.status !== 0) {
  console.error('Backend installation failed.');
  process.exit(bRes.status || 1);
}

console.log('[2/2] Installing frontend dependencies...');
const fRes = spawnSync(npmCmd, ['install'], {
  cwd: path.resolve(__dirname, '../../frontend'),
  stdio: 'inherit',
  shell: true,
});

if (fRes.status !== 0) {
  console.error('Frontend installation failed.');
  process.exit(fRes.status || 1);
}

console.log('All workspace dependencies installed successfully.');
