import { spawnSync } from 'node:child_process';

function gcloud(args) {
  const result = spawnSync('gcloud', args, { encoding: 'utf8', timeout: 20000, shell: false });
  if (result.error?.code === 'ENOENT') throw new Error('Google Cloud CLI is not installed. No cloud configuration was changed.');
  if (result.status !== 0) throw new Error('Google Cloud could not be queried. Check authenticated access and project permissions.');
  return result.stdout.trim();
}
try {
  const project = process.argv[2] || gcloud(['config', 'get-value', 'project', '--quiet']);
  if (!project || project === '(unset)' || !/^[a-z][a-z0-9-]{4,61}[a-z0-9]$/.test(project)) {
    throw new Error('Supply a valid, authorized Google Cloud project ID.');
  }
  const enabled = new Set(gcloud(['services', 'list', '--enabled', '--project', project, '--format=value(config.name)', '--quiet']).split('\n'));
  const services = ['secretmanager.googleapis.com', 'monitoring.googleapis.com'];
  const result = Object.fromEntries(services.map(service => [service, enabled.has(service) ? 'enabled' : 'not enabled']));
  console.log(JSON.stringify({ project, services: result, mode: 'read-only', note: 'Enabled APIs do not verify IAM, secrets, alerts, or data residency.' }, null, 2));
  if (services.some(service => !enabled.has(service))) process.exitCode = 2;
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
