/*
 * ============================================================
 * Test    : T09 I A/B Test - USP Technical vs USP Usability - DE / CH / AT
 * Client  : ZATTOO
 * URL     : https://zattoo.com/ch/tv-tipps/die-hoehle-der-loewen-online-livestream
 * Insert  : beforebegin closest section of [data-soul="PACKAGE_CARDS"] + custom class on that section
 * Anchor  : [data-soul="PACKAGE_CARDS"] -> closest('section')
 * Patterns: P2 (Insert Section), P9 (Load Swiper), P12 (Responsive)
 * Body CSS: EG-ZATTOO-T09
 * ============================================================
 */
(function () {
  try {
    var debug = 0;
    var variation_name = 'EG-ZATTOO-T09';
    var swiperInstance = null;

    // icons fixed - not in data object
    var iconUrls = [
      'https://images.ctfassets.net/nn6vbw09vzdt/1zRbv72B3f54HV9BtVOB8J/6a669d3c5929a8f528303f39139c10c2/Von_vorne_starten.svg',
      'https://images.ctfassets.net/nn6vbw09vzdt/7lyrJxeig5UNg0ycjBtKhj/a51aee8208230e29b86a7dd4784ad398/Live_pausieren.svg',
      'https://images.ctfassets.net/nn6vbw09vzdt/BmgRY9NwPX6MPDb4aORZl/c944839728c52b011cb66a3f72d56ceb/Ganze_Folgen_aufnehmen.svg',
      'https://images.ctfassets.net/nn6vbw09vzdt/w8LETrbVsyJwyYUsORkIp/63560d8ff0069dd980964d6f912439fd/1c628612-548b-4b36-bb1f-e19748ad538b.svg',
      'https://images.ctfassets.net/nn6vbw09vzdt/4fl3WDL1ySd1ovYO6n63m8/34d15d916c6f8313382bba4844c593d9/379f060f-9d02-4de8-8832-87bd6c5cc274.svg',
      'https://images.ctfassets.net/nn6vbw09vzdt/4tvCu3FnrronTZoh8P5UHS/5bdb99a96f20f60c85d4aad8881102a3/Auch_im_EU-Ausland.svg'
    ];

    // content without icons - verified from live pages 2026-09-10
    // CH: https://zattoo-master.zattoo.com/ch/tv-tipps/bauer-ledig-sucht-im-tv-livestream -> SRF + 300
    // DE: https://zattoo-master.zattoo.com/de/tv-tipps/the-masked-singer-livestream -> SAT.1 + 200
    // AT: https://zattoo-master.zattoo.com/at/tv-tipps/the-masked-singer-livestream -> ORF + 150
    var benefitsContent = {
      de: [
        { title: 'Von vorne starten', text: 'Verpasst du den Anfang, startest du die laufende Folge dank Restart einfach neu.' },
        { title: 'Live pausieren', text: 'Kurz weg vom Sofa? Mit Live-Pause hältst du die Sendung an und schaust weiter, wenn du zurück bist.' },
        { title: 'Ganze Folgen aufnehmen', text: 'Nimm die komplette Staffel auf und schau sie, wann es dir passt.' },
        { title: 'Ein Log-in für alle', text: 'SAT.1, ProSieben und über 200 weitere Sender live in einer App – ohne zwischen Sender-Apps zu springen.' },
        { title: 'Auf jedem Gerät', text: 'Smart-TV, Smartphone, Tablet, Fire TV Stick, Apple TV oder Chromecast.' },
        { title: 'Auch im EU-Ausland', text: 'Du bist im Urlaub? Deine Serie läuft trotzdem.' }
      ],
      ch: [
        { title: 'Von vorne starten', text: 'Verpasst du den Anfang, startest du die laufende Folge dank Restart einfach neu.' },
        { title: 'Live pausieren', text: 'Kurz weg vom Sofa? Mit Live-Pause hältst du die Sendung an und schaust weiter, wenn du zurück bist.' },
        { title: 'Ganze Folgen aufnehmen', text: 'Nimm die komplette Staffel auf und schau sie, wann es dir passt.' },
        { title: 'Ein Log-in für alle', text: 'SRF, ProSieben und über 300 weitere Sender live in einer App – ohne zwischen Sender-Apps zu springen.' },
        { title: 'Auf jedem Gerät', text: 'Smart-TV, Smartphone, Tablet, Fire TV Stick, Apple TV oder Chromecast.' },
        { title: 'Auch im EU-Ausland', text: 'Du bist im Urlaub? Deine Serie läuft trotzdem.' }
      ],
      at: [
        { title: 'Von vorne starten', text: 'Verpasst du den Anfang, startest du die laufende Folge dank Restart einfach neu.' },
        { title: 'Live pausieren', text: 'Kurz weg vom Sofa? Mit Live-Pause hältst du die Sendung an und schaust weiter, wenn du zurück bist.' },
        { title: 'Ganze Folgen aufnehmen', text: 'Nimm die komplette Staffel auf und schau sie, wann es dir passt.' },
        { title: 'Ein Log-in für alle', text: 'ORF, ProSieben und über 150 weitere Sender live in einer App – ohne zwischen Sender-Apps zu springen.' },
        { title: 'Auf jedem Gerät', text: 'Smart-TV, Smartphone, Tablet, Fire TV Stick, Apple TV oder Chromecast.' },
        { title: 'Auch im EU-Ausland', text: 'Du bist im Urlaub? Deine Serie läuft trotzdem.' }
      ]
    };

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function loadSwiper(cb) {
      if (document.querySelector('.eg-swiper-loaded')) { cb(); return; }
      var g = document.createElement('div'); g.className = 'eg-swiper-loaded'; document.head.appendChild(g);
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css'; document.head.appendChild(l);
      var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js'; s.onload = cb; document.head.appendChild(s);
    }

    function initBenefitsSwiper() {
      var isMobile = window.innerWidth <= 768;
      var el = document.querySelector('.EG-BENEFITS__swiper');
      if (!el) return;
      if (isMobile) {
        if (swiperInstance) return;
        if (!window.Swiper) return;
        swiperInstance = new Swiper(el, {
          slidesPerView: 1.2,
          spaceBetween: 16,
          slidesOffsetAfter: 16,
          scrollbar: { el: '.EG-BENEFITS__bar', draggable: true, hide: false, dragSize: 60 },
          freeMode: false
        });
      } else {
        if (swiperInstance) { swiperInstance.destroy(true, true); swiperInstance = null; }
      }
    }

    function getBenefitsHTML() {
      var market = location.pathname.indexOf('/at/') !== -1 ? 'at' : location.pathname.indexOf('/ch/') !== -1 ? 'ch' : 'de';
      var data = benefitsContent[market] || benefitsContent.de;
      var html = '<div class="EG-BENEFITS"><div class="EG-BENEFITS__swiper swiper"><div class="EG-BENEFITS__grid swiper-wrapper">';
      for (var i = 0; i < data.length; i++) {
        html += '<div class="EG-BENEFITS__card swiper-slide">' +
          '<img class="EG-BENEFITS__icon" src="' + iconUrls[i] + '" alt="">' +
          '<h3 class="EG-BENEFITS__title">' + data[i].title + '</h3>' +
          '<p class="EG-BENEFITS__text">' + data[i].text + '</p>' +
          '</div>';
      }
      html += '</div><div class="EG-BENEFITS__bar swiper-scrollbar"></div></div></div>';
      return html;
    }

    function init() {
      if (document.querySelector('.EG-BENEFITS')) return;
      document.body.classList.add('EG-ZATTOO-T09');

      var anchor = document.querySelector('[data-soul="PACKAGE_CARDS"]');
      if (!anchor) return;

      // closest section parent + custom class
      var sectionParent = anchor.closest ? anchor.closest('section') : null;
      if (!sectionParent) {
        var p = anchor.parentElement;
        while (p && p.tagName && p.tagName.toLowerCase() !== 'section') p = p.parentElement;
        sectionParent = p;
      }
      if (!sectionParent) return;

      sectionParent.classList.add('EG-ZATTOO-T09--anchor-section');

      sectionParent.insertAdjacentHTML('beforebegin', getBenefitsHTML());

      loadSwiper(function () {
        initBenefitsSwiper();
        var resizeTimer;
        window.addEventListener('resize', function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(initBenefitsSwiper, 200);
        }, { passive: true });
      });
    }

    waitForElement('[data-soul="PACKAGE_CARDS"]', init,1000, 15000);

  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();
