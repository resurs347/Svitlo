// Світло: добровільна підтримка через Telegram Stars. Окремий файл, нічого в app.js не змінює.
(function(){
var API='https://svitlo-bot.popkornrolovic.workers.dev/api';
var AMOUNTS=[50,100,250,500,1000];
var T={
 title:'Підтримати проєкт',
 desc:'Якщо застосунок виявився корисним, ви можете підтримати його розвиток. Будь-яка підтримка допомагає нам покращувати проєкт ❤️',
 btn:'Підтримати ⭐',
 pick:'Оберіть суму підтримки',
 free:'Це добровільно. Усі функції застосунку безкоштовні й працюють без оплати.',
 close:'Закрити',
 thanks:'Дякуємо за підтримку проєкту! ❤️',
 badge:'🏅 Підтримав проєкт',
 fail:'Не вдалося відкрити оплату. Спробуйте пізніше.',
 admin:'Статистика підтримки',
 total:'Підтримок',
 sum:'Всього Stars',
 last:'Останні платежі',
 none:'Поки немає платежів'
};
var tg,initData,view,sheet;

function el(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
function call(body){
 body.initData=initData;
 return fetch(API,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json();});
}
function css(){
 var s=document.createElement('style');
 s.textContent=
 '.sp-card{margin-top:22px;padding:16px;border-radius:18px;background:var(--card);border:1px solid var(--ln);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}'+
 '.sp-card h3{font-family:Unbounded,sans-serif;font-weight:500;font-size:15px;margin:0 0 8px}'+
 '.sp-card p{font-size:13px;line-height:1.55;color:var(--mu);margin:0 0 14px}'+
 '.sp-btn{width:100%;height:48px;border-radius:14px;border:1px solid var(--am);background:rgba(255,176,32,.16);color:var(--amtx);font-size:15px;font-weight:700}'+
 '.sp-btn:disabled{opacity:.5}'+
 '.sp-badge{display:inline-block;margin-bottom:10px;padding:5px 12px;border-radius:14px;font-size:12px;font-weight:700;color:var(--amtx);border:1px solid rgba(255,176,32,.5)}'+
 '.sp-ov{position:fixed;inset:0;z-index:50;background:rgba(3,6,16,.7);display:flex;align-items:flex-end;justify-content:center}'+
 '.sp-sheet{width:min(460px,100%);padding:20px 20px calc(20px + env(safe-area-inset-bottom,0px));border-radius:22px 22px 0 0;background:#0c1228;border:1px solid var(--ln);border-bottom:0}'+
 '.sp-sheet h3{font-family:Unbounded,sans-serif;font-weight:500;font-size:16px;margin:0 0 6px}'+
 '.sp-sheet p{font-size:12px;line-height:1.5;color:var(--mu);margin:0 0 14px}'+
 '.sp-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}'+
 '.sp-amt{height:54px;border-radius:14px;border:1px solid var(--ln);background:var(--card);font-size:17px;font-weight:700}'+
 '.sp-amt:disabled{opacity:.5}'+
 '.sp-x{width:100%;height:44px;margin-top:12px;border:0;background:none;color:var(--mu);font-size:14px;font-weight:700}'+
 '.sp-thx{font-size:18px;font-weight:700;text-align:center;padding:22px 0 8px}'+
 '.sp-row{display:flex;justify-content:space-between;font-size:13px;color:var(--mu);padding:6px 0;border-top:1px solid var(--ln)}'+
 '.sp-row b{color:var(--tx)}';
 document.head.appendChild(s);
}
function close(){if(sheet){sheet.remove();sheet=null;}}
function openSheet(){
 close();
 var ov=el('div','sp-ov');ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');
 var sh=el('div','sp-sheet');
 sh.appendChild(el('h3',null,T.pick));
 sh.appendChild(el('p',null,T.free));
 var g=el('div','sp-grid');
 AMOUNTS.forEach(function(a){
  var b=el('button','sp-amt',a+' ⭐');b.type='button';
  b.onclick=function(){pay(a,sh,g);};
  g.appendChild(b);
 });
 sh.appendChild(g);
 var x=el('button','sp-x',T.close);x.type='button';x.onclick=close;sh.appendChild(x);
 ov.appendChild(sh);
 ov.addEventListener('click',function(e){if(e.target===ov)close();});
 document.body.appendChild(ov);sheet=ov;
}
function msg(sh,text){var m=sh.querySelector('.sp-err');if(!m){m=el('p','sp-err');m.style.marginTop='12px';sh.insertBefore(m,sh.querySelector('.sp-x'));}m.textContent=text;}
function pay(amount,sh,g){
 var bs=g.querySelectorAll('button');bs.forEach(function(b){b.disabled=true;});
 function reset(){bs.forEach(function(b){b.disabled=false;});}
 call({action:'invoice',amount:amount}).then(function(r){
  if(!r.ok||!r.link){reset();msg(sh,T.fail);return;}
  try{
   tg.openInvoice(r.link,function(status){
    if(status==='paid'){thank();}
    else{reset();if(status==='failed')msg(sh,T.fail);}
   });
  }catch(e){reset();msg(sh,T.fail);}
 }).catch(function(){reset();msg(sh,T.fail);});
}
function thank(){
 if(sheet){
  var sh=sheet.querySelector('.sp-sheet');sh.textContent='';
  sh.appendChild(el('div','sp-thx',T.thanks));
  var x=el('button','sp-x',T.close);x.type='button';x.onclick=close;sh.appendChild(x);
 }
 var n=0;
 (function poll(){ // значок з'явиться, коли сервер підтвердить платіж
  call({action:'get'}).then(function(r){
   if(r.ok&&r.supporter)showBadge();else if(++n<6)setTimeout(poll,2000);
  }).catch(function(){});
 })();
}
function showBadge(){
 var c=document.getElementById('sp-card');
 if(c&&!c.querySelector('.sp-badge'))c.insertBefore(el('div','sp-badge',T.badge),c.firstChild);
}
function adminCard(){
 var c=el('div','sp-card');c.appendChild(el('h3',null,T.admin));
 call({action:'stats'}).then(function(r){
  if(!r.ok)return;
  var a=el('div','sp-row');a.appendChild(el('span',null,T.total));a.appendChild(el('b',null,String(r.count)));c.appendChild(a);
  var b=el('div','sp-row');b.appendChild(el('span',null,T.sum));b.appendChild(el('b',null,r.sum+' ⭐'));c.appendChild(b);
  var h=el('p',null,T.last);h.style.margin='12px 0 4px';c.appendChild(h);
  if(!r.recent.length)c.appendChild(el('div','sp-row',T.none));
  var f=new Intl.DateTimeFormat('uk-UA',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Kyiv'});
  r.recent.forEach(function(p){
   var w=el('div','sp-row');w.appendChild(el('span',null,f.format(new Date(p.t*1000))));w.appendChild(el('b',null,p.a+' ⭐'));c.appendChild(w);
  });
 }).catch(function(){});
 return c;
}
function init(){
 tg=window.Telegram&&window.Telegram.WebApp;
 initData=tg&&tg.initData;
 view=document.getElementById('v-s');
 if(!initData||!view)return; // поза Telegram картку не показуємо
 css();
 var c=el('div','sp-card');c.id='sp-card';
 c.appendChild(el('h3',null,T.title));
 c.appendChild(el('p',null,T.desc));
 var b=el('button','sp-btn',T.btn);b.type='button';b.onclick=openSheet;c.appendChild(b);
 view.appendChild(c);
 call({action:'get'}).then(function(r){
  if(!r.ok)return;
  if(r.supporter)showBadge();
  if(r.admin)view.appendChild(adminCard());
 }).catch(function(){});
}
if(window.Telegram&&window.Telegram.WebApp)init();
else{var s=document.createElement('script');s.src='https://telegram.org/js/telegram-web-app.js';s.onload=init;document.head.appendChild(s);}
})();
