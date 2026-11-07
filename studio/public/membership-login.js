import {nextPage,request} from './member-nav.js';
const status=document.getElementById('auth-status');
async function enter(){try{const session=await request('auth/session');if(session.authenticated){location.replace(nextPage());return;}status.textContent='Open this private project using the owner’s Netlify account.';}catch(e){status.textContent=e.message;document.getElementById('retry').hidden=false;}}
document.getElementById('retry').onclick=()=>location.reload();
enter();
