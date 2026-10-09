// The preview pane injects PORT=5173 (Vite's port) into the environment, which
// server/index.ts would pick up. Pin the API back to 5000, where Vite's proxy expects it.
import { spawn } from 'node:child_process';

const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, PORT: '5000' },
});
child.on('exit', (code) => process.exit(code ?? 0));
