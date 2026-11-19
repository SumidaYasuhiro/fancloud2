/* =====================================================================
 *  app.js  ―  共通シェル（ヘッダー/タブバー/サイドバー）と各ページの描画
 *  内容(画像・文言・データ)は js/config.js を編集してください。
 * ===================================================================== */
(function () {
  'use strict';

  var CFG = window.MOCK_CONFIG || {};
  var T = CFG.text, A = CFG.assets;
  var CT = CFG.creatorTools || {}, TC = T.creator || {}, ME = CT.me || 'c1';
  var page = document.body.getAttribute('data-page') || 'home';
  var params = new URLSearchParams(location.search);
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------ html helpers */
  function Raw(s) { this.s = s; }
  Raw.prototype.toString = function () { return this.s; };
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function val(v) {
    if (v instanceof Raw) return v.s;
    if (Array.isArray(v)) return v.map(val).join('');
    if (v == null || v === false) return '';
    return esc(v);
  }
  function html(st) {
    var out = st[0];
    for (var i = 1; i < st.length; i++) out += val(arguments[i]) + st[i];
    return new Raw(out);
  }
  function raw(s) { return new Raw(s); }
  function fmt(n) { return Number(n).toLocaleString('ja-JP'); }
  function fmtK(n) { return n >= 10000 ? (n / 10000).toFixed(1).replace('.0', '') + '万' : fmt(n); }

  /* ------------------------------------------------------------ storage (失敗しても動く) */
  function mkStore(getter) {
    var mem = {};
    return {
      get: function (k, d) {
        try { var v = getter().getItem('fcm:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return k in mem ? mem[k] : d; }
      },
      set: function (k, v) {
        mem[k] = v;
        try { getter().setItem('fcm:' + k, JSON.stringify(v)); return true; } catch (e) { return false; }
      }
    };
  }
  var store = mkStore(function () { return window.localStorage; });
  var sess = mkStore(function () { return window.sessionStorage; });

  var likes = new Set(store.get('likes', []));
  var follows = new Set(store.get('follows', []));
  var saved = new Set(store.get('saved', []));
  var loggedIn = !!store.get('login', false);

  /* ------------------------------------------------------------ data */
  var creators = CFG.creators, genres = CFG.genres;
  /* クリエイター画面で作った投稿・プランをサンプルデータに重ねる */
  var userPosts = store.get('myPosts', []) || [];
  var deletedIds = store.get('deletedPosts', []) || [];
  var myPlans = store.get('myPlans', null);
  var allPosts = (function () {
    var ids = {}, over = {};
    userPosts.forEach(function (u) { over[u.id] = u; });
    var base = CFG.posts.filter(function (p) { return deletedIds.indexOf(p.id) < 0; }).map(function (p) { ids[p.id] = 1; return over[p.id] || p; });
    var fresh = userPosts.filter(function (u) { return !ids[u.id]; }).sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
    var now = Date.now();
    return fresh.concat(base).map(function (p) {
      if (p.status === 'scheduled' && p.scheduledAt && new Date(p.scheduledAt).getTime() <= now) {
        var q = {}; for (var k in p) q[k] = p[k];
        q.status = 'published'; q.time = '公開しました'; return q;
      }
      return p;
    });
  })();
  var posts = allPosts.filter(function (p) { return !p.status || p.status === 'published'; });
  if (myPlans && myPlans.length >= 0 && Array.isArray(myPlans)) { creators.forEach(function (c) { if (c.id === ME) c.plans = myPlans; }); }
  function cById(id) { return creators.filter(function (c) { return c.id === id; })[0] || creators[0]; }
  function pById(id) { return posts.filter(function (p) { return p.id === id; })[0] || posts[0]; }
  function gById(id) { return genres.filter(function (g) { return g.id === id; })[0]; }
  function priceLabel(pl) { return pl.price > 0 ? html`¥${fmt(pl.price)}<small> /月</small>` : '無料'; }

  /* ------------------------------------------------------------ icons (Feather 系の線画) */
  var ICONS = {
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z"/>',
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    play: '<circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>',
    'play-solid': '<polygon points="6 3 20 12 6 21 6 3"/>',
    crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
    comment: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    bookmark: '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    right: '<polyline points="9 18 15 12 9 6"/>',
    left: '<polyline points="15 18 9 12 15 6"/>',
    x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    verified: '<circle cx="12" cy="12" r="10" fill="currentColor" stroke="none"/><polyline points="7.5 12.5 10.5 15.5 16.5 9" stroke="#fff"/>',
    bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    doc: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
    phone: '<rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
    gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
    card: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'
  };
  function ico(name, cls) {
    return raw('<svg class="ico ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || '') + '</svg>');
  }

  /* ------------------------------------------------------------ images (フォルダ差し替え対応) */
  var EXT_ORDER = ['jpg', 'png', 'webp', 'jpeg', 'gif', 'svg'];
  function candidates(f) {
    if (f.ext === 'auto') return EXT_ORDER.slice();
    return [f.ext].concat(EXT_ORDER.filter(function (e) { return e !== f.ext; }));
  }
  function imgSrc(kind, i, ext) {
    var f = A.folders[kind];
    var n = (((i - 1) % f.count) + f.count) % f.count + 1;
    return f.dir + '/' + f.prefix + String(n).padStart(f.pad || 2, '0') + '.' + ext;
  }
  function img(kind, i, alt, eager) {
    var f = A.folders[kind];
    return raw('<img src="' + esc(imgSrc(kind, i, candidates(f)[0])) + '" alt="' + esc(alt || '') + '"' +
      (eager ? '' : ' loading="lazy"') + ' decoding="async" draggable="false" data-kind="' + kind + '" data-i="' + i + '" data-n="0"' +
      ' onload="__imgOk(this)" onerror="__imgErr(this)">');
  }
  function dataImg(src, alt) {
    return raw('<img src="' + esc(src) + '" alt="' + esc(alt || '') + '" decoding="async" draggable="false" onload="__imgOk(this)">');
  }
  function postImg(p, alt, eager) {
    return p.thumb ? dataImg(p.thumb, alt) : img('posts', p.img, alt, eager);
  }
  window.__imgOk = function (el) {
    el.classList.add('is-loaded');
    var p = el.parentElement;
    if (p && p.classList.contains('ph')) p.classList.add('done');
  };
  window.__imgErr = function (el) {
    var f = A.folders[el.getAttribute('data-kind')];
    var n = (parseInt(el.getAttribute('data-n'), 10) || 0) + 1;
    if (f) {
      var list = candidates(f);
      if (n < list.length) {
        el.setAttribute('data-n', n);
        el.src = imgSrc(el.getAttribute('data-kind'), parseInt(el.getAttribute('data-i'), 10), list[n]);
        return;
      }
    }
    el.onerror = null;
    el.src = A.placeholder;
  };

  /* ------------------------------------------------------------ theme / mode */
  function hexToRgb(h) {
    var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h || '');
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)].join(' ') : '255 55 0';
  }
  function applyTheme() {
    var p = (CFG.theme && CFG.theme.primary) || '#ff3700';
    var s = document.documentElement.style;
    s.setProperty('--primary', p);
    s.setProperty('--primary-rgb', hexToRgb(p));
    s.setProperty('--primary-soft', 'color-mix(in srgb, ' + p + ' 9%, white)');
  }
  function resolveMode() {
    var q = params.get('view');
    if (q === 'pc' || q === 'mobile') { store.set('view', q); return q; }
    var s = store.get('view', null);
    if (s === 'pc' || s === 'mobile') return s;
    var d = CFG.defaultView || 'mobile';
    if (d === 'auto') return window.innerWidth >= 768 ? 'pc' : 'mobile';
    return d;
  }
  function setMode(m) {
    document.body.classList.remove('mode-pc', 'mode-mobile');
    document.body.classList.add('mode-' + m);
    store.set('view', m);
    $$('.ms-btn').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-mode') === m); });
    var lab = $('[data-mode-label]');
    if (lab) lab.textContent = m === 'pc' ? 'スマホ表示に切り替える' : 'PC表示に切り替える';
  }

  /* ------------------------------------------------------------ toast / modal / sheet */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }
  var layers = [];
  function openModal(content, opts) {
    opts = opts || {};
    var back = document.createElement('div');
    back.className = 'back-drop';
    var box = document.createElement('div');
    box.className = 'modal ' + (opts.cls || '');
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = String(content);
    back.appendChild(box);
    $('#overlay').appendChild(back);
    requestAnimationFrame(function () { back.classList.add('show'); });
    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      layers = layers.filter(function (l) { return l !== close; });
      back.classList.remove('show');
      setTimeout(function () { back.remove(); if (opts.onClose) opts.onClose(); }, 200);
    }
    back.addEventListener('click', function (e) { if (e.target === back || e.target.closest('[data-close]')) close(); });
    layers.push(close);
    return { el: back, box: box, close: close };
  }
  function openSheet(content) {
    var back = document.createElement('div');
    back.className = 'back-drop';
    var sheet = document.createElement('div');
    sheet.className = 'sheet';
    sheet.innerHTML = '<div class="grab"></div>' + String(content);
    $('#overlay').appendChild(back);
    $('#overlay').appendChild(sheet);
    requestAnimationFrame(function () { back.classList.add('show'); sheet.classList.add('open'); });
    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      layers = layers.filter(function (l) { return l !== close; });
      back.classList.remove('show');
      sheet.classList.remove('open');
      setTimeout(function () { back.remove(); sheet.remove(); }, 280);
    }
    back.addEventListener('click', close);
    sheet.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) close(); });
    layers.push(close);
    return { el: sheet, close: close };
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && layers.length) layers[layers.length - 1]();
  });

  /* ------------------------------------------------------------ reveal on scroll */
  var io;
  function observe(root) {
    var els = $$('.reveal:not(.in)', root || document);
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    io = io || new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0.04 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ------------------------------------------------------------ components */
  function avatarEl(c, cls) {
    return html`<span class="av ph ${cls || ''}">${img('avatars', c.avatar, c.name)}</span>`;
  }
  function verifiedMark(c) {
    return c.verified ? html`<span class="verified">${ico('verified')}</span>` : '';
  }
  function followBtn(c) {
    var on = follows.has(c.id);
    return html`<button class="btn ${on ? 'on' : ''}" data-follow="${c.id}">${on ? T.following : T.follow}</button>`;
  }
  function likeBtn(p) {
    var on = likes.has(p.id);
    return html`<button class="act ${on ? 'liked' : ''}" data-like="${p.id}" aria-label="いいね">${ico('heart')}<span data-lc="${p.id}">${fmt(p.likes + (on ? 1 : 0))}</span></button>`;
  }
  function chips(p) {
    return html`${p.price > 0 ? html`<span class="chip tl price">¥${fmt(p.price)}</span>` : ''}${p.type === 'video' ? html`<span class="chip br">${ico('play-solid', 'xs fill')}${p.duration || '00:30'}</span>` : ''}`;
  }
  function postCard(p) {
    var c = cById(p.creator), locked = p.price > 0;
    return html`<a class="pcard reveal" href="post.html?id=${p.id}">
      <div class="thumb ph ${locked ? 'locked' : ''}">${postImg(p, c.name)}${chips(p)}${locked ? html`<span class="lockmark">${ico('lock')}</span>` : ''}</div>
      <p class="pcard-text">${p.text}</p>
      <div class="pcard-meta">${avatarEl(c)}<span class="nm">${c.name}</span><span class="lk">${ico('heart')}${fmt(p.likes)}</span></div>
    </a>`;
  }
  function thumbCard(p) {
    var locked = p.price > 0;
    return html`<a class="pcard reveal" href="post.html?id=${p.id}"><div class="thumb ph ${locked ? 'locked' : ''}">${postImg(p, '')}${chips(p)}${locked ? html`<span class="lockmark">${ico('lock')}</span>` : ''}</div></a>`;
  }
  function creatorCard(c) {
    return html`<a class="ccard" href="creator.html?id=${c.id}">${avatarEl(c)}<b>${c.name}${verifiedMark(c)}</b><small>フォロワー ${fmtK(c.followers)}</small></a>`;
  }
  function genreCard(g) {
    return html`<a class="genre reveal" href="search.html?genre=${g.id}"><div><b>${g.name}</b><span>${fmt(g.count)}件</span></div>${ico('right')}</a>`;
  }
  function section(title, iconName, more) {
    return html`<div class="sec"><div class="sec-head"><h2 class="sec-title">${iconName ? ico(iconName) : ''}${title}</h2>${more ? html`<a class="sec-more" href="${more[1]}">${more[0]}${ico('right', 'xs')}</a>` : ''}</div></div>`;
  }
  function tabsHtml(items, active) {
    return html`<div class="tabs" role="tablist">${items.map(function (it) {
      return html`<button class="tab ${it[0] === active ? 'active' : ''}" data-tab="${it[0]}" role="tab">${it[1]}</button>`;
    })}</div>`;
  }
  function onTabs(container, attr, cb) {
    container.addEventListener('click', function (e) {
      var b = e.target.closest('[' + attr + ']');
      if (!b || !container.contains(b)) return;
      $$('[' + attr + ']', container).forEach(function (x) { x.classList.toggle('active', x === b); });
      cb(b.getAttribute(attr));
    });
  }
  function footerHtml() {
    return html`<footer class="footer"><div class="links">${T.footerLinks.map(function (l) { return html`<a href="#" data-toast="${T.mockNotice}">${l}</a>`; })}</div><div>${CFG.site.copyright}</div></footer>`;
  }

  /* ------------------------------------------------------------ carousel helpers */
  function enableDrag(el) {
    var down = false, moved = false, sx = 0, sl = 0;
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = el.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 5) { moved = true; el.classList.add('dragging'); }
      if (moved) el.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      setTimeout(function () { el.classList.remove('dragging'); }, 0);
    });
    el.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }
  function initBanner(sw, dotsEl) {
    var slides = $$('.banner', sw);
    if (!slides.length) return;
    var idx = 0, timer = null, hover = false;
    dotsEl.innerHTML = slides.map(function (_, i) { return '<i class="' + (i === 0 ? 'on' : '') + '"></i>'; }).join('');
    function slideStep() { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : sw.clientWidth; }
    function paint(i) { $$('i', dotsEl).forEach(function (d, k) { d.classList.toggle('on', k === i); }); }
    function go(i) {
      idx = (i + slides.length) % slides.length;
      sw.scrollTo({ left: slides[idx].offsetLeft - slides[0].offsetLeft, behavior: 'smooth' });
      paint(idx);
    }
    var ticking = false;
    sw.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var i = Math.round(sw.scrollLeft / Math.max(1, slideStep()));
        i = Math.min(slides.length - 1, Math.max(0, i));
        if (i !== idx) { idx = i; paint(i); }
      });
    }, { passive: true });
    function start() {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      stop();
      timer = setInterval(function () { if (!hover && !document.hidden) go(idx + 1); }, 4500);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    sw.addEventListener('mouseenter', function () { hover = true; });
    sw.addEventListener('mouseleave', function () { hover = false; });
    sw.addEventListener('touchstart', function () { hover = true; }, { passive: true });
    sw.addEventListener('touchend', function () { setTimeout(function () { hover = false; }, 2500); }, { passive: true });
    dotsEl.addEventListener('click', function (e) {
      var i = $$('i', dotsEl).indexOf(e.target);
      if (i >= 0) go(i);
    });
    start();
  }

  /* ------------------------------------------------------------ plan sheet */
  function openPlans(id) {
    var list, title;
    if (id === 'unlimited') {
      title = '見放題ch に加入';
      list = [{ name: '見放題ch', price: 3980, desc: '人気投稿や新作など7万件が見放題。いつでも解約できます。' }];
    } else {
      var c = cById(id);
      title = c.name + ' のプラン';
      list = c.plans;
    }
    var s = openSheet(html`<h3>${title}</h3>${list.map(function (pl) {
      return html`<div class="plan"><div class="top"><b>${pl.name}</b><span class="price">${priceLabel(pl)}</span></div><p>${pl.desc}</p><button class="btn btn-fill btn-block btn-lg" data-sheet-ok>${T.subscribe}</button></div>`;
    })}<p class="note">${T.mockNotice}</p>`);
    s.el.addEventListener('click', function (e) {
      if (e.target.closest('[data-sheet-ok]')) { s.close(); toast(T.mockNotice); }
    });
  }

  /* ------------------------------------------------------------ shell */
  var NAV = [
    { key: 'home', href: 'index.html', icon: 'home', label: T.nav.home },
    { key: 'feed', href: 'feed.html', icon: 'star', label: T.nav.feed },
    { key: 'unlimited', href: 'unlimited.html', icon: 'play', label: T.nav.unlimited, tip: T.unlimitedBadge },
    { key: 'ranking', href: 'ranking.html', icon: 'crown', label: T.nav.ranking },
    { key: 'messages', href: 'messages.html', icon: 'message', label: T.nav.messages, dot: true },
    { key: 'account', href: 'account.html', icon: 'user', label: T.nav.account }
  ];
  var SIDE = [
    NAV[0],
    { key: 'search', href: 'search.html', icon: 'search', label: T.nav.search },
    NAV[1], NAV[2], NAV[3], NAV[4],
    { key: 'studio', href: 'studio.html', icon: 'spark', label: T.nav.studio || 'AI創作' },
    { key: 'notifications', href: 'notifications.html', icon: 'bell', label: T.nav.notifications },
    NAV[5]
  ];
  var TITLES = {
    home: CFG.site.name, feed: T.nav.feed, unlimited: T.nav.unlimited, ranking: T.nav.ranking, messages: T.nav.messages,
    account: T.nav.account, search: T.nav.search, genres: 'ジャンル一覧', notifications: T.nav.notifications,
    login: T.login, creator: 'クリエイター', post: '投稿',
    'creator-home': TC.homeTitle, 'post-new': TC.composeTitle, 'post-manage': TC.manageTitle, 'plan-settings': TC.planTitle
  };
  var BACK_PAGES = { 'creator-home': 1, 'post-new': 1, 'post-manage': 1, 'plan-settings': 1, search: 1, genres: 1, notifications: 1, login: 1, creator: 1, post: 1 };

  function buildShell(title) {
    var mode = resolveMode();
    document.body.classList.add('mode-' + mode);
    applyTheme();
    var unreadDot = !store.get('notifRead', false);
    var showBack = !!BACK_PAGES[page] || (page === 'account' && params.get('tab'));
    var isHome = page === 'home';
    var activeKey = /^(creator-home|post-new|post-manage|plan-settings)$/.test(page) ? 'account' : page;

    var navLinks = function (items) {
      return items.map(function (n) {
        return html`<a href="${n.href}" class="${n.key === activeKey ? 'active' : ''}">${ico(n.icon)}<span>${n.label}</span>${n.dot && !store.get('msgRead', false) ? html`<i class="dot"></i>` : ''}</a>`;
      });
    };

    var side = html`<aside class="side">
      <a class="logo" href="index.html"><img class="logo-wide" src="${A.logo.wide}" alt="${CFG.site.name}"><img class="logo-mark" src="${A.logo.mark}" alt="${CFG.site.name}"></a>
      <nav class="snav">${navLinks(SIDE)}</nav>
      ${loggedIn ? '' : html`<div class="side-cta"><a class="btn btn-fill btn-lg btn-block" href="login.html?tab=signup">${T.signup}</a><a class="btn btn-lg btn-block" href="login.html">${T.login}</a></div>`}
    </aside>`;

    var top = html`<header class="topbar">
      ${showBack ? html`<button class="iconbtn back show" data-act="back" aria-label="戻る">${ico('left')}</button>` : ''}
      ${isHome ? html`<a class="logo" href="index.html"><img src="${A.logo.wide}" alt="${CFG.site.name}"></a>` : html`<h1 class="title">${title}</h1>`}
      <form class="top-search" action="search.html" method="get">${ico('search', 'sm')}<input type="search" name="q" placeholder="投稿・クリエイターを検索" autocomplete="off"></form>
      <span class="spacer"></span>
      <button class="iconbtn" data-toast="言語の切り替えはモックでは未対応です" aria-label="言語">${ico('globe')}</button>
      <a class="iconbtn" href="notifications.html" aria-label="${T.nav.notifications}">${ico('bell')}${unreadDot ? html`<i class="dot"></i>` : ''}</a>
      <a class="iconbtn m-only" href="search.html" aria-label="${T.nav.search}">${ico('search')}</a>
      ${loggedIn ? '' : html`<div class="top-auth"><a class="btn" href="login.html">${T.login}</a><a class="btn btn-fill" href="login.html?tab=signup">${T.signup}</a></div>`}
    </header>`;

    var tabbar = html`<nav class="tabbar" aria-label="メインメニュー">${NAV.map(function (n) {
      return html`<a href="${n.href}" class="${n.key === activeKey ? 'active' : ''}">${n.tip ? html`<span class="tip">${n.tip}</span>` : ''}${ico(n.icon)}<span>${n.label}</span>${n.dot && !store.get('msgRead', false) ? html`<i class="dot"></i>` : ''}</a>`;
    })}</nav>`;

    var sw = html`<div class="mode-switch" role="group" aria-label="表示切り替え">
      <button class="ms-btn" data-mode="mobile">${ico('phone')}スマホ</button>
      <button class="ms-btn" data-mode="pc">${ico('monitor')}PC</button>
    </div>`;

    $('#app').innerHTML = html`<div class="app">${side}<div class="col">${top}<div class="col-inner"><main id="main"></main>${footerHtml()}</div></div>${tabbar}</div>${sw}<div id="overlay"></div><div id="toast" class="toast" role="status"></div>`;
    setMode(mode);
    document.title = (isHome ? T.title : title) + ' | ' + CFG.site.name;
  }

  /* ------------------------------------------------------------ pages */
  function pageHome() {
    var pickup = posts.slice().sort(function (a, b) { return b.likes - a.likes; }).slice(0, 8);
    var shown = 8;
    var libIcons = { purchased: 'bag', playlist: 'list', liked: 'heart', history: 'clock' };
    $('#main').innerHTML = html`
      ${loggedIn ? '' : html`<div class="guest reveal"><span>${T.guestBanner}</span><div class="btns"><a class="btn" href="login.html">${T.login}</a><a class="btn btn-fill" href="login.html?tab=signup">${T.signup}</a></div></div>`}
      <div class="swiper" id="bn">${CFG.banners.map(function (b) {
        return html`<a class="banner" href="${b.link || '#'}"><span class="ph">${img('banners', b.img, b.title, true)}</span>${b.overlay !== false ? html`<span class="ov"><b>${b.title}</b><span>${b.sub}</span></span>` : ''}</a>`;
      })}</div>
      <div class="dots" id="bndots"></div>
      <section class="sec reveal"><div class="sec-head"><h2 class="sec-title">${ico('bag')}${T.library}</h2></div>
        <div class="shortcuts">${Object.keys(T.libraryItems).map(function (k) {
          return html`<a href="account.html?tab=${k}">${ico(libIcons[k])}<span>${T.libraryItems[k]}</span></a>`;
        })}</div></section>
      <a class="promo reveal" href="unlimited.html"><small>${T.nav.unlimited}</small><h3>${T.unlimitedLead}</h3><p>${T.unlimitedPrice}</p><span class="cta">いますぐチェック！</span></a>
      ${section(T.recommendGenres, 'grid')}
      <div class="genre-grid">${genres.slice(0, 4).map(genreCard)}</div>
      <div class="more-wrap"><a class="btn btn-lg" href="genres.html">${T.moreGenres}</a></div>
      ${section(T.pickup, 'star')}
      <div class="row">${pickup.map(postCard)}</div>
      ${section(T.creators, 'user')}
      <div class="row">${creators.map(creatorCard)}</div>
      ${section(T.newPosts, 'clock')}
      <div class="grid" id="newgrid">${posts.slice(0, shown).map(postCard)}</div>
      <div class="more-wrap ${shown >= posts.length ? 'hide' : ''}" id="morewrap"><button class="btn btn-lg" id="morebtn">${T.morePosts}</button></div>`;
    initBanner($('#bn'), $('#bndots'));
    $$('.row, .swiper').forEach(enableDrag);
    $('#morebtn').addEventListener('click', function () {
      var next = posts.slice(shown, shown + 8);
      shown += next.length;
      $('#newgrid').insertAdjacentHTML('beforeend', String(html`${next.map(postCard)}`));
      if (shown >= posts.length) $('#morewrap').classList.add('hide');
      observe($('#newgrid'));
    });
    popups();
  }

  function popups() {
    if (params.has('nopopup') || sess.get('popupsDone', false)) return;
    sess.set('popupsDone', true);
    function promo() {
      if (!(CFG.popups && CFG.popups.promo)) return;
      var m = openModal(html`<div class="pm-img"><b>${T.nav.unlimited}</b><span>${T.unlimitedBadge}</span></div><div class="pm-body">${T.unlimitedLead}<br><em>${T.unlimitedPrice}</em><a class="btn btn-lg btn-block" href="unlimited.html">今すぐ見放題chをチェック！</a></div><button class="iconbtn x" data-close aria-label="閉じる">${ico('x')}</button>`, { cls: 'promo-modal' });
      m.box.querySelector('.x').style.cssText = 'background:rgba(0,0,0,.35);color:#fff';
    }
    if (CFG.popups && CFG.popups.welcome) {
      var m = openModal(html`<h3>${T.welcomeTitle}</h3><div class="opts">${T.welcomeOptions.map(function (o, i) {
        return html`<button class="opt ${i === 0 ? 'sel' : ''}" data-opt="${i}">${o}</button>`;
      })}</div><button class="btn btn-fill btn-lg btn-block" data-apply>${T.welcomeApply}</button>`, { onClose: promo });
      m.box.addEventListener('click', function (e) {
        var o = e.target.closest('[data-opt]');
        if (o) $$('[data-opt]', m.box).forEach(function (x) { x.classList.toggle('sel', x === o); });
        if (e.target.closest('[data-apply]')) m.close();
      });
    } else {
      promo();
    }
  }

  function feedPost(p) {
    var c = cById(p.creator), locked = p.price > 0;
    return html`<article class="fpost reveal">
      <div class="fhead"><a href="creator.html?id=${c.id}">${avatarEl(c)}</a>
        <div class="who"><b>${c.name}${verifiedMark(c)}</b><small>@${c.handle} ・ ${p.time}</small></div>${followBtn(c)}</div>
      <a class="fimg ph thumb ${locked ? 'locked' : ''}" style="border-radius:0;display:block" href="post.html?id=${p.id}">${postImg(p, c.name)}${chips(p)}${locked ? html`<span class="lockmark">${ico('lock')}</span>` : ''}</a>
      <div class="actions">${likeBtn(p)}<a class="act" href="post.html?id=${p.id}#comments">${ico('comment')}<span>${fmt(p.comments)}</span></a>
        <button class="act" data-toast="リンクをコピーしました（モック）">${ico('share')}</button>
        <button class="act right ${saved.has(p.id) ? 'saved' : ''}" data-save="${p.id}" aria-label="保存">${ico('bookmark')}</button></div>
      <p class="ftext">${p.text}</p>
    </article>`;
  }
  function pageFeed() {
    var tab = 'rec';
    $('#main').innerHTML = html`${tabsHtml([['rec', 'おすすめ'], ['fol', 'フォロー中']], 'rec')}<div class="feed-wrap" id="feed"></div>`;
    function draw() {
      var list = tab === 'rec' ? posts : posts.filter(function (p) { return follows.has(p.creator); });
      $('#feed').innerHTML = list.length ? String(html`${list.map(feedPost)}`)
        : '<div class="empty">フォロー中のクリエイターがいません。<br>気になるクリエイターをフォローしてみましょう。</div>';
      observe($('#feed'));
    }
    onTabs($('.tabs'), 'data-tab', function (t) { tab = t; draw(); });
    draw();
  }

  function pageUnlimited() {
    var order = {
      rec: posts.filter(function (_, i) { return i % 2 === 0; }).concat(posts.filter(function (_, i) { return i % 2 === 1; })),
      pop: posts.slice().sort(function (a, b) { return b.likes - a.likes; }),
      new: posts.slice()
    };
    $('#main').innerHTML = html`
      <div class="promo" style="margin-top:12px"><small>${T.nav.unlimited}</small><h3>${T.unlimitedLead}</h3><p>${T.unlimitedPrice}</p><button class="cta" style="border:0;cursor:pointer" data-plans="unlimited">見放題chに加入する</button></div>
      ${tabsHtml([['rec', 'おすすめ投稿'], ['pop', '人気投稿'], ['new', '新着投稿']], 'rec')}
      <div class="grid" id="ugrid"></div>`;
    function draw(k) { $('#ugrid').innerHTML = String(html`${order[k].map(postCard)}`); observe($('#ugrid')); }
    onTabs($('.tabs'), 'data-tab', draw);
    draw('rec');
  }

  function pageRanking() {
    var kind = 'posts', period = 'daily';
    var keys = {
      daily: function (p) { return p.likes; },
      weekly: function (p) { return p.comments * 6 + p.likes * 0.4; },
      monthly: function (p) { return (p.likes * 7 + parseInt(p.id.slice(1), 10) * 13) % 97 + p.likes * 0.2; }
    };
    $('#main').innerHTML = html`${tabsHtml([['posts', '投稿'], ['creators', 'クリエイター']], 'posts')}
      <div class="pills" id="periods">${[['daily', 'デイリー'], ['weekly', 'ウィークリー'], ['monthly', '月間']].map(function (p) {
        return html`<button class="pill ${p[0] === 'daily' ? 'active' : ''}" data-period="${p[0]}">${p[1]}</button>`;
      })}</div><ul class="rank-list" id="rlist"></ul>`;
    function draw() {
      var items;
      if (kind === 'posts') {
        items = posts.slice().sort(function (a, b) { return keys[period](b) - keys[period](a); }).slice(0, 10).map(function (p, i) {
          var c = cById(p.creator);
          return html`<li class="rank-item reveal"><span class="rank-no">${i + 1}</span><a class="mini ph" href="post.html?id=${p.id}">${postImg(p, '')}</a>
            <a class="info" href="post.html?id=${p.id}"><b>${p.text.slice(0, 22)}${p.text.length > 22 ? '…' : ''}</b><small>${c.name} ・ ${ico('heart', 'xs')} ${fmt(p.likes)}</small></a></li>`;
        });
      } else {
        var off = { daily: 0, weekly: 3, monthly: 5 }[period];
        var list = creators.slice().sort(function (a, b) { return (b.followers * (1 + ((parseInt(b.id.slice(1), 10) * off) % 5) / 10)) - (a.followers * (1 + ((parseInt(a.id.slice(1), 10) * off) % 5) / 10)); });
        items = list.map(function (c, i) {
          return html`<li class="rank-item reveal"><span class="rank-no">${i + 1}</span><a href="creator.html?id=${c.id}">${avatarEl(c)}</a>
            <a class="info" href="creator.html?id=${c.id}"><b>${c.name}${verifiedMark(c)}</b><small>@${c.handle} ・ フォロワー ${fmtK(c.followers)}</small></a>${followBtn(c)}</li>`;
        });
      }
      $('#rlist').innerHTML = String(html`${items}`);
      observe($('#rlist'));
    }
    onTabs($('.tabs'), 'data-tab', function (t) { kind = t; draw(); });
    onTabs($('#periods'), 'data-period', function (t) { period = t; draw(); });
    draw();
  }

  function pageMessages() {
    var main = $('#main');
    function list() {
      main.innerHTML = String(html`<ul>${CFG.messages.map(function (m, i) {
        var c = cById(m.creator);
        return html`<li class="thread" data-thread="${i}">${avatarEl(c)}<div class="mid"><b>${c.name}${verifiedMark(c)}</b><small>${m.last}</small></div>
          <div class="end"><span>${m.time}</span>${m.unread ? html`<span class="unread">${m.unread}</span>` : ''}</div></li>`;
      })}</ul>`);
    }
    function chat(i) {
      var m = CFG.messages[i], c = cById(m.creator);
      main.innerHTML = String(html`<div class="fhead" style="border-bottom:1px solid #eee"><button class="iconbtn" data-thread-back aria-label="戻る">${ico('left')}</button>${avatarEl(c)}<div class="who"><b>${c.name}${verifiedMark(c)}</b></div></div>
        <div class="chat" id="chat">${CFG.chatSample.map(function (b) { return html`<div class="bubble ${b.from}">${b.text}</div>`; })}</div>
        <form class="chat-form" id="cf"><input name="t" placeholder="メッセージを入力" autocomplete="off"><button class="send" aria-label="送信">${ico('send', 'sm')}</button></form>`);
      $('#cf').addEventListener('submit', function (e) {
        e.preventDefault();
        var inp = this.elements.t, t = inp.value.trim();
        if (!t) return;
        var ch = $('#chat');
        ch.insertAdjacentHTML('beforeend', '<div class="bubble me">' + esc(t) + '</div>');
        inp.value = '';
        setTimeout(function () {
          ch.insertAdjacentHTML('beforeend', '<div class="bubble creator">メッセージありがとうございます！（自動返信のモックです）</div>');
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 700);
      });
    }
    main.addEventListener('click', function (e) {
      var th = e.target.closest('[data-thread]');
      if (th) { store.set('msgRead', true); $$('.dot', document).forEach(function (d) { if (d.closest('.tabbar,.snav')) d.remove(); }); chat(parseInt(th.getAttribute('data-thread'), 10)); window.scrollTo(0, 0); }
      if (e.target.closest('[data-thread-back]')) list();
    });
    list();
  }

  function pageAccount() {
    var tab = params.get('tab');
    var labels = T.libraryItems;
    if (tab && labels[tab]) {
      var list = {
        purchased: posts.filter(function (p) { return p.price > 0; }),
        playlist: posts.filter(function (p) { return p.type === 'video'; }),
        liked: posts.filter(function (p) { return likes.has(p.id); }),
        history: posts.slice(0, 10).reverse()
      }[tab];
      $('#main').innerHTML = html`<div class="sec"><h2 class="sec-title">${labels[tab]}</h2></div>${list.length ? html`<div class="grid">${list.map(postCard)}</div>` : html`<div class="empty">まだ${labels[tab]}の投稿はありません。<br>気になる投稿に「いいね」してみましょう。</div>`}`;
      return;
    }
    var libIcons = { purchased: 'bag', playlist: 'list', liked: 'heart', history: 'clock' };
    $('#main').innerHTML = html`
      ${loggedIn ? html`<div class="fhead" style="padding:16px 14px"><span class="av ph" style="width:56px;height:56px">${img('avatars', 4, 'me', true)}</span><div class="who"><b style="font-size:16px">ゲストユーザー</b><small>@guest_user</small></div><button class="btn" data-toast="${T.mockNotice}">${ico('edit', 'xs')}編集</button></div>`
        : html`<div class="guest" style="margin-top:14px"><span>${T.guestBanner}</span><div class="btns"><a class="btn" href="login.html">${T.login}</a><a class="btn btn-fill" href="login.html?tab=signup">${T.signup}</a></div></div>`}
      <div class="menu-title">${T.library}</div>
      <ul class="menu">${Object.keys(labels).map(function (k) { return html`<li><a href="account.html?tab=${k}">${ico(libIcons[k])}<span>${labels[k]}</span>${ico('right', 'sm end')}</a></li>`; })}</ul>
      <div class="menu-title">設定・サポート</div>
      <ul class="menu">
        <li><button data-toast="${T.mockNotice}">${ico('card')}<span>お支払い方法</span>${ico('right', 'sm end')}</button></li>
        <li><button data-toast="${T.mockNotice}">${ico('bell')}<span>通知設定</span>${ico('right', 'sm end')}</button></li>
        <li><a href="studio.html">${ico('spark')}<span>${TC.studioLink}</span>${ico('right', 'sm end')}</a></li>
        <li><a href="creator-home.html">${ico('edit')}<span>${TC.menuLink}</span>${ico('right', 'sm end')}</a></li>
        <li><button data-toast="${T.mockNotice}">${ico('plus')}<span>クリエイターとして登録する</span>${ico('right', 'sm end')}</button></li>
        <li><button data-toast="${T.mockNotice}">${ico('help')}<span>ヘルプ・お問い合わせ</span>${ico('right', 'sm end')}</button></li>
        <li><button data-toast="${T.mockNotice}">${ico('doc')}<span>利用規約</span>${ico('right', 'sm end')}</button></li>
        <li><button data-mode-toggle>${ico('monitor')}<span data-mode-label>PC表示に切り替える</span>${ico('right', 'sm end')}</button></li>
        ${loggedIn ? html`<li><button data-logout>${ico('logout')}<span>ログアウト</span></button></li>` : ''}
      </ul>`;
    setMode(document.body.classList.contains('mode-pc') ? 'pc' : 'mobile');
  }

  function pageSearch() {
    var q = params.get('q') || '', gid = params.get('genre') || '';
    $('#main').innerHTML = html`
      <form class="searchbar" id="sf">${ico('search', 'sm')}<input id="q" type="search" placeholder="投稿・クリエイター・ジャンルで検索" value="${q}" autocomplete="off"></form>
      <div class="pills" id="gp"><button class="pill ${gid ? '' : 'active'}" data-g="">すべて</button>${genres.map(function (g) { return html`<button class="pill ${g.id === gid ? 'active' : ''}" data-g="${g.id}">${g.name}</button>`; })}</div>
      <div id="kw" class="chips"></div><div id="sres"></div>`;
    function draw() {
      var s = q.trim().toLowerCase();
      var cs = creators.filter(function (c) {
        var g = gById(c.genre);
        return (!gid || c.genre === gid) && (!s || (c.name + c.handle + c.bio + (g ? g.name : '')).toLowerCase().indexOf(s) >= 0);
      });
      var ps = posts.filter(function (p) {
        var c = cById(p.creator), g = gById(c.genre);
        return (!gid || c.genre === gid) && (!s || (p.text + c.name + c.handle + (g ? g.name : '')).toLowerCase().indexOf(s) >= 0);
      });
      $('#kw').innerHTML = (s || gid) ? '' : String(html`${CFG.keywords.map(function (k) { return html`<button class="pill" data-kw="${k}">${k}</button>`; })}`);
      var title = s || gid ? '検索結果' : '人気の投稿';
      if (!(s || gid)) ps = ps.slice().sort(function (a, b) { return b.likes - a.likes; });
      $('#sres').innerHTML = String(html`
        ${cs.length && (s || gid) ? html`${section('クリエイター')}<div class="row">${cs.map(creatorCard)}</div>` : ''}
        ${section(title + '（' + ps.length + '件）')}
        ${ps.length ? html`<div class="grid">${ps.map(postCard)}</div>` : html`<div class="empty">「${q}」に一致する投稿は見つかりませんでした。</div>`}`);
      $$('#sres .row').forEach(enableDrag);
      observe($('#sres'));
      try { history.replaceState(null, '', location.pathname + '?' + new URLSearchParams(Object.assign({}, q ? { q: q } : {}, gid ? { genre: gid } : {})).toString()); } catch (e) { /* file:// で失敗しても無視 */ }
    }
    $('#sf').addEventListener('submit', function (e) { e.preventDefault(); });
    $('#q').addEventListener('input', function () { q = this.value; draw(); });
    onTabs($('#gp'), 'data-g', function (g) { gid = g; draw(); });
    $('#kw').addEventListener('click', function (e) {
      var b = e.target.closest('[data-kw]');
      if (b) { q = b.getAttribute('data-kw'); $('#q').value = q; draw(); }
    });
    draw();
    if (!q && !gid && window.innerWidth > 0) { try { $('#q').focus({ preventScroll: true }); } catch (e) { /* noop */ } }
  }

  function pageGenres() {
    $('#main').innerHTML = html`${section('カテゴリから探す', 'grid')}<div class="genre-grid">${genres.map(genreCard)}</div>${section('人気のクリエイター', 'user')}<div class="row">${creators.map(creatorCard)}</div>`;
    $$('.row').forEach(enableDrag);
  }

  function pageCreator() {
    var c = cById(params.get('id') || creators[0].id);
    var g = gById(c.genre);
    var mine = posts.filter(function (p) { return p.creator === c.id; });
    document.title = c.name + ' | ' + CFG.site.name;
    $('.topbar .title').textContent = c.name;
    $('#main').innerHTML = html`
      <div class="cover ph">${img('covers', c.cover, '', true)}</div>
      <div class="cprofile">
        <div class="row1">${avatarEl(c)}<div style="display:flex;gap:8px">${followBtn(c)}<button class="btn btn-fill" data-plans="${c.id}">${T.subscribe}</button></div></div>
        <h1>${c.name}${verifiedMark(c)}</h1><div class="handle">@${c.handle}</div>
        <p class="bio">${c.bio}</p>
        <div class="stats"><span><b>${fmtK(c.followers)}</b>フォロワー</span><span><b>${mine.length}</b>投稿</span>${g ? html`<span><b style="font-size:13px">${g.name}</b></span>` : ''}</div>
      </div>
      ${tabsHtml([['posts', '投稿'], ['plans', 'プラン'], ['about', 'プロフィール']], 'posts')}
      <div id="ctab"></div>
      ${section('おすすめのクリエイター', 'user')}<div class="row">${creators.filter(function (x) { return x.id !== c.id; }).map(creatorCard)}</div>`;
    function draw(t) {
      var box = $('#ctab');
      if (t === 'posts') box.innerHTML = String(html`<div class="grid thumbs">${mine.map(thumbCard)}</div>`);
      if (t === 'plans') box.innerHTML = String(html`<div class="plans">${c.plans.map(function (pl) {
        return html`<div class="plan"><div class="top"><b>${pl.name}</b><span class="price">${priceLabel(pl)}</span></div><p>${pl.desc}</p><button class="btn btn-fill btn-block btn-lg" data-plans="${c.id}">${T.subscribe}</button></div>`;
      })}</div>`);
      if (t === 'about') box.innerHTML = String(html`<div class="kv"><div><span>ジャンル</span><span>${g ? g.name : '-'}</span></div><div><span>フォロワー</span><span>${fmt(c.followers)}</span></div><div><span>投稿数</span><span>${mine.length}</span></div><div><span>ID</span><span>@${c.handle}</span></div></div>`);
      observe(box);
    }
    onTabs($('.tabs'), 'data-tab', draw);
    draw('posts');
    $$('.row').forEach(enableDrag);
  }

  function pagePost() {
    var p = pById(params.get('id') || posts[0].id);
    var c = cById(p.creator), locked = p.price > 0;
    var comments = CFG.comments.slice();
    $('.topbar .title').textContent = c.name + ' の投稿';
    document.title = c.name + ' の投稿 | ' + CFG.site.name;
    function cmtHtml(x) {
      return html`<div class="cmt"><span class="av ph">${img('avatars', x.avatar, x.name)}</span><div><b>${x.name}</b><small>${x.time}</small><p>${x.text}</p></div></div>`;
    }
    $('#main').innerHTML = html`
      <div class="post-layout">
        <div class="post-media"><div class="post-main ph ${locked ? 'locked' : ''}">${postImg(p, c.name, true)}
          ${locked ? html`<div class="lock-cover">${ico('lock')}<b>${T.locked}</b><button class="btn btn-fill btn-lg" data-plans="${c.id}">${T.subscribe}（¥${fmt(p.price)}〜）</button></div>`
            : p.type === 'video' ? html`<button class="playbtn" data-toast="モックでは動画は再生されません" aria-label="再生">${ico('play-solid', 'fill')}</button>` : ''}
          ${p.type === 'video' && !locked ? html`<span class="chip br">${p.duration || '00:30'}</span>` : ''}</div></div>
        <div class="post-body">
          <div class="fhead" style="padding-left:0;padding-right:0"><a href="creator.html?id=${c.id}">${avatarEl(c)}</a><div class="who"><b>${c.name}${verifiedMark(c)}</b><small>@${c.handle} ・ ${p.time}</small></div>${followBtn(c)}</div>
          <div class="actions" style="padding-left:0">${likeBtn(p)}<span class="act">${ico('comment')}<span id="cc">${fmt(p.comments)}</span></span>
            <button class="act" data-toast="リンクをコピーしました（モック）">${ico('share')}</button>
            <button class="act right ${saved.has(p.id) ? 'saved' : ''}" data-save="${p.id}" aria-label="保存">${ico('bookmark')}</button></div>
          <p class="ftext" style="padding-left:0;padding-right:0">${p.text}</p>
          <h2 class="sec-title" id="comments" style="padding:6px 0">コメント</h2>
          <div class="cmt-list" id="cl" style="padding-left:0">${comments.map(cmtHtml)}</div>
          <form class="cmt-form" id="cf" style="padding-left:0;padding-right:0"><input name="t" placeholder="コメントを書く" autocomplete="off"><button class="btn btn-fill">送信</button></form>
        </div>
      </div>
      ${section('この投稿の関連', 'star')}
      <div class="row">${posts.filter(function (x) { return x.id !== p.id; }).slice(0, 8).map(postCard)}</div>`;
    $('#cf').addEventListener('submit', function (e) {
      e.preventDefault();
      var t = this.elements.t.value.trim();
      if (!t) return;
      $('#cl').insertAdjacentHTML('afterbegin', String(cmtHtml({ name: 'あなた', avatar: 4, time: 'たった今', text: t })));
      this.elements.t.value = '';
      $('#cc').textContent = fmt(p.comments + 1);
    });
    $$('.row').forEach(enableDrag);
  }

  function pageNotifications() {
    store.set('notifRead', true);
    $$('.topbar .dot').forEach(function (d) { d.remove(); });
    $('#main').innerHTML = html`<div>${CFG.notifications.map(function (n) {
      return html`<div class="notice ${n.unread ? 'unread-row' : ''} reveal"><span class="ic">${ico(n.icon)}</span><div><p>${n.text}</p><small>${n.time}</small></div></div>`;
    })}</div>`;
  }

  function pageLogin() {
    var tab = params.get('tab') === 'signup' ? 'signup' : 'login';
    $('#main').innerHTML = html`<div style="padding:18px 0 0" class="center"><img src="${A.logo.wide}" alt="${CFG.site.name}" style="height:34px;margin:0 auto"></div>
      ${tabsHtml([['login', T.login], ['signup', T.signup]], tab)}<div id="lf"></div>`;
    function draw(t) {
      $('#lf').innerHTML = String(html`<form class="form" id="authf">
        ${t === 'signup' ? html`<div class="field"><label>ニックネーム</label><input name="nick" required placeholder="ゲスト"></div>` : ''}
        <div class="field"><label>メールアドレス</label><input type="email" name="email" required placeholder="example@mail.com"></div>
        <div class="field"><label>パスワード</label><input type="password" name="pw" required minlength="4" placeholder="4文字以上"></div>
        <button class="btn btn-fill btn-lg btn-block">${t === 'signup' ? T.signup : T.login}</button>
        <div class="divider">または</div>
        <button type="button" class="sns x" data-toast="${T.mockNotice}">Xで${t === 'signup' ? '登録' : 'ログイン'}</button>
        <button type="button" class="sns line" data-toast="${T.mockNotice}">LINEで${t === 'signup' ? '登録' : 'ログイン'}</button>
        <p class="note">${T.mockNotice}。入力内容は保存・送信されません。</p></form>`);
      $('#authf').addEventListener('submit', function (e) {
        e.preventDefault();
        store.set('login', true);
        toast(t === 'signup' ? '登録しました（モック）' : 'ログインしました（モック）');
        setTimeout(function () { location.href = 'index.html'; }, 800);
      });
    }
    onTabs($('.tabs'), 'data-tab', draw);
    draw(tab);
  }

  /* ------------------------------------------------------------ global events */
  document.addEventListener('click', function (e) {
    var t = e.target, el;
    if (!/^studio/.test(page) && (el = t.closest('a[href^="studio"]'))) { try { sessionStorage.setItem('fcm:stEnter', '1'); } catch (err) { /* ignore */ } }
    if ((el = t.closest('[data-act="back"]'))) { if (history.length > 1) history.back(); else location.href = 'index.html'; return; }
    if ((el = t.closest('[data-mode]'))) { setMode(el.getAttribute('data-mode')); return; }
    if ((el = t.closest('[data-mode-toggle]'))) { setMode(document.body.classList.contains('mode-pc') ? 'mobile' : 'pc'); return; }
    if ((el = t.closest('[data-like]'))) {
      e.preventDefault();
      var id = el.getAttribute('data-like'), p = pById(id), on = !likes.has(id);
      if (on) likes.add(id); else likes.delete(id);
      store.set('likes', Array.from(likes));
      $$('[data-like="' + id + '"]').forEach(function (b) {
        b.classList.toggle('liked', on);
        var s = $('[data-lc]', b); if (s) s.textContent = fmt(p.likes + (on ? 1 : 0));
      });
      return;
    }
    if ((el = t.closest('[data-follow]'))) {
      e.preventDefault();
      var cid = el.getAttribute('data-follow'), con = !follows.has(cid);
      if (con) follows.add(cid); else follows.delete(cid);
      store.set('follows', Array.from(follows));
      $$('[data-follow="' + cid + '"]').forEach(function (b) { b.classList.toggle('on', con); b.textContent = con ? T.following : T.follow; });
      toast(con ? cById(cid).name + ' をフォローしました' : 'フォローを解除しました');
      return;
    }
    if ((el = t.closest('[data-save]'))) {
      e.preventDefault();
      var sid = el.getAttribute('data-save'), son = !saved.has(sid);
      if (son) saved.add(sid); else saved.delete(sid);
      store.set('saved', Array.from(saved));
      $$('[data-save="' + sid + '"]').forEach(function (b) { b.classList.toggle('saved', son); });
      toast(son ? '保存しました' : '保存を解除しました');
      return;
    }
    if ((el = t.closest('[data-plans]'))) { e.preventDefault(); openPlans(el.getAttribute('data-plans')); return; }
    if ((el = t.closest('[data-logout]'))) { store.set('login', false); toast('ログアウトしました'); setTimeout(function () { location.href = 'index.html'; }, 600); return; }
    if ((el = t.closest('[data-toast]'))) { e.preventDefault(); toast(el.getAttribute('data-toast')); return; }
  });

  /* ------------------------------------------------------------ クリエイター用ページ
   *  公式のクリエイター画面は未確認のため、確認できた範囲（マイページ→新規投稿→画像/動画→説明文→公開範囲、
   *  画像10MB・JPG/PNG・MP4、プラン作成など）を土台に、残りは想定で構成しています。
   *  想定で作った項目には「推測」タグが付きます（config.js の creatorTools.showAssumptionTags で消せます）。
   * ------------------------------------------------------------------------ */
  function assumeTag() {
    return CT.showAssumptionTags === false ? '' : html`<span class="assume" title="公式の画面を確認できていないため、想定で作った項目です">${TC.assumeTag || '推測'}</span>`;
  }
  function assumeNote() {
    return CT.showAssumptionTags === false ? '' : html`<div class="assume-note">${assumeTag()}${TC.noteAssume}</div>`;
  }
  function mine() { return allPosts.filter(function (p) { return p.creator === ME; }); }
  function statusOf(p) { return p.status || 'published'; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtDate(v) {
    var d = new Date(v);
    return d.getFullYear() + '/' + pad2(d.getMonth() + 1) + '/' + pad2(d.getDate()) + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function toLocalInput(v) {
    var d = new Date(v);
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) + 'T' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }
  function visLabel(p) {
    if (p.ppv) return '単品 ¥' + fmt(p.ppvPrice || p.price);
    if (p.vis === 'members' || (!p.vis && p.price > 0)) return '会員限定';
    return '全員に公開';
  }
  function confirmModal(title, note, okLabel, onOk) {
    var m = openModal(html`<h3>${title}</h3>${note ? html`<p class="note" style="margin-bottom:14px">${note}</p>` : ''}<div style="display:flex;gap:10px"><button class="btn btn-lg" style="flex:1" data-close>${TC.cancel}</button><button class="btn btn-fill btn-lg" style="flex:1" data-ok>${okLabel}</button></div>`);
    m.box.addEventListener('click', function (e) { if (e.target.closest('[data-ok]')) { m.close(); onOk(); } });
  }

  /* ---- クリエイターメニュー ---- */
  function pageCreatorHome() {
    var c = cById(ME), list = mine();
    var pub = list.filter(function (p) { return statusOf(p) === 'published'; });
    var likesSum = pub.reduce(function (a, p) { return a + (p.likes || 0); }, 0);
    var sch = list.filter(function (p) { return statusOf(p) === 'scheduled'; }).length;
    var draft = list.filter(function (p) { return statusOf(p) === 'draft'; }).length;
    $('#main').innerHTML = html`
      ${assumeNote()}
      <div class="fhead" style="padding:14px 14px 6px"><a href="creator.html?id=${c.id}">${avatarEl(c, 'lg')}</a>
        <div class="who"><b style="font-size:16px">${c.name}${verifiedMark(c)}</b><small>@${c.handle}</small></div>
        <a class="btn" href="creator.html?id=${c.id}">${TC.viewPublic}</a></div>
      <div class="stats3">
        <div class="stat"><b>${fmtK(c.followers)}</b><small>${TC.statFollowers}</small></div>
        <div class="stat"><b>${pub.length}</b><small>${TC.statPosts}</small></div>
        <div class="stat"><b>${fmt(likesSum)}</b><small>${TC.statLikes}</small></div></div>
      <div style="padding:4px 12px 10px"><a class="btn btn-fill btn-lg btn-block" href="post-new.html">${ico('plus', 'sm')}${TC.newPost}</a></div>
      <ul class="menu">
        <li><a href="post-manage.html">${ico('list')}<span>${TC.managePosts}</span>${(sch || draft) ? html`<small class="muted">予約${sch}・下書き${draft}</small>` : ''}${ico('right', 'sm end')}</a></li>
        <li><a href="studio.html">${ico('spark')}<span>${TC.studioLink}</span>${ico('right', 'sm end')}</a></li>
        <li><a href="plan-settings.html">${ico('star')}<span>${TC.planSettings}</span>${ico('right', 'sm end')}</a></li>
        <li><button data-toast="${TC.soon}">${ico('card')}<span>${TC.earnings}</span>${ico('right', 'sm end')}</button></li>
        <li><button data-toast="${TC.soon}">${ico('bag')}<span>${TC.bank}</span>${ico('right', 'sm end')}</button></li>
        <li><button data-toast="${TC.soon}">${ico('edit')}<span>${TC.editProfile}</span>${ico('right', 'sm end')}</button></li>
      </ul>`;
  }

  /* ---- 画像・動画 → サムネイル（ブラウザ内で縮小して保存。ファイル自体は送信/保存しません） ---- */
  function makeThumb(file, isVideo) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), done = false;
      function finish(el, w, h, dur) {
        if (done) return;
        done = true;
        try {
          var scale = Math.min(1, 720 / Math.max(w, h, 1));
          var cv = document.createElement('canvas');
          cv.width = Math.max(1, Math.round(w * scale));
          cv.height = Math.max(1, Math.round(h * scale));
          var cx = cv.getContext('2d');
          cx.fillStyle = '#fff';
          cx.fillRect(0, 0, cv.width, cv.height);
          cx.drawImage(el, 0, 0, cv.width, cv.height);
          var data = cv.toDataURL('image/jpeg', 0.82);
          URL.revokeObjectURL(url);
          resolve({ src: data, type: isVideo ? 'video' : 'photo', dur: dur });
        } catch (err) { reject(err); }
      }
      if (!isVideo) {
        var im = new Image();
        im.onload = function () { finish(im, im.naturalWidth, im.naturalHeight); };
        im.onerror = reject;
        im.src = url;
      } else {
        var v = document.createElement('video');
        v.muted = true; v.preload = 'metadata'; v.playsInline = true;
        v.onloadeddata = function () { try { v.currentTime = Math.min(0.5, (v.duration || 1) / 2); } catch (err) { reject(err); } };
        v.onseeked = function () {
          var d = Math.round(v.duration || 0);
          finish(v, v.videoWidth, v.videoHeight, pad2(Math.floor(d / 60)) + ':' + pad2(d % 60));
        };
        v.onerror = reject;
        v.src = url;
      }
    });
  }
  function mediaImg(m, alt, eager) {
    if (m && m.src) return dataImg(m.src, alt);
    return img('posts', (m && m.asset) || 1, alt, eager);
  }

  /* ---- 投稿作成 / 編集 ---- */
  function pagePostNew() {
    var editId = params.get('edit');
    var src = editId ? allPosts.filter(function (p) { return p.id === editId; })[0] : null;
    var c = cById(ME);
    var maxCap = CT.captionMax || 1000, maxMedia = CT.maxMedia || 10, imgMB = CT.imageMaxMB || 10;
    var st = { media: [], text: '', vis: 'public', plans: [], ppv: false, price: '', sched: false, when: '', tags: [] };
    if (src) {
      st.text = src.text || '';
      st.vis = src.vis || (src.price > 0 ? 'members' : 'public');
      st.plans = (src.planNames || []).slice();
      if (st.vis === 'members' && !st.plans.length && c.plans.length) st.plans = [c.plans[0].name];
      st.ppv = !!src.ppv;
      st.price = src.ppvPrice || '';
      st.tags = (src.tags || []).slice();
      st.media = [src.thumb ? { src: src.thumb, type: src.type || 'photo', dur: src.duration } : { asset: src.img, type: src.type || 'photo', dur: src.duration }];
      if (src.status === 'scheduled' && src.scheduledAt) { st.sched = true; st.when = toLocalInput(src.scheduledAt); }
    }
    $('.topbar .title').textContent = editId ? TC.editTitle : TC.composeTitle;
    document.title = (editId ? TC.editTitle : TC.composeTitle) + ' | ' + CFG.site.name;

    $('#main').innerHTML = html`
      ${assumeNote()}
      <div class="composer">
        <div class="composer-form">
          <section class="cblock"><h3>${TC.media}</h3><a class="btn btn-lg btn-block btn-create" id="btnCreate" href="${CT.createPage || 'studio.html'}">${ico('star', 'sm')}${TC.create}</a><div id="mediaBox"></div>
            <input type="file" id="fileIn" multiple accept="image/jpeg,image/png,image/webp,video/mp4" hidden>
            <p class="hint create-hint">${ico('star', 'xs')}${TC.createHint}${assumeTag()}</p>
            <p class="hint">${TC.mediaHint.replace('{imageMax}', imgMB)}</p></section>
          <section class="cblock"><h3>${TC.caption}</h3>
            <textarea class="cap" id="cap" maxlength="${maxCap}" placeholder="${TC.captionPlaceholder}"></textarea>
            <div class="counter"><span id="cnt">0</span> / ${maxCap}${assumeTag()}</div></section>
          <section class="cblock"><h3>${TC.visibility}</h3>
            <div class="seg" id="vis"><button type="button" data-vis="public">${TC.visPublic}</button><button type="button" data-vis="members">${TC.visMembers}</button></div>
            <div id="planBox"></div></section>
          <section class="cblock">
            <div class="swrow"><div><b>${TC.ppv}${assumeTag()}</b><small>${TC.ppvHint}</small></div><label class="switch"><input type="checkbox" id="ppvSw"><i></i></label></div>
            <div id="ppvBox" class="subfield hide"><label class="lbl" for="ppvPrice">${TC.ppvPrice}</label><input class="inp" id="ppvPrice" type="number" inputmode="numeric" min="1" step="1" placeholder="例: 500"></div>
            <div class="swrow"><div><b>${TC.schedule}${assumeTag()}</b><small>${TC.scheduleHint}</small></div><label class="switch"><input type="checkbox" id="schSw"><i></i></label></div>
            <div id="schBox" class="subfield hide"><input class="inp" id="schWhen" type="datetime-local"></div>
          </section>
          <section class="cblock"><h3>${TC.tags}${assumeTag()}</h3><div class="tagpick" id="tagBox"></div><p class="hint">${TC.tagsHint}</p></section>
        </div>
        <aside class="composer-preview"><h3 class="pv-title">${TC.preview}</h3><div class="pv-wrap"><div id="pv"></div></div></aside>
      </div>
      <div class="actionbar"><button type="button" class="btn btn-lg" id="btnDraft">${TC.saveDraft}</button><button type="button" class="btn btn-fill btn-lg" id="btnPost"></button></div>`;

    function drawMedia() {
      var box = $('#mediaBox');
      if (!st.media.length) {
        box.innerHTML = String(html`<div class="dz" id="dz" tabindex="0" role="button">${ico('plus')}<b>${TC.mediaAdd}</b><small>クリックして選ぶか、ここにドラッグ＆ドロップ</small></div>`);
        return;
      }
      box.innerHTML = String(html`<div class="media-grid">${st.media.map(function (m, i) {
        return html`<div class="mtile ph done">${mediaImg(m, '', true)}${i === 0 ? html`<span class="cv">カバー</span>` : ''}${m.type === 'video' ? html`<span class="chip br">${ico('play-solid', 'xs fill')}${m.dur || ''}</span>` : ''}<button type="button" class="rm" data-rm="${i}" aria-label="削除">${ico('x', 'xs')}</button></div>`;
      })}${st.media.length < maxMedia ? html`<div class="addtile" id="dz" tabindex="0" role="button">${ico('plus')}<span>追加</span></div>` : ''}</div>`);
    }
    function drawPlans() {
      var box = $('#planBox');
      if (st.vis !== 'members') { box.innerHTML = ''; return; }
      box.innerHTML = String(html`<p class="hint" style="margin-top:12px">${TC.visPlans}${assumeTag()}</p><div class="checks">${c.plans.map(function (pl) {
        return html`<label class="check"><input type="checkbox" data-plan="${pl.name}" ${st.plans.indexOf(pl.name) >= 0 ? 'checked' : ''}><span class="nm">${pl.name}</span><span class="pr">${pl.price > 0 ? '¥' + fmt(pl.price) : '無料'}</span></label>`;
      })}</div>`);
    }
    function drawTags() {
      $('#tagBox').innerHTML = String(html`${genres.map(function (g) {
        return html`<button type="button" class="pill ${st.tags.indexOf(g.id) >= 0 ? 'active' : ''}" data-tag="${g.id}">${g.name}</button>`;
      })}`);
    }
    function computePrice() {
      if (st.ppv && +st.price > 0) return Math.round(+st.price);
      if (st.vis === 'members') {
        var prices = c.plans.filter(function (pl) { return st.plans.indexOf(pl.name) >= 0 && pl.price > 0; }).map(function (pl) { return pl.price; });
        return prices.length ? Math.min.apply(null, prices) : 0;
      }
      return 0;
    }
    function drawPreview() {
      var price = computePrice(), cover = st.media[0], locked = price > 0;
      $('#pv').innerHTML = String(html`<div class="pcard"><div class="thumb ph done ${locked ? 'locked' : ''}">${cover ? mediaImg(cover, '', true) : html`<div class="noimg">${ico('plus')}<small>画像なし</small></div>`}${locked ? html`<span class="chip tl price">¥${fmt(price)}</span><span class="lockmark">${ico('lock')}</span>` : ''}${cover && cover.type === 'video' ? html`<span class="chip br">${ico('play-solid', 'xs fill')}${cover.dur || ''}</span>` : ''}${st.media.length > 1 ? html`<span class="chip tr">${st.media.length}枚</span>` : ''}</div>
        <p class="pcard-text">${st.text.trim() || TC.previewEmpty}</p>
        <div class="pcard-meta">${avatarEl(c)}<span class="nm">${c.name}</span><span class="lk">${ico('heart')}0</span></div></div>`);
      $('#btnPost').textContent = editId ? TC.update : (st.sched ? TC.schedulePost : TC.post);
    }
    function syncVis() { $$('#vis [data-vis]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-vis') === st.vis); }); }

    /* ファイル追加（順番を保つため直列で処理） */
    var chain = Promise.resolve();
    function addFiles(files) {
      Array.prototype.slice.call(files).forEach(function (f) {
        chain = chain.then(function () {
          if (st.media.length >= maxMedia) { toast('追加できるのは最大' + maxMedia + '件までです'); return; }
          var ext = (f.name.split('.').pop() || '').toLowerCase();
          if (['heic', 'heif', 'mov'].indexOf(ext) >= 0) { toast('HEIC・MOVはエラーになることがあるため、JPG/PNG・MP4に変換してください'); return; }
          var isVideo = /^video\//.test(f.type), isImage = /^image\//.test(f.type);
          if (!isVideo && !isImage) { toast('対応していないファイル形式です'); return; }
          if (isImage && f.size > imgMB * 1048576) { toast('画像は1ファイル' + imgMB + 'MB以下にしてください'); return; }
          return makeThumb(f, isVideo).then(function (m) { st.media.push(m); drawMedia(); drawPreview(); })
            .catch(function () { toast('読み込めないファイルでした: ' + f.name); });
        });
      });
      return chain;
    }

    /* 初期表示 */
    $('#cap').value = st.text;
    $('#cnt').textContent = st.text.length;
    $('#ppvSw').checked = st.ppv; $('#ppvBox').classList.toggle('hide', !st.ppv); $('#ppvPrice').value = st.price;
    $('#schSw').checked = st.sched; $('#schBox').classList.toggle('hide', !st.sched); $('#schWhen').value = st.when;
    $('#schWhen').min = toLocalInput(new Date());
    syncVis(); drawMedia(); drawPlans(); drawTags(); drawPreview();

    /* イベント */
    var fileIn = $('#fileIn'), mediaBox = $('#mediaBox');
    fileIn.addEventListener('change', function () { addFiles(this.files); this.value = ''; });
    mediaBox.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-rm]');
      if (rm) { st.media.splice(parseInt(rm.getAttribute('data-rm'), 10), 1); drawMedia(); drawPreview(); return; }
      if (e.target.closest('#dz')) fileIn.click();
    });
    mediaBox.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('#dz')) { e.preventDefault(); fileIn.click(); } });
    ['dragenter', 'dragover'].forEach(function (n) {
      mediaBox.addEventListener(n, function (e) { e.preventDefault(); var d = $('#dz'); if (d) d.classList.add('drag'); });
    });
    mediaBox.addEventListener('dragleave', function () { var d = $('#dz'); if (d) d.classList.remove('drag'); });
    mediaBox.addEventListener('drop', function (e) { e.preventDefault(); var d = $('#dz'); if (d) d.classList.remove('drag'); if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files); });

    $('#cap').addEventListener('input', function () { st.text = this.value; $('#cnt').textContent = this.value.length; drawPreview(); });
    $('#vis').addEventListener('click', function (e) {
      var b = e.target.closest('[data-vis]');
      if (!b) return;
      st.vis = b.getAttribute('data-vis');
      if (st.vis === 'members' && !st.plans.length && c.plans.length) st.plans = [c.plans[0].name];
      syncVis(); drawPlans(); drawPreview();
    });
    $('#planBox').addEventListener('change', function (e) {
      var cb = e.target.closest('[data-plan]');
      if (!cb) return;
      var n = cb.getAttribute('data-plan'), i = st.plans.indexOf(n);
      if (cb.checked && i < 0) st.plans.push(n);
      if (!cb.checked && i >= 0) st.plans.splice(i, 1);
      drawPreview();
    });
    $('#ppvSw').addEventListener('change', function () { st.ppv = this.checked; $('#ppvBox').classList.toggle('hide', !st.ppv); drawPreview(); });
    $('#ppvPrice').addEventListener('input', function () { st.price = this.value; drawPreview(); });
    $('#schSw').addEventListener('change', function () {
      st.sched = this.checked;
      $('#schBox').classList.toggle('hide', !st.sched);
      if (st.sched && !st.when) {
        var d = new Date(); d.setDate(d.getDate() + 1); d.setHours(12, 0, 0, 0);
        st.when = toLocalInput(d); $('#schWhen').value = st.when;
      }
      drawPreview();
    });
    $('#schWhen').addEventListener('input', function () { st.when = this.value; });
    $('#tagBox').addEventListener('click', function (e) {
      var b = e.target.closest('[data-tag]');
      if (!b) return;
      var id = b.getAttribute('data-tag'), i = st.tags.indexOf(id);
      if (i >= 0) st.tags.splice(i, 1);
      else if (st.tags.length >= 3) { toast('ジャンルタグは3つまで選べます'); return; }
      else st.tags.push(id);
      drawTags();
    });

    /* 保存 */
    function submit(asDraft) {
      var text = st.text.trim();
      if (!st.media.length && !text) { toast('写真・動画か説明文のどちらかを入力してください'); return; }
      var status = asDraft ? 'draft' : 'published';
      if (!asDraft) {
        if (st.vis === 'members' && !st.plans.length) { toast('閲覧できるプランを1つ以上選んでください'); return; }
        if (st.ppv && !(+st.price >= 1)) { toast('単品販売の価格を入力してください'); return; }
        if (st.sched) {
          if (!st.when) { toast('予約する日時を選んでください'); return; }
          if (new Date(st.when).getTime() <= Date.now()) { toast('予約日時は今より未来の日時にしてください'); return; }
          status = 'scheduled';
        }
      }
      var cover = st.media[0], prev = src || {}, price = computePrice();
      var becamePublic = status === 'published' && prev.status && prev.status !== 'published';
      var p = {
        id: editId || ('u' + Date.now()),
        creator: ME,
        text: text,
        type: cover ? cover.type : 'photo',
        duration: cover && cover.dur ? cover.dur : undefined,
        thumb: cover && cover.src ? cover.src : null,
        img: cover && cover.asset ? cover.asset : (cover && cover.src ? (prev.img || 1) : ((text.length % 24) + 1)),
        mediaCount: st.media.length,
        vis: st.vis,
        planNames: st.vis === 'members' ? st.plans.slice() : [],
        ppv: st.ppv, ppvPrice: st.ppv ? Math.round(+st.price) : 0, price: price,
        tags: st.tags.slice(),
        status: status,
        scheduledAt: status === 'scheduled' ? new Date(st.when).toISOString() : null,
        likes: prev.likes || 0, comments: prev.comments || 0,
        createdAt: becamePublic ? Date.now() : (prev.createdAt || (src ? undefined : Date.now())),
        time: becamePublic ? 'たった今' : (prev.time || 'たった今')
      };
      var list = userPosts.filter(function (x) { return x.id !== p.id; });
      list.push(p);
      if (!store.set('myPosts', list)) { toast('ブラウザの保存容量が足りません。画像を減らすか、小さい画像にしてください'); return; }
      toast(editId ? '投稿を更新しました' : asDraft ? '下書きを保存しました' : status === 'scheduled' ? '予約投稿を設定しました（' + fmtDate(st.when) + '）' : '投稿しました（モック）');
      setTimeout(function () { location.href = 'post-manage.html'; }, 700);
    }
    $('#btnDraft').addEventListener('click', function () { submit(true); });
    $('#btnPost').addEventListener('click', function () { submit(false); });
  }

  /* ---- 投稿管理 ---- */
  function pagePostManage() {
    var list = mine();
    var cnt = {
      all: list.length,
      published: list.filter(function (p) { return statusOf(p) === 'published'; }).length,
      scheduled: list.filter(function (p) { return statusOf(p) === 'scheduled'; }).length,
      draft: list.filter(function (p) { return statusOf(p) === 'draft'; }).length
    };
    $('#main').innerHTML = html`${assumeNote()}
      ${tabsHtml([['all', TC.tabAll + ' ' + cnt.all], ['published', TC.tabPub + ' ' + cnt.published], ['scheduled', TC.tabSch + ' ' + cnt.scheduled], ['draft', TC.tabDraft + ' ' + cnt.draft]], 'all')}
      <ul class="mlist" id="ml"></ul>
      <div class="more-wrap"><button class="btn btn-ghost" id="resetBtn">${TC.resetSamples}</button></div>
      <a class="fab" href="post-new.html" aria-label="${TC.newPost}">${ico('plus')}</a>`;
    function row(p) {
      var s = statusOf(p);
      var cls = { published: 'st-pub', scheduled: 'st-sch', draft: 'st-draft' }[s];
      var txt = { published: TC.tabPub, scheduled: TC.tabSch, draft: TC.tabDraft }[s];
      var thumb = html`<span class="mthumb ph">${postImg(p, '', false)}</span>`;
      return html`<li class="mrow reveal">${s === 'published' ? html`<a href="post.html?id=${p.id}">${thumb}</a>` : thumb}
        <div class="mmid"><div><span class="st ${cls}">${txt}</span><span class="vis">${visLabel(p)}</span></div>
          <p class="mtext">${p.text || '（説明文なし）'}</p>
          <div class="mmeta"><span>${ico('heart', 'xs')} ${fmt(p.likes || 0)}</span><span>${ico('comment', 'xs')} ${fmt(p.comments || 0)}</span><span>${s === 'scheduled' ? fmtDate(p.scheduledAt) + ' 公開予定' : (p.time || '')}</span></div></div>
        <div class="macts"><a class="btn" href="post-new.html?edit=${p.id}">${TC.edit}</a><button class="btn btn-ghost" data-del="${p.id}">${TC.del}</button></div></li>`;
    }
    function draw(t) {
      var items = t === 'all' ? list : list.filter(function (p) { return statusOf(p) === t; });
      $('#ml').innerHTML = items.length ? String(html`${items.map(row)}`) : '<li class="empty">' + esc(TC.empty) + '</li>';
      observe($('#ml'));
    }
    onTabs($('.tabs'), 'data-tab', draw);
    draw('all');
    $('#ml').addEventListener('click', function (e) {
      var b = e.target.closest('[data-del]');
      if (!b) return;
      var id = b.getAttribute('data-del');
      confirmModal(TC.delConfirm, TC.delNote, TC.delDo, function () {
        var isSample = CFG.posts.some(function (p) { return p.id === id; });
        store.set('myPosts', userPosts.filter(function (x) { return x.id !== id; }));
        if (isSample) { var d = deletedIds.slice(); if (d.indexOf(id) < 0) d.push(id); store.set('deletedPosts', d); }
        toast('削除しました');
        setTimeout(function () { location.reload(); }, 500);
      });
    });
    $('#resetBtn').addEventListener('click', function () {
      confirmModal(TC.resetConfirm, '', TC.resetSamples, function () {
        store.set('myPosts', []); store.set('deletedPosts', []); store.set('myPlans', null);
        toast('元に戻しました');
        setTimeout(function () { location.reload(); }, 500);
      });
    });
  }

  /* ---- プラン設定 ---- */
  function pagePlanSettings() {
    var c = cById(ME);
    var plans = c.plans.map(function (x) { return { name: x.name, price: x.price, desc: x.desc }; });
    var min = CT.priceMin || 50, max = CT.priceMax || 50000;
    function persist() { c.plans = plans; return store.set('myPlans', plans); }
    $('#main').innerHTML = html`${assumeNote()}
      <div class="sec"><div class="sec-head"><h2 class="sec-title">${TC.planTitle}</h2><button class="btn btn-fill" id="addPlan">${ico('plus', 'xs')}${TC.planAdd}</button></div>
        <p class="hint">月額料金は${fmt(min)}〜${fmt(max)}円の範囲で設定できます（解説記事による目安）。0円の無料プランも作れます。</p></div>
      <div id="pl" class="plans"></div>`;
    function draw() {
      $('#pl').innerHTML = plans.length ? String(html`${plans.map(function (pl, i) {
        return html`<div class="plan"><div class="top"><b>${pl.name}</b><span class="price">${priceLabel(pl)}</span></div><p>${pl.desc}</p>
          <div style="display:flex;gap:8px"><button class="btn" data-pedit="${i}">${TC.edit}</button><button class="btn btn-ghost" data-pdel="${i}">${TC.planDelete}</button></div></div>`;
      })}`) : '<div class="empty">プランがありません。「' + esc(TC.planAdd) + '」から作成できます。</div>';
    }
    function form(i) {
      var cur = i == null ? { name: '', price: 500, desc: '' } : plans[i];
      var s = openSheet(html`<h3>${i == null ? TC.planAdd : TC.edit}</h3>
        <div class="field" style="margin-bottom:12px"><label>${TC.planName}</label><input class="inp" id="pn" maxlength="30" value="${cur.name}"></div>
        <div class="swrow" style="border-top:0"><div><b>${TC.planFree}</b></div><label class="switch"><input type="checkbox" id="pfree" ${cur.price === 0 ? 'checked' : ''}><i></i></label></div>
        <div class="field" id="ppw" style="margin-bottom:12px"><label>${TC.planPrice}</label><input class="inp" id="pp" type="number" inputmode="numeric" value="${cur.price}"></div>
        <div class="field" style="margin-bottom:14px"><label>${TC.planDesc}</label><input class="inp" id="pd" maxlength="80" value="${cur.desc}"></div>
        <button class="btn btn-fill btn-lg btn-block" id="ps">${TC.planSave}</button>`);
      var free = $('#pfree', s.el), ppw = $('#ppw', s.el);
      function sync() { ppw.classList.toggle('hide', free.checked); }
      free.addEventListener('change', sync);
      sync();
      $('#ps', s.el).addEventListener('click', function () {
        var name = $('#pn', s.el).value.trim(), desc = $('#pd', s.el).value.trim();
        var price = free.checked ? 0 : Math.round(+$('#pp', s.el).value);
        if (!name) { toast('プラン名を入力してください'); return; }
        if (!free.checked && !(price >= min && price <= max)) { toast('月額料金は' + fmt(min) + '〜' + fmt(max) + '円で入力してください'); return; }
        var obj = { name: name, price: price, desc: desc || '説明文は未設定です' };
        if (i == null) plans.push(obj); else plans[i] = obj;
        persist(); draw(); s.close(); toast('プランを保存しました');
      });
    }
    $('#addPlan').addEventListener('click', function () { form(null); });
    $('#pl').addEventListener('click', function (e) {
      var ed = e.target.closest('[data-pedit]'), de = e.target.closest('[data-pdel]');
      if (ed) form(parseInt(ed.getAttribute('data-pedit'), 10));
      if (de) {
        var i = parseInt(de.getAttribute('data-pdel'), 10);
        confirmModal('「' + plans[i].name + '」を削除しますか？', '', TC.delDo, function () { plans.splice(i, 1); persist(); draw(); toast('削除しました'); });
      }
    });
    draw();
  }

  /* ------------------------------------------------------------ boot */
  var RENDER = {
    home: pageHome, feed: pageFeed, unlimited: pageUnlimited, ranking: pageRanking, messages: pageMessages, account: pageAccount,
    search: pageSearch, genres: pageGenres, creator: pageCreator, post: pagePost, notifications: pageNotifications, login: pageLogin,
    'creator-home': pageCreatorHome, 'post-new': pagePostNew, 'post-manage': pagePostManage, 'plan-settings': pagePlanSettings
  };
  function boot() {
    if (/^studio/.test(page) && window.StudioBoot) {
      var md = resolveMode();
      applyTheme();
      window.StudioBoot({ CFG: CFG, A: A, html: html, raw: raw, esc: esc, fmt: fmt, fmtK: fmtK, ico: ico, ICONS: ICONS, img: img, toast: toast, openSheet: openSheet, openModal: openModal, $: $, $$: $$, params: params, store: store, setMode: setMode, mode: md, observe: observe, assumeTag: assumeTag, enableDrag: enableDrag });
      setMode(md);
      observe();
      return;
    }
    buildShell(TITLES[page] || CFG.site.name);
    (RENDER[page] || pageHome)();
    observe();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
