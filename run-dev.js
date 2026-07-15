const { spawn } = require('child_process');
const os = require('os');

const isWin = os.platform() === 'win32';

let nlpCmd, backendCmd;

if (isWin) {
  nlpCmd = 'cd bank-insight-nlp && .\\venv\\Scripts\\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000';
  backendCmd = 'cd bank-insight-backend && .\\mvnw.cmd clean spring-boot:run';
} else {
  nlpCmd = 'cd bank-insight-nlp && ./venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000';
  backendCmd = 'cd bank-insight-backend && chmod +x mvnw && ./mvnw clean spring-boot:run';
}

const frontendCmd = 'cd bank-insight-frontend && npm run dev';

const concurrentlyCmd = `npx concurrently -c "blue,magenta,cyan" -n "NLP,SPRING,REACT" "${nlpCmd}" "${backendCmd}" "${frontendCmd}"`;

console.log(`Starting FinPulse AI services on platform: ${os.platform()}...`);
const child = spawn(concurrentlyCmd, { shell: true, stdio: 'inherit' });

child.on('exit', (code) => {
  process.exit(code);
});
