// ===== KONFIGURASI SUPABASE ===== (v6)
// Ganti dua nilai ini dengan URL & anon key proyek Supabase kamu
// (Supabase Dashboard > Settings > API). Anon key aman tampil di frontend
// karena data dilindungi Row Level Security di database.
const SUPABASE_URL = "https://tdwkghphdppwvznxcggz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HB_emJDuMKe3GflAeLqPrA_JAmYLLz8";
let LANGUAGE_CODE = (function(){ try { return localStorage.getItem("ela_lang") === "ko" ? "ko" : "en"; } catch(e){ return "en"; } })(); // v6: bisa diganti lewat pemilih bahasa (en/ko)

let sb = null;
if (window.supabase && !SUPABASE_URL.startsWith("GANTI")) {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ===== 13 CATATAN PENTING (ENGLISH) =====
const NOTES_EN = [
 ["am / is / are (to be)","Dipakai untuk menyatakan keadaan/identitas. I → am; he/she/it → is; you/we/they → are.",
  [["I am a student.","Saya seorang pelajar."],["She is happy.","Dia (perempuan) senang."],["They are friends.","Mereka adalah teman."]]],
 ["do / does","Untuk kalimat tanya & negatif present simple. I/you/we/they → do; he/she/it → does (kata kerja kembali ke bentuk dasar).",
  [["Do you speak English?","Apakah kamu bisa berbahasa Inggris?"],["Does she work here?","Apakah dia (perempuan) bekerja di sini?"]]],
 ["did","Bentuk lampau dari do/does untuk semua subjek. Setelah did, kata kerja bentuk dasar.",
  [["Did you sleep well?","Apakah kamu tidur nyenyak?"]]],
 ["have / has","I/you/we/they → have; he/she/it → has. Juga untuk present perfect (have/has + kata kerja ke-3).",
  [["She has a cat.","Dia punya seekor kucing."],["I have finished.","Saya sudah selesai."]]],
 ["was / were","Bentuk lampau to be. I/he/she/it → was; you/we/they → were.",
  [["I was tired.","Saya tadi lelah."],["They were late.","Mereka terlambat."]]],
 ["will / would","will = akan (masa depan); would = akan (lebih sopan/hipotetis).",
  [["I will help you.","Saya akan membantumu."],["Would you like tea?","Maukah kamu teh?"]]],
 ["can / could / should / must","can=bisa, could=bisa (lampau/sopan), should=sebaiknya, must=harus. Setelahnya kata kerja bentuk dasar.",
  [["You should rest.","Kamu sebaiknya istirahat."],["We must go.","Kita harus pergi."]]],
 ["Akhiran -s / -es","Pada present simple, kata kerja untuk he/she/it ditambah -s/-es. Akhiran o/ch/sh/ss/x → -es.",
  [["He watches TV.","Dia menonton TV."],["She goes to school.","Dia pergi ke sekolah."]]],
 ["a / an / the","a/an = sebuah (satu, belum spesifik); the = itu (spesifik/sudah diketahui). Lihat juga catatan khusus a vs an.",
  [["I saw a dog. The dog was big.","Saya melihat seekor anjing. Anjing itu besar."]]],
 ["Kenapa 'a university', bukan 'an university'?","a/an ditentukan BUNYI awal, bukan huruf. 'university' dibaca 'yu' (bunyi konsonan) → a. 'hour' huruf h tidak dibaca (bunyi vokal) → an.",
  [["a university / a uniform / a unit / a European / a one-way street","sebuah universitas / seragam / unit / orang Eropa / jalan satu arah"],
   ["an hour / an honest man / an honor / an MBA / an SOS / an X-ray","satu jam / pria jujur / kehormatan / gelar MBA / sinyal SOS / foto rontgen"],
   ["a hotel / a house (huruf h DIBACA)","sebuah hotel / rumah"],
   ["Tips: ucapkan katanya keras-keras dulu, lalu pilih a atau an.",""]]],
 ["Kata ganti orang (pronouns)","I=saya, you=kamu, he=dia (laki-laki), she=dia (perempuan), it=itu (benda/hewan), we=kita/kami, they=mereka.",
  [["She is my friend.","Dia (perempuan) teman saya."]]],
 ["Kata ganti milik","my=milik saya, your=milikmu, his=miliknya (lk), her=miliknya (pr), its=miliknya (benda), our=milik kita, their=milik mereka.",
  [["This is her book.","Ini bukunya (perempuan)."]]],
 ["this / that / these / those","this=ini (tunggal, dekat), that=itu (tunggal, jauh), these=ini (jamak, dekat), those=itu (jamak, jauh).",
  [["These are my shoes.","Ini sepatu-sepatu saya."]]],
];

// ===== JENIS KATA + KATA HARI INI (berganti tiap hari) =====
const WORD_CLASSES_EN = [
 ["Noun — Kata Benda","Nama orang, tempat, benda, atau hal.",
  [["teacher","guru","The teacher is kind.","Gurunya baik."],["city","kota","This city is big.","Kota ini besar."],
   ["happiness","kebahagiaan","Money cannot buy happiness.","Uang tidak bisa membeli kebahagiaan."],
   ["library","perpustakaan","The library opens at nine.","Perpustakaan buka jam sembilan."]]],
 ["Verb — Kata Kerja","Kata yang menunjukkan tindakan atau keadaan.",
  [["run","berlari","They run every morning.","Mereka berlari setiap pagi."],["eat","makan","We eat rice.","Kami makan nasi."],
   ["think","berpikir","I think so.","Saya rasa begitu."],["build","membangun","They build houses.","Mereka membangun rumah."]]],
 ["Adjective — Kata Sifat","Menjelaskan kata benda.",
  [["beautiful","cantik / indah","She has a beautiful voice.","Suaranya indah."],["quick","cepat","Be quick!","Cepatlah!"],
   ["expensive","mahal","That car is expensive.","Mobil itu mahal."],["brave","berani","He is brave.","Dia berani."]]],
 ["Adverb — Kata Keterangan","Menjelaskan kata kerja/sifat: bagaimana, kapan, di mana.",
  [["quickly","dengan cepat","She speaks quickly.","Dia berbicara dengan cepat."],["always","selalu","I always wake up early.","Saya selalu bangun pagi."],
   ["here","di sini","Come here.","Kemarilah."],["very","sangat","It is very cold.","Sangat dingin."]]],
 ["Pronoun — Kata Ganti","Menggantikan kata benda: I, you, he, she, it, we, they.",
  [["they","mereka","They are students.","Mereka adalah pelajar."],["it","itu (benda)","It is raining.","Sedang hujan."]]],
 ["Preposition — Kata Depan","Menunjukkan hubungan tempat/waktu: in, on, at, under, between.",
  [["on","di atas (menempel)","The book is on the table.","Bukunya di atas meja."],["at","pada (jam/tempat)","We meet at seven.","Kita bertemu jam tujuh."]]],
 ["Conjunction — Kata Penghubung","Menghubungkan kata/kalimat: and, but, because, although.",
  [["because","karena","I stayed home because I was sick.","Saya di rumah karena sakit."],["but","tetapi","It is small but strong.","Kecil tetapi kuat."]]],
 ["Interjection — Kata Seru","Ungkapan perasaan spontan: wow!, ouch!, hey!",
  [["wow","wah","Wow, that's amazing!","Wah, luar biasa!"],["ouch","aduh","Ouch, that hurts!","Aduh, sakit!"]]],
];
function dayIndex(pool){ const d=new Date(); const n=Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000); return n%pool.length; }


// ===== v6: PILIHAN BAHASA (en / ko) =====
function curLessons(){ return LANGUAGE_CODE === "ko" ? LESSONS_KO : LESSONS_EN; }
function curVocab(){ return LANGUAGE_CODE === "ko" ? LESSON_VOCAB_KO : LESSON_VOCAB_EN; }
function curNotes(){ return LANGUAGE_CODE === "ko" ? NOTES_KO : NOTES_EN; }
function curWordClasses(){ return LANGUAGE_CODE === "ko" ? WORD_CLASSES_KO : WORD_CLASSES_EN; }
function langName(){ return LANGUAGE_CODE === "ko" ? "한국어 · Korean" : "English"; }
function langXpKey(){ return "ela_xp_" + LANGUAGE_CODE; }
function localLangXp(){ try { return parseInt(localStorage.getItem(langXpKey()) || "0", 10) || 0; } catch(e){ return 0; } }
function addLocalLangXp(xp){ try { localStorage.setItem(langXpKey(), String(localLangXp() + xp)); } catch(e){} }


// ===== v8: TOMBOL DENGARKAN — TTS GRATIS (Web Speech API / speechSynthesis) =====
// Tanpa file audio, tanpa biaya, tanpa API key: suara dibuat oleh browser/HP
// pengguna sendiri. Suara Korea dipilih otomatis (ko-KR), Inggris en-US/en-GB,
// dengan fallback ke suara bawaan HP bila suara bahasa itu belum terpasang.
var TTS_OK = ("speechSynthesis" in window) && ("SpeechSynthesisUtterance" in window);
var ttsRate = 1;
try { if (localStorage.getItem("ela_tts_rate") === "slow") ttsRate = 0.72; } catch (e) {}
var __ttsTexts = [];
function ttsRegister(item) { __ttsTexts.push(item); return __ttsTexts.length - 1; }
function ttsBtn(text, lang, label) {
  var id = ttsRegister({ text: String(text == null ? "" : text), lang: lang || "en-US" });
  return '<button type="button" class="tts-btn" onclick="ttsPlayId(' + id + ')">' + (label || "\uD83D\uDD0A Dengarkan") + "</button>";
}
function ttsDialogBtn(parts, lang, label) {
  var id = ttsRegister({ parts: parts, lang: lang || "ko-KR" });
  return '<button type="button" class="tts-btn tts-btn-dialog" onclick="ttsPlayDialogId(' + id + ',this)">' + (label || "\uD83D\uDD0A Dengarkan Dialog") + "</button>";
}
function ttsToast(msg) {
  var t = document.getElementById("tts-toast");
  if (!t) { return; }
  t.textContent = msg; t.hidden = false;
  clearTimeout(window.__ttsToastTimer);
  window.__ttsToastTimer = setTimeout(function () { t.hidden = true; }, 7000);
}
function ttsVoices() { try { return window.speechSynthesis.getVoices() || []; } catch (e) { return []; } }
function ttsPickVoice(lang) {
  var vs = ttsVoices(); if (!vs.length) return null;
  var want = (lang || "").toLowerCase(), p = want.slice(0, 2);
  var i, v;
  for (i = 0; i < vs.length; i++) { v = vs[i]; if ((v.lang || "").toLowerCase().replace("_", "-") === want) return v; }
  if (p === "en") {
    var prefs = ["en-us", "en-gb"];
    for (var k = 0; k < prefs.length; k++) for (i = 0; i < vs.length; i++) { v = vs[i]; if ((v.lang || "").toLowerCase().replace("_", "-") === prefs[k]) return v; }
  }
  for (i = 0; i < vs.length; i++) { v = vs[i]; if ((v.lang || "").toLowerCase().indexOf(p) === 0) return v; }
  return null;
}
var __ttsKoWarned = false;
function ttsMakeUtter(text, lang) {
  var u = new SpeechSynthesisUtterance(String(text || "").replace(/\s+/g, " ").trim());
  var v = ttsPickVoice(lang);
  if (v) { u.voice = v; u.lang = v.lang; }
  else {
    u.lang = lang;
    if ((lang || "").indexOf("ko") === 0 && !__ttsKoWarned) {
      __ttsKoWarned = true;
      ttsToast("Suara Bahasa Korea (ko-KR) sepertinya belum terpasang di HP ini, jadi dipakai suara bawaan HP dulu \u2014 bunyinya mungkin kurang pas. Cara memasangnya: buka Pengaturan HP \u203A Bahasa / Text-to-Speech (Keluaran teks ke ucapan) \u203A unduh Bahasa Korea, lalu coba lagi.");
    }
  }
  u.rate = ttsRate; u.pitch = 1;
  return u;
}
function ttsSetStatus(playing) {
  var s = document.getElementById("tts-status"); if (s) s.textContent = playing ? "\uD83D\uDD0A Sedang membacakan\u2026" : "Siap \u2014 ketuk tombol \uD83D\uDD0A Dengarkan di materi mana pun";
  var b = document.getElementById("tts-stop"); if (b) b.disabled = !playing;
}
function ttsUnsupportedMsg() {
  ttsToast("Maaf, browser / HP ini tidak mendukung fitur suara (TTS) bawaan, jadi tombol Dengarkan tidak bisa berbunyi di perangkat ini. Coba buka website ini dengan Chrome terbaru di Android, atau Safari/Chrome di iPhone.");
}
function ttsSpeak(text, lang, onDone) {
  if (!TTS_OK) { ttsUnsupportedMsg(); if (onDone) onDone(); return; }
  var clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) { if (onDone) onDone(); return; }
  try { window.speechSynthesis.cancel(); } catch (e) {}
  var done = false;
  var finish = function () { if (done) return; done = true; ttsSetStatus(false); if (onDone) onDone(); };
  var u = ttsMakeUtter(clean, lang || "en-US");
  u.onend = finish; u.onerror = finish;
  ttsSetStatus(true);
  try { window.speechSynthesis.speak(u); } catch (e) { finish(); }
}
function ttsSpeakSeq(parts, lang, onDone) {
  if (!TTS_OK) { ttsUnsupportedMsg(); if (onDone) onDone(); return; }
  var list = (parts || []).map(function (x) { return String(x || "").replace(/\s+/g, " ").trim(); }).filter(Boolean);
  if (!list.length) { if (onDone) onDone(); return; }
  try { window.speechSynthesis.cancel(); } catch (e) {}
  ttsSetStatus(true);
  var i = 0, stopped = false;
  var step = function () {
    if (stopped) return;
    if (i >= list.length) { ttsSetStatus(false); if (onDone) onDone(); return; }
    var u = ttsMakeUtter(list[i], lang || "ko-KR"); i++;
    u.onend = step; u.onerror = step;
    try { window.speechSynthesis.speak(u); } catch (e) { step(); }
  };
  window.__ttsSeqStop = function () { stopped = true; };
  step();
}
function ttsPlayId(id) { var it = __ttsTexts[id]; if (it && it.text != null) ttsSpeak(it.text, it.lang); }
function ttsDialogParts(dialogText) {
  var parts = [], re = /'([^']+)'/g, m;
  while ((m = re.exec(String(dialogText || "")))) { parts.push(m[1]); }
  return parts.length ? parts : [String(dialogText || "").replace(/^[^\:]{1,12}\:\s*/g, "")];
}
function ttsPlayDialogId(id, btn) {
  var it = __ttsTexts[id]; if (!it) return;
  var wrap = btn && btn.closest ? btn.closest(".tts-dialog-wrap") : null;
  var tr = wrap ? wrap.querySelector(".tts-transcript") : null;
  var note = wrap ? wrap.querySelector(".tts-transcript-note") : null;
  if (tr) tr.classList.add("is-hidden");
  if (note) note.hidden = false;
  ttsSpeakSeq(it.parts, it.lang, function () {
    if (tr) tr.classList.remove("is-hidden");
    if (note) note.hidden = true;
  });
}
function ttsToggleTranscript(btn) {
  var wrap = btn && btn.closest ? btn.closest(".tts-dialog-wrap") : null;
  if (!wrap) return;
  var tr = wrap.querySelector(".tts-transcript");
  if (tr) tr.classList.toggle("is-hidden");
}
function ttsStop() {
  if (window.__ttsSeqStop) { try { window.__ttsSeqStop(); } catch (e) {} window.__ttsSeqStop = null; }
  if (TTS_OK) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  ttsSetStatus(false);
}
function ttsSetRate(mode) {
  ttsRate = mode === "slow" ? 0.72 : 1;
  try { localStorage.setItem("ela_tts_rate", mode); } catch (e) {}
  var slow = document.getElementById("tts-rate-slow"), norm = document.getElementById("tts-rate-normal");
  if (slow) slow.classList.toggle("is-active", mode === "slow");
  if (norm) norm.classList.toggle("is-active", mode !== "slow");
}
if (TTS_OK && window.speechSynthesis.addEventListener) {
  try { window.speechSynthesis.addEventListener("voiceschanged", function () { ttsVoices(); }); } catch (e) {}
}

// ===== RENDER BERANDA =====
const $=id=>document.getElementById(id);
function renderNotes(){ $("notes").innerHTML = curNotes().map(n=>`<details class="note-card"><summary>${n[0]}</summary><div class="note-body"><p>${n[1]}</p>`+
  n[2].map(e=>`<p class="note-example"><b>${e[0]}</b> ${ttsBtn(e[0], LANGUAGE_CODE==="ko"?"ko-KR":"en-US")}${e[1]?`<br><span class="translation">Artinya: ${e[1]}</span>`:""}</p>`).join("")+`</div></details>`).join(""); }
renderNotes();
function renderWordClasses(){ $("word-classes").innerHTML = curWordClasses().map(wc=>{ const pool=wc[2]; const t=pool[dayIndex(pool)];
  var wcLang = LANGUAGE_CODE==="ko"?"ko-KR":"en-US";
  return `<details class="word-card"><summary>${wc[0]}</summary><div class="word-body"><p>${wc[1]}</p><div class="word-today">🌟 <span class="word-big">Kata Hari Ini: ${t[0]}</span> = ${t[1]} ${ttsBtn(t[0], wcLang)}<p class="word-sentence"><b>${t[2]}</b> ${ttsBtn(t[2], wcLang)}<br><span class="translation">Artinya: ${t[3]}</span></p></div>`+
  `<p class="word-others">Contoh kata lain: ${pool.map(p=>p[0]+" ("+p[1]+") "+ttsBtn(p[0], wcLang, "🔊")).join(" · ")}</p></div></details>`;}).join(""); }
renderWordClasses();
// Pelajaran yang sudah selesai di perangkat ini (untuk tanda "Selesai · ulangi")
function doneIds(){ try{ return JSON.parse(localStorage.getItem("ela_completed_" + LANGUAGE_CODE)||"[]"); }catch(e){ return []; } }
function markDone(id){ const d=doneIds(); if(!d.includes(id)){ d.push(id); localStorage.setItem("ela_completed_" + LANGUAGE_CODE,JSON.stringify(d)); } }
function renderLessons(){ const done=doneIds(); const groups={};
  curLessons().forEach(l=>{ (groups[l.level]=groups[l.level]||[]).push(l); });
  $("lessons").innerHTML = Object.keys(groups).map(lv=>{ const items=groups[lv]; const first=items[0];
    return `<div class="level-group lvl-${lv}"><div class="level-head"><span class="level-pill">${lv}</span><span class="level-name">${first.level_name} · ${items.length} pelajaran</span></div><ol class="path">`+
    items.map(l=>{ const isDone=done.includes(l.id);
      return `<li class="path-node${isDone?" is-done":""}"><span class="node-dot" aria-hidden="true">${isDone?"✓":l.order}</span><div class="lesson-card"><div class="lesson-info"><p class="lesson-title">${l.title}</p><p class="lesson-desc">${l.desc_id}</p></div><div class="lesson-side"><span class="meta-chip">📝 10 soal</span><span class="xp-chip">+${l.xp} XP</span>${isDone?`<span class="done-chip">✓ Selesai</span><button class="btn btn-sm btn-again" onclick="startLesson('${l.id}')">Ulangi</button>`:`<button class="btn btn-sm btn-start" onclick="startLesson('${l.id}')">Mulai</button>`}</div></div></li>`; }).join("")+
    `</ol></div>`; }).join("");
  const pct=curLessons().length?Math.round(done.filter(id=>curLessons().some(l=>l.id===id)).length/curLessons().length*100):0;
  const doneCount=done.filter(id=>curLessons().some(l=>l.id===id)).length;
  ["hero-progress-fill","top-progress-fill"].forEach(id=>{ const el=$(id); if(el) el.style.width=pct+"%"; });
  const pt=$("hero-progress-text"); if(pt) pt.textContent=doneCount+" dari "+curLessons().length+" pelajaran selesai"; }
renderLessons();
renderPanels();

// ===== LATIHAN — HALAMAN SENDIRI, JUMLAH SOAL TETAP (v4) =====
// Setiap pelajaran berisi tepat QUESTIONS_PER_LESSON soal (10 soal), dibuat dari
// kosakata pelajaran itu di data.js (LESSON_VOCAB). Soal berjalan berurutan
// 1 -> 10 TANPA mengulang (bug v2: soal diputar ulang pakai % sehingga tidak
// pernah selesai). Setelah soal terakhir, muncul pop-up hasil: benar berapa,
// salah berapa, nilai, dan XP yang didapat. XP hanya disimpan SEKALI, saat
// latihan selesai — bukan setiap jawaban benar seperti di v2.
const QUESTIONS_PER_LESSON_FALLBACK = 10;
function questionsPerLesson(){ return (typeof QUESTIONS_PER_LESSON !== "undefined" && QUESTIONS_PER_LESSON) ? QUESTIONS_PER_LESSON : QUESTIONS_PER_LESSON_FALLBACK; }
function blankOut(sentence, word){
  let w = word;
  let i = sentence.toLowerCase().indexOf(w.toLowerCase());
  if (i < 0 && w.length > 1 && w.endsWith("\uB2E4")){ w = w.slice(0, -1); i = sentence.indexOf(w); }
  if (i < 0) return sentence;
  return sentence.slice(0, i) + "___" + sentence.slice(i + w.length);
}
function rotatedOptions(values, correctValue, seed){
  const others = values.filter(v => v !== correctValue);
  const rot = others.length ? seed % others.length : 0;
  const rotated = others.slice(rot).concat(others.slice(0, rot));
  const pos = seed % (rotated.length + 1);
  const opts = rotated.slice(0, pos).concat([correctValue], rotated.slice(pos));
  return { opts, answer: pos };
}
function buildQuestions(lesson){
  const vocab = (typeof curVocab === "function" && curVocab()[lesson.id]) || [];
  const seedBase = lesson.order * 3 + lesson.level.charCodeAt(1);
  const enAll = vocab.map(v => v[0]), idAll = vocab.map(v => v[1]);
  const qs = [];
  if (vocab.length >= 4){
    const V = vocab;
    // v9: nama bahasa target mengikuti mode yang sedang dipilih — JANGAN hardcode "Inggris":
    // di mode Korea semua teks soal harus menyebut "Bahasa Korea", di mode Inggris "Bahasa Inggris".
    const TL = LANGUAGE_CODE === "ko" ? "Korea" : "Inggris";
    const mkId = (vi, seed) => { const r = rotatedOptions(idAll, V[vi][1], seed);
      return { ctx: "Pilih arti Bahasa Indonesia yang tepat untuk kata yang ditanyakan.",
        q: "Apa arti Bahasa Indonesia dari kata \u201C" + V[vi][0] + "\u201D?",
        translation: "Contoh: " + V[vi][2] + " \u2014 Artinya: " + V[vi][3],
        opts: r.opts.map(o => [o, ""]), answer: r.answer, full: V[vi][2], full_id: V[vi][3] }; };
    const mkEn = (vi, seed) => { const r = rotatedOptions(enAll, V[vi][0], seed);
      return { ctx: "Pilih kata Bahasa " + TL + " yang tepat untuk arti yang ditanyakan.",
        q: "Apa Bahasa " + TL + "nya \u201C" + V[vi][1] + "\u201D?",
        translation: "Contoh: " + V[vi][2] + " \u2014 Artinya: " + V[vi][3],
        opts: r.opts.map(o => [o, ""]), answer: r.answer, full: V[vi][2], full_id: V[vi][3] }; };
    const mkBlank = (vi, seed) => { const r = rotatedOptions(enAll, V[vi][0], seed);
      return { ctx: "Konteks \u2014 baca dulu: " + V[vi][3] + " Kata yang hilang adalah kata yang artinya \u201C" + V[vi][1] + "\u201D.",
        q: "Lengkapi kalimat ini: " + blankOut(V[vi][2], V[vi][0]),
        translation: "Artinya (kalimat lengkap): " + V[vi][3],
        opts: r.opts.map(o => [o, ""]), answer: r.answer, full: V[vi][2], full_id: V[vi][3] }; };
    const mkSent = (vi, seed) => { const exIds = vocab.map(v => v[3]); const r = rotatedOptions(exIds, V[vi][3], seed);
      return { ctx: "Pilih terjemahan Bahasa Indonesia yang tepat untuk kalimat Bahasa " + TL + " ini.",
        q: "Apa arti kalimat ini: \u201C" + V[vi][2] + "\u201D",
        translation: "",
        opts: r.opts.map(o => [o, ""]), answer: r.answer, full: V[vi][2], full_id: V[vi][3] }; };
    // 10 soal: 4 kata pelajaran dipakai dalam beberapa bentuk soal yang BERBEDA
    // (arti kata, kata dari arti, lengkapi kalimat, arti kalimat) - tidak ada
    // soal yang teksnya sama persis di dalam satu latihan.
    qs.push(mkId(0, seedBase));        // 1  arti kata ke-1
    qs.push(mkEn(1, seedBase + 1));    // 2  kata target dari arti ke-2
    qs.push(mkBlank(2, seedBase + 2)); // 3  lengkapi kalimat kata ke-3
    qs.push(mkBlank(3, seedBase + 3)); // 4  lengkapi kalimat kata ke-4
    qs.push(mkSent(0, seedBase + 4));  // 5  arti kalimat contoh kata ke-1
    qs.push(mkId(2, seedBase + 5));    // 6  arti kata ke-3
    qs.push(mkEn(3, seedBase + 6));    // 7  kata target dari arti ke-4
    qs.push(mkId(1, seedBase + 7));    // 8  arti kata ke-2
    qs.push(mkEn(2, seedBase + 8));    // 9  kata target dari arti ke-3
    qs.push(mkSent(1, seedBase + 9));  // 10 arti kalimat contoh kata ke-2
    // Jaminan anti-dobel: dua kalimat contoh yang hanya beda kata isian bisa
    // menghasilkan teks soal yang sama persis setelah kata dikosongkan
    // (mis. "This tradition is old." vs "This custom is old."). Soal dobel
    // diganti otomatis dengan bentuk soal lain yang belum terpakai.
    const seenQ = new Set(); const deduped = [];
    for (const q of qs){
      if (!seenQ.has(q.q)){ seenQ.add(q.q); deduped.push(q); continue; }
      let repl = null;
      outer: for (let vi = 0; vi < vocab.length; vi++){
        for (const make of [mkId, mkEn, mkSent, mkBlank]){
          const cand = make(vi, seedBase + 20 + vi * 3);
          if (!seenQ.has(cand.q)){ repl = cand; break outer; }
        }
      }
      if (repl){ seenQ.add(repl.q); deduped.push(repl); }
    }
    return deduped.slice(0, questionsPerLesson());
  }
  return qs.slice(0, questionsPerLesson());
}
let quizState = null;
function showLessonPage(){
  ttsStop();
  $("home-view").hidden = true;
  const f = document.querySelector(".site-footer"); if (f) f.hidden = true;
  $("lesson-view").hidden = false;
  window.scrollTo({ top: 0 });
}
function showHomePage(){
  ttsStop();
  $("lesson-view").hidden = true;
  const f = document.querySelector(".site-footer"); if (f) f.hidden = false;
  $("home-view").hidden = false;
}
window.startLesson = function(id){
  const lesson = curLessons().find(l => l.id === id);
  if (!lesson) return;
  const questions = buildQuestions(lesson);
  quizState = { lesson, questions, idx: 0, correct: 0, wrong: 0, answered: false, finished: false };
  $("result-modal").hidden = true;
  showLessonPage();
  $("lesson-meta").textContent = "Level " + lesson.level + " · " + lesson.level_name + " · Latihan ini berisi " + questions.length + " soal · Maks. +" + lesson.xp + " XP";
  showQ();
};
function showQ(){
  const s = quizState, item = s.questions[s.idx], total = s.questions.length;
  s.answered = false;
  $("quiz-title").textContent = s.lesson.title;
  $("quiz-counter").textContent = "Soal " + (s.idx + 1) + " dari " + total;
  $("quiz-live-score").textContent = "✅ Benar: " + s.correct + " · ❌ Salah: " + s.wrong;
  $("quiz-progress-fill").style.width = Math.round(s.idx / total * 100) + "%";
  $("quiz-context").innerHTML = "<div class=\"context\"><b>Konteks — baca dulu sebelum menjawab</b><br>" + item.ctx + "</div>" + (item.full ? "<p class=\"tts-line\">" + ttsBtn(item.full, LANGUAGE_CODE==="ko"?"ko-KR":"en-US", "🔊 Dengarkan kalimat contoh") + "</p>" : "");
  $("quiz-q").textContent = item.q;
  $("quiz-translation").innerHTML = item.translation ? "<span class=\"translation\">" + item.translation + "</span>" : "";
  $("quiz-feedback").textContent = "";
  $("quiz-next").hidden = true;
  $("quiz-options").innerHTML = item.opts.map((o, i) =>
    "<button class=\"option\" id=\"opt-" + i + "\" onclick=\"answer(" + i + ")\">" + o[0] + (o[1] ? "<small>Artinya: " + o[1] + "</small>" : "") + "</button>").join("");
}
window.answer = function(i){
  const s = quizState;
  if (!s || s.answered || s.finished) return;
  s.answered = true;
  const item = s.questions[s.idx], ok = i === item.answer;
  if (ok) s.correct++; else s.wrong++;
  // v9: bersihkan dulu semua kelas warna, lalu warnai TEPAT satu jawaban benar
  // (is-correct) dan — bila pilihanmu salah — pilihanmu saja (is-wrong + is-picked).
  item.opts.forEach((o, j) => { const b = $("opt-" + j); if (b){ b.disabled = true; b.classList.remove("is-correct", "is-wrong", "is-picked"); if (j === item.answer) b.classList.add("is-correct"); else if (j === i) b.classList.add("is-wrong"); if (j === i) b.classList.add("is-picked"); } });
  $("quiz-feedback").textContent = ok
    ? "✅ Benar! Kalimat lengkapnya: " + item.full + " (" + item.full_id + ")"
    : "❌ Belum tepat. Jawaban yang benar: " + item.opts[item.answer][0] + ". Kalimat lengkapnya: " + item.full + " (" + item.full_id + ")";
  $("quiz-live-score").textContent = "✅ Benar: " + s.correct + " · ❌ Salah: " + s.wrong;
  $("quiz-progress-fill").style.width = Math.round((s.idx + 1) / s.questions.length * 100) + "%";
  $("quiz-next").textContent = (s.idx === s.questions.length - 1) ? "Lihat Hasil 🏁" : "Lanjut →";
  $("quiz-next").hidden = false;
};
async function finishLesson(){
  const s = quizState;
  s.finished = true;
  const total = s.questions.length;
  const pct = total ? Math.round(s.correct / total * 100) : 0;
  const xpEarned = total ? Math.round(s.lesson.xp * s.correct / total) : 0;
  markDone(s.lesson.id);
  recordStudyDay();
  renderLessons();
  renderPanels();
  const prog = await saveProgress(xpEarned, pct);
  const streakNow = (prog && typeof prog.streak === "number") ? prog.streak : null;
  const rs = $("result-streak");
  if (rs){
    rs.hidden = streakNow === null;
    rs.textContent = streakNow === null ? "" :
      ("\uD83D\uDD25 Streak belajar kamu sekarang " + streakNow + " hari" +
       (prog.guest ? " (mode tamu: streak tersimpan di perangkat ini saja — masuk dengan akun supaya tersimpan di database)." : ". Belajar lagi besok supaya streak bertambah lagi."));
  }
  $("result-emoji").textContent = pct === 100 ? "🏆" : pct >= 60 ? "🎉" : "💪";
  $("result-title").textContent = "Latihan Selesai!";
  $("result-lesson").textContent = s.lesson.title + " · Level " + s.lesson.level;
  $("result-correct").textContent = s.correct + " benar";
  $("result-wrong").textContent = s.wrong + " salah";
  $("result-score").textContent = "Nilai: " + pct + " dari 100 · dari total " + total + " soal";
  $("result-xp").textContent = xpEarned > 0 ? ("Kamu mendapat +" + xpEarned + " XP" + (sb ? "." : " (mode tamu: XP hanya tercatat bila kamu sudah masuk).")) : "Belum ada XP kali ini — coba ulangi latihannya, kamu pasti bisa.";
  $("result-next-lesson").hidden = !nextLessonOf(s.lesson);
  $("result-modal").hidden = false;
}
function nextLessonOf(lesson){
  const i = curLessons().findIndex(l => l.id === lesson.id);
  return (i >= 0 && i < curLessons().length - 1) ? curLessons()[i + 1] : null;
}
$("quiz-next").onclick = function(){
  const s = quizState; if (!s || s.finished) return;
  if (s.idx < s.questions.length - 1){ s.idx++; showQ(); } else { finishLesson(); }
};
$("btn-back-home").onclick = function(){ showHomePage(); document.getElementById("jalur-belajar").scrollIntoView({ behavior: "smooth" }); };
$("btn-exit-lesson").onclick = function(){ showHomePage(); document.getElementById("jalur-belajar").scrollIntoView({ behavior: "smooth" }); };
$("result-close").onclick = function(){ $("result-modal").hidden = true; showHomePage(); document.getElementById("jalur-belajar").scrollIntoView({ behavior: "smooth" }); };
$("result-back").onclick = function(){ $("result-modal").hidden = true; showHomePage(); document.getElementById("jalur-belajar").scrollIntoView({ behavior: "smooth" }); };
$("result-retry").onclick = function(){ if (quizState) window.startLesson(quizState.lesson.id); };
$("result-next-lesson").onclick = function(){ const n = quizState ? nextLessonOf(quizState.lesson) : null; if (n) window.startLesson(n.id); };
window.__lessonState = function(){ return quizState; };


// ===== v6: DASHBOARD MASTER, ROADMAP, STUDY TRACKER =====
// Semua angka dihitung dari data yang benar-benar ada: LESSONS (42
// pelajaran) dan daftar pelajaran selesai di perangkat ini (ela_completed).
// Study Tracker mencatat tanggal selesai belajar di perangkat ini
// (ela_study_days) - tracker ini jujur tingkat perangkat, bukan server.
function studyDays(){ try { return JSON.parse(localStorage.getItem("ela_study_days") || "[]"); } catch(e){ return []; } }
function recordStudyDay(){
  const today = localDateStr(); const days = studyDays();
  if (!days.includes(today)){ days.push(today); days.sort(); }
  try { localStorage.setItem("ela_study_days", JSON.stringify(days.slice(-370))); } catch(e){}
}
function levelStats(){
  const done = doneIds();
  return LEVELS.map(function(L){
    const items = curLessons().filter(function(l){ return l.level === L[0]; });
    const d = items.filter(function(l){ return done.includes(l.id); }).length;
    return { code: L[0], name: L[1], total: items.length, done: d,
             pct: items.length ? Math.round(d / items.length * 100) : 0, items: items };
  });
}
function renderDashboard(){
  const el = $("dashboard-master"); if (!el) return;
  const st = levelStats();
  const totalDone = st.reduce(function(s, x){ return s + x.done; }, 0);
  const totalAll = st.reduce(function(s, x){ return s + x.total; }, 0);
  const totalPct = totalAll ? Math.round(totalDone / totalAll * 100) : 0;
  el.innerHTML =
    '<div class="dash-total"><div><span class="dash-lang">' + langName() + '</span>' +
    '<span class="dash-total-text">' + totalDone + ' dari ' + totalAll + ' pelajaran selesai</span> <span class="dash-xp" id="dash-lang-xp"></span></div>' +
    '<span class="dash-total-pct">' + totalPct + '%</span></div>' +
    '<div class="progress-track dash-track"><span class="progress-fill" style="width:' + totalPct + '%"></span></div>' +
    st.map(function(x){
      return '<div class="dash-row"><span class="level-pill lvl-pill-' + x.code + '">' + x.code + '</span>' +
        '<span class="dash-name">' + x.name + '</span>' +
        '<span class="dash-bar"><span style="width:' + x.pct + '%"></span></span>' +
        '<span class="dash-pct">' + x.pct + '%</span>' +
        '<span class="dash-count">' + x.done + '/' + x.total + '</span></div>';
    }).join("");
  const dx = $("dash-lang-xp");
  if (dx){ const xp = (typeof window.__langXp === "number") ? window.__langXp : localLangXp();
    dx.textContent = "\u2B50 XP bahasa ini: " + xp + " XP"; }
}
function renderRoadmap(){
  const el = $("roadmap"); if (!el) return;
  const st = levelStats(); const done = doneIds();
  let currentFound = false;
  const stages = st.map(function(x){
    let state, cls;
    if (x.total && x.done === x.total){ state = "\u2713 Selesai"; cls = "is-done"; }
    else if (!currentFound){ state = "Sedang berjalan"; cls = "is-current"; currentFound = true; }
    else { state = "Belum mulai"; cls = "is-next"; }
    return '<div class="road-stage ' + cls + '"><span class="road-dot" aria-hidden="true">' +
      (cls === "is-done" ? "\u2713" : x.code) + '</span><div class="road-body">' +
      '<p class="road-title">' + x.code + ' \u00B7 ' + x.name + '</p>' +
      '<p class="road-sub">' + x.done + ' dari ' + x.total + ' pelajaran selesai</p></div>' +
      '<span class="road-state">' + state + '</span></div>';
  }).join("");
  const next = curLessons().find(function(l){ return !done.includes(l.id); });
  const nextHtml = next
    ? '<div class="road-next"><p><b>Pelajaran berikutnya:</b> ' + next.title + ' (Level ' + next.level + ' \u00B7 ' + next.level_name + ') \u00B7 \uD83D\uDCDD 10 soal \u00B7 +' + next.xp + ' XP</p>' +
      '<button class="btn btn-primary" onclick="startLesson(\'' + next.id + '\')">Mulai pelajaran ini</button></div>'
    : '<div class="road-next"><p><b>Luar biasa!</b> Semua ' + curLessons().length + ' pelajaran sudah selesai. Ulangi pelajaran mana pun untuk menjaga hafalanmu.</p></div>';
  el.innerHTML = stages + nextHtml;
}
function renderTracker(){
  const el = $("tracker-week"); if (!el) return;
  const days = studyDays();
  const now = new Date(); const dow = (now.getDay() + 6) % 7; // Senin = 0
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
  const names = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  let studied = 0;
  let cells = "";
  for (let i = 0; i < 7; i++){
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const ds = localDateStr(d); const isDone = days.includes(ds); if (isDone) studied++;
    const isToday = ds === localDateStr();
    cells += '<div class="track-cell' + (isDone ? " is-done" : "") + (isToday ? " is-today" : "") + '">' +
      '<span class="track-day">' + names[i] + '</span>' +
      '<span class="track-mark">' + (isDone ? "\u2713" : (isToday ? "\u2022" : "\u2013")) + '</span>' +
      '<span class="track-date">' + d.getDate() + '/' + (d.getMonth() + 1) + '</span></div>';
  }
  el.innerHTML = cells;
  const sum = $("tracker-summary");
  if (sum){
    const g = guestStreakState();
    const streakTxt = (g && typeof g.days === "number" && g.days > 0) ? (" \u00B7 \uD83D\uDD25 Streak tercatat di perangkat ini: " + g.days + " hari.") : "";
    sum.textContent = "Kamu belajar " + studied + " dari 7 hari minggu ini (tercatat di perangkat ini)." + streakTxt + " Selesaikan 1 pelajaran hari ini supaya hari ini ikut tercentang.";
  }
}
function renderPanels(){ renderDashboard(); renderRoadmap(); renderTracker(); }

// ===== SUPABASE: LOGIN + SIMPAN PROGRES/XP =====
function accountName(u){
  if (!u) return "";
  const m = u.user_metadata || {};
  return m.full_name || m.name || m.display_name || u.email || "Akun saya";
}
async function refreshUser(){ if(!sb) return; const {data}=await sb.auth.getUser(); const u=data.user;
  $("user-info").textContent=u?("Masuk sebagai "+u.email):"Belum masuk (mode tamu: progres tidak tersimpan)";
  // Sudah masuk: tombol "Masuk / Daftar" BERUBAH menjadi nama akun (tidak
  // disembunyikan), tombol Keluar tampil, dan bagian Masuk/Daftar di beranda
  // disembunyikan. Belum masuk: tombol kembali bertuliskan "Masuk / Daftar".
  const bl=$("btn-login");
  if (u){ bl.hidden=false; bl.textContent="\uD83D\uDC64 "+accountName(u); bl.disabled=true; bl.classList.add("is-account");
    const ab=$("auth-box"); if(ab) ab.hidden=true; }
  else { bl.hidden=false; bl.textContent="Masuk / Daftar"; bl.disabled=false; bl.classList.remove("is-account"); }
  $("btn-logout").hidden=!u;
  if (!u) showGuestStreak();
  if(u){ const {data:p}=await sb.from("profiles").select("total_xp,streak_days").eq("id",u.id).single();
    if(p){ $("xp-badge").textContent="⭐ "+p.total_xp+" XP"; $("streak-badge").textContent="🔥 "+p.streak_days+" hari";
      const hx=$("hero-xp"); if(hx) hx.textContent=p.total_xp+" XP"; const hs=$("hero-streak"); if(hs) hs.textContent=p.streak_days+" hari";
      const { data:pd } = await sb.from("profiles").select("last_study_date").eq("id",u.id).single();
      applyStreakDisplay(p.streak_days || 0, !!(pd && pd.last_study_date === localDateStr())); } }
  try { const { data:ulp } = await sb.from("user_language_progress").select("total_xp").eq("user_id",u.id).eq("language_code",LANGUAGE_CODE).single();
    if (ulp){ window.__langXp = ulp.total_xp || 0; const dx = $("dash-lang-xp"); if (dx) dx.textContent = "\u2B50 XP bahasa ini: " + window.__langXp + " XP"; } } catch(e){} }
// ===== STREAK BELAJAR (v5) =====
// BUG v4: saveProgress hanya meng-update total_xp dan last_study_date, TIDAK
// PERNAH meng-update streak_days di tabel profiles - jadi streak selalu 0
// walaupun XP bertambah (kasus akun dengan 300 XP tapi streak 0 hari).
// Aturan streak v5 (dihitung dari tanggal belajar terakhir di database):
//   last_study_date = hari ini   -> streak TIDAK berubah (sudah terhitung)
//   last_study_date = kemarin    -> streak + 1
//   lebih lama / belum pernah    -> streak jadi 1
//   streak lama 0 tapi sudah pernah belajar (mis. data lama dari v4)
//                                -> pelajaran pertama setelah update = 1
// Tanggal memakai tanggal LOKAL perangkat (bukan UTC dari toISOString),
// supaya hari tidak berganti di jam yang salah untuk pengguna WIB (UTC+7).
function localDateStr(d){
  d = d || new Date();
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, "0"), day = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + day;
}
function dateStrPlusDays(baseStr, delta){
  const p = baseStr.split("-").map(Number);
  return localDateStr(new Date(p[0], p[1] - 1, p[2] + delta));
}
function computeNewStreak(oldStreak, lastStudyDate, todayStr){
  const prev = (typeof oldStreak === "number" && oldStreak > 0) ? oldStreak : 0;
  if (lastStudyDate === todayStr) return Math.max(prev, 1);
  if (lastStudyDate && lastStudyDate === dateStrPlusDays(todayStr, -1)) return prev > 0 ? prev + 1 : 1;
  return 1;
}
function applyStreakDisplay(days, studiedToday){
  const b = $("streak-badge"); if (b) b.textContent = "\uD83D\uDD25 " + days + " hari";
  const h = $("hero-streak"); if (h) h.textContent = days + " hari";
  const ms = $("mission-status");
  if (ms){
    ms.textContent = studiedToday
      ? ("\uD83D\uDD25 Streak kamu " + days + " hari \u2014 misi hari ini SUDAH selesai. Belajar lagi besok supaya streak bertambah.")
      : (days > 0
          ? ("\uD83D\uDD25 Streak kamu " + days + " hari. Selesaikan 1 pelajaran hari ini supaya streak tidak putus dan besok bertambah.")
          : "Selesaikan 1 pelajaran hari ini untuk memulai streak belajarmu.");
  }
}
// Mode tamu: streak disimpan di perangkat ini (localStorage), aturan sama.
function guestStreakState(){ try { return JSON.parse(localStorage.getItem("ela_streak") || "{}"); } catch(e){ return {}; } }
function recordGuestStreak(){
  const today = localDateStr();
  const g = guestStreakState();
  const ns = computeNewStreak(g.days || 0, g.last || null, today);
  try { localStorage.setItem("ela_streak", JSON.stringify({ days: ns, last: today })); } catch(e){}
  applyStreakDisplay(ns, true);
  return ns;
}
function showGuestStreak(){
  const g = guestStreakState();
  if (g && typeof g.days === "number") applyStreakDisplay(g.days, g.last === localDateStr());
}

async function saveProgress(xp, score){
  const currentLesson = (typeof quizState !== "undefined" && quizState) ? quizState.lesson : null;
  if (!currentLesson) return null;
  addLocalLangXp(xp);
  if (!sb) return { streak: recordGuestStreak(), guest: true };
  const { data } = await sb.auth.getUser(); const u = data.user;
  if (!u) return { streak: recordGuestStreak(), guest: true };
  await sb.from("lesson_results").upsert({user_id:u.id,language_code:LANGUAGE_CODE,lesson_id:currentLesson.id,level_code:currentLesson.level,score:(typeof score==="number"?score:100),xp_earned:xp,completed:true},{onConflict:"user_id,language_code,lesson_id"});
  await sb.from("xp_log").insert({user_id:u.id,language_code:LANGUAGE_CODE,source:currentLesson.id,xp});
  try { const { data:ulp } = await sb.from("user_language_progress").select("total_xp").eq("user_id",u.id).eq("language_code",LANGUAGE_CODE).single();
    const langXp = (ulp ? (ulp.total_xp || 0) : 0) + xp;
    await sb.from("user_language_progress").upsert({user_id:u.id, language_code:LANGUAGE_CODE, total_xp:langXp, current_level:currentLesson.level},{onConflict:"user_id,language_code"});
    window.__langXp = langXp; } catch(e){}
  const today = localDateStr();
  const { data:p } = await sb.from("profiles").select("total_xp,streak_days,last_study_date").eq("id",u.id).single();
  const oldXp = p ? (p.total_xp || 0) : 0;
  const oldStreak = p ? (p.streak_days || 0) : 0;
  const lastStudy = p ? p.last_study_date : null;
  const newStreak = computeNewStreak(oldStreak, lastStudy, today);
  const newXp = oldXp + xp;
  if (p){
    await sb.from("profiles").update({total_xp:newXp, streak_days:newStreak, last_study_date:today}).eq("id",u.id);
  } else {
    await sb.from("profiles").upsert({id:u.id, total_xp:newXp, streak_days:newStreak, last_study_date:today});
  }
  const xb = $("xp-badge"); if (xb) xb.textContent = "\u2B50 " + newXp + " XP";
  const hx = $("hero-xp"); if (hx) hx.textContent = newXp + " XP";
  applyStreakDisplay(newStreak, true);
  refreshUser();
  return { streak: newStreak, guest: false };
}
$("btn-login").onclick=()=>{ const b=$("btn-login"); if(b && b.disabled) return; $("auth-box").hidden=false; $("auth-box").scrollIntoView({behavior:"smooth"}); };
$("btn-signup").onclick=async()=>{ if(!sb){$("auth-msg").textContent="Isi dulu SUPABASE_URL & SUPABASE_ANON_KEY di app.js (lihat PANDUAN-DEPLOY.md).";return;}
  const {error}=await sb.auth.signUp({email:$("auth-email").value,password:$("auth-password").value});
  $("auth-msg").textContent=error?error.message:"Pendaftaran berhasil. Cek email untuk konfirmasi (bila diaktifkan), lalu masuk."; if(!error) refreshUser(); };
$("btn-signin").onclick=async()=>{ if(!sb){$("auth-msg").textContent="Isi dulu SUPABASE_URL & SUPABASE_ANON_KEY di app.js (lihat PANDUAN-DEPLOY.md).";return;}
  const {error}=await sb.auth.signInWithPassword({email:$("auth-email").value,password:$("auth-password").value});
  $("auth-msg").textContent=error?error.message:"Berhasil masuk."; refreshUser(); };
$("btn-logout").onclick=async()=>{ if(sb) await sb.auth.signOut(); refreshUser(); };

// ===== v6: TEKS UI PER BAHASA + PEMILIH BAHASA =====
const LANG_UI = {
  en: { heroEyebrow: "Belajar Bahasa Inggris \u00B7 A0 sampai C2",
    dashSub: "Persentase selesai untuk Bahasa Inggris dan untuk setiap level A0 sampai C2, dihitung dari pelajaran yang sudah kamu selesaikan.",
    bank1: "Diberikan kata Bahasa Inggris, pilih arti Bahasa Indonesianya yang tepat.",
    bank2: "Diberikan arti Bahasa Indonesia, pilih kata Bahasa Inggrisnya yang tepat.",
    bank4: "Pilih terjemahan Bahasa Indonesia yang tepat untuk kalimat Bahasa Inggris.",
    heroTitle: "Belajar Bahasa Inggris, selangkah demi selangkah",
    heroSub: "42 pelajaran berurutan dari pemula mutlak sampai sangat mahir — setiap soal, kosakata, dan contoh kalimat ada arti Bahasa Indonesianya, jadi kamu selalu mengerti kenapa jawabannya begitu.",
    showcaseTitle: "English", chip: "ENGLISH • A0–C2 • 42 PELAJARAN",
    chartNote: "A0 = langkah pertama: kenalan huruf, bunyi, dan salam. Ikuti jalurnya dari atas ke bawah.",
    signature: "Jalur A0–C2 — 42 pelajaran berurutan, 10 soal di setiap latihan",
    checklist: ["42 pelajaran berurutan dari A0 sampai C2 — 6 pelajaran di setiap level",
      "10 soal di setiap latihan, tanpa soal yang mengulang, ditutup pop-up hasil: benar berapa, salah berapa, nilai, dan XP",
      "Arti Bahasa Indonesia di soal, contoh kalimat, catatan, dan kosakata",
      "13 Catatan Penting tata bahasa: am/is/are, do/does, a/an, kata ganti, dan lainnya",
      "Jenis Kata (kata benda, kata kerja, kata sifat, dan lainnya) + Kata Hari Ini yang berganti setiap hari",
      "Bank Soal: 4 bentuk soal — arti kata, kata dari arti, lengkapi kalimat, arti kalimat — total 420 soal",
      "Dashboard Master, Roadmap level, dan Study Tracker mingguan (detailnya di bawah)",
      "XP dan streak belajar tersimpan di akunmu — masuk supaya progres tidak reset"],
    showcaseNote: "Fokus belajarnya mencakup 4 skill — Grammar (Catatan Penting), Vocab (Jenis Kata dan soal), Reading (contoh kalimat dan artinya), dan Writing (menjawab dan melengkapi kalimat). Penjelasan selalu dalam Bahasa Indonesia.",
    notesTitle: "📝 Catatan Penting", notesSub: "Aturan dasar yang paling sering dipakai — am/is/are, do/does, sampai kenapa “a university” bukan “an university”. Klik judul catatan untuk membuka aturan, contoh kalimat, dan artinya.",
    wordsTitle: "🏷️ Jenis Kata (Parts of Speech)", wordsSub: "Supaya tahu kata itu termasuk kata benda, kata kerja, kata sifat, atau lainnya. Kata Hari Ini berganti otomatis setiap hari.",
    jalurTitle: "🗺️ Jalur Belajar — 42 Pelajaran, A0 sampai C2" },
  ko: { heroEyebrow: "Belajar Bahasa Korea \u00B7 Hangul sampai C2",
    dashSub: "Persentase selesai untuk Bahasa Korea dan untuk setiap level A0 sampai C2, dihitung dari pelajaran yang sudah kamu selesaikan.",
    bank1: "Diberikan kata Bahasa Korea, pilih arti Bahasa Indonesianya yang tepat.",
    bank2: "Diberikan arti Bahasa Indonesia, pilih kata Bahasa Koreanya yang tepat.",
    bank4: "Pilih terjemahan Bahasa Indonesia yang tepat untuk kalimat Bahasa Korea.",
    heroTitle: "Belajar Bahasa Korea, selangkah demi selangkah",
    heroSub: "42 pelajaran berurutan dari Hangul sampai sangat mahir — setiap soal, kosakata Hangul (dengan cara bacanya), dan contoh kalimat ada arti Bahasa Indonesianya, jadi kamu selalu mengerti kenapa jawabannya begitu.",
    showcaseTitle: "한국어 · Korean", chip: "KOREAN • HANGUL → C2 • 42 PELAJARAN",
    chartNote: "A0 = langkah pertama: kenalan Hangul & bunyi. Ikuti jalurnya dari atas ke bawah.",
    signature: "Roadmap Hangul → C2 — 42 pelajaran berurutan, 10 soal di setiap latihan",
    checklist: ["Roadmap Hangul → C2 lengkap: 42 pelajaran berurutan dari A0 sampai C2 — 6 pelajaran di setiap level",
      "10 soal di setiap latihan, tanpa soal yang mengulang, ditutup pop-up hasil: benar berapa, salah berapa, nilai, dan XP",
      "Kosakata Hangul + cara baca (romanisasi) + arti Bahasa Indonesia di setiap kata, soal, dan contoh kalimat",
      "10 Catatan Penting tata bahasa Korea: Hangul, partikel 은/는 · 이/가 · 을/를, akhiran sopan -요/-입니다, angka, dan kata tanya",
      "Cheatsheet 반말 vs 존댓말 (casual vs polite) — kapan memakai gaya santai dan kapan gaya sopan",
      "Jenis Kata Korea (명사 kata benda, 동사 kata kerja, 조사 partikel, dan lainnya) + Kata Hari Ini yang berganti setiap hari",
      "Bank Soal: 4 bentuk soal — arti kata, kata dari arti, lengkapi kalimat, arti kalimat — total 420 soal",
      "Dashboard Master, Roadmap level, dan Study Tracker mingguan; progres dan XP Bahasa Korea terpisah dari Bahasa Inggris"],
    showcaseNote: "Fokus belajarnya: Hangul dan kosakata dulu, lalu tata bahasa lewat Catatan Penting, dan latihan soal di setiap pelajaran. Khusus Bahasa Korea dengan penjelasan Bahasa Indonesia — progres dan XP-nya terpisah dari Bahasa Inggris.",
    notesTitle: "📝 Catatan Penting Bahasa Korea", notesSub: "Aturan dasar Korea — Hangul, partikel 은/는 · 이/가 · 을/를, akhiran sopan -요/-입니다, sampai cheatsheet 반말 vs 존댓말. Klik judul catatan untuk membuka aturan, contoh kalimat, dan artinya.",
    wordsTitle: "🏷️ Jenis Kata Korea (품사 Pumsa)", wordsSub: "Supaya tahu kata itu termasuk kata benda (명사), kata kerja (동사), kata sifat (형용사), partikel (조사), atau lainnya. Kata Hari Ini berganti otomatis setiap hari.",
    jalurTitle: "🗺️ Jalur Belajar Korea — 42 Pelajaran, A0 sampai C2" }
};
function applyLanguage(code){
  LANGUAGE_CODE = code === "ko" ? "ko" : "en";
  try { localStorage.setItem("ela_lang", LANGUAGE_CODE); } catch(e){}
  window.__langXp = undefined;
  const U = LANG_UI[LANGUAGE_CODE];
  const set = function(id, txt){ const el = $(id); if (el && txt) el.textContent = txt; };
  set("hero-title", U.heroTitle); set("hero-sub", U.heroSub);
  set("hero-eyebrow", U.heroEyebrow); set("dash-sub", U.dashSub);
  set("bank-desc-1", U.bank1); set("bank-desc-2", U.bank2); set("bank-desc-4", U.bank4);
  set("showcase-title", U.showcaseTitle); set("showcase-chip", U.chip);
  set("chart-note", U.chartNote); set("signature-title", U.signature);
  set("notes-title", U.notesTitle); set("notes-sub", U.notesSub);
  set("words-title", U.wordsTitle); set("words-sub", U.wordsSub);
  set("jalur-title", U.jalurTitle);
  const cl = $("showcase-checklist");
  if (cl) cl.innerHTML = U.checklist.map(function(x){ return "<li>" + x + "</li>"; }).join("");
  const sn = $("showcase-note"); if (sn) sn.textContent = U.showcaseNote;
  const be = $("lang-btn-en"), bk = $("lang-btn-ko");
  if (be) be.classList.toggle("is-active", LANGUAGE_CODE === "en");
  if (bk) bk.classList.toggle("is-active", LANGUAGE_CODE === "ko");
  renderNotes(); renderWordClasses(); renderLessons(); renderPanels();
}
const _be = $("lang-btn-en"); if (_be) _be.onclick = function(){ applyLanguage("en"); refreshUser(); };
const _bk = $("lang-btn-ko"); if (_bk) _bk.onclick = function(){ applyLanguage("ko"); refreshUser(); };
applyLanguage(LANGUAGE_CODE);

refreshUser();

// ===== v7: KONTEN VOLINGO LIVE =====
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
function renderV7(){
  var isKo = LANGUAGE_CODE === "ko";
  var ven = document.getElementById("v7-en"), vko = document.getElementById("v7-ko");
  if (ven) ven.hidden = isKo; if (vko) vko.hidden = !isKo;
  var pk = document.getElementById("ko-partikel"); if (pk) pk.hidden = !isKo; // v9: catatan partikel hanya di mode Korea
  if (!isKo && typeof ESSAYS !== "undefined"){
    document.getElementById("essays").innerHTML = ESSAYS.map(function(e,i){ return '<details class="note-card"><summary>'+esc(e.type)+' · Band '+esc(e.band)+' — '+esc(e.title)+'</summary><div class="note-body"><p><b>Soal:</b> '+esc(e.prompt)+'</p><p><b>Template:</b> '+esc(e.template)+'</p><p style="white-space:pre-line">'+esc(e.body)+'</p><p><b>Catatan Bahasa Indonesia:</b> '+esc(e.id_note)+'</p></div></details>'; }).join("");
    document.getElementById("mock-list").innerHTML = MOCK_TESTS.map(function(m,i){ return '<article class="bank-card"><h3>'+esc(m.name)+'</h3><p>10 soal · '+m.minutes+' menit · ada timer, skor, dan pembahasan tiap soal.</p><button class="btn btn-primary" onclick="startMock('+i+')">Mulai Mock Test</button></article>'; }).join("");
    document.getElementById("speaking").innerHTML = SPEAKING.map(function(s,i){ return '<details class="note-card"><summary>Topik '+(i+1)+': '+esc(s.topic)+'</summary><div class="note-body"><p>'+esc(s.cue)+'</p><p><b>Tips:</b> '+esc(s.tips)+'</p></div></details>'; }).join("");
    renderIdioms("");
    document.getElementById("business").innerHTML = BUSINESS.map(function(b){ return '<details class="note-card" open><summary>'+esc(b.title)+'</summary><div class="note-body">'+b.items.map(function(it){ return '<p><b>'+esc(it[0])+'</b><br>'+esc(it[1])+'</p>'; }).join("")+'</div></details>'; }).join("");
    document.getElementById("cambridge").innerHTML = CAMBRIDGE.map(function(c){ return '<article class="bank-card"><h3>'+esc(c.level)+'</h3><p>'+esc(c.desc)+'</p><p><b>Format:</b> '+esc(c.format)+'</p><p><b>Tips:</b> '+esc(c.tips)+'</p>'+c.sample.map(function(s){ return '<p><b>Contoh:</b> '+esc(s[0])+'<br>Jawaban: <b>'+esc(s[1][0])+'</b> — '+esc(s[2])+'</p>'; }).join("")+'</article>'; }).join("");
  }
  if (isKo && typeof TOPIK1 !== "undefined"){
    document.getElementById("topik-list").innerHTML = '<article class="bank-card"><h3>TOPIK I — Kuis</h3><p>20 soal · 25 menit · timer + pembahasan + strategy tip.</p><button class="btn btn-primary" onclick="startTopik(0)">Mulai TOPIK I</button></article><article class="bank-card"><h3>TOPIK II — Kuis</h3><p>20 soal · 30 menit · timer + pembahasan + strategy tip.</p><button class="btn btn-primary" onclick="startTopik(1)">Mulai TOPIK II</button></article>';
    document.getElementById("topik-bank").innerHTML = '<h3 style="margin-top:16px">📖 Daftar Soal + Kunci + Strategi (mode belajar)</h3>' + [["TOPIK I",TOPIK1],["TOPIK II",TOPIK2]].map(function(g){ return '<h4>'+g[0]+'</h4>'+g[1].map(function(q,i){ return '<details class="note-card"><summary>'+(i+1)+'. '+esc(q[0])+'</summary><div class="note-body"><p>'+q[1].map(function(o,j){ return (j===q[2]?'✅ ':'')+esc(o); }).join("<br>")+'</p><p><b>Pembahasan:</b> '+esc(q[3])+'</p><p><b>Strategy tip:</b> '+esc(q[4])+'</p></div></details>'; }).join(""); }).join("");
    document.getElementById("komock-list").innerHTML = '<article class="bank-card"><h3>TOPIK Reading — Mock</h3><p>10 soal · 15 menit · timer + skor.</p><button class="btn btn-primary" onclick="startKoMock(0)">Mulai Reading</button></article><article class="bank-card"><h3>TOPIK Listening — Mock (transkrip)</h3><p>10 soal · 15 menit · baca transkripnya seperti mendengarkan audio.</p><button class="btn btn-primary" onclick="startKoMock(1)">Mulai Listening</button></article>';
    document.getElementById("komock-writing").innerHTML = '<h3 style="margin-top:16px">✍️ TOPIK Writing — 5 Tugas + Contoh Jawaban</h3>' + KOMOCK_W.map(function(w,i){ return '<details class="note-card"><summary>Tugas '+(i+1)+': '+esc(w.prompt)+'</summary><div class="note-body"><p style="white-space:pre-line">'+esc(w.model)+'</p><p><b>Tips:</b> '+esc(w.tip)+'</p></div></details>'; }).join("");
    renderKoVocab("");
    document.getElementById("kdrama").innerHTML = KDRAMA.map(function(g){ return '<article class="bank-card" style="margin-bottom:12px"><h3>'+esc(g.level)+'</h3>'+g.items.map(function(it){ return '<label style="display:block;margin:6px 0"><input type="checkbox"> '+esc(it)+'</label>'; }).join("")+'</article>'; }).join("");
    document.getElementById("gks-eps").innerHTML = '<details class="note-card" open><summary>'+esc(GKS.title)+'</summary><div class="note-body"><p style="white-space:pre-line">'+esc(GKS.body)+'</p></div></details><details class="note-card" open><summary>'+esc(EPS.title)+'</summary><div class="note-body"><p style="white-space:pre-line">'+esc(EPS.body)+'</p></div></details>';
  }
}
function renderIdioms(q){
  if (typeof IDIOMS === "undefined") return;
  var all = IDIOMS.map(function(x){ return ["Idiom"].concat(x); }).concat(PHRASAL.map(function(x){ return ["Phrasal Verb"].concat(x); }));
  var f = all.filter(function(x){ return !q || (x[1]+" "+x[2]).toLowerCase().indexOf(q.toLowerCase())>=0; });
  var el = document.getElementById("idioms"); if (!el) return;
  document.getElementById("idiom-count").textContent = "Menampilkan " + Math.min(f.length,120) + " dari " + all.length + " entri" + (f.length>120 ? " — persempit dengan pencarian untuk melihat lainnya." : ".");
  el.innerHTML = f.slice(0,120).map(function(x){ return '<article class="bank-card"><h3>'+esc(x[1])+'</h3><p><small>'+esc(x[0])+'</small><br><b>Arti:</b> '+esc(x[2])+'<br><i>'+esc(x[3])+'</i><br>'+esc(x[4])+'</p></article>'; }).join("");
}
function renderKoVocab(q){
  if (typeof KO_VOCAB === "undefined") return;
  var f = KO_VOCAB.filter(function(x){ return !q || (x[0]+" "+x[1]+" "+x[2]).toLowerCase().indexOf(q.toLowerCase())>=0; });
  var el = document.getElementById("kovocab"); if (!el) return;
  el.innerHTML = f.slice(0,120).map(function(x){ return '<article class="bank-card"><h3>'+esc(x[0])+'</h3><p>'+esc(x[1])+' — '+esc(x[2])+'</p></article>'; }).join("");
}
var _is = document.getElementById("idiom-search"); if (_is) _is.addEventListener("input", function(){ renderIdioms(this.value); });
var _ks = document.getElementById("kovocab-search"); if (_ks) _ks.addEventListener("input", function(){ renderKoVocab(this.value); });

// ===== v7 MOCK TEST ENGINE (timer + skor + pembahasan) =====
var mockState = null, mockTimer = null;
function fmtTime(s){ var m=Math.floor(s/60), d=s%60; return (m<10?"0":"")+m+":"+(d<10?"0":"")+d; }
function startMockSet(title, questions, minutes){
  mockState = { title:title, qs:questions, idx:0, correct:0, wrong:0, total:questions.length, remain:minutes*60, answers:[] };
  document.getElementById("home-view").hidden = true;
  var lv = document.getElementById("lesson-view"); if (lv) lv.hidden = true;
  document.getElementById("mock-view").hidden = false;
  window.scrollTo(0,0);
  clearInterval(mockTimer);
  mockTimer = setInterval(function(){ mockState.remain--; document.getElementById("mock-timer").textContent = "⏱️ " + fmtTime(Math.max(0,mockState.remain)); if (mockState.remain<=0){ clearInterval(mockTimer); finishMock(true); } }, 1000);
  document.getElementById("mock-timer").textContent = "⏱️ " + fmtTime(mockState.remain);
  document.getElementById("mock-title").textContent = title;
  document.getElementById("mock-review").innerHTML = "";
  showMockQ();
}
function startMock(i){ var m = MOCK_TESTS[i]; startMockSet(m.name, m.questions.map(function(q){ return {q:q[0], opts:q[1], ans:q[2], why:q[3]}; }), m.minutes); }
function startTopik(which){ var src = which===0?TOPIK1:TOPIK2; startMockSet(which===0?"Bank Soal TOPIK I":"Bank Soal TOPIK II", src.map(function(q){ return {q:q[0], opts:q[1], ans:q[2], why:q[3]+" Strategy: "+q[4]}; }), which===0?25:30); }
function startKoMock(which){ var src = which===0?KOMOCK_R:KOMOCK_L; startMockSet(which===0?"TOPIK Mock — Reading":"TOPIK Mock — Listening (Transkrip)", src.map(function(q){ return {q:q[0], opts:q[1], ans:q[2], why:q[3]+" Strategi: "+q[4]}; }), 15); }
function showMockQ(){
  var st = mockState, q = st.qs[st.idx];
  st.answered = false; // v9
  document.getElementById("mock-meta").textContent = st.title + " — selesaikan sebelum timer habis.";
  document.getElementById("mock-counter").textContent = "Soal " + (st.idx+1) + " dari " + st.total;
  document.getElementById("mock-live").textContent = "✅ Benar: " + st.correct + " · ❌ Salah: " + st.wrong;
  document.getElementById("mock-progress-fill").style.width = ((st.idx)/st.total*100) + "%";
  document.getElementById("mock-q").textContent = q.q;
  document.getElementById("mock-feedback").textContent = "";
  document.getElementById("mock-next").hidden = true;
  document.getElementById("mock-options").innerHTML = q.opts.map(function(o,i){ return '<button class="btn btn-outline" style="display:block;width:100%;margin:6px 0;text-align:left" onclick="answerMock('+i+')">'+esc(o)+'</button>'; }).join("");
}
function answerMock(i){
  var st = mockState, q = st.qs[st.idx], ok = i===q.ans;
  if (st.answered) return; // v9: satu soal hanya boleh dijawab & dihitung sekali
  st.answered = true;
  if (ok) st.correct++; else st.wrong++;
  st.answers.push({q:q, picked:i, ok:ok});
  document.getElementById("mock-live").textContent = "✅ Benar: " + st.correct + " · ❌ Salah: " + st.wrong;
  document.getElementById("mock-feedback").textContent = ok ? "✅ Benar!" : "❌ Salah. Jawaban benar: " + q.opts[q.ans];
  document.getElementById("mock-feedback").textContent += " — " + q.why;
  document.querySelectorAll("#mock-options button").forEach(function(b){ b.disabled = true; });
  var nx = document.getElementById("mock-next");
  nx.hidden = false; nx.textContent = st.idx+1>=st.total ? "Lihat Hasil →" : "Lanjut →";
  nx.onclick = function(){ st.idx++; if (st.idx>=st.total) finishMock(false); else showMockQ(); };
}
function finishMock(timeUp){
  clearInterval(mockTimer);
  var st = mockState; if (!st) return;
  var done = st.answers.length, score = st.total ? Math.round(st.correct/st.total*100) : 0;
  document.getElementById("mock-q").textContent = (timeUp ? "⏰ Waktu habis! " : "🎉 Mock Test Selesai! ") + "Skor kamu: " + score + "/100 — Benar " + st.correct + ", Salah " + st.wrong + (done<st.total ? ", Tidak dijawab " + (st.total-done) : "");
  document.getElementById("mock-options").innerHTML = "";
  document.getElementById("mock-feedback").textContent = "";
  document.getElementById("mock-next").hidden = true;
  document.getElementById("mock-progress-fill").style.width = "100%";
  document.getElementById("mock-review").innerHTML = "<h3 style='margin-top:16px'>📖 Pembahasan Semua Soal</h3>" + st.qs.map(function(q,i){ var a = st.answers[i]; return '<details class="note-card"><summary>'+(i+1)+'. '+esc(q.q)+'</summary><div class="note-body"><p>Jawaban benar: <b>'+esc(q.opts[q.ans])+'</b>'+(a?(' · Jawabanmu: <b>'+esc(q.opts[a.picked])+'</b> '+(a.ok?'✅':'❌')):' · Tidak dijawab')+'</p><p>'+esc(q.why)+'</p></div></details>'; }).join("");
}
var _mb = document.getElementById("btn-mock-back"); if (_mb) _mb.onclick = function(){ clearInterval(mockTimer); document.getElementById("mock-view").hidden = true; document.getElementById("home-view").hidden = false; window.scrollTo(0,0); };
// hook into language switching
(function(){ var orig = applyLanguage; applyLanguage = function(code){ orig(code); renderV7(); }; renderV7(); })();

// ===== v8: TOMBOL DENGARKAN UNTUK KONTEN v7 (enhancer DOM) =====
// Renderer v7 membangun kartu lewat innerHTML; enhancer ini menambahkan
// tombol Dengarkan ke kartu yang sudah jadi (idiom, business, esai,
// speaking, kosakata Korea) tanpa mengubah renderer aslinya.
function ttsMakeBtn(text, lang, label) {
  var b = document.createElement("button");
  b.type = "button"; b.className = "tts-btn"; b.textContent = label || "\uD83D\uDD0A Dengarkan";
  b.addEventListener("click", function () { ttsSpeak(text, lang); });
  return b;
}
function ttsEnhance() {
  if (typeof LANGUAGE_CODE === "undefined") return;
  var isKo = LANGUAGE_CODE === "ko";
  if (!isKo) {
    document.querySelectorAll("#idioms .bank-card").forEach(function (card) {
      if (card.dataset.ttsDone) return; card.dataset.ttsDone = "1";
      var h = card.querySelector("h3"), ex = card.querySelector("i");
      if (h && h.textContent.trim()) h.appendChild(document.createTextNode(" "));
      if (h) h.appendChild(ttsMakeBtn(h.textContent.replace("\uD83D\uDD0A Dengarkan", "").trim(), "en-US", "\uD83D\uDD0A"));
      if (ex && ex.textContent.trim()) { ex.parentNode.appendChild(document.createTextNode(" ")); ex.parentNode.appendChild(ttsMakeBtn(ex.textContent.trim(), "en-US", "\uD83D\uDD0A Contoh Kalimat")); }
    });
    document.querySelectorAll("#business .note-body p").forEach(function (p) {
      if (p.dataset.ttsDone) return; p.dataset.ttsDone = "1";
      var b = p.querySelector("b");
      if (b && b.textContent.trim()) { b.after(ttsMakeBtn(b.textContent.trim(), "en-US")); }
    });
    document.querySelectorAll("#essays .note-body").forEach(function (body) {
      if (body.dataset.ttsDone) return; body.dataset.ttsDone = "1";
      var ps = body.querySelectorAll("p"), longest = null;
      ps.forEach(function (p) { if (!longest || p.textContent.length > longest.textContent.length) longest = p; });
      if (longest && longest.textContent.trim().length > 40) body.appendChild(ttsMakeBtn(longest.textContent.trim(), "en-US", "\uD83D\uDD0A Dengarkan Esai Ini"));
    });
    document.querySelectorAll("#speaking .note-card").forEach(function (card) {
      if (card.dataset.ttsDone) return; card.dataset.ttsDone = "1";
      var sum = card.querySelector("summary"), body = card.querySelector(".note-body");
      if (sum && body) {
        var topic = sum.textContent.replace(/^Topik \d+:\s*/, "").trim();
        if (topic) body.insertBefore(ttsMakeBtn(topic, "en-US", "\uD83D\uDD0A Dengarkan Topik"), body.firstChild);
      }
    });
  }
  if (isKo) {
    document.querySelectorAll("#kovocab .bank-card").forEach(function (card) {
      if (card.dataset.ttsDone) return; card.dataset.ttsDone = "1";
      var h = card.querySelector("h3");
      if (h && h.textContent.trim()) { h.appendChild(document.createTextNode(" ")); h.appendChild(ttsMakeBtn(h.textContent.trim(), "ko-KR", "\uD83D\uDD0A")); }
    });
  }
}

// ===== v8: DAFTAR LISTENING TOPIK — putar dialog, transkrip tersembunyi =====
function renderListeningList() {
  var el = document.getElementById("topik-listening-list");
  if (!el || typeof KOMOCK_L === "undefined" || el.dataset.done) return;
  el.dataset.done = "1";
  el.innerHTML = "";
  KOMOCK_L.forEach(function (q, i) {
    var raw = String(q[0]).replace(/^\[Dengarkan\]\s*/, "");
    var seg = raw.split(" \u2192 ");
    var dialog = seg[0], question = seg.slice(1).join(" \u2192 ");
    var parts = ttsDialogParts(dialog);
    var card = document.createElement("article");
    card.className = "bank-card tts-dialog-wrap";
    var h = document.createElement("h3"); h.textContent = "Dialog " + (i + 1); card.appendChild(h);
    var note = document.createElement("p");
    note.className = "tts-transcript-note"; note.hidden = true;
    note.textContent = "\uD83C\uDFA7 Transkrip disembunyikan seperti ujian asli \u2014 dengarkan dulu, transkripnya muncul otomatis setelah suara selesai.";
    card.appendChild(note);
    var row = document.createElement("p");
    var play = document.createElement("button");
    play.type = "button"; play.className = "tts-btn tts-btn-dialog"; play.textContent = "\uD83D\uDD0A Dengarkan Dialog";
    play.addEventListener("click", function () {
      tr.classList.add("is-hidden"); note.hidden = false;
      ttsSpeakSeq(parts, "ko-KR", function () { tr.classList.remove("is-hidden"); note.hidden = true; });
    });
    row.appendChild(play);
    var tog = document.createElement("button");
    tog.type = "button"; tog.className = "tts-btn tts-btn-ghost"; tog.textContent = "\uD83D\uDCC4 Tampilkan / Sembunyikan Transkrip";
    tog.addEventListener("click", function () { tr.classList.toggle("is-hidden"); });
    row.appendChild(tog);
    card.appendChild(row);
    var tr = document.createElement("div");
    tr.className = "tts-transcript is-hidden";
    tr.innerHTML = "<p><b>Transkrip:</b> </p><p><b>Soal:</b> </p><p><b>Pembahasan:</b> </p>";
    tr.children[0].appendChild(document.createTextNode(dialog));
    tr.children[1].appendChild(document.createTextNode(question || "-"));
    tr.children[2].appendChild(document.createTextNode(q[3]));
    card.appendChild(tr);
    el.appendChild(card);
  });
}
// ===== v8: MOCK LISTENING — dialog dibacakan, soal dipisah dari transkrip =====
(function () {
  var origShow = window.showMockQ;
  if (typeof origShow === "function") {
    window.showMockQ = function () {
      origShow();
      var st = window.mockState; if (!st || !st.qs || !st.qs[st.idx]) return;
      var q = st.qs[st.idx];
      var mt = document.getElementById("mock-tts"); if (!mt) return;
      mt.innerHTML = "";
      if (typeof q.q === "string" && q.q.indexOf("[Dengarkan]") === 0) {
        var raw = q.q.replace(/^\[Dengarkan\]\s*/, "");
        var seg = raw.split(" \u2192 ");
        var dialog = seg[0], question = seg.slice(1).join(" \u2192 ");
        var mq = document.getElementById("mock-q");
        if (mq && question) mq.textContent = question;
        var title = document.getElementById("mock-title");
        if (title && title.textContent.indexOf("Transkrip") >= 0) title.textContent = title.textContent.replace("Transkrip", "Suara TTS");
        var parts = ttsDialogParts(dialog);
        var wrap = document.createElement("div");
        wrap.className = "tts-dialog-wrap tts-dialog-panel";
        var note = document.createElement("p");
        note.className = "tts-transcript-note"; note.hidden = true;
        note.textContent = "\uD83C\uDFA7 Mode ujian: transkrip disembunyikan \u2014 dengarkan dialognya dulu. Transkrip muncul otomatis setelah suara selesai.";
        wrap.appendChild(note);
        var row = document.createElement("p");
        var play = document.createElement("button");
        play.type = "button"; play.className = "tts-btn tts-btn-dialog"; play.textContent = "\uD83D\uDD0A Dengarkan Dialog";
        var tr = document.createElement("div");
        tr.className = "tts-transcript is-hidden";
        tr.innerHTML = "<p><b>Transkrip dialog:</b> </p>";
        tr.children[0].appendChild(document.createTextNode(dialog));
        play.addEventListener("click", function () {
          tr.classList.add("is-hidden"); note.hidden = false;
          ttsSpeakSeq(parts, "ko-KR", function () { tr.classList.remove("is-hidden"); note.hidden = true; });
        });
        row.appendChild(play);
        var tog = document.createElement("button");
        tog.type = "button"; tog.className = "tts-btn tts-btn-ghost"; tog.textContent = "\uD83D\uDCC4 Tampilkan / Sembunyikan Transkrip";
        tog.addEventListener("click", function () { tr.classList.toggle("is-hidden"); });
        row.appendChild(tog);
        wrap.appendChild(row); wrap.appendChild(tr);
        mt.appendChild(wrap);
      }
    };
  }
  var origSMS = window.startMockSet;
  if (typeof origSMS === "function") {
    window.startMockSet = function (t, qs, m) { ttsStop(); origSMS(t, qs, m); };
  }
  var origFinish = window.finishMock;
  if (typeof origFinish === "function") {
    window.finishMock = function (x) { ttsStop(); origFinish(x); };
  }
  var mb = document.getElementById("btn-mock-back");
  if (mb) mb.addEventListener("click", function () { ttsStop(); });
})();

// ===== v8: inisialisasi bilah kontrol TTS + enhancer =====
(function () {
  var slow = document.getElementById("tts-rate-slow"), norm = document.getElementById("tts-rate-normal");
  var stop = document.getElementById("tts-stop");
  if (slow) slow.onclick = function () { ttsSetRate("slow"); };
  if (norm) norm.onclick = function () { ttsSetRate("normal"); };
  if (stop) stop.onclick = function () { ttsStop(); };
  ttsSetRate(ttsRate === 0.72 ? "slow" : "normal");
  if (!TTS_OK) {
    var bar = document.getElementById("tts-bar");
    if (bar) bar.classList.add("tts-bar-unsupported");
    var st = document.getElementById("tts-status");
    if (st) st.textContent = "Browser/HP ini tidak mendukung suara TTS bawaan \u2014 coba Chrome terbaru atau Safari.";
  }
  window.addEventListener("beforeunload", function () { ttsStop(); });
  renderListeningList();
  ttsEnhance();
  var bk = document.getElementById("lang-btn-ko"), be = document.getElementById("lang-btn-en");
  if (bk) bk.addEventListener("click", function () { setTimeout(function () { renderListeningList(); ttsEnhance(); }, 60); });
  if (be) be.addEventListener("click", function () { setTimeout(ttsEnhance, 60); });
  var timer = null;
  if ("MutationObserver" in window) {
    var mo = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(function () { renderListeningList(); ttsEnhance(); }, 120);
    });
    ["idioms", "business", "essays", "speaking", "kovocab", "topik-listening-list"].forEach(function (id) {
      var n = document.getElementById(id);
      if (n) mo.observe(n, { childList: true });
    });
  }
})();
