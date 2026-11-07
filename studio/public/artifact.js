'use strict';
// This renderer consumes structured content. Only application-owned DOM and behavior execute.
window.renderShowcase = function renderShowcase(root,kind,p) {
  const el=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt!=null)n.textContent=txt;if(cls)n.className=cls;return n;};
  root.replaceChildren();
  const card=el('article',null,'asset-view'),head=el('div',null,'asset-head');
  const tones=['#113d33','#263f52','#593932','#38442a'];
  head.style.setProperty('--portfolio-tone',tones[Array.from(p.name).length%tones.length]);
  head.append(el('small',kind==='digital'?'Digital product portfolio':'Physical product portfolio'),el('h2',p.name),el('h3',p.headline),el('p',p.description));
  card.append(head,el('h3','Who is it for?'),el('p',p.audience));
  const benefits=el('ul',null,'work-list');p.benefits.forEach(b=>benefits.append(el('li',b)));card.append(benefits);
  if(kind==='physical'){
    card.append(el('h3','Initial specifications and concepts'));const specs=el('div',null,'spec-grid');
    for(const product of p.products){const item=el('div',null,'spec');item.append(el('strong',product.name),el('p',product.description));
      const ul=el('ul',null,'work-list');product.attributes.forEach(a=>ul.append(el('li',a)));item.append(ul);specs.append(item);}
    card.append(specs,el('h3','Suggested use'),el('p',p.usage));
  }else{
    const area=el('div',null,'demo-flow');area.setAttribute('aria-live','polite');const selected=[];
    function draw(){
      area.replaceChildren();const step=p.steps[selected.length];
      if(!step){
        area.append(el('small','Demo complete'),el('h3',p.confirmation),el('p',selected.join(' · '),'art-output'));
        const again=el('button','Try again','btn outline');again.onclick=()=>{selected.length=0;draw();};area.append(again);return;
      }
      area.append(el('small','Demo prototype · step '+(selected.length+1)+'  of '+p.steps.length),el('h3',step.title),el('p',step.instruction));
      const choices=el('div',null,'choices');step.choices.forEach(choice=>{const b=el('button',choice);b.onclick=()=>{selected.push(choice);draw();};choices.append(b);});area.append(choices);
      if(selected.length){const back=el('button','Previous step','btn outline small');back.onclick=()=>{selected.pop();draw();};area.append(back);}
    }
    draw();card.append(area);
  }
  card.append(el('p',p.callToAction,'section-note'));root.append(card);
};
