/* notice.js：全站顶上的提示条，一次只出一条，压在刘海下面。
   Notice.show({kind:'update'|'call', text, act, onAct})；接上以后由你们的「有新版本」「电话断了」去调。
   演示：每次打开先出「船修好了一处」，点掉以后再出「电话刚断了一下」，各一次。 */
(function(){
  const css=document.createElement('style');css.textContent=`
.notice{position:fixed;left:12px;right:12px;top:calc(8px + env(safe-area-inset-top));z-index:200;display:flex;align-items:center;gap:10px;min-height:44px;padding:8px 10px 8px 12px;
 background:#f6ebcf url(img/paper.webp) center/300px;border-radius:10px;box-shadow:0 6px 18px rgba(30,20,10,.35),inset 0 0 0 1px rgba(201,151,46,.6);
 transform:translateY(-140%);transition:transform .45s cubic-bezier(.2,1.2,.4,1);font:400 15px/1.4 -apple-system,"PingFang SC",sans-serif;color:#3a2a1a}
.notice.on{transform:none}
.notice i{flex:none;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff}
.notice.update i{background:#2b4660}.notice.call i{background:#a8322a;animation:ring 1.2s ease-in-out 3}
@keyframes ring{20%,60%{transform:rotate(-14deg)}40%,80%{transform:rotate(14deg)}}
.notice i svg{width:15px;height:15px}
.notice span{flex:1;min-width:0}.notice span b{font-weight:500}
.notice button{flex:none;height:30px;padding:0 12px;border:0;border-radius:15px;font-size:13px;cursor:pointer}
.notice .go{background:#2b4660;color:#fdf3d8}.notice.call .go{background:#a8322a}
.notice .x{background:none;color:rgba(58,42,26,.7);padding:0 6px;font-size:18px;line-height:30px}`;
  document.head.appendChild(css);
  const ICON={update:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14.5 6.5l3 3M4 20l7.5-7.5M13 5l6 6-2.5 2.5-6-6z"/></svg>',
    call:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>'};
  let el=null,queue=[];
  function next(){if(el||!queue.length)return;const o=queue.shift();el=document.createElement('div');el.className='notice '+o.kind;
    el.innerHTML=`<i>${ICON[o.kind]||''}</i><span>${o.text}</span><button class="go">${o.act}</button><button class="x" aria-label="先不管">×</button>`;document.body.appendChild(el);
    requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('on')));
    const done=fn=>{const e=el;e.classList.remove('on');setTimeout(()=>{e.remove();el=null;fn&&fn();setTimeout(next,2500)},450)};
    el.querySelector('.go').onclick=()=>done(o.onAct);el.querySelector('.x').onclick=()=>done()}
  window.Notice={show(o){queue.push(o);next()}};
  /* 演示 */
  const toast=t=>{try{const e=document.getElementById('toast');if(!e)return;e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),1800)}catch(e){}};
  setTimeout(()=>{Notice.show({kind:'update',text:'<b>船修好了一处</b> · 点一下换上',act:'换上',onAct:()=>toast('（演示）换上了，接上以后这里会刷新到新版本')});
    Notice.show({kind:'call',text:'<b>电话刚断了一下</b> · 点一下接回',act:'接回',onAct:()=>toast('（演示）接上以后这里回到你们的通话页')})},4000);
})();
