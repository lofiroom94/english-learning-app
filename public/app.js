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
/* ===== KONTEKS SOAL: setiap soal wajib punya baris konteks Bahasa Indonesia =====
   Konteks diambil dari arti kalimat contoh kata itu, lalu arti kata jawabannya
   disamarkan (diganti "…") supaya konteks TIDAK membocorkan jawaban. */
function meaningHeads(meaning) {
  const clean = String(meaning || '').split('—')[0].split('(')[0].trim();
  return clean.split('/').map(x => x.trim().toLowerCase()).filter(x => x.length >= 3);
}
function redactAnswer(text, w) {
  let out = String(text || '');
  const ans = String(w[0] || '').trim();
  if (ans) out = out.split(ans).join('…');
  meaningHeads(w[1]).forEach(h => {
    out = out.replace(new RegExp(h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '…');
  });
  return out.replace(/\s+/g, ' ').trim();
}
function wordContext(w, kind, topicTitle) {
  const trans = redactAnswer(w[3] || '', w);
  const usable = trans && trans.length >= 8 && !trans.includes(w[1]);
  if (kind === 'fill') {
    return usable
      ? 'Situasinya begini: "' + trans + '" — satu kata hilang dari kalimat di atasnya. Kata apa yang tepat untuk melengkapinya?'
      : 'Topik "' + (topicTitle || 'modul ini') + '" — satu kata hilang dari kalimat ini. Kata apa yang tepat untuk melengkapinya?';
  }
  if (kind === 'meaning') {
    return usable
      ? 'Perhatikan kalimat situasi ini: "' + trans + '" — kata yang dipakai di kalimat itu sedang ditanyakan artinya.'
      : 'Topik "' + (topicTitle || 'modul ini') + '" — arti kata yang ditanyakan dipakai dalam situasi sehari-hari topik ini.';
  }
  return usable
    ? 'Kamu sedang memakai kata ini dalam kalimat: "' + trans + '" — pilih kata yang tepat untuk kalimat itu.'
    : 'Topik "' + (topicTitle || 'modul ini') + '" — pilih kata yang tepat untuk situasi topik ini.';
}
window.wordContext = wordContext;
function contextForQuestion(q) {
  if (q && q.context && String(q.context).trim()) return String(q.context).trim();
  const pr = String((q && q.prompt) || '');
  if (/JLPT/i.test(pr) || q && q.level) return 'Soal latihan ujian — baca teks dan pertanyaannya baik-baik, lalu pilih jawaban yang paling tepat.';
  if (/TOPIK/i.test(pr)) return 'Soal kosakata ujian Korea — kata di dalam kalimat itu sedang ditanyakan artinya. Pilih arti yang paling tepat.';
  return 'Baca situasinya baik-baik dulu, lalu pilih jawaban yang paling tepat untuk situasi itu.';
}

/* Hash sederhana + salt per sesi — jawaban kuis disegel, tidak tampil di DOM. */
function seal(str, salt) { let h1 = 0xdeadbeef ^ salt, h2 = 0x41c6ce57 ^ salt; const s = salt + ':' + str; for (let i = 0; i < s.length; i++) { const ch = s.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16); }
function shuffle(a, seed) { const r = a.slice(); let s = seed || 7; for (let i = r.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) % 2147483648; const j = s % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; }
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => t.hidden = true, 2600); }

/* ===== TTS: tombol inline kecil; popover pengaturan hanya saat suara dipakai ===== */
/* Pilihan suara per gender untuk dialog: cari voice bernama perempuan/laki-laki
   sesuai bahasa; bila tidak ada pasangan jelas, bedakan lewat pitch
   (perempuan 1.25, laki-laki 0.85) supaya SELALU terdengar beda. */
const FEMALE_VOICE_HINTS = ['female', 'zira', 'samantha', 'victoria', 'karen', 'moira', 'fiona', 'veena', 'susan', 'catherine', 'yuna', 'sun-hee', 'sunhee', 'seoyeon', 'haruka', 'nanami', 'kyoko', 'ayumi', 'ichika'];
const MALE_VOICE_HINTS = ['male', 'david', 'daniel', 'alex', 'fred', 'thomas', 'injoon', 'in-joon', 'junseo', 'ichiro', 'takumi', 'hattori', 'kenji', 'george', 'ryan', 'christopher'];
function voiceGenderOf(name) {
  const n = String(name || '').toLowerCase();
  if (FEMALE_VOICE_HINTS.some(h => n.includes(h))) return 'female';
  if (MALE_VOICE_HINTS.some(h => n.includes(h))) return 'male';
  return '';
}
function pickDialogVoice(langCode, gender) {
  let voices = [];
  try { voices = (window.speechSynthesis && speechSynthesis.getVoices()) || []; } catch (e) { voices = []; }
  const prefix = String(langCode || '').slice(0, 2).toLowerCase();
  const byLang = voices.filter(v => String(v.lang || '').toLowerCase().replace('_', '-').startsWith(prefix));
  const pool = byLang.length ? byLang : voices;
  const female = pool.find(v => voiceGenderOf(v.name) === 'female') || null;
  const male = pool.find(v => voiceGenderOf(v.name) === 'male') || null;
  if (gender === 'female') return { voice: female || pool[0] || null, pitch: female ? 1.12 : 1.25, rate: 1 };
  if (gender === 'male') return { voice: male || pool[0] || null, pitch: male ? 0.92 : 0.85, rate: 1 };
  return { voice: pool[0] || null, pitch: 1, rate: 1 };
}
window.pickDialogVoice = pickDialogVoice;
window.__didigoPickVoice = pickDialogVoice;
let ttsRate = 1;
function speak(text, anchor, opts) {
  if (!('speechSynthesis' in window)) { toast('Peramban ini tidak mendukung suara.'); return; }
  const gender = typeof opts === 'string' ? opts : (opts && opts.gender) || anchor && anchor.dataset && anchor.dataset.gender || '';
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(String(text));
  u.lang = LANGMETA[S.lang].tts;
  const pick = pickDialogVoice(u.lang, gender);
  if (pick.voice) { try { u.voice = pick.voice; } catch (e) {} }
  u.pitch = gender ? pick.pitch : 1;
  u.rate = ttsRate * (gender ? pick.rate : 1);
  const pop = $('#tts-pop');
  pop.innerHTML = '<button data-r="0.7">Lambat</button><button data-r="1">Normal</button><button data-stop="1">Berhenti</button>';
  const r = anchor && anchor.getBoundingClientRect ? anchor.getBoundingClientRect() : { bottom: 70, left: window.innerWidth / 2 - 90 };
  pop.style.left = Math.max(8, r.left) + 'px'; pop.style.top = (r.bottom + 8) + 'px'; pop.hidden = false;
  $$('button', pop).forEach(b => b.onclick = () => {
    if (b.dataset.stop) { speechSynthesis.cancel(); pop.hidden = true; }
    else { ttsRate = parseFloat(b.dataset.r); speak(text, anchor, gender ? { gender } : undefined); }
  });
  u.onend = u.onerror = () => { pop.hidden = true; };
  speechSynthesis.speak(u);
  clearTimeout(pop._h); pop._h = setTimeout(() => pop.hidden = true, 6000);
}
window.speak = speak;
function ttsBtn(text, label) { return '<button type="button" class="tts-btn" data-speak="' + esc(text) + '">' + (label || '🔊') + '</button>'; }
function dialogTtsBtn(text, gender) { return '<button type="button" class="tts-btn" data-speak="' + esc(text) + '" data-gender="' + gender + '" aria-label="Dengarkan suara ' + (gender === 'female' ? 'perempuan' : 'laki-laki') + '">🔊</button>'; }
document.addEventListener('click', e => {
  const b = e.target.closest('[data-speak]');
  if (b) { speak(b.getAttribute('data-speak'), b, b.dataset && b.dataset.gender ? { gender: b.dataset.gender } : undefined); }
});
/* Gender pembicara dialog: nama yang dikenal didahulukan; sisanya bergantian
   mengikuti urutan bicara (pembicara pertama mengikuti konvensi A). */
const FEMALE_SPEAKERS = ['ani', 'rina', 'sari', 'nina', 'maya', 'lala', 'fani', 'eka', 'mom', '엄마', '민아', '리나', '사라', '니나', '수아', '라라', '파니', '에카', 'アニ', 'リナ', 'サリ', 'ニナ', 'マヤ', 'ララ', 'ファニ', 'エカ', '母'];
const MALE_SPEAKERS = ['ben', 'bima', 'tono', 'andi', 'rudi', 'dad', '아빠', '준호', '민준', '현우', '벤', 'ベン', 'トノ', 'ルディ', '父'];
function knownSpeakerGender(name) {
  const n = String(name || '').trim().toLowerCase();
  if (FEMALE_SPEAKERS.includes(n)) return 'female';
  if (MALE_SPEAKERS.includes(n)) return 'male';
  if (n === 'a') return 'male';
  if (n === 'b') return 'female';
  return '';
}
function dialogGenders(d) {
  const order = [];
  (d.lines || []).forEach(l => { if (!order.includes(l[0])) order.push(l[0]); });
  const map = {};
  const firstGender = knownSpeakerGender(order[0]) || 'male';
  order.forEach((sp, i) => {
    map[sp] = knownSpeakerGender(sp) || (i % 2 === 0 ? firstGender : (firstGender === 'male' ? 'female' : 'male'));
  });
  return map;
}
function genderLabel(g) { return g === 'female' ? 'Perempuan' : 'Laki-laki'; }
function dialogLinesHTML(d) {
  const genders = dialogGenders(d);
  return d.lines.map(l => {
    const g = genders[l[0]];
    return '<div class="dialog-line"><span class="who">' + esc(l[0]) + ' (' + genderLabel(g) + ')</span><div class="txt"><b>' + esc(l[1]) + '</b> ' + dialogTtsBtn(l[1], g) + '<small>' + esc(l[2]) + '</small></div></div>';
  }).join('') +
  '<div style="margin-top:10px"><button type="button" class="btn white small" data-play-dialog="' + esc(d.title) + '">▶ Putar dialog (suara laki-laki & perempuan bergantian)</button></div>';
}
function playDialog(d, anchor) {
  if (!('speechSynthesis' in window)) { toast('Peramban ini tidak mendukung suara.'); return; }
  const genders = dialogGenders(d);
  speechSynthesis.cancel();
  let i = 0;
  const next = () => {
    if (i >= d.lines.length) return;
    const l = d.lines[i++], g = genders[l[0]];
    const u = new SpeechSynthesisUtterance(String(l[1]));
    u.lang = LANGMETA[S.lang].tts;
    const pick = pickDialogVoice(u.lang, g);
    if (pick.voice) { try { u.voice = pick.voice; } catch (e) {} }
    u.pitch = pick.pitch; u.rate = ttsRate;
    u.onend = u.onerror = () => setTimeout(next, 120);
    speechSynthesis.speak(u);
  };
  next();
  if (anchor) toast('Memutar dialog: suara bergantian sesuai pembicara.');
}
document.addEventListener('click', e => {
  const pb = e.target.closest('[data-play-dialog]');
  if (!pb) return;
  const all = DG.dialogs[S.lang];
  const d = all.find(x => x.title === pb.getAttribute('data-play-dialog')) || all[+pb.getAttribute('data-play-dialog')] || null;
  if (d) playDialog(d, pb);
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
  ['LATIHAN', [['flashcards', 'Kartu Hafalan'], ['practice', 'Kuis Latihan'], ['speaking', 'Simulasi Speaking'], ['mistakes', 'Kesalahan Umum'], ['dictation', 'Dikte'], ['writing', 'Menulis'], ['conjugation', 'Konjugasi']]],
  ['KOLEKSI', [['readings', 'Bacaan'], ['dialogs', 'Dialog'], ['grammar', 'Tata Bahasa'], ['cheats', 'Cheat Sheet'], ['vocab', 'Kosakata'], ['idioms', 'Idiom & Phrasal Verbs'], ['examwriting', 'Tulis & Esai Ujian'], ['khusus', 'Fitur Khusus Bahasa'], ['culture', 'Budaya']]],
  ['AKUN', [['progress', 'Progres'], ['journal', 'Jurnal'], ['settings', 'Pengaturan']]]
];
const ICON = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
let route = { name: 'home', params: {} };
function displayName() { return S.name || (S.user ? S.user.name : '') || 'Pelajar'; }
function renderSidebar() {
  const st = LS();
  const items = NAV.map(([g, links]) => {
    let html = '<div class="nav-group">' + g + '</div>' + links.map(([r, label]) =>
      '<button type="button" class="nav-item' + (route.name === r ? ' active' : '') + '" data-nav="' + r + '">' + ICON + esc(label) + '</button>').join('');
    if (g === 'JALUR' && S.lang === 'ko') {
      html += '<button type="button" class="nav-item' + (route.name === 'eps' ? ' active' : '') + '" data-nav="eps">' + ICON + 'EPS-TOPIK</button>';
    }
    if (g === 'AKUN') {
      html += S.user
        ? '<div class="nav-item nav-account" aria-label="Akun masuk">' + ICON + '<span>' + esc(S.user.email || displayName()) + '</span></div>'
        : '<button type="button" class="nav-item" id="login-btn">' + ICON + 'Masuk / Daftar</button>';
    }
    return html;
  }).join('');
  $('#sidebar').innerHTML =
    '<div class="sidebar-head"><div class="logo">Didi<span>Go</span></div>' +
    '<div class="userbox"><div class="avatar">' + esc(displayName().slice(0, 1).toUpperCase()) + '</div><div><div class="uname">' + esc(displayName()) + '</div><div class="umail">' + esc(S.user ? S.user.email : 'Mode tamu — data di perangkat ini') + '</div></div></div>' +
    '<div><span class="streak-pill">🔥 <b>' + st.streak + ' hari</b>&nbsp;streak · ' + st.xp + ' XP</span></div></div>' +
    '<nav class="sidebar-nav" aria-label="Menu utama">' + items +
    (S.user ? '<button type="button" class="nav-item logout-btn" id="logout-btn" title="Logout">' + ICON + 'Keluar</button>' : '') +
    '<div class="side-version">DidiGo v21 · Isi lengkap web sebelumnya, tampilan v21</div></nav>';
  $$('#sidebar [data-nav]').forEach(b => b.onclick = () => { closeDrawer(); go(b.dataset.nav); });
  const lo = $('#logout-btn'); if (lo) lo.onclick = async () => { if (sb) { try { await sb.auth.signOut(); } catch (e) {} } S.user = null; save(); renderSidebar(); toast('Sampai jumpa! Kamu sudah keluar.'); go('home'); };
  const li = $('#login-btn'); if (li) li.onclick = openAuth;
}
function renderTopbar() {
  $('#topbar').innerHTML =
    '<button type="button" class="burger" id="burger" aria-label="Buka menu">☰</button>' +
    '<div class="searchbox"><span aria-hidden="true">🔍</span><input id="global-search" type="search" placeholder="Cari modul, vocab…" autocomplete="off"></div>' +
    '<div class="lang-picker" role="group" aria-label="Pilih bahasa">' +
    ['en', 'ko', 'ja'].map(L => '<button type="button" class="lang-btn' + (S.lang === L ? ' active' : '') + '" data-lang="' + L + '">' + LANGMETA[L].flag + ' <span class="lang-name">' + LANGMETA[L].name + '</span></button>').join('') + '</div>';
  $$('#topbar [data-lang]').forEach(b => b.onclick = () => setLang(b.dataset.lang));
  $('#burger').onclick = () => { $('#sidebar').classList.add('open'); $('#drawer-backdrop').hidden = false; };
  const inp = $('#global-search');
  inp.addEventListener('keydown', e => { if (e.key === 'Enter' && inp.value.trim()) go('search', { q: inp.value.trim() }); });
}
function closeDrawer() { $('#sidebar').classList.remove('open'); $('#drawer-backdrop').hidden = true; }
function setLang(L) {
  if (S.lang === L) return;
  S.lang = L; save(); renderTopbar(); renderSidebar();
  /* Seperti web sebelumnya: pindah bahasa TIDAK membuang halaman yang sedang
     dibuka — halaman yang sama dirender ulang dalam bahasa baru. Hanya
     halaman ber-parameter per-bahasa (pelajaran/kuis/bacaan satuan) yang
     kembali ke daftarnya. */
  if (route.name === 'lesson' || route.name === 'quiz') go('modules');
  else if (route.name === 'reading') go('readings');
  else if (route.name === 'eps' && L !== 'ko') go('exams');
  else go(route.name, route.params);
}
function go(name, params) {
  route = { name, params: params || {} };
  renderSidebar(); renderBottomNav();
  const c = $('#content');
  PAGES[name] ? PAGES[name](c, route.params) : PAGES.home(c);
  c.scrollTop = 0; c.focus({ preventScroll: true });
}
/* Bottom-nav ponsel: 5 tombol utama; menu lengkap tetap di laci sidebar. */
function renderBottomNav() {
  const bn = $('#bottomnav'); if (!bn) return;
  const items = [['home', 'Beranda'], ['modules', 'Modul'], ['flashcards', 'Kartu Hafalan'], ['practice', 'Kuis'], ['settings', 'Profil']];
  bn.innerHTML = items.map(([r, label]) => '<button type="button" class="bn-item' + (route.name === r ? ' active' : '') + '" data-bn="' + r + '">' + ICON + '<span>' + label + '</span></button>').join('');
  $$('#bottomnav [data-bn]').forEach(b => b.onclick = () => go(b.dataset.bn));
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
    '<div class="grid2" style="margin-top:16px"><div class="card"><div class="sect-label" style="margin-top:0">Kata Hari Ini</div><p style="font-size:18px"><b>' + esc(wordOfDay()[0]) + '</b> = ' + esc(wordOfDay()[1]) + '</p><p class="muted small" style="margin-top:4px">' + esc(wordOfDay()[2]) + ' — ' + esc(wordOfDay()[3]) + '</p><button type="button" class="btn white small" style="margin-top:10px" data-nav2="grammar">Belajar tata bahasa →</button></div>' +
    '<div class="card"><div class="sect-label" style="margin-top:0">Catatan Penting</div><b>' + esc((DG.notes[S.lang] || [])[0] ? DG.notes[S.lang][0][0] : '') + '</b><p class="muted small" style="margin:6px 0 10px">' + esc((DG.notes[S.lang] || [])[0] ? DG.notes[S.lang][0][1] : '') + '</p><button type="button" class="btn white small" data-nav2="grammar">Semua ' + (DG.notes[S.lang] || []).length + ' catatan →</button></div></div>' +
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
    body = '<p>Dialog situasional: <b>' + esc(d.title) + '</b> (' + esc(d.place) + '). Dengarkan, lalu baca bergantian. Suara tiap pembicara berbeda: laki-laki dan perempuan memakai suara masing-masing.</p>' +
      dialogLinesHTML(d);
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
      '<div class="q-context"><span class="q-context-label">Konteks</span> ' + esc(contextForQuestion(q)) + '</div>' +
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
/* ===== KEYBOARD VIRTUAL LENGKAP KO/JA + MESIN PENYUSUN HANGUL =====
   Hangul: 19 konsonan awal (termasuk GANDA ㄲㄸㅃㅆㅉ), 21 vokal, batchim
   tunggal + ganda (ㄳㄵㄶㄺㄻㄼㄽㄾㄿㅀㅄ), pemindahan batchim otomatis. */
const H_CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const H_JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const H_JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const H_JONG_SPLIT = { 'ㄳ': ['ㄱ','ㅅ'], 'ㄵ': ['ㄴ','ㅈ'], 'ㄶ': ['ㄴ','ㅎ'], 'ㄺ': ['ㄹ','ㄱ'], 'ㄻ': ['ㄹ','ㅁ'], 'ㄼ': ['ㄹ','ㅂ'], 'ㄽ': ['ㄹ','ㅅ'], 'ㄾ': ['ㄹ','ㅌ'], 'ㄿ': ['ㄹ','ㅍ'], 'ㅀ': ['ㄹ','ㅎ'], 'ㅄ': ['ㅂ','ㅅ'], 'ㄲ': ['','ㄲ'], 'ㅆ': ['','ㅆ'] };
const H_VOWEL_COMBO = { '8,0': 9, '8,1': 10, '8,20': 11, '13,4': 14, '13,5': 15, '13,20': 16, '18,20': 19 };
function hangulCompose(value, jamo) {
  if (!value) return jamo;
  const last = value.charAt(value.length - 1), code = last.charCodeAt(0), rest = value.slice(0, -1);
  const isVowel = H_JUNG.indexOf(jamo) >= 0;
  const isDoubleFinal = ['ㄳ','ㄵ','ㄶ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅄ'].indexOf(jamo) >= 0;
  if (code >= 0x3131 && code <= 0x3163) {
    const li = H_CHO.indexOf(last), vi = H_JUNG.indexOf(last);
    if (isVowel && li >= 0) return rest + String.fromCharCode(0xAC00 + li * 588 + H_JUNG.indexOf(jamo) * 28);
    if (isVowel && vi >= 0) { const c = H_VOWEL_COMBO[vi + ',' + H_JUNG.indexOf(jamo)]; if (c != null) return rest + H_JUNG[c]; return value + jamo; }
    return value + jamo;
  }
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const c0 = code - 0xAC00, cho = Math.floor(c0 / 588), jung = Math.floor((c0 % 588) / 28), jong = c0 % 28;
    if (isDoubleFinal) { if (jong === 0) return rest + String.fromCharCode(0xAC00 + cho * 588 + jung * 28 + H_JONG.indexOf(jamo)); return value + jamo; }
    if (isVowel) {
      if (jong === 0) {
        const c = H_VOWEL_COMBO[jung + ',' + H_JUNG.indexOf(jamo)];
        if (c != null) return rest + String.fromCharCode(0xAC00 + cho * 588 + c * 28);
        return value + jamo;
      }
      const jongCh = H_JONG[jong]; let newCho = jongCh, remain = 0;
      if (H_JONG_SPLIT[jongCh]) { newCho = H_JONG_SPLIT[jongCh][1]; remain = H_JONG.indexOf(H_JONG_SPLIT[jongCh][0]); }
      let ci = H_CHO.indexOf(newCho); if (ci < 0) ci = 11;
      return rest + String.fromCharCode(0xAC00 + cho * 588 + jung * 28 + remain) + String.fromCharCode(0xAC00 + ci * 588 + H_JUNG.indexOf(jamo) * 28);
    }
    if (jong === 0) { const ji = H_JONG.indexOf(jamo); if (ji > 0) return rest + String.fromCharCode(0xAC00 + cho * 588 + jung * 28 + ji); return value + jamo; }
    const comb2 = { 'ㄱ,ㅅ': 'ㄳ', 'ㄴ,ㅈ': 'ㄵ', 'ㄴ,ㅎ': 'ㄶ', 'ㄹ,ㄱ': 'ㄺ', 'ㄹ,ㅁ': 'ㄻ', 'ㄹ,ㅂ': 'ㄼ', 'ㄹ,ㅅ': 'ㄽ', 'ㄹ,ㅌ': 'ㄾ', 'ㄹ,ㅍ': 'ㄿ', 'ㄹ,ㅎ': 'ㅀ', 'ㅂ,ㅅ': 'ㅄ' };
    const dbl = comb2[H_JONG[jong] + ',' + jamo];
    if (dbl) return rest + String.fromCharCode(0xAC00 + cho * 588 + jung * 28 + H_JONG.indexOf(dbl));
    return value + jamo;
  }
  return value + jamo;
}
function composeHangulString(str) { let out = ''; for (const ch of String(str || '')) out = (H_CHO.includes(ch) || H_JUNG.includes(ch) || ['ㄳ','ㄵ','ㄶ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅄ'].includes(ch)) ? hangulCompose(out, ch) : out + ch; return out; }
function hangulBackspace(value) {
  if (!value) return value;
  const last = value.charAt(value.length - 1), code = last.charCodeAt(0), rest = value.slice(0, -1);
  if (code >= 0xAC00 && code <= 0xD7A3) {
    const c0 = code - 0xAC00, cho = Math.floor(c0 / 588), jung = Math.floor((c0 % 588) / 28), jong = c0 % 28;
    if (jong > 0) { const sp = H_JONG_SPLIT[H_JONG[jong]]; const prev = sp ? H_JONG.indexOf(sp[0]) : 0; return rest + String.fromCharCode(0xAC00 + cho * 588 + jung * 28 + Math.max(0, prev)); }
    const base = { 9: 8, 10: 8, 11: 8, 14: 13, 15: 13, 16: 13, 19: 18 }[jung];
    if (base != null) return rest + String.fromCharCode(0xAC00 + cho * 588 + base * 28);
    return rest + H_CHO[cho];
  }
  return rest;
}
window.hangulCompose = hangulCompose; window.composeHangulString = composeHangulString; window.hangulBackspace = hangulBackspace;
const DAKU = { 'か':'が','き':'ぎ','く':'ぐ','け':'げ','こ':'ご','さ':'ざ','し':'じ','す':'ず','せ':'ぜ','そ':'ぞ','た':'だ','ち':'ぢ','つ':'づ','て':'で','と':'ど','は':'ば','ひ':'び','ふ':'ぶ','へ':'べ','ほ':'ぼ','カ':'ガ','キ':'ギ','ク':'グ','ケ':'ゲ','コ':'ゴ','サ':'ザ','シ':'ジ','ス':'ズ','セ':'ゼ','ソ':'ゾ','タ':'ダ','チ':'ヂ','ツ':'ヅ','テ':'デ','ト':'ド','ハ':'バ','ヒ':'ビ','フ':'ブ','ヘ':'ベ','ホ':'ボ' };
const HANDAKU = { 'は':'ぱ','ひ':'ぴ','ふ':'ぷ','へ':'ぺ','ほ':'ぽ','ハ':'パ','ヒ':'ピ','フ':'プ','ヘ':'ペ','ホ':'ポ' };
let kbMode = ''; /* ko: hangul | ja: hira/kata/romaji */
function kbSetValue(input, val) { input.value = val; input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); }
function kbPress(input, ch) {
  if (S.lang === 'ko') kbSetValue(input, hangulCompose(input.value, ch));
  else kbSetValue(input, input.value + ch);
}
function kbBack(input) { kbSetValue(input, S.lang === 'ko' ? hangulBackspace(input.value) : input.value.slice(0, -1)); }
function kbEnter(input) {
  if (input.tagName === 'TEXTAREA') { kbSetValue(input, input.value + '\n'); return; }
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  const card = input.closest('.card') || document;
  const chk = $('#dict-check', card) || $('#q-submit', card);
  if (chk && !chk.disabled) chk.click();
}
function drawKeyboard(mount, input) {
  if (!mount || !input) return;
  if (!kbMode) kbMode = S.lang === 'ko' ? 'hangul' : 'hira';
  const key = ch => '<button type="button" class="kbd-key" data-ch="' + ch + '" data-kbd-char="' + ch + '">' + ch + '</button>';
  const util = '<div class="kbd-row kbd-util"><button type="button" class="kbd-key kbd-wide" data-kbd-key="backspace">⌫</button><button type="button" class="kbd-key kbd-space" data-kbd-key="space">Spasi</button><button type="button" class="kbd-key kbd-wide" data-kbd-key="enter">Enter</button></div>';
  let body = '';
  if (S.lang === 'ko') {
    body = '<div class="kbd-row">' + ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ'].map(key).join('') + '</div>' +
      '<div class="kbd-row">' + ['ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'].map(key).join('') + '</div>' +
      '<div class="kbd-row">' + ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅛ'].map(key).join('') + '</div>' +
      '<div class="kbd-row">' + ['ㅜ','ㅠ','ㅡ','ㅣ','ㅘ','ㅙ','ㅚ','ㅝ','ㅞ','ㅟ','ㅢ'].map(key).join('') + '</div>' +
      '<div class="kbd-row"><span class="kbd-cap">Batchim ganda:</span>' + ['ㄳ','ㄵ','ㄶ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅄ'].map(key).join('') + '</div>' + util;
  } else {
    const H = ['あ','い','う','え','お','か','き','く','け','こ','さ','し','す','せ','そ','た','ち','つ','て','と','な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ','ま','み','む','め','も','や','ゆ','よ','ら','り','る','れ','ろ','わ','を','ん'];
    const K = ['ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ','サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト','ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ','マ','ミ','ム','メ','モ','ヤ','ユ','ヨ','ラ','リ','ル','レ','ロ','ワ','ヲ','ン'];
    const DH = ['が','ぎ','ぐ','げ','ご','ざ','じ','ず','ぜ','ぞ','だ','ぢ','づ','で','ど','ば','び','ぶ','べ','ぼ','ぱ','ぴ','ぷ','ぺ','ぽ'];
    const DK = ['ガ','ギ','グ','ゲ','ゴ','ザ','ジ','ズ','ゼ','ゾ','ダ','ヂ','ヅ','デ','ド','バ','ビ','ブ','ベ','ボ','パ','ピ','プ','ペ','ポ'];
    const tabs = '<div class="kbd-tabs"><button type="button" class="chip' + (kbMode === 'hira' ? ' active' : '') + '" data-kbmode="hira">あ Hiragana</button><button type="button" class="chip' + (kbMode === 'kata' ? ' active' : '') + '" data-kbmode="kata">ア Katakana</button><button type="button" class="chip' + (kbMode === 'romaji' ? ' active' : '') + '" data-kbmode="romaji">ABC Romaji/QWERTY</button></div>';
    if (kbMode === 'romaji') {
      body = tabs + ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map(r => '<div class="kbd-row">' + r.split('').map(key).join('') + '</div>').join('') + util;
    } else {
      const base = kbMode === 'kata' ? K : H, daku = kbMode === 'kata' ? DK : DH, small = kbMode === 'kata' ? ['ァ','ィ','ゥ','ェ','ォ','ヮ','ャ','ュ','ョ','ッ','ー'] : ['ぁ','ぃ','ぅ','ぇ','ぉ','ゎ','ゃ','ゅ','ょ','っ','ー'];
      const rows = []; for (let i = 0; i < base.length; i += 10) rows.push('<div class="kbd-row">' + base.slice(i, i + 10).map(key).join('') + '</div>');
      body = tabs + rows.join('') +
        '<div class="kbd-row">' + daku.map(key).join('') + '</div>' +
        '<div class="kbd-row">' + small.map(key).join('') + '<button type="button" class="kbd-key" data-kbd-key="dakuten">゛</button><button type="button" class="kbd-key" data-kbd-key="handakuten">゜</button></div>' + util;
    }
  }
  mount.innerHTML = '<div class="kbd-wrap"><div class="kbd-head"><span>⌨️ Keyboard ' + LANGMETA[S.lang].name + ' lengkap — suku kata/kana tersusun otomatis</span><button type="button" class="btn white small" data-kbd-key="toggle">Sembunyikan</button></div><div class="kbd-body">' + body + '</div></div>';
  $$('[data-ch]', mount).forEach(b => b.onmousedown = e => e.preventDefault());
  $$('[data-ch]', mount).forEach(b => b.onclick = () => kbPress(input, b.dataset.ch));
  $$('[data-kbmode]', mount).forEach(b => b.onclick = () => { kbMode = b.dataset.kbmode; drawKeyboard(mount, input); });
  $$('[data-kbd-key]', mount).forEach(b => b.onclick = () => {
    const k = b.dataset.kbdKey;
    if (k === 'backspace') kbBack(input);
    else if (k === 'space') kbPress(input, ' ');
    else if (k === 'enter') kbEnter(input);
    else if (k === 'toggle') { const bd = $('.kbd-body', mount); if (bd) bd.style.display = bd.style.display === 'none' ? '' : 'none'; b.textContent = bd && bd.style.display === 'none' ? '⌨️ Keyboard' : 'Sembunyikan'; }
    else if (k === 'dakuten' || k === 'handakuten') { const map = k === 'dakuten' ? DAKU : HANDAKU; const v = input.value; if (v && map[v.slice(-1)]) kbSetValue(input, v.slice(0, -1) + map[v.slice(-1)]); }
  });
  if (!input._hgBound) {
    input._hgBound = true;
    input.addEventListener('input', e => {
      if (S.lang !== 'ko' || e.isComposing || input._hgBusy) return;
      if (/[ᄀ-ᇿ㄰-㆏]/.test(input.value)) { input._hgBusy = true; const nv = composeHangulString(input.value); if (nv !== input.value) { input.value = nv; input.dispatchEvent(new Event('input', { bubbles: true })); } input._hgBusy = false; }
    });
  }
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
      return { type: 'fill', prompt: blanked, answer: w[0], context: wordContext(w, 'fill', les.title), explain: 'Artinya "' + w[1] + '". Contoh lengkap: ' + w[2] + ' — ' + w[3] };
    }
    const distract = shuffle(v.map((x, i) => i).filter(i => i !== wi), wi + 31).slice(0, 3).map(i => v[i][0]);
    const opts = shuffle([w[0], ...distract], wi + 7);
    return { type: 'mc', prompt: 'Kamu mau bilang "' + w[1] + '" dalam Bahasa ' + LANGMETA[S.lang].name + ' saat topik "' + les.title + '". Kata apa yang tepat?', options: opts, answer: opts.indexOf(w[0]), context: wordContext(w, 'word', les.title), explain: 'Contoh: ' + w[2] + ' — ' + w[3] };
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
    if (qi === 4 && w[2]) return { type: 'fill', prompt: w[2].replace(new RegExp(w[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '___'), answer: w[0], context: wordContext(w, 'fill', '500 kata inti'), explain: 'Artinya "' + w[1] + '". ' + w[2] + ' — ' + w[3] };
    const distract = shuffle(core.map((x, i) => i).filter(i => i !== wi), wi + 17).slice(0, 3).map(i => core[i][0]);
    const opts = shuffle([w[0], ...distract], wi + 3);
    return { type: 'mc', prompt: 'Kata Bahasa ' + LANGMETA[S.lang].name + ' untuk "' + w[1] + '" adalah…', options: opts, answer: opts.indexOf(w[0]), context: wordContext(w, 'word', '500 kata inti'), explain: (w[2] ? 'Contoh: ' + w[2] + ' — ' + w[3] : 'Kata ini termasuk 500 kata inti ' + LANGMETA[S.lang].name + '.') };
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
  c.innerHTML = '<div class="wrap"><h1 class="page">Dialog situasional</h1><p class="sub">12 percakapan Bahasa ' + LANGMETA[S.lang].name + ' untuk situasi sehari-hari. Dengarkan, lalu tirukan. Setiap pembicara dibacakan dengan suara sesuai jenis kelaminnya — laki-laki dan perempuan tidak memakai suara yang sama.</p>' +
    '<div class="grid2" style="margin-top:16px">' + DG.dialogs[S.lang].map((d, i) => '<div class="card"><div class="sect-label" style="margin-top:0">' + esc(d.place) + '</div><b style="font-size:16px">' + esc(d.title) + '</b>' +
    dialogLinesHTML(d) + '</div>').join('') + '</div></div>';
}
/* ===== TATA BAHASA: Pola per level + Catatan Penting + Jenis Kata + Kata Hari Ini (isi v16) ===== */
function wordOfDay() { const pool = DG.core[S.lang].filter(w => w[2]); const d = new Date(); const n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); return pool[n % pool.length]; }
function pageGrammar(c) {
  const wc = DG.wordClasses[S.lang], notes = DG.notes[S.lang], pats = DG.patterns[S.lang];
  const wod = wordOfDay();
  let body = '<div class="card" style="margin-bottom:16px"><div class="sect-label" style="margin-top:0">Kata Hari Ini</div><p style="font-size:19px"><b>' + esc(wod[0]) + '</b> = ' + esc(wod[1]) + ' ' + ttsBtn(wod[0]) + '</p><p class="muted" style="margin-top:4px"><b>' + esc(wod[2]) + '</b> ' + ttsBtn(wod[2]) + '<br>' + esc(wod[3]) + '</p></div>';
  body += '<div class="sect-label">Grammar Pattern per level (A0–C2)</div>' + LEVELS.map(lv => {
    const rows = ((pats && pats[lv]) || []).map(p => '<tr><td><b>' + esc(p[0]) + '</b></td><td>' + esc(p[1]) + ' ' + ttsBtn(p[1]) + '</td><td>' + esc(p[2]) + '</td></tr>').join('');
    return '<div class="card" style="margin-bottom:16px"><b style="font-size:16px">Level ' + lv + '</b><table class="tbl"><tr><th>Pola</th><th>Contoh</th><th>Artinya</th></tr>' + rows + '</table></div>';
  }).join('');
  body += '<div class="sect-label">Catatan Penting (' + (notes ? notes.length : 0) + ' catatan)</div>' + (notes || []).map(n => '<div class="card" style="margin-bottom:12px"><b>' + esc(n[0]) + '</b><p style="margin:6px 0">' + esc(n[1]) + '</p>' + (n[2] || []).map(x => '<div class="sent-line"><b>' + esc(x[0]) + '</b> ' + ttsBtn(x[0]) + '<small>' + esc(x[1]) + '</small></div>').join('') + '</div>').join('');
  body += '<div class="sect-label">Jenis Kata</div>' + (wc || []).map(g => '<div class="card" style="margin-bottom:16px"><b style="font-size:16px">' + esc(g[0]) + '</b><p class="muted" style="margin:5px 0 10px">' + esc(g[1]) + '</p><table class="tbl"><tr><th>Kata</th><th>Arti</th><th>Contoh</th></tr>' + g[2].map(w => '<tr><td><b>' + esc(w[0]) + '</b> ' + ttsBtn(w[0]) + '</td><td>' + esc(w[1]) + '</td><td>' + esc(w[2]) + '<br><span class="muted small">' + esc(w[3]) + '</span></td></tr>').join('') + '</table></div>').join('');
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Tata Bahasa — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Grammar Pattern bertahap A0–C2, Catatan Penting, Jenis Kata, dan Kata Hari Ini — persis isi web sebelumnya, tampilan v21.</p><div style="margin-top:16px">' + body + '</div></div>';
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
let idiomQ = '', idiomTab = 'idiom';
function pageIdioms(c) {
  if (S.lang === 'en') {
    const all = idiomTab === 'idiom' ? DG.idioms : DG.phrasal;
    const q = idiomQ.toLowerCase();
    const list = all.filter(x => !q || x[0].toLowerCase().includes(q) || x[1].toLowerCase().includes(q));
    c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Idiom & Phrasal Verbs — Inggris</h1><p class="sub">' + DG.idioms.length + ' idiom + ' + DG.phrasal.length + ' phrasal verbs = ' + (DG.idioms.length + DG.phrasal.length) + ' ungkapan (isi lengkap web sebelumnya). Cari untuk menyaring.</p>' +
      '<div class="tabs"><button type="button" class="tab' + (idiomTab === 'idiom' ? ' active' : '') + '" data-itab="idiom">Idiom (' + DG.idioms.length + ')</button><button type="button" class="tab' + (idiomTab === 'phrasal' ? ' active' : '') + '" data-itab="phrasal">Phrasal Verbs (' + DG.phrasal.length + ')</button></div>' +
      '<div class="searchbox" style="max-width:none;margin-top:14px"><span>🔍</span><input id="idiom-q" type="search" placeholder="Cari ungkapan atau arti…" value="' + esc(idiomQ) + '"></div>' +
      '<p class="small muted" style="margin-top:10px">' + list.length + ' hasil</p><div class="card" style="margin-top:8px;padding:6px 20px">' +
      list.slice(0, 200).map(x => '<div class="sent-line"><b>' + esc(x[0]) + '</b> ' + ttsBtn(x[0]) + ' <span class="muted">— ' + esc(x[1]) + '</span><small>' + esc(x[2]) + ' · ' + esc(x[3]) + '</small></div>').join('') + '</div>' +
      (list.length > 200 ? '<p class="muted small" style="margin-top:8px">Menampilkan 200 pertama — persempit dengan pencarian.</p>' : '') + '</div>';
    $$('[data-itab]', c).forEach(b => b.onclick = () => { idiomTab = b.dataset.itab; pageIdioms(c); });
    $('#idiom-q', c).addEventListener('input', e => { idiomQ = e.target.value; clearTimeout(c._iq); c._iq = setTimeout(() => pageIdioms(c), 250); });
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
    '<div class="card" style="max-width:640px;margin:18px auto 0;text-align:center"><div class="q-context" style="text-align:left"><span class="q-context-label">Konteks</span> Kamu akan mendengar satu kalimat Bahasa ' + LANGMETA[S.lang].name + ' dari kosakata inti. Tugasmu: ketik persis kalimat yang kamu dengar, lengkap dengan tanda bacanya.</div><p class="muted" style="margin-top:12px">Klik untuk memutar kalimat (bisa diulang):</p>' +
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
  const prompts = (DG.writingPrompts[S.lang] || []).slice(0, 12);
  c.innerHTML = '<div class="wrap"><h1 class="page">Menulis — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Tulis bebas dengan tema terpandu. Tulisanmu tersimpan di Jurnal.</p>' +
    '<div class="card" style="margin-top:16px"><div class="sect-label" style="margin-top:0">Tema hari ini</div><div class="chiprow" id="wp-chips">' +
    (prompts.length ? prompts.map((p, i) => '<button type="button" class="chip' + (i === 0 ? ' active' : '') + '" data-wp="' + i + '">' + esc(String(Array.isArray(p) ? p[1] : p).slice(0, 42)) + '…</button>').join('') : '<span class="muted">Tulis pengalamanmu hari ini dalam Bahasa ' + LANGMETA[S.lang].name + '.</span>') + '</div>' +
    '<p class="small muted" style="margin-top:10px" id="wp-text">' + esc(prompts[0] ? (Array.isArray(prompts[0]) ? prompts[0][1] : prompts[0]) : 'Tulis pengalamanmu hari ini.') + '</p>' +
    '<textarea id="w-text" rows="7" style="width:100%;border:1px solid var(--line);border-radius:12px;padding:13px;margin-top:10px" placeholder="Mulai menulis di sini…"></textarea>' + (needsKeyboard() ? '<div id="vkbd"></div>' : '') +
    '<div class="quiz-actions"><span class="small muted" id="w-count">0 karakter</span><button type="button" class="btn" id="w-save">Simpan ke Jurnal (+5 XP)</button><button type="button" class="btn white" id="w-script">Belajar menulis aksara →</button></div></div></div>';
  drawKeyboard($('#vkbd', c), $('#w-text', c));
  $$('[data-wp]', c).forEach(b => b.onclick = () => { $$('[data-wp]', c).forEach(x => x.classList.remove('active')); b.classList.add('active'); const pp = prompts[+b.dataset.wp]; $('#wp-text', c).textContent = Array.isArray(pp) ? pp[1] : pp; });
  $('#w-text', c).addEventListener('input', e => $('#w-count', c).textContent = e.target.value.length + ' karakter');
  $('#w-save', c).onclick = () => {
    const t = $('#w-text', c).value.trim(); if (t.length < 10) { toast('Tulis sedikit lebih panjang dulu ya.'); return; }
    S.journal.unshift({ date: todayStr(), lang: S.lang, text: t }); save(); awardBonus(5, 'menulis'); toast('Tersimpan di Jurnal. +5 XP');
    $('#w-text', c).value = ''; $('#w-count', c).textContent = '0 karakter';
  };
  $('#w-script', c).onclick = () => go('script');
}
/* ===== BELAJAR MENULIS — LENGKAP untuk 3 bahasa (isi penuh, bukan catatan) ===== */
const EN_LETTERS = [['A a', 'ei', 'apple — apel'], ['B b', 'bi', 'book — buku'], ['C c', 'si', 'cat — kucing'], ['D d', 'di', 'dog — anjing'], ['E e', 'i', 'egg — telur'], ['F f', 'ef', 'fish — ikan'], ['G g', 'ji', 'go — pergi'], ['H h', 'eich', 'house — rumah'], ['I i', 'ai', 'I — saya'], ['J j', 'jei', 'juice — jus'], ['K k', 'kei', 'key — kunci'], ['L l', 'el', 'lion — singa'], ['M m', 'em', 'milk — susu'], ['N n', 'en', 'name — nama'], ['O o', 'ou', 'orange — jeruk'], ['P p', 'pi', 'pen — pulpen'], ['Q q', 'kyu', 'queen — ratu'], ['R r', 'ar', 'rice — nasi'], ['S s', 'es', 'sun — matahari'], ['T t', 'ti', 'tea — teh'], ['U u', 'yu', 'umbrella — payung'], ['V v', 'vi', 'voice — suara'], ['W w', 'dabelyu', 'water — air'], ['X x', 'eks', 'box — kotak'], ['Y y', 'wai', 'yellow — kuning'], ['Z z', 'zi', 'zoo — kebun binatang']];
const EN_COMBOS = [['sh', 'sy', 'ship (kapal), fish (ikan)'], ['ch', 'c', 'chair (kursi), watch (menonton)'], ['th', 'lidah di antara gigi', 'this (ini), think (berpikir) — dua bunyi berbeda'], ['ph', 'f', 'phone (telepon), photo (foto)'], ['ck', 'k', 'duck (bebek), back (kembali/punggung)'], ['ng', '-ng di akhir', 'sing (bernyanyi), king (raja)'], ['qu', 'kw', 'queen (ratu), quick (cepat)'], ['wh', 'w', 'what (apa), where (di mana)']];
const KO_CONS = [['ㄱ', 'g/k — seperti "g" di "gajah"', '가방 (tas)'], ['ㄲ', 'kk — tegang, seperti "k" ditekan', '까치 (burung murai)'], ['ㄴ', 'n — seperti "n"', '나라 (negara)'], ['ㄷ', 'd/t — seperti "d"', '다리 (kaki/jembatan)'], ['ㄸ', 'tt — tegang', '딸 (anak perempuan)'], ['ㄹ', 'r/l — di awal r, di akhir l', '라면 (ramyeon)'], ['ㅁ', 'm — seperti "m"', '물 (air)'], ['ㅂ', 'b/p — seperti "b"', '밥 (nasi)'], ['ㅃ', 'pp — tegang', '빵 (roti)'], ['ㅅ', 's — seperti "s"', '사과 (apel)'], ['ㅆ', 'ss — tegang', '싸다 (murah)'], ['ㅇ', 'di awal diam, di akhir -ng', '강 (sungai)'], ['ㅈ', 'j — seperti "j"', '집 (rumah)'], ['ㅉ', 'jj — tegang', '짜다 (asin)'], ['ㅊ', 'ch — seperti "c" berdesis', '차 (teh/mobil)'], ['ㅋ', 'kh — k berhembus', '코 (hidung)'], ['ㅌ', 'th — t berhembus', '토마토 (tomat)'], ['ㅍ', 'ph — p berhembus', '포도 (anggur)'], ['ㅎ', 'h — seperti "h"', '하늘 (langit)']];
const KO_VOWELS = [['ㅏ', 'a'], ['ㅐ', 'ae'], ['ㅑ', 'ya'], ['ㅒ', 'yae'], ['ㅓ', 'eo'], ['ㅔ', 'e'], ['ㅕ', 'yeo'], ['ㅖ', 'ye'], ['ㅗ', 'o'], ['ㅘ', 'wa (ㅗ+ㅏ)'], ['ㅙ', 'wae (ㅗ+ㅐ)'], ['ㅚ', 'oe (ㅗ+ㅣ)'], ['ㅛ', 'yo'], ['ㅜ', 'u'], ['ㅝ', 'wo (ㅜ+ㅓ)'], ['ㅞ', 'we (ㅜ+ㅔ)'], ['ㅟ', 'wi (ㅜ+ㅣ)'], ['ㅠ', 'yu'], ['ㅡ', 'eu'], ['ㅢ', 'ui (ㅡ+ㅣ)'], ['ㅣ', 'i']];
const JA_KANA = [['あ','ア','a · ame (雨 hujan)'],['い','イ','i · inu (犬 anjing)'],['う','ウ','u · umi (海 laut)'],['え','エ','e · eki (駅 stasiun)'],['お','オ','o · oka (丘 bukit)'],['か','カ','ka · kaze (風 angin)'],['き','キ','ki · ki (木 pohon)'],['く','ク','ku · kumo (雲 awan)'],['け','ケ','ke · keeki (ケーキ kue)'],['こ','コ','ko · koko (ここ sini)'],['さ','サ','sa · sora (空 langit)'],['し','シ','shi · sushi (寿司)'],['す','ス','su · suika (西瓜 semangka)'],['せ','セ','se · sensei (先生 guru)'],['そ','ソ','so · sora (空 langit)'],['た','タ','ta · tako (たこ gurita)'],['ち','チ','chi · chizu (地図 peta)'],['つ','ツ','tsu · tsuki (月 bulan)'],['て','テ','te · tegami (手紙 surat)'],['と','ト','to · toki (時 waktu)'],['な','ナ','na · natsu (夏 musim panas)'],['に','ニ','ni · niwa (庭 taman)'],['ぬ','ヌ','nu · nuno (布 kain)'],['ね','ネ','ne · neko (猫 kucing)'],['の','ノ','no · nomu (飲む minum)'],['は','ハ','ha · hana (花 bunga)'],['ひ','ヒ','hi · hi (日 hari)'],['ふ','フ','fu · fune (船 kapal)'],['へ','ヘ','he · heya (部屋 kamar)'],['ほ','ホ','ho · hoshi (星 bintang)'],['ま','マ','ma · machi (町 kota)'],['み','ミ','mi · mizu (水 air)'],['む','ム','mu · mura (村 desa)'],['め','メ','me · me (目 mata)'],['も','モ','mo · momo (桃 persik)'],['や','ヤ','ya · yama (山 gunung)'],['ゆ','ユ','yu · yuki (雪 salju)'],['よ','ヨ','yo · yoru (夜 malam)'],['ら','ラ','ra · ringo (りんご apel)'],['り','リ','ri · risu (りす tupai)'],['る','ル','ru · rusuban (留守番)'],['れ','レ','re · reban (レバ刺し) — remon (レモン lemon)'],['ろ','ロ','ro · roji (路地 gang)'],['わ','ワ','wa · watashi (私 saya)'],['を','ヲ','wo — partikel objek, dibaca "o"'],['ん','ン','n — bunyi sengau penutup']];
const JA_KANJI = [['一', 'ichi — satu'], ['二', 'ni — dua'], ['三', 'san — tiga'], ['人', 'hito — orang'], ['日', 'hi / nichi — hari, matahari'], ['月', 'tsuki / getsu — bulan'], ['山', 'yama — gunung'], ['川', 'kawa — sungai'], ['水', 'mizu — air'], ['火', 'hi / ka — api'], ['木', 'ki — pohon'], ['学校', 'gakkou — sekolah'], ['先生', 'sensei — guru'], ['学生', 'gakusei — pelajar'], ['日本', 'nihon — Jepang'], ['雨', 'ame — hujan'], ['電車', 'densha — kereta listrik'], ['友達', 'tomodachi — teman'], ['家族', 'kazoku — keluarga']];
function strokeAnim(ch, reading) {
  return '<span class="stroke-anim" title="Animasi urutan goresan">' + esc(ch) + '</span> <small class="muted">' + esc(reading || '') + '</small>';
}
function cobaTulisHTML(rows, labelOf) {
  return '<div class="card"><div class="sect-label" style="margin-top:0">Coba Tulis</div><p class="small muted">Target: <b id="ct-target" style="font-size:24px;color:var(--ink)">' + esc(rows[0][0]) + '</b> <span id="ct-label">(' + esc(labelOf(rows[0])) + ')</span> — ketik/tekan huruf yang sama:</p>' +
    '<input class="fill-input" id="ct-in" type="text" autocomplete="off"><div id="vkbd"></div><div id="ct-fb" style="margin-top:10px;text-align:center"></div>' +
    '<div class="quiz-actions" style="justify-content:center"><button type="button" class="btn white" id="ct-next">Huruf acak</button></div></div>';
}
function bindCobaTulis(c, rows, labelOf) {
  let target = rows[0];
  const setT = r => { target = r; $('#ct-target', c).textContent = r[0]; $('#ct-label', c).textContent = '(' + labelOf(r) + ')'; $('#ct-in', c).value = ''; $('#ct-fb', c).innerHTML = ''; };
  $$('[data-ch2]', c).forEach(b => b.onclick = () => { const r = rows.find(x => x[0] === b.dataset.ch2); if (r) { speak(r[0], b); setT(r); } });
  const nx = $('#ct-next', c); if (nx) nx.onclick = () => setT(rows[Math.floor(Math.random() * rows.length)]);
  const inp = $('#ct-in', c); if (inp) { drawKeyboard($('#vkbd', c), inp); inp.addEventListener('input', () => { if (inp.value.trim() === target[0]) { $('#ct-fb', c).innerHTML = '<span style="color:var(--green)"><b>Betul!</b></span>'; awardBonus(1, 'aksara'); } }); }
}
function pageScript(c) {
  if (S.lang === 'en') {
    c.innerHTML = '<div class="wrap"><h1 class="page">Belajar Menulis — Alfabet Inggris A–Z</h1><p class="sub">Alfabet Latin yang sama dengan Bahasa Indonesia, tapi NAMA huruf dan bunyinya berbeda. Klik huruf untuk mendengar nama hurufnya.</p>' +
      '<div class="card" style="margin-top:16px"><div class="sect-label" style="margin-top:0">Alfabet A–Z (huruf besar + kecil, nama huruf, contoh kata)</div><div class="char-grid">' +
      EN_LETTERS.map(r => '<button type="button" class="char-cell" data-ch2="' + esc(r[2].split(' — ')[0]) + '"><b>' + r[0] + '</b><small>dibaca "' + r[1] + '"</small><small>' + esc(r[2]) + '</small></button>').join('') + '</div></div>' +
      '<div class="grid2" style="margin-top:16px;align-items:start"><div class="card"><div class="sect-label" style="margin-top:0">Huruf yang sering membingungkan</div>' +
      [['b vs d', 'b perutnya di kanan garis, d perutnya di kiri — bayangkan "bed": b-e-d, dua perut saling berhadapan.'], ['p vs q', 'p turun ke bawah garis, q juga turun tapi lengkungnya di sisi lain.'], ['m vs w', 'w adalah m terbalik.'], ['u vs v', 'u melengkung di bawah, v runcing di bawah; V juga huruf sendiri (voice).']].map(x => '<p style="margin:8px 0"><b>' + x[0] + '</b> — ' + x[1] + '</p>').join('') +
      '<div class="sect-label">Aturan huruf kapital</div><p>Huruf kapital dipakai untuk: awal kalimat, nama orang/tempat (Ani, Jakarta), nama hari & bulan (Monday, June), kata "I" (saya) selalu kapital, dan gelar (Mr., Dr.).</p></div>' +
      '<div class="card"><div class="sect-label" style="margin-top:0">Kombinasi huruf umum</div><table class="tbl"><tr><th>Kombinasi</th><th>Bunyi</th><th>Contoh</th></tr>' + EN_COMBOS.map(x => '<tr><td><b>' + x[0] + '</b></td><td>' + x[1] + '</td><td>' + x[2] + '</td></tr>').join('') + '</table></div></div>' +
      '<div style="margin-top:16px">' + cobaTulisHTML(EN_LETTERS.map(r => [r[2].split(' — ')[0], r[0]]), r => r[1]) + '</div></div>';
    bindCobaTulis(c, EN_LETTERS.map(r => [r[2].split(' — ')[0], r[0]]), r => r[1]);
    return;
  }
  if (S.lang === 'ko') {
    c.innerHTML = '<div class="wrap"><h1 class="page">Belajar Menulis & Pengucapan — Hangul Lengkap</h1><p class="sub">Hangul disusun per blok suku kata: konsonan awal + vokal (+ batchim di bawah). Klik huruf untuk mendengar bunyinya — huruf di bawah juga menunjukkan animasi urutan goresan (tulis mengikuti arah geraknya).</p>' +
      '<div class="card" style="margin-top:16px"><div class="sect-label" style="margin-top:0">Konsonan — 14 dasar + 5 ganda (ㄲ ㄸ ㅃ ㅆ ㅉ)</div><div class="char-grid">' +
      KO_CONS.map(r => '<button type="button" class="char-cell" data-ch2="' + r[0] + '">' + strokeAnim(r[0], r[1]) + '<small>' + esc(r[2]) + '</small></button>').join('') + '</div></div>' +
      '<div class="card" style="margin-top:16px"><div class="sect-label" style="margin-top:0">Vokal — 10 dasar + 11 gabungan</div><div class="char-grid">' +
      KO_VOWELS.map(r => '<button type="button" class="char-cell" data-ch2="' + r[0] + '">' + strokeAnim(r[0], r[1]) + '</button>').join('') + '</div>' +
      '<p class="small muted" style="margin-top:10px">Urutan goresan umum: dari kiri ke kanan, dari atas ke bawah. Huruf animasi di atas berdenyut mengikuti arah tulisnya.</p></div>' +
      '<div class="grid2" style="margin-top:16px;align-items:start"><div class="card"><div class="sect-label" style="margin-top:0">Merangkai blok suku kata</div><p>ㄱ + ㅏ = 가 (ga) · ㄱ + ㅏ + ㅁ = 감 (gam — ㅁ jadi batchim di bawah). Vokal tegak (ㅏ ㅓ ㅣ) ditulis di KANAN konsonan; vokal rebah (ㅗ ㅜ ㅡ) ditulis di BAWAH konsonan.</p><p style="margin-top:8px"><b>Batchim:</b> konsonan akhir di bawah blok, mis. 한 (han), 읽 (ilg — batchim ganda ㄺ). Batchim ganda: ㄳ ㄵ ㄶ ㄺ ㄻ ㄼ ㄽ ㄾ ㄿ ㅀ ㅄ. Bila sesudah batchim ada vokal, batchim PINDAH jadi awal suku kata berikutnya: 먹어 → 머거 (dibaca meogeo→meokeo). Coba di keyboard virtual halaman kuis/dikte: ketik ㅅㅏㄱㅗㅏ menjadi 사과.</p></div>' +
      cobaTulisHTML(KO_CONS.concat(KO_VOWELS), r => r[1]) + '</div></div>';
    bindCobaTulis(c, KO_CONS.concat(KO_VOWELS), r => r[1]);
    return;
  }
  c.innerHTML = '<div class="wrap"><h1 class="page">Belajar Menulis & Pengucapan — Kana & Kanji</h1><p class="sub">Jepang memakai tiga huruf: <b>Hiragana</b> untuk kata asli Jepang & tata bahasa, <b>Katakana</b> untuk kata serapan asing & nama asing, <b>Kanji</b> untuk akar kata (kata benda & batang kata kerja). Klik kana untuk mendengar bunyinya.</p>' +
    '<div class="card" style="margin-top:16px"><div class="sect-label" style="margin-top:0">Hiragana 46 + Katakana 46</div><div class="char-grid">' +
    JA_KANA.map(r => '<button type="button" class="char-cell" data-ch2="' + r[0] + '">' + strokeAnim(r[0] + ' · ' + r[1], r[2]) + '</button>').join('') + '</div>' +
    '<p class="small muted" style="margin-top:10px">Urutan goresan umum: dari atas ke bawah, kiri ke kanan; huruf animasi berdenyut mengikuti arah tulisnya.</p></div>' +
    '<div class="grid2" style="margin-top:16px;align-items:start"><div class="card"><div class="sect-label" style="margin-top:0">Dakuten, handakuten, kana kecil, pemanjang</div><p><b>Dakuten ゛</b> mengubah bunyi: か→が, さ→ざ, た→だ, は→ば. <b>Handakuten ゜</b>: は→ぱ. <b>Kana kecil</b> ぁぃぅぇぉ ゃゅょ っ: っ (tsu kecil) = jeda/geminasi (ずっと), ゃゅょ membuat bunyi gabungan (きゃ kya). <b>Pemanjangan vokal:</b> Hiragana menambah vokal (おかあさん), Katakana memakai ー (ケーキ keeki).</p><div class="sect-label">Kapan pakai huruf apa?</div><p>Hiragana: partikel, akhiran kata kerja, kata asli tanpa Kanji umum. Katakana: kata pinjaman (コーヒー kopi), nama orang/tempat asing, efek tegas. Kanji: hemat tempat & membedakan homofon — belajar bertahap dari 19 kanji dasar di kanan/bawah.</p></div>' +
    '<div class="card"><div class="sect-label" style="margin-top:0">19 Kanji dasar</div><div class="char-grid">' + JA_KANJI.map(r => '<button type="button" class="char-cell" data-ch2="' + r[0] + '">' + strokeAnim(r[0], r[1]) + '</button>').join('') + '</div></div></div>' +
    '<div style="margin-top:16px">' + cobaTulisHTML(JA_KANA.map(r => [r[0], r[2]]), r => r[1]) + '</div></div>';
  bindCobaTulis(c, JA_KANA.map(r => [r[0], r[2]]), r => r[1]);
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
      qs.push({ type: 'mc', prompt: '[' + lv + '] Kata untuk "' + w[1] + '" adalah…', options: opts, answer: opts.indexOf(w[0]), context: wordContext(w, 'word', 'level ' + lv), explain: 'Contoh: ' + w[2] + ' — ' + w[3], _lv: lv });
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
  $$('[data-exam]', c).forEach(b => b.onclick = () => { if (S.lang === 'ko' && b.dataset.exam === '2') { go('eps'); return; } examTab = 'sim'; pageExams(c); });
  bindSimButtons(c);
}
function simButtons() {
  if (S.lang === 'en') return DG.mocks.map((m, i) => '<button type="button" class="btn' + (i ? ' white' : '') + '" data-sim="mock' + i + '">' + esc(m.name) + ' (' + m.questions.length + ' soal)</button>').join(' ');
  if (S.lang === 'ko') return '<button type="button" class="btn" data-sim="topik1">Simulasi TOPIK I</button> <button type="button" class="btn white" data-sim="topik2">Simulasi TOPIK II</button> <button type="button" class="btn white" data-sim="komockL">Mock TOPIK — Listening (' + DG.komockL.length + ' soal)</button> <button type="button" class="btn white" data-sim="komockR">Mock TOPIK — Reading (' + DG.komockR.length + ' soal)</button>';
  return '<button type="button" class="btn" data-sim="jlpt">Simulasi JLPT (12 soal)</button>';
}
function bindSimButtons(c) {
  $$('[data-sim]', c).forEach(b => b.onclick = () => {
    const kind = b.dataset.sim;
    let qs = [], title = '';
    if (kind.startsWith('mock')) { const m = DG.mocks[+kind.slice(4) || 0]; title = m.name; qs = m.questions.map(q => ({ type: 'mc', prompt: q[0], options: q[1], answer: q[2], context: 'Soal mock test ujian Bahasa Inggris — baca pertanyaannya baik-baik, pikirkan konteks bacaan/kalimatnya, lalu pilih jawaban yang paling tepat.', explain: q[3] })); }
    if (kind === 'topik1' || kind === 'topik2') { const bank = kind === 'topik1' ? DG.topik1 : DG.topik2; title = kind === 'topik1' ? 'TOPIK I — Simulasi' : 'TOPIK II — Simulasi'; qs = shuffle(bank, 5).slice(0, 10).map(q => ({ type: 'mc', prompt: q[0], options: q[1], answer: q[2], context: 'Soal simulasi TOPIK — kata atau pola di dalam kalimat Korea itu sedang ditanyakan. Baca kalimatnya utuh dulu, lalu pilih jawaban yang paling tepat.', explain: q[3] + (q[4] ? ' ' + q[4] : '') })); }
    if (kind === 'komockL' || kind === 'komockR') { const bank = kind === 'komockL' ? DG.komockL : DG.komockR; title = kind === 'komockL' ? 'TOPIK Mock — Listening' : 'TOPIK Mock — Reading'; qs = bank.map(q => ({ type: 'mc', prompt: q[0], options: q[1], answer: q[2], context: kind === 'komockL' ? 'Soal listening TOPIK — bayangkan kamu mendengar percakapan itu di situasi nyata, perhatikan angka dan kata kuncinya, lalu jawab maksudnya.' : 'Soal reading TOPIK — baca teks pendeknya kata per kata; jawaban yang benar tertulis di dalam teks itu.', explain: q[3] + (q[4] ? ' ' + q[4] : '') })); }
    if (kind === 'jlpt') { qs = shuffle(DG.jlpt, 9).slice(0, 12).map(q => ({ type: 'mc', prompt: (q.passage ? q.passage + ' — ' : '') + q.q + ' (' + q.level + ' · ' + q.skill + ')', options: q.options, answer: q.answer, context: 'Soal simulasi JLPT ' + q.level + ' (' + q.skill + ') — baca teks Jepangnya pelan-pelan, cari kata kunci yang ditanyakan, lalu pilih jawaban yang paling tepat.', explain: q.explain })); title = 'JLPT — Simulasi'; }
    runQuiz(c, { routeName: 'exams', title: 'SIMULASI · ' + title.toUpperCase(), sub: 'Mode latihan: pembahasan muncul setelah tiap jawaban. Target 70%.', questions: qs,
      finish(cc, pct, ok, total) { if (pct >= 70) awardBonus(10, 'simulasi'); cc.innerHTML = '<div class="wrap"><div class="card" style="max-width:560px;margin:30px auto;text-align:center"><div class="sect-label">Hasil simulasi</div><h1 class="page">' + pct + '%</h1><p class="muted">' + ok + '/' + total + ' benar.' + (pct >= 70 ? ' +10 XP bonus.' : '') + '</p><button type="button" class="btn" style="margin-top:14px" id="sim-back">Kembali ke Persiapan Ujian</button></div></div>'; $('#sim-back', cc).onclick = () => go('exams'); } });
  });
}

/* ===== CHEAT SHEET (8 lembar per bahasa — isi v16) ===== */
function pageCheats(c) {
  const sheets = DG.cheats[S.lang] || [];
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Cheat Sheet — ' + LANGMETA[S.lang].name + '</h1><p class="sub">' + sheets.length + ' lembar referensi cepat. Buka kapan pun dari menu Koleksi.</p>' +
    '<div class="grid2" style="margin-top:16px;align-items:start">' + sheets.map(s => '<div class="card"><b style="font-size:16px">' + esc(s[0]) + '</b><p style="margin-top:6px">' + esc(s[1]) + '</p></div>').join('') + '</div></div>';
}
/* ===== SIMULASI SPEAKING (24 topik IELTS-style + latihan bicara per bahasa) ===== */
function pageSpeaking(c) {
  if (S.lang !== 'en') {
    c.innerHTML = '<div class="wrap"><h1 class="page">Latihan Bicara — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Pakai dialog situasional sebagai bahan bicara: dengarkan per baris (suara laki-laki/perempuan berbeda), lalu tirukan dengan suaramu.</p>' +
      '<div style="margin-top:16px">' + DG.dialogs[S.lang].slice(0, 4).map(d => '<div class="card" style="margin-bottom:14px"><div class="sect-label" style="margin-top:0">' + esc(d.place) + '</div><b>' + esc(d.title) + '</b>' + dialogLinesHTML(d) + '</div>').join('') + '</div></div>';
    return;
  }
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Speaking Simulation — 24 Topik</h1><p class="sub">Format IELTS Speaking Part 2: baca topik & cue card, siapkan 1 menit, lalu bicara 1–2 menit. Klik topik untuk membuka cue-nya.</p>' +
    '<div class="grid2" style="margin-top:16px;align-items:start">' + DG.speaking.map((s, i) => '<div class="card"><div class="sect-label" style="margin-top:0">Topik ' + (i + 1) + '</div><b style="font-size:16px">' + esc(s.topic) + '</b><p class="muted" style="margin:6px 0">' + esc(s.cue) + '</p>' + (s.phrases ? '<p class="small"><b>Frasa kunci:</b> ' + esc(Array.isArray(s.phrases) ? s.phrases.join(' · ') : s.phrases) + '</p>' : '') + (s.sample ? '<div class="contoh-box"><span class="qtype">Contoh jawaban</span><p style="margin-top:6px">' + esc(s.sample) + '</p></div>' : '') + '</div>').join('') + '</div></div>';
}
/* ===== TULIS & ESAI UJIAN: IELTS essays (EN) / GKS + TOPIK writing (KO) / prompts (JA) ===== */
function pageExamWriting(c) {
  if (S.lang === 'en') {
    c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">IELTS Writing Blueprint + 10 Sample Essays Band 7–9</h1><p class="sub">Blueprint: pahami prompt → parafrase pembuka → 2 paragraf isi (ide–penjelasan–contoh) → kesimpulan. Pelajari 10 esai contoh band 7–9 di bawah ini.</p>' +
      DG.essays.map((e, i) => '<div class="card" style="margin-top:14px"><div class="sect-label" style="margin-top:0">' + esc(e.type) + ' · Band ' + esc(e.band) + '</div><b style="font-size:16px">' + esc(e.title) + '</b><p class="muted" style="margin:6px 0"><b>Prompt:</b> ' + esc(e.prompt) + '</p><div class="contoh-box" style="white-space:pre-line">' + esc(e.essay || e.model || '') + '</div>' + (e.notes ? '<p class="small" style="margin-top:8px">' + esc(e.notes) + '</p>' : '') + '</div>').join('') + '</div>';
    return;
  }
  if (S.lang === 'ko') {
    c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Tulis & Esai Ujian — Korea</h1><p class="sub">Persiapan menulis GKS dan TOPIK Writing (KOMOCK_W) — isi lengkap web sebelumnya.</p>' +
      '<div class="card" style="margin-top:16px"><b style="font-size:16px">' + esc(DG.gks.title) + '</b><p style="white-space:pre-line;margin-top:8px">' + esc(DG.gks.body) + '</p></div>' +
      '<div class="sect-label">TOPIK Writing — ' + DG.komockW.length + ' latihan dengan model jawaban</div>' +
      DG.komockW.map((w, i) => '<div class="card" style="margin-top:12px"><b>' + (i + 1) + '. ' + esc(w.prompt) + '</b><div class="contoh-box" style="margin-top:8px"><span class="qtype">Model jawaban</span><p style="margin-top:6px">' + esc(w.model) + '</p></div><p class="small" style="margin-top:8px"><b>Tips:</b> ' + esc(w.tip) + '</p></div>').join('') + '</div>';
    return;
  }
  const prompts = (DG.writingPrompts.ja || []).slice(0, 12);
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Tulis & Esai Ujian — Jepang</h1><p class="sub">Latihan menulis JLPT/JFT dengan tema terpandu dan contoh jawaban (dari 108 Writing Prompts). Tulis jawabanmu di menu Menulis.</p>' +
    prompts.map((p, i) => '<div class="card" style="margin-top:12px"><div class="sect-label" style="margin-top:0">Tema ' + (i + 1) + '</div><b>' + esc(p[1]) + '</b><div class="contoh-box" style="margin-top:8px"><span class="qtype">Contoh jawaban</span><p style="margin-top:6px">' + esc(p[2] || '') + '</p></div></div>').join('') + '</div>';
}
/* ===== FITUR KHUSUS per bahasa: TOEIC Business (EN) / K-Drama (KO) / JFT (JA) ===== */
function pageKhusus(c) {
  if (S.lang === 'en') {
    c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">TOEIC Business English</h1><p class="sub">' + DG.business.length + ' paket frasa bisnis untuk TOEIC & dunia kerja.</p>' +
      DG.business.map(b => '<div class="card" style="margin-top:14px"><b style="font-size:16px">' + esc(b.title) + '</b>' + b.items.map(it => '<div class="sent-line"><b>' + esc(it[0]) + '</b> ' + ttsBtn(it[0]) + '<small>' + esc(it[1]) + '</small></div>').join('') + '</div>').join('') + '</div>';
    return;
  }
  if (S.lang === 'ko') {
    c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Fitur Khusus Korea</h1><p class="sub">K-Drama Checklist, Vocab Priority TOPIK/EPS, dan jalan pintas EPS-TOPIK.</p>' +
      '<div class="sect-label">K-Drama Checklist</div><div class="grid2" style="align-items:start">' + DG.kdrama.map(k => '<div class="card"><b>' + esc(k.level) + '</b>' + k.items.map(it => '<p style="margin:6px 0">☐ ' + esc(it) + '</p>').join('') + '</div>').join('') + '</div>' +
      '<div class="sect-label">Vocab Priority — ' + DG.koVocab.length + ' kata TOPIK/EPS paling prioritas</div><div class="card" style="padding:6px 20px">' + DG.koVocab.slice(0, 90).map(w => '<div class="sent-line"><b>' + esc(w[0]) + '</b> ' + ttsBtn(w[0]) + ' <span class="muted">(' + esc(w[1]) + ') — ' + esc(w[2]) + '</span></div>').join('') + '</div>' +
      '<div class="card" style="margin-top:16px"><b>EPS-TOPIK</b><p class="muted" style="margin:6px 0 10px">Ujian Bahasa Korea untuk bekerja di Korea lewat sistem EPS — ada halaman khususnya dengan kosakata kerja, bank soal, dan simulasi.</p><button type="button" class="btn" id="go-eps">Buka EPS-TOPIK →</button></div></div>';
    $('#go-eps', c).onclick = () => go('eps');
    return;
  }
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Fitur Khusus Jepang</h1><p class="sub">Fokus JFT-Basic & JLPT: strategi dan bank soal ada di Persiapan Ujian; pola kalimat lengkap ada di Tata Bahasa.</p><div class="card" style="margin-top:16px"><b>JFT-Basic</b><p style="margin-top:6px">Ujian Bahasa Jepang untuk status SSW (kerja di Jepang). Materinya: percakapan & huruf dasar — latih lewat modul A0–A2, dialog situasional, dan simulasi JLPT di Persiapan Ujian.</p><div class="quiz-actions"><button type="button" class="btn" id="go-exams">Ke Persiapan Ujian →</button></div></div></div>';
  $('#go-exams', c).onclick = () => go('exams');
}
/* ===== EPS-TOPIK (Korea) — lengkap: penjelasan v16 + kosakata kerja + bank soal + simulasi ===== */
const EPS_VOCAB = [['위험', 'wiheom', 'bahaya'], ['조심하세요', 'josimhaseyo', 'hati-hatilah'], ['안전모', 'anjeonmo', 'helm keselamatan'], ['연장', 'yeonjang', 'perkakas / alat kerja'], ['무겁다', 'mugeopda', 'berat'], ['옮기다', 'olmgida', 'memindahkan'], ['교대', 'gyodae', 'shift / pergantian giliran'], ['야근', 'yageun', 'lembur malam'], ['출근', 'chulgeun', 'masuk kerja'], ['퇴근', 'toegeun', 'pulang kerja'], ['아프다', 'apeuda', 'sakit'], ['병원', 'byeongwon', 'rumah sakit'], ['공장', 'gongjang', 'pabrik'], ['작업', 'jageop', 'pekerjaan / pengerjaan'], ['기계', 'gigye', 'mesin'], ['장갑', 'janggap', 'sarung tangan'], ['마스크', 'maseukeu', 'masker'], ['사장님', 'sajangnim', 'bos / pemilik perusahaan'], ['월급', 'wolgeup', 'gaji bulanan'], ['쉬다', 'swida', 'istirahat'], ['다치다', 'dachida', 'terluka'], ['불', 'bul', 'api'], ['전기', 'jeongi', 'listrik'], ['계단', 'gyedan', 'tangga']];
const EPS_READING = [
  ['작업할 때는 안전모를 꼭 써야 합니다. \'안전모\' artinya:', ['sarung tangan', 'helm keselamatan', 'masker', 'sepatu kerja'], 1, '안전모 = helm keselamatan — kata keselamatan paling sering keluar di EPS-TOPIK.'],
  ['이 상자는 너무 무거워요. 같이 옮깁시다. Kata \'옮깁시다\' berarti:', ['buanglah', 'timbanglah', 'pindahkanlah (bersama)', 'bukalah'], 2, '옮기다 = memindahkan; -ㅂ시다 = ajakan "mari kita".'],
  ['오늘은 야근이 있어서 밤 10시에 퇴근합니다. Penutur pulang kerja pukul:', ['20.00', '21.00', '22.00', '23.00'], 2, '야근 = lembur malam; 밤 10시 = pukul 10 malam; 퇴근 = pulang kerja.'],
  ['몸이 아파서 병원에 가고 싶습니다. Penutur ingin pergi ke:', ['kantor', 'rumah sakit', 'pabrik', 'apotek'], 1, '아파서 = karena sakit; 병원 = rumah sakit.'],
  ['교대 시간은 오후 6시입니다. Pergantian shift pukul:', ['06.00', '12.00', '18.00', '20.00'], 2, '교대 = shift; 오후 6시 = pukul 6 sore = 18.00.'],
  ['기계를 만지기 전에 장갑을 끼세요. Sebelum menyentuh mesin harus memakai:', ['helm', 'kacamata', 'sarung tangan', 'masker'], 2, '장갑 = sarung tangan; 끼세요 = pakailah.'],
  ['월급은 매달 25일에 받습니다. Gaji diterima setiap tanggal:', ['15', '20', '25', '30'], 2, '월급 = gaji bulanan; 매달 25일 = tanggal 25 setiap bulan.'],
  ['불이 나면 바로 계단으로 나가세요. Saat kebakaran, keluar lewat:', ['lift', 'tangga', 'jendela', 'atap'], 1, '불이 나면 = kalau ada kebakaran; 계단 = tangga — jangan pakai lift saat kebakaran.'],
  ['전기를 조심하세요. 위험합니다. Kalimat kedua berarti:', ['Gelap', 'Berbahaya', 'Dingin', 'Berisik'], 1, '위험합니다 = berbahaya — instruksi keselamatan inti EPS-TOPIK.'],
  ['점심시간에는 쉬고 오후에 작업합니다. Setelah makan siang penutur:', ['pulang', 'istirahat lalu bekerja lagi', 'tidur di pabrik', 'pergi ke rumah sakit'], 1, '쉬고 = beristirahat lalu; 오후에 작업합니다 = bekerja di sore hari.']
];
const EPS_LISTEN = [
  ['[Dengarkan] 남자: \'지금 몇 시에 출근해요?\' 여자: \'아침 8시에 출근해요.\' → Perempuan masuk kerja pukul:', ['07.00', '08.00', '09.00', '18.00'], 1, '출근 = masuk kerja; 아침 8시 = pukul 8 pagi.'],
  ['[Dengarkan] 상사: \'이 상자를 저쪽으로 옮기세요.\' → Perintah atasan: pindahkan kotak itu ke:', ['sini', 'sana', 'atas', 'luar'], 1, '옮기세요 = pindahkan; 저쪽 = sebelah sana.'],
  ['[Dengarkan] 여자: \'머리가 아파요.\' 남자: \'병원에 가세요.\' → Perempuan mengeluh:', ['sakit perut', 'sakit kepala', 'sakit gigi', 'demam'], 1, '머리가 아파요 = kepala saya sakit.'],
  ['[Dengarkan] 남자: \'안전모를 썼어요?\' 여자: \'네, 썼어요.\' → Yang sudah dipakai perempuan:', ['sarung tangan', 'masker', 'helm keselamatan', 'sepatu'], 2, '안전모를 썼어요 = sudah memakai helm keselamatan.'],
  ['[Dengarkan] 상사: \'오늘은 야근이 없습니다.\' → Hari ini:', ['ada lembur malam', 'tidak ada lembur malam', 'libur total', 'shift pagi'], 1, '야근이 없습니다 = tidak ada lembur malam.'],
  ['[Dengarkan] 여자: \'이 기계는 위험해요. 조심하세요.\' → Perempuan memperingatkan bahwa mesin itu:', ['rusak', 'baru', 'berbahaya', 'mahal'], 2, '위험해요 = berbahaya; 조심하세요 = hati-hati.'],
  ['[Dengarkan] 남자: \'월급날이 언제예요?\' 여자: \'매달 10일이에요.\' → Hari gajian tanggal:', ['1', '5', '10', '25'], 2, '월급날 = hari gajian; 매달 10일 = tanggal 10 setiap bulan.'],
  ['[Dengarkan] 상사: \'장갑을 끼고 작업하세요.\' → Pekerja harus bekerja memakai:', ['helm', 'sarung tangan', 'masker', 'kacamata'], 1, '장갑을 끼고 = memakai sarung tangan lalu…'],
  ['[Dengarkan] 여자: \'퇴근하고 집에서 쉬고 싶어요.\' → Sesudah pulang kerja perempuan ingin:', ['lembur', 'belanja', 'istirahat di rumah', 'pergi ke pabrik'], 2, '퇴근하고 = setelah pulang kerja; 쉬고 싶어요 = ingin istirahat.'],
  ['[Dengarkan] 남자: \'다쳤어요!\' 여자: \'빨리 병원에 가요.\' → Laki-laki itu:', ['lapar', 'terluka', 'mengantuk', 'terlambat'], 1, '다쳤어요 = (saya) terluka; 빨리 병원에 가요 = ayo cepat ke rumah sakit.']
];
function epsQuestions(kind) {
  const src = kind === 'read' ? EPS_READING : kind === 'listen' ? EPS_LISTEN : EPS_READING.concat(EPS_LISTEN);
  return src.map(q => ({ type: 'mc', prompt: q[0], options: q[1], answer: q[2], context: 'Soal EPS-TOPIK — situasi kerja dan kehidupan sehari-hari di Korea. Baca/dengarkan situasinya, perhatikan kosakata keselamatannya, lalu pilih jawaban yang paling tepat.', explain: q[3] }));
}
function pageEPS(c) {
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">EPS-TOPIK — Kerja ke Korea</h1><p class="sub">' + esc(DG.eps.title) + '</p>' +
    '<div class="card" style="margin-top:16px"><b>Apa itu EPS-TOPIK?</b><p style="white-space:pre-line;margin-top:8px">' + esc(DG.eps.body) + '</p></div>' +
    '<div class="sect-label">Kosakata kerja & keselamatan (' + EPS_VOCAB.length + ' kata prioritas)</div><div class="card" style="padding:6px 20px">' +
    EPS_VOCAB.map(w => '<div class="sent-line"><b>' + esc(w[0]) + '</b> ' + ttsBtn(w[0]) + ' <span class="muted">(' + esc(w[1]) + ') — ' + esc(w[2]) + '</span></div>').join('') + '</div>' +
    '<div class="sect-label">Latihan & simulasi EPS-TOPIK</div><div class="card"><p class="muted" style="margin-bottom:12px">Format asli: Listening 25 + Reading 25 soal pilihan ganda. Simulasi di sini memakai bank soal EPS (reading + listening dengan transkrip yang bisa didengarkan lewat tombol suara di pelajaran/dikte) — skor dan pembahasan muncul seperti kuis modul.</p><div class="chiprow">' +
    '<button type="button" class="btn" data-eps="read">Bank Soal Reading (' + EPS_READING.length + ' soal)</button><button type="button" class="btn white" data-eps="listen">Bank Soal Listening (' + EPS_LISTEN.length + ' soal)</button><button type="button" class="btn red" data-eps="full">Simulasi EPS-TOPIK (20 soal)</button></div></div>' +
    '<div class="sect-label">Tips lulus</div><div class="card"><p>1) Hafalkan kosakata keselamatan & alat kerja dulu — porsinya paling besar. 2) Kuasai pola instruksi sopan: -세요 (…lah), -아야/어야 합니다 (harus…). 3) Angka & waktu (교대, 출근, 퇴근, 월급날) selalu keluar. 4) Untuk listening, tulis angka/kata kunci yang terdengar SEBELUM membaca pilihan. 5) Latih dikte kata instruksi kerja tiap minggu.</p></div></div>';
  $$('[data-eps]', c).forEach(b => b.onclick = () => {
    const kind = b.dataset.eps;
    runQuiz(c, { routeName: 'eps', title: 'EPS-TOPIK · ' + (kind === 'full' ? 'SIMULASI PENUH' : kind === 'read' ? 'READING' : 'LISTENING'), sub: 'Bank soal EPS-TOPIK (isi v16 + soal latihan lengkap). Target lulus simulasi: 70%.', questions: epsQuestions(kind),
      finish(cc, pct, ok, total) { if (pct >= 70) awardBonus(10, 'eps-topik'); cc.innerHTML = '<div class="wrap"><div class="card" style="max-width:560px;margin:30px auto;text-align:center"><div class="sect-label">Hasil EPS-TOPIK</div><h1 class="page">' + pct + '%</h1><p class="muted">' + ok + '/' + total + ' benar.' + (pct >= 70 ? ' Di atas ambang latihan — pertahankan!' : ' Ulangi kosakata keselamatannya, lalu coba lagi.') + '</p><button type="button" class="btn" style="margin-top:14px" id="eps-back">Kembali ke EPS-TOPIK</button></div></div>'; $('#eps-back', cc).onclick = () => go('eps'); } });
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
  m.innerHTML = '<div class="auth-card"><h2 style="font-size:21px">Masuk ke DidiGo</h2><p class="muted small" style="margin:5px 0 4px">Progres & XP tersinkron di semua perangkatmu. Belum punya akun? Tekan <b>Daftar</b> untuk daftar akun baru.</p>' +
    '<div class="field"><label for="au-email">Email</label><input id="au-email" type="email" autocomplete="email"></div>' +
    '<div class="field"><label for="au-pass">Kata sandi</label><input id="au-pass" type="password" autocomplete="current-password"></div>' +
    '<p class="small" id="au-err" style="color:var(--red)"></p>' +
    '<div class="quiz-actions"><button type="button" class="btn white" id="au-close">Nanti saja</button><button type="button" class="btn white" id="au-reg">Daftar</button><button type="button" class="btn" id="au-login">Masuk</button></div></div>';
  m.hidden = false;
  $('#au-close', m).onclick = () => m.hidden = true;
  const err = msg => { $('#au-err', m).textContent = msg; };
  if (!sb) err('Koneksi akun belum aktif di salinan ini (SUPABASE_URL & anon key belum diisi di app.js) — formulir tetap bisa dibuka; isi kredensial lalu coba lagi.');
  $('#au-login', m).onclick = async () => {
    if (!sb) { err('Koneksi akun belum aktif: isi SUPABASE_URL & anon key di app.js dulu, lalu masuk lagi.'); return; }
    const { data, error } = await sb.auth.signInWithPassword({ email: $('#au-email', m).value.trim(), password: $('#au-pass', m).value });
    if (error) { err(error.message); return; }
    S.user = { id: data.user.id, name: (data.user.user_metadata || {}).display_name || '', email: data.user.email }; save();
    await syncFromSupabase(); m.hidden = true; renderSidebar(); toast('Selamat datang kembali!');
  };
  $('#au-reg', m).onclick = async () => {
    if (!sb) { err('Koneksi akun belum aktif: isi SUPABASE_URL & anon key di app.js dulu, lalu daftar lagi.'); return; }
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
  cheats: pageCheats, speaking: pageSpeaking, examwriting: pageExamWriting, khusus: pageKhusus, eps: pageEPS,
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
