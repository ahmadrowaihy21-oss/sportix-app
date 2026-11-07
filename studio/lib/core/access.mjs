export function coreAdmin(env,email){
 return !!email&&String(env.CORE_ADMIN_EMAILS||'').toLowerCase().split(',').map(x=>x.trim()).filter(Boolean).includes(email.toLowerCase());
}
