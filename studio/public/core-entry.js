// The server verifies the founder role; this link is only navigation.
(async()=>{
 try{
  const response=await fetch('/api/core/identity',{cache:'no-store'});
  if(!response.ok)return;
  const state=await response.json();if(!state.isAdmin)return;
  const existing=document.querySelector('[data-core-entry]');if(existing){existing.hidden=false;return;}
  const host=document.querySelector('.app-nav')||document.querySelector('.head-inner')||document.querySelector('.header-tools')||document.querySelector('header.site-head nav');
  if(!host)return;const link=document.createElement('a');link.href='/admin';link.textContent='Management · الإدارة';link.dataset.coreEntry='true';host.append(link);
 }catch{}
})();
