const { spawn, execSync } = require('child_process');
const path = require('path');
const http = require('http');

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
const serverProcess = startProcess('npm', ['start'], serverDir);

const clientDir = path.join(__dirname, 'client');
runCommand('npm install', { cwd: clientDir });

console.log('Starting client...');
const clientProcess = startProcess('npm', ['start'], clientDir);

const port = process.env.PORT || 5001;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is running\n');
}).listen(port, () => {
  console.log(`HTTP server started on port ${port}`);
});
