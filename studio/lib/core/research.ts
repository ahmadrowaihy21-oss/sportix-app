export function buildQuestions(p:{project:string;age:string;gender:string;culture:string;language:string;tone:string}) {
 const ar=p.language==='Arabic'; const simple=p.tone==='Simple'||p.age==='Under 18';
 const money=p.culture==='Saudi Arabia'?(ar?'الريال السعودي':'Saudi riyals'):(ar?'عملتك المحلية':'your local currency');
 const greeting=ar?(p.gender==='Feminine address'?'أهلًا بكِ':p.gender==='Masculine address'?'أهلًا بكَ':'أهلًا وسهلًا'):(p.tone==='Professional'?'Hello,':'Hi,');
 const intro=ar?`${greeting}، ندرس احتياجات العملاء لتطوير ${p.project}. المشاركة اختيارية، ويمكن تخطي أي سؤال. لا نطلب بيانات حساسة. نبحث عن رأيك الصريح؛ لا توجد إجابات صحيحة أو خاطئة.`:`${greeting} we are learning about customer needs for ${p.project}. Taking part is optional, and you can skip any question. Please do not share sensitive information. We want your honest experience; there are no right or wrong answers.`;
 const qs=ar?[
  simple?'ما المشكلة التي تحاول حلها في هذا المجال؟':'حدثنا عن آخر مرة واجهت فيها المشكلة التي يستهدفها هذا المشروع. ما الذي حدث؟',
  'كيف تتعامل مع هذه الحاجة حاليًا؟ وما البدائل التي جربتها؟',
  'ما أكثر خطوة تستغرق وقتًا أو تسبب لك صعوبة؟ ولماذا؟',
  'ما النتيجة التي تجعل الحل مفيدًا لك؟ وكيف تعرف أنه نجح؟',
  `إذا كانت الخدمة مدفوعة، كيف تقارن قيمتها بالبدائل؟ يمكنك ذكر مبلغ مناسب بـ${money}، أو اختيار عدم الدفع.`,
  'ما اللغة وطريقة التواصل واعتبارات الخصوصية التي تفضلها؟',
  'هل ترغب في تجربة نموذج أولي لاحقًا؟ يمكنك الرفض دون أي التزام.'
 ]:[
  simple?'What problem would you like help with in this area?':'Tell us about the last time you faced the problem this project aims to address. What happened?',
  'How do you handle this need today? Which alternatives have you tried?',
  'Which step takes the most time or creates difficulty, and why?',
  'What outcome would make a solution useful to you? How would you know it worked?',
  `If this were a paid service, how would you compare its value with alternatives? You may suggest an amount in ${money}, or choose not to pay.`,
  'What language, contact method and privacy preferences should we respect?',
  'Would you be interested in trying a prototype later? It is fine to decline.'
 ];
 if(p.age==='Under 18')qs.splice(4,1,ar?'ما الذي يجب أن يعرفه ولي أمرك قبل تجربة الخدمة؟':'What should your parent or guardian know before you try the service?');
 return intro+'\n\n'+qs.map((q,i)=>`${i+1}. ${q}`).join('\n\n')+'\n\n'+(ar?'شكرًا لوقتك. لن يتم التواصل معك لاحقًا دون موافقتك.':'Thank you for your time. We will not follow up without your permission.');
}
