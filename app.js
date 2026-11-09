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
      return `<li class="path-node${isDone?" is-done":""}"><span class="node-dot" aria-hidden="true">${isDone?"✓":l.order}</span><div class="lesson-card"><div class="lesson-info"><p class="lesson-title">${l.title}</p><p class="lesson-desc">${l.desc_id}</p></div><div class="lesson-side"><span class="xp-chip">+${l.xp} XP</span>${isDone?`<span class="done-chip">✓ Selesai</span><button class="btn btn-sm btn-again" onclick="startLesson('${l.id}')">Ulangi</button>`:`<button class="btn btn-sm btn-start" onclick="startLesson('${l.id}')">Mulai</button>`}</div></div></li>`; }).join("")+
    `</ol></div>`; }).join("");
  const pct=LESSONS.length?Math.round(done.filter(id=>LESSONS.some(l=>l.id===id)).length/LESSONS.length*100):0;
  const doneCount=done.filter(id=>LESSONS.some(l=>l.id===id)).length;
  ["hero-progress-fill","top-progress-fill"].forEach(id=>{ const el=$(id); if(el) el.style.width=pct+"%"; });
  const pt=$("hero-progress-text"); if(pt) pt.textContent=doneCount+" dari "+LESSONS.length+" pelajaran selesai"; }
renderLessons();

// ===== KUIS CONTOH DENGAN KONTEKS (perbaiki soal ambigu) =====
const QUIZ = [
 {q:"She is my ___.", ctx:"Konteks — baca dulu: Dia teman saya. Kata yang hilang artinya 'teman'.", full:"She is my friend.", full_id:"Dia teman saya.",
  opts:[["friend","teman"],["sister","saudara perempuan"],["teacher","guru"],["mother","ibu"]], answer:0},
 {q:"___, thank you.", ctx:"Konteks — baca dulu: Kamu menolak tawaran dengan sopan. Kata yang hilang artinya 'tidak / bukan'.", full:"No, thank you.", full_id:"Tidak, terima kasih.",
  opts:[["No","Tidak"],["Yes","Ya"],["Please","Tolong"],["Hello","Halo"]], answer:0},
];
let qi=0, currentLesson=null;
window.startLesson=function(id){ currentLesson=LESSONS.find(l=>l.id===id); qi=0; $("quiz-box").hidden=false; showQ(); $("quiz-box").scrollIntoView({behavior:"smooth"}); };
function showQ(){ const item=QUIZ[qi%QUIZ.length]; $("quiz-title").textContent=(currentLesson?currentLesson.title:"Latihan")+" — Soal "+(qi+1);
  $("quiz-context").innerHTML=`<div class="context"><b>Konteks — baca dulu sebelum menjawab</b><br>${item.ctx}</div>`;
  $("quiz-q").textContent="Lengkapi kalimat dengan kata yang tepat: "+item.q;
  $("quiz-translation").innerHTML=`<span class="translation">Artinya (kalimat lengkap): ${item.full_id}</span>`;
  $("quiz-feedback").textContent=""; $("quiz-next").hidden=true;
  $("quiz-options").innerHTML=item.opts.map((o,i)=>`<button class="option" onclick="answer(${i})">${o[0]}<small>Artinya: ${o[1]}</small></button>`).join(""); }
window.answer=async function(i){ const item=QUIZ[qi%QUIZ.length]; const ok=i===item.answer;
  $("quiz-feedback").textContent= ok?`Benar! Kalimat lengkapnya: ${item.full} (${item.full_id})`:`Belum tepat. Jawaban: ${item.opts[item.answer][0]}. Kalimat lengkapnya: ${item.full} (${item.full_id})`;
  $("quiz-next").hidden=false; if(ok){ if(currentLesson){ markDone(currentLesson.id); renderLessons(); } await saveProgress(20); } };
$("quiz-next").onclick=()=>{ qi++; showQ(); };

// ===== SUPABASE: LOGIN + SIMPAN PROGRES/XP =====
async function refreshUser(){ if(!sb) return; const {data}=await sb.auth.getUser(); const u=data.user;
  $("user-info").textContent=u?("Masuk sebagai "+u.email):"Belum masuk (mode tamu: progres tidak tersimpan)";
  $("btn-login").hidden=!!u; $("btn-logout").hidden=!u;
  if(u){ const {data:p}=await sb.from("profiles").select("total_xp,streak_days").eq("id",u.id).single();
    if(p){ $("xp-badge").textContent="⭐ "+p.total_xp+" XP"; $("streak-badge").textContent="🔥 "+p.streak_days+" hari";
      const hx=$("hero-xp"); if(hx) hx.textContent=p.total_xp+" XP"; const hs=$("hero-streak"); if(hs) hs.textContent=p.streak_days+" hari"; } } }
async function saveProgress(xp){ if(!sb) return; const {data}=await sb.auth.getUser(); const u=data.user; if(!u||!currentLesson) return;
  await sb.from("lesson_results").upsert({user_id:u.id,language_code:LANGUAGE_CODE,lesson_id:currentLesson.id,level_code:currentLesson.level,score:100,xp_earned:xp,completed:true},{onConflict:"user_id,language_code,lesson_id"});
  await sb.from("xp_log").insert({user_id:u.id,language_code:LANGUAGE_CODE,source:currentLesson.id,xp});
  const {data:p}=await sb.from("profiles").select("total_xp").eq("id",u.id).single();
  await sb.from("profiles").update({total_xp:(p?p.total_xp:0)+xp,last_study_date:new Date().toISOString().slice(0,10)}).eq("id",u.id);
  refreshUser(); }
$("btn-login").onclick=()=>{ $("auth-box").hidden=false; $("auth-box").scrollIntoView({behavior:"smooth"}); };
$("btn-signup").onclick=async()=>{ if(!sb){$("auth-msg").textContent="Isi dulu SUPABASE_URL & SUPABASE_ANON_KEY di app.js (lihat PANDUAN-DEPLOY.md).";return;}
  const {error}=await sb.auth.signUp({email:$("auth-email").value,password:$("auth-password").value});
  $("auth-msg").textContent=error?error.message:"Pendaftaran berhasil. Cek email untuk konfirmasi (bila diaktifkan), lalu masuk."; };
$("btn-signin").onclick=async()=>{ if(!sb){$("auth-msg").textContent="Isi dulu SUPABASE_URL & SUPABASE_ANON_KEY di app.js (lihat PANDUAN-DEPLOY.md).";return;}
  const {error}=await sb.auth.signInWithPassword({email:$("auth-email").value,password:$("auth-password").value});
  $("auth-msg").textContent=error?error.message:"Berhasil masuk."; refreshUser(); };
$("btn-logout").onclick=async()=>{ if(sb) await sb.auth.signOut(); refreshUser(); };
refreshUser();
