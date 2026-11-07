const products = [
  {id:'portfolio',number:'01',name:'ROWAIHY PORTOFOLIO',category:'Digital portfolio',headline:'Your work, experience, and achievements in one place.',description:'We build a digital portfolio that showcases your work and experience, introduces you clearly, and reflects your identity and value.',deliverables:['An introduction to your identity, experience, and expertise.','An organized gallery of work, projects, and achievements.','A responsive experience for mobile and desktop with contact options.'],outcome:'A digital portfolio ready to showcase your work and share with clients.'},
  {id:'prototype',number:'02',name:'ROWAIHY Prototype BUILDER',category:'Working prototype',headline:'Turn your idea into a working experience.',description:'We build a working prototype to demonstrate your idea and test its core journeys before expanding development. Present it, collect feedback, and identify improvements.',deliverables:['Define the core scenario and user journey.','Build an interactive prototype with the agreed features.','A version for testing, demonstrations, and feedback.'],outcome:'A testable working prototype and implementation files within the approved scope.'},
  {id:'website',number:'03',name:'ROWAIHY WEBSITE Builder',category:'Websites and automation',headline:'Your website, its code, features, and automation.',description:'We build your website and automate its workflows, connecting services through API and MCP where your project needs them. Start with the core features, test, and improve.',deliverables:['Responsive website interfaces for mobile and desktop.','Core features and workflow automation within the approved scope.','Agreed API and MCP integrations with the required systems.'],outcome:'Source code and a testable MVP website with the agreed features and integrations.'},
  {id:'apple',number:'04',name:'ROWAIHY Apple APP MVP BUILDER',category:'iPhone and iPad apps',headline:'Your idea on iPhone and iPad.',description:'We build your Apple app with interfaces and journeys suited to iPhone and iPad, focusing on the essential features you need to test your idea with users.',deliverables:['Interface and journey design for iPhone and iPad.','App code and approved core features.','An MVP ready for testing and further development.'],outcome:'Source code and a testable app MVP for iPhone and iPad within the agreed scope.'},
  {id:'android',number:'05',name:'ROWAIHY ANDROID APP MVP BUILDER',category:'Android apps',headline:'Build your Android app on a clear foundation.',description:'We build your Android app from interfaces to core features, so you can test the experience, validate the idea, and improve step by step.',deliverables:['Interfaces and journeys suited to Android devices.','App code and core functionality within the approved scope.','An MVP ready to test and improve.'],outcome:'Source code and a testable app MVP for Android devices within the agreed scope.'}
];
const dialog=document.getElementById('products-dialog');
const trigger=document.getElementById('energy-products');
const list=document.getElementById('product-list');
const detail=document.getElementById('product-detail');
const empty=document.getElementById('product-empty');
const buttons=new Map();
const make=(tag,text,className)=>{const el=document.createElement(tag);if(text)el.textContent=text;if(className)el.className=className;return el;};
for(const p of products){
  const li=make('li'),button=make('button',null,'product-choice');
  button.type='button';button.dataset.product=p.id;button.setAttribute('aria-pressed','false');button.setAttribute('aria-controls','product-detail');
  const number=make('span',p.number,'product-choice-number');number.setAttribute('aria-hidden','true');
  const label=make('span',null,'product-choice-label'),name=make('b',p.name);name.dir='ltr';name.lang='en';
  label.append(name,make('small',p.category));button.append(number,label,make('span','↖','product-choice-arrow'));
  button.addEventListener('click',()=>select(p));li.append(button);list.append(li);buttons.set(p.id,button);
}
function setHash(value){history.replaceState(null,'',location.pathname+location.search+(value?'#'+value:''));}
function select(p,focus=true){
  for(const [id,button] of buttons)button.setAttribute('aria-pressed',String(id===p.id));
  empty.hidden=true;detail.hidden=false;
  document.getElementById('detail-category').textContent=p.number+' / '+p.category;
  document.getElementById('detail-name').textContent=p.name;
  document.getElementById('detail-headline').textContent=p.headline;
  document.getElementById('detail-description').textContent=p.description;
  document.getElementById('detail-outcome').textContent=p.outcome;
  document.getElementById('detail-deliverables').replaceChildren(...p.deliverables.map(text=>make('li',text)));
  setHash(p.id);
  if(focus){document.getElementById('detail-name').focus({preventScroll:true});if(matchMedia('(max-width: 760px)').matches)detail.scrollIntoView({behavior:'instant',block:'start'});}
}
function openProducts(){
  if(!dialog.open){dialog.showModal();document.body.classList.add('products-open');trigger.setAttribute('aria-expanded','true');}
  if(!products.some(p=>p.id===location.hash.slice(1)))setHash('products');
}
trigger.addEventListener('click',openProducts);
document.getElementById('close-products').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
dialog.addEventListener('close',()=>{document.body.classList.remove('products-open');trigger.setAttribute('aria-expanded','false');setHash('');trigger.focus({preventScroll:true});});
document.getElementById('back-to-products').addEventListener('click',()=>{list.scrollIntoView({behavior:'instant',block:'start'});(list.querySelector('[aria-pressed="true"]')||list.querySelector('button')).focus({preventScroll:true});});
function restoreFromHash(){const p=products.find(p=>p.id===location.hash.slice(1));if(p){openProducts();select(p,false);}else if(location.hash==='#products'){openProducts();}}
window.addEventListener('hashchange',restoreFromHash);restoreFromHash();
