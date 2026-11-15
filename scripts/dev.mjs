import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';
const pnpmCmd = isWin ? 'pnpm.cmd' : 'pnpm';

const hasRootDeps = fs.existsSync(path.join(rootDir, 'node_modules'));
const hasBackendDeps = fs.existsSync(path.join(rootDir, 'apps', 'backend', 'node_modules'));
const hasFrontendDeps = fs.existsSync(path.join(rootDir, 'apps', 'frontend', 'node_modules'));

if (!hasRootDeps || !hasBackendDeps || !hasFrontendDeps) {
  console.log('[!] Dependencias no detectadas. Ejecutando pnpm install automáticamente...');
  execSync('pnpm install', { cwd: rootDir, stdio: 'inherit' });
}

console.log('============================================================');
console.log('  PLATAFORMA DE INTELIGENCIA EMPRESARIAL - FULL STACK DEV');
console.log('  Backend API : http://localhost:3000/api');
console.log('  Frontend Web: http://localhost:5173');
console.log('============================================================');

const backend = spawn(pnpmCmd, ['--filter', '@empresarial/backend', 'run', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWin,
});

const frontend = spawn(pnpmCmd, ['--filter', '@empresarial/frontend', 'run', 'dev'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: isWin,
});

const cleanup = () => {
  if (!backend.killed) backend.kill();
  if (!frontend.killed) frontend.kill();
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
