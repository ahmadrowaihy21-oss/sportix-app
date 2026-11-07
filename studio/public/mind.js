import {request} from './member-nav.js';
const $=id=>document.getElementById(id);
let providers=[],messages=[],busy=false;
function refresh(){
  const p=providers.find(p=>p.id===$('advisor').value);
  $('provider-state').textContent=!providers.length?'Sign in to check advisor availability.':p?.configured?'Configured · availability is verified when you send a request.':'Awaiting secure setup by the site owner.';
  $('consent-text').textContent=`I agree to send this conversation to ${$('advisor').value==='grok'?'xAI (Grok)':'OpenAI'} for an AI response.`;
  $('mind-send').disabled=busy||!p?.configured;
  $('advisor').disabled=busy;$('new-conversation').disabled=busy;$('question').disabled=busy;
  document.querySelectorAll('[data-prompt]').forEach(b=>b.disabled=busy);
}
function reset(){messages=[];$('conversation').replaceChildren();$('mind-consent').checked=false;$('mind-status').textContent='';refresh();}
function message(role,text,label){
  const block=document.createElement('div');block.className='mind-message';block.dataset.role=role;block.dir='auto';
  const title=document.createElement('strong');title.textContent=role==='user'?'YOU':`ROWAIHY MIND · ${label}`;
  block.append(title,document.createTextNode(text));$('conversation').append(block);block.scrollIntoView({block:'nearest'});
}
$('advisor').addEventListener('change',reset);$('new-conversation').addEventListener('click',reset);
document.querySelectorAll('[data-prompt]').forEach(b=>b.addEventListener('click',()=>{$('question').value=b.dataset.prompt;$('question').focus();}));
$('mind-form').addEventListener('submit',async e=>{
  e.preventDefault();if(busy||!$('mind-consent').checked||$('mind-send').disabled)return;
  const content=$('question').value.trim();if(!content)return;
  if(messages.length>=14){$('mind-status').textContent='Start a new conversation to continue after seven exchanges.';return;}
  const input=[...messages,{role:'user',content}];
  if(input.reduce((n,m)=>n+m.content.length,0)>36000){$('mind-status').textContent='This conversation is too long. Start a new conversation with a shorter summary.';return;}
  const provider=$('advisor').value;busy=true;refresh();$('mind-status').textContent='Your advisor is considering the question…';
  try{
    const answer=await request('mind/chat',{provider,consent:provider,messages:input});
    $('conversation').querySelector('.mind-empty')?.remove();
    message('user',content);message('assistant',answer.text,answer.label);messages=[...input,{role:'assistant',content:answer.text}];
    $('question').value='';$('mind-status').textContent='Recommendation ready for your review.';
  }catch(error){$('mind-status').textContent=['signin','google_signin'].includes(error.code)?'Sign in with your authorized studio account to use an advisor.':error.message;if(['signin','google_signin'].includes(error.code))$('mind-signin').hidden=false;}
  finally{busy=false;refresh();}
});
try{({providers}=await request('mind/providers'));}catch(error){$('mind-status').textContent=['signin','google_signin'].includes(error.code)?'Sign in with your authorized studio account to use an advisor.':error.message;if(['signin','google_signin'].includes(error.code))$('mind-signin').hidden=false;}finally{refresh();}
