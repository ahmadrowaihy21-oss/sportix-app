'use strict';
(async()=>{
  const area=document.getElementById('showcase');
  try{
    const token=location.hash.slice(1);
    if(!/^[\da-f-]{36}$/i.test(token))throw Error('The portfolio link is incomplete.');
    const r=await fetch('/api/studio/showcase/'+encodeURIComponent(token),{cache:'no-store'});
    if(r.status===401){location.replace('login.html?next='+encodeURIComponent(location.pathname+location.search+location.hash));return;}
    if(!r.ok)throw Error('Could not open this version. The founder may have stopped sharing it.');
    const data=await r.json();document.title=data.portfolio.name+' | ROWAIHY';window.renderShowcase(area,data.kind,data.portfolio);
  }catch(err){area.textContent=err.message;}
})();
