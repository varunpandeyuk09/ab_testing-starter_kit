// EK BAAR paste karke call kar de: AWG_watchCart()
function AWG_watchCart(){
  function sync(){
    return fetch('/widgets/checkout/info',{headers:{'X-Requested-With':'XMLHttpRequest'},credentials:'same-origin'})
    .then(r=>r.text()).then(html=>{
      let d=new DOMParser().parseFromString(html,'text/html');
      let n=d.querySelector('.badge.header-cart-badge');
      let count=n?parseInt(n.textContent.trim(),10):0;
      if(!count){
        let items=d.querySelectorAll('[data-cart-item]'),t=0;
        items.forEach(e=>{try{t+=JSON.parse(e.getAttribute('data-cart-item')).quantity}catch{}});
        count=t;
      }
      let badge=document.querySelector('.badge.header-cart-badge')||document.querySelector('.header-cart-badge');
      if(!badge){
        badge=document.createElement('span');
        badge.className='badge -primary header-cart-badge';
        (document.querySelector('.header-cart-icon')||document.querySelector('[data-cart-widget]')).appendChild(badge);
      }
      badge.textContent=count;
      badge.style.display=count?'':'none';
      let a=document.getElementById('cart-widget-aria-label'); if(a) a.textContent='Warenkorb enthält '+count+' Positionen.';
      return count;
    });
  }
  window.AWG_sync=sync; // manual call ke liye: AWG_sync()

  // --- WATCHER for https://www.awg-mode.de/checkout/line-item/add ---
  let URL='/checkout/line-item/add';
  let of=window.fetch;
  window.fetch=function(i,init){
    let u=typeof i==='string'?i:i.url||'', p=of.apply(this,arguments);
    if(u.includes(URL)){
      let q=1; try{if(init&&init.body){let s=String(init.body);let m=s.match(/quantity[^0-9]*(\d+)/);if(m)q=+m[1]; if(init.body instanceof FormData) q=+(init.body.get('lineItems[quantity]')||1)}}catch{}
      let cur=parseInt(document.querySelector('.badge.header-cart-badge')?.textContent||0,10)||0;
      let b=document.querySelector('.badge.header-cart-badge'); if(b){b.textContent=cur+q; b.style.display='';}
      p.then(r=>{if(r.ok) setTimeout(sync,300);});
    }
    return p;
  };
  let oO=XMLHttpRequest.prototype.open, oS=XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open=function(m,u){this._u=u;return oO.apply(this,arguments)};
  XMLHttpRequest.prototype.send=function(b){
    if(this._u&&this._u.includes(URL)){
      this.addEventListener('load',()=>{if(this.status>=200&&this.status<400) setTimeout(sync,300)});
    }
    return oS.apply(this,arguments);
  };
  document.addEventListener('submit',e=>{
    if(e.target.matches&&e.target.matches('form[action*="/checkout/line-item/add"]')) setTimeout(sync,600);
  },true);

  sync(); // init load pe
  console.log('[AWG] watcher ON for',URL,' -> <span class="badge -primary header-cart-badge">');
}

// dusre test me bas ye 1 line:
AWG_watchCart();