const { spawn } = require('child_process');
const path = require('path');

console.log('Starting development servers: Frontend: http://localhost:5173 | Backend: http://localhost:3000');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve(__dirname, '../../backend'),
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.resolve(__dirname, '../../frontend'),
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  try { backend.kill(); } catch (_) {}
  try { frontend.kill(); } catch (_) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

backend.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`Backend process exited with code ${code}`);
  }
});

frontend.on('exit', (code) => {
  if (code && code !== 0) {
    console.error(`Frontend process exited with code ${code}`);
  }
});
