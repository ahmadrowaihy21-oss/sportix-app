// Decorative energy/data flow, deliberately unrelated to live customer data.
const scene=document.querySelector('.core-scene');
if(scene){
  const canvas=scene.querySelector('.core-network'),ctx=canvas.getContext('2d',{alpha:true});
  const frame=scene.querySelector('.core-frame'),button=scene.querySelector('.core-motion');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=reduce.matches;
  try{const saved=localStorage.getItem('project-r.motion');if(saved!==null)paused=saved==='paused';}catch{}
  let visible=true,raf=0,last=0,time=0,w=0,h=0,cx=0,cy=0,radius=0,routes=[],stars=[];
  let seed=7301;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const colors=['89,244,194','99,211,222','182,200,145'];
  function route(points,index){
    let length=0;const segments=[];
    for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);segments.push({a,b,len,start:length});length+=len;}
    return {points,segments,length,color:colors[index%colors.length],speed:28+random()*38,offset:random()*length,inbound:index%3===0};
  }
  function pointOn(r,d){
    d=((d%r.length)+r.length)%r.length;const s=r.segments.find(x=>d<=x.start+x.len)||r.segments[r.segments.length-1];
    const t=(d-s.start)/s.len;return [s.a[0]+(s.b[0]-s.a[0])*t,s.a[1]+(s.b[1]-s.a[1])*t];
  }
  function configure(){
    if(!ctx)return;
    const box=scene.getBoundingClientRect(),f=frame.getBoundingClientRect();w=box.width;h=box.height;
    const dpr=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    cx=f.left-box.left+f.width/2;cy=f.top-box.top+f.height/2;radius=f.width*.34;
    seed=7301;routes=[];stars=[];
    const count=w<700?20:34;
    for(let i=0;i<count;i++){
      const angle=i/count*Math.PI*2,cos=Math.cos(angle),sin=Math.sin(angle),start=radius*(.7+random()*.25),reach=Math.max(w,h)*(.45+random()*.5);
      const a=[cx+cos*start,cy+sin*start],b=[cx+cos*(radius+20),cy+sin*(radius+20)],c=[cx+cos*(radius+80),cy+sin*(radius+80)];
      let d,e;
      if(Math.abs(cos)>.55){d=[c[0]+cos*reach*.35,c[1]];e=[d[0]+cos*reach*.7,d[1]+sin*reach*.3];}
      else{d=[c[0],c[1]+sin*reach*.35];e=[d[0]+cos*reach*.4,d[1]+sin*reach*.7];}
      routes.push(route([a,b,c,d,e],i));
    }
    for(let i=0;i<(w<700?50:100);i++)stars.push({x:random()*w,y:random()*h,r:.4+random()*.8,phase:random()*6,alpha:.08+random()*.32});
    draw();
  }
  function draw(){
    if(!ctx||!w)return;ctx.clearRect(0,0,w,h);
    const halo=ctx.createRadialGradient(cx,cy,radius*.3,cx,cy,radius*1.9);halo.addColorStop(0,'rgba(43,167,123,.07)');halo.addColorStop(.5,'rgba(23,127,109,.04)');halo.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
    // Peripheral data lattice remains dim under the readable foreground.
    ctx.lineWidth=.5;ctx.strokeStyle='rgba(102,169,149,.055)';
    for(let x=0;x<w;x+=62){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
    for(let y=0;y<h;y+=62){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    for(const s of stars){const alpha=s.alpha*(.7+.3*Math.sin(time*.35+s.phase));ctx.fillStyle=`rgba(153,218,193,${alpha})`;ctx.fillRect(s.x,s.y,s.r,s.r);}
    for(const r of routes){
      ctx.beginPath();r.points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.strokeStyle=`rgba(${r.color},.12)`;ctx.lineWidth=.8;ctx.stroke();
      const junction=r.points[3];ctx.strokeStyle=`rgba(${r.color},.26)`;ctx.strokeRect(junction[0]-2,junction[1]-2,4,4);
      const travel=(time*r.speed+r.offset)*(r.inbound?-1:1);
      for(let k=0;k<2;k++){
        const d=travel+k*r.length*.5;
        // A short luminous packet moves along the same physical circuit.
        for(let tail=8;tail>=0;tail--){const p=pointOn(r,d-tail*(r.inbound?-3:3));const alpha=(1-tail/9)*.8;ctx.fillStyle=`rgba(${r.color},${alpha})`;ctx.beginPath();ctx.arc(p[0],p[1],tail?1:1.9,0,Math.PI*2);ctx.fill();}
        const p=pointOn(r,d);ctx.shadowColor=`rgb(${r.color})`;ctx.shadowBlur=11;ctx.fillStyle='rgba(213,255,233,.9)';ctx.fillRect(p[0]-1,p[1]-1,2,2);ctx.shadowBlur=0;
      }
    }
    // Fine sweep across the reactor's surrounding field, not an activity meter.
    ctx.save();ctx.translate(cx,cy);ctx.rotate(time*.07);ctx.strokeStyle='rgba(111,220,173,.11)';ctx.lineWidth=.7;ctx.setLineDash([2,13]);ctx.beginPath();ctx.arc(0,0,radius*1.24,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  function tick(now){
    raf=0;if(paused||!visible||document.hidden)return;
    if(now-last>=32){time+=Math.min((now-last)/1000,.06);last=now;draw();}
    raf=requestAnimationFrame(tick);
  }
  function sync(){
    const run=!paused&&visible&&!document.hidden;
    scene.dataset.motion=run?'running':'paused';button.setAttribute('aria-pressed',String(paused));
    button.querySelector('.core-motion-text').textContent=paused?'Resume background motion':'Pause background motion';button.querySelector('.core-motion-icon').textContent=paused?'▷':'Ⅱ';
    if(raf)cancelAnimationFrame(raf);raf=0;
    if(run&&ctx){last=performance.now();raf=requestAnimationFrame(tick);}else draw();
  }
  button.hidden=false;
  button.onclick=()=>{paused=!paused;try{localStorage.setItem('project-r.motion',paused?'paused':'running');}catch{}sync();};
  reduce.addEventListener('change',e=>{paused=e.matches;sync();});
  document.addEventListener('visibilitychange',sync);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{rootMargin:'80px'}).observe(scene);
  new ResizeObserver(configure).observe(scene);configure();sync();
}
