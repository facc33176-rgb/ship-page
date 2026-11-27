/* 往下翻：头图和木牌收上去，把地方让给内容；翻回顶上再放下来 */
(function(){const app=document.getElementById('app'),head=app&&app.querySelector('.head');if(!app||!head)return;
  const setH=()=>app.style.setProperty('--headh',head.offsetHeight+'px');setH();addEventListener('resize',setH);
  let last=0;document.addEventListener('scroll',e=>{const t=e.target;if(!t||!t.classList||!t.classList.contains('body'))return;const y=t.scrollTop;
    if(app.dataset.tuck!=='no'&&y>46&&y>last&&t.scrollHeight-t.clientHeight>head.offsetHeight+120)app.classList.add('tuck');else if(y<12)app.classList.remove('tuck');last=y},true);
  const tabs=app.querySelector('.tabs');if(tabs)tabs.addEventListener('click',()=>app.classList.remove('tuck'));
})();
