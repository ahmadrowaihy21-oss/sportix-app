import {runAcceptance} from '../lib/acceptance';
import {writeFileSync} from 'node:fs';
const results=await runAcceptance();
writeFileSync('public/specs/acceptance-results.json',JSON.stringify({executedAt:new Date().toISOString(),scope:'Single-process in-memory simulator; not distributed backend, auth or provider testing',results},null,2));
console.log(`${results.filter(r=>r.passed).length}/${results.length} simulator checks passed`);
for(const r of results)if(!r.passed)console.error(r);
if(results.some(r=>!r.passed))process.exitCode=1;
