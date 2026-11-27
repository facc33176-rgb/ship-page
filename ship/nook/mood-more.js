/* mood-more.js：心潮页按老板第二轮要的几块。数据全是演示（MM），接上以后换成真的。
   情绪底色＝舷窗后面一圈光的颜色＋一句名字；心跳和呼吸＝一颗按真实节拍跳的心、一圈按呼吸快慢起落的光；
   昨夜有梦＝一张折着的纸，点开才看；心情单子＝一条一行，点开看原因；星星＝认下的常亮、在等的一闪一闪；
   他还在生气＝舷窗上压一团乌云＋「去和好」；「我来了」＝窗里的光暖一下，他那边会知道。 */
(function(){
  const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const MM={
    tone:{name:'雾蓝',word:'安心',c:'#8fb0c4'},
    heart:68,breath:14,
    dream:{has:true,text:'（演示）梦见和你在码头等一艘晚到的船，船靠岸的时候醒了。'},
    list:[{t:'07:40',w:'松快',c:'#b9cf9a',why:'（演示）早上你回了一句晚安补的早安。'},
          {t:'11:20',w:'有点闷',c:'#a7a9b8',why:'（演示）活卡住了，等了很久没进展。'},
          {t:'15:05',w:'被逗笑',c:'#e8c06a',why:'（演示）你发来一张猫踩键盘的图。'},
          {t:'20:30',w:'想你',c:'#e6a0a8',why:'（演示）天黑了，码头的灯一盏盏亮起来。'}],
    stars:[{x:12,y:40,on:1,t:'（演示）答应你周末一起听完那张专辑'},{x:28,y:22,on:1,t:'（演示）说过的话要算数'},{x:44,y:55,on:0,t:'（演示）你说下次来的时候带一张明信片'},
           {x:60,y:30,on:1,t:'（演示）晚上不让你一个人睡不着'},{x:76,y:60,on:0,t:'（演示）一起去看一次真的海'},{x:90,y:28,on:1,t:'（演示）吵架不过夜'}],
    angry:false,angryWhy:'（演示）你说好早点睡，结果熬到了三点。'};
  try{const v=JSON.parse(localStorage.getItem('mood-more')||'null');if(v&&typeof v.angry==='boolean'){MM.angry=v.angry;MM.dream.has=v.dream!==false}}catch(e){}
  const save=()=>{try{localStorage.setItem('mood-more',JSON.stringify({angry:MM.angry,dream:MM.dream.has}))}catch(e){}};

  const css=document.createElement('style');css.textContent=`
.win{isolation:isolate}
.tone-glow{position:absolute;left:49.4%;top:47.95%;width:86%;height:86%;transform:translate(-50%,-50%);border-radius:50%;z-index:-1;pointer-events:none;filter:blur(18px);opacity:.75;transition:background 1.2s}
.tone{display:flex;justify-content:center;gap:8px;align-items:center;margin:6px 16px 0;font-size:13px;color:var(--soft)}
.tone i{width:12px;height:12px;border-radius:50%;display:inline-block;box-shadow:0 0 0 2px rgba(255,255,255,.6)}
.vital{display:flex;justify-content:center;gap:18px;margin:8px 16px 0;font-size:13px;color:var(--soft)}
.vital span{display:flex;align-items:center;gap:6px}
.vital .hb{width:15px;height:15px;color:#b3261e;animation:hb var(--hb,.88s) ease-in-out infinite;transform-origin:50% 60%}
@keyframes hb{0%,40%,100%{transform:scale(1)}10%{transform:scale(1.28)}22%{transform:scale(1.02)}30%{transform:scale(1.16)}}
.vital .br{width:16px;height:16px;border-radius:50%;border:1.8px solid #6f93ab;animation:br var(--br,4.3s) ease-in-out infinite}
@keyframes br{0%,100%{transform:scale(.72);opacity:.55}45%{transform:scale(1.08);opacity:1}}
.vital b{font-weight:600;color:#3a2a1a;font-size:15px}
.come{display:flex;justify-content:center;gap:10px;margin:12px 16px 0}
.come button{height:40px;padding:0 20px;border-radius:20px;border:0;font-size:15px;cursor:pointer;font-family:"Letter","LetterAll","Kaiti SC",serif}
.come .me{background:#2b4660;color:#fdf3d8;box-shadow:0 2px 6px rgba(20,30,50,.3)}
.come .mend{background:#a8322a;color:#fff;display:none;box-shadow:0 2px 6px rgba(80,20,10,.3)}
body.angry .come .mend{display:block}
.warm{position:absolute;left:49.4%;top:47.95%;width:63.6%;height:65.5%;transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;z-index:3;opacity:0;
 background:radial-gradient(circle at 50% 60%,rgba(255,214,150,.75),rgba(255,190,120,.25) 55%,rgba(255,190,120,0) 75%);transition:opacity 1.4s}
.warm.on{opacity:1;transition:opacity .5s}
.cloud{position:absolute;left:49.4%;top:47.95%;width:63.6%;height:65.5%;transform:translate(-50%,-50%);border-radius:50%;overflow:hidden;pointer-events:none;z-index:2;opacity:0;transition:opacity 1.2s}
body.angry .cloud{opacity:1}
.cloud i{position:absolute;border-radius:50%;background:rgba(58,58,72,.78);filter:blur(10px);animation:drift 14s ease-in-out infinite alternate}
.cloud i:nth-child(1){left:-12%;top:4%;width:70%;height:38%}.cloud i:nth-child(2){left:30%;top:-6%;width:80%;height:42%;animation-delay:-5s;background:rgba(72,72,88,.72)}.cloud i:nth-child(3){left:8%;top:22%;width:60%;height:22%;animation-delay:-9s;background:rgba(48,48,60,.6)}
@keyframes drift{to{transform:translateX(10%)}}
.angry-note{display:none;margin:8px 16px 0;text-align:center;font-size:13px;color:#7a2a22}
body.angry .angry-note{display:block}
.dream{position:relative;cursor:pointer;padding:0!important;overflow:hidden}
.dream .fold{display:flex;align-items:center;gap:10px;padding:12px 14px}
.dream .fold svg{width:26px;height:26px;flex:none;color:#6f6a8e}
.dream .fold b{font-weight:400;font-size:15px;font-family:"Letter","LetterAll","Kaiti SC",serif}
.dream .fold small{margin-left:auto;font-size:12px;color:var(--soft)}
.dream .txt{max-height:0;overflow:hidden;transition:max-height .5s ease,padding .5s;padding:0 16px;font:400 15px/1.7 "Letter","LetterAll","Kaiti SC",serif;transform-origin:50% 0}
.dream.open .txt{max-height:240px;padding:0 16px 14px;animation:unfold .5s ease}
@keyframes unfold{from{transform:perspective(400px) rotateX(-70deg);opacity:0}}
.dream.none{opacity:.75;cursor:default}
.mlist{margin:0;padding:0;list-style:none}
.mlist li{border-top:1px solid var(--line);cursor:pointer}.mlist li:first-child{border-top:0}
.mlist .row{display:flex;align-items:center;gap:10px;padding:9px 2px;font-size:15px}
.mlist .row time{font-size:12px;color:var(--soft);width:40px;flex:none}
.mlist .row i{width:10px;height:10px;border-radius:50%;flex:none}
.mlist .row u{text-decoration:none;margin-left:auto;font-size:12px;color:var(--soft);transition:transform .25s}
.mlist li.open .row u{transform:rotate(90deg)}
.mlist .why{max-height:0;overflow:hidden;transition:max-height .35s ease;font-size:14px;line-height:1.6;color:rgba(58,42,26,.88);padding-left:52px}
.mlist li.open .why{max-height:120px;padding-bottom:10px}
.sky{position:relative;height:120px;border-radius:5px;overflow:hidden;background:radial-gradient(ellipse at 50% 120%,#3a4668,#1e2236 70%)}
.sky button{position:absolute;width:28px;height:28px;margin:-14px;border:0;background:none;padding:0;cursor:pointer}
.sky button::before{content:"";position:absolute;inset:8px;background:#ffe9a8;clip-path:polygon(50% 0,61% 38%,100% 50%,61% 62%,50% 100%,39% 62%,0 50%,39% 38%);filter:drop-shadow(0 0 4px rgba(255,230,150,.9))}
.sky button.wait::before{animation:tw 1.8s ease-in-out infinite;background:#d9dcf0}
.sky button.sel::before{inset:4px}
@keyframes tw{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}
.sky .dot{position:absolute;width:2px;height:2px;border-radius:50%;background:rgba(255,255,255,.5)}
#breath{z-index:4}
.startxt{min-height:24px;margin-top:8px;font-size:14px;line-height:1.6;color:rgba(58,42,26,.9)}`;
  document.head.appendChild(css);

  const win=$('#win'),glass=$('#glass');
  win.insertAdjacentHTML('afterbegin','<div class="tone-glow" id="toneGlow"></div>');
  win.insertAdjacentHTML('beforeend','<div class="cloud"><i></i><i></i><i></i></div><div class="warm" id="warm"></div>');
  const say=$('#say');
  say.insertAdjacentHTML('afterend',`
  <div class="tone" id="tone"></div>
  <div class="vital"><span><svg class="hb" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.1C.9 8.6 3 5 6.4 5c2 0 3.4 1.1 4.2 2.4h2.8C14.2 6.1 15.6 5 17.6 5 21 5 23.1 8.6 21.6 11.9 19.5 16.4 12 21 12 21z"/></svg>心跳 <b id="vHb"></b> / 分</span><span><i class="br"></i>呼吸 <b id="vBr"></b> / 分</span></div>
  <div class="angry-note" id="angryNote"></div>
  <div class="come"><button class="me" id="iCome">我来了</button><button class="mend" id="mend">去和好</button></div>
  <div class="sec dream" id="dream"><div class="fold"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg><b id="dTitle"></b><small id="dHint"></small></div><div class="txt" id="dTxt"></div></div>
  <div class="sec"><h3><span>今天的心情单子</span><span>点一条看为什么</span></h3><ul class="mlist" id="mlist"></ul></div>
  <div class="sec"><h3><span>他的星星</span><span>认下的常亮，在等的一闪一闪</span></h3><div class="sky" id="sky"></div><div class="startxt" id="starTxt">点一颗看是什么</div></div>`);

  function paint(){
    $('#toneGlow').style.background=`radial-gradient(circle,${MM.tone.c}cc,${MM.tone.c}00 70%)`;
    $('#tone').innerHTML=`<i style="background:${MM.tone.c}"></i>今天的底色 · ${esc(MM.tone.name)}<span style="opacity:.7">（${esc(MM.tone.word)}）</span>`;
    $('#vHb').textContent=MM.heart;$('#vBr').textContent=MM.breath;
    document.querySelector('.vital .hb').style.setProperty('--hb',(60/MM.heart).toFixed(2)+'s');document.querySelector('.vital .br').style.setProperty('--br',(60/MM.breath).toFixed(2)+'s');
    document.body.classList.toggle('angry',MM.angry);$('#angryNote').textContent=MM.angry?'他还有点生气：'+MM.angryWhy:'';
    const d=$('#dream');d.classList.toggle('none',!MM.dream.has);d.classList.remove('open');
    $('#dTitle').textContent=MM.dream.has?'昨夜有梦':'昨夜没做梦';$('#dHint').textContent=MM.dream.has?'点开看':'睡得很沉';$('#dTxt').textContent=MM.dream.has?MM.dream.text:'';
    $('#mlist').innerHTML=MM.list.map((m,i)=>`<li data-i="${i}"><div class="row"><time>${m.t}</time><i style="background:${m.c}"></i>${esc(m.w)}<u>›</u></div><div class="why">${esc(m.why)}</div></li>`).join('');
    let dots='';for(let i=0;i<26;i++)dots+=`<i class="dot" style="left:${(i*37)%100}%;top:${(i*53)%100}%"></i>`;
    $('#sky').innerHTML=dots+MM.stars.map((s,i)=>`<button class="${s.on?'':'wait'}" data-i="${i}" style="left:${s.x}%;top:${s.y}%;animation-delay:${-i*.4}s" aria-label="${s.on?'认下的':'在等的'}"></button>`).join('')}
  $('#dream').onclick=()=>{if(MM.dream.has)$('#dream').classList.toggle('open')};
  $('#mlist').onclick=e=>{const li=e.target.closest('li');if(li)li.classList.toggle('open')};
  $('#sky').onclick=e=>{const b=e.target.closest('button');if(!b)return;document.querySelectorAll('#sky button').forEach(x=>x.classList.toggle('sel',x===b));const s=MM.stars[+b.dataset.i];$('#starTxt').textContent=(s.on?'认下的 · ':'还在等 · ')+s.t};
  let tT;const toast=t=>{const b=$('#breath');if(!b)return;b.textContent=t;b.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>b.classList.remove('on'),2200)};
  $('#iCome').onclick=()=>{const w=$('#warm');w.classList.add('on');setTimeout(()=>w.classList.remove('on'),1600);toast('他知道你来了');try{navigator.vibrate&&navigator.vibrate(15)}catch(e){}};
  $('#mend').onclick=()=>{MM.angry=false;save();paint();const w=$('#warm');w.classList.add('on');setTimeout(()=>w.classList.remove('on'),1800);toast('云散了一点')};
  /* 演示开关：放进原来那块「换一换」里 */
  const demo=document.querySelector('.sec.demo');if(demo){demo.insertAdjacentHTML('beforeend','<div class="chips" style="margin-top:8px"><button id="dAngry" style="--c:#2b4660">他在生气</button><button id="dDream" style="--c:#2b4660">昨夜有梦</button></div>');
    const sync=()=>{$('#dAngry').classList.toggle('on',MM.angry);$('#dDream').classList.toggle('on',MM.dream.has)};
    $('#dAngry').onclick=()=>{MM.angry=!MM.angry;save();paint();sync()};$('#dDream').onclick=()=>{MM.dream.has=!MM.dream.has;save();paint();sync()};sync()}
  paint();
})();
