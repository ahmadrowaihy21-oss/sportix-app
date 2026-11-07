'use strict';
const form=document.getElementById('booking-form'),slots=document.getElementById('slots');
const court=document.getElementById('court'),confirmBox=document.getElementById('confirmation'),note=document.querySelector('.booking-note');
const schedules={
  'Al Nakheel':{'Morning':['08:00','09:30','11:00'],'Evening':['17:00','18:30','20:00']},
  'Al Waha':{'Morning':['07:30','09:00','10:30'],'Evening':['16:30','19:00','21:00']}
};
const period=()=>form.elements.period.value;
function summary(){
  document.getElementById('booking-title').textContent='Court '+court.value;
  document.getElementById('booking-time').textContent='Time '+form.elements.slot.value+' · Time of day '+period();
}
function refreshSlots(){
  slots.replaceChildren(...schedules[court.value][period()].map((time,i)=>{
    const label=document.createElement('label'),radio=document.createElement('input');
    radio.type='radio';radio.name='slot';radio.value=time;radio.checked=i===0;radio.required=true;
    const value=document.createElement('bdi');value.textContent=time;
    label.append(radio,value);return label;
  }));summary();
}
form.onchange=e=>e.target.name==='slot'?summary():refreshSlots();
form.onsubmit=e=>{
  e.preventDefault();const time=form.elements.slot.value;
  if(!schedules[court.value][period()].includes(time))return;
  document.getElementById('receipt').textContent='Court '+court.value+', at '+time+' · Time of day '+period()+'.';
  form.hidden=true;note.hidden=true;confirmBox.hidden=false;confirmBox.focus();
};
document.getElementById('restart').onclick=()=>{confirmBox.hidden=true;form.hidden=false;note.hidden=false;form.reset();refreshSlots();court.focus();};
refreshSlots();
