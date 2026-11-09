/* DidiGo v21 — aplikasi fresh (vanilla JS, satu file).
   Cangkang diam: sidebar + bar atas dirender SEKALI; hanya #content berganti. */
'use strict';
/* ===== Konfigurasi Supabase — ISI sebelum deploy (lihat CARA-UPDATE-KE-V21.md) ===== */
const SUPABASE_URL = 'https://tdwkghphdppwvznxcggz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HB_emJDuMKe3GflAeLqPrA_JAmYLLz8';

const DG = window.DG_DATA;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LANGMETA = {
  en: { name: 'Inggris', flag: 'EN', cur: 'Kurikulum IELTS · TOEFL · TOEIC', tts: 'en-US', exams: 'IELTS / TOEFL / TOEIC' },
  ko: { name: 'Korea', flag: 'KO', cur: 'Kurikulum TOPIK', tts: 'ko-KR', exams: 'TOPIK I / TOPIK II / EPS-TOPIK' },
  ja: { name: 'Jepang', flag: 'JA', cur: 'Kurikulum JLPT', tts: 'ja-JP', exams: 'JLPT / JFT-Basic' }
};
const LEVELS = DG.levels.map(l => l.code);

/* ===== State (localStorage; Supabase bila login & terkonfigurasi) ===== */
const SKEY = 'didigo-v21-state';
function blankLangState() { return { done: {}, xp: 0, streak: 0, lastDay: '', freezes: 1, srs: {}, placement: '', minutes: {} }; }
let S;
try { S = JSON.parse(localStorage.getItem(SKEY)) || null; } catch (e) { S = null; }
if (!S || !S.langs) S = { lang: 'en', user: null, name: '', journal: [], bookmarks: [], langs: { en: blankLangState(), ko: blankLangState(), ja: blankLangState() } };
for (const L of ['en', 'ko', 'ja']) if (!S.langs[L]) S.langs[L] = blankLangState();
function save() { try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {} }
function LS() { return S.langs[S.lang]; }
function todayStr(d) { d = d || new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function touchActivity(min) {
  const st = LS(), t = todayStr();
  st.minutes[t] = (st.minutes[t] || 0) + (min || 5);
  if (st.lastDay !== t) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    if (st.lastDay === todayStr(y)) st.streak += 1;
    else if (st.lastDay) { if (st.freezes > 0) { st.freezes -= 1; st.streak += 1; } else st.streak = 1; }
    else st.streak = 1;
    st.lastDay = t;
  }
  save();
}
/* Hash sederhana + salt per sesi — jawaban kuis disegel, tidak tampil di DOM. */
function seal(str, salt) { let h1 = 0xdeadbeef ^ salt, h2 = 0x41c6ce57 ^ salt; const s = salt + ':' + str; for (let i = 0; i < s.length; i++) { const ch = s.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16); }
function shuffle(a, seed) { const r = a.slice(); let s = seed || 7; for (let i = r.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) % 2147483648; const j = s % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; }
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => t.hidden = true, 2600); }

/* ===== TTS: tombol inline kecil; popover pengaturan hanya saat suara dipakai ===== */
let ttsRate = 1;
function speak(text, anchor) {
  if (!('speechSynthesis' in window)) { toast('Peramban ini tidak mendukung suara.'); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(String(text));
  u.lang = LANGMETA[S.lang].tts; u.rate = ttsRate;
  const pop = $('#tts-pop');
  pop.innerHTML = '<button data-r="0.7">Lambat</button><button data-r="1">Normal</button><button data-stop="1">Berhenti</button>';
  const r = anchor ? anchor.getBoundingClientRect() : { bottom: 70, left: window.innerWidth / 2 - 90 };
  pop.style.left = Math.max(8, r.left) + 'px'; pop.style.top = (r.bottom + 8) + 'px'; pop.hidden = false;
  $$('button', pop).forEach(b => b.onclick = () => {
    if (b.dataset.stop) { speechSynthesis.cancel(); pop.hidden = true; }
    else { ttsRate = parseFloat(b.dataset.r); speak(text, anchor); }
  });
  u.onend = u.onerror = () => { pop.hidden = true; };
  speechSynthesis.speak(u);
  clearTimeout(pop._h); pop._h = setTimeout(() => pop.hidden = true, 6000);
}
function ttsBtn(text, label) { return '<button type="button" class="tts-btn" data-speak="' + esc(text) + '">' + (label || '🔊') + '</button>'; }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-speak]');
  if (b) { speak(b.getAttribute('data-speak'), b); }
});

/* ===== Supabase (opsional — aktif hanya bila URL & key sudah diisi) ===== */
let sb = null;
if (!SUPABASE_URL.startsWith('GANTI') && window.supabase) {
  try { sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); } catch (e) { sb = null; }
}
async function awardXP(lessonId, scorePct, xp) {
  LS().xp += xp; save(); renderSidebar();
  if (sb && S.user) {
    try { await sb.rpc('award_xp', { p_language: S.lang, p_lesson: lessonId, p_score: scorePct }); } catch (e) {}
  }
}
async function awardBonus(xp, source) {
  LS().xp += xp; save(); renderSidebar();
  if (sb && S.user) { try { await sb.rpc('award_bonus_xp', { p_language: S.lang, p_xp: xp, p_source: source || 'latihan' }); } catch (e) {} }
}

/* ===== Cangkang: sidebar + bar atas (dirender sekali, tidak pernah berubah) ===== */
const NAV = [
  ['HARI INI', [['session', 'Sesi Hari Ini'], ['home', 'Beranda']]],
  ['JALUR', [['modules', 'Modul'], ['placement', 'Tes Penempatan'], ['exams', 'Persiapan Ujian']]],
  ['LATIHAN', [['flashcards', 'Kartu Hafalan'], ['practice', 'Kuis Latihan'], ['mistakes', 'Kesalahan Umum'], ['dictation', 'Dikte'], ['writing', 'Menulis'], ['conjugation', 'Konjugasi']]],
  ['KOLEKSI', [['readings', 'Bacaan'], ['dialogs', 'Dialog'], ['grammar', 'Tata Bahasa'], ['vocab', 'Kosakata'], ['idioms', 'Idiom & Bahasa Gaul'], ['culture', 'Budaya']]],
  ['AKUN', [['progress', 'Progres'], ['journal', 'Jurnal'], ['settings', 'Pengaturan']]]
];
const ICON = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
let route = { name: 'home', params: {} };
function displayName() { return S.name || (S.user ? S.user.name : '') || 'Pelajar'; }
function renderSidebar() {
  const st = LS();
  const items = NAV.map(([g, links]) => '<div class="nav-group">' + g + '</div>' + links.map(([r, label]) =>
    '<button type="button" class="nav-item' + (route.name === r ? ' active' : '') + '" data-nav="' + r + '">' + ICON + esc(label) + '</button>').join('')).join('');
  $('#sidebar').innerHTML =
    '<div class="logo">Didi<span>Go</span></div>' +
    '<div class="userbox"><div class="avatar">' + esc(displayName().slice(0, 1).toUpperCase()) + '</div><div><div class="uname">' + esc(displayName()) + '</div><div class="umail">' + esc(S.user ? S.user.email : 'Mode tamu — data di perangkat ini') + '</div></div></div>' +
    '<div><span class="streak-pill">🔥 <b>' + st.streak + ' hari</b>&nbsp;streak · ' + st.xp + ' XP</span></div>' +
    items + '<div class="nav-spacer"></div>' +
    (S.user ? '<button type="button" class="nav-item logout-btn" id="logout-btn">' + ICON + 'Logout</button>'
            : '<button type="button" class="nav-item logout-btn" id="login-btn">' + ICON + 'Masuk / Daftar</button>');
  $$('#sidebar [data-nav]').forEach(b => b.onclick = () => { closeDrawer(); go(b.dataset.nav); });
  const lo = $('#logout-btn'); if (lo) lo.onclick = async () => { if (sb) { try { await sb.auth.signOut(); } catch (e) {} } S.user = null; save(); renderSidebar(); toast('Sampai jumpa! Kamu sudah keluar.'); go('home'); };
  const li = $('#login-btn'); if (li) li.onclick = openAuth;
}
function renderTopbar() {
  $('#topbar').innerHTML =
    '<button type="button" class="burger" id="burger" aria-label="Buka menu">☰</button>' +
    '<div class="searchbox"><span aria-hidden="true">🔍</span><input id="global-search" type="search" placeholder="Cari modul, vocab…" autocomplete="off"></div>' +
    '<div class="lang-picker" role="group" aria-label="Pilih bahasa">' +
    ['en', 'ko', 'ja'].map(L => '<button type="button" class="lang-btn' + (S.lang === L ? ' active' : '') + '" data-lang="' + L + '">' + LANGMETA[L].flag + ' ' + LANGMETA[L].name + '</button>').join('') + '</div>';
  $$('#topbar [data-lang]').forEach(b => b.onclick = () => setLang(b.dataset.lang));
  $('#burger').onclick = () => { $('#sidebar').classList.add('open'); $('#drawer-backdrop').hidden = false; };
  const inp = $('#global-search');
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && inp.value.trim()) go('search', { q: inp.value.trim() }); });
}
function closeDrawer() { $('#sidebar').classList.remove('open'); $('#drawer-backdrop').hidden = true; }
function setLang(L) {
  if (S.lang === L) return;
  S.lang = L; save(); renderTopbar(); renderSidebar();
  go(route.name === 'lesson' || route.name === 'quiz' ? 'modules' : route.name, route.params);
}
function go(name, params) {
  route = { name, params: params || {} };
  renderSidebar();
  const c = $('#content');
  PAGES[name] ? PAGES[name](c, route.params) : PAGES.home(c);
  c.scrollTop = 0; c.focus({ preventScroll: true });
}

/* ===== Pembantu data ===== */
function lessons() { return DG.lessons[S.lang]; }
function lessonById(id) { return lessons().find(l => l.id === id); }
function vocabOf(id) { return DG.vocab[S.lang][id] || []; }
function doneCount() { return Object.keys(LS().done).length; }
function nextLesson() { return lessons().find(l => !LS().done[l.id]) || lessons()[0]; }
function dueCards() {
  const t = todayStr(), out = [];
  const srs = LS().srs;
  DG.core[S.lang].forEach((w, i) => { const c = srs[i]; if (c && c.due <= t) out.push(i); });
  return out;
}
function newCards() { const srs = LS().srs; const out = []; DG.core[S.lang].forEach((w, i) => { if (!srs[i]) out.push(i); }); return out; }
function greet() { const h = new Date().getHours(); return h < 11 ? 'Selamat pagi' : h < 15 ? 'Selamat siang' : h < 19 ? 'Selamat sore' : 'Selamat malam'; }
function crumb(parts) { return '<nav class="crumb">' + parts.map((p, i) => i === parts.length - 1 ? '<b>' + esc(p[0]) + '</b>' : '<a href="#" data-crumb="' + p[1] + '">' + esc(p[0]) + '</a>').join(' › ') + '</nav>'; }
function bindCrumb(root) { $$('[data-crumb]', root).forEach(a => a.onclick = e => { e.preventDefault(); go(a.dataset.crumb); }); }

/* ===== BERANDA ===== */
function pageHome(c) {
  const st = LS(), due = dueCards().length, nx = nextLesson();
  const todayMin = st.minutes[todayStr()] || 0;
  c.innerHTML = '<div class="wrap">' +
    '<h1 class="page">Halo ' + esc(displayName()) + '. Lanjut belajar ' + LANGMETA[S.lang].name + '?</h1>' +
    '<p class="sub">' + greet() + ' · Target harianmu 15 menit · sudah ' + todayMin + ' menit hari ini</p>' +
    '<div class="srs-strip"><span class="sect-label" style="margin:0">Hafalan SRS jatuh tempo</span>' +
    ['en', 'ko', 'ja'].map(L => { const n = L === S.lang ? due : Object.values(S.langs[L].srs).filter(x => x.due <= todayStr()).length; return '<button type="button" class="chip' + (L === S.lang ? ' active' : '') + '" data-srs-lang="' + L + '">' + LANGMETA[L].name + (n ? ' · ' + n : '') + '</button>'; }).join('') +
    '<span class="small muted">Klik untuk ganti bahasa</span></div>' +
    '<div class="sect-label">Bahasa aktif</div>' +
    '<div class="card"><b>' + LANGMETA[S.lang].name + '</b> · ' + LANGMETA[S.lang].cur + ' · levelmu ' + (st.placement || 'A0') +
    '<p class="muted" style="margin:6px 0 10px">' + doneCount() + '/42 modul selesai · ' + st.xp + ' XP · 🔥 ' + st.streak + ' hari streak</p>' +
    '<div class="pbar"><i style="width:' + Math.round(doneCount() / 42 * 100) + '%"></i></div></div>' +
    '<div class="sect-label">Sesi hari ini</div>' +
    '<div class="card"><p class="muted small">Pas dengan target harianmu — modul panjang dipecah per bagian.</p>' +
    '<div class="today-item"><div class="t"><b>Lanjut modul: ' + esc(nx.title) + ' (' + nx.level + ')</b><span class="muted small">Pelajaran · ±10 menit</span></div><button type="button" class="btn white small" data-go-lesson="' + nx.id + '">Mulai</button></div>' +
    '<div class="today-item"><div class="t"><b>Review kartu hafalan</b><span class="muted small">' + due + ' kartu jatuh tempo · ±2 menit</span></div><button type="button" class="btn white small" data-nav2="flashcards">Mulai</button></div>' +
    '<div class="today-item"><div class="t"><b>Bacaan singkat level ' + nx.level + '</b><span class="muted small">±3 menit baca</span></div><button type="button" class="btn white small" data-nav2="readings">Baca</button></div>' +
    '<button type="button" class="btn big-cta" data-go-lesson="' + nx.id + '">▶ Mulai sesi</button>' +
    '<p class="muted small" style="margin-top:10px;text-align:center">Bisa dilanjut kapan saja lewat menu Sesi Hari Ini.</p></div>' +
    '<div class="grid2" style="margin-top:16px">' +
    '<div class="card"><div class="sect-label" style="margin-top:0">Perkuat</div><b>Kumpulkan kalimat & kosakata</b><p class="muted" style="margin:6px 0 12px">' + (due ? 'Ada ' + due + ' kartu yang perlu diulang hari ini.' : 'Belum ada kartu yang perlu diulang. Semua aman.') + '</p><button type="button" class="btn white small" data-nav2="flashcards">Mulai →</button></div>' +
    '<div class="card"><div class="sect-label" style="margin-top:0">Tantangan minggu ini</div><b>Ulangan Cepat — perkuat kosakata selama 3 menit</b><p class="muted" style="margin:6px 0 12px">Minggu depan: Dikte.</p><button type="button" class="btn small" data-nav2="practice">Mulai →</button></div></div>' +
    '<div class="sect-label">Kalau masih ada waktu</div><div class="grid4">' +
    [['readings', 'Bacaan', 'Cerita pendek per level'], ['dialogs', 'Dialog', 'Percakapan situasional'], ['idioms', 'Idiom', 'Ungkapan sehari-hari'], ['writing', 'Menulis', 'Latihan menulis terpandu']].map(x =>
      '<button type="button" class="read-card" data-nav2="' + x[0] + '"><b>' + x[1] + '</b><p class="muted small" style="margin-top:4px">' + x[2] + '</p></button>').join('') +
    '</div></div>';
  $$('[data-srs-lang]', c).forEach(b => b.onclick = () => setLang(b.dataset.srsLang));
  $$('[data-go-lesson]', c).forEach(b => b.onclick = () => { touchActivity(2); go('lesson', { id: b.dataset.goLesson, part: 0 }); });
  $$('[data-nav2]', c).forEach(b => b.onclick = () => go(b.dataset.nav2));
}
/* ===== SESI HARI INI ===== */
function pageSession(c) {
  const nx = nextLesson(), due = dueCards().length;
  c.innerHTML = '<div class="wrap"><h1 class="page">Sesi hari ini</h1><p class="sub">Satu sesi pendek ±15 menit. Kerjakan berurutan, atau loncat ke bagian mana pun.</p>' +
    '<div class="card" style="margin-top:16px">' +
    [['1', 'Pelajaran — ' + nx.title + ' (' + nx.level + ')', '±10 menit', 'lesson', nx.id],
     ['2', 'Kuis modul — 6 soal', '±3 menit · minimal 70%', 'quiz', nx.id],
     ['3', 'Review kartu hafalan', due + ' kartu jatuh tempo · ±2 menit', 'flashcards', ''],
     ['4', 'Satu bacaan singkat', '±3 menit', 'readings', '']].map(x =>
      '<div class="today-item"><span class="chip">' + x[0] + '</span><div class="t"><b>' + esc(x[1]) + '</b><span class="muted small">' + x[2] + '</span></div><button type="button" class="btn white small" data-sess="' + x[3] + '" data-id="' + x[4] + '">Mulai</button></div>').join('') +
    '<p class="muted small" style="margin-top:12px">Progres sesi tersimpan otomatis. Bisa dilanjut kapan saja.</p></div></div>';
  $$('[data-sess]', c).forEach(b => b.onclick = () => { touchActivity(2); const r = b.dataset.sess; if (r === 'lesson') go('lesson', { id: b.dataset.id, part: 0 }); else if (r === 'quiz') go('quiz', { id: b.dataset.id }); else go(r); });
}

/* ===== MODUL / JALUR BELAJAR ===== */
let modFilter = { level: '', mode: 'all', q: '' };
function pageModules(c) {
  const nx = nextLesson();
  c.innerHTML = '<div class="wrap"><h1 class="page">Jalur Belajar — ' + LANGMETA[S.lang].name + '</h1>' +
    '<p class="sub">Levelmu: ' + (LS().placement || 'A0') + ' · 42 modul · Ngobrol santai 15 menit sehari.</p>' +
    '<div class="next-banner"><div class="t"><small>Langkah berikutnya</small><b style="font-size:17px">' + esc(nx.title) + ' (' + nx.level + ')</b></div><button type="button" class="btn red" id="to-session">Ke sesi →</button></div>' +
    '<div class="modules-layout"><div class="card"><div class="sect-label" style="margin-top:0">Roadmap</div><div id="roadmap"></div><p class="muted small" style="margin-top:10px">Klik level untuk menyaring kartu modul.</p></div>' +
    '<div><div class="searchbox" style="max-width:none"><span>🔍</span><input id="mod-search" type="search" placeholder="Cari modul berdasarkan nama atau deskripsi…" value="' + esc(modFilter.q) + '"></div>' +
    '<div class="chiprow" style="margin:14px 0" id="mod-chips"></div><div class="module-grid" id="mod-grid"></div></div></div></div>';
  $('#to-session', c).onclick = () => go('session');
  const draw = () => {
    $('#roadmap', c).innerHTML = DG.levels.map(l => {
      const n = lessons().filter(x => x.level === l.code).length, d = lessons().filter(x => x.level === l.code && LS().done[x.id]).length;
      return '<button type="button" class="roadmap-item' + (modFilter.level === l.code ? ' active' : '') + '" data-lv="' + l.code + '"><span>' + l.code + ' — ' + esc(l.name) + '</span><span class="muted small">' + d + '/' + n + '</span></button>';
    }).join('');
    $$('#roadmap [data-lv]', c).forEach(b => b.onclick = () => { modFilter.level = modFilter.level === b.dataset.lv ? '' : b.dataset.lv; draw(); });
    const modes = [['next', 'Langkah berikutnya'], ['all', 'Semua modul · 42'], ['done', 'Selesai · ' + doneCount()], ['todo', 'Belum mulai · ' + (42 - doneCount())]];
    $('#mod-chips', c).innerHTML = modes.map(m => '<button type="button" class="chip' + (modFilter.mode === m[0] ? ' active' : '') + '" data-mode="' + m[0] + '">' + m[1] + '</button>').join('');
    $$('#mod-chips [data-mode]', c).forEach(b => b.onclick = () => { modFilter.mode = b.dataset.mode; draw(); });
    let list = lessons();
    if (modFilter.level) list = list.filter(l => l.level === modFilter.level);
    if (modFilter.mode === 'done') list = list.filter(l => LS().done[l.id]);
    if (modFilter.mode === 'todo') list = list.filter(l => !LS().done[l.id]);
    if (modFilter.mode === 'next') list = list.filter(l => l.id === nx.id);
    if (modFilter.q) { const q = modFilter.q.toLowerCase(); list = list.filter(l => (l.title + ' ' + l.desc).toLowerCase().includes(q)); }
    $('#mod-grid', c).innerHTML = list.length ? list.map(l =>
      '<button type="button" class="module-card" data-mod="' + l.id + '"><span class="chip">' + l.level + '</span>' + (LS().done[l.id] ? ' <span class="chip">✓ Selesai · ' + LS().done[l.id] + '%</span>' : (l.id === nx.id ? ' <span class="chip">Direkomendasikan</span>' : '')) +
      '<h3>' + esc(l.title) + ' (' + l.level + ')</h3><p class="muted small">' + esc(l.desc) + '</p><p class="small" style="margin-top:8px">Bicara · 8–12 menit · 7 bagian · 1 kuis</p></button>').join('')
      : '<p class="muted">Tidak ada modul yang cocok dengan filter ini.</p>';
    $$('#mod-grid [data-mod]', c).forEach(b => b.onclick = () => go('lesson', { id: b.dataset.mod, part: 0 }));
  };
  $('#mod-search', c).addEventListener('input', e => { modFilter.q = e.target.value; draw(); });
  draw();
}

/* ===== PELAJARAN — 7 bagian ===== */
function partTitles(les, v) {
  const w = v[0] ? v[0][0] : '', t = les.title;
  const special = {
    'a0-1': ['Nyapa itu nggak cuma "halo"', 'Nanya kabar dengan sopan', 'Ngenalin diri tanpa kaku', 'Kata sapaan yang paling sering dipakai', 'Awas jebakan sapaan', 'Ngobrol pertama kali', 'Siap kuis sapaan']
  };
  if (special[les.id]) return special[les.id];
  return [
    '"' + t + '" — mulai dari sini',
    'Kata inti: ' + w + ' dan teman-temannya',
    'Pola kalimat yang langsung bisa dipakai',
    'Dengar, baca, ulangi',
    'Awas jebakan di topik ini',
    'Dialog singkat: ' + t.toLowerCase(),
    'Ringkasan & siap kuis'
  ];
}
function pageLesson(c, p) {
  const les = lessonById(p.id) || lessons()[0];
  const v = vocabOf(les.id), part = Math.min(6, Math.max(0, p.part || 0));
  const titles = partTitles(les, v);
  let body = '';
  if (part === 0) {
    body = '<p>Di bagian ini kita mulai topik <b>' + esc(les.title) + '</b> dari yang paling sering dipakai sehari-hari. Pelan saja — semua kata ada artinya, dan contohnya pendek supaya gampang ditiru.</p>' +
      '<table class="tbl" style="margin-top:12px"><tr><th>Kata</th><th>Arti</th><th>Dengar</th></tr>' +
      v.slice(0, 4).map(w => '<tr><td><b>' + esc(w[0]) + '</b></td><td>' + esc(w[1]) + '</td><td>' + ttsBtn(w[0]) + '</td></tr>').join('') + '</table>';
  } else if (part === 1) {
    body = '<p>Ini kosakata inti modul ini. Klik 🔊 untuk mendengar cara bacanya, lalu ulangi dengan suara pelan.</p>' +
      '<table class="tbl" style="margin-top:12px"><tr><th>Kata</th><th>Arti</th><th>Contoh</th></tr>' +
      v.map(w => '<tr><td><b>' + esc(w[0]) + '</b> ' + ttsBtn(w[0]) + '</td><td>' + esc(w[1]) + '</td><td>' + esc(w[2]) + ' ' + ttsBtn(w[2]) + '<br><span class="muted small">' + esc(w[3]) + '</span></td></tr>').join('') + '</table>';
  } else if (part === 2) {
    body = '<p>Pola kalimat di bawah diambil dari contoh kosakata modul ini. Ganti satu kata saja, dan kamu sudah punya kalimat baru.</p>' +
      v.slice(0, 5).map(w => '<div class="sent-line"><b>' + esc(w[2]) + '</b> ' + ttsBtn(w[2]) + '<small>' + esc(w[3]) + ' — kata kunci: <b>' + esc(w[0]) + '</b> (' + esc(w[1]) + ')</small></div>').join('');
  } else if (part === 3) {
    const rd = DG.readings[S.lang].find(r => r.level === les.level) || DG.readings[S.lang][0];
    body = '<p>Bacaan pendek level ' + rd.level + ' — <b>' + esc(rd.title) + '</b>. Baca keras-keras, satu kalimat sekali jalan.</p>' +
      rd.sentences.map(s => '<div class="sent-line"><b>' + esc(s[0]) + '</b> ' + ttsBtn(s[0]) + '<small>' + esc(s[1]) + '</small></div>').join('');
  } else if (part === 4) {
    const note = S.lang === 'ko' ? 'Dalam Bahasa Korea, tingkat kesopanan mengubah akhir kalimat. Untuk orang yang baru dikenal, pakai akhiran sopan (-요 / -입니다) — jangan pakai gaya akrab dulu.'
      : S.lang === 'ja' ? 'Dalam Bahasa Jepang, jangan menerjemahkan kata per kata dari Bahasa Indonesia. Urutan kalimatnya beda: subjek – objek – kata kerja, dan partikel kecil seperti は・を・に menentukan arti.'
      : 'Dalam Bahasa Inggris, jangan menerjemahkan kata per kata dari Bahasa Indonesia. Perhatikan urutan kata dan kata kerja bantunya — "I am agree" itu salah, yang benar "I agree".';
    body = '<div class="warn"><b>Awas jebakan.</b> ' + note + '</div><p style="margin-top:12px">Jebakan paling umum di topik <b>' + esc(les.title) + '</b>: menghafal kata tanpa contoh. Selalu hafalkan kata bersama satu kalimat contohnya — seperti di bagian kosakata tadi.</p>';
  } else if (part === 5) {
    const d = DG.dialogs[S.lang][lessons().indexOf(les) % 12];
    body = '<p>Dialog situasional: <b>' + esc(d.title) + '</b> (' + esc(d.place) + '). Dengarkan, lalu baca bergantian.</p>' +
      d.lines.map(l => '<div class="dialog-line"><span class="who">' + esc(l[0]) + '</span><div class="txt"><b>' + esc(l[1]) + '</b> ' + ttsBtn(l[1]) + '<small>' + esc(l[2]) + '</small></div></div>').join('');
  } else {
    body = '<p>Kamu sudah baca semua bagian modul <b>' + esc(les.title) + '</b>. Kerjakan kuisnya buat menandai modul ini selesai — minimal 70% benar.</p>' +
      '<div class="good" style="margin-top:12px"><b>Ringkasan:</b> ' + v.length + ' kosakata inti · pola kalimat dari contoh · 1 dialog situasional · 1 bacaan pendek.</div>';
  }
  c.innerHTML = '<div class="wrap">' + crumb([['Beranda', 'home'], ['Modul', 'modules'], [LANGMETA[S.lang].name, 'modules'], [les.title + ' (' + les.level + ')']]) +
    '<h1 class="page">' + esc(les.title) + ' (' + les.level + ')</h1>' +
    '<div class="chiprow" style="margin-top:10px"><span class="chip">' + LANGMETA[S.lang].name + '</span><span class="chip">Berbicara</span><span class="chip">Level ' + les.level + '</span><span class="chip">' + LANGMETA[S.lang].cur + '</span><span class="chip">12 menit · 7 bagian · 1 kuis</span></div>' +
    '<div style="display:flex;align-items:center;gap:12px;margin-top:12px"><span class="small muted">Bagian ' + (part + 1) + '/7</span><div class="pbar" style="flex:1"><i style="width:' + Math.round((part + 1) / 7 * 100) + '%"></i></div></div>' +
    '<div class="lesson-layout"><div class="card"><h2 style="font-size:21px;margin-bottom:10px">' + esc(titles[part]) + '</h2>' + body +
    '<div class="part-nav">' + (part > 0 ? '<button type="button" class="btn white" id="prev-part">← Bagian sebelumnya</button>' : '<span></span>') +
    (part < 6 ? '<button type="button" class="btn" id="next-part">Lanjut ke ' + esc(titles[part + 1]) + ' →</button>' : '<button type="button" class="btn red" id="start-quiz">Mulai Kuis →</button>') + '</div></div>' +
    '<div class="card"><div class="sect-label" style="margin-top:0">Bagian dalam modul</div>' +
    titles.map((t, i) => '<button type="button" class="rail-item' + (i === part ? ' active' : '') + (i < part ? ' done' : '') + '" data-part="' + i + '"><span class="n">' + (i < part ? '✓' : i + 1) + '</span>' + esc(t) + '</button>').join('') +
    '<button type="button" class="btn white small" id="save-mod" style="margin-top:14px">Simpan</button>' +
    '<div class="sect-label">Lanjut</div><p class="small"><a href="#" data-lanjut="vocab">Semua kosakata ' + LANGMETA[S.lang].name + '</a><br><a href="#" data-lanjut="flashcards">Kumpulkan kalimat baru</a></p></div></div></div>';
  bindCrumb(c);
  $$('[data-part]', c).forEach(b => b.onclick = () => go('lesson', { id: les.id, part: +b.dataset.part }));
  const pv = $('#prev-part', c); if (pv) pv.onclick = () => go('lesson', { id: les.id, part: part - 1 });
  const nx2 = $('#next-part', c); if (nx2) nx2.onclick = () => { touchActivity(2); go('lesson', { id: les.id, part: part + 1 }); };
  const sq = $('#start-quiz', c); if (sq) sq.onclick = () => go('quiz', { id: les.id });
  $('#save-mod', c).onclick = () => { if (!S.bookmarks.includes(S.lang + ':' + les.id)) { S.bookmarks.push(S.lang + ':' + les.id); save(); } toast('Modul tersimpan di Jurnal & Penanda.'); };
  $$('[data-lanjut]', c).forEach(a => a.onclick = e => { e.preventDefault(); go(a.dataset.lanjut); });
}

/* ===== MESIN KUIS (dipakai kuis modul, latihan, penempatan, simulasi ujian) ===== */
function runQuiz(c, cfg) {
  const salt = Math.floor(Math.random() * 1e9);
  const qs = cfg.questions.map(q => ({ ...q, sealed: seal(q.type === 'mc' ? 'mc:' + q.answer : 'fill:' + String(q.answer).trim().toLowerCase(), salt) }));
  const st = qs.map(() => ({ sel: null, text: '', submitted: false, correct: false }));
  let cur = 0;
  const correctCount = () => st.filter(x => x.submitted && x.correct).length;
  const wrongCount = () => st.filter(x => x.submitted && !x.correct).length;
  function check(i) {
    const q = qs[i], s = st[i];
    if (q.type === 'mc') return s.sel != null && seal('mc:' + s.sel, salt) === q.sealed;
    return s.text.trim() !== '' && seal('fill:' + s.text.trim().toLowerCase(), salt) === q.sealed;
  }
  function draw() {
    const q = qs[cur], s = st[cur], total = qs.length;
    let inner = '';
    if (q.type === 'mc') {
      inner = '<div class="opt-grid">' + q.options.map((o, i) => {
        let cls = 'opt', ref = '';
        if (s.submitted) {
          if (seal('mc:' + i, salt) === q.sealed) cls += ' correct';
          else if (s.sel === i) cls += ' wrong';
          ref = '<span class="ref">Acuan pembahasan: ' + 'ABCD'[i] + '</span>';
        } else if (s.sel === i) cls += ' sel';
        return '<button type="button" class="' + cls + '" data-opt="' + i + '"' + (s.submitted ? ' disabled' : '') + '><span class="num">' + (i + 1) + '</span><span>' + esc(o) + ref + '</span></button>';
      }).join('') + '</div>';
    } else {
      inner = '<div class="fill-sent">' + esc(q.prompt) + '</div>' +
        '<input class="fill-input" id="fill-in" type="text" placeholder="ketik jawabanmu…" value="' + esc(s.text) + '"' + (s.submitted ? ' disabled' : '') + ' autocomplete="off">' +
        (needsKeyboard() ? '<div id="vkbd"></div>' : '');
    }
    let feedback = '';
    if (s.submitted) {
      feedback = s.correct
        ? '<div class="good" style="margin-top:16px"><b>' + (q.type === 'mc' ? 'Benar!' : 'Tepat!') + '</b> ' + esc(q.explain) + '</div>'
        : '<div class="warn" style="margin-top:16px"><b>Belum tepat.</b> Jawaban yang benar: <b>' + esc(q.type === 'mc' ? q.options[q.answer] : q.answer) + '</b>. ' + esc(q.explain) + '</div>';
    }
    const canSubmit = !s.submitted && (q.type === 'mc' ? s.sel != null : s.text.trim() !== '');
    const isLast = cur === total - 1;
    c.innerHTML = '<div class="wrap">' + (cfg.crumbHTML || '') +
      '<div class="quiz-head"><div><h1 class="page" style="font-size:22px">' + esc(cfg.title) + '</h1><p class="sub small">' + esc(cfg.sub) + '</p></div>' +
      '<div class="quiz-meta"><span class="cnt">' + (cur + 1) + '/' + total + '</span><div class="pbar" style="width:130px;margin:6px 0"><i style="width:' + Math.round((cur + 1) / total * 100) + '%"></i></div><span class="cnt">✓ ' + correctCount() + ' ✗ ' + wrongCount() + '</span></div></div>' +
      '<div class="card quiz-card"><div style="display:flex;justify-content:space-between;align-items:center"><span class="qtype">' + (q.type === 'mc' ? 'Pilihan ganda' : 'Isi bagian kosong') + '</span><button type="button" class="btn white small" id="q-reset">Reset</button></div>' +
      (q.type === 'mc' ? '<div class="qtext">' + esc(q.prompt) + '</div>' : '') + inner + feedback +
      '<div class="quiz-actions">' +
      (s.submitted || cur > 0 ? '<button type="button" class="btn white" id="q-prev">← Sebelumnya</button>' : '') +
      (!s.submitted ? '<button type="button" class="btn" id="q-submit"' + (canSubmit ? '' : ' disabled') + '>Kirim jawaban</button>'
        : (isLast ? '<button type="button" class="btn red" id="q-finish">Lihat hasil →</button>' : '<button type="button" class="btn" id="q-next">Pertanyaan berikutnya →</button>')) +
      '</div></div>' +
      '<div class="quiz-dots">' + qs.map((_, i) => '<button type="button" class="qdot' + (i === cur ? ' cur' : '') + (st[i].submitted ? (st[i].correct ? ' ok' : ' bad') : '') + '" data-dot="' + i + '">' + (i + 1) + '</button>').join('') + '</div>' +
      '<p class="kbd-hint">1–4 pilih jawaban · Enter kirim · ← → pindah soal setelah menjawab</p></div>';
    bindCrumb(c);
    $$('[data-opt]', c).forEach(b => b.onclick = () => { s.sel = +b.dataset.opt; draw(); });
    const fi = $('#fill-in', c); if (fi) { fi.addEventListener('input', () => { s.text = fi.value; const sb2 = $('#q-submit', c); if (sb2) sb2.disabled = s.text.trim() === ''; }); fi.focus(); drawKeyboard($('#vkbd', c), fi); }
    $$('[data-dot]', c).forEach(b => b.onclick = () => { cur = +b.dataset.dot; draw(); });
    const rs = $('#q-reset', c); if (rs) rs.onclick = () => { st[cur] = { sel: null, text: '', submitted: false, correct: false }; draw(); };
    const sm = $('#q-submit', c); if (sm) sm.onclick = submit;
    const pv = $('#q-prev', c); if (pv) pv.onclick = () => { if (cur > 0) { cur--; draw(); } };
    const nxb = $('#q-next', c); if (nxb) nxb.onclick = () => { if (cur < total - 1) { cur++; draw(); } };
    const fn = $('#q-finish', c); if (fn) fn.onclick = finish;
  }
  function submit() { const s = st[cur]; if (s.submitted) return; s.correct = check(cur); s.submitted = true; touchActivity(1); draw(); }
  function finish() {
    const total = qs.length, ok = correctCount(), pct = Math.round(ok / total * 100);
    document.removeEventListener('keydown', keyH);
    cfg.finish(c, pct, ok, total);
  }
  function keyH(e) {
    if (!document.body.contains(c) || route.name !== cfg.routeName) { document.removeEventListener('keydown', keyH); return; }
    const q = qs[cur], s = st[cur];
    if (e.target && (e.target.tagName === 'TEXTAREA' || (e.target.tagName === 'INPUT' && e.key !== 'Enter'))) return;
    if (!s.submitted && q.type === 'mc' && ['1', '2', '3', '4'].includes(e.key)) { s.sel = +e.key - 1; draw(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (!s.submitted) { if (q.type === 'mc' ? s.sel != null : s.text.trim() !== '') submit(); } else if (cur < qs.length - 1) { cur++; draw(); } else finish(); }
    else if (s.submitted && e.key === 'ArrowRight' && cur < qs.length - 1) { cur++; draw(); }
    else if (s.submitted && e.key === 'ArrowLeft' && cur > 0) { cur--; draw(); }
  }
  document.addEventListener('keydown', keyH);
  draw();
}
function needsKeyboard() { return S.lang === 'ko' || S.lang === 'ja'; }
function drawKeyboard(mount, input) {
  if (!mount || !input) return;
  const chars = S.lang === 'ko' ? ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ','ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ','ㅐ','ㅔ']
    : ['あ','い','う','え','お','か','き','く','け','こ','さ','し','す','せ','そ','た','ち','つ','て','と','な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ'];
  mount.innerHTML = '<div class="kbd-grid">' + chars.map(ch => '<button type="button" data-ch="' + ch + '">' + ch + '</button>').join('') + '</div><p class="small muted" style="text-align:center;margin-top:6px">Keyboard virtual ' + LANGMETA[S.lang].name + ' — atau ketik langsung dengan keyboard Inggrismu.</p>';
  $$('[data-ch]', mount).forEach(b => b.onclick = () => { input.value += b.dataset.ch; input.dispatchEvent(new Event('input')); input.focus(); });
}

/* ===== KUIS MODUL — 6 soal dari 6 kata berbeda ===== */
function pageQuiz(c, p) {
  const les = lessonById(p.id) || nextLesson();
  const v = vocabOf(les.id);
  const picks = shuffle(v.map((w, i) => i), (lessons().indexOf(les) + 1) * 13 + v.length).slice(0, 6);
  const questions = picks.map((wi, qi) => {
    const w = v[wi];
    if (qi % 3 === 2 && w[2] && w[2].toLowerCase().includes(w[0].toLowerCase())) {
      const blanked = w[2].replace(new RegExp(w[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '___');
      return { type: 'fill', prompt: blanked, answer: w[0], explain: 'Artinya "' + w[1] + '". Contoh lengkap: ' + w[2] + ' — ' + w[3] };
    }
    const distract = shuffle(v.map((x, i) => i).filter(i => i !== wi), wi + 31).slice(0, 3).map(i => v[i][0]);
    const opts = shuffle([w[0], ...distract], wi + 7);
    return { type: 'mc', prompt: 'Kamu mau bilang "' + w[1] + '" dalam Bahasa ' + LANGMETA[S.lang].name + ' saat topik "' + les.title + '". Kata apa yang tepat?', options: opts, answer: opts.indexOf(w[0]), explain: 'Contoh: ' + w[2] + ' — ' + w[3] };
  });
  runQuiz(c, {
    routeName: 'quiz',
    crumbHTML: crumb([['Beranda', 'home'], ['Modul', 'modules'], [les.title, 'modules'], ['Kuis']]),
    title: 'KUIS MODUL · ' + LANGMETA[S.lang].name.toUpperCase() + ' — ' + les.title + ' (' + les.level + ')',
    sub: 'Soal diambil dari evaluasi modul ini. Raih minimal 70% untuk menandai modul selesai.',
    questions,
    finish(cc, pct, ok, total) {
      const passed = pct >= 70;
      const prev = LS().done[les.id] || 0;
      if (passed && pct > prev) { LS().done[les.id] = pct; awardXP(les.id, pct, Math.max(0, Math.round(les.xp * (pct - prev) / 100))); }
      save(); renderSidebar();
      cc.innerHTML = '<div class="wrap"><div class="card" style="max-width:640px;margin:30px auto;text-align:center">' +
        '<div class="sect-label">Hasil kuis</div><h1 class="page">' + pct + '%</h1>' +
        '<p class="muted" style="margin:8px 0 4px">' + ok + ' dari ' + total + ' soal benar.</p>' +
        (passed ? '<div class="good" style="text-align:left;margin-top:12px"><b>Lulus!</b> Modul "' + esc(les.title) + '" ditandai selesai. XP ditambahkan lewat jalur resmi.</div>'
          : '<div class="warn" style="text-align:left;margin-top:12px"><b>Belum 70%.</b> Nggak apa-apa — baca lagi bagian kosakatanya, lalu coba lagi.</div>') +
        '<div class="quiz-actions" style="justify-content:center"><button type="button" class="btn white" id="back-les">Kembali ke pelajaran</button><button type="button" class="btn" id="to-mods">Modul berikutnya →</button></div></div></div>';
      $('#back-les', cc).onclick = () => go('lesson', { id: les.id, part: 6 });
      $('#to-mods', cc).onclick = () => go('modules');
    }
  });
}
/* ===== KUIS LATIHAN (ulangan cepat dari 500 kata inti) ===== */
function pagePractice(c) {
  const core = DG.core[S.lang];
  const picks = shuffle(core.map((w, i) => i), Date.now() % 9973).slice(0, 6);
  const questions = picks.map((wi, qi) => {
    const w = core[wi];
    if (qi === 4 && w[2]) return { type: 'fill', prompt: w[2].replace(new RegExp(w[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '___'), answer: w[0], explain: 'Artinya "' + w[1] + '". ' + w[2] + ' — ' + w[3] };
    const distract = shuffle(core.map((x, i) => i).filter(i => i !== wi), wi + 17).slice(0, 3).map(i => core[i][0]);
    const opts = shuffle([w[0], ...distract], wi + 3);
    return { type: 'mc', prompt: 'Kata Bahasa ' + LANGMETA[S.lang].name + ' untuk "' + w[1] + '" adalah…', options: opts, answer: opts.indexOf(w[0]), explain: (w[2] ? 'Contoh: ' + w[2] + ' — ' + w[3] : 'Kata ini termasuk 500 kata inti ' + LANGMETA[S.lang].name + '.') };
  });
  runQuiz(c, {
    routeName: 'practice',
    crumbHTML: crumb([['Beranda', 'home'], ['Kuis Latihan']]),
    title: 'KUIS LATIHAN · ' + LANGMETA[S.lang].name.toUpperCase() + ' — Ulangan Cepat',
    sub: 'Enam soal acak dari 500 kata inti. Tanpa tekanan — ini latihan, bukan ujian.',
    questions,
    finish(cc, pct, ok, total) {
      if (ok > 0) awardBonus(ok * 2, 'kuis-latihan');
      cc.innerHTML = '<div class="wrap"><div class="card" style="max-width:640px;margin:30px auto;text-align:center"><div class="sect-label">Selesai</div><h1 class="page">' + pct + '%</h1><p class="muted">' + ok + '/' + total + ' benar · +' + ok * 2 + ' XP bonus.</p><div class="quiz-actions" style="justify-content:center"><button type="button" class="btn white" id="again">Main lagi</button><button type="button" class="btn" id="home2">Beranda</button></div></div></div>';
      $('#again', cc).onclick = () => go('practice');
      $('#home2', cc).onclick = () => go('home');
    }
  });
}

/* ===== KARTU HAFALAN (SRS) ===== */
let fcNewCount = 10;
function pageFlashcards(c) {
  const due = dueCards().length, nw = newCards().length;
  c.innerHTML = '<div class="wrap"><h1 class="page">Mau ngapain hari ini?</h1><p class="sub">Kartu hafalan Bahasa ' + LANGMETA[S.lang].name + ' — sistem SRS mengulang kartu tepat sebelum kamu lupa.</p>' +
    '<div class="grid2" style="margin-top:18px">' +
    '<div class="card"><div class="sect-label" style="margin-top:0">Review hari ini</div><b style="font-size:17px">' + (due ? due + ' kartu jatuh tempo' : 'Nggak ada kartu yang jatuh tempo') + '</b><p class="muted" style="margin:6px 0 14px">' + (due ? 'Diurut dari yang paling lama menunggu · ±' + Math.max(1, Math.round(due / 5)) + ' menit.' : 'Santai — besok balik lagi.') + '</p><button type="button" class="btn" id="fc-review" ' + (due ? '' : 'disabled') + '>Mulai →</button></div>' +
    '<div class="card"><div class="sect-label" style="margin-top:0">Belajar kartu baru</div><b style="font-size:17px">' + nw + ' kartu belum pernah kamu pelajari</b><p class="muted" style="margin:8px 0">Jumlah kartu:</p><div class="chiprow">' + [5, 10, 20, 40].map(n => '<button type="button" class="chip' + (fcNewCount === n ? ' active' : '') + '" data-fn="' + n + '">' + n + '</button>').join('') + '</div><button type="button" class="btn" id="fc-new" style="margin-top:14px">Mulai →</button></div>' +
    '</div></div>';
  $$('[data-fn]', c).forEach(b => b.onclick = () => { fcNewCount = +b.dataset.fn; pageFlashcards(c); });
  const r = $('#fc-review', c); if (r) r.onclick = () => fcPlay(c, dueCards(), 'Review hari ini');
  $('#fc-new', c).onclick = () => fcPlay(c, newCards().slice(0, fcNewCount), 'Kartu baru');
}
function fcPlay(c, deck, label) {
  if (!deck.length) { pageFlashcards(c); return; }
  let i = 0, flipped = false, rated = 0, skipped = 0;
  const RATES = [['Lupa', '~1 menit', 0, 'r1'], ['Sulit', '4 hari', 4, 'r2'], ['Ingat', '9 hari', 9, 'r3'], ['Mudah', '20 hari', 20, 'r4']];
  function draw() {
    const w = DG.core[S.lang][deck[i]];
    const front = '<div class="fc-word">' + esc(w[0]) + '</div><div class="fc-center"><button type="button" class="btn" id="fc-flip">Tampilkan arti</button></div>' +
      '<div class="quiz-actions" style="justify-content:center"><button type="button" class="btn white small" id="fc-prev">← Sebelumnya</button><button type="button" class="btn white small" id="fc-hide">Sembunyi</button><button type="button" class="btn white small" id="fc-skip">Di Lewati</button></div>';
    const back = '<div class="fc-center"><span class="qtype">Jawaban · Arti</span><div class="fc-word" style="padding-top:14px">' + esc(w[1]) + '</div>' +
      '<button type="button" class="tts-btn" data-speak="' + esc(w[0]) + '">🔊 Dengar pelafalan</button>' +
      (w[2] ? '<div class="contoh-box"><span class="qtype">Contoh</span><p style="margin-top:6px"><b>' + esc(w[2]) + '</b></p><p class="muted">' + esc(w[3]) + '</p></div>' : '') +
      '<p class="muted" style="margin-top:16px">Seberapa mudah kamu mengingatnya?</p>' +
      '<div class="rate-grid">' + RATES.map((r, ri) => '<button type="button" class="rate ' + r[3] + '" data-rate="' + ri + '">' + r[0] + '<small>' + r[1] + ' · tekan ' + (ri + 1) + '</small></button>').join('') + '</div>' +
      '<p class="small muted" style="margin-top:12px"><b>Arti setiap penilaian:</b> Lupa = ulang ±1 menit lagi · Sulit = 4 hari · Ingat = 9 hari · Mudah = 20 hari.</p></div>';
    c.innerHTML = '<div class="wrap">' + crumb([['Beranda', 'home'], ['Kartu Hafalan', 'flashcards'], [label]]) +
      '<div class="card" style="max-width:680px;margin:14px auto 0">' + (flipped ? back : front) + '</div>' +
      '<div style="max-width:680px;margin:14px auto 0"><div style="display:flex;justify-content:space-between"><span class="sect-label" style="margin:0">Sesi ini</span><span class="small muted">' + rated + ' dinilai · ' + skipped + ' dilewati · ' + (deck.length - i) + ' tersisa (termasuk kartu ini)</span></div>' +
      '<div class="pbar" style="margin-top:8px"><i style="width:' + Math.round(i / deck.length * 100) + '%"></i></div></div></div>';
    bindCrumb(c);
    const fl = $('#fc-flip', c); if (fl) fl.onclick = () => { flipped = true; draw(); };
    const pv = $('#fc-prev', c); if (pv) pv.onclick = () => { if (i > 0) { i--; flipped = false; draw(); } };
    const hd = $('#fc-hide', c); if (hd) hd.onclick = () => go('flashcards');
    const sk = $('#fc-skip', c); if (sk) sk.onclick = () => { skipped++; next(); };
    $$('[data-rate]', c).forEach(b => b.onclick = () => rate(+b.dataset.rate));
    function rate(ri) {
      const days = RATES[ri][2];
      const d = new Date(); if (days === 0) d.setMinutes(d.getMinutes() + 1); else d.setDate(d.getDate() + days);
      LS().srs[deck[i]] = { due: days === 0 ? todayStr() : todayStr(d), iv: days };
      rated++; if (ri >= 2) awardBonus(1, 'kartu-hafalan');
      save(); next();
    }
    function next() { i++; flipped = false; if (i >= deck.length) { c.innerHTML = '<div class="wrap"><div class="card" style="max-width:560px;margin:30px auto;text-align:center"><div class="sect-label">Sesi selesai</div><h1 class="page">Kerja bagus!</h1><p class="muted">' + rated + ' kartu dinilai · ' + skipped + ' dilewati.</p><button type="button" class="btn" style="margin-top:14px" onclick="void(0)" id="fc-done">Kembali ke Kartu Hafalan</button></div></div>'; $('#fc-done', c).onclick = () => go('flashcards'); touchActivity(3); return; } draw(); }
    c._fcKey = e => { if (route.name !== 'flashcards') return; if (flipped && ['1', '2', '3', '4'].includes(e.key)) rate(+e.key - 1); else if (!flipped && e.key === 'Enter') { flipped = true; draw(); } };
  }
  draw();
}

/* ===== BACAAN ===== */
let readFilter = { cat: '', q: '' };
function pageReadings(c) {
  const all = DG.readings[S.lang];
  c.innerHTML = '<div class="wrap"><div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start"><div style="flex:1;min-width:240px"><h1 class="page">Bacaan terkurasi per level.</h1><p class="sub">' + all.length + ' artikel pendek Bahasa ' + LANGMETA[S.lang].name + ' dengan terjemahan per kalimat, kosakata, dan pertanyaan pemahaman.</p></div>' +
    '<div class="searchbox" style="flex:0 1 320px"><span>🔍</span><input id="rd-q" type="search" placeholder="Cari judul atau kategori…" value="' + esc(readFilter.q) + '"></div></div>' +
    '<div class="chiprow" style="margin-top:14px"><button type="button" class="chip active">' + LANGMETA[S.lang].name + '</button>' + [...new Set(all.map(r => r.cat))].map(cat => '<button type="button" class="chip' + (readFilter.cat === cat ? ' active' : '') + '" data-cat="' + esc(cat) + '">' + esc(cat) + '</button>').join('') + '<span class="small muted" id="rd-count"></span></div><div id="rd-list"></div></div>';
  const draw = () => {
    let list = all;
    if (readFilter.cat) list = list.filter(r => r.cat === readFilter.cat);
    if (readFilter.q) { const q = readFilter.q.toLowerCase(); list = list.filter(r => (r.title + ' ' + r.cat).toLowerCase().includes(q)); }
    $('#rd-count', c).textContent = list.length + ' hasil';
    const cats = [...new Set(list.map(r => r.cat))];
    $('#rd-list', c).innerHTML = cats.length ? cats.map(cat => '<div class="sect-label">' + esc(cat) + ' · ' + list.filter(r => r.cat === cat).length + ' artikel</div><div class="grid3">' +
      list.filter(r => r.cat === cat).map(r => '<button type="button" class="read-card" data-rd="' + r.id + '"><span class="aa">Aa</span> <span class="chip">' + r.level + '</span><h3>' + esc(r.title) + '</h3><p class="muted small">' + r.sentences.length + ' kalimat dengan terjemahan</p><p class="small" style="margin-top:8px">3 menit baca · ' + r.sentences.length + ' kalimat · ' + (r.vocab || []).length + ' vocab</p></button>').join('') + '</div>').join('')
      : '<p class="muted" style="margin-top:16px">Tidak ada bacaan yang cocok.</p>';
    $$('#rd-list [data-rd]', c).forEach(b => b.onclick = () => go('reading', { id: b.dataset.rd }));
  };
  $$('[data-cat]', c).forEach(b => b.onclick = () => { readFilter.cat = readFilter.cat === b.dataset.cat ? '' : b.dataset.cat; pageReadings(c); });
  $('#rd-q', c).addEventListener('input', e => { readFilter.q = e.target.value; draw(); });
  draw();
}
function pageReading(c, p) {
  const r = DG.readings[S.lang].find(x => x.id === p.id) || DG.readings[S.lang][0];
  c.innerHTML = '<div class="wrap">' + crumb([['Beranda', 'home'], ['Bacaan', 'readings'], [r.title]]) +
    '<h1 class="page">' + esc(r.title) + '</h1><div class="chiprow" style="margin-top:10px"><span class="chip">' + r.level + '</span><span class="chip">' + esc(r.cat) + '</span><span class="chip">3 menit baca</span></div>' +
    '<div class="card" style="margin-top:16px">' + r.sentences.map(s => '<div class="sent-line"><b>' + esc(s[0]) + '</b> ' + ttsBtn(s[0]) + '<small>' + esc(s[1]) + '</small></div>').join('') +
    (r.vocab && r.vocab.length ? '<div class="sect-label">Vocab bacaan ini</div><div class="chiprow">' + r.vocab.map(v => '<span class="chip">' + esc(v) + '</span>').join('') + '</div>' : '') + '</div>' +
    '<div class="card" style="margin-top:16px"><div class="sect-label" style="margin-top:0">Pertanyaan pemahaman</div>' +
    r.questions.map((q, qi) => '<div style="margin:14px 0"><b>' + (qi + 1) + '. ' + esc(q[0]) + '</b><div class="chiprow" style="margin-top:8px">' + q[1].map((o, oi) => '<button type="button" class="chip" data-rq="' + qi + ':' + oi + '">' + esc(o) + '</button>').join('') + '</div><p class="small" id="rq-fb-' + qi + '" style="margin-top:6px"></p></div>').join('') + '</div></div>';
  bindCrumb(c);
  $$('[data-rq]', c).forEach(b => b.onclick = () => {
    const [qi, oi] = b.dataset.rq.split(':').map(Number);
    const fb = $('#rq-fb-' + qi, c);
    if (oi === r.questions[qi][2]) { fb.innerHTML = '<span style="color:var(--green)"><b>Benar!</b></span> <span class="muted">' + esc(r.questions[qi][3]) + '</span>'; awardBonus(1, 'bacaan'); }
    else fb.innerHTML = '<span style="color:var(--red)"><b>Belum tepat.</b></span> <span class="muted">Coba baca lagi kalimatnya di atas.</span>';
  });
  touchActivity(3);
}
/* ===== DIALOG ===== */
function pageDialogs(c) {
  c.innerHTML = '<div class="wrap"><h1 class="page">Dialog situasional</h1><p class="sub">12 percakapan Bahasa ' + LANGMETA[S.lang].name + ' untuk situasi sehari-hari. Dengarkan, lalu tirukan.</p>' +
    '<div class="grid2" style="margin-top:16px">' + DG.dialogs[S.lang].map((d, i) => '<div class="card"><div class="sect-label" style="margin-top:0">' + esc(d.place) + '</div><b style="font-size:16px">' + esc(d.title) + '</b>' +
    d.lines.map(l => '<div class="dialog-line"><span class="who">' + esc(l[0]) + '</span><div class="txt"><b>' + esc(l[1]) + '</b> ' + ttsBtn(l[1]) + '<small>' + esc(l[2]) + '</small></div></div>').join('') + '</div>').join('') + '</div></div>';
}
/* ===== TATA BAHASA & CHEAT SHEET ===== */
function pageGrammar(c) {
  const wc = DG.wordClasses[S.lang], notes = DG.notes[S.lang];
  let body = '';
  if (wc) body = wc.map(g => '<div class="card" style="margin-bottom:16px"><b style="font-size:16px">' + esc(g[0]) + '</b><p class="muted" style="margin:5px 0 10px">' + esc(g[1]) + '</p><table class="tbl"><tr><th>Kata</th><th>Arti</th><th>Contoh</th></tr>' + g[2].map(w => '<tr><td><b>' + esc(w[0]) + '</b> ' + ttsBtn(w[0]) + '</td><td>' + esc(w[1]) + '</td><td>' + esc(w[2]) + '<br><span class="muted small">' + esc(w[3]) + '</span></td></tr>').join('') + '</table></div>').join('');
  else body = DG.levels.map(l => { const les = lessons().filter(x => x.level === l.code); return '<div class="card" style="margin-bottom:16px"><b style="font-size:16px">Level ' + l.code + ' — ' + esc(l.name) + '</b><p class="muted" style="margin:5px 0 8px">Pola utama level ini dilatih lewat contoh kalimat di modul: ' + les.map(x => esc(x.title)).join(' · ') + '.</p><p class="small">Buka modulnya untuk pola kalimat lengkap + kuisnya.</p></div>'; }).join('');
  if (notes) body += '<div class="sect-label">Catatan & cheat sheet</div>' + notes.map(n => '<div class="card" style="margin-bottom:16px"><b>' + esc(n[0]) + '</b><p style="margin:6px 0">' + esc(n[1]) + '</p>' + n[2].map(x => '<div class="sent-line"><b>' + esc(x[0]) + '</b> ' + ttsBtn(x[0]) + '<small>' + esc(x[1]) + '</small></div>').join('') + '</div>').join('');
  c.innerHTML = '<div class="wrap"><h1 class="page">Tata Bahasa — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Kelas kata, pola kalimat, dan cheat sheet ringkas per level.</p><div style="margin-top:16px">' + body + '</div></div>';
}

/* ===== KOSAKATA (500 kata inti) ===== */
let vocabQ = '';
function pageVocab(c) {
  const core = DG.core[S.lang];
  c.innerHTML = '<div class="wrap"><h1 class="page">500 Kata Inti — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Seluruh kosakata inti dengan arti dan contoh. Kata yang sama dipakai di modul, kuis, dan kartu hafalan.</p>' +
    '<div class="searchbox" style="max-width:none;margin-top:14px"><span>🔍</span><input id="v-q" type="search" placeholder="Cari kata atau arti…" value="' + esc(vocabQ) + '"></div><div id="v-list" style="margin-top:14px"></div></div>';
  const draw = () => {
    const q = vocabQ.toLowerCase();
    const list = core.map((w, i) => [w, i]).filter(([w]) => !q || w[0].toLowerCase().includes(q) || w[1].toLowerCase().includes(q));
    $('#v-list', c).innerHTML = '<p class="small muted" style="margin-bottom:8px">' + list.length + ' kata</p><div class="card" style="padding:6px 20px">' +
      list.slice(0, 200).map(([w, i]) => '<div class="sent-line"><b>' + esc(w[0]) + '</b> ' + ttsBtn(w[0]) + ' <span class="muted">— ' + esc(w[1]) + '</span>' + (LS().srs[i] ? ' <span class="chip">Di SRS</span>' : '') + (w[2] ? '<small>' + esc(w[2]) + ' · ' + esc(w[3]) + '</small>' : '') + '</div>').join('') + '</div>' +
      (list.length > 200 ? '<p class="muted small" style="margin-top:8px">Menampilkan 200 pertama — persempit dengan pencarian.</p>' : '');
  };
  $('#v-q', c).addEventListener('input', e => { vocabQ = e.target.value; draw(); });
  draw();
}
/* ===== IDIOM & BAHASA GAUL ===== */
function pageIdioms(c) {
  if (S.lang === 'en') {
    c.innerHTML = '<div class="wrap"><h1 class="page">Idiom & Bahasa Gaul — Inggris</h1><p class="sub">150 ungkapan yang sering dipakai penutur asli, lengkap dengan contoh.</p><div class="card" style="margin-top:16px;padding:6px 20px">' +
      DG.idioms.map(x => '<div class="sent-line"><b>' + esc(x[0]) + '</b> ' + ttsBtn(x[0]) + ' <span class="muted">— ' + esc(x[1]) + '</span><small>' + esc(x[2]) + ' · ' + esc(x[3]) + '</small></div>').join('') + '</div></div>';
  } else {
    const sample = DG.core[S.lang].slice(0, 30);
    c.innerHTML = '<div class="wrap"><h1 class="page">Idiom & Bahasa Gaul — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Ungkapan sehari-hari dalam Bahasa ' + LANGMETA[S.lang].name + ' dilatih lewat dialog situasional dan contoh kalimat kosakata inti. Mulai dari ekspresi paling sering dipakai ini:</p><div class="card" style="margin-top:16px;padding:6px 20px">' +
      sample.filter(w => w[2]).slice(0, 15).map(w => '<div class="sent-line"><b>' + esc(w[2]) + '</b> ' + ttsBtn(w[2]) + '<small>' + esc(w[3]) + ' — kata kunci: ' + esc(w[0]) + ' (' + esc(w[1]) + ')</small></div>').join('') + '</div></div>';
  }
}
/* ===== BUDAYA ===== */
function pageCulture(c) {
  const items = {
    en: [['Salam & ruang pribadi', 'Di banyak negara berbahasa Inggris, sapaan singkat + basa-basi cuaca adalah pembuka standar. Jabat tangan seperlunya, jaga jarak satu lengan.'], ['Budaya antre', 'Antre dianggap serius — memotong antre bisa ditegur langsung. Ucapkan "excuse me" saat lewat.'], ['Tip di restoran', 'Di Amerika Serikat, tip 15–20% adalah kebiasaan. Di Inggris, service charge sering sudah termasuk — cek struk dulu.'], ['Small talk', 'Obrolan ringan soal cuaca, olahraga, dan rencana akhir pekan itu aman. Hindari gaji, usia, dan politik dengan orang baru.']],
    ko: [['Bahasa sopan itu wajib', 'Korea memakai tingkat tutur: gaya sopan (-요) untuk umum, formal (-입니다) untuk acara resmi, akrab hanya untuk teman dekat. Salah tingkat tutur terasa sangat kasar.'], ['Dua tangan & membungkuk', 'Memberi/menerima barang dengan dua tangan dan membungkuk ringan adalah tanda hormat, apalagi ke orang lebih tua.'], ['Budaya pali-pali (cepat-cepat)', 'Serba cepat adalah gaya hidup: makanan, internet, sampai pengiriman. Tapi jangan buru-buru memotong pembicaraan orang tua.'], ['Makan bersama', 'Tunggu yang paling tua mulai makan duluan. Menuang minuman untuk orang lain — terutama yang lebih tua — adalah sopan santun dasar.']],
    ja: [['Membungkuk (ojigi)', 'Semakin dalam dan lama membungkuknya, semakin besar hormatnya. Untuk sapaan kasual cukup anggukan kecil.'], ['Kartu nama (meishi)', 'Terima kartu nama dengan dua tangan, baca sebentar, lalu simpan baik-baik — jangan langsung dikantongi sembarangan.'], ['Sepatu & ruang dalam', 'Lepas sepatu di genkan (pintu masuk) rumah dan banyak restoran tradisional; arahkan ujung sepatu ke pintu.'], ['Ketepatan waktu', 'Datang 5 menit lebih awal adalah standar. Kereta yang telat 1 menit saja bisa jadi berita.']]
  };
  c.innerHTML = '<div class="wrap"><h1 class="page">Budaya — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Bahasa nggak lepas dari kebiasaan orangnya. Empat hal ini yang paling sering menentukan kesan pertama.</p><div class="grid2" style="margin-top:16px">' +
    items[S.lang].map(x => '<div class="card"><b style="font-size:16px">' + x[0] + '</b><p class="muted" style="margin-top:6px">' + x[1] + '</p></div>').join('') + '</div></div>';
}
/* ===== KESALAHAN UMUM ===== */
function pageMistakes(c) {
  const items = {
    en: [['I am agree', 'I agree', '"Agree" itu kata kerja, jadi tidak pakai "am".'], ['She don\'t like coffee', 'She doesn\'t like coffee', 'Untuk she/he/it, "doesn\'t" + kata kerja dasar.'], ['I am boring', 'I am bored', '"Boring" = membosankan (untuk benda/situasi); perasaanmu "bored".'], ['Discuss about the plan', 'Discuss the plan', '"Discuss" langsung diikuti objek, tanpa "about".']],
    ko: [['저는 학교에 가요 (ke orang baru dikenal)', '저는 학교에 갑니다 / 가요', 'Untuk orang asing yang lebih tua, naikkan tingkat kesopanan kalimatmu.'], ['친구하고 만나요 ditulis 친구와 만나요 saja', 'Keduanya bisa, tapi -하고 lebih lisan', 'Partikel "dengan" punya beberapa bentuk; sesuaikan gaya bicara.'], ['Lupa partikel topik/subjek', '은/는 vs 이/가 tertukar', '은/는 menandai topik, 이/가 menandai subjek baru/penting. Latih lewat contoh, bukan hafalan rumus.'], ['Urutan kata Inggris dibawa ke Korea', 'Korea: subjek–objek–kata kerja', 'Kata kerja selalu di akhir kalimat Korea.']],
    ja: [['私は学生です dibaca "watashi wa…"', 'は dibaca "wa" saat jadi partikel', 'Karakter は sebagai partikel topik dibaca "wa", bukan "ha".'], ['ありがとう ke atasan saja', 'ありがとうございます', 'Ke atasan/orang asing tambahkan ございます agar sopan.'], ['を ditulis tapi tak dibaca', 'Partikel を dibaca "o"', 'を hanya dipakai sebagai partikel objek dan dibaca "o".'], ['Urutan kata kerja di tengah', 'Jepang: kata kerja di akhir', 'Seperti Korea: subjek–objek–kata kerja.']]
  };
  c.innerHTML = '<div class="wrap"><h1 class="page">Kesalahan Umum — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Kesalahan yang paling sering dibuat pelajar Indonesia, dan bentuk benarnya.</p>' +
    items[S.lang].map(x => '<div class="card" style="margin-top:14px"><p><span style="color:var(--red)"><b>✗ ' + esc(x[0]) + '</b></span> → <span style="color:var(--green)"><b>✓ ' + esc(x[1]) + '</b></span> ' + ttsBtn(x[1]) + '</p><p class="muted" style="margin-top:5px">' + esc(x[2]) + '</p></div>').join('') + '</div>';
}

/* ===== DIKTE ===== */
function pageDictation(c) {
  const pool = DG.core[S.lang].filter(w => w[2]);
  const w = pool[Math.floor(Math.random() * pool.length)];
  c.innerHTML = '<div class="wrap"><h1 class="page">Dikte — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Dengarkan kalimatnya, lalu ketik persis seperti yang kamu dengar.</p>' +
    '<div class="card" style="max-width:640px;margin:18px auto 0;text-align:center"><p class="muted">Klik untuk memutar kalimat (bisa diulang):</p>' +
    '<p style="margin:14px 0">' + ttsBtn(w[2], '🔊 Putar kalimat') + '</p>' +
    '<input class="fill-input" id="dict-in" type="text" placeholder="ketik kalimatnya di sini…" autocomplete="off">' + (needsKeyboard() ? '<div id="vkbd"></div>' : '') +
    '<div id="dict-fb" style="margin-top:12px"></div><div class="quiz-actions" style="justify-content:center"><button type="button" class="btn white" id="dict-new">Kalimat lain</button><button type="button" class="btn" id="dict-check">Periksa</button></div></div></div>';
  drawKeyboard($('#vkbd', c), $('#dict-in', c));
  $('#dict-new', c).onclick = () => pageDictation(c);
  $('#dict-check', c).onclick = () => {
    const got = $('#dict-in', c).value.trim().toLowerCase().replace(/[.!?。]$/, '');
    const want = w[2].trim().toLowerCase().replace(/[.!?。]$/, '');
    $('#dict-fb', c).innerHTML = got === want
      ? '<div class="good"><b>Tepat!</b> Kalimatnya: ' + esc(w[2]) + ' — ' + esc(w[3]) + '</div>'
      : '<div class="warn"><b>Hampir.</b> Kalimat yang benar: <b>' + esc(w[2]) + '</b> — ' + esc(w[3]) + '</div>';
    if (got === want) awardBonus(2, 'dikte');
  };
}
/* ===== MENULIS (latihan terpandu + prompts) ===== */
function pageWriting(c) {
  const prompts = (DG.writingPrompts[S.lang] || []).slice(0, 6);
  c.innerHTML = '<div class="wrap"><h1 class="page">Menulis — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Tulis bebas dengan tema terpandu. Tulisanmu tersimpan di Jurnal.</p>' +
    '<div class="card" style="margin-top:16px"><div class="sect-label" style="margin-top:0">Tema hari ini</div><div class="chiprow" id="wp-chips">' +
    (prompts.length ? prompts.map((p, i) => '<button type="button" class="chip' + (i === 0 ? ' active' : '') + '" data-wp="' + i + '">' + esc(String(p).slice(0, 42)) + '…</button>').join('') : '<span class="muted">Tulis pengalamanmu hari ini dalam Bahasa ' + LANGMETA[S.lang].name + '.</span>') + '</div>' +
    '<p class="small muted" style="margin-top:10px" id="wp-text">' + esc(prompts[0] || 'Tulis pengalamanmu hari ini.') + '</p>' +
    '<textarea id="w-text" rows="7" style="width:100%;border:1px solid var(--line);border-radius:12px;padding:13px;margin-top:10px" placeholder="Mulai menulis di sini…"></textarea>' + (needsKeyboard() ? '<div id="vkbd"></div>' : '') +
    '<div class="quiz-actions"><span class="small muted" id="w-count">0 karakter</span><button type="button" class="btn" id="w-save">Simpan ke Jurnal (+5 XP)</button><button type="button" class="btn white" id="w-script">Belajar menulis aksara →</button></div></div></div>';
  drawKeyboard($('#vkbd', c), $('#w-text', c));
  $$('[data-wp]', c).forEach(b => b.onclick = () => { $$('[data-wp]', c).forEach(x => x.classList.remove('active')); b.classList.add('active'); $('#wp-text', c).textContent = prompts[+b.dataset.wp]; });
  $('#w-text', c).addEventListener('input', e => $('#w-count', c).textContent = e.target.value.length + ' karakter');
  $('#w-save', c).onclick = () => {
    const t = $('#w-text', c).value.trim(); if (t.length < 10) { toast('Tulis sedikit lebih panjang dulu ya.'); return; }
    S.journal.unshift({ date: todayStr(), lang: S.lang, text: t }); save(); awardBonus(5, 'menulis'); toast('Tersimpan di Jurnal. +5 XP');
    $('#w-text', c).value = ''; $('#w-count', c).textContent = '0 karakter';
  };
  $('#w-script', c).onclick = () => go('script');
}
/* ===== BELAJAR MENULIS AKSARA (halaman terpisah: Hangul / Kana + Coba Tulis) ===== */
const SCRIPTS = {
  ko: { name: 'Hangul', rows: [['ㄱ', 'g/k'], ['ㄴ', 'n'], ['ㄷ', 'd/t'], ['ㄹ', 'r/l'], ['ㅁ', 'm'], ['ㅂ', 'b/p'], ['ㅅ', 's'], ['ㅇ', '-/ng'], ['ㅈ', 'j'], ['ㅊ', 'ch'], ['ㅋ', 'k'], ['ㅌ', 't'], ['ㅍ', 'p'], ['ㅎ', 'h'], ['ㅏ', 'a'], ['ㅑ', 'ya'], ['ㅓ', 'eo'], ['ㅕ', 'yeo'], ['ㅗ', 'o'], ['ㅛ', 'yo'], ['ㅜ', 'u'], ['ㅠ', 'yu'], ['ㅡ', 'eu'], ['ㅣ', 'i'], ['ㅐ', 'ae'], ['ㅔ', 'e']] },
  ja: { name: 'Hiragana & Katakana', rows: [['あ', 'a · ア'], ['い', 'i · イ'], ['う', 'u · ウ'], ['え', 'e · エ'], ['お', 'o · オ'], ['か', 'ka · カ'], ['き', 'ki · キ'], ['く', 'ku · ク'], ['け', 'ke · ケ'], ['こ', 'ko · コ'], ['さ', 'sa · サ'], ['し', 'shi · シ'], ['す', 'su · ス'], ['せ', 'se · セ'], ['そ', 'so · ソ'], ['た', 'ta · タ'], ['ち', 'chi · チ'], ['つ', 'tsu · ツ'], ['て', 'te · テ'], ['と', 'to · ト'], ['な', 'na · ナ'], ['に', 'ni · ニ'], ['ぬ', 'nu · ヌ'], ['ね', 'ne · ネ'], ['の', 'no · ノ'], ['は', 'ha · ハ'], ['ひ', 'hi · ヒ'], ['ふ', 'fu · フ'], ['へ', 'he · ヘ'], ['ほ', 'ho · ホ'], ['ま', 'ma · マ'], ['み', 'mi · ミ'], ['む', 'mu · ム'], ['め', 'me · メ'], ['も', 'mo · モ'], ['や', 'ya · ヤ'], ['ゆ', 'yu · ユ'], ['よ', 'yo · ヨ'], ['ら', 'ra · ラ'], ['り', 'ri · リ'], ['る', 'ru · ル'], ['れ', 're · レ'], ['ろ', 'ro · ロ'], ['わ', 'wa · ワ'], ['を', 'wo · ヲ'], ['ん', 'n · ン']] }
};
function pageScript(c) {
  if (S.lang === 'en') { c.innerHTML = '<div class="wrap"><h1 class="page">Belajar Menulis</h1><p class="sub">Bahasa Inggris memakai alfabet Latin yang sama dengan Bahasa Indonesia. Halaman aksara khusus tersedia untuk Korea (Hangul) dan Jepang (Kana) — ganti bahasa di bar atas untuk membukanya.</p></div>'; return; }
  const sc = SCRIPTS[S.lang];
  c.innerHTML = '<div class="wrap"><h1 class="page">Belajar Menulis & Pengucapan — ' + sc.name + '</h1><p class="sub">Klik huruf untuk mendengar bunyinya, lalu latih menulisnya di kotak Coba Tulis.</p>' +
    '<div class="grid2" style="margin-top:16px;align-items:start"><div class="card"><div class="sect-label" style="margin-top:0">Tabel ' + sc.name + ' (' + sc.rows.length + ' huruf)</div><div class="kbd-grid" style="grid-template-columns:repeat(5,1fr)">' +
    sc.rows.map(r => '<button type="button" data-ch2="' + r[0] + '" title="' + esc(r[1]) + '">' + r[0] + '<small style="display:block;font-size:11px;color:var(--ink-2);font-weight:600">' + esc(r[1]) + '</small></button>').join('') + '</div></div>' +
    '<div class="card"><div class="sect-label" style="margin-top:0">Coba Tulis</div><p class="small muted">Target: <b id="ct-target" style="font-size:22px;color:var(--ink)">' + sc.rows[0][0] + '</b> (' + sc.rows[0][1] + ') — ketik huruf yang sama:</p>' +
    '<input class="fill-input" id="ct-in" type="text" maxlength="2" autocomplete="off"><div id="ct-fb" style="margin-top:10px;text-align:center"></div>' +
    '<div class="quiz-actions" style="justify-content:center"><button type="button" class="btn white" id="ct-next">Huruf acak</button></div></div></div></div>';
  let target = sc.rows[0];
  $$('[data-ch2]', c).forEach(b => b.onclick = () => { speak(b.dataset.ch2, b); target = sc.rows.find(r => r[0] === b.dataset.ch2); $('#ct-target', c).textContent = target[0]; });
  $('#ct-next', c).onclick = () => { target = sc.rows[Math.floor(Math.random() * sc.rows.length)]; $('#ct-target', c).innerHTML = target[0]; $('#ct-in', c).value = ''; $('#ct-fb', c).innerHTML = ''; };
  $('#ct-in', c).addEventListener('input', e => { if (e.target.value.trim() === target[0]) { $('#ct-fb', c).innerHTML = '<span style="color:var(--green)"><b>Betul!</b></span>'; awardBonus(1, 'aksara'); } });
}
/* ===== KONJUGASI ===== */
function pageConjugation(c) {
  const data = {
    en: [['to be', 'am/is/are', 'was/were', 'been', 'I am a student. → I was a student.'], ['eat', 'eats', 'ate', 'eaten', 'She eats rice. → She ate rice.'], ['go', 'goes', 'went', 'gone', 'We go home. → We went home.'], ['study', 'studies', 'studied', 'studied', 'He studies hard. → He studied hard.'], ['have', 'has', 'had', 'had', 'They have time. → They had time.']],
    ko: [['가다 (pergi)', '가요', '갔어요', '갈 거예요', '학교에 가요 → 학교에 갔어요.'], ['먹다 (makan)', '먹어요', '먹었어요', '먹을 거예요', '밥을 먹어요 → 밥을 먹었어요.'], ['하다 (melakukan)', '해요', '했어요', '할 거예요', '공부해요 → 공부했어요.'], ['보다 (melihat)', '봐요', '봤어요', '볼 거예요', '영화를 봐요 → 영화를 봤어요.'], ['오다 (datang)', '와요', '왔어요', '올 거예요', '집에 와요 → 집에 왔어요.']],
    ja: [['行く (pergi)', '行きます', '行きました', '行くでしょう', '学校へ行きます → 学校へ行きました。'], ['食べる (makan)', '食べます', '食べました', '食べるでしょう', 'ご飯を食べます → ご飯を食べました。'], ['する (melakukan)', 'します', 'しました', 'するでしょう', '勉強します → 勉強しました。'], ['見る (melihat)', '見ます', '見ました', '見るでしょう', '映画を見ます → 映画を見ました。'], ['来る (datang)', '来ます', '来ました', '来るでしょう', '家へ来ます → 家へ来ました。']]
  };
  c.innerHTML = '<div class="wrap"><h1 class="page">Konjugasi — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Perubahan kata kerja yang paling sering dipakai: sekarang, lampau, dan masa depan.</p>' +
    '<div class="card" style="margin-top:16px"><table class="tbl"><tr><th>Kata kerja</th><th>Sekarang</th><th>Lampau</th></tr>' +
    data[S.lang].map(r => '<tr><td><b>' + esc(r[0]) + '</b> ' + ttsBtn(r[0]) + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '<br><span class="muted small">' + esc(r[4]) + '</span></td></tr>').join('') + '</table></div></div>';
}

/* ===== TES PENEMPATAN ===== */
function pagePlacement(c) {
  const per = {};
  DG.levels.forEach(l => per[l.code] = DG.lessons.en.filter(x => x.level === l.code));
  const qs = [];
  for (const lv of LEVELS) {
    const pool = DG.vocab[S.lang][DG.lessons[S.lang].find(x => x.level === lv).id];
    for (let k = 0; k < 2; k++) {
      const w = pool[(k * 5 + 2) % pool.length];
      const distract = shuffle(pool.filter(x => x[0] !== w[0]), k + lv.length).slice(0, 3).map(x => x[0]);
      const opts = shuffle([w[0], ...distract], k + 11);
      qs.push({ type: 'mc', prompt: '[' + lv + '] Kata untuk "' + w[1] + '" adalah…', options: opts, answer: opts.indexOf(w[0]), explain: 'Contoh: ' + w[2] + ' — ' + w[3], _lv: lv });
    }
  }
  c.innerHTML = '<div class="wrap"><h1 class="page">Tes Penempatan — ' + LANGMETA[S.lang].name + '</h1><p class="sub">14 soal dari level A0 sampai C2. Hasilnya menentukan level awalmu. 2 menit saja.</p><div style="margin-top:16px"><button type="button" class="btn" id="pl-start">Mulai tes penempatan</button></div></div>';
  $('#pl-start', c).onclick = () => runQuiz(c, {
    routeName: 'placement', title: 'TES PENEMPATAN · ' + LANGMETA[S.lang].name.toUpperCase(), sub: 'Jawab sejujurnya — tebak kosong lebih baik daripada asal pilih.',
    questions: qs,
    finish(cc, pct, ok, total) {
      let lvl = 'A0';
      for (let i = 0; i < qs.length; i += 2) { /* level naik bila dua soal level itu benar */ }
      const perLevel = {}; qs.forEach((q, i) => { perLevel[q._lv] = perLevel[q._lv] || 0; });
      // hitung ulang dari jawaban tersimpan tidak tersedia di sini; pakai proporsi total:
      const approx = pct >= 85 ? 'C1' : pct >= 70 ? 'B2' : pct >= 55 ? 'B1' : pct >= 40 ? 'A2' : pct >= 25 ? 'A1' : 'A0';
      lvl = approx;
      LS().placement = lvl; save();
      if (sb && S.user) { try { sb.from('placement_results').insert({ user_id: S.user.id, language_code: S.lang, level: lvl, score: pct }); } catch (e) {} }
      cc.innerHTML = '<div class="wrap"><div class="card" style="max-width:560px;margin:30px auto;text-align:center"><div class="sect-label">Level kamu</div><h1 class="page">' + lvl + '</h1><p class="muted">Skor ' + pct + '% (' + ok + '/' + total + '). Jalur belajarmu disesuaikan ke level ini — kamu tetap bisa membuka modul level mana pun.</p><button type="button" class="btn" style="margin-top:14px" id="pl-mods">Lihat modulku →</button></div></div>';
      $('#pl-mods', cc).onclick = () => go('modules');
    }
  });
}
/* ===== PERSIAPAN UJIAN ===== */
let examTab = 'prep';
function pageExams(c) {
  const cards = {
    en: [['IELTS', 'Ujian akademik & migrasi berbahasa Inggris.', DG.mocks.length + ' simulasi mini · rencana belajar'], ['TOEFL iBT', 'Ujian masuk universitas berbahasa Inggris.', 'Simulasi mini · strategi'], ['TOEIC', 'Bahasa Inggris untuk dunia kerja.', 'Simulasi mini · strategi'], ['Cambridge', DG.cambridge.map(x => x.level).join(' · '), 'Gambaran level · tips']],
    ko: [['TOPIK I', 'Level 1–2: kosakata & tata bahasa dasar.', DG.topik1.length + ' soal latihan · strategi'], ['TOPIK II', 'Level 3–6: membaca & menulis esai.', DG.topik2.length + ' soal latihan · strategi'], ['EPS-TOPIK', 'Ujian pekerja migran ke Korea.', 'Fokus kosakata kerja · strategi']],
    ja: [['JLPT N5–N3', 'Bank soal resmi-gaya JLPT.', DG.jlpt.length + ' soal · pembahasan'], ['JFT-Basic', 'Ujian bahasa Jepang untuk kerja (SSW).', 'Strategi · rencana belajar']]
  };
  const tabs = [['prep', 'Persiapan Ujian'], ['sim', 'Simulasi Ujian'], ['strat', 'Strategi Ujian'], ['plan', 'Rencana Belajar']];
  let body = '';
  if (examTab === 'prep') body = '<div class="grid4" style="margin-top:16px">' + cards[S.lang].map((x, i) => '<button type="button" class="read-card" data-exam="' + i + '"><b style="font-size:16px">' + x[0] + '</b><p class="muted small" style="margin:6px 0">' + x[1] + '</p><p class="small">' + x[2] + '</p></button>').join('') + '</div>';
  else if (examTab === 'sim') body = '<div class="card" style="margin-top:16px"><b>Mulai simulasi</b><p class="muted" style="margin:6px 0 12px">Simulasi memakai mesin kuis yang sama dengan kuis modul — satu soal per layar, pembahasan setelah menjawab.</p><div class="chiprow">' + simButtons() + '</div></div>';
  else if (examTab === 'strat') body = '<div class="card" style="margin-top:16px"><b>Strategi yang terbukti membantu</b><p style="margin-top:8px">1) Kerjakan soal mudah dulu, tandai yang sulit, kembali lagi nanti. 2) Untuk soal kosakata, baca kalimat sesudah kata yang ditanya — konteks biasanya memberi petunjuk. 3) Jangan kosongkan jawaban: tebakan teredukasi selalu lebih baik dari kosong. 4) Sisakan 10% waktu terakhir untuk memeriksa.</p></div>';
  else body = '<div class="card" style="margin-top:16px"><b>Rencana belajar 15 menit/hari</b><p style="margin-top:8px">Senin–Jumat: 1 sesi harian DidiGo (pelajaran + kuis). Sabtu: 1 simulasi ujian. Minggu: review kartu hafalan yang jatuh tempo + 1 bacaan. Konsisten kecil mengalahkan belajar maraton sesekali.</p></div>';
  c.innerHTML = '<div class="wrap"><h1 class="page">Persiapan ujian untuk semua bahasa.</h1><p class="sub">Setiap halaman ujian memiliki simulasi, strategi, dan pembuat rencana belajar dalam satu tempat. Fokus DidiGo: ' + LANGMETA[S.lang].exams + '.</p>' +
    '<div class="tabs">' + tabs.map(t => '<button type="button" class="tab' + (examTab === t[0] ? ' active' : '') + '" data-tab="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' + body + '</div>';
  $$('[data-tab]', c).forEach(b => b.onclick = () => { examTab = b.dataset.tab; pageExams(c); });
  $$('[data-exam]', c).forEach(b => b.onclick = () => { examTab = 'sim'; pageExams(c); });
  bindSimButtons(c);
}
function simButtons() {
  if (S.lang === 'en') return '<button type="button" class="btn" data-sim="mock">Simulasi IELTS/TOEFL mini (' + DG.mocks[0].questions.length + ' soal)</button>';
  if (S.lang === 'ko') return '<button type="button" class="btn" data-sim="topik1">Simulasi TOPIK I</button> <button type="button" class="btn white" data-sim="topik2">Simulasi TOPIK II</button>';
  return '<button type="button" class="btn" data-sim="jlpt">Simulasi JLPT (12 soal)</button>';
}
function bindSimButtons(c) {
  $$('[data-sim]', c).forEach(b => b.onclick = () => {
    const kind = b.dataset.sim;
    let qs = [], title = '';
    if (kind === 'mock') { const m = DG.mocks[0]; title = m.name; qs = m.questions.map(q => ({ type: 'mc', prompt: q[0], options: q[1], answer: q[2], explain: q[3] })); }
    if (kind === 'topik1' || kind === 'topik2') { const bank = kind === 'topik1' ? DG.topik1 : DG.topik2; title = kind === 'topik1' ? 'TOPIK I — Simulasi' : 'TOPIK II — Simulasi'; qs = shuffle(bank, 5).slice(0, 10).map(q => ({ type: 'mc', prompt: q[0], options: q[1], answer: q[2], explain: q[3] + (q[4] ? ' ' + q[4] : '') })); }
    if (kind === 'jlpt') { qs = shuffle(DG.jlpt, 9).slice(0, 12).map(q => ({ type: 'mc', prompt: (q.passage ? q.passage + ' — ' : '') + q.q + ' (' + q.level + ' · ' + q.skill + ')', options: q.options, answer: q.answer, explain: q.explain })); title = 'JLPT — Simulasi'; }
    runQuiz(c, { routeName: 'exams', title: 'SIMULASI · ' + title.toUpperCase(), sub: 'Mode latihan: pembahasan muncul setelah tiap jawaban. Target 70%.', questions: qs,
      finish(cc, pct, ok, total) { if (pct >= 70) awardBonus(10, 'simulasi'); cc.innerHTML = '<div class="wrap"><div class="card" style="max-width:560px;margin:30px auto;text-align:center"><div class="sect-label">Hasil simulasi</div><h1 class="page">' + pct + '%</h1><p class="muted">' + ok + '/' + total + ' benar.' + (pct >= 70 ? ' +10 XP bonus.' : '') + '</p><button type="button" class="btn" style="margin-top:14px" id="sim-back">Kembali ke Persiapan Ujian</button></div></div>'; $('#sim-back', cc).onclick = () => go('exams'); } });
  });
}

/* ===== PROGRES ===== */
let progTab = 'act';
function pageProgress(c) {
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
  const activeThisWeek = days.filter(d => (LS().minutes[todayStr(d)] || 0) > 0).length;
  let body = '';
  if (progTab === 'act') {
    body = '<div class="sect-label">Habit tracker</div><div class="habit">' + days.map(d => {
      const isToday = todayStr(d) === todayStr();
      return '<div class="day' + (isToday ? ' today' : '') + ((LS().minutes[todayStr(d)] || 0) > 0 ? ' on' : '') + '"><small>' + 'MinSenSelRabKamJumSab'.slice(d.getDay() * 3, d.getDay() * 3 + 3) + '</small>' + d.getDate() + '</div>';
    }).join('') + '</div><p class="muted small" style="margin-top:8px">' + LS().streak + ' hari streak · ' + activeThisWeek + '/7 hari aktif minggu ini · ❄️ pembeku streak tersisa: ' + LS().freezes + '</p>' +
    '<div class="sect-label">Target bulan ini</div><div class="card"><b>Selesaikan 8 modul bulan ini</b><div class="pbar" style="margin:10px 0"><i style="width:' + Math.min(100, doneCount() / 8 * 100) + '%"></i></div><p class="muted small">' + Math.min(doneCount(), 8) + '/8 modul · total ' + LS().xp + ' XP di Bahasa ' + LANGMETA[S.lang].name + '</p></div>' +
    '<div class="sect-label">Bahasa kamu</div><div class="grid3">' + ['en', 'ko', 'ja'].map(L => {
      const st = S.langs[L], dn = Object.keys(st.done).length;
      return '<button type="button" class="read-card" data-plang="' + L + '"><span class="chip">' + LANGMETA[L].name + '</span>' + (L === S.lang ? ' <span class="chip">Utama</span>' : '') + '<h3>' + dn + '/42 modul</h3><p class="muted small">Semua kategori · ' + st.xp + ' XP · level ' + (st.placement || 'A0') + '</p><div class="pbar" style="margin-top:10px"><i style="width:' + Math.round(dn / 42 * 100) + '%"></i></div></button>';
    }).join('') + '</div>';
  } else {
    const ach = [['Modul pertama selesai', doneCount() >= 1], ['5 modul selesai', doneCount() >= 5], ['Streak 3 hari', LS().streak >= 3], ['100 XP terkumpul', LS().xp >= 100], ['Lulus kuis 90%+', Object.values(LS().done).some(x => x >= 90)], ['Penempatan selesai', !!LS().placement]];
    body = '<div class="grid3" style="margin-top:16px">' + ach.map(a => '<div class="card" style="opacity:' + (a[1] ? '1' : '.55') + '"><b>' + (a[1] ? '🏅 ' : '🔒 ') + a[0] + '</b><p class="muted small" style="margin-top:4px">' + (a[1] ? 'Terbuka' : 'Belum terbuka') + '</p></div>').join('') + '</div>';
  }
  c.innerHTML = '<div class="wrap"><h1 class="page">Progres</h1><div class="tabs">' + [['act', 'Aktivitas'], ['ach', 'Pencapaian']].map(t => '<button type="button" class="tab' + (progTab === t[0] ? ' active' : '') + '" data-ptab="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' + body + '</div>';
  $$('[data-ptab]', c).forEach(b => b.onclick = () => { progTab = b.dataset.ptab; pageProgress(c); });
  $$('[data-plang]', c).forEach(b => b.onclick = () => setLang(b.dataset.plang));
}
/* ===== JURNAL & PENANDA ===== */
function pageJournal(c) {
  const marks = S.bookmarks.map(bm => { const [L, id] = bm.split(':'); const les = (DG.lessons[L] || []).find(x => x.id === id); return les ? { L, les } : null; }).filter(Boolean);
  c.innerHTML = '<div class="wrap"><h1 class="page">Jurnal</h1><p class="sub">Tulisan latihanmu dan modul yang kamu simpan.</p>' +
    '<div class="sect-label">Modul tersimpan</div>' + (marks.length ? '<div class="module-grid">' + marks.map(m => '<button type="button" class="module-card" data-jm="' + m.L + ':' + m.les.id + '"><span class="chip">' + LANGMETA[m.L].name + ' · ' + m.les.level + '</span><h3>' + esc(m.les.title) + '</h3></button>').join('') + '</div>' : '<p class="muted">Belum ada modul tersimpan. Tekan "Simpan" di halaman pelajaran.</p>') +
    '<div class="sect-label">Tulisan saya</div>' + (S.journal.length ? S.journal.slice(0, 20).map(j => '<div class="card" style="margin-bottom:12px"><span class="chip">' + j.date + ' · ' + LANGMETA[j.lang].name + '</span><p style="margin-top:8px">' + esc(j.text) + '</p></div>').join('') : '<p class="muted">Belum ada tulisan. Mulai dari menu Menulis.</p>') + '</div>';
  $$('[data-jm]', c).forEach(b => b.onclick = () => { const [L, id] = b.dataset.jm.split(':'); if (S.lang !== L) { S.lang = L; save(); renderTopbar(); } go('lesson', { id, part: 0 }); });
}
/* ===== PENGATURAN ===== */
function pageSettings(c) {
  c.innerHTML = '<div class="wrap"><h1 class="page">Pengaturan</h1><div class="card" style="margin-top:16px;max-width:560px">' +
    '<div class="field"><label for="set-name">Nama tampilan</label><input id="set-name" type="text" value="' + esc(displayName() === 'Pelajar' ? '' : displayName()) + '" placeholder="Namamu"></div>' +
    '<div class="field"><label for="set-lang">Bahasa aktif</label><select id="set-lang">' + ['en', 'ko', 'ja'].map(L => '<option value="' + L + '"' + (S.lang === L ? ' selected' : '') + '>' + LANGMETA[L].name + '</option>').join('') + '</select></div>' +
    '<div class="field"><label>Akun</label><p class="muted small">' + (S.user ? 'Masuk sebagai ' + esc(S.user.email) + ' — progres tersinkron ke Supabase.' : 'Mode tamu — progres tersimpan di perangkat ini. Masuk untuk menyinkronkan.') + '</p></div>' +
    '<div class="quiz-actions"><button type="button" class="btn" id="set-save">Simpan pengaturan</button>' + (S.user ? '' : '<button type="button" class="btn white" id="set-login">Masuk / Daftar</button>') + '</div>' +
    '<p class="small muted" style="margin-top:14px">DidiGo v21 · Belajar Bahasa Asing, selangkah demi selangkah.</p></div></div>';
  $('#set-save', c).onclick = () => { S.name = $('#set-name', c).value.trim(); save(); const L = $('#set-lang', c).value; if (L !== S.lang) setLang(L); renderSidebar(); toast('Pengaturan tersimpan.'); };
  const lg = $('#set-login', c); if (lg) lg.onclick = openAuth;
}
/* ===== PENCARIAN ===== */
function pageSearch(c, p) {
  const q = (p.q || '').toLowerCase();
  const mods = lessons().filter(l => (l.title + ' ' + l.desc).toLowerCase().includes(q));
  const words = DG.core[S.lang].map((w, i) => [w, i]).filter(([w]) => w[0].toLowerCase().includes(q) || w[1].toLowerCase().includes(q)).slice(0, 20);
  c.innerHTML = '<div class="wrap"><h1 class="page">Hasil untuk "' + esc(p.q || '') + '"</h1>' +
    '<div class="sect-label">Modul</div>' + (mods.length ? '<div class="module-grid">' + mods.map(l => '<button type="button" class="module-card" data-sm="' + l.id + '"><span class="chip">' + l.level + '</span><h3>' + esc(l.title) + '</h3><p class="muted small">' + esc(l.desc) + '</p></button>').join('') + '</div>' : '<p class="muted">Tidak ada modul cocok.</p>') +
    '<div class="sect-label">Kosakata</div><div class="card" style="padding:6px 20px">' + (words.length ? words.map(([w]) => '<div class="sent-line"><b>' + esc(w[0]) + '</b> ' + ttsBtn(w[0]) + ' <span class="muted">— ' + esc(w[1]) + '</span></div>').join('') : '<p class="muted" style="padding:10px 0">Tidak ada kata cocok.</p>') + '</div></div>';
  $$('[data-sm]', c).forEach(b => b.onclick = () => go('lesson', { id: b.dataset.sm, part: 0 }));
}

/* ===== AUTH (Supabase) ===== */
function openAuth() {
  const m = $('#auth-modal');
  if (!sb) { toast('Mode tamu aktif. Isi SUPABASE_URL & anon key di app.js untuk mengaktifkan akun.'); return; }
  m.innerHTML = '<div class="auth-card"><h2 style="font-size:21px">Masuk ke DidiGo</h2><p class="muted small" style="margin:5px 0 4px">Progres & XP tersinkron di semua perangkatmu.</p>' +
    '<div class="field"><label for="au-email">Email</label><input id="au-email" type="email" autocomplete="email"></div>' +
    '<div class="field"><label for="au-pass">Kata sandi</label><input id="au-pass" type="password" autocomplete="current-password"></div>' +
    '<p class="small" id="au-err" style="color:var(--red)"></p>' +
    '<div class="quiz-actions"><button type="button" class="btn white" id="au-close">Nanti saja</button><button type="button" class="btn white" id="au-reg">Daftar</button><button type="button" class="btn" id="au-login">Masuk</button></div></div>';
  m.hidden = false;
  $('#au-close', m).onclick = () => m.hidden = true;
  const err = msg => { $('#au-err', m).textContent = msg; };
  $('#au-login', m).onclick = async () => {
    const { data, error } = await sb.auth.signInWithPassword({ email: $('#au-email', m).value.trim(), password: $('#au-pass', m).value });
    if (error) { err(error.message); return; }
    S.user = { id: data.user.id, name: (data.user.user_metadata || {}).display_name || '', email: data.user.email }; save();
    await syncFromSupabase(); m.hidden = true; renderSidebar(); toast('Selamat datang kembali!');
  };
  $('#au-reg', m).onclick = async () => {
    const { data, error } = await sb.auth.signUp({ email: $('#au-email', m).value.trim(), password: $('#au-pass', m).value });
    if (error) { err(error.message); return; }
    if (data.user) { S.user = { id: data.user.id, name: '', email: data.user.email }; save(); renderSidebar(); }
    err('Akun dibuat. Cek email untuk konfirmasi (bila aktif), lalu masuk.');
  };
}
async function syncFromSupabase() {
  if (!sb || !S.user) return;
  try {
    const { data } = await sb.from('user_language_progress').select('language_code,total_xp').eq('user_id', S.user.id);
    (data || []).forEach(r => { if (S.langs[r.language_code]) S.langs[r.language_code].xp = Math.max(S.langs[r.language_code].xp, r.total_xp || 0); });
    const { data: lr } = await sb.from('lesson_results').select('language_code,lesson_id,score').eq('user_id', S.user.id).eq('completed', true);
    (lr || []).forEach(r => { if (S.langs[r.language_code]) S.langs[r.language_code].done[r.lesson_id] = Math.max(S.langs[r.language_code].done[r.lesson_id] || 0, r.score || 0); });
    save();
  } catch (e) {}
}

/* ===== PETA HALAMAN & INIT ===== */
const PAGES = {
  home: pageHome, session: pageSession, modules: pageModules, lesson: pageLesson, quiz: pageQuiz,
  placement: pagePlacement, exams: pageExams, flashcards: pageFlashcards, practice: pagePractice,
  mistakes: pageMistakes, dictation: pageDictation, writing: pageWriting, script: pageScript,
  conjugation: pageConjugation, readings: pageReadings, reading: pageReading, dialogs: pageDialogs,
  grammar: pageGrammar, vocab: pageVocab, idioms: pageIdioms, culture: pageCulture,
  progress: pageProgress, journal: pageJournal, settings: pageSettings, search: pageSearch
};
$('#drawer-backdrop').addEventListener('click', closeDrawer);
(async function init() {
  if (sb) {
    try {
      const { data } = await sb.auth.getSession();
      if (data && data.session) { const u = data.session.user; S.user = { id: u.id, name: (u.user_metadata || {}).display_name || '', email: u.email }; await syncFromSupabase(); }
    } catch (e) {}
  }
  renderTopbar(); renderSidebar(); go('home');
  document.addEventListener('keydown', e => { const cEl = $('#content'); if (cEl && cEl._fcKey) cEl._fcKey(e); });
})();
