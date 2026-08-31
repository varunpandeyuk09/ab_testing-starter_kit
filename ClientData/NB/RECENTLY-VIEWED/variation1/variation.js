(function () {
  try {
    var debug = 1;
    var variation_name = 'NB-RECENTLY-VIEWED';
    var API_BASE = 'https://www.newbalance.com.au/on/demandware.store/Sites-NBAU-Site/en_AU/Product-Variation';
    var SESSION_KEY = 'egrecentlyviewed';

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function loadSlick(callback) {
      if (window.jQuery && window.jQuery.fn.slick) { callback(); return; }

      function loadjQuery(cb) {
        if (window.jQuery) { cb(); return; }
        var s = document.createElement('script');
        s.src = 'https://code.jquery.com/jquery-3.7.1.min.js';
        s.onload = cb;
        document.head.appendChild(s);
      }

      loadjQuery(function () {
        if (window.jQuery.fn.slick) { callback(); return; }
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.css';
        document.head.appendChild(link);

        var linkTheme = document.createElement('link');
        linkTheme.rel = 'stylesheet';
        linkTheme.href = 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick-theme.min.css';
        document.head.appendChild(linkTheme);

        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js';
        script.onload = callback;
        document.head.appendChild(script);
      });
    }

    function getCookie(name) {
      var v = null;
      document.cookie.split(';').forEach(function (c) {
        var m = c.trim().match(name + '=([^;]*)');
        if (m) v = decodeURIComponent(m[1]);
      });
      return v;
    }

    function getRecentlyViewedProducts() {
      try {
        var raw = getCookie(SESSION_KEY);
        if (!raw) return [];
        var ids = raw.split(',').filter(function (id) { return id !== ''; });
        return ids;
      } catch (e) {
        if (debug) console.log('[' + variation_name + '] Cookie parse error:', e);
        return [];
      }
    }

    function fetchProductData(pid) {
      var url = API_BASE + '?pid=' + encodeURIComponent(pid) + '&quantity=1';
      return fetch(url, { headers: { 'x-requested-with': 'XMLHttpRequest' } })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (json) {
          if (!json || !json.product) return null;
          if (debug) console.log('[' + variation_name + '] API response for ' + pid + ':', json);
          var p = json.product;

          var image = '';
          if (p.images && p.images.productDetail && p.images.productDetail[0]) {
            image = p.images.productDetail[0].src || p.images.productDetail[0].url || '';
          }

          var name = p.productName || '';
          var gender = p.gender || p.genderEnum || '';

          var salePrice = '';
          var listPrice = '';
          if (p.price) {
            if (p.price.sales) {
              salePrice = p.price.sales.formatted || (p.price.sales.value !== undefined ? '$' + Number(p.price.sales.value).toFixed(2) : '');
            }
            if (p.price.list) {
              listPrice = p.price.list.formatted || (p.price.list.value !== undefined ? '$' + Number(p.price.list.value).toFixed(2) : '');
            }
          }

          var pdpUrl = p.selectedProductUrl || '';
          if (pdpUrl && pdpUrl.indexOf('http') === -1) {
            pdpUrl = 'https://www.newbalance.com.au' + pdpUrl;
          }

          return {
            id: pid,
            name: name,
            gender: gender,
            image: image,
            listPrice: listPrice,
            salePrice: salePrice,
            url: pdpUrl
          };
        })
        .catch(function (e) {
          if (debug) console.log('[' + variation_name + '] Fetch error for ' + pid + ':', e.message);
          return null;
        });
    }

    function buildCard(product) {
      if (!product) return '';
      var genderLabel = product.gender || '';
      var hasSale = product.salePrice && product.listPrice && product.salePrice !== product.listPrice;

      return ''
        + '<div class="eg-rv-slide">'
          + '<a href="' + (product.url || '#') + '" class="eg-rv-card" data-pid="' + product.id + '">'
            + '<div class="eg-rv-card__img-wrap">'
              + '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy" class="eg-rv-card__img" />'
            + '</div>'
            + '<div class="eg-rv-card__info">'
              + '<h3 class="eg-rv-card__name">' + product.name + '</h3>'
              + (genderLabel ? '<p class="eg-rv-card__gender">' + genderLabel + '</p>' : '')
              + '<div class="eg-rv-card__prices">'
                + (hasSale
                  ? '<span class="eg-rv-card__sale">' + product.salePrice + '</span><span class="eg-rv-card__list">' + product.listPrice + '</span>'
                  : '<span class="eg-rv-card__price">' + (product.listPrice || product.salePrice || '') + '</span>'
                )
              + '</div>'
            + '</div>'
          + '</a>'
        + '</div>';
    }

    function buildCarousel(products) {
      if (document.querySelector('.eg-rv-section')) return;

      var section = document.createElement('div');
      section.className = 'eg-rv-section';

      var heading = document.createElement('h2');
      heading.className = 'eg-rv-heading';
      heading.textContent = 'Recently viewed';
      section.appendChild(heading);

      var track = document.createElement('div');
      track.className = 'eg-rv-track';

      for (var i = 0; i < products.length; i++) {
        track.insertAdjacentHTML('beforeend', buildCard(products[i]));
      }

      section.appendChild(track);

      var footer = document.querySelector('.footer, footer, .page-footer, #footer');
      if (footer) {
        footer.insertAdjacentElement('beforebegin', section);
      } else {
        document.body.appendChild(section);
      }

      var $ = window.jQuery;
      $(track).slick({
        dots: true,
        infinite: false,
        speed: 300,
        slidesToShow: 3.3,
        slidesToScroll: 1,
        arrows: false,
        responsive: [
          {
            breakpoint: 1024,
            settings: { slidesToShow: 2.3, slidesToScroll: 1 }
          },
          {
            breakpoint: 768,
            settings: { slidesToShow: 2.3, slidesToScroll: 1 }
          },
          {
            breakpoint: 480,
            settings: { slidesToShow: 2.3, slidesToScroll: 1 }
          }
        ]
      });
    }

    function init() {
      document.body.classList.add('NB-RECENTLY-VIEWED');
      var pids = getRecentlyViewedProducts();
      if (!pids.length) {
        if (debug) console.log('[' + variation_name + '] No recently viewed products found');
        return;
      }
      if (debug) console.log('[' + variation_name + '] Found products:', pids);

      var promises = pids.map(function (pid) { return fetchProductData(pid); });
      Promise.all(promises).then(function (results) {
        var valid = results.filter(function (r) { return r !== null; });
        if (!valid.length) {
          if (debug) console.log('[' + variation_name + '] No valid product data');
          return;
        }
        if (debug) console.log('[' + variation_name + '] Fetched:', valid.length, 'products');
        buildCarousel(valid);
      });
    }

    loadSlick(function () {
      waitForElement('html body', init, 100, 15000);
    });
  } catch (e) {
    if (debug) console.log(e, 'error in ' + variation_name);
  }
})();
