
(function(){
  var root=document.documentElement;
  function setTheme(t){ if(t==='light'){root.dataset.theme='light';}else{delete root.dataset.theme;} try{localStorage.setItem('th-theme',t)}catch(e){} var b=document.getElementById('theme'); if(b)b.textContent=(t==='light'?'☀':'☾'); }
  var saved='dark'; try{saved=localStorage.getItem('th-theme')||'dark'}catch(e){}
  setTheme(saved);
  var btn=document.getElementById('theme');
  if(btn) btn.onclick=function(){ setTheme(root.dataset.theme==='light'?'dark':'light'); };

  /* 顶栏高度实测同步到 --navh：锚点 scroll-padding 与吸顶工具栏都靠它对齐 */
  var navEl=document.querySelector('.topnav');
  function syncNavh(){
    if(!navEl) return;
    var h=Math.round(navEl.getBoundingClientRect().height);
    var cur=parseInt(root.style.getPropertyValue('--navh'),10);
    if(h>0&&h!==cur) root.style.setProperty('--navh',h+'px');
  }

  /* 字号档位：small / normal / large，存 localStorage */
  var FS=['small','normal','large'];
  function applyFs(v){
    if(v==='small'||v==='large'){ root.dataset.fs=v; } else { delete root.dataset.fs; }
    try{ localStorage.setItem('th-fs',v); }catch(e){}
    document.querySelectorAll('.fs-btn').forEach(function(b){
      var on=b.getAttribute('data-fs')===v;
      b.classList.toggle('on',on);
      b.setAttribute('aria-pressed', on?'true':'false');
    });
    syncNavh();
  }
  var savedFs='normal'; try{ savedFs=localStorage.getItem('th-fs')||'normal'; }catch(e){}
  if(FS.indexOf(savedFs)<0) savedFs='normal';
  applyFs(savedFs);
  document.querySelectorAll('.fs-btn').forEach(function(b){
    b.onclick=function(){
      var i=FS.indexOf(savedFs);
      i += (b.getAttribute('data-fs')==='large' ? 1 : -1);
      if(i<0) i=0; if(i>FS.length-1) i=FS.length-1;
      savedFs=FS[i]; applyFs(savedFs);
    };
  });
  syncNavh();
  window.addEventListener('resize',syncNavh,{passive:true});
  if(window.ResizeObserver && navEl){ new ResizeObserver(syncNavh).observe(navEl); }

  var pr=document.getElementById('progress');
  if(pr){ window.addEventListener('scroll',function(){ var h=document.documentElement; var max=h.scrollHeight-h.clientHeight; pr.style.width=(max>0?(h.scrollTop/max*100):0)+'%'; },{passive:true}); }

  document.querySelectorAll('.btn-copy').forEach(function(b){
    b.addEventListener('click',function(){
      var box=b.closest('.src')||b.closest('.dlg-actions-inline')||b.closest('.raw');
      var t=box?box.innerText:'';
      if(navigator.clipboard){ navigator.clipboard.writeText(t).then(function(){ b.textContent='已复制'; setTimeout(function(){b.textContent='复制原文'},1200); }).catch(function(){}); }
    });
  });

  var search=document.getElementById('concept-search');
  if(search){
    var cards=Array.prototype.slice.call(document.querySelectorAll('[data-text]'));
    var count=document.getElementById('concept-count');
    var chips=Array.prototype.slice.call(document.querySelectorAll('.chips .chip[data-cat]'));
    var empty=document.getElementById('cempty');
    /* 默认收在第一类（不是「全部」），免得 132 张卡把页面拖太长 */
    var defCat='all';
    for(var ci=0;ci<chips.length;ci++){
      var dc=chips[ci].getAttribute('data-cat');
      if(dc&&dc!=='all'){ defCat=dc; break; }
    }
    var cat=defCat, autoAll=false;
    function apply(){
      var q=search.value.trim().toLowerCase(); var n=0;
      cards.forEach(function(c){
        var hit=(!q||c.getAttribute('data-text').toLowerCase().indexOf(q)>=0)&&(cat==='all'||c.getAttribute('data-cat')===cat);
        c.style.display=hit?'':'none'; if(hit)n++;
      });
      if(count) count.textContent=n+' 条';
      if(empty) empty.hidden=n>0;
      chips.forEach(function(ch){ ch.classList.toggle('on', ch.getAttribute('data-cat')===cat); });
    }
    /* 一旦输入关键词就临时放开到「全部」，清空后回到默认分类 */
    search.addEventListener('input',function(){
      var q=search.value.trim();
      if(q){ if(cat!=='all'){ cat='all'; autoAll=true; } }
      else if(autoAll){ cat=defCat; autoAll=false; }
      apply();
    });
    chips.forEach(function(ch){
      ch.addEventListener('click',function(){ cat=ch.getAttribute('data-cat')||defCat; autoAll=false; apply(); });
    });
    apply();
  }
})();
