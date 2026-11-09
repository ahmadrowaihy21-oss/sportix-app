import {build} from 'esbuild';
await build({entryPoints:['lib/workflow.ts'],outfile:'backend/railway/workflow.mjs',bundle:true,format:'esm',platform:'node',target:'node22'});
console.log('Railway sandbox domain bundle built. Deployment remains blocked by account plan.');
