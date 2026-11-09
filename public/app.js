// ===== KONFIGURASI SUPABASE ===== (v6)
// Ganti dua nilai ini dengan URL & anon key proyek Supabase kamu
// (Supabase Dashboard > Settings > API). Anon key aman tampil di frontend
// karena data dilindungi Row Level Security di database.
const SUPABASE_URL = "https://tdwkghphdppwvznxcggz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HB_emJDuMKe3GflAeLqPrA_JAmYLLz8";
let LANGUAGE_CODE = (function(){ try { return (function(){ var v = localStorage.getItem("ela_lang"); return (v === "ko" || v === "ja") ? v : "en"; })(); } catch(e){ return "en"; } })(); // v6: bisa diganti lewat pemilih bahasa (en/ko)

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
function curLessons(){ return LANGUAGE_CODE === "ko" ? LESSONS_KO : LANGUAGE_CODE === "ja" ? LESSONS_JA : LESSONS_EN; }
function curVocab(){ return LANGUAGE_CODE === "ko" ? LESSON_VOCAB_KO : LANGUAGE_CODE === "ja" ? LESSON_VOCAB_JA : LESSON_VOCAB_EN; }
function curNotes(){ return LANGUAGE_CODE === "ko" ? NOTES_KO : LANGUAGE_CODE === "ja" ? NOTES_JA : NOTES_EN; }
function curWordClasses(){ return LANGUAGE_CODE === "ko" ? WORD_CLASSES_KO : LANGUAGE_CODE === "ja" ? WORD_CLASSES_JA : WORD_CLASSES_EN; }
function langName(){ return LANGUAGE_CODE === "ko" ? "한국어 · Korean" : LANGUAGE_CODE === "ja" ? "日本語 · Japanese" : "English"; }
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
  n[2].map(e=>`<p class="note-example"><b>${e[0]}</b> ${ttsBtn(e[0], ttsLangForMode())}${e[1]?`<br><span class="translation">Artinya: ${e[1]}</span>`:""}</p>`).join("")+`</div></details>`).join(""); }
renderNotes();
function renderWordClasses(){ $("word-classes").innerHTML = curWordClasses().map(wc=>{ const pool=wc[2]; const t=pool[dayIndex(pool)];
  var wcLang = ttsLangForMode();
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
  const hf=$("hero-progress-fill"); if(hf) hf.style.width=pct+"%"; // v16.4: progres pelajaran HANYA di kartu hero — bar atas sekarang bar scroll (lihat v16ScrollBar di bawah)
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
// v11: teks Bahasa Indonesia di SOAL harus bersih — tanpa romanisasi / ejaan
// fonetik yang menempel di belakang arti. Di data kosakata Korea, arti
// disimpan sebagai "arti Indonesia — romanisasi" (mis. "merah — ppalgansaek")
// supaya daftar kosakata & kartu belajar tetap bisa menunjukkan pelafalan.
// Fungsi ini hanya MEMOTONG ekor " — <tulisan Latin>" dari sebuah glos arti
// yang berdiri sendiri, dan hanya bila kepala teksnya bukan Hangul dan
// ekornya murni huruf Latin (pola romanisasi). Kalimat utuh (diakhiri tanda
// baca, atau mengandung Hangul) tidak pernah diubah — jadi baris Contoh
// "Contoh: <kalimat> — Artinya: <arti>" dan soal TOPIK seperti
// "을/를 — di sini '을'" tetap persis seperti semula.
function cleanIdText(s){
  if (typeof s !== "string") return s;
  const i = s.indexOf(" \u2014 ");
  if (i < 0) return s;
  const head = s.slice(0, i), tail = s.slice(i + 3);
  if (/[\uac00-\ud7a3]/.test(head)) return s;               // kepala Hangul: bukan glos Indonesia
  if (!/^[A-Za-z][A-Za-z\-' ]*$/.test(tail)) return s;      // ekor bukan romanisasi murni
  if (tail.length > 40 || head.length > 90) return s;       // glos selalu pendek
  return head.trim();
}

// ===== v12: IKON SUARA DI SAMPING SETIAP PILIHAN JAWABAN =====
// Di samping teks SETIAP pilihan jawaban ada ikon 🔊 kecil (tombol terpisah
// di samping tombol jawaban, BUKAN di dalamnya — jadi teks pilihan tetap
// bersih dan menekan ikon TIDAK ikut memilih jawaban). Yang dibunyikan
// selalu kata/kalimat BAHASA TARGET (Korea ko-KR / Inggris en-US), tidak
// pernah arti Bahasa Indonesianya:
//   pilihan "merah"   -> berbunyi "빨간색" (Korea) / "red" (Inggris)
//   pilihan "빨간색"  -> berbunyi "빨간색"
//   pilihan "red"     -> berbunyi "red"
// Suara memakai TTS gratis yang sama (Web Speech API) dan mengikuti
// pengaturan kecepatan Lambat/Normal di bilah Dengarkan (ttsRate).
function ttsLangForMode(){ return LANGUAGE_CODE === "ko" ? "ko-KR" : LANGUAGE_CODE === "ja" ? "ja-JP" : "en-US"; }
function speakNormKey(s){
  return String(s == null ? "" : s).toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9\uac00-\ud7a3]+/gi, " ")
    .replace(/\s+/g, " ").trim();
}
var __speakMaps = null;
function speakMaps(){
  if (__speakMaps) return __speakMaps[LANGUAGE_CODE] || __speakMaps.en;
  var all = {};
  ["en", "ko", "ja"].forEach(function(mode){
    var byId = {}, byTarget = {}, idTokens = {};
    function regTarget(t){
      if (!t) return; var k = speakNormKey(t); if (k && !byTarget[k]) byTarget[k] = String(t);
    }
    function regId(idText, targetText){
      if (!idText || !targetText) return;
      var clean = cleanIdText(String(idText));
      [clean, String(idText)].forEach(function(g){
        var k = speakNormKey(g); if (k && !byId[k]) byId[k] = String(targetText);
        g.split(/\s*\/\s*/).forEach(function(part){
          var pk = speakNormKey(part); if (pk && pk !== k && !byId[pk]) byId[pk] = String(targetText);
        });
        speakNormKey(g).split(" ").forEach(function(tok){ if (tok) idTokens[tok] = 1; });
      });
    }
    function addVocabList(list){
      (list || []).forEach(function(v){
        if (!v || v.length < 2) return;
        regTarget(v[0]); regId(v[1], v[0]);
        if (v[2]) regTarget(v[2]);
        if (v[3]) regId(v[3], v[2]);
      });
    }
    try {
      if (mode === "en") {
        if (typeof LESSON_VOCAB_EN !== "undefined") Object.keys(LESSON_VOCAB_EN).forEach(function(k){ addVocabList(LESSON_VOCAB_EN[k]); });
        if (typeof WORD_CLASSES_EN !== "undefined") WORD_CLASSES_EN.forEach(function(wc){ addVocabList(wc[2]); });
        if (typeof IDIOMS !== "undefined") addVocabList(IDIOMS);
        if (typeof PHRASAL !== "undefined") addVocabList(PHRASAL);
      } else if (mode === "ko") {
        if (typeof LESSON_VOCAB_KO !== "undefined") Object.keys(LESSON_VOCAB_KO).forEach(function(k){ addVocabList(LESSON_VOCAB_KO[k]); });
        if (typeof WORD_CLASSES_KO !== "undefined") WORD_CLASSES_KO.forEach(function(wc){ addVocabList(wc[2]); });
        if (typeof KO_VOCAB !== "undefined") KO_VOCAB.forEach(function(v){ if (v && v.length >= 3){ regTarget(v[0]); regId(v[2], v[0]); } });
        var EXTRA_KO = {
          "pukul satu": "한 시", "pukul dua": "두 시", "pukul tiga": "세 시",
          "pukul empat": "네 시", "pukul lima": "다섯 시", "pukul enam": "여섯 시",
          "dokter": "의사", "perawat": "간호사", "polisi": "경찰",
          "di kantor": "회사에 있어요", "di perpustakaan": "도서관에 있어요",
          "di rumah": "집에 있어요", "di pasar": "시장에 있어요",
          "jus": "주스", "teh": "차",
          "cerah": "맑아요", "akan hujan": "비가 올 거예요", "bersalju": "눈이 올 거예요", "berangin": "바람이 불어요",
          "jalan kaki": "걸어서", "naik bus itu": "저 버스를 타세요", "naik taksi": "택시로", "naik kereta": "기차로",
          "berbelanja": "쇼핑해요", "menonton film": "영화를 봐요", "memasak": "요리를 해요",
          "bahasa korea": "한국어", "orang korea": "한국 사람", "makanan korea": "한국 음식", "negara korea": "한국",
          "maaf": "죄송합니다", "permisi": "실례합니다", "selamat tinggal": "안녕히 가세요",
          "salju turun": "눈이 왔어요", "angin bertiup": "바람이 불어요", "cuaca panas": "날씨가 더워요",
          "panjang": "길어요", "pendek": "짧아요",
          "hari senin": "월요일", "hari selasa": "화요일", "hari rabu": "수요일", "hari kamis": "목요일",
          "hari jumat": "금요일", "hari sabtu": "토요일", "hari minggu": "일요일",
          "tidak enak": "맛없어요", "pahit": "써요", "asin": "짜요",
          "nanti malam": "오늘 밤", "olahraga": "운동", "minum kopi": "커피를 마셔요",
          "menyembunyikan": "숨기다", "bersembunyi": "숨다", "dengan diam": "조용히", "dengan keras": "세게",
          "dengan marah": "화가 나서", "dengan terpaksa": "어쩔 수 없이", "dengan hati-hati / saksama": "신중하게",
          "tidur lebih awal": "일찍 자다", "tidak setuju": "동의하지 않다", "setuju, filmnya seru": "좋아요, 영화가 재미있어요",
          "tidak boleh": "안 돼요", "boleh": "돼요", "boleh tanpa flash": "플래시 없이 찍어도 돼요", "boleh hari ini saja": "오늘만 돼요",
          "tetap": "그대로", "runtuh": "무너지다", "melambat": "둔화되다", "meningkat tajam": "급격히 증가하다",
          "menyembuhkan": "치료하다", "menyebabkan / menimbulkan": "초래하다", "mencegah": "예방하다",
          "menghentikan": "중단하다", "memindahkan": "옮기다", "meninggalkan": "떠나다", "meninggalkan gedung": "건물을 떠나다",
          "menyangkal": "부인하다", "mengakui": "인정하다", "menebak": "추측하다", "menetapkan": "정하다",
          "mengulangi": "반복하다", "melupakan": "잊다", "membatalkan acara": "행사를 취소하다",
          "menjual tiket": "표를 팔다", "membuat poster": "포스터를 만들다", "membuat obat": "약을 만들다",
          "membuang obat": "약을 버리다", "membeli obat": "약을 사다", "meminum (obat) / mengonsumsi obat": "약을 먹다",
          "mengumumkan hasil": "결과를 발표하다", "menolak pendaftaran": "신청을 거절하다",
          "belajar lagi": "다시 공부하다", "belum menonton": "아직 안 봤어요", "bosan": "지루해요",
          "beban": "부담", "bantuan": "도움", "kesempatan": "기회", "persaingan": "경쟁", "perpisahan": "이별",
          "perjanjian": "계약", "pertukaran / interaksi": "교류", "peneliti": "연구원", "pewawancara": "면접관",
          "pembaca": "독자", "responden / orang yang menjawab survei": "응답자",
          "memberi kesan (mendalam)": "깊은 인상을 남기다", "menantang diri / mencoba hal sulit": "도전하다",
          "menandatangani / menyepakati (kontrak)": "체결하다", "memperluas / memperbesar": "확대하다",
          "memperlebar perbedaan": "차이를 넓히다", "memperkecil / menjembatani perbedaan": "차이를 줄이다",
          "menciptakan perbedaan": "차이를 만들다", "mengabaikan perbedaan": "차이를 무시하다",
          "memberi pengaruh": "영향을 주다", "menerima pengaruh": "영향을 받다",
          "menghindari pengaruh": "영향을 피하다", "mengukur pengaruh": "영향을 측정하다",
          "stasiun": "역", "menolak": "거절하다", "menunda": "미루다", "mengurangi": "줄이다",
          "membatalkan": "취소하다", "mengabaikan": "무시하다", "menyerah": "포기하다", "menangis": "울다",
          "memahami / mengidentifikasi dengan tepat": "파악하다", "mencapai target": "달성하다", "mencapai (target)": "달성하다"
        };
        Object.keys(EXTRA_KO).forEach(function(k){ var kk = speakNormKey(k); if (kk && !byId[kk]) byId[kk] = EXTRA_KO[k]; });
      } else if (mode === "ja") {
        if (typeof LESSON_VOCAB_JA !== "undefined") Object.keys(LESSON_VOCAB_JA).forEach(function(k){ addVocabList(LESSON_VOCAB_JA[k]); });
        if (typeof WORD_CLASSES_JA !== "undefined") WORD_CLASSES_JA.forEach(function(wc){ addVocabList(wc[2]); });
      }
    } catch (e) {}
    all[mode] = { byId: byId, byTarget: byTarget, idTokens: idTokens };
  });
  __speakMaps = all;
  return __speakMaps[LANGUAGE_CODE] || __speakMaps.en;
}
function speakWonToKorean(raw){
  var m = String(raw || "").trim().match(/^([\d][\d.]*)\s*won$/i);
  if (!m) return "";
  var n = parseInt(m[1].replace(/\./g, ""), 10);
  if (!n) return "";
  var digits = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
  if (n === 10000) return "만 원";
  if (n % 10000 === 0 && n / 10000 < 10) return digits[n / 10000] + "만 원";
  if (n % 1000 === 0 && n / 1000 < 10) return digits[n / 1000] + "천 원";
  if (n % 100 === 0 && n / 100 < 10) return digits[n / 100] + "백 원";
  return "";
}
function resolveOptionSpeak(rawOpt, questionText){
  var raw = String(rawOpt == null ? "" : rawOpt).trim();
  if (!raw) return "";
  var ko = LANGUAGE_CODE === "ko";
  var maps = speakMaps();
  if (ko) { var won = speakWonToKorean(raw); if (won) return won; }
  var qm = raw.match(/['\u2018]([\uac00-\ud7a3]+)['\u2019]/);
  if (ko && qm) return qm[1];
  var pm = raw.match(/\(([^)]*)\)/);
  if (pm) {
    if (ko && /[\uac00-\ud7a3]/.test(pm[1])) return pm[1].trim();
    if (!ko && /[A-Za-z]{2,}/.test(pm[1])) {
      var head = raw.replace(pm[0], "").trim();
      if (maps.byId[speakNormKey(cleanIdText(head))]) return pm[1].trim();
    }
  }
  var fullKey = speakNormKey(raw);
  if (fullKey) {
    if (maps.byTarget[fullKey]) return maps.byTarget[fullKey];
    if (maps.byId[fullKey]) return maps.byId[fullKey];
  }
  var noParen = raw.replace(/\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  var key = speakNormKey(noParen);
  if (LANGUAGE_CODE === "ja" && /[\u3040-\u30ff\u4e00-\u9faf]/.test(noParen)) return noParen; // v13: teks Jepang dibunyikan apa adanya
  if (!key) return "";
  if (maps.byTarget[key]) return maps.byTarget[key];
  if (maps.byId[key]) return maps.byId[key];
  var slashParts = noParen.split(/\s*\/\s*/);
  for (var si = 0; si < slashParts.length; si++) {
    var sk = speakNormKey(slashParts[si]);
    if (maps.byTarget[sk]) return maps.byTarget[sk];
    if (maps.byId[sk]) return maps.byId[sk];
  }
  if (ko) {
    if (/[\uac00-\ud7a3]/.test(noParen)) {
      var latin = noParen.replace(/[\uac00-\ud7a3]/g, "");
      if (/[A-Za-z]{3,}/.test(latin)) {
        var runs = noParen.match(/[\uac00-\ud7a3][\uac00-\ud7a3\s\/]*/g);
        if (runs) { var joined = runs.map(function(x){ return x.trim(); }).filter(Boolean).join(" ").replace(/\s+/g, " ").trim(); if (joined) return joined; }
      }
      return noParen;
    }
    return "";
  }
  if (LANGUAGE_CODE === "ja") {
    if (/[\u3040-\u30ff\u4e00-\u9faf]/.test(noParen)) return noParen;
    return "";
  }
  if (/[\uac00-\ud7a3]/.test(noParen)) return "";
  var toks = key.split(" ").filter(Boolean);
  if (!toks.length) return "";
  var unknown = toks.filter(function(t){ return !maps.idTokens[t]; });
  if (unknown.length && unknown.length * 2 >= toks.length) return noParen;
  return "";
}
function optionSpeakBtn(speakText){
  var id = ttsRegister({ text: String(speakText == null ? "" : speakText), lang: ttsLangForMode(), optSpeak: true });
  return '<button type="button" class="option-speak" data-speak-id="' + id + '" aria-label="Dengarkan kata ini dalam Bahasa ' +
    (LANGUAGE_CODE === "ko" ? "Korea" : LANGUAGE_CODE === "ja" ? "Jepang" : "Inggris") + '" title="Dengarkan" onclick="optionSpeakPlay(event,' + id + ')">🔊</button>';
}
window.optionSpeakPlay = function(ev, id){
  if (ev) { try { ev.stopPropagation(); } catch (e) {} try { ev.preventDefault(); } catch (e) {} }
  var it = __ttsTexts[id];
  if (!it) return;
  if (!it.text) { ttsToast("Maaf, suara untuk pilihan ini belum tersedia."); return; }
  ttsSpeak(it.text, it.lang);
};

// ===== v13: TOMBOL SEMBUNYIKAN ARTI PADA BARIS CONTOH SOAL =====
// Di semua soal kuis, baris "Contoh: <kalimat target> — Artinya: <arti
// Indonesia>" kini tampil begini: kalimat targetnya TETAP terlihat, tetapi
// bagian "— Artinya: ..." TERSEMBUNYI secara default, dengan tombol kecil
// "👁️ Lihat Artinya" di sampingnya. Ditekan -> arti muncul dan tombol
// berubah jadi "🙈 Sembunyikan Artinya"; ditekan lagi -> tersembunyi lagi.
// Tujuannya: pengguna menebak dulu artinya sendiri, baru melihat artinya
// kalau memang tidak tahu. SETELAH soal dijawab, artinya otomatis
// ditampilkan supaya pembahasan tetap lengkap bersama feedback Benar/Salah.
// Aturan lingkup: yang disembunyikan HANYA arti pada baris Contoh soal kuis
// (latihan pelajaran + engine mock/TOPIK/simulasi). Arti di tempat belajar
// (daftar kosakata, kartu kata, catatan, partikel) TIDAK diubah sama sekali.
// Tombol ini elemen terpisah: tidak mengganggu tombol Dengarkan kalimat
// contoh maupun ikon 🔊 di samping pilihan jawaban.
function splitExampleMeaning(text){
  if (typeof text !== "string" || !text) return null;
  var marker = " \u2014 Artinya: ";
  var i = text.indexOf(marker);
  if (i >= 0) return { head: text.slice(0, i), meaning: text.slice(i) };
  var m2 = text.match(/^Artinya \(kalimat lengkap\):\s*/);
  if (m2) return { head: m2[0].replace(/\s+$/, ""), meaning: " " + text.slice(m2[0].length) };
  return null;
}
function exampleToggleBtn(){
  var b = document.createElement("button");
  b.type = "button";
  b.className = "example-mean-toggle";
  b.textContent = "\uD83D\uDC41\uFE0F Lihat Artinya";
  b.setAttribute("aria-expanded", "false");
  b.setAttribute("aria-label", "Lihat arti Bahasa Indonesia dari contoh kalimat ini");
  b.addEventListener("click", function(){ toggleExampleMeaning(b); });
  return b;
}
window.toggleExampleMeaning = function(btn){
  if (!btn || !btn.parentNode) return;
  var mean = btn.parentNode.querySelector(".example-meaning");
  if (!mean) return;
  var show = mean.hidden;
  mean.hidden = !show;
  btn.textContent = show ? "\uD83D\uDE48 Sembunyikan Artinya" : "\uD83D\uDC41\uFE0F Lihat Artinya";
  btn.setAttribute("aria-expanded", show ? "true" : "false");
};
function revealExampleMeaning(el){
  if (!el) return;
  var mean = el.querySelector(".example-meaning");
  if (mean) mean.hidden = false;
  var btn = el.querySelector(".example-mean-toggle");
  if (btn){ btn.textContent = "\uD83D\uDE48 Sembunyikan Artinya"; btn.setAttribute("aria-expanded", "true"); }
}
// Render baris contoh lengkap: kepala (kalimat target) selalu tampil,
// arti tersembunyi + tombol. Bila teks tidak berpola arti, tampil apa adanya.
function renderExampleLine(el, text){
  if (!el) return;
  el.innerHTML = "";
  if (!text) return;
  var wrap = document.createElement("span");
  wrap.className = "translation";
  var parts = splitExampleMeaning(text);
  if (!parts){
    wrap.textContent = text;
    el.appendChild(wrap);
    return;
  }
  var head = document.createElement("span");
  head.textContent = parts.head;
  wrap.appendChild(head);
  var mean = document.createElement("span");
  mean.className = "example-meaning";
  mean.hidden = true;
  mean.textContent = parts.meaning;
  wrap.appendChild(mean);
  wrap.appendChild(document.createTextNode(" "));
  wrap.appendChild(exampleToggleBtn());
  el.appendChild(wrap);
}
// Khusus engine mock: kepala contoh sudah tampil sebagai teks soal, jadi di
// elemen pendamping hanya dirender arti tersembunyi + tombolnya.
function renderHiddenMeaning(el, meaningText){
  if (!el) return;
  el.innerHTML = "";
  if (!meaningText) return;
  var wrap = document.createElement("span");
  wrap.className = "translation";
  var mean = document.createElement("span");
  mean.className = "example-meaning";
  mean.hidden = true;
  mean.textContent = meaningText.replace(/^\s*\u2014\s*/, "");
  wrap.appendChild(mean);
  if (meaningText) wrap.appendChild(document.createTextNode(" "));
  wrap.appendChild(exampleToggleBtn());
  el.appendChild(wrap);
}

function buildQuestions(lesson){
  const vocab = (typeof curVocab === "function" && curVocab()[lesson.id]) || [];
  const seedBase = lesson.order * 3 + lesson.level.charCodeAt(1);
  // v11: idAll memakai arti Indonesia yang SUDAH dibersihkan dari romanisasi.
  const enAll = vocab.map(v => v[0]), idAll = vocab.map(v => cleanIdText(v[1]));
  const qs = [];
  if (vocab.length >= 4){
    const V = vocab;
    // v9: nama bahasa target mengikuti mode yang sedang dipilih — JANGAN hardcode "Inggris":
    // di mode Korea semua teks soal harus menyebut "Bahasa Korea", di mode Inggris "Bahasa Inggris".
    const TL = LANGUAGE_CODE === "ko" ? "Korea" : LANGUAGE_CODE === "ja" ? "Jepang" : "Inggris";
    const mkId = (vi, seed) => { const r = rotatedOptions(idAll, idAll[vi], seed);
      return { ctx: "Pilih arti Bahasa Indonesia yang tepat untuk kata yang ditanyakan.",
        q: "Apa arti Bahasa Indonesia dari kata \u201C" + V[vi][0] + "\u201D?",
        translation: "Contoh: " + V[vi][2] + " \u2014 Artinya: " + V[vi][3],
        opts: r.opts.map(o => { const oi = idAll.indexOf(o); return [o, "", oi >= 0 ? V[oi][0] : ""]; }), answer: r.answer, full: V[vi][2], full_id: V[vi][3] }; };
    const mkEn = (vi, seed) => { const r = rotatedOptions(enAll, V[vi][0], seed);
      return { ctx: "Pilih kata Bahasa " + TL + " yang tepat untuk arti yang ditanyakan.",
        q: "Apa Bahasa " + TL + "nya \u201C" + idAll[vi] + "\u201D?",
        translation: "Contoh: " + V[vi][2] + " \u2014 Artinya: " + V[vi][3],
        opts: r.opts.map(o => [o, "", o]), answer: r.answer, full: V[vi][2], full_id: V[vi][3] }; };
    const mkBlank = (vi, seed) => { const r = rotatedOptions(enAll, V[vi][0], seed);
      return { ctx: "Konteks \u2014 baca dulu: " + V[vi][3] + " Kata yang hilang adalah kata yang artinya \u201C" + idAll[vi] + "\u201D.",
        q: "Lengkapi kalimat ini: " + blankOut(V[vi][2], V[vi][0]),
        translation: "Artinya (kalimat lengkap): " + V[vi][3],
        opts: r.opts.map(o => [o, "", o]), answer: r.answer, full: V[vi][2], full_id: V[vi][3] }; };
    const mkSent = (vi, seed) => { const exIds = vocab.map(v => cleanIdText(v[3])); const r = rotatedOptions(exIds, cleanIdText(V[vi][3]), seed);
      return { ctx: "Pilih terjemahan Bahasa Indonesia yang tepat untuk kalimat Bahasa " + TL + " ini.",
        q: "Apa arti kalimat ini: \u201C" + V[vi][2] + "\u201D",
        translation: "",
        opts: r.opts.map(o => { const oi = exIds.indexOf(o); return [o, "", oi >= 0 ? V[oi][2] : ""]; }), answer: r.answer, full: V[vi][2], full_id: V[vi][3] }; };
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
  v16SealQuestions(questions); // v16: jawaban disegel (hash + salt sesi)
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
  $("quiz-context").innerHTML = "<div class=\"context\"><b>Konteks — baca dulu sebelum menjawab</b><br>" + item.ctx + "</div>" + (item.full ? "<p class=\"tts-line\">" + ttsBtn(item.full, ttsLangForMode(), "🔊 Dengarkan kalimat contoh") + "</p>" : "");
  $("quiz-q").textContent = item.q;
  renderExampleLine($("quiz-translation"), item.translation || ""); // v13: arti contoh tersembunyi + tombol Lihat Artinya
  $("quiz-feedback").textContent = "";
  $("quiz-next").hidden = true;
  $("quiz-options").innerHTML = item.opts.map((o, i) =>
    "<div class=\"option-row\"><button class=\"option\" id=\"opt-" + i + "\" onclick=\"answer(" + i + ")\">" + o[0] + (o[1] ? "<small>Artinya: " + o[1] + "</small>" : "") + "</button>" + optionSpeakBtn(o[2] || resolveOptionSpeak(o[0], item.q)) + "</div>").join("");
}
window.answer = function(i){
  const s = quizState;
  if (!s || s.answered || s.finished) return;
  s.answered = true;
  const item = s.questions[s.idx], ci = v16CorrectIdx(item), ok = i === ci;
  if (ok) s.correct++; else s.wrong++;
  // v9: bersihkan dulu semua kelas warna, lalu warnai TEPAT satu jawaban benar
  // (is-correct) dan — bila pilihanmu salah — pilihanmu saja (is-wrong + is-picked).
  item.opts.forEach((o, j) => { const b = $("opt-" + j); if (b){ b.disabled = true; b.classList.remove("is-correct", "is-wrong", "is-picked"); if (j === ci) b.classList.add("is-correct"); else if (j === i) b.classList.add("is-wrong"); if (j === i) b.classList.add("is-picked"); } });
  $("quiz-feedback").textContent = ok
    ? "✅ Benar! Kalimat lengkapnya: " + item.full + " (" + item.full_id + ")"
    : "❌ Belum tepat. Jawaban yang benar: " + item.opts[ci][0] + ". Kalimat lengkapnya: " + item.full + " (" + item.full_id + ")";
  revealExampleMeaning($("quiz-translation")); // v13: sesudah menjawab, arti contoh otomatis ditampilkan
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
  if (prog && prog.serverError) $("result-xp").textContent += " Catatan: server XP menolak pencatatan kali ini (migrasi keamanan v16 mungkin belum dijalankan di Supabase) — XP ini baru tercatat di perangkat ini saja.";
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
// ===== v16: SEGEL JAWABAN KUIS + XP LEWAT SERVER =====
// Jawaban pilihan ganda TIDAK lagi disimpan sebagai teks/indeks
// polos bernama "answer" di state kuis. Saat kuis dimulai, indeks
// jawaban diganti hash FNV-1a (aH) dengan garam (salt) acak yang
// dibuat baru SETIAP SESI — jadi membuka state kuis di F12 tidak
// lagi langsung menunjukkan jawaban. Indeks benar dipulihkan
// hanya saat pengguna menjawab, dengan mencoba semua opsi.
// JUJUR: ini mitigasi, bukan penyembunyian penuh — situs ini
// statis tanpa backend, datanya tetap ada di perangkat pengguna.
// Perlindungan XP yang sesungguhnya ada di server: XP hanya sah
// bila diberikan fungsi award_xp / award_bonus_xp di Supabase
// (lihat SECURITY.md dan supabase/security-v16.sql).
var __v16Salt = (function(){ try { var a = new Uint8Array(8); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function(_, i){ a[i] = Math.floor(Math.random() * 256); }); return Array.prototype.map.call(a, function(x){ return ("0" + x.toString(16)).slice(-2); }).join(""); } catch(e){ return String(Math.random()).slice(2) + String(Date.now()); } })();
function v16HashStr(str){ var h = 0x811c9dc5; for (var i = 0; i < str.length; i++){ h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return ("0000000" + h.toString(16)).slice(-8); }
function v16SealQuestions(qs){ (qs || []).forEach(function(q){ if (q && typeof q.answer === "number" && q.opts){ q.aH = v16HashStr(__v16Salt + "|" + (q.q || "") + "|" + q.answer); delete q.answer; } }); }
function v16CorrectIdx(q){ if (!q || !q.opts) return -1; if (typeof q.answer === "number") return q.answer; for (var j = 0; j < q.opts.length; j++){ if (v16HashStr(__v16Salt + "|" + (q.q || "") + "|" + j) === q.aH) return j; } return -1; }
// XP bonus kecil (latihan/flashcard) dikumpulkan lalu dikirim
// sekaligus ke fungsi server award_bonus_xp (maks 10/kirim,
// maks 300/hari — ditegakkan server, bukan di sini).
var __v16BonusPending = 0, __v16BonusTimer = null;
function v16QueueBonus(n){ if (!sb || !n) return; __v16BonusPending += n; if (__v16BonusTimer) return; __v16BonusTimer = setTimeout(async function(){ __v16BonusTimer = null; var amt = Math.min(__v16BonusPending, 10); __v16BonusPending -= amt; if (amt <= 0) return; try { var r = await sb.rpc("award_bonus_xp", { p_language: LANGUAGE_CODE, p_source: "latihan", p_xp: amt }); if (r && !r.error && r.data){ if (typeof r.data.language_xp === "number") window.__langXp = r.data.language_xp; } } catch(e){} if (__v16BonusPending > 0) v16QueueBonus(0); }, 900); }

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
  // v16: XP pelajaran TIDAK PERNAH lagi ditulis langsung ke tabel
  // dari frontend (celah lama: pengguna bisa menaikkan total_xp
  // sendiri lewat API). Satu-satunya jalan adalah fungsi server
  // award_xp (SECURITY DEFINER) yang memvalidasi pelajaran,
  // score 0..100, XP maks per pelajaran, dan hanya MENAMBAH
  // sebesar selisih dari XP terbaik yang sudah tercatat.
  const currentLesson = (typeof quizState !== "undefined" && quizState) ? quizState.lesson : null;
  if (!currentLesson) return null;
  if (!sb) return { streak: recordGuestStreak(), guest: true };
  const { data } = await sb.auth.getUser(); const u = data.user;
  if (!u) return { streak: recordGuestStreak(), guest: true };
  const { data: res, error } = await sb.rpc("award_xp", {
    p_language: LANGUAGE_CODE, p_lesson_id: currentLesson.id,
    p_score: (typeof score === "number" ? score : 100), p_xp: xp });
  if (error || !res){
    // Server menolak / migrasi v16 belum dijalankan: JANGAN
    // kembali ke cara lama (tulis langsung) — XP hanya dicatat
    // lokal di perangkat ini dan pengguna diberi tahu jujur.
    addLocalLangXp(xp);
    return { streak: null, guest: false, serverError: true };
  }
  addLocalLangXp(res.awarded || 0);
  if (typeof res.language_xp === "number") window.__langXp = res.language_xp;
  const xb = $("xp-badge"); if (xb && typeof res.total_xp === "number") xb.textContent = "\u2B50 " + res.total_xp + " XP";
  const hx = $("hero-xp"); if (hx && typeof res.total_xp === "number") hx.textContent = res.total_xp + " XP";
  if (typeof res.streak_days === "number") applyStreakDisplay(res.streak_days, true);
  refreshUser();
  return { streak: (typeof res.streak_days === "number" ? res.streak_days : null), guest: false, awarded: res.awarded };
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
    jalurTitle: "🗺️ Jalur Belajar Korea — 42 Pelajaran, A0 sampai C2" },
  ja: { heroEyebrow: "Belajar Bahasa Jepang \u00B7 Hiragana sampai C2",
    dashSub: "Persentase selesai untuk Bahasa Jepang dan untuk setiap level A0 sampai C2, dihitung dari pelajaran yang sudah kamu selesaikan.",
    bank1: "Diberikan kata Bahasa Jepang, pilih arti Bahasa Indonesianya yang tepat.",
    bank2: "Diberikan arti Bahasa Indonesia, pilih kata Bahasa Jepangnya yang tepat.",
    bank4: "Pilih terjemahan Bahasa Indonesia yang tepat untuk kalimat Bahasa Jepang.",
    heroTitle: "Belajar Bahasa Jepang, selangkah demi selangkah",
    heroSub: "42 pelajaran berurutan dari Hiragana & Katakana sampai sangat mahir — setiap soal, kosakata Jepang (dengan romaji), dan contoh kalimat ada arti Bahasa Indonesianya, jadi kamu selalu mengerti kenapa jawabannya begitu.",
    showcaseTitle: "日本語 · Japanese", chip: "JAPANESE \u2022 HIRAGANA \u2192 C2 \u2022 42 PELAJARAN",
    chartNote: "A0 = langkah pertama: kenalan Hiragana, Katakana & bunyi. Ikuti jalurnya dari atas ke bawah.",
    signature: "Roadmap Hiragana \u2192 C2 \u2014 42 pelajaran berurutan, 10 soal di setiap latihan",
    checklist: ["Roadmap Hiragana \u2192 C2 lengkap: 42 pelajaran berurutan dari A0 sampai C2 \u2014 6 pelajaran di setiap level",
      "Halaman khusus \u270F\uFE0F Belajar Menulis & Mengucapkan: Hiragana 46 huruf + Katakana 46 huruf, lengkap dengan urutan goresan, cara baca, contoh kata, dan tombol Dengarkan",
      "10 soal di setiap latihan, tanpa soal yang mengulang, ditutup pop-up hasil: benar berapa, salah berapa, nilai, dan XP",
      "Kosakata Jepang + cara baca (romaji) + arti Bahasa Indonesia di setiap kata, soal, dan contoh kalimat",
      "10 Catatan Penting tata bahasa Jepang: partikel \u306F \u30FB \u304C \u30FB \u3092 \u30FB \u306B/\u3078 \u30FB \u3067, bentuk sopan -\u307E\u3059/-\u3067\u3059, kata sifat -\u3044/-\u306A, angka dan kata bantu bilangan",
      "Jenis Kata Jepang (\u540D\u8A5E kata benda, \u52D5\u8A5E kata kerja, \u52A9\u8A5E partikel, dan lainnya) + Kata Hari Ini yang berganti setiap hari",
      "Bank Soal: 4 bentuk soal \u2014 arti kata, kata dari arti, lengkapi kalimat, arti kalimat \u2014 total 420 soal",
      "Dashboard Master, Roadmap level, dan Study Tracker mingguan; progres dan XP Bahasa Jepang terpisah dari bahasa lain"],
    showcaseNote: "Fokus belajarnya: Hiragana & Katakana dan kosakata dulu, lalu tata bahasa lewat Catatan Penting, dan latihan soal di setiap pelajaran. Acuan materinya JF Standard dan buku Marugoto dari Japan Foundation. Penjelasan selalu dalam Bahasa Indonesia.",
    notesTitle: "\uD83D\uDCDD Catatan Penting Bahasa Jepang", notesSub: "Aturan dasar Jepang \u2014 tiga huruf (Hiragana, Katakana, Kanji), partikel \u306F \u30FB \u304C \u30FB \u3092 \u30FB \u306B/\u3078 \u30FB \u3067, bentuk sopan -\u307E\u3059/-\u3067\u3059, kata sifat -\u3044/-\u306A, sampai angka dan kata bantu bilangan. Klik judul catatan untuk membuka aturan, contoh kalimat, dan artinya.",
    wordsTitle: "\uD83C\uDFF7\uFE0F Jenis Kata Jepang (\u54C1\u8A5E Hinshi)", wordsSub: "Supaya tahu kata itu termasuk kata benda (\u540D\u8A5E), kata kerja (\u52D5\u8A5E), kata sifat, partikel (\u52A9\u8A5E), atau lainnya. Kata Hari Ini berganti otomatis setiap hari.",
    jalurTitle: "\uD83D\uDDFA\uFE0F Jalur Belajar Jepang \u2014 42 Pelajaran, A0 sampai C2" }

};
function applyLanguage(code){
  LANGUAGE_CODE = (code === "ko" || code === "ja") ? code : "en";
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
  const be = $("lang-btn-en"), bk = $("lang-btn-ko"), bj = $("lang-btn-ja");
  if (be) be.classList.toggle("is-active", LANGUAGE_CODE === "en");
  if (bk) bk.classList.toggle("is-active", LANGUAGE_CODE === "ko");
  if (bj) bj.classList.toggle("is-active", LANGUAGE_CODE === "ja");
  renderNotes(); renderWordClasses(); renderLessons(); renderPanels();
}
const _be = $("lang-btn-en"); if (_be) _be.onclick = function(){ applyLanguage("en"); refreshUser(); };
const _bk = $("lang-btn-ko"); if (_bk) _bk.onclick = function(){ applyLanguage("ko"); refreshUser(); };
const _bj = $("lang-btn-ja"); if (_bj) _bj.onclick = function(){ applyLanguage("ja"); refreshUser(); };
applyLanguage(LANGUAGE_CODE);

refreshUser();

// ===== v7: KONTEN VOLINGO LIVE =====
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
function renderV7(){
  var isKo = LANGUAGE_CODE === "ko";
  var ven = document.getElementById("v7-en"), vko = document.getElementById("v7-ko");
  if (ven) ven.hidden = LANGUAGE_CODE !== "en"; if (vko) vko.hidden = !isKo;
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
  // v11: pertanyaan + pilihan jawaban di semua mock/simulasi/bank soal juga
  // dibersihkan dari romanisasi yang menempel pada arti Bahasa Indonesia.
  questions = questions.map(function(q){ var co = (q.opts || []).map(cleanIdText); return { q: cleanIdText(q.q), opts: co, ans: q.ans, why: q.why, speak: co.map(function(o){ return resolveOptionSpeak(o, q.q); }) }; });
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
  // v13: bila teks soal mock/TOPIK memuat baris "Contoh: ... — Artinya: ...",
  // kalimat contohnya tetap tampil sebagai soal, tetapi artinya disembunyikan
  // di elemen pendamping dengan tombol Lihat Artinya (sama seperti latihan).
  var mex = document.getElementById("mock-example");
  if (mex){
    var mparts = splitExampleMeaning(q.q);
    if (mparts){
      document.getElementById("mock-q").textContent = mparts.head;
      renderHiddenMeaning(mex, mparts.meaning);
    } else {
      mex.innerHTML = "";
    }
  }
  document.getElementById("mock-feedback").textContent = "";
  document.getElementById("mock-next").hidden = true;
  document.getElementById("mock-options").innerHTML = q.opts.map(function(o,i){ return '<div class="option-row"><button class="btn btn-outline mock-opt" style="display:block;width:100%;margin:6px 0;text-align:left" onclick="answerMock('+i+')">'+esc(o)+'</button>' + optionSpeakBtn((q.speak && q.speak[i]) || resolveOptionSpeak(o, q.q)) + '</div>'; }).join("");
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
  revealExampleMeaning(document.getElementById("mock-example")); // v13: sesudah menjawab, arti contoh otomatis ditampilkan
  document.querySelectorAll("#mock-options .mock-opt").forEach(function(b){ b.disabled = true; }); // v12: tombol 🔊 TIDAK ikut dinonaktifkan — tetap bisa ditekan setelah menjawab
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
  var mexF = document.getElementById("mock-example"); if (mexF) mexF.innerHTML = ""; // v13
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

// ===== v13: DATA BELAJAR MENULIS & MENGUCAPKAN =====
const HANGUL_CONS = [["ㄱ", "giyeok (기역)", "2 goresan: (1) garis mendatar dari kiri ke kanan, (2) dari ujung kanannya garis tegak turun lalu berbelok mendatar ke kanan.", "Di awal kata dibaca 'g' seperti 'g' pada kata 'gula'; di akhir suku kata (batchim) dibaca 'k'.", "가방", "gabang", "tas", "가"], ["ㄴ", "nieun (니은)", "2 goresan: (1) garis tegak dari atas ke bawah, (2) garis mendatar ke kanan dari ujung bawahnya.", "Dibaca 'n' seperti 'n' pada kata 'nasi'.", "나무", "namu", "pohon", "나"], ["ㄷ", "digeut (디귿)", "3 goresan: (1) garis mendatar, (2) garis tegak turun dari ujung kirinya, (3) garis mendatar di bawah menyambung ujung kanan.", "Di awal kata dibaca 'd' seperti 'd' pada kata 'dua'; di akhir suku kata dibaca 't'.", "다리", "dari", "kaki", "다"], ["ㄹ", "rieul (리을)", "5 goresan: bentuk ㄱ kecil di atas, garis penghubung turun, lalu bentuk ㄴ di bawahnya — tulis seperti dua tingkat.", "Bunyi di antara 'r' dan 'l': di tengah kata seperti 'r' ringan pada kata 'baru', di akhir suku kata seperti 'l' pada kata 'awal'.", "라디오", "radio", "radio", "라"], ["ㅁ", "mieum (미음)", "3 goresan: (1) tegak turun di kiri, (2) mendatar di atas lalu tegak turun di kanan, (3) mendatar di bawah menutup kotak.", "Dibaca 'm' seperti 'm' pada kata 'mama'.", "물", "mul", "air", "마"], ["ㅂ", "bieup (비읍)", "4 goresan: dua garis tegak turun (kiri lalu kanan), lalu dua garis mendatar penghubung (tengah dan bawah).", "Di awal kata dibaca 'b' seperti 'b' pada kata 'buku'; di akhir suku kata dibaca 'p'.", "밥", "bap", "nasi", "바"], ["ㅅ", "siot (시옷)", "2 goresan: (1) garis miring dari atas turun ke kiri bawah, (2) garis miring ke kanan bawah — seperti bentuk atap.", "Dibaca 's' seperti 's' pada kata 'susu'; sebelum vokal ㅣ bunyinya menjadi 'sy'.", "사과", "sagwa", "apel", "사"], ["ㅇ", "ieung (이응)", "1 goresan: satu lingkaran penuh.", "Di AWAL suku kata tidak berbunyi — ia hanya penopang supaya vokal bisa ditulis. Di AKHIR suku kata dibaca 'ng' seperti 'ng' pada kata 'sayang'.", "아이", "ai", "anak", "아"], ["ㅈ", "jieuj (지읒)", "3 goresan: (1) garis mendatar, (2) garis miring ke kiri bawah dari tengahnya, (3) garis miring ke kanan bawah.", "Dibaca 'j' seperti 'j' pada kata 'janji'.", "집", "jip", "rumah", "자"], ["ㅊ", "chieut (치읓)", "4 goresan: (1) garis pendek di paling atas, lalu seperti ㅈ: (2) mendatar, (3) miring ke kiri bawah, (4) miring ke kanan bawah.", "Dibaca 'ch' dengan hembusan napas, mirip 'c' pada kata 'cari' yang ditekan.", "친구", "chingu", "teman", "차"], ["ㅋ", "kieuk (키읔)", "3 goresan: seperti ㄱ — (1) mendatar, (2) tegak turun berbelok kanan — ditambah (3) garis mendatar pendek di tengah.", "Dibaca 'k' dengan hembusan napas kuat, seperti 'k' pada kata 'kopi' yang ditekan.", "코", "ko", "hidung", "카"], ["ㅌ", "tieut (티읕)", "4 goresan: seperti ㄷ — mendatar, tegak turun, mendatar bawah — ditambah garis mendatar pendek di tengah.", "Dibaca 't' dengan hembusan napas, seperti 't' pada kata 'tapi' yang ditekan.", "토요일", "toyoil", "hari Sabtu", "타"], ["ㅍ", "pieup (피읖)", "4 goresan: (1) mendatar di atas, (2) tegak turun kiri, (3) tegak turun kanan, (4) mendatar di bawah.", "Dibaca 'p' dengan hembusan napas, seperti 'p' pada kata 'papa' yang ditekan.", "편지", "pyeonji", "surat", "파"], ["ㅎ", "hieut (히읗)", "3 goresan: (1) garis pendek di atas, (2) garis mendatar di tengah, (3) lingkaran kecil di bawahnya.", "Dibaca 'h' seperti 'h' pada kata 'hari'.", "하늘", "haneul", "langit", "하"]];
const HANGUL_VOW = [["ㅏ", "a", "2 goresan: (1) garis tegak dari atas ke bawah, (2) goresan pendek mendatar ke kanan dari tengahnya.", "Dibaca 'a' seperti 'a' pada kata 'ayah'. Vokal tegak: ditulis di KANAN konsonan awal.", "아기", "agi", "bayi", "아"], ["ㅑ", "ya", "3 goresan: seperti ㅏ tetapi dengan DUA goresan pendek ke kanan.", "Dibaca 'ya' seperti 'ya' pada kata 'yakin'.", "야구", "yagu", "bisbol (baseball)", "야"], ["ㅓ", "eo", "2 goresan: (1) garis tegak dari atas ke bawah, (2) goresan pendek mendatar ke KIRI dari tengahnya.", "Dibaca 'eo': bunyi di antara 'e' dan 'o', mirip 'e' pada kata 'emas' tetapi mulut dibuka lebih lebar.", "어머니", "eomeoni", "ibu", "어"], ["ㅕ", "yeo", "3 goresan: seperti ㅓ tetapi dengan DUA goresan pendek ke kiri.", "Dibaca 'yeo', mirip 'yo' pada kata 'yogurt' tetapi mulut lebih terbuka.", "여자", "yeoja", "perempuan", "여"], ["ㅗ", "o", "2 goresan: (1) goresan pendek tegak KE ATAS, (2) garis mendatar panjang di bawahnya. Vokal mendatar: ditulis di BAWAH konsonan awal.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "오늘", "oneul", "hari ini", "오"], ["ㅛ", "yo", "3 goresan: seperti ㅗ tetapi dengan DUA goresan pendek ke atas.", "Dibaca 'yo' seperti 'yo' pada kata 'yoyo'.", "교수", "gyosu", "profesor", "요"], ["ㅜ", "u", "2 goresan: (1) garis mendatar, (2) goresan pendek tegak TURUN dari tengahnya. Vokal mendatar: di bawah konsonan awal.", "Dibaca 'u' seperti 'u' pada kata 'buku'.", "우유", "uyu", "susu", "우"], ["ㅠ", "yu", "3 goresan: seperti ㅜ tetapi dengan DUA goresan pendek turun.", "Dibaca 'yu' seperti 'yu' pada kata 'yuk'.", "유학", "yuhak", "studi ke luar negeri", "유"], ["ㅡ", "eu", "1 goresan: satu garis mendatar lurus.", "Dibaca 'eu': bunyi dari belakang tenggorokan, bibir datar tidak tersenyum — tidak ada padanannya persis di Bahasa Indonesia.", "음악", "eumak", "musik", "으"], ["ㅣ", "i", "1 goresan: satu garis tegak lurus.", "Dibaca 'i' seperti 'i' pada kata 'ini'. Vokal tegak: ditulis di kanan konsonan awal.", "이름", "ireum", "nama", "이"]];
const HIRAGANA_46 = [["あ", "a", "3 goresan: mendatar di atas, lalu tegak melengkung memotongnya, terakhir lengkung besar ke kiri bawah.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "あめ", "ame", "hujan", "あ"], ["い", "i", "2 goresan: tegak melengkung di kiri dulu, lalu goresan pendek di kanannya.", "Dibaca 'i' seperti 'i' pada kata 'ini'.", "いぬ", "inu", "anjing", "い"], ["う", "u", "3 goresan: titik pendek di atas, lalu mendatar, lalu tegak melengkung ke kiri bawah.", "Dibaca 'u' seperti 'u' pada kata 'buku', tetapi bibir tidak terlalu membulat.", "うみ", "umi", "laut", "う"], ["え", "e", "2 goresan: mendatar di atas, lalu bentuk melengkung seperti huruf Z di bawahnya.", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "えき", "eki", "stasiun", "え"], ["お", "o", "3 goresan: mendatar, lalu tegak melengkung memotongnya, terakhir titik pendek di kanan atas.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "おかね", "okane", "uang", "お"], ["か", "ka", "3 goresan: tegak melengkung, lalu mendatar memotongnya, terakhir titik pendek di kanan.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "かばん", "kaban", "tas", "か"], ["き", "ki", "4 goresan: dua garis mendatar, lalu tegak turun, terakhir lengkung penutup di bawah.", "Dibaca 'i' seperti 'i' pada kata 'ini'.", "きのこ", "kinoko", "jamur", "き"], ["く", "ku", "1 goresan: satu goresan miring seperti paruh: dari atas ke kiri bawah lalu menyapu ke kanan.", "Dibaca 'u' seperti 'u' pada kata 'buku', tetapi bibir tidak terlalu membulat.", "くるま", "kuruma", "mobil", "く"], ["け", "ke", "3 goresan: tegak turun, lalu mendatar memotong, lalu tegak melengkung di bawah.", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "けさ", "kesa", "pagi ini", "け"], ["こ", "ko", "2 goresan: mendatar di atas, lalu tegak turun dan berbelok mendatar di bawah.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "ここ", "koko", "di sini", "こ"], ["さ", "sa", "3 goresan: mendatar, lalu tegak memotong turun, terakhir lengkung ke kiri bawah.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "さくら", "sakura", "bunga sakura", "さ"], ["し", "shi", "1 goresan: satu goresan melengkung seperti kail: dari atas turun lalu melengkung ke kanan.", "Dibaca 'shi' seperti 'syi' — gabungan 's' dan 'i' yang lembut, mirip awal kata 'syiar'.", "しお", "shio", "garam", "し"], ["す", "su", "2 goresan: mendatar, lalu lingkaran kecil melengkung tepat di bawahnya.", "Dibaca 'u' seperti 'u' pada kata 'buku', tetapi bibir tidak terlalu membulat.", "すし", "sushi", "sushi", "す"], ["せ", "se", "3 goresan: mendatar, lalu tegak turun, terakhir mendatar di bawah berbelok ke kiri.", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "せんせい", "sensei", "guru", "せ"], ["そ", "so", "1 goresan: satu goresan zig-zag halus dari kanan atas mengalir ke kiri bawah.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "そら", "sora", "langit", "そ"], ["た", "ta", "4 goresan: mendatar, tegak memotong, mendatar lagi, terakhir lengkung kecil di kanan bawah.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "たべもの", "tabemono", "makanan", "た"], ["ち", "chi", "2 goresan: mendatar melengkung, lalu tegak melengkung besar ke kiri.", "Dibaca 'chi' seperti 'ci' pada kata 'cinta' tetapi lebih lembut.", "ちず", "chizu", "peta", "ち"], ["つ", "tsu", "1 goresan: satu goresan melengkung besar seperti huruf C.", "Dibaca 'tsu': awali dengan bunyi 'ts' cepat lalu 'u' — seperti menggigit bunyi 'tsu' pada kata 'tsunami'.", "つき", "tsuki", "bulan", "つ"], ["て", "te", "1 goresan: satu goresan: mendatar lalu melengkung turun ke kiri.", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "てがみ", "tegami", "surat", "て"], ["と", "to", "2 goresan: tegak turun, lalu goresan pendek miring ke kanan atas.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "とり", "tori", "burung", "と"], ["な", "na", "4 goresan: mendatar, tegak memotong, titik di kanan, terakhir lengkung besar di bawah.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "なつ", "natsu", "musim panas", "な"], ["に", "ni", "3 goresan: tegak turun di kiri, lalu dua mendatar di kanan (yang atas lebih pendek).", "Dibaca 'i' seperti 'i' pada kata 'ini'.", "にほん", "nihon", "Jepang", "に"], ["ぬ", "nu", "2 goresan: tegak melengkung, lalu lengkung kedua menutup menjadi lingkaran di bawah.", "Dibaca 'u' seperti 'u' pada kata 'buku', tetapi bibir tidak terlalu membulat.", "ぬの", "nuno", "kain", "ぬ"], ["ね", "ne", "2 goresan: tegak, mendatar memotong, terakhir lengkung melingkar di kanan bawah.", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "ねこ", "neko", "kucing", "ね"], ["の", "no", "1 goresan: satu goresan melingkar seperti spiral kecil.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "のみもの", "nomimono", "minuman", "の"], ["は", "ha", "3 goresan: tegak turun, mendatar memotong, terakhir lengkung ke kanan bawah.", "Sebagai huruf biasa dibaca 'ha' seperti 'ha' pada kata 'hari'. Hati-hati: sebagai PARTIKEL, は dibaca 'wa'.", "はな", "hana", "bunga", "は"], ["ひ", "hi", "1 goresan: satu goresan melengkung turun seperti senyum miring.", "Dibaca 'i' seperti 'i' pada kata 'ini'.", "ひる", "hiru", "siang hari", "ひ"], ["ふ", "fu", "4 goresan: titik di atas, lengkung ke kiri, lalu dua goresan miring jatuh ke kiri dan kanan bawah.", "Dibaca 'fu' dengan bibir rileks seperti meniup lilin — bukan 'fu' dengan gigi menyentuh bibir.", "ふね", "fune", "kapal", "ふ"], ["へ", "he", "1 goresan: satu goresan miring naik lalu turun, seperti atap kecil.", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "へや", "heya", "kamar", "へ"], ["ほ", "ho", "4 goresan: tegak, dua mendatar memotong, terakhir lengkung ke kanan bawah.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "ほん", "hon", "buku", "ほ"], ["ま", "ma", "3 goresan: dua garis mendatar, lalu tegak melengkung membuat lingkaran di tengah bawah.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "まち", "machi", "kota", "ま"], ["み", "mi", "2 goresan: tegak melengkung, lalu lengkung kedua memotongnya.", "Dibaca 'i' seperti 'i' pada kata 'ini'.", "みず", "mizu", "air", "み"], ["む", "mu", "3 goresan: mendatar, tegak turun, titik di kanan, terakhir lengkung di bawah.", "Dibaca 'u' seperti 'u' pada kata 'buku', tetapi bibir tidak terlalu membulat.", "むし", "mushi", "serangga", "む"], ["め", "me", "2 goresan: tegak melengkung, lalu lengkung kedua memotongnya (mirip ぬ tetapi tanpa lingkaran penuh).", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "めがね", "megane", "kacamata", "め"], ["も", "mo", "3 goresan: mendatar, mendatar kedua, lalu tegak melengkung memotong keduanya.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "もも", "momo", "buah persik", "も"], ["や", "ya", "3 goresan: mendatar melengkung, tegak memotong, terakhir goresan miring ke kiri.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "やま", "yama", "gunung", "や"], ["ゆ", "yu", "2 goresan: tegak, mendatar memotong, lalu tegak kedua membentuk sudut melengkung.", "Dibaca 'u' seperti 'u' pada kata 'buku', tetapi bibir tidak terlalu membulat.", "ゆき", "yuki", "salju", "ゆ"], ["よ", "yo", "2 goresan: mendatar, tegak turun, terakhir mendatar pendek memotong di tengah.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "よる", "yoru", "malam", "よ"], ["ら", "ra", "2 goresan: tegak pendek, lalu lengkung besar ke kanan bawah.", "Baris 'r' Jepang dibaca dengan ujung lidah menyentuh ringan sekali — di antara 'r' pada kata 'baru' dan 'l', sangat ringan.", "らいねん", "rainen", "tahun depan", "ら"], ["り", "ri", "2 goresan: tegak panjang melengkung di kiri, lalu goresan pendek di kanannya.", "Dibaca 'ri' ringan: lidah menyentuh gusi atas sekali, seperti 'ri' pada kata 'rintik' yang diucapkan cepat.", "りんご", "ringo", "apel", "り"], ["る", "ru", "1 goresan: satu goresan zig-zag yang berakhir melengkung ke kanan.", "Dibaca 'ru' ringan, seperti 'ru' pada kata 'baru'.", "るす", "rusu", "tidak ada di rumah", "る"], ["れ", "re", "2 goresan: tegak, mendatar memotong, terakhir lengkung turun berbelok ke kiri bawah.", "Dibaca 're' ringan, seperti 're' pada kata 'remah'.", "れもん", "remon", "lemon", "れ"], ["ろ", "ro", "1 goresan: satu rangkaian: mendatar, tegak turun, lalu mendatar lagi (seperti anak tangga).", "Dibaca 'ro' ringan, seperti 'ro' pada kata 'roda' tetapi lebih singkat.", "ろうそく", "rousoku", "lilin", "ろ"], ["わ", "wa", "2 goresan: tegak, mendatar memotong, terakhir lengkung besar ke kanan bawah.", "Dibaca 'wa' seperti 'wa' pada kata 'waktu'.", "わに", "wani", "buaya", "わ"], ["を", "wo", "3 goresan: mendatar, tegak melengkung memotong, terakhir lengkung di bawah ke kiri.", "Dibaca 'o' seperti 'o' pada kata 'kopi' — huruf ini hampir selalu dipakai sebagai partikel objek.", "ほんをよむ", "hon wo yomu", "membaca buku", "を"], ["ん", "n", "1 goresan: satu goresan melengkung seperti huruf 'n' kecil yang mengalir.", "Dibaca sebagai bunyi sengau penutup suku kata, seperti 'n/ng' di akhir kata 'sen' atau 'sayang'. Ini satu-satunya kana yang berdiri sebagai bunyi konsonan saja.", "ほん", "hon", "buku", "ん"]];
const KATAKANA_46 = [["ア", "a", "2 goresan: mendatar melengkung, lalu tegak miring memotong turun ke kiri bawah.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "アメリカ", "amerika", "Amerika", "ア"], ["イ", "i", "2 goresan: miring ke kanan bawah, lalu tegak turun di kiri.", "Dibaca 'i' seperti 'i' pada kata 'ini'.", "インドネシア", "indoneshia", "Indonesia", "イ"], ["ウ", "u", "3 goresan: titik di atas, lalu mendatar, lalu tegak melengkung.", "Dibaca 'u' seperti 'u' pada kata 'buku', tetapi bibir tidak terlalu membulat.", "ウイルス", "uirusu", "virus", "ウ"], ["エ", "e", "3 goresan: mendatar atas, tegak di tengah, mendatar bawah — seperti balok huruf I.", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "エアコン", "eakon", "AC (pendingin ruangan)", "エ"], ["オ", "o", "3 goresan: mendatar, tegak memotong turun, terakhir miring ke kiri bawah.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "オレンジ", "orenji", "jeruk / oranye", "オ"], ["カ", "ka", "2 goresan: mendatar, lalu tegak melengkung turun dengan miring pendek di kanan.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "カメラ", "kamera", "kamera", "カ"], ["キ", "ki", "3 goresan: dua mendatar, lalu tegak melengkung memotong keduanya.", "Dibaca 'i' seperti 'i' pada kata 'ini'.", "キロ", "kiro", "kilo(gram)", "キ"], ["ク", "ku", "2 goresan: miring ke kiri bawah, lalu mendatar berbelok turun.", "Dibaca 'u' seperti 'u' pada kata 'buku', tetapi bibir tidak terlalu membulat.", "クラス", "kurasu", "kelas", "ク"], ["ケ", "ke", "3 goresan: miring pendek, lalu mendatar, lalu tegak memotong turun.", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "ケーキ", "keeki", "kue", "ケ"], ["コ", "ko", "2 goresan: mendatar di atas, lalu tegak turun berbelok mendatar di bawah — sudutnya tegas.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "コーヒー", "koohii", "kopi", "コ"], ["サ", "sa", "3 goresan: dua mendatar, lalu tegak memotong turun.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "サッカー", "sakkaa", "sepak bola", "サ"], ["シ", "shi", "3 goresan: dua titik miring di kiri atas, lalu lengkung besar dari kanan atas ke kiri bawah.", "Dibaca 'shi' seperti 'syi' yang lembut, mirip awal kata 'syiar'.", "シャツ", "shatsu", "kemeja", "シ"], ["ス", "su", "2 goresan: mendatar berbelok, lalu miring panjang ke kiri bawah.", "Dibaca 'u' seperti 'u' pada kata 'buku', tetapi bibir tidak terlalu membulat.", "スプーン", "supuun", "sendok", "ス"], ["セ", "se", "2 goresan: mendatar, lalu tegak berbelok mendatar di bawah.", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "セーター", "seetaa", "sweter", "セ"], ["ソ", "so", "2 goresan: titik miring di atas, lalu goresan miring panjang ke kiri bawah.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "ソファ", "sofa", "sofa", "ソ"], ["タ", "ta", "3 goresan: miring ke kiri, lalu mendatar, lalu miring memotong.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "タクシー", "takushii", "taksi", "タ"], ["チ", "chi", "3 goresan: mendatar, miring ke kiri bawah, terakhir mendatar melengkung.", "Dibaca 'chi' seperti 'ci' pada kata 'cinta' tetapi lebih lembut.", "チーズ", "chiizu", "keju", "チ"], ["ツ", "tsu", "3 goresan: dua titik miring di kiri atas, lalu lengkung besar ke kiri bawah — mirip シ, beda arah lengkung terakhirnya.", "Dibaca 'tsu': bunyi 'ts' cepat diikuti 'u', seperti pada kata 'tsunami'.", "ツナ", "tsuna", "ikan tuna", "ツ"], ["テ", "te", "3 goresan: dua mendatar, terakhir miring ke kiri bawah.", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "テレビ", "terebi", "televisi", "テ"], ["ト", "to", "2 goresan: tegak turun, lalu goresan pendek mendatar di tengah kanannya.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "トイレ", "toire", "toilet", "ト"], ["ナ", "na", "2 goresan: mendatar, lalu tegak memotong turun.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "ナイフ", "naifu", "pisau", "ナ"], ["ニ", "ni", "2 goresan: mendatar atas pendek, lalu mendatar bawah lebih panjang.", "Dibaca 'i' seperti 'i' pada kata 'ini'.", "ニュース", "nyuusu", "berita", "ニ"], ["ヌ", "nu", "2 goresan: miring ke kanan bawah, lalu miring memotong ke kiri bawah.", "Dibaca 'u' seperti 'u' pada kata 'buku', tetapi bibir tidak terlalu membulat.", "ヌードル", "nuudoru", "mi", "ヌ"], ["ネ", "ne", "4 goresan: titik di atas, mendatar, lalu dua miring jatuh ke kiri dan ke kanan.", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "ネクタイ", "nekutai", "dasi", "ネ"], ["ノ", "no", "1 goresan: satu goresan miring panjang ke kiri bawah.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "ノート", "nooto", "buku catatan", "ノ"], ["ハ", "ha", "2 goresan: miring ke kiri bawah, lalu miring ke kanan bawah — seperti atap.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "ハンバーガー", "hanbaagaa", "hamburger", "ハ"], ["ヒ", "hi", "2 goresan: mendatar berbelok, lalu miring ke kiri bawah.", "Dibaca 'i' seperti 'i' pada kata 'ini'.", "ヒーロー", "hiiroo", "pahlawan", "ヒ"], ["フ", "fu", "1 goresan: satu goresan: mendatar lalu berbelok tegak turun.", "Dibaca 'fu' dengan bibir rileks seperti meniup lilin.", "フォーク", "fooku", "garpu", "フ"], ["ヘ", "he", "1 goresan: satu goresan miring seperti atap — bentuknya sama dengan へ Hiragana.", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "ヘルメット", "herumetto", "helm", "ヘ"], ["ホ", "ho", "4 goresan: mendatar atas, tegak di tengah, lalu dua miring ke kiri dan kanan bawah.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "ホテル", "hoteru", "hotel", "ホ"], ["マ", "ma", "2 goresan: mendatar berbelok turun, lalu miring ke kiri bawah.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "マンゴー", "mangoo", "mangga", "マ"], ["ミ", "mi", "3 goresan: tiga goresan miring sejajar yang menurun ke kanan.", "Dibaca 'i' seperti 'i' pada kata 'ini'.", "ミルク", "miruku", "susu", "ミ"], ["ム", "mu", "2 goresan: miring ke kiri bawah, lalu mendatar berbelok.", "Dibaca 'u' seperti 'u' pada kata 'buku', tetapi bibir tidak terlalu membulat.", "ムスリム", "musurimu", "muslim", "ム"], ["メ", "me", "2 goresan: miring ke kanan bawah, lalu miring memotong ke kiri bawah.", "Dibaca 'e' seperti 'e' pada kata 'emas'.", "メール", "meeru", "email", "メ"], ["モ", "mo", "3 goresan: dua mendatar, lalu tegak memotong turun.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "モール", "mooru", "mal / pusat belanja", "モ"], ["ヤ", "ya", "3 goresan: mendatar melengkung, miring memotong, lalu tegak turun.", "Dibaca 'a' seperti 'a' pada kata 'ayah'.", "ヤクルト", "yakuruto", "Yakult", "ヤ"], ["ユ", "yu", "2 goresan: mendatar di atas, lalu tegak berbelok mendatar di bawah.", "Dibaca 'u' seperti 'u' pada kata 'buku', tetapi bibir tidak terlalu membulat.", "ユニフォーム", "yunifoomu", "seragam", "ユ"], ["ヨ", "yo", "3 goresan: mendatar atas, tegak turun, lalu mendatar di bawah.", "Dibaca 'o' seperti 'o' pada kata 'kopi'.", "ヨーグルト", "yooguruto", "yogurt", "ヨ"], ["ラ", "ra", "2 goresan: mendatar di atas, lalu mendatar kedua berbelok miring ke kiri bawah.", "Baris 'r' Jepang dibaca ringan: ujung lidah menyentuh gusi atas sekali, di antara 'r' dan 'l'.", "ラジオ", "rajio", "radio", "ラ"], ["リ", "ri", "2 goresan: goresan pendek miring, lalu tegak panjang di kanannya.", "Dibaca 'ri' ringan seperti 'ri' pada kata 'rintik' yang cepat.", "リモコン", "rimokon", "remote kontrol", "リ"], ["ル", "ru", "2 goresan: miring ke kiri bawah, lalu miring ke kanan bawah dari tengahnya.", "Dibaca 'ru' ringan seperti 'ru' pada kata 'baru'.", "ルール", "ruuru", "aturan", "ル"], ["レ", "re", "1 goresan: satu goresan miring panjang ke kiri bawah dengan ujung berbelok.", "Dibaca 're' ringan seperti 're' pada kata 'remah'.", "レストラン", "resutoran", "restoran", "レ"], ["ロ", "ro", "3 goresan: tegak kiri, lalu mendatar atas menyambung tegak kanan, terakhir mendatar bawah — membentuk kotak.", "Dibaca 'ro' ringan seperti 'ro' pada kata 'roda' tetapi lebih singkat.", "ロボット", "robotto", "robot", "ロ"], ["ワ", "wa", "2 goresan: tegak pendek, lalu mendatar berbelok tegak turun.", "Dibaca 'wa' seperti 'wa' pada kata 'waktu'.", "ワイン", "wain", "anggur (wine)", "ワ"], ["ヲ", "wo", "2 goresan: mendatar di atas, lalu goresan berbelok, terakhir miring memotong.", "Dibaca 'o'. Dalam tulisan modern huruf ini jarang dipakai selain untuk nama dan gaya tertentu.", "ヲタク", "wotaku", "penggemar berat (otaku)", "ヲ"], ["ン", "n", "2 goresan: titik kecil di atas, lalu lengkung miring panjang ke kiri bawah.", "Dibaca sebagai bunyi sengau penutup suku kata, seperti 'n/ng' di akhir kata 'sen' atau 'sayang'.", "ペン", "pen", "pulpen", "ン"]];

// ===== v13: HALAMAN BELAJAR MENULIS & MENGUCAPKAN (halaman terpisah) =====
// Beranda hanya menampilkan 1 kartu tombol "✏️ Belajar Menulis & Mengucapkan"
// (hanya di mode Korea/Jepang). Isi lengkapnya — per huruf: bentuk besar,
// urutan goresan penulisan, cara baca (bunyi + kata Indonesia yang mirip),
// contoh kata asli + arti, tombol 🔊 Dengarkan huruf dan contoh katanya —
// dirender di halaman tersendiri (#writing-view), seperti halaman latihan.
// Acuan materi (ditulis ulang dengan kata sendiri, TIDAK menyalin teks buku):
//  - Korea: Hangul Orthography & romanisasi Revised Romanization dari
//    National Institute of Korean Language (korean.go.kr); kurikulum King
//    Sejong Institute / Sejong Korean (sejonghakdang.org); ujian TOPIK
//    (topik.go.kr, NIIED).
//  - Jepang: JF Standard & buku "Marugoto" dan tabel kana "Irodori" dari
//    Japan Foundation (jpf.go.jp / marugoto.org); ujian JLPT
//    (jlpt.jp, Japan Foundation & JEES).
function letterCard(item, lang){
  return '<article class="letter-card">' +
    '<div class="letter-big" lang="' + (lang === "ko-KR" ? "ko" : "ja") + '">' + esc(item[0]) + '</div>' +
    '<p class="letter-romaji">' + esc(item[1]) + '</p>' +
    '<p class="letter-line"><b>✍️ Penulisan:</b> ' + esc(item[2]) + '</p>' +
    '<p class="letter-line"><b>🔊 Cara baca:</b> ' + esc(item[3]) + '</p>' +
    '<p class="letter-line"><b>Contoh kata:</b> <span class="letter-example">' + esc(item[4]) + '</span> (' + esc(item[5]) + ') — ' + esc(item[6]) + '</p>' +
    '<p class="letter-btns">' + ttsBtn(item[7], lang, "🔊 Dengarkan Huruf") + ' ' + ttsBtn(item[4], lang, "🔊 Dengarkan Contoh") + '</p>' +
    '</article>';
}
function letterGrid(items, lang){
  return '<div class="letter-grid">' + items.map(function(it){ return letterCard(it, lang); }).join("") + '</div>';
}
function renderWritingPage(){
  var title = document.getElementById("writing-title");
  var body = document.getElementById("writing-content");
  if (!body) return;
  var html = "";
  if (LANGUAGE_CODE === "ko"){
    if (title) title.textContent = "✏️ Belajar Menulis & Mengucapkan — Hangul (한글)";
    html += '<div class="writing-intro"><p><b>Hangul</b> adalah huruf Korea yang diciptakan Raja Sejong pada tahun 1443 (diumumkan resmi 1446 lewat dokumen <i>Hunminjeongeum</i>). Jumlahnya hanya <b>24 huruf dasar</b>: 14 konsonan dan 10 vokal. Huruf-huruf itu tidak ditulis berderet, melainkan <b>dirangkai menjadi blok suku kata</b>.</p>' +
      '<p><b>Aturan menulis umum:</b> goresan mengalir dari <b>atas ke bawah</b> dan dari <b>kiri ke kanan</b>; garis mendatar biasanya ditulis sebelum garis tegak yang memotongnya.</p>' +
      '<p><b>Cara merangkai blok suku kata:</b> setiap blok = konsonan awal + vokal. Bila vokalnya <i>tegak</i> (ㅏ ㅑ ㅓ ㅕ ㅣ), vokal ditulis di <b>kanan</b> konsonan: ㄱ+ㅏ = <b>가</b>. Bila vokalnya <i>mendatar</i> (ㅗ ㅛ ㅜ ㅠ ㅡ), vokal ditulis di <b>bawah</b> konsonan: ㄱ+ㅗ = <b>고</b>. Bila suku kata diawali vokal, pakai ㅇ sebagai konsonan awal yang <b>tidak berbunyi</b>: ㅇ+ㅏ = <b>아</b>.</p>' +
      '<p><b>Batchim (받침)</b> = konsonan tambahan di <b>bawah</b> blok sebagai penutup suku kata: ㅎ+ㅏ+ㄴ = <b>한</b> (han), ㄱ+ㅜ+ㄱ = <b>국</b> (guk) — digabung menjadi <b>한국</b> (Hanguk = Korea). Di posisi akhir ini bunyi konsonan berubah: ㄱ→k, ㄷ→t, ㅂ→p, dan ㅇ→ng.</p></div>';
    html += '<h3 class="writing-h">14 Konsonan Dasar (자음)</h3>' + letterGrid(HANGUL_CONS, "ko-KR");
    html += '<h3 class="writing-h">10 Vokal Dasar (모음)</h3>' + letterGrid(HANGUL_VOW, "ko-KR");
    html += '<div class="writing-intro"><p><b>Setelah 24 huruf dasar ini:</b> ada 5 konsonan rangkap (ㄲ ㄸ ㅃ ㅆ ㅉ, bunyi lebih tegang) dan 11 vokal gabungan (ㅐ ㅒ ㅔ ㅖ ㅘ ㅙ ㅚ ㅝ ㅞ ㅟ ㅢ) yang dibentuk dari huruf-huruf dasar di atas — pelajari setelah yang dasar lancar, sesuai urutan kurikulum King Sejong Institute.</p></div>';
  } else if (LANGUAGE_CODE === "ja"){
    if (title) title.textContent = "✏️ Belajar Menulis & Mengucapkan — Hiragana & Katakana";
    html += '<div class="writing-intro"><p>Bahasa Jepang memakai <b>tiga huruf sekaligus</b> (standar pengajaran Japan Foundation di buku <i>Marugoto</i>):</p>' +
      '<p>• <b>Hiragana</b> — huruf melengkung untuk <b>kata asli Jepang</b> dan <b>tata bahasa</b> (partikel, akhiran kata kerja). Ini huruf pertama yang dipelajari.</p>' +
      '<p>• <b>Katakana</b> — huruf bersudut tegas untuk <b>kata serapan asing</b> (コーヒー kopi, テレビ TV), nama asing, dan penekanan bunyi. Bunyinya <b>sama persis</b> dengan Hiragana, hanya bentuk dan pemakaiannya yang beda.</p>' +
      '<p>• <b>Kanji</b> — huruf asal Tiongkok untuk <b>akar kata</b> (水 = air, 学校 = sekolah). Di DidiGo Kanji dikenalkan bertahap lewat kosakata pelajaran — halaman ini fokus menguasai Kana dulu, sesuai urutan Marugoto tingkat pemula (A1).</p>' +
      '<p><b>Tabel gojuuon:</b> 46 huruf dasar diurutkan dari baris vokal a-i-u-e-o, lalu baris ka, sa, ta, na, ha, ma, ya, ra, wa, dan penutup ん/ン. <b>Aturan menulis:</b> dari <b>atas ke bawah</b>, <b>kiri ke kanan</b>, garis mendatar sebelum garis tegak. Catatan bacaan khusus: partikel は dibaca <i>wa</i>, へ dibaca <i>e</i>, を dibaca <i>o</i>; vokal panjang ditulis dengan mengulang vokal (おかあさん) dan di Katakana dengan tanda ー (コーヒー), mengikuti konvensi romaji Marugoto.</p></div>';
    html += '<h3 class="writing-h">Hiragana — 46 Huruf Dasar (ひらがな)</h3>' + letterGrid(HIRAGANA_46, "ja-JP");
    html += '<h3 class="writing-h">Katakana — 46 Huruf Dasar (カタカナ)</h3>' + letterGrid(KATAKANA_46, "ja-JP");
  }
  html += '<div class="writing-sources"><h3>📚 Sumber Referensi Resmi</h3>' +
    '<p>Materi di halaman ini disusun ulang dengan kata sendiri dalam Bahasa Indonesia, mengikuti standar sumber resmi berikut:</p>' +
    '<p><b>Korea:</b> National Institute of Korean Language (국립국어원, korean.go.kr) — Hangul Orthography & Revised Romanization; King Sejong Institute / Sejong Korean — <a href="https://www.sejonghakdang.org" target="_blank" rel="noopener">sejonghakdang.org</a>; TOPIK — Test of Proficiency in Korean (topik.go.kr, NIIED).</p>' +
    '<p><b>Jepang:</b> Japan Foundation — buku <i>Marugoto: Japanese Language and Culture</i> & JF Standard (<a href="https://www.marugoto.org" target="_blank" rel="noopener">marugoto.org</a>), tabel kana <i>Irodori</i>, dan daftar kosakata <a href="https://words.marugotoweb.jp/static_contents/sp/about/about.php?lang=en" target="_blank" rel="noopener">MARUGOTO-NO-KOTOBA</a>; JLPT — Japanese-Language Proficiency Test (jlpt.jp).</p></div>';
  body.innerHTML = html;
}
window.openWritingPage = function(){
  if (LANGUAGE_CODE !== "ko" && LANGUAGE_CODE !== "ja") return;
  ttsStop();
  renderWritingPage();
  var hv = document.getElementById("home-view"); if (hv) hv.hidden = true;
  var lv = document.getElementById("lesson-view"); if (lv) lv.hidden = true;
  var mv = document.getElementById("mock-view"); if (mv) mv.hidden = true;
  var f = document.querySelector(".site-footer"); if (f) f.hidden = true;
  var wv = document.getElementById("writing-view"); if (wv) wv.hidden = false;
  window.scrollTo({ top: 0 });
};
window.closeWritingPage = function(){
  ttsStop();
  var wv = document.getElementById("writing-view"); if (wv) wv.hidden = true;
  var f = document.querySelector(".site-footer"); if (f) f.hidden = false;
  var hv = document.getElementById("home-view"); if (hv) hv.hidden = false;
  window.scrollTo({ top: 0 });
};
// Kartu tombol di beranda: hanya tampil di mode Korea/Jepang.
(function(){
  var orig = applyLanguage;
  applyLanguage = function(code){
    orig(code);
    var sec = document.getElementById("writing-card-section");
    if (sec) sec.hidden = !(LANGUAGE_CODE === "ko" || LANGUAGE_CODE === "ja");
    var lbl = document.getElementById("writing-card-label");
    if (lbl) lbl.textContent = LANGUAGE_CODE === "ko"
      ? "Hangul: 14 konsonan + 10 vokal dasar — penulisan, cara baca, dan contoh kata per huruf."
      : LANGUAGE_CODE === "ja"
        ? "Hiragana 46 huruf + Katakana 46 huruf — penulisan, cara baca, dan contoh kata per huruf."
        : "";
    var wv = document.getElementById("writing-view");
    if (wv && !wv.hidden && (LANGUAGE_CODE === "ko" || LANGUAGE_CODE === "ja")) renderWritingPage();
  };
  var sec0 = document.getElementById("writing-card-section");
  if (sec0) sec0.hidden = !(LANGUAGE_CODE === "ko" || LANGUAGE_CODE === "ja");
  var lbl0 = document.getElementById("writing-card-label");
  if (lbl0 && LANGUAGE_CODE === "ko") lbl0.textContent = "Hangul: 14 konsonan + 10 vokal dasar — penulisan, cara baca, dan contoh kata per huruf.";
  if (lbl0 && LANGUAGE_CODE === "ja") lbl0.textContent = "Hiragana 46 huruf + Katakana 46 huruf — penulisan, cara baca, dan contoh kata per huruf.";
  var bb = document.getElementById("btn-writing-back");
  if (bb) bb.onclick = function(){ window.closeWritingPage(); };
  var bx = document.getElementById("btn-writing-exit");
  if (bx) bx.onclick = function(){ window.closeWritingPage(); };
})();
// ============================================================
// ===== v14: FITUR VOLINGO-STYLE, FORMAT SERUPA 3 BAHASA =====
// Sesi Hari Ini, SRS 4 tombol, Bacaan, Awas Jebakan, Tantangan
// Mingguan, Pusat Ujian, Sidebar, Pencarian, Isian Ketik.
// Semua fungsi di bawah generik: format sama untuk en/ko/ja,
// isi mengikuti bahasa aktif (LANGUAGE_CODE).
// ============================================================
window.__v14Lang = function(){ return LANGUAGE_CODE; };
function v14ls(k, d){ try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } }
function v14lsSet(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
function v14Today(){ var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
function v14Week(){ var d = new Date(); var onejan = new Date(d.getFullYear(),0,1); return Math.ceil((((d - onejan)/86400000) + onejan.getDay() + 1)/7); }
function v14VocabMap(code){ return code === "ko" ? LESSON_VOCAB_KO : code === "ja" ? LESSON_VOCAB_JA : LESSON_VOCAB_EN; }
function v14Lessons(code){ return code === "ko" ? LESSONS_KO : code === "ja" ? LESSONS_JA : LESSONS_EN; }
function v14FlatVocab(code){ var m = v14VocabMap(code), out = []; Object.keys(m).forEach(function(k){ m[k].forEach(function(v){ out.push({ lessonId: k, w: v[0], id: cleanIdText(v[1]), ex: v[2], exId: v[3] }); }); }); return out; }
function v14Norm(s){ return String(s == null ? "" : s).toLowerCase().replace(/[\s]+/g, " ").replace(/[.!?,;:"'“”‘’。！？、]/g, "").trim(); }
function v14Shuffle(a, seed){ var r = a.slice(); var s = seed || Date.now(); for (var i = r.length - 1; i > 0; i--){ s = (s * 1103515245 + 12345) % 2147483648; var j = s % (i + 1); var t = r[i]; r[i] = r[j]; r[j] = t; } return r; }
function v14Minutes(){ return v14ls("ela_minutes_" + v14Today(), 0); }
function v14CreditMinutes(n){ v14lsSet("ela_minutes_" + v14Today(), v14Minutes() + n); v14RenderDaily(); }
function v14Xp(n){ try { addLocalLangXp(n); renderPanels(); } catch(e){} try { v16QueueBonus(n); } catch(e){} var b = document.getElementById("xp-badge"); if (b) b.textContent = "⭐ " + localLangXp() + " XP"; }

var V14_TRAPS = {
  en: [["Good night itu pamit, bukan sapaan", "“Good night” hanya dipakai saat berpisah di malam hari / mau tidur. Untuk menyapa di malam hari pakai “Good evening”."],
       ["A university, bukan an university", "“University” dibaca yu-ni-ver-si-ti — bunyi awalnya konsonan /j/ (yu), jadi pakai “a”. Kaidahnya bunyi, bukan huruf: “an hour” karena h-nya tidak dibaca."],
       ["I am agree itu salah", "“Agree” adalah kata kerja, jadi cukup “I agree”, tanpa “am”. Jangan tertukar dengan “I am happy” (happy = kata sifat)."]],
  ko: [["은/는 vs 이/가 jangan tertukar", "은/는 menandai TOPIK (yang dibicarakan), 이/가 menandai SUBJEK (pelaku/hal yang ditekankan). “저는 학생이에요” = kalau saya, pelajar. “제가 학생이에요” = sayalah yang pelajar."],
       ["감사합니다 vs 감사해요", "Keduanya “terima kasih”: 감사합니다 paling formal (presentasi, orang asing), 감사해요 sopan sehari-hari, 고마워 untuk teman dekat saja."],
       ["을/를 mengikuti batchim", "Ada batchim (huruf mati di akhir) → 을, tidak ada batchim → 를. Contoh: 책을 읽어요 (책 ada batchim ㄱ), 사과를 먹어요 (과 tidak ada batchim)."]],
  ja: [["は dibaca WA, bukan HA", "Partikel topik は ditulis “ha” tapi DIBACA “wa”. Contoh: 私は学生です dibaca “watashi WA gakusei desu”."],
       ["を dibaca O", "Partikel objek を ditulis “wo” tapi dalam bahasa modern dibaca “o”. Contoh: 本を読みます = “hon O yomimasu”."],
       ["Jangan pakai あなた ke atasan", "あなた (kamu) terdengar terlalu langsung untuk atasan/orang yang dihormati. Panggil nama + さん atau jabatannya (先生, 部長)."]]
};
var V14_FORMAL = {
  en: [["Formal / Resmi", "Good morning. My name is Didi. I would like to ask a question.", "Selamat pagi. Nama saya Didi. Saya ingin mengajukan pertanyaan."],
       ["Santai / Sehari-hari", "Morning! I'm Didi. Can I ask something?", "Pagi! Saya Didi. Boleh tanya sesuatu?"]],
  ko: [["Formal (합니다체)", "안녕하세요. 저는 디디입니다. 질문이 있습니다.", "Halo. Saya Didi. Saya ada pertanyaan."],
       ["Sopan sehari-hari (해요체)", "안녕하세요. 저는 디디예요. 질문이 있어요.", "Halo. Saya Didi. Ada pertanyaan."],
       ["Santai (반말, teman dekat)", "안녕. 나 디디야. 질문 있어.", "Hai. Aku Didi. Ada pertanyaan."]],
  ja: [["Formal (です・ます)", "おはようございます。私はディディです。質問があります。", "Selamat pagi. Saya Didi. Saya ada pertanyaan."],
       ["Santai (teman dekat)", "おはよう。私、ディディ。質問がある。", "Pagi. Aku Didi. Ada pertanyaan."]]
};
var V14_ERRORS = {
  en: [["I am agree", "I agree", "Agree adalah kata kerja, tidak perlu “am”."],
       ["She don't like coffee", "She doesn't like coffee", "Subjek he/she/it memakai doesn't, bukan don't."],
       ["I have visited Bali yesterday", "I visited Bali yesterday", "Ada keterangan waktu lampau yang jelas (yesterday) → pakai Past Simple, bukan Present Perfect."],
       ["More better", "Better", "Better sudah bentuk perbandingan, jangan ditambah more."]],
  ko: [["저는 학생입니다예요", "저는 학생이에요 / 저는 학생입니다", "Jangan mencampur akhiran 입니다 dan 예요 dalam satu kalimat. Pilih satu gaya bicara."],
       ["사과을 먹어요", "사과를 먹어요", "사과 tidak punya batchim, jadi partikel objeknya 를, bukan 을."],
       ["학교에서 가요", "학교에 가요", "“Pergi ke” memakai 에. 에서 dipakai untuk tempat berlangsungnya kegiatan (학교에서 공부해요)."]],
  ja: [["私は学生だです", "私は学生です", "Jangan menggabungkan だ dan です. Pilih sopan (です) atau santai (だ)."],
       ["本が読みます", "本を読みます", "Objek yang dikenai pekerjaan memakai を. が untuk subjek."],
       ["明日は昨日行きます", "明日行きます / 昨日行きました", "Perhatikan waktu: besok = bentuk sekarang/masa depan, kemarin = bentuk lampau ました."]]
};
var V14_CONJUG = {
  en: [["be (am/is/are)", "I am, she is, we are", "am untuk I; is untuk he/she/it; are untuk you/we/they."],
       ["Kata kerja + -s", "She speaks English.", "He/she/it di Present Simple: kata kerja ditambah -s/-es."],
       ["Past Simple", "go → went, speak → spoke, regular: + -ed", "Bentuk lampau: kata kerja beraturan + -ed, tidak beraturan berubah bentuk."],
       ["Present Continuous", "I am reading now.", "be + kata kerja-ing untuk kegiatan yang sedang berlangsung."]],
  ko: [["-아요/-어요", "가다 → 가요, 먹다 → 먹어요", "Bentuk sopan sekarang: vokal terakhir ㅏ/ㅗ → -아요, selain itu -어요."],
       ["-았어요/-었어요 (lampau)", "가요 → 갔어요, 먹어요 → 먹었어요", "Bentuk lampau sopan untuk kejadian yang sudah selesai."],
       ["-고 싶어요", "가고 싶어요 = saya ingin pergi", "“Ingin melakukan”: kata kerja (batang) + -고 싶어요."],
       ["-(으)세요", "앉으세요 = silakan duduk", "Bentuk hormat/perintah halus untuk orang yang dihormati."]],
  ja: [["-ます (sopan sekarang)", "行きます = pergi, 食べます = makan", "Bentuk sopan untuk kalimat sekarang/masa depan."],
       ["-ました (sopan lampau)", "行きました = sudah pergi", "Bentuk lampau sopan."],
       ["-て (penghubung)", "食べてください = tolong makan", "Bentuk -て menghubungkan kalimat dan untuk permintaan 〜てください."],
       ["-たい (ingin)", "行きたいです = saya ingin pergi", "“Ingin melakukan”: batang kata kerja + たいです."]]
};
var V14_CULTURE = {
  en: [["Sapaan & basa-basi", "Di negara berbahasa Inggris, “How are you?” sering hanya basa-basi; jawaban singkat “Good, thanks” sudah cukup."],
       ["Tepat waktu", "Datang tepat waktu dianggap menghargai orang lain, terutama untuk sekolah dan pekerjaan."],
       ["Please & thank you", "Kata “please” dan “thank you” dipakai sangat sering, bahkan untuk hal kecil."]],
  ko: [["Dua tangan & membungkuk", "Menerima/memberi sesuatu kepada yang lebih tua lazimnya dengan dua tangan, disertai sedikit membungkuk."],
       ["Umur menentukan gaya bicara", "Karena itu orang Korea sering menanyakan umur di awal kenalan — bukan tidak sopan, tapi untuk memilih level bahasa."],
       ["Panggilan, bukan nama langsung", "Atasan/guru dipanggil dengan jabatan + 님 (선생님, 과장님), bukan nama pribadi."]],
  ja: [["Membungkuk (ojigi)", "Membungkuk menggantikan jabat tangan dalam banyak situasi; makin dalam, makin hormat."],
       ["Kartu nama (meishi)", "Kartu nama diterima dengan dua tangan dan dibaca sebentar — tanda menghargai."],
       ["Ketenangan di kereta", "Di kereta Jepang, menelepon dengan suara keras dianggap mengganggu; HP lazimnya mode senyap."]]
};
var V14_CHALLENGES = [
  { name: "Ulangi Cepat 3 Menit", desc: "Buka Kartu Hafalan dan selesaikan 10 penilaian kartu secepat yang kamu bisa (target ±3 menit).", page: "flash" },
  { name: "Dikte ±3 Menit", desc: "Latihan Dikte: dengarkan dan ketik 5 kata/kalimat tanpa melihat teksnya dulu.", page: "dikte" },
  { name: "Pemburu Isian Ketik", desc: "Kerjakan 1 Kuis Latihan dan jawab semua soal isian ketik dengan benar.", page: "latihan" },
  { name: "Pembaca Mingguan", desc: "Baca 1 artikel di Perpustakaan Bacaan sampai selesai, termasuk pertanyaan pemahamannya.", page: "bacaan" }
];
var V14_EXAMS = {
  en: [{ id: "ielts", name: "IELTS", bank: "MOCK", plan: "Rencana belajar IELTS: (1) kuasai kosakata akademik A2–B2 di Modul, (2) kerjakan Mini Mock IELTS tiap minggu dan catat skornya, (3) latih Writing dengan contoh esai Band 8.0 di bagian Esai, (4) bicara 2 menit/hari memakai topik Speaking." },
       { id: "toeic", name: "TOEIC", bank: "MOCK", plan: "Rencana belajar TOEIC: (1) fokus kosakata bisnis di bagian Business English, (2) Mini Mock bergaya TOEIC untuk kecepatan membaca, (3) hafalkan phrasal verbs kantor, (4) target naik 1 level modul tiap 2 minggu." },
       { id: "toefl", name: "TOEFL", bank: "MOCK", plan: "Rencana belajar TOEFL: (1) kosakata akademik + catatan tata bahasa, (2) Mini Mock dengan batas waktu, (3) rangkum bacaan B1–C1 dengan kata-katamu sendiri, (4) rekam jawaban Speaking 45 detik." }],
  ko: [{ id: "topik1", name: "TOPIK I", bank: "TOPIK1", plan: "Rencana belajar TOPIK I: (1) selesaikan modul A0–A2, (2) hafalkan kosakata frekuensi tertinggi lewat Kartu Hafalan SRS, (3) kerjakan Bank Soal TOPIK I tiap minggu, (4) kuasai partikel dasar (은/는, 이/가, 을/를, 에/에서) dari Catatan Partikel." },
       { id: "topik2", name: "TOPIK II", bank: "TOPIK2", plan: "Rencana belajar TOPIK II: (1) modul B1–C2, (2) latihan menulis dengan pola KOMOCK_W, (3) listening dari bagian Listening TOPIK, (4) simulasi penuh sebulan sekali dan evaluasi per bagian." },
       { id: "eps", name: "EPS-TOPIK", bank: "EPS", plan: "Rencana belajar EPS-TOPIK: (1) kosakata tempat kerja dari modul A1–B1, (2) dialog K-Drama & tempat kerja, (3) bank soal EPS tiap minggu, (4) dikte kata kerja instruksi kerja." }],
  ja: [{ id: "jlpt", name: "JLPT (N5–N1)", bank: "GEN", plan: "Rencana belajar JLPT: (1) kuasai Hiragana & Katakana di halaman Menulis & Mengucapkan, (2) modul mengikuti level (A0–A2 ≈ N5–N4, B1–B2 ≈ N3–N2, C1–C2 ≈ N1), (3) simulasi JLPT mini tiap minggu, (4) SRS untuk kanji/kosakata yang sering lupa." },
       { id: "jft", name: "JFT-Basic", bank: "GEN", plan: "Rencana belajar JFT-Basic: (1) fokus bahasa kehidupan sehari-hari (modul A0–A2), (2) dialog belanja, dokter, dan tempat kerja, (3) simulasi JFT-Basic mini, (4) ulangi partikel は・が・を・に・で sampai otomatis." }]
};
var V14_PROMPTS = {
  en: ["Tulis 5 kalimat tentang hari ini memakai Present Simple.", "Ceritakan kemarinmu dalam 5 kalimat Past Simple.", "Tulis dialog singkat memesan makanan di restoran."],
  ko: ["오늘 하루를 해요체로 5문장 써 보세요. (Tulis 5 kalimat tentang harimu dengan gaya 해요체.)", "가족을 소개하는 글을 5문장으로 써 보세요. (Perkenalkan keluargamu dalam 5 kalimat.)", "좋아하는 음식과 이유를 써 보세요. (Tulis makanan favoritmu dan alasannya.)"],
  ja: ["今日のことを5文で書いてみましょう。(Tulis 5 kalimat tentang harimu ini.)", "家族を紹介する文を5文書きましょう。(Perkenalkan keluargamu dalam 5 kalimat.)", "好きな食べ物と理由を書きましょう。(Tulis makanan favoritmu dan alasannya.)"]
};

// ---------- SRS (Kartu Hafalan) ----------
function v14SrsKey(code){ return "ela_srs_" + code; }
function v14SrsDeck(code){ return v14ls(v14SrsKey(code), {}); }
function v14SrsSave(code, d){ v14lsSet(v14SrsKey(code), d); }
function v14DueCount(code){ var d = v14SrsDeck(code), now = Date.now(), n = 0; Object.keys(d).forEach(function(w){ if (d[w].due <= now) n++; }); return n; }
function v14MineWord(code, word){ var d = v14SrsDeck(code); if (!d[word]) { d[word] = { due: Date.now(), ivl: 0 }; v14SrsSave(code, d); } }
var V14_SRS_RATES = [ { label: "Lupa", sub: "~1 menit", days: 0 }, { label: "Sulit", sub: "4 hari", days: 4 }, { label: "Ingat", sub: "9 hari", days: 9 }, { label: "Mudah", sub: "20 hari", days: 20 } ];
// ---------- Menit belajar / sesi harian ----------
function v14DailyPlan(){
  var code = LANGUAGE_CODE, done = doneIds();
  var next = v14Lessons(code).find(function(l){ return !done.includes(l.id); }) || v14Lessons(code)[0];
  var flat = v14FlatVocab(code);
  var di = v14DayIdx();
  var rl = v14Lessons(code)[di % v14Lessons(code).length];
  return { lesson: next, readingLesson: rl };
}
// ---------- Kerangka halaman v14 ----------
function v14ShowView(title, html){
  ["home-view", "lesson-view", "mock-view", "writing-view"].forEach(function(id){ var e = document.getElementById(id); if (e) e.hidden = true; });
  var f = document.querySelector(".site-footer"); if (f) f.hidden = true;
  var v = document.getElementById("v14-view"); if (!v) return;
  v.hidden = false;
  document.getElementById("v14-title").textContent = title;
  document.getElementById("v14-body").innerHTML = html;
  window.scrollTo({ top: 0 });
}
function v14CloseView(){
  var v = document.getElementById("v14-view"); if (v) v.hidden = true;
  if (typeof showHomePage === "function") showHomePage();
  v14RenderDaily();
}
window.v14Go = function(page, arg){
  if (page === "home") { v14CloseView(); window.scrollTo({ top: 0 }); return; }
  if (page === "modul") { v14CloseView(); var e = document.getElementById("jalur-belajar"); if (e) e.scrollIntoView({ behavior: "smooth" }); return; }
  if (page === "flash") return v14PageFlash();
  if (page === "bacaan") return v14PageReadings(arg);
  if (page === "bacaan-detail") return v14PageReadingDetail(arg);
  if (page === "ujian") return v14PageExams();
  if (page === "ujian-mulai") return v14StartExam(arg);
  if (page === "penempatan") return v14StartPlacement();
  if (page === "latihan") return v14StartPractice();
  if (page === "kesalahan") return v14PageErrors();
  if (page === "dikte") return v14PageDictation();
  if (page === "menulis") return v14PageWriting();
  if (page === "konjugasi") return v14PageConjug();
  if (page === "dialog") return v14PageDialog();
  if (page === "grammar") return v14PageGrammar();
  if (page === "kosakata") return v14PageVocab(arg);
  if (page === "idiom") return v14PageIdiom();
  if (page === "budaya") return v14PageCulture();
  if (page === "menulis-huruf") { v14CloseView(); if (typeof window.openWritingPage === "function") window.openWritingPage(); else { var w = document.getElementById("writing-card-section"); if (w) w.scrollIntoView({ behavior: "smooth" }); } return; }
};
// ---------- Beranda v14: sesi harian, SRS, tantangan, aksi cepat ----------
function v14RenderDaily(){
  var host = document.getElementById("v14-daily"); if (!host) return;
  var plan = v14DailyPlan(), mins = v14Minutes(), pct = Math.min(100, Math.round(mins / 15 * 100));
  var code = LANGUAGE_CODE;
  var srsHtml = ["en", "ko", "ja"].map(function(c){
    var nm = c === "ko" ? "한국어 Korea" : c === "ja" ? "日本語 Jepang" : "English";
    return '<div class="v14-srs-chip"><span>' + nm + '</span><b>' + v14DueCount(c) + ' kartu jatuh tempo</b></div>';
  }).join("");
  var ch = V14_CHALLENGES[(v14Week() - 1) % V14_CHALLENGES.length];
  host.innerHTML =
    '<div class="v14-grid">' +
    '<section class="v14-card v14-daily-card"><h3>🗓️ Sesi Hari Ini — ' + esc(langName()) + '</h3>' +
    '<p class="v14-sub">Target harian 15 menit · progresmu hari ini: <b>' + mins + ' / 15 menit</b></p>' +
    '<div class="v14-bar"><span style="width:' + pct + '%"></span></div>' +
    '<ol class="v14-steps"><li><b>1 bagian modul:</b> ' + esc(plan.lesson.title) + ' (Level ' + plan.lesson.level + ')</li>' +
    '<li><b>1 bacaan ringan:</b> Bacaan dari pelajaran “' + esc(plan.readingLesson.title) + '”</b></li></ol>' +
    '<p class="v14-sub">Komposisi sesi besok berbeda — menyesuaikan progres dan pelajaran yang sudah kamu selesaikan.</p>' +
    '<div class="v14-actions"><button type="button" class="btn btn-primary" onclick="v14StartDaily()">▶ Mulai Sesi</button>' +
    '<button type="button" class="btn btn-ghost" onclick="v14Go(\'bacaan-detail\',\'' + plan.readingLesson.id + '\')">Baca Bacaannya</button></div></section>' +
    '<section class="v14-card"><h3>🔁 Hafalan SRS Jatuh Tempo</h3><div class="v14-srs-list">' + srsHtml + '</div>' +
    '<p class="v14-sub">Kartu yang sudah waktunya diulang, per bahasa. Nilai kartumu: Lupa ~1 menit · Sulit 4 hari · Ingat 9 hari · Mudah 20 hari.</p>' +
    '<button type="button" class="btn btn-primary" onclick="v14Go(\'flash\')">Buka Kartu Hafalan</button></section>' +
    '<section class="v14-card"><h3>🏆 Tantangan Minggu Ini</h3><p><b>' + esc(ch.name) + '</b></p><p class="v14-sub">' + esc(ch.desc) + '</p>' +
    '<button type="button" class="btn btn-ghost" onclick="v14Go(\'' + ch.page + '\')">Ikuti Tantangan</button>' +
    '<p class="v14-sub">Tantangan berganti tiap minggu.</p></section>' +
    '<section class="v14-card"><h3>⚡ Aksi Cepat</h3><div class="v14-quick">' +
    '<button type="button" onclick="v14Go(\'flash\')">🃏 Kartu Hafalan</button>' +
    '<button type="button" onclick="v14Go(\'dikte\')">🎧 Dikte</button>' +
    '<button type="button" onclick="v14Go(\'grammar\')">📐 Tata Bahasa</button>' +
    '<button type="button" onclick="v14Go(\'ujian\')">🎓 Simulasi Ujian</button>' +
    '<button type="button" onclick="v14Go(\'latihan\')">✍️ Kuis Latihan</button>' +
    '<button type="button" onclick="v14Go(\'bacaan\')">📖 Bacaan</button></div></section></div>';
}
window.v14StartDaily = function(){
  var plan = v14DailyPlan();
  v14lsSet("ela_daily_" + v14Today() + "_" + LANGUAGE_CODE, { lesson: plan.lesson.id, reading: plan.readingLesson.id, started: Date.now() });
  if (typeof window.startLesson === "function") window.startLesson(plan.lesson.id);
};

// ---------- Keyboard Virtual (Korea Hangul / Jepang Kana) ----------
// Muncul OTOMATIS di bawah kolom isian ketik saat soal Korea/Jepang
// aktif + tombol manual "⌨️ Keyboard". Inggris tidak memakai ini.
var V14_KB = { input: null, mode: null };
var H_CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
var H_JUNG = ["ㅏ","ㅐ","ㅑ","ㅒ","ㅓ","ㅔ","ㅕ","ㅖ","ㅗ","ㅘ","ㅙ","ㅚ","ㅛ","ㅜ","ㅝ","ㅞ","ㅟ","ㅠ","ㅡ","ㅢ","ㅣ"];
var H_JONG = ["","ㄱ","ㄲ","ㄳ","ㄴ","ㄵ","ㄶ","ㄷ","ㄹ","ㄺ","ㄻ","ㄼ","ㄽ","ㄾ","ㄿ","ㅀ","ㅁ","ㅂ","ㅄ","ㅅ","ㅆ","ㅇ","ㅈ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
var H_JONG_SPLIT = { "ㄳ": ["ㄱ","ㅅ"], "ㄵ": ["ㄴ","ㅈ"], "ㄶ": ["ㄴ","ㅎ"], "ㄺ": ["ㄹ","ㄱ"], "ㄻ": ["ㄹ","ㅁ"], "ㄼ": ["ㄹ","ㅂ"], "ㄽ": ["ㄹ","ㅅ"], "ㄾ": ["ㄹ","ㅌ"], "ㄿ": ["ㄹ","ㅍ"], "ㅀ": ["ㄹ","ㅎ"], "ㅄ": ["ㅂ","ㅅ"] };
function v14HangulCompose(value, jamo){
  var isVowel = H_JUNG.indexOf(jamo) >= 0;
  if (!value) return jamo;
  var last = value.charAt(value.length - 1), code = last.charCodeAt(0), rest = value.slice(0, -1);
  // Karakter terakhir masih jamo lepas (belum jadi suku kata)
  if (code >= 0x3131 && code <= 0x3163){
    var li = H_CHO.indexOf(last);
    if (!isVowel && li < 0) return value + jamo; // vokal lepas + vokal, dsb.
    if (isVowel && li >= 0){ var s = String.fromCharCode(0xAC00 + li * 588 + H_JUNG.indexOf(jamo) * 28); return rest + s; }
    if (!isVowel) return value + jamo;
    return value + jamo;
  }
  if (code >= 0xAC00 && code <= 0xD7A3){
    var c = code - 0xAC00, cho = Math.floor(c / 588), jung = Math.floor((c % 588) / 28), jong = c % 28;
    if (isVowel){
      if (jong === 0){
        // Gabung vokal majemuk: ㅗ+ㅏ=ㅘ, ㅜ+ㅓ=ㅝ, ㅡ+ㅣ=ㅢ
        var combo = { "8,0": 9, "8,1": 10, "8,20": 11, "13,4": 14, "13,5": 15, "13,20": 16, "18,20": 19 };
        var key = jung + "," + H_JUNG.indexOf(jamo);
        if (combo[key] != null) return rest + String.fromCharCode(0xAC00 + cho * 588 + combo[key] * 28);
        return value + jamo;
      }
      // Ada batchim + vokal: batchim pindah jadi awal suku kata baru
      var jongCh = H_JONG[jong], newCho, remain = 0;
      if (H_JONG_SPLIT[jongCh]){ newCho = H_JONG_SPLIT[jongCh][1]; remain = H_JONG.indexOf(H_JONG_SPLIT[jongCh][0]); }
      else newCho = jongCh;
      var ci = H_CHO.indexOf(newCho); if (ci < 0) ci = 11;
      return rest + String.fromCharCode(0xAC00 + cho * 588 + jung * 28 + remain) + String.fromCharCode(0xAC00 + ci * 588 + H_JUNG.indexOf(jamo) * 28);
    }
    // Konsonan masuk
    if (jong === 0){ var ji = H_JONG.indexOf(jamo); if (ji > 0) return rest + String.fromCharCode(0xAC00 + cho * 588 + jung * 28 + ji); return value + jamo; }
    var comb2 = { "ㄱ,ㅅ": "ㄳ", "ㄴ,ㅈ": "ㄵ", "ㄴ,ㅎ": "ㄶ", "ㄹ,ㄱ": "ㄺ", "ㄹ,ㅁ": "ㄻ", "ㄹ,ㅂ": "ㄼ", "ㄹ,ㅅ": "ㄽ", "ㄹ,ㅌ": "ㄾ", "ㄹ,ㅍ": "ㄿ", "ㄹ,ㅎ": "ㅀ", "ㅂ,ㅅ": "ㅄ" };
    var k2 = H_JONG[jong] + "," + jamo;
    if (comb2[k2]) return rest + String.fromCharCode(0xAC00 + cho * 588 + jung * 28 + H_JONG.indexOf(comb2[k2]));
    return value + jamo;
  }
  return value + jamo;
}
var V14_DAKU = { "か":"が","き":"ぎ","く":"ぐ","け":"げ","こ":"ご","さ":"ざ","し":"じ","す":"ず","せ":"ぜ","そ":"ぞ","た":"だ","ち":"ぢ","つ":"づ","て":"で","と":"ど","は":"ば","ひ":"び","ふ":"ぶ","へ":"べ","ほ":"ぼ","カ":"ガ","キ":"ギ","ク":"グ","ケ":"ゲ","コ":"ゴ","サ":"ザ","シ":"ジ","ス":"ズ","セ":"ゼ","ソ":"ゾ","タ":"ダ","チ":"ヂ","ツ":"ヅ","テ":"デ","ト":"ド","ハ":"バ","ヒ":"ビ","フ":"ブ","ヘ":"ベ","ホ":"ボ" };
var V14_HANDAKU = { "は":"ぱ","ひ":"ぴ","ふ":"ぷ","へ":"ぺ","ほ":"ぽ","ハ":"パ","ヒ":"ピ","フ":"プ","ヘ":"ペ","ホ":"ポ" };
function v14KbEl(){
  var kb = document.getElementById("v14-kb");
  if (!kb){ kb = document.createElement("div"); kb.id = "v14-kb"; kb.className = "v14-kb"; kb.hidden = true; document.body.appendChild(kb); }
  return kb;
}
function v14KbRender(){
  var kb = v14KbEl(); if (!V14_KB.input) { kb.hidden = true; return; }
  var lang = LANGUAGE_CODE, mode = V14_KB.mode;
  if (!mode) mode = V14_KB.mode = (lang === "ko" ? "hangul" : "hira");
  var tabs = "", rows = "";
  if (lang === "ko"){
    tabs = '<button type="button" class="' + (mode === "hangul" ? "on" : "") + '" onclick="v14KbMode(\'hangul\')">한글 Hangul</button><button type="button" class="' + (mode === "qwerty" ? "on" : "") + '" onclick="v14KbMode(\'qwerty\')">ABC QWERTY</button>';
    if (mode === "hangul"){
      rows = '<div class="v14-kb-row">' + ["ㅂ","ㅈ","ㄷ","ㄱ","ㅅ","ㅛ","ㅕ","ㅑ","ㅐ","ㅔ"].map(v14KbKey).join("") + '</div>' +
             '<div class="v14-kb-row">' + ["ㅁ","ㄴ","ㅇ","ㄹ","ㅎ","ㅗ","ㅓ","ㅏ","ㅣ"].map(v14KbKey).join("") + '</div>' +
             '<div class="v14-kb-row">' + ["ㅋ","ㅌ","ㅊ","ㅍ","ㅠ","ㅜ","ㅡ"].map(v14KbKey).join("") + '</div>' +
             '<div class="v14-kb-row">' + ["ㄲ","ㄸ","ㅃ","ㅆ","ㅉ","ㅖ","ㅒ"].map(v14KbKey).join("") + '</div>';
    } else rows = v14KbQwerty();
  } else if (lang === "ja"){
    tabs = '<button type="button" class="' + (mode === "hira" ? "on" : "") + '" onclick="v14KbMode(\'hira\')">あ Hiragana</button><button type="button" class="' + (mode === "kata" ? "on" : "") + '" onclick="v14KbMode(\'kata\')">ア Katakana</button><button type="button" class="' + (mode === "qwerty" ? "on" : "") + '" onclick="v14KbMode(\'romaji\')">ABC Romaji</button>';
    if (mode === "qwerty" || mode === "romaji") rows = v14KbQwerty();
    else {
      var H = ["あ","い","う","え","お","か","き","く","け","こ","さ","し","す","せ","そ","た","ち","つ","て","と","な","に","ぬ","ね","の","は","ひ","ふ","へ","ほ","ま","み","む","め","も","や","ゆ","よ","ら","り","る","れ","ろ","わ","を","ん"];
      var K = ["ア","イ","ウ","エ","オ","カ","キ","ク","ケ","コ","サ","シ","ス","セ","ソ","タ","チ","ツ","テ","ト","ナ","ニ","ヌ","ネ","ノ","ハ","ヒ","フ","ヘ","ホ","マ","ミ","ム","メ","モ","ヤ","ユ","ヨ","ラ","リ","ル","レ","ロ","ワ","ヲ","ン"];
      var src = mode === "kata" ? K : H;
      rows = '<div class="v14-kb-row v14-kb-kana">' + src.map(v14KbKey).join("") + '</div>' +
             '<div class="v14-kb-row"><button type="button" onclick="v14KbDaku()">゛ Dakuten</button><button type="button" onclick="v14KbHandaku()">゜ Handakuten</button><button type="button" onclick="v14KbSmall()">Kecil っゃゅょ</button></div>';
    }
  } else { kb.hidden = true; return; }
  kb.innerHTML = '<div class="v14-kb-head"><span>⌨️ Keyboard ' + (lang === "ko" ? "Hangul" : "Jepang") + ' — ketuk hurufnya, suku kata Hangul/kana tersusun otomatis</span><button type="button" class="v14-kb-x" onclick="v14KbHide()" aria-label="Sembunyikan keyboard">✕</button></div><div class="v14-kb-tabs">' + tabs + '</div>' + rows +
    '<div class="v14-kb-row"><button type="button" class="v14-kb-wide" onclick="v14KbBack()">⌫ Hapus</button><button type="button" class="v14-kb-space" onclick="v14KbKeyPress(\' \')">Spasi</button><button type="button" class="v14-kb-wide" onclick="v14KbEnter()">⏎ Enter / Kirim</button></div>';
  kb.hidden = false;
  if (V14_KB.input) { var p = V14_KB.input.closest(".v14-typed-wrap, form, .v14-card, #quiz-box") || V14_KB.input.parentNode; if (p) p.appendChild(kb); }
}
function v14KbKey(ch){ return '<button type="button" onmousedown="event.preventDefault()" onclick="v14KbKeyPress(\'' + ch + '\')">' + ch + '</button>'; }
function v14KbQwerty(){
  return '<div class="v14-kb-row">' + "qwertyuiop".split("").map(v14KbKey).join("") + '</div><div class="v14-kb-row">' + "asdfghjkl".split("").map(v14KbKey).join("") + '</div><div class="v14-kb-row">' + "zxcvbnm".split("").map(v14KbKey).join("") + '</div>';
}
window.v14KbMode = function(m){ V14_KB.mode = m; v14KbRender(); if (V14_KB.input) V14_KB.input.focus(); };
window.v14KbHide = function(){ v14KbEl().hidden = true; };
window.v14KbToggle = function(btn){ var kb = v14KbEl(); if (!kb.hidden && V14_KB.input) { kb.hidden = true; return; } var inp = btn ? btn.closest(".v14-typed-wrap, form, div").querySelector("input.v14-typed, input[type=text]") : V14_KB.input; if (inp) v14KbShow(inp); };
window.v14KbShow = function(inp){ if (LANGUAGE_CODE === "en") return; V14_KB.input = inp; if (!V14_KB.mode) V14_KB.mode = LANGUAGE_CODE === "ko" ? "hangul" : "hira"; v14KbRender(); };
window.v14KbKeyPress = function(ch){
  var inp = V14_KB.input; if (!inp) return;
  if (LANGUAGE_CODE === "ko" && V14_KB.mode === "hangul" && ch !== " ") inp.value = v14HangulCompose(inp.value, ch);
  else inp.value = inp.value + ch;
  inp.focus(); inp.dispatchEvent(new Event("input", { bubbles: true }));
};
window.v14KbBack = function(){ var inp = V14_KB.input; if (!inp) return; inp.value = inp.value.slice(0, -1); inp.focus(); };
window.v14KbEnter = function(){ var inp = V14_KB.input; if (!inp) return; var f = inp.closest("form"); if (f) { if (f.requestSubmit) f.requestSubmit(); else f.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); } };
window.v14KbDaku = function(){ var inp = V14_KB.input; if (!inp || !inp.value) return; var l = inp.value.charAt(inp.value.length - 1); if (V14_DAKU[l]) inp.value = inp.value.slice(0, -1) + V14_DAKU[l]; inp.focus(); };
window.v14KbHandaku = function(){ var inp = V14_KB.input; if (!inp || !inp.value) return; var l = inp.value.charAt(inp.value.length - 1); if (V14_HANDAKU[l]) inp.value = inp.value.slice(0, -1) + V14_HANDAKU[l]; inp.focus(); };
window.v14KbSmall = function(){ var inp = V14_KB.input; if (!inp || !inp.value) return; var map = { "つ":"っ","や":"ゃ","ゆ":"ゅ","よ":"ょ","ツ":"ッ","ヤ":"ャ","ユ":"ュ","ヨ":"ョ" }; var l = inp.value.charAt(inp.value.length - 1); if (map[l]) inp.value = inp.value.slice(0, -1) + map[l]; inp.focus(); };
document.addEventListener("focusin", function(e){ if (e.target && e.target.classList && e.target.classList.contains("v14-typed") && LANGUAGE_CODE !== "en") v14KbShow(e.target); });

// ---------- Pembuat soal generik (Pilihan Ganda + Isian Ketik) ----------
function v14TypedFromVocab(v, others){
  var blanked = blankOut(v.ex, v.w);
  if (blanked === v.ex) return null;
  return { kind: "type", q: blanked, before: blanked.split("___")[0], after: blanked.split("___")[1] || "", answerText: v.w,
    ctx: "Ketik kata yang hilang. Konteks (arti kalimat lengkap): " + v.exId,
    explain: "Kalimat lengkapnya: " + v.ex + " — Artinya: " + v.exId, full: v.ex };
}
function v14McqFromVocab(v, pool, seed, mode){
  var others = v14Shuffle(pool.filter(function(x){ return x.w !== v.w; }), seed).slice(0, 3);
  if (mode === "id"){
    var opts = v14Shuffle([v.id].concat(others.map(function(o){ return o.id; })), seed + 1);
    return { kind: "mcq", q: "Apa arti Bahasa Indonesia dari kata “" + v.w + "”?", ctx: "Pilih arti Bahasa Indonesia yang tepat.", opts: opts, answer: opts.indexOf(v.id), speak: opts.map(function(o){ var f = pool.find(function(x){ return x.id === o; }); return f ? f.w : ""; }), explain: "Contoh: " + v.ex + " — Artinya: " + v.exId, full: v.ex };
  }
  var opts2 = v14Shuffle([v.w].concat(others.map(function(o){ return o.w; })), seed + 2);
  return { kind: "mcq", q: "Apa Bahasa " + (LANGUAGE_CODE === "ko" ? "Korea" : LANGUAGE_CODE === "ja" ? "Jepang" : "Inggris") + "nya “" + v.id + "”?", ctx: "Pilih kata bahasa target yang tepat untuk arti yang ditanyakan.", opts: opts2, answer: opts2.indexOf(v.w), speak: opts2.slice(), explain: "Contoh: " + v.ex + " — Artinya: " + v.exId, full: v.ex };
}
function v14BuildQuizSet(seed, count, typedRatio){
  var flat = v14FlatVocab(LANGUAGE_CODE);
  var picked = v14Shuffle(flat, seed).slice(0, count);
  return picked.map(function(v, i){
    if (i % 3 === 2){ var t = v14TypedFromVocab(v, flat); if (t) return t; }
    return v14McqFromVocab(v, flat, seed + i * 7, i % 2 ? "target" : "id");
  });
}
// ---------- Mesin kuis generik v14 (dipakai Penempatan, Latihan, Ujian JA) ----------
var V14_Q = null;
function v14RunQuiz(title, questions, onDone){
  v16SealQuestions(questions); // v16: jawaban disegel (hash + salt sesi)
  V14_Q = { title: title, questions: questions, idx: 0, correct: 0, wrong: 0, answered: false, onDone: onDone };
  v14RenderQ();
}
function v14RenderQ(){
  var s = V14_Q, it = s.questions[s.idx], total = s.questions.length;
  var body = '<div class="v14-card"><p class="v14-sub">' + esc(s.title) + ' · Soal ' + (s.idx + 1) + ' dari ' + total + ' · ✅ Benar: ' + s.correct + ' · ❌ Salah: ' + s.wrong + '</p><div class="v14-bar"><span style="width:' + Math.round(s.idx / total * 100) + '%"></span></div>';
  if (it.ctx) body += '<div class="context"><b>Konteks — baca dulu</b><br>' + esc(it.ctx) + (it.ctxHtml ? '<br>' + it.ctxHtml : '') + '</div>';
  if (it.kind === "type"){
    body += '<form id="v14-type-form"><p class="v14-bigq"><span>' + esc(it.before || it.q) + '</span> ' +
      '<span class="v14-typed-wrap"><input type="text" id="v14-type-input" class="v14-typed" autocomplete="off" autocapitalize="none" placeholder="ketik di sini">' +
      (LANGUAGE_CODE !== "en" ? '<button type="button" class="v14-kb-btn" onclick="v14KbToggle(this)">⌨️ Keyboard</button>' : '') + '</span>' +
      ' <span>' + esc(it.after || "") + '</span></p>' +
      '<p class="v14-sub">Ketik jawabanmu di kolom kosong. Tab berpindah kolom, Enter untuk mengirim jawaban.' + (LANGUAGE_CODE !== "en" ? ' Keyboard virtual ' + (LANGUAGE_CODE === "ko" ? "Hangul" : "Jepang") + ' muncul otomatis di bawah kolom — tanpa perlu mengubah pengaturan keyboard perangkatmu.' : '') + '</p>' +
      '<button type="submit" class="btn btn-primary">Kirim Jawaban</button></form>';
  } else {
    body += '<p class="v14-bigq">' + esc(it.q) + '</p><div class="v14-opts">' + it.opts.map(function(o, i){
      var spk = ""; try { spk = optionSpeakBtn(it.speak ? it.speak[i] : o); } catch(e){}
      return '<div class="option-row"><button type="button" class="option" id="v14-opt-' + i + '" onclick="v14AnswerMcq(' + i + ')">' + esc(o) + '</button>' + spk + '</div>';
    }).join("") + '</div>';
  }
  body += '<p id="v14-q-feedback" class="v14-feedback"></p><button type="button" id="v14-q-next" class="btn btn-primary" hidden onclick="v14NextQ()">' + (s.idx === total - 1 ? "Lihat Hasil 🏁" : "Lanjut →") + '</button></div>';
  v14ShowView(s.title, body);
  if (it.kind === "type"){
    var form = document.getElementById("v14-type-form");
    form.onsubmit = function(ev){ ev.preventDefault(); v14AnswerTyped(); };
    var inp = document.getElementById("v14-type-input");
    if (inp){ inp.focus(); if (LANGUAGE_CODE !== "en") v14KbShow(inp); }
  }
}
window.v14AnswerMcq = function(i){
  var s = V14_Q; if (!s || s.answered) return; s.answered = true;
  var it = s.questions[s.idx], ci = v16CorrectIdx(it), ok = i === ci;
  if (ok){ s.correct++; v14Xp(5); } else s.wrong++;
  it.opts.forEach(function(o, j){ var b = document.getElementById("v14-opt-" + j); if (b){ b.disabled = true; if (j === ci) b.classList.add("is-correct"); else if (j === i){ b.classList.add("is-wrong"); b.classList.add("is-picked"); } } });
  var fb = document.getElementById("v14-q-feedback");
  fb.textContent = (ok ? "✓ Benar! +5 XP. " : "✗ Belum tepat. Jawaban yang benar: " + it.opts[ci] + ". ") + (it.explain || "");
  document.getElementById("v14-q-next").hidden = false;
};
window.v14AnswerTyped = function(){
  var s = V14_Q; if (!s || s.answered) return;
  var inp = document.getElementById("v14-type-input"); if (!inp) return;
  var it = s.questions[s.idx], val = inp.value;
  var ok = v14Norm(val) === v14Norm(it.answerText);
  s.answered = true;
  if (ok){ s.correct++; v14Xp(5); } else s.wrong++;
  inp.disabled = true; inp.classList.add(ok ? "is-correct" : "is-wrong");
  v14KbHide();
  var fb = document.getElementById("v14-q-feedback");
  fb.textContent = (ok ? "✓ Benar! +5 XP. " : "✗ Belum tepat. Jawaban yang benar: “" + it.answerText + "”. ") + (it.explain || "");
  document.getElementById("v14-q-next").hidden = false;
  document.getElementById("v14-q-next").focus();
};
window.v14NextQ = function(){
  var s = V14_Q; if (!s) return;
  if (s.idx < s.questions.length - 1){ s.idx++; s.answered = false; v14RenderQ(); return; }
  var total = s.questions.length, pct = Math.round(s.correct / total * 100);
  v14CreditMinutes(5); recordStudyDay();
  var extra = s.onDone ? s.onDone(pct, s) : "";
  v14ShowView("Hasil — " + s.title, '<div class="v14-card v14-result"><p class="v14-emoji">' + (pct === 100 ? "🏆" : pct >= 60 ? "🎉" : "💪") + '</p><h3>' + esc(s.title) + ' selesai!</h3><p>✅ Benar: <b>' + s.correct + '</b> · ❌ Salah: <b>' + s.wrong + '</b> · Skor: <b>' + pct + '%</b></p>' + extra + '<div class="v14-actions"><button type="button" class="btn btn-primary" onclick="v14Go(\'home\')">Kembali ke Beranda</button></div></div>');
  V14_Q = null;
};
// ---------- Halaman: Kartu Hafalan SRS ----------
var V14_FLASH = null;
function v14PageFlash(){
  var code = LANGUAGE_CODE, deck = v14SrsDeck(code), now = Date.now();
  var saved = v14ls("ela_flash_session_" + code, null);
  var queue;
  if (saved && saved.date === v14Today() && saved.queue && saved.idx < saved.queue.length) queue = saved.queue.slice(saved.idx);
  else {
    var due = Object.keys(deck).filter(function(w){ return deck[w].due <= now; });
    var flat = v14FlatVocab(code), known = {};
    Object.keys(deck).forEach(function(w){ known[w] = 1; });
    var fresh = v14Shuffle(flat.filter(function(v){ return !known[v.w]; }), Date.now()).slice(0, Math.max(0, 10 - due.length)).map(function(v){ return v.w; });
    queue = due.concat(fresh);
  }
  if (!queue.length){ v14ShowView("Kartu Hafalan SRS", '<div class="v14-card"><h3>🎉 Tidak ada kartu jatuh tempo</h3><p>Semua kartu ' + esc(langName()) + ' sudah diulang. Tambahkan kata baru lewat tombol “⛏️ Tambah ke Hafalan” di Bacaan, atau tunggu jadwal ulang berikutnya.</p><button type="button" class="btn btn-primary" onclick="v14Go(\'bacaan\')">Ke Perpustakaan Bacaan</button></div>'); return; }
  V14_FLASH = { queue: queue, idx: 0, flipped: false };
  v14lsSet("ela_flash_session_" + code, { date: v14Today(), queue: queue, idx: 0 });
  v14RenderFlash();
}
function v14RenderFlash(){
  var code = LANGUAGE_CODE, f = V14_FLASH, flat = v14FlatVocab(code);
  var word = f.queue[f.idx], item = flat.find(function(v){ return v.w === word; }) || { w: word, id: "", ex: "", exId: "" };
  var front = '<div class="v14-flash"><p class="v14-sub">Kartu ' + (f.idx + 1) + ' dari ' + f.queue.length + ' · progres sesi tersimpan otomatis — bisa lanjut nanti</p><p class="v14-flash-word">' + esc(item.w) + '</p>' + (function(){ try { return ttsBtn(item.w, ttsLangForMode(), "🔊 Dengarkan"); } catch(e){ return ""; } })() + '<br><button type="button" class="btn btn-primary" onclick="v14FlashFlip()">Balik Kartu</button></div>';
  var back = '<div class="v14-flash"><p class="v14-flash-word">' + esc(item.w) + '</p><p class="v14-flash-id">' + esc(item.id) + '</p><p>Contoh: ' + esc(item.ex) + '<br><span class="translation">Artinya: ' + esc(item.exId) + '</span></p><p class="v14-sub">Nilai ingatanmu — tiap penilaian +10 XP:</p><div class="v14-rates">' + V14_SRS_RATES.map(function(r, i){ return '<button type="button" onclick="v14FlashRate(' + i + ')"><b>' + r.label + '</b><small>' + r.sub + '</small></button>'; }).join("") + '</div></div>';
  v14ShowView("Kartu Hafalan SRS — " + langName(), '<div class="v14-card">' + (f.flipped ? back : front) + '</div>');
}
window.v14FlashFlip = function(){ V14_FLASH.flipped = true; v14RenderFlash(); };
window.v14FlashRate = function(i){
  var code = LANGUAGE_CODE, f = V14_FLASH, word = f.queue[f.idx], r = V14_SRS_RATES[i];
  var deck = v14SrsDeck(code);
  deck[word] = { due: Date.now() + (r.days === 0 ? 60000 : r.days * 86400000), ivl: r.days };
  v14SrsSave(code, deck);
  v14Xp(10); v14CreditMinutes(1);
  f.idx++; f.flipped = false;
  v14lsSet("ela_flash_session_" + code, { date: v14Today(), queue: f.queue, idx: f.idx });
  if (f.idx >= f.queue.length){ v14ShowView("Kartu Hafalan SRS", '<div class="v14-card v14-result"><p class="v14-emoji">🎉</p><h3>Sesi hafalan selesai!</h3><p>' + f.queue.length + ' kartu dinilai. Kartu “Lupa” muncul lagi ±1 menit, “Sulit” 4 hari, “Ingat” 9 hari, “Mudah” 20 hari.</p><button type="button" class="btn btn-primary" onclick="v14Go(\'home\')">Kembali ke Beranda</button></div>'); V14_FLASH = null; return; }
  v14RenderFlash();
};

// ---------- Halaman: Perpustakaan Bacaan ----------
function v14Readings(code){
  var lessons = v14Lessons(code), vocab = v14VocabMap(code), seen = {}, out = [];
  lessons.forEach(function(l){ if (!seen[l.level]){ seen[l.level] = 1; out.push({ id: l.id, level: l.level, levelName: l.level_name, title: "Bacaan " + l.level + " — " + l.title, items: vocab[l.id] || [] }); } });
  return out;
}
function v14PageReadings(level){
  var all = v14Readings(LANGUAGE_CODE);
  var levels = ["Semua"].concat(all.map(function(r){ return r.level; }));
  var list = (!level || level === "Semua") ? all : all.filter(function(r){ return r.level === level; });
  var html = '<div class="v14-card"><p class="v14-sub">Artikel pendek per level dengan terjemahan inline, pertanyaan pemahaman, dan tombol ⛏️ mining kata baru menjadi kartu hafalan SRS.</p><div class="v14-filters">' +
    levels.map(function(lv){ return '<button type="button" class="' + (((level || "Semua") === lv) ? "on" : "") + '" onclick="v14Go(\'bacaan\',\'' + lv + '\')">' + lv + '</button>'; }).join("") + '</div>' +
    list.map(function(r){ return '<article class="v14-read-item"><h4>' + esc(r.title) + '</h4><p class="v14-sub">Level ' + r.level + ' · ' + esc(r.levelName) + ' · ' + r.items.length + ' kalimat inti + pertanyaan pemahaman</p><button type="button" class="btn btn-primary" onclick="v14Go(\'bacaan-detail\',\'' + r.id + '\')">Baca Sekarang</button></article>'; }).join("") + '</div>';
  v14ShowView("Perpustakaan Bacaan — " + langName(), html);
}
function v14PageReadingDetail(lessonId){
  var code = LANGUAGE_CODE, lessons = v14Lessons(code), lesson = lessons.find(function(l){ return l.id === lessonId; }) || lessons[0];
  var items = (v14VocabMap(code)[lesson.id] || []);
  var paras = items.map(function(v, i){
    var tb = ""; try { tb = ttsBtn(v.ex, ttsLangForMode(), "🔊"); } catch(e){}
    return '<p class="v14-read-line"><b>' + esc(v.ex) + '</b> ' + tb + '<br><span class="translation">' + esc(v.exId) + '</span> <button type="button" class="v14-mine" onclick="v14MineBtn(this,\'' + esc(v.w).replace(/'/g, "\\'") + '\')">⛏️ Tambah “' + esc(v.w) + '” ke Hafalan</button></p>';
  }).join("");
  var qs = items.slice(0, 3).map(function(v, i){ return { kind: "mcq", q: "Menurut bacaan di atas, apa arti kata “" + v.w + "”?", ctx: "Pertanyaan pemahaman bacaan “" + lesson.title + "”.", opts: null, _v: v }; });
  var flat = v14FlatVocab(code);
  qs.forEach(function(q, i){ var others = v14Shuffle(flat.filter(function(x){ return x.w !== q._v.w; }), Date.now() + i).slice(0, 3).map(function(o){ return o.id; }); q.opts = v14Shuffle([q._v.id].concat(others), i + 3); q.answer = q.opts.indexOf(q._v.id); q.speak = q.opts.map(function(o){ var f = flat.find(function(x){ return x.id === o; }); return f ? f.w : ""; }); q.explain = "Contoh: " + q._v.ex + " — Artinya: " + q._v.exId; delete q._v; });
  window.__v14ReadingQs = qs; window.__v14ReadingTitle = "Pemahaman Bacaan — " + lesson.title;
  v14ShowView("Bacaan — " + lesson.title, '<div class="v14-card"><p class="v14-sub">Level ' + lesson.level + ' · ' + esc(lesson.level_name) + ' · terjemahan inline di bawah tiap kalimat</p>' + paras + '<div class="v14-actions"><button type="button" class="btn btn-primary" onclick="v14RunQuiz(window.__v14ReadingTitle, window.__v14ReadingQs, function(){ v14CreditMinutes(5); return \'\'; })">Jawab Pertanyaan Pemahaman (3 soal)</button><button type="button" class="btn btn-ghost" onclick="v14Go(\'bacaan\')">← Semua Bacaan</button></div></div>');
}
window.v14MineBtn = function(btn, word){ v14MineWord(LANGUAGE_CODE, word); btn.textContent = "✓ Masuk Kartu Hafalan"; btn.disabled = true; v14RenderDaily(); };
// ---------- Halaman: Pusat Persiapan Ujian ----------
function v14PageExams(){
  var ex = V14_EXAMS[LANGUAGE_CODE];
  var html = '<div class="v14-card"><p class="v14-sub">Pusat persiapan ujian untuk ' + esc(langName()) + ' — tiap ujian punya bank simulasi + rencana belajar.</p>' + ex.map(function(e){
    return '<article class="v14-read-item"><h4>🎓 ' + esc(e.name) + '</h4><p>' + esc(e.plan) + '</p><button type="button" class="btn btn-primary" onclick="v14Go(\'ujian-mulai\',\'' + e.id + '\')">Mulai Simulasi ' + esc(e.name) + '</button></article>';
  }).join("") + '</div>';
  v14ShowView("Persiapan Ujian — " + langName(), html);
}
function v14StartExam(examId){
  var ex = V14_EXAMS[LANGUAGE_CODE].find(function(e){ return e.id === examId; }); if (!ex) return;
  var raw = null;
  if (ex.bank === "MOCK" && typeof MOCK_TESTS !== "undefined" && MOCK_TESTS.length) raw = MOCK_TESTS[0].questions;
  if (ex.bank === "TOPIK1" && typeof TOPIK1 !== "undefined") raw = TOPIK1;
  if (ex.bank === "TOPIK2" && typeof TOPIK2 !== "undefined") raw = TOPIK2;
  if (ex.bank === "EPS" && typeof EPS !== "undefined" && EPS.length && EPS[0].questions) raw = EPS[0].questions;
  if (raw){
    var qs = raw.slice(0, 10).map(function(q){ return { kind: "mcq", q: q[0], opts: q[1], answer: q[2], speak: q[1].slice(), explain: q[3] || "", ctx: "Simulasi " + ex.name + " — tiap jawaban benar +5 XP." }; });
    v14RunQuiz("Simulasi " + ex.name, qs, function(pct){ return '<p>' + esc(ex.plan) + '</p>'; });
    return;
  }
  var qs2 = v14BuildQuizSet(Date.now(), 10);
  v14RunQuiz("Simulasi " + ex.name, qs2, function(pct){ return '<p>' + esc(ex.plan) + '</p>'; });
}
// ---------- Tes Penempatan & Kuis Latihan ----------
function v14StartPlacement(){
  var qs = v14BuildQuizSet(Date.now(), 10);
  v14RunQuiz("Tes Penempatan — " + langName(), qs, function(pct){
    var lv = pct >= 85 ? "B2–C1 (lanjut — mulai dari modul B2)" : pct >= 65 ? "B1 (menengah — mulai dari modul B1)" : pct >= 45 ? "A2 (dasar kuat — mulai dari modul A2)" : pct >= 25 ? "A1 (pemula — mulai dari modul A1)" : "A0 (pemula mutlak — mulai dari modul A0)";
    return '<p><b>Hasil penempatanmu: Level ' + lv + '.</b> Ini perkiraan dari 10 soal campuran (pilihan ganda + isian ketik). Jalur modulmu tetap terbuka semua — mulai saja dari level hasil ini.</p>';
  });
}
function v14StartPractice(){
  var qs = v14BuildQuizSet(Date.now() + 99, 10);
  v14RunQuiz("Kuis Latihan — " + langName(), qs, null);
}
// ---------- Halaman koleksi & latihan lain (format sama 3 bahasa) ----------
function v14PageErrors(){
  var rows = V14_ERRORS[LANGUAGE_CODE].map(function(e){ return '<tr><td class="v14-wrong-cell">✗ ' + esc(e[0]) + '</td><td>✓ ' + esc(e[1]) + '</td><td>' + esc(e[2]) + '</td></tr>'; }).join("");
  v14ShowView("Kesalahan Umum — " + langName(), '<div class="v14-card"><p class="v14-sub">Kesalahan yang paling sering dilakukan pelajar Indonesia — dan bentuk benarnya.</p><table class="v14-table"><tr><th>Salah</th><th>Benar</th><th>Kenapa</th></tr>' + rows + '</table></div>');
}
function v14PageDictation(){
  var flat = v14FlatVocab(LANGUAGE_CODE);
  var v = flat[v14DayIdx() % flat.length];
  window.__v14Dict = v;
  var tb = ""; try { tb = ttsBtn(v.ex, ttsLangForMode(), "🔊 Dengarkan Kalimatnya"); } catch(e){}
  v14ShowView("Dikte — " + langName(), '<div class="v14-card"><p class="v14-sub">Dengarkan kalimatnya, lalu ketik KATA yang menjadi kosakata pelajaran di kalimat itu. Arti kalimatnya (petunjuk): “' + esc(v.exId) + '”</p><p>' + tb + '</p><form id="v14-dict-form"><span class="v14-typed-wrap"><input type="text" id="v14-dict-input" class="v14-typed" autocomplete="off" placeholder="ketik kata yang kamu dengar">' + (LANGUAGE_CODE !== "en" ? '<button type="button" class="v14-kb-btn" onclick="v14KbToggle(this)">⌨️ Keyboard</button>' : '') + '</span> <button type="submit" class="btn btn-primary">Periksa</button></form><p id="v14-dict-fb" class="v14-feedback"></p></div>');
  var f = document.getElementById("v14-dict-form");
  f.onsubmit = function(ev){ ev.preventDefault(); var val = document.getElementById("v14-dict-input").value; var ok = v14Norm(val) === v14Norm(v.w); var fb = document.getElementById("v14-dict-fb"); if (ok){ fb.textContent = "✓ Benar! +5 XP. Kalimatnya: " + v.ex; v14Xp(5); v14CreditMinutes(2); } else fb.textContent = "✗ Belum tepat. Kata yang benar: “" + v.w + "”. Kalimatnya: " + v.ex + " — Artinya: " + v.exId; };
  var inp = document.getElementById("v14-dict-input"); if (inp && LANGUAGE_CODE !== "en") inp.addEventListener("focus", function(){ v14KbShow(inp); });
}
function v14PageWriting(){
  var saved = v14ls("ela_writing_" + LANGUAGE_CODE, "");
  v14ShowView("Menulis — " + langName(), '<div class="v14-card"><p class="v14-sub">Pilih satu prompt, lalu tulis bebas. Tulisanmu tersimpan otomatis di perangkat ini.</p>' + V14_PROMPTS[LANGUAGE_CODE].map(function(p){ return '<p class="v14-prompt">✍️ ' + esc(p) + '</p>'; }).join("") + '<textarea id="v14-write-box" rows="8" placeholder="Tulis di sini...">' + esc(saved) + '</textarea><p class="v14-sub"><span id="v14-write-count">0</span> karakter · <span id="v14-write-saved">tersimpan</span></p></div>');
  var box = document.getElementById("v14-write-box"), cnt = document.getElementById("v14-write-count");
  cnt.textContent = box.value.length;
  box.addEventListener("input", function(){ cnt.textContent = box.value.length; v14lsSet("ela_writing_" + LANGUAGE_CODE, box.value); });
}
function v14PageConjug(){
  var rows = V14_CONJUG[LANGUAGE_CODE].map(function(c){ return '<tr><td><b>' + esc(c[0]) + '</b></td><td>' + esc(c[1]) + '</td><td>' + esc(c[2]) + '</td></tr>'; }).join("");
  v14ShowView("Konjugasi — " + langName(), '<div class="v14-card"><p class="v14-sub">Pola perubahan kata kerja yang paling sering dipakai.</p><table class="v14-table"><tr><th>Pola</th><th>Contoh</th><th>Penjelasan</th></tr>' + rows + '</table></div>');
}
function v14PageDialog(){
  var flat = v14FlatVocab(LANGUAGE_CODE).slice(0, 8);
  var lines = flat.map(function(v, i){ var tb = ""; try { tb = ttsBtn(v.ex, ttsLangForMode(), "🔊"); } catch(e){} return '<p class="v14-read-line"><b>' + (i % 2 ? "B: " : "A: ") + '</b>' + esc(v.ex) + ' ' + tb + '<br><span class="translation">' + esc(v.exId) + '</span></p>'; }).join("");
  v14ShowView("Dialog — " + langName(), '<div class="v14-card"><p class="v14-sub">Dialog latihan dari kalimat-kalimat pelajaran — dengarkan tiap baris dan tirukan.</p>' + lines + '</div>');
}
function v14PageGrammar(){
  var notes = (typeof curNotes === "function") ? curNotes() : [];
  var html = notes.map(function(n){ return '<details class="note-card"><summary>' + esc(n[0]) + '</summary><div class="note-body"><p>' + esc(n[1]) + '</p>' + (n[2] || []).map(function(e){ return '<p class="note-example"><b>' + esc(e[0]) + '</b>' + (e[1] ? '<br><span class="translation">Artinya: ' + esc(e[1]) + '</span>' : '') + '</p>'; }).join("") + '</div></details>'; }).join("");
  v14ShowView("Tata Bahasa — " + langName(), '<div class="v14-card"><p class="v14-sub">Semua catatan tata bahasa ' + esc(langName()) + ' dalam satu halaman.</p>' + html + '</div>');
}
function v14PageVocab(filter){
  var flat = v14FlatVocab(LANGUAGE_CODE);
  var list = filter ? flat.filter(function(v){ return (v.w + " " + v.id).toLowerCase().indexOf(String(filter).toLowerCase()) >= 0; }) : flat;
  v14ShowView("Kosakata — " + langName(), '<div class="v14-card"><p class="v14-sub">' + list.length + ' dari ' + flat.length + ' kata · tekan ⛏️ untuk memasukkan kata ke Kartu Hafalan SRS.</p>' + list.slice(0, 200).map(function(v){ return '<p class="v14-read-line"><b>' + esc(v.w) + '</b> — ' + esc(v.id) + ' <button type="button" class="v14-mine" onclick="v14MineBtn(this,\'' + esc(v.w).replace(/'/g, "\\'") + '\')">⛏️ Hafalan</button><br><span class="translation">' + esc(v.ex) + ' — ' + esc(v.exId) + '</span></p>'; }).join("") + '</div>');
}
function v14PageIdiom(){
  var items = [];
  if (LANGUAGE_CODE === "en" && typeof IDIOMS !== "undefined") items = IDIOMS.slice(0, 12).map(function(x){ return [x[0] || x.en || "", x[1] || x.id || ""]; });
  else if (LANGUAGE_CODE === "ko" && typeof KDRAMA !== "undefined") items = KDRAMA.slice(0, 12).map(function(x){ return [x[0] || "", x[1] || ""]; });
  if (!items.length || !items[0][0]) items = v14FlatVocab(LANGUAGE_CODE).slice(0, 8).map(function(v){ return [v.ex, v.exId]; });
  v14ShowView("Idiom & Bahasa Gaul — " + langName(), '<div class="v14-card"><p class="v14-sub">Ungkapan yang sering muncul di percakapan nyata, film, dan drama.</p>' + items.map(function(x){ return '<p class="v14-read-line"><b>' + esc(x[0]) + '</b><br><span class="translation">' + esc(x[1]) + '</span></p>'; }).join("") + '</div>');
}
function v14PageCulture(){
  v14ShowView("Budaya — " + langName(), '<div class="v14-card">' + V14_CULTURE[LANGUAGE_CODE].map(function(c){ return '<article class="v14-read-item"><h4>' + esc(c[0]) + '</h4><p>' + esc(c[1]) + '</p></article>'; }).join("") + '</div>');
}

// ---------- v14+: Grammar Pattern Rapi (bertahap per level) ----------
var V14_PATTERNS = {
  en: { "A0": [["be: am/is/are", "I am a student.", "Saya seorang pelajar."], ["a/an", "a book, an apple", "sebuah buku, sebuah apel"]],
        "A1": [["Present Simple", "She speaks English.", "Dia berbicara Bahasa Inggris."], ["Present Continuous", "I am reading now.", "Saya sedang membaca sekarang."]],
        "A2": [["Past Simple", "We visited Bali yesterday.", "Kami mengunjungi Bali kemarin."], ["Comparatives", "This book is cheaper.", "Buku ini lebih murah."]],
        "B1": [["Present Perfect", "I have finished my homework.", "Saya sudah menyelesaikan PR saya."], ["First Conditional", "If it rains, we stay home.", "Kalau hujan, kami di rumah saja."]],
        "B2": [["Passive Voice", "The bridge was built in 1990.", "Jembatan itu dibangun tahun 1990."], ["Reported Speech", "He said he was tired.", "Dia bilang dia lelah."]],
        "C1": [["Mixed Conditionals", "If you had called, I would be there now.", "Kalau dulu kamu menelepon, saya sudah di sana sekarang."], ["Inversion", "Never have I seen this.", "Belum pernah saya melihat ini."]],
        "C2": [["Subjunctive", "I suggest that he be present.", "Saya menyarankan agar dia hadir."], ["Cleft Sentences", "It was Ani who called.", "Anilah yang menelepon."]] },
  ko: { "A0": [["-이에요/예요 (adalah)", "저는 학생이에요.", "Saya adalah pelajar."], ["은/는 partikel topik", "저는 디디예요.", "Kalau saya, Didi."]],
        "A1": [["-아요/어요 (sekarang, sopan)", "학교에 가요.", "Saya pergi ke sekolah."], ["을/를 partikel objek", "책을 읽어요.", "Saya membaca buku."]],
        "A2": [["-았어요/었어요 (lampau)", "어제 갔어요.", "Kemarin (saya) pergi."], ["-고 (dan/lalu)", "먹고 가요.", "Makan dulu, lalu pergi."]],
        "B1": [["-(으)면 (kalau)", "시간이 있으면 가요.", "Kalau ada waktu, saya pergi."], ["-아/어 보다 (mencoba)", "먹어 보세요.", "Coba makanlah."]],
        "B2": [["-(으)니까 (karena)", "비가 오니까 택시를 타요.", "Karena hujan, naik taksi."], ["-는 것 같다 (sepertinya)", "비가 오는 것 같아요.", "Sepertinya hujan."]],
        "C1": [["-더라고요 (ternyata/setelah mengalami)", "직접 가 보니 좋더라고요.", "Setelah pergi sendiri, ternyata bagus."], ["-(으)ㄹ 뿐만 아니라 (tidak hanya)", "빠를 뿐만 아니라 정확해요.", "Tidak hanya cepat, tapi juga tepat."]],
        "C2": [["-(으)므로 (oleh karena itu, formal)", "늦었으므로 서둘러야 해요.", "Karena sudah terlambat, harus bergegas."], ["-기 마련이다 (sudah sewajarnya)", "노력하면 성공하기 마련이에요.", "Kalau berusaha, sudah sewajarnya berhasil."]] },
  ja: { "A0": [["〜です (adalah, sopan)", "私は学生です。", "Saya adalah pelajar."], ["は partikel topik", "私はディディです。", "Kalau saya, Didi."]],
        "A1": [["〜ます (sopan sekarang)", "学校へ行きます。", "Saya pergi ke sekolah."], ["を partikel objek", "本を読みます。", "Saya membaca buku."]],
        "A2": [["〜ました (sopan lampau)", "昨日行きました。", "Kemarin (saya) pergi."], ["〜て (penghubung)", "食べて行きます。", "Makan dulu, lalu pergi."]],
        "B1": [["〜たら (kalau/setelah)", "雨が降ったら、家にいます。", "Kalau hujan turun, saya di rumah."], ["〜たことがある (pernah)", "日本へ行ったことがあります。", "Saya pernah pergi ke Jepang."]],
        "B2": [["〜ば (jika)", "安ければ買います。", "Kalau murah, saya beli."], ["〜そうです (katanya/sepertinya)", "明日は雨だそうです。", "Katanya besok hujan."]],
        "C1": [["〜ざるを得ない (terpaksa harus)", "行かざるを得ません。", "Terpaksa harus pergi."], ["〜にもかかわらず (meskipun)", "雨にもかかわらず出かけました。", "Meskipun hujan, tetap berangkat."]],
        "C2": [["〜んばかりに (seolah-olah hampir)", "泣かんばかりの顔でした。", "Wajahnya seolah hampir menangis."], ["〜極まりない (sangat luar biasa)", "失礼極まりない態度でした。", "Sikapnya sangat tidak sopan sekali."]] }
};
function v14PageGrammar(){
  var code = LANGUAGE_CODE, levels = ["A0", "A1", "A2", "B1", "B2", "C1", "C2"];
  var pat = levels.map(function(lv){
    var rows = (V14_PATTERNS[code][lv] || []).map(function(p){ return '<tr><td><b>' + esc(p[0]) + '</b></td><td>' + esc(p[1]) + '</td><td>' + esc(p[2]) + '</td></tr>'; }).join("");
    return '<h4 class="v14-lvl-head">Level ' + lv + '</h4><table class="v14-table"><tr><th>Pola Grammar</th><th>Contoh</th><th>Artinya</th></tr>' + rows + '</table>';
  }).join("");
  var notes = (typeof curNotes === "function") ? curNotes() : [];
  var nh = notes.map(function(n){ return '<details class="note-card"><summary>' + esc(n[0]) + '</summary><div class="note-body"><p>' + esc(n[1]) + '</p></div></details>'; }).join("");
  v14ShowView("Grammar Pattern — " + langName(), '<div class="v14-card"><p class="v14-sub">Grammar Pattern Rapi: pola tata bahasa tersusun bertahap dan berurutan dari pemula sampai mahir (A0 → C2) — selesaikan satu level sebelum naik ke level berikutnya.</p>' + pat + '<h4 class="v14-lvl-head">Catatan Tata Bahasa Lengkap</h4>' + nh + '</div>');
}
// ---------- v14+: 500 Kata Inti ----------
function v14CoreWords(code){
  var out = [], seen = {};
  v14Lessons(code).forEach(function(l){ (v14VocabMap(code)[l.id] || []).forEach(function(v){ if (!seen[v[0]]){ seen[v[0]] = 1; out.push({ w: v[0], id: cleanIdText(v[1]), ex: v[2], exId: v[3], level: l.level }); } }); });
  if (code === "ko" && typeof KO_VOCAB !== "undefined") KO_VOCAB.forEach(function(v){ if (v && v[0] && !seen[v[0]]){ seen[v[0]] = 1; out.push({ w: v[0], id: cleanIdText(v[2] || v[1] || ""), ex: "", exId: "", level: "Inti" }); } });
  if (code === "en" && typeof VOCAB_SAMPLE !== "undefined") VOCAB_SAMPLE.forEach(function(v){ if (v && v[0] && !seen[v[0]]){ seen[v[0]] = 1; out.push({ w: v[0], id: cleanIdText(v[1] || ""), ex: "", exId: "", level: "Inti" }); } });
  return out.slice(0, 500);
}
function v14IsCore(code, word){ return v14CoreWords(code).some(function(v){ return v.w === word; }); }
function v14PageCore(){
  var code = LANGUAGE_CODE, core = v14CoreWords(code), deck = v14SrsDeck(code);
  var mastered = core.filter(function(v){ return deck[v.w] && deck[v.w].ivl >= 9; }).length;
  var pct = core.length ? Math.round(mastered / core.length * 100) : 0;
  v14ShowView("⭐ 500 Kata Inti — " + langName(), '<div class="v14-card"><p class="v14-sub">80% percakapan sehari-hari hanya memakai ±500 kata paling sering. Daftar inti ' + esc(langName()) + ' di DidiGo saat ini: <b>' + core.length + ' kata</b> (diurutkan dari yang paling dasar/paling sering dipakai). Sudah kamu kuasai (nilai SRS “Ingat/Mudah”): <b>' + mastered + ' kata (' + pct + '%)</b>.</p><div class="v14-bar"><span style="width:' + pct + '%"></span></div><div class="v14-actions"><button type="button" class="btn btn-primary" onclick="v14StartCoreQuiz()">▶ Latihan 500 Kata Inti (10 soal)</button><button type="button" class="btn btn-ghost" onclick="v14Go(\'flash\')">Ulangi via Kartu Hafalan</button></div>' +
    core.slice(0, 120).map(function(v){ return '<p class="v14-read-line">⭐ <b>' + esc(v.w) + '</b> — ' + esc(v.id) + ' <span class="v14-tag">' + esc(v.level) + '</span> <button type="button" class="v14-mine" onclick="v14MineBtn(this,\'' + esc(v.w).replace(/'/g, "\\'") + '\')">⛏️ Hafalan</button></p>'; }).join("") + (core.length > 120 ? '<p class="v14-sub">…dan ' + (core.length - 120) + ' kata inti lainnya — semuanya muncul berurutan di modul & kartu hafalan.</p>' : '') + '</div>');
}
window.v14StartCoreQuiz = function(){
  var core = v14CoreWords(LANGUAGE_CODE);
  var picked = v14Shuffle(core, Date.now()).slice(0, 10);
  var qs = picked.map(function(v, i){ if (i % 3 === 2){ var t = v14TypedFromVocab(v, core); if (t && v.ex) return t; } return v14McqFromVocab(v, core, Date.now() + i * 11, i % 2 ? "target" : "id"); });
  v14RunQuiz("Latihan 500 Kata Inti — " + langName(), qs, null);
};
// ---------- v14+: Target Bulan Ini ----------
var V14_ABILITY = { "A0": "bisa salam, perkenalan diri sederhana & angka", "A1": "bisa perkenalan diri & tanya arah", "A2": "bisa belanja, pesan makanan & cerita kegiatan sehari-hari", "B1": "bisa cerita pengalaman & rencana, dan menjelaskan pendapat sederhana", "B2": "bisa diskusi topik umum & memahami inti berita/film", "C1": "bisa presentasi & argumen terstruktur", "C2": "bisa berbicara nyaris seperti penutur asli di topik spesialis" };
function v14RenderTarget(){
  var host = document.getElementById("v14-target"); if (!host) return;
  var code = LANGUAGE_CODE, lessons = v14Lessons(code), done = doneIds();
  var doneCount = lessons.filter(function(l){ return done.includes(l.id); }).length;
  var nextLv = "A0"; for (var i = 0; i < lessons.length; i++){ if (!done.includes(lessons[i].id)){ nextLv = lessons[i].level; break; } if (i === lessons.length - 1) nextLv = "C2"; }
  var core = v14CoreWords(code), deck = v14SrsDeck(code);
  var mastered = core.filter(function(v){ return deck[v.w] && deck[v.w].ivl >= 9; }).length;
  var monthName = new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  host.innerHTML = '<section class="v14-card v14-target-card"><h3>🎯 Target Bulan Ini (' + monthName + ') — ' + esc(langName()) + '</h3>' +
    '<p>Modul selesai: <b>' + doneCount + ' / ' + lessons.length + '</b> · target bulan ini: selesaikan <b>6 modul berikutnya</b> (sekarang di level ' + nextLv + ').</p>' +
    '<p>Kata inti dikuasai: <b>' + mastered + ' kata</b> · target bulan ini: <b>+40 kata inti</b> lewat Kartu Hafalan SRS.</p>' +
    '<p class="v14-ability">Estimasi kemampuan akhir bulan ini: <b>bisa ' + (V14_ABILITY[nextLv] || "") + '</b>.</p>' +
    '<p class="v14-sub">Target terukur ini ter-update otomatis dari progres modul & hafalanmu.</p></section>';
}

// ---------- Isian Ketik di Kuis Modul (membungkus buildQuestions/showQ v13) ----------
(function(){
  var origBuild = buildQuestions;
  buildQuestions = function(lesson){
    var qs = origBuild(lesson);
    var vocab = (typeof curVocab === "function" && curVocab()[lesson.id]) || [];
    [2, 3].forEach(function(qi){
      var v = vocab[qi]; if (!v || !qs[qi]) return;
      var blanked = blankOut(v[2], v[0]); if (blanked === v[2]) return;
      qs[qi] = { type: "type", ctx: "Isian ketik — konteks (arti kalimat lengkap): " + v[3] + ". Kata yang hilang artinya: " + cleanIdText(v[1]) + ".",
        q: "Lengkapi kalimat ini: " + blanked, before: blanked.split("___")[0], after: blanked.split("___")[1] || "",
        translation: "Contoh: " + v[2] + " — Artinya: " + v[3], answerText: v[0], full: v[2], full_id: v[3], opts: [] };
    });
    return qs;
  };
  var origShowQ = showQ;
  showQ = function(){
    var s = quizState; if (!s || !s.questions[s.idx] || s.questions[s.idx].type !== "type"){ origShowQ(); return; }
    var item = s.questions[s.idx], total = s.questions.length;
    s.answered = false;
    $("quiz-title").textContent = s.lesson.title;
    $("quiz-counter").textContent = "Soal " + (s.idx + 1) + " dari " + total;
    $("quiz-live-score").textContent = "✅ Benar: " + s.correct + " · ❌ Salah: " + s.wrong;
    $("quiz-progress-fill").style.width = Math.round(s.idx / total * 100) + "%";
    $("quiz-context").innerHTML = "<div class=\"context\"><b>Konteks — baca dulu sebelum menjawab</b><br>" + esc(item.ctx) + "</div>" + (item.full ? "<p class=\"tts-line\">" + ttsBtn(item.full, ttsLangForMode(), "🔊 Dengarkan kalimat contoh") + "</p>" : "");
    $("quiz-q").innerHTML = "";
    var qEl = $("quiz-q");
    qEl.innerHTML = '<span>' + esc(item.before) + '</span> <span class="v14-typed-wrap"><input type="text" id="quiz-type-input" class="v14-typed" autocomplete="off" autocapitalize="none" placeholder="ketik di sini">' + (LANGUAGE_CODE !== "en" ? '<button type="button" class="v14-kb-btn" onclick="v14KbToggle(this)">⌨️ Keyboard</button>' : '') + '</span> <span>' + esc(item.after) + '</span>';
    renderExampleLine($("quiz-translation"), item.translation || "");
    $("quiz-feedback").textContent = "Ketik jawabanmu di kolom kosong, lalu tekan Enter atau tombol Kirim." + (LANGUAGE_CODE !== "en" ? " Keyboard virtual muncul otomatis di bawah kolom." : "");
    $("quiz-next").hidden = true;
    $("quiz-options").innerHTML = '<form id="quiz-type-form"><button type="submit" class="btn btn-primary">Kirim Jawaban</button></form>';
    var form = document.getElementById("quiz-type-form");
    form.onsubmit = function(ev){ ev.preventDefault(); window.answerTypedLesson(); };
    var inp = document.getElementById("quiz-type-input");
    if (inp){ inp.focus(); if (LANGUAGE_CODE !== "en") v14KbShow(inp); }
  };
  window.answerTypedLesson = function(){
    var s = quizState; if (!s || s.answered || s.finished) return;
    var item = s.questions[s.idx], inp = document.getElementById("quiz-type-input"); if (!inp) return;
    var ok = v14Norm(inp.value) === v14Norm(item.answerText);
    s.answered = true; if (ok) s.correct++; else s.wrong++;
    inp.disabled = true; inp.classList.add(ok ? "is-correct" : "is-wrong"); v14KbHide();
    $("quiz-feedback").textContent = ok ? "✓ Benar! Kalimat lengkapnya: " + item.full + " (" + item.full_id + ")" : "✗ Belum tepat. Jawaban yang benar: " + item.answerText + ". Kalimat lengkapnya: " + item.full + " (" + item.full_id + ")";
    revealExampleMeaning($("quiz-translation"));
    $("quiz-live-score").textContent = "✅ Benar: " + s.correct + " · ❌ Salah: " + s.wrong;
    $("quiz-progress-fill").style.width = Math.round((s.idx + 1) / s.questions.length * 100) + "%";
    $("quiz-next").textContent = (s.idx === s.questions.length - 1) ? "Lihat Hasil 🏁" : "Lanjut →";
    $("quiz-next").hidden = false;
  };
  // Aturan 70%: modul hanya ditandai selesai bila skor >= 70%
  var origFinish = finishLesson;
  finishLesson = async function(){
    var s = quizState, total = s && s.questions ? s.questions.length : 0;
    var pct = total ? Math.round(s.correct / total * 100) : 0;
    await origFinish();
    v14CreditMinutes(10);
    if (pct < 70 && s && s.lesson){
      try { var d = doneIds().filter(function(x){ return x !== s.lesson.id; }); localStorage.setItem("ela_completed_" + LANGUAGE_CODE, JSON.stringify(d)); renderLessons(); renderPanels(); } catch(e){}
      var rl = $("result-lesson"); if (rl) rl.textContent += " ⚠️ Skor " + pct + "% belum mencapai syarat 70% — modul ini BELUM ditandai selesai. Kerjakan lagi sampai minimal 70% benar ya!";
      var rt = $("result-title"); if (rt) rt.textContent = "Hampir! Skor di bawah 70%";
    }
  };
  // Panel pelajaran: Awas Jebakan + Formal vs Santai + Cek Mandiri
  var origStart = window.startLesson;
  window.startLesson = function(id){
    origStart(id);
    var lesson = curLessons().find(function(l){ return l.id === id; }); if (!lesson) return;
    var lv = document.getElementById("lesson-view"); if (!lv) return;
    var old = document.getElementById("v14-lesson-panels"); if (old) old.remove();
    var code = LANGUAGE_CODE;
    var trap = V14_TRAPS[code].map(function(t){ return '<div class="v14-trap"><b>⚠️ ' + esc(t[0]) + '</b><p>' + esc(t[1]) + '</p></div>'; }).join("");
    var formal = '<table class="v14-table"><tr><th>Gaya</th><th>Contoh</th><th>Artinya</th></tr>' + V14_FORMAL[code].map(function(f){ return '<tr><td><b>' + esc(f[0]) + '</b></td><td>' + esc(f[1]) + '</td><td>' + esc(f[2]) + '</td></tr>'; }).join("") + '</table>';
    var vocab = (curVocab()[lesson.id] || []);
    var checks = vocab.map(function(v){ return '<label class="v14-check"><input type="checkbox"> Saya bisa memakai kata “' + esc(v[0]) + '” (' + esc(cleanIdText(v[1])) + ') dalam kalimat.</label>'; }).join("");
    var div = document.createElement("div"); div.id = "v14-lesson-panels"; div.className = "v14-lesson-panels";
    div.innerHTML = '<section class="v14-card"><h3>⚠️ Awas Jebakan</h3>' + trap + '</section><section class="v14-card"><h3>🎩 Formal vs Santai</h3>' + formal + '</section><section class="v14-card"><h3>🪞 Coba Cek, Udah Nyantol Belum?</h3><p class="v14-sub">Centang jujur sebelum/sesudah kuis modul. Kuis modul di atas wajib minimal <b>70% benar</b> supaya modul ditandai selesai.</p>' + checks + '</section>';
    var qb = document.getElementById("quiz-box");
    if (qb && qb.parentNode) qb.parentNode.insertBefore(div, qb); else lv.appendChild(div);
  };
})();
// ---------- Sidebar + Pencarian + Halaman v14 (dibangun sekali) ----------
(function(){
  var aside = document.createElement("aside"); aside.id = "v14-sidebar"; aside.className = "v14-sidebar";
  aside.innerHTML = '<nav>' +
    '<p class="v14-nav-h">HARI INI</p><button type="button" onclick="v14Go(\'home\')">🗓️ Sesi Hari Ini</button><button type="button" onclick="v14Go(\'home\')">🏠 Beranda</button>' +
    '<p class="v14-nav-h">JALUR</p><button type="button" onclick="v14Go(\'modul\')">🧩 Jalur Belajar</button><button type="button" onclick="v14Go(\'penempatan\')">🎯 Tes Penempatan</button><button type="button" onclick="v14Go(\'ujian\')">🎓 Persiapan Ujian</button>' +
    '<p class="v14-nav-h">LATIHAN</p><button type="button" onclick="v14Go(\'flash\')">🃏 Kartu Hafalan</button><button type="button" onclick="v14Go(\'latihan\')">✍️ Kuis Latihan</button><button type="button" onclick="v14Go(\'kesalahan\')">🚫 Kesalahan Umum</button><button type="button" onclick="v14Go(\'dikte\')">🎧 Dikte</button><button type="button" onclick="v14Go(\'menulis\')">📝 Menulis</button><button type="button" onclick="v14Go(\'konjugasi\')">🔀 Konjugasi</button><button type="button" onclick="v14Go(\'inti\')">⭐ 500 Kata Inti</button>' +
    '<p class="v14-nav-h">KOLEKSI</p><button type="button" onclick="v14Go(\'bacaan\')">📖 Bacaan</button><button type="button" onclick="v14Go(\'dialog\')">💬 Dialog</button><button type="button" onclick="v14Go(\'grammar\')">📐 Tata Bahasa</button><button type="button" onclick="v14Go(\'kosakata\')">🔤 Kosakata</button><button type="button" onclick="v14Go(\'idiom\')">🗣️ Idiom & Bahasa Gaul</button><button type="button" onclick="v14Go(\'budaya\')">🌏 Budaya</button><button type="button" id="v14-nav-writing" onclick="v14Go(\'menulis-huruf\')">✏️ Menulis & Mengucapkan</button></nav>';
  document.body.insertBefore(aside, document.body.firstChild);
  document.body.classList.add("v14-has-sidebar");
  // Pencarian di bar atas
  var tb = document.querySelector(".topbar-inner");
  if (tb){ var sd = document.createElement("div"); sd.className = "v14-search"; sd.innerHTML = '<input type="search" id="v14-search-input" placeholder="🔍 Cari modul atau kosakata..." aria-label="Cari modul atau kosakata"><div id="v14-search-results" class="v14-search-results" hidden></div>'; tb.appendChild(sd);
    var inp = sd.querySelector("#v14-search-input");
    inp.addEventListener("input", function(){
      var q = inp.value.trim().toLowerCase(), box = document.getElementById("v14-search-results");
      if (q.length < 2){ box.hidden = true; return; }
      var lh = v14Lessons(LANGUAGE_CODE).filter(function(l){ return l.title.toLowerCase().indexOf(q) >= 0; }).slice(0, 4).map(function(l){ return '<button type="button" onclick="window.startLesson(\'' + l.id + '\')">🧩 Jalur: ' + esc(l.title) + ' (' + l.level + ')</button>'; }).join("");
      var vh = v14FlatVocab(LANGUAGE_CODE).filter(function(v){ return (v.w + " " + v.id).toLowerCase().indexOf(q) >= 0; }).slice(0, 5).map(function(v){ return '<button type="button" onclick="v14Go(\'kosakata\',\'' + esc(v.w).replace(/'/g, "") + '\')">🔤 ' + esc(v.w) + ' — ' + esc(v.id) + '</button>'; }).join("");
      box.innerHTML = lh + vh || '<p class="v14-sub">Tidak ditemukan.</p>'; box.hidden = false;
    });
  }
  // Wadah sesi harian + target di beranda
  var home = document.getElementById("home-view");
  if (home){ var wrap = document.createElement("div"); wrap.id = "v14-home-wrap"; wrap.innerHTML = '<div id="v14-target"></div><div id="v14-daily"></div>'; var hero = home.querySelector(".hero"); if (hero && hero.nextSibling) home.insertBefore(wrap, hero.nextSibling); else home.insertBefore(wrap, home.firstChild); }
  // Halaman generik v14
  var main = document.createElement("section"); main.id = "v14-view"; main.className = "v14-view"; main.hidden = true;
  main.innerHTML = '<div class="v14-view-head"><button type="button" class="btn btn-ghost" onclick="v14Go(\'home\')">← Kembali</button><h2 id="v14-title"></h2></div><div id="v14-body"></div>';
  document.body.appendChild(main);
  var _go = window.v14Go;
  window.v14Go = function(page, arg){ if (page === "inti") return v14PageCore(); return _go(page, arg); };
  var navW = document.getElementById("v14-nav-writing"); if (navW) navW.hidden = !(LANGUAGE_CODE === "ko" || LANGUAGE_CODE === "ja");
  v14RenderDaily(); v14RenderTarget();
  var origApply = applyLanguage;
  applyLanguage = function(code){ origApply(code); var nw = document.getElementById("v14-nav-writing"); if (nw) nw.hidden = !(LANGUAGE_CODE === "ko" || LANGUAGE_CODE === "ja"); v14RenderDaily(); v14RenderTarget(); var v = document.getElementById("v14-view"); if (v) v.hidden = true; };
})();

// ---------- v14+: Dialog Situasional ----------
var V14_DIALOGS = {
  en: [["Perkenalan", [["Hello, my name is Didi. Nice to meet you.", "Halo, nama saya Didi. Senang bertemu denganmu."], ["Nice to meet you too. Where are you from?", "Senang bertemu juga. Kamu dari mana?"], ["I am from Indonesia. I am learning English.", "Saya dari Indonesia. Saya sedang belajar Bahasa Inggris."], ["Welcome! How long will you stay here?", "Selamat datang! Berapa lama kamu tinggal di sini?"]]],
       ["Di Kafe", [["Can I have a cup of coffee, please?", "Boleh minta secangkir kopi?"], ["Would you like it hot or iced?", "Mau yang panas atau dingin (es)?"], ["Iced, please. And one slice of cake.", "Yang es, ya. Dan satu potong kue."], ["That will be five dollars.", "Totalnya lima dolar."]]],
       ["Tanya Arah", [["Excuse me, where is the station?", "Permisi, stasiunnya di mana?"], ["Go straight, then turn left at the bank.", "Jalan lurus, lalu belok kiri di bank."], ["Is it far from here?", "Jauh tidak dari sini?"], ["No, about five minutes on foot.", "Tidak, sekitar lima menit jalan kaki."]]],
       ["Belanja", [["How much is this bag?", "Tas ini harganya berapa?"], ["It is twenty dollars.", "Harganya dua puluh dolar."], ["Can I get a discount?", "Bisa dapat diskon?"], ["Sure, fifteen dollars for you.", "Boleh, lima belas dolar untukmu."]]]],
  ko: [["Perkenalan", [["안녕하세요, 저는 디디예요. 만나서 반가워요.", "Halo, saya Didi. Senang bertemu denganmu."], ["반가워요. 어디에서 왔어요?", "Senang bertemu juga. Kamu dari mana?"], ["인도네시아에서 왔어요. 한국어를 배우고 있어요.", "Saya dari Indonesia. Saya sedang belajar Bahasa Korea."], ["환영해요! 여기 얼마나 있을 거예요?", "Selamat datang! Akan tinggal berapa lama di sini?"]]],
       ["Di Kafe", [["커피 한 잔 주세요.", "Tolong secangkir kopi."], ["따뜻한 거요, 아이스요?", "Yang hangat atau yang es?"], ["아이스로 주세요. 그리고 케이크 한 조각요.", "Yang es, ya. Dan sepotong kue."], ["오천 원입니다.", "Totalnya lima ribu won."]]],
       ["Tanya Arah", [["실례합니다, 역이 어디예요?", "Permisi, stasiunnya di mana?"], ["쭉 가서 은행에서 왼쪽으로 가세요.", "Jalan lurus, lalu belok kiri di bank."], ["여기에서 멀어요?", "Jauh tidak dari sini?"], ["아니요, 걸어서 오 분쯤 걸려요.", "Tidak, sekitar lima menit jalan kaki."]]],
       ["Belanja", [["이 가방 얼마예요?", "Tas ini harganya berapa?"], ["이만 원이에요.", "Harganya dua puluh ribu won."], ["할인해 주실 수 있어요?", "Bisa kasih diskon?"], ["그럼 만 오천 원에 드릴게요.", "Kalau begitu lima belas ribu won saja."]]]],
  ja: [["Perkenalan", [["こんにちは、私はディディです。よろしくお願いします。", "Halo, saya Didi. Mohon bantuannya (salam kenal)."], ["よろしくお願いします。どちらからですか。", "Salam kenal juga. Kamu dari mana?"], ["インドネシアから来ました。日本語を勉強しています。", "Saya datang dari Indonesia. Saya sedang belajar Bahasa Jepang."], ["ようこそ！どのくらい滞在しますか。", "Selamat datang! Akan tinggal berapa lama?"]]],
       ["Di Kafe", [["コーヒーを一杯ください。", "Tolong secangkir kopi."], ["温かいのと冷たいの、どちらにしますか。", "Mau yang hangat atau yang dingin?"], ["冷たいのをください。それとケーキを一つ。", "Yang dingin, ya. Dan satu kue."], ["五百円です。", "Totalnya lima ratus yen."]]],
       ["Tanya Arah", [["すみません、駅はどこですか。", "Permisi, stasiunnya di mana?"], ["まっすぐ行って、銀行で左に曲がってください。", "Jalan lurus, lalu belok kiri di bank."], ["ここから遠いですか。", "Jauh tidak dari sini?"], ["いいえ、歩いて五分くらいです。", "Tidak, sekitar lima menit jalan kaki."]]],
       ["Belanja", [["このバッグはいくらですか。", "Tas ini harganya berapa?"], ["二千円です。", "Harganya dua ribu yen."], ["安くなりますか。", "Bisa lebih murah?"], ["では、千五百円でどうですか。", "Kalau begitu, bagaimana kalau seribu lima ratus yen?"]]]]
};
function v14PageSituations(){
  var sits = V14_DIALOGS[LANGUAGE_CODE];
  var html = sits.map(function(s){
    return '<article class="v14-card"><h4>💬 ' + esc(s[0]) + '</h4>' + s[1].map(function(line, i){
      var tb = ""; try { tb = ttsBtn(line[0], ttsLangForMode(), "🔊 Dengarkan"); } catch(e){}
      return '<p class="v14-read-line"><b>' + (i % 2 ? "B: " : "A: ") + '</b>' + esc(line[0]) + ' ' + tb + '<br><span class="v14-situ-id" hidden>Artinya: ' + esc(line[1]) + '</span> <button type="button" class="v14-mine" onclick="v14SituToggle(this)">👁️ Lihat Artinya</button></p>';
    }).join("") + '</article>';
  }).join("");
  v14ShowView("Dialog Situasional — " + langName(), '<div class="v14-card"><p class="v14-sub">Dialog percakapan nyata per situasi. Artinya tersembunyi dulu — tebak dulu, tekan 👁️ Lihat Artinya kalau tidak tahu. Dengarkan tiap baris lalu tirukan (shadowing)!</p></div>' + html);
}
window.v14SituToggle = function(btn){
  var span = btn.parentNode.querySelector(".v14-situ-id"); if (!span) return;
  span.hidden = !span.hidden;
  btn.textContent = span.hidden ? "👁️ Lihat Artinya" : "🙈 Sembunyikan Artinya";
};
// ---------- v14+: Cheat Sheet / Referensi Cepat ----------
var V14_CHEAT = {
  en: [["Tenses Inti", "Present Simple (kebiasaan): I work. · Present Continuous (sedang): I am working. · Past Simple (lampau selesai): I worked yesterday. · Present Perfect (sudah, terkait kini): I have worked here for 2 years. · Future: I will work tomorrow."],
       ["Irregular Verbs", "go–went–gone · speak–spoke–spoken · eat–ate–eaten · see–saw–seen · take–took–taken · write–wrote–written · buy–bought–bought · think–thought–thought."],
       ["a vs an", "Ikuti BUNYI awal: a university (yu), an hour (h tidak dibaca), an apple, a house."],
       ["Preposisi Waktu", "at = jam/titik (at 7, at night) · on = hari/tanggal (on Monday) · in = bulan/tahun/bagian hari (in June, in the morning)."]],
  ko: [["Partikel Inti", "은/는 topik · 이/가 subjek · 을/를 objek · 에 ke/di (waktu & tujuan) · 에서 di (tempat kegiatan) · (으)로 dengan/arah · 의 milik · 와/과 dan (formal) · 하고 dan (sehari-hari) · 도 juga · 만 hanya."],
       ["Konjugasi A1–A2", "Sekarang sopan: -아요/어요 (가요, 먹어요) · Lampau: -았어요/었어요 · Ingin: -고 싶어요 · Coba: -아/어 보다 · Larangan: -지 마세요."],
       ["Aturan Pelafalan", "ㄱ di awal bunyi g, di akhir k · ㄹ di awal r, di antara vokal r, di akhir l · ㅇ di awal tidak berbunyi, di akhir -ng · 받침 ㅎ sering melemah/hilang (좋아요 dibaca 조아요)."],
       ["Angka", "Asli (하나 둘 셋) untuk umur/jumlah benda + kata bantu; Sino (일 이 삼) untuk uang, tanggal, nomor telepon."]],
  ja: [["Partikel Inti", "は topik (dibaca wa) · が subjek · を objek (dibaca o) · に di/ke (waktu & tujuan) · へ ke (arah, dibaca e) · で di (tempat kegiatan/alat) · の milik · と dan/dengan · も juga · から dari · まで sampai."],
       ["Konjugasi -ます", "Sekarang sopan: -ます (行きます) · Lampau: -ました · Negatif: -ません · Lampau negatif: -ませんでした · Ingin: -たいです."],
       ["Pola Kalimat Dasar", "AはBです (A adalah B) · AはBを〜ます (A melakukan B) · AはBが好きです (A suka B) · AにBがあります (di A ada B)."],
       ["Angka & Kata Bantu Bilangan", "いち に さん (1-3) · orang: 一人 (hitori), 二人 (futari), 三人 (sannin) · benda panjang: 本 (hon) · benda pipih: 枚 (mai)."]]
};
function v14PageCheat(){
  v14ShowView("Cheat Sheet — " + langName(), '<div class="v14-card"><p class="v14-sub">Referensi cepat ' + esc(langName()) + ' — ringkas untuk dibuka kapan pun dari sidebar Koleksi.</p>' + V14_CHEAT[LANGUAGE_CODE].map(function(c){ return '<article class="v14-read-item"><h4>' + esc(c[0]) + '</h4><p>' + esc(c[1]) + '</p></article>'; }).join("") + '</div>');
}
// ---------- v14+: Latihan Speaking / Shadowing ----------
var V14_SPK = { rec: null, chunks: [], stream: null };
function v14PageSpeaking(){
  var flat = v14FlatVocab(LANGUAGE_CODE);
  var v = flat[v14DayIdx() % flat.length];
  window.__v14SpkTarget = v;
  var tb = ""; try { tb = ttsBtn(v.ex, ttsLangForMode(), "🔊 Dengarkan Contoh"); } catch(e){}
  v14ShowView("Latihan Speaking / Shadowing — " + langName(),
    '<div class="v14-card"><p class="v14-sub">Shadowing: dengarkan contohnya, lalu tirukan berulang kali sampai mirip. Rekam suaramu dan putar lagi untuk membandingkan.</p>' +
    '<p class="v14-flash-word" style="font-size:1.5rem">' + esc(v.ex) + '</p><p class="translation">Artinya: ' + esc(v.exId) + '</p><p>' + tb + '</p>' +
    '<div class="v14-actions"><button type="button" class="btn btn-primary" id="v14-rec-btn" onclick="v14RecToggle()">🎙️ Rekam Suara Saya</button>' +
    '<button type="button" class="btn btn-ghost" id="v14-rec-play" hidden onclick="v14RecPlay()">▶ Putar Rekaman</button>' +
    '<button type="button" class="btn btn-ghost" onclick="v14SpeechScore()">📊 Nilai Tiruanku (otomatis)</button></div>' +
    '<audio id="v14-rec-audio" controls hidden style="width:100%;margin-top:10px"></audio>' +
    '<div id="v14-spk-result"></div>' +
    '<p class="v14-sub">ℹ️ Jujur ya: penilaian di halaman ini adalah penilaian OTOMATIS SEDERHANA — teks yang dikenali dari suaramu dibandingkan kata per kata dengan teks target. Ini bukan penilaian AI penuh dan tidak menilai intonasi/aksen secara detail.</p></div>');
}
window.v14RecToggle = async function(){
  var btn = document.getElementById("v14-rec-btn");
  if (V14_SPK.rec && V14_SPK.rec.state === "recording"){ V14_SPK.rec.stop(); btn.textContent = "🎙️ Rekam Suara Saya"; return; }
  if (!navigator.mediaDevices || typeof MediaRecorder === "undefined"){ document.getElementById("v14-spk-result").innerHTML = '<p class="v14-feedback">Browser ini tidak mendukung perekaman (MediaRecorder). Coba Chrome/Edge terbaru, atau latih shadowing tanpa rekaman: dengarkan → tirukan keras-keras → nilai dengan tombol Nilai Tiruanku bila pengenalan suara tersedia.</p>'; return; }
  try {
    V14_SPK.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    V14_SPK.chunks = [];
    V14_SPK.rec = new MediaRecorder(V14_SPK.stream);
    V14_SPK.rec.ondataavailable = function(e){ if (e.data.size) V14_SPK.chunks.push(e.data); };
    V14_SPK.rec.onstop = function(){ var blob = new Blob(V14_SPK.chunks, { type: "audio/webm" }); V14_SPK.url = URL.createObjectURL(blob); var a = document.getElementById("v14-rec-audio"); a.src = V14_SPK.url; a.hidden = false; document.getElementById("v14-rec-play").hidden = false; V14_SPK.stream.getTracks().forEach(function(t){ t.stop(); }); };
    V14_SPK.rec.start(); btn.textContent = "⏹️ Berhenti Merekam";
  } catch(e){ document.getElementById("v14-spk-result").innerHTML = '<p class="v14-feedback">Mikrofon tidak bisa diakses. Izinkan akses mikrofon di browser, lalu coba lagi.</p>'; }
};
window.v14RecPlay = function(){ var a = document.getElementById("v14-rec-audio"); if (a) a.play(); };
window.v14SpeechScore = function(){
  var target = window.__v14SpkTarget; if (!target) return;
  var res = document.getElementById("v14-spk-result");
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR){ res.innerHTML = '<p class="v14-feedback">Pengenalan suara (SpeechRecognition) tidak tersedia di browser ini, jadi penilaian otomatis belum bisa jalan. Kamu tetap bisa membandingkan sendiri: putar rekamanmu bergantian dengan 🔊 Dengarkan Contoh, lalu ulangi sampai mirip.</p>'; return; }
  var rec = new SR();
  rec.lang = LANGUAGE_CODE === "ko" ? "ko-KR" : LANGUAGE_CODE === "ja" ? "ja-JP" : "en-US";
  rec.interimResults = false; rec.maxAlternatives = 1;
  res.innerHTML = '<p class="v14-feedback">🎙️ Mendengarkan... ucapkan kalimat target sekarang.</p>';
  rec.onresult = function(ev){
    var said = ev.results[0][0].transcript || "";
    var tWords = v14Norm(target.ex).split(" ").filter(Boolean), sWords = v14Norm(said).split(" ").filter(Boolean);
    var hit = tWords.filter(function(wd){ return sWords.indexOf(wd) >= 0; }).length;
    var pct = tWords.length ? Math.round(hit * 100 / tWords.length) : 0;
    var missed = tWords.filter(function(wd){ return sWords.indexOf(wd) < 0; });
    res.innerHTML = '<p class="v14-feedback">' + (pct >= 90 ? "✓ Luar biasa! " : pct >= 60 ? "✓ Bagus! " : "💪 Terus latihan ya. ") + 'Kecocokan kata: ' + pct + '% (' + hit + '/' + tWords.length + ' kata).</p><p>Yang terdengar: “' + esc(said) + '”</p>' + (missed.length ? '<p>Bagian yang perlu diperbaiki — kata target ini belum terdengar jelas: <b>' + esc(missed.join(", ")) + '</b>. Dengarkan contohnya lagi, lalu tirukan khusus bagian itu.</p>' : '<p>Semua kata target terdengar. Naikkan tantangannya: tirukan dengan kecepatan & ritme yang sama persis.</p>') + '<p class="v14-sub">Penilaian otomatis sederhana (perbandingan kata), bukan penilaian AI penuh.</p>';
    if (pct >= 60){ v14Xp(5); v14CreditMinutes(2); }
  };
  rec.onerror = function(){ res.innerHTML = '<p class="v14-feedback">Pengenalan suara gagal (izin mikrofon/jaringan). Coba lagi, atau bandingkan rekamanmu secara manual dengan contoh.</p>'; };
  try { rec.start(); } catch(e){}
};
// Rute + menu sidebar tambahan
(function(){
  var nav = document.querySelector("#v14-sidebar nav");
  if (nav){
    var b1 = document.createElement("button"); b1.type = "button"; b1.textContent = "🎙️ Latihan Speaking"; b1.onclick = function(){ v14PageSpeaking(); };
    var ref = Array.prototype.slice.call(nav.querySelectorAll("button")).find(function(b){ return b.textContent.indexOf("Konjugasi") >= 0; });
    if (ref && ref.nextSibling) nav.insertBefore(b1, ref.nextSibling); else nav.appendChild(b1);
    var b2 = document.createElement("button"); b2.type = "button"; b2.textContent = "🎬 Dialog Situasional"; b2.onclick = function(){ v14PageSituations(); };
    var b3 = document.createElement("button"); b3.type = "button"; b3.textContent = "📋 Cheat Sheet"; b3.onclick = function(){ v14PageCheat(); };
    nav.appendChild(b2); nav.appendChild(b3);
  }
  var _go2 = window.v14Go;
  window.v14Go = function(page, arg){ if (page === "speaking") return v14PageSpeaking(); if (page === "situasi") return v14PageSituations(); if (page === "cheat") return v14PageCheat(); return _go2(page, arg); };
})();

// ---------- v14+: Kuis Latihan Berkategori (5 tab, format sama 3 bahasa) ----------
function v14DayIdx(){ var d = new Date(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); }
function v14PagePractice(){
  var cats = [["kosakata", "🔤 Kosakata"], ["grammar", "📐 Tata Bahasa"], ["membaca", "📖 Membaca"], ["mendengarkan", "🎧 Mendengarkan"], ["pengucapan", "🗣️ Pengucapan"]];
  v14ShowView("Kuis Latihan Berkategori — " + langName(), '<div class="v14-card"><p class="v14-sub">Latihan soal per kategori untuk ' + esc(langName()) + ' — pilih tab kategorinya. Tiap sesi 10 soal, jawaban benar +5 XP.</p><div class="v14-filters">' + cats.map(function(c){ return '<button type="button" onclick="v14PracticeCat(\'' + c[0] + '\')">' + c[1] + '</button>'; }).join("") + '</div><p class="v14-sub">Kosakata: arti & kata dari arti · Tata Bahasa: pola, partikel & isian ketik · Membaca: pemahaman bacaan pendek · Mendengarkan: dengarkan audio lalu jawab maksud pembicara · Pengucapan: dengarkan kata lalu ketik yang kamu dengar.</p></div>');
}
window.v14PracticeCat = function(cat){
  var flat = v14FlatVocab(LANGUAGE_CODE), seed = Date.now();
  if (cat === "kosakata"){ var base = v14BuildQuizSet(seed, 10); var out = base.map(function(q, i){ if (q.kind === "type"){ var v = flat.find(function(x){ return x.w === q.answerText; }) || flat[0]; return v14McqFromVocab(v, flat, seed + i, "id"); } return q; }); v14RunQuiz("Latihan Kosakata — " + langName(), out, null); return; }
  if (cat === "grammar"){
    var qs = v14BuildQuizSet(seed, 10);
    v14RunQuiz("Latihan Tata Bahasa — " + langName(), qs, null); return;
  }
  if (cat === "membaca"){
    var rd = v14Readings(LANGUAGE_CODE)[v14DayIdx() % 7];
    v14PageReadingDetail(rd.id); return;
  }
  if (cat === "mendengarkan"){
    var picked = v14Shuffle(flat.filter(function(v){ return v.ex; }), seed).slice(0, 5);
    var qs2 = picked.map(function(v, i){
      var others = v14Shuffle(flat.filter(function(x){ return x.w !== v.w; }), seed + i).slice(0, 3).map(function(o){ return o.exId; });
      var opts = v14Shuffle([v.exId].concat(others), seed + i + 5);
      var tb = ""; try { tb = ttsBtn(v.ex, ttsLangForMode(), "🔊 Dengarkan Audionya"); } catch(e){}
      return { kind: "mcq", q: "Dengarkan audio ini: " + v.ex, ctx: "Tekan tombol dengarkan, lalu jawab: pembicara sedang mengatakan apa?", ctxHtml: tb, opts: opts, answer: opts.indexOf(v.exId), speak: opts.map(function(o){ var f = flat.find(function(x){ return x.exId === o; }); return f ? f.ex : ""; }), explain: "Kalimatnya: " + v.ex + " — Artinya: " + v.exId, full: v.ex };
    });
    v14RunQuiz("Latihan Mendengarkan — " + langName(), qs2, null); return;
  }
  if (cat === "pengucapan"){
    var picked2 = v14Shuffle(flat, seed).slice(0, 5);
    var qs3 = picked2.map(function(v){ var tb = ""; try { tb = ttsBtn(v.w, ttsLangForMode(), "🔊 Dengarkan Katanya"); } catch(e){}
      return { kind: "type", q: "Ketik kata yang kamu dengar.", before: "", after: "", answerText: v.w, ctx: "Dengarkan baik-baik lalu ketik kata yang diucapkan (petunjuk artinya: " + v.id + ")", ctxHtml: tb, explain: "Kata yang benar: " + v.w + " — Artinya: " + v.id + ". Contoh kalimat: " + v.ex, full: v.ex }; });
    v14RunQuiz("Latihan Pengucapan — " + langName(), qs3, null); return;
  }
};
(function(){
  var _go3 = window.v14Go;
  window.v14Go = function(page, arg){ if (page === "latihan") return v14PagePractice(); return _go3(page, arg); };
})();

// ---------- v14+: Pelacak Mingguan (Weekly Tracker) per bahasa ----------
(function(){
  var origRecord = recordStudyDay;
  recordStudyDay = function(){
    origRecord();
    try { var k = "ela_study_days_" + LANGUAGE_CODE; var d = JSON.parse(localStorage.getItem(k) || "[]"); var t = localDateStr(); if (!d.includes(t)){ d.push(t); d.sort(); localStorage.setItem(k, JSON.stringify(d.slice(-370))); } } catch(e){}
  };
})();
function v14RenderWeekly(){
  var host = document.getElementById("v14-weekly"); if (!host) return;
  var days = []; try { days = JSON.parse(localStorage.getItem("ela_study_days_" + LANGUAGE_CODE) || "[]"); } catch(e){}
  var now = new Date(); var dow = (now.getDay() + 6) % 7; // Senin = 0
  var names = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  var cells = "", streakGap = 0, gapMsg = "";
  for (var i = 0; i < 7; i++){
    var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow + i);
    var ds = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    var done = days.includes(ds), isToday = i === dow, future = i > dow;
    cells += '<div class="v14-wk-cell ' + (done ? "done" : future ? "future" : "miss") + (isToday ? " today" : "") + '"><span>' + names[i].slice(0, 3) + '</span><b>' + (done ? "✓" : future ? "·" : "—") + '</b><small>' + d.getDate() + (isToday ? " · hari ini" : "") + '</small></div>';
    if (i < dow){ if (!done) streakGap++; else streakGap = 0; }
  }
  if (streakGap >= 2) gapMsg = '<p class="v14-wk-remind">💌 Pengingat lembut: sudah ' + streakGap + ' hari berturut-turut belum belajar ' + esc(langName()) + ' minggu ini. Tidak apa-apa — mulai lagi saja dengan Sesi Hari Ini 15 menit, pelan-pelan juga sampai.</p>';
  else if (!days.includes(localDateStr())) gapMsg = '<p class="v14-wk-remind">Hari ini belum tercatat belajar ' + esc(langName()) + '. Yuk, mulai Sesi Hari Ini — cukup 15 menit.</p>';
  host.innerHTML = '<section class="v14-card"><h3>📅 Pelacak Mingguan — ' + esc(langName()) + '</h3><div class="v14-wk">' + cells + '</div>' + gapMsg + '<p class="v14-sub">Hari terisi otomatis setiap kamu menyelesaikan latihan/kuis di bahasa ini. Belajar sering mandek di tengah minggu — tracker ini membantumu melihatnya sebelum streak putus.</p></section>';
}
(function(){
  var wrap = document.getElementById("v14-home-wrap");
  if (wrap && !document.getElementById("v14-weekly")){ var dv = document.createElement("div"); dv.id = "v14-weekly"; wrap.appendChild(dv); }
  var origDaily = v14RenderDaily;
  v14RenderDaily = function(){ origDaily(); v14RenderWeekly(); };
  v14RenderWeekly();
})();
// ---------- v14+: Kanji Dasar di halaman Menulis & Mengucapkan (Jepang) ----------
// Format sama seperti kartu huruf v13: [huruf, label baca, penulisan/urutan goresan,
// cara baca, contoh kata, baca contoh, arti contoh, teks TTS huruf]
var KANJI_BASIC = [
  ["日", "nichi / hi — matahari, hari", "4 goresan: tegak kiri, mendatar atas + tegak kanan jadi satu, mendatar tengah, mendatar bawah penutup.", "On'yomi: ニチ (nichi), ジツ (jitsu). Kun'yomi: ひ (hi), か (ka).", "日本", "nihon", "Jepang", "日"],
  ["月", "getsu / tsuki — bulan", "4 goresan: tegak melengkung kiri, mendatar + tegak, lalu dua mendatar di dalam.", "On'yomi: ゲツ (getsu), ガツ (gatsu). Kun'yomi: つき (tsuki).", "月曜日", "getsuyoubi", "hari Senin", "月"],
  ["山", "san / yama — gunung", "3 goresan: tegak tengah dulu, lalu mendatar bawah, terakhir tegak kiri-kanan menyambung.", "On'yomi: サン (san). Kun'yomi: やま (yama).", "富士山", "fujisan", "Gunung Fuji", "山"],
  ["川", "sen / kawa — sungai", "3 goresan: tiga garis tegak mengalir dari kiri ke kanan, yang tengah paling panjang.", "On'yomi: セン (sen). Kun'yomi: かわ (kawa).", "川", "kawa", "sungai", "川"],
  ["人", "jin / hito — orang", "2 goresan: garis miring ke kiri bawah, lalu garis miring ke kanan bawah menyangga.", "On'yomi: ジン (jin), ニン (nin). Kun'yomi: ひと (hito).", "日本人", "nihonjin", "orang Jepang", "人"],
  ["大", "dai / oo — besar", "3 goresan: mendatar, lalu tegak tengah menembus, terakhir miring ke kanan bawah.", "On'yomi: ダイ (dai), タイ (tai). Kun'yomi: おお (oo).", "大学", "daigaku", "universitas", "大"],
  ["小", "shou / chii — kecil", "3 goresan: tegak tengah dengan kait, titik miring kiri, titik miring kanan.", "On'yomi: ショウ (shou). Kun'yomi: ちい (chii), こ (ko), お (o).", "小学校", "shougakkou", "sekolah dasar", "小"],
  ["上", "jou / ue — atas", "3 goresan: mendatar atas, tegak turun, mendatar bawah yang lebih panjang.", "On'yomi: ジョウ (jou). Kun'yomi: うえ (ue), あ (a).", "上手", "jouzu", "pandai / mahir", "上"],
  ["下", "ka / shita — bawah", "3 goresan: mendatar atas panjang, tegak turun, titik di kanan bawah.", "On'yomi: カ (ka), ゲ (ge). Kun'yomi: した (shita), さ (sa).", "地下鉄", "chikatetsu", "kereta bawah tanah", "下"],
  ["中", "chuu / naka — tengah, dalam", "4 goresan: kotak (3 goresan), lalu satu tegak menembus tengahnya.", "On'yomi: チュウ (chuu). Kun'yomi: なか (naka).", "中国", "chuugoku", "Tiongkok", "中"],
  ["田", "den / ta — sawah", "5 goresan: kotak luar (tegak, mendatar+tegak, penutup), silang di dalam, mendatar penutup bawah.", "On'yomi: デン (den). Kun'yomi: た (ta).", "田んぼ", "tanbo", "sawah", "田"],
  ["木", "moku / ki — pohon, kayu", "4 goresan: mendatar, tegak tengah menembus, miring kiri bawah, miring kanan bawah.", "On'yomi: モク (moku), ボク (boku). Kun'yomi: き (ki).", "木曜日", "mokuyoubi", "hari Kamis", "木"],
  ["水", "sui / mizu — air", "4 goresan: tegak tengah dengan kait, lalu percikan kiri (mendatar + tegak), percikan kanan (miring + titik).", "On'yomi: スイ (sui). Kun'yomi: みず (mizu).", "水曜日", "suiyoubi", "hari Rabu", "水"],
  ["火", "ka / hi — api", "4 goresan: titik kiri, titik kanan, lalu bentuk 人 dengan mendatar di atasnya.", "On'yomi: カ (ka). Kun'yomi: ひ (hi).", "火曜日", "kayoubi", "hari Selasa", "火"],
  ["金", "kin / kane — emas, uang, logam", "8 goresan: 人 di atas, mendatar, tegak tengah, dua titik, mendatar, tegak, mendatar penutup.", "On'yomi: キン (kin), コン (kon). Kun'yomi: かね (kane).", "金曜日", "kinyoubi", "hari Jumat", "金"],
  ["土", "do / tsuchi — tanah", "3 goresan: mendatar atas, tegak tengah menembus, mendatar bawah paling panjang.", "On'yomi: ド (do), ト (to). Kun'yomi: つち (tsuchi).", "土曜日", "doyoubi", "hari Sabtu", "土"],
  ["年", "nen / toshi — tahun", "6 goresan: miring atas, mendatar, mendatar, tegak menembus, mendatar, tegak penutup kanan.", "On'yomi: ネン (nen). Kun'yomi: とし (toshi).", "今年", "kotoshi", "tahun ini", "年"],
  ["時", "ji / toki — waktu, jam", "10 goresan: radikal 日 (4 goresan) di kiri, lalu 寺 di kanan dari atas ke bawah.", "On'yomi: ジ (ji). Kun'yomi: とき (toki).", "時間", "jikan", "waktu / jam (durasi)", "時"],
  ["分", "fun / wa — menit, bagian", "4 goresan: miring kiri, miring kanan, lalu 刀 sederhana (miring + tegak berkait).", "On'yomi: フン (fun), ブン (bun). Kun'yomi: わ (wa).", "五分", "gofun", "lima menit", "分"]
];
(function(){
  var origRender = renderWritingPage;
  renderWritingPage = function(){
    origRender();
    if (LANGUAGE_CODE !== "ja") return;
    var body = document.getElementById("writing-content"); if (!body) return;
    if (document.getElementById("v14-kanji-basic")) return;
    var sec = document.createElement("div"); sec.id = "v14-kanji-basic";
    sec.innerHTML = '<h3 class="writing-h">🈳 Kanji Dasar — 19 Kanji Paling Sering Dipakai</h3><p class="writing-p">Sesudah Hiragana & Katakana, ini kanji dasar yang paling sering muncul (nama hari, alam, waktu, orang). Tiap kartu: urutan goresan, cara baca on\'yomi & kun\'yomi sederhana, dan contoh kata. Aturan umumnya: tulis dari atas ke bawah, kiri ke kanan, mendatar sebelum tegak.</p>' + letterGrid(KANJI_BASIC, "ja-JP");
    body.appendChild(sec);
  };
})();


// ============================================================
// ===== v15: SELENGKAP MUNGKIN — 500 kata, bacaan mandiri, ====
// ===== dialog baru, JLPT, kuis jenis baru, listening plus, ==
// ===== cheat print, coba tulis, prompt menulis, frasa ========
// ============================================================
(function(){
"use strict";
function v15Esc(s){ return typeof esc === "function" ? esc(s) : String(s == null ? "" : s); }
function v15Flat(){ try { return v14FlatVocab(LANGUAGE_CODE); } catch(e){ return []; } }
function v15TtsBtn(text, label){ try { return ttsBtn(text, ttsLangForMode(), label || "🔊"); } catch(e){ return ""; } }

// ---------- v15: Dialog Situasional tambahan (total 12 situasi/bahasa) ----------
var V15_DIALOGS = {
en: [["Di Rumah Sakit", [["Good morning, I have a headache and a fever.", "Selamat pagi, saya sakit kepala dan demam."], ["Since when do you feel sick?", "Sejak kapan Anda merasa sakit?"], ["Since yesterday evening, doctor.", "Sejak kemarin malam, Dokter."], ["Take this medicine twice a day after meals.", "Minum obat ini dua kali sehari sesudah makan."], ["Thank you, doctor. When should I come back?", "Terima kasih, Dokter. Kapan saya harus kembali?"], ["Come back in three days if you are not better.", "Kembalilah tiga hari lagi kalau belum membaik."]]],
["Di Bandara", [["Excuse me, where is the check-in counter for flight GA402?", "Permisi, di mana konter check-in untuk penerbangan GA402?"], ["It is over there, near gate three.", "Di sebelah sana, dekat gerbang tiga."], ["I would like a window seat, please.", "Saya minta kursi dekat jendela, ya."], ["Here is your boarding pass. Boarding starts at seven.", "Ini boarding pass Anda. Boarding mulai jam tujuh."], ["Thank you very much.", "Terima kasih banyak."], ["Have a safe flight!", "Semoga penerbangan Anda aman!"]]],
["Telepon", [["Hello, may I speak to Mr. Budi, please?", "Halo, boleh saya bicara dengan Pak Budi?"], ["Speaking. Who is calling, please?", "Saya sendiri. Ini siapa, ya?"], ["This is Ani from the library. Your book is ready.", "Saya Ani dari perpustakaan. Buku Anda sudah siap."], ["Thank you for calling. I will come this afternoon.", "Terima kasih sudah menelepon. Saya akan datang siang ini."], ["You are welcome. See you later.", "Sama-sama. Sampai jumpa nanti."], ["Goodbye.", "Selamat tinggal."]]],
["Di Kantor", [["Good morning, the meeting starts in ten minutes.", "Selamat pagi, rapatnya mulai sepuluh menit lagi."], ["Have you prepared the report?", "Apakah laporan sudah kamu siapkan?"], ["Yes, I printed ten copies for everyone.", "Sudah, saya mencetak sepuluh salinan untuk semua orang."], ["Great. Please send the file to my email too.", "Bagus. Tolong kirim juga filenya ke email saya."], ["Certainly, I will send it right away.", "Tentu, akan saya kirim sekarang juga."], ["Thank you for your hard work.", "Terima kasih atas kerja kerasmu."]]],
["Di Restoran", [["Good evening, a table for two, please.", "Selamat malam, meja untuk dua orang, ya."], ["Here is the menu. Today's special is grilled fish.", "Ini menunya. Menu spesial hari ini ikan bakar."], ["I would like the grilled fish and a glass of orange juice.", "Saya pesan ikan bakar dan segelas jus jeruk."], ["Would you like anything else?", "Ada lagi yang ingin dipesan?"], ["That is all, thank you.", "Itu saja, terima kasih."], ["Your food will be ready in fifteen minutes.", "Makanan Anda akan siap dalam lima belas menit."]]],
["Belanja Online", [["Is this bag still available?", "Apakah tas ini masih tersedia?"], ["Yes, but only two are left in stock.", "Masih, tapi stoknya tinggal dua."], ["How much is the delivery cost?", "Berapa biaya pengirimannya?"], ["Delivery is free for orders above fifty thousand rupiah.", "Pengiriman gratis untuk pesanan di atas lima puluh ribu rupiah."], ["Great, I will order one now.", "Bagus, saya pesan satu sekarang."], ["Thank you! Your package will arrive in two days.", "Terima kasih! Paket Anda akan tiba dalam dua hari."]]],
["Bertemu Teman Lama", [["Dimas! Long time no see!", "Dimas! Lama tidak bertemu!"], ["Rina! It has been five years. How are you?", "Rina! Sudah lima tahun. Apa kabar?"], ["I am fine. I work as a teacher now.", "Saya baik. Sekarang saya bekerja sebagai guru."], ["That is wonderful! Let's have coffee together sometime.", "Luar biasa! Kapan-kapan kita ngopi bersama, ya."], ["Sure, here is my new phone number.", "Tentu, ini nomor telepon baru saya."], ["I will call you this weekend.", "Saya akan meneleponmu akhir pekan ini."]]],
["Meminta Tolong", [["Excuse me, could you help me, please?", "Permisi, bisakah Anda menolong saya?"], ["Of course. What do you need?", "Tentu. Anda butuh apa?"], ["I am lost. How do I get to the station?", "Saya tersesat. Bagaimana cara ke stasiun?"], ["Go straight, then turn left at the bank.", "Jalan lurus, lalu belok kiri di bank."], ["Thank you so much for your help.", "Terima kasih banyak atas bantuannya."], ["No problem. Take care!", "Tidak masalah. Hati-hati di jalan!"]]]],
ko: [["병원에서", [["안녕하세요, 머리가 아프고 열이 나요.", "Selamat pagi, saya sakit kepala dan demam."], ["언제부터 아프셨어요?", "Sejak kapan Anda sakit?"], ["어제 저녁부터요, 선생님.", "Sejak kemarin malam, Dokter."], ["이 약을 식후에 하루 두 번 드세요.", "Minum obat ini dua kali sehari sesudah makan."], ["감사합니다, 선생님. 언제 다시 와야 해요?", "Terima kasih, Dokter. Kapan saya harus kembali?"], ["사흘 뒤에도 안 좋으면 다시 오세요.", "Kembalilah tiga hari lagi kalau belum membaik."]]],
["공항에서", [["실례합니다, GA402 비행기 체크인 카운터가 어디예요?", "Permisi, di mana konter check-in penerbangan GA402?"], ["저쪽 세 번 게이트 근처에 있어요.", "Di sebelah sana, dekat gerbang tiga."], ["창가 자리로 부탁해요.", "Saya minta kursi dekat jendela, ya."], ["탑승권 여기 있습니다. 탑승은 일곱 시에 시작해요.", "Ini boarding pass Anda. Boarding mulai jam tujuh."], ["정말 감사합니다.", "Terima kasih banyak."], ["안전한 비행 되세요!", "Semoga penerbangan Anda aman!"]]],
["전화", [["여보세요, 민준 씨 계세요?", "Halo, apakah Minjun ada?"], ["네, 접니다. 누구세요?", "Ya, saya sendiri. Ini siapa?"], ["도서관의 지현이에요. 책이 준비됐어요.", "Saya Jihyeon dari perpustakaan. Bukunya sudah siap."], ["전화해 줘서 감사해요. 오늘 오후에 갈게요.", "Terima kasih sudah menelepon. Saya akan datang siang ini."], ["천만에요. 이따가 봬요.", "Sama-sama. Sampai jumpa nanti."], ["안녕히 계세요.", "Selamat tinggal."]]],
["사무실에서", [["안녕하세요, 회의가 십 분 뒤에 시작해요.", "Selamat pagi, rapatnya mulai sepuluh menit lagi."], ["보고서는 준비했어요?", "Apakah laporannya sudah disiapkan?"], ["네, 모두를 위해 열 부 인쇄했어요.", "Sudah, saya mencetak sepuluh salinan untuk semua orang."], ["잘했어요. 파일도 제 이메일로 보내 주세요.", "Bagus. Tolong kirim juga filenya ke email saya."], ["물론이죠, 지금 바로 보낼게요.", "Tentu, akan saya kirim sekarang juga."], ["수고했어요.", "Terima kasih atas kerja kerasmu."]]],
["식당에서", [["안녕하세요, 두 명 자리 부탁해요.", "Selamat malam, meja untuk dua orang, ya."], ["메뉴 여기 있습니다. 오늘의 특별 메뉴는 생선구이예요.", "Ini menunya. Menu spesial hari ini ikan bakar."], ["생선구이하고 오렌지 주스 한 잔 주세요.", "Saya pesan ikan bakar dan segelas jus jeruk."], ["다른 것은 필요하세요?", "Ada lagi yang ingin dipesan?"], ["그것만 주세요, 감사합니다.", "Itu saja, terima kasih."], ["음식은 십오 분 뒤에 준비될 거예요.", "Makanan Anda akan siap dalam lima belas menit."]]],
["온라인 쇼핑", [["이 가방 아직 있어요?", "Apakah tas ini masih tersedia?"], ["네, 하지만 재고가 두 개밖에 안 남았어요.", "Masih, tapi stoknya tinggal dua."], ["배송비는 얼마예요?", "Berapa biaya pengirimannya?"], ["오만 원 이상 주문하면 배송이 무료예요.", "Pengiriman gratis untuk pesanan di atas lima puluh ribu rupiah."], ["좋아요, 지금 하나 주문할게요.", "Bagus, saya pesan satu sekarang."], ["감사합니다! 택배는 이틀 뒤에 도착할 거예요.", "Terima kasih! Paket Anda akan tiba dalam dua hari."]]],
["오랜 친구 만나기", [["지훈아! 오랜만이야!", "Jihoon! Lama tidak bertemu!"], ["사리야! 오 년 만이야. 잘 지냈어?", "Sari! Sudah lima tahun. Apa kabar?"], ["잘 지냈어. 지금은 선생님으로 일해.", "Saya baik. Sekarang saya bekerja sebagai guru."], ["대단하다! 언젠가 같이 커피 마시자.", "Luar biasa! Kapan-kapan kita ngopi bersama, ya."], ["좋아, 내 새 전화번호 여기 있어.", "Tentu, ini nomor telepon baru saya."], ["이번 주말에 전화할게.", "Saya akan meneleponmu akhir pekan ini."]]],
["도움 청하기", [["실례합니다, 좀 도와주실 수 있어요?", "Permisi, bisakah Anda menolong saya?"], ["물론이죠. 무엇이 필요하세요?", "Tentu. Anda butuh apa?"], ["길을 잃었어요. 역에 어떻게 가요?", "Saya tersesat. Bagaimana cara ke stasiun?"], ["똑바로 가다가 은행에서 왼쪽으로 가세요.", "Jalan lurus, lalu belok kiri di bank."], ["도와주셔서 정말 감사합니다.", "Terima kasih banyak atas bantuannya."], ["천만에요. 조심히 가세요!", "Tidak masalah. Hati-hati di jalan!"]]]],
ja: [["病院で", [["おはようございます。頭が痛くて、熱があります。", "Selamat pagi, saya sakit kepala dan demam."], ["いつから具合が悪いですか。", "Sejak kapan Anda merasa sakit?"], ["昨日の夜からです、先生。", "Sejak kemarin malam, Dokter."], ["この薬を食後に一日二回飲んでください。", "Minum obat ini dua kali sehari sesudah makan."], ["ありがとうございます、先生。いつ来ればいいですか。", "Terima kasih, Dokter. Kapan saya harus kembali?"], ["三日経っても良くならなければ、また来てください。", "Kembalilah tiga hari lagi kalau belum membaik."]]],
["空港で", [["すみません、GA402便のチェックインカウンターはどこですか。", "Permisi, di mana konter check-in untuk penerbangan GA402?"], ["あちらの三番ゲートの近くにあります。", "Di sebelah sana, dekat gerbang tiga."], ["窓側の席をお願いします。", "Saya minta kursi dekat jendela, ya."], ["搭乗券です。搭乗は七時に始まります。", "Ini boarding pass Anda. Boarding mulai jam tujuh."], ["どうもありがとうございます。", "Terima kasih banyak."], ["良いご旅行を！", "Semoga penerbangan Anda aman!"]]],
["電話で", [["もしもし、ブディさんをお願いできますか。", "Halo, boleh saya bicara dengan Pak Budi?"], ["私です。どちら様ですか。", "Saya sendiri. Ini siapa, ya?"], ["図書館のアニです。本の準備ができました。", "Saya Ani dari perpustakaan. Buku Anda sudah siap."], ["お電話ありがとうございます。今日の午後に行きます。", "Terima kasih sudah menelepon. Saya akan datang siang ini."], ["どういたしまして。では、後ほど。", "Sama-sama. Sampai jumpa nanti."], ["失礼します。", "Selamat tinggal."]]],
["会社で", [["おはようございます。会議は十分後に始まります。", "Selamat pagi, rapatnya mulai sepuluh menit lagi."], ["報告書の準備はできましたか。", "Apakah laporannya sudah disiapkan?"], ["はい、全員のために十部印刷しました。", "Sudah, saya mencetak sepuluh salinan untuk semua orang."], ["助かります。ファイルも私のメールに送ってください。", "Bagus. Tolong kirim juga filenya ke email saya."], ["かしこまりました。今すぐ送ります。", "Tentu, akan saya kirim sekarang juga."], ["お疲れ様でした。", "Terima kasih atas kerja kerasmu."]]],
["レストランで", [["こんばんは、二名でお願いします。", "Selamat malam, meja untuk dua orang, ya."], ["メニューです。今日のおすすめは焼き魚です。", "Ini menunya. Menu spesial hari ini ikan bakar."], ["焼き魚とオレンジジュースを一つください。", "Saya pesan ikan bakar dan segelas jus jeruk."], ["他にご注文はありますか。", "Ada lagi yang ingin dipesan?"], ["以上です。ありがとうございます。", "Itu saja, terima kasih."], ["お料理は十五分ほどでご用意できます。", "Makanan Anda akan siap dalam lima belas menit."]]],
["ネットショッピング", [["この鞄はまだありますか。", "Apakah tas ini masih tersedia?"], ["はい、でも在庫は二つだけです。", "Masih, tapi stoknya tinggal dua."], ["送料はいくらですか。", "Berapa biaya pengirimannya?"], ["五万ルピア以上のご注文は送料無料です。", "Pengiriman gratis untuk pesanan di atas lima puluh ribu rupiah."], ["いいですね。今、一つ注文します。", "Bagus, saya pesan satu sekarang."], ["ありがとうございます！荷物は二日で届きます。", "Terima kasih! Paket Anda akan tiba dalam dua hari."]]],
["久しぶりの友達", [["ジフン！久しぶり！", "Jihoon! Lama tidak bertemu!"], ["サリ！五年ぶりだね。元気だった？", "Sari! Sudah lima tahun. Apa kabar?"], ["元気だよ。今は先生として働いているよ。", "Saya baik. Sekarang saya bekerja sebagai guru."], ["すごいね！今度一緒にコーヒーを飲もう。", "Luar biasa! Kapan-kapan kita ngopi bersama, ya."], ["いいよ。これが私の新しい電話番号だよ。", "Tentu, ini nomor telepon baru saya."], ["今週末に電話するね。", "Saya akan meneleponmu akhir pekan ini."]]],
["助けを求める", [["すみません、手伝っていただけますか。", "Permisi, bisakah Anda menolong saya?"], ["もちろんです。何が必要ですか。", "Tentu. Anda butuh apa?"], ["道に迷いました。駅へはどう行きますか。", "Saya tersesat. Bagaimana cara ke stasiun?"], ["まっすぐ行って、銀行で左に曲がってください。", "Jalan lurus, lalu belok kiri di bank."], ["手伝ってくれて、本当にありがとうございます。", "Terima kasih banyak atas bantuannya."], ["どういたしまして。お気をつけて！", "Tidak masalah. Hati-hati di jalan!"]]]]
};
try { Object.keys(V15_DIALOGS).forEach(function(c){ if (typeof V14_DIALOGS !== "undefined" && V14_DIALOGS[c]) V15_DIALOGS[c].forEach(function(d){ V14_DIALOGS[c].push(d); }); }); } catch(e){}

// ---------- v15: lengkapi Cheat Sheet & Grammar Pattern per level ----------
var V15_CHEAT_EXTRA = {
en: [["Kata Tanya", "what (apa) · who (siapa) · where (di mana) · when (kapan) · why (kenapa) · how (bagaimana) · how many (berapa banyak, bisa dihitung) · how much (berapa banyak/harga, tidak bisa dihitung)."],
["Preposisi Inti", "in (di dalam / bulan / tahun) · on (di atas / hari / tanggal) · at (di / jam) · to (ke) · from (dari) · with (dengan) · without (tanpa) · before (sebelum) · after (sesudah) · between (di antara dua) · among (di antara banyak)."],
["Modal Verbs", "can (bisa) · could (bisa, sopan/lampau) · may (boleh/mungkin) · might (mungkin) · must (harus) · should (sebaiknya) · will (akan) · would (akan, sopan/andaikan). Selalu diikuti kata kerja dasar: You should rest."],
["Penghubung Kalimat", "and (dan) · but (tetapi) · or (atau) · so (jadi) · because (karena) · although (meskipun) · if (kalau) · when (ketika) · while (sementara) · unless (kecuali kalau)."]],
ko: [["Urutan Kata (SOV)", "Korea: Subjek–Objek–Kata Kerja. 저는 (saya) 밥을 (nasi) 먹어요 (makan). Kata kerja selalu di akhir kalimat."],
["Tingkat Kesopanan", "합쇼체 -입니다/-입니까 (paling formal) · 해요체 -아요/어요 (sopan sehari-hari) · 반말 -아/어 (akrab). Pilih satu gaya dan konsisten dalam satu percakapan."],
["Kata Tanya Korea", "뭐 (apa) · 누구 (siapa) · 어디 (di mana) · 언제 (kapan) · 왜 (kenapa) · 어떻게 (bagaimana) · 몇 (berapa, untuk hitungan) · 얼마 (berapa harga/banyak)."],
["Penghubung Korea", "-고 (dan/lalu) · -지만 (tetapi) · -아서/어서 (karena/maka) · -(으)면 (kalau) · -기 전에 (sebelum) · -(으)ㄴ 후에 (sesudah) · -거나 (atau)."]],
ja: [["Urutan Kata (SOV)", "Jepang: Subjek–Objek–Kata Kerja. 私は (saya) ご飯を (nasi) 食べます (makan). Partikel menempel tepat sesudah kata yang ditandai."],
["Bentuk Sopan vs Kasual", "です/ます (sopan, aman untuk pemula) · だ/ bentuk kamus (kasual, untuk teman dekat). Di ujian dan tempat kerja gunakan です/ます."],
["Kata Tanya Jepang", "何 (apa) · 誰 (siapa) · どこ (di mana) · いつ (kapan) · なぜ/どうして (kenapa) · どう (bagaimana) · いくつ (berapa, benda) · いくら (berapa harga)."],
["Penghubung Jepang", "〜て (dan/lalu) · が (tetapi) · から (karena) · ので (karena, sopan) · たら (kalau) · 前に (sebelum) · 後で (sesudah) · か (atau)."]]
};
try { Object.keys(V15_CHEAT_EXTRA).forEach(function(c){ if (typeof V14_CHEAT !== "undefined" && V14_CHEAT[c]) V15_CHEAT_EXTRA[c].forEach(function(x){ V14_CHEAT[c].push(x); }); }); } catch(e){}
var V15_PATTERN_EXTRA = {
en: {"A0":[["have/has (punya)","She has a cat.","Dia punya seekor kucing."]],"A1":[["can/can't (bisa)","I can swim.","Saya bisa berenang."]],"A2":[["going to (akan)","We are going to travel.","Kami akan bepergian."]],"B1":[["used to (dulu biasa)","I used to play here.","Dulu saya biasa bermain di sini."]],"B2":[["Relative Clauses","The man who called is my uncle.","Pria yang menelepon itu paman saya."]],"C1":[["Participle Clauses","Walking home, I met Ani.","Sambil berjalan pulang, saya bertemu Ani."]],"C2":[["Ellipsis","She can play the piano, and I can, too.","Dia bisa bermain piano, dan saya juga bisa."]]},
ko: {"A0":[["-이/가 있어요 (ada)","책이 있어요.","Ada buku."]],"A1":[["-고 싶어요 (ingin)","한국에 가고 싶어요.","Saya ingin pergi ke Korea."]],"A2":[["-(으)ㄹ 수 있어요 (bisa)","수영할 수 있어요.","Saya bisa berenang."]],"B1":[["-기 때문에 (karena)","바쁘기 때문에 못 가요.","Karena sibuk, saya tidak bisa pergi."]],"B2":[["-는 데 (dalam hal)","사는 데 돈이 많이 들어요.","Untuk tinggal (di sana) butuh banyak uang."]],"C1":[["-(으)ㄹ지 모르다 (tidak tahu apakah)","그가 올지 몰라요.","Saya tidak tahu apakah dia akan datang."]],"C2":[["-되 (tetapi, tulisan)","날씨는 좋되 바람이 세요.","Cuacanya bagus, tetapi anginnya kencang."]]},
ja: {"A0":[["〜が あります/います (ada)","本があります。","Ada buku."]],"A1":[["〜たいです (ingin)","韓国へ行きたいです。","Saya ingin pergi ke Korea."]],"A2":[["〜ことができます (bisa)","泳ぐことができます。","Saya bisa berenang."]],"B1":[["〜ために (untuk/k arena)","健康のために運動します。","Saya berolahraga demi kesehatan."]],"B2":[["〜ば〜ほど (semakin... semakin)","読めば読むほど面白いです。","Semakin dibaca, semakin menarik."]],"C1":[["〜ざるを得ない (terpaksa harus)","行かざるを得ない。","Terpaksa harus pergi."]],"C2":[["〜をもって (dengan, formal)","本日をもって終了します。","Berakhir per hari ini."]]}
};
try { Object.keys(V15_PATTERN_EXTRA).forEach(function(c){ if (typeof V14_PATTERNS !== "undefined" && V14_PATTERNS[c]) Object.keys(V15_PATTERN_EXTRA[c]).forEach(function(lv){ if (V14_PATTERNS[c][lv]) V15_PATTERN_EXTRA[c][lv].forEach(function(p){ V14_PATTERNS[c][lv].push(p); }); }); }); } catch(e){}
var V15_NOTES_EXTRA = {
en: [["📐 v15 — Pola Kalimat Inti per Level (A0–C2)","Ringkasan pola wajib tiap level: A0 be & have · A1 Present Simple & can · A2 Past Simple & going to · B1 Present Perfect & used to · B2 Passive & Relative Clauses · C1 Mixed Conditionals & Participle Clauses · C2 Subjunctive & Ellipsis. Kuasai pola levelmu sebelum naik level.",[["I have finished my homework.","Saya sudah menyelesaikan PR saya."],["The report was written by Ani.","Laporan itu ditulis oleh Ani."]]]],
ko: [["📐 v15 — Pola Kalimat Inti per Level (A0–C2)","Ringkasan pola wajib tiap level: A0 -이에요/예요 & 있다 · A1 -아요/어요 & -고 싶어요 · A2 -았/었어요 & -(으)ㄹ 수 있어요 · B1 -(으)면 & -기 때문에 · B2 -(으)니까 & -는 데 · C1 -더라고요 & -(으)ㄹ지 모르다 · C2 -(으)므로 & -되.",[["시간이 있으면 같이 공부해요.","Kalau ada waktu, kita belajar bersama."],["비가 오니까 우산을 가져가세요.","Karena hujan, bawalah payung."]]]],
ja: [["📐 v15 — Pola Kalimat Inti per Level (A0–C2)","Ringkasan pola wajib tiap level: A0 〜です & あります/います · A1 〜ます & 〜たい · A2 〜た & ことができます · B1 〜ば & ために · B2 〜ば〜ほど & 受身 · C1 〜ざるを得ない & 謙譲語 · C2 〜をもって & 文語表現.",[["時間があれば、一緒に勉強します。","Kalau ada waktu, kita belajar bersama."],["先生に褒められました。","Saya dipuji oleh guru."]]]]
};
try { if (typeof NOTES_EN !== "undefined") V15_NOTES_EXTRA.en.forEach(function(n){ NOTES_EN.push(n); }); } catch(e){}
try { if (typeof NOTES_KO !== "undefined") V15_NOTES_EXTRA.ko.forEach(function(n){ NOTES_KO.push(n); }); } catch(e){}
try { if (typeof NOTES_JA !== "undefined") V15_NOTES_EXTRA.ja.forEach(function(n){ NOTES_JA.push(n); }); } catch(e){}

// ---------- v15: Perpustakaan Bacaan mandiri (20 artikel/bahasa) + bacaan modul lama ----------
function v15StandaloneReadings(code){ return (typeof READINGS_V15 !== "undefined" && READINGS_V15[code]) || []; }
function v15AllReadings(code){
  var base = []; try { base = v14Readings(code); } catch(e){}
  var extra = v15StandaloneReadings(code).map(function(r){ return { id: r[0], level: r[1], levelName: r[1], title: r[2], items: r[3], standalone: true }; });
  return extra.concat(base);
}
var _v15OrigPageReadings = v14PageReadings;
v14PageReadings = function(level){
  var all = v15AllReadings(LANGUAGE_CODE);
  var levels = ["Semua","A0","A1","A2","B1","B2","C1","C2"];
  var list = (!level || level === "Semua") ? all : all.filter(function(r){ return r.level === level; });
  var html = '<div class="v14-card"><p class="v14-sub">Perpustakaan Bacaan v15: ' + all.length + ' bacaan untuk ' + v15Esc(langName()) + ' (20 artikel mandiri baru + bacaan modul). Tiap artikel: terjemahan inline, pertanyaan pemahaman, dan tombol ⛏️ mining kata menjadi kartu hafalan SRS.</p><div class="v14-filters">' +
    levels.map(function(lv){ return '<button type="button" class="' + (((level || "Semua") === lv) ? "on" : "") + '" onclick="v14Go(\'bacaan\',\'' + lv + '\')">' + lv + '</button>'; }).join("") + '</div>' +
    list.map(function(r){ return '<article class="v14-read-item"><h4>' + v15Esc(r.title) + (r.standalone ? ' <span class="v15-badge">BARU v15</span>' : '') + '</h4><p class="v14-sub">Level ' + r.level + ' · ' + r.items.length + ' kalimat + pertanyaan pemahaman</p><button type="button" class="btn btn-primary" onclick="v14Go(\'bacaan-detail\',\'' + r.id + '\')">Baca Sekarang</button></article>'; }).join("") + '</div>';
  v14ShowView("Perpustakaan Bacaan — " + langName(), html);
};
var _v15OrigReadingDetail = v14PageReadingDetail;
v14PageReadingDetail = function(id){
  var code = LANGUAGE_CODE;
  var sr = v15StandaloneReadings(code).find(function(r){ return r[0] === id; });
  if (!sr) return _v15OrigReadingDetail(id);
  var paras = sr[3].map(function(line){
    return '<p class="v14-read-line"><b>' + v15Esc(line[0]) + '</b> ' + v15TtsBtn(line[0]) + '<br><span class="translation">' + v15Esc(line[1]) + '</span></p>';
  }).join("");
  var mineBtns = sr[5].map(function(w){ return '<button type="button" class="v14-mine" onclick="v14MineBtn(this,\'' + v15Esc(w).replace(/'/g, "\\'") + '\')">⛏️ Tambah “' + v15Esc(w) + '” ke Hafalan</button>'; }).join(" ");
  var qs = sr[4].map(function(q){ return { kind: "mcq", q: q[0], ctx: "Pertanyaan pemahaman bacaan “" + sr[2] + "”.", opts: q[1], answer: q[2], speak: q[1].slice(), explain: q[3] }; });
  var flat = v15Flat();
  var mv = flat.find(function(x){ return x.w === sr[5][0]; });
  if (mv){ var others = v14Shuffle(flat.filter(function(x){ return x.w !== mv.w; }), Date.now()).slice(0, 3).map(function(o){ return o.id; }); var opts3 = v14Shuffle([mv.id].concat(others), 7); qs.push({ kind: "mcq", q: "Menurut bacaan di atas, apa arti kata “" + mv.w + "”?", ctx: "Pertanyaan pemahaman bacaan “" + sr[2] + "”.", opts: opts3, answer: opts3.indexOf(mv.id), speak: opts3.map(function(o){ var f = flat.find(function(x){ return x.id === o; }); return f ? f.w : ""; }), explain: "Contoh: " + mv.ex + " — Artinya: " + mv.exId }); }
  window.__v15ReadingQs = qs; window.__v15ReadingTitle = "Pemahaman Bacaan — " + sr[2];
  v14ShowView("Bacaan — " + sr[2], '<div class="v14-card"><p class="v14-sub">Level ' + sr[1] + ' · artikel mandiri v15 · terjemahan inline di bawah tiap kalimat</p>' + paras + '<p>' + mineBtns + '</p><div class="v14-actions"><button type="button" class="btn btn-primary" onclick="v14RunQuiz(window.__v15ReadingTitle, window.__v15ReadingQs, function(){ v14CreditMinutes(5); return \'\'; })">Jawab Pertanyaan Pemahaman (' + qs.length + ' soal)</button><button type="button" class="btn btn-ghost" onclick="v14Go(\'bacaan\')">← Semua Bacaan</button></div></div>');
};

// ---------- v15: 3 jenis soal baru — Urutan Kata, Translate, Match Pairs ----------
function v15Tokens(s){ return String(s || "").replace(/[.!?。！？]+$/g, "").split(/\s+/).filter(Boolean); }
function v15NormT(s){ return String(s || "").toLowerCase().replace(/[.!?,;:。！？、]/g, "").replace(/\s+/g, " ").trim(); }
var V15_GAME = null;
function v15GameShell(title, sub){
  v14ShowView(title, '<div class="v14-card"><p class="v14-sub">' + sub + '</p><div id="v15-game"></div></div>');
}
function v15PickSentences(n){
  var flat = v15Flat().filter(function(v){ var t = v15Tokens(v.ex); return t.length >= 3 && t.length <= 9; });
  return v14Shuffle(flat, Date.now()).slice(0, n);
}
// --- Urutan Kata ---
window.v15StartOrder = function(){
  var items = v15PickSentences(5); if (!items.length) return;
  V15_GAME = { kind: "order", items: items, idx: 0, score: 0, built: [] };
  v15GameShell("🧩 Urutan Kata — " + langName(), "Susun kata-kata acak menjadi kalimat yang benar. 5 ronde · jawaban benar +5 XP. Dengarkan kalimatnya setelah selesai!");
  v15RenderOrder();
};
function v15RenderOrder(){
  var g = V15_GAME, v = g.items[g.idx], host = document.getElementById("v15-game"); if (!host) return;
  var toks = v15Tokens(v.ex);
  var shuffled = v14Shuffle(toks.map(function(t, i){ return { t: t, i: i }; }), Date.now() + g.idx);
  g.shuffled = shuffled; g.built = [];
  host.innerHTML = '<p class="v14-sub">Ronde ' + (g.idx + 1) + ' dari ' + g.items.length + ' · Skor: ' + g.score + '</p>' +
    '<p>Artinya: <b>' + v15Esc(v.exId) + '</b></p>' +
    '<div class="v15-answer" id="v15-built">Klik kata di bawah untuk menyusun kalimat…</div>' +
    '<div class="v15-chips">' + shuffled.map(function(o, k){ return '<button type="button" class="v15-chip" id="v15-chip-' + k + '" onclick="v15OrderPick(' + k + ')">' + v15Esc(o.t) + '</button>'; }).join("") + '</div>' +
    '<div class="v14-actions"><button type="button" class="btn btn-ghost" onclick="v15RenderOrder()">↺ Acak Ulang</button><button type="button" class="btn btn-primary" onclick="v15OrderCheck()">Periksa Jawaban</button></div><div id="v15-game-msg"></div>';
}
window.v15OrderPick = function(k){
  var g = V15_GAME; if (!g) return;
  var chip = document.getElementById("v15-chip-" + k); if (!chip || chip.disabled) return;
  chip.disabled = true; chip.classList.add("used");
  g.built.push(g.shuffled[k].t);
  document.getElementById("v15-built").textContent = g.built.join(" ");
};
window.v15OrderCheck = function(){
  var g = V15_GAME, v = g.items[g.idx], msg = document.getElementById("v15-game-msg"); if (!msg) return;
  var ok = v15NormT(g.built.join(" ")) === v15NormT(v.ex);
  if (ok){ g.score++; try { v14Xp(5); } catch(e){} }
  msg.innerHTML = '<p class="' + (ok ? "v15-ok" : "v15-no") + '">' + (ok ? "✓ Benar! +5 XP" : "✗ Belum tepat.") + '</p><p><b>' + v15Esc(v.ex) + '</b> ' + v15TtsBtn(v.ex) + '<br><span class="translation">Artinya: ' + v15Esc(v.exId) + '</span></p>' +
    '<div class="v14-actions"><button type="button" class="btn btn-primary" onclick="v15OrderNext()">' + (g.idx + 1 < g.items.length ? "Ronde Berikutnya →" : "Lihat Hasil") + '</button></div>';
};
window.v15OrderNext = function(){
  var g = V15_GAME; g.idx++;
  if (g.idx < g.items.length) return v15RenderOrder();
  document.getElementById("v15-game").innerHTML = '<p class="v15-big">Selesai! Skor Urutan Kata: ' + g.score + ' dari ' + g.items.length + ' ronde.</p><div class="v14-actions"><button type="button" class="btn btn-primary" onclick="v15StartOrder()">Main Lagi</button><button type="button" class="btn btn-ghost" onclick="v14PagePractice()">← Kuis Latihan</button></div>';
  try { v14CreditMinutes(5); } catch(e){}
};
// --- Translate (ketik terjemahan) ---
window.v15StartTranslate = function(){
  var items = v15PickSentences(5); if (!items.length) return;
  V15_GAME = { kind: "translate", items: items, idx: 0, score: 0 };
  v15GameShell("🌐 Translate — " + langName(), "Terjemahkan kalimat Bahasa Indonesia ini ke " + langName() + " dengan mengetik. 5 ronde · jawaban benar +5 XP. Untuk Korea/Jepang, bank kata di bawah kolom bisa diklik untuk membantu mengetik (keyboard Inggrismu tetap bisa dipakai).");
  v15RenderTranslate();
};
function v15RenderTranslate(){
  var g = V15_GAME, v = g.items[g.idx], host = document.getElementById("v15-game"); if (!host) return;
  var toks = v14Shuffle(v15Tokens(v.ex), Date.now() + g.idx);
  host.innerHTML = '<p class="v14-sub">Ronde ' + (g.idx + 1) + ' dari ' + g.items.length + ' · Skor: ' + g.score + '</p>' +
    '<p>Terjemahkan kalimat ini: <b>' + v15Esc(v.exId) + '</b></p>' +
    '<input type="text" id="v15-tr-input" class="v15-input" placeholder="Ketik terjemahannya di sini…" autocomplete="off">' +
    '<div class="v15-chips">' + toks.map(function(t){ return '<button type="button" class="v15-chip" onclick="v15TrChip(this)">' + v15Esc(t) + '</button>'; }).join("") + '</div>' +
    '<div class="v14-actions"><button type="button" class="btn btn-primary" onclick="v15TranslateCheck()">Periksa Jawaban</button></div><div id="v15-game-msg"></div>';
  var inp = document.getElementById("v15-tr-input");
  if (inp){ inp.addEventListener("keydown", function(e){ if (e.key === "Enter") v15TranslateCheck(); }); inp.focus(); }
}
window.v15TrChip = function(btn){
  var inp = document.getElementById("v15-tr-input"); if (!inp) return;
  inp.value = (inp.value ? inp.value.replace(/\s+$/,"") + " " : "") + btn.textContent; inp.focus();
};
window.v15TranslateCheck = function(){
  var g = V15_GAME, v = g.items[g.idx], inp = document.getElementById("v15-tr-input"), msg = document.getElementById("v15-game-msg"); if (!inp || !msg) return;
  var ok = v15NormT(inp.value) === v15NormT(v.ex);
  if (ok){ g.score++; try { v14Xp(5); } catch(e){} }
  msg.innerHTML = '<p class="' + (ok ? "v15-ok" : "v15-no") + '">' + (ok ? "✓ Benar! +5 XP" : "✗ Belum tepat. Jawaban yang benar:") + '</p><p><b>' + v15Esc(v.ex) + '</b> ' + v15TtsBtn(v.ex) + '<br><span class="translation">Artinya: ' + v15Esc(v.exId) + '</span></p>' +
    '<div class="v14-actions"><button type="button" class="btn btn-primary" onclick="v15TranslateNext()">' + (g.idx + 1 < g.items.length ? "Ronde Berikutnya →" : "Lihat Hasil") + '</button></div>';
};
window.v15TranslateNext = function(){
  var g = V15_GAME; g.idx++;
  if (g.idx < g.items.length) return v15RenderTranslate();
  document.getElementById("v15-game").innerHTML = '<p class="v15-big">Selesai! Skor Translate: ' + g.score + ' dari ' + g.items.length + ' ronde.</p><div class="v14-actions"><button type="button" class="btn btn-primary" onclick="v15StartTranslate()">Main Lagi</button><button type="button" class="btn btn-ghost" onclick="v14PagePractice()">← Kuis Latihan</button></div>';
  try { v14CreditMinutes(5); } catch(e){}
};
// --- Match Pairs ---
window.v15StartMatch = function(){
  var flat = v15Flat(); if (flat.length < 5) return;
  var items = v14Shuffle(flat, Date.now()).slice(0, 5);
  V15_GAME = { kind: "match", items: items, sel: null, done: 0, meanings: v14Shuffle(items.map(function(v){ return v.id; }), Date.now() + 3) };
  v15GameShell("🃏 Match Pairs — " + langName(), "Pasangkan kata dengan arti Bahasa Indonesianya: klik kata, lalu klik artinya. 5 pasang · tiap pasang benar +5 XP.");
  v15RenderMatch();
};
function v15RenderMatch(){
  var g = V15_GAME, host = document.getElementById("v15-game"); if (!host) return;
  host.innerHTML = '<p class="v14-sub">Terpasang: ' + g.done + ' dari ' + g.items.length + ' pasang</p><div class="v15-match">' +
    '<div class="v15-match-col">' + g.items.map(function(v, i){ return '<button type="button" class="v15-pair" id="v15-w-' + i + '" onclick="v15MatchWord(' + i + ')">' + v15Esc(v.w) + '</button>'; }).join("") + '</div>' +
    '<div class="v15-match-col">' + g.meanings.map(function(m, i){ return '<button type="button" class="v15-pair" id="v15-m-' + i + '" onclick="v15MatchMean(' + i + ')">' + v15Esc(m) + '</button>'; }).join("") + '</div></div><div id="v15-game-msg"></div>';
}
window.v15MatchWord = function(i){ var g = V15_GAME; if (!g) return; g.sel = i; g.items.forEach(function(_, k){ var b = document.getElementById("v15-w-" + k); if (b && !b.disabled) b.classList.toggle("sel", k === i); }); };
window.v15MatchMean = function(i){
  var g = V15_GAME, msg = document.getElementById("v15-game-msg"); if (!g || g.sel == null || !msg) return;
  var v = g.items[g.sel], ok = g.meanings[i] === v.id;
  var bw = document.getElementById("v15-w-" + g.sel), bm = document.getElementById("v15-m-" + i);
  if (ok){ if (bw){ bw.disabled = true; bw.classList.add("done"); } if (bm){ bm.disabled = true; bm.classList.add("done"); } g.done++; g.sel = null; try { v14Xp(5); } catch(e){}
    msg.innerHTML = '<p class="v15-ok">✓ Pasangan benar! ' + v15Esc(v.w) + ' = ' + v15Esc(v.id) + '</p>';
    var cnt = document.querySelector("#v15-game .v14-sub"); if (cnt) cnt.textContent = "Terpasang: " + g.done + " dari " + g.items.length + " pasang";
    if (g.done >= g.items.length) msg.innerHTML += '<p class="v15-big">Semua pasangan selesai! 🎉</p><div class="v14-actions"><button type="button" class="btn btn-primary" onclick="v15StartMatch()">Main Lagi</button><button type="button" class="btn btn-ghost" onclick="v14PagePractice()">← Kuis Latihan</button></div>';
  } else { if (bm){ bm.classList.add("wrong"); setTimeout(function(){ bm.classList.remove("wrong"); }, 600); } msg.innerHTML = '<p class="v15-no">✗ Bukan pasangannya. Coba lagi!</p>'; }
};

// ---------- v15: Listening Plus — Putar Semua, Sembunyikan Terjemahan, Rekam & Cek ----------
window.v15Listening = function(){
  var items = v15PickSentences(5);
  window.__v15ListenItems = items;
  var rows = items.map(function(v, i){
    return '<article class="v14-read-item"><h4>Kalimat ' + (i + 1) + '</h4>' +
      '<p><b class="v15-listen-text">' + v15Esc(v.ex) + '</b> ' + v15TtsBtn(v.ex, "🔊 Putar") + '</p>' +
      '<p class="translation v15-listen-id">Artinya: ' + v15Esc(v.exId) + '</p>' +
      '<div class="v14-actions"><button type="button" class="btn btn-ghost" onclick="v15RecCheck(' + i + ')">🎙️ Rekam &amp; Cek</button></div>' +
      '<div id="v15-listen-msg-' + i + '"></div></article>';
  }).join("");
  v14ShowView("🎧 Listening Plus — " + langName(), '<div class="v14-card"><p class="v14-sub">Latihan mendengarkan v15: putar semua kalimat sekaligus, sembunyikan terjemahan untuk menguji pemahaman, lalu rekam suaramu dan cek kemiripannya dengan kalimat asli (penilaian otomatis sederhana memakai pengenal suara browser — bukan AI penuh).</p>' +
    '<div class="v14-actions"><button type="button" class="btn btn-primary" onclick="v15PlayAll()">▶ Putar Semua</button>' +
    '<button type="button" class="btn btn-ghost" id="v15-hide-tr" onclick="v15ToggleTr()">🙈 Sembunyikan Terjemahan</button></div>' + rows + '</div>');
};
window.v15PlayAll = function(){
  var items = window.__v15ListenItems || [];
  try { ttsSpeakSeq(items.map(function(v){ return v.ex; }), ttsLangForMode()); } catch(e){ items.forEach(function(v, i){ setTimeout(function(){ try { ttsSpeak(v.ex, ttsLangForMode()); } catch(_){} }, i * 2600); }); }
};
window.v15ToggleTr = function(){
  var btn = document.getElementById("v15-hide-tr");
  var els = document.querySelectorAll(".v15-listen-id");
  var hide = els.length && !els[0].hidden;
  els.forEach(function(el){ el.hidden = hide; });
  if (btn) btn.textContent = hide ? "👁️ Tampilkan Terjemahan" : "🙈 Sembunyikan Terjemahan";
};
window.v15RecCheck = function(i){
  var items = window.__v15ListenItems || [], v = items[i], msg = document.getElementById("v15-listen-msg-" + i); if (!v || !msg) return;
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR){ msg.innerHTML = '<p class="v14-sub">Browser ini tidak mendukung pengenal suara. Cek manual: tekan 🔊 Putar, tirukan dengan suara keras, lalu bandingkan dengan teks kalimat di atas.</p>'; return; }
  var rec = new SR();
  try { rec.lang = ttsLangForMode(); } catch(e){}
  rec.interimResults = false; rec.maxAlternatives = 1;
  msg.innerHTML = '<p class="v14-sub">🎙️ Mendengarkan… ucapkan kalimatnya sekarang.</p>';
  rec.onresult = function(ev){
    var said = ev.results[0][0].transcript || "";
    var a = v15NormT(said).split(" ").filter(Boolean), b = v15NormT(v.ex).split(" ").filter(Boolean);
    var hit = a.filter(function(w){ return b.indexOf(w) >= 0; }).length;
    var pct = b.length ? Math.round(hit / b.length * 100) : 0;
    msg.innerHTML = '<p>Kamu mengucapkan: <b>' + v15Esc(said) + '</b></p><p class="' + (pct >= 80 ? "v15-ok" : "v15-no") + '">Kemiripan kata: ' + pct + '% ' + (pct >= 80 ? "· Bagus sekali! ✓" : "· Coba dengarkan lagi lalu ulangi pelan-pelan.") + '</p>';
    if (pct >= 80) { try { v14Xp(5); } catch(e){} }
  };
  rec.onerror = function(){ msg.innerHTML = '<p class="v14-sub">Rekaman gagal (izin mikrofon?). Cek manual: putar audionya, tirukan, bandingkan dengan teksnya.</p>'; };
  try { rec.start(); } catch(e){ msg.innerHTML = '<p class="v14-sub">Rekaman tidak bisa dimulai di browser ini.</p>'; }
};
// ---------- v15: menu Kuis Latihan + 3 jenis soal baru + Listening Plus ----------
var _v15OrigPractice = v14PagePractice;
v14PagePractice = function(){
  _v15OrigPractice();
  var body = document.getElementById("v14-body"); if (!body) return;
  var card = body.querySelector(".v14-card"); if (!card) return;
  var extra = document.createElement("div");
  extra.innerHTML = '<h4 class="v14-lvl-head">🆕 Jenis Soal Baru (v15)</h4><div class="v14-filters">' +
    '<button type="button" onclick="v15StartOrder()">🧩 Urutan Kata</button>' +
    '<button type="button" onclick="v15StartTranslate()">🌐 Translate</button>' +
    '<button type="button" onclick="v15StartMatch()">🃏 Match Pairs</button>' +
    '<button type="button" onclick="v15Listening()">🎧 Listening Plus</button></div>' +
    '<p class="v14-sub">Urutan Kata: susun kata acak jadi kalimat benar · Translate: ketik terjemahan kalimat · Match Pairs: pasangkan kata dengan artinya · Listening Plus: putar semua + sembunyikan terjemahan + rekam &amp; cek.</p>';
  card.appendChild(extra);
};

// ---------- v15: Bank Soal JLPT (Jepang) ----------
window.v15JlptPage = function(level){
  var bank = (typeof JLPT_BANK !== "undefined") ? JLPT_BANK : [];
  var levels = ["N5", "N4", "N3"];
  var counts = levels.map(function(lv){ return lv + ": " + bank.filter(function(q){ return q[0] === lv; }).length + " soal"; }).join(" · ");
  var html = '<div class="v14-card"><p class="v14-sub">Bank soal JLPT asli DidiGo (v15): Reading, Listening (transkrip dibacakan TTS), dan Grammar per level — lengkap dengan kunci + pembahasan Bahasa Indonesia. Total ' + bank.length + ' soal (' + counts + ').</p><div class="v14-filters">' +
    levels.map(function(lv){ return '<button type="button" class="' + ((level === lv) ? "on" : "") + '" onclick="v15JlptStart(\'' + lv + '\')">Mulai Latihan ' + lv + ' (12 soal)</button>'; }).join("") + '</div>' +
    bank.map(function(q){ return '<article class="v14-read-item"><h4>' + q[0] + ' · ' + q[1] + '</h4>' + (q[2] ? '<p>' + v15Esc(q[2]) + (q[1] === "Listening" ? ' ' + v15TtsBtn(q[2], "🔊 Dengarkan") : '') + '</p>' : '') + '<p><b>' + v15Esc(q[3]) + '</b></p><p class="v14-sub">Kunci: ' + v15Esc(q[4][q[5]]) + ' — ' + v15Esc(q[6]) + '</p></article>'; }).join("") + '</div>';
  v14ShowView("🎌 Bank Soal JLPT — Jepang", html);
};
window.v15JlptStart = function(level){
  var bank = (typeof JLPT_BANK !== "undefined") ? JLPT_BANK.filter(function(q){ return q[0] === level; }) : [];
  if (!bank.length) return;
  var qs = bank.map(function(q){
    var ctxHtml = "";
    if (q[1] === "Listening") ctxHtml = v15TtsBtn(q[2], "🔊 Dengarkan Transkripnya");
    return { kind: "mcq", q: (q[2] && q[1] !== "Listening" ? q[2] + " — " : "") + q[3], ctx: "JLPT " + level + " · " + q[1] + " · jawaban benar +5 XP.", ctxHtml: ctxHtml, opts: q[4], answer: q[5], speak: q[4].slice(), explain: q[6] };
  });
  v14RunQuiz("Simulasi JLPT " + level, qs, function(){ return '<p>Bank JLPT lengkapnya bisa kamu baca lagi di halaman Bank Soal JLPT (menu v15 di sidebar).</p>'; });
};
// ---------- v15: Pusat Ujian Jepang + tombol Bank JLPT ----------
var _v15OrigExams = v14PageExams;
v14PageExams = function(){
  _v15OrigExams();
  if (LANGUAGE_CODE !== "ja") return;
  var body = document.getElementById("v14-body"); if (!body) return;
  var card = body.querySelector(".v14-card"); if (!card) return;
  var d = document.createElement("article"); d.className = "v14-read-item";
  d.innerHTML = '<h4>🎌 Bank Soal JLPT (v15)</h4><p>36 soal Reading, Listening, dan Grammar untuk N5, N4, dan N3 — dengan kunci + pembahasan Bahasa Indonesia.</p><button type="button" class="btn btn-primary" onclick="v15JlptPage()">Buka Bank Soal JLPT</button>';
  card.appendChild(d);
};
// ---------- v15: Conversation Cheat Sheet (frasa ringkas 1 halaman per situasi) ----------
window.v15ConvCheat = function(){
  var dlgs = (typeof V14_DIALOGS !== "undefined" && V14_DIALOGS[LANGUAGE_CODE]) || [];
  var html = dlgs.map(function(d){
    return '<article class="v14-read-item v15-print-block"><h4>' + v15Esc(d[0]) + '</h4>' + d[1].map(function(l){ return '<p class="v15-phrase"><b>' + v15Esc(l[0]) + '</b> — ' + v15Esc(l[1]) + '</p>'; }).join("") + '</article>';
  }).join("");
  v14ShowView("💬 Frasa Percakapan — " + langName(), '<div class="v14-card"><p class="v14-sub">Versi ringkas 1 halaman per situasi dari semua Dialog Situasional ' + v15Esc(langName()) + ' (' + dlgs.length + ' situasi). Hafalkan frasa tebalnya — itu pola yang paling sering dipakai.</p><div class="v14-actions"><button type="button" class="btn btn-primary" onclick="window.print()">🖨️ Print / Simpan PDF</button></div>' + html + '</div>');
};
// ---------- v15: Writing Guide & Prompt (108 prompt + contoh jawaban) ----------
window.v15PromptsPage = function(){
  var list = (typeof WRITING_PROMPTS_V15 !== "undefined" && WRITING_PROMPTS_V15[LANGUAGE_CODE]) || [];
  window.__v15Prompts = list;
  var rows = list.slice(0, 30).map(function(p, i){
    return '<article class="v14-read-item"><h4>Prompt ' + (i + 1) + '</h4><p><b>' + v15Esc(p[1]) + '</b></p><p><span class="v15-ans" hidden>' + v15Esc(p[2]) + '</span> <button type="button" class="v14-mine" onclick="v15PromptToggle(this)">👁️ Lihat Contoh Jawaban</button> ' + v15TtsBtn(p[2], "🔊 Contoh") + '</p></article>';
  }).join("");
  v14ShowView("✍️ Writing Guide & Prompt — " + langName(), '<div class="v14-card"><p class="v14-sub">Total ' + list.length + ' prompt latihan menulis untuk ' + v15Esc(langName()) + ' (30 pertama ditampilkan di sini — daftar berputar mengikuti hari). Tulis jawabanmu sendiri dulu (target 5 kalimat), baru buka contoh jawabannya untuk membandingkan.</p><div id="v15-prompt-list">' + rows + '</div><div class="v14-actions"><button type="button" class="btn btn-ghost" onclick="v15PromptsMore()">Tampilkan 30 Berikutnya</button></div></div>');
};
window.__v15PromptOffset = 30;
window.v15PromptsMore = function(){
  var list = window.__v15Prompts || [], host = document.getElementById("v15-prompt-list"); if (!host) return;
  var start = window.__v15PromptOffset || 30;
  var slice = list.slice(start, start + 30);
  if (!slice.length){ window.__v15PromptOffset = 0; return v15PromptsPage(); }
  host.innerHTML += slice.map(function(p, i){
    return '<article class="v14-read-item"><h4>Prompt ' + (start + i + 1) + '</h4><p><b>' + v15Esc(p[1]) + '</b></p><p><span class="v15-ans" hidden>' + v15Esc(p[2]) + '</span> <button type="button" class="v14-mine" onclick="v15PromptToggle(this)">👁️ Lihat Contoh Jawaban</button></p></article>';
  }).join("");
  window.__v15PromptOffset = start + 30;
};
window.v15PromptToggle = function(btn){
  var span = btn.parentNode.querySelector(".v15-ans"); if (!span) return;
  span.hidden = !span.hidden;
  btn.textContent = span.hidden ? "👁️ Lihat Contoh Jawaban" : "🙈 Sembunyikan Contoh";
};
// ---------- v15: Cheat Sheet bisa di-print ----------
var _v15OrigCheat = v14PageCheat;
v14PageCheat = function(){
  _v15OrigCheat();
  var body = document.getElementById("v14-body"); if (!body) return;
  var card = body.querySelector(".v14-card"); if (!card) return;
  var d = document.createElement("div"); d.className = "v14-actions";
  d.innerHTML = '<button type="button" class="btn btn-primary" onclick="window.print()">🖨️ Print / Download PDF Cheat Sheet</button>';
  card.insertBefore(d, card.children[1] || null);
};

// ---------- v15: Menulis & Mengucapkan — animasi urutan goresan + Coba Tulis (canvas) ----------
var V15_STROKES = {"あ":3,"い":2,"う":2,"え":2,"お":3,"か":3,"き":4,"く":1,"け":3,"こ":2,"さ":3,"し":1,"す":2,"せ":3,"そ":2,"た":2,"ち":2,"つ":1,"て":1,"と":2,"な":4,"に":3,"ぬ":2,"ね":2,"の":1,"は":3,"ひ":1,"ふ":4,"へ":1,"ほ":4,"ま":3,"み":2,"む":3,"め":2,"も":3,"や":3,"ゆ":2,"よ":2,"ら":2,"り":2,"る":2,"れ":2,"ろ":3,"わ":2,"を":3,"ん":1,"ア":2,"イ":2,"ウ":3,"エ":3,"オ":3,"カ":2,"キ":3,"ク":2,"ケ":3,"コ":2,"サ":3,"シ":3,"ス":2,"セ":2,"ソ":2,"タ":3,"チ":3,"ツ":3,"テ":3,"ト":2,"ナ":2,"ニ":2,"ヌ":2,"ネ":4,"ノ":1,"ハ":2,"ヒ":2,"フ":1,"ヘ":1,"ホ":4,"マ":2,"ミ":3,"ム":2,"メ":2,"モ":3,"ヤ":2,"ユ":2,"ヨ":2,"ラ":2,"リ":2,"ル":2,"レ":2,"ロ":3,"ワ":2,"ヲ":2,"ン":2,"ㄱ":2,"ㄲ":2,"ㄴ":2,"ㄷ":3,"ㄸ":3,"ㄹ":5,"ㅁ":3,"ㅂ":4,"ㅃ":4,"ㅅ":2,"ㅆ":2,"ㅇ":1,"ㅈ":3,"ㅉ":3,"ㅊ":4,"ㅋ":3,"ㅌ":4,"ㅍ":4,"ㅎ":3,"ㅏ":2,"ㅐ":2,"ㅑ":3,"ㅒ":3,"ㅓ":2,"ㅔ":2,"ㅕ":3,"ㅖ":4,"ㅗ":2,"ㅛ":3,"ㅜ":2,"ㅠ":3,"ㅡ":1,"ㅣ":1,"日":4,"月":4,"山":3,"川":3,"人":2,"大":3,"小":3,"上":3,"下":3,"中":4,"田":5,"木":4,"水":4,"火":4,"金":8,"土":3,"年":6,"時":10,"分":4};
var V15_KANJI_BASIC = ["日","月","山","川","人","大","小","上","下","中","田","木","水","火","金","土","年","時","分"];
function v15Letters(){
  var out = [];
  function glyph(e){ return typeof e === "string" ? e : (e && e[0]) || ""; }
  if (LANGUAGE_CODE === "ko"){
    try { HANGUL_CONS.forEach(function(e){ out.push(glyph(e)); }); } catch(e){}
    try { HANGUL_VOW.forEach(function(e){ out.push(glyph(e)); }); } catch(e){}
  } else if (LANGUAGE_CODE === "ja"){
    try { HIRAGANA_46.forEach(function(e){ out.push(glyph(e)); }); } catch(e){}
    try { KATAKANA_46.forEach(function(e){ out.push(glyph(e)); }); } catch(e){}
    V15_KANJI_BASIC.forEach(function(k){ out.push(k); });
  }
  return out.filter(Boolean);
}
function v15StrokeCount(g){ if (V15_STROKES[g]) return V15_STROKES[g]; return 2; }
window.v15InjectWriting = function(){
  var wv = document.getElementById("writing-view"); if (!wv || document.getElementById("v15-write-panel")) return;
  var letters = v15Letters(); if (!letters.length) return;
  var panel = document.createElement("section");
  panel.id = "v15-write-panel"; panel.className = "v14-card";
  panel.innerHTML = '<h3>✍️ v15 — Animasi Urutan Goresan &amp; Coba Tulis</h3>' +
    '<p class="v14-sub">Pilih huruf, tekan “Animasi” untuk melihat urutan goresannya (angka 1, 2, 3, … muncul berurutan = urutan menulis yang benar), lalu coba tulis sendiri di kotak gambar. Pengecekan sederhana: jumlah goresanmu dibandingkan dengan jumlah goresan yang benar.</p>' +
    '<div class="v14-actions"><select id="v15-letter-sel" class="v15-input" style="max-width:180px">' + letters.map(function(g){ return '<option value="' + v15Esc(g) + '">' + v15Esc(g) + ' (' + v15StrokeCount(g) + ' goresan)</option>'; }).join("") + '</select>' +
    '<button type="button" class="btn btn-primary" onclick="v15AnimateStroke()">▶ Animasi Urutan Goresan</button></div>' +
    '<div class="v15-stroke-stage"><span id="v15-big-glyph">' + v15Esc(letters[0]) + '</span><span id="v15-stroke-num"></span></div>' +
    '<canvas id="v15-canvas" width="280" height="280"></canvas>' +
    '<div class="v14-actions"><button type="button" class="btn btn-primary" onclick="v15CheckStroke()">Cek Tulisanku</button><button type="button" class="btn btn-ghost" onclick="v15ClearCanvas()">Hapus</button></div>' +
    '<div id="v15-write-msg"></div>';
  wv.appendChild(panel);
  var sel = document.getElementById("v15-letter-sel");
  sel.addEventListener("change", function(){ document.getElementById("v15-big-glyph").textContent = sel.value; document.getElementById("v15-stroke-num").textContent = ""; v15DrawGuide(); });
  v15SetupCanvas(); v15DrawGuide();
};
window.v15AnimateStroke = function(){
  var sel = document.getElementById("v15-letter-sel"); if (!sel) return;
  var g = sel.value, n = v15StrokeCount(g), num = document.getElementById("v15-stroke-num"), big = document.getElementById("v15-big-glyph");
  big.textContent = g; num.textContent = "";
  for (var i = 1; i <= n; i++){ (function(i){ setTimeout(function(){ num.textContent = "Goresan " + i + " dari " + n; big.style.opacity = 0.35 + 0.65 * (i / n); if (i === n) num.textContent = "Selesai — " + n + " goresan. Sekarang coba tulis sendiri di bawah!"; }, i * 650); })(i); }
};
var V15_DRAW = { strokes: 0, drawing: false };
function v15SetupCanvas(){
  var cv = document.getElementById("v15-canvas"); if (!cv) return;
  var ctx = cv.getContext("2d");
  function pos(e){ var r = cv.getBoundingClientRect(); var t = e.touches ? e.touches[0] : e; return { x: (t.clientX - r.left) * (cv.width / r.width), y: (t.clientY - r.top) * (cv.height / r.height) }; }
  function start(e){ V15_DRAW.drawing = true; V15_DRAW.strokes++; var p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); e.preventDefault(); }
  function move(e){ if (!V15_DRAW.drawing) return; var p = pos(e); ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.strokeStyle = "#333a33"; ctx.lineTo(p.x, p.y); ctx.stroke(); e.preventDefault(); }
  function end(){ V15_DRAW.drawing = false; }
  cv.addEventListener("pointerdown", start); cv.addEventListener("pointermove", move); window.addEventListener("pointerup", end);
  cv.addEventListener("touchstart", start, { passive: false }); cv.addEventListener("touchmove", move, { passive: false }); cv.addEventListener("touchend", end);
}
function v15DrawGuide(){
  var cv = document.getElementById("v15-canvas"), sel = document.getElementById("v15-letter-sel"); if (!cv || !sel) return;
  var ctx = cv.getContext("2d");
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = "#e7e2d4"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cv.width / 2, 0); ctx.lineTo(cv.width / 2, cv.height); ctx.moveTo(0, cv.height / 2); ctx.lineTo(cv.width, cv.height / 2); ctx.stroke();
  ctx.font = "200px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "rgba(37,99,235,0.13)";
  ctx.fillText(sel.value, cv.width / 2, cv.height / 2 + 8);
  V15_DRAW.strokes = 0;
}
window.v15DrawGuide = v15DrawGuide;
window.v15ClearCanvas = function(){ v15DrawGuide(); var m = document.getElementById("v15-write-msg"); if (m) m.innerHTML = ""; };
window.v15CheckStroke = function(){
  var sel = document.getElementById("v15-letter-sel"), msg = document.getElementById("v15-write-msg"); if (!sel || !msg) return;
  var want = v15StrokeCount(sel.value), got = V15_DRAW.strokes;
  if (got === 0){ msg.innerHTML = '<p class="v15-no">Kamu belum menulis apa pun. Coba tulis huruf ' + v15Esc(sel.value) + ' di kotak gambar dulu!</p>'; return; }
  if (got === want){ msg.innerHTML = '<p class="v15-ok">✓ Jumlah goresan tepat: ' + got + ' goresan — sesuai urutan untuk huruf ' + v15Esc(sel.value) + '! (Cek sederhana: bentuk & arah goresan tetap perlu dibandingkan dengan contoh huruf di atas.)</p>'; try { v14Xp(5); } catch(e){} }
  else msg.innerHTML = '<p class="v15-no">Jumlah goresanmu ' + got + ', seharusnya ' + want + ' untuk huruf ' + v15Esc(sel.value) + '. Tekan Animasi untuk melihat urutannya, hapus, lalu coba lagi.</p>';
};
var _v15OrigOpenWriting = window.openWritingPage;
if (typeof _v15OrigOpenWriting === "function"){
  window.openWritingPage = function(){ _v15OrigOpenWriting(); setTimeout(function(){ try { v15InjectWriting(); } catch(e){} }, 60); };
}
// ---------- v15: menu tambahan di sidebar + routing ----------
var _v15PrevGo = window.v14Go;
window.v14Go = function(page, arg){
  if (page === "jlpt") return v15JlptPage(arg);
  if (page === "frasa") return v15ConvCheat();
  if (page === "prompt") return v15PromptsPage();
  if (page === "listening") return v15Listening();
  return _v15PrevGo(page, arg);
};
function v15InjectMenu(){
  var sb = document.getElementById("v14-sidebar"); if (!sb || document.getElementById("v15-menu")) return;
  var d = document.createElement("div"); d.id = "v15-menu";
  d.innerHTML = '<p class="v14-side-group">BARU v15</p>' +
    '<button type="button" onclick="v14Go(\'prompt\')">✍️ Writing Prompt (108)</button>' +
    '<button type="button" onclick="v14Go(\'frasa\')">💬 Frasa Percakapan</button>' +
    '<button type="button" onclick="v14Go(\'listening\')">🎧 Listening Plus</button>' +
    '<button type="button" id="v15-menu-jlpt" onclick="v14Go(\'jlpt\')">🎌 Bank Soal JLPT</button>';
  sb.appendChild(d);
}
document.addEventListener("DOMContentLoaded", function(){ setTimeout(v15InjectMenu, 300); });
setTimeout(v15InjectMenu, 1200);
try { window.__v15Game = function(){ return V15_GAME; }; } catch(e){}
})();


// ===== v16.4: BAR SCROLL ASLI di bawah header =====
// Garis tipis di bawah header (#top-progress-fill) sekarang
// menunjukkan POSISI SCROLL halaman, bukan progres pelajaran:
// lebar = scrollTop / (scrollHeight - clientHeight) x 100%.
// Di atas = 0%, di dasar halaman = 100%. Progres pelajaran
// tetap ditampilkan hanya di kartu "Progres levelmu" (hero).
(function v16ScrollBar(){
  var fill = document.getElementById("top-progress-fill");
  if (!fill) return;
  var ticking = false;
  function update(){
    ticking = false;
    var de = document.documentElement;
    var max = de.scrollHeight - de.clientHeight;
    var y = window.scrollY || de.scrollTop || 0;
    var pct = max > 0 ? Math.min(100, Math.max(0, y / max * 100)) : 100;
    fill.style.width = pct + "%";
  }
  window.addEventListener("scroll", function(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();


// ===== v16.6: LAYOUT SIDEBAR KIRI (seperti Volingo) =====
// Sidebar kiri tetap berisi: logo DidiGo (atas), menu navigasi,
// pemilih bahasa, dan profil/XP/streak (bawah). Konten berjalan
// di area kanan. Di ponsel (<=640px) elemen-elemen itu kembali
// ke topbar dan sidebar menjadi bottom-nav (lihat styles.css).
(function v16SidebarLayout(){
  var aside = document.getElementById("v14-sidebar");
  var brand = document.querySelector(".brand");
  var lang = document.querySelector(".lang-switch");
  var auth = document.getElementById("auth-bar");
  var ti = document.querySelector(".topbar-inner");
  if (!aside || !brand || !lang || !auth || !ti) return;
  var head = document.createElement("div"); head.className = "side-head";
  var foot = document.createElement("div"); foot.className = "side-foot";
  aside.insertBefore(head, aside.firstChild);
  aside.appendChild(foot);
  function toSidebar(){
    head.appendChild(brand); foot.appendChild(auth);
    document.body.classList.add("layout-side");
  }
  function toTopbar(){
    ti.appendChild(brand); ti.appendChild(auth);
    document.body.classList.remove("layout-side");
  }
  window.__v16ApplyLayout = function(mobile){ if (mobile) toTopbar(); else toSidebar(); };
  var mq = null;
  try { mq = window.matchMedia("(max-width: 640px)"); } catch(e){}
  if (mq) {
    var apply = function(){ window.__v16ApplyLayout(!!mq.matches); };
    if (mq.addEventListener) mq.addEventListener("change", apply);
    else if (mq.addListener) mq.addListener(apply);
    apply();
  } else { toSidebar(); }
})();

// ===== v16.7: STRUKTUR MENYELURUH, RANCANGAN DIDIGO SENDIRI =====
// Idenya umum (sidebar + bar atas + panel kanan + navigasi bawah),
// tapi semua struktur, nama class, bentuk & kata di sini dirancang
// ulang khas DidiGo — bukan salinan layanan lain.
(function v16Shell(){
  var header = document.querySelector("header.topbar");
  var aside = document.getElementById("v14-sidebar");
  // --- (ATAS) Bar utilitas kanan: pencarian + pemilih bahasa ---
  var util = document.createElement("div"); util.id = "v16-toputil"; util.className = "v16-toputil";
  var search = document.querySelector(".v14-search");
  var lang = document.querySelector(".lang-switch");
  if (search) util.appendChild(search);
  if (lang) util.appendChild(lang);
  if (header) header.appendChild(util);
  // --- (KIRI) Kartu pengguna + pill streak di kepala sidebar ---
  if (aside) {
    var head = aside.querySelector(".side-head");
    var card = document.createElement("div"); card.className = "v16-usercard";
    card.innerHTML = '<span class="v16-avatar" id="v16-avatar">T</span>' +
      '<span class="v16-user-meta"><b id="v16-username">Tamu</b><small id="v16-userxp">⭐ 0 XP</small></span>' +
      '<button type="button" class="v16-gear" id="v16-gear" aria-label="Pengaturan akun">⚙️</button>';
    var streak = document.createElement("p"); streak.className = "v16-streakpill"; streak.id = "v16-streakpill"; streak.textContent = "🔥 0 hari streak";
    if (head) { head.appendChild(card); head.appendChild(streak); }
    var gear = card.querySelector("#v16-gear");
    if (gear) gear.addEventListener("click", function(){
      var login = document.getElementById("btn-login");
      if (login && !login.hidden && login.offsetParent !== null) { login.click(); return; }
      var foot = aside.querySelector(".side-foot"); if (foot) foot.scrollIntoView({ behavior: "smooth", block: "end" });
    });
  }
  function v16SyncUser(){
    var info = document.getElementById("user-info");
    var raw = info ? info.textContent.trim() : "";
    var name = "Tamu";
    if (raw && raw !== "Belum masuk") { var m = raw.replace(/^Masuk sebagai\s*/i, ""); name = m.includes("@") ? m.split("@")[0] : m; }
    var un = document.getElementById("v16-username"); if (un) un.textContent = name;
    var av = document.getElementById("v16-avatar"); if (av) av.textContent = (name.charAt(0) || "T").toUpperCase();
    var sb = document.getElementById("streak-badge"); var sp = document.getElementById("v16-streakpill");
    if (sb && sp) sp.textContent = "🔥 " + sb.textContent.replace(/^🔥\s*/, "").replace(/\s*hari\s*$/, "") + " hari streak";
    var xb = document.getElementById("xp-badge"); var ux = document.getElementById("v16-userxp");
    if (xb && ux) ux.textContent = xb.textContent;
    v16RenderHomeCards();
  }
  window.__v16SyncUser = v16SyncUser;
  try {
    var mo = new MutationObserver(function(){ v16SyncUser(); });
    ["user-info", "streak-badge", "xp-badge"].forEach(function(id){ var e = document.getElementById(id); if (e) mo.observe(e, { childList: true, characterData: true, subtree: true }); });
  } catch(e){}
  // --- Menu aktif: pill krem terracotta (gaya DidiGo) ---
  window.v16MarkActive = function(page){
    if (!aside) return;
    aside.querySelectorAll("button").forEach(function(b){
      var oc = b.getAttribute("onclick") || "";
      b.classList.toggle("is-active", oc.indexOf("'" + page + "'") >= 0);
    });
  };
  if (aside) aside.addEventListener("click", function(ev){
    var b = ev.target.closest ? ev.target.closest("button") : null;
    if (!b) return;
    var oc = b.getAttribute("onclick") || "";
    var m = oc.match(/v14Go\('([a-z-]+)'\)/);
    if (m) v16MarkActive(m[1]);
  });
  // --- (BERANDA) Sapaan + kartu Bahasa Aktif ---
  var CURR = { en: "Kurikulum IELTS · TOEFL · TOEIC", ko: "Kurikulum TOPIK · EPS-TOPIK", ja: "Kurikulum JLPT · JFT-Basic" };
  var GLYPH = { en: "Aa", ko: "한", ja: "あ" };
  function v16RenderHomeCards(){
    var wrap = document.getElementById("v14-home-wrap"); if (!wrap) return;
    var g = document.getElementById("v16-greeting");
    if (!g) {
      g = document.createElement("div"); g.id = "v16-greeting"; g.className = "v16-greeting";
      var act = document.createElement("div"); act.id = "v16-active-lang"; act.className = "v16-active-lang";
      wrap.insertBefore(g, wrap.firstChild); wrap.insertBefore(act, g.nextSibling);
    }
    var act2 = document.getElementById("v16-active-lang");
    var h = new Date().getHours();
    var sapa = h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 19 ? "Selamat sore" : "Selamat malam";
    var un = document.getElementById("v16-username");
    var name = un ? un.textContent : "Tamu";
    var done = doneIds(), lessons = curLessons();
    var doneN = lessons.filter(function(l){ return done.includes(l.id); }).length;
    var cur = lessons.find(function(l){ return !done.includes(l.id); });
    var lvl = cur ? cur.level : (lessons.length ? lessons[lessons.length - 1].level : "A0");
    var sb = document.getElementById("streak-badge");
    g.innerHTML = '<p class="v16-greet-sub">' + sapa + ' · ' + (sb ? esc(sb.textContent) : "") + '</p>' +
      '<h2 class="v16-greet-title">Halo, ' + esc(name) + '. Lanjut belajar ' + esc(langName().split("·")[1] ? langName() : langName()) + '?</h2>';
    if (act2) act2.innerHTML = '<span class="v16-lang-glyph">' + GLYPH[LANGUAGE_CODE] + '</span>' +
      '<span class="v16-active-meta"><small>BAHASA AKTIF</small><b>' + esc(langName()) + '</b></span>' +
      '<span class="v16-active-curr">' + CURR[LANGUAGE_CODE] + ' · levelmu ' + lvl + '</span>' +
      '<span class="v16-active-count">' + doneN + '/' + lessons.length + ' pelajaran</span>';
  }
  window.v16RenderHomeCards = v16RenderHomeCards;
  if (typeof window.applyLanguage === "function") {
    var _al = window.applyLanguage;
    window.applyLanguage = function(l){ _al(l); v16RenderHomeCards(); };
  }
  v16RenderHomeCards();
  v16SyncUser();
  // --- (BAWAH) Label versi tetap ---
  var ver = document.createElement("div"); ver.id = "v16-version"; ver.className = "v16-version"; ver.textContent = "DidiGo v16";
  document.body.appendChild(ver);
})();

// ===== v16.7: Halaman JALUR BELAJAR (roadmap + saring + kartu) =====
var __v16JalurFilter = "semua", __v16JalurQuery = "";
function v16RenderJalur(){
  var lessons = curLessons(), done = doneIds();
  var next = lessons.find(function(l){ return !done.includes(l.id); });
  var levels = [];
  lessons.forEach(function(l){ if (!levels.includes(l.level)) levels.push(l.level); });
  var curLvl = next ? next.level : levels[levels.length - 1];
  var road = levels.map(function(lv){
    var items = lessons.filter(function(l){ return l.level === lv; });
    var dn = items.filter(function(l){ return done.includes(l.id); }).length;
    return '<li class="v16-road-item' + (lv === curLvl ? " is-now" : "") + '"><span class="v16-road-dot">' + lv + '</span>' +
      '<span class="v16-road-meta"><b>' + lv + ' — ' + esc(items[0].level_name) + '</b><small>' + dn + '/' + items.length + ' pelajaran selesai</small></span></li>';
  }).join("");
  var counts = { semua: lessons.length, berikut: next ? 1 : 0, selesai: lessons.filter(function(l){ return done.includes(l.id); }).length, belum: lessons.filter(function(l){ return !done.includes(l.id) && l !== next; }).length };
  var chips = [["semua", "Semua pelajaran"], ["berikut", "Langkah berikutnya"], ["selesai", "Selesai"], ["belum", "Belum mulai"]].map(function(c){
    return '<button type="button" class="v16-chip' + (__v16JalurFilter === c[0] ? " is-on" : "") + '" onclick="__v16SetJalurFilter(\'' + c[0] + '\')">' + c[1] + ' · ' + counts[c[0]] + '</button>';
  }).join("");
  var cards = lessons.map(function(l, i){
    var inLvl = lessons.filter(function(x){ return x.level === l.level; });
    var code = l.level + " · " + (inLvl.indexOf(l) + 1) + "/" + inLvl.length;
    var isDone = done.includes(l.id), isNext = next && l.id === next.id;
    var st = isDone ? "done" : isNext ? "berikut" : "belum";
    return '<article class="v16-mod-card" data-st="' + st + '" data-title="' + esc(l.title.toLowerCase()) + '">' +
      '<p class="v16-mod-meta"><span class="v16-mod-code">' + code + '</span>' +
      (isNext ? '<span class="v16-tag v16-tag-rec">Direkomendasikan</span>' : "") +
      '<span class="v16-tag ' + (isDone ? "v16-tag-done" : "v16-tag-todo") + '">' + (isDone ? "✓ Selesai" : "Belum mulai") + '</span></p>' +
      '<h3 class="v16-mod-title">' + esc(l.title) + '</h3>' +
      '<p class="v16-mod-desc">' + esc(l.desc_id) + '</p>' +
      '<p class="v16-mod-foot"><span>10 soal · +' + l.xp + ' XP · ±8 menit</span>' +
      '<button type="button" class="btn ' + (isDone ? "btn-outline" : "btn-primary") + '" onclick="window.startLesson(\'' + l.id + '\')">' + (isDone ? "Ulangi" : "Mulai") + '</button></p></article>';
  }).join("");
  var html =
    (next ? '<div class="v16-next-banner"><p>Langkah berikutnya: <b>' + esc(next.title) + ' (' + next.level + ')</b></p><button type="button" class="btn btn-primary" onclick="window.startLesson(\'' + next.id + '\')">Mulai pelajaran ini →</button></div>' : '<div class="v16-next-banner"><p>🎉 Semua pelajaran bahasa ini sudah selesai. Hebat!</p></div>') +
    '<div class="v16-jalur-grid"><aside class="v16-roadmap"><h3 class="v16-side-title">PETA LEVELMU</h3>' +
    '<p class="v16-road-now">Kamu di ' + curLvl + ' · ' + (next ? 'pelajaran berikutnya: ' + esc(next.title) : 'semua selesai') + '</p>' +
    '<ul class="v16-road">' + road + '</ul></aside>' +
    '<div class="v16-jalur-main"><input type="search" id="v16-jalur-search" class="v16-jalur-search" placeholder="Cari pelajaran berdasarkan nama..." value="' + esc(__v16JalurQuery) + '" oninput="__v16SetJalurQuery(this.value)">' +
    '<div class="v16-chips">' + chips + '</div>' +
    '<div class="v16-mod-grid" id="v16-mod-grid">' + cards + '</div>' +
    '<p class="v16-sub" id="v16-jalur-empty" hidden>Tidak ada pelajaran yang cocok dengan saringan ini.</p></div></div>';
  v14ShowView("Jalur Belajar — " + langName(), html);
  __v16ApplyJalurFilter();
  if (window.v16MarkActive) v16MarkActive("modul");
}
function __v16ApplyJalurFilter(){
  var grid = document.getElementById("v16-mod-grid"); if (!grid) return;
  var n = 0;
  grid.querySelectorAll(".v16-mod-card").forEach(function(c){
    var okF = __v16JalurFilter === "semua" || c.dataset.st === __v16JalurFilter;
    var okQ = !__v16JalurQuery || (c.dataset.title || "").includes(__v16JalurQuery);
    c.hidden = !(okF && okQ); if (!c.hidden) n++;
  });
  var e = document.getElementById("v16-jalur-empty"); if (e) e.hidden = n > 0;
}
window.__v16SetJalurFilter = function(f){ __v16JalurFilter = f; v16RenderJalur(); var inp = document.getElementById("v16-jalur-search"); if (inp) inp.value = __v16JalurQuery; };
window.__v16SetJalurQuery = function(q){ __v16JalurQuery = (q || "").trim().toLowerCase(); __v16ApplyJalurFilter(); };
// --- Bungkus v14Go: 'modul' -> halaman Jalur DidiGo ---
var __v16PrevGo = window.v14Go;
window.v14Go = function(page, arg){
  if (page === "modul") return v16RenderJalur();
  var r = __v16PrevGo(page, arg);
  if (window.v16MarkActive) v16MarkActive(page);
  return r;
};
// ===== v16.7: Isi pelajaran — breadcrumb, panel kanan, navigasi bawah =====
var __v16OrigStart = window.startLesson;
window.startLesson = function(id){
  __v16OrigStart(id);
  var lessons = curLessons(), idx = lessons.findIndex(function(l){ return l.id === id; });
  if (idx < 0) return;
  var lesson = lessons[idx], view = document.getElementById("lesson-view"); if (!view) return;
  var crumb = document.getElementById("v16-crumb");
  if (!crumb) { crumb = document.createElement("nav"); crumb.id = "v16-crumb"; crumb.className = "v16-crumb"; view.insertBefore(crumb, view.firstChild); }
  crumb.innerHTML = '<button type="button" onclick="v14Go(\'home\')">Beranda</button> <span>›</span> <button type="button" onclick="v14Go(\'modul\')">Jalur Belajar</button> <span>›</span> <b>' + esc(lesson.title) + '</b>';
  var panel = document.getElementById("v16-lesson-panel");
  if (!panel) { panel = document.createElement("aside"); panel.id = "v16-lesson-panel"; panel.className = "v16-lesson-panel"; view.appendChild(panel); }
  panel.innerHTML = '<h3 class="v16-side-title">BAGIAN DALAM PELAJARAN</h3><ol class="v16-parts">' +
    '<li>1 · Kosakata & pola kalimat</li><li>2 · Contoh & dialog</li><li class="is-now">3 · Latihan 10 soal</li><li>4 · Awas jebakan & cek mandiri</li></ol>' +
    '<h3 class="v16-side-title">LANJUT</h3><div class="v16-panel-links">' +
    '<button type="button" class="btn btn-outline" onclick="v14Go(\'kosakata\')">Semua kosakata bahasa ini</button>' +
    '<button type="button" class="btn btn-outline" onclick="v14Go(\'flash\')">Kartu hafalan SRS</button></div>';
  var nav = document.getElementById("v16-lesson-nav");
  if (!nav) { nav = document.createElement("div"); nav.id = "v16-lesson-nav"; nav.className = "v16-lesson-nav"; view.appendChild(nav); }
  var prev = lessons[idx - 1], nxt = lessons[idx + 1];
  nav.innerHTML =
    (prev ? '<button type="button" class="btn btn-outline" onclick="window.startLesson(\'' + prev.id + '\')">← Pelajaran sebelumnya</button>' : '<span></span>') +
    (nxt ? '<button type="button" class="btn btn-primary" onclick="window.startLesson(\'' + nxt.id + '\')">Lanjut ke ' + esc(nxt.title) + ' →</button>' : '<span class="v16-sub">Ini pelajaran terakhir di bahasa ini 🎉</span>');
  view.classList.add("v16-lesson-shell");
};

// ===== v16.8: Navigasi bawah khusus PONSEL + tombol buka pencarian =====
// Di layar kecil sidebar samping disembunyikan; sebagai gantinya ada
// bottom-nav 5 tombol yang gampang dijangkau jempol.
(function v16BottomNav(){
  var util = document.getElementById("v16-toputil");
  if (util) {
    var tg = document.createElement("button");
    tg.type = "button"; tg.id = "v16-search-toggle"; tg.className = "v16-search-toggle";
    tg.setAttribute("aria-label", "Buka pencarian"); tg.textContent = "🔍";
    tg.addEventListener("click", function(){ util.classList.toggle("search-open"); var i = document.getElementById("v14-search-input"); if (i && util.classList.contains("search-open")) i.focus(); });
    var search = util.querySelector(".v14-search");
    if (search) util.insertBefore(tg, search); else util.appendChild(tg);
  }
  var nav = document.createElement("nav"); nav.id = "v16-bottomnav"; nav.className = "v16-bottomnav";
  nav.setAttribute("aria-label", "Navigasi bawah");
  var items = [["home", "🏠", "Beranda"], ["modul", "🧩", "Jalur"], ["latihan", "✍️", "Latihan"], ["ujian", "🎓", "Ujian"], ["profil", "👤", "Profil"]];
  items.forEach(function(it){
    var b = document.createElement("button"); b.type = "button"; b.dataset.page = it[0];
    b.innerHTML = '<span class="bn-ico">' + it[1] + '</span><span class="bn-label">' + it[2] + '</span>';
    b.addEventListener("click", function(){
      if (it[0] === "profil") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
      window.v14Go(it[0]);
    });
    nav.appendChild(b);
  });
  document.body.appendChild(nav);
  function sync(page){
    nav.querySelectorAll("button").forEach(function(b){ b.classList.toggle("is-active", b.dataset.page === page); });
  }
  window.__v16SyncBottomNav = sync;
  var prev = window.v16MarkActive;
  window.v16MarkActive = function(page){ if (prev) prev(page); sync(page); };
  sync("home");
})();

// ===== v16.10: Perbaikan mobile — topbar ringkas, akun via Profil,
//        pulang ke beranda bersih (tanpa sisa tampilan latihan) =====
(function v16MobileFix(){
  // (a) Label bahasa ringkas di ponsel: EN / KO / JA
  var LABELS = { full: { en: "English", ko: "한국어 Korea", ja: "日本語 Jepang" }, mini: { en: "EN", ko: "KO", ja: "JA" } };
  function applyMobileTopbar(mini){
    ["en", "ko", "ja"].forEach(function(l){
      var b = document.getElementById("lang-btn-" + l);
      if (b) b.textContent = mini ? LABELS.mini[l] : LABELS.full[l];
    });
  }
  window.__v16ApplyMobileTopbar = applyMobileTopbar;
  try {
    var mq = window.matchMedia("(max-width: 640px)");
    var run = function(){ applyMobileTopbar(!!mq.matches); };
    if (mq.addEventListener) mq.addEventListener("change", run); else if (mq.addListener) mq.addListener(run);
    run();
  } catch(e){}
  // (b) Tombol Profil di bottom-nav membuka/menutup panel akun
  var nav = document.getElementById("v16-bottomnav");
  if (nav) nav.addEventListener("click", function(ev){
    var b = ev.target.closest ? ev.target.closest("button") : null;
    if (!b) return;
    if (b.dataset.page === "profil") document.body.classList.toggle("show-account");
    else document.body.classList.remove("show-account");
  }, true);
  // (c) Pulang ke beranda: sembunyikan SEMUA tampilan lain + gulir ke atas
  var origHome = window.showHomePage;
  if (typeof origHome === "function") {
    window.showHomePage = function(){
      origHome();
      ["v14-view", "mock-view", "writing-view"].forEach(function(id){ var e = document.getElementById(id); if (e) e.hidden = true; });
      document.body.classList.remove("show-account");
      window.scrollTo(0, 0);
    };
    ["btn-back-home", "btn-exit-lesson", "result-close", "result-back"].forEach(function(id){
      var b = document.getElementById(id);
      if (b) b.onclick = function(){ var m = document.getElementById("result-modal"); if (m) m.hidden = true; window.showHomePage(); };
    });
  }
  // (d) Mulai pelajaran: halaman v14 yang sedang terbuka harus ikut hilang
  var prevStart = window.startLesson;
  window.startLesson = function(id){
    var v = document.getElementById("v14-view"); if (v) v.hidden = true;
    document.body.classList.remove("show-account");
    return prevStart(id);
  };
})();

// ===== v16.11: Pola navigasi aplikasi — cluster kiri atas di halaman dalam:
//        [← kembali] [logo DidiGo] [☰ menu]. Satu ketukan ← = beranda bersih.
(function v16TopNav(){
  var wrap = document.createElement("div");
  wrap.id = "v16-topnav"; wrap.className = "v16-topnav"; wrap.hidden = true;
  var back = document.createElement("button");
  back.type = "button"; back.id = "v16-back-home"; back.className = "v16-back-arrow";
  back.textContent = "← Beranda"; back.setAttribute("aria-label", "Kembali ke beranda");
  back.title = "Kembali ke beranda";
  back.addEventListener("click", function(){
    var m = document.getElementById("result-modal"); if (m) m.hidden = true;
    document.body.classList.remove("nav-open");
    if (typeof window.showHomePage === "function") window.showHomePage();
    var v = document.getElementById("v14-view"); if (v) v.hidden = true;
    window.scrollTo(0, 0);
    sync();
  });
  var brand = document.createElement("span"); brand.className = "v16-topnav-brand";
  brand.innerHTML = '<span class="v16-topnav-mark">D</span><b>DidiGo</b>';
  var menu = document.createElement("button");
  menu.type = "button"; menu.id = "v16-menu-btn"; menu.className = "v16-menu-btn";
  menu.textContent = "☰"; menu.setAttribute("aria-label", "Buka atau tutup menu navigasi");
  menu.addEventListener("click", function(){
    if (window.matchMedia && window.matchMedia("(max-width: 640px)").matches) document.body.classList.toggle("nav-open");
    else document.body.classList.toggle("nav-collapsed");
  });
  var scrim = document.createElement("div"); scrim.id = "v16-nav-scrim"; scrim.className = "v16-nav-scrim";
  scrim.addEventListener("click", function(){ document.body.classList.remove("nav-open"); });
  wrap.appendChild(back); wrap.appendChild(brand); wrap.appendChild(menu);
  document.body.appendChild(scrim);
  document.body.appendChild(wrap);
  var aside = document.getElementById("v14-sidebar");
  if (aside) aside.addEventListener("click", function(ev){
    if (ev.target.closest && ev.target.closest("button")) document.body.classList.remove("nav-open");
  });
  function sync(){
    var inner = ["lesson-view", "v14-view", "mock-view", "writing-view"].some(function(id){
      var e = document.getElementById(id); return e && !e.hidden;
    });
    wrap.hidden = !inner;
    document.body.classList.toggle("has-back-btn", inner);
    if (!inner) document.body.classList.remove("nav-open");
  }
  window.__v16SyncBackBtn = sync;
  try {
    var mo = new MutationObserver(sync);
    ["lesson-view", "v14-view", "mock-view", "writing-view", "home-view"].forEach(function(id){
      var e = document.getElementById(id);
      if (e) mo.observe(e, { attributes: true, attributeFilter: ["hidden"] });
    });
  } catch(e){}
  sync();
})();
