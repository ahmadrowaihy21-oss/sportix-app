import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import { createLabServer } from './server.mjs';

const mode = process.argv[2];
if (!['postman', 'n8n'].includes(mode)) throw new Error('Choose postman or n8n');
const server = createLabServer();
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(4318, '127.0.0.1', resolve);
});
let temporaryDirectory;
try {
  const env = { ...process.env };
  let command, runs;
  if (mode === 'postman') {
    command = process.env.POSTMAN_BIN || 'postman';
    runs = [['collection', 'run', 'postman.collection.json', '--bail', 'failure', '--timeout-request', '5000']];
  } else {
    temporaryDirectory = await mkdtemp(join(tmpdir(), 'sportix-n8n-'));
    Object.assign(env, {
      N8N_USER_FOLDER: temporaryDirectory,
      N8N_DIAGNOSTICS_ENABLED: 'false',
      N8N_VERSION_NOTIFICATIONS_ENABLED: 'false',
      N8N_LISTEN_ADDRESS: '127.0.0.1',
      N8N_LOG_LEVEL: 'info'
    });
    command = process.env.N8N_BIN || 'n8n';
    runs = [['import:workflow', '--input=n8n.workflow.json'], ['execute', '--id=sportixLabSmoke01', '--rawOutput']];
  }
  for (const args of runs) {
    const capture = mode === 'n8n' && args[0] === 'execute';
    let output = '';
    await new Promise((resolve, reject) => {
      const child = spawn(command, args, { env, stdio: ['ignore', capture ? 'pipe' : 'inherit', 'inherit'], shell: false, timeout: 120000 });
      child.stdout?.on('data', chunk => {
        output += chunk;
        if (output.length > 1000000) { child.kill(); reject(new Error('Unexpectedly large n8n output')); }
      });
      child.once('error', reject);
      child.once('exit', (code, signal) => code === 0 ? resolve() : reject(new Error(`${mode} failed: ${code ?? signal}`)));
    });
    if (capture) {
      // n8n can exit 0 for an invalid invocation; verify the actual result too.
      const start = output.startsWith('{') ? 0 : output.lastIndexOf('\n{\n') + 1;
      const result = JSON.parse(output.slice(start));
      assert.equal(result.status, 'success');
      assert.equal(result.finished, true);
      const data = result.data.resultData;
      assert.equal(data.lastNodeExecuted, 'Read synthetic catalog');
      const health = data.runData['Check lab health'][0].data.main[0][0].json;
      const catalog = data.runData['Read synthetic catalog'][0].data.main[0][0].json;
      assert.equal(health.status, 'ok');
      assert.equal(health.mode, 'synthetic');
      assert.equal(catalog.mode, 'synthetic');
      assert.equal(catalog.products[0].currency, 'SAR');
      assert.equal(catalog.products[0].id, 'DEMO-001');
      console.log('n8n workflow executed successfully; health and synthetic catalog verified.');
    }
  }
} finally {
  await new Promise(resolve => server.close(resolve));
  if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true });
}
