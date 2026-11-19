/* Agent Studio（画像・動画・音楽・キャラクター制作のモック）。app.js から StudioBoot(FC) で呼ばれます。 */
(function () {
  'use strict';
  window.StudioBoot = function (FC) {
    var CFG = FC.CFG, S = CFG.studio, A = FC.A, html = FC.html, raw = FC.raw, ico = FC.ico, fmt = FC.fmt, $ = FC.$, $$ = FC.$$, params = FC.params, toast = FC.toast;
    var page = document.body.getAttribute('data-page');
    var tag = FC.assumeTag;

    /* アイコン追加（Feather 系） */
    var X = {
      menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
      image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
      video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/>',
      music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
      users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
      down: '<polyline points="6 9 12 15 18 9"/>',
      copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
      download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
      upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
      spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z"/>',
      trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
      layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>'
    };
    for (var k in X) FC.ICONS[k] = X[k];

    /* ---------- data helpers ---------- */
    var KIND = { image: '画像', video: '動画', music: '音楽', llm: 'LLM' };
    function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
    function insp(id) { return byId(S.inspirations, id); }
    function model(id) { return byId(S.models, id); }
    function chara(id) { return byId(S.characters, id); }
    function ph(kind, n, alt) { return html`<span class="ph">${FC.img(kind, n, alt || '')}</span>`; }
    function clamp(n) { return n; }
    function q(name) { return params.get(name); }

    /* ---------- menu ---------- */
    var MENU = [
      { key: 'inspiration', label: 'インスピレーション', icon: 'spark', href: 'studio.html', note: 'Agent',
        subs: [['all', 'すべて', 'studio.html'], ['image', '画像', 'studio.html?cat=image'], ['video', '動画', 'studio.html?cat=video'], ['music', '音楽', 'studio.html?cat=music'], ['llm', 'LLM', 'studio.html?cat=llm']] },
      { key: 'models', label: 'モデル一覧・ランキング', icon: 'layers', href: 'studio-models.html',
        subs: [['list', 'モデルリスト', 'studio-models.html'], ['rank', 'モデルランキング', 'studio-models.html?tab=rank']] },
      { section: '作成' },
      { key: 'image', label: '画像', icon: 'image', href: 'studio-image.html',
        subs: [['create', '画像生成', 'studio-image.html'], ['history', '履歴', 'studio-image.html?tab=history']] },
      { key: 'video', label: '動画', icon: 'video', href: 'studio-video.html',
        subs: [['create', '動画生成', 'studio-video.html'], ['history', '履歴', 'studio-video.html?tab=history']] },
      { key: 'music', label: '音楽', icon: 'music', href: 'studio-music.html',
        subs: [['create', '楽曲生成', 'studio-music.html'], ['history', '履歴', 'studio-music.html?tab=history']] },
      { key: 'characters', label: 'キャラクター', icon: 'users', href: 'studio-characters.html', note: 'Beta',
        subs: [['discover', 'ディスカバリー', 'studio-characters.html'], ['mine', 'マイキャラクター', 'studio-characters.html?tab=mine'], ['fav', 'お気に入り', 'studio-characters.html?tab=fav']] }
    ];

    /* いま開いているページ → [メニュー, サブ, パンくず] */
    var ctx = (function () {
      var cat = q('cat') || 'all', tab = q('tab'), id = q('id');
      var home = ['Agent Studio', 'studio.html'];
      switch (page) {
        case 'studio': return { sec: 'inspiration', sub: cat, crumbs: [home, ['インスピレーション', 'studio.html']].concat(cat !== 'all' ? [[KIND[cat] || '', 'studio.html?cat=' + cat]] : []), title: 'インスピレーション' };
        case 'studio-detail':
          var it = insp(id) || S.inspirations[0], hist = q('from') === 'history';
          if (hist) return { sec: it.kind, sub: 'history', crumbs: [home, [KIND[it.kind], 'studio-' + it.kind + '.html'], ['履歴', 'studio-' + it.kind + '.html?tab=history'], ['作品詳細']], title: '作品詳細' };
          return { sec: 'inspiration', sub: it.kind, crumbs: [home, ['インスピレーション', 'studio.html'], [KIND[it.kind], 'studio.html?cat=' + it.kind], ['詳細']], title: 'インスピレーション詳細' };
        case 'studio-models': return { sec: 'models', sub: tab === 'rank' ? 'rank' : 'list', crumbs: [home, ['モデル一覧・ランキング', 'studio-models.html'], [tab === 'rank' ? 'モデルランキング' : 'モデルリスト']], title: 'モデル一覧・ランキング' };
        case 'studio-model': return { sec: 'models', sub: 'list', crumbs: [home, ['モデル一覧・ランキング', 'studio-models.html'], ['モデルリスト', 'studio-models.html'], ['モデル詳細']], title: 'モデル詳細' };
        case 'studio-image': case 'studio-video': case 'studio-music':
          var kd = page.replace('studio-', '');
          return { sec: kd, sub: tab === 'history' ? 'history' : 'create', crumbs: [home, [KIND[kd], 'studio-' + kd + '.html'], [tab === 'history' ? '履歴' : (kd === 'music' ? '楽曲生成' : KIND[kd] + '生成')]], title: KIND[kd] + (tab === 'history' ? 'の履歴' : '生成') };
        case 'studio-characters': return { sec: 'characters', sub: tab || 'discover', crumbs: [home, ['キャラクター', 'studio-characters.html'], [{ mine: 'マイキャラクター', fav: 'お気に入り' }[tab] || 'ディスカバリー']], title: 'キャラクター' };
        case 'studio-character': return { sec: 'characters', sub: 'discover', crumbs: [home, ['キャラクター', 'studio-characters.html'], ['ディスカバリー', 'studio-characters.html'], ['キャラクター詳細']], title: 'キャラクター詳細' };
      }
      return { sec: 'inspiration', sub: 'all', crumbs: [home], title: S.name };
    })();
    var isTop = page === 'studio' && !q('cat');

    function sideHtml() {
      var open = JSON.parse((function () { try { return localStorage.getItem('fcm:stOpen') || '{}'; } catch (e) { return '{}'; } })());
      return html`<aside class="st-side" id="stSide">
        <div class="st-brand"><a class="logo" href="studio.html"><img src="${A.logo.wide}" alt="${CFG.site.name}"></a><span class="st-name">Studio</span><button class="st-x" data-st-close aria-label="閉じる">${ico('x')}</button></div>
        <a class="st-return" href="post-new.html">${ico('left', 'sm')}<span>fancloud（新規投稿）に戻る</span></a>
        <nav class="st-nav">${MENU.map(function (m) {
          if (m.section) return html`<div class="st-sec">${m.section}</div>`;
          var isSec = m.key === ctx.sec, on = isSec || open[m.key];
          return html`<div class="st-grp ${on ? 'open' : ''} ${isSec ? 'cur' : ''}" data-grp="${m.key}">
            <div class="st-row"><a class="st-item" href="${m.href}">${ico(m.icon)}<span>${m.label}</span>${m.note ? html`<em>${m.note}</em>` : ''}</a><button class="st-chev" data-st-toggle="${m.key}" aria-label="開閉">${ico('down', 'sm')}</button></div>
            <div class="st-sub">${m.subs.map(function (s) { return html`<a href="${s[2]}" class="${isSec && ctx.sub === s[0] ? 'active' : ''}">${s[1]}</a>`; })}</div></div>`;
        })}</nav></aside>`;
    }

    function crumbsHtml() {
      return html`<nav class="st-crumbs" aria-label="パンくず">${ctx.crumbs.map(function (c, i) {
        var last = i === ctx.crumbs.length - 1;
        return html`${i ? html`<i>›</i>` : ''}${(!last && c[1]) ? html`<a href="${c[1]}">${c[0]}</a>` : html`<span>${c[0]}</span>`}`;
      })}</nav>`;
    }

    function buildShell() {
      var mode = FC.mode;
      document.body.classList.add('mode-' + mode, 'st-body');
      document.title = ctx.title + ' | ' + S.name + ' | ' + CFG.site.name;
      var sw = html`<div class="mode-switch" role="group" aria-label="表示切り替え"><button class="ms-btn" data-mode="mobile">${ico('phone')}スマホ</button><button class="ms-btn" data-mode="pc">${ico('monitor')}PC</button></div>`;
      $('#app').innerHTML = html`<div class="st-app">${sideHtml()}<div class="st-back" data-st-close></div>
        <div class="st-col"><header class="st-top"><button class="iconbtn st-menu" data-st-open aria-label="メニュー">${ico('menu')}</button>
          ${isTop ? '' : html`<button class="iconbtn" data-act="back" aria-label="戻る">${ico('left')}</button>`}
          <h1 class="title">${isTop ? S.name : ctx.title}</h1><span class="spacer"></span>
          <a class="btn st-topbtn" href="post-new.html">${ico("left", "xs")}fancloudに戻る</a></header>
          <main id="main" class="st-main">${crumbsHtml()}<div id="pg"></div></main></div></div>${sw}<div id="overlay"></div><div id="toast" class="toast" role="status"></div>`;
      FC.setMode(mode);
    }

    /* ---------- cards ---------- */
    function kindBadge(it) { return html`<span class="kb k-${it.kind}">${KIND[it.kind]}</span>`; }
    function inspCard(it, from) {
      var href = 'studio-detail.html?id=' + it.id + (from ? '&from=' + from : '');
      if (it.kind === 'llm') {
        return html`<a class="ic ic-llm reveal" href="${href}">${kindBadge(it)}<div class="bubble">${it.prompt}</div><div class="bubble bot">${it.reply.split('\n')[0]}</div><b>${it.title}</b><small>${model(it.model).name}</small></a>`;
      }
      return html`<a class="ic reveal" href="${href}"><div class="thumb">${ph('posts', it.img, it.title)}${kindBadge(it)}${it.dur ? html`<span class="chip br">${ico(it.kind === 'music' ? 'music' : 'play-solid', 'xs fill')}${it.dur}</span>` : ''}</div>
        <b>${it.title}</b><small><span>${it.user}</span><span>${ico('heart', 'xs')}${fmt(it.likes)}</span></small></a>`;
    }
    function modelCard(m) {
      return html`<div class="mc reveal"><div class="mc-top"><span class="mc-logo">${m.provider.charAt(0)}</span><div><small>${m.provider}</small><b>${m.name}</b></div>
        <span class="pl ${m.plan}">${m.plan === 'free' ? '無料版' : '有料版'}</span></div>
        <p>${m.desc}</p>
        <div class="tags"><span class="tg t-${m.type}">${KIND[m.type]}</span>${m.rec ? html`<span class="tg rec">おすすめ</span>` : ''}${m.purpose.map(function (p) { return html`<span class="tg">${p}</span>`; })}${m.len ? html`<span class="tg">${m.len}</span>` : ''}</div>
        <div class="mc-act"><a class="btn" href="studio-model.html?id=${m.id}">詳細</a><button class="btn" data-toast="API 連携はモックでは未対応です">API</button><a class="btn btn-go" href="${tryHref(m)}">今すぐ試す</a></div></div>`;
    }
    function tryHref(m) { return m.type === 'llm' ? 'studio.html?cat=llm' : 'studio-' + m.type + '.html?model=' + m.id; }
    function charCard(c) {
      return html`<a class="cc reveal" href="studio-character.html?id=${c.id}"><div class="thumb">${ph('avatars', c.img, c.name)}<span class="chip tl st">${c.style}</span></div>
        <b>${c.name}</b><small><span>${c.user}</span><span>${ico('heart', 'xs')}${fmt(c.likes)}</span></small></a>`;
    }
    function pills(items, cur, hrefFn) {
      return html`<div class="st-pills">${items.map(function (it) { return html`<a class="sp ${it[0] === cur ? 'on' : ''}" href="${hrefFn(it[0])}">${it[1]}</a>`; })}</div>`;
    }

    /* ================= pages ================= */
    /* インスピレーション（Agent） */
    function pageHome() {
      var cat = q('cat') || 'all';
      var list = S.inspirations.filter(function (i) { return cat === 'all' || i.kind === cat; });
      var pillsHtml = pills([['all', 'すべて'], ['image', '画像'], ['video', '動画'], ['music', '音楽'], ['llm', 'LLM']], cat, function (k) { return k === 'all' ? 'studio.html' : 'studio.html?cat=' + k; });
      var grid = html`${pillsHtml}<div class="st-head"><h2>${cat === 'all' ? 'みんなの作品・プロンプト' : KIND[cat]}</h2><span class="cnt">${list.length}件</span></div>
        <div class="ic-grid">${list.map(function (i) { return inspCard(i); })}</div>`;
      if (cat !== 'all') { $('#pg').innerHTML = grid; return; }

      var feat = S.models.filter(function (m) { return m.rec; }).slice(0, 2);
      var featImg = { 'aurora-motion': 6, 'aurora-image': 1 };
      $('#pg').innerHTML = html`
        <section class="hero2"><h2>今日は何をつくりますか？<i class="spk">${ico('spark', 'sm')}</i></h2>
          <p>画像・動画・音楽・キャラクター・文章を、これひとつで。${tag()}</p>
          <div id="hm"></div></section>
        <div class="st-head"><h2>${ico('layers', 'sm')} 機能</h2></div>
        <div class="ft-row">
          <a class="ft ft-promo" href="post-new.html"><b>作ったものは、そのまま投稿へ</b><small>生成した画像・動画をワンタップで新規投稿に使えます</small><span class="btn">新規投稿へ戻る</span></a>
          ${feat.map(function (m) { return html`<div class="ft"><span class="ph">${FC.img('posts', featImg[m.id] || 1, m.name)}</span><div class="ov"><em>FEATURE</em><b>${m.name}</b><small>${m.desc}</small>
            <div class="ft-act"><a class="btn btn-grad" href="${tryHref(m)}">${ico('play-solid', 'xs fill')}今すぐ試す</a><a class="btn" href="studio-model.html?id=${m.id}">詳細</a></div></div></div>`; })}
        </div>
        <div class="st-head"><h2>${ico('grid', 'sm')} かんたん作成</h2><a href="studio.html?cat=image">もっと見る ${ico('right', 'xs')}</a></div>
        <div class="tp-row">${S.templates.map(function (t) { return html`<a class="tp" href="studio-${t.kind}.html?prompt=${encodeURIComponent(t.title)}"><span class="ph">${FC.img('posts', t.img, t.title)}</span><b>${t.title}</b><small>${t.desc}</small></a>`; })}</div>
        ${grid}`;

      /* 生成パネル（画像/動画/音楽/Agent） */
      var hs = { mode: q('agent') ? 'agent' : 'image', model: { image: 'aurora-image', video: 'aurora-motion', music: 'echo-music', agent: 'sage-chat' }, ratio: '16:9', wm: true, text: '' };
      hs.model.agent = 'sage-llm';
      var HINT = { image: 'つくりたい画像を入力してください。\n参考画像は @ で呼び出せます（例：@image1 の人物が @image2 の街に立っている）。', video: 'つくりたい動画を入力してください。\n参考画像は @ で呼び出せます（例：@image1 が走り出す）。', music: 'つくりたい曲のイメージを入力してください。\n例：朝の静かな時間に合う、ゆったりしたローファイ。', agent: 'Agent への相談内容を入力してください。\n例：朝の山の写真に合うキャプションを3案考えて。' };
      function mtype(m) { return m === 'agent' ? 'llm' : m; }
      function drawHm() {
        var old = $('#hmIn'); if (old) hs.text = old.value;
        var m = hs.mode, ms = S.models.filter(function (x) { return x.type === mtype(m); }), vis = m === 'image' || m === 'video';
        var ratios = (S.ratios[m] || []).filter(function (r) { return r !== 'カスタム' && r !== '自動'; });
        $('#hm').innerHTML = String(html`<div class="hm-tabs">${[['image', '画像', 'image'], ['video', '動画', 'video'], ['music', '音楽', 'music'], ['agent', 'Agent', 'message']].map(function (t) {
            return html`<button type="button" class="${t[0] === m ? 'on' : ''}" data-hm-mode="${t[0]}">${ico(t[2], 'sm')}${t[1]}</button>`; })}</div>
          <div class="hm-card"><div class="hm-top">${m !== 'music' ? html`<button type="button" class="hm-ref" data-toast="参照画像のアップロードはモックでは未対応です">${ico('plus')}<small>参照（任意）</small></button>` : ''}
            <textarea id="hmIn" rows="4" placeholder="${HINT[m]}">${hs.text}</textarea></div>
            <div class="hm-bar"><label class="hm-sel"><select data-hm="model">${ms.map(function (x) { return html`<option value="${x.id}" ${x.id === hs.model[m] ? 'selected' : ''}>${x.name}</option>`; })}</select></label>
              ${vis ? html`<label class="hm-sel"><select data-hm="ratio">${ratios.map(function (r) { return html`<option ${r === hs.ratio ? 'selected' : ''}>${r}</option>`; })}</select></label>` : ''}
              <span class="spacer"></span>
              ${vis ? html`<label class="hm-wm">透かし<span class="switch"><input type="checkbox" data-hm="wm" ${hs.wm ? 'checked' : ''}><i></i></span></label>` : ''}
              ${m !== 'agent' ? html`<button type="button" class="hm-style" data-toast="スタイルの選択はモックでは見た目のみです">${ico('spark', 'xs')}おまかせ</button>` : ''}
              <button type="button" class="btn btn-grad hm-go" id="hmGo">${m === 'agent' ? 'Agent に相談' : html`今すぐ生成！<small>${ico('spark', 'xs')}${S.credits[m] || 1}</small>`}</button></div></div>`);
      }
      drawHm();
      var box = $('#hm');
      box.addEventListener('click', function (e) {
        var t = e.target.closest('[data-hm-mode]');
        if (t) { hs.mode = t.getAttribute('data-hm-mode'); drawHm(); return; }
        if (e.target.closest('#hmGo')) {
          var v = $('#hmIn').value.trim();
          if (!v) { toast('つくりたい内容を入力してください'); return; }
          if (hs.mode === 'agent') { toast('Agent への相談はモックでは未対応です（LLM の作品例を見られます）'); return; }
          location.href = 'studio-' + hs.mode + '.html?prompt=' + encodeURIComponent(v) + '&model=' + hs.model[hs.mode];
        }
      });
      box.addEventListener('change', function (e) {
        var d = e.target.getAttribute('data-hm'); if (!d) return;
        if (d === 'model') hs.model[hs.mode] = e.target.value; else if (d === 'ratio') hs.ratio = e.target.value; else if (d === 'wm') hs.wm = e.target.checked;
      });
      FC.enableDrag && $$('.tp-row,.ft-row').forEach(FC.enableDrag);
      if (q('agent')) setTimeout(function () { var h = $('#hmIn'); if (h) { h.scrollIntoView({ block: 'center' }); h.focus({ preventScroll: true }); } }, 150);
    }

    /* インスピレーション詳細 / 作品詳細（L2） */
    function pageDetail() {
      var it = insp(q('id')) || S.inspirations[0], hist = q('from') === 'history', m = model(it.model);
      var target = it.kind === 'llm' ? 'studio.html?cat=llm' : 'studio-' + it.kind + '.html?prompt=' + encodeURIComponent(it.prompt) + '&model=' + it.model;
      var rel = S.inspirations.filter(function (x) { return x.kind === it.kind && x.id !== it.id; }).slice(0, 6);
      $('#pg').innerHTML = html`<div class="dt">
        <div class="dt-media">${it.kind === 'llm'
          ? html`<div class="st-chat"><div class="bubble me">${it.prompt}</div><div class="bubble bot pre">${it.reply}</div></div>`
          : html`<div class="dt-img ${it.kind}" style="${it.ratio && it.kind !== 'music' ? 'aspect-ratio:' + it.ratio.replace(':', '/') : ''}">${ph('posts', it.img, it.title)}
            ${it.kind === 'video' ? html`<button class="playbtn" data-toast="モックでは再生されません">${ico('play-solid', 'fill')}</button>` : ''}
            ${it.kind === 'music' ? html`<div class="player"><button class="playbtn sm" data-toast="モックでは再生されません">${ico('play-solid', 'fill')}</button><div class="bar"><i></i></div><small>${it.dur}</small></div>` : ''}</div>`}</div>
        <div class="dt-info"><div>${kindBadge(it)}</div><h2>${it.title}</h2>
          <div class="who"><span class="av ph">${FC.img('avatars', 1, '')}</span>${it.user}<span class="lk">${ico('heart', 'xs')}${fmt(it.likes)}</span></div>
          <h3>プロンプト</h3><div class="promptbox"><p id="pt">${it.prompt}</p><button class="btn" data-copy>${ico('copy', 'xs')}コピー</button></div>
          <div class="kv"><div><span>モデル</span><span><a href="studio-model.html?id=${m.id}">${m.name}</a></span></div>
            ${it.ratio ? html`<div><span>アスペクト比</span><span>${it.ratio}</span></div>` : ''}${it.dur ? html`<div><span>長さ</span><span>${it.dur}</span></div>` : ''}
            <div><span>種類</span><span>${KIND[it.kind]}</span></div></div>
          <div class="dt-act">${hist ? html`<a class="btn btn-fill btn-lg" href="post-new.html">投稿に使う</a><button class="btn btn-lg" data-toast="ダウンロードはモックでは未対応です">${ico('download', 'sm')}保存</button><button class="btn btn-lg" data-toast="削除はモックでは未対応です">削除</button>`
            : html`<a class="btn btn-grad btn-lg" href="${target}">${it.kind === 'llm' ? 'Agent で試す' : 'このプロンプトで作る'}</a><a class="btn btn-lg" href="post-new.html">投稿に使う</a>`}</div></div></div>
        <div class="st-head"><h2>${KIND[it.kind]}の関連</h2></div>
        <div class="ic-grid">${rel.map(function (i) { return inspCard(i); })}</div>`;
      $('[data-copy]').addEventListener('click', function () {
        var t = $('#pt').textContent;
        try { navigator.clipboard.writeText(t).then(function () { toast('プロンプトをコピーしました'); }, function () { toast('コピーしました（モック）'); }); } catch (e) { toast('コピーしました（モック）'); }
      });
    }

    /* モデル一覧・ランキング（L1） */
    var METHODS = [['t2i', 'テキスト→画像', 'image'], ['i2i', '画像→画像', 'image'], ['t2v', 'テキスト→動画', 'video'], ['i2v', '画像→動画', 'video'], ['music', '音楽生成', 'music'], ['chat', 'チャット', 'llm']];
    function caps(m) { return { text: m.id === 'aurora-image' || m.id === 'nova-image', audio: m.type === 'music' || m.id === 'aurora-motion' || m.id === 'kite-motion', commercial: m.plan === 'paid' }; }
    function uniqTokens(key, sep) { var o = []; S.models.forEach(function (m) { String(m[key] || '').split(sep).forEach(function (t) { t = t.trim(); if (t && o.indexOf(t) < 0) o.push(t); }); }); return o; }
    function pageModels() {
      var tab = q('tab') === 'rank' ? 'rank' : 'list';
      $('#pg').innerHTML = html`<div class="mdl-tabs"><div class="seg">${[['list', 'モデルリスト', 'studio-models.html'], ['rank', 'モデルランキング', 'studio-models.html?tab=rank']].map(function (t) { return html`<a class="${t[0] === tab ? 'on' : ''}" href="${t[2]}">${t[1]}</a>`; })}</div></div><div id="mbody"></div>`;
      if (tab === 'rank') drawRank(); else drawList();
    }
    function drawList() {
      var f = { col: 'all', method: '', purpose: '', style: '', res: '', len: '', plan: 'all', text: '', text_: false, audio: false, commercial: false };
      var providers = []; S.models.forEach(function (m) { if (providers.indexOf(m.provider) < 0) providers.push(m.provider); });
      var feats = S.models.filter(function (m) { return m.rec; });
      var featImg = { 'aurora-motion': 6, 'aurora-image': 1, 'nova-image': 7, 'echo-music': 14, 'sage-llm': 5 };
      function sel(label, key, opts) { return html`<div class="fsel"><label>${label}</label><select data-fs="${key}"><option value="">全て選択</option>${opts.map(function (o) { return html`<option value="${Array.isArray(o) ? o[0] : o}">${Array.isArray(o) ? o[1] : o}</option>`; })}</select></div>`; }
      $('#mbody').innerHTML = String(html`<div class="mdl">
        <aside class="mdl-col"><div class="mc-h">コレクション</div>
          <button class="mcl on" data-col="all">${ico('home', 'sm')}すべてのモデル</button><button class="mcl" data-col="rec">${ico('star', 'sm')}おすすめ</button>
          <div class="mc-h">トップベンダー</div>${providers.map(function (p) { return html`<button class="mcl" data-col="${p}"><span class="mc-logo sm">${p.charAt(0)}</span>${p}<em>${S.models.filter(function (m) { return m.provider === p; }).length}</em></button>`; })}</aside>
        <div class="mdl-main">
          <div class="ft-row">${feats.map(function (m) { return html`<div class="ft"><span class="ph">${FC.img('posts', featImg[m.id] || 1, m.name)}</span><div class="ov"><em>FEATURE</em><b>${m.name}</b><small>${m.desc}</small>
            <div class="ft-act"><a class="btn btn-grad" href="${tryHref(m)}">${ico('play-solid', 'xs fill')}今すぐ試す</a><button class="btn" data-toast="API 連携はモックでは未対応です">API</button><a class="btn" href="studio-model.html?id=${m.id}">詳細</a></div></div></div>`; })}</div>
          <div class="fgrid">${sel('生成方法', 'method', METHODS.map(function (x) { return [x[0], x[1]]; }))}${sel('使用目的', 'purpose', uniqTokens('purpose', ','))}
            ${sel('スタイル', 'style', ['イラスト', '写真', '映像', 'スタンプ', 'ポスター'])}${sel('解像度', 'res', uniqTokens('res', '/'))}${sel('長さ', 'len', (function () { var o = []; S.models.forEach(function (m) { if (m.len && o.indexOf(m.len) < 0) o.push(m.len); }); return o; })())}
            ${sel('プラン', 'plan', [['free', '無料版'], ['paid', '有料版']])}
            <div class="fsel wide"><label>検索</label><input class="inp" id="msearch" type="search" placeholder="モデル・スタイル・機能を検索"></div></div>
          <div class="cap-row">${[['text_', 'テキストに最適'], ['audio', '音声対応'], ['commercial', '商用利用可']].map(function (c) { return html`<button type="button" class="capb" data-cap="${c[0]}">${c[1]}</button>`; })}${tag()}</div>
          <div id="mres"></div></div></div>`);
      function match(m) {
        var c = caps(m);
        if (f.col === 'rec' && !m.rec) return false;
        if (f.col !== 'all' && f.col !== 'rec' && m.provider !== f.col) return false;
        if (f.method) { var me = METHODS.filter(function (x) { return x[0] === f.method; })[0]; if (m.type !== me[2]) return false; }
        if (f.purpose && m.purpose.indexOf(f.purpose) < 0) return false;
        if (f.style && m.purpose.indexOf(f.style) < 0) return false;
        if (f.res && String(m.res).indexOf(f.res) < 0) return false;
        if (f.len && m.len !== f.len) return false;
        if (f.plan !== 'all' && m.plan !== f.plan) return false;
        if (f.text && (m.name + m.provider + m.desc + m.purpose.join('')).toLowerCase().indexOf(f.text.toLowerCase()) < 0) return false;
        if (f.text_ && !c.text) return false; if (f.audio && !c.audio) return false; if (f.commercial && !c.commercial) return false;
        return true;
      }
      function drawRes() {
        var list = S.models.filter(match), groups = {}; list.forEach(function (m) { (groups[m.provider] = groups[m.provider] || []).push(m); });
        $('#mres').innerHTML = String(list.length ? html`${Object.keys(groups).map(function (g) { return html`<div class="st-head"><h2><span class="mc-logo sm">${g.charAt(0)}</span> ${g}</h2><span class="cnt">${groups[g].length}</span></div><div class="mc-grid">${groups[g].map(modelCard)}</div>`; })}` : html`<div class="empty">条件に合うモデルはありません</div>`);
        FC.observe($('#mres'));
      }
      drawRes();
      var body = $('#mbody');
      body.addEventListener('click', function (e) {
        var c = e.target.closest('[data-col]'), p = e.target.closest('[data-cap]');
        if (c) { f.col = c.getAttribute('data-col'); $$('.mcl', body).forEach(function (x) { x.classList.toggle('on', x === c); }); drawRes(); }
        if (p) { var k = p.getAttribute('data-cap'); f[k] = !f[k]; p.classList.toggle('on', f[k]); drawRes(); }
      });
      body.addEventListener('change', function (e) { var s = e.target.closest('[data-fs]'); if (s) { f[s.getAttribute('data-fs')] = s.value || (s.getAttribute('data-fs') === 'plan' ? 'all' : ''); drawRes(); } });
      body.addEventListener('input', function (e) { if (e.target.id === 'msearch') { f.text = e.target.value; drawRes(); } });
    }
    /* ランキング：利用シェアのトレンド（ダミーの集計） */
    function drawRank() {
      var COLORS = ['#7a3cff', '#2d7ff9', '#1f9d6b', '#e08a00', '#ff3d8b', '#8a94a6'];
      var DAYS = 30;
      function rnd(seed) { var x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }
      function panel(type, title, dateEnd) {
        var ms = S.models.filter(function (m) { return m.type === type; }).sort(function (a, b) { return b.score - a.score; });
        var series = ms.map(function (m, mi) { var o = []; for (var d = 0; d < DAYS; d++) o.push(Math.max(2, m.score * (0.5 + rnd(mi * 40 + d + (type === 'video' ? 500 : 0)) * 0.9) * (0.7 + 0.5 * rnd(d + 7 + (type === 'video' ? 300 : 0))))); return o; });
        var totals = []; for (var d = 0; d < DAYS; d++) { var t = 0; series.forEach(function (s) { t += s[d]; }); totals.push(t); }
        var max = Math.max.apply(null, totals), W = 600, H = 240, pl = 8, pb = 4, bw = (W - pl) / DAYS;
        var bars = '';
        for (var d2 = 0; d2 < DAYS; d2++) {
          var y = H - pb;
          series.forEach(function (s, mi) { var h = s[d2] / max * (H - 20); y -= h; bars += '<rect x="' + (pl + d2 * bw + 1.5) + '" y="' + y.toFixed(1) + '" width="' + (bw - 3) + '" height="' + h.toFixed(1) + '" fill="' + COLORS[Math.min(mi, COLORS.length - 1)] + '" rx="1"/>'; });
        }
        var today = series.map(function (s) { return s[DAYS - 1]; }), sum = today.reduce(function (a, b) { return a + b; }, 0);
        var rows = ms.map(function (m, i) { return { m: m, pct: today[i] / sum * 100, c: COLORS[Math.min(i, COLORS.length - 1)] }; }).sort(function (a, b) { return b.pct - a.pct; });
        return html`<section class="rk-panel"><div class="rk-head"><h2>${title}</h2><small>※30分ごとに更新（ダミー）</small></div>
          <svg class="rk-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${title}">${raw(bars)}</svg>
          <div class="rk-axis"><span>${dateEnd[0]}</span><span>${dateEnd[1]}</span></div>
          <div class="rk-table"><div class="rk-th"><span>本日の順位</span><span>モデル</span><span>シェア</span><span>操作</span></div>
            ${rows.map(function (r, i) { return html`<div class="rk-tr"><span class="no n${i < 3 ? i + 1 : ''}">${i + 1}</span>
              <a class="rk-m" href="studio-model.html?id=${r.m.id}"><i style="background:${r.c}"></i>${r.m.name}</a><span class="pct">${r.pct.toFixed(2)}%</span>
              <span class="rk-a"><a class="btn btn-go" href="${tryHref(r.m)}">試す</a></span></div>`; })}</div></section>`;
      }
      $('#mbody').innerHTML = String(html`<div class="rk-top"><h2>モデルランキング</h2><p>人気のモデルを、利用シェアから見つけましょう。${tag()}</p></div>
        <div class="rk-wrap">${panel('image', '画像生成トレンド', ['10月21日', '11月19日'])}${panel('video', '動画生成トレンド', ['10月21日', '11月19日'])}</div>`);
    }

    /* モデル詳細（L2） */
    function pageModel() {
      var m = model(q('id')) || S.models[0];
      var samples = S.inspirations.filter(function (i) { return i.model === m.id; });
      if (!samples.length) samples = S.inspirations.filter(function (i) { return i.kind === m.type; }).slice(0, 4);
      $('#pg').innerHTML = html`<div class="md-head"><span class="mc-logo lg">${m.provider.charAt(0)}</span><div><small>${m.provider}</small><h2>${m.name}</h2>
        <div class="tags"><span class="tg t-${m.type}">${KIND[m.type]}</span><span class="pl ${m.plan}">${m.plan === 'free' ? '無料版' : '有料版'}</span>${m.rec ? html`<span class="tg rec">おすすめ</span>` : ''}</div></div></div>
        <p class="md-desc">${m.desc}。${tag()}</p>
        <div class="kv"><div><span>生成の種類</span><span>${KIND[m.type]}</span></div><div><span>使用目的</span><span>${m.purpose.join('・')}</span></div>
          ${m.len ? html`<div><span>長さ</span><span>${m.len}</span></div>` : ''}${m.res ? html`<div><span>解像度</span><span>${m.res}</span></div>` : ''}
          <div><span>消費クレジット</span><span>${m.credits}</span></div><div><span>ランキングスコア</span><span>${m.score}pt</span></div></div>
        <div class="dt-act"><a class="btn btn-grad btn-lg" href="${tryHref(m)}">今すぐ試す</a><button class="btn btn-lg" data-toast="API 連携はモックでは未対応です">API</button></div>
        <div class="st-head"><h2>このモデルの作品例</h2></div><div class="ic-grid">${samples.map(function (i) { return inspCard(i); })}</div>`;
    }

    /* ---- 作成ページ（画像 / 動画 / 音楽） ---- */
    function pageCreate() {
      var kind = page.replace('studio-', ''), tab = q('tab') === 'history' ? 'history' : 'create';
      $('#pg').innerHTML = html`${pills([['create', kind === 'music' ? '楽曲生成' : KIND[kind] + '生成'], ['history', '履歴']], tab, function (k) { return 'studio-' + kind + '.html' + (k === 'history' ? '?tab=history' : ''); })}<div id="cbody"></div>`;
      if (tab === 'history') { drawHistory(kind); return; }
      drawCreate(kind);
    }
    function drawHistory(kind) {
      var ids = (S.history[kind] || []);
      $('#cbody').innerHTML = String(ids.length ? html`<div class="ic-grid">${ids.map(function (id) { return inspCard(insp(id), 'history'); })}</div>` : html`<div class="empty">まだ作品がありません</div>`);
      FC.observe($('#cbody'));
    }
    function sw(id, label, on, hint) {
      return html`<div class="swrow"><div><b>${label}</b>${hint ? html`<small>${hint}</small>` : ''}</div><label class="switch"><input type="checkbox" id="${id}" ${on ? 'checked' : ''}><i></i></label></div>`;
    }
    function drawCreate(kind) {
      var models = S.models.filter(function (m) { return m.type === kind; });
      var st = { ref: 'none', mode: 'auto', model: q('model') && model(q('model')) && model(q('model')).type === kind ? q('model') : models[0].id, ratio: kind === 'image' ? '1:1' : '自動', res: kind === 'image' ? '1K' : '720p', n: 1, dur: '5s', adv: false, vocal: 'vocal', len: 'clip', styleSel: 'おまかせ' };
      var prompt0 = q('prompt') || '';
      var results = null;

      function field(label, inner, extra) { return html`<div class="cf"><label>${label}${extra || ''}</label>${inner}</div>`; }
      function chips(items, cur, attr) { return html`<div class="chips">${items.map(function (it) { return html`<button type="button" class="ag-chip ${String(it) === String(cur) ? 'on' : ''}" ${raw(attr)}="${it}">${it}</button>`; })}</div>`; }
      function credit() { return (S.credits[kind] || 1) * (kind === 'music' ? 1 : st.n); }

      function formHtml() {
        if (kind === 'music') {
          return html`<div class="seg" id="advSeg"><button type="button" data-adv="0" class="${st.adv ? '' : 'on'}">通常</button><button type="button" data-adv="1" class="${st.adv ? 'on' : ''}">高度な設定</button></div>
            ${field('曲のテーマ', html`<input class="inp" id="f-theme" placeholder="例：朝の静かな時間" value="${prompt0}">`)}
            ${field('音楽スタイル', html`<input class="inp" placeholder="例：ローファイ、アコースティック">`)}
            ${field('ムード・雰囲気', html`<input class="inp" placeholder="例：穏やか、前向き">`)}
            ${field('使用楽器', html`<input class="inp" placeholder="例：ピアノ、ギター">`)}
            ${st.adv ? html`${field('歌詞', html`<textarea class="cap" rows="4" placeholder="歌詞を入力（任意）"></textarea>`, tag())}${field('モデル', html`<select class="inp" id="f-model">${models.map(function (m) { return html`<option value="${m.id}" ${m.id === st.model ? 'selected' : ''}>${m.name}</option>`; })}</select>`)}` : ''}
            ${field('ボーカル', html`<div class="seg"><button type="button" data-vocal="vocal" class="${st.vocal === 'vocal' ? 'on' : ''}">ボーカルあり</button><button type="button" data-vocal="inst" class="${st.vocal === 'inst' ? 'on' : ''}">インスト</button></div>`)}
            ${field('長さ', html`<div class="seg"><button type="button" data-len="clip" class="${st.len === 'clip' ? 'on' : ''}">30秒クリップ</button><button type="button" data-len="full" class="${st.len === 'full' ? 'on' : ''}">フルバージョン</button></div>`)}
            ${sw('f-wm', '透かし', true)}`;
        }
        var ratios = S.ratios[kind];
        return html`
          ${field('参照（任意）', html`<div class="refs"><div class="seg sm"><button type="button" data-ref="none" class="${st.ref === 'none' ? 'on' : ''}">なし</button><button type="button" data-ref="image" class="${st.ref === 'image' ? 'on' : ''}">画像</button><button type="button" data-ref="chara" class="${st.ref === 'chara' ? 'on' : ''}">キャラクター</button></div>
            ${st.ref === 'image' ? html`<button type="button" class="dz" data-toast="アップロードはモックでは未対応です">${ico('upload')}<b>画像をアップロード</b><small>JPG / PNG</small></button>` : ''}
            ${st.ref === 'chara' ? html`<div class="st-row-scroll sm">${S.characters.slice(0, 6).map(function (c) { return html`<button type="button" class="pickc" data-toast="「${c.name}」を参照にしました（モック）"><span class="av ph">${FC.img('avatars', c.img, c.name)}</span><small>${c.name}</small></button>`; })}</div>` : ''}</div>`)}
          ${field('プロンプト', html`<textarea class="cap" id="f-prompt" rows="4" placeholder="つくりたい${kind === 'image' ? '画像' : '動画'}を言葉で入力">${prompt0}</textarea>${sw('f-opt', '自動最適化', true, 'プロンプトをモデルに合わせて整えます')}`)}
          ${field('スタイル', html`<select class="inp">${S.styles.map(function (s) { return html`<option>${s}</option>`; })}</select>`, html`<span class="nw">NEW</span>`)}
          ${field('モデル', html`<div class="seg sm" id="modeSeg">${[['auto', 'おまかせ'], ['single', 'シングル'], ['multi', 'マルチ']].map(function (x) { return html`<button type="button" data-mode-m="${x[0]}" class="${st.mode === x[0] ? 'on' : ''}">${x[1]}</button>`; })}</div>
            ${st.mode === 'auto' ? '' : html`<select class="inp" id="f-model" style="margin-top:8px">${models.map(function (m) { return html`<option value="${m.id}" ${m.id === st.model ? 'selected' : ''}>${m.name}</option>`; })}</select>`}
            <a class="lnk" href="studio-models.html${'?tab=list'}">モデル一覧を見る ${ico('right', 'xs')}</a>`)}
          ${field('アスペクト比', chips(ratios, st.ratio, 'data-ratio'))}
          ${kind === 'image' ? html`${field('解像度', chips(['1K', '2K'], st.res, 'data-res'))}${field('画像サイズ', html`<div class="wh"><input class="inp" type="number" placeholder="W" value="1024"><span>×</span><input class="inp" type="number" placeholder="H" value="1024"></div>`)}`
            : html`${field('解像度', chips(['720p', '1080p'], st.res, 'data-res'))}${field('長さ', chips(['5s', '10s'], st.dur, 'data-dur'))}`}
          ${field('生成される枚数', chips([1, 2, 4, 6, 8], st.n, 'data-n'))}
          ${kind === 'video' ? sw('f-cam', 'カメラ固定', false, 'オンでカメラを動かさず撮影します') : ''}
          ${sw('f-wm', '透かし', true)}`;
      }
      function resultHtml() {
        if (results === 'loading') {
          return html`<div class="rs-grid">${[0, 1, 2, 3].slice(0, kind === 'music' ? 1 : Math.min(st.n, 4)).map(function () { return html`<div class="rs-skel"><span class="ph"></span></div>`; })}</div><p class="hint" style="text-align:center">生成中…（モックです）</p>`;
        }
        if (results) {
          if (kind === 'music') {
            return html`<div class="trk"><span class="ph">${FC.img('posts', 14, '')}</span><div><b>${(prompt0 || '新しい楽曲')}</b><small>${st.len === 'clip' ? '00:30' : '02:10'}・${st.vocal === 'vocal' ? 'ボーカルあり' : 'インスト'}</small><div class="player"><button class="playbtn sm" data-toast="モックでは再生されません">${ico('play-solid', 'fill')}</button><div class="bar"><i></i></div></div></div>
              <a class="btn btn-fill" href="post-new.html">投稿に使う</a></div>`;
          }
          return html`<div class="rs-grid">${results.map(function (n) { return html`<div class="rs"><div class="thumb">${ph('posts', n, '')}${kind === 'video' ? html`<span class="chip br">${ico('play-solid', 'xs fill')}00:0${st.dur === '5s' ? 5 : 8}</span>` : ''}</div><a class="btn btn-fill" href="post-new.html">投稿に使う</a></div>`; })}</div>`;
        }
        return html`<div class="rs-empty">${ico(kind === 'music' ? 'music' : kind, '')}<b>ここに生成結果が表示されます</b><small>左の設定を入力して「作成」を押してください（モックのため実際には生成されません）</small></div>`;
      }
      function draw() {
        $('#cbody').innerHTML = String(html`<div class="cr"><section class="cr-form" id="crForm">${formHtml()}</section>
          <section class="cr-res"><h3>結果</h3><div id="crRes">${resultHtml()}</div></section>
          <div class="cr-bar"><button type="button" class="btn btn-grad btn-lg" id="btnMake">作成<span class="crd">${ico("spark", "xs")}${credit()}</span></button></div></div>`);
      }
      draw();
      var body = $('#cbody');
      body.addEventListener('click', function (e) {
        var b, v;
        function set(attr, key, conv) { b = e.target.closest('[' + attr + ']'); if (b) { v = b.getAttribute(attr); st[key] = conv ? conv(v) : v; keep(); return true; } return false; }
        function keep() { var p = $('#f-prompt') || $('#f-theme'); if (p) prompt0 = p.value; draw(); }
        if (set('data-ref', 'ref') || set('data-mode-m', 'mode') || set('data-ratio', 'ratio') || set('data-res', 'res') || set('data-dur', 'dur') ||
            set('data-n', 'n', Number) || set('data-vocal', 'vocal') || set('data-len', 'len') || set('data-adv', 'adv', function (x) { return x === '1'; })) return;
        if (e.target.closest('#btnMake')) {
          var p = $('#f-prompt') || $('#f-theme'); if (p) prompt0 = p.value;
          if (!prompt0.trim()) { toast(kind === 'music' ? '曲のテーマを入力してください' : 'プロンプトを入力してください'); return; }
          results = 'loading'; $('#crRes').innerHTML = String(resultHtml());
          var base = (prompt0.length * 3) % 24;
          setTimeout(function () {
            results = []; for (var i = 0; i < Math.min(st.n, 4); i++) results.push(((base + i * 5) % 24) + 1);
            if (!document.getElementById('crRes')) return;
            $('#crRes').innerHTML = String(resultHtml());
            toast('生成しました（モック：サンプル画像です）');
          }, 1100);
        }
      });
    }

    /* キャラクター（L1） */
    function pageCharacters() {
      var tab = q('tab') || 'discover', f = { style: '', gender: '', race: '' };
      var uniq = function (k) { var o = []; S.characters.forEach(function (c) { if (o.indexOf(c[k]) < 0) o.push(c[k]); }); return o; };
      $('#pg').innerHTML = html`<section class="hero chara"><h2>わたしのキャラクターをつくる</h2><p>一度登録すると、画像・動画で同じ見た目を呼び出せます${tag()}</p>
        <div class="entry"><button class="ent" data-new="prompt">${ico('edit')}<b>プロンプト</b><small>テキストから生成</small></button><button class="ent" data-new="clone">${ico('image')}<b>クローン</b><small>画像から生成</small></button></div></section>
        ${pills([['discover', 'ディスカバリー'], ['mine', 'マイキャラクター'], ['fav', 'お気に入り']], tab, function (k) { return k === 'discover' ? 'studio-characters.html' : 'studio-characters.html?tab=' + k; })}
        <div class="filters" id="cf" ${tab === 'discover' ? '' : 'hidden'}><div class="frow">${[['style', 'スタイル'], ['gender', '性別'], ['race', '種族']].map(function (x) { return html`<select class="inp sm" data-f="${x[0]}"><option value="">${x[1]}：すべて</option>${uniq(x[0]).map(function (o) { return html`<option>${o}</option>`; })}</select>`; })}</div></div>
        <div class="cc-grid" id="cg"></div>`;
      function draw() {
        var list = tab === 'mine' ? S.myCharacters.map(chara) : tab === 'fav' ? S.favCharacters.map(chara) : S.characters.filter(function (c) { return (!f.style || c.style === f.style) && (!f.gender || c.gender === f.gender) && (!f.race || c.race === f.race); });
        $('#cg').innerHTML = String(list.length ? html`${list.map(charCard)}` : html`<div class="empty" style="grid-column:1/-1">キャラクターはまだいません</div>`);
        FC.observe($('#cg'));
      }
      draw();
      $('#cf').addEventListener('change', function (e) { var s = e.target.closest('[data-f]'); if (s) { f[s.getAttribute('data-f')] = s.value; draw(); } });
      $('#pg').addEventListener('click', function (e) {
        var b = e.target.closest('[data-new]'); if (!b) return;
        var clone = b.getAttribute('data-new') === 'clone';
        var s = FC.openSheet(html`<h3>${clone ? 'クローンでキャラクターを作成' : 'プロンプトでキャラクターを作成'}</h3>
          <div class="cf"><label>キャラクター名</label><input class="inp" placeholder="例：星野 ミオ"></div>
          ${clone ? html`<button type="button" class="dz" data-toast="アップロードはモックでは未対応です">${ico('upload')}<b>元になる画像をアップロード</b></button>` : html`<div class="cf"><label>特徴</label><textarea class="cap" rows="3" placeholder="見た目や性格を言葉で入力"></textarea></div>`}
          <button class="btn btn-grad btn-lg btn-block" id="mkc" style="margin-top:12px">作成する</button><p class="note">モックのため、実際には作成されません。</p>`);
        $('#mkc', s.el).addEventListener('click', function () { s.close(); toast('キャラクター作成はモックでは未対応です'); });
      });
    }

    /* キャラクター詳細（L2） */
    function pageCharacter() {
      var c = chara(q('id')) || S.characters[0];
      var others = S.characters.filter(function (x) { return x.id !== c.id; }).slice(0, 6);
      $('#pg').innerHTML = html`<div class="dt"><div class="dt-media"><div class="dt-img chara">${ph('avatars', c.img, c.name)}</div></div>
        <div class="dt-info"><div><span class="kb k-chara">キャラクター</span></div><h2>${c.name}</h2>
          <div class="who"><span class="av ph">${FC.img('avatars', 2, '')}</span>${c.user}<span class="lk">${ico('heart', 'xs')}${fmt(c.likes)}</span></div>
          <p class="md-desc">${c.desc}</p>
          <div class="kv"><div><span>スタイル</span><span>${c.style}</span></div><div><span>性別</span><span>${c.gender}</span></div><div><span>種族</span><span>${c.race}</span></div></div>
          <div class="dt-act"><a class="btn btn-grad btn-lg" href="studio-image.html?prompt=${encodeURIComponent(c.name + '、' + c.desc)}">${ico('image', 'sm')}画像をつくる</a><a class="btn btn-lg" href="studio-video.html?prompt=${encodeURIComponent(c.name + '、' + c.desc)}">${ico('video', 'sm')}動画をつくる</a><button class="btn btn-lg" data-toast="お気に入りに追加しました（モック）">${ico('heart', 'sm')}お気に入り</button></div></div></div>
        <div class="st-head"><h2>ほかのキャラクター</h2></div><div class="cc-grid">${others.map(charCard)}</div>`;
    }

    /* ---------- boot ---------- */
    buildShell();
    var P = { studio: pageHome, 'studio-detail': pageDetail, 'studio-models': pageModels, 'studio-model': pageModel, 'studio-image': pageCreate, 'studio-video': pageCreate, 'studio-music': pageCreate, 'studio-characters': pageCharacters, 'studio-character': pageCharacter };
    (P[page] || pageHome)();

    /* 開くたびのポップアップ：fancloud側からStudioへ入ったとき（またはこのタブで初めて開いたとき）に表示 */
    (function () {
      var P = S.popup;
      if (!P || P.enabled === false || params.has('nopopup')) return;
      var show = false;
      try {
        show = !!sessionStorage.getItem('fcm:stEnter') || !sessionStorage.getItem('fcm:stActive') || params.has('popup');
        sessionStorage.removeItem('fcm:stEnter'); sessionStorage.setItem('fcm:stActive', '1');
      } catch (e) { show = true; }
      if (!show) return;
      var m = FC.openModal(html`<button class="sp-x" data-close aria-label="閉じる">${ico('x')}</button><img class="sp-img" src="${P.image}" alt="" draggable="false"><a class="btn btn-grad btn-lg btn-block sp-go" href="${P.link}">${P.button}${ico('right', 'sm')}</a>`, { cls: 'studio-pop' });
      m.box.addEventListener('click', function (e) { if (e.target.closest('.sp-go')) m.close(); });
    })();

    /* メニュー開閉（スマホ：ドロワー／サブ項目：アコーディオン） */
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-st-open],[data-st-close],[data-st-toggle]');
      if (!t) return;
      if (t.hasAttribute('data-st-open')) document.body.classList.add('st-open');
      else if (t.hasAttribute('data-st-close')) document.body.classList.remove('st-open');
      else {
        var g = t.closest('.st-grp'); g.classList.toggle('open');
        try { var o = JSON.parse(localStorage.getItem('fcm:stOpen') || '{}'); o[g.getAttribute('data-grp')] = g.classList.contains('open'); localStorage.setItem('fcm:stOpen', JSON.stringify(o)); } catch (err) { /* ignore */ }
      }
    });
  };
})();
