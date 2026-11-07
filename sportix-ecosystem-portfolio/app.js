'use strict';
const $=(s,el=document)=>el.querySelector(s), $$=(s,el=document)=>[...el.querySelectorAll(s)];
const safeStore={get(key){try{return localStorage.getItem(key)}catch{return null}},set(key,value){try{localStorage.setItem(key,value)}catch{}}};
let lang=safeStore.get('sportix-portfolio-language')==='en'?'en':'ar';
let activeTab='home',activeSport=0,sponsorRole='individual',modalOpener=null,toastTimer;
const t=(ar,en)=>lang==='ar'?ar:en;
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<svg class="icon" aria-hidden="true"><use href="#${n}"/></svg>`;
const sports=[
 {ar:'كرة القدم',en:'Football',code:'FOOTBALL',arText:'مهاراتك، تمركزك، وتطورك مع فريقك. اجمع رحلتك الكروية وشارك ما يدعم ظهورك للفرص المناسبة.',enText:'Your skills, positioning and growth with your team. Build your football journey and share the evidence that supports your next opportunity.'},
 {ar:'كرة السلة',en:'Basketball',code:'BASKETBALL',arText:'من التمرير إلى التسديد والتمركز. سجل مشاركاتك وتابع نمو مهاراتك داخل الملعب.',enText:'From passing to shooting and positioning. Record your participation and follow your development on court.'},
 {ar:'البادل',en:'Padel',code:'PADEL',arText:'ابحث عن شريك لعب، انضم إلى نشاط، واجمع مشاركاتك وتطورك في ملفك الرياضي.',enText:'Find a playing partner, join an activity and bring your participation and progress into your sporting profile.'},
 {ar:'التنس',en:'Tennis',code:'TENNIS',arText:'تابع رحلتك بين التدريب والمنافسة. الإرسال والضربات والحركة تصبح محاور واضحة للتطوير.',enText:'Follow your journey from training to competition. Serving, strokes and movement become clear areas for development.'},
 {ar:'الملاكمة',en:'Boxing',code:'BOXING',arText:'دقة الحركة، الدفاع، والتدرج في التدريب. رحلة تطوير تراعي السلامة وتستفيد من مراجعة المدرب.',enText:'Movement, defence and progressive training. A development journey that respects safety and benefits from coach review.'},
 {ar:'الفنون القتالية المختلطة',en:'MMA',code:'MMA',arText:'اربط جلساتك وخطط تدريبك ومدربك. تعرّف على تطور المهارات ضمن سياق رياضي آمن.',enText:'Connect your sessions, training plans and coach. Understand your skill development in a safe sporting context.'},
 {ar:'المشي',en:'Walking',code:'WALKING',arText:'كل خطوة بداية. أهداف منتظمة، نشاط مع المجتمع، وتحفيز يساعدك على الاستمرار.',enText:'Every step is a beginning. Regular goals, community activity and encouragement to keep going.'},
 {ar:'الدراجات',en:'Cycling',code:'CYCLING',arText:'رحلات ومسارات ومجموعات تشاركك الشغف. اجمع نشاطك وتابع المسافة والانتظام من مصادر مؤهلة.',enText:'Rides, routes and groups that share your passion. Bring your activity together and track distance and consistency from eligible sources.'}
];
const tabs=[
 {id:'home',icon:'home',ar:'الرئيسية',en:'Home',titleAr:'يومك الرياضي يبدأ هنا',titleEn:'Your sporting day starts here',descAr:'أهدافك، أنشطتك القادمة، وتوصيات تساعدك على العودة للممارسة.',descEn:'Your goals, upcoming activities and recommendations to get you moving.'},
 {id:'community',icon:'people',ar:'المجتمع',en:'Community',titleAr:'مجتمع يفهم شغفك',titleEn:'A community that gets you',descAr:'شارك الإنجاز، انضم إلى المجموعات، واكتشف من يشجع رحلتك ويدعمها.',descEn:'Share progress, join groups and discover people who champion your journey.'},
 {id:'go',icon:'bolt',ar:'انطلق',en:'GO SPORTIX',titleAr:'من الخطة إلى الملعب',titleEn:'From the plan to the game',descAr:'اختر رياضتك، انضم إلى ROOM أو ابدأ نشاطًا وسجل رحلتك.',descEn:'Choose your sport, join a ROOM or start an activity and record your journey.'},
 {id:'market',icon:'bag',ar:'السوق',en:'Marketplace',titleAr:'ما تحتاجه لخطوتك القادمة',titleEn:'Everything for your next step',descAr:'اكتشف الملاعب، التدريب، المنتجات والعروض من شركاء المنظومة.',descEn:'Discover venues, training, products and offers from ecosystem partners.'},
 {id:'id',icon:'user',ar:'هويتي',en:'SPORT ID',titleAr:'تطورك يستحق أن يُرى',titleEn:'Your progress deserves to be seen',descAr:'رياضاتك وأداؤك وإنجازاتك ورحلتك وفرصك، في سجل رياضي واحد.',descEn:'Your sports, performance, achievements, journey and opportunities in one profile.'}
];
const network=[
 ['الأكاديميات','Academies','تعلّم. تدرّب. تطوّر.','LEARN. TRAIN. DEVELOP.','مسار يربط الرياضي ببرامج التدريب والمدربين، ويجمع التقييمات وخطط التطور وملاحظات الجلسات في رحلته الرياضية.','Connect athletes to training programmes and coaches, with assessments, development plans and session feedback supporting their sporting journey.'],
 ['الأندية','Clubs','من الملف إلى الفرصة.','FROM PROFILE TO OPPORTUNITY.','إتاحة ملف رياضي مصرح به، وأدلة أداء تدعم مراجعة الكشافين وفرص التجارب. الترشيح لا يعني القبول؛ القرار للجهة المختصة.','Make a consented sporting profile and performance evidence available for scout review and trial opportunities. Nomination does not imply selection; decisions remain with the organisation.'],
 ['الاتحادات الرياضية','Sports federations','مسارات تطور أكثر اتصالًا.','MORE CONNECTED DEVELOPMENT.','ربط بالبرامج والمسارات الرياضية ضمن اختصاص الاتحاد وصلاحياته واتفاقياته، مع مشاركة محددة الغرض للبيانات المصرح بها.','Connect to sports programmes and development pathways within each federation’s remit, permissions and agreements, with purpose-limited access to authorised data.'],
 ['المجتمع الرياضي','Sports community','شغف يجمعنا.','BROUGHT TOGETHER BY SPORT.','مجموعات مستمرة، أنشطة وROOMS مؤقتة، منشورات ومشاركات تفتح باب التشجيع والتعاون والدعم.','Ongoing groups, scheduled activity ROOMS and posts that create space for encouragement, teamwork and support.'],
 ['شركاء SPORTIX','SPORTIX partners','خدمات ومزايا ودعم.','SERVICES. BENEFITS. SUPPORT.','ملاعب ومدربون ومتاجر وشركاء عروض ورعاية. يلتقي احتياج الرياضي بخدمة مناسبة، وتصل الرعاية إلى قصة إنجاز تستحق الدعم.','Venues, coaches, shops, offers and sponsorship partners. Match athlete needs with relevant services and connect support to meaningful achievement stories.']
];
function applyTranslations(){
 document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 $$('[data-ar][data-en]').forEach(el=>el.innerHTML=el.dataset[lang]);
 $('#language').innerHTML=t('EN <span>↗</span>','العربية <span>↗</span>');
 $('#language').setAttribute('aria-label',t('Switch to English','التبديل للعربية'));
 $('#menu-button').setAttribute('aria-label',t('فتح القائمة','Open menu'));
 $('#main-nav').setAttribute('aria-label',t('التنقل الرئيسي','Main navigation'));
 $('#experience-tabs').setAttribute('aria-label',t('أقسام التطبيق','App sections'));
 $('#sport-selector').setAttribute('aria-label',t('الرياضات','Sports'));
 $('#modal-close').setAttribute('aria-label',t('إغلاق','Close'));
 $('#modal').setAttribute('aria-label',t('معاينة SPORTIX','SPORTIX preview'));
 $('#phone-nav').setAttribute('aria-label',t('معاينة أقسام التطبيق','App section preview'));
 $('.scroll-cue').setAttribute('aria-label',t('اكتشف المزيد','Discover more'));
 $('.back-top').setAttribute('aria-label',t('إلى الأعلى','Back to top'));
 $('.hero-photo').alt=t('رياضي ينطلق بالكرة في ملعب مضاء ليلًا','An athlete sprints with a football on a floodlit pitch');
 $('.athlete-avatar img').alt=t('صورة رياضي توضيحية','Illustrative athlete portrait');
 document.title=t('SPORTIX ECOSYSTEM — عالمك الرياضي','SPORTIX ECOSYSTEM — Your Sporting World');
 renderMainCommunityPost();renderTabs();renderPhone();renderSports();renderNetwork();updateLike();
}
function renderTabs(){
 $('#experience-tabs').innerHTML=tabs.map((tab,i)=>`<button id="tab-${tab.id}" class="experience-tab ${activeTab===tab.id?'active':''}" role="tab" aria-selected="${activeTab===tab.id}" aria-controls="phone-screen" tabindex="${activeTab===tab.id?'0':'-1'}" data-tab="${tab.id}"><span>0${i+1}</span><span><b class="tab-full">${t(tab.titleAr,tab.titleEn)}</b><b class="tab-short">${t(tab.ar,tab.en)}</b><small>${t(tab.descAr,tab.descEn)}</small></span>${icon('arrow')}</button>`).join('');
 $('#phone-nav').innerHTML=tabs.map(tab=>`<button data-tab="${tab.id}" class="${activeTab===tab.id?'active':''}" aria-label="${t(tab.ar,tab.en)}" ${activeTab===tab.id?'aria-current="true"':''}>${icon(tab.icon)}<span>${t(tab.ar,tab.en)}</span></button>`).join('');
}
const phoneRow=(ic,title,sub,end='↗')=>`<div class="phone-row"><span class="row-icon">${icon(ic)}</span><div><b>${title}</b><small>${sub}</small></div><span>${end}</span></div>`;
function renderPhone(){
 const screen=$('#phone-screen');screen.setAttribute('aria-labelledby',`tab-${activeTab}`);
 const demo=`<span class="demo-tag">${t('معاينة توضيحية','ILLUSTRATIVE PREVIEW')}</span>`;
 let html='';
 if(activeTab==='home')html=`<div class="greeting">${t('أهلًا عمر، لنصنع تقدمًا اليوم','Hello Omar. Let’s make progress today.')}</div><h3>${t('يوم جديد. فرصة أكبر.','New day. New possibilities.')}</h3><div class="phone-photo-card"><img src="assets/athlete-hero.png" alt=""><div><small>GO SPORTIX</small><b>${t('جاهز لخطوتك القادمة؟','Ready for your next move?')}</b><button class="micro-action" data-tab="go">${t('انطلق الآن','Let’s go')} ←</button></div></div><h4>${t('خطتك القادمة','Your next moves')}</h4>${phoneRow('bolt',t('جلسة تدريب كرة القدم','Football training'),t('مثال · خطة هذا الأسبوع','Example · This week’s plan'))}${phoneRow('people',t('مجموعة محبي كرة القدم','Football community'),t('اكتشف الأنشطة والمشاركات','Discover activities and stories'))}${demo}`;
 if(activeTab==='community')html=renderCommunityPhone(demo);
 if(activeTab==='go')html=`${demo}<h3>${t('حان وقت الحركة.','Time to move.')}</h3><p>${t('اختر نشاطك. ابدأ من حيث أنت.','Choose your activity. Start where you are.')}</p><div class="go-circle">${icon('bolt')}<b>GO SPORTIX</b><small>${t('رحلتك تبدأ بخطوة','Your journey starts with a step')}</small></div><div class="go-select"><span>${t('كرة القدم','Football')}</span><span>${t('المشي','Walking')}</span><span>${t('الدراجات','Cycling')}</span></div><button class="micro-action wide" data-go-demo>${t('استكشف خطة نشاط','Explore an activity plan')} ←</button><div id="activity-demo"></div>${phoneRow('people','SPORTIX ROOMS',t('موعد، مكان، وأشخاص يشاركونك النشاط','A time, a place, people to play with'))}`;
 if(activeTab==='market')html=`${demo}<h3>${t('كل ما تحتاجه.','Your next move, covered.')}</h3><p>${t('اكتشف · ملاعب · تدريب · متجر · عروض · أثر','Explore · Venues · Training · Shop · Offers · Impact')}</p><div class="phone-offer">${icon('home')}<div><b>${t('مساحة تلعب فيها','A place to play')}</b><small>${t('اكتشاف الملاعب والحجوزات','Venue discovery and bookings')}</small></div></div><div class="phone-offer">${icon('user')}<div><b>${t('مدرب يساعدك تتطور','A coach to help you grow')}</b><small>${t('أكاديميات وبرامج تدريب','Academies and training programmes')}</small></div></div><div class="phone-offer">${icon('bag')}<div><b>${t('مستلزمات رحلتك','Gear for your journey')}</b><small>${t('منتجات وعروض الشركاء','Partner products and offers')}</small></div></div><div class="mini-plan"><b>SPORTIX POINT</b><p>${t('مزايا للأنشطة المؤهلة وفق سياسة البرنامج والشركاء.','Benefits for eligible activity, subject to programme and partner rules.')}</p></div>`;
 if(activeTab==='id')html=`${demo}<div class="phone-profile"><span class="profile-initial">O</span><b>${t('عمر الأحمد','Omar Al Ahmad')}</b><small>SX / DEMO / 0008 · ${t('كرة القدم','Football')}</small></div><div class="phone-stat-grid"><div><b>12</b><small>${t('جلسة','Sessions')}</small></div><div><b>04</b><small>${t('أهداف','Goals')}</small></div><div><b>02</b><small>${t('رياضة','Sports')}</small></div></div><h4>${t('مثال على متابعة الانتظام','Illustrative consistency trend')}</h4><div class="mini-chart" aria-label="${t('رسم توضيحي لانتظام الجلسات وليس بيانات حقيقية','Illustrative session consistency chart, not real data')}"><span style="height:30%"></span><span style="height:50%"></span><span style="height:42%"></span><span style="height:70%"></span><span style="height:88%"></span><span style="height:76%"></span></div><div class="chart-label">${t('بيانات نموذجية لستة أسابيع','Sample data for six weeks')}</div><button class="micro-action wide" data-open="identity" style="margin-top:20px">${t('جرّب بطاقة باسمك','Try a card with your name')} ←</button>`;
 screen.innerHTML=html;screen.scrollTop=0;
}
function chooseTab(id,focus=false){if(!tabs.some(t=>t.id===id))return;activeTab=id;renderTabs();renderPhone();if(focus)$(`#tab-${id}`).focus()}
function renderSports(){
 $('#sport-selector').innerHTML=sports.map((s,i)=>`<button id="sport-${i}" class="sport-tab ${i===activeSport?'active':''}" role="tab" aria-selected="${i===activeSport}" aria-controls="sport-panel" tabindex="${i===activeSport?'0':'-1'}" data-sport="${i}"><span class="sport-num">0${i+1}</span><span>${t(s.ar,s.en)}</span></button>`).join('');
 const s=sports[activeSport];$('#sport-panel').setAttribute('aria-labelledby',`sport-${activeSport}`);
 $('#sport-panel').innerHTML=`<div><small>${s.code} / SPORTIX</small><h3>${t(s.ar,s.en)}</h3></div><p>${t(s.arText,s.enText)}</p><button class="inline-link" data-open="identity"><span>${t('جرّب هويتك الرياضية','Try your SPORT ID')}</span>${icon('arrow')}</button>`;
}
function renderNetwork(){
 $('#ecosystem-rows').innerHTML=network.map((n,i)=>`<div class="ecosystem-row"><button aria-expanded="${i===0}" aria-controls="network-${i}" data-network="${i}"><span class="ecosystem-index">0${i+1}</span><h3>${t(n[0],n[1])}</h3><span class="ecosystem-subtitle">${t(n[2],n[3])}</span><span class="row-plus" aria-hidden="true">+</span></button><div class="ecosystem-detail" id="network-${i}" ${i===0?'':'hidden'}>${t(n[4],n[5])}</div></div>`).join('');
}
function showToast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function closeModal(){$('#modal').close()}
function openModal(type,opener){
 modalOpener=opener||document.activeElement;
 if(type==='identity')renderIdentityForm();else if(type==='comments')renderCommentsForm();else if(type==='share')renderShareForm();else renderSponsorForm();
 $('#modal').showModal();document.body.classList.add('modal-open');
}
function renderIdentityForm(){
 let existing=null;try{existing=JSON.parse(safeStore.get('sportix-demo-id')||'null')}catch{}
 $('#modal-body').innerHTML=`<span class="modal-kicker">YOUR SPORT ID / PREVIEW</span><h2 class="modal-title">${t('هويتك تبدأ بقصتك.','Your identity starts with you.')}</h2><p class="modal-copy">${t('أنشئ بطاقة توضيحية باسمك واكتشف فكرة SPORT ID. هذه تجربة محلية وليست تسجيلًا فعليًا في المنصة.','Create an illustrative card with your name and explore SPORT ID. This is a local demo, not an actual platform registration.')}</p><form class="modal-form" id="identity-form"><label class="field-label">${t('الاسم الذي تريد عرضه','Your display name')}<input id="display-name" name="display-name" required maxlength="40" autocomplete="off" placeholder="${t('اكتب اسمك','Enter your name')}" value="${escapeHTML(existing?.name||'')}"></label><label class="field-label">${t('رياضتك','Your sport')}<select name="sport" id="id-sport">${sports.map((s,i)=>`<option value="${i}" ${i===(existing?.sport ?? activeSport)?'selected':''}>${t(s.ar,s.en)}</option>`).join('')}</select></label><button class="button lime" type="submit">${t('اعرض بطاقتي التجريبية','Create my demo card')}${icon('arrow')}</button><small>${t('يحفظ الاسم والرياضة في هذا المتصفح فقط. لا نرسل البيانات إلى أي جهة.','Your name and sport are stored only in this browser. No data is sent to another party.')}</small></form>`;
}
function renderIdentityResult(data){
 const s=sports[data.sport];
 $('#modal-body').innerHTML=`<div class="success-mark">${icon('check')}</div><h2 class="modal-title">${t('بطاقتك التجريبية جاهزة.','Your demo card is ready.')}</h2><div class="result-id"><img class="result-logo" src="assets/sportix-ecosystem-transparent.png" alt="SPORTIX ECOSYSTEM" width="92" height="84"><strong>SPORT ID</strong><b id="result-name"></b><span>${t(s.ar,s.en)}</span><small>DEMO PROFILE · LOCAL PREVIEW</small></div><p class="modal-copy">${t('في رؤية SPORTIX، تنمو هذه الهوية مع نشاطك وأدائك وإنجازاتك وفرصك. البطاقة الحالية توضيحية وغير موثقة.','In the SPORTIX vision, this identity grows with your activity, performance, achievements and opportunities. This card is illustrative and unverified.')}</p><div class="modal-actions"><button class="button lime" id="download-id">${t('تنزيل البطاقة التوضيحية','Download demo profile')}${icon('arrow')}</button><button class="button black" id="edit-id">${t('تعديل','Edit')}</button></div>`;
 $('#result-name').textContent=data.name;
 $('.modal-title').tabIndex=-1;$('.modal-title').focus();
 $('#download-id').addEventListener('click',()=>{const payload={product:'SPORTIX ECOSYSTEM',type:'SPORT ID — illustrative local demo',verified:false,name:data.name,sport:s.code,notice:'This is a portfolio demo, not an account or official sporting identity.'};const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='SPORTIX_DEMO_PROFILE.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
 $('#edit-id').addEventListener('click',renderIdentityForm);
}
function renderSponsorForm(){renderSupportForm()}
function updateLike(){syncCommunityActions()}
document.addEventListener('click',event=>{
 const target=event.target.closest('button,a');if(!target)return;
 if(target.dataset.tab){const id=target.dataset.tab;const nav=Boolean(target.closest('#phone-nav'));chooseTab(id,target.getAttribute('role')==='tab');if(nav)$(`#phone-nav [data-tab="${id}"]`).focus();return}
 if(target.dataset.open){openModal(target.dataset.open,target);return}
 if(target.hasAttribute('data-sport')){activeSport=Number(target.dataset.sport);renderSports();$(`#sport-${activeSport}`).focus();return}
 if(target.hasAttribute('data-network')){const open=target.getAttribute('aria-expanded')==='true';target.setAttribute('aria-expanded',String(!open));$(`#network-${target.dataset.network}`).hidden=open;return}
 if(target.hasAttribute('data-role')){sponsorRole=target.dataset.role;$$('[data-role]').forEach(b=>{const yes=b.dataset.role===sponsorRole;b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes))});return}
 if(target.hasAttribute('data-go-demo')){$('#activity-demo').innerHTML=`<div class="mini-plan"><b>${t('خطة مقترحة للتوضيح','Illustrative activity plan')}</b><p>${t('اختر الرياضة والمكان والوقت، ثم حدد مشاركتك مع أصدقائك. بدء الجلسة وتسجيلها متاحان عند تشغيل المنتج.','Choose a sport, place and time, then choose who to join. Session recording will be available when the product is operational.')}</p></div>`;target.hidden=true;return}
 if(target.closest('#main-nav')){$('#main-nav').classList.remove('open');$('#menu-button').setAttribute('aria-expanded','false')}
});
$('#language').addEventListener('click',()=>{lang=lang==='ar'?'en':'ar';safeStore.set('sportix-portfolio-language',lang);applyTranslations()});
$('#menu-button').addEventListener('click',()=>{const open=$('#main-nav').classList.toggle('open');$('#menu-button').setAttribute('aria-expanded',String(open))});
$('#modal-close').addEventListener('click',closeModal);
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal()}});
$('#modal').addEventListener('close',()=>{document.body.classList.remove('modal-open');modalOpener?.focus()});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){$('#main-nav').classList.remove('open');$('#menu-button').setAttribute('aria-expanded','false')}
 const tab=e.target.closest('[role=tab]');if(!tab)return;
 const group=tab.closest('[role=tablist]');const items=$$('[role=tab]',group);let i=items.indexOf(tab);
 if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();
 if(e.key==='Home')i=0;else if(e.key==='End')i=items.length-1;else i=(i+(e.key==='ArrowRight'?(lang==='ar'?-1:1):(lang==='ar'?1:-1))+items.length)%items.length;
 if(group.id==='experience-tabs')chooseTab(items[i].dataset.tab,true);else{activeSport=Number(items[i].dataset.sport);renderSports();$(`#sport-${activeSport}`).focus()}
});
document.addEventListener('submit',e=>{
 if(e.target.id==='identity-form'){e.preventDefault();const name=$('#display-name').value.trim();if(!name){$('#display-name').setCustomValidity(t('اكتب اسمًا لبطاقتك','Enter a name for your card'));$('#display-name').reportValidity();return}const data={name,sport:Number($('#id-sport').value)};safeStore.set('sportix-demo-id',JSON.stringify(data));renderIdentityResult(data)}
 if(e.target.id==='sponsor-form')previewSupport(e);
});
document.addEventListener('input',e=>{if(e.target.id==='display-name')e.target.setCustomValidity('')});
applyTranslations();
