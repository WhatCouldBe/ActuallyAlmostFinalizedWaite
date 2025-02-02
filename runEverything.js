// runEverything.js
const { execSync, spawn } = require('child_process');
const http = require('http');
const path = require('path');

function runCommand(command, options = {}) {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit', shell: true, ...options });
  } catch (err) {
    console.error(`Error running command: ${command}`, err);
    process.exit(1);
  }
}

function startProcess(command, args, cwd) {
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

// 1. Install root dependencies
runCommand('npm install');

// 2. Install and start the server
const serverDir = path.join(__dirname, 'server');
runCommand('npm install', { cwd: serverDir });
console.log('Starting server...');
const serverProcess = startProcess('npm', ['start'], serverDir);

// 3. Install and start the client
const clientDir = path.join(__dirname, 'client');
runCommand('npm install', { cwd: clientDir });
console.log('Starting client...');
const clientProcess = startProcess('npm', ['start'], clientDir);

// 4. Create a simple HTTP server for Render (or similar)
const port = process.env.PORT || 5001;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running\n');
}).listen(port, () => {
  console.log(`HTTP server started on port ${port}`);
});
