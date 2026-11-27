/* fx.js：让东西有重量。
   Fx.hang(选择器,{k,c,max,gain,pass})  挂着的东西：滑动带着晃、手指拨一下荡起来、还会传给旁边的；晃完自己停，不白占帧
   Fx.spin(选择器,开着吗的函数)          转盘：起转慢慢快、停下慢慢慢（改的是动画的播放速度，不另起一套）
   Fx.water(容器,[[x0,y0,x1,y1]...])     点水面出一圈圈涟漪，手指划过留一道水痕（百分比区域）
   晃动只写 rotate 这个单独的属性，和原来 CSS 里的 transform 动画互不打架 */
(function(){
  const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const kinds=[],st=new WeakMap();let live=new Set(),raf=0,last=0;
  function S(el,o){let s=st.get(el);if(!s){s={el,a:0,v:0,o};st.set(el,s)}return s}
  function step(t){const dt=Math.min(.034,(t-last)/1000||.016);last=t;
    live.forEach(s=>{if(!s.el.isConnected){live.delete(s);return}
      const o=s.o;s.v+=(-o.k*s.a-o.c*s.v)*dt;s.a+=s.v*dt;
      if(s.a>o.max){s.a=o.max;s.v*=-.3}else if(s.a<-o.max){s.a=-o.max;s.v*=-.3}
      if(Math.abs(s.a)<.04&&Math.abs(s.v)<.5){s.a=s.v=0;s.el.style.rotate='';live.delete(s)}
      else s.el.style.rotate=s.a.toFixed(2)+'deg'});
    raf=live.size?requestAnimationFrame(step):0}
  function kick(el,o,v){if(still)return;const s=S(el,o);s.v+=v;live.add(s);if(!raf){last=performance.now();raf=requestAnimationFrame(step)}}
  function each(root,fn){kinds.forEach(o=>(root.querySelectorAll?root:document).querySelectorAll(o.sel).forEach((el,i)=>fn(el,o,i)))}
  /* 滑动：容器往哪边走，挂着的东西往反方向甩 */
  const pos=new WeakMap();
  addEventListener('scroll',e=>{const t=e.target===document?document.scrollingElement:e.target;if(!t||t.scrollTop==null)return;
    const p=pos.get(t)||{x:t.scrollLeft,y:t.scrollTop},dx=t.scrollLeft-p.x,dy=t.scrollTop-p.y;pos.set(t,{x:t.scrollLeft,y:t.scrollTop});
    if(!dx&&!dy)return;const d=Math.max(-40,Math.min(40,dx||dy));
    each(t,(el,o,i)=>kick(el,o,(dx?-d:d*(i%2?-.55:.55))*o.gain*1.6))},{capture:true,passive:true});
  /* 手指：拨哪边就往另一边荡，旁边的隔一会儿跟着动 */
  addEventListener('pointerdown',e=>{kinds.forEach(o=>{const el=e.target.closest&&e.target.closest(o.sel);if(!el)return;
    const r=el.getBoundingClientRect(),side=(e.clientX-(r.left+r.width/2))/(r.width/2||1),v=(side>0?-1:1)*(70+90*Math.min(1,Math.abs(side)))*o.gain;
    kick(el,o,v);if(!o.pass)return;const all=[...document.querySelectorAll(o.sel)],i=all.indexOf(el);
    [[-1,.42,90],[1,.42,90],[-2,.18,190],[2,.18,190]].forEach(([d,g,ms])=>{const n=all[i+d];if(n)setTimeout(()=>kick(n,o,v*g),ms)})})},{passive:true});
  /* 手机一歪（不用另外要权限的机器上才有） */
  let gx=null;addEventListener('devicemotion',e=>{const a=e.accelerationIncludingGravity;if(!a||a.x==null)return;
    if(gx!=null){const d=a.x-gx;if(Math.abs(d)>.9)each(document,(el,o)=>kick(el,o,-d*14*o.gain))}gx=a.x},{passive:true});
  const Fx={
    hang(sel,o){kinds.push(Object.assign({sel,k:42,c:2.1,max:18,gain:1,pass:true},o||{}))},
    nudge(sel,v){document.querySelectorAll(sel).forEach((el,i)=>{const o=kinds.find(k=>el.matches(k.sel));if(o)setTimeout(()=>kick(el,o,v*(i%2?-1:1)),i*40)})},
    spin(sel,isOn,up,down){let r=0,to=0,rf=0,lt=0;up=up||1.5;down=down||2.4;
      const put=()=>document.querySelectorAll(sel).forEach(el=>el.getAnimations&&el.getAnimations().forEach(a=>{a.playbackRate=r;if(a.playState==='paused')a.play()}));
      const go=t=>{const dt=Math.min(.05,(t-lt)/1000);lt=t;r=to>r?Math.min(to,r+dt/up):Math.max(to,r-dt/down*(.35+r*.65));put();rf=r!==to?requestAnimationFrame(go):0};
      const chk=()=>{to=isOn()?1:0;if(still){r=to;put();return}if(r!==to&&!rf){lt=performance.now();rf=requestAnimationFrame(go)}else put()};
      new MutationObserver(chk).observe(document.body,{attributes:true,attributeFilter:['class'],childList:true,subtree:true});chk()},
    water(box,zones){if(!box)return;const inSea=(x,y)=>zones.some(z=>x>=z[0]&&x<=z[2]&&y>=z[1]&&y<=z[3]);let lx=0,ly=0,down=false,n=0;
      const drop=(x,y,small)=>{if(n>14)return;n++;const d=document.createElement('i');d.className='ripple'+(small?' sm':'');d.style.left=x+'%';d.style.top=y+'%';box.appendChild(d);setTimeout(()=>{d.remove();n--},small?1300:2300)};
      const at=e=>{const r=box.getBoundingClientRect();return[(e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100]};
      let wet=0;box.addEventListener('pointerdown',e=>{wet=0;if(e.target.closest('.sign'))return;const[x,y]=at(e);if(!inSea(x,y))return;wet=1;down=true;lx=x;ly=y;drop(x,y)});
      box.addEventListener('click',e=>{if(wet){wet=0;e.stopPropagation();e.preventDefault()}},true);/* 点在水上就只是水，不算点了旁边的房子 */
      box.addEventListener('pointermove',e=>{if(!down)return;const[x,y]=at(e);if(Math.hypot(x-lx,(y-ly)*2)<5)return;lx=x;ly=y;if(inSea(x,y))drop(x,y,true)});
      addEventListener('pointerup',()=>down=false);addEventListener('pointercancel',()=>down=false);
      const css=document.createElement('style');css.textContent='.ripple{position:absolute;width:17%;height:0;padding-bottom:6.2%;margin:-3.1% 0 0 -8.5%;pointer-events:none;z-index:3}.ripple.sm{width:9%;padding-bottom:3.3%;margin:-1.65% 0 0 -4.5%}'
        +'.ripple::before,.ripple::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid rgba(255,255,250,.95);box-shadow:0 0 6px 1px rgba(255,255,250,.6),inset 0 0 0 1.5px rgba(70,105,135,.35),0 0 0 1.5px rgba(70,105,135,.22);filter:blur(.4px);opacity:0;animation:rip 2.1s cubic-bezier(.2,.6,.3,1) forwards}'
        +'.ripple::after{animation-delay:.32s}.ripple.sm::before,.ripple.sm::after{animation-duration:1.2s;border-width:1px}.ripple.sm::after{display:none}'
        +'@keyframes rip{0%{transform:scale(.08);opacity:.95}70%{opacity:.35}100%{transform:scale(1);opacity:0}}';document.head.appendChild(css)}
  };
  window.Fx=Fx;
})();
