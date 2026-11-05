// Style picker, dark mode, and the 1999 look's decoration.
// Nothing here holds page content: everything injected is decoration (aria-hidden)
// or is built from what's already in index.html (the webring reads the project links).
(function () {
  var root = document.documentElement;
  var page = document.getElementById('page');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function save(key, value) { try { localStorage.setItem(key, value); } catch (e) {} }
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }

  // --- Style picker ---
  var pickers = document.querySelectorAll('[data-set-style]');
  function setStyle(style, remember) {
    root.dataset.style = style;
    pickers.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.setStyle === style)); });
    if (style === 'retro') buildRetro();
    if (remember) save('style', style);
  }
  pickers.forEach(function (b) {
    b.addEventListener('click', function () { setStyle(b.dataset.setStyle, true); });
  });

  // --- Dark mode (clean look only) ---
  var toggle = document.querySelector('.theme-toggle');
  function isDark() {
    return root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function syncToggle() { toggle.setAttribute('aria-pressed', String(isDark())); }
  toggle.addEventListener('click', function () {
    root.dataset.theme = isDark() ? 'light' : 'dark';
    save('theme', root.dataset.theme);
    syncToggle();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncToggle);
  syncToggle();

  // --- Letter-by-letter signs (COLOR TV colors, the marquee's uneven letters); screen readers get the plain text ---
  // Same trick for the marquee board, so its letters can sit at uneven heights.
  document.querySelectorAll('[data-sign="colortv"], [data-sign="letterboard"]').forEach(function (a) {
    var text = a.textContent;
    a.innerHTML = '<span class="sr-only">' + text + '</span><span class="letters" aria-hidden="true">' +
      text.split('').map(function (ch) { return ch === ' ' ? ' ' : '<span>' + ch + '</span>'; }).join('') + '</span>';
  });

  // --- The wink ---
  var logo = document.querySelector('.logo');
  function wink() {
    logo.classList.add('blink');
    setTimeout(function () { logo.classList.remove('blink'); }, reduce ? 400 : 220);
  }
  logo.addEventListener('click', wink);
  if (!reduce) setTimeout(wink, 1000);

  // --- 1999 decoration, built once on first use ---
  var built = false;
  function buildRetro() {
    if (built) return;
    built = true;

    // Fonts only the 1999 look needs, loaded only when someone picks it.
    document.head.appendChild(el('link', {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&family=Comic+Neue:wght@400;700&display=swap'
    }));

    // Scrolling welcome, with a pause button.
    var ticker = el('div', { class: 'ticker retro-only' });
    ticker.appendChild(el('div', { class: 'marquee', 'aria-hidden': 'true' },
      '<span>~*~ Welcome to my homepage!!! ~*~ thanks for stopping by ~*~ design systems, frontend platforms and AI agents ~*~ sign my guestbook ~*~</span>'));
    var pause = el('button', { type: 'button', class: 'bevel-btn pause' }, 'Pause');
    pause.addEventListener('click', function () {
      pause.textContent = page.classList.toggle('paused') ? 'Play' : 'Pause';
    });
    ticker.appendChild(pause);
    document.querySelector('.controls').after(ticker);

    // Window title bars, named from each section's data-file.
    document.querySelectorAll('.panel[data-file]').forEach(function (panel) {
      panel.prepend(el('div', { class: 'bar retro-only', 'aria-hidden': 'true' },
        '<p class="bar-title">' + panel.dataset.file + '</p><div class="bar-btns"><span>_</span><span>□</span><span>×</span></div>'));
    });

    // NEW! badges on entries marked data-new.
    document.querySelectorAll('.entry[data-new] h3').forEach(function (h) {
      h.appendChild(el('span', { class: 'new retro-only', 'aria-hidden': 'true' }, 'NEW!'));
    });

    document.querySelector('main').appendChild(el('div', { class: 'construction retro-only', 'aria-hidden': 'true' },
      '<p>This page is always under construction</p>'));

    // A visitor counter that only counts you: kept in your browser, never sent anywhere.
    var n = 1;
    try { n = (parseInt(localStorage.getItem('visits'), 10) || 0) + 1; localStorage.setItem('visits', String(n)); } catch (e) {}
    var digits = String(n).padStart(3, '0').split('').map(function (d) { return '<span>' + d + '</span>'; }).join('');
    var extras = el('div', { class: 'retro-only' },
      '<p>You\'ve stopped by</p>' +
      '<div class="counter" role="img" aria-label="' + n + (n === 1 ? ' time' : ' times') + '">' + digits + '</div>' +
      '<p>time(s). Thanks for coming back!</p>' +
      '<div class="mackie"><img src="img/mackie.svg" alt="" width="864" height="981">' +
      '<p class="bubble">Hi, I\'m Mackie! <a href="mailto:kealjones@gmail.com?subject=Signing%20your%20guestbook">Sign Keal\'s guestbook</a> (it\'s his inbox).</p></div>');

    // Webring: "random project" picks from the project links already on the page.
    var projects = Array.prototype.map.call(document.querySelectorAll('a[data-project]'), function (a) { return a.href; });
    var ring = el('nav', { class: 'ring', 'aria-label': "Keal's webring" },
      '<a href="https://github.com/KealJones?tab=repositories">&laquo; prev</a> | Keal\'s Webring | ');
    var random = el('button', { type: 'button', class: 'bevel-btn' }, 'Random project');
    random.addEventListener('click', function () { location.href = projects[Math.floor(Math.random() * projects.length)]; });
    ring.appendChild(random);
    ring.insertAdjacentHTML('beforeend', ' | <a href="https://huggingface.co/kealjones">next &raquo;</a>');
    extras.appendChild(ring);

    extras.insertAdjacentHTML('beforeend',
      '<ul class="badges" aria-label="Badges">' +
      '<li><span class="btn88 b1">HAND CODED<br>IN NOTEPAD</span></li>' +
      '<li><span class="btn88 b2">BEST VIEWED<br>IN ANY BROWSER</span></li>' +
      '<li><a class="btn88 b3" href="https://huggingface.co/kealjones">MODELS ON<br>HUGGING FACE</a></li>' +
      '<li><a class="btn88 b4" href="https://kealjones.com/squiggle/">TRY<br>SQUIGGLE</a></li>' +
      '<li><span class="btn88 b5">MADE IN<br>ARIZONA</span></li></ul>');
    document.querySelector('.footer').prepend(extras);
  }

  setStyle(root.dataset.style === 'retro' ? 'retro' : 'clean', false);
})();
