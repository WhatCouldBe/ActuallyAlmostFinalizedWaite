// runEverything.js
const { execSync, spawn } = require('child_process');
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

// 1. Install dependencies in the root.
runCommand('npm install');

// 3. Start the server (which serves the built client).
const serverDir = path.join(__dirname, 'server');
console.log('Starting server from the server directory...');
// (Optionally run npm install in server if needed; remove if not necessary)
runCommand('npm install', { cwd: serverDir });
const serverProcess = startProcess('npm', ['start'], serverDir);



// 2. Build the client.
const clientDir = path.join(__dirname, 'client');
console.log('Building client...');
runCommand('npm install', { cwd: serverDir });
runCommand('npm run build', { cwd: clientDir });

