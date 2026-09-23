(() => {
  'use strict';
  const state={scale:1,fit:1,rotation:0,flipX:1,flipY:1,fitMode:false,items:[],index:0,open:false,infoMode:0};
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const root=()=>$('#civ-root'), media=()=>$('#civ-media');
  const src=e=>e?.currentSrc||e?.src||e?.getAttribute('data-image-url')||'';
  const social=/(^|\.)((x|twitter)\.com|reddit\.com|redd\.it)$/i;
  const ignored=/avatar|profile|icon|emoji|logo|thumbnail|favicon/i;

  function unwrap(url){try{const u=new URL(url,location.href);const nested=u.searchParams.get('url');return nested?decodeURIComponent(nested):u.href;}catch{return url;}}
  function canonical(url){
    try{
      const u=new URL(unwrap(url),location.href); u.hash='';
      const name=decodeURIComponent(u.pathname).split('/').pop().toLowerCase().replace(/\.[a-z0-9]+$/,'').replace(/[_-](preview|large|small|medium|resized|thumb)$/,'');
      if(/(reddit\.com|redd\.it|redditmedia\.com)$/i.test(u.hostname)) return `reddit-media:${name}`;
      if(/(twitter\.com|x\.com)$/i.test(u.hostname)) { for(const key of ['name','format','fit','crop'])u.searchParams.delete(key); }
      return u.href;
    }catch{return url;}
  }
  function valid(e){
    if(!e||e.closest('#civ-root'))return false;
    const u=src(e),label=`${e.alt||''} ${e.getAttribute('aria-label')||''}`,w=e.naturalWidth||e.width||0,h=e.naturalHeight||e.height||0;
    return !!u&&!u.startsWith('data:')&&!ignored.test(label)&&(!w||!h||(w>=120&&h>=120));
  }
  function direct(){
    if(document.contentType?.startsWith('image/'))return true;
    if(location.pathname==='/media'&&new URLSearchParams(location.search).has('url'))return true;
    const a=$$('img'); return a.length===1&&a[0].naturalWidth&&[...document.body.children].filter(e=>!['SCRIPT','NOSCRIPT','STYLE'].includes(e.tagName)).length===1;
  }
  function uniqueGallery(clicked){
    const scope=clicked?.closest('article,[data-testid="tweet"],shreddit-post,[data-testid="post-container"]')||document;
    const seen=new Set(),out=[];
    for(const e of [clicked,...$$('img',scope)]){
      if(!valid(e))continue;
      const u=src(e),key=canonical(u); if(seen.has(key))continue;
      seen.add(key); out.push({src:u});
    }
    return out.length?out:[{src:src(clicked)}];
  }
  function css(){
    if($('#civ-style'))return;
    const s=document.createElement('style');s.id='civ-style';s.textContent=`
      html.civ-open,html.civ-open body{overflow:hidden!important}#civ-root{position:fixed!important;inset:0!important;z-index:2147483647!important;background:#000!important;overflow:auto!important;font-family:"Segoe UI",Inter,Arial,sans-serif}#civ-stage{display:flex!important;align-items:center!important;justify-content:center!important;min-width:100%!important;min-height:100%!important;position:relative!important}#civ-media{
display:block!important;
max-width:none!important;
max-height:none!important;
flex:0 0 auto!important;
margin:0!important;
transform-origin:center center!important;
user-select:none!important
}.civ-btn{position:fixed;z-index:2;border:0;background:#000b;color:#fff;font:22px Arial;padding:8px 14px;cursor:pointer}#civ-prev{left:16px;top:50%;transform:translateY(-50%)}#civ-next{right:16px;top:50%;transform:translateY(-50%)}#civ-count{position:fixed;z-index:2;top:18px;left:50%;transform:translateX(-50%);color:#fff;background:#000b;padding:6px 10px;font-size:12px}#civ-info,#civ-exif{position:fixed;z-index:3;color:#fff;background:#000e;font:12.5px/1.45 "Segoe UI",Inter,Arial,sans-serif;box-sizing:border-box}#civ-info{bottom:0;left:0;right:0;padding:10px 16px}#civ-exif{top:16px;right:16px;width:min(340px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;padding:14px 16px;border:1px solid #444;box-shadow:0 4px 20px #000}.civ-title{font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px}.civ-row{display:flex;gap:10px;border-bottom:1px solid #292929;padding:4px 0}.civ-row b{min-width:96px;color:#aaa;font-weight:500}`;document.head.appendChild(s);
  }
  function size(){const e=media(),w=e?.naturalWidth||0,h=e?.naturalHeight||0;return state.rotation%180?{w:h*state.scale,h:w*state.scale}:{w:w*state.scale,h:h*state.scale};}
  function fit(){const e=media(),w=e?.naturalWidth||0,h=e?.naturalHeight||0;return w&&h?Math.min(innerWidth/w,innerHeight/h):1;}
  function center(){const r=root();if(r){r.scrollLeft=Math.max(0,(r.scrollWidth-r.clientWidth)/2);r.scrollTop=Math.max(0,(r.scrollHeight-r.clientHeight)/2);}}
  function render(){const e=media(),stage=$('#civ-stage');if(!e||!stage)return;const w=e.naturalWidth,h=e.naturalHeight;e.style.width=`${w*state.scale}px`;e.style.height=`${h*state.scale}px`;e.style.transform=`rotate(${state.rotation}deg) scaleX(${state.flipX}) scaleY(${state.flipY})`;const d=size();stage.style.width=`${Math.max(innerWidth,d.w)}px`;stage.style.height=`${Math.max(innerHeight,d.h)}px`;requestAnimationFrame(center);const p=$('#civ-info');if(p)p.innerHTML=`<b>Original:</b> ${w} × ${h}px &nbsp; <b>Vista:</b> ${Math.round(d.w)} × ${Math.round(d.h)}px &nbsp; <b>Zoom:</b> ${Math.round(state.scale*100)}% &nbsp; <b>Rotación:</b> ${state.rotation}°`;}
  function ready(){state.fit=fit();state.scale=Math.min(1,state.fit);state.fitMode=state.fit<=1;render();}
  function bind(e){e.addEventListener('wheel',x=>{x.preventDefault();x.stopPropagation();state.scale=Math.min(12,Math.max(.05,+(state.scale+(x.deltaY>0?-.1:.1)).toFixed(3)));state.fitMode=false;render();},{passive:false});e.addEventListener('click',x=>{x.preventDefault();x.stopPropagation();state.fit=fit();state.scale=state.fitMode?1:state.fit;state.fitMode=!state.fitMode;render();},true);e.addEventListener('load',ready,{once:true});if(e.complete)ready();}
  function load(){const item=state.items[state.index],old=media();if(!item||!old)return;const e=document.createElement('img');e.id='civ-media';e.src=item.src;old.replaceWith(e);state.rotation=0;state.flipX=state.flipY=1;bind(e);counter();}
  function counter(){const c=$('#civ-count');if(c)c.textContent=`${state.index+1} / ${state.items.length}`;}
  function nav(n){if(state.items.length<2)return;state.index=(state.index+n+state.items.length)%state.items.length;load();}
  function close(){root()?.remove();document.documentElement.classList.remove('civ-open');state.open=false;state.infoMode=0;}
  function open(items){close();css();state.items=items.filter(x=>x?.src);state.index=0;state.open=true;const r=document.createElement('div');r.id='civ-root';const stage=document.createElement('div');stage.id='civ-stage';const e=document.createElement('img');e.id='civ-media';e.src=state.items[0].src;stage.appendChild(e);r.appendChild(stage);document.body.appendChild(r);document.documentElement.classList.add('civ-open');if(state.items.length>1){for(const [id,t,fn] of [['civ-prev','‹',()=>nav(-1)],['civ-next','›',()=>nav(1)]]){const b=document.createElement('button');b.id=id;b.className='civ-btn';b.textContent=t;b.onclick=fn;r.appendChild(b);}const n=document.createElement('div');n.id='civ-count';r.appendChild(n);counter();}bind(e);}
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function parseExif(buffer){
    const b=new Uint8Array(buffer),v=new DataView(buffer);let app=-1;
    for(let i=2;i+4<b.length;){if(b[i]!==255){i++;continue;}const marker=b[i+1],len=v.getUint16(i+2);if(marker===225&&new TextDecoder().decode(b.slice(i+4,i+10))==='Exif\0\0'){app=i+10;break;}i+=2+len;}
    if(app<0)return[];const little=v.getUint16(app)===0x4949,u16=p=>v.getUint16(p,little),u32=p=>v.getUint32(p,little),base=app,ifd=base+u32(base+4),count=u16(ifd),names={0x010f:'Fabricante',0x0110:'Modelo',0x0112:'Orientación',0x0131:'Software',0x0132:'Fecha',0x9003:'Fecha original',0x829a:'Exposición',0x829d:'Apertura',0x8827:'ISO'},sizes=[0,1,1,2,4,8],out=[];
    for(let n=0;n<count;n++){const p=ifd+2+n*12,tag=u16(p),type=u16(p+2),num=u32(p+4),bytes=(sizes[type]||1)*num,at=bytes<=4?p+8:base+u32(p+8);if(!names[tag])continue;let value=num;if(type===2)value=new TextDecoder().decode(b.slice(at,at+bytes)).replace(/\0/g,'').trim();else if(type===3)value=num===1?u16(at):num;else if(type===4)value=num===1?u32(at):num;out.push([names[tag],value]);}return out;
  }
  async function showExif(){const p=document.createElement('div');p.id='civ-exif';p.innerHTML='<div class="civ-title">EXIF</div><div>Lectura de metadatos…</div>';root().appendChild(p);try{const response=await fetch(state.items[state.index]?.src||src(media()));const entries=parseExif(await response.arrayBuffer());p.innerHTML='<div class="civ-title">EXIF</div>'+(entries.length?entries.map(([k,v])=>`<div class="civ-row"><b>${k}</b><span>${escapeHtml(v)}</span></div>`).join(''):'<div>Sin datos EXIF disponibles</div>');}catch{p.innerHTML='<div class="civ-title">EXIF</div><div>No se pudieron leer los metadatos.</div>';}}
  function key(e){
    if(!state.open)return;

    if(e.ctrlKey || e.altKey || e.metaKey)return;

    const k=e.key.toLowerCase();if(k==='escape')close();else if(k==='arrowleft')nav(-1);else if(k==='arrowright')nav(1);else if(k==='r')state.rotation=(state.rotation+90)%360;else if(k==='q')state.rotation=(state.rotation+270)%360;else if(k==='f')state.flipX*=-1;else if(k==='v')state.flipY*=-1;else if(k==='0')ready();else if(k==='+'||k==='=')state.scale=Math.min(12,state.scale+.1);else if(k==='-'||k==='_')state.scale=Math.max(.05,state.scale-.1);else if(k==='i'){state.infoMode=(state.infoMode+1)%3;$('#civ-info')?.remove();$('#civ-exif')?.remove();if(state.infoMode){const p=document.createElement('div');p.id='civ-info';root().appendChild(p);render();if(state.infoMode===2)showExif();}}else return;render();e.preventDefault();e.stopPropagation();}
  function run(){if(direct()){const e=$('img');open([{src:src(e)}]);return;}if(!social.test(location.hostname))return;document.addEventListener('click',e=>{if(e.button!==0||e.defaultPrevented)return;const img=e.target.closest?.('img');if(!valid(img))return;e.preventDefault();e.stopImmediatePropagation();open(uniqueGallery(img));},true);}
  document.addEventListener('keydown',key,true);addEventListener('resize',()=>{if(state.open){state.fit=fit();if(state.fitMode)state.scale=state.fit;render();}});if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
