const nav=document.getElementById('navigation'),menu=document.getElementById('menu');
const toggle=open=>{nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));};
menu.onclick=()=>toggle(!nav.classList.contains('open'));nav.onclick=()=>toggle(false);
document.addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false);});
