export function orderStatusLabel(order){
 if(order.fulfillmentMode==='manual'&&order.status==='review')return 'Founder analysis and report preparation';
 return ({requested:'Scope review',reviewing:'Scope review',quoted:'Awaiting quote approval',accepted:'Awaiting payment confirmation',paid:'Preparing production',starting:'Starting production',running:'Preparing draft',review:'Founder review and refinement',failed:'Production needs attention',unknown:'Verifying production status',delivered:'Delivered'})[order.status]||order.status;
}
const messages={
 'تعذّر إتمام الطلب.':'Could not complete the request.',
 'أكمل بيانات الطلب ضمن الطول المسموح.':'Complete the required details within the allowed length.',
 'يمكنك إرسال عشرة طلبات يوميًا. تابع طلباتك الحالية.':'You can submit up to ten requests per day. Follow your existing requests for now.',
 'معرّف الطلب مستخدم لطلب مختلف.':'This request ID is already used for different details. Refresh and try again.',
 'راجع الخدمة الحالية ووافق على حفظ الطلب والتواصل.':'Review the current service and consent to saving the request and being contacted.',
 'تم تحديث الطلب. أعد تحميل القائمة.':'The request was updated. Reload the list.',
 'تغيّر الطلب أثناء الحفظ. أعد تحميله.':'The request changed while saving. Reload it.',
 'يلزم اعتماد النطاق والسعر الحاليين صراحةً.':'Explicitly approve the current scope and price.',
 'السداد يجب أن يطابق إجمالي العرض المعتمد.':'Payment must match the total of the approved quote.',
 'يلزم عرض معتمد وتأكيد استلام السداد.':'An approved quote and confirmed payment receipt are required.',
 'قيمة العرض غير صالحة أو أقل من سعر الخدمة.':'The quote amount is invalid or below the service price.',
 'اعتماد العرض لصاحب الطلب.':'Only the request owner can approve the quote.',
 'الطلب غير متاح.':'This request is unavailable.',
 'اختر خدمة متاحة.':'Choose an available service.',
 'الملف غير متاح.':'This project is unavailable.',
 'قائمة المراجعة مخصصة للفريق.':'The review queue is restricted to the studio team.'
};
export function englishError(message,code){
 if(messages[message])return messages[message];
 if(!/[\u0620-\u064a]/.test(message||''))return message||'Could not complete the request. Please try again.';
 return ({google_setup:'Google sign-in is awaiting configuration.',google_required:'Sign in with Google to continue.',auth_required:'Sign in to continue.',revision_conflict:'This record has changed. Refresh before trying again.',service_consent:'Review the current service and confirm your consent.',insufficient_credits:'There are not enough processing credits. Open your wallet to continue.'})[code]||'Could not complete this request. Check your details and sign-in status, then try again.';
}
