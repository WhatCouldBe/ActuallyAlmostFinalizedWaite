// runEverything.js
const { execSync, spawn } = require('child_process');
const http = require('http');
const path = require('path');

// Helper function to run a command synchronously.
function runCommand(command, options = {}) {
  try {
    console.log(`Running: ${command} in ${options.cwd || process.cwd()}`);
    execSync(command, { stdio: 'inherit', shell: true, ...options });
  } catch (err) {
    console.error(`Error running command: ${command}`, err);
    process.exit(1);
  }
}

// Helper function to start a long-running process.
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

// 1. Run npm install in the root.
runCommand('npm install');

// 2. Change to server directory and run npm start.
//    (Assuming your server start script is defined in your root package.json,
//     for example "start": "node server/server.js")
const serverDir = path.join(__dirname, 'server');
console.log('Starting server from the server directory...');
runCommand('npm install', { cwd: serverDir }); // Optional if there are any server dependencies
const serverProcess = startProcess('npm', ['start'], serverDir);

// 3. Change to client directory, install dependencies, then start the client.
const clientDir = path.join(__dirname, 'client');
console.log('Changing directory to client, installing dependencies, and starting client...');
runCommand('npm install', { cwd: clientDir });
const clientProcess = startProcess('npm', ['start'], clientDir);

// 4. Start a simple HTTP server for health checks on a port that does not conflict.
//    Here we explicitly use port 6000 to avoid conflicts with the server/client ports.
const healthPort = 6000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running\n');
}).listen(healthPort, () => {
  console.log(`HTTP server (health check) started on port ${healthPort}`);
});
