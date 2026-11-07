const guideTriggers=[...document.querySelectorAll('[data-core-guide]')];
const core=document.querySelector('.core-portal');
if(guideTriggers.length&&core){
  const guide=document.createElement('dialog');
  guide.id='core-guide';guide.className='core-guide';
  guide.setAttribute('aria-labelledby','core-guide-title');
  guide.setAttribute('aria-describedby','core-guide-description');
  guide.innerHTML=`<div class="core-guide-body"><button class="core-guide-close" type="button" aria-label="Close guide">×</button><p class="core-guide-brand" lang="en" dir="ltr">PROJECT R STUDIO</p><h2 id="core-guide-title">Touch the core</h2><p id="core-guide-description">Touch the letter <bdi>R</bdi> at the heart of the energy core<br>to open <bdi>ROWAIHY MVP BUILDER</bdi>.</p><img class="core-guide-image" src="assets/core-click-guide.svg" width="720" height="460" alt="Core guide: the pointer highlights the R inside the glowing triangle at the center of the reactor."><button class="core-guide-confirm" type="button">Show me the core →</button></div>`;
  document.body.append(guide);
  let opener=null,showCore=false,highlightTimer;
  for(const button of guideTriggers){
    button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls',guide.id);button.setAttribute('aria-expanded','false');
    button.addEventListener('click',()=>{opener=button;showCore=false;button.setAttribute('aria-expanded','true');document.body.classList.add('core-guide-open');guide.showModal();});
  }
  guide.querySelector('.core-guide-close').addEventListener('click',()=>guide.close());
  guide.querySelector('.core-guide-confirm').addEventListener('click',()=>{showCore=true;guide.close();});
  guide.addEventListener('click',event=>{if(event.target===guide)guide.close();});
  guide.addEventListener('close',()=>{
    document.body.classList.remove('core-guide-open');opener?.setAttribute('aria-expanded','false');
    if(showCore){
      core.focus({preventScroll:true});core.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      core.classList.add('core-guided');clearTimeout(highlightTimer);highlightTimer=setTimeout(()=>core.classList.remove('core-guided'),6000);
    }else opener?.focus({preventScroll:true});
  });
  core.addEventListener('click',()=>{clearTimeout(highlightTimer);core.classList.remove('core-guided');});
}
