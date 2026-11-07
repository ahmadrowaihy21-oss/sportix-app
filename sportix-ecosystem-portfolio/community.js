'use strict';

// Portfolio interactions are local previews. No posts, money or points are sent.
const communityState={liked:false,comments:[],media:null};
const portfolioPostURL=new URL('/#achievement-post',window.location.origin).href;
const supportModes={
 money:{ar:'دعم مالي',en:'Financial support',descAr:'مبلغ بالريال السعودي لدعم الرياضي.',descEn:'An amount in Saudi riyals to support the athlete.'},
 points:{ar:'دعم بالنقاط',en:'Support with points',descAr:'نقاط SPORTIX للاستخدامات المؤهلة عبر الرياضات.',descEn:'SPORTIX points for eligible uses across sports.'},
 sport_points:{ar:'نقاط لرياضة واحدة',en:'Points for one sport',descAr:'يحدد الداعم رياضة واحدة؛ تُستخدم النقاط فيها فقط.',descEn:'The supporter chooses one sport; these points can only be used in that sport.'}
};

function communityActionsMarkup(){
 return `<div class="community-actions" aria-label="${t('التفاعل مع منشور الإنجاز','Achievement post actions')}">
 <button type="button" class="community-action community-like" data-post-action="like" aria-pressed="${communityState.liked}">${icon('heart')}<span>${t('لايك','Like')}<small class="community-like-count">${communityState.liked?' 1':''}</small></span></button>
 <button type="button" class="community-action" data-post-action="comment">${icon('comment')}<span>${t('كومنت','Comment')}<small class="community-comment-count">${communityState.comments.length?' '+communityState.comments.length:''}</small></span></button>
 <button type="button" class="community-action" data-post-action="share">${icon('share')}<span>${t('شير','Share')}</span></button>
 <button type="button" class="community-action community-sponsor" data-open="sponsor" aria-label="SPORTIX SPONSOR">${icon('bolt')}<span dir="ltr">SPORTIX<br>SPONSOR</span></button></div>`;
}
function communityMediaMarkup(compact=false){
 const cls=compact?'phone-post-media':'post-photo';
 if(communityState.media){
  const {type,url}=communityState.media;
  return `<div class="${cls} user-media">${type==='video'?`<video src="${url}" controls playsinline preload="metadata" aria-label="${t('فيديو الإنجاز — معاينة محلية','Achievement video — local preview')}"></video>`:`<img src="${url}" alt="${t('صورة الإنجاز — معاينة محلية','Achievement image — local preview')}">`}</div>`;
 }
 return `<div class="${cls}"><img src="assets/athlete-hero.png" alt="${t('صورة توضيحية لمنشور إنجاز رياضي','Illustrative sporting achievement post')}"><span class="post-badge">${icon('star')}<span>${t('منشور إنجاز · صورة','Achievement post · Photo')}</span></span>${compact?'':'<span class="post-graphic">KEEP<br>GOING.</span>'}</div>`;
}
function renderMainCommunityPost(){
 $('#achievement-media').innerHTML=communityMediaMarkup();
 $('#main-post-actions').innerHTML=communityActionsMarkup();
 const state=$('#media-preview-note');
 state.textContent=communityState.media?t('وسائطك تظهر في معاينة هذا المتصفح فقط؛ لم يتم رفعها أو نشرها.','Your media is previewed only in this browser; nothing is uploaded or published.'):t('جرّب منشورًا بصورة أو فيديو من جهازك.','Preview a post with an image or video from your device.');
 $('#clear-community-media').hidden=!communityState.media;
}
function renderCommunityPhone(demo){
 return `${demo}<h3>${t('شغفك يجمعنا.','Your passion connects us.')}</h3><p>${t('إنجازات · مجموعات · أشخاص','Achievements · Groups · People')}</p><div class="phone-community"><b>${t('عمر الأحمد · رحلة رياضي','Omar Al Ahmad · Athlete journey')}</b>${communityMediaMarkup(true)}<p>${t('أكملت هدفي التدريبي لهذا الأسبوع. هذه بداية الفصل القادم.','Reached my training goal this week. This is the start of my next chapter.')}</p>${communityActionsMarkup()}<button class="phone-media-picker" data-select-media>${icon('camera')}${t('جرّب صورة أو فيديو','Try an image or video')}</button></div>${phoneRow('people',t('مجتمعك الرياضي','Your sporting community'),t('دعم مالي · نقاط · نقاط لرياضة واحدة','Financial support · Points · Sport-specific points'))}`;
}
function syncCommunityActions(){
 $$('.community-like').forEach(b=>b.setAttribute('aria-pressed',String(communityState.liked)));
 $$('.community-like-count').forEach(el=>el.textContent=communityState.liked?' 1':'');
 $$('.community-comment-count').forEach(el=>el.textContent=communityState.comments.length?' '+communityState.comments.length:'');
}
function renderCommentList(){
 const list=$('#community-comment-list');if(!list)return;
 list.innerHTML=communityState.comments.length?communityState.comments.map(text=>`<article class="local-comment"><b>${t('أنت · تعليق تجريبي','You · Demo comment')}</b><p>${escapeHTML(text)}</p></article>`).join(''):`<p class="empty-comments">${t('كن أول من يشجّع الرياضي بتعليق.','Be the first to encourage the athlete with a comment.')}</p>`;
}
function renderCommentsForm(){
 $('#modal-body').innerHTML=`<span class="modal-kicker">SPORTIX COMMUNITY / COMMENTS</span><h2 class="modal-title">${t('كلمة تدفعه للأمام.','A word of encouragement.')}</h2><p class="modal-copy">${t('التعليقات هنا تجربة محلية في هذه الجلسة، ولا تُنشر للمجتمع.','Comments here are local to this session and are not published to the community.')}</p><div id="community-comment-list" class="community-comment-list" aria-live="polite"></div><form id="community-comment-form" class="modal-form"><label class="field-label" for="community-comment">${t('تعليقك','Your comment')}</label><textarea id="community-comment" name="comment" required maxlength="500" rows="3" placeholder="${t('اكتب تعليقًا يدعم الرياضي…','Write something encouraging…')}"></textarea><button class="button lime" type="submit">${t('أضف تعليقًا تجريبيًا','Add a demo comment')}${icon('comment')}</button></form>`;
 renderCommentList();
}
function renderShareForm(){
 $('#modal-body').innerHTML=`<span class="modal-kicker">SPORTIX COMMUNITY / SHARE</span><h2 class="modal-title">${t('شارك قصة الإنجاز.','Share the achievement.')}</h2><p class="modal-copy">${t('انسخ رابط المنشور التوضيحي وشاركه بالطريقة التي تفضلها. مشاركة الرابط لا تمنح الآخرين صلاحية دخول جديدة للموقع.','Copy the illustrative post link and share it however you prefer. Sharing a link does not grant others new access to this site.')}</p><label class="field-label" for="share-post-url">${t('رابط المنشور','Post link')}</label><input class="share-post-url" id="share-post-url" readonly dir="ltr" value="${portfolioPostURL}"><button class="button lime" id="copy-post-link" type="button">${t('انسخ الرابط','Copy link')}${icon('share')}</button><p class="share-status" id="share-status" role="status"></p>`;
}
function renderSupportForm(){
 $('#modal-body').innerHTML=`<span class="modal-kicker">SPORTIX SPONSOR / PREVIEW</span><h2 class="modal-title">${t('اختر كيف تدعمه.','Choose how to support.')}</h2><p class="modal-copy">${t('ادعم الرياضي من منشور إنجازه: ماليًا، بالنقاط، أو بنقاط مخصصة لرياضة واحدة.','Support an athlete from their achievement post: with money, points, or points restricted to one sport.')}</p><div class="modal-choice"><button type="button" data-role="individual" class="${sponsorRole==='individual'?'selected':''}" aria-pressed="${sponsorRole==='individual'}">${t('أنا فرد','I’m an individual')}</button><button type="button" data-role="partner" class="${sponsorRole==='partner'?'selected':''}" aria-pressed="${sponsorRole==='partner'}">${t('أنا شريك SPORTIX','I’m a SPORTIX partner')}</button></div><form class="modal-form" id="sponsor-form"><fieldset class="support-mode-options"><legend>${t('نوع الدعم','Support type')}</legend>${Object.entries(supportModes).map(([value,m],i)=>`<label class="support-mode-option"><input type="radio" name="support-mode" value="${value}" ${i===0?'checked':''}><span><b>${t(m.ar,m.en)}</b><small>${t(m.descAr,m.descEn)}</small></span></label>`).join('')}</fieldset><label class="field-label" for="support-amount" id="support-amount-label">${t('المبلغ بالريال السعودي','Amount in Saudi riyals')}</label><div class="support-amount-row"><input id="support-amount" type="number" name="amount" required min="0.01" step="0.01" inputmode="decimal" placeholder="0.00"><span id="support-unit">SAR</span></div><div id="support-sport-field" hidden><label class="field-label" for="support-sport">${t('الرياضة المسموح استخدام النقاط فيها','The only sport these points can be used for')}</label><select id="support-sport" name="sport" disabled><option value="">${t('اختر رياضة واحدة','Choose one sport')}</option>${sports.map(s=>`<option value="${s.code}">${t(s.ar,s.en)}</option>`).join('')}</select><p class="support-restriction" id="support-restriction">${t('هذه النقاط لا تُستخدم في رياضة أخرى.','These points cannot be used for another sport.')}</p></div><p class="support-field-note" id="support-field-note">${t('معاينة دعم مالي مباشر للرياضي.','Preview direct financial support for the athlete.')}</p><button class="button lime" type="submit">${t('معاينة الدعم','Preview support')}${icon('arrow')}</button><small>${t('تجربة توضيحية فقط: لا يتم دفع أموال، أو خصم نقاط، أو تحويل رصيد.','Illustrative preview only: no money is paid, no points are deducted and no balance is transferred.')}</small></form>`;
}
function updateSupportFields(){
 const mode=$('input[name="support-mode"]:checked').value;
 const money=mode==='money',restricted=mode==='sport_points';
 const amount=$('#support-amount'),sport=$('#support-sport');
 amount.value='';amount.setCustomValidity('');amount.min=money?'0.01':'1';amount.step=money?'0.01':'1';amount.inputMode=money?'decimal':'numeric';amount.placeholder=money?'0.00':'0';
 $('#support-amount-label').textContent=money?t('المبلغ بالريال السعودي','Amount in Saudi riyals'):t('عدد نقاط SPORTIX','Number of SPORTIX points');
 $('#support-unit').textContent=money?'SAR':'POINT';
 $('#support-sport-field').hidden=!restricted;sport.disabled=!restricted;sport.required=restricted;if(!restricted)sport.value='';
 $('#support-field-note').textContent=money?t('معاينة دعم مالي مباشر للرياضي.','Preview direct financial support for the athlete.'):restricted?t('سيظهر اسم الرياضة مع الدعم، ويقتصر استخدام هذه النقاط عليها.','The sport will appear with the support, and use of these points is restricted to it.'):t('نقاط غير مخصصة لرياضة بعينها، ضمن الاستخدامات المؤهلة في SPORTIX.','Points not restricted to a particular sport, within eligible SPORTIX uses.');
}
function validateSupportSelection(mode,rawAmount,sport){
 const value=Number(rawAmount),money=mode==='money';
 if(!Object.hasOwn(supportModes,mode)||!rawAmount.trim()||!Number.isFinite(value)||value<=0||value>Number.MAX_SAFE_INTEGER)return null;
 if(money?Math.abs(value*100-Math.round(value*100))>0.000001:!Number.isSafeInteger(value))return null;
 if(mode==='sport_points'&&!sports.some(s=>s.code===sport))return null;
 return {mode,amount:value,sport:mode==='sport_points'?sport:null,role:sponsorRole};
}
function previewSupport(event){
 event.preventDefault();const input=$('#support-amount');input.setCustomValidity('');
 const data=validateSupportSelection($('input[name="support-mode"]:checked').value,input.value,$('#support-sport').value);
 if(!data){input.setCustomValidity(t('أدخل مبلغًا موجبًا بمنزلتين عشريتين كحد أقصى، أو عدد نقاط صحيحًا وموجبًا، وحدد الرياضة للدعم المخصص.','Enter a positive amount with at most two decimal places, or a positive whole number of points; select a sport for restricted support.'));input.reportValidity();return}
 const mode=supportModes[data.mode],selectedSport=sports.find(s=>s.code===data.sport);
 const formatted=new Intl.NumberFormat(lang==='ar'?'ar-SA':'en',{maximumFractionDigits:data.mode==='money'?2:0}).format(data.amount);
 const unit=data.mode==='money'?t('ريال سعودي','SAR'):t('نقطة SPORTIX','SPORTIX points');
 $('#modal-body').innerHTML=`<span class="modal-kicker">SPORTIX SPONSOR / SUPPORT SUMMARY</span><h2 class="modal-title">${t('معاينة دعم الرياضي','Athlete support preview')}</h2><p class="modal-copy">${t('عمر الأحمد · منشور الإنجاز التدريبي','Omar Al Ahmad · Training achievement post')}</p><div class="support-summary"><span>${t(mode.ar,mode.en)}</span><strong>${formatted}</strong><small>${unit}</small><span>${data.role==='partner'?t('داعم من شركاء SPORTIX','SPORTIX partner supporter'):t('داعم فرد','Individual supporter')}</span></div>${selectedSport?`<div class="restricted-summary">${icon('shield')}<div><b>${t('مخصصة لرياضة','Restricted to')} ${t(selectedSport.ar,selectedSport.en)} ${t('فقط','only')}</b><p>${t('تُستخدم هذه النقاط في الخدمات والمنتجات المؤهلة لهذه الرياضة فقط، ولا تُستخدم في رياضة أخرى.','These points can only be used for eligible services and products in this sport, not for any other sport.')}</p></div></div>`:data.mode==='points'?`<p class="support-restriction">${t('نقاط عامة للاستخدامات المؤهلة عبر الرياضات في SPORTIX.','General points for eligible uses across SPORTIX sports.')}</p>`:''}<p class="modal-copy support-preview-disclaimer">${t('هذه معاينة فقط. لم يُنفّذ أي دفع أو تحويل نقاط. الرعاية لا تغيّر تقييم الموهبة أو اعتماد الإنجاز.','This is a preview only. No payment or points transfer has occurred. Sponsorship does not alter talent evaluation or achievement verification.')}</p><div class="modal-actions"><button class="button lime" id="finish-sponsor">${t('العودة إلى المنشور','Back to the post')}${icon('arrow')}</button><button class="button black" id="edit-support">${t('اختيار دعم آخر','Choose other support')}</button></div>`;
 $('#finish-sponsor').addEventListener('click',closeModal);$('#edit-support').addEventListener('click',renderSupportForm);
 $('.modal-title').tabIndex=-1;$('.modal-title').focus();
}

document.addEventListener('click',async event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.dataset.postAction==='like'){communityState.liked=!communityState.liked;syncCommunityActions()}
 if(button.dataset.postAction==='comment')openModal('comments',button);
 if(button.dataset.postAction==='share')openModal('share',button);
 if(button.hasAttribute('data-select-media'))$('#community-media-input').click();
 if(button.id==='clear-community-media'){
  if(communityState.media)URL.revokeObjectURL(communityState.media.url);communityState.media=null;$('#community-media-input').value='';
  renderMainCommunityPost();if(activeTab==='community')renderPhone();
 }
 if(button.id==='copy-post-link'){
  try{await navigator.clipboard.writeText(portfolioPostURL);$('#share-status').textContent=t('تم نسخ رابط المنشور.','Post link copied.')}catch{$('#share-post-url').focus();$('#share-post-url').select();$('#share-status').textContent=t('حددنا الرابط لك؛ انسخه من الحقل.','The link is selected; copy it from the field.')}
 }
});
document.addEventListener('change',event=>{
 if(event.target.name==='support-mode')updateSupportFields();
 if(event.target.id!=='community-media-input')return;
 const file=event.target.files?.[0];if(!file)return;
 const kind=file.type.startsWith('image/')?'image':file.type.startsWith('video/')?'video':null;
 if(!kind||file.size>100*1024*1024){event.target.value='';showToast(t('اختر صورة أو فيديو بحجم أقل من 100 ميجابايت للمعاينة.','Choose an image or video under 100 MB for this preview.'));return}
 if(communityState.media)URL.revokeObjectURL(communityState.media.url);
 communityState.media={url:URL.createObjectURL(file),type:kind};renderMainCommunityPost();if(activeTab==='community')renderPhone();
});
document.addEventListener('submit',event=>{
 if(event.target.id!=='community-comment-form')return;
 event.preventDefault();const field=$('#community-comment'),value=field.value.trim();
 if(!value){field.setCustomValidity(t('اكتب تعليقًا أولًا.','Write a comment first.'));field.reportValidity();return}
 communityState.comments.push(value.slice(0,500));field.value='';renderCommentList();syncCommunityActions();field.focus();
});
document.addEventListener('input',event=>{if(['community-comment','support-amount'].includes(event.target.id))event.target.setCustomValidity('')});
document.addEventListener('error',event=>{
 if(event.target.tagName==='VIDEO'&&event.target.closest('.user-media'))showToast(t('تعذر تشغيل هذا التنسيق في متصفحك. جرّب فيديو MP4 أو WebM.','This video format could not play in your browser. Try MP4 or WebM.'));
},true);
