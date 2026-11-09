// ===== KONFIGURASI SUPABASE =====
// Ganti dua nilai ini dengan URL & anon key proyek Supabase kamu
// (Supabase Dashboard > Settings > API). Anon key aman tampil di frontend
// karena data dilindungi Row Level Security di database.
const SUPABASE_URL = "https://tdwkghphdppwvznxcggz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HB_emJDuMKe3GflAeLqPrA_JAmYLLz8";
const LANGUAGE_CODE = "en"; // siap multi-bahasa: ganti/tambah 'ko','ja',...

let sb = null;
if (window.supabase && !SUPABASE_URL.startsWith("GANTI")) {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// ===== 13 CATATAN PENTING =====
const NOTES = [
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
const WORD_CLASSES = [
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

// ===== RENDER BERANDA =====
const $=id=>document.getElementById(id);
$("notes").innerHTML = NOTES.map(n=>`<details class="note-card"><summary>${n[0]}</summary><div class="note-body"><p>${n[1]}</p>`+
  n[2].map(e=>`<p class="note-example"><b>${e[0]}</b>${e[1]?`<br><span class="translation">Artinya: ${e[1]}</span>`:""}</p>`).join("")+`</div></details>`).join("");
$("word-classes").innerHTML = WORD_CLASSES.map(wc=>{ const pool=wc[2]; const t=pool[dayIndex(pool)];
  return `<details class="word-card"><summary>${wc[0]}</summary><div class="word-body"><p>${wc[1]}</p><div class="word-today">🌟 <span class="word-big">Kata Hari Ini: ${t[0]}</span> = ${t[1]}<p class="word-sentence"><b>${t[2]}</b><br><span class="translation">Artinya: ${t[3]}</span></p></div>`+
  `<p class="word-others">Contoh kata lain: ${pool.map(p=>p[0]+" ("+p[1]+")").join(", ")}</p></div></details>`;}).join("");
// Pelajaran yang sudah selesai di perangkat ini (untuk tanda "Selesai · ulangi")
function doneIds(){ try{ return JSON.parse(localStorage.getItem("ela_completed")||"[]"); }catch(e){ return []; } }
function markDone(id){ const d=doneIds(); if(!d.includes(id)){ d.push(id); localStorage.setItem("ela_completed",JSON.stringify(d)); } }
function renderLessons(){ const done=doneIds(); const groups={};
  LESSONS.forEach(l=>{ (groups[l.level]=groups[l.level]||[]).push(l); });
  $("lessons").innerHTML = Object.keys(groups).map(lv=>{ const items=groups[lv]; const first=items[0];
    return `<div class="level-group lvl-${lv}"><div class="level-head"><span class="level-pill">${lv}</span><span class="level-name">${first.level_name} · ${items.length} pelajaran</span></div><ol class="path">`+
    items.map(l=>{ const isDone=done.includes(l.id);
      return `<li class="path-node${isDone?" is-done":""}"><span class="node-dot" aria-hidden="true">${isDone?"✓":l.order}</span><div class="lesson-card"><div class="lesson-info"><p class="lesson-title">${l.title}</p><p class="lesson-desc">${l.desc_id}</p></div><div class="lesson-side"><span class="meta-chip">📝 10 soal</span><span class="xp-chip">+${l.xp} XP</span>${isDone?`<span class="done-chip">✓ Selesai</span><button class="btn btn-sm btn-again" onclick="startLesson('${l.id}')">Ulangi</button>`:`<button class="btn btn-sm btn-start" onclick="startLesson('${l.id}')">Mulai</button>`}</div></div></li>`; }).join("")+
    `</ol></div>`; }).join("");
  const pct=LESSONS.length?Math.round(done.filter(id=>LESSONS.some(l=>l.id===id)).length/LESSONS.length*100):0;
  const doneCount=done.filter(id=>LESSONS.some(l=>l.id===id)).length;
  ["hero-progress-fill","top-progress-fill"].forEach(id=>{ const el=$(id); if(el) el.style.width=pct+"%"; });
  const pt=$("hero-progress-text"); if(pt) pt.textContent=doneCount+" dari "+LESSONS.length+" pelajaran selesai"; }
renderLessons();

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
  const i = sentence.toLowerCase().indexOf(word.toLowerCase());
  if (i < 0) return sentence;
  return sentence.slice(0, i) + "___" + sentence.slice(i + word.length);
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
  const vocab = (typeof LESSON_VOCAB !== "undefined" && LESSON_VOCAB[lesson.id]) || [];
  const seedBase = lesson.order * 3 + lesson.level.charCodeAt(1);
  const enAll = vocab.map(v => v[0]), idAll = vocab.map(v => v[1]);
  const qs = [];
  if (vocab.length >= 4){
    const V = vocab;
    const mkId = (vi, seed) => { const r = rotatedOptions(idAll, V[vi][1], seed);
      return { ctx: "Pilih arti Bahasa Indonesia yang tepat untuk kata yang ditanyakan.",
        q: "Apa arti Bahasa Indonesia dari kata \u201C" + V[vi][0] + "\u201D?",
        translation: "Contoh: " + V[vi][2] + " \u2014 Artinya: " + V[vi][3],
        opts: r.opts.map(o => [o, ""]), answer: r.answer, full: V[vi][2], full_id: V[vi][3] }; };
    const mkEn = (vi, seed) => { const r = rotatedOptions(enAll, V[vi][0], seed);
      return { ctx: "Pilih kata Bahasa Inggris yang tepat untuk arti yang ditanyakan.",
        q: "Apa Bahasa Inggrisnya \u201C" + V[vi][1] + "\u201D?",
        translation: "Contoh: " + V[vi][2] + " \u2014 Artinya: " + V[vi][3],
        opts: r.opts.map(o => [o, ""]), answer: r.answer, full: V[vi][2], full_id: V[vi][3] }; };
    const mkBlank = (vi, seed) => { const r = rotatedOptions(enAll, V[vi][0], seed);
      return { ctx: "Konteks \u2014 baca dulu: " + V[vi][3] + " Kata yang hilang adalah kata yang artinya \u201C" + V[vi][1] + "\u201D.",
        q: "Lengkapi kalimat ini: " + blankOut(V[vi][2], V[vi][0]),
        translation: "Artinya (kalimat lengkap): " + V[vi][3],
        opts: r.opts.map(o => [o, ""]), answer: r.answer, full: V[vi][2], full_id: V[vi][3] }; };
    const mkSent = (vi, seed) => { const exIds = vocab.map(v => v[3]); const r = rotatedOptions(exIds, V[vi][3], seed);
      return { ctx: "Pilih terjemahan Bahasa Indonesia yang tepat untuk kalimat Bahasa Inggris ini.",
        q: "Apa arti kalimat ini: \u201C" + V[vi][2] + "\u201D",
        translation: "",
        opts: r.opts.map(o => [o, ""]), answer: r.answer, full: V[vi][2], full_id: V[vi][3] }; };
    // 10 soal: 4 kata pelajaran dipakai dalam beberapa bentuk soal yang BERBEDA
    // (arti kata, kata dari arti, lengkapi kalimat, arti kalimat) - tidak ada
    // soal yang teksnya sama persis di dalam satu latihan.
    qs.push(mkId(0, seedBase));        // 1  arti kata ke-1
    qs.push(mkEn(1, seedBase + 1));    // 2  kata Inggris dari arti ke-2
    qs.push(mkBlank(2, seedBase + 2)); // 3  lengkapi kalimat kata ke-3
    qs.push(mkBlank(3, seedBase + 3)); // 4  lengkapi kalimat kata ke-4
    qs.push(mkSent(0, seedBase + 4));  // 5  arti kalimat contoh kata ke-1
    qs.push(mkId(2, seedBase + 5));    // 6  arti kata ke-3
    qs.push(mkEn(3, seedBase + 6));    // 7  kata Inggris dari arti ke-4
    qs.push(mkId(1, seedBase + 7));    // 8  arti kata ke-2
    qs.push(mkEn(2, seedBase + 8));    // 9  kata Inggris dari arti ke-3
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
  $("home-view").hidden = true;
  const f = document.querySelector(".site-footer"); if (f) f.hidden = true;
  $("lesson-view").hidden = false;
  window.scrollTo({ top: 0 });
}
function showHomePage(){
  $("lesson-view").hidden = true;
  const f = document.querySelector(".site-footer"); if (f) f.hidden = false;
  $("home-view").hidden = false;
}
window.startLesson = function(id){
  const lesson = LESSONS.find(l => l.id === id);
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
  $("quiz-context").innerHTML = "<div class=\"context\"><b>Konteks — baca dulu sebelum menjawab</b><br>" + item.ctx + "</div>";
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
  item.opts.forEach((o, j) => { const b = $("opt-" + j); if (b){ b.disabled = true; if (j === item.answer) b.classList.add("is-correct"); else if (j === i) b.classList.add("is-wrong"); } });
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
  renderLessons();
  await saveProgress(xpEarned, pct);
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
  const i = LESSONS.findIndex(l => l.id === lesson.id);
  return (i >= 0 && i < LESSONS.length - 1) ? LESSONS[i + 1] : null;
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
  if(u){ const {data:p}=await sb.from("profiles").select("total_xp,streak_days").eq("id",u.id).single();
    if(p){ $("xp-badge").textContent="⭐ "+p.total_xp+" XP"; $("streak-badge").textContent="🔥 "+p.streak_days+" hari";
      const hx=$("hero-xp"); if(hx) hx.textContent=p.total_xp+" XP"; const hs=$("hero-streak"); if(hs) hs.textContent=p.streak_days+" hari"; } } }
async function saveProgress(xp, score){ if(!sb) return; const {data}=await sb.auth.getUser(); const u=data.user; const currentLesson=(typeof quizState!=="undefined"&&quizState)?quizState.lesson:null; if(!u||!currentLesson) return;
  await sb.from("lesson_results").upsert({user_id:u.id,language_code:LANGUAGE_CODE,lesson_id:currentLesson.id,level_code:currentLesson.level,score:(typeof score==="number"?score:100),xp_earned:xp,completed:true},{onConflict:"user_id,language_code,lesson_id"});
  await sb.from("xp_log").insert({user_id:u.id,language_code:LANGUAGE_CODE,source:currentLesson.id,xp});
  const {data:p}=await sb.from("profiles").select("total_xp").eq("id",u.id).single();
  await sb.from("profiles").update({total_xp:(p?p.total_xp:0)+xp,last_study_date:new Date().toISOString().slice(0,10)}).eq("id",u.id);
  refreshUser(); }
$("btn-login").onclick=()=>{ const b=$("btn-login"); if(b && b.disabled) return; $("auth-box").hidden=false; $("auth-box").scrollIntoView({behavior:"smooth"}); };
$("btn-signup").onclick=async()=>{ if(!sb){$("auth-msg").textContent="Isi dulu SUPABASE_URL & SUPABASE_ANON_KEY di app.js (lihat PANDUAN-DEPLOY.md).";return;}
  const {error}=await sb.auth.signUp({email:$("auth-email").value,password:$("auth-password").value});
  $("auth-msg").textContent=error?error.message:"Pendaftaran berhasil. Cek email untuk konfirmasi (bila diaktifkan), lalu masuk."; if(!error) refreshUser(); };
$("btn-signin").onclick=async()=>{ if(!sb){$("auth-msg").textContent="Isi dulu SUPABASE_URL & SUPABASE_ANON_KEY di app.js (lihat PANDUAN-DEPLOY.md).";return;}
  const {error}=await sb.auth.signInWithPassword({email:$("auth-email").value,password:$("auth-password").value});
  $("auth-msg").textContent=error?error.message:"Berhasil masuk."; refreshUser(); };
$("btn-logout").onclick=async()=>{ if(sb) await sb.auth.signOut(); refreshUser(); };
refreshUser();
