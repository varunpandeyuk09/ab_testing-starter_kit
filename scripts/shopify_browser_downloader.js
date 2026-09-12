/**
 * shopify_browser_downloader.js
 * Tool: Download Shopify theme without CLI auth (uses browser session cookie)
 * Use when: Shopify CLI needs Authenticator but you are already logged in admin.shopify.com
 * Location: Open https://admin.shopify.com/store/<store>/themes/<theme_id> → F12 Console → paste
 * Saved: 2026-09-10 from ScrapeArmor 161424146684 (1005 assets) - verified working
 * Kit: ab_testing-starter_kit/scripts/
 */

// STEP 1: Check assets count (paste first to verify)
(async()=>{
  const id='THEME_ID', store='store_handle'; // e.g., id='161424146684', store='scrapearmor'
  const res=await fetch(`/store/${store}/themes/${id}/assets.json`,{credentials:'include'});
  const {assets}=await res.json();
  console.log(`Found ${assets.length} assets`, assets);
})();

// STEP 2: Full download as zip (requires JSZip)
(async()=>{
  if(typeof JSZip==='undefined'){
    await new Promise(r=>{
      let s=document.createElement('script');
      s.src='https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      s.onload=r; document.head.appendChild(s);
    });
  }
  const id='THEME_ID'; // ← replace
  const store='store_handle'; // ← replace e.g., 'scrapearmor'
  const zip=new JSZip();
  const r=await fetch(`/store/${store}/themes/${id}/assets.json`,{credentials:'include'});
  const {assets}=await r.json();
  console.log('Downloading',assets.length,'files…');
  for(let i=0;i<assets.length;i++){
    let key=assets[i].key;
    let res=await fetch(`/store/${store}/themes/${id}/assets.json?asset[key]=${encodeURIComponent(key)}`,{credentials:'include'});
    let j=await res.json();
    if(j.asset?.value!==undefined) zip.file(key, j.asset.value);
    else if(j.asset?.attachment) zip.file(key, j.asset.attachment,{base64:true});
    if(i%50===0) console.log(i+'/'+assets.length, key);
  }
  let blob=await zip.generateAsync({type:'blob'});
  let url=URL.createObjectURL(blob);
  let a=document.createElement('a'); a.href=url; a.download=`${store}-${id}.zip`; a.click();
  console.log('Done — zip downloaded');
})();

// Notes:
// - Run on same origin: https://admin.shopify.com/store/<store>/themes/<id>
// - Uses browser session cookie, no CLI Authenticator needed
// - Unzip to: D:\WORK_EXPOGROWTH\AB-test\<CLIENT>\<TEST>\shopify\theme  (new standard 2026-09-10)
// - Then use for SCRA PArmor PLP Test etc.
