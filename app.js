var REAL=null,FAIL=false,ERR='',REQ=0;
var OE='https://raw.githubusercontent.com/yaroslav2901/OE_OUTAGE_DATA/refs/heads/main/data/';
var DT='https://raw.githubusercontent.com/Baskerville42/outage-data-ua/refs/heads/main/data/';
var REGIONS=[
 {id:'cherkasy',name:'Черкаська обл.',url:OE+'Cherkasyoblenergo.json'},
 {id:'chernihiv',name:'Чернігівська обл.',url:OE+'Chernihivoblenergo.json'},
 {id:'dnipro',name:'м. Дніпро (ДТЕК)',url:DT+'dnipro.json'},
 {id:'ivfrank',name:'Івано-Франківська обл.',url:OE+'Prykarpattiaoblenerho.json'},
 {id:'kharkiv',name:'Харківська обл.',url:OE+'Kharkivoblenerho.json'},
 {id:'khmelnytskyi',name:'Хмельницька обл.',url:OE+'Khmelnytskoblenerho.json'},
 {id:'kyiv',name:'м. Київ (ДТЕК)',url:DT+'kyiv.json'},
 {id:'kyivobl',name:'Київська обл. (ДТЕК)',url:DT+'kyiv-region.json'},
 {id:'lviv',name:'Львівська обл.',url:OE+'Lvivoblenerho.json'},
 {id:'odesa',name:'м. Одеса (ДТЕК)',url:DT+'odesa.json'},
 {id:'poltava',name:'Полтавська обл.',url:OE+'Poltavaoblenergo.json'},
 {id:'rivne',name:'Рівненська обл.',url:OE+'Rivneoblenergo.json'},
 {id:'ternopil',name:'Тернопільська обл.',url:OE+'Ternopiloblenerho.json'},
 {id:'zakarpattia',name:'Закарпатська обл.',url:OE+'Zakarpattiaoblenerho.json'},
 {id:'zaporizhzhia',name:'Запорізька обл.',url:OE+'Zaporizhzhiaoblenergo.json'},
 {id:'zhytomyr',name:'Житомирська обл.',url:OE+'Zhytomyroblenergo.json'}];
function region(id){for(var i=0;i<REGIONS.length;i++)if(REGIONS[i].id===id)return REGIONS[i];return null}
var st={r:'kharkiv',q:'1.1',w:30};
try{var s=JSON.parse(localStorage.getItem('svitlo2')||'null');if(s){if(region(s.r))st.r=s.r;st.q=s.q||st.q;st.w=s.w||st.w;}}catch(e){}
function queueList(){return REAL?Object.keys(REAL.queues).sort(function(a,b){return parseFloat(a)-parseFloat(b)}):[]}
function save(){try{localStorage.setItem('svitlo2',JSON.stringify(st));}catch(e){}}
function hm(h){h=Math.round(h*60);var m=h%60,hh=Math.floor(h/60)%24;return(hh<10?'0':'')+hh+':'+(m<10?'0':'')+m}
function dur(m){m=Math.round(m);var h=Math.floor(m/60),r=m%60;return h?(h+' г'+(r?' '+r+' хв':'')):r+' хв'}
function $(i){return document.getElementById(i)}
/* T - відключення сьогодні, TM - завтра (null = ще не опубліковано), n - година зараз */
function status(T,TM,n){
 var all=T.map(function(p){return[p[0],p[1]]});
 if(TM)TM.forEach(function(p){all.push([p[0]+24,p[1]+24])});
 all.sort(function(a,b){return a[0]-b[0]});
 var m=[];all.forEach(function(p){if(m.length&&Math.abs(m[m.length-1][1]-p[0])<1e-9)m[m.length-1][1]=p[1];else m.push(p)});
 for(var i=0;i<m.length;i++){if(n>=m[i][0]&&n<m[i][1])return{on:false,t:m[i][1],wait:(m[i][1]-n)*60,tm:m[i][1]>=24,cur:m[i]}}
 for(var j=0;j<m.length;j++){if(m[j][0]>n)return{on:true,t:m[j][0],wait:(m[j][0]-n)*60,tm:m[j][0]>=24}}
 return{on:true,t:null,unknown:TM===null}
}
function rows(S,n,mark){var l='';S.forEach(function(p){var c='';if(mark){c=(n>=p[0]&&n<p[1])?' now':(p[1]<=n?' past':'')}
 l+='<div class="row'+c+'"><i></i><span>'+hm(p[0])+'–'+(p[1]===24?'00:00':hm(p[1]))+'</span><span class="d">'+dur((p[1]-p[0])*60)+'</span></div>'});return l}
function render(){
 var d=new Date(),n=d.getHours()+d.getMinutes()/60;
 $('qn').textContent=st.q;$('rn').textContent=region(st.r).name;$('clk').textContent='зараз '+hm(n);
 var D=REAL&&REAL.queues&&REAL.queues[st.q];
 if(!D){
  $('src').textContent=FAIL?'немає зв’язку із сервером':'завантаження…';
  $('arcs').innerHTML='<circle cx="150" cy="150" r="110" stroke="var(--oa)"/>';$('dot').setAttribute('cx',-50);
  $('ma').textContent=FAIL?'Немає даних':'Завантажую…';$('mb').textContent=FAIL?(ERR||'не вдалося завантажити графік'):'';$('mt').textContent='--:--';$('mc').textContent='';
  $('list').innerHTML='';$('list2').innerHTML='';$('bn').style.display='none';return}
 if(D.today===null){
  $('src').textContent='останні дані: '+(REAL.updated||'невідомо');
  $('arcs').innerHTML='<circle cx="150" cy="150" r="110" stroke="var(--oa)"/>';$('dot').setAttribute('cx',-50);
  $('ma').textContent='Немає графіка';$('ma').style.color='var(--tx)';$('mb').textContent='на сьогодні дані відсутні';$('mt').textContent='--:--';$('mc').textContent='';
  $('list').innerHTML='<div class="note">Для цієї області зараз немає актуального графіка. Можливо, відключень немає або джерело не оновлюється.</div>';$('list2').innerHTML='';$('bn').style.display='none';return}
 $('src').textContent=(REAL.updated?'графік станом на '+REAL.updated:'графік завантажено')+(REAL.stale?' · дані можуть бути застарілими':'')+(FAIL?' · немає зв’язку':'');
 var T=D.today||[],TM=D.tomorrow;
 var C=28.8,h='<circle cx="150" cy="150" r="110" stroke="var(--am)"/>';
 T.forEach(function(p){h+='<circle cx="150" cy="150" r="110" stroke="var(--oa)" stroke-dasharray="'+((p[1]-p[0])*C)+' 700" stroke-dashoffset="'+(-p[0]*C)+'"/>'});
 $('arcs').innerHTML=h;
 var ang=n/24*2*Math.PI;$('dot').setAttribute('cx',150+110*Math.sin(ang));$('dot').setAttribute('cy',150-110*Math.cos(ang));
 var s=status(T,TM,n),b=$('bn');b.style.display='none';
 if(!s.on){$('ma').textContent='Світла немає';$('ma').style.color='var(--tx)';$('mb').textContent='повернеться '+(s.tm?'завтра о':'о');$('mt').textContent=hm(s.t);$('mc').textContent='через '+dur(s.wait)}
 else if(s.t===null){$('ma').textContent='Світло є';$('ma').style.color='var(--amtx)';$('mb').textContent='';$('mt').textContent='—';$('mc').textContent=s.unknown?'на завтра ще немає':'відключень не заплановано'}
 else{$('ma').textContent='Світло є';$('ma').style.color='var(--amtx)';$('mb').textContent='вимкнення '+(s.tm?'завтра о':'о');$('mt').textContent=hm(s.t);$('mc').textContent='через '+dur(s.wait);
  if(s.wait<=st.w){b.textContent='Через '+dur(s.wait)+' вимкнення. Зарядіть пристрої.';b.style.display='block'}}
 $('list').innerHTML=T.length?rows(T,n,true):'<div class="note">Сьогодні відключень не заплановано.</div>';
 $('list2').innerHTML=TM===null||TM===undefined?'<div class="note">Графік на завтра ще не опубліковано.</div>':(TM.length?rows(TM,n,false):'<div class="note">Завтра відключень не заплановано.</div>');
}
function buildScale(){var h='',i,a,x,y,r1,r2;
 for(i=0;i<24;i++){a=i/24*2*Math.PI;r1=96;r2=(i%3===0)?88:92;
  h+='<line x1="'+(150+r1*Math.sin(a))+'" y1="'+(150-r1*Math.cos(a))+'" x2="'+(150+r2*Math.sin(a))+'" y2="'+(150-r2*Math.cos(a))+'" stroke="var(--mu)" stroke-width="'+(i%3===0?1.6:1)+'" opacity=".7"/>'}
 for(i=0;i<24;i+=3){a=i/24*2*Math.PI;x=150+137*Math.sin(a);y=150-137*Math.cos(a)+4;
  h+='<text x="'+x+'" y="'+y+'" font-size="11" font-weight="700" fill="var(--mu)" text-anchor="middle">'+(i<10?'0':'')+i+'</text>'}
 $('scale').innerHTML=h}
function buildReg(){var g='';REGIONS.forEach(function(r){g+='<option value="'+r.id+'"'+(r.id===st.r?' selected':'')+'>'+r.name+'</option>'});$('reg').innerHTML=g}
function buildQ(){var g='';var L=queueList();if(!L.length)g='<div class="note">Завантажую список черг…</div>';L.forEach(function(q){g+='<button class="q'+(q===st.q?' on':'')+'" data-q="'+q+'">'+q+'</button>'});$('grid').innerHTML=g}
function buildW(){var g='';[15,30,60].forEach(function(w){g+='<button class="q'+(w===st.w?' on':'')+'" data-w="'+w+'">'+w+' хв</button>'});$('warn').innerHTML=g}
function show(v){['main','q','s'].forEach(function(x){$('v-'+x).classList.toggle('on',x===v)});
 document.querySelectorAll('.nav button').forEach(function(b){b.classList.toggle('on',b.dataset.v===v)});window.scrollTo(0,0)}
document.querySelector('.nav').onclick=function(e){var v=e.target.dataset&&e.target.dataset.v;if(v)show(v)};
$('goq').onclick=function(){show('q')};
$('grid').onclick=function(e){var q=e.target.dataset&&e.target.dataset.q;if(q){st.q=q;save();buildQ();render();show('main')}};
$('reg').onchange=function(){st.r=this.value;save();REAL=null;FAIL=false;buildQ();render();load()};
$('warn').onclick=function(e){var w=e.target.dataset&&e.target.dataset.w;if(w){st.w=+w;save();buildW();render()}};
function toIntervals(hours){var off=[],k,v,h;
 for(k in hours){h=parseInt(k,10);if(isNaN(h))continue;v=hours[k];
  if(v==='no')off.push([h-1,h]);else if(v==='first')off.push([h-1,h-.5]);else if(v==='second')off.push([h-.5,h])}
 off.sort(function(a,b){return a[0]-b[0]});
 var m=[];off.forEach(function(p){if(m.length&&Math.abs(m[m.length-1][1]-p[0])<1e-9)m[m.length-1][1]=p[1];else m.push([p[0],p[1]])});return m}
function convert(raw){
 if(!raw||!raw.fact||!raw.fact.data)throw new Error('інший формат даних');
 var fact=raw.fact,days=fact.data,now=Date.now()/1000,today=null,k;
 for(k in days){if(+k<=now&&now<+k+86400)today=k}
 var out={updated:fact.update||raw.lastUpdated,queues:{}};
 var base=today||Object.keys(days).sort(function(a,b){return a-b}).pop();
 if(!base)throw new Error('порожній файл');
 var tomorrow=String(+base+86400);
 Object.keys(days[base]||{}).forEach(function(key){if(key.indexOf('GPV')!==0)return;
  out.queues[key.slice(3)]=today?{today:toIntervals(days[base][key]),
   tomorrow:(days[tomorrow]&&days[tomorrow][key])?toIntervals(days[tomorrow][key]):null}:{today:null,tomorrow:null}});
 return out}
function load(){var id=st.r,my=++REQ;fetch(region(id).url).then(function(r){if(!r.ok)throw new Error('файл недоступний (код '+r.status+')');return r.json()}).then(function(j){
 if(my!==REQ)return;
 var c=convert(j);
 if(Object.keys(c.queues).length){var age=j.lastUpdated?(Date.now()-new Date(j.lastUpdated).getTime())/36e5:0;c.stale=age>36;REAL=c;FAIL=false;ERR='';
  if(!c.queues[st.q]){st.q=queueList()[0];save()}buildQ()}else{REAL=null;FAIL=true;ERR='у файлі немає черг'}
 render()}).catch(function(e){if(my!==REQ)return;REAL=null;FAIL=true;ERR=String(e&&e.message||e);render()})}
buildScale();buildReg();buildQ();buildW();render();load();setInterval(render,20000);setInterval(load,300000);
