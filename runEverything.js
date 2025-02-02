const { execSync, spawn } = require('child_process');
const http = require('http');
const path = require('path');

function runCommand(command, options = {}) {
  try {
    console.log(`Running: ${command} in ${options.cwd || process.cwd()}`);
    execSync(command, { stdio: 'inherit', shell: true, ...options });
  } catch (err) {
    console.error(`Error running command: ${command}`, err);
    process.exit(1);
  }
}

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

runCommand('npm install');


const serverDir = path.join(__dirname, 'server');
console.log('Starting server from the server directory...');
runCommand('npm install', { cwd: serverDir }); 
const serverProcess = startProcess('npm', ['start'], serverDir);

const clientDir = path.join(__dirname, 'client');
console.log('Changing directory to client, installing dependencies, and starting client...');
runCommand('npm install', { cwd: clientDir });
const clientProcess = startProcess('npm', ['start'], clientDir);

const healthPort = 6000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running\n');
}).listen(healthPort, () => {
  console.log(`HTTP server (health check) started on port ${healthPort}`);
});
