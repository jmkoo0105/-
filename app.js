(function () {
  'use strict';

  var STORE_KEY = 'vocab-app-v3';
  var app = document.getElementById('app');

  /* ====================== 데이터 ====================== */
  var POS_RE = /^(n|v|a|adj|adv|id|prep|conj|pron|phr)\.\s*/i;
  var ALL = [];
  var RANGES = (typeof VOCAB !== 'undefined' ? VOCAB : []).map(function (r) {
    var words = r.words.map(function (w) {
      var m = w.meaning.match(POS_RE);
      var item = {
        key: r.id + '::' + w.word + '::' + (m ? m[1].toLowerCase() : ''),
        word: w.word,
        meaning: w.meaning,
        pos: m ? m[1].toLowerCase() : '',
        def: m ? w.meaning.slice(m[0].length) : w.meaning,
        hl: !!w.hl,
        rangeId: r.id, rangeName: r.name
      };
      ALL.push(item);
      return item;
    });
    return { id: r.id, group: r.group || '', name: r.name, subtitle: r.subtitle || '', words: words };
  });
  var BY_KEY = new Map(ALL.map(function (w) { return [w.key, w]; }));
  var GROUPS = [];
  RANGES.forEach(function (r) { if (GROUPS.indexOf(r.group) < 0) GROUPS.push(r.group); });
  function groupRanges(g) { return RANGES.filter(function (r) { return r.group === g; }); }

  /* ====================== 저장 상태 ====================== */
  var DEFAULT = {
    source: 'range',
    ranges: RANGES.map(function (r) { return r.id; }),
    hlOnly: false,
    picked: [],
    lastWrong: { mode: 'w2m', keys: [] }, // 바로 전 시험에서 틀린 문제
    qcount: 20,
    front: 'word'
  };
  var S = load();
  var PICK = new Set(S.picked.filter(function (k) { return BY_KEY.has(k); }));
  S.ranges = S.ranges.filter(function (id) { return RANGES.some(function (r) { return r.id === id; }); });
  if (S.source !== 'pick') S.source = 'range';
  if (!S.lastWrong || !Array.isArray(S.lastWrong.keys)) S.lastWrong = { mode: 'w2m', keys: [] };
  S.lastWrong.keys = S.lastWrong.keys.filter(function (k) { return BY_KEY.has(k); });
  delete S.wrong;

  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORE_KEY));
      if (raw && typeof raw === 'object') return Object.assign({}, DEFAULT, raw);
    } catch (e) { /* 저장소 사용 불가 */ }
    return JSON.parse(JSON.stringify(DEFAULT));
  }
  function save() {
    S.picked = Array.from(PICK);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* 무시 */ }
  }

  /* ====================== 유틸 ====================== */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function norm(s) { return String(s).replace(/\s+/g, '').toLowerCase(); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function dedupe(list) {
    var seen = new Set();
    return list.filter(function (w) {
      var k = norm(w.word);
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
  }
  function posLabel(p) { return p ? p + '.' : ''; }
  function say(text) {
    try {
      if (!('speechSynthesis' in window)) return;
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 0.9;
      speechSynthesis.speak(u);
    } catch (e) { /* 무시 */ }
  }
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 1800);
  }

  var IC = {
    back: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    speak: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
    book: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z"/><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5"/></svg>',
    cards: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="14" height="15" rx="2"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/></svg>',
    w2m: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h7M7.5 4v3M5 13c2-1 4-4 4-6M6 10c1 2 3 3 5 3"/><path d="M14 17h7M17.5 12l3.5 8M17.5 12L14 20"/></svg>',
    m2w: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>',
    prev: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    next: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>'
  };

  /* ====================== 학습 세트 ====================== */
  function studySet() {
    var list;
    if (S.source === 'range') {
      list = [];
      RANGES.forEach(function (r) { if (S.ranges.indexOf(r.id) >= 0) list = list.concat(r.words); });
      if (S.hlOnly) list = list.filter(function (w) { return w.hl; });
    } else {
      list = ALL.filter(function (w) { return PICK.has(w.key); });
    }
    return dedupe(list);
  }
  function lastWrongList() {
    return S.lastWrong.keys.map(function (k) { return BY_KEY.get(k); }).filter(Boolean);
  }

  /* ====================== 라우팅 ====================== */
  var F = null; // 플래시카드 세션
  var Q = null; // 퀴즈 세션
  var quizTimer = null;

  function route() { return (location.hash.replace(/^#\/?/, '') || 'home'); }
  function go(v) {
    var target = '#/' + (v === 'home' ? '' : v);
    if (location.hash === target || (v === 'home' && route() === 'home')) render();
    else location.hash = target;
  }
  window.addEventListener('hashchange', render);

  function render() {
    clearTimeout(quizTimer);
    var r = route();
    if (r === 'dict') renderDict();
    else if (r === 'flash' && F) renderFlash();
    else if (r === 'quiz' && Q) (Q.i >= Q.list.length ? renderResult() : renderQuiz());
    else if (r === 'result' && Q) (Q.i >= Q.list.length ? renderResult() : renderQuiz());
    else renderHome();
    window.scrollTo(0, 0);
  }

  /* ====================== 홈 ====================== */
  function renderHome() {
    var set = studySet();
    var lw = lastWrongList();
    function seg(id, label, extra) {
      return '<button class="' + (S.source === id ? 'on' : '') + '" data-act="source" data-v="' + id + '">' + label + (extra || '') + '</button>';
    }
    function mode(act, icon, title, sub) {
      return '<button class="mode" data-act="' + act + '"><div class="ic">' + icon + '</div><b>' + title + '</b><span>' + sub + '</span></button>';
    }
    var qopts = [10, 20, 30, 50, 'all'].map(function (n) {
      return '<button class="chip ' + (S.qcount === n ? 'on' : '') + '" data-act="qcount" data-v="' + n + '">' + (n === 'all' ? '전체' : n + '문제') + '</button>';
    }).join('');

    app.innerHTML =
      '<header class="top"><div><p class="eyebrow">VOCA</p><h1>단어장</h1></div><span class="total">전체 ' + dedupe(ALL).length + '개</span></header>' +
      '<section class="card">' +
        '<h2 class="card-title">학습 범위</h2>' +
        '<div class="seg">' + seg('range', '지정 범위') + seg('pick', '직접 선택', PICK.size ? '<span class="badge">' + PICK.size + '</span>' : '') + '</div>' +
        '<div>' + sourceBody() + '</div>' +
        '<div class="set-count"><span>학습할 단어</span><span><b>' + set.length + '</b>개</span></div>' +
      '</section>' +
      (lw.length
        ? '<section class="card retry-card"><div><b>방금 시험에서 틀린 문제 ' + lw.length + '개</b><span>' + (S.lastWrong.mode === 'w2m' ? '단어 → 뜻' : '뜻 → 단어') + ' 시험</span></div>' +
          '<button class="btn" data-act="retry-last">다시 풀기</button></section>'
        : '') +
      '<section class="modes">' +
        mode('dict', IC.book, '사전', '찾아보고 단어 고르기') +
        mode('flash', IC.cards, '플래시카드', '뒤집으며 외우기') +
        mode('quiz-w2m', IC.w2m, '단어 → 뜻', '단어 보고 뜻 고르기') +
        mode('quiz-m2w', IC.m2w, '뜻 → 단어', '뜻 보고 단어 고르기') +
      '</section>' +
      '<section class="card"><h2 class="card-title">시험 문제 수</h2><div class="qcount">' + qopts + '</div></section>';

  }

  function sourceBody() {
    if (S.source === 'range') {
      var html = GROUPS.map(function (g) {
        var rs = groupRanges(g);
        var allOn = rs.every(function (r) { return S.ranges.indexOf(r.id) >= 0; });
        return '<div class="group">' +
          '<div class="group-head"><b>' + esc(g) + '</b>' +
          '<button class="linkbtn" data-act="group-all" data-group="' + esc(g) + '">' + (allOn ? '전체 해제' : '전체 선택') + '</button></div>' +
          '<div class="ranges">' + rs.map(function (r) {
            var on = S.ranges.indexOf(r.id) >= 0;
            return '<button class="range-row' + (on ? ' on' : '') + '" data-act="range" data-id="' + esc(r.id) + '">' +
              '<span class="check" aria-hidden="true"></span>' +
              '<span class="range-name"><b>' + esc(r.name) + '</b>' + (r.subtitle ? '<small>' + esc(r.subtitle) + '</small>' : '') + '</span>' +
              '<span class="range-count">' + r.words.length + '</span></button>';
          }).join('') + '</div></div>';
      }).join('');
      return html + '<label class="switch"><input type="checkbox" data-act="hl" ' + (S.hlOnly ? 'checked' : '') + '> <span><span class="hl-dot">형광펜</span> 표시된 단어만</span></label>';
    }
    return '<p class="muted">사전에서 체크한 단어로 학습하고 시험 봐요. 지금 <b>' + PICK.size + '</b>개 골랐어요.</p>' +
      '<div class="row"><button class="btn" data-act="dict-pick">사전에서 고르기</button>' +
      (PICK.size ? '<button class="btn danger" data-act="clear-pick">선택 해제</button>' : '') + '</div>';
  }

  /* ====================== 사전 ====================== */
  var D = { q: '', range: 'all', hl: false, pickedOnly: false };

  function renderDict() {
    var opts = '<option value="all">전체 범위</option>' + GROUPS.map(function (g) {
      return '<optgroup label="' + esc(g) + '">' + groupRanges(g).map(function (r) {
        return '<option value="' + esc(r.id) + '">' + esc(r.name + (r.subtitle ? ' ' + r.subtitle : '')) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');

    app.innerHTML =
      '<header class="bar"><button class="icon-btn" data-act="home" aria-label="뒤로">' + IC.back + '</button><h1>사전</h1><span class="meta" id="dcount"></span></header>' +
      '<div class="dict-tools">' +
        '<input class="search" id="dq" type="search" placeholder="영어 또는 뜻으로 검색" value="' + esc(D.q) + '" autocomplete="off">' +
        '<div class="row">' +
          '<select class="select" id="dr">' + opts + '</select>' +
          '<label class="mini"><input type="checkbox" id="dh"' + (D.hl ? ' checked' : '') + '> 형광펜</label>' +
          '<label class="mini"><input type="checkbox" id="dp"' + (D.pickedOnly ? ' checked' : '') + '> 고른 단어만</label>' +
        '</div>' +
        '<div class="row" style="justify-content:space-between"><span class="dict-meta">체크하면 ‘직접 선택’ 시험 단어가 돼요</span>' +
        '<span class="row"><button class="linkbtn" data-act="pick-all">보이는 단어 모두 선택</button><button class="linkbtn" data-act="unpick-all" style="color:var(--sub)">해제</button></span></div>' +
      '</div>' +
      '<ul class="list" id="dlist"></ul>' +
      '<div class="sticky"><div class="sticky-in"><span>고른 단어 <b id="pcount">' + PICK.size + '</b>개</span><button class="btn" data-act="use-pick">이 단어로 학습하기</button></div></div>';

    var dq = document.getElementById('dq');
    dq.addEventListener('input', function () { D.q = dq.value; renderDictList(); });
    document.getElementById('dr').value = D.range;
    document.getElementById('dr').addEventListener('change', function (e) { D.range = e.target.value; renderDictList(); });
    document.getElementById('dh').addEventListener('change', function (e) { D.hl = e.target.checked; renderDictList(); });
    document.getElementById('dp').addEventListener('change', function (e) { D.pickedOnly = e.target.checked; renderDictList(); });
    renderDictList();
  }

  function dictVisible() {
    var q = D.q.trim().toLowerCase();
    return ALL.filter(function (w) {
      if (D.range !== 'all' && w.rangeId !== D.range) return false;
      if (D.hl && !w.hl) return false;
      if (D.pickedOnly && !PICK.has(w.key)) return false;
      if (q && w.word.toLowerCase().indexOf(q) < 0 && w.meaning.toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
  }

  function entryRow(w, opts) {
    opts = opts || {};
    var picked = PICK.has(w.key);
    return '<li class="entry' + (opts.pick && picked ? ' picked' : '') + '" data-key="' + esc(w.key) + '">' +
      (opts.pick ? '<input type="checkbox" data-act="pick" data-key="' + esc(w.key) + '"' + (picked ? ' checked' : '') + ' aria-label="선택">' : '') +
      '<div class="entry-main"' + (opts.pick ? ' data-act="pick-row"' : '') + '>' +
        '<div class="entry-word"><span class="w' + (w.hl ? ' hl' : '') + '">' + esc(w.word) + '</span>' + (w.pos ? '<span class="pos">' + posLabel(w.pos) + '</span>' : '') +
        (opts.count ? '<span class="count-x">×' + opts.count + '</span>' : '') + '</div>' +
        '<div class="entry-def">' + esc(w.def) + '</div>' +
      '</div>' +
      '<div class="entry-side"><span class="tag">' + esc(w.rangeName) + '</span><button class="icon-btn sm" data-act="say" data-word="' + esc(w.word) + '" aria-label="발음 듣기">' + IC.speak + '</button></div>' +
    '</li>';
  }

  function renderDictList() {
    var list = dictVisible();
    document.getElementById('dcount').textContent = list.length + '개';
    document.getElementById('dlist').innerHTML = list.length
      ? list.map(function (w) { return entryRow(w, { pick: true }); }).join('')
      : '<li class="empty">검색 결과가 없어요</li>';
  }

  function setPick(key, on) {
    if (on) PICK.add(key); else PICK.delete(key);
    save();
    var li = app.querySelector('li.entry[data-key="' + CSS.escape(key) + '"]');
    if (li) {
      li.classList.toggle('picked', on);
      var cb = li.querySelector('input[data-act="pick"]');
      if (cb) cb.checked = on;
    }
    var pc = document.getElementById('pcount');
    if (pc) pc.textContent = PICK.size;
  }

  /* ====================== 플래시카드 ====================== */
  function startFlash(list) {
    list = list || studySet();
    if (!list.length) return toast('학습할 단어가 없어요');
    F = { list: list, i: 0, flipped: false, unknown: [] };
    go('flash');
  }

  function renderFlash() {
    var n = F.list.length;
    if (F.i >= n) return renderFlashDone();
    var w = F.list[F.i];
    var frontWord = S.front === 'word';
    var wordFace = '<span class="pos">' + posLabel(w.pos) + '</span><div class="big">' + esc(w.word) + '</div>';
    var defFace = '<div class="big def">' + esc(w.def) + '</div>';
    app.innerHTML =
      '<header class="bar"><button class="icon-btn" data-act="home" aria-label="뒤로">' + IC.back + '</button><h1>플래시카드</h1><span class="meta">' + (F.i + 1) + ' / ' + n + '</span></header>' +
      '<div class="progress"><i style="width:' + ((F.i) / n * 100) + '%"></i></div>' +
      '<div class="flash-wrap" id="fwrap"><div class="flash' + (F.flipped ? ' flipped' : '') + '" id="fcard" data-act="flip">' +
        '<div class="face front">' + (w.hl ? '<span class="star-hl">형광펜</span>' : '') + '<span class="tag src">' + esc(w.rangeName) + '</span>' + (frontWord ? wordFace : defFace) + '<p class="hint">탭해서 뒤집기</p></div>' +
        '<div class="face back">' + (frontWord ? defFace + '<div style="color:var(--sub);font-weight:600">' + esc(w.word) + '</div>' : wordFace) + '</div>' +
      '</div></div>' +
      '<div class="flash-ctrl">' +
        '<button class="btn line" data-act="fprev"' + (F.i === 0 ? ' disabled' : '') + '>' + IC.prev + ' 이전</button>' +
        '<button class="round" data-act="say" data-word="' + esc(w.word) + '" aria-label="발음 듣기">' + IC.speak + '</button>' +
        '<button class="btn line" data-act="fnext">다음 ' + IC.next + '</button>' +
      '</div>' +
      '<div class="judge"><button class="btn no" data-act="fdunno">모르겠어요</button><button class="btn yes" data-act="fknow">알아요</button></div>' +
      '<div class="flash-opts"><button class="linkbtn" data-act="fshuffle">순서 섞기</button><button class="linkbtn" data-act="fswap">앞면: ' + (frontWord ? '단어' : '뜻') + ' ⇄</button></div>';

    // 스와이프
    var wrap = document.getElementById('fwrap'), sx = null, sy = null;
    wrap.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    wrap.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      sx = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault();
        if (dx < 0) flashMove(1); else flashMove(-1);
      }
    });
  }

  function flashMove(d) {
    var ni = F.i + d;
    if (ni < 0) return;
    F.i = ni; F.flipped = false;
    renderFlash();
  }

  function renderFlashDone() {
    var u = F.unknown;
    app.innerHTML =
      '<header class="bar"><button class="icon-btn" data-act="home" aria-label="뒤로">' + IC.back + '</button><h1>플래시카드</h1><span></span></header>' +
      '<div class="result"><div class="ring" style="--p:100"><div>끝!</div></div>' +
      '<p>' + F.list.length + '개 중 모르는 단어 <b style="color:var(--ink)">' + u.length + '</b>개</p>' +
      '<div class="result-btns">' +
        (u.length ? '<button class="btn block" data-act="flash-unknown">모르는 단어만 다시</button>' : '') +
        '<button class="btn block ' + (u.length ? 'ghost' : '') + '" data-act="flash-again">처음부터 다시</button>' +
        '<button class="btn block line" data-act="home">홈으로</button>' +
      '</div></div>' +
      (u.length ? '<h3 class="sec-title">모르는 단어</h3><ul class="list">' + u.map(function (w) { return entryRow(w); }).join('') + '</ul>' : '');
  }

  /* ====================== 퀴즈 ====================== */
  function startQuiz(mode, list) {
    var base = studySet();
    var fromSet = !list;
    list = shuffle(list || base);
    if (!list.length) return toast('학습할 단어가 없어요');
    if (fromSet && S.qcount !== 'all') list = list.slice(0, S.qcount);
    Q = { mode: mode, list: list, pool: base.length >= 4 ? base : ALL, i: 0, score: 0, wrong: [], locked: false };
    buildQuestion();
    go('quiz');
  }

  function distractors(ans, n, poolBase) {
    function ok(w) { return norm(w.word) !== norm(ans.word) && norm(w.def) !== norm(ans.def); }
    function pick(pool) {
      var shuffled = shuffle(pool);
      // 같은 품사 우선 → 더 헷갈리게
      shuffled.sort(function (a, b) { return (b.pos === ans.pos) - (a.pos === ans.pos); });
      var out = [], sw = new Set(), sd = new Set();
      for (var i = 0; i < shuffled.length && out.length < n; i++) {
        var w = shuffled[i];
        if (sw.has(norm(w.word)) || sd.has(norm(w.def))) continue;
        sw.add(norm(w.word)); sd.add(norm(w.def));
        out.push(w);
      }
      return out;
    }
    var out = pick(poolBase.filter(ok));
    if (out.length < n) {
      var used = new Set(out.map(function (w) { return norm(w.word); }));
      var extra = pick(ALL.filter(function (w) {
        return ok(w) && !used.has(norm(w.word)) && !out.some(function (o) { return norm(o.def) === norm(w.def); });
      }));
      out = out.concat(extra.slice(0, n - out.length));
    }
    return out;
  }

  function buildQuestion() {
    var ans = Q.list[Q.i];
    Q.options = shuffle([ans].concat(distractors(ans, 3, Q.pool)));
    Q.answer = ans;
    Q.locked = false;
  }

  function renderQuiz() {
    var w = Q.answer, n = Q.list.length, w2m = Q.mode === 'w2m';
    var prompt = w2m
      ? '<div class="q-prompt"><span class="big">' + esc(w.word) + '</span><button class="icon-btn sm" data-act="say" data-word="' + esc(w.word) + '" aria-label="발음 듣기">' + IC.speak + '</button></div>' + (w.pos ? '<span class="pos">' + posLabel(w.pos) + '</span>' : '')
      : (w.pos ? '<span class="pos">' + posLabel(w.pos) + '</span>' : '') + '<div class="q-prompt"><span class="big def">' + esc(w.def) + '</span></div>';
    app.innerHTML =
      '<header class="bar"><button class="icon-btn" data-act="home" aria-label="그만하기">' + IC.back + '</button><h1>' + (w2m ? '단어 → 뜻' : '뜻 → 단어') + '</h1><span class="meta">' + (Q.i + 1) + ' / ' + n + '</span></header>' +
      '<div class="progress"><i style="width:' + (Q.i / n * 100) + '%"></i></div>' +
      '<div class="q-card"><p class="q-label">' + (w2m ? '이 단어의 뜻은?' : '이 뜻을 가진 단어는?') + '</p>' + prompt + '</div>' +
      '<div class="options">' + Q.options.map(function (o, idx) {
        return '<button class="opt" data-act="answer" data-idx="' + idx + '"><span class="num">' + (idx + 1) + '</span><span>' + esc(w2m ? o.def : o.word) + '</span></button>';
      }).join('') + '</div>' +
      '<div class="q-foot" id="qfoot"></div>';
  }

  function answer(idx) {
    if (Q.locked) return;
    Q.locked = true;
    var chosen = Q.options[idx], ans = Q.answer, correct = chosen === ans;
    var btns = app.querySelectorAll('.opt');
    btns.forEach(function (b, i) {
      b.disabled = true;
      var o = Q.options[i];
      if (o === ans) b.classList.add('correct');
      else if (i === idx) b.classList.add('wrong');
      else b.classList.add('dim');
    });
    if (correct) {
      Q.score++;
      quizTimer = setTimeout(nextQuestion, 750);
    } else {
      Q.wrong.push(ans);
      document.getElementById('qfoot').innerHTML =
        '<p class="q-reveal"><b>' + esc(ans.word) + '</b> = ' + esc(ans.def) + '</p>' +
        '<button class="btn block" data-act="qnext">다음 문제</button>';
    }
  }

  function nextQuestion() {
    clearTimeout(quizTimer);
    Q.i++;
    if (Q.i >= Q.list.length) {
      S.lastWrong = { mode: Q.mode, keys: Q.wrong.map(function (w) { return w.key; }) };
      save();
      go('result'); return;
    }
    buildQuestion();
    renderQuiz();
  }

  function renderResult() {
    var n = Q.list.length, pct = n ? Math.round(Q.score / n * 100) : 0;
    var msg = pct === 100 ? '완벽해요! 🎉' : pct >= 80 ? '아주 잘했어요!' : pct >= 50 ? '조금만 더 해봐요' : '틀린 단어부터 다시 볼까요?';
    app.innerHTML =
      '<header class="bar"><button class="icon-btn" data-act="home" aria-label="홈">' + IC.back + '</button><h1>결과</h1><span></span></header>' +
      '<div class="result"><div class="ring" style="--p:' + pct + '"><div>' + pct + '%</div></div>' +
      '<p>' + n + '문제 중 <b style="color:var(--ink)">' + Q.score + '</b>개 정답 · ' + msg + '</p>' +
      '<div class="result-btns">' +
        (Q.wrong.length ? '<button class="btn block" data-act="retry-wrong">틀린 ' + Q.wrong.length + '문제 다시 풀기</button>' : '') +
        (Q.wrong.length ? '<button class="btn block ghost" data-act="flash-wrong">틀린 단어 플래시카드로 보기</button>' : '') +
        '<button class="btn block ' + (Q.wrong.length ? 'line' : '') + '" data-act="retry-all">같은 문제 다시 풀기</button>' +
        '<button class="btn block line" data-act="home">홈으로</button>' +
      '</div></div>' +
      (Q.wrong.length ? '<h3 class="sec-title">틀린 단어</h3><ul class="list">' + Q.wrong.map(function (w) { return entryRow(w); }).join('') + '</ul>' : '');
  }

  /* ====================== 이벤트 ====================== */
  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.tagName === 'INPUT') return;
    var act = el.dataset.act;

    switch (act) {
      case 'home': go('home'); break;

      case 'source': S.source = el.dataset.v; save(); renderHome(); break;
      case 'range': {
        var id = el.dataset.id, i = S.ranges.indexOf(id);
        if (i >= 0) S.ranges.splice(i, 1); else S.ranges.push(id);
        save(); renderHome(); break;
      }
      case 'group-all': {
        var ids = groupRanges(el.dataset.group).map(function (r) { return r.id; });
        var allOn = ids.every(function (id) { return S.ranges.indexOf(id) >= 0; });
        if (allOn) S.ranges = S.ranges.filter(function (id) { return ids.indexOf(id) < 0; });
        else ids.forEach(function (id) { if (S.ranges.indexOf(id) < 0) S.ranges.push(id); });
        save(); renderHome(); break;
      }
      case 'qcount': S.qcount = el.dataset.v === 'all' ? 'all' : Number(el.dataset.v); save(); renderHome(); break;
      case 'clear-pick': PICK.clear(); save(); renderHome(); toast('선택을 모두 해제했어요'); break;
      case 'retry-last': {
        var lw = lastWrongList();
        if (!lw.length) return toast('다시 풀 문제가 없어요');
        startQuiz(S.lastWrong.mode, lw); break;
      }
      case 'dict-pick': D.pickedOnly = false; go('dict'); break;

      case 'dict': go('dict'); break;
      case 'flash': startFlash(); break;
      case 'quiz-w2m': startQuiz('w2m'); break;
      case 'quiz-m2w': startQuiz('m2w'); break;

      case 'say': e.stopPropagation(); say(el.dataset.word); break;

      case 'pick-row': {
        var key = el.closest('li').dataset.key;
        setPick(key, !PICK.has(key)); break;
      }
      case 'pick-all': dictVisible().forEach(function (w) { PICK.add(w.key); }); save(); renderDictList(); document.getElementById('pcount').textContent = PICK.size; break;
      case 'unpick-all': dictVisible().forEach(function (w) { PICK.delete(w.key); }); save(); renderDictList(); document.getElementById('pcount').textContent = PICK.size; break;
      case 'use-pick':
        if (!PICK.size) return toast('먼저 단어를 체크해 주세요');
        S.source = 'pick'; save(); go('home'); toast('고른 단어 ' + studySet().length + '개로 설정했어요'); break;

      case 'flip': F.flipped = !F.flipped; document.getElementById('fcard').classList.toggle('flipped', F.flipped); break;
      case 'fprev': flashMove(-1); break;
      case 'fnext': flashMove(1); break;
      case 'fknow': flashMove(1); break;
      case 'fdunno': {
        var w = F.list[F.i];
        if (F.unknown.indexOf(w) < 0) F.unknown.push(w);
        flashMove(1); break;
      }
      case 'fshuffle': F.list = shuffle(F.list); F.i = 0; F.flipped = false; F.unknown = []; renderFlash(); toast('순서를 섞었어요'); break;
      case 'fswap': S.front = S.front === 'word' ? 'def' : 'word'; save(); F.flipped = false; renderFlash(); break;
      case 'flash-again': F.i = 0; F.flipped = false; F.unknown = []; renderFlash(); break;
      case 'flash-unknown': F = { list: F.unknown.slice(), i: 0, flipped: false, unknown: [] }; renderFlash(); break;

      case 'answer': answer(Number(el.dataset.idx)); break;
      case 'qnext': nextQuestion(); break;
      case 'retry-wrong': startQuiz(Q.mode, Q.wrong.slice()); break;
      case 'retry-all': startQuiz(Q.mode, Q.list.slice()); break;
      case 'flash-wrong': startFlash(Q.wrong.slice()); break;
    }
  });

  app.addEventListener('change', function (e) {
    var el = e.target;
    var act = el.dataset.act;
    if (act === 'hl') { S.hlOnly = el.checked; save(); renderHome(); }
    else if (act === 'pick') setPick(el.dataset.key, el.checked);
  });

  document.addEventListener('keydown', function (e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    var r = route();
    if (r === 'flash' && F && F.i < F.list.length) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); F.flipped = !F.flipped; document.getElementById('fcard').classList.toggle('flipped', F.flipped); }
      else if (e.key === 'ArrowRight') flashMove(1);
      else if (e.key === 'ArrowLeft') flashMove(-1);
    } else if (r === 'quiz' && Q && Q.i < Q.list.length) {
      if (/^[1-4]$/.test(e.key) && !Q.locked) answer(Number(e.key) - 1);
      else if (e.key === 'Enter' && Q.locked) nextQuestion();
    }
  });

  render();
})();
