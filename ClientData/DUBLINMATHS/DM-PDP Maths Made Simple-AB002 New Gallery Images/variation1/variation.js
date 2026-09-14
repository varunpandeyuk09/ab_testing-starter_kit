(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-DM-AB002';

    var newImages = [
      'https://i.ibb.co/SDw0D37V/1.png',
      'https://i.ibb.co/gMGhc0mR/2.png',
      'https://i.ibb.co/ds0L8Ybb/9.png',
      'https://i.ibb.co/LD1jdj1J/10.png',
      'https://i.ibb.co/wFgr5gZj/5.png',
      'https://i.ibb.co/2JpKT1p/6.png',
      'https://i.ibb.co/xqPNW2n8/7.png',
      'https://i.ibb.co/xqybRWjh/8.png'
    ];

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (
          document &&
          document.querySelector(selector) &&
          document.querySelectorAll(selector).length > 0
        ) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }

    function swapGalleryImages() {
      var gallery = document.querySelector('.woocommerce-product-gallery__wrapper, .product-images, .gallery-wrapper, [class*="gallery"]');
      if (!gallery) return;

      var thumbs = gallery.querySelectorAll('img');
      for (var i = 0; i < thumbs.length && i < newImages.length; i++) {
        var img = thumbs[i];
        if (img.dataset.egSwapped) continue;
        img.dataset.egOrig = img.src;
        img.src = newImages[i];
        img.srcset = newImages[i];
        if (img.dataset.src) img.dataset.src = newImages[i];
        var sources = img.closest('picture');
        if (sources) {
          var srcTags = sources.querySelectorAll('source');
          for (var j = 0; j < srcTags.length; j++) {
            srcTags[j].srcset = newImages[i];
          }
        }
        img.dataset.egSwapped = '1';
      }
    }

    function init() {
      document.body.classList.add('EG-DM-AB002');
      swapGalleryImages();
    }

    waitForElement('.woocommerce-product-gallery__wrapper img, .product-images img, .gallery-wrapper img, [class*="gallery"] img', init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();
