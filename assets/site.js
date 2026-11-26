document.documentElement.classList.add('js');

// Texte für die Bedienelemente, je nach Sprache der Seite
var EN = document.documentElement.lang === 'en';
var T = EN ? {
  menuOpen: 'Open menu', menuClose: 'Close menu',
  ask: 'Question from the audience', speak: 'Fanny Hensel speaks',
  play: 'Play', pause: 'Pause', copy: 'Copy', copied: 'Copied ✓',
  bandPause: 'Pause names', bandPlay: 'Move names',
  video: 'ComposerMeet: Audience dialogue with Fanny Hensel',
  lines: [
    'What was the story behind the Sunday concerts?',
    'On Sundays we gathered the finest musicians in Berlin. My “Sunday concerts” were salon and rehearsal stage at once.',
    'Who was your strictest critic?',
    'My father. He wrote to me that music could only ever be an “ornament” of my life, never a profession.'
  ]
} : {
  menuOpen: 'Menü öffnen', menuClose: 'Menü schließen',
  ask: 'Frage aus dem Publikum', speak: 'Fanny Hensel spricht',
  play: 'Abspielen', pause: 'Anhalten', copy: 'Kopieren', copied: 'Kopiert ✓',
  bandPause: 'Namen anhalten', bandPlay: 'Namen bewegen',
  video: 'ComposerMeet: Publikumsdialog mit Fanny Hensel',
  lines: [
    'Welche Bewandtnis hatte es mit den Sonntagsmusiken auf sich?',
    'An Sonntagen versammelten wir die besten Musiker Berlins. Meine „Sonntagsmusiken“ waren Salon und Probebühne zugleich.',
    'Wer war Ihr strengster Kritiker?',
    'Mein Vater. Er schrieb mir, Musik dürfe nur „Zierat“ meines Lebens sein, nicht Beruf.'
  ]
};

// Mobile Navigation: öffnet aus dem Menü-Knopf, schließt per Knopf, Escape oder Klick daneben
(function () {
  var toggle = document.getElementById('nav-toggle');
  var nav = document.getElementById('main-nav');
  toggle.hidden = false;
  function setOpen(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? T.menuClose : T.menuOpen);
  }
  toggle.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('open') && !nav.contains(e.target)) setOpen(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); }
  });
})();

// Header: weiche Kante erst, wenn Inhalt darunter liegt; Navigation zeigt den aktuellen Abschnitt
(function () {
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 4); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (!('IntersectionObserver' in window)) return;
  var links = Array.prototype.slice.call(document.querySelectorAll('.main-nav a[href^="#"]'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (a) { a.removeAttribute('aria-current'); });
      var a = byId[entry.target.id];
      if (a) a.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  Object.keys(byId).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
})();

// Scroll-Reveal
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (el) { el.classList.add('visible'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
})();

// Avatar-Bühne: gesprochene Frage, dann Antwort des Avatars als Untertitel.
// Läuft in Schleife, hält an bei Zeiger oder Fokus, außerhalb des Bildschirms und per Knopf.
(function () {
  var stage = document.getElementById('avatar-demo');
  if (!stage) return;
  var label = document.getElementById('as-label');
  var labelText = document.getElementById('as-label-text');
  var caption = document.getElementById('as-caption-text');
  var video = document.getElementById('as-video');
  var pauseBtn = document.getElementById('as-pause');
  var pauseText = document.getElementById('as-pause-text');
  var figure = stage.parentNode;
  var lines = [
    { mode: 'ask',   who: T.ask,   text: T.lines[0] },
    { mode: 'speak', who: T.speak, text: T.lines[1] },
    { mode: 'ask',   who: T.ask,   text: T.lines[2] },
    { mode: 'speak', who: T.speak, text: T.lines[3] }
  ];
  function render(i) {
    var l = lines[i];
    label.setAttribute('data-mode', l.mode);
    labelText.textContent = l.who;
    caption.textContent = l.text;
  }
  render(0);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (video) { video.removeAttribute('autoplay'); video.pause(); }
    return;
  }

  var i = 0, timer = null;
  var userPaused = false, hovered = false, onScreen = true;
  function tick() { i = (i + 1) % lines.length; render(i); }

  // Der Knopf zeigt immer den echten Zustand des Videos
  function showState() {
    var paused = video ? video.paused : userPaused;
    pauseBtn.setAttribute('aria-pressed', paused ? 'true' : 'false');
    pauseText.textContent = paused ? T.play : T.pause;
  }
  function tryPlay() {
    if (!video) return;
    var p = video.play();
    if (p && p.then) p.then(showState, showState);
  }
  function sync() {
    var captionsRun = !userPaused && !hovered && onScreen;
    if (captionsRun && !timer) timer = setInterval(tick, 3200);
    if (!captionsRun && timer) { clearInterval(timer); timer = null; }
    if (video) {
      if (!userPaused && onScreen) tryPlay(); else video.pause();
    }
    showState();
  }
  if (video) {
    video.muted = true;
    video.addEventListener('play', showState);
    video.addEventListener('pause', showState);
    video.addEventListener('canplay', function () { if (!userPaused && onScreen && video.paused) tryPlay(); });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) sync(); });
  }

  pauseBtn.hidden = false;
  pauseBtn.addEventListener('click', function () {
    var wantPause = video ? !video.paused : !userPaused;
    userPaused = wantPause;
    sync();
  });

  // Blockiert der Browser den Autostart (Energiesparmodus, Datensparer), startet das Video bei der ersten Berührung der Seite
  function firstGesture() { if (video && video.paused && !userPaused && onScreen) tryPlay(); }
  ['pointerdown', 'touchstart', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, firstGesture, { once: true, passive: true });
  });

  // Untertitel halten nur bei echter Maus oder Tastaturfokus an, nie durch das künstliche Maus-Ereignis beim Tippen
  figure.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hovered = true; sync(); } });
  figure.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hovered = false; sync(); } });
  figure.addEventListener('focusin', function (e) {
    var keyboard = true;
    try { keyboard = e.target.matches(':focus-visible'); } catch (err) {}
    if (keyboard) { hovered = true; sync(); }
  });
  figure.addEventListener('focusout', function () { hovered = false; sync(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting; sync();
    }).observe(stage);
  }
  sync();
})();

// „Für Ihr Haus“: Reiter umschalten (ohne JS bleiben alle Panels sichtbar)
(function () {
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.seg-tab'));
  if (!tabs.length) return;
  var current = -1;
  function select(tab) {
    var idx = tabs.indexOf(tab);
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      if (!panel) return;
      panel.hidden = !on;
      // Neuer Inhalt gleitet aus der Richtung, in die geklickt wurde
      if (on && current !== -1 && idx !== current) {
        var dir = idx > current ? 'from-right' : 'from-left';
        panel.classList.add(dir);
        void panel.offsetWidth;
        panel.classList.remove(dir);
      }
    });
    current = idx;
  }
  tabs.forEach(function (tab, idx) {
    tab.addEventListener('click', function () { select(tab); });
    tab.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      var next = (idx + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
      tabs[next].focus(); select(tabs[next]);
      if (window.umami && window.umami.track) window.umami.track('haus-reiter', { bereich: tabs[next].getAttribute('data-umami-event-bereich') });
    });
  });
  select(tabs[0]);
})();

// Aktuell: abgelaufene Termine (data-end) automatisch in den Rückblick verschieben
(function () {
  var upcoming = document.getElementById('ev-upcoming');
  var past = document.getElementById('ev-past');
  if (!upcoming || !past) return;
  var now = new Date();
  Array.prototype.slice.call(upcoming.querySelectorAll('.ev-card[data-end]')).forEach(function (card) {
    if (new Date(card.getAttribute('data-end') + 'T23:59:59') >= now) return;
    // nach Datum absteigend einsortieren, angepinnte Karten bleiben vorn
    var d = card.getAttribute('data-date');
    var before = Array.prototype.find.call(past.children, function (c) {
      return !c.hasAttribute('data-pinned') && (c.getAttribute('data-date') || '') < d;
    });
    past.insertBefore(card, before || null);
  });
  if (!upcoming.children.length) {
    upcoming.hidden = true;
    document.getElementById('ev-empty').hidden = false;
  }
})();

// Rückblick-Karussell
// Touch nutzt das native Scrollen. Mit der Maus lässt sich der Streifen greifen: er folgt 1:1,
// gleitet nach dem Loslassen mit dem Schwung der Bewegung weiter, rastet am nächsten Bild ein
// und federt an den Rändern sanft zurück. Jede Bewegung kann jederzeit neu gegriffen werden.
(function () {
  var track = document.getElementById('ev-past');
  var nav = document.getElementById('ev-nav');
  if (!track || !nav) return;
  var prev = document.getElementById('ev-prev');
  var next = document.getElementById('ev-next');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  nav.hidden = false;

  // Kritisch gedämpfte Feder (keine Überschwinger), Ansprechzeit 0,4 s, startet mit der Geschwindigkeit der Geste
  function spring(from, to, v0, set, done) {
    if (reduce) { set(to); if (done) done(); return function () {}; }
    var w = 2 * Math.PI / 0.4, x0 = from - to, t0 = performance.now(), id;
    function frame(now) {
      var t = (now - t0) / 1000, e = Math.exp(-w * t);
      var x = (x0 + (v0 + w * x0) * t) * e;
      var v = (v0 - w * (v0 + w * x0) * t) * e;
      if (Math.abs(x) < 0.5 && Math.abs(v) < 10) { set(to); if (done) done(); return; }
      set(to + x);
      id = requestAnimationFrame(frame);
    }
    id = requestAnimationFrame(frame);
    return function () { cancelAnimationFrame(id); };
  }

  var stopScroll = null, stopBand = null, band = 0;
  function maxScroll() { return track.scrollWidth - track.clientWidth; }
  function setScroll(v) { track.scrollLeft = v; }
  function setBand(v) { band = v; track.style.transform = v ? 'translateX(' + v + 'px)' : ''; }
  function snapPoints() {
    var max = maxScroll();
    var pts = Array.prototype.map.call(track.children, function (c) { return Math.min(c.offsetLeft, max); });
    pts.push(max);
    return pts;
  }
  function nearest(x) {
    return snapPoints().reduce(function (best, p) { return Math.abs(p - x) < Math.abs(best - x) ? p : best; }, 0);
  }
  function glideTo(target, velocity) {
    if (stopScroll) stopScroll();
    track.style.scrollSnapType = 'none';
    stopScroll = spring(track.scrollLeft, target, velocity || 0, setScroll, function () {
      stopScroll = null;
      track.style.scrollSnapType = '';
      update();
    });
  }
  // Wurfweite aus der Geschwindigkeit, wie beim Ausrollen eines Scrollvorgangs
  function project(v) { var d = 0.998; return (v / 1000) * d / (1 - d); }
  // Gummiband: je weiter über den Rand, desto weniger folgt der Streifen
  function rubber(over, dim) { var c = 0.55; return (over * dim * c) / (dim + c * Math.abs(over)); }

  function update() {
    prev.disabled = track.scrollLeft <= 4;
    next.disabled = track.scrollLeft >= maxScroll() - 4;
  }
  prev.addEventListener('click', function () {
    var pts = snapPoints(), x = track.scrollLeft;
    var t = pts.filter(function (p) { return p < x - 4; }).pop();
    glideTo(t === undefined ? 0 : t, 0);
  });
  next.addEventListener('click', function () {
    var pts = snapPoints(), x = track.scrollLeft;
    var t = pts.filter(function (p) { return p > x + 4; })[0];
    glideTo(t === undefined ? maxScroll() : t, 0);
  });
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  // Greifen mit der Maus
  var drag = null, suppressClick = false;
  track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  track.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    // Laufende Bewegung anhalten und vom aktuellen Stand aus weitermachen
    if (stopScroll) { stopScroll(); stopScroll = null; }
    if (stopBand) { stopBand(); stopBand = null; }
    drag = { id: e.pointerId, x: e.clientX, origin: track.scrollLeft - band, moved: false,
             hist: [{ x: e.clientX, t: e.timeStamp }] };
  });
  track.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < 8) return;          // kleine Schwelle, damit Klicks Klicks bleiben
      drag.moved = true;
      drag.x += dx > 0 ? 8 : -8;             // ohne Sprung weiter
      dx = e.clientX - drag.x;
      track.setPointerCapture(e.pointerId);
      track.classList.add('dragging');
      track.style.scrollSnapType = 'none';
    }
    drag.hist.push({ x: e.clientX, t: e.timeStamp });
    if (drag.hist.length > 6) drag.hist.shift();
    var want = drag.origin - dx, max = maxScroll(), dim = track.clientWidth;
    if (want < 0) { setScroll(0); setBand(rubber(-want, dim)); }
    else if (want > max) { setScroll(max); setBand(-rubber(want - max, dim)); }
    else { setScroll(want); setBand(0); }
  });
  function release(e) {
    if (!drag || e.pointerId !== drag.id) return;
    var d = drag; drag = null;
    if (!d.moved) return;
    suppressClick = true;
    track.classList.remove('dragging');
    var h = d.hist, first = h[0], last = h[h.length - 1];
    var dt = (last.t - first.t) / 1000;
    var pv = dt > 0 && e.timeStamp - last.t < 80 ? (last.x - first.x) / dt : 0;  // Zeigergeschwindigkeit
    if (band) {
      stopBand = spring(band, 0, pv, setBand, function () { stopBand = null; track.style.scrollSnapType = ''; update(); });
      return;
    }
    var sv = -pv;                                  // Scroll läuft entgegen der Zeigerbewegung
    var target = nearest(Math.max(0, Math.min(maxScroll(), track.scrollLeft + project(sv))));
    glideTo(target, sv);
  }
  track.addEventListener('pointerup', release);
  track.addEventListener('pointercancel', release);
  // Nach dem Ziehen keinen versehentlichen Klick auf ein Bild auslösen
  track.addEventListener('click', function (e) {
    if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; }
  }, true);
})();

// Handy: Werdegang zugeklappt, Säulen als Wischleiste (per Tastatur erreichbar). Desktop: alles offen.
(function () {
  var more = document.getElementById('about-more');
  var pillars = document.getElementById('pillars');
  var mq = window.matchMedia('(max-width: 60rem)');
  function sync() {
    if (more) more.open = !mq.matches;
    if (pillars) { if (mq.matches) pillars.setAttribute('tabindex', '0'); else pillars.removeAttribute('tabindex'); }
  }
  sync();
  if (mq.addEventListener) mq.addEventListener('change', sync); else mq.addListener(sync);
})();

// Statistik: Abschnitt gesehen (einmal je Abschnitt und Besuch, ohne Personenbezug)
(function () {
  if (!('IntersectionObserver' in window)) return;
  var seen = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      var id = entry.target.id;
      if (!entry.isIntersecting || seen[id]) return;
      if (!(window.umami && window.umami.track)) return;
      seen[id] = true;
      window.umami.track('abschnitt-gesehen', { abschnitt: id });
      io.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  ['namen', 'referenz', 'konzept', 'haeuser', 'angebot', 'video', 'rechte', 'termine', 'ueber', 'kontakt'].forEach(function (id) {
    var el = document.getElementById(id); if (el) io.observe(el);
  });
})();

// E-Mail-Adresse kopieren (Fallback für fehlende Mailprogramme)
(function () {
  var btn = document.getElementById('copy-email');
  if (!navigator.clipboard) return;
  btn.hidden = false;
  var label = btn.querySelector('span');
  btn.addEventListener('click', function () {
    navigator.clipboard.writeText('celest@composermeet.com').then(function () {
      btn.classList.add('copied');
      label.textContent = T.copied;
      setTimeout(function () {
        btn.classList.remove('copied');
        label.textContent = T.copy;
      }, 2000);
    });
  });
})();

// YouTube erst nach Klick laden (Datenschutz + Performance)
(function () {
  var facade = document.getElementById('video-facade');
  if (!facade) return;
  var consent = document.getElementById('vf-consent');
  facade.hidden = false;
  facade.addEventListener('click', function () {
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/RFo1mFihDnw?rel=0&autoplay=1';
    iframe.title = T.video;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.setAttribute('allowfullscreen', '');
    facade.replaceWith(iframe);
    if (consent) consent.remove();
  });
})();

// Namenswolke: Antippen zeigt die Beispielfrage. Auf dem Handy laufen die Namen als langsames Band,
// das bei Berührung, Fokus und per Knopf anhält. Bei reduzierter Bewegung steht alles still.
(function () {
  var cloud = document.getElementById('nm-cloud');
  var out = document.getElementById('nm-question');
  if (!cloud || !out) return;
  var buttons = Array.prototype.slice.call(cloud.querySelectorAll('button.nm'));
  var who = out.querySelector('.nm-who'), text = out.querySelector('.nm-text');
  function show(btn) {
    var key = btn.getAttribute('data-key');
    Array.prototype.forEach.call(cloud.querySelectorAll('button.nm'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-key') === key ? 'true' : 'false');
    });
    who.textContent = btn.querySelector('.nm-name').textContent;
    text.textContent = btn.getAttribute('data-q');
  }
  cloud.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('button.nm') : null;
    if (btn) show(btn);
  });
  if (buttons.length) show(buttons[0]);

  var ctrl = document.getElementById('nm-band-ctrl');
  var mq = window.matchMedia('(max-width: 40rem)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var clones = [], userPaused = false, held = false;
  function setPaused() {
    cloud.classList.toggle('paused', userPaused || held);
    if (ctrl) {
      ctrl.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
      ctrl.querySelector('span').textContent = userPaused ? T.bandPlay : T.bandPause;
    }
  }
  function sync() {
    var band = mq.matches && !reduce.matches;
    if (band && !clones.length) {
      // zweite Hälfte für die nahtlose Schleife, für Screenreader und Tastatur verborgen
      Array.prototype.slice.call(cloud.children).forEach(function (li) {
        var c = li.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        Array.prototype.forEach.call(c.querySelectorAll('button'), function (b) { b.tabIndex = -1; });
        cloud.appendChild(c); clones.push(c);
      });
    }
    if (!band && clones.length) { clones.forEach(function (c) { c.remove(); }); clones = []; }
    cloud.classList.toggle('is-band', band);
    if (ctrl) ctrl.hidden = !band;
    setPaused();
  }
  if (ctrl) ctrl.addEventListener('click', function () { userPaused = !userPaused; setPaused(); });
  cloud.addEventListener('pointerdown', function () { held = true; setPaused(); });
  document.addEventListener('pointerup', function () { if (held) { setTimeout(function () { held = false; setPaused(); }, 2500); } });
  cloud.addEventListener('focusin', function () { held = true; setPaused(); });
  cloud.addEventListener('focusout', function () { held = false; setPaused(); });
  sync();
  [mq, reduce].forEach(function (m) { if (m.addEventListener) m.addEventListener('change', sync); else m.addListener(sync); });
})();
