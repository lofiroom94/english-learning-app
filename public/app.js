/* DidiGo v22 Minimalis — aplikasi fresh (vanilla JS, satu file).
   Isi & fitur sama dengan v21 PERBAIKAN2; cangkang baru: navigasi ATAS + mode gelap/terang. */
'use strict';
/* ===== Konfigurasi Supabase — ISI sebelum deploy (lihat CARA-UPDATE-KE-V21.md) ===== */
const SUPABASE_URL = 'https://tdwkghphdppwvznxcggz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_HB_emJDuMKe3GflAeLqPrA_JAmYLLz8';

const DG = window.DG_DATA;
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Render ringan jawaban Tutor AI: **tebal**, *miring*, butir * / - jadi • (HTML di-escape dulu, jadi aman).
const md = s => esc(s).replace(/\*\*([^\s*]{1,40})\*\*/g, '<b>$1</b>').replace(/(^|\n)[ \t]*[*\-] /g, '$1• ').replace(/\*([^*]{1,80}?)\*(?=[\s.,;:!?)\]]|$)/g, '<i>$1</i>').replace(/\)\*\*/g, ')');
const LANGMETA = {
  en: { name: 'Inggris', flag: 'EN', cur: 'Kurikulum IELTS · TOEFL · TOEIC', tts: 'en-US', exams: 'IELTS / TOEFL / TOEIC' },
  ko: { name: 'Korea', flag: 'KR', cur: 'Kurikulum TOPIK', tts: 'ko-KR', exams: 'TOPIK I / TOPIK II / EPS-TOPIK' },
  ja: { name: 'Jepang', flag: 'JP', cur: 'Kurikulum JLPT', tts: 'ja-JP', exams: 'JLPT / JFT-Basic' }
};
const LEVELS = DG.levels.map(l => l.code);

/* ===== State (localStorage; Supabase bila login & terkonfigurasi) ===== */
const SKEY = 'didigo-v21-state';
function blankLangState() { return { done: {}, xp: 0, streak: 0, lastDay: '', freezes: 1, srs: {}, placement: '', minutes: {}, errLog: [], skillStats: {}, skills: { read: { ok: 0, total: 0 }, listen: { ok: 0, total: 0 }, speak: { ok: 0, total: 0 }, write: { ok: 0, total: 0 } }, flags: {}, srsCustom: {} }; }
let S;
try { S = JSON.parse(localStorage.getItem(SKEY)) || null; } catch (e) { S = null; }
if (!S || !S.langs) S = { lang: 'en', user: null, name: '', journal: [], bookmarks: [], langs: { en: blankLangState(), ko: blankLangState(), ja: blankLangState() } };
for (const L of ['en', 'ko', 'ja']) if (!S.langs[L]) S.langs[L] = blankLangState();
for (const L of ['en', 'ko', 'ja']) { const d = blankLangState(); for (const k of Object.keys(d)) if (S.langs[L][k] == null) S.langs[L][k] = d[k]; }
if (!S.tutor) S.tutor = { en: [], ko: [], ja: [] };
if (!S.tutorUsage) S.tutorUsage = { day: '', count: 0 };
if (!S.voices) S.voices = {};
function save() { try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {} }
function LS() { return S.langs[S.lang]; }
function bumpSkill(skill, okCount, totalCount) { const sk = LS().skills[skill]; if (!sk) return; sk.ok += okCount || 0; sk.total += totalCount || 0; save(); }
function addToSRS(w, kind) {
  const key = String(w[0]);
  LS().srsCustom[key] = { w: [w[0], w[1], w[2] || '', w[3] || ''], kind: kind || 'kata', due: todayStr(), iv: 0 };
  save();
  toast('Ditambahkan ke kartu hafalan: ' + key);
}
window.addToSRS = addToSRS; window.bumpSkill = bumpSkill;
function dueCustomCards() { const t = todayStr(), out = []; const sc = LS().srsCustom || {}; Object.keys(sc).forEach(k => { if ((sc[k].due || '') <= t) out.push(k); }); return out; }
function totalDue() { return dueCards().length + dueCustomCards().length; }
window.totalDue = totalDue;
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
/* ===== KONTEKS SOAL (PERBAIKAN2 — format final dari user) =====
   Konteks Bahasa Indonesia ditulis LENGKAP tanpa rumpang (terjemahan utuh
   kalimat contohnya, mis. "Saya suka apel."), sedangkan kalimat bahasa
   targetlah yang mempunyai SATU rumpang. Karena arti lengkapnya diketahui,
   kata apa pun yang dirumpangkan (kata kerja ATAU kata benda) jawabannya
   bisa ditentukan dari konteks itu — tidak ada lagi soal isian terbuka
   yang jawabannya menebak-nebak. */
function meaningHeads(meaning) {
  const clean = String(meaning || '').split('—')[0].split('(')[0].trim();
  return clean.split('/').map(x => x.trim().toLowerCase()).filter(x => x.length >= 3);
}
function wordContext(w, kind, topicTitle) {
  const trans = String((w && w[3]) || '').trim();
  const langName = LANGMETA[S.lang].name;
  if (trans) {
    if (kind === 'fill') return 'Arti kalimat lengkapnya: "' + trans + '" Satu kata di kalimat Bahasa ' + langName + ' di bawah hilang — isilah kata yang artinya sesuai dengan kalimat Indonesia itu.';
    if (kind === 'meaning') return 'Kata ini dipakai dalam kalimat yang artinya: "' + trans + '"';
    return 'Situasinya: kalimat yang artinya "' + trans + '" — pilih kata Bahasa ' + langName + ' yang tepat untuk situasi itu.';
  }
  if (kind === 'fill') return 'Topik "' + (topicTitle || 'modul ini') + '" — satu kata hilang dari kalimat ini. Isilah kata dari topik itu yang paling tepat.';
  return 'Topik "' + (topicTitle || 'modul ini') + '" — pilih kata yang tepat untuk situasi topik ini.';
}
window.wordContext = wordContext;
function contextForQuestion(q) {
  if (q && q.context && String(q.context).trim()) return String(q.context).trim();
  const pr = String((q && q.prompt) || '');
  if (/JLPT/i.test(pr) || q && q.level) return 'Soal latihan ujian — baca teks dan pertanyaannya baik-baik, lalu pilih jawaban yang paling tepat.';
  if (/TOPIK/i.test(pr)) return 'Soal kosakata ujian Korea — kata di dalam kalimat itu sedang ditanyakan artinya. Pilih arti yang paling tepat.';
  return 'Baca situasinya baik-baik dulu, lalu pilih jawaban yang paling tepat untuk situasi itu.';
}
/* Pemeriksa isian yang TOLERAN: huruf besar/kecil, spasi berlebih, dan tanda
   baca akhir diabaikan; untuk KO/JA spasi di dalam jawaban juga diabaikan.
   Sebuah soal isian hanya dibuat bila konteks lengkapnya menentukan SATU
   jawaban (lihat makeFillQuestion) — jadi toleransi ini tidak pernah
   menyalahkan jawaban yang benar hanya karena beda spasi/kapital. */
function normalizeFill(str) {
  return String(str == null ? '' : str).trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?。…]+$/, '').trim();
}
function fillMatches(text, q) {
  const got = normalizeFill(text);
  if (!got) return false;
  const cands = [q.answer].concat(q.accept || []);
  return cands.some(a => {
    const want = normalizeFill(a);
    if (got === want) return true;
    if ((S.lang === 'ko' || S.lang === 'ja') && got.replace(/ /g, '') === want.replace(/ /g, '')) return true;
    return false;
  });
}
window.normalizeFill = normalizeFill; window.fillMatches = fillMatches;
/* Pembuat soal isian yang AMAN: hanya dibuat bila (1) kalimat contoh memuat
   kata targetnya persis, dan (2) terjemahan Indonesianya lengkap — konteks
   lengkap itulah yang membuat jawabannya tunggal. Bila salah satu syarat
   gagal, fungsi mengembalikan null dan pemanggil WAJIB menjadikannya
   pilihan ganda. */
function blankFirst(haystack, needle) {
  const i = haystack.toLowerCase().indexOf(String(needle).toLowerCase());
  if (i < 0) return null;
  return haystack.slice(0, i) + '___' + haystack.slice(i + String(needle).length);
}
function makeFillQuestion(w, topicTitle) {
  if (!w || !w[2] || !w[3] || String(w[3]).trim().length < 4) return null;
  if (!String(w[0] || '').trim()) return null;
  const blanked = blankFirst(String(w[2]), String(w[0]));
  if (!blanked || blanked === w[2]) return null;
  return { type: 'fill', prompt: blanked, answer: w[0], tag: topicTitle, context: wordContext(w, 'fill', topicTitle), explain: 'Artinya "' + w[1] + '". Kalimat lengkapnya: ' + w[2] + ' — ' + w[3] };
}
window.makeFillQuestion = makeFillQuestion;
function makeMCQuestion(w, pool, seed, topicTitle, promptStyle) {
  const distract = shuffle(pool.map((x, i) => i).filter(i => pool[i][0] !== w[0]), seed).slice(0, 3).map(i => pool[i][0]);
  const opts = shuffle([w[0]].concat(distract), seed + 7);
  const prompt = promptStyle === 'arti'
    ? 'Kata Bahasa ' + LANGMETA[S.lang].name + ' untuk "' + w[1] + '" adalah…'
    : 'Kamu mau bilang "' + w[1] + '" dalam Bahasa ' + LANGMETA[S.lang].name + ' saat topik "' + (topicTitle || '') + '". Kata apa yang tepat?';
  return { type: 'mc', prompt, options: opts, answer: opts.indexOf(w[0]), tag: topicTitle, context: wordContext(w, 'word', topicTitle), explain: 'Contoh: ' + w[2] + ' — ' + w[3] };
}

/* Hash sederhana + salt per sesi — jawaban kuis disegel, tidak tampil di DOM. */
function seal(str, salt) { let h1 = 0xdeadbeef ^ salt, h2 = 0x41c6ce57 ^ salt; const s = salt + ':' + str; for (let i = 0; i < s.length; i++) { const ch = s.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (h2 >>> 0).toString(16) + (h1 >>> 0).toString(16); }
function shuffle(a, seed) { const r = a.slice(); let s = seed || 7; for (let i = r.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) % 2147483648; const j = s % (i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; }
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(t._h); t._h = setTimeout(() => t.hidden = true, 2600); }

/* ===== TTS: tombol inline kecil; popover pengaturan hanya saat suara dipakai ===== */
/* Pilihan suara per gender untuk dialog: cari voice bernama perempuan/laki-laki
   sesuai bahasa; bila tidak ada pasangan jelas, bedakan lewat pitch
   (perempuan 1.25, laki-laki 0.85) supaya SELALU terdengar beda. */
const FEMALE_VOICE_HINTS = ['female', 'zira', 'samantha', 'victoria', 'karen', 'moira', 'fiona', 'veena', 'susan', 'catherine', 'yuna', 'sun-hee', 'sunhee', 'sunhi', 'heami', 'seoyeon', 'jiwon', 'haruka', 'nanami', 'kyoko', 'ayumi', 'ichika', 'sayaka', 'mizuki', 'aria', 'jenny', 'sonia', '한국의', '日本語'];
const MALE_VOICE_HINTS = ['male', 'david', 'daniel', 'alex', 'fred', 'thomas', 'injoon', 'in-joon', 'junseo', 'seunghan', 'hyunjun', 'ichiro', 'takumi', 'otoya', 'hattori', 'kenji', 'keita', 'george', 'ryan', 'christopher', 'guy', 'aaron'];
function voiceGenderOf(name) {
  const n = String(name || '').toLowerCase();
  if (FEMALE_VOICE_HINTS.some(h => n.includes(h))) return 'female';
  if (MALE_VOICE_HINTS.some(h => n.includes(h))) return 'male';
  return '';
}
/* Sumber/provider sebuah voice dari namanya: Google / Microsoft / Sistem. */
function providerOf(voice) {
  const n = String((voice && voice.name) || '');
  if (/google/i.test(n)) return 'Google';
  if (/microsoft/i.test(n)) return 'Microsoft';
  return 'Sistem';
}
window.providerOf = providerOf;
/* Voice laki-laki prioritas per bahasa (paling natural dulu). */
const MALE_VOICE_PRIORITY = {
  en: ['daniel', 'david', 'christopher', 'ryan', 'george', 'aaron', 'guy', 'alex', 'fred', 'thomas'],
  ko: ['injoon', 'in-joon', 'junseo', 'seunghan'],
  ja: ['ichiro', 'takumi', 'otoya', 'hattori', 'kenji', 'keita']
};
/* Voice PEREMPUAN prioritas per bahasa (paling natural dulu) — nama voice
   nyata di Windows (Microsoft Natural) + macOS + Google Chrome. */
const FEMALE_VOICE_PRIORITY = {
  en: ['aria', 'jenny', 'zira', 'samantha', 'sonia', 'natasha', 'google us english'],
  ko: ['heami', 'sunhi', 'sun-hi', 'yuna', 'seoyeon', 'jiwon', '한국의'],
  ja: ['haruka', 'nanami', 'sayaka', 'ayumi', 'kyoko', 'ichika', 'mizuki', '日本語']
};
function allVoices() { try { return (window.speechSynthesis && speechSynthesis.getVoices()) || []; } catch (e) { return []; } }
function voicesForLang(langCode) {
  const voices = allVoices();
  const prefix = String(langCode || '').slice(0, 2).toLowerCase();
  const byLang = voices.filter(v => String(v.lang || '').toLowerCase().replace('_', '-').startsWith(prefix));
  return byLang.length ? byLang : voices;
}
/* Pilihan PEREMPUAN: dipertahankan persis seperti versi sebelumnya (user:
   "suara perempuannya lumayan bagus, jangan diubah") — kecuali bila user
   sendiri memilih voice perempuan lain di Pengaturan. */
function pickFemaleVoice(langCode, pool) {
  const chosen = S.voices && S.voices[langCode + ':female'];
  if (chosen) { const v = allVoices().find(x => x.name === chosen); if (v) return { voice: v, pitch: 1.12, rate: 1 }; }
  const prefix = String(langCode || '').slice(0, 2).toLowerCase();
  const prio = FEMALE_VOICE_PRIORITY[prefix] || [];
  const byPrio = prio.map(h => pool.find(v => String(v.name || '').toLowerCase().includes(h))).filter(Boolean);
  if (byPrio[0]) return { voice: byPrio[0], pitch: 1.12, rate: 1 };
  const female = pool.find(v => voiceGenderOf(v.name) === 'female') || null;
  if (female) return { voice: female, pitch: 1.12, rate: 1 };
  /* Tidak ada voice perempuan yang dikenali: pakai voice pertama pada nada
     natural (1.0), JANGAN dinaikkan ke 1.25 — nada tinggi pada voice yang
     sebenarnya laki-laki terdengar aneh ("ngaco"). User bisa memilih voice
     persis di Pengaturan. */
  return { voice: pool[0] || null, pitch: 1.0, rate: 1 };
}
/* Pilihan LAKI-LAKI (PERBAIKAN2): pitch TIDAK lagi diturunkan jauh —
   voice bernama laki-laki dipakai pada nada natural 1.0 (dulu 0.92/0.85
   yang membuat suara berat & robotik). Sumbernya diutamakan BERBEDA dari
   sumber voice perempuan terpilih untuk bahasa itu, sesuai permintaan
   user memakai dua sumber suara yang berbeda. */
function pickMaleVoice(langCode, pool) {
  const chosen = S.voices && S.voices[langCode + ':male'];
  if (chosen) { const v = allVoices().find(x => x.name === chosen); if (v) return { voice: v, pitch: 1.0, rate: 1 }; }
  const prefix = String(langCode || '').slice(0, 2).toLowerCase();
  const prio = MALE_VOICE_PRIORITY[prefix] || [];
  const femalePick = pickFemaleVoice(langCode, pool);
  const femaleProvider = femalePick.voice ? providerOf(femalePick.voice) : '';
  const byPrio = prio.map(h => pool.find(v => String(v.name || '').toLowerCase().includes(h) && voiceGenderOf(v.name) !== 'female')).filter(Boolean);
  const diffSrc = byPrio.find(v => providerOf(v) !== femaleProvider);
  if (diffSrc) return { voice: diffSrc, pitch: 1.0, rate: 1 };
  if (byPrio[0]) return { voice: byPrio[0], pitch: 1.0, rate: 1 };
  const hinted = pool.filter(v => voiceGenderOf(v.name) === 'male');
  const hintedDiff = hinted.find(v => providerOf(v) !== femaleProvider);
  if (hintedDiff) return { voice: hintedDiff, pitch: 1.0, rate: 1 };
  if (hinted[0]) return { voice: hinted[0], pitch: 1.0, rate: 1 };
  /* Tidak ada voice laki-laki sama sekali di perangkat ini (mis. hanya ada
     voice Google yang bawaannya perempuan): pakai voice pertama dengan nada
     DITURUNKAN ke 0.82 supaya terdengar jelas berbeda dari suara perempuan.
     Ini tetap bukan suara laki-laki asli — voice laki-laki asli didapat
     dengan memasang paket bahasa Korea/Jepang di Windows (lihat Pengaturan). */
  return { voice: pool[0] || null, pitch: 0.82, rate: 1 };
}
function pickDialogVoice(langCode, gender) {
  const pool = voicesForLang(langCode);
  if (gender === 'female') return pickFemaleVoice(langCode, pool);
  if (gender === 'male') return pickMaleVoice(langCode, pool);
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

/* ===== Cangkang v22 Minimalis: NAVIGASI ATAS (tanpa sidebar kiri) + laci ponsel =====
   Kelompok menu kiri→kanan = dasar→mahir; tiap dropdown atas→bawah = dasar→mahir. */
const NAVGROUPS = [
  ['Beranda', [['home', 'Beranda'], ['session', 'Sesi Hari Ini'], ['progress', 'Dashboard Kemahiran']]],
  ['Belajar', [['script', 'Belajar Menulis', 'Nol'], ['vocab', 'Kosakata'], ['frasa', 'Frasa Sehari-hari'], ['nol', 'Mulai dari Nol', 'Pra-A0'], ['modules', 'Modul', 'A0–C2'], ['readings', 'Bacaan'], ['dialogs', 'Dialog'], ['grammar', 'Tata Bahasa'], ['bunyi', 'Pengucapan & Bunyi'], ['conjugation', 'Konjugasi'], ['listening', 'Listening'], ['sopan', 'Bahasa Sopan vs Santai'], ['idioms', 'Idiom & Phrasal Verbs'], ['cheats', 'Cheat Sheet'], ['culture', 'Budaya'], ['khusus', 'Fitur Khusus Bahasa'], ['sumber', 'Sumber & Referensi']]],
  ['Latihan', [['flashcards', 'Kartu Hafalan'], ['practice', 'Kuis Latihan'], ['dictation', 'Dikte'], ['roleplay', 'Simulasi Percakapan'], ['writing', 'Menulis & Esai'], ['shadowing', 'Shadowing'], ['speaking', 'Simulasi Speaking'], ['myerrors', 'Kesalahan Saya'], ['mistakes', 'Kesalahan Umum']]],
  ['Ujian', [['exams', 'Persiapan Ujian'], ['placement', 'Tes Penempatan'], ['examwriting', 'Tulis & Esai Ujian'], ['mahir', 'Mahir Sekali', 'C2+']]],
  ['Progres', [['progress', 'Dashboard Kemahiran'], ['myerrors', 'Kesalahan Saya'], ['journal', 'Jurnal'], ['settings', 'Pengaturan']]]
];
const DRAWER_GROUPS = [
  ['MULAI — PALING DASAR', [['home', 'Beranda'], ['session', 'Sesi Hari Ini'], ['script', 'Belajar Menulis', 'Nol'], ['vocab', 'Kosakata'], ['frasa', 'Frasa Sehari-hari'], ['flashcards', 'Kartu Hafalan']]],
  ['JALUR — MENANJAK', [['nol', 'Mulai dari Nol', 'Pra-A0'], ['modules', 'Modul', 'A0–C2'], ['readings', 'Bacaan'], ['dialogs', 'Dialog'], ['grammar', 'Tata Bahasa'], ['bunyi', 'Pengucapan & Bunyi'], ['conjugation', 'Konjugasi'], ['listening', 'Listening'], ['sopan', 'Bahasa Sopan vs Santai'], ['idioms', 'Idiom & Phrasal Verbs'], ['cheats', 'Cheat Sheet'], ['culture', 'Budaya'], ['khusus', 'Fitur Khusus Bahasa'], ['sumber', 'Sumber & Referensi']]],
  ['PRAKTIK — MAKIN AKTIF', [['practice', 'Kuis Latihan'], ['dictation', 'Dikte'], ['roleplay', 'Simulasi Percakapan'], ['writing', 'Menulis & Esai'], ['shadowing', 'Shadowing'], ['speaking', 'Simulasi Speaking'], ['myerrors', 'Kesalahan Saya'], ['mistakes', 'Kesalahan Umum'], ['tutor', 'Tutor AI']]],
  ['MAHIR & UJIAN', [['exams', 'Persiapan Ujian'], ['placement', 'Tes Penempatan'], ['examwriting', 'Tulis & Esai Ujian'], ['mahir', 'Mahir Sekali', 'C2+']]],
  ['PROGRES', [['progress', 'Dashboard Kemahiran'], ['journal', 'Jurnal'], ['settings', 'Pengaturan']]]
];
const ICON = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
let route = { name: 'home', params: {} };
function displayName() { return S.name || (S.user ? S.user.name : '') || 'Pelajar'; }
/* ===== Mode gelap/terang (tersimpan; default Terang) ===== */
function currentTheme() { try { return localStorage.getItem('didigo-theme') === 'dark' ? 'dark' : 'light'; } catch (e) { return 'light'; } }
function applyTheme(t, silent) {
  document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  try { localStorage.setItem('didigo-theme', t === 'dark' ? 'dark' : 'light'); } catch (e) {}
  const b = $('#theme-toggle');
  if (b) { b.textContent = t === 'dark' ? '☀️' : '🌙'; b.setAttribute('aria-label', t === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'); b.title = t === 'dark' ? 'Mode terang' : 'Mode gelap'; }
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'dark' ? '#12141F' : '#F6F6FB');
  if (!silent) toast(t === 'dark' ? 'Mode gelap aktif.' : 'Mode terang aktif.');
}
function groupIndexOf(r) {
  for (let i = 0; i < NAVGROUPS.length; i++) if (NAVGROUPS[i][1].some(x => x[0] === r)) return i;
  if (r === 'eps') return 3; if (r === 'lesson' || r === 'quiz') return 1; if (r === 'reading') return 1;
  if (r === 'search') return -1; return -1;
}
function closeMenus() { $$('.tn-group.open').forEach(g => { g.classList.remove('open'); const b = $('.tn-btn', g); if (b) b.setAttribute('aria-expanded', 'false'); }); }
function updateNavActive() {
  const gi = groupIndexOf(route.name);
  $$('#topbar .tn-group[data-group]').forEach(g => {
    const idx = +g.dataset.group;
    const btn = $('.tn-btn', g); if (btn) btn.classList.toggle('active', idx === gi);
    $$('[data-nav]', g).forEach(b => b.classList.toggle('active', b.dataset.nav === route.name));
  });
  const tb = $('#topbar [data-nav="tutor"]'); if (tb && tb.classList.contains('tn-direct')) tb.classList.toggle('active', route.name === 'tutor');
  const ps = $('#profile-streak'); if (ps) { const st = LS(); ps.textContent = '🔥 ' + st.streak + ' hari streak · ' + st.xp + ' XP'; }
  const pu = $('#profile-uname'); if (pu) pu.textContent = displayName();
  const pm = $('#profile-umail'); if (pm) pm.textContent = S.user ? (S.user.email || '') : 'Mode tamu — data di perangkat ini';
}
function menuItemsHTML(links, cls) {
  return links.map(([r, label, chip]) => '<button type="button" class="' + cls + (route.name === r ? ' active' : '') + '" data-nav="' + r + '" role="menuitem">' + esc(label) + (chip ? ' <span class="nav-chip">' + esc(chip) + '</span>' : '') + '</button>').join('');
}
function renderSidebar() {
  /* Di v22 fungsi ini merender LACI ponsel (#sidebar) + menyegarkan status navigasi atas. */
  const el = $('#sidebar'); if (!el) return;
  const st = LS();
  let items = DRAWER_GROUPS.map(([g, links]) => {
    let html = '<div class="nav-group">' + esc(g) + '</div>' + links.map(([r, label, chip]) =>
      '<button type="button" class="nav-item' + (route.name === r ? ' active' : '') + '" data-nav="' + r + '">' + ICON + esc(label) + (chip ? ' <span class="nav-chip">' + esc(chip) + '</span>' : '') + '</button>').join('');
    if (g === 'MAHIR & UJIAN' && S.lang === 'ko') html += '<button type="button" class="nav-item' + (route.name === 'eps' ? ' active' : '') + '" data-nav="eps">' + ICON + 'EPS-TOPIK</button>';
    return html;
  }).join('');
  items += '<div class="nav-group">AKUN</div>' + (S.user
    ? '<div class="nav-item nav-account" aria-label="Akun masuk">' + ICON + '<span>' + esc(S.user.email || displayName()) + '</span></div><button type="button" class="nav-item logout-btn" id="logout-btn">' + ICON + 'Keluar</button>'
    : '<button type="button" class="nav-item" id="login-btn">' + ICON + 'Masuk / Daftar</button>');
  el.innerHTML =
    '<div class="sidebar-head"><div class="drawer-top"><div class="logo">Didi<span>Go</span></div><button type="button" class="drawer-close" id="drawer-close" aria-label="Tutup menu">✕</button></div>' +
    '<div class="userbox"><div class="avatar">' + esc(displayName().slice(0, 1).toUpperCase()) + '</div><div><div class="uname">' + esc(displayName()) + '</div><div class="umail">' + esc(S.user ? S.user.email : 'Mode tamu — data di perangkat ini') + '</div></div></div>' +
    '<div><span class="streak-pill">🔥 <b>' + st.streak + ' hari</b>&nbsp;streak · ' + st.xp + ' XP</span></div></div>' +
    '<nav class="sidebar-nav" aria-label="Menu utama"><div class="side-note">Menu bertingkat: paling atas paling dasar — makin ke bawah, makin mahir.</div>' + items +
    '<div class="side-version">DidiGo v22 · Tampilan Minimalis</div></nav>';
  $$('#sidebar [data-nav]').forEach(b => b.onclick = () => { closeDrawer(); go(b.dataset.nav); });
  const dc = $('#drawer-close'); if (dc) dc.onclick = closeDrawer;
  const lo = $('#logout-btn'); if (lo) lo.onclick = async () => { if (sb) { try { await sb.auth.signOut(); } catch (e) {} } S.user = null; save(); renderSidebar(); renderTopbar(); toast('Sampai jumpa! Kamu sudah keluar.'); go('home'); };
  const li = $('#login-btn'); if (li) li.onclick = openAuth;
  updateNavActive();
}
function renderTopbar() {
  const st = LS();
  const groups = NAVGROUPS.map(([label, links], i) => {
    let links2 = links;
    if (label === 'Ujian' && S.lang === 'ko') links2 = links.concat([['eps', 'EPS-TOPIK']]);
    return '<div class="tn-group" data-group="' + i + '"><button type="button" class="tn-btn' + (groupIndexOf(route.name) === i ? ' active' : '') + '" aria-haspopup="true" aria-expanded="false">' + esc(label) + ' <span class="tn-caret" aria-hidden="true">▾</span></button>' +
      '<div class="tn-menu" role="menu">' + menuItemsHTML(links2, 'tn-item') + '</div></div>';
  }).join('');
  $('#topbar').innerHTML =
    '<button type="button" class="burger" id="burger" aria-label="Buka menu">☰</button>' +
    '<button type="button" class="logo logo-btn" data-nav="home" aria-label="DidiGo — Beranda">Didi<span>Go</span></button>' +
    '<nav class="topnav" aria-label="Menu utama">' + groups +
    '<button type="button" class="tn-btn tn-direct' + (route.name === 'tutor' ? ' active' : '') + '" data-nav="tutor">Tutor AI</button></nav>' +
    '<div class="search-wrap"><div class="searchbox"><span aria-hidden="true">🔍</span><input id="global-search" type="search" placeholder="Cari modul, vocab… (Ctrl+K)" autocomplete="off" aria-label="Pencarian"></div><div id="search-results" class="search-results" hidden></div></div>' +
    '<button type="button" class="search-toggle" id="search-toggle" aria-label="Cari">🔍</button>' +
    '<div class="lang-picker" role="group" aria-label="Pilih bahasa">' +
    ['en', 'ko', 'ja'].map(L => '<button type="button" class="lang-btn' + (S.lang === L ? ' active' : '') + '" data-lang="' + L + '">' + LANGMETA[L].flag + ' <span class="lang-name">' + LANGMETA[L].name + '</span></button>').join('') + '</div>' +
    '<button type="button" class="theme-btn" id="theme-toggle" aria-label="Ganti mode gelap/terang">🌙</button>' +
    '<div class="tn-group profile-group" data-group="profile"><button type="button" class="tn-btn avatar-btn" aria-haspopup="true" aria-expanded="false" aria-label="Profil"><span class="avatar">' + esc(displayName().slice(0, 1).toUpperCase()) + '</span></button>' +
    '<div class="tn-menu tn-menu-right" role="menu"><div class="profile-head"><div class="uname" id="profile-uname">' + esc(displayName()) + '</div><div class="umail" id="profile-umail">' + esc(S.user ? S.user.email : 'Mode tamu — data di perangkat ini') + '</div><div class="small muted" id="profile-streak">🔥 ' + st.streak + ' hari streak · ' + st.xp + ' XP</div></div>' +
    menuItemsHTML([['settings', 'Pengaturan'], ['journal', 'Jurnal'], ['progress', 'Dashboard Kemahiran'], ['sumber', 'Sumber & Referensi']], 'tn-item') +
    (S.user ? '<button type="button" class="tn-item" id="logout-btn-top">Keluar</button>' : '<button type="button" class="tn-item" id="login-btn-top">Masuk / Daftar</button>') +
    '</div></div>';
  $$('#topbar [data-lang]').forEach(b => b.onclick = () => setLang(b.dataset.lang));
  $$('#topbar [data-nav]').forEach(b => b.onclick = () => { closeMenus(); closeDrawer(); go(b.dataset.nav); });
  $$('#topbar .tn-group').forEach(g => {
    const btn = $('.tn-btn', g); if (!btn) return;
    btn.addEventListener('click', e => { e.stopPropagation(); const was = g.classList.contains('open'); closeMenus(); if (!was) { g.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); } });
  });
  $('#burger').onclick = () => { renderSidebar(); $('#sidebar').classList.add('open'); $('#drawer-backdrop').hidden = false; };
  $('#theme-toggle').onclick = () => applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  applyTheme(currentTheme(), true);
  const lo2 = $('#logout-btn-top'); if (lo2) lo2.onclick = async () => { closeMenus(); if (sb) { try { await sb.auth.signOut(); } catch (e) {} } S.user = null; save(); renderSidebar(); renderTopbar(); toast('Sampai jumpa! Kamu sudah keluar.'); go('home'); };
  const li2 = $('#login-btn-top'); if (li2) li2.onclick = () => { closeMenus(); openAuth(); };
  const inp = $('#global-search');
  const sbox = $('#search-results');
  const stBtn = $('#search-toggle');
  if (stBtn) stBtn.onclick = e => { e.stopPropagation(); const tb = $('#topbar'); if (!tb) return; const open = tb.classList.toggle('search-open'); if (open && inp) inp.focus(); };
  let curResults = [];
  const hideSBox = () => { if (sbox) sbox.hidden = true; };
  const renderSearchResults = () => {
    if (!sbox) return;
    if (!normQ(inp.value)) { hideSBox(); return; }
    curResults = searchAll(inp.value).slice(0, 9);
    if (!curResults.length) { sbox.innerHTML = '<div class="search-empty">Tidak ditemukan untuk "' + esc(inp.value.trim()) + '" — coba kata lain.</div>'; sbox.hidden = false; return; }
    sbox.innerHTML = curResults.map((r, i) => '<button type="button" class="search-item" data-sr="' + i + '"><span class="chip">' + esc(r.kind) + '</span><span class="search-item-main"><b>' + esc(r.title) + '</b><small>' + esc(r.sub) + (r.lang && r.lang !== S.lang ? ' · Bahasa ' + LANGMETA[r.lang].name : '') + '</small></span></button>').join('');
    sbox.hidden = false;
    $$('[data-sr]', sbox).forEach(b => b.onclick = () => { const r = curResults[+b.dataset.sr]; hideSBox(); const tb = $('#topbar'); if (tb) tb.classList.remove('search-open'); runSearchAction(r); });
  };
  inp.addEventListener('input', renderSearchResults);
  inp.addEventListener('focus', renderSearchResults);
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); const tb = $('#topbar'); if (tb) tb.classList.remove('search-open'); if (curResults.length && sbox && !sbox.hidden) { const r = curResults[0]; hideSBox(); runSearchAction(r); } else if (inp.value.trim()) go('search', { q: inp.value.trim() }); }
    if (e.key === 'Escape') hideSBox();
  });
  if (!document._v22DocBound) {
    document._v22DocBound = true;
    document.addEventListener('click', e => {
      const b = $('#search-results'); if (b && e.target && e.target.closest && !e.target.closest('.search-wrap')) b.hidden = true;
      const tb = $('#topbar'); if (tb && e.target && e.target.closest && !e.target.closest('.search-wrap') && !e.target.closest('#search-toggle')) tb.classList.remove('search-open');
      if (e.target && e.target.closest && !e.target.closest('.tn-group')) closeMenus();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { closeMenus(); closeDrawer(); const tb = $('#topbar'); if (tb) tb.classList.remove('search-open'); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); const s = $('#global-search'); if (s) { s.focus(); s.select(); } }
    });
  }
}
function closeDrawer() { const sbEl = $('#sidebar'); if (sbEl) sbEl.classList.remove('open'); const bd = $('#drawer-backdrop'); if (bd) bd.hidden = true; }

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
  const st = LS(), due = totalDue(), nx = nextLesson();
  const todayMin = st.minutes[todayStr()] || 0;
  c.innerHTML = '<div class="wrap">' +
    '<h1 class="page">Halo ' + esc(displayName()) + '. Lanjut belajar ' + LANGMETA[S.lang].name + '?</h1>' +
    '<p class="sub">' + greet() + ' · Target harianmu 15 menit · sudah ' + todayMin + ' menit hari ini</p>' +
    '<div class="srs-strip"><span class="sect-label" style="margin:0">Hafalan SRS jatuh tempo</span>' +
    ['en', 'ko', 'ja'].map(L => { const n = L === S.lang ? due : Object.values(S.langs[L].srs).filter(x => x.due <= todayStr()).length + Object.values(S.langs[L].srsCustom || {}).filter(x => (x.due || '') <= todayStr()).length; return '<button type="button" class="chip' + (L === S.lang ? ' active' : '') + '" data-srs-lang="' + L + '">' + LANGMETA[L].name + (n ? ' · ' + n : '') + '</button>'; }).join('') +
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
  const nx = nextLesson(), due = totalDue();
  const stats = LS().skillStats || {};
  const weak = Object.keys(stats).filter(t => stats[t].total >= 2 && stats[t].ok / stats[t].total < 0.7).sort((a, b) => (stats[a].ok / stats[a].total) - (stats[b].ok / stats[b].total))[0];
  const weakWhy = weak ? 'Hari ini fokus: <b>' + esc(weak) + '</b>, karena ' + (stats[weak].total - stats[weak].ok) + ' dari ' + stats[weak].total + ' soal ' + esc(weak) + ' terakhir masih salah. Latih lewat Kuis Latihan / Kesalahan Saya di bawah.' : 'Belum ada pola kelemahan yang terbaca — kerjakan kuis beberapa kali, nanti sesi ini menyesuaikan fokusnya dengan kesalahanmu.';
  c.innerHTML = '<div class="wrap"><h1 class="page">Sesi hari ini</h1><p class="sub">Satu sesi pendek ±15 menit. Kerjakan berurutan, atau loncat ke bagian mana pun.</p>' +
    '<div class="card" style="margin-top:14px"><div class="sect-label" style="margin-top:0">Belajar apa hari ini — disesuaikan untukmu</div><p>' + weakWhy + '</p>' + (LS().errLog.length ? '<div class="quiz-actions"><button type="button" class="btn white small" id="sess-myerrors">Latih lagi ' + Math.min(10, LS().errLog.length) + ' kesalahan saya →</button></div>' : '') + '</div>' +
    '<div class="card" style="margin-top:16px">' +
    [['1', 'Pelajaran — ' + nx.title + ' (' + nx.level + ')', '±10 menit', 'lesson', nx.id],
     ['2', 'Kuis modul — 6 soal', '±3 menit · minimal 70%', 'quiz', nx.id],
     ['3', 'Review kartu hafalan', due + ' kartu jatuh tempo · ±2 menit', 'flashcards', ''],
     ['4', 'Satu bacaan singkat', '±3 menit', 'readings', '']].map(x =>
      '<div class="today-item"><span class="chip">' + x[0] + '</span><div class="t"><b>' + esc(x[1]) + '</b><span class="muted small">' + x[2] + '</span></div><button type="button" class="btn white small" data-sess="' + x[3] + '" data-id="' + x[4] + '">Mulai</button></div>').join('') +
    '<p class="muted small" style="margin-top:12px">Progres sesi tersimpan otomatis. Bisa dilanjut kapan saja.</p></div></div>';
  const sme = $('#sess-myerrors', c); if (sme) sme.onclick = () => go('myerrors');
  $$('[data-sess]', c).forEach(b => b.onclick = () => { touchActivity(2); const r = b.dataset.sess; if (r === 'lesson') go('lesson', { id: b.dataset.id, part: 0 }); else if (r === 'quiz') go('quiz', { id: b.dataset.id }); else go(r); });
}

/* ===== PETA PERJALANAN: Nol -> A0..C2 -> Mahir (can-do ala CEFR) ===== */
const CAN_DO = {
  'Nol': ['Mengenal huruf & bunyi, salam, angka 1–10, dan frasa bertahan hidup.', 'Huruf + kata pertama + frasa', '±1 minggu santai'],
  'A0': ['Memperkenalkan diri, menyapa, dan bertanya hal paling dasar.', '6 modul', '±2 minggu'],
  'A1': ['Mengobrol kebutuhan sehari-hari yang sederhana.', '6 modul', '±3 minggu'],
  'A2': ['Bercerita pengalaman dan rencana dengan kalimat utuh.', '6 modul', '±3 minggu'],
  'B1': ['Berpendapat dan memahami teks & percakapan umum.', '6 modul', '±4 minggu'],
  'B2': ['Bekerja dan belajar memakai bahasa ini dengan percaya diri.', '6 modul', '±4 minggu'],
  'C1': ['Berargumen dengan nuansa, termasuk konteks formal.', '6 modul', '±5 minggu'],
  'C2': ['Memahami hampir semua hal seperti penutur terpelajar.', '6 modul', '±5 minggu'],
  'Mahir': ['Debat, sastra, bahasa profesional, dan ujian level tertinggi (TOPIK 6 / JLPT N1 / IELTS 8–9).', 'Konten lanjutan di atas C2', 'Berkelanjutan']
};
function journeyHTML() {
  const rows = ['Nol'].concat(LEVELS).concat(['Mahir']).map(j => {
    const cd = CAN_DO[j];
    const cur = (LS().placement || 'A0') === j;
    return '<button type="button" class="roadmap-item' + (cur ? ' active' : '') + '" data-journey="' + j + '"><span><b>' + j + '</b> — ' + esc(cd[0]) + '</span><span class="muted small">' + cd[1] + ' · ' + cd[2] + (cur ? ' · jenjangmu sekarang' : '') + '</span></button>';
  }).join('');
  return '<div class="card" style="margin-bottom:16px"><div class="sect-label" style="margin-top:0">Peta Perjalanan — dari Nol sampai Mahir</div>' + rows + '<p class="muted small" style="margin-top:8px">Klik jenjang untuk membukanya. Tes Penempatan bisa menempatkanmu langsung ke jenjang yang tepat — termasuk Nol atau Mahir.</p></div>';
}
/* ===== MODUL / JALUR BELAJAR ===== */
let modFilter = { level: '', mode: 'all', q: '' };
function pageModules(c) {
  const nx = nextLesson();
  c.innerHTML = '<div class="wrap"><h1 class="page">Jalur Belajar — ' + LANGMETA[S.lang].name + '</h1>' +
    '<p class="sub">Levelmu: ' + (LS().placement || 'A0') + ' · 42 modul · Ngobrol santai 15 menit sehari.</p>' +
    '<div class="next-banner"><div class="t"><small>Langkah berikutnya</small><b style="font-size:17px">' + esc(nx.title) + ' (' + nx.level + ')</b></div><button type="button" class="btn red" id="to-session">Ke sesi →</button></div>' +
    journeyHTML() +
    '<div class="modules-layout"><div class="card"><div class="sect-label" style="margin-top:0">Roadmap</div><div id="roadmap"></div><p class="muted small" style="margin-top:10px">Klik level untuk menyaring kartu modul.</p></div>' +
    '<div><div class="searchbox" style="max-width:none"><span>🔍</span><input id="mod-search" type="search" placeholder="Cari modul berdasarkan nama atau deskripsi…" value="' + esc(modFilter.q) + '"></div>' +
    '<div class="chiprow" style="margin:14px 0" id="mod-chips"></div><div class="module-grid" id="mod-grid"></div></div></div></div>';
  $('#to-session', c).onclick = () => go('session');
  $$('[data-journey]', c).forEach(b => b.onclick = () => { const j = b.dataset.journey; if (j === 'Nol') go('nol'); else if (j === 'Mahir') go('mahir'); else { modFilter.level = j; draw(); } });
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
  const qs = cfg.questions.map(q => ({ ...q, sealed: seal(q.type === 'mc' ? 'mc:' + q.answer : 'fill:' + normalizeFill(q.answer), salt) }));
  const st = qs.map(() => ({ sel: null, text: '', submitted: false, correct: false }));
  let cur = 0;
  const correctCount = () => st.filter(x => x.submitted && x.correct).length;
  const wrongCount = () => st.filter(x => x.submitted && !x.correct).length;
  function check(i) {
    const q = qs[i], s = st[i];
    if (q.type === 'mc') return s.sel != null && seal('mc:' + s.sel, salt) === q.sealed;
    return s.text.trim() !== '' && fillMatches(s.text, q);
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
  function submit() {
    const s = st[cur]; if (s.submitted) return;
    s.correct = check(cur); s.submitted = true; touchActivity(1);
    const q = qs[cur], tag = q.tag || cfg.tag || 'Umum';
    const stt = LS().skillStats[tag] || (LS().skillStats[tag] = { ok: 0, total: 0 });
    stt.total += 1; if (s.correct) stt.ok += 1;
    bumpSkill(cfg.skill || 'read', s.correct ? 1 : 0, 1);
    if (!s.correct) {
      LS().errLog.unshift({ t: Date.now(), tag, type: q.type, prompt: q.prompt, options: q.options || null, answer: q.type === 'mc' ? q.options[q.answer] : q.answer, user: q.type === 'mc' ? (s.sel != null ? q.options[s.sel] : '(kosong)') : s.text, context: q.context || '', explain: q.explain || '' });
      if (LS().errLog.length > 100) LS().errLog.length = 100;
      save();
    }
    draw();
  }
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
let kbMode = ''; /* ja: hira/kata/romaji */
/* ===== KEYBOARD KOREA: DUA SUSUNAN STANDAR (PERBAIKAN2) =====
   Default SELALU QWERTY 두벌식 (Dubeolsik) di semua perangkat — user
   terbiasa QWERTY juga di HP. 천지인 (Cheonjiin, 9 tombol) hanya tampil
   bila user memilihnya lewat pengalih di atas keyboard; pilihan terakhir
   diingat di localStorage. */
let koKbLayout = 'qwerty';
try { const savedKb = localStorage.getItem('didigo-ko-kb-v1'); if (savedKb === 'cheonjiin' || savedKb === 'qwerty') koKbLayout = savedKb; } catch (e) {}
let koShift = false;
function setKoKbLayout(l) { koKbLayout = l; try { localStorage.setItem('didigo-ko-kb-v1', l); } catch (e) {} }
window.koKbState = () => ({ layout: koKbLayout, shift: koShift });
const KO_QWERTY_ROWS = [
  [['q','ㅂ','ㅃ'],['w','ㅈ','ㅉ'],['e','ㄷ','ㄸ'],['r','ㄱ','ㄲ'],['t','ㅅ','ㅆ'],['y','ㅛ','ㅛ'],['u','ㅕ','ㅕ'],['i','ㅑ','ㅑ'],['o','ㅐ','ㅒ'],['p','ㅔ','ㅖ']],
  [['a','ㅁ','ㅁ'],['s','ㄴ','ㄴ'],['d','ㅇ','ㅇ'],['f','ㄹ','ㄹ'],['g','ㅎ','ㅎ'],['h','ㅗ','ㅗ'],['j','ㅓ','ㅓ'],['k','ㅏ','ㅏ'],['l','ㅣ','ㅣ']],
  [['z','ㅋ','ㅋ'],['x','ㅌ','ㅌ'],['c','ㅊ','ㅊ'],['v','ㅍ','ㅍ'],['b','ㅠ','ㅠ'],['n','ㅜ','ㅜ'],['m','ㅡ','ㅡ']]
];
/* 천지인: grup konsonan multi-ketuk + vokal dari goresan ㅣ(I) ·(D) ㅡ(H). */
const CJ_GROUPS = [['ㄱ','ㅋ','ㄲ'],['ㄴ','ㄹ'],['ㄷ','ㅌ','ㄸ'],['ㅂ','ㅍ','ㅃ'],['ㅅ','ㅎ','ㅆ'],['ㅈ','ㅊ','ㅉ'],['ㅇ','ㅁ']];
const CJ_VOWELS = { 'I':'ㅣ','H':'ㅡ','ID':'ㅏ','DI':'ㅓ','DH':'ㅗ','HD':'ㅜ','IDD':'ㅑ','DDI':'ㅕ','DDH':'ㅛ','HDD':'ㅠ','IDI':'ㅐ','DII':'ㅔ','DHI':'ㅚ','IDDI':'ㅒ','DDII':'ㅖ','DHID':'ㅘ','DHIDI':'ㅙ','HDDI':'ㅝ','HDDII':'ㅞ','HDI':'ㅟ','HI':'ㅢ' };
function cjState(input) { if (!input._cj) input._cj = { g: -1, idx: 0, base: null, vbuf: '', vbase: null }; return input._cj; }
function cjReset(input) { input._cj = { g: -1, idx: 0, base: null, vbuf: '', vbase: null }; }
function cjConsPress(input, gi) {
  const st = cjState(input), grp = CJ_GROUPS[gi];
  const now = Date.now();
  // Seperti HP Korea sungguhan: ketukan cepat tombol yang sama = ganti huruf (ㄱ→ㅋ→ㄲ);
  // jeda >= 1 detik mengunci huruf sebelumnya, jadi ketukan berikutnya mulai huruf baru
  // (perlu untuk ㄴ+ㄴ seperti di 안녕하세요: batchim ㄴ lalu awal ㄴ lagi).
  if (st.g === gi && st.base != null && now - (st.t || 0) < 1000) { st.idx = (st.idx + 1) % grp.length; }
  else { st.g = gi; st.idx = 0; st.base = input.value; st.vbuf = ''; st.vbase = null; }
  st.t = now;
  kbSetValue(input, hangulCompose(st.base, grp[st.idx]));
}
function cjVowelPress(input, stroke) {
  const st = cjState(input);
  if (!st.vbuf) { st.vbase = input.value; st.g = -1; st.base = null; }
  st.vbuf += stroke;
  const v = CJ_VOWELS[st.vbuf];
  if (v) {
    kbSetValue(input, hangulCompose(st.vbase, v));
    const extendable = Object.keys(CJ_VOWELS).some(k => k.length > st.vbuf.length && k.indexOf(st.vbuf) === 0);
    if (!extendable) { st.vbuf = ''; st.vbase = null; }
  }
}
window.cjConsPress = cjConsPress; window.cjVowelPress = cjVowelPress; window.CJ_VOWELS = CJ_VOWELS;
function kbSetValue(input, val) { input.value = val; input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); }
function kbPress(input, ch) {
  if (S.lang === 'ko') kbSetValue(input, hangulCompose(input.value, ch));
  else kbSetValue(input, input.value + ch);
}
function kbBack(input) { if (S.lang === 'ko') cjReset(input); kbSetValue(input, S.lang === 'ko' ? hangulBackspace(input.value) : input.value.slice(0, -1)); }
function kbEnter(input) {
  if (input.tagName === 'TEXTAREA') { kbSetValue(input, input.value + '\n'); return; }
  input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  const card = input.closest('.card') || document;
  const chk = $('#dict-check', card) || $('#q-submit', card);
  if (chk && !chk.disabled) chk.click();
}
function drawKeyboard(mount, input) {
  if (!mount || !input) return;
  if (!kbMode) kbMode = S.lang === 'ko' ? 'qwerty' : 'hira';
  const key = ch => '<button type="button" class="kbd-key" data-ch="' + ch + '" data-kbd-char="' + ch + '">' + ch + '</button>';
  const util = '<div class="kbd-row kbd-util"><button type="button" class="kbd-key kbd-wide" data-kbd-key="backspace">⌫</button><button type="button" class="kbd-key kbd-space" data-kbd-key="space">Spasi</button><button type="button" class="kbd-key kbd-wide" data-kbd-key="enter">Enter</button></div>';
  let body = '', headLabel = '';
  if (S.lang === 'ko') {
    const tabs = '<div class="kbd-tabs" role="group" aria-label="Pilihan susunan keyboard Korea">' +
      '<button type="button" class="chip' + (koKbLayout === 'qwerty' ? ' active' : '') + '" data-kbmode="qwerty">QWERTY (두벌식)</button>' +
      '<button type="button" class="chip' + (koKbLayout === 'cheonjiin' ? ' active' : '') + '" data-kbmode="cheonjiin">9 tombol (천지인)</button></div>';
    if (koKbLayout === 'qwerty') {
      headLabel = 'Keyboard Korea — QWERTY 두벌식 (standar Korea, sama seperti di HP & komputer)';
      const qwKey = cell => { const ch = koShift ? cell[2] : cell[1]; return '<button type="button" class="kbd-key kbd-qw" data-ch="' + ch + '" data-qw="' + cell[0] + '"><b>' + ch + '</b><small>' + cell[0].toUpperCase() + '</small></button>'; };
      body = tabs +
        '<div class="kbd-row">' + KO_QWERTY_ROWS[0].map(qwKey).join('') + '</div>' +
        '<div class="kbd-row">' + KO_QWERTY_ROWS[1].map(qwKey).join('') + '</div>' +
        '<div class="kbd-row"><button type="button" class="kbd-key kbd-wide kbd-shift' + (koShift ? ' active' : '') + '" data-kbd-key="shift">⇧ Shift</button>' + KO_QWERTY_ROWS[2].map(qwKey).join('') + '</div>' + util +
        '<p class="small muted" style="margin-top:6px">Shift untuk konsonan ganda ㄲ ㄸ ㅃ ㅆ ㅉ dan vokal ㅒ ㅖ. Batchim ganda diketik dua huruf (예: ㄹ lalu ㄱ = ㄺ), suku kata tersusun otomatis.</p>';
    } else {
      headLabel = 'Keyboard Korea — 천지인 9 tombol (keypad HP Korea)';
      const cjBtn = (gi) => '<button type="button" class="kbd-key kbd-cj" data-cjcons="' + gi + '"><b>' + CJ_GROUPS[gi].join('') + '</b><small>' + CJ_GROUPS[gi].join(' → ') + '</small></button>';
      body = tabs +
        '<div class="kbd-row kbd-cjrow">' +
        '<button type="button" class="kbd-key kbd-cj" data-cjvowel="I"><b>ㅣ</b><small>vokal</small></button>' +
        '<button type="button" class="kbd-key kbd-cj" data-cjvowel="D"><b>·</b><small>titik</small></button>' +
        '<button type="button" class="kbd-key kbd-cj" data-cjvowel="H"><b>ㅡ</b><small>vokal</small></button></div>' +
        '<div class="kbd-row kbd-cjrow">' + cjBtn(0) + cjBtn(1) + cjBtn(2) + '</div>' +
        '<div class="kbd-row kbd-cjrow">' + cjBtn(3) + cjBtn(4) + cjBtn(5) + '</div>' +
        '<div class="kbd-row kbd-cjrow">' + cjBtn(6) + '<span class="kbd-cj-note">Ketuk tombol konsonan berulang untuk mengganti hurufnya (ㄱ→ㅋ→ㄲ). Vokal dibentuk dari ㅣ + · + ㅡ: ㅣ+·=ㅏ, ·+ㅣ=ㅓ, ·+ㅡ=ㅗ, ㅡ+·=ㅜ.</span></div>' + util;
    }
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
    headLabel = 'Keyboard ' + LANGMETA[S.lang].name + ' lengkap — suku kata/kana tersusun otomatis';
  }
  mount.innerHTML = '<div class="kbd-wrap"><div class="kbd-head"><span>⌨️ ' + headLabel + '</span><button type="button" class="btn white small" data-kbd-key="toggle">Sembunyikan</button></div><div class="kbd-body">' + body + '</div></div>';
  $$('[data-ch]', mount).forEach(b => b.onmousedown = e => e.preventDefault());
  $$('[data-ch]', mount).forEach(b => b.onclick = () => { kbPress(input, b.dataset.ch); if (S.lang === 'ko' && koKbLayout === 'qwerty' && koShift) { koShift = false; drawKeyboard(mount, input); } });
  $$('[data-cjcons]', mount).forEach(b => b.onmousedown = e => e.preventDefault());
  $$('[data-cjcons]', mount).forEach(b => b.onclick = () => cjConsPress(input, +b.dataset.cjcons));
  $$('[data-cjvowel]', mount).forEach(b => b.onmousedown = e => e.preventDefault());
  $$('[data-cjvowel]', mount).forEach(b => b.onclick = () => cjVowelPress(input, b.dataset.cjvowel));
  $$('[data-kbmode]', mount).forEach(b => b.onclick = () => { if (S.lang === 'ko') { setKoKbLayout(b.dataset.kbmode); cjReset(input); } else kbMode = b.dataset.kbmode; drawKeyboard(mount, input); });
  $$('[data-kbd-key]', mount).forEach(b => b.onclick = () => {
    const k = b.dataset.kbdKey;
    if (k === 'backspace') kbBack(input);
    else if (k === 'space') { if (S.lang === 'ko') cjReset(input); kbPress(input, ' '); }
    else if (k === 'enter') kbEnter(input);
    else if (k === 'shift') { koShift = !koShift; drawKeyboard(mount, input); }
    else if (k === 'toggle') { const bd = $('.kbd-body', mount); if (bd) bd.style.display = bd.style.display === 'none' ? '' : 'none'; b.textContent = bd && bd.style.display === 'none' ? '⌨️ Keyboard' : 'Sembunyikan'; }
    else if (k === 'dakuten' || k === 'handakuten') { const map = k === 'dakuten' ? DAKU : HANDAKU; const v = input.value; if (v && map[v.slice(-1)]) kbSetValue(input, v.slice(0, -1) + map[v.slice(-1)]); }
  });
  if (!input._hgBound) {
    input._hgBound = true;
    input.addEventListener('input', e => {
      if (S.lang !== 'ko' || koKbLayout !== 'qwerty' || e.isComposing || input._hgBusy) return;
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
    if (qi % 3 === 2) { const fq = makeFillQuestion(w, les.title); if (fq) return fq; }
    return makeMCQuestion(w, v, wi + 31, les.title);
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
    if (qi === 4) { const fq = makeFillQuestion(w, '500 kata inti'); if (fq) return fq; }
    const q = makeMCQuestion(w, core, wi + 17, '500 kata inti', 'arti');
    if (!w[2]) q.explain = 'Kata ini termasuk 500 kata inti ' + LANGMETA[S.lang].name + '.';
    return q;
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
  const dueCore = dueCards(), dueCustom = dueCustomCards(), due = dueCore.length + dueCustom.length, nw = newCards().length;
  c.innerHTML = '<div class="wrap"><h1 class="page">Mau ngapain hari ini?</h1><p class="sub">Kartu hafalan Bahasa ' + LANGMETA[S.lang].name + ' — bukan cuma kata: frasa, pola grammar, dan kalimat contoh yang kamu tambahkan dari bacaan/frasa/tata bahasa juga masuk antrean SRS ini.</p>' +
    '<div class="grid2" style="margin-top:18px">' +
    '<div class="card"><div class="sect-label" style="margin-top:0">Review hari ini</div><b style="font-size:17px">' + (due ? 'Hari ini review ' + due + ' kartu' : 'Nggak ada kartu yang jatuh tempo') + '</b><p class="muted" style="margin:6px 0 14px">' + (due ? dueCustom.length + ' di antaranya kartu tambahanmu (frasa/pola/kalimat) · diurut dari yang paling lama menunggu · ±' + Math.max(1, Math.round(due / 5)) + ' menit.' : 'Santai — besok balik lagi.') + '</p><button type="button" class="btn" id="fc-review" ' + (due ? '' : 'disabled') + '>Mulai →</button></div>' +
    '<div class="card"><div class="sect-label" style="margin-top:0">Belajar kartu baru</div><b style="font-size:17px">' + nw + ' kartu belum pernah kamu pelajari</b><p class="muted" style="margin:8px 0">Jumlah kartu:</p><div class="chiprow">' + [5, 10, 20, 40].map(n => '<button type="button" class="chip' + (fcNewCount === n ? ' active' : '') + '" data-fn="' + n + '">' + n + '</button>').join('') + '</div><button type="button" class="btn" id="fc-new" style="margin-top:14px">Mulai →</button></div>' +
    '</div></div>';
  $$('[data-fn]', c).forEach(b => b.onclick = () => { fcNewCount = +b.dataset.fn; pageFlashcards(c); });
  const r = $('#fc-review', c); if (r) r.onclick = () => fcPlay(c, dueCore.map(i => ({ w: DG.core[S.lang][i], core: i, key: null })).concat(dueCustom.map(k => ({ w: LS().srsCustom[k].w, core: null, key: k }))), 'Review hari ini');
  $('#fc-new', c).onclick = () => fcPlay(c, newCards().slice(0, fcNewCount).map(i => ({ w: DG.core[S.lang][i], core: i, key: null })), 'Kartu baru');
}
function fcPlay(c, deck, label) {
  if (!deck.length) { pageFlashcards(c); return; }
  let i = 0, flipped = false, rated = 0, skipped = 0;
  const RATES = [['Lupa', '~1 menit', 0, 'r1'], ['Sulit', '4 hari', 4, 'r2'], ['Ingat', '9 hari', 9, 'r3'], ['Mudah', '20 hari', 20, 'r4']];
  function draw() {
    const item = deck[i], w = item.w;
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
      const rec = { due: days === 0 ? todayStr() : todayStr(d), iv: days };
      if (item.core != null) LS().srs[item.core] = rec;
      else if (item.key) { LS().srsCustom[item.key] = Object.assign({}, LS().srsCustom[item.key], rec); }
      bumpSkill('read', ri >= 2 ? 1 : 0, 1);
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
  let lvlFilter = '';
  c.innerHTML = '<div class="wrap"><div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start"><div style="flex:1;min-width:240px"><h1 class="page">Bacaan berjenjang — dari Nol sampai Mahir.</h1><p class="sub">' + all.length + ' artikel pendek Bahasa ' + LANGMETA[S.lang].name + ' dengan terjemahan per kalimat, kosakata, dan pertanyaan pemahaman.</p></div>' +
    '<div class="searchbox" style="flex:0 1 320px"><span>🔍</span><input id="rd-q" type="search" placeholder="Cari judul atau kategori…" value="' + esc(readFilter.q) + '"></div></div>' +
    '<div class="chiprow" style="margin-top:14px"><button type="button" class="chip active">' + LANGMETA[S.lang].name + '</button>' + [...new Set(all.map(r => r.cat))].map(cat => '<button type="button" class="chip' + (readFilter.cat === cat ? ' active' : '') + '" data-cat="' + esc(cat) + '">' + esc(cat) + '</button>').join('') + '<span class="small muted" id="rd-count"></span></div><div id="rd-list"></div></div>';
  const draw = () => {
    let list = all;
    if (lvlFilter) list = list.filter(r => r.level === lvlFilter);
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
  const lvlRow = document.createElement('div'); lvlRow.className = 'chiprow'; lvlRow.style.marginTop = '10px'; lvlRow.innerHTML = '<span class="small muted">Jenjang:</span>' + [''].concat(LEVELS).map(lv => '<button type="button" class="chip" data-lvlf="' + lv + '">' + (lv || 'Semua') + '</button>').join(''); const anchorRow = $$('.chiprow', c)[0]; anchorRow.parentNode.insertBefore(lvlRow, anchorRow.nextSibling);
  $$('[data-lvlf]', c).forEach(b => b.onclick = () => { lvlFilter = b.dataset.lvlf; $$('[data-lvlf]', c).forEach(x => x.classList.toggle('active', x === b)); draw(); });
  $('#rd-q', c).addEventListener('input', e => { readFilter.q = e.target.value; draw(); });
  draw();
}
function tapWords(text) {
  return esc(text).split(' ').map(tok => '<button type="button" class="tap-word" data-tw="' + tok.replace(/"/g, '&quot;') + '">' + tok + '</button>').join(' ');
}
function lookupWord(tok) {
  const clean = x => String(x || '').toLowerCase().replace(/[.,!?;:()"“”'’。！？、·…]/g, '').trim();
  const t = clean(tok);
  if (!t) return null;
  const pools = DG.core[S.lang].concat(DG.vocab[S.lang]);
  let best = null;
  for (const w of pools) {
    const cw = clean(w[0]);
    if (cw === t) return w;
    if (cw && (t.startsWith(cw) || cw.startsWith(t)) && t.length >= 2 && (!best || cw.length > clean(best[0]).length)) best = w;
  }
  return best;
}
function pageReading(c, p) {
  const r = DG.readings[S.lang].find(x => x.id === p.id) || DG.readings[S.lang][0];
  c.innerHTML = '<div class="wrap">' + crumb([['Beranda', 'home'], ['Bacaan', 'readings'], [r.title]]) +
    '<h1 class="page">' + esc(r.title) + '</h1><div class="chiprow" style="margin-top:10px"><span class="chip">' + r.level + '</span><span class="chip">' + esc(r.cat) + '</span><span class="chip">3 menit baca</span></div>' +
    '<div class="card" style="margin-top:16px"><p class="small muted" style="margin-bottom:8px">Ketuk kata mana pun di kalimat untuk melihat artinya & menambahkannya ke kartu hafalan.</p>' + r.sentences.map(s => '<div class="sent-line"><span>' + tapWords(s[0]) + '</span> ' + ttsBtn(s[0]) + '<small>' + esc(s[1]) + '</small></div>').join('') +
    (r.vocab && r.vocab.length ? '<div class="sect-label">Vocab bacaan ini</div><div class="chiprow">' + r.vocab.map(v => '<span class="chip">' + esc(v) + '</span>').join('') + '</div>' : '') + '</div>' +
    '<div class="card" style="margin-top:16px"><div class="sect-label" style="margin-top:0">Pertanyaan pemahaman</div>' +
    r.questions.map((q, qi) => '<div style="margin:14px 0"><b>' + (qi + 1) + '. ' + esc(q[0]) + '</b><div class="chiprow" style="margin-top:8px">' + q[1].map((o, oi) => '<button type="button" class="chip" data-rq="' + qi + ':' + oi + '">' + esc(o) + '</button>').join('') + '</div><p class="small" id="rq-fb-' + qi + '" style="margin-top:6px"></p></div>').join('') + '</div></div>';
  bindCrumb(c);
  $$('[data-tw]', c).forEach(b => b.onclick = () => {
    let panel = $('#tap-panel', c);
    if (!panel) { panel = document.createElement('div'); panel.id = 'tap-panel'; panel.className = 'card'; panel.style.marginTop = '12px'; const cards = $$('.card', c); cards[0].parentNode.insertBefore(panel, cards[0].nextSibling); }
    const w = lookupWord(b.dataset.tw);
    if (w) { panel.innerHTML = '<b>' + esc(w[0]) + '</b> = ' + esc(w[1]) + ' ' + ttsBtn(w[0]) + (w[2] ? '<p class="muted small" style="margin-top:4px">Contoh: ' + esc(w[2]) + ' — ' + esc(w[3]) + '</p>' : '') + '<div class="quiz-actions"><button type="button" class="btn small" id="tap-add">Tambah ke kartu hafalan</button></div>'; const ad = $('#tap-add', panel); if (ad) ad.onclick = () => addToSRS(w, 'kata dari bacaan'); }
    else panel.innerHTML = '<b>' + esc(b.dataset.tw) + '</b> — belum ada di kamus DidiGo. Coba ketuk kata dasarnya (tanpa partikel/akhiran).';
  });
  $$('[data-rq]', c).forEach(b => b.onclick = () => {
    const [qi, oi] = b.dataset.rq.split(':').map(Number);
    const fb = $('#rq-fb-' + qi, c);
    if (oi === r.questions[qi][2]) { fb.innerHTML = '<span style="color:var(--green)"><b>Benar!</b></span> <span class="muted">' + esc(r.questions[qi][3]) + '</span>'; bumpSkill('read', 1, 1); awardBonus(1, 'bacaan'); }
    else { bumpSkill('read', 0, 1); fb.innerHTML = '<span style="color:var(--red)"><b>Belum tepat.</b></span> <span class="muted">Coba baca lagi kalimatnya di atas.</span>'; }
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
    const rows = ((pats && pats[lv]) || []).map(p => '<tr><td><b>' + esc(p[0]) + '</b></td><td>' + esc(p[1]) + ' ' + ttsBtn(p[1]) + '</td><td>' + esc(p[2]) + '</td><td><button type="button" class="btn white small" data-add-pat="' + esc(p[0]) + '|' + esc(p[1]) + '|' + esc(p[2]) + '">＋ Kartu</button></td></tr>').join('');
    return '<div class="card" style="margin-bottom:16px"><b style="font-size:16px">Level ' + lv + '</b><table class="tbl"><tr><th>Pola</th><th>Contoh</th><th>Artinya</th></tr>' + rows + '</table></div>';
  }).join('');
  body += '<div class="sect-label">Catatan Penting (' + (notes ? notes.length : 0) + ' catatan)</div>' + (notes || []).map(n => '<div class="card" style="margin-bottom:12px"><b>' + esc(n[0]) + '</b><p style="margin:6px 0">' + esc(n[1]) + '</p>' + (n[2] || []).map(x => '<div class="sent-line"><b>' + esc(x[0]) + '</b> ' + ttsBtn(x[0]) + '<small>' + esc(x[1]) + '</small></div>').join('') + '</div>').join('');
  body += '<div class="sect-label">Jenis Kata</div>' + (wc || []).map(g => '<div class="card" style="margin-bottom:16px"><b style="font-size:16px">' + esc(g[0]) + '</b><p class="muted" style="margin:5px 0 10px">' + esc(g[1]) + '</p><table class="tbl"><tr><th>Kata</th><th>Arti</th><th>Contoh</th></tr>' + g[2].map(w => '<tr><td><b>' + esc(w[0]) + '</b> ' + ttsBtn(w[0]) + '</td><td>' + esc(w[1]) + '</td><td>' + esc(w[2]) + '<br><span class="muted small">' + esc(w[3]) + '</span></td></tr>').join('') + '</table></div>').join('');
  body += '<div class="sect-label">Latihan Langsung Tata Bahasa</div><div class="card"><p class="muted" style="margin-bottom:10px">Untuk apa: membuktikan pola grammar tiap level langsung dengan soal — bukan teori saja. Pilih levelnya:</p><div class="chiprow">' + LEVELS.map(lv => '<button type="button" class="btn white" data-glat="' + lv + '">Latihan ' + lv + ' →</button>').join('') + '</div></div>';
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Tata Bahasa — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Grammar Pattern bertahap A0–C2, Catatan Penting, Jenis Kata, dan Kata Hari Ini — persis isi web sebelumnya, tampilan v22 Minimalis.</p><div style="margin-top:16px">' + body + '</div></div>';
  $$('[data-add-pat]', c).forEach(b => b.onclick = () => { const [p0, p1, p2] = b.dataset.addPat.split('|'); addToSRS([p0, p2, p1, p2], 'pola grammar'); });
  $$('[data-glat]', c).forEach(b => b.onclick = () => {
    const lv = b.dataset.glat;
    const pool = [];
    DG.lessons[S.lang].filter(l => l.level === lv).forEach(l => vocabOf(l.id).forEach(w => pool.push(w)));
    const picks = shuffle(pool.map((w, i) => i), Date.now() % 997).slice(0, 3);
    const qs = picks.map((wi, qi) => { const w = pool[wi]; if (qi === 1) { const fq = makeFillQuestion(w, 'Tata Bahasa ' + lv); if (fq) return fq; } return makeMCQuestion(w, pool, wi + 5, 'Tata Bahasa ' + lv, 'arti'); });
    runQuiz(c, { routeName: 'grammar', title: 'LATIHAN TATA BAHASA · LEVEL ' + lv, sub: 'Tiga soal langsung dari kosakata & pola level ' + lv + '.', questions: qs,
      finish(cc, pct, ok, total) { cc.innerHTML = '<div class="wrap"><div class="card" style="max-width:560px;margin:30px auto;text-align:center"><div class="sect-label">Selesai</div><h1 class="page">' + pct + '%</h1><p class="muted">' + ok + '/' + total + ' benar.</p><button type="button" class="btn" style="margin-top:14px" id="gl-back">Kembali ke Tata Bahasa</button></div></div>'; $('#gl-back', cc).onclick = () => go('grammar'); } });
  });
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
    en: [['I am agree', 'I agree', '"Agree" itu kata kerja, jadi tidak pakai "am".'], ['She don\'t like coffee', 'She doesn\'t like coffee', 'Untuk she/he/it, "doesn\'t" + kata kerja dasar.'], ['I am boring', 'I am bored', '"Boring" = membosankan (untuk benda/situasi); perasaanmu "bored".'], ['Discuss about the plan', 'Discuss the plan', '"Discuss" langsung diikuti objek, tanpa "about".'], ['I have 20 years old', 'I am 20 years old', 'Umur memakai "am/is/are", bukan "have".'], ['She is more taller than me', 'She is taller than me', 'Perbandingan "-er" tidak perlu "more".'], ["I didn't went home", "I didn't go home", 'Sesudah "didn\'t", kata kerja kembali ke bentuk dasar.'], ['Your welcome', "You're welcome", '"You\'re" = you are; "your" = milikmu.']],
    ko: [['저는 학교에 가요 (ke orang baru dikenal)', '저는 학교에 갑니다 / 가요', 'Untuk orang asing yang lebih tua, naikkan tingkat kesopanan kalimatmu.'], ['친구하고 만나요 ditulis 친구와 만나요 saja', 'Keduanya bisa, tapi -하고 lebih lisan', 'Partikel "dengan" punya beberapa bentuk; sesuaikan gaya bicara.'], ['Lupa partikel topik/subjek', '은/는 vs 이/가 tertukar', '은/는 menandai topik, 이/가 menandai subjek baru/penting. Latih lewat contoh, bukan hafalan rumus.'], ['Urutan kata Inggris dibawa ke Korea', 'Korea: subjek–objek–kata kerja', 'Kata kerja selalu di akhir kalimat Korea.'], ['책를 읽어요', '책을 읽어요', 'Partikel objek: sesudah konsonan (batchim) pakai 을, sesudah vokal pakai 를. 책 berakhir konsonan, jadi 책을.'], ['학교를 가요', '학교에 가요', '"Pergi ke" tempat tujuan memakai partikel 에, bukan 를.'], ['저는 밥를 먹어요', '저는 밥을 먹어요', '밥 berakhir konsonan ㅂ (batchim), jadi partikel objeknya 을.']],
    ja: [['私は学生です dibaca "watashi wa…"', 'は dibaca "wa" saat jadi partikel', 'Karakter は sebagai partikel topik dibaca "wa", bukan "ha".'], ['ありがとう ke atasan saja', 'ありがとうございます', 'Ke atasan/orang asing tambahkan ございます agar sopan.'], ['を ditulis tapi tak dibaca', 'Partikel を dibaca "o"', 'を hanya dipakai sebagai partikel objek dan dibaca "o".'], ['Urutan kata kerja di tengah', 'Jepang: kata kerja di akhir', 'Seperti Korea: subjek–objek–kata kerja.'], ['学校を行きます', '学校へ行きます', 'Gerak menuju tempat memakai partikel へ/に, bukan を.'], ['昨日は行きます (kemarin, tapi bentuk sekarang)', '昨日は行きました', '"Kemarin" sudah lewat — pakai bentuk lampau -ました.'], ['私は学生だ (ke guru)', '私は学生です', 'Ke guru/atasan pakai bentuk sopan です, bukan だ.']]
  };
  c.innerHTML = '<div class="wrap"><h1 class="page">Kesalahan Umum — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Kesalahan yang paling sering dibuat penutur Indonesia, kenapa salah, bentuk benarnya — plus latihan singkat di tiap kartu: tebak dulu mana yang benar, baru penjelasannya terbuka.</p>' +
    items[S.lang].map((x, i) => {
      const opts = i % 2 === 0 ? [x[1], x[0]] : [x[0], x[1]];
      return '<div class="card" style="margin-top:14px"><div class="sect-label" style="margin-top:0">Latihan — kalimat mana yang benar?</div><div class="chiprow">' + opts.map(o => '<button type="button" class="chip" data-mist="' + i + '" data-val="' + esc(o) + '">' + esc(o) + '</button>').join('') + '</div><p class="small" id="mist-fb-' + i + '" style="margin-top:8px"></p><div id="mist-exp-' + i + '" hidden><p style="margin-top:8px"><span style="color:var(--red)"><b>✗ ' + esc(x[0]) + '</b></span> → <span style="color:var(--green)"><b>✓ ' + esc(x[1]) + '</b></span> ' + ttsBtn(x[1]) + '</p><p class="muted" style="margin-top:5px"><b>Kenapa?</b> ' + esc(x[2]) + '</p></div></div>';
    }).join('') + '</div>';
  $$('[data-mist]', c).forEach(b => b.onclick = () => {
    const i = +b.dataset.mist, x = items[S.lang][i];
    const fb = $('#mist-fb-' + i, c), exp = $('#mist-exp-' + i, c);
    if (b.dataset.val === x[1]) { fb.innerHTML = '<span style="color:var(--green)"><b>Benar!</b></span>'; awardBonus(1, 'kesalahan-umum'); }
    else fb.innerHTML = '<span style="color:var(--red)"><b>Belum tepat</b> — lihat bentuk benarnya di bawah.</span>';
    exp.hidden = false;
  });
}

/* ===== DIKTE ===== */
function pageDictation(c) {
  const pool = DG.core[S.lang].filter(w => w[2]);
  const w = pool[Math.floor(Math.random() * pool.length)];
  c.innerHTML = '<div class="wrap"><h1 class="page">Dikte — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Dengarkan kalimatnya, lalu ketik persis seperti yang kamu dengar.</p>' +
    '<div class="card" style="max-width:640px;margin:18px auto 0;text-align:center"><div class="q-context" style="text-align:left"><span class="q-context-label">Konteks</span> Arti kalimat yang akan kamu dengar: \"' + esc(w[3]) + '\" — dengarkan kalimat Bahasa ' + LANGMETA[S.lang].name + '-nya, lalu ketik persis seperti yang kamu dengar, lengkap dengan tanda bacanya.</div><p class="muted" style="margin-top:12px">Klik untuk memutar kalimat (bisa diulang):</p>' +
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
    bumpSkill('listen', got === want ? 1 : 0, 1);
    if (got !== want) { LS().errLog.unshift({ t: Date.now(), tag: 'Dikte', type: 'fill', prompt: 'Dikte — ketik kalimat yang didengar (artinya: ' + w[3] + ')', options: null, answer: w[2], user: $('#dict-in', c).value, context: '', explain: 'Kalimat yang benar: ' + w[2] + ' — ' + w[3] }); save(); }
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
    S.journal.unshift({ date: todayStr(), lang: S.lang, text: t }); save(); bumpSkill('write', 1, 1); awardBonus(5, 'menulis'); toast('Tersimpan di Jurnal. +5 XP');
    $('#w-text', c).value = ''; $('#w-count', c).textContent = '0 karakter';
  };
  const corr = document.createElement('div');
  corr.className = 'card'; corr.style.marginTop = '14px';
  corr.innerHTML = '<div class="sect-label" style="margin-top:0">Periksa tulisan saya — koreksi otomatis</div><p class="muted" style="margin-bottom:10px">Untuk apa: memeriksa tata bahasa, pilihan kata, dan ejaan tulisanmu di atas, lalu menunjukkan kalimat perbaikannya + alasan singkat tiap kesalahan.</p><button type="button" class="btn" id="w-check">Periksa tulisan saya</button><div id="w-corr" style="margin-top:12px"></div><p class="small muted" style="margin-top:8px">Koreksi ini berbasis aturan & pola kesalahan umum (termasuk daftar Kesalahan Umum DidiGo) — bukan AI penuh, jadi tetap mungkin ada yang terlewat.</p>';
  c.querySelector('.wrap').appendChild(corr);
  $('#w-check', corr).onclick = () => {
    const t = $('#w-text', c).value;
    const out = $('#w-corr', corr);
    if (!t.trim()) { out.innerHTML = '<p class="warn">Tulis dulu kalimatnya di kotak di atas, lalu tekan Periksa.</p>'; return; }
    let fixed = t; const notes = [];
    const RULES = {
      en: [['I am agree', 'I agree', '"agree" adalah kata kerja — tidak perlu "am".'], ['discuss about', 'discuss', '"discuss" langsung diikuti objek, tanpa "about".'], ['I am boring', 'I am bored', 'Perasaan orang memakai bentuk -ed: bored, tired, interested.'], ['more taller', 'taller', 'Kata sifat pendek tidak memakai "more": tall → taller.'], ["didn't went", "didn't go", 'Sesudah "didn\'t" pakai kata kerja dasar: go.'], ['I have 20 years old', 'I am 20 years old', 'Umur memakai "be" (am/is/are), bukan "have".']],
      ko: [['책를', '책을', 'Partikel objek sesudah kata berakhiran konsonan = 을.'], ['학교를 가', '학교에 가', 'Tujuan gerak memakai partikel 에, bukan 를.'], ['밥를', '밥을', 'Sesudah konsonan pakai 을: 밥을.']],
      ja: [['学校を行', '学校へ行', 'Arah gerak memakai partikel へ (dibaca e).'], ['昨日は行きます', '昨日は行きました', 'Kemarin = waktu lampau, pakai bentuk lampau ました.']]
    };
    (RULES[S.lang] || []).forEach(r2 => { if (fixed.toLowerCase().includes(r2[0].toLowerCase())) { fixed = fixed.split(r2[0]).join(r2[1]); notes.push('"' + r2[0] + '" → "' + r2[1] + '" — ' + r2[2]); } });
    const dw = fixed.match(/\b(\w+)\s+\1\b/i);
    if (dw) { fixed = fixed.replace(/\b(\w+)\s+\1\b/i, '$1'); notes.push('Kata ganda "' + dw[0] + '" dihapus — biasanya tidak sengaja terketik dua kali.'); }
    if (/\s{2,}/.test(fixed)) { fixed = fixed.replace(/\s{2,}/g, ' '); notes.push('Spasi ganda dirapikan.'); }
    if (S.lang === 'en') { const f2 = fixed.replace(/(^|[.!?]\s+)([a-z])/g, (m, a, b) => a + b.toUpperCase()).replace(/\bi\b/g, 'I'); if (f2 !== fixed) { fixed = f2; notes.push('Awal kalimat & kata "I" (saya) selalu huruf kapital dalam Bahasa Inggris.'); } }
    bumpSkill('write', notes.length ? Math.max(0, 3 - notes.length) : 3, 3);
    out.innerHTML = notes.length
      ? '<div class="warn"><b>Ditemukan ' + notes.length + ' perbaikan:</b>' + notes.map(n => '<p style="margin-top:5px">• ' + esc(n) + '</p>').join('') + '</div><div class="good" style="margin-top:10px"><b>Versi perbaikannya:</b><p style="margin-top:6px">' + esc(fixed) + '</p></div>'
      : '<div class="good"><b>Bagus!</b> Tidak ditemukan kesalahan pola umum pada tulisanmu. Tetap periksa lagi pilihan katanya ya.</div>';
  };
  $('#w-script', c).onclick = () => go('script');
}
/* ===== BELAJAR MENULIS — LENGKAP untuk 3 bahasa (isi penuh, bukan catatan) ===== */
const EN_LETTERS = [['A a', 'ei', 'apple — apel'], ['B b', 'bi', 'book — buku'], ['C c', 'si', 'cat — kucing'], ['D d', 'di', 'dog — anjing'], ['E e', 'i', 'egg — telur'], ['F f', 'ef', 'fish — ikan'], ['G g', 'ji', 'go — pergi'], ['H h', 'eich', 'house — rumah'], ['I i', 'ai', 'I — saya'], ['J j', 'jei', 'juice — jus'], ['K k', 'kei', 'key — kunci'], ['L l', 'el', 'lion — singa'], ['M m', 'em', 'milk — susu'], ['N n', 'en', 'name — nama'], ['O o', 'ou', 'orange — jeruk'], ['P p', 'pi', 'pen — pulpen'], ['Q q', 'kyu', 'queen — ratu'], ['R r', 'ar', 'rice — nasi'], ['S s', 'es', 'sun — matahari'], ['T t', 'ti', 'tea — teh'], ['U u', 'yu', 'umbrella — payung'], ['V v', 'vi', 'voice — suara'], ['W w', 'dabelyu', 'water — air'], ['X x', 'eks', 'box — kotak'], ['Y y', 'wai', 'yellow — kuning'], ['Z z', 'zi', 'zoo — kebun binatang']];
const EN_COMBOS = [['sh', 'sy', 'ship (kapal), fish (ikan)'], ['ch', 'c', 'chair (kursi), watch (menonton)'], ['th', 'lidah di antara gigi', 'this (ini), think (berpikir) — dua bunyi berbeda'], ['ph', 'f', 'phone (telepon), photo (foto)'], ['ck', 'k', 'duck (bebek), back (kembali/punggung)'], ['ng', '-ng di akhir', 'sing (bernyanyi), king (raja)'], ['qu', 'kw', 'queen (ratu), quick (cepat)'], ['wh', 'w', 'what (apa), where (di mana)']];
const KO_CONS = [['ㄱ', 'g/k — seperti "g" di "gajah"', '가방 (tas)'], ['ㄲ', 'kk — tegang, seperti "k" ditekan', '까치 (burung murai)'], ['ㄴ', 'n — seperti "n"', '나라 (negara)'], ['ㄷ', 'd/t — seperti "d"', '다리 (kaki/jembatan)'], ['ㄸ', 'tt — tegang', '딸 (anak perempuan)'], ['ㄹ', 'r/l — di awal r, di akhir l', '라면 (ramyeon)'], ['ㅁ', 'm — seperti "m"', '물 (air)'], ['ㅂ', 'b/p — seperti "b"', '밥 (nasi)'], ['ㅃ', 'pp — tegang', '빵 (roti)'], ['ㅅ', 's — seperti "s"', '사과 (apel)'], ['ㅆ', 'ss — tegang', '싸다 (murah)'], ['ㅇ', 'di awal diam, di akhir -ng', '강 (sungai)'], ['ㅈ', 'j — seperti "j"', '집 (rumah)'], ['ㅉ', 'jj — tegang', '짜다 (asin)'], ['ㅊ', 'ch — seperti "c" berdesis', '차 (teh/mobil)'], ['ㅋ', 'kh — k berhembus', '코 (hidung)'], ['ㅌ', 'th — t berhembus', '토마토 (tomat)'], ['ㅍ', 'ph — p berhembus', '포도 (anggur)'], ['ㅎ', 'h — seperti "h"', '하늘 (langit)']];
const KO_VOWELS = [['ㅏ', 'a'], ['ㅐ', 'ae'], ['ㅑ', 'ya'], ['ㅒ', 'yae'], ['ㅓ', 'eo'], ['ㅔ', 'e'], ['ㅕ', 'yeo'], ['ㅖ', 'ye'], ['ㅗ', 'o'], ['ㅘ', 'wa (ㅗ+ㅏ)'], ['ㅙ', 'wae (ㅗ+ㅐ)'], ['ㅚ', 'oe (ㅗ+ㅣ)'], ['ㅛ', 'yo'], ['ㅜ', 'u'], ['ㅝ', 'wo (ㅜ+ㅓ)'], ['ㅞ', 'we (ㅜ+ㅔ)'], ['ㅟ', 'wi (ㅜ+ㅣ)'], ['ㅠ', 'yu'], ['ㅡ', 'eu'], ['ㅢ', 'ui (ㅡ+ㅣ)'], ['ㅣ', 'i']];
const JA_KANA = [['あ','ア','a · ame (雨 hujan)'],['い','イ','i · inu (犬 anjing)'],['う','ウ','u · umi (海 laut)'],['え','エ','e · eki (駅 stasiun)'],['お','オ','o · oka (丘 bukit)'],['か','カ','ka · kaze (風 angin)'],['き','キ','ki · ki (木 pohon)'],['く','ク','ku · kumo (雲 awan)'],['け','ケ','ke · keeki (ケーキ kue)'],['こ','コ','ko · koko (ここ sini)'],['さ','サ','sa · sora (空 langit)'],['し','シ','shi · sushi (寿司)'],['す','ス','su · suika (西瓜 semangka)'],['せ','セ','se · sensei (先生 guru)'],['そ','ソ','so · sora (空 langit)'],['た','タ','ta · tako (たこ gurita)'],['ち','チ','chi · chizu (地図 peta)'],['つ','ツ','tsu · tsuki (月 bulan)'],['て','テ','te · tegami (手紙 surat)'],['と','ト','to · toki (時 waktu)'],['な','ナ','na · natsu (夏 musim panas)'],['に','ニ','ni · niwa (庭 taman)'],['ぬ','ヌ','nu · nuno (布 kain)'],['ね','ネ','ne · neko (猫 kucing)'],['の','ノ','no · nomu (飲む minum)'],['は','ハ','ha · hana (花 bunga)'],['ひ','ヒ','hi · hi (日 hari)'],['ふ','フ','fu · fune (船 kapal)'],['へ','ヘ','he · heya (部屋 kamar)'],['ほ','ホ','ho · hoshi (星 bintang)'],['ま','マ','ma · machi (町 kota)'],['み','ミ','mi · mizu (水 air)'],['む','ム','mu · mura (村 desa)'],['め','メ','me · me (目 mata)'],['も','モ','mo · momo (桃 persik)'],['や','ヤ','ya · yama (山 gunung)'],['ゆ','ユ','yu · yuki (雪 salju)'],['よ','ヨ','yo · yoru (夜 malam)'],['ら','ラ','ra · ringo (りんご apel)'],['り','リ','ri · risu (りす tupai)'],['る','ル','ru · rusuban (留守番)'],['れ','レ','re · reban (レバ刺し) — remon (レモン lemon)'],['ろ','ロ','ro · roji (路地 gang)'],['わ','ワ','wa · watashi (私 saya)'],['を','ヲ','wo — partikel objek, dibaca "o"'],['ん','ン','n — bunyi sengau penutup']];
const JA_KANJI = [
{cat:'Angka',items:[['一','いち','ひと','satu','一人 (ひとり) — satu orang'],['二','に','ふた','dua','二月 (にがつ) — Februari'],['三','さん','み','tiga','三日 (みっか) — tanggal 3'],['四','し','よん','empat','四人 (よにん) — empat orang'],['五','ご','いつ','lima','五円 (ごえん) — 5 yen'],['六','ろく','む','enam','六月 (ろくがつ) — Juni'],['七','しち','なな','tujuh','七日 (なのか) — tanggal 7'],['八','はち','や','delapan','八時 (はちじ) — jam 8'],['九','きゅう','ここの','sembilan','九月 (くがつ) — September'],['十','じゅう','とお','sepuluh','十分 (じゅっぷん) — 10 menit']]},
{cat:'Waktu & Hari',items:[['日','にち','ひ','hari / matahari','日本 (にほん) — Jepang'],['月','げつ','つき','bulan','月曜日 (げつようび) — Senin'],['火','か','ひ','api','火曜日 (かようび) — Selasa'],['水','すい','みず','air','水曜日 (すいようび) — Rabu'],['木','もく','き','pohon / kayu','木曜日 (もくようび) — Kamis'],['金','きん','かね','emas / uang','金曜日 (きんようび) — Jumat'],['土','ど','つち','tanah','土曜日 (どようび) — Sabtu'],['年','ねん','とし','tahun','来年 (らいねん) — tahun depan'],['今','こん','いま','sekarang','今日 (きょう) — hari ini'],['時','じ','とき','waktu / jam','何時 (なんじ) — jam berapa'],['間','かん','あいだ','antara / waktu','時間 (じかん) — waktu'],['分','ふん・ぶん','わ','menit / bagian','十分 (じゅっぷん) — 10 menit'],['半','はん','','setengah','半分 (はんぶん) — setengah'],['毎','まい','ごと','setiap','毎日 (まいにち) — setiap hari'],['週','しゅう','','minggu','今週 (こんしゅう) — minggu ini']]},
{cat:'Orang & Keluarga',items:[['人','じん・にん','ひと','orang','日本人 (にほんじん) — orang Jepang'],['女','じょ','おんな','perempuan','女の子 (おんなのこ) — anak perempuan'],['男','だん','おとこ','laki-laki','男の人 (おとこのひと) — laki-laki'],['子','し','こ','anak','子ども (こども) — anak'],['学','がく','まな','belajar','学生 (がくせい) — pelajar'],['生','せい','なま','hidup / lahir','先生 (せんせい) — guru'],['先','せん','さき','sebelum / depan','先週 (せんしゅう) — minggu lalu'],['友','ゆう','とも','teman','友達 (ともだち) — teman'],['家','か','いえ','rumah / keluarga','家族 (かぞく) — keluarga'],['母','ぼ','はは','ibu','お母さん (おかあさん) — ibu'],['父','ふ','ちち','ayah','お父さん (おとうさん) — ayah'],['兄','きょう','あに','kakak laki-laki','お兄さん (おにいさん) — kakak laki-laki']]},
{cat:'Tempat & Arah',items:[['校','こう','','sekolah','学校 (がっこう) — sekolah'],['上','じょう','うえ','atas','上手 (じょうず) — pandai'],['下','か','した','bawah','下手 (へた) — tidak pandai'],['中','ちゅう','なか','tengah / dalam','中学校 (ちゅうがっこう) — SMP'],['外','がい','そと','luar','外国 (がいこく) — luar negeri'],['内','ない','うち','dalam','家内 (かない) — istri'],['前','ぜん','まえ','depan / sebelum','名前 (なまえ) — nama'],['後','ご','あと','belakang / sesudah','午後 (ごご) — siang'],['右','ゆう','みぎ','kanan','右手 (みぎて) — tangan kanan'],['左','さ','ひだり','kiri','左手 (ひだりて) — tangan kiri'],['東','とう','ひがし','timur','東京 (とうきょう) — Tokyo'],['西','さい','にし','barat','西日 (にしび) — matahari barat'],['南','なん','みなみ','selatan','南口 (みなみぐち) — pintu selatan'],['北','ほく','きた','utara','北海道 (ほっかいどう) — Hokkaido'],['国','こく','くに','negara','日本国 (にほんこく) — Jepang'],['出','しゅつ','で','keluar','出口 (でぐち) — pintu keluar'],['入','にゅう','はい','masuk','入口 (いりぐち) — pintu masuk']]},
{cat:'Warna & Sifat',items:[['白','はく','しろ','putih','白い (しろい) — putih'],['黒','こく','くろ','hitam','黒い (くろい) — hitam'],['赤','せき','あか','merah','赤い (あかい) — merah'],['青','せい','あお','biru','青い (あおい) — biru'],['大','だい','おお','besar','大きい (おおきい) — besar'],['小','しょう','ちい','kecil','小さい (ちいさい) — kecil'],['高','こう','たか','tinggi / mahal','高い (たかい) — tinggi'],['安','あん','やす','murah / aman','安い (やすい) — murah'],['明','めい','あか','terang / jelas','明日 (あした) — besok'],['長','ちょう','なが','panjang','長い (ながい) — panjang']]},
{cat:'Bergerak & Bahasa',items:[['行','こう','い','pergi','行く (いく) — pergi'],['来','らい','く','datang','来る (くる) — datang'],['帰','き','かえ','pulang','帰る (かえる) — pulang'],['歩','ほ','ある','jalan kaki','歩く (あるく) — berjalan'],['止','し','と','berhenti','止まる (とまる) — berhenti'],['立','りつ','た','berdiri','立つ (たつ) — berdiri'],['休','きゅう','やす','istirahat','休む (やすむ) — beristirahat'],['見','けん','み','melihat','見る (みる) — melihat'],['聞','ぶん','き','mendengar / bertanya','聞く (きく) — mendengar'],['読','どく','よ','membaca','読む (よむ) — membaca'],['書','しょ','か','menulis','書く (かく) — menulis'],['話','わ','はな','berbicara','話す (はなす) — berbicara'],['語','ご','かた','bahasa / kata','日本語 (にほんご) — bahasa Jepang'],['言','げん','こと','berkata / kata','言葉 (ことば) — kata']]},
{cat:'Kehidupan Sehari-hari',items:[['食','しょく','た','makan','食べる (たべる) — makan'],['飲','いん','の','minum','飲む (のむ) — minum'],['買','ばい','か','membeli','買う (かう) — membeli'],['売','ばい','う','menjual','売る (うる) — menjual'],['作','さく','つく','membuat','作る (つくる) — membuat'],['仕','し','','pekerjaan / melayani','仕事 (しごと) — pekerjaan'],['事','じ','こと','hal / urusan','大事 (だいじ) — penting'],['物','ぶつ','もの','benda','食べ物 (たべもの) — makanan'],['名','めい','な','nama','名前 (なまえ) — nama'],['何','か','なに','apa','何時 (なんじ) — jam berapa'],['車','しゃ','くるま','mobil / kendaraan','車 (くるま) — mobil'],['電','でん','','listrik','電車 (でんしゃ) — kereta listrik'],['駅','えき','','stasiun','駅 (えき) — stasiun'],['道','どう','みち','jalan','道 (みち) — jalan'],['店','てん','みせ','toko','店 (みせ) — toko'],['本','ほん','もと','buku / batang','日本 (にほん) — Jepang'],['手','しゅ','て','tangan','右手 (みぎて) — tangan kanan']]},
{cat:'Uang & Jumlah',items:[['円','えん','まる','yen / lingkaran','百円 (ひゃくえん) — 100 yen'],['万','まん','','sepuluh ribu','一万 (いちまん) — 10.000'],['千','せん','ち','seribu','千円 (せんえん) — 1.000 yen'],['百','ひゃく','','seratus','三百 (さんびゃく) — 300'],['多','た','おお','banyak','多い (おおい) — banyak'],['少','しょう','すこ','sedikit','少し (すこし) — sedikit'],['古','こ','ふる','tua / lama','古い (ふるい) — tua'],['新','しん','あたら','baru','新しい (あたらしい) — baru']]}
];
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
/* ===== BELAJAR MENULIS — bagan huruf seperti halaman pertama buku ===== */
const STEPS_KO = { 'ㄱ':'2 goresan — ① mendatar ke kanan, ② turun dari ujung kanan.','ㄲ':'Tulis ㄱ rapat dua kali (satu huruf tegang).','ㄴ':'2 goresan — ① turun, ② mendatar ke kanan di bawah.','ㄷ':'3 goresan — ① mendatar, ② turun lalu mendatar, ③ mendatar penutup.','ㄸ':'Tulis ㄷ rapat dua kali (tegang).','ㄹ':'5 goresan — bergantian mendatar dan turun, ditutup garis mendatar.','ㅁ':'3 goresan — ① turun kiri, ② mendatar atas + turun kanan, ③ mendatar bawah.','ㅂ':'4 goresan — dua garis turun, dua garis mendatar penghubung.','ㅃ':'Tulis ㅂ rapat dua kali (tegang).','ㅅ':'2 goresan — dari puncak, miring turun ke kiri-bawah lalu ke kanan-bawah.','ㅆ':'Tulis ㅅ rapat dua kali (tegang).','ㅇ':'1 goresan — lingkaran penuh.','ㅈ':'3 goresan — ① mendatar, ② miring turun kiri, ③ miring turun kanan.','ㅉ':'Tulis ㅈ rapat dua kali (tegang).','ㅊ':'4 goresan — garis pendek di atas, lalu seperti ㅈ.','ㅋ':'3 goresan — seperti ㄱ ditambah garis mendatar di tengah.','ㅌ':'4 goresan — seperti ㄷ ditambah garis mendatar di tengah.','ㅍ':'4 goresan — mendatar di atas, dua kaki turun, mendatar penutup.','ㅎ':'3 goresan — garis pendek, mendatar, lalu lingkaran di bawah.','ㅏ':'2 goresan — ① turun, ② garis pendek ke kanan di tengah.','ㅐ':'3 goresan — seperti ㅏ ditambah satu garis turun pendek.','ㅑ':'3 goresan — ㅏ dengan dua garis pendek ke kanan.','ㅒ':'4 goresan — ㅑ ditambah satu garis turun pendek.','ㅓ':'2 goresan — ① turun, ② garis pendek ke kiri di tengah.','ㅔ':'3 goresan — seperti ㅓ ditambah satu garis turun pendek.','ㅕ':'3 goresan — ㅓ dengan dua garis pendek ke kiri.','ㅖ':'4 goresan — ㅕ ditambah satu garis turun pendek.','ㅗ':'2 goresan — ① garis pendek turun, ② mendatar di bawahnya.','ㅛ':'3 goresan — ㅗ dengan dua garis pendek turun.','ㅜ':'2 goresan — ① mendatar, ② garis pendek turun dari tengah bawah.','ㅠ':'3 goresan — ㅜ dengan dua garis pendek turun.','ㅡ':'1 goresan — mendatar.','ㅢ':'2 goresan — ㅡ lalu ㅣ di kanannya.','ㅣ':'1 goresan — turun.','ㅘ':'3 goresan — gabungan ㅗ + ㅏ.','ㅙ':'4 goresan — gabungan ㅗ + ㅐ.','ㅚ':'3 goresan — gabungan ㅗ + ㅣ.','ㅝ':'3 goresan — gabungan ㅜ + ㅓ.','ㅞ':'4 goresan — gabungan ㅜ + ㅔ.','ㅟ':'3 goresan — gabungan ㅜ + ㅣ.' };
const SND_KO_V = { 'ㅏ':'seperti "a" pada "apa"','ㅑ':'"ya" — seperti pada "yakin"','ㅓ':'"eo" — mulut terbuka lebar, bukan "e"','ㅕ':'"yeo"','ㅗ':'"o" bulat — seperti "o" pada "toko"','ㅛ':'"yo"','ㅜ':'"u" — seperti "u" pada "susu"','ㅠ':'"yu"','ㅡ':'"eu" — bibir datar, bunyi dari tenggorokan','ㅣ':'"i" — seperti "i" pada "ini"','ㅐ':'"ae/e" — seperti "e" pada "es", mulut agak terbuka','ㅒ':'"yae"','ㅔ':'"e" — seperti "e" pada "sate"','ㅖ':'"ye"','ㅘ':'"wa"','ㅙ':'"wae"','ㅚ':'"oe" — kira-kira seperti "we"','ㅝ':'"wo"','ㅞ':'"we"','ㅟ':'"wi"','ㅢ':'"ui" — gabungan ㅡ + ㅣ dibaca menyambung' };
const EX_KO_V = { 'ㅏ':['아기','bayi'],'ㅑ':['약','obat'],'ㅓ':['어머니','ibu'],'ㅕ':['여자','perempuan'],'ㅗ':['오늘','hari ini'],'ㅛ':['요리','masakan'],'ㅜ':['우리','kita'],'ㅠ':['유학','belajar di luar negeri'],'ㅡ':['음악','musik'],'ㅣ':['이름','nama'],'ㅐ':['개','anjing'],'ㅒ':['얘기','cerita / obrolan'],'ㅔ':['세계','dunia'],'ㅖ':['시계','jam'],'ㅘ':['과일','buah'],'ㅙ':['왜','kenapa'],'ㅚ':['회사','perusahaan'],'ㅝ':['뭐','apa'],'ㅞ':['웨딩','pernikahan'],'ㅟ':['귀','telinga'],'ㅢ':['의사','dokter'] };
function koLetters() {
  const out = [];
  const consOrder = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  const dblOrder = ['ㄲ','ㄸ','ㅃ','ㅆ','ㅉ'];
  const vokOrder = ['ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ'];
  const vok2Order = ['ㅐ','ㅒ','ㅔ','ㅖ','ㅘ','ㅙ','ㅚ','ㅝ','ㅞ','ㅟ','ㅢ'];
  const cmap = {}; KO_CONS.forEach(r => cmap[r[0]] = r);
  const vmap = {}; KO_VOWELS.forEach(r => vmap[r[0]] = r);
  const parseEx = raw => { const m = String(raw || '').match(/^(.+?) \((.+)\)$/); return m ? [m[1], m[2]] : [raw || '', '']; };
  consOrder.forEach(ch => { const r = cmap[ch]; out.push({ ch, grp: 'Konsonan Dasar (자음)', read: r[1].split('—')[0].trim(), snd: r[1], ex: parseEx(r[2]), steps: STEPS_KO[ch], strokes: (STEPS_KO[ch].match(/^\d+/) || [2])[0] }); });
  dblOrder.forEach(ch => { const r = cmap[ch]; out.push({ ch, grp: 'Konsonan Ganda', read: r[1].split('—')[0].trim(), snd: r[1], ex: parseEx(r[2]), steps: STEPS_KO[ch], strokes: 2 }); });
  vokOrder.forEach(ch => { const r = vmap[ch]; out.push({ ch, grp: 'Vokal Dasar (모음)', read: r[1], snd: SND_KO_V[ch], ex: EX_KO_V[ch], steps: STEPS_KO[ch], strokes: (STEPS_KO[ch].match(/^\d+/) || [1])[0] }); });
  vok2Order.forEach(ch => { const r = vmap[ch]; out.push({ ch, grp: 'Vokal Gabungan', read: r[1], snd: SND_KO_V[ch], ex: EX_KO_V[ch], steps: STEPS_KO[ch], strokes: (STEPS_KO[ch].match(/^\d+/) || [3])[0] }); });
  return out;
}
const HIRA_STROKES = [3,2,2,2,3, 3,4,1,3,2, 3,1,2,3,1, 4,2,1,1,2, 4,3,2,2,1, 3,1,4,1,4, 3,2,3,2,3, 3,2,2, 2,2,1,2,1, 2,3,1];
const KATA_STROKES = [2,2,3,3,3, 2,3,2,3,2, 3,3,2,2,2, 3,3,3,3,2, 2,2,2,3,1, 2,2,1,1,4, 2,3,2,2,3, 2,2,3, 2,2,2,1,3, 2,3,2];
function jaLetters() {
  return JA_KANA.map((r, i) => ({ h: r[0], k: r[1], romaji: r[2].split('·')[0].trim(), ex: r[2].split('·')[1] ? r[2].split('·')[1].trim() : '', strokesH: HIRA_STROKES[i], strokesK: KATA_STROKES[i] }));
}
function traceHTML(ch) {
  return '<div class="trace-box"><div class="sect-label">Latihan menulis langsung — telusuri hurufnya</div><div class="trace-stage"><div class="trace-guide" id="tr-guide">' + esc(ch) + '</div><canvas id="tr-canvas" width="300" height="300" aria-label="Kanvas latihan menulis"></canvas></div>' +
    '<div class="trace-btns"><button type="button" class="btn white" id="tr-clear">Hapus</button><button type="button" class="btn" id="tr-check">Cek</button><button type="button" class="btn white" id="tr-toggle">Sembunyikan contoh</button><button type="button" class="btn white" id="tr-prev">← Sebelumnya</button><button type="button" class="btn white" id="tr-next">Berikutnya →</button><label class="small" style="display:flex;align-items:center;gap:6px"><input type="checkbox" id="tr-seq"> Latihan berurutan</label></div>' +
    '<p id="tr-fb" style="margin-top:8px"></p><p class="small muted">Gambar dengan mouse, jari, atau stylus — halaman tidak ikut bergerak saat kamu menggambar di kanvas. Penilaian sederhana berbasis cakupan goresan & jumlah goresan, bukan pengenal tulisan tangan penuh.</p></div>';
}
function traceScore(canvas, ch, expectedStrokes, userStrokes) {
  try {
    const g0 = canvas.getContext('2d'); if (!g0) return null;
    const w = canvas.width, h = canvas.height;
    const off = document.createElement('canvas'); off.width = w; off.height = h;
    const o = off.getContext('2d'); if (!o) return null;
    o.fillStyle = '#fff'; o.fillRect(0, 0, w, h); o.fillStyle = '#000';
    o.font = '700 190px "Noto Serif KR","Hiragino Sans",sans-serif'; o.textAlign = 'center'; o.textBaseline = 'middle';
    o.fillText(ch, w / 2, h / 2 + 10);
    const gd = o.getImageData(0, 0, w, h).data, ud = g0.getImageData(0, 0, w, h).data;
    let guide = 0, covered = 0;
    for (let y = 0; y < h; y += 3) for (let x = 0; x < w; x += 3) {
      if (gd[(y * w + x) * 4] >= 128) continue;
      guide++;
      let hit = false;
      for (let dy = -5; dy <= 5 && !hit; dy += 2) for (let dx = -5; dx <= 5 && !hit; dx += 2) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < h && ud[(ny * w + nx) * 4 + 3] > 10) hit = true;
      }
      if (hit) covered++;
    }
    let score = guide ? Math.round(covered / guide * 100) : 0, note = '';
    if (expectedStrokes && userStrokes && userStrokes !== +expectedStrokes) { score = Math.min(score, 55); note = ' Jumlah goresanmu ' + userStrokes + ', seharusnya ' + expectedStrokes + ' — perhatikan urutan goresannya.'; }
    if (!userStrokes) { score = 0; note = ' Kanvasnya masih kosong — gambar dulu hurufnya.'; }
    return { score, note };
  } catch (e) { return null; }
}
function bindTrace(c, ch, expectedStrokes, onNav) {
  const canvas = $('#tr-canvas', c); if (!canvas) return;
  const guide = $('#tr-guide', c);
  let drawing = false, strokes = 0, last = null, seq = false;
  const seqBox = $('#tr-seq', c); if (seqBox) seqBox.onchange = () => { seq = seqBox.checked; };
  const ctx = () => { try { return canvas.getContext('2d'); } catch (e) { return null; } };
  const pos = e => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * canvas.width / Math.max(1, r.width), y: (e.clientY - r.top) * canvas.height / Math.max(1, r.height) }; };
  canvas.addEventListener('pointerdown', e => { e.preventDefault(); drawing = true; strokes++; try { canvas.setPointerCapture(e.pointerId); } catch (_) {} last = pos(e); const g = ctx(); if (g) { g.strokeStyle = '#181513'; g.lineWidth = 11; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(last.x + 0.1, last.y + 0.1); g.stroke(); } });
  canvas.addEventListener('pointermove', e => { if (!drawing) return; e.preventDefault(); const g = ctx(); if (!g) return; const pt = pos(e); g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(pt.x, pt.y); g.stroke(); last = pt; });
  ['pointerup', 'pointercancel'].forEach(ev => canvas.addEventListener(ev, () => { drawing = false; }));
  const clear = $('#tr-clear', c); if (clear) clear.onclick = () => { const g = ctx(); if (g) g.clearRect(0, 0, canvas.width, canvas.height); strokes = 0; const fb = $('#tr-fb', c); if (fb) fb.innerHTML = ''; };
  const tog = $('#tr-toggle', c); if (tog && guide) tog.onclick = () => { const hidden = guide.style.visibility === 'hidden'; guide.style.visibility = hidden ? 'visible' : 'hidden'; tog.textContent = hidden ? 'Sembunyikan contoh' : 'Tampilkan contoh'; };
  const chk = $('#tr-check', c); if (chk) chk.onclick = () => {
    const fb = $('#tr-fb', c); const res = traceScore(canvas, ch, expectedStrokes, strokes);
    if (!res) { fb.innerHTML = 'Peramban ini tidak mendukung penilaian kanvas — tetap latihan ya, bandingkan gambarmu dengan huruf contoh di atasnya.'; return; }
    if (res.score >= 60) { fb.innerHTML = '<span style="color:var(--green)"><b>Bagus! Skor ' + res.score + '/100.</b></span>' + esc(res.note); awardBonus(1, 'menulis-aksara'); if (seq && onNav) setTimeout(() => onNav(1), 900); }
    else fb.innerHTML = '<span style="color:var(--red)"><b>Coba lagi — skor ' + res.score + '/100.</b></span> Telusuri garis contohnya pelan-pelan.' + esc(res.note);
  };
  const pv = $('#tr-prev', c); if (pv && onNav) pv.onclick = () => onNav(-1);
  const nx = $('#tr-next', c); if (nx && onNav) nx.onclick = () => onNav(1);
}
let scriptSel = 0, scriptQ = '', scriptCvTarget = 'h';
function pageScript(c) {
  LS().flags.script = 1; save();
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
    const letters = koLetters();
    const syllableOf = it => it.grp.indexOf('Vokal') === 0 || it.grp === 'Vokal Gabungan' ? composeHangulString('ㅇ' + it.ch) : composeHangulString(it.ch + 'ㅏ');
    const drawDetail = () => {
      const it = letters[scriptSel];
      const d = $('#script-detail', c); if (!d) return;
      d.innerHTML = '<div class="card"><div class="sect-label" style="margin-top:0">Detail huruf — ' + esc(it.grp) + '</div>' +
        '<div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start"><div class="script-big">' + esc(it.ch) + '</div><div style="flex:1;min-width:230px">' +
        '<p><b>Cara baca:</b> ' + esc(it.read) + ' — ' + esc(it.snd) + '</p>' +
        '<p style="margin-top:6px"><b>Cara penulisan (urutan goresan):</b> ' + esc(it.steps) + '</p>' +
        '<p style="margin-top:6px"><b>Pengucapan:</b> ' + ttsBtn(syllableOf(it), '🔊 Dengarkan bunyinya (' + esc(syllableOf(it)) + ')') + '</p>' +
        '<p style="margin-top:6px"><b>Contoh kata:</b> ' + esc(it.ex[0]) + ' = ' + esc(it.ex[1]) + ' ' + ttsBtn(it.ex[0], '🔊') + '</p>' +
        '<p style="margin-top:6px"><b>Merangkai:</b> ' + esc(it.ch) + ' masuk ke blok suku kata — contoh suku katanya: <b>' + esc(syllableOf(it)) + '</b>.</p></div></div>' +
        traceHTML(it.ch) +
        '<div class="sect-label">Tulis dari bunyi</div><p class="small muted">Dengarkan bunyi suku katanya, lalu pilih huruf yang benar:</p><div style="margin-top:8px">' + ttsBtn(syllableOf(it), '🔊 Putar bunyi') + '</div><div class="chiprow" id="sb-opts" style="margin-top:10px"></div><p class="small" id="sb-fb" style="margin-top:6px"></p></div>';
      bindTrace(c, it.ch, it.strokes, d2 => { scriptSel = (scriptSel + d2 + letters.length) % letters.length; drawAll(); });
      const pool = letters.filter(x => x.grp === it.grp && x.ch !== it.ch);
      const opts = shuffle(pool.map((x, i) => i), scriptSel + 3).slice(0, 3).map(i => pool[i]).concat([it]);
      $('#sb-opts', d).innerHTML = shuffle(opts.map((x, i) => i), scriptSel + 9).map(i => '<button type="button" class="chip" data-sb="' + esc(opts[i].ch) + '">' + esc(opts[i].ch) + '</button>').join('');
      $$('[data-sb]', d).forEach(b => b.onclick = () => { const fb = $('#sb-fb', d); if (b.dataset.sb === it.ch) { fb.innerHTML = '<span style="color:var(--green)"><b>Betul!</b> Itu huruf ' + esc(it.ch) + '.</span>'; awardBonus(1, 'tulis-dari-bunyi'); } else fb.innerHTML = '<span style="color:var(--red)"><b>Belum tepat</b> — dengarkan lagi bunyinya.</span>'; });
    };
    const drawAll = () => {
      const q = scriptQ.toLowerCase();
      $$('[data-sel]', c).forEach(b => { const it = letters[+b.dataset.sel]; const show = !q || (it.ch + ' ' + it.read + ' ' + it.ex[0]).toLowerCase().includes(q); b.style.display = show ? '' : 'none'; b.classList.toggle('active', +b.dataset.sel === scriptSel); });
      drawDetail();
    };
    const groups = ['Konsonan Dasar (자음)', 'Konsonan Ganda', 'Vokal Dasar (모음)', 'Vokal Gabungan'];
    c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Belajar Menulis & Pengucapan — Hangul Lengkap</h1><p class="sub">Seperti halaman pertama buku pelajaran Bahasa Korea: bagan huruf lengkap dulu — klik huruf mana pun untuk urutan goresan, pengucapan, contoh kata, dan latihan menulisnya. Suara pengucapannya langsung berbunyi saat huruf diketuk.</p>' +
      '<div class="searchbox" style="max-width:none;margin-top:14px"><span>🔍</span><input id="sc-q" type="search" placeholder="Cari huruf, cara baca, atau contoh kata…" value="' + esc(scriptQ) + '"></div>' +
      groups.map(g => '<div class="sect-label">' + g + ' — ' + letters.filter(x => x.grp === g).length + ' huruf</div><div class="char-grid">' + letters.map((it, i) => it.grp === g ? '<button type="button" class="char-cell' + (i === scriptSel ? ' active' : '') + '" data-sel="' + i + '"><b>' + esc(it.ch) + '</b><small>' + esc(it.read) + '</small></button>' : '').join('') + '</div>').join('') +
      '<div id="script-detail" style="margin-top:16px"></div>' +
      '<div class="grid2" style="margin-top:16px;align-items:start"><div class="card"><div class="sect-label" style="margin-top:0">Merangkai blok suku kata + Batchim</div><p>ㄱ + ㅏ = 가 (ga) · ㄱ + ㅏ + ㅁ = 감 (gam — ㅁ jadi batchim di bawah). Vokal tegak (ㅏ ㅓ ㅣ) ditulis di KANAN konsonan; vokal rebah (ㅗ ㅜ ㅡ) ditulis di BAWAH konsonan.</p><p style="margin-top:8px"><b>Batchim:</b> konsonan akhir di bawah blok, mis. 한 (han), 읽 (ilg — batchim ganda ㄺ). Batchim ganda: ㄳ ㄵ ㄶ ㄺ ㄻ ㄼ ㄽ ㄾ ㄿ ㅀ ㅄ. Bila sesudah batchim ada vokal, batchim PINDAH jadi awal suku kata berikutnya: 먹어 → 머거. Coba di keyboard virtual halaman kuis/dikte: ketik ㅅㅏㄱㅗㅏ menjadi 사과.</p></div>' +
      '<div class="card"><div class="sect-label" style="margin-top:0">Urutan goresan — aturan umum</div><p>Dari kiri ke kanan, dari atas ke bawah. Angka urutan ada di penjelasan tiap huruf (klik hurufnya di bagan atas). Di kanvas latihan, telusuri huruf contoh yang pudar dan tekan Cek untuk melihat skor cakupan goresanmu.</p></div></div></div>';
    $$('[data-sel]', c).forEach(b => b.onclick = () => { scriptSel = +b.dataset.sel; speak(syllableOf(letters[scriptSel]), b); drawAll(); });
    $('#sc-q', c).addEventListener('input', e => { scriptQ = e.target.value; drawAll(); });
    drawAll();
    return;
  }
  const letters = jaLetters();
  const ROWS = [5, 5, 5, 5, 5, 5, 5, 3, 5, 3];
  let offset = 0; const rowIdx = [];
  ROWS.forEach(n => { const arr = []; for (let i = 0; i < n; i++) arr.push(offset++); rowIdx.push(arr); });
  const drawDetailJA = () => {
    const it = letters[scriptSel];
    const d = $('#script-detail', c); if (!d) return;
    const ch = scriptCvTarget === 'k' ? it.k : it.h;
    const stk = scriptCvTarget === 'k' ? it.strokesK : it.strokesH;
    d.innerHTML = '<div class="card"><div class="sect-label" style="margin-top:0">Detail kana — romaji "' + esc(it.romaji) + '"</div>' +
      '<div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start"><div class="script-big">' + esc(it.h) + ' <span style="color:var(--ink-2)">' + esc(it.k) + '</span></div><div style="flex:1;min-width:230px">' +
      '<p><b>Cara baca:</b> "' + esc(it.romaji) + '" — ucapkan seperti bunyi Indonesianya, pendek dan jelas.</p>' +
      '<p style="margin-top:6px"><b>Cara penulisan (urutan goresan):</b> Hiragana ' + it.strokesH + ' goresan · Katakana ' + it.strokesK + ' goresan — selalu dari atas ke bawah, kiri ke kanan, ikuti urutan angkanya ①②③ sampai selesai.</p>' +
      '<p style="margin-top:6px"><b>Pengucapan:</b> ' + ttsBtn(it.h, '🔊 Dengarkan (' + esc(it.h) + ')') + '</p>' +
      '<p style="margin-top:6px"><b>Contoh kata:</b> ' + esc(it.ex) + ' ' + ttsBtn(it.h, '🔊') + '</p></div></div>' +
      '<div class="chiprow" style="margin-top:10px"><button type="button" class="chip' + (scriptCvTarget === 'h' ? ' active' : '') + '" data-cv="h">Latih Hiragana ' + esc(it.h) + '</button><button type="button" class="chip' + (scriptCvTarget === 'k' ? ' active' : '') + '" data-cv="k">Latih Katakana ' + esc(it.k) + '</button></div>' +
      traceHTML(ch) +
      '<div class="sect-label">Tulis dari bunyi</div><p class="small muted">Dengarkan bunyinya, lalu pilih kana yang benar:</p><div style="margin-top:8px">' + ttsBtn(it.h, '🔊 Putar bunyi') + '</div><div class="chiprow" id="sb-opts" style="margin-top:10px"></div><p class="small" id="sb-fb" style="margin-top:6px"></p></div>';
    $$('[data-cv]', d).forEach(b => b.onclick = () => { scriptCvTarget = b.dataset.cv; drawDetailJA(); });
    bindTrace(c, ch, stk, d2 => { scriptSel = (scriptSel + d2 + letters.length) % letters.length; drawAllJA(); });
    const pool = letters.filter((x, i) => i !== scriptSel);
    const opts = shuffle(pool.map((x, i) => i), scriptSel + 3).slice(0, 3).map(i => pool[i]).concat([it]);
    $('#sb-opts', d).innerHTML = shuffle(opts.map((x, i) => i), scriptSel + 9).map(i => '<button type="button" class="chip" data-sb="' + esc(opts[i].h) + '">' + esc(opts[i].h) + ' / ' + esc(opts[i].k) + '</button>').join('');
    $$('[data-sb]', d).forEach(b => b.onclick = () => { const fb = $('#sb-fb', d); if (b.dataset.sb === it.h) { fb.innerHTML = '<span style="color:var(--green)"><b>Betul!</b> Itu kana "' + esc(it.romaji) + '".</span>'; awardBonus(1, 'tulis-dari-bunyi'); } else fb.innerHTML = '<span style="color:var(--red)"><b>Belum tepat</b> — dengarkan lagi bunyinya.</span>'; });
  };
  const drawAllJA = () => {
    const q = scriptQ.toLowerCase();
    $$('[data-sel]', c).forEach(b => { const it = letters[+b.dataset.sel]; const show = !q || (it.h + it.k + it.romaji).toLowerCase().includes(q); b.style.display = show ? '' : 'none'; b.classList.toggle('active', +b.dataset.sel === scriptSel); });
    drawDetailJA();
  };
  const gojuTable = key => rowIdx.map(row => '<tr>' + row.map(i => { const it = letters[i]; return '<td><button type="button" class="goju-cell' + (i === scriptSel ? ' active' : '') + '" data-sel="' + i + '"><b>' + esc(it[key]) + '</b><small>' + esc(it.romaji) + '</small></button></td>'; }).join('') + (row.length < 5 ? '<td colspan="' + (5 - row.length) + '"></td>' : '') + '</tr>').join('');
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Belajar Menulis & Pengucapan — Kana & Kanji</h1><p class="sub">Seperti halaman pertama buku pelajaran Bahasa Jepang: tabel Gojuon (五十音) lengkap — Hiragana, Katakana, dan Kanji dipisah jadi tiga tabel supaya tidak tertukar. Klik kana mana pun untuk urutan goresan, pengucapan, contoh kata, dan latihan menulisnya. Suara pengucapannya langsung berbunyi saat huruf diketuk.</p>' +
    '<div class="searchbox" style="max-width:none;margin-top:14px"><span>🔍</span><input id="sc-q" type="search" placeholder="Cari kana atau romaji…" value="' + esc(scriptQ) + '"></div>' +
    '<div class="card" style="margin-top:16px;overflow-x:auto"><div class="sect-label" style="margin-top:0">Tabel Hiragana — huruf asli Jepang</div><p class="small muted">Dipakai untuk kata asli Jepang, partikel, dan akhiran kata kerja.</p><table class="tbl gojuon"><tr><th>a</th><th>i</th><th>u</th><th>e</th><th>o</th></tr>' + gojuTable('h') + '</table></div>' +
    '<div class="card" style="margin-top:16px;overflow-x:auto"><div class="sect-label" style="margin-top:0">Tabel Katakana — huruf untuk kata pinjaman & nama asing</div><p class="small muted">Dipakai untuk kata serapan (コーヒー kopi), nama orang/tempat asing, dan penekanan.</p><table class="tbl gojuon"><tr><th>a</th><th>i</th><th>u</th><th>e</th><th>o</th></tr>' + gojuTable('k') + '</table></div>' +
    '<div id="script-detail" style="margin-top:16px"></div>' +
    '<div class="card" style="margin-top:16px"><div class="sect-label" style="margin-top:0">Dakuten, handakuten, kana kecil, pemanjang</div><p><b>Dakuten ゛</b> mengubah bunyi: か→が, さ→ざ, た→だ, は→ば. <b>Handakuten ゜</b>: は→ぱ. <b>Kana kecil</b> ぁぃぅぇぉ ゃゅょ っ: っ (tsu kecil) = jeda/geminasi (ずっと), ゃゅょ membuat bunyi gabungan (きゃ kya). <b>Pemanjangan vokal:</b> Hiragana menambah vokal (おかあさん), Katakana memakai ー (ケーキ keeki).</p><div class="sect-label">Kapan pakai huruf apa?</div><p>Hiragana: partikel, akhiran kata kerja, kata asli tanpa Kanji umum. Katakana: kata pinjaman (コーヒー kopi), nama orang/tempat asing, efek tegas. Kanji: hemat tempat & membedakan homofon — belajar bertahap dari 19 kanji dasar di tabel Kanji di bawah.</p></div>' +
    '<div class="card" style="margin-top:16px"><div class="sect-label" style="margin-top:0">Tabel Kanji — 103 kanji JLPT N5</div><p class="small muted">Huruf yang diambil dari bahasa Tionghoa — satu kanji bisa punya beberapa cara baca. Klik kanji untuk mendengar cara bacanya.</p>' + JA_KANJI.map(g => '<div class="sect-label">' + g.cat + ' — ' + g.items.length + ' kanji</div><div class="char-grid">' + g.items.map(r => '<button type="button" class="char-cell" data-ch2="' + r[0] + '">' + strokeAnim(r[0], r[1] + (r[2] ? ' / ' + r[2] : '') + ' — ' + r[3]) + '<small>' + esc(r[4]) + '</small></button>').join('') + '</div>').join('') + '</div></div>';
  $$('[data-sel]', c).forEach(b => b.onclick = () => { scriptSel = +b.dataset.sel; speak(letters[scriptSel].h, b); drawAllJA(); });
  $$('[data-ch2]', c).forEach(b => b.onclick = () => speak(b.dataset.ch2, b));
  $('#sc-q', c).addEventListener('input', e => { scriptQ = e.target.value; drawAllJA(); });
  drawAllJA();
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
      const approx = pct >= 93 ? 'Mahir' : pct >= 85 ? 'C2' : pct >= 70 ? 'C1' : pct >= 55 ? 'B2' : pct >= 40 ? 'B1' : pct >= 28 ? 'A2' : pct >= 16 ? 'A1' : pct >= 7 ? 'A0' : 'Nol';
      lvl = approx;
      LS().placement = lvl; save();
      if (sb && S.user) { try { sb.from('placement_results').insert({ user_id: S.user.id, language_code: S.lang, level: lvl, score: pct }); } catch (e) {} }
      cc.innerHTML = '<div class="wrap"><div class="card" style="max-width:560px;margin:30px auto;text-align:center"><div class="sect-label">Level kamu</div><h1 class="page">' + lvl + '</h1><p class="muted">Skor ' + pct + '% (' + ok + '/' + total + '). Jalur belajarmu disesuaikan ke level ini — kamu tetap bisa membuka modul level mana pun.</p><button type="button" class="btn" style="margin-top:14px" id="pl-mods">' + (lvl === 'Nol' ? 'Mulai dari Nol' : lvl === 'Mahir' ? 'Ke jenjang Mahir Sekali' : 'Lihat modulku') + ' →</button></div></div>';
      $('#pl-mods', cc).onclick = () => go(lvl === 'Nol' ? 'nol' : lvl === 'Mahir' ? 'mahir' : 'modules');
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
    if (kind.startsWith('mock')) { const m = DG.mocks[+kind.slice(4) || 0]; title = m.name; qs = m.questions.map(q => ({ type: 'mc', prompt: q[0], options: q[1], answer: q[2], context: 'Soal mock test ujian Bahasa Inggris — situasinya ada di kalimat/teks soalnya. Baca utuh dulu, lalu pilih jawaban yang paling tepat untuk situasi itu.', explain: q[3] })); }
    if (kind === 'topik1' || kind === 'topik2') { const bank = kind === 'topik1' ? DG.topik1 : DG.topik2; title = kind === 'topik1' ? 'TOPIK I — Simulasi' : 'TOPIK II — Simulasi'; qs = shuffle(bank, 5).slice(0, 10).map(q => ({ type: 'mc', prompt: q[0], options: q[1], answer: q[2], context: 'Soal simulasi TOPIK — kata atau pola di dalam kalimat Korea itu sedang ditanyakan. Baca kalimatnya utuh dulu, lalu pilih jawaban yang paling tepat.', explain: q[3] + (q[4] ? ' ' + q[4] : '') })); }
    if (kind === 'komockL' || kind === 'komockR') { const bank = kind === 'komockL' ? DG.komockL : DG.komockR; title = kind === 'komockL' ? 'TOPIK Mock — Listening' : 'TOPIK Mock — Reading'; qs = bank.map(q => ({ type: 'mc', prompt: q[0], options: q[1], answer: q[2], context: kind === 'komockL' ? 'Soal listening TOPIK — bayangkan kamu mendengar percakapan itu di situasi nyata, perhatikan angka dan kata kuncinya, lalu jawab maksudnya.' : 'Soal reading TOPIK — baca teks pendeknya kata per kata; jawaban yang benar tertulis di dalam teks itu.', explain: q[3] + (q[4] ? ' ' + q[4] : '') })); }
    if (kind === 'jlpt') { qs = shuffle(DG.jlpt, 9).slice(0, 12).map(q => ({ type: 'mc', prompt: (q.passage ? q.passage + ' — ' : '') + q.q + ' (' + q.level + ' · ' + q.skill + ')', options: q.options, answer: q.answer, context: 'Soal simulasi JLPT ' + q.level + ' (' + q.skill + ') — baca teks Jepangnya pelan-pelan, cari kata kunci yang ditanyakan, lalu pilih jawaban yang paling tepat.', explain: q.explain })); title = 'JLPT — Simulasi'; }
    runQuiz(c, { routeName: 'exams', skill: kind === 'komockL' ? 'listen' : 'read', tag: title, title: 'SIMULASI · ' + title.toUpperCase(), sub: 'Mode latihan: pembahasan muncul setelah tiap jawaban. Target 70%.', questions: qs,
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
/* ===== FRASA SEHARI-HARI — 100 frasa wajib per bahasa (PERBAIKAN2) =====
   24 frasa inti per bahasa ditulis khusus per kategori (salam, belanja,
   makan, arah, darurat, telepon, hotel, rumah sakit) + frasa/kata wajib
   dari 500 kata inti (dengan contoh kalimatnya) sampai genap 100. */
const PHRASES_AUTHORED = {
en: [["Good morning!","Selamat pagi!","Good morning! Did you sleep well?","Selamat pagi! Tidurmu nyenyak?","Salam & Perkenalan"],["My name is Didi.","Nama saya Didi.","Hello, my name is Didi.","Halo, nama saya Didi.","Salam & Perkenalan"],["See you later!","Sampai jumpa lagi!","I have to go now. See you later!","Saya harus pergi sekarang. Sampai jumpa lagi!","Salam & Perkenalan"],["How much is this?","Berapa harga ini?","Excuse me, how much is this bag?","Permisi, berapa harga tas ini?","Belanja"],["It is too expensive.","Ini terlalu mahal.","It is too expensive for me.","Ini terlalu mahal untuk saya.","Belanja"],["Can I pay by card?","Bisa bayar pakai kartu?","Can I pay by card, please?","Bisa bayar pakai kartu?","Belanja"],["I am hungry.","Saya lapar.","I am hungry, let us eat.","Saya lapar, ayo makan.","Makan & Minum"],["It is delicious!","Ini enak sekali!","This soup is delicious!","Sup ini enak sekali!","Makan & Minum"],["Water, please.","Air putih, tolong.","Water, please. I am thirsty.","Air putih, tolong. Saya haus.","Makan & Minum"],["Where is the station?","Di mana stasiunnya?","Excuse me, where is the station?","Permisi, di mana stasiunnya?","Tanya Arah"],["Turn left, please.","Belok kiri, tolong.","Turn left at the corner, please.","Belok kiri di ujung jalan, tolong.","Tanya Arah"],["Is it far from here?","Apakah jauh dari sini?","Is it far from here to the market?","Apakah pasar jauh dari sini?","Tanya Arah"],["Help me, please!","Tolong saya!","Help me, please! I am lost.","Tolong saya! Saya tersesat.","Darurat"],["Call the police!","Panggil polisi!","Call the police, quickly!","Panggil polisi, cepat!","Darurat"],["I am sick.","Saya sakit.","I am sick and I need a doctor.","Saya sakit dan butuh dokter.","Darurat"],["Hello, who is this?","Halo, ini siapa?","Hello, who is this? Is Ani there?","Halo, ini siapa? Ada Ani?","Telepon"],["Please speak slowly.","Tolong bicara pelan-pelan.","Please speak slowly, I am learning.","Tolong bicara pelan-pelan, saya masih belajar.","Telepon"],["I will call you back.","Saya telepon balik nanti.","I will call you back tonight.","Saya telepon balik malam ini.","Telepon"],["I have a reservation.","Saya sudah reservasi.","Hello, I have a reservation for tonight.","Halo, saya sudah reservasi untuk malam ini.","Hotel"],["What is the Wi-Fi password?","Apa kata sandi Wi-Fi-nya?","Excuse me, what is the Wi-Fi password?","Permisi, apa kata sandi Wi-Fi-nya?","Hotel"],["Check out, please.","Saya mau check out.","Check out, please. Room 203.","Saya mau check out. Kamar 203.","Hotel"],["My head hurts.","Kepala saya sakit.","My head hurts since morning.","Kepala saya sakit sejak pagi.","Rumah Sakit"],["I need medicine.","Saya butuh obat.","I need medicine for my fever.","Saya butuh obat untuk demam saya.","Rumah Sakit"],["Where is the hospital?","Di mana rumah sakitnya?","Please tell me, where is the hospital?","Tolong beritahu saya, di mana rumah sakitnya?","Rumah Sakit"]],
ko: [["안녕하세요","halo (sopan)","안녕하세요, 처음 뵙겠습니다.","Halo, senang bertemu pertama kali.","Salam & Perkenalan"],["제 이름은 디디예요","nama saya Didi","안녕하세요, 제 이름은 디디예요.","Halo, nama saya Didi.","Salam & Perkenalan"],["또 만나요","sampai jumpa lagi","내일 또 만나요.","Sampai jumpa lagi besok.","Salam & Perkenalan"],["이거 얼마예요?","ini berapa harganya?","실례합니다, 이거 얼마예요?","Permisi, ini berapa harganya?","Belanja"],["너무 비싸요","terlalu mahal","이 가방은 너무 비싸요.","Tas ini terlalu mahal.","Belanja"],["카드로 낼 수 있어요?","bisa bayar pakai kartu?","저, 카드로 낼 수 있어요?","Maaf, bisa bayar pakai kartu?","Belanja"],["배고파요","saya lapar","배고파요, 밥 먹어요.","Saya lapar, ayo makan.","Makan & Minum"],["맛있어요!","enak sekali!","이 김치찌개 정말 맛있어요!","Kimchi jjigae ini benar-benar enak!","Makan & Minum"],["물 주세요","tolong air putih","저기요, 물 주세요.","Permisi, tolong air putih.","Makan & Minum"],["역이 어디예요?","di mana stasiunnya?","실례합니다, 역이 어디예요?","Permisi, di mana stasiunnya?","Tanya Arah"],["왼쪽으로 가세요","pergilah ke kiri","저기에서 왼쪽으로 가세요.","Dari sana pergilah ke kiri.","Tanya Arah"],["여기서 멀어요?","apakah jauh dari sini?","시장이 여기서 멀어요?","Apakah pasar jauh dari sini?","Tanya Arah"],["도와주세요!","tolong saya!","도와주세요! 길을 잃었어요.","Tolong saya! Saya tersesat.","Darurat"],["경찰을 불러 주세요","tolong panggilkan polisi","빨리 경찰을 불러 주세요.","Cepat tolong panggilkan polisi.","Darurat"],["아파요","saya sakit","머리가 아파요.","Kepala saya sakit.","Darurat"],["여보세요","halo (di telepon)","여보세요, 아니 있어요?","Halo, ada Ani?","Telepon"],["천천히 말해 주세요","tolong bicara pelan-pelan","한국어를 배우고 있어요. 천천히 말해 주세요.","Saya sedang belajar Bahasa Korea. Tolong bicara pelan-pelan.","Telepon"],["다시 전화할게요","saya telepon balik nanti","지금 바빠요. 다시 전화할게요.","Sekarang saya sibuk. Saya telepon balik nanti.","Telepon"],["예약했어요","saya sudah reservasi","안녕하세요, 예약했어요.","Halo, saya sudah reservasi.","Hotel"],["와이파이 비밀번호가 뭐예요?","apa kata sandi Wi-Fi-nya?","실례합니다, 와이파이 비밀번호가 뭐예요?","Permisi, apa kata sandi Wi-Fi-nya?","Hotel"],["체크아웃 할게요","saya mau check out","체크아웃 할게요. 203호예요.","Saya mau check out. Kamar 203.","Hotel"],["머리가 아파요","kepala saya sakit","아침부터 머리가 아파요.","Sejak pagi kepala saya sakit.","Rumah Sakit"],["약이 필요해요","saya butuh obat","열이 나서 약이 필요해요.","Saya demam, jadi butuh obat.","Rumah Sakit"],["병원이 어디예요?","di mana rumah sakitnya?","병원이 어디예요? 빨리 가야 해요.","Di mana rumah sakitnya? Harus cepat pergi.","Rumah Sakit"]],
ja: [["おはようございます","selamat pagi (sopan)","おはようございます、先生。","Selamat pagi, Guru.","Salam & Perkenalan"],["私の名前はディディです","nama saya Didi","はじめまして。私の名前はディディです。","Senang bertemu. Nama saya Didi.","Salam & Perkenalan"],["また会いましょう","sampai jumpa lagi","明日また会いましょう。","Sampai jumpa lagi besok.","Salam & Perkenalan"],["これはいくらですか","ini berapa harganya?","すみません、これはいくらですか。","Permisi, ini berapa harganya?","Belanja"],["高すぎます","terlalu mahal","このかばんは高すぎます。","Tas ini terlalu mahal.","Belanja"],["カードで払えますか","bisa bayar pakai kartu?","カードで払えますか。","Bisa bayar pakai kartu?","Belanja"],["お腹がすきました","saya lapar","お腹がすきました。食べましょう。","Saya lapar. Ayo makan.","Makan & Minum"],["おいしいです！","enak sekali!","このスープはおいしいです！","Sup ini enak sekali!","Makan & Minum"],["お水をください","tolong air putih","すみません、お水をください。","Permisi, tolong air putih.","Makan & Minum"],["駅はどこですか","di mana stasiunnya?","すみません、駅はどこですか。","Permisi, di mana stasiunnya?","Tanya Arah"],["左へ行ってください","pergilah ke kiri","あそこで左へ行ってください。","Di sana pergilah ke kiri.","Tanya Arah"],["ここから遠いですか","apakah jauh dari sini?","市場はここから遠いですか。","Apakah pasar jauh dari sini?","Tanya Arah"],["助けてください！","tolong saya!","助けてください！道に迷いました。","Tolong saya! Saya tersesat.","Darurat"],["警察を呼んでください","tolong panggilkan polisi","早く警察を呼んでください。","Cepat tolong panggilkan polisi.","Darurat"],["気分が悪いです","saya tidak enak badan","気分が悪いです。医者が必要です。","Saya tidak enak badan. Butuh dokter.","Darurat"],["もしもし","halo (di telepon)","もしもし、アニさんはいますか。","Halo, ada Ani?","Telepon"],["ゆっくり話してください","tolong bicara pelan-pelan","日本語を勉強しています。ゆっくり話してください。","Saya sedang belajar Bahasa Jepang. Tolong bicara pelan-pelan.","Telepon"],["かけ直します","saya telepon balik nanti","今忙しいです。かけ直します。","Sekarang sibuk. Saya telepon balik nanti.","Telepon"],["予約しました","saya sudah reservasi","こんにちは、予約しました。","Halo, saya sudah reservasi.","Hotel"],["Wi-Fiのパスワードは何ですか","apa kata sandi Wi-Fi-nya?","すみません、Wi-Fiのパスワードは何ですか。","Permisi, apa kata sandi Wi-Fi-nya?","Hotel"],["チェックアウトをお願いします","saya mau check out","チェックアウトをお願いします。203号室です。","Saya mau check out. Kamar 203.","Hotel"],["頭が痛いです","kepala saya sakit","朝から頭が痛いです。","Sejak pagi kepala saya sakit.","Rumah Sakit"],["薬が必要です","saya butuh obat","熱があるので薬が必要です。","Saya demam, jadi butuh obat.","Rumah Sakit"],["病院はどこですか","di mana rumah sakitnya?","病院はどこですか。急いでいます。","Di mana rumah sakitnya? Saya sedang buru-buru.","Rumah Sakit"]]
};
const _frasaCache = {};
function frasaList(L) {
  if (_frasaCache[L]) return _frasaCache[L];
  const out = PHRASES_AUTHORED[L].slice();
  const seen = new Set(out.map(f => f[0]));
  for (const w of DG.core[L]) {
    if (out.length >= 100) break;
    if (!w[2] || !w[3] || seen.has(w[0])) continue;
    seen.add(w[0]);
    out.push([w[0], String(w[1]).split('—')[0].trim(), w[2], w[3], 'Wajib Sehari-hari']);
  }
  _frasaCache[L] = out;
  return out;
}
window.frasaList = frasaList;
let frasaQ = '', frasaCat = '';
function pageFrasa(c) {
  const all = frasaList(S.lang);
  const cats = [...new Set(all.map(f => f[4]))];
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Frasa Sehari-hari — ' + LANGMETA[S.lang].name + '</h1><p class="sub">' + all.length + ' frasa wajib: salam, belanja, makan, tanya arah, darurat, telepon, hotel, rumah sakit. Tiap frasa ada arti + contoh kalimat + audio. Arti ditampilkan berdampingan supaya bisa langsung diperiksa.</p>' +
    '<div class="card" style="margin-top:16px"><div class="sect-label" style="margin-top:0">Kartu Hafalan Frasa</div><p class="muted" style="margin-bottom:10px">Untuk apa: melatih frasa utuh sampai reflek — bukan kata lepas. Satu kartu, satu frasa.</p><button type="button" class="btn" id="fr-start">Mulai kartu hafalan frasa →</button></div>' +
    '<div class="searchbox" style="max-width:none;margin-top:16px"><span>🔍</span><input id="fr-q" type="search" placeholder="Cari frasa atau arti…" value="' + esc(frasaQ) + '"></div>' +
    '<div class="chiprow" style="margin-top:12px"><button type="button" class="chip' + (!frasaCat ? ' active' : '') + '" data-fcat="">Semua</button>' + cats.map(cat => '<button type="button" class="chip' + (frasaCat === cat ? ' active' : '') + '" data-fcat="' + esc(cat) + '">' + esc(cat) + '</button>').join('') + '</div><div id="fr-list"></div></div>';
  const draw = () => {
    const q = frasaQ.toLowerCase();
    const list = all.filter(f => (!frasaCat || f[4] === frasaCat) && (!q || (f[0] + ' ' + f[1]).toLowerCase().includes(q)));
    $('#fr-list', c).innerHTML = '<p class="small muted" style="margin:12px 0 8px">' + list.length + ' frasa</p><div class="card" style="padding:6px 20px">' +
      list.map((f, fi) => '<div class="sent-line"><b>' + esc(f[0]) + '</b> ' + ttsBtn(f[0]) + ' <button type="button" class="btn white small" data-add-cust="' + fi + '">＋ Kartu hafalan</button> <span class="muted">— ' + esc(f[1]) + '</span> <span class="chip">' + esc(f[4]) + '</span><small>' + esc(f[2]) + ' · ' + esc(f[3]) + '</small></div>').join('') + '</div>';
    $$('[data-add-cust]', c).forEach(b => b.onclick = () => { const f = list[+b.dataset.addCust]; if (f) addToSRS(f, 'frasa'); });
  };
  $('#fr-q', c).addEventListener('input', e => { frasaQ = e.target.value; draw(); });
  $$('[data-fcat]', c).forEach(b => b.onclick = () => { frasaCat = b.dataset.fcat; pageFrasa(c); });
  draw();
  $('#fr-start', c).onclick = () => {
    let i = 0, flipped = false, known = 0;
    const deck = all.slice();
    const drawCard = () => {
      const f = deck[i];
      c.innerHTML = '<div class="wrap">' + crumb([['Beranda', 'home'], ['Frasa Sehari-hari', 'frasa'], ['Kartu Hafalan Frasa']]) + '<div class="card" style="max-width:680px;margin:14px auto 0">' +
        (!flipped
          ? '<div class="fc-word">' + esc(f[0]) + '</div><div class="fc-center">' + ttsBtn(f[0], '🔊 Dengar frasanya') + '<div style="margin-top:14px"><button type="button" class="btn" id="fr-flip">Tampilkan arti</button></div></div>'
          : '<div class="fc-center"><span class="qtype">Arti</span><div class="fc-word" style="padding-top:14px">' + esc(f[1]) + '</div><div class="contoh-box"><span class="qtype">Contoh</span><p style="margin-top:6px"><b>' + esc(f[2]) + '</b></p><p class="muted">' + esc(f[3]) + '</p></div><div class="quiz-actions" style="justify-content:center"><button type="button" class="btn white" id="fr-forgot">Lupa — ulang lagi</button><button type="button" class="btn" id="fr-know">Ingat →</button></div></div>') +
        '</div><p class="small muted" style="text-align:center;margin-top:10px">Kartu ' + (i + 1) + '/' + deck.length + ' · ' + known + ' diingat</p></div>';
      bindCrumb(c);
      const fl = $('#fr-flip', c); if (fl) fl.onclick = () => { flipped = true; drawCard(); };
      const kn = $('#fr-know', c); if (kn) kn.onclick = () => { known++; awardBonus(1, 'frasa'); next(); };
      const fg = $('#fr-forgot', c); if (fg) fg.onclick = () => next();
      function next() { i++; flipped = false; if (i >= deck.length) { c.innerHTML = '<div class="wrap"><div class="card" style="max-width:560px;margin:30px auto;text-align:center"><div class="sect-label">Selesai</div><h1 class="page">Frasa selesai!</h1><p class="muted">' + known + '/' + deck.length + ' frasa diingat.</p><button type="button" class="btn" style="margin-top:14px" id="fr-back">Kembali ke daftar frasa</button></div></div>'; $('#fr-back', c).onclick = () => go('frasa'); return; } drawCard(); }
    };
    drawCard();
  };
}
/* ===== PENGUCAPAN & BUNYI YANG MEMBINGUNGKAN ===== */
const BUNYI = {
  ko: { items: [
    ['Batchim (받침) — konsonan akhir suku kata', 'Konsonan di bawah blok suku kata dibaca lebih lembut: ㄱ→"k", ㄷ→"t", ㅂ→"p". Jadi 책 dibaca mirip "chaek", 밥 mirip "bap".', [['책','buku'],['밥','nasi'],['옷','baju']]],
    ['연음 (yeoneum) — bunyi menyambung', 'Bila suku kata berakhir konsonan dan suku berikutnya diawali vokal, batchim PINDAH jadi awal suku berikutnya: 먹어 dibaca "머거" (meogeo), 읽어요 dibaca "일거요".', [['먹어','makanlah / (saya) makan'],['좋아요','bagus / saya suka'],['한국어','Bahasa Korea']]],
    ['ㅐ vs ㅔ — dua "e" yang berbeda', 'Keduanya mirip "e", tapi ㅐ mulut dibuka lebih lebar. 개 = anjing, 게 = kepiting — beda satu huruf, beda arti.', [['개','anjing'],['게','kepiting'],['네','ya'],['내','saya / milik saya']]],
    ['ㅓ vs ㅗ — "eo" vs "o"', 'ㅓ dibaca "eo" (mulut terbuka), ㅗ dibaca "o" bulat. Jangan tertukar: 어 (eo) untuk kata seperti 어머니 (ibu), 오 (o) untuk 오늘 (hari ini).', [['어머니','ibu'],['오늘','hari ini'],['어디','di mana'],['오빠','kakak laki-laki (untuk perempuan)']]]
  ], quiz: [
    ['Dengarkan — kata mana yang diucapkan?', '개', ['개','게'], 0, '개 = anjing.'],
    ['Dengarkan — kata mana yang diucapkan?', '게', ['개','게'], 1, '게 = kepiting.'],
    ['Dengarkan — kata mana yang diucapkan (batchim ㅂ dibaca "p")?', '밥', ['밥','밤'], 0, '밥 = nasi; 밤 = malam/kastanye.'],
    ['Dengarkan — kata mana yang diucapkan?', '오늘', ['오늘','어늘'], 0, '오늘 = hari ini (ㅗ = "o").']
  ]},
  ja: { items: [
    ['Vokal panjang vs pendek — beda arti!', 'Memperpanjang vokal mengubah arti: おばさん (bibi) vs おばあさん (nenek); ゆき (salju) vs ゆうき? Perhatikan おじさん (paman) vs おじいさん (kakek). Panjang vokal ditulis dengan menambah vokal yang sama (あ→ああ) atau ー di Katakana.', [['おばさん','bibi'],['おばあさん','nenek'],['おじさん','paman'],['おじいさん','kakek']]],
    ['っ (tsu kecil) — jeda / gandakan konsonan', 'っ kecil membuat jeda pendek lalu konsonan berikutnya ditekan: きて (datang) vs きって (perangko); ざっし (majalah). Jangan dibaca "tsu".', [['きて','datanglah'],['きって','perangko'],['ざっし','majalah'],['がっこう','sekolah']]],
    ['つ vs す, dan bunyi "fu"', 'つ dibaca "tsu", す dibaca "su". ふ dibaca "fu" dengan bibir rileks (bukan "hu" keras).', [['つき','bulan'],['すし','sushi'],['ふね','kapal'],['すいか','semangka']]]
  ], quiz: [
    ['Dengarkan — kata mana yang diucapkan?', 'おばあさん', ['おばさん','おばあさん'], 1, 'おばあさん = nenek (vokal panjang).'],
    ['Dengarkan — kata mana yang diucapkan?', 'きって', ['きて','きって'], 1, 'きって = perangko (ada っ).'],
    ['Dengarkan — kata mana yang diucapkan?', 'おばさん', ['おばさん','おばあさん'], 0, 'おばさん = bibi (vokal pendek).']
  ]},
  en: { items: [
    ['th — dua bunyi berbeda', '"th" tak bersuara seperti pada think (lidah di antara gigi, hanya udara), dan "th" bersuara seperti pada this (pita suara bergetar). Bahasa Indonesia tidak punya bunyi ini — jangan diganti "t" atau "d".', [['think','berpikir'],['this','ini'],['three','tiga'],['mother','ibu']]],
    ['ship vs sheep — i pendek vs i panjang', 'sheep vokal panjang "ii", ship vokal pendek "i". Salah panjang bisa mengubah arti total.', [['sheep','domba'],['ship','kapal'],['leave','pergi'],['live','tinggal / hidup']]],
    ['r vs l — rice vs lice', '"r" lidah melengkung tidak menyentuh langit-langit; "l" ujung lidah menyentuh belakang gigi atas. rice = nasi, lice = kutu rambut!', [['rice','nasi'],['lice','kutu'],['right','benar / kanan'],['light','cahaya / ringan']]],
    ['Word stress — tekanan kata', 'Bahasa Inggris menekan satu suku kata: REcord (kata benda: rekaman) vs reCORD (kata kerja: merekam). Tekanan yang salah membuat lawan bicara sulit paham.', [['record (RE-cord)','rekaman'],['present (PRE-sent)','hadiah / sekarang'],['hotel (ho-TEL)','hotel']]]
  ], quiz: [
    ['Dengarkan — kata mana yang diucapkan?', 'sheep', ['ship','sheep'], 1, 'sheep = domba (i panjang).'],
    ['Dengarkan — kata mana yang diucapkan?', 'rice', ['rice','lice'], 0, 'rice = nasi (r).'],
    ['Dengarkan — kata mana yang diucapkan?', 'think', ['think','sink'], 0, 'think = berpikir (th tak bersuara).']
  ]}
};
function pageBunyi(c) {
  const B = BUNYI[S.lang];
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Pengucapan & Bunyi yang Membingungkan — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Untuk apa: supaya bunyimu tidak tertukar dan lawan bicara langsung paham. Tiap bunyi ada penjelasan + contoh kata + audio, ditutup latihan bedakan bunyi.</p>' +
    B.items.map(it => '<div class="card" style="margin-top:14px"><b style="font-size:16px">' + esc(it[0]) + '</b><p style="margin:6px 0 10px">' + esc(it[1]) + '</p><div class="chiprow">' + it[2].map(w => '<span class="chip">' + esc(w[0]) + ' = ' + esc(w[1]) + ' ' + ttsBtn(w[0]) + '</span>').join('') + '</div></div>').join('') +
    '<div class="sect-label">Latihan bedakan bunyi</div><p class="muted small">Putar suaranya, lalu pilih kata yang kamu dengar.</p>' +
    B.quiz.map((q, qi) => '<div class="card" style="margin-top:12px"><b>' + (qi + 1) + '. ' + esc(q[0]) + '</b> ' + ttsBtn(q[1], '🔊 Putar bunyi') + '<div class="chiprow" style="margin-top:10px">' + q[2].map((o, oi) => '<button type="button" class="chip" data-bunyi="' + qi + ':' + oi + '">' + esc(o) + '</button>').join('') + '</div><p class="small" id="bunyi-fb-' + qi + '" style="margin-top:6px"></p></div>').join('') + '</div>';
  $$('[data-bunyi]', c).forEach(b => b.onclick = () => {
    const [qi, oi] = b.dataset.bunyi.split(':').map(Number);
    const q = B.quiz[qi], fb = $('#bunyi-fb-' + qi, c);
    if (oi === q[3]) { fb.innerHTML = '<span style="color:var(--green)"><b>Benar!</b></span> <span class="muted">' + esc(q[4]) + '</span>'; awardBonus(1, 'bunyi'); }
    else fb.innerHTML = '<span style="color:var(--red)"><b>Belum tepat.</b></span> <span class="muted">Putar lagi bunyinya pelan-pelan.</span>';
  });
}
/* ===== BAHASA SOPAN VS SANTAI ===== */
const SOPAN = {
  ko: { intro: 'Bahasa Korea punya dua gaya besar: 존댓말 (jondaenmal — sopan) untuk orang yang lebih tua, atasan, dan orang yang baru dikenal; dan 반말 (banmal — santai) hanya untuk teman sebaya yang sangat akrab, adik, atau anak. Salah gaya ke orang asing bisa dianggap tidak sopan — mulai selalu dengan yang sopan.', kapan: ['Baru kenal / lebih tua / atasan / pelanggan: WAJIB 존댓말 (-입니다, -이에요/예요, -아요/어요, -세요).', 'Teman dekat sebaya yang sudah sepakat santai, adik, anak kecil: boleh 반말 (-야, -아/어, -이다).', 'Ragu? Pakai yang sopan. Turun ke santai hanya bila lawan bicara memintanya ("말 편하게 하세요").'],
    pairs: [['안녕하세요','안녕','halo'],['감사합니다','고마워','terima kasih'],['저는 학생입니다','나는 학생이야','saya seorang pelajar'],['주세요','줘','tolong berikan'],['미안합니다','미안해','maaf'],['잠시만요','잠깐만','tunggu sebentar']],
    dialog: { title: 'Di kafe — sopan vs santai', place: 'Kafe', lines: [['Ani','안녕하세요. 아메리카노 주세요.','Halo (sopan). Tolong Americano.'],['Ben','네, 잠시만요.','Ya, sebentar (sopan).'],['Ani','야, 나 커피 사 줘.','Hei (santai, ke teman akrab), belikan aku kopi.'],['Ben','알았어, 잠깐만.','Oke (santai), sebentar.']] } },
  ja: { intro: 'Bahasa Jepang mengenal Keigo (bahasa hormat) dalam tiga bentuk: 丁寧語 teineigo (sopan umum: です・ます), 尊敬語 sonkeigo (meninggikan lawan bicara), dan 謙譲語 kenjougo (merendahkan diri sendiri). Untuk sehari-hari, teineigo sudah cukup aman ke siapa pun; bentuk santai (だ・る) hanya untuk teman akrab dan keluarga.', kapan: ['Orang baru, atasan, pelanggan, guru: teineigo (です/ます) — tambah sonkeigo untuk tindakan mereka (いらっしゃる, なさる).', 'Tindakan diri sendiri ke atasan: kenjougo (いたします, 申します).', 'Teman akrab & keluarga: bentuk santai boleh.'],
    pairs: [['先生がいらっしゃいます','先生がいる','Guru ada — sonkeigo (いらっしゃる) vs santai'],['私がいたします','私がする','Saya yang melakukan — kenjougo (いたす) vs santai'],['学生です','学生だ','(Saya) pelajar — teineigo vs santai'],['ありがとうございます','ありがとう','terima kasih — sopan vs santai'],['行きます','行く','pergi — sopan vs santai']],
    dialog: { title: 'Di kantor — keigo vs santai', place: 'Kantor', lines: [['Ani','おはようございます。','Selamat pagi (sopan).'],['Ben','おはよう。','Pagi (santai).'],['Ani','先生、いらっしゃいますか。','Apakah Guru ada? (sonkeigo)'],['Ben','うん、いるよ。','Ya, ada kok (santai).']] } },
  en: { intro: 'Bahasa Inggris tidak punya tingkat bahasa seperti Korea/Jepang, tapi ada beda formal vs santai: pilihan kata (request vs ask for), kalimat tak langsung (Could you…? Would you…?), dan sapaan. Ke atasan, dosen, dan email resmi pakai yang formal; ke teman pakai yang santai.', kapan: ['Email resmi, wawancara, dosen, orang yang baru dikenal: formal (Could you please…, I would like to…).', 'Teman, keluarga, chat santai: casual (Can you…?, I wanna…, Thanks!).', 'Ragu? Sedikit lebih formal tidak pernah salah.'],
    pairs: [['Could you help me, please?','Help me.','tolong bantu saya'],['I would like to ask a question.','I want to ask.','saya ingin bertanya'],['Thank you very much.','Thanks.','terima kasih banyak'],['Would you like some tea?','Want some tea?','mau teh?'],['I am sorry for the delay.','Sorry I am late.','maaf atas keterlambatannya']],
    dialog: { title: 'Bertanya — formal vs santai', place: 'Kampus', lines: [['Ani','Excuse me, could you help me, please?','Permisi, bisakah Anda membantu saya? (formal)'],['Ben','Sure, of course.','Tentu saja. (sopan)'],['Ani','Hey, help me with this.','Hei, bantu aku ini. (santai, ke teman)'],['Ben','Okay, wait a sec.','Oke, tunggu sebentar. (santai)']] } }
};
function pageSopan(c) {
  const SP = SOPAN[S.lang];
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Bahasa Sopan vs Santai — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Untuk apa: supaya kamu tidak terdengar kasar ke orang yang lebih tua/baru dikenal, dan tidak kaku ke teman akrab.</p>' +
    '<div class="card" style="margin-top:16px"><p>' + esc(SP.intro) + '</p><div class="sect-label">Kapan pakai yang mana</div>' + SP.kapan.map(k => '<p style="margin:6px 0">• ' + esc(k) + '</p>').join('') + '</div>' +
    '<div class="sect-label">Tabel perubahan — sopan vs santai</div><div class="card"><table class="tbl"><tr><th>Sopan</th><th>Santai</th><th>Arti / catatan</th></tr>' +
    SP.pairs.map(pr => '<tr><td><b>' + esc(pr[0]) + '</b> ' + ttsBtn(pr[0]) + '</td><td><b>' + esc(pr[1]) + '</b> ' + ttsBtn(pr[1]) + '</td><td>' + esc(pr[2]) + '</td></tr>').join('') + '</table></div>' +
    '<div class="sect-label">Contoh dialog</div><div class="card"><div class="sect-label" style="margin-top:0">' + esc(SP.dialog.place) + '</div><b>' + esc(SP.dialog.title) + '</b>' + dialogLinesHTML(SP.dialog) + '</div></div>';
}
/* ===== SUMBER & REFERENSI ===== */
function pageSumber(c) {
  c.innerHTML = '<div class="wrap"><h1 class="page">Sumber & Referensi</h1><p class="sub">Arti kata dan materi DidiGo ditulis dengan kata-kata DidiGo sendiri, berpedoman pada rujukan resmi berikut — bukan salinan dari buku/situs mana pun. Setiap kata di DidiGo diberi SATU arti utama yang paling umum; arti lain yang penting ditulis sebagai catatan "arti lain".</p>' +
    '<div class="card" style="margin-top:16px"><div class="sect-label" style="margin-top:0">Bahasa Korea</div><p style="margin-top:6px"><b>King Sejong Institute</b> (Sejonghakdang Foundation — sejonghakdang.org): kurikulum dan kosakata standar Bahasa Korea untuk pelajar asing.</p><p style="margin-top:6px"><b>National Institute of Korean Language (NIKL)</b>: kamus standar Bahasa Korea — rujukan arti kata Korea yang resmi.</p></div>' +
    '<div class="card" style="margin-top:14px"><div class="sect-label" style="margin-top:0">Bahasa Jepang</div><p style="margin-top:6px"><b>Japan Foundation — Marugoto & Irodori</b>: materi resmi Bahasa Jepang untuk komunikasi dan kehidupan di Jepang.</p><p style="margin-top:6px"><b>JLPT (Japanese-Language Proficiency Test)</b> — diselenggarakan Japan Foundation & JEES: standar level dan cakupan kosakata/tata bahasa per jenjang.</p></div>' +
    '<div class="card" style="margin-top:14px"><div class="sect-label" style="margin-top:0">Bahasa Inggris</div><p style="margin-top:6px"><b>Oxford Learner\'s Dictionaries</b>: arti kata Inggris untuk pelajar, termasuk daftar kata inti Oxford 3000/5000.</p><p style="margin-top:6px"><b>Cambridge Dictionary</b>: arti dan contoh kalimat standar Bahasa Inggris.</p></div>' +
    '<div class="card" style="margin-top:14px"><div class="sect-label" style="margin-top:0">Catatan kejujuran</div><p style="margin-top:6px">Materi DidiGo adalah parafrase dan susunan sendiri berpedoman pada rujukan di atas — bukan teks salinan. Suara (TTS) memakai voice gratis yang terpasang di perangkatmu lewat Web Speech API. Bila kamu menemukan arti yang terasa janggal, periksa silang ke rujukan di atas — arti di DidiGo selalu ditampilkan berdampingan dengan kata aslinya supaya mudah diperiksa.</p></div></div>';
}
/* ===== MULAI DARI NOL (Pra-A0) ===== */
const NUMBERS = {
  en: [['one','satu'],['two','dua'],['three','tiga'],['four','empat'],['five','lima'],['six','enam'],['seven','tujuh'],['eight','delapan'],['nine','sembilan'],['ten','sepuluh']],
  ko: [['하나','satu — hana'],['둘','dua — dul'],['셋','tiga — set'],['넷','empat — net'],['다섯','lima — daseot'],['여섯','enam — yeoseot'],['일곱','tujuh — ilgop'],['여덟','delapan — yeodeol'],['아홉','sembilan — ahop'],['열','sepuluh — yeol']],
  ja: [['いち','satu — ichi'],['に','dua — ni'],['さん','tiga — san'],['よん','empat — yon'],['ご','lima — go'],['ろく','enam — roku'],['なな','tujuh — nana'],['はち','delapan — hachi'],['きゅう','sembilan — kyuu'],['じゅう','sepuluh — juu']]
};
function pageNol(c) {
  const firstWords = DG.core[S.lang].slice(0, 12);
  const survival = frasaList(S.lang).filter(f => ['Salam & Perkenalan','Darurat'].includes(f[4])).slice(0, 8);
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Mulai dari Nol — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Jenjang Pra-A0 untuk yang BENAR-BENAR belum pernah belajar Bahasa ' + LANGMETA[S.lang].name + ' sama sekali. Langkah kecil-kecil, banyak pengulangan. Selesaikan jenjang ini, lalu lanjut ke modul A0.</p>' +
    '<div class="sect-label">Langkah 1 — Huruf & bunyi dari nol</div><div class="card"><p class="muted" style="margin-bottom:10px">Untuk apa: tanpa huruf, semua materi berikutnya mustahil. Buka bagan huruf lengkap (seperti halaman pertama buku pelajaran), klik hurufnya, dengarkan bunyinya, dan latih menulisnya di kanvas.</p><button type="button" class="btn" data-nol-go="script">Buka bagan huruf & latihan menulis →</button></div>' +
    '<div class="sect-label">Langkah 2 — Kata pertamamu (12 kata)</div><div class="card" style="padding:6px 20px">' + firstWords.map(w => '<div class="sent-line"><b>' + esc(w[0]) + '</b> ' + ttsBtn(w[0]) + ' <span class="muted">— ' + esc(w[1]) + '</span>' + (w[2] ? '<small>' + esc(w[2]) + ' · ' + esc(w[3]) + '</small>' : '') + '</div>').join('') + '</div>' +
    '<div class="sect-label">Langkah 3 — Angka 1–10</div><div class="card"><div class="chiprow">' + NUMBERS[S.lang].map(n => '<span class="chip">' + esc(n[0]) + ' = ' + esc(n[1]) + ' ' + ttsBtn(n[0]) + '</span>').join('') + '</div></div>' +
    '<div class="sect-label">Langkah 4 — Frasa bertahan hidup</div><div class="card" style="padding:6px 20px">' + survival.map(f => '<div class="sent-line"><b>' + esc(f[0]) + '</b> ' + ttsBtn(f[0]) + ' <span class="muted">— ' + esc(f[1]) + '</span></div>').join('') + '</div>' +
    '<div class="sect-label">Langkah 5 — Latihan pengucapan dasar</div><div class="card"><p class="muted" style="margin-bottom:10px">Untuk apa: mulut perlu dibiasakan sejak hari pertama. Dengarkan tiap kata pertama di Langkah 2 dan tirukan keras-keras 3 kali. Bunyi yang sering membingungkan ada penjelasannya di sini:</p><button type="button" class="btn white" data-nol-go="bunyi">Panduan pengucapan & bunyi →</button> <button type="button" class="btn" data-nol-go="modules">Selesai jenjang Nol — lanjut ke modul A0 →</button></div></div>';
  $$('[data-nol-go]', c).forEach(b => b.onclick = () => go(b.dataset.nolGo));
}
/* ===== MAHIR SEKALI (di atas C2) ===== */
const MAHIR_NUANCE = {
  en: [['Formal akademik','It is widely argued that…','Umum diperdebatkan bahwa… — pembuka esai argumen, hindari "I think" di tulisan akademik.'],['Sarkasme halus','Oh, brilliant — another meeting.','"Oh, hebat — rapat lagi." Nada datar mengubah pujian jadi sindiran; konteks & nada menentukan.'],['Bahasa rapat','Let us table this discussion.','Mari kita tunda pembahasan ini — idiom bisnis: "table" di rapat = menunda (AmE).']],
  ko: [['격식체 (gaya resmi)','발표하겠습니다','"Saya akan mempresentasikan" — akhiran -습니다 untuk presentasi & berita, lebih resmi dari -입니다 sehari-hari.'],['사자성어 (peribahasa 4 huruf)','일석이조','"Satu batu dua burung" = sekali mendayung dua pulau terlampaui — peribahasa tingkat lanjut dari aksara Hanja.'],['뉘앙스: 은근히','그는 은근히 자랑했다','"Dia membanggakan diri secara diam-diam/halus" — 은근히 menangkap nada terselubung yang tak tertangkap kata biasa.']],
  ja: [['敬語 tingkat lanjut','ご覧になる','"Melihat" dalam sonkeigo (untuk atasan) — bandingkan 見る (biasa) dan 拝見する (kenjougo, untuk diri sendiri).'],['四字熟語 (yoji-jukugo)','一石二鳥','"Satu batu dua burung" — peribahasa empat huruf untuk tulisan & pidato formal.'],['Nuansa: やっぱり','やっぱり雨だ','"Ternyata hujan juga, ya" — やっぱり menegaskan dugaan yang terbukti; sangat khas percakapan alami tingkat lanjut.']]
};
function pageMahir(c) {
  const nu = MAHIR_NUANCE[S.lang];
  const examName = S.lang === 'ko' ? 'TOPIK 6' : S.lang === 'ja' ? 'JLPT N1' : 'IELTS Band 8–9';
  const cards = [
    ['Menulis akademik & esai argumen', 'Untuk menulis esai dan teks formal level tertinggi dengan struktur & kosakata akademik.', S.lang === 'en' ? 'Buka IELTS Writing & 10 esai contoh →' : 'Buka Tulis & Esai Ujian →', 'examwriting'],
    ['Debat & presentasi', 'Untuk berbicara terstruktur 1–2 menit, membela pendapat, dan menjawab sanggahan.', 'Buka Simulasi Speaking →', 'speaking'],
    ['Idiom & peribahasa tingkat lanjut', 'Untuk memahami ungkapan yang tidak bisa diterjemahkan kata per kata.', 'Buka Idiom & Phrasal Verbs →', 'idioms'],
    ['Bahasa profesional & bisnis', S.lang === 'ko' ? 'Untuk rapat, negosiasi, dan dunia kerja Korea (termasuk kosakata prioritas TOPIK/EPS).' : S.lang === 'ja' ? 'Untuk bahasa kerja & JFT-Basic tingkat lanjut.' : 'Untuk rapat, negosiasi, dan email formal Bahasa Inggris.', 'Buka Fitur Khusus Bahasa →', 'khusus'],
    ['Membaca teks panjang', 'Untuk membaca artikel & teks panjang tanpa berhenti di tengah — mulai dari bacaan level tertinggi.', 'Buka Bacaan →', 'readings'],
    ['Ujian level tertinggi — ' + examName, 'Untuk membuktikan kemampuanmu di jenjang sertifikasi paling atas: simulasi & strategi ujiannya.', 'Buka Persiapan Ujian →', 'exams']
  ];
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Mahir Sekali — ' + LANGMETA[S.lang].name + ' (di atas C2)</h1><p class="sub">Jenjang sesudah C2: bukan pengulangan C2 — ini tantangan sebenarnya. Nuansa, gaya bahasa, debat, dan bahasa profesional.</p>' +
    '<div class="sect-label">Nuansa & gaya bahasa — contoh tingkat mahir</div>' +
    nu.map(n => '<div class="card" style="margin-top:12px"><span class="chip">' + esc(n[0]) + '</span><p style="margin-top:8px"><b>' + esc(n[1]) + '</b> ' + ttsBtn(n[1]) + '</p><p class="muted" style="margin-top:4px">' + esc(n[2]) + '</p></div>').join('') +
    '<div class="sect-label">Jalur mahir — pilih tantanganmu</div><div class="grid2" style="align-items:start">' +
    cards.map(cd => '<div class="card khusus-card"><b style="font-size:16px">' + esc(cd[0]) + '</b><p class="muted" style="margin:6px 0 12px"><b>Untuk apa:</b> ' + esc(cd[1]) + '</p><button type="button" class="btn" data-mahir-go="' + cd[3] + '">' + esc(cd[2]) + '</button></div>').join('') + '</div></div>';
  $$('[data-mahir-go]', c).forEach(b => b.onclick = () => go(b.dataset.mahirGo));
}

/* ===== FITUR KHUSUS per bahasa: TOEIC Business (EN) / JFT (JA) ===== */
function khususCard(title, guna, btn, route) {
  return '<div class="card khusus-card"><b style="font-size:16px">' + esc(title) + '</b><p class="muted" style="margin:6px 0 12px"><b>Untuk apa:</b> ' + esc(guna) + '</p><button type="button" class="btn" data-kgo="' + route + '">' + esc(btn) + '</button></div>';
}
function pageKhusus(c) {
  const L = S.lang;
  let groups = '';
  const group = (label, cards) => '<div class="sect-label">' + label + '</div><div class="grid2" style="align-items:start">' + cards.join('') + '</div>';
  if (L === 'en') {
    groups =
      group('🎯 Ujian & Sertifikasi', [
        khususCard('IELTS / TOEFL / TOEIC / Cambridge', 'Siap ujian Bahasa Inggris — simulasi mini, strategi, dan rencana belajar dalam satu tempat.', 'Mulai simulasi →', 'exams'),
        khususCard('IELTS Writing + 10 Esai Contoh', 'Menaikkan skor Writing dengan blueprint + esai contoh band 7–9.', 'Buka esai →', 'examwriting'),
        khususCard('Speaking Simulation — 24 Topik', 'Latihan bicara format IELTS Part 2 dengan cue card & contoh jawaban.', 'Mulai latihan bicara →', 'speaking')
      ]) +
      '<div class="sect-label">💼 Kerja & Studi — TOEIC Business English</div><div class="card"><p class="muted" style="margin-bottom:10px"><b>Untuk apa:</b> frasa Bahasa Inggris untuk email & dunia kerja TOEIC — ' + DG.business.length + ' paket, langsung dengarkan dan pakai.</p><button type="button" class="btn white" data-kgo="practice">Latih lewat Kuis Latihan →</button></div>' +
      DG.business.map(b => '<div class="card" style="margin-top:14px"><b style="font-size:16px">' + esc(b.title) + '</b>' + b.items.map(it => '<div class="sent-line"><b>' + esc(it[0]) + '</b> ' + ttsBtn(it[0]) + '<small>' + esc(it[1]) + '</small></div>').join('') + '</div>').join('') +
      group('💬 Sehari-hari & Bicara', [
        khususCard('Frasa Sehari-hari — 100 Frasa Wajib', 'Frasa yang benar-benar dipakai tiap hari (salam, belanja, darurat, hotel) + kartu hafalan frasa.', 'Buka 100 frasa →', 'frasa'),
        khususCard('Pengucapan & Bunyi yang Membingungkan', 'th, ship vs sheep, r vs l, dan tekanan kata — dengan latihan bedakan bunyi.', 'Mulai latihan bunyi →', 'bunyi'),
        khususCard('Bahasa Formal vs Santai', 'Kapan memakai Could you…? dan kapan cukup Help me — supaya tidak salah suasana.', 'Buka panduannya →', 'sopan'),
        khususCard('Kesalahan Umum Penutur Indonesia', 'I have 20 years old, he/she tertukar, tenses — kenapa salah dan bagaimana benarnya, plus latihan.', 'Buka & latih →', 'mistakes'),
        khususCard('Idiom & Phrasal Verbs — 349 ungkapan', 'Ungkapan sehari-hari penutur asli, dengan arti & contoh.', 'Buka idiom →', 'idioms'),
        khususCard('Dialog Situasional', '12 percakapan nyata dengan suara laki-laki & perempuan berbeda.', 'Buka dialog →', 'dialogs')
      ]);
  } else if (L === 'ko') {
    groups =
      group('🎯 Ujian & Sertifikasi', [
        khususCard('TOPIK I & II', 'Lulus TOPIK — bank soal + simulasi listening & reading dengan pembahasan.', 'Mulai simulasi TOPIK →', 'exams'),
        khususCard('EPS-TOPIK — Kerja ke Korea', 'Ujian pekerja migran: kosakata kerja & keselamatan, bank soal, dan simulasi penuh di halaman khususnya.', 'Buka EPS-TOPIK →', 'eps')
      ]) +
      group('💼 Kerja & Studi', [
        khususCard('GKS Writing Prep + TOPIK Writing', 'Persiapan menulis beasiswa GKS dan esai TOPIK dengan model jawaban.', 'Buka persiapan menulis →', 'examwriting')
      ]) +
      '<div class="sect-label">Vocab Priority — ' + DG.koVocab.length + ' kata TOPIK/EPS paling prioritas</div><div class="card" style="padding:6px 20px">' + DG.koVocab.slice(0, 90).map(w => '<div class="sent-line"><b>' + esc(w[0]) + '</b> ' + ttsBtn(w[0]) + ' <span class="muted">(' + esc(w[1]) + ') — ' + esc(w[2]) + '</span></div>').join('') + '</div>' +
      group('💬 Sehari-hari & Bicara', [
        khususCard('Frasa Sehari-hari — 100 Frasa Wajib', 'Frasa yang benar-benar dipakai tiap hari (salam, belanja, darurat, hotel) + kartu hafalan frasa.', 'Buka 100 frasa →', 'frasa'),
        khususCard('Pengucapan & Bunyi yang Membingungkan', 'Batchim, 연음 (bunyi menyambung), ㅐ vs ㅔ — dengan latihan bedakan bunyi.', 'Mulai latihan bunyi →', 'bunyi'),
        khususCard('Bahasa Sopan vs Santai — 존댓말 vs 반말', 'Kapan wajib sopan dan kapan boleh santai, lengkap dengan tabel akhiran & contoh dialog.', 'Buka panduannya →', 'sopan'),
        khususCard('Kesalahan Umum Penutur Indonesia', 'Partikel 을/를 tertukar, 학교를 vs 학교에 — kenapa salah dan bagaimana benarnya, plus latihan.', 'Buka & latih →', 'mistakes'),
        khususCard('Dialog Situasional', '12 percakapan nyata dengan suara laki-laki & perempuan berbeda.', 'Buka dialog →', 'dialogs'),
        khususCard('Kosakata — 500 Kata Inti', 'Seluruh kosakata inti dengan arti & contoh, bisa dicari.', 'Buka kosakata →', 'vocab')
      ]);
  } else {
    groups =
      group('🎯 Ujian & Sertifikasi', [
        khususCard('JLPT N5–N3', 'Lulus JLPT — bank soal 36 + simulasi dengan pembahasan.', 'Mulai simulasi JLPT →', 'exams'),
        khususCard('JFT-Basic — Kerja di Jepang (SSW)', 'Siap ujian bahasa untuk kerja di Jepang: strategi & latihannya ada di Persiapan Ujian.', 'Buka Persiapan Ujian →', 'exams')
      ]) +
      group('💬 Sehari-hari & Bicara', [
        khususCard('Frasa Sehari-hari — 100 Frasa Wajib', 'Frasa yang benar-benar dipakai tiap hari (salam, belanja, darurat, hotel) + kartu hafalan frasa.', 'Buka 100 frasa →', 'frasa'),
        khususCard('Pengucapan & Bunyi yang Membingungkan', 'Vokal panjang-pendek yang mengubah arti, dan っ (tsu kecil) — dengan latihan bedakan bunyi.', 'Mulai latihan bunyi →', 'bunyi'),
        khususCard('Bahasa Sopan — Keigo', 'Sonkeigo, kenjougo, teineigo: kapan memakai yang mana, dengan tabel & contoh dialog.', 'Buka panduannya →', 'sopan'),
        khususCard('Kesalahan Umum Penutur Indonesia', 'Partikel を/は, bentuk lampau, です vs だ — kenapa salah dan bagaimana benarnya, plus latihan.', 'Buka & latih →', 'mistakes'),
        khususCard('Belajar Menulis — Hiragana, Katakana, Kanji', 'Bagan Gojuon lengkap seperti halaman pertama buku Jepang + latihan menulis di kanvas.', 'Buka bagan huruf →', 'script'),
        khususCard('Dialog Situasional', '12 percakapan nyata dengan suara laki-laki & perempuan berbeda.', 'Buka dialog →', 'dialogs')
      ]);
  }
  c.innerHTML = '<div class="wrap wrap-wide"><h1 class="page">Fitur Khusus — ' + LANGMETA[L].name + '</h1><p class="sub">Dikelompokkan berdasarkan tujuan — tiap kartu jelas gunanya dan langsung bisa dipakai. Fitur yang sudah punya halaman sendiri (seperti EPS-TOPIK) di sini hanya jadi pintasan ke halamannya.</p>' + groups + '</div>';
  $$('[data-kgo]', c).forEach(b => b.onclick = () => go(b.dataset.kgo));
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
    runQuiz(c, { routeName: 'eps', skill: kind === 'listen' ? 'listen' : 'read', tag: 'EPS-TOPIK', title: 'EPS-TOPIK · ' + (kind === 'full' ? 'SIMULASI PENUH' : kind === 'read' ? 'READING' : 'LISTENING'), sub: 'Bank soal EPS-TOPIK (isi v16 + soal latihan lengkap). Target lulus simulasi: 70%.', questions: epsQuestions(kind),
      finish(cc, pct, ok, total) { if (pct >= 70) awardBonus(10, 'eps-topik'); cc.innerHTML = '<div class="wrap"><div class="card" style="max-width:560px;margin:30px auto;text-align:center"><div class="sect-label">Hasil EPS-TOPIK</div><h1 class="page">' + pct + '%</h1><p class="muted">' + ok + '/' + total + ' benar.' + (pct >= 70 ? ' Di atas ambang latihan — pertahankan!' : ' Ulangi kosakata keselamatannya, lalu coba lagi.') + '</p><button type="button" class="btn" style="margin-top:14px" id="eps-back">Kembali ke EPS-TOPIK</button></div></div>'; $('#eps-back', cc).onclick = () => go('eps'); } });
  });
}

/* ===== LISTENING + TRANSKRIP (Pilar 1c) ===== */
function pageListening(c) {
  const items = DG.readings[S.lang];
  let sel = items[0], showTr = true, speed = 1;
  function playAll() {
    if (!('speechSynthesis' in window)) { toast('Peramban ini tidak mendukung suara.'); return; }
    speechSynthesis.cancel();
    let i = 0;
    const next = () => {
      if (i >= sel.sentences.length) return;
      const u = new SpeechSynthesisUtterance(sel.sentences[i][0]);
      u.lang = LANGMETA[S.lang].tts; u.rate = speed;
      const pick = pickDialogVoice(u.lang, '');
      if (pick.voice) { try { u.voice = pick.voice; } catch (e) {} }
      i++;
      u.onend = next; u.onerror = next;
      speechSynthesis.speak(u);
    };
    next();
  }
  function draw() {
    c.innerHTML = '<div class="wrap"><h1 class="page">Listening — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Untuk apa: melatih telinga dengan bahan asli berjenjang. Dengarkan dulu TANPA transkrip, jawab pertanyaannya, baru buka transkripnya untuk memeriksa.</p>' +
      '<div class="chiprow" style="margin-top:14px">' + items.slice(0, 8).map(r => '<button type="button" class="chip' + (sel.id === r.id ? ' active' : '') + '" data-ls="' + r.id + '">' + r.level + ' · ' + esc(r.title) + '</button>').join('') + '</div>' +
      '<div class="card" style="margin-top:14px"><div class="sect-label" style="margin-top:0">' + esc(sel.title) + ' · level ' + sel.level + '</div>' +
      '<div class="chiprow"><span class="small muted">Kecepatan:</span>' + [[0.7, 'Lambat'], [1, 'Normal'], [1.15, 'Cepat']].map(sp => '<button type="button" class="chip' + (speed === sp[0] ? ' active' : '') + '" data-speed="' + sp[0] + '">' + sp[1] + '</button>').join('') +
      '<button type="button" class="btn" id="ls-play">▶ Putar listening</button>' +
      '<button type="button" class="btn white" id="ls-toggle">' + (showTr ? 'Sembunyikan transkrip' : 'Tampilkan transkrip') + '</button></div>' +
      (showTr ? '<div style="margin-top:12px">' + sel.sentences.map(s2 => '<div class="sent-line"><b>' + esc(s2[0]) + '</b> ' + ttsBtn(s2[0]) + '<small>' + esc(s2[1]) + '</small></div>').join('') + '</div>' : '<p class="muted" style="margin-top:12px">Transkrip disembunyikan — dengarkan baik-baik.</p>') + '</div>' +
      '<div class="card" style="margin-top:16px"><div class="sect-label" style="margin-top:0">Pertanyaan pemahaman</div>' +
      sel.questions.map((q, qi) => '<div style="margin:14px 0"><b>' + (qi + 1) + '. ' + esc(q[0]) + '</b><div class="chiprow" style="margin-top:8px">' + q[1].map((o, oi) => '<button type="button" class="chip" data-lq="' + qi + ':' + oi + '">' + esc(o) + '</button>').join('') + '</div><p class="small" id="lq-fb-' + qi + '" style="margin-top:6px"></p></div>').join('') + '</div></div>';
    $$('[data-ls]', c).forEach(b => b.onclick = () => { sel = items.find(r => r.id === b.dataset.ls) || sel; draw(); });
    $$('[data-speed]', c).forEach(b => b.onclick = () => { speed = parseFloat(b.dataset.speed); ttsRate = speed; draw(); });
    $('#ls-play', c).onclick = playAll;
    $('#ls-toggle', c).onclick = () => { showTr = !showTr; draw(); };
    $$('[data-lq]', c).forEach(b => b.onclick = () => {
      const [qi, oi] = b.dataset.lq.split(':').map(Number);
      const fb = $('#lq-fb-' + qi, c);
      if (oi === sel.questions[qi][2]) { fb.innerHTML = '<span style="color:var(--green)"><b>Benar!</b></span> <span class="muted">' + esc(sel.questions[qi][3]) + '</span>'; bumpSkill('listen', 1, 1); awardBonus(1, 'listening'); }
      else { fb.innerHTML = '<span style="color:var(--red)"><b>Belum tepat.</b></span> <span class="muted">Putar lagi listeningnya.</span>'; bumpSkill('listen', 0, 1); }
    });
  }
  draw();
}
/* ===== SIMULASI PERCAKAPAN BERCABANG / ROLE-PLAY (Pilar 2b) ===== */
const RP = {
en: [
 { title: 'Di Restoran', place: 'Restoran', nodes: [
   { npc: 'Good evening! Table for how many?', npcId: 'Selamat malam! Meja untuk berapa orang?', ch: [['Table for two, please.', 2], ['Two.', 1], ['Give me a table.', 0]] },
   { npc: 'Are you ready to order?', npcId: 'Sudah siap memesan?', ch: [['Yes, I would like the grilled chicken, please.', 2], ['Chicken.', 1], ['Bring me chicken now.', 0]] } ] },
 { title: 'Di Bandara', place: 'Bandara', nodes: [
   { npc: 'May I see your passport?', npcId: 'Boleh saya lihat paspor Anda?', ch: [['Of course, here it is.', 2], ['Yes.', 1], ['Passport? Why?', 0]] },
   { npc: 'Window or aisle seat?', npcId: 'Kursi dekat jendela atau lorong?', ch: [['A window seat, please.', 2], ['Window.', 1], ['Any seat.', 1]] } ] },
 { title: 'Di Rumah Sakit', place: 'Rumah Sakit', nodes: [
   { npc: 'What seems to be the problem?', npcId: 'Apa keluhannya?', ch: [['I have had a fever since yesterday.', 2], ['Sick.', 1], ['Help me, I am sick!', 1]] },
   { npc: 'Are you allergic to any medicine?', npcId: 'Apakah Anda alergi obat tertentu?', ch: [['No, I am not allergic to anything.', 2], ['No.', 1], ['I do not know medicine.', 0]] } ] },
 { title: 'Belanja', place: 'Toko', nodes: [
   { npc: 'Can I help you?', npcId: 'Ada yang bisa saya bantu?', ch: [['Yes, I am looking for a jacket.', 2], ['Jacket.', 1], ['No.', 0]] },
   { npc: 'Would you like to try it on?', npcId: 'Mau mencobanya dulu?', ch: [['Yes, please. Where is the fitting room?', 2], ['Yes.', 1], ['No, I will buy it.', 1]] } ] },
 { title: 'Di Kantor', place: 'Kantor', nodes: [
   { npc: 'Could you send the report today?', npcId: 'Bisakah laporan dikirim hari ini?', ch: [['Certainly, I will send it by 3 p.m.', 2], ['Okay.', 1], ['Impossible.', 0]] },
   { npc: 'Shall we meet at ten?', npcId: 'Kita bertemu jam sepuluh?', ch: [['Ten works for me. See you then.', 2], ['Ten.', 1], ['Maybe.', 0]] } ] }
],
ko: [
 { title: 'Di Restoran', place: 'Restoran', nodes: [
   { npc: '어서 오세요. 몇 분이세요?', npcId: 'Selamat datang. Berapa orang?', ch: [['두 명이요.', 2], ['둘이요.', 1], ['두 명.', 0]] },
   { npc: '주문하시겠어요?', npcId: 'Mau memesan sekarang?', ch: [['비빔밥 하나 주세요.', 2], ['비빔밥이요.', 1], ['비빔밥 줘.', 0]] } ] },
 { title: 'Di Bandara', place: 'Bandara', nodes: [
   { npc: '여권 좀 보여 주세요.', npcId: 'Tolong tunjukkan paspornya.', ch: [['네, 여기 있습니다.', 2], ['네.', 1], ['왜요?', 0]] },
   { npc: '창가 자리로 드릴까요?', npcId: 'Mau kursi dekat jendela?', ch: [['네, 창가로 주세요.', 2], ['아무거나 괜찮아요.', 1], ['창가.', 0]] } ] },
 { title: 'Di Rumah Sakit', place: 'Rumah Sakit', nodes: [
   { npc: '어디가 아프세요?', npcId: 'Bagian mana yang sakit?', ch: [['어제부터 열이 나요.', 2], ['아파요.', 1], ['열.', 0]] },
   { npc: '약 알레르기 있으세요?', npcId: 'Ada alergi obat?', ch: [['아니요, 없습니다.', 2], ['없어요.', 1], ['몰라요.', 0]] } ] },
 { title: 'Belanja', place: 'Toko', nodes: [
   { npc: '뭘 찾으세요?', npcId: 'Cari apa?', ch: [['재킷을 찾고 있어요.', 2], ['재킷이요.', 1], ['재킷.', 0]] },
   { npc: '입어 보시겠어요?', npcId: 'Mau mencobanya?', ch: [['네, 입어 볼게요. 피팅룸이 어디예요?', 2], ['네.', 1], ['아니요, 살게요.', 1]] } ] },
 { title: 'Di Kantor', place: 'Kantor', nodes: [
   { npc: '오늘까지 보고서 보내 주세요.', npcId: 'Tolong kirim laporannya hari ini.', ch: [['네, 오후 3시까지 보내겠습니다.', 2], ['네, 알겠습니다.', 1], ['힘들어요.', 0]] },
   { npc: '10시에 회의할까요?', npcId: 'Kita rapat jam 10?', ch: [['네, 좋습니다.', 2], ['10시요.', 1], ['글쎄요.', 0]] } ] }
],
ja: [
 { title: 'Di Restoran', place: 'Restoran', nodes: [
   { npc: 'いらっしゃいませ。何名様ですか。', npcId: 'Selamat datang. Berapa orang?', ch: [['二人です。', 2], ['二人。', 1], ['二人だよ。', 0]] },
   { npc: 'ご注文はお決まりですか。', npcId: 'Sudah memutuskan pesanan?', ch: [['はい、ラーメンをください。', 2], ['ラーメンです。', 1], ['ラーメン、早く。', 0]] } ] },
 { title: 'Di Bandara', place: 'Bandara', nodes: [
   { npc: 'パスポートを見せてください。', npcId: 'Tolong tunjukkan paspornya.', ch: [['はい、どうぞ。', 2], ['はい。', 1], ['なぜですか。', 0]] },
   { npc: '窓側と通路側、どちらがいいですか。', npcId: 'Kursi jendela atau lorong, mana yang Anda mau?', ch: [['窓側をお願いします。', 2], ['窓側です。', 1], ['どっちでも。', 1]] } ] },
 { title: 'Di Rumah Sakit', place: 'Rumah Sakit', nodes: [
   { npc: 'どうしましたか。', npcId: 'Apa keluhannya?', ch: [['昨日から熱があります。', 2], ['熱です。', 1], ['病気です。', 0]] },
   { npc: '薬のアレルギーはありますか。', npcId: 'Ada alergi obat?', ch: [['いいえ、ありません。', 2], ['ないです。', 1], ['知りません。', 0]] } ] },
 { title: 'Belanja', place: 'Toko', nodes: [
   { npc: '何をお探しですか。', npcId: 'Cari apa?', ch: [['ジャケットを探しています。', 2], ['ジャケットです。', 1], ['ジャケット。', 0]] },
   { npc: 'ご試着されますか。', npcId: 'Mau mencobanya?', ch: [['はい、試着室はどこですか。', 2], ['はい。', 1], ['いいえ、買います。', 1]] } ] },
 { title: 'Di Kantor', place: 'Kantor', nodes: [
   { npc: '今日レポートを送ってください。', npcId: 'Tolong kirim laporannya hari ini.', ch: [['はい、3時までに送ります。', 2], ['はい。', 1], ['無理です。', 0]] },
   { npc: '10時に会議をしましょうか。', npcId: 'Kita rapat jam 10?', ch: [['はい、大丈夫です。', 2], ['10時です。', 1], ['たぶん。', 0]] } ] }
]};
function pageRoleplay(c) {
  const list = RP[S.lang];
  function pick() {
    c.innerHTML = '<div class="wrap"><h1 class="page">Simulasi Percakapan — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Untuk apa: berlatih merespons situasi nyata. Pilihanmu mengubah jalannya percakapan — di akhir kamu dinilai dari kesopanan & ketepatan, plus saran jawaban yang lebih baik.</p>' +
      '<div class="grid2" style="margin-top:16px">' + list.map((sc, i) => '<div class="card khusus-card"><b style="font-size:16px">' + esc(sc.title) + '</b><p class="muted" style="margin:6px 0 12px"><b>Untuk apa:</b> berlatih situasi ' + esc(sc.place.toLowerCase()) + ' dengan respons yang sopan & tepat.</p><button type="button" class="btn" data-rp="' + i + '">Mulai role-play →</button></div>').join('') + '</div></div>';
    $$('[data-rp]', c).forEach(b => b.onclick = () => play(+b.dataset.rp));
  }
  function play(si) {
    const sc = list[si];
    let ni = 0, score = 0, answered = false;
    const max = sc.nodes.length * 2, saran = [];
    function draw() {
      const node = sc.nodes[ni];
      c.innerHTML = '<div class="wrap"><h1 class="page">' + esc(sc.title) + '</h1><p class="sub">Situasi: ' + esc(sc.place) + ' · langkah ' + (ni + 1) + '/' + sc.nodes.length + ' · skor sementara ' + score + '/' + max + '</p>' +
        '<div class="card" style="margin-top:14px"><div class="dialog-line"><span class="who">Lawan bicara</span><div class="txt"><b>' + esc(node.npc) + '</b> ' + ttsBtn(node.npc) + '<small>' + esc(node.npcId) + '</small></div></div>' +
        '<div class="sect-label">Jawabanmu</div><div class="opt-grid">' + node.ch.map((ch, i) => '<button type="button" class="opt" data-rpc="' + i + '"' + (answered ? ' disabled' : '') + '><span class="num">' + (i + 1) + '</span><span>' + esc(ch[0]) + '</span></button>').join('') + '</div>' +
        '<p class="small" id="rp-fb" style="margin-top:10px"></p>' +
        '<div class="quiz-actions">' + (answered ? '<button type="button" class="btn" id="rp-next">' + (ni === sc.nodes.length - 1 ? 'Lihat hasil →' : 'Lanjut percakapan →') + '</button>' : '') + '</div></div></div>';
      $$('[data-rpc]', c).forEach(b => b.onclick = () => {
        if (answered) return;
        answered = true;
        const ch = node.ch[+b.dataset.rpc];
        score += ch[1];
        const best = node.ch.reduce((a, b) => b[1] > a[1] ? b : a, node.ch[0]);
        if (ch[1] < 2) saran.push({ npc: node.npc, best: best[0] });
        const fb = $('#rp-fb', c);
        fb.innerHTML = ch[1] === 2 ? '<span style="color:var(--green)"><b>Tepat & sopan!</b></span>' : ch[1] === 1 ? '<span style="color:var(--amber)"><b>Bisa dipahami</b>, tapi kurang lengkap/kurang sopan. Yang lebih baik: <b>' + esc(best[0]) + '</b></span>' : '<span style="color:var(--red)"><b>Kurang tepat</b> untuk situasi ini. Yang lebih baik: <b>' + esc(best[0]) + '</b></span>';
        b.classList.add(ch[1] === 2 ? 'correct' : 'wrong');
        const nx = document.createElement('div');
        draw2();
      });
      function draw2() {
        const qa = $('.quiz-actions', c);
        if (qa && !$('#rp-next', c)) { qa.innerHTML = '<button type="button" class="btn" id="rp-next">' + (ni === sc.nodes.length - 1 ? 'Lihat hasil →' : 'Lanjut percakapan →') + '</button>'; $('#rp-next', c).onclick = () => { ni++; answered = false; if (ni >= sc.nodes.length) finish(); else draw(); }; }
        $$('[data-rpc]', c).forEach(x => x.disabled = true);
      }
    }
    function finish() {
      const pct = Math.round(score / max * 100);
      bumpSkill('speak', score, max);
      awardBonus(Math.round(pct / 10), 'roleplay');
      c.innerHTML = '<div class="wrap"><div class="card" style="max-width:640px;margin:30px auto;text-align:center"><div class="sect-label">Hasil role-play</div><h1 class="page">' + pct + '%</h1><p class="muted">Kesopanan & ketepatan: ' + score + '/' + max + ' di situasi ' + esc(sc.place) + '.</p>' +
        (saran.length ? '<div class="warn" style="text-align:left;margin-top:12px"><b>Saran jawaban yang lebih baik:</b>' + saran.map(s2 => '<p style="margin-top:6px">Untuk "' + esc(s2.npc) + '" → <b>' + esc(s2.best) + '</b></p>').join('') + '</div>' : '<div class="good" style="text-align:left;margin-top:12px"><b>Sempurna</b> — semua jawabanmu sopan & tepat.</div>') +
        '<div class="quiz-actions" style="justify-content:center"><button type="button" class="btn white" id="rp-again">Skenario lain</button></div></div></div>';
      $('#rp-again', c).onclick = pick;
    }
    draw();
  }
  pick();
}
/* ===== SHADOWING + REKAMAN (Pilar 2c) ===== */
function pageShadowing(c) {
  const pool = DG.core[S.lang].filter(w => w[2]);
  let cur = pool[Math.floor(Math.random() * pool.length)];
  let audioUrl = null, recDur = 0;
  const canRec = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  c.innerHTML = '<div class="wrap"><h1 class="page">Shadowing — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Untuk apa: meniru bunyi penutur asli secepat mungkin. Dengarkan kalimatnya, rekam suaramu menirukannya, lalu putar berdampingan & bandingkan.</p>' +
    '<div class="card" style="max-width:680px;margin:16px auto 0"><div class="sect-label" style="margin-top:0">Kalimat target</div><p style="font-size:20px"><b>' + esc(cur[2]) + '</b></p><p class="muted">' + esc(cur[3]) + '</p>' +
    '<div class="quiz-actions"><button type="button" class="btn white" id="sh-listen">🔊 Dengarkan kalimat</button><button type="button" class="btn white" id="sh-new">Kalimat lain</button></div>' +
    '<div class="sect-label">Rekam tiruanmu</div>' +
    (canRec ? '<div class="quiz-actions"><button type="button" class="btn red" id="sh-rec">● Mulai rekam</button><span class="small muted" id="sh-status">Mikrofon hanya dipakai di perangkatmu; rekaman tidak diunggah.</span></div>' : '<p class="warn"><b>Rekaman tidak didukung</b> di peramban/perangkat ini (butuh izin mikrofon + MediaRecorder). Kamu tetap bisa shadowing lisan: dengarkan, lalu tirukan keras-keras.</p>') +
    '<div id="sh-play" style="margin-top:12px"></div><canvas id="sh-wave" width="640" height="80" style="width:100%;height:80px;background:var(--pink);border-radius:10px;margin-top:10px"></canvas>' +
    '<div id="sh-cmp" style="margin-top:10px"></div>' +
    '<p class="small muted" style="margin-top:10px">Penilaian di sini sederhana (durasi + pengenalan suara bila tersedia di perambanmu) — bukan penilaian pengucapan AI penuh.</p></div></div>';
  const wave = $('#sh-wave', c);
  const drawWave = (seed) => { try { const g = wave.getContext('2d'); if (!g) return; g.clearRect(0, 0, wave.width, wave.height); g.fillStyle = '#C03A2F'; let x = 6; let s = seed || 7; while (x < wave.width - 6) { s = (s * 1103515245 + 12345) % 2147483648; const h = 8 + (s % 56); g.fillRect(x, 40 - h / 2, 4, h); x += 9; } } catch (e) {} };
  drawWave(3);
  $('#sh-listen', c).onclick = e => speak(cur[2], e.currentTarget);
  $('#sh-new', c).onclick = () => pageShadowing(c);
  const recBtn = $('#sh-rec', c);
  if (recBtn && canRec) {
    let mr = null, chunks = [], t0 = 0;
    recBtn.onclick = async () => {
      if (mr && mr.state === 'recording') { mr.stop(); return; }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        chunks = [];
        mr = new MediaRecorder(stream);
        mr.ondataavailable = e => chunks.push(e.data);
        mr.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          recDur = (Date.now() - t0) / 1000;
          const blob = new Blob(chunks, { type: 'audio/webm' });
          if (audioUrl) URL.revokeObjectURL(audioUrl);
          audioUrl = URL.createObjectURL(blob);
          recBtn.textContent = '● Rekam ulang';
          $('#sh-status', c).textContent = 'Rekaman selesai (' + recDur.toFixed(1) + ' detik).';
          $('#sh-play', c).innerHTML = '<audio controls src="' + audioUrl + '" style="width:100%"></audio>';
          drawWave(11);
          const est = Math.max(1, cur[2].length / (S.lang === 'en' ? 14 : 6));
          const ratio = Math.min(recDur, est) / Math.max(recDur, est);
          const skor = Math.round(ratio * 100);
          $('#sh-cmp', c).innerHTML = '<div class="' + (skor >= 70 ? 'good' : 'warn') + '"><b>Perbandingan sederhana:</b> durasi tiruanmu ' + recDur.toFixed(1) + ' dtk vs perkiraan penutur ±' + est.toFixed(1) + ' dtk — kemiripan tempo ' + skor + '%.' + (SR ? ' Tekan tombol di bawah untuk memeriksa kata-katamu lewat pengenalan suara.' : '') + '</div>' + (SR ? '<div class="quiz-actions"><button type="button" class="btn white" id="sh-sr">Cek ucapanku (pengenalan suara)</button></div><p class="small" id="sh-sr-out" style="margin-top:8px"></p>' : '');
          bumpSkill('speak', skor >= 70 ? 1 : 0, 1);
          const srb = $('#sh-sr', c);
          if (srb) srb.onclick = () => {
            const out = $('#sh-sr-out', c);
            try {
              const rec = new SR(); rec.lang = LANGMETA[S.lang].tts; rec.interimResults = false;
              rec.onresult = e => {
                const said = e.results[0][0].transcript;
                const targetWords = cur[2].toLowerCase().replace(/[.!?。]/g, '').split(/\s+/).filter(Boolean);
                const saidWords = said.toLowerCase().replace(/[.!?。]/g, '').split(/\s+/).filter(Boolean);
                const hit = targetWords.filter(w2 => saidWords.includes(w2)).length;
                const pct = targetWords.length ? Math.round(hit / targetWords.length * 100) : 0;
                out.innerHTML = 'Yang terdengar: "<b>' + esc(said) + '</b>" — kemiripan kata dengan target: <b>' + pct + '%</b>.';
              };
              rec.onerror = () => { out.textContent = 'Pengenalan suara gagal di perangkat ini — tidak apa-apa, bandingkan lewat rekaman di atas.'; };
              out.textContent = 'Mendengarkan… ucapkan kalimat target sekarang.';
              rec.start();
            } catch (e) { out.textContent = 'Pengenalan suara tidak tersedia di peramban ini.'; }
          };
        };
        t0 = Date.now();
        mr.start();
        recBtn.textContent = '■ Berhenti merekam';
        $('#sh-status', c).textContent = 'Merekam… tirukan kalimat targetnya sekarang.';
      } catch (e) { toast('Izin mikrofon ditolak atau tidak tersedia.'); }
    };
  }
}
/* ===== KESALAHAN SAYA — bank kesalahan pribadi (Pilar 4b) ===== */
function pageMyErrors(c) {
  const log = LS().errLog || [];
  if (!log.length) {
    c.innerHTML = '<div class="wrap"><h1 class="page">Kesalahan Saya — ' + LANGMETA[S.lang].name + '</h1><p class="sub">Bank kesalahan pribadimu — beda dari Kesalahan Umum: halaman ini mengumpulkan kesalahanmu sendiri dari kuis & latihan.</p><div class="card" style="margin-top:16px"><b>Belum ada kesalahan tercatat.</b><p class="muted" style="margin-top:6px">Kerjakan kuis modul, Kuis Latihan, atau simulasi ujian — setiap jawaban salah akan terkumpul otomatis di sini lengkap dengan jawaban benar & penjelasannya, siap dilatih lagi.</p><div class="quiz-actions"><button type="button" class="btn" id="me-go">Mulai Kuis Latihan →</button></div></div></div>';
    $('#me-go', c).onclick = () => go('practice');
    return;
  }
  c.innerHTML = '<div class="wrap"><h1 class="page">Kesalahan Saya — ' + LANGMETA[S.lang].name + '</h1><p class="sub">' + log.length + ' kesalahan terakhir dari kuis & latihanmu — soal, jawabanmu, jawaban benar, dan penjelasannya.</p>' +
    '<div class="card" style="margin-top:14px"><b>Untuk apa:</b> kesalahan yang sama tidak terulang. Latih lagi semuanya dalam satu kuis perbaikan.<div class="quiz-actions"><button type="button" class="btn" id="me-retry">Latih lagi kesalahan ini →</button><button type="button" class="btn white" id="me-clear">Bersihkan daftar</button></div></div>' +
    log.map((e, ei) => '<div class="card" style="margin-top:12px"><span class="chip">' + esc(e.tag) + '</span><p style="margin-top:8px"><b>' + esc(e.prompt) + '</b></p>' + (e.context ? '<p class="small muted" style="margin-top:4px">' + esc(e.context) + '</p>' : '') + '<p style="margin-top:6px"><span style="color:var(--red)">Jawabanmu: <b>' + esc(e.user) + '</b></span> → <span style="color:var(--green)">Benar: <b>' + esc(e.answer) + '</b></span></p>' + (e.explain ? '<p class="muted small" style="margin-top:4px">' + esc(e.explain) + '</p>' : '') + '<div class="quiz-actions"><button type="button" class="btn white small" data-tutor-ask="' + ei + '">Jelaskan kenapa saya salah — tanya Tutor AI</button></div></div>').join('') + '</div>';
  $('#me-clear', c).onclick = () => { LS().errLog = []; save(); pageMyErrors(c); };
  $$('[data-tutor-ask]', c).forEach(b => b.onclick = () => { const e = log[+b.dataset.tutorAsk]; S._tutorPrefill = 'Jelaskan kenapa jawaban saya salah. Soalnya: ' + e.prompt + ' — jawaban saya: ' + e.user + ', yang benar: ' + e.answer + '.'; save(); go('tutor'); });
  $('#me-retry', c).onclick = () => {
    const seen = new Set(), qs = [];
    for (const e of log) {
      if (seen.has(e.prompt) || qs.length >= 10) continue;
      seen.add(e.prompt);
      if (e.type === 'mc' && e.options) { const ai = e.options.indexOf(e.answer); if (ai >= 0) qs.push({ type: 'mc', prompt: e.prompt, options: e.options, answer: ai, context: e.context, explain: e.explain, tag: e.tag }); }
      else qs.push({ type: 'fill', prompt: e.prompt, answer: e.answer, context: e.context, explain: e.explain, tag: e.tag });
    }
    if (!qs.length) { toast('Soal latihan ulang belum bisa dibuat dari daftar ini.'); return; }
    runQuiz(c, { routeName: 'myerrors', title: 'LATIH LAGI — KESALAHAN SAYA', sub: 'Soal-soal yang pernah kamu jawab salah. Kali ini pelan-pelan ya.', questions: qs,
      finish(cc, pct, ok, total) { cc.innerHTML = '<div class="wrap"><div class="card" style="max-width:560px;margin:30px auto;text-align:center"><div class="sect-label">Selesai</div><h1 class="page">' + pct + '%</h1><p class="muted">' + ok + '/' + total + ' kesalahan lama kini benar.</p><button type="button" class="btn" style="margin-top:14px" id="me-back">Kembali ke Kesalahan Saya</button></div></div>'; $('#me-back', cc).onclick = () => go('myerrors'); } });
  };
}

function dashboardHTML() {
  const st2 = LS();
  const skillPct = k => st2.skills[k].total ? Math.round(st2.skills[k].ok / st2.skills[k].total * 100) : 0;
  const mastered = Object.values(st2.srs).filter(x => (x.iv || 0) >= 9).length + Object.values(st2.srsCustom || {}).filter(x => (x.iv || 0) >= 9).length;
  const jenjang = st2.placement || (doneCount() >= 36 ? 'C2' : doneCount() >= 24 ? 'B2' : doneCount() >= 12 ? 'A2' : doneCount() >= 6 ? 'A1' : st2.flags.script ? 'A0' : 'Nol');
  const checks = [
    ['Bisa mengenal huruf & bunyi bahasa ini', !!st2.flags.script],
    ['Bisa memperkenalkan diri & menyapa', doneCount() >= 1],
    ['Bisa mengobrol kebutuhan sehari-hari', doneCount() >= 12],
    ['Bisa memahami bacaan umum (skor membaca ≥60%)', st2.skills.read.total >= 10 && skillPct('read') >= 60],
    ['Bisa mendengar & menuliskan kalimat (dikte/listening)', st2.skills.listen.total >= 3],
    ['Bisa menulis kalimat & paragraf sendiri', st2.skills.write.total >= 1],
    ['Bisa merespons dalam simulasi percakapan', st2.skills.speak.total >= 1],
    ['Siap menghadapi ujian jenjang tertinggi', doneCount() >= 36]
  ];
  const bar = (label, k) => '<div style="margin:8px 0"><div style="display:flex;justify-content:space-between"><span>' + label + '</span><b>' + skillPct(k) + '%</b></div><div class="pbar" style="margin-top:4px"><i style="width:' + skillPct(k) + '%"></i></div><p class="small muted">' + st2.skills[k].ok + '/' + st2.skills[k].total + ' percobaan tercatat</p></div>';
  return '<div class="card" style="margin:16px 0"><div class="sect-label" style="margin-top:0">Dashboard Kemahiran — Bahasa ' + LANGMETA[S.lang].name + '</div>' +
    '<p style="font-size:17px">Jenjang CEFR-mu saat ini: <b>' + jenjang + '</b>' + (CAN_DO[jenjang] ? ' — ' + esc(CAN_DO[jenjang][0]) : '') + '</p>' +
    '<div class="grid2" style="align-items:start"><div>' + bar('Membaca', 'read') + bar('Mendengar', 'listen') + '</div><div>' + bar('Berbicara', 'speak') + bar('Menulis', 'write') + '</div></div>' +
    '<p style="margin-top:10px"><b>Kata yang benar-benar dikuasai:</b> ' + mastered + ' dari target 500 kata inti (level SRS "Ingat/Mudah" — bukan sekadar pernah dilihat).</p><div class="pbar" style="margin-top:6px"><i style="width:' + Math.min(100, Math.round(mastered / 500 * 100)) + '%"></i></div>' +
    '<div class="sect-label">Checklist "Saya bisa …" (tercentang otomatis)</div>' + checks.map(x => '<p style="margin:5px 0">' + (x[1] ? '<span style="color:var(--green)"><b>☑</b></span>' : '<span class="muted">☐</span>') + ' ' + x[0] + '</p>').join('') +
    '<p class="small muted" style="margin-top:8px">Skor skill dihitung dari hasil nyata kuis, bacaan, listening/dikte, role-play, shadowing, dan tulisanmu — bukan dari XP.</p></div>';
}
/* ===== TUTOR AI (Gemini via Supabase Edge Function — key TIDAK PERNAH di frontend) ===== */
// Isi URL Edge Function "tutor-ai" setelah deploy (lihat CARA-DEPLOY-TUTOR-AI.md).
// Kosong = Tutor AI belum aktif: chat tetap jalan dengan bantuan berbasis aturan dari materi.
const TUTOR_AI_URL = 'https://tdwkghphdppwvznxcggz.supabase.co/functions/v1/tutor-ai';
function tutorLevel() { return LS().placement || 'A0'; }
function tutorLocalHelp(q) {
  const t = ' ' + String(q || '').toLowerCase() + ' ';
  const links = [];
  let text = '';
  const wordHit = DG.core[S.lang].concat(DG.vocab[S.lang]).find(w => { const w0 = String((w && w[0]) || '').toLowerCase(); const w1 = String((w && w[1]) || ''); return w0 && (t.includes(' ' + w0) || t.includes(w0 + ' ') || (w1.length >= 4 && t.includes(w1.toLowerCase().split('(')[0].trim()))); });
  if (wordHit) text += 'Menurut materi DidiGo: "' + wordHit[0] + '" artinya "' + wordHit[1] + '"' + (wordHit[2] ? '. Contoh: ' + wordHit[2] + ' — ' + wordHit[3] : '') + '. ';
  if (/partikel|grammar|tata bahasa|pola|을|를|は|を|に/.test(t)) links.push(['Tata Bahasa per Level', 'grammar']);
  if (/salah|kenapa|kesalahan/.test(t)) links.push(['Kesalahan Saya', 'myerrors'], ['Kesalahan Umum Penutur Indonesia', 'mistakes']);
  if (/arti|kamus|kosakata|vocab/.test(t)) links.push(['Kosakata', 'vocab']);
  if (/koreksi|periksa kalimat|betulkan/.test(t)) links.push(['Periksa Tulisan (Menulis)', 'writing']);
  if (/percakapan|bicara|ngobrol|speaking|restoran|bandara|kantor/.test(t)) links.push(['Simulasi Percakapan', 'roleplay'], ['Dialog Situasional', 'dialogs']);
  if (/ucap|bunyi|pelafalan|pronunciation/.test(t)) links.push(['Pengucapan & Bunyi', 'bunyi']);
  if (/tulis|aksara|hangul|kana|huruf/.test(t)) links.push(['Belajar Menulis Aksara', 'script']);
  if (/frasa/.test(t)) links.push(['Frasa Sehari-hari', 'frasa']);
  if (!text && !links.length) return null;
  if (!text) text = 'Menurut materi DidiGo, topik itu dibahas di halaman berikut:';
  return { text, links };
}
function pageTutor(c) {
  const hist = () => S.tutor[S.lang];
  function draw() {
    const priv = !!S.tutorPrivate;
    c.innerHTML = '<div class="wrap"><h1 class="page">Tutor AI — Bahasa ' + LANGMETA[S.lang].name + '</h1>' +
      '<p class="sub">Tutor AI DidiGo berbasis Google Gemini (bukan Muse — Muse tidak menyediakan API publik untuk dipasang ke web seperti ini). Tutor tahu bahasa aktifmu (' + LANGMETA[S.lang].name + ') dan jenjangmu (' + tutorLevel() + '), dan menyesuaikan penjelasannya.</p>' +
      '<div class="card" style="margin-top:14px"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center"><span class="chip">' + (priv ? 'Mode Privat AKTIF — tidak ada data yang keluar' : TUTOR_AI_URL ? 'Tutor AI aktif' : 'Tutor AI belum aktif') + '</span>' +
      '<button type="button" class="btn ' + (priv ? '' : 'white') + ' small" id="tu-priv">Mode Privat: ' + (priv ? 'AKTIF' : 'nonaktif') + '</button></div>' +
      '<p class="small muted" style="margin-top:8px">Yang dikirim ke AI hanya pertanyaan yang kamu ketik di chat ini + bahasa & jenjangmu — BUKAN nama, email, XP, progres, atau data akunmu. Mode Privat mematikan Tutor AI sepenuhnya: tidak ada satu huruf pun yang keluar dari web; yang menjawab hanya bantuan berbasis aturan dari materi DidiGo.</p></div>' +
      '<div class="card" style="margin-top:14px"><div id="tu-msgs">' +
      (hist().length ? hist().map(m => '<div class="tu-msg ' + (m.r === 'u' ? 'u' : 'a') + '"><b>' + (m.r === 'u' ? 'Kamu' : 'Tutor') + '</b><p>' + (m.r === 'a' ? md(m.t) : esc(m.t)) + '</p>' + (m.links && m.links.length ? '<div class="chiprow" style="margin-top:8px">' + m.links.map(l => '<button type="button" class="chip" data-tu-link="' + l[1] + '">' + esc(l[0]) + ' →</button>').join('') + '</div>' : '') + '</div>').join('')
        : '<p class="muted">Halo! Tanyakan apa saja soal Bahasa ' + LANGMETA[S.lang].name + ': arti kata, grammar, koreksi kalimat, atau latihan percakapan. Contoh: "kenapa pakai partikel itu?", "koreksi kalimat saya", "latihan percakapan di restoran".</p>') +
      '</div>' +
      '<div class="chiprow" style="margin-top:12px">' + ['Jelaskan grammar yang sering saya salah', 'Koreksi kalimat saya: ', 'Latihan percakapan: di restoran', 'Jelaskan kesalahan saya terakhir'].map(q => '<button type="button" class="chip" data-tu-q="' + esc(q) + '">' + esc(q) + '</button>').join('') + '</div>' +
      '<div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap"><textarea id="tu-in" rows="2" maxlength="1000" style="flex:1;min-width:220px;border:1px solid var(--line);border-radius:12px;padding:11px" placeholder="Ketik pertanyaanmu… (maks 1000 karakter)"></textarea><button type="button" class="btn" id="tu-send">Kirim</button><button type="button" class="btn white" id="tu-new">Percakapan baru</button></div>' +
      '<p class="small muted" style="margin-top:10px">Jawaban Tutor AI bisa sesekali keliru — cek juga di materi pelajaran & Sumber & Referensi. Batas pemakaian: ±20 pertanyaan/hari untuk tamu, lebih longgar bila sudah masuk.</p></div></div>';
    $('#tu-priv', c).onclick = () => { S.tutorPrivate = !S.tutorPrivate; save(); draw(); toast(S.tutorPrivate ? 'Mode Privat AKTIF — Tutor AI dimatikan, tidak ada data yang keluar.' : 'Mode Privat nonaktif.'); };
    $('#tu-new', c).onclick = () => { S.tutor[S.lang] = []; save(); draw(); };
    $$('[data-tu-q]', c).forEach(b => b.onclick = () => { const inp = $('#tu-in', c); inp.value = b.dataset.tuQ; inp.focus(); });
    $$('[data-tu-link]', c).forEach(b => b.onclick = () => go(b.dataset.tuLink));
    $('#tu-send', c).onclick = send;
    $('#tu-in', c).addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
    const msgs = $('#tu-msgs', c); if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }
  async function send() {
    const inp = $('#tu-in', c); if (!inp) return;
    const q = inp.value.trim(); if (!q) return;
    hist().push({ r: 'u', t: q }); save(); draw();
    if (S.tutorPrivate) {
      const help = tutorLocalHelp(q);
      hist().push({ r: 'a', t: help ? help.text : 'Mode privat aktif — saya hanya bisa mengarahkanmu ke materi yang sudah ada di web, dan pertanyaan ini belum dikenali kata kuncinya. Matikan mode privat untuk bertanya bebas ke Tutor AI.', links: help ? help.links : [] });
      save(); draw(); return;
    }
    if (!TUTOR_AI_URL) {
      const help = tutorLocalHelp(q);
      hist().push({ r: 'a', t: 'Tutor AI belum aktif — ikuti CARA-DEPLOY-TUTOR-AI.md untuk mengaktifkannya (gratis). Sementara itu, bantuan dari materi DidiGo: ' + (help ? help.text : 'coba tanyakan soal kata atau grammar tertentu, nanti saya arahkan ke materinya.'), links: help ? help.links : [['Tata Bahasa', 'grammar'], ['Kosakata', 'vocab']] });
      save(); draw(); return;
    }
    const today = todayStr();
    if (S.tutorUsage.day !== today) S.tutorUsage = { day: today, count: 0 };
    const limit = S.user ? 60 : 20;
    if (S.tutorUsage.count >= limit) { hist().push({ r: 'a', t: 'Kuota Tutor AI hari ini sudah habis (' + limit + ' pertanyaan/hari' + (S.user ? '' : ' untuk tamu — masuk untuk kuota lebih longgar') + '). Coba lagi besok, atau nyalakan Mode Privat untuk bantuan dari materi.' }); save(); draw(); return; }
    S.tutorUsage.count++; save();
    hist().push({ r: 'a', t: 'Tutor sedang mengetik…' }); draw();
    try {
      const res = await fetch(TUTOR_AI_URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY, 'apikey': SUPABASE_ANON_KEY }, body: JSON.stringify({ message: q, lang: S.lang, level: tutorLevel(), history: hist().slice(-9, -1).map(m => ({ role: m.r === 'u' ? 'user' : 'model', text: m.t })) }) });
      const data = await res.json().catch(() => ({}));
      hist()[hist().length - 1].t = data.reply || data.text || 'Maaf, Tutor AI tidak menjawab. Coba lagi sebentar lagi.';
    } catch (e) { hist()[hist().length - 1].t = 'Koneksi ke Tutor AI gagal. Periksa lagi nanti — atau nyalakan Mode Privat untuk bantuan dari materi.'; }
    save(); draw();
  }
  draw();
  if (S._tutorPrefill) { const inp = $('#tu-in', c); if (inp) inp.value = S._tutorPrefill; S._tutorPrefill = ''; save(); }
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
  c.innerHTML = '<div class="wrap"><h1 class="page">Progres & Dashboard Kemahiran</h1>' + dashboardHTML() + '<div class="tabs">' + [['act', 'Aktivitas'], ['ach', 'Pencapaian']].map(t => '<button type="button" class="tab' + (progTab === t[0] ? ' active' : '') + '" data-ptab="' + t[0] + '">' + t[1] + '</button>').join('') + '</div>' + body + '</div>';
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
    '<p class="small muted" style="margin-top:14px">DidiGo v22 · Belajar Bahasa Asing, selangkah demi selangkah.</p></div></div>';
  $('#set-save', c).onclick = () => { S.name = $('#set-name', c).value.trim(); save(); const L = $('#set-lang', c).value; if (L !== S.lang) setLang(L); renderSidebar(); toast('Pengaturan tersimpan.'); };
  const lg = $('#set-login', c); if (lg) lg.onclick = openAuth;
  const vsec = document.createElement('div');
  vsec.className = 'card'; vsec.style.marginTop = '16px'; vsec.style.maxWidth = '560px';
  const ttsOf = { en: 'en-US', ko: 'ko-KR', ja: 'ja-JP' };
  const sample = { en: 'Hello, how are you today?', ko: '안녕하세요, 오늘 기분이 어때요?', ja: 'こんにちは、今日は元気ですか。' };
  let vhtml = '<div class="sect-label" style="margin-top:0">Pengatur suara dialog (laki-laki & perempuan)</div><p class="muted" style="margin-bottom:10px">Suara perempuan dipilih dari voice perempuan terbaik per bahasa (mis. Heami untuk Korea, Haruka/Nanami untuk Jepang) dan suara laki-laki dari voice laki-laki terbaik dari SUMBER yang BERBEDA bila memungkinkan (mis. perempuan dari Google, laki-laki dari Microsoft), keduanya dengan nada natural. Kamu juga bisa memilih sendiri voice per bahasa dari voice yang terpasang di perangkatmu — pilihan tersimpan. Semua suara ini gratis dari perangkatmu (Web Speech API); suara cloud berkualitas studio (Google Cloud TTS, Azure, ElevenLabs) butuh API key/berbayar dan tidak dipakai di sini.</p>';
  for (const L2 of ['en', 'ko', 'ja']) {
    const vs = voicesForLang(ttsOf[L2]);
    const optFor = g => '<option value="">Otomatis (pilihan DidiGo)</option>' + vs.map(v => '<option value="' + esc(v.name) + '"' + (S.voices[ttsOf[L2] + ':' + g] === v.name ? ' selected' : '') + '>' + esc(v.name) + ' — ' + providerOf(v) + ' (' + esc(v.lang) + ')</option>').join('');
    const hasMale = vs.some(v => voiceGenderOf(v.name) === 'male');
    const hasFemale = vs.some(v => voiceGenderOf(v.name) === 'female');
    vhtml += '<div style="margin-top:14px"><b>Bahasa ' + LANGMETA[L2].name + '</b>' +
      '<div style="display:grid;gap:8px;margin-top:8px"><label class="small">Suara laki-laki <select id="vs-' + L2 + '-male" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink)">' + optFor('male') + '</select></label>' +
      '<label class="small">Suara perempuan <select id="vs-' + L2 + '-female" style="width:100%;padding:10px;border:1px solid var(--line);border-radius:9px;background:var(--card);color:var(--ink)">' + optFor('female') + '</select></label></div>' +
      '<div class="quiz-actions"><button type="button" class="btn white small" data-tryv="' + L2 + ':male">🔊 Coba dengar laki-laki</button><button type="button" class="btn white small" data-tryv="' + L2 + ':female">🔊 Coba dengar perempuan</button></div>' +
      (!hasMale ? '<p class="small" style="color:var(--amber);margin-top:6px">Di perangkat ini tidak ada suara laki-laki ' + LANGMETA[L2].name + ' yang bagus terdeteksi — memakai suara standar dengan nada yang disesuaikan sedikit.</p>' : '') +
      (!hasFemale ? '<p class="small" style="color:var(--amber);margin-top:6px">Di perangkat ini tidak ada suara perempuan ' + LANGMETA[L2].name + ' yang bagus terdeteksi — memakai suara standar dengan nada yang disesuaikan sedikit.</p>' : '') + '</div>';
  }
  vsec.innerHTML = vhtml;
  c.querySelector('.wrap').appendChild(vsec);
  for (const L2 of ['en', 'ko', 'ja']) for (const g of ['male', 'female']) {
    const selEl = $('#vs-' + L2 + '-' + g, vsec);
    selEl.onchange = () => { if (selEl.value) S.voices[ttsOf[L2] + ':' + g] = selEl.value; else delete S.voices[ttsOf[L2] + ':' + g]; save(); toast('Pilihan suara tersimpan.'); };
  }
  $$('[data-tryv]', vsec).forEach(b => b.onclick = () => {
    const [L2, g] = b.dataset.tryv.split(':');
    if (!('speechSynthesis' in window)) { toast('Peramban ini tidak mendukung suara.'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(sample[L2]); u.lang = ttsOf[L2]; u.rate = ttsRate;
    const selEl = $('#vs-' + L2 + '-' + g, vsec);
    const chosen = selEl.value ? allVoices().find(v => v.name === selEl.value) : null;
    const pick = g === 'female' ? pickFemaleVoice(u.lang) : pickMaleVoice(u.lang);
    if (chosen) { try { u.voice = chosen; } catch (e) {} u.pitch = g === 'female' ? 1.12 : 1.0; }
    else if (pick.voice) { try { u.voice = pick.voice; } catch (e) {} u.pitch = pick.pitch; }
    else u.pitch = g === 'female' ? 1.0 : 0.97;
    speechSynthesis.speak(u);
  });
}
/* ===== PENCARIAN ===== */
/* ===== PENCARIAN GLOBAL (PERBAIKAN2) =====
   Bar pencarian atas sekarang hidup: mengetik langsung menampilkan hasil
   (dropdown) dari modul, kosakata (kata + arti + romanisasi + contoh),
   bacaan, dialog, dan fitur — bahasa aktif dulu, lalu bahasa lain dengan
   label bahasanya. Tidak case-sensitive, spasi berlebih diabaikan. */
const SEARCH_FEATURES = [
  { keys: ['eps', 'eps-topik', 'eps topik', 'kerja korea', 'pekerja migran'], title: 'EPS-TOPIK — Kerja ke Korea', sub: 'Ujian Bahasa Korea untuk bekerja di Korea: kosakata kerja, bank soal, simulasi', lang: 'ko', route: 'eps' },
  { keys: ['idiom', 'phrasal', 'ungkapan'], title: 'Idiom & Phrasal Verbs', sub: '349 ungkapan Bahasa Inggris dengan arti & contoh', lang: 'en', route: 'idioms' },
  { keys: ['frasa', 'sehari-hari', 'sehari hari', 'belanja', 'darurat', 'tanya arah', 'telepon', 'rumah sakit'], title: 'Frasa Sehari-hari — 100 Frasa Wajib', sub: 'Frasa paling sering dipakai + audio + kartu hafalan frasa', route: 'frasa' },
  { keys: ['pengucapan', 'bunyi', 'batchim', 'pelafalan', 'pronunciation', '연음'], title: 'Pengucapan & Bunyi yang Membingungkan', sub: 'Penjelasan + contoh bunyi + latihan bedakan bunyi', route: 'bunyi' },
  { keys: ['sopan', 'santai', 'formal', 'keigo', '존댓말', '반말'], title: 'Bahasa Sopan vs Santai', sub: 'Kapan pakai yang sopan, kapan yang santai + contoh dialog', route: 'sopan' },
  { keys: ['kesalahan', 'salah'], title: 'Kesalahan Umum Penutur Indonesia', sub: 'Kesalahan yang sering dibuat + bentuk benarnya + latihan', route: 'mistakes' },
  { keys: ['tata bahasa', 'grammar', 'pola kalimat'], title: 'Tata Bahasa per Level', sub: 'Pola A0–C2 dengan contoh + latihan langsung', route: 'grammar' },
  { keys: ['jlpt'], title: 'JLPT — Persiapan Ujian Jepang', sub: 'Bank soal + simulasi JLPT N5–N3', lang: 'ja', route: 'exams' },
  { keys: ['topik'], title: 'TOPIK — Persiapan Ujian Korea', sub: 'Bank soal + simulasi TOPIK I & II', lang: 'ko', route: 'exams' },
  { keys: ['ielts', 'toefl', 'toeic', 'cambridge'], title: 'Ujian Bahasa Inggris — IELTS / TOEFL / TOEIC / Cambridge', sub: 'Simulasi + strategi + rencana belajar', lang: 'en', route: 'exams' },
  { keys: ['vocab priority', 'kosakata prioritas', 'prioritas'], title: 'Vocab Priority — TOPIK/EPS', sub: '180 kata Korea paling prioritas untuk TOPIK/EPS', lang: 'ko', route: 'khusus' },
  { keys: ['fitur khusus', 'khusus'], title: 'Fitur Khusus Bahasa', sub: 'Frasa, pengucapan, bahasa sopan, ujian & sertifikasi, kesalahan umum', route: 'khusus' },
  { keys: ['gks', 'beasiswa'], title: 'GKS Writing Prep', sub: 'Persiapan menulis beasiswa GKS Korea', lang: 'ko', route: 'examwriting' },
  { keys: ['dikte', 'dictation'], title: 'Dikte', sub: 'Dengarkan kalimat lalu ketik persis seperti yang didengar', route: 'dictation' },
  { keys: ['dialog', 'percakapan'], title: 'Dialog Situasional', sub: '12 percakapan per bahasa, suara laki-laki & perempuan', route: 'dialogs' },
  { keys: ['sumber', 'referensi', 'rujukan'], title: 'Sumber & Referensi', sub: 'Rujukan resmi di balik arti kata DidiGo', route: 'sumber' },
  { keys: ['kartu hafalan', 'flashcard', 'srs'], title: 'Kartu Hafalan (SRS)', sub: 'Hafalkan kosakata dengan pengulangan terjadwal', route: 'flashcards' },
  { keys: ['menulis', 'aksara', 'hangul', 'kana'], title: 'Belajar Menulis Aksara', sub: 'Alfabet, Hangul, Kana & Kanji dengan latihan Coba Tulis', route: 'script' },
  { keys: ['listening', 'mendengar', 'transkrip'], title: 'Listening — Dengarkan + Transkrip', sub: 'Percakapan & bacaan dengan transkrip tampil/sembunyi + kecepatan putar + soal pemahaman', route: 'listening' },
  { keys: ['roleplay', 'role-play', 'simulasi percakapan', 'restoran', 'bandara', 'rumah sakit', 'kantor'], title: 'Simulasi Percakapan (Role-play)', sub: 'Role-play situasi nyata: pilihanmu mengubah percakapan, dinilai kesopanan & ketepatan', route: 'roleplay' },
  { keys: ['shadowing', 'rekam', 'mikrofon', 'menirukan'], title: 'Shadowing — Rekam & Tirukan', sub: 'Dengarkan kalimat, rekam suaramu, bandingkan hasilnya', route: 'shadowing' },
  { keys: ['kesalahan saya', 'bank kesalahan', 'latih lagi'], title: 'Kesalahan Saya — Bank Kesalahan Pribadi', sub: 'Semua kesalahan kuis & latihanmu + tombol latih lagi', route: 'myerrors' },
  { keys: ['kemahiran', 'dashboard', 'cefr', 'progres'], title: 'Dashboard Kemahiran', sub: 'Skor 4 skill, checklist "Saya bisa …", kata yang dikuasai, jenjang CEFR-mu', route: 'progress' },
  { keys: ['koreksi', 'periksa tulisan'], title: 'Periksa Tulisan — Koreksi Menulis', sub: 'Koreksi otomatis tulisanmu + kalimat perbaikan + penjelasan', route: 'writing' },
  { keys: ['tutor', 'tutor ai', 'tanya', 'chat', 'gemini'], title: 'Tutor AI — Tanya Apa Saja soal Bahasa', sub: 'Chat tutor: tanya grammar, koreksi kalimat, latihan percakapan (berbasis Gemini via Edge Function)', route: 'tutor' }
];
function normQ(q) { return String(q || '').trim().toLowerCase().replace(/\s+/g, ' '); }
function searchAll(qRaw) {
  const q = normQ(qRaw); if (!q) return [];
  const out = [], seen = new Set();
  const push = r => { const k = r.kind + '|' + (r.lang || '') + '|' + r.title; if (!seen.has(k)) { seen.add(k); out.push(r); } };
  SEARCH_FEATURES.forEach(f => { if (f.keys.some(k => k.includes(q) || (q.length >= 3 && q.includes(k)))) push({ kind: 'Fitur', lang: f.lang || S.lang, title: f.title, sub: f.sub, route: f.route }); });
  const langs = [S.lang].concat(['en', 'ko', 'ja'].filter(L => L !== S.lang));
  langs.forEach(L => DG.lessons[L].forEach(les => { if ((les.title + ' ' + les.desc + ' ' + les.level).toLowerCase().includes(q)) push({ kind: 'Modul', lang: L, title: les.title + ' (' + les.level + ')', sub: 'Modul Bahasa ' + LANGMETA[L].name, route: 'lesson', params: { id: les.id, part: 0 } }); }));
  langs.forEach(L => {
    const hits = [], seenW = new Set();
    const consider = (w, srcLabel) => {
      const hay = (w[0] + ' ' + w[1] + ' ' + (w[2] || '') + ' ' + (w[3] || '')).toLowerCase();
      if (!hay.includes(q)) return;
      const exact = String(w[0]).toLowerCase() === q || String(w[1]).toLowerCase().split('—')[0].trim() === q;
      hits.push({ w, exact, srcLabel });
    };
    DG.core[L].forEach(w => consider(w, '500 kata inti'));
    Object.keys(DG.vocab[L]).forEach(lid => DG.vocab[L][lid].forEach(w => consider(w, 'kosakata modul')));
    hits.sort((a, b) => (b.exact ? 1 : 0) - (a.exact ? 1 : 0));
    for (const h of hits) { if (seenW.has(h.w[0])) continue; seenW.add(h.w[0]); push({ kind: 'Kosakata', lang: L, title: h.w[0] + ' — ' + h.w[1], sub: 'Kosakata Bahasa ' + LANGMETA[L].name + ' · ' + h.srcLabel, route: 'vocab', word: h.w[0] }); if (seenW.size >= 6) break; }
  });
  langs.forEach(L => {
    DG.readings[L].forEach(r => { if ((r.title + ' ' + r.cat).toLowerCase().includes(q)) push({ kind: 'Bacaan', lang: L, title: r.title, sub: 'Bacaan Bahasa ' + LANGMETA[L].name + ' · ' + r.level, route: 'reading', params: { id: r.id } }); });
    DG.dialogs[L].forEach(d => { if ((d.title + ' ' + d.place).toLowerCase().includes(q)) push({ kind: 'Dialog', lang: L, title: d.title, sub: 'Dialog Bahasa ' + LANGMETA[L].name + ' · ' + esc(d.place), route: 'dialogs' }); });
  });
  return out;
}
window.searchAll = searchAll;
function runSearchAction(r) {
  if (!r) return;
  if (r.lang && r.lang !== S.lang) { S.lang = r.lang; save(); renderTopbar(); renderSidebar(); }
  if (r.route === 'vocab' && r.word) { vocabQ = r.word; go('vocab'); return; }
  go(r.route, r.params || {});
}
window.runSearchAction = runSearchAction;
function pageSearch(c, p) {
  const q = String(p.q || '');
  const results = searchAll(q);
  if (!results.length) {
    c.innerHTML = '<div class="wrap"><h1 class="page">Hasil untuk "' + esc(q) + '"</h1><div class="card" style="margin-top:16px"><b>Tidak ditemukan untuk "' + esc(q) + '"</b><p class="muted" style="margin-top:6px">Coba kata lain — misalnya arti Indonesianya ("apel", "makan"), nama modul ("Salam"), atau nama fitur ("EPS-TOPIK", "Idiom").</p></div></div>';
    return;
  }
  const kinds = ['Fitur', 'Modul', 'Kosakata', 'Bacaan', 'Dialog'];
  c.innerHTML = '<div class="wrap"><h1 class="page">Hasil untuk "' + esc(q) + '"</h1><p class="sub">' + results.length + ' hasil — bahasa aktif (' + LANGMETA[S.lang].name + ') ditampilkan lebih dulu.</p>' +
    kinds.map(k => {
      const list = results.filter(r => r.kind === k);
      if (!list.length) return '';
      return '<div class="sect-label">' + k + '</div><div class="card" style="padding:6px 20px">' + list.map(r => { const gi = results.indexOf(r); return '<button type="button" class="sent-line search-row" data-sact="' + gi + '" style="display:block;width:100%;text-align:left;background:none;border:none;cursor:pointer"><b>' + esc(r.title) + '</b> <span class="chip">' + LANGMETA[r.lang].name + '</span><small>' + esc(r.sub) + '</small></button>'; }).join('') + '</div>';
    }).join('') + '</div>';
  $$('[data-sact]', c).forEach(b => b.onclick = () => runSearchAction(results[+b.dataset.sact]));
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
  cheats: pageCheats, speaking: pageSpeaking, examwriting: pageExamWriting, khusus: pageKhusus, eps: pageEPS, frasa: pageFrasa, bunyi: pageBunyi, sopan: pageSopan, sumber: pageSumber, nol: pageNol, mahir: pageMahir, listening: pageListening, roleplay: pageRoleplay, shadowing: pageShadowing, myerrors: pageMyErrors, tutor: pageTutor,
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
