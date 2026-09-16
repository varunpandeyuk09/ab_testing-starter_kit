(function () {
  try {
    var debug = 0;
    var variation_name = "FOL 7.10 Banner Key Stats";

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function shouldRun() {
      var path = window.location.pathname;
      if (path.indexOf("/online-courses/") === -1) return false;
      // exclude listing page /online-courses/ itself without trailing course
      if (path === "/online-courses/" || path === "/online-courses") return false;
      // allow PDPs like /online-courses/psychology-courses/bachelor-psychological-science/
      return true;
    }

    function getMetaData() {
      var data = {};
      var slH = document.querySelector(".course-glance .details__item.study-load h5");
      var slP = document.querySelector(".course-glance .details__item.study-load p");
      var duH = document.querySelector(".course-glance .details__item.duration h5");
      var duP = document.querySelector(".course-glance .details__item.duration p");
      var inH = document.querySelector(".course-glance .details__item.intakes h5");
      var inP = document.querySelector(".course-glance .details__item.intakes p");
      var feH = document.querySelector(".course-glance .details__item.fees h5");
      var feP = document.querySelector(".course-glance .details__item.fees p");

      data.studyLoad = {
        label: slH ? slH.textContent.trim() : "Study load",
        html: slP ? slP.innerHTML.trim() : "10+ hrs per week"
      };
      data.duration = {
        label: duH ? duH.textContent.trim() : "Duration",
        html: duP ? duP.innerHTML.trim() : "3 years (360 credit pts)"
      };
      data.intakes = {
        label: inH ? inH.textContent.trim() : "Intakes",
        html: inP ? inP.innerHTML.trim() : "Jan, Apr, Jul, Oct"
      };
      data.fees = {
        label: feH ? feH.textContent.trim() : "Fees",
        html: feP ? feP.innerHTML.trim() : '$9,537* per year'
      };
      // clean study load text: control has "Approx. 10+ hours per week* (see course structure)" -> Figma wants "10+ hrs per week"
      // keep original html but shorten if contains Approx.
      if (data.studyLoad.html.indexOf("Approx") !== -1) {
        // extract "10+ hours" part and shorten to "10+ hrs per week"
        if (data.studyLoad.html.indexOf("10+") !== -1) data.studyLoad.html = "10+ hrs per week";
      }
      // Fees html already contains <a> link, keep as is

      // Fixed values per client Q (awaited) - treat as fixed for now
      data.delivery = { label: "Delivery", html: "100% online" };
      data.accreditation = { label: "Accreditation", html: "APAC-accredited" };

      return data;
    }

    function buildBarHTML(d) {
      var iconStudy = `<svg width="33" height="26" viewBox="0 0 33 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.49673 20.216L15.4583 22.6738C15.6875 22.7247 15.9198 22.75 16.1572 22.75C16.3944 22.75 16.6273 22.7241 16.858 22.6723L27.8196 20.2146C28.5577 20.0485 29.0828 19.3883 29.0828 18.6215V2.00434C29.0828 0.879531 28.1746 0.000507812 27.0981 0.000507812C27.0734 0.000644921 27.0582 0 27.043 0C26.8966 0 26.3866 0.0849571 16.1572 1.68238C5.91251 0.0827736 5.42274 0.000101563 5.27127 0.000101563C5.25322 0.000101563 5.2401 0.000644921 5.21547 0.000644921C4.13976 0.000543359 3.23143 0.879531 3.23143 2.00434V18.6215C3.23143 19.3883 3.75754 20.0485 4.49673 20.216ZM16.965 3.20429C16.965 3.20429 26.8309 1.66105 27.0935 1.62653C27.2702 1.62653 27.4672 1.77278 27.4672 2.00891L27.466 18.6297L16.965 20.9829V3.20429ZM4.84715 2.00891C4.84715 1.87571 4.90788 1.78714 4.95877 1.73626C4.99605 1.69897 5.07229 1.63866 5.22456 1.62719C5.49343 1.66258 15.3493 3.20429 15.3493 3.20429V20.9829L4.84715 18.6215V2.00891ZM31.5065 1.625C31.0621 1.625 30.6985 1.98859 30.6985 2.4375V19.4797C30.6985 20.6416 29.8755 21.6475 28.743 21.871L16.1572 24.3597L3.56971 21.873C2.43871 21.648 1.61572 20.6426 1.61572 19.4797V2.4375C1.61572 1.98859 1.2542 1.625 0.807857 1.625C0.361516 1.625 0 1.98859 0 2.4375V19.4797C0 21.416 1.37134 23.0922 3.26071 23.466L15.9996 25.9838C16.0511 25.9949 16.0612 26 16.1572 26C16.253 26 16.2613 25.9952 16.3125 25.9849L29.0565 23.4672C30.941 23.0954 32.3143 21.4196 32.3143 19.4797V2.4375C32.3143 1.98859 31.9507 1.625 31.5065 1.625Z" fill="#0602FF"/>
</svg>
`;
      var iconDuration = `<svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<mask id="mask0_24664_12043" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="26">
<path d="M19.8096 0H0V26H19.8096V0Z" fill="white"/>
</mask>
<g mask="url(#mask0_24664_12043)">
<path d="M9.25992 10.2121L5.95833 6.14961C5.7623 5.95156 5.72103 5.6164 5.86032 5.33711C5.99444 5.05426 6.28333 4.875 6.60318 4.875H13.2063C13.5262 4.875 13.8151 5.05426 13.9492 5.33711C14.0884 5.6164 14.0472 5.95156 13.8512 6.14961L10.5496 10.2121C10.3948 10.4508 10.1575 10.5625 9.90477 10.5625C9.65199 10.5625 9.41469 10.4508 9.25992 10.2121ZM9.90477 8.45L11.4884 6.5H8.32103L9.90477 8.45ZM12.381 17.875C12.6957 17.875 12.9793 18.0477 13.1187 18.3219L14.7694 21.5719C14.8984 21.8258 14.8829 22.1254 14.7333 22.364C14.5838 22.6028 14.3154 22.75 14.0318 22.75H5.73134C5.49404 22.75 5.22579 22.6028 5.07568 22.364C4.92504 22.1254 4.91162 21.8258 5.03957 21.5719L6.69088 18.3219C6.83016 18.0477 7.11389 17.875 7.38214 17.875H12.381ZM12.6957 21.125L11.8702 19.5H7.93929L7.11389 21.125H12.6957ZM0.825397 26C0.369571 26 0 25.6344 0 25.1875C0 24.7406 0.369571 24.375 0.825397 24.375H1.65079V22.1051C1.65079 20.5004 2.18782 18.8957 3.17829 17.6668L6.80437 13L3.17829 8.33321C2.18782 7.0586 1.65079 5.49961 1.65079 3.8934V1.625H0.825397C0.369571 1.625 0 1.26141 0 0.8125C0 0.363796 0.369571 0 0.825397 0H18.9841C19.4381 0 19.8096 0.363796 19.8096 0.8125C19.8096 1.26141 19.4381 1.625 18.9841 1.625H18.1588V3.8934C18.1588 5.49961 17.6222 7.0586 16.6318 8.33321L13.0051 13L16.6318 17.6668C17.6222 18.8957 18.1588 20.5004 18.1588 22.1051V24.375H18.9841C19.4381 24.375 19.8096 24.7406 19.8096 25.1875C19.8096 25.6344 19.4381 26 18.9841 26H0.825397ZM16.5079 22.1051C16.5079 20.8559 16.0901 19.6421 15.275 18.652L11.3131 13.4926C11.0861 13.1574 11.0861 12.7969 11.3131 12.5074L15.275 7.34804C16.0901 6.35781 16.5079 5.14414 16.5079 3.8934V1.625H3.30159V3.8934C3.30159 5.14414 3.71893 6.35781 4.48964 7.34804L8.49643 12.5074C8.72341 12.7969 8.72341 13.1574 8.49643 13.4926L4.48964 18.652C3.71893 19.6421 3.30159 20.8559 3.30159 22.1051V24.375H16.5079V22.1051Z" fill="#0602FF"/>
</g>
</svg>
`;
      var iconIntakes = `<svg width="23" height="26" viewBox="0 0 23 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.0908 20.0738C10.7773 20.3937 10.2615 20.3937 9.9479 20.0738L6.71116 16.8238C6.39256 16.509 6.39256 15.991 6.71116 15.6762C7.02472 15.3562 7.54059 15.3562 7.85413 15.6762L10.5194 18.3523L15.6122 13.2387C15.9258 12.9187 16.4416 12.9187 16.7552 13.2387C17.0738 13.5535 17.0738 14.0715 16.7552 14.3863L11.0908 20.0738ZM6.47347 3.25H16.1837V0.8125C16.1837 0.363796 16.5478 0 16.9928 0C17.4379 0 17.8021 0.363796 17.8021 0.8125V3.25H19.4204C21.2057 3.25 22.6572 4.70488 22.6572 6.5V22.75C22.6572 24.5426 21.2057 26 19.4204 26H3.23674C1.44895 26 0 24.5426 0 22.75V6.5C0 4.70488 1.44895 3.25 3.23674 3.25H4.8551V0.8125C4.8551 0.363796 5.21924 0 5.66428 0C6.10934 0 6.47347 0.363796 6.47347 0.8125V3.25ZM1.61837 22.75C1.61837 23.6488 2.34309 24.375 3.23674 24.375H19.4204C20.3155 24.375 21.0388 23.6488 21.0388 22.75V9.75H1.61837V22.75ZM1.61837 6.5V8.125H21.0388V6.5C21.0388 5.60117 20.3155 4.875 19.4204 4.875H3.23674C2.34309 4.875 1.61837 5.60117 1.61837 6.5Z" fill="#0602FF"/>
</svg>
`;
      var iconFees = `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M13.8125 7.26171C14.498 7.3125 15.1633 7.50039 15.8235 7.68321C15.9047 7.70352 15.9809 7.72383 16.0571 7.74922C16.4938 7.86602 16.7477 8.31797 16.6258 8.74961C16.509 9.18125 16.0571 9.43515 15.6254 9.31328C15.5035 9.28281 15.3816 9.24727 15.2597 9.21171C14.8332 9.1 14.4929 8.94258 14.102 8.92735C13.127 8.78516 12.2383 8.91211 11.5984 9.18633C10.9434 9.47071 10.6539 9.85156 10.593 10.1766C10.5016 10.6691 10.6996 11.0145 11.111 11.2785C11.6543 11.6238 12.4566 11.8523 13.4418 12.1316L13.452 12.091C14.3559 12.3906 15.4273 12.6954 16.2145 13.2336C17.1793 13.8988 17.6211 14.9551 17.4129 16.1079C17.2097 17.2047 16.448 17.9359 15.4883 18.3219C14.9855 18.525 14.4168 18.6418 13.8125 18.6773V19.9062C13.8125 20.3531 13.4469 20.7188 13 20.7188C12.5531 20.7188 12.1875 20.3531 12.1875 19.9062V18.591C11.7762 18.5301 11.0804 18.327 10.5422 18.1645C10.1918 18.0579 9.84141 17.9461 9.45039 17.8344C9.06954 17.6922 8.83594 17.2352 8.97813 16.7628C9.12031 16.3821 9.57735 16.1484 10.0039 16.2906C10.3391 16.3566 10.6793 16.509 11.0145 16.6105C11.5883 16.7832 12.1671 16.9457 12.4414 16.9863C13.4469 17.1387 14.2949 17.0523 14.884 16.8188C15.4477 16.5903 15.7321 16.2449 15.8133 15.8133C15.9097 15.2801 15.7372 14.8789 15.2954 14.5742C14.686 14.1579 13.9344 13.9546 13.2133 13.7566C13.0965 13.7211 12.9797 13.6906 12.8629 13.6145C11.9946 13.4113 10.984 13.127 10.2375 12.6446C9.82617 12.3855 9.44023 12.0301 9.19648 11.5477C8.94766 11.05 8.88164 10.4914 8.99336 9.88204C9.18633 8.83086 10.0141 8.09961 10.9535 7.69336C11.3344 7.53086 11.7457 7.40898 12.1418 7.33789V6.09375C12.1418 5.64688 12.5531 5.28125 12.9543 5.28125C13.4469 5.28125 13.8125 5.64688 13.8125 6.09375V7.26171ZM26 13C26 20.1804 20.1804 26 13 26C5.81954 26 0 20.1804 0 13C0 5.81954 5.81954 0 13 0C20.1804 0 26 5.81954 26 13ZM13 1.625C6.71836 1.625 1.625 6.71836 1.625 13C1.625 19.2816 6.71836 24.375 13 24.375C19.2816 24.375 24.375 19.2816 24.375 13C24.375 6.71836 19.2816 1.625 13 1.625Z" fill="#0602FF"/>
</svg>
`;
      var iconDelivery = `<svg width="32" height="23" viewBox="0 0 32 23" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M31.2 18.0615H0.8C0.588271 18.063 0.385625 18.1502 0.235907 18.3043C0.0861889 18.4583 0.00144082 18.6667 0 18.8846V19.7076C0.00158593 20.5803 0.339237 21.4168 0.93901 22.0339C1.53878 22.651 2.3518 22.9984 3.2 23H28.8C29.6482 22.9984 30.4612 22.651 31.0609 22.0339C31.6608 21.4168 31.9984 20.5803 32 19.7076V18.8846C32 18.4782 31.64 18.0615 31.2 18.0615ZM28.8 21.4002H3.2C2.77565 21.4002 2.36869 21.2267 2.06863 20.918C1.76857 20.6092 1.6 20.1905 1.6 19.7539H30.4C30.3988 20.1902 30.2298 20.6082 29.9301 20.9167C29.6303 21.2251 29.224 21.3989 28.8 21.4002ZM4 16.4617C4.21217 16.4617 4.41566 16.3749 4.56568 16.2206C4.71571 16.0662 4.8 15.8569 4.8 15.6386V3.29233C4.8 2.85574 4.96857 2.43703 5.26863 2.12831C5.56869 1.8196 5.97565 1.64617 6.4 1.64617H25.6C26.0243 1.64617 26.4313 1.8196 26.7313 2.12831C27.0315 2.43703 27.2 2.85574 27.2 3.29233V15.6386C27.2 15.8569 27.2843 16.0662 27.4343 16.2206C27.5844 16.3749 27.7878 16.4617 28 16.4617C28.2122 16.4617 28.4156 16.3749 28.5657 16.2206C28.7157 16.0662 28.8 15.8569 28.8 15.6386V3.29233C28.799 2.41944 28.4617 1.58258 27.8617 0.965358C27.2618 0.348129 26.4484 0.000953157 25.6 0H6.4C5.55159 0.000953157 4.7382 0.348129 4.13828 0.965358C3.53837 1.58258 3.20093 2.41944 3.2 3.29233V15.6386C3.2 15.8569 3.28429 16.0662 3.43432 16.2206C3.58434 16.3749 3.78783 16.4617 4 16.4617Z" fill="#0602FF"/>
</svg>
`;
      var iconAccred = `<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.3448 17.225C12.8703 16.6878 13.0766 15.8981 12.8831 15.1673C12.746 14.4829 12.7002 14.7672 12.9288 14.0816C13.1239 13.3422 12.9145 12.5511 12.3844 12.021C11.8827 11.5172 11.8877 11.5985 11.7507 10.9129C11.5627 10.1766 10.994 9.55196 10.2628 9.39962C9.58229 9.21172 9.6737 9.27266 9.17604 8.7547C8.64132 8.21184 7.86334 7.99856 7.12702 8.19457C6.44859 8.38014 6.5537 8.37972 5.87628 8.19457C5.13893 7.99806 4.36046 8.21641 3.82522 8.7547C3.32401 9.27266 3.41541 9.21172 2.73495 9.39962C2.00624 9.59721 1.43495 10.1781 1.24757 10.916C1.06679 11.5985 1.11554 11.5172 0.616356 12.0199C0.0861997 12.5501 -0.123527 13.3413 0.071981 14.0806C0.255657 14.7672 0.252864 14.4829 0.073352 15.1684C-0.120328 15.8991 0.0860473 16.6888 0.611633 17.226C1.12148 17.7384 1.06379 17.6414 1.24488 18.3447C1.44166 19.077 2.01472 19.6549 2.73988 19.8514C3.00211 19.9237 3.1378 19.9625 3.24921 20.0096V25.1875C3.24921 25.4692 3.39531 25.7304 3.63494 25.8787C3.87306 26.0246 4.17323 26.0389 4.42561 25.9143L6.49987 24.8778L8.57428 25.9147C8.68854 25.9696 8.8155 26 8.93737 26C9.08657 26 9.23414 25.9596 9.36424 25.8786C9.6026 25.7309 9.74987 25.4668 9.74987 25.1875V20.0535C9.86143 20.0064 9.99712 19.9677 10.2592 19.8953C10.9844 19.6985 11.5577 19.1209 11.7542 18.3886C11.9386 17.6414 11.8776 17.7379 12.3448 17.225ZM8.12487 23.8722L6.86296 23.2416C6.63434 23.1273 6.36459 23.1273 6.13628 23.2416L4.87436 23.8722V21.063C5.20048 21.1358 5.54265 21.1417 5.87425 21.0513C6.56944 20.8643 6.43436 20.8657 7.12499 21.0513C7.45694 21.1417 7.79885 21.1358 8.12487 21.063V23.8722ZM11.2936 15.341C11.4118 15.7888 11.4486 15.8661 11.0937 16.2251C10.5097 16.8147 10.4365 16.9457 10.1857 17.9243C10.1066 18.2256 9.87088 18.2737 9.66212 18.3313C8.85876 18.5519 8.73028 18.6281 8.13513 19.2301C7.86157 19.5073 7.79413 19.5501 7.38916 19.438C6.58275 19.2171 6.42533 19.2161 5.61485 19.438C5.20987 19.5501 5.14254 19.5073 4.86888 19.2301C4.27372 18.6279 4.14525 18.5518 3.34189 18.3313C3.13282 18.2737 2.89715 18.2256 2.81834 17.9243C2.56752 16.9457 2.49451 16.8147 1.91036 16.2251C1.55327 15.8691 1.58984 15.7879 1.70816 15.341C1.88284 14.691 1.88284 14.5438 1.70663 13.9039C1.59339 13.4824 1.54972 13.386 1.88741 13.0457C2.48409 12.4409 2.55874 12.3119 2.77304 11.501C2.88166 11.0919 2.91 11.0321 3.33823 10.9155C4.14615 10.6948 4.27464 10.6187 4.86675 10.0141C5.13822 9.73913 5.20824 9.6973 5.61425 9.80855C6.4303 10.0316 6.56944 10.0316 7.3855 9.80855C7.79175 9.6973 7.86167 9.73913 8.133 10.0141C8.7251 10.6189 8.85359 10.695 9.66151 10.9155C10.0901 11.0347 10.1206 11.0957 10.2272 11.502C10.4405 12.3145 10.5167 12.4414 11.1108 13.0457C11.4487 13.3858 11.4047 13.4814 11.2917 13.8994C11.1159 14.5438 11.1159 14.691 11.2936 15.341ZM25.0502 6.36289L19.642 0.954693C19.0276 0.342372 18.205 5.07813e-06 17.3417 5.07813e-06L9.70416 0C7.90905 0 6.45416 1.45488 6.45416 3.25L6.49987 5.68751C6.49987 6.13439 6.8655 6.50001 7.31237 6.50001C7.75924 6.50001 8.12487 6.13439 8.12487 5.68751V3.25C8.12487 2.3527 8.85257 1.625 9.74987 1.625H16.2499V7.31251C16.2499 8.65821 17.3417 9.75001 18.6874 9.75001H24.3749V22.75C24.3749 23.6473 23.6472 24.375 22.7499 24.375H12.1874C11.7405 24.375 11.3749 24.7406 11.3749 25.1875C11.3749 25.6344 11.7405 26 12.1874 26H22.7042C24.4993 26 25.9542 24.5451 25.9542 22.75V8.65821C25.9999 7.79493 25.6596 6.97227 25.0502 6.36289ZM18.6874 8.12501C18.2405 8.12501 17.8749 7.75939 17.8749 7.31251V1.73063C18.1022 1.81015 18.3149 1.92594 18.4903 2.10129L23.8986 7.50948C24.0752 7.68321 24.192 7.89649 24.2682 8.12501H18.6874Z" fill="#0602FF"/>
</svg>`;

      // Hourglass alternative for Duration if wanted: use same iconDuration

      var items = [
        { key: "study-load", label: d.studyLoad.label, html: d.studyLoad.html, icon: iconStudy },
        { key: "duration", label: d.duration.label, html: d.duration.html, icon: iconDuration },
        { key: "intakes", label: d.intakes.label, html: d.intakes.html, icon: iconIntakes },
        { key: "fees", label: d.fees.label, html: d.fees.html, icon: iconFees },
        { key: "delivery", label: d.delivery.label, html: d.delivery.html, icon: iconDelivery },
        { key: "accreditation", label: d.accreditation.label, html: d.accreditation.html, icon: iconAccred }
      ];

      var html = '<div class="eg-fol-bar" role="list">';
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        html += '<div class="eg-fol-item eg-fol-item--' + it.key + '" role="listitem">';
        html += '<span class="eg-fol-icon" aria-hidden="true">' + it.icon + '</span>';
        html += '<div class="eg-fol-text"><h5 class="eg-fol-label">' + it.label + '</h5><p class="eg-fol-value body-1 mb-0">' + it.html + '</p></div>';
        html += '</div>';
      }
      html += '</div>';
      return html;
    }

    function init() {
      if (!shouldRun()) {
        if (debug) console.log("EG FOL 7.10 - not running on this URL");
        return;
      }
      if (document.querySelector(".eg-fol-bar")) return;
      var glance = document.querySelector(".course-glance");
      var banner = document.querySelector(".course-banner");
      var bannerWrap = document.querySelector(".course-banner .course-banner-wrap");
      if (!glance || !banner || !bannerWrap) return;

      document.body.classList.add("EG-FOL-7_10");

      var data = getMetaData();
      var barHTML = buildBarHTML(data);

      // Figma: bar overlaps hero, sits between hero wrap and breadcrumbs, not in course-glance
      var crumbs = banner.querySelector(".breadcrumbs");
      var barContainer = document.createElement("div");
      barContainer.className = "container eg-fol-bar-container";
      barContainer.innerHTML = barHTML;

      if (crumbs) {
        crumbs.parentNode.insertBefore(barContainer, crumbs);
      } else {
        bannerWrap.insertAdjacentElement("afterend", barContainer);
      }

      // mobile: Figma has bar OVERLAPPING hero bottom + image top (bar between text and image)
      // DOM has image inside banner content before bar — move image after bar on mobile
      var imgWrap = document.querySelector(".course-banner-img_wrap");
      var isMobile = window.innerWidth < 991.98;
      function positionMobile() {
        var barCont = document.querySelector(".eg-fol-bar-container");
        var img = document.querySelector(".course-banner-img_wrap");
        if (!barCont || !img) return;
        if (isMobile) {
          if (img.nextElementSibling !== null || img.parentNode !== barCont.parentNode || barCont.nextElementSibling !== img) {
            // store original parent for restore
            if (!img.dataset.egOrigParent) {
              img.dataset.egOrigParent = "banner-content";
              img.dataset.egOrigNext = img.nextElementSibling ? "hasNext" : "noNext";
            }
            barCont.insertAdjacentElement("afterend", img);
          }
        } else {
          // restore to original inside .course-banner-content
          var content = document.querySelector(".course-banner-content");
          var bodyWrap = document.querySelector(".course-banner-body-wrap");
          if (content && img.parentNode !== content) {
            if (bodyWrap && bodyWrap.nextSibling) content.insertBefore(img, bodyWrap.nextSibling);
            else content.appendChild(img);
          } else if (content && img.parentNode === barCont.parentNode) {
            // if still after bar on desktop, move back
            var c2 = document.querySelector(".course-banner-content");
            if (c2) c2.appendChild(img);
          }
        }
      }
      positionMobile();
      window.addEventListener("resize", function () {
        clearTimeout(window.egFol7_10Re);
        window.egFol7_10Re = setTimeout(positionMobile, 200);
      });

      if (debug) console.log("EG FOL 7.10 injected", data);
    }

    waitForElement("body", function () {
      waitForElement(".course-banner", function () {
        waitForElement(".course-glance .content-wrapper", init, 50, 15000);
      }, 50, 15000);
    }, 50, 15000);

  } catch (e) {
    if (debug) console.log(e, "error in FOL 7.10 Banner Key Stats");
  }
})();
