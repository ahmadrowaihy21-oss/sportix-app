'use strict';

const phases = [
  {label:'Feasibility study', icon:'<path d="M4 3v17h16M8 15v-4m5 4V7m5 8v-6"/>', title:'Know which assumption deserves a test.',copy:'Define the customer, problem, and alternatives. Separate evidence from assumptions to test before spending.',items:['Market size and competitors','Operating costs and funding needs','A reasoned decision and next step'],sheet:'Malabk / Study hypothesis',rows:[['Client','Padel players'],['Assumption','Direct booking saves time'],['Evidence needed','Testing with real players']]},
  {label:'Identity and profile',icon:'<path d="m3 17 1 4 4-1L20 8l-5-5L3 15zM12 6l5 5"/>',title:'Give your idea a distinct identity.',copy:'Translate the project into a name, logo, and visual language, then bring what clients and partners need to know into one profile.',items:['Logo, colors, and typography','Project promise and target users','A shareable company profile'],sheet:'Malabk / Project profile',rows:[['Service','Padel court booking'],['Promise','Less time booking. More time playing.'],['Audience','Players and court operators']]},
  {label:'Market testing',icon:'<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M9 21h6m-3-3v3m-3-12 6 3-6 3z"/>',title:'Let users experience the idea.',copy:'Place the interactive prototype in a shareable portfolio and see whether users can complete the intended task.',items:['A portfolio without a custom domain','An interactive prototype','A clear measure of test success'],sheet:'Malabk / Initial test',rows:[['Task','Choose a court and time'],['Usage signal','Complete booking without help'],['Next step','Interview prototype users']]},
  {label:'Support and partnerships',icon:'<circle cx="5" cy="12" r="2.5"/><circle cx="18" cy="5" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m7 11 9-5m-9 7 9 5"/>',title:'Find an opportunity for your stage.',copy:'Review support eligibility and real partner needs. The founder approves file sharing before any referral.',items:['Eligibility based on sector and stage','A clear reason for each recommendation','Founder review before sharing'],sheet:'Malabk / Referral profile',rows:[['Partner type','Court operator for a pilot'],['Evidence needed','Test results and acceptable pricing'],['Example status','Not sent to any organization']]}
];

const tablist=document.getElementById('phase-tabs');
const panel=document.getElementById('phase-panel');
function selectPhase(index) {
  const phase=phases[index];
  Array.from(tablist.children).forEach((tab,i)=>{
    tab.setAttribute('aria-selected',String(index===i));
    tab.tabIndex=index===i?0:-1;
  });
  panel.setAttribute('aria-labelledby','phase-'+index);
  document.getElementById('phase-title').textContent=phase.title;
  document.getElementById('phase-copy').textContent=phase.copy;
  const items=phase.items.map(item=>{const li=document.createElement('li');li.textContent=item;return li;});
  document.getElementById('phase-items').replaceChildren(...items);
  document.getElementById('sheet-title').textContent=phase.sheet;
  const rows=phase.rows.map(pair=>{
    const row=document.createElement('div');row.className='sheet-row';
    pair.forEach(value=>{const span=document.createElement('span');span.textContent=value;row.append(span);});
    return row;
  });
  document.getElementById('sheet-rows').replaceChildren(...rows);
}
phases.forEach((phase,i)=>{
  const tab=document.createElement('button');tab.type='button';tab.id='phase-'+i;tab.className='tab';tab.setAttribute('role','tab');tab.setAttribute('aria-controls','phase-panel');
  tab.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+phase.icon+'</svg>';
  tab.append(document.createTextNode(phase.label));tab.onclick=()=>selectPhase(i);
  tab.onkeydown=event=>{
    const n=phases.length, targets={ArrowLeft:(i+1)%n,ArrowRight:(i+n-1)%n,Home:0,End:n-1};
    if (!(event.key in targets)) return;
    event.preventDefault();const next=targets[event.key];selectPhase(next);tablist.children[next].focus();
  };
  tablist.append(tab);
});
selectPhase(0);

const nav=document.getElementById('navigation'),menu=document.getElementById('menu');
function setMenu(open){nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));}
menu.onclick=()=>setMenu(!nav.classList.contains('open'));
nav.onclick=()=>setMenu(false);
document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false);});


document.querySelectorAll('[data-intake]').forEach(button => button.addEventListener('click', () => { location.href='workspace.html?new=1'; }));
