// runEverything.js
const { spawn, execSync } = require('child_process');
const path = require('path');
const http = require('http');

// Helper: run a command synchronously and log output.
function runCommand(command, options = {}) {
  try {
    console.log(`Running: ${command} in ${options.cwd || process.cwd()}`);
    execSync(command, { stdio: 'inherit', shell: true, ...options });
  } catch (err) {
    console.error(`Error running command: ${command}`, err);
    process.exit(1);
  }
}

// Helper: spawn a long-running process.
function startProcess(command, args, cwd) {
  console.log(`Starting process: ${command} ${args.join(' ')} in ${cwd}`);
  const proc = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: true
  });
  proc.on('error', (err) => {
    console.error(`Error starting process in ${cwd}:`, err);
  });
  return proc;
}

// 1. Install root dependencies.
runCommand('npm install');

// 2. Start the server.
//    (Since your server folder does not have its own package.json,
//     we assume the server start script is defined in the root package.json.)
const serverDir = path.join(__dirname, 'server');
console.log('Starting server from the server directory...');
const serverProcess = startProcess('npm', ['start'], serverDir);

// 3. Install dependencies in the client folder.
const clientDir = path.join(__dirname, 'client');
runCommand('npm install', { cwd: clientDir });

// 4. Start the client.
console.log('Starting client...');
const clientProcess = startProcess('npm', ['start'], clientDir);

// 5. Start a simple HTTP server (useful for Render or health checks).
const port = process.env.PORT || 5001;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running\n');
}).listen(port, () => {
  console.log(`HTTP server started on port ${port}`);
});
