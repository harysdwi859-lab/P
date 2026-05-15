/* ===== AISINJA — app.js ===== */

// ========================
// LOADING
// ========================
const LOADING_TEXTS = [
  "Sabar proses dulu, Sambil nunggu liat cewek cantik ye kan",
  "Bentar ya, lagi dikerjain sama server...",
  "Tunggu sebentar, proses sedang berjalan...",
  "Jangan kemana-mana dulu, hampir selesai...",
  "Loading... sambil nunggu, mending senyum dulu 😄",
  "Proses dulu brooo, jangan buru-buru...",
];
const CECAN_APIS = [
  "https://api.siputzx.my.id/api/r/cecan/japan",
  "https://api.siputzx.my.id/api/r/cecan/china",
];
let loadingTimer = null;

function showLoading(cb) {
  const overlay = document.getElementById("loading-overlay");
  const timerEl = document.getElementById("loading-timer");
  const textEl  = document.getElementById("loading-text");
  const imgEl   = document.getElementById("loading-img");
  overlay.classList.remove("hidden");
  imgEl.classList.remove("loaded");
  imgEl.src = "";
  textEl.textContent = LOADING_TEXTS[Math.floor(Math.random() * LOADING_TEXTS.length)];
  const apiUrl = CECAN_APIS[Math.floor(Math.random() * CECAN_APIS.length)];
  imgEl.onload = () => imgEl.classList.add("loaded");
  imgEl.src = apiUrl;
  let secs = 5;
  timerEl.textContent = secs;
  loadingTimer = setInterval(() => {
    secs--;
    timerEl.textContent = secs;
    if (secs <= 0) {
      clearInterval(loadingTimer);
      overlay.classList.add("hidden");
      if (cb) cb();
    }
  }, 1000);
}
function hideLoading() {
  if (loadingTimer) clearInterval(loadingTimer);
  document.getElementById("loading-overlay").classList.add("hidden");
}

// ========================
// SIDE MENU
// ========================
function openSideMenu() {
  document.getElementById("side-menu").classList.add("open");
  document.getElementById("side-overlay").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeSideMenu() {
  document.getElementById("side-menu").classList.remove("open");
  document.getElementById("side-overlay").classList.add("hidden");
  document.body.style.overflow = "";
}

// ========================
// PAGE NAVIGATION
// ========================
const PAGES = ["main-home","page-download","page-tools","page-ai","page-gorengan","page-vip"];

function showHome() {
  PAGES.forEach(id => { const el = document.getElementById(id); if (el) el.classList.add("hidden"); });
  document.getElementById("main-home").classList.remove("hidden");
  window.scrollTo(0, 0);
}
function showPage(name) {
  PAGES.forEach(id => { const el = document.getElementById(id); if (el) el.classList.add("hidden"); });
  const target = document.getElementById("page-" + name);
  if (target) { target.classList.remove("hidden"); window.scrollTo(0, 0); }
  if (name === "gorengan") loadGorengan();
}

// ========================
// PASSWORD MODAL
// ========================
let currentModalTarget = null;
const PASSWORDS = { gorengan: "sds123", vip: null };
let vipPasswordCache = null;

async function fetchVIPPassword() {
  if (vipPasswordCache) return vipPasswordCache;
  try {
    const id  = "1qP0L79GpBJc5T9e0fbmxk1jW6VO9ijvq6U1Sud8_0-Y";
    const url = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&sheet=Sheet1&range=A1`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const text  = await res.text();
    const match = text.match(/setResponse\(([\s\S]*)\)/);
    if (!match) throw new Error("Format tidak dikenal");
    const json = JSON.parse(match[1]);
    const pass = json?.table?.rows?.[0]?.c?.[0]?.v;
    if (!pass) throw new Error("Password kosong");
    vipPasswordCache = String(pass).trim();
    return vipPasswordCache;
  } catch (e) { console.error("fetchVIPPassword:", e); return null; }
}

function openModal(target) {
  currentModalTarget = target;
  const modal   = document.getElementById("modal-overlay");
  const titleEl = document.getElementById("modal-title");
  const msgEl   = document.getElementById("modal-msg");
  const inputEl = document.getElementById("modal-input");
  titleEl.textContent = target === "vip" ? "👑 VIP — Masukkan Sandi" : "🍟 Gorengan — Masukkan Sandi";
  msgEl.textContent = ""; msgEl.className = "modal-msg"; inputEl.value = "";
  modal.classList.remove("hidden");
  setTimeout(() => inputEl.focus(), 100);
}
function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
  currentModalTarget = null;
}
async function checkPassword() {
  const input = document.getElementById("modal-input").value.trim();
  const msgEl = document.getElementById("modal-msg");
  let correctPass;
  if (currentModalTarget === "gorengan") {
    correctPass = PASSWORDS.gorengan;
  } else if (currentModalTarget === "vip") {
    msgEl.textContent = "Mengambil sandi..."; msgEl.className = "modal-msg";
    correctPass = await fetchVIPPassword();
    if (!correctPass) { msgEl.textContent = "Gagal mengambil sandi, coba lagi."; msgEl.className = "modal-msg fail"; return; }
  }
  if (input === correctPass) {
    msgEl.textContent = "Silahkan tuan 😊"; msgEl.className = "modal-msg ok";
    setTimeout(() => { closeModal(); showPage(currentModalTarget); }, 800);
  } else {
    msgEl.textContent = "Awokaowk salah 😂"; msgEl.className = "modal-msg fail";
    document.getElementById("modal-input").value = "";
  }
}
document.getElementById("modal-input").addEventListener("keydown", e => { if (e.key === "Enter") checkPassword(); });

// ========================
// TABS — Fix: hapus hidden saat switch
// ========================
function switchTab(btn, targetId) {
  const parent = btn.closest(".page-section, #main-home");
  parent.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  parent.querySelectorAll(".tab-content").forEach(tc => {
    tc.classList.remove("active");
    tc.classList.add("hidden");
  });
  const target = document.getElementById(targetId);
  if (target) { target.classList.remove("hidden"); target.classList.add("active"); }
}

// ========================
// ANIME QUOTES
// ========================
let quoteInterval = null;
const QUOTE_INTERVAL_MS = 5 * 60 * 1000;

async function fetchAnimeQuote() {
  try {
    const res  = await fetch("https://api.danzy.web.id/api/random/quotesanime");
    const data = await res.json();
    const quote = data.quote || data.text || data.hasil?.quote || data.result?.quote || "";
    const char  = data.character || data.anime || data.hasil?.character || data.result?.character || "";
    const img   = data.image || data.img || data.hasil?.image || data.result?.image || "";
    document.getElementById("quote-text").textContent = quote ? `"${quote}"` : "Gagal memuat quote";
    document.getElementById("quote-char").textContent = char ? `— ${char}` : "";
    const imgEl = document.getElementById("quote-img");
    if (img) { imgEl.src = img; imgEl.style.opacity = "0"; imgEl.onload = () => { imgEl.style.opacity = "1"; }; }
  } catch (e) { document.getElementById("quote-text").textContent = "Gagal memuat quote 😢"; }
}
function startQuoteTimer() {
  const fill = document.getElementById("quote-fill");
  if (fill) {
    fill.style.transition = "none"; fill.style.width = "100%";
    requestAnimationFrame(() => { fill.style.transition = `width ${QUOTE_INTERVAL_MS}ms linear`; fill.style.width = "0%"; });
  }
}
function initQuotes() {
  fetchAnimeQuote(); startQuoteTimer();
  quoteInterval = setInterval(() => { fetchAnimeQuote(); startQuoteTimer(); }, QUOTE_INTERVAL_MS);
}

// ========================
// JADWAL SHOLAT
// ========================
async function loadJadwalSholat() {
  try {
    const res  = await fetch("https://www.sankavollerei.com/tools/jadwalsholat?apikey=planaai&kota=Kuningan");
    const data = await res.json();
    if (!data.status || !data.jadwal) throw new Error("Invalid");
    document.getElementById("jadwal-kota").textContent = data.kota || "Kuningan";
    document.getElementById("jadwal-date").textContent = data.tanggal || "";
    const jadwal = data.jadwal;
    const grid   = document.getElementById("jadwal-grid");
    grid.innerHTML = "";
    const sholatKeys = ["imsak","subuh","terbit","dzuhur","ashar","maghrib","isya","tengah_malam"];
    const labels = { imsak:"Imsak",subuh:"Subuh",terbit:"Terbit",dzuhur:"Dzuhur",ashar:"Ashar",maghrib:"Maghrib",isya:"Isya",tengah_malam:"Tengah Malam" };
    const now = new Date(); const nowMin = now.getHours()*60+now.getMinutes();
    let nextKey = null;
    for (const key of sholatKeys) {
      if (!jadwal[key]) continue;
      const [h,m] = jadwal[key].split(":").map(Number);
      if (h*60+m > nowMin) { nextKey = key; break; }
    }
    sholatKeys.forEach(key => {
      if (!jadwal[key]) return;
      const div = document.createElement("div");
      div.className = "jadwal-item" + (key === nextKey ? " active" : "");
      div.innerHTML = `<span class="jadwal-name">${labels[key]}</span><span class="jadwal-time">${jadwal[key]}</span>`;
      grid.appendChild(div);
    });
  } catch(e) { document.getElementById("jadwal-grid").innerHTML = '<div class="jadwal-loading">Gagal memuat jadwal</div>'; }
}

// ========================
// HELPERS
// ========================
function safeStr(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return "";
}
function deepGet(obj, ...keys) {
  for (const key of keys) {
    const val = obj?.[key];
    if (val !== undefined && val !== null) { const s = safeStr(val); if (s) return s; }
  }
  return "";
}
function escHtml(str) {
  return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function errMsg() { return `<div class="result-error">😭 Atminnya cupu jir soalnya error</div>`; }

// ========================
// RENDER DOWNLOAD RESULT
// ========================
function renderDownloadResult(el, data, type) {
  if (!data || data.status === false) { el.innerHTML = errMsg(); return; }
  let html = "";
  const result   = data.result || data.data || data;
  const title    = deepGet(result,"title") || deepGet(data,"title");
  const thumb    = deepGet(result,"thumbnail") || deepGet(data,"thumbnail");
  const duration = result?.duration || data?.duration || "";
  if (title)    html += `<div class="dl-title">${escHtml(title)}</div>`;
  if (duration) html += `<div class="dl-duration">⏱ ${duration} detik</div>`;
  if (thumb)    html += `<div class="dl-thumb-wrap"><img src="${escHtml(thumb)}" class="dl-thumb" alt="thumbnail" onerror="this.style.display='none'" /></div>`;
  const medias = result?.medias || data?.medias || [];
  if (Array.isArray(medias) && medias.length > 0) {
    html += `<div class="dl-media-list">`;
    medias.forEach((m, i) => {
      const mUrl     = deepGet(m,"url"); if (!mUrl) return;
      const mQuality = deepGet(m,"quality") || `Media ${i+1}`;
      const mExt     = deepGet(m,"extension") || "";
      const isAudio  = mExt === "mp3" || mQuality.toLowerCase().includes("audio");
      const isVideo  = mExt === "mp4" || mQuality.toLowerCase().includes("video");
      html += `<div class="dl-media-item"><div class="dl-media-label">${escHtml(mQuality)}${mExt ? ` (.${mExt})` : ""}</div>`;
      if (isVideo) html += `<video controls class="dl-preview-video" src="${escHtml(mUrl)}" preload="none"></video>`;
      else if (isAudio) html += `<audio controls class="dl-preview-audio" src="${escHtml(mUrl)}"></audio>`;
      html += `<a href="${escHtml(mUrl)}" target="_blank" rel="noopener" class="btn-dl">⬇️ Download ${mExt.toUpperCase()||""}</a></div>`;
    });
    html += `</div>`;
  } else {
    const dlUrl  = deepGet(result,"url","download_url","download","link") || deepGet(data,"url","download_url","download","link");
    const quality = deepGet(result,"quality") || deepGet(data,"quality");
    if (quality) html += `<div class="dl-quality">Kualitas: ${escHtml(quality)}</div>`;
    if (dlUrl) {
      const isAudio = dlUrl.includes(".mp3") || type==="ytmp3" || type==="spotify";
      const isVideo = dlUrl.includes(".mp4");
      if (isVideo) html += `<video controls class="dl-preview-video" src="${escHtml(dlUrl)}" preload="none"></video>`;
      else if (isAudio) html += `<audio controls class="dl-preview-audio" src="${escHtml(dlUrl)}"></audio>`;
      html += `<a href="${escHtml(dlUrl)}" target="_blank" rel="noopener" class="btn-dl">⬇️ Download</a>`;
    } else { html = errMsg(); }
  }
  el.innerHTML = html || errMsg();
}

// ========================
// DOWNLOAD HANDLERS
// ========================
const DL_APIS = {
  ytmp3:   url => `https://www.sankavollerei.com/download/ytmp3?apikey=planaai&url=${encodeURIComponent(url)}`,
  ytmp4:   url => `https://www.sankavollerei.com/download/ytmp4?apikey=planaai&url=${encodeURIComponent(url)}`,
  tiktok:  url => `https://www.sankavollerei.com/download/tiktok?apikey=planaai&url=${encodeURIComponent(url)}`,
  tikhd:   url => `https://www.sankavollerei.com/download/tiktok-hd?apikey=planaai&url=${encodeURIComponent(url)}`,
  aio:     url => `https://www.sankavollerei.com/download/aio?apikey=planaai&url=${encodeURIComponent(url)}`,
  douyin:  url => `https://www.sankavollerei.com/download/douyin?apikey=planaai&url=${encodeURIComponent(url)}`,
  spotify: url => `https://api.danzy.web.id/api/download/spotify?url=${encodeURIComponent(url)}`,
  sfile:   url => `https://api.danzy.web.id/api/download/sfile?url=${encodeURIComponent(url)}`,
};
function runDownload(type) {
  const input  = document.getElementById("in-" + type);
  const result = document.getElementById("res-" + type);
  const url    = input?.value?.trim();
  if (!url) { alert("Masukkan URL terlebih dahulu!"); return; }
  showLoading(async () => {
    result.classList.remove("hidden");
    result.innerHTML = `<span class="loading-txt">⏳ Memproses...</span>`;
    try {
      const res  = await fetch(DL_APIS[type](url));
      const data = await res.json();
      renderDownloadResult(result, data, type);
    } catch(e) { result.innerHTML = errMsg(); }
  });
}

// ========================
// TOOL URL HANDLERS
// ========================
const TOOL_APIS = {
  audio2txt:   url => `https://www.sankavollerei.com/tools/audio-to-text?apikey=planaai&url=${encodeURIComponent(url)}`,
  removevocal: url => `https://www.sankavollerei.com/tools/vocal-remover?apikey=planaai&url=${encodeURIComponent(url)}`,
  ytscript:    url => `https://www.sankavollerei.com/tools/youtubetranscript?apikey=planaai&url=${encodeURIComponent(url)}`,
  ttscript:    url => `https://www.sankavollerei.com/tools/tttranscript?apikey=planaai&url=${encodeURIComponent(url)}`,
};
function runToolUrl(type) {
  const input  = document.getElementById("in-" + type);
  const result = document.getElementById("res-" + type);
  const url    = input?.value?.trim();
  if (!url) { alert("Masukkan URL!"); return; }
  showLoading(async () => {
    result.classList.remove("hidden");
    result.innerHTML = `<span class="loading-txt">⏳ Memproses...</span>`;
    try {
      const res  = await fetch(TOOL_APIS[type](url));
      const data = await res.json();
      renderToolResult(result, data, type);
    } catch(e) { result.innerHTML = errMsg(); }
  });
}
function renderToolResult(el, data, type) {
  if (!data || data.status === false) { el.innerHTML = errMsg(); return; }
  let html = "";
  if (type === "removevocal") {
    const audioUrl = deepGet(data,"url","result","output","audio");
    if (audioUrl && audioUrl.startsWith("http")) {
      html = `<audio controls src="${escHtml(audioUrl)}" style="width:100%;margin-bottom:.5rem"></audio>
              <a href="${escHtml(audioUrl)}" target="_blank" class="btn-dl">⬇️ Download Audio</a>`;
    } else { html = errMsg(); }
  } else if (type === "audio2txt" || type === "ytscript" || type === "ttscript") {
    const transcript = deepGet(data,"result","transcript","text","data");
    html = transcript ? `<div class="transcript-box">${escHtml(transcript)}</div>` : errMsg();
  } else {
    const text = deepGet(data,"result","text","url","output","data");
    html = text ? `<div style="line-height:1.7">${escHtml(text)}</div>` : errMsg();
  }
  el.innerHTML = html;
}

// ========================
// FILE TOOL HANDLERS
// ========================
async function runToolFile(type) {
  const fileInput = document.getElementById("in-" + type);
  const result    = document.getElementById("res-" + type);
  if (!fileInput?.files?.[0]) { alert("Pilih file terlebih dahulu!"); return; }
  const ENDPOINTS = { removebg: "https://api.danzy.web.id/api/maker/removebg" };
  showLoading(async () => {
    result.classList.remove("hidden");
    result.innerHTML = `<span class="loading-txt">⏳ Mengupload & memproses...</span>`;
    try {
      const formData = new FormData(); formData.append("image", fileInput.files[0]);
      const res  = await fetch(ENDPOINTS[type], { method:"POST", body:formData });
      const data = await res.json();
      const imgUrl = deepGet(data,"result","url","output","image");
      if (imgUrl && imgUrl.startsWith("http")) {
        result.innerHTML = `<img src="${escHtml(imgUrl)}" alt="result" class="result-img" />
          <a href="${escHtml(imgUrl)}" target="_blank" download class="btn-dl">⬇️ Download</a>`;
      } else { result.innerHTML = errMsg(); }
    } catch(e) { result.innerHTML = errMsg(); }
  });
}

// ========================
// IMAGE CONVERSION
// ========================
function runConvert(type) {
  const fileInput = document.getElementById("in-" + type);
  const result    = document.getElementById("res-" + type);
  if (!fileInput?.files?.[0]) { alert("Pilih file!"); return; }
  showLoading(async () => {
    result.classList.remove("hidden");
    result.innerHTML = `<span class="loading-txt">⏳ Mengkonversi...</span>`;
    try {
      const file = fileInput.files[0];
      if (type === "png2jpg" || type === "jpg2png") await convertImage(file, type, result);
      else if (type === "img2pdf") await imgToPdf(file, result);
      else if (type === "pdf2img") result.innerHTML = `<div style="color:var(--text-muted)">ℹ️ Konversi PDF→IMG memerlukan backend. Fitur segera hadir.</div>`;
    } catch(e) { result.innerHTML = errMsg(); }
  });
}
function convertImage(file, type, resultEl) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (type === "png2jpg") { ctx.fillStyle = "#fff"; ctx.fillRect(0,0,canvas.width,canvas.height); }
        ctx.drawImage(img, 0, 0);
        const mime = type === "png2jpg" ? "image/jpeg" : "image/png";
        const ext  = type === "png2jpg" ? "jpg" : "png";
        canvas.toBlob(blob => {
          const url = URL.createObjectURL(blob);
          resultEl.innerHTML = `<img src="${url}" class="result-img" alt="converted" />
            <a href="${url}" download="converted.${ext}" class="btn-dl">⬇️ Download ${ext.toUpperCase()}</a>`;
          resolve();
        }, mime, 0.92);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
function imgToPdf(file, resultEl) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => {
      resultEl.innerHTML = `<div style="color:var(--accent2);margin-bottom:.5rem">⚠️ Preview (butuh jsPDF untuk export penuh)</div>
        <img src="${e.target.result}" class="result-img" alt="preview" />`;
      resolve();
    };
    reader.readAsDataURL(file);
  });
}

// ========================
// TRANSLATE
// ========================
async function runTranslate() {
  const text   = document.getElementById("in-translate").value.trim();
  const result = document.getElementById("res-translate");
  if (!text) { alert("Masukkan teks!"); return; }
  showLoading(async () => {
    result.classList.remove("hidden"); result.innerHTML = `<span class="loading-txt">⏳ Menerjemahkan...</span>`;
    try {
      const url = `https://www.sankavollerei.com/tools/autotranslate?apikey=planaai&text=${encodeURIComponent(text)}&to=id&from=auto&mode=Faithful`;
      const res  = await fetch(url); const data = await res.json();
      const translated = deepGet(data,"result","translated","text","output","data");
      result.innerHTML = translated ? `<div class="transcript-box">${escHtml(translated)}</div>` : errMsg();
    } catch(e) { result.innerHTML = errMsg(); }
  });
}
async function runTranslate2() {
  const text   = document.getElementById("in-translate2").value.trim();
  const lang   = document.getElementById("in-translate2-lang").value;
  const result = document.getElementById("res-translate2");
  if (!text) { alert("Masukkan teks!"); return; }
  showLoading(async () => {
    result.classList.remove("hidden"); result.innerHTML = `<span class="loading-txt">⏳ Menerjemahkan...</span>`;
    try {
      const url = `https://www.sankavollerei.com/tools/translate?apikey=planaai&text=${encodeURIComponent(text)}&to=${lang}`;
      const res  = await fetch(url); const data = await res.json();
      const translated = deepGet(data,"result","translated","text","output","data");
      result.innerHTML = translated ? `<div class="transcript-box">${escHtml(translated)}</div>` : errMsg();
    } catch(e) { result.innerHTML = errMsg(); }
  });
}

// ========================
// UPSCALE & TIMPA
// ========================
async function runUpscale() {
  const urlInput  = document.getElementById("in-upscale-url").value.trim();
  const fileInput = document.getElementById("in-upscale-file");
  const result    = document.getElementById("res-upscale");
  const hasFile   = fileInput?.files?.[0];
  if (!urlInput && !hasFile) { alert("Masukkan URL atau pilih file!"); return; }
  showLoading(async () => {
    result.classList.remove("hidden"); result.innerHTML = `<span class="loading-txt">⏳ Upscaling...</span>`;
    try {
      let res;
      if (hasFile) { const fd = new FormData(); fd.append("image", fileInput.files[0]); res = await fetch("https://api.danzy.web.id/api/tools/upscale", {method:"POST",body:fd}); }
      else { res = await fetch(`https://api.danzy.web.id/api/tools/upscale?url=${encodeURIComponent(urlInput)}`); }
      const data   = await res.json();
      const imgUrl = deepGet(data,"result","url","output","image");
      if (imgUrl && imgUrl.startsWith("http")) {
        result.innerHTML = `<img src="${escHtml(imgUrl)}" class="result-img" alt="upscaled" /><a href="${escHtml(imgUrl)}" target="_blank" download class="btn-dl">⬇️ Download</a>`;
      } else { result.innerHTML = errMsg(); }
    } catch(e) { result.innerHTML = errMsg(); }
  });
}
async function runTimpa() {
  const urlInput  = document.getElementById("in-timpa-url").value.trim();
  const fileInput = document.getElementById("in-timpa-file");
  const textInput = document.getElementById("in-timpa-text").value.trim();
  const result    = document.getElementById("res-timpa");
  const hasFile   = fileInput?.files?.[0];
  if (!urlInput && !hasFile) { alert("Masukkan URL gambar atau pilih file!"); return; }
  if (!textInput) { alert("Masukkan teks!"); return; }
  showLoading(async () => {
    result.classList.remove("hidden"); result.innerHTML = `<span class="loading-txt">⏳ Memproses...</span>`;
    try {
      let res;
      if (hasFile) { const fd = new FormData(); fd.append("image",fileInput.files[0]); fd.append("text",textInput); res = await fetch("https://api.danzy.web.id/api/maker/timpa",{method:"POST",body:fd}); }
      else { res = await fetch(`https://api.danzy.web.id/api/maker/timpa?url=${encodeURIComponent(urlInput)}&text=${encodeURIComponent(textInput)}`); }
      const data   = await res.json();
      const imgUrl = deepGet(data,"result","url","output","image");
      if (imgUrl && imgUrl.startsWith("http")) {
        result.innerHTML = `<img src="${escHtml(imgUrl)}" class="result-img" /><a href="${escHtml(imgUrl)}" target="_blank" download class="btn-dl">⬇️ Download</a>`;
      } else { result.innerHTML = errMsg(); }
    } catch(e) { result.innerHTML = errMsg(); }
  });
}

// ========================
// AI CHAT
// ========================
let currentModel = "sinjagpt";
const AI_API = {
  sinjagpt: text => "https://api.siputzx.my.id/api/ai/gptoss120b?prompt=" + encodeURIComponent(text) +
    "&system=" + encodeURIComponent("Your Name is SINJAgpt and You are a helpful assistant. Always answer in the same language as the question.") + "&temperature=0.7",
  claude:    text => "https://www.sankavollerei.com/ai/realtime?apikey=planaai&model=claude&text=" + encodeURIComponent(text),
  gemini:    text => "https://api.danzy.web.id/api/ai/gemini-lite?text=" + encodeURIComponent(text),
  matematika:text => "https://api.danzy.web.id/api/ai/mathgpt?text=" + encodeURIComponent("Jawab singkat langsung ke hasil. " + text),
  humanize:  text => "https://api.danzy.web.id/api/ai/bypass?text=" + encodeURIComponent(text),
  aroma:     text => "https://www.sankavollerei.com/ai/arona?apikey=planaai&text=" + encodeURIComponent(text),
};
function selectModel(model) {
  currentModel = model;
  document.querySelectorAll(".model-btn").forEach(b => b.classList.remove("active"));
  const btn = document.getElementById("btn-" + model);
  if (btn) btn.classList.add("active");
}
function addChatBubble(text, type) {
  const box = document.getElementById("ai-chat-box");
  const div = document.createElement("div");
  div.className = `chat-bubble ${type}`;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
  return div;
}
async function sendAI() {
  const input = document.getElementById("ai-input");
  const text  = input.value.trim();
  if (!text) return;
  input.value = "";
  addChatBubble(text, "user");
  const typing = addChatBubble("⏳ Sedang mengetik...", "typing");
  document.getElementById("btn-send").disabled = true;
  try {
    const url  = AI_API[currentModel](text);
    const res  = await fetch(url);
    const data = await res.json();
    let reply = "";
    const flat = [
      data?.result?.reply,data?.result?.response,data?.result?.text,data?.result?.message,data?.result?.content,data?.result?.answer,
      typeof data?.result==="string"?data.result:null,
      data?.reply,data?.response,data?.text,data?.message,data?.answer,data?.output,data?.content,
      typeof data?.data==="string"?data.data:null,
      data?.data?.text,data?.data?.reply,data?.data?.response,
    ];
    for (const c of flat) { if (typeof c==="string" && c.trim()) { reply=c.trim(); break; } }
    if (!reply) {
      for (const val of Object.values(data||{})) {
        if (typeof val==="string" && val.trim().length>3) { reply=val.trim(); break; }
        if (val && typeof val==="object") { for (const v2 of Object.values(val)) { if (typeof v2==="string" && v2.trim().length>3) { reply=v2.trim(); break; } } if (reply) break; }
      }
    }
    if (!reply) reply = "😭 Atminnya cupu jir soalnya error";
    typing.remove(); addChatBubble(reply, "bot");
  } catch(e) { typing.remove(); addChatBubble("😭 Atminnya cupu jir soalnya error", "bot"); }
  document.getElementById("btn-send").disabled = false;
  document.getElementById("ai-input").focus();
}
document.getElementById("ai-input").addEventListener("keydown", e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendAI(); } });

// ========================
// GORENGAN — API baru siputzx
// Response: { status:true, data:{ title, thumb, video1, video2, source, tag, ... } }
// ========================
async function loadGorengan() {
  const grid = document.getElementById("gorengan-grid");
  grid.innerHTML = '<div class="gorengan-loading">⏳ Memuat konten gorengan...</div>';
  try {
    // Fetch beberapa sekaligus biar banyak konten
    const promises = Array.from({length:6}, () => fetch("https://api.siputzx.my.id/api/r/seegore").then(r=>r.json()));
    const results  = await Promise.allSettled(promises);
    const items    = results.filter(r=>r.status==="fulfilled" && r.value?.status && r.value?.data).map(r=>r.value.data);

    grid.innerHTML = "";
    if (!items.length) { grid.innerHTML = `<div class="gorengan-loading">😢 Tidak ada konten. Coba muat lagi.</div>`; return; }

    items.forEach((item, i) => {
      const thumb  = item.thumb  || "";
      const title  = item.title  || `Konten #${i+1}`;
      const video1 = item.video1 || item.video2 || "";
      const source = item.source || "";
      const tag    = item.tag    || "";

      const card = document.createElement("div");
      card.className = "gore-card";

      // Thumbnail
      const thumbHtml = thumb
        ? `<div class="gore-thumb-wrap"><img src="${escHtml(thumb)}" alt="${escHtml(title)}" loading="lazy" onerror="this.parentNode.innerHTML='<div class=gore-no-thumb>🎬</div>'" /></div>`
        : `<div class="gore-thumb-wrap"><div class="gore-no-thumb">🎬</div></div>`;

      // Tag badge
      const tagHtml = tag ? `<span class="gore-tag">${escHtml(tag.split(",")[0].trim())}</span>` : "";

      // Action buttons
      const videoBtn = video1 ? `<button class="gore-btn-play" onclick="event.stopPropagation();playGoreVideo('${escHtml(video1)}','${escHtml(title)}')">▶ Play</button>` : "";
      const openBtn  = source ? `<a href="${escHtml(source)}" target="_blank" rel="noopener" class="gore-btn-open" onclick="event.stopPropagation()">🔗 Buka</a>` : "";
      const dlBtn    = video1 ? `<a href="${escHtml(video1)}" target="_blank" rel="noopener" class="gore-btn-dl" onclick="event.stopPropagation()">⬇️ DL</a>` : "";

      card.innerHTML = `
        ${thumbHtml}
        <div class="gore-info">
          <div class="gore-title">${escHtml(title)} ${tagHtml}</div>
          <div class="gore-actions">${videoBtn}${openBtn}${dlBtn}</div>
        </div>`;
      grid.appendChild(card);
    });
  } catch(e) {
    grid.innerHTML = `<div class="gorengan-loading">❌ Gagal memuat: ${e.message}</div>`;
  }
}

// Video player popup untuk gorengan
function playGoreVideo(url, title) {
  const overlay = document.getElementById("video-overlay");
  const player  = document.getElementById("video-player");
  const titleEl = document.getElementById("video-title");
  if (!overlay || !player) return;
  player.src     = url;
  titleEl.textContent = title;
  overlay.classList.remove("hidden");
  player.play().catch(()=>{});
}
function closeVideoPlayer() {
  const overlay = document.getElementById("video-overlay");
  const player  = document.getElementById("video-player");
  if (player) { player.pause(); player.src = ""; }
  if (overlay) overlay.classList.add("hidden");
}

// ========================
// VIP TOOLS
// ========================

// IMG Gen dengan ratio
async function runImgGen() {
  const prompt  = document.getElementById("in-imggen").value.trim();
  const ratio   = document.getElementById("in-imggen-ratio").value;
  const result  = document.getElementById("res-imggen");
  if (!prompt) { alert("Masukkan prompt!"); return; }
  showLoading(async () => {
    result.classList.remove("hidden");
    result.innerHTML = `<span class="loading-txt">⏳ Generating...</span>`;
    try {
      const url  = `https://www.sankavollerei.com/ai/aiprompttoimg?apikey=planaai&prompt=${encodeURIComponent(prompt)}&ratio=${encodeURIComponent(ratio)}`;
      const res  = await fetch(url);
      const data = await res.json();
      let imgUrl = "";
      // Scan semua kandidat struktur response
      for (const obj of [data?.result, data?.data, data?.output, data]) {
        if (!obj) continue;
        if (typeof obj==="string" && obj.startsWith("http")) { imgUrl=obj; break; }
        const found = deepGet(obj,"url","image","img","output","result","link","src");
        if (found && found.startsWith("http")) { imgUrl=found; break; }
      }
      if (imgUrl) {
        result.innerHTML = `<img src="${escHtml(imgUrl)}" class="result-img" alt="generated" />
          <div class="dl-actions">
            <a href="${escHtml(imgUrl)}" target="_blank" download class="btn-dl">⬇️ Download</a>
          </div>`;
      } else { result.innerHTML = errMsg(); }
    } catch(e) { result.innerHTML = errMsg(); }
  });
}

// AI Edit & AI Edit v2
async function runAIEdit(type) {
  const input  = document.getElementById("in-" + type);
  const result = document.getElementById("res-" + type);
  const url    = input?.value?.trim();
  if (!url) { alert("Masukkan URL gambar!"); return; }
  const ENDPOINTS = {
    aiedit:  `https://api.danzy.web.id/api/ai/editimg?url=${encodeURIComponent(url)}`,
    aiedit2: `https://api.danzy.web.id/api/ai/deepnude?url=${encodeURIComponent(url)}`,
  };
  showLoading(async () => {
    result.classList.remove("hidden");
    result.innerHTML = `<span class="loading-txt">⏳ Memproses...</span>`;
    try {
      const res  = await fetch(ENDPOINTS[type]);
      const data = await res.json();
      let imgUrl = "";
      for (const obj of [data?.result, data?.data, data?.output, data]) {
        if (!obj) continue;
        if (typeof obj==="string" && obj.startsWith("http")) { imgUrl=obj; break; }
        const found = deepGet(obj,"url","image","img","output","result");
        if (found && found.startsWith("http")) { imgUrl=found; break; }
      }
      if (imgUrl) {
        result.innerHTML = `<img src="${escHtml(imgUrl)}" class="result-img" />
          <a href="${escHtml(imgUrl)}" target="_blank" download class="btn-dl">⬇️ Download</a>`;
      } else { result.innerHTML = errMsg(); }
    } catch(e) { result.innerHTML = errMsg(); }
  });
}

// Web Search VIP — tampilkan link bisa diklik & salin
async function runWebSearch() {
  const q      = document.getElementById("in-websearch").value.trim();
  const result = document.getElementById("res-websearch");
  if (!q) { alert("Masukkan kata kunci!"); return; }
  showLoading(async () => {
    result.classList.remove("hidden");
    result.innerHTML = `<span class="loading-txt">⏳ Mencari...</span>`;
    try {
      const res  = await fetch(`https://www.sankavollerei.com/search/xnxx?apikey=planaai&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const items = data.result || data.results || data.data || [];
      if (Array.isArray(items) && items.length) {
        result.innerHTML = items.map((item, idx) => {
          const title = deepGet(item,"title","t","name") || `Hasil ${idx+1}`;
          const link  = deepGet(item,"url","link","href") || "#";
          const thumb = deepGet(item,"thumbnail","thumb","image","img");
          const dur   = deepGet(item,"duration","dur");
          return `<div class="search-item">
            ${thumb ? `<img src="${escHtml(thumb)}" class="search-thumb" onerror="this.style.display='none'" />` : ""}
            <div class="search-body">
              <div class="search-title">${escHtml(title)}</div>
              ${dur ? `<div class="search-dur">⏱ ${escHtml(dur)}</div>` : ""}
              <div class="search-actions">
                <a href="${escHtml(link)}" target="_blank" rel="noopener" class="btn-dl">🔗 Buka</a>
                <button class="btn-copy" onclick="copyToClipboard('${escHtml(link)}', this)">📋 Salin</button>
              </div>
            </div>
          </div>`;
        }).join("");
      } else { result.innerHTML = errMsg(); }
    } catch(e) { result.innerHTML = errMsg(); }
  });
}

// Web Downloader VIP
async function runWebDL() {
  const url    = document.getElementById("in-webdl").value.trim();
  const result = document.getElementById("res-webdl");
  if (!url) { alert("Masukkan URL!"); return; }
  showLoading(async () => {
    result.classList.remove("hidden");
    result.innerHTML = `<span class="loading-txt">⏳ Memproses...</span>`;
    try {
      const res  = await fetch(`https://www.sankavollerei.com/download/xnxx?apikey=planaai&url=${encodeURIComponent(url)}`);
      const data = await res.json();
      renderDownloadResult(result, data, "webdl");
    } catch(e) { result.innerHTML = errMsg(); }
  });
}

// ========================
// KOMIK VIP (nhsearch + nhdl)
// ========================
let komikSearchResults = [];

async function runKomikSearch() {
  const q      = document.getElementById("in-komik-search").value.trim();
  const result = document.getElementById("res-komik-search");
  if (!q) { alert("Masukkan judul komik!"); return; }
  showLoading(async () => {
    result.classList.remove("hidden");
    result.innerHTML = `<span class="loading-txt">⏳ Mencari...</span>`;
    try {
      const res  = await fetch(`https://api.danzy.web.id/api/search/nhsearch?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const items = data.result || data.data || data.results || (Array.isArray(data) ? data : []);
      if (!Array.isArray(items) || !items.length) { result.innerHTML = `<div class="result-error">😢 Tidak ada hasil</div>`; return; }
      komikSearchResults = items;
      result.innerHTML = items.slice(0,12).map((item, i) => {
        const title = deepGet(item,"title","name") || `Komik ${i+1}`;
        const thumb = deepGet(item,"thumbnail","cover","image","img");
        const id    = deepGet(item,"id","code","gallery_id") || "";
        const pages = item.pages || item.num_pages || "";
        return `<div class="komik-card" onclick="runKomikDL('${escHtml(id)}', this)">
          ${thumb ? `<img src="${escHtml(thumb)}" class="komik-thumb" onerror="this.style.display='none'" />` : `<div class="komik-no-thumb">📚</div>`}
          <div class="komik-info">
            <div class="komik-title">${escHtml(title)}</div>
            ${pages ? `<div class="komik-pages">📄 ${pages} halaman</div>` : ""}
            <div class="komik-id">ID: ${escHtml(id)}</div>
          </div>
        </div>`;
      }).join("");
    } catch(e) { result.innerHTML = errMsg(); }
  });
}

async function runKomikDL(id, cardEl) {
  if (!id) { alert("ID komik tidak ditemukan!"); return; }
  const result = document.getElementById("res-komik-dl");
  result.classList.remove("hidden");
  result.innerHTML = `<span class="loading-txt">⏳ Mengambil link download...</span>`;
  try {
    const res  = await fetch(`https://api.danzy.web.id/api/download/nhdl?id=${encodeURIComponent(id)}`);
    const data = await res.json();
    const pages = data.result || data.data || data.pages || (Array.isArray(data) ? data : []);
    if (Array.isArray(pages) && pages.length) {
      result.innerHTML = `<div class="komik-dl-header">📚 ${pages.length} halaman tersedia</div>` +
        pages.slice(0,8).map((p, i) => {
          const imgUrl = deepGet(p,"url","image","img","link") || (typeof p==="string"?p:"");
          if (!imgUrl) return "";
          return `<div class="komik-page-item">
            <img src="${escHtml(imgUrl)}" class="komik-page-img" loading="lazy" onerror="this.style.display='none'" />
            <a href="${escHtml(imgUrl)}" target="_blank" download class="btn-dl" style="font-size:.75rem;padding:.3rem .6rem">⬇️ Hal ${i+1}</a>
          </div>`;
        }).join("") +
        (pages.length > 8 ? `<div class="komik-more">... dan ${pages.length-8} halaman lagi</div>` : "");
    } else {
      // Coba cari URL langsung
      const dlUrl = deepGet(data,"url","download","link","result");
      if (dlUrl && dlUrl.startsWith("http")) {
        result.innerHTML = `<a href="${escHtml(dlUrl)}" target="_blank" class="btn-dl">⬇️ Download Komik</a>`;
      } else { result.innerHTML = errMsg(); }
    }
  } catch(e) { result.innerHTML = errMsg(); }
}

// ========================
// COPY HELPER
// ========================
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = "✅ Disalin!";
    setTimeout(() => { btn.textContent = orig; }, 1500);
  }).catch(() => {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand("copy"); document.body.removeChild(ta);
    const orig = btn.textContent;
    btn.textContent = "✅ Disalin!";
    setTimeout(() => { btn.textContent = orig; }, 1500);
  });
}

// ========================
// INIT
// ========================
document.addEventListener("DOMContentLoaded", () => {
  showHome();
  initQuotes();
  loadJadwalSholat();
});
