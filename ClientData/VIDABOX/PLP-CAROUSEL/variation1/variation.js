(function () {
  var debug = 1;
  var v = 'VID-CAROUSEL';

  function wait(sel, fn, ms) {
    var i = setInterval(function () {
      if (document.querySelector(sel)) { clearInterval(i); fn(); }
    }, ms || 100);
    setTimeout(function () { clearInterval(i); }, 20000);
  }

  // Load Swiper
  function loadSwiper() {
    return new Promise(function (resolve) {
      if (window.Swiper) { resolve(); return; }

      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css';
      document.head.appendChild(link);

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  function fetchPDPImages(url) {
    return fetch(url).then(function (r) { return r.text(); }).then(function (html) {
      var doc = new DOMParser().parseFromString(html, 'text/html');
      var imgs = [];
      doc.querySelectorAll('.more-views .cloud-zoom-gallery').forEach(function (a) {
        var href = a.getAttribute('href');
        if (href && imgs.indexOf(href) === -1) imgs.push(href);
      });
      if (imgs.length === 0) {
        doc.querySelectorAll('.zoom-img .fancybox').forEach(function (a) {
          var href = a.getAttribute('href');
          if (href && imgs.indexOf(href) === -1) imgs.push(href);
        });
      }
      return imgs;
    });
  }

  function buildCarousel(card, images) {
    if (card.dataset.egCarousel) return;
    card.dataset.egCarousel = '1';

    var imgWrap = card.querySelector('.category-section-card-image-contents');
    if (!imgWrap || images.length < 2) return;

    var mainImg = imgWrap.querySelector('.category-section-card-image');
    if (!mainImg) return;

    var id = 'eg-swiper-' + Math.random().toString(36).substr(2, 6);

    var slides = images.map(function (src) {
      return '<div class="swiper-slide" style="display:flex;align-items:center;justify-content:center;">'
        + '<img src="' + src + '" style="width:100%;height:auto;display:block;" loading="lazy" />'
        + '</div>';
    }).join('');

    var thumbs = images.map(function (src) {
      return '<div class="swiper-slide" style="opacity:0.5;cursor:pointer;">'
        + '<img src="' + src + '" style="width:100%;height:auto;display:block;" loading="lazy" />'
        + '</div>';
    }).join('');

    var html = ''
      + '<div class="swiper ' + id + '" style="width:100%;overflow:hidden;">'
        + '<div class="swiper-wrapper">' + slides + '</div>'
        + '<div class="swiper-button-prev" style="color:#007d40;width:24px;height:24px;"></div>'
        + '<div class="swiper-button-next" style="color:#007d40;width:24px;height:24px;"></div>'
      + '</div>'
      + '<div class="swiper eg-thumb ' + id + '-thumb" style="width:100%;overflow:hidden;margin-top:6px;">'
        + '<div class="swiper-wrapper">' + thumbs + '</div>'
      + '</div>';

    // Hide original
    mainImg.style.display = 'none';
    imgWrap.querySelectorAll('.category-section-card-image-secure, .category-section-card-image-adjustable').forEach(function (el) {
      el.style.display = 'none';
    });

    imgWrap.insertAdjacentHTML('afterbegin', html);

    new Swiper('.' + id, {
      loop: images.length > 2,
      slidesPerView: 1,
      spaceBetween: 0,
      navigation: { prevEl: '.' + id + ' .swiper-button-prev', nextEl: '.' + id + ' .swiper-button-next' },
      thumbs: {
        swiper: {
          el: '.' + id + '-thumb',
          slidesPerView: 4,
          spaceBetween: 4,
          watchSlidesProgress: true,
          freeMode: true,
          breakpoints: {
            0:    { slidesPerView: 3 },
            480:  { slidesPerView: 4 },
            768:  { slidesPerView: 5 }
          }
        }
      }
    });

    // Thumbnails + arrows pe click ho to <a> navigate mat karo, lekin Swiper ko kaam karne do
    var cardLink = card.querySelector('a[href]');
    if (cardLink) {
      cardLink.addEventListener('click', function (e) {
        if (e.target.closest('.swiper-button-prev, .swiper-button-next, .eg-thumb')) {
          e.preventDefault();
        }
      }, true);
    }
  }

  function init() {
    var cards = document.querySelectorAll('.category-section-card');
    if (!cards.length) { if (debug) console.log(v + ': No cards found'); return; }

    if (debug) console.log(v + ': Found ' + cards.length + ' cards');

    var queue = Array.prototype.slice.call(cards);
    var batch = 5;

    function processNext() {
      var batchCards = queue.splice(0, batch);
      var promises = batchCards.map(function (card) {
        var link = card.querySelector('a[href]');
        if (!link) return Promise.resolve();
        var pdpUrl = link.getAttribute('href');
        return fetchPDPImages(pdpUrl).then(function (imgs) {
          if (imgs.length > 1) buildCarousel(card, imgs);
        }).catch(function (e) { if (debug) console.log(v + ': Fetch error', e); });
      });

      Promise.all(promises).then(function () {
        if (queue.length > 0) {
          setTimeout(processNext, 300);
        } else {
          if (debug) console.log(v + ': Done');
        }
      });
    }

    processNext();
  }

  wait('.category-section-card', function () {
    loadSwiper().then(init);
  }, 300);
})();
