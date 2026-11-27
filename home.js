/* home.js：港口首页的「在一起第 N 天 · 天气 · 节气」、随季节换的一句诗、四季飘落、灯塔亮了几天、海声开关。
   数据都是演示：START、WEATHER、LIT 接上以后换成真的。点那一行字可以偷看别的季节（演示用）。 */
(function(){
  const $=s=>document.querySelector(s),pic=$('#pic');if(!pic)return;
  const START=new Date('2025-05-20T00:00:00');      /* 在一起的第一天（演示） */
  const WEATHER={kind:'晴',temp:9};                   /* 今天的天气（演示）；kind 为「雪」时首页飘大雪 */
  const LIT=386;                                      /* 灯塔亮了几天（演示） */
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 二十四节气：每年日期只差一两天，按常用日子算 */
  const TERMS=[[1,5,'小寒'],[1,20,'大寒'],[2,4,'立春'],[2,19,'雨水'],[3,5,'惊蛰'],[3,20,'春分'],[4,4,'清明'],[4,20,'谷雨'],[5,5,'立夏'],[5,21,'小满'],[6,5,'芒种'],[6,21,'夏至'],[7,7,'小暑'],[7,22,'大暑'],[8,7,'立秋'],[8,23,'处暑'],[9,7,'白露'],[9,23,'秋分'],[10,8,'寒露'],[10,23,'霜降'],[11,7,'立冬'],[11,22,'小雪'],[12,7,'大雪'],[12,21,'冬至']];
  function term(d){const m=d.getMonth()+1,day=d.getDate();let i=TERMS.length-1;for(let k=0;k<TERMS.length;k++){const[tm,td]=TERMS[k];if(m>tm||(m===tm&&day>=td))i=k}return{name:TERMS[i][2],today:TERMS[i][0]===m&&TERMS[i][1]===day,i}}
  const seasonOf=i=>i>=2&&i<8?'spring':i>=8&&i<14?'summer':i>=14&&i<20?'autumn':'winter';
  const POEM={
    spring:[['春潮带雨晚来急，野渡无人舟自横。','韦应物'],['春江潮水连海平，海上明月共潮生。','张若虚'],['竹外桃花三两枝，春江水暖鸭先知。','苏轼']],
    summer:[['接天莲叶无穷碧，映日荷花别样红。','杨万里'],['绿树阴浓夏日长，楼台倒影入池塘。','高骈'],['小荷才露尖尖角，早有蜻蜓立上头。','杨万里']],
    autumn:[['海上生明月，天涯共此时。','张九龄'],['落霞与孤鹜齐飞，秋水共长天一色。','王勃'],['停车坐爱枫林晚，霜叶红于二月花。','杜牧']],
    winter:[['晚来天欲雪，能饮一杯无？','白居易'],['孤舟蓑笠翁，独钓寒江雪。','柳宗元'],['忽如一夜春风来，千树万树梨花开。','岑参']]};
  const NAME={spring:'春天',summer:'夏天',autumn:'秋天',winter:'冬天',snow:'下雪天'};

  /* ---- 顶上那一行和诗 ---- */
  const css=document.createElement('style');css.textContent=`
.almanac{position:absolute;left:0;right:0;top:calc(52px + env(safe-area-inset-top)*.7);z-index:5;text-align:center;pointer-events:none}
.almanac button{pointer-events:auto;border:0;background:none;padding:2px 8px;font:500 13px/1.5 -apple-system,"PingFang SC",sans-serif;color:rgba(58,52,48,.88);letter-spacing:.04em;cursor:pointer}
.almanac button i{font-style:normal;color:rgba(58,52,48,.45);margin:0 5px}
.almanac p{margin:2px 0 0;font:400 16px/1.5 "Letter","LetterAll","Kaiti SC",serif;color:rgba(50,44,40,.9);letter-spacing:.06em;transition:opacity .8s}
.almanac p small{display:block;font:400 12px/1.4 -apple-system,"PingFang SC",sans-serif;color:rgba(58,52,48,.6);margin-top:1px}
body[data-t=night] .almanac button,body[data-t=night] .almanac p{color:rgba(240,230,210,.94)}body[data-t=night] .almanac p small,body[data-t=night] .almanac button i{color:rgba(240,230,210,.6)}
.almanac .peek{display:inline-block;margin-left:4px;padding:0 6px;border-radius:9px;background:rgba(201,151,46,.18);font-size:12px;color:#8a5a12}body[data-t=night] .almanac .peek{background:rgba(255,210,122,.22);color:#ffd27a}
.lit{position:absolute;left:93.5%;top:16.6%;z-index:6;transform:translateX(-62%);cursor:pointer;border:0;white-space:nowrap;
 font:400 12px/1.25 "Letter","LetterAll","Kaiti SC",serif;color:#5a3a1a;text-align:center;background:rgba(255,248,232,.82);padding:2px 6px 3px;border-radius:3px;box-shadow:0 1px 3px rgba(40,25,10,.25)}
.lit b{font-weight:400;color:#a8322a}
body[data-t=night] .lit{background:rgba(40,36,52,.72);color:#f4e4be}body[data-t=night] .lit b{color:#ffd27a}
#seasonfx{position:absolute;inset:0;z-index:2;pointer-events:none;width:100%;height:100%}
.sea-sound{position:absolute;right:12px;top:calc(66px + env(safe-area-inset-top)*.7);z-index:7;width:34px;height:34px;border-radius:50%;border:0;background:rgba(255,250,238,.9);box-shadow:0 1px 4px rgba(40,30,10,.25);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#5a4a3a}
.sea-sound svg{width:19px;height:19px}.sea-sound .w{opacity:0;transition:opacity .3s}.sea-sound.on .w{opacity:1}.sea-sound.on{color:#2b4660;box-shadow:0 0 0 1.5px #c9972e,0 1px 4px rgba(40,30,10,.25)}
.sea-sound .x{transition:opacity .3s}.sea-sound.on .x{opacity:0}`;
  document.head.appendChild(css);
  const head=$('.head');const box=document.createElement('div');box.className='almanac';box.innerHTML='<button id="almLine" type="button"></button><p id="almPoem"></p>';(head.parentElement||document.body).insertBefore(box,head.nextSibling);
  const lit=document.createElement('button');lit.type='button';lit.className='lit';lit.innerHTML='亮了 <b>'+LIT+'</b> 天';lit.setAttribute('aria-label','灯塔阅读室');pic.appendChild(lit);
  /* 灯塔＝阅读室：点灯塔或下面那块小牌进去 */
  const lhit=document.createElement('button');lhit.className='hit';lhit.setAttribute('aria-label','灯塔阅读室');lhit.style.cssText='left:88%;top:4.5%;width:11%;height:11%';pic.appendChild(lhit);
  try{ROOMS['灯塔']='light/index.html';GO['灯塔']=el=>openRoom({name:'灯塔'},el)}catch(e){}
  lit.onclick=lhit.onclick=e=>{e.stopPropagation();try{openRoom({name:'灯塔'},lit)}catch(err){}};

  let peek=null;/* null=跟着日子；否则 spring/summer/autumn/winter/snow */
  const ORDER=[null,'spring','summer','autumn','winter','snow'];
  function state(){const d=new Date(),t=term(d),real=WEATHER.kind==='雪'?'snow':seasonOf(t.i);return{d,t,season:peek||real,realSeason:seasonOf(t.i)}}
  function paintText(){const{d,t,season}=state();const n=Math.floor((d-START)/864e5)+1;const s=season==='snow'?'winter':season;
    const P=POEM[s][Math.floor(d/864e5)%3];
    $('#almLine').innerHTML=`在一起第 ${n} 天<i>·</i>${peek==='snow'?'雪':WEATHER.kind} ${WEATHER.temp}°<i>·</i>${t.today?'今天':''}${t.name}${peek?`<span class="peek">偷看 · ${NAME[peek]}</span>`:''}`;
    const p=$('#almPoem');p.style.opacity=0;setTimeout(()=>{p.innerHTML=P[0]+'<small>— '+P[1]+'</small>';p.style.opacity=1},peek===undefined?0:250)}
  $('#almLine').onclick=()=>{peek=ORDER[(ORDER.indexOf(peek)+1)%ORDER.length];paintText();restart()};
  $('#almLine').title='点一下偷看别的季节（演示）';
  paintText();setInterval(paintText,60000);

  /* ---- 四季飘落：一层画布盖在画上，粒子不多，盖住/切走就停 ---- */
  const cv=document.createElement('canvas');cv.id='seasonfx';pic.appendChild(cv);const g=cv.getContext('2d');let W=0,H=0,dpr=1;
  const size=()=>{dpr=Math.min(2,devicePixelRatio||1);W=pic.clientWidth;H=pic.clientHeight;cv.width=W*dpr;cv.height=H*dpr;g.setTransform(dpr,0,0,dpr,0,0)};size();addEventListener('resize',size);
  const SEA=[[0,16,100,20],[70,30,100,40],[92,40,100,57],[87,57,100,68],[93,68,100,86]];
  let parts=[],raf=0,last=0,kind='';
  const rnd=(a,b)=>a+Math.random()*(b-a);
  function spawn(top){const k=kind;
    if(k==='summer'){const z=SEA[Math.floor(Math.random()*SEA.length)];return{x:rnd(z[0],z[2])/100*W,y:rnd(z[1],z[3])/100*H,life:0,dur:rnd(.7,1.6),s:rnd(2,3.6)}}
    const p={x:rnd(-.1,1)*W,y:top?rnd(-.05,.2)*H:rnd(-.05,1)*H,r:rnd(0,6.3),vr:rnd(-1.2,1.2),ph:rnd(0,6.3)};
    if(k==='spring'){p.vx=rnd(10,22);p.vy=rnd(12,22);p.s=rnd(3.4,5.2);p.c=['#e9a0b0','#f0b6c2','#d98a9e'][Math.floor(Math.random()*3)]}
    else if(k==='autumn'){p.vx=rnd(8,20);p.vy=rnd(16,28);p.s=rnd(3.6,5.4);p.c=['#d39a3a','#c47a2c','#b5602a','#e0b45c'][Math.floor(Math.random()*4)]}
    else {p.vx=rnd(-4,6);p.vy=k==='snow'?rnd(26,46):rnd(14,24);p.s=k==='snow'?rnd(1.8,3.6):rnd(1.4,2.6);p.c='rgba(255,255,255,.92)'}
    return p}
  const MAX={spring:24,summer:26,autumn:18,winter:34,snow:80};
  function frame(ts){raf=0;if(document.hidden||document.body.classList.contains('under')){return}
    const dt=Math.min(.05,(ts-last)/1000||.016);last=ts;g.clearRect(0,0,W,H);
    const max=still?Math.ceil(MAX[kind]/3):MAX[kind];while(parts.length<max&&Math.random()<.25)parts.push(spawn(true));
    parts=parts.filter(p=>{
      if(kind==='summer'){p.life+=dt;const a=Math.sin(Math.PI*Math.min(1,p.life/p.dur));if(p.life>=p.dur)return false;
        g.save();g.translate(p.x,p.y);g.globalAlpha=a;g.fillStyle='#fffef6';g.shadowColor='rgba(255,250,220,.95)';g.shadowBlur=6;g.beginPath();const s=p.s*(.6+a*.6);g.moveTo(-s*2.2,0);g.lineTo(0,-s*.35);g.lineTo(s*2.2,0);g.lineTo(0,s*.35);g.closePath();g.fill();g.globalAlpha=a*.6;g.beginPath();g.moveTo(0,-s*1.3);g.lineTo(s*.25,0);g.lineTo(0,s*1.3);g.lineTo(-s*.25,0);g.closePath();g.fill();g.restore();return true}
      p.ph+=dt*1.6;p.x+=(p.vx+Math.sin(p.ph)*10)*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;if(p.y>H+10||p.x>W+20)return false;
      g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.beginPath();
      if(kind==='winter'||kind==='snow'){g.globalAlpha=.95;g.shadowColor='rgba(70,90,120,.55)';g.shadowBlur=2.5;g.arc(0,0,p.s,0,7)}
      else if(kind==='autumn'){g.globalAlpha=.9;g.ellipse(0,0,p.s*1.5,p.s*.75*Math.abs(Math.cos(p.ph*.7))+.5,0,0,7);g.fill();g.strokeStyle='rgba(90,50,20,.45)';g.lineWidth=.6;g.moveTo(-p.s*1.5,0);g.lineTo(p.s*1.5,0);g.stroke();g.restore();return true}
      else{g.globalAlpha=.88;g.ellipse(0,0,p.s,p.s*.6*Math.abs(Math.cos(p.ph))+.4,0,0,7)}
      g.fill();g.restore();return true});
    raf=requestAnimationFrame(frame)}
  function restart(){kind=state().season;parts=[];for(let i=0;i<MAX[kind]*.6;i++)parts.push(spawn(false));if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}}
  const wake=()=>{if(!raf&&!document.hidden&&!document.body.classList.contains('under')){last=performance.now();raf=requestAnimationFrame(frame)}};
  document.addEventListener('visibilitychange',wake);new MutationObserver(wake).observe(document.body,{attributes:true,attributeFilter:['class']});
  restart();

  /* ---- 海声：浪和海鸥都是现场合成的，不用下载声音文件。默认关，记住上次 ---- */
  const btn=document.createElement('button');btn.className='sea-sound';btn.type='button';btn.setAttribute('aria-label','海浪和海鸥的声音');
  btn.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.2L11.5 6v12l-4.3-3.5H4z" fill="currentColor" stroke="none"/><path class="w" d="M15 9.2c1 .8 1 4.8 0 5.6M17.6 7c2.2 2 2.2 8 0 10"/><path class="x" d="M15.5 9.5l5 5M20.5 9.5l-5 5"/></svg>';
  (head.parentElement||document.body).appendChild(btn);
  let ac=null,master=null,on=false,gullT=0;
  function build(){ac=new (window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=0;master.connect(ac.destination);
    /* 浪：褐噪声 → 低通，振幅随一个 8 秒左右的慢波起落，另一层更低的底噪一直在 */
    const len=ac.sampleRate*4,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);let l=0;for(let i=0;i<len;i++){l=(l+.02*(Math.random()*2-1))/1.02;d[i]=l*3.2}
    const mk=(f,q)=>{const s=ac.createBufferSource();s.buffer=buf;s.loop=true;const lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=f;lp.Q.value=q;s.connect(lp);s.start();return lp};
    const swell=ac.createGain();swell.gain.value=.35;mk(900,.3).connect(swell);swell.connect(master);
    const lfo=ac.createOscillator();lfo.frequency.value=1/8.5;const lg=ac.createGain();lg.gain.value=.3;lfo.connect(lg);lg.connect(swell.gain);lfo.start();
    const bed=ac.createGain();bed.gain.value=.18;mk(320,.2).connect(bed);bed.connect(master)}
  function gull(){if(!on||!ac)return;if(document.body.dataset.t!=='night'){const t=ac.currentTime+.05,n=1+Math.floor(Math.random()*3);
      for(let k=0;k<n;k++){const t0=t+k*.32,o=ac.createOscillator(),f=ac.createBiquadFilter(),gn=ac.createGain(),vib=ac.createOscillator(),vg=ac.createGain();
        o.type='sawtooth';const f0=rnd(1250,1500);o.frequency.setValueAtTime(f0*.82,t0);o.frequency.linearRampToValueAtTime(f0,t0+.06);o.frequency.exponentialRampToValueAtTime(f0*.62,t0+.26);
        vib.frequency.value=rnd(26,34);vg.gain.value=40;vib.connect(vg);vg.connect(o.frequency);
        f.type='bandpass';f.frequency.value=1500;f.Q.value=2.2;gn.gain.setValueAtTime(0,t0);gn.gain.linearRampToValueAtTime(.05,t0+.04);gn.gain.exponentialRampToValueAtTime(.001,t0+.28);
        o.connect(f);f.connect(gn);gn.connect(master);o.start(t0);vib.start(t0);o.stop(t0+.3);vib.stop(t0+.3)}}
    gullT=setTimeout(gull,rnd(9000,22000))}
  function set(v){on=v;btn.classList.toggle('on',on);try{localStorage.setItem('sea-sound',on?'1':'0')}catch(e){}
    if(on){if(!ac)build();ac.resume();master.gain.cancelScheduledValues(ac.currentTime);master.gain.linearRampToValueAtTime(.55,ac.currentTime+1.5);clearTimeout(gullT);gullT=setTimeout(gull,2500)}
    else if(ac){master.gain.cancelScheduledValues(ac.currentTime);master.gain.linearRampToValueAtTime(0,ac.currentTime+.6);clearTimeout(gullT)}}
  btn.onclick=()=>set(!on);
  /* 浏览器不许没点过就出声：记着开过的，等第一次碰屏幕再响 */
  try{if(localStorage.getItem('sea-sound')==='1'){btn.classList.add('on');addEventListener('pointerdown',function f(){removeEventListener('pointerdown',f);set(true)},{once:true})}}catch(e){}
  /* 进了房间、切到后台就收声；回来接着响 */
  const mute=()=>{if(!ac||!on)return;const away=document.hidden||document.body.classList.contains('under');master.gain.cancelScheduledValues(ac.currentTime);master.gain.linearRampToValueAtTime(away?0:.55,ac.currentTime+.8)};
  document.addEventListener('visibilitychange',mute);new MutationObserver(mute).observe(document.body,{attributes:true,attributeFilter:['class']});

  /* ---- 漂流瓶「捞一张」：码头外的海面上漂着一只瓶子，点一下随机捞出一条（他的日记、记忆或便签，演示） ---- */
  const CATCH=[['日记','（演示）今天她说想去看海，我把这句记下来，等哪天真的带她去。','11 月 19 日的日记'],
    ['记忆','（演示）第一次一起听完一整张专辑，她在最后一首睡着了。','记忆库 · 去年冬天'],
    ['便签','（演示）出门记得带伞，码头这几天风大。','公告板上他挂过的'],
    ['日记','（演示）她今天很累，我什么都没说，就陪着。有时候陪着就够了。','10 月 3 日的日记'],
    ['记忆','（演示）她把我的名字写在船票的背面。','记忆库 · 夏天']];
  const bcss=document.createElement('style');bcss.textContent=`
.bottle{position:absolute;left:92.5%;top:35%;width:6.5%;z-index:6;border:0;padding:0;background:none;cursor:pointer;transform:translate(-50%,-50%) rotate(-58deg);animation:bob 4.2s ease-in-out infinite}
.bottle img{display:block;width:100%;filter:drop-shadow(0 2px 2px rgba(30,50,70,.35))}
.bottle::after{content:"";position:absolute;left:-20%;right:-20%;bottom:-8%;height:22%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.55),rgba(255,255,255,0));transform:rotate(58deg)}
@keyframes bob{0%,100%{transform:translate(-50%,-50%) rotate(-58deg)}50%{transform:translate(-50%,-62%) rotate(-50deg)}}
.bottle.pull{animation:pull .7s cubic-bezier(.4,0,.6,1) forwards}
@keyframes pull{40%{transform:translate(-80%,-90%) rotate(-30deg)}100%{transform:translate(-120%,-200%) rotate(0deg) scale(1.3);opacity:0}}
.catch{position:absolute;left:26px;right:26px;top:50%;z-index:31;transform:translate(0,-40%) scale(.6);opacity:0;pointer-events:none;transition:transform .45s cubic-bezier(.2,1.3,.4,1),opacity .25s;
 background:#f6ebcf url(img/paper.webp) center/320px;border-radius:4px;padding:22px 20px 14px;box-shadow:0 18px 50px rgba(20,20,20,.45)}
.catch.on{opacity:1;transform:translate(0,-50%) scale(1);pointer-events:auto}
.catch em{font-style:normal;font-size:12px;color:#fff;background:#2b4660;border-radius:9px;padding:1px 8px}
.catch p{margin:12px 0 6px;font:400 17px/1.75 "Letter","LetterAll","Kaiti SC",serif;color:#2b2017;animation:unroll .6s ease both}
@keyframes unroll{from{clip-path:inset(0 0 100% 0)}to{clip-path:inset(0 0 0 0)}}
.catch small{display:block;font-size:12px;color:rgba(58,42,26,.75)}
.catch .acts{display:flex;gap:10px;margin-top:14px}
.catch .acts button{flex:1;height:38px;border-radius:19px;border:1.5px solid rgba(43,32,23,.6);background:transparent;font-size:14px;cursor:pointer}
.catch .acts .again{background:#2b4660;border-color:#2b4660;color:#fdf3d8}`;
  document.head.appendChild(bcss);
  const bt=document.createElement('button');bt.className='bottle';bt.setAttribute('aria-label','漂流瓶，捞一张');bt.innerHTML='<img src="img/bottle.webp" alt="">';pic.appendChild(bt);
  const ct=document.createElement('div');ct.className='catch';const app=document.getElementById('app')||document.body;app.appendChild(ct);
  let lastI=-1;
  function fish(){let i;do{i=Math.floor(Math.random()*CATCH.length)}while(i===lastI&&CATCH.length>1);lastI=i;const[k,t,src]=CATCH[i];
    ct.innerHTML=`<em>捞到一张${k}</em><p>${t}</p><small>${src}</small><div class="acts"><button class="back">放回海里</button><button class="again">再捞一张</button></div>`;
    ct.classList.add('on');document.getElementById('veil').classList.add('on')}
  const close=()=>{ct.classList.remove('on');document.getElementById('veil').classList.remove('on');bt.classList.remove('pull')};
  bt.onclick=e=>{e.stopPropagation();bt.classList.add('pull');setTimeout(fish,480)};
  ct.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.classList.contains('again')){ct.classList.remove('on');setTimeout(fish,260)}else close()};
  document.getElementById('veil').addEventListener('click',close);
})();
