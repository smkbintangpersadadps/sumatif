  const GAS_URL =
    "https://script.google.com/macros/s/AKfycbwbOC125TFg_9qmEvI8L69iqPgqKmxug1OfY2ofoI19PshqGmctrktH5nHPnxKor7En/exec";

  let canvas, ctx;
  let drawing = false;
  let signatureDataUrl = '';

  /* =========================
      SIGNATURE
  ========================= */

  function openSignaturePad(){

    document.getElementById(
      'signatureModal'
    ).style.display = 'flex';

    canvas =
      document.getElementById(
        'signatureCanvas'
      );

    ctx = canvas.getContext('2d');

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    canvas.addEventListener(
      'mousedown',
      startDraw
    );

    canvas.addEventListener(
      'mousemove',
      draw
    );

    canvas.addEventListener(
      'mouseup',
      stopDraw
    );

    canvas.addEventListener(
      'touchstart',
      startDraw
    );

    canvas.addEventListener(
      'touchmove',
      draw
    );

    canvas.addEventListener(
      'touchend',
      stopDraw
    );
  }

  function closeSignature(){

    document.getElementById(
      'signatureModal'
    ).style.display = 'none';
  }

  function startDraw(e){

    drawing = true;

    ctx.beginPath();

    const pos = getPosition(e);

    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e){

    if(!drawing) return;

    e.preventDefault();

    const pos = getPosition(e);

    ctx.lineTo(pos.x, pos.y);

    ctx.stroke();
  }

  function stopDraw(){
    drawing = false;
  }

  function getPosition(e){

    const rect =
      canvas.getBoundingClientRect();

    const touch =
      e.touches ? e.touches[0] : e;

    return {

      x:
        touch.clientX - rect.left,

      y:
        touch.clientY - rect.top
    };
  }

  function clearSignature(){

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  function saveSignature(){

    signatureDataUrl =
      canvas.toDataURL("image/png");

    const preview =
      document.getElementById(
        'signaturePreview'
      );

    preview.src = signatureDataUrl;

    preview.style.display = 'block';

    closeSignature();
  }

  /* =========================
   VALIDASI FORM  👈 TARUH DI SINI
========================= */
function validateForm(){

  const missing = [];

  const requiredFields = [
    { id: "tanggal", label: "Tanggal" },
    { id: "sesi", label: "Sesi" },
    { id: "mapel1", label: "Mapel 1" },
    { id: "waktuStart", label: "Waktu Start" },
    { id: "waktuEnd", label: "Waktu End" },
    { id: "ruangan", label: "Ruangan" },
    { id: "pengawas", label: "Pengawas" }
  ];

  requiredFields.forEach(field => {

    const el = document.getElementById(field.id);

    if(!el || !el.value || el.value.trim() === ""){

      missing.push(field.label);
    }
  });

  if(!signatureDataUrl || signatureDataUrl === ""){

    missing.push("Tanda Tangan");
  }

  return missing;
}

  /* =========================
      SUBMIT
  ========================= */

  async function submitForm(){

  const btnSubmit = document.getElementById("btnSubmit");

  try {

    /* =========================
       VALIDASI
    ========================= */

    const missing = validateForm();

    if(missing.length > 0){

      showToast("❌ Harap isi: " + missing.join(", "), "error");

      return;
    }

    /* =========================
       DISABLE BUTTON (SAFE)
    ========================= */

    if(btnSubmit){
      btnSubmit.disabled = true;
      btnSubmit.innerText = "Mengirim...";
    }

    /* =========================
       PAYLOAD
    ========================= */

    const payload = {

      action: "beritaAcara",

      tanggal: document.getElementById("tanggal").value,
      sesi: document.getElementById("sesi").value,

      mapel1: document.getElementById("mapel1").value,
      mapel2: document.getElementById("mapel2").value || "",
      mapel3: document.getElementById("mapel3").value || "",
      mapel4: document.getElementById("mapel4").value || "",

      waktuStart: document.getElementById("waktuStart").value,
      waktuEnd: document.getElementById("waktuEnd").value,

      ruangan: document.getElementById("ruangan").value,

      jumlah1: document.getElementById("jumlah1").value,
      jumlah2: document.getElementById("jumlah2").value,
      jumlah3: document.getElementById("jumlah3").value,

      catatan: document.getElementById("catatan").value,
      pengawas: document.getElementById("pengawas").value,

      signature: signatureDataUrl
    };

    /* =========================
       LOADING
    ========================= */

    // document.getElementById("status").innerHTML = "Mengirim data...";
    showLoading();

    /* =========================
       REQUEST
    ========================= */

    const formData = new URLSearchParams();

      formData.append("action", "beritaAcara");
      formData.append("data", JSON.stringify(payload));

      const response = await fetch(GAS_URL, {
        method: "POST",
        body: formData
      });

    const result = await response.json();

    /* =========================
       RESPONSE
    ========================= */

    if(result.success){

      showToast("✅ Berhasil disimpan", "success");

      showSuccess();
      resetForm();

    } else {

       showToast(result.error || "❌ Terjadi kesalahan", "error");
    }

  } catch(err){

    document.getElementById("status").innerHTML =
      "❌ " + err;

  } finally {

    /* =========================
       ENABLE BUTTON (SAFE)
    ========================= */

    if(btnSubmit){
      btnSubmit.disabled = false;
      btnSubmit.innerText = "Simpan";
    }

    hideLoading();
  }
}

/* =========================
   START APP
========================= */

window.addEventListener(
  "DOMContentLoaded",
  async () => {

    try {

      await loadMasterData();

    } catch(err) {

      console.error(err);

      alert("❌ " + err);

    } finally {

      hideAppLoading();
    }
  }
);

/* =========================
   JSONP LOADER
========================= */

function loadJSONP(url) {

  return new Promise((resolve, reject) => {

    const callbackName =
      "jsonp_callback_" + Date.now();

    window[callbackName] = function(data) {

      resolve(data);

      delete window[callbackName];

      document.body.removeChild(script);
    };

    const script =
      document.createElement("script");

    script.src =
      `${url}&callback=${callbackName}`;

    script.onerror = function() {

      reject("Gagal load JSONP");

      delete window[callbackName];
    };

    document.body.appendChild(script);
  });
}

/* =========================
   LOAD MASTER DATA
========================= */

async function loadMasterData() {

  const result =
    await loadJSONP(
      `${GAS_URL}?action=master`
    );

  console.log(result);

  if (!result.success) {

    throw new Error(
      result.error || "Gagal load data"
    );
  }

  fillSelect("mapel1", result.mapel);
  fillSelect("mapel2", result.mapel);
  fillSelect("mapel3", result.mapel);
  fillSelect("mapel4", result.mapel);

  fillSelect("ruangan", result.ruangan);

  fillSelect(
    "pengawas",
    result.pengawas
  );
}

/* =========================
   FILL SELECT
========================= */

function fillSelect(id, data) {

  const select = document.getElementById(id);
  if (!select) return;

  const safeData = Array.isArray(data) ? data : [];

  select.innerHTML = `<option value="">Pilih...</option>`;

  safeData.forEach(item => {

    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.appendChild(option);

  });

  if (select.tomselect) {
    select.tomselect.destroy();
  }

  new TomSelect(select, {
    create: false,
    sortField: { field: "text", direction: "asc" },
    placeholder: "Pilih..."
  });
}

function resetForm() {

  /* =========================
     RESET INPUT TEXT
  ========================= */

  document
    .querySelectorAll(`
      input[type="text"],
      input[type="number"],
      input[type="date"],
      input[type="time"],
      textarea
    `)
    .forEach(el => {

      el.value = "";
    });

  /* =========================
     RESET SELECT
  ========================= */

  [
    "mapel1",
    "mapel2",
    "mapel3",
    "mapel4",
    "pengawas"
  ].forEach(id => {

    const select =
      document.getElementById(id);

    if (!select) return;

    select.value = "";

    /* reset TomSelect */
    if (select.tomselect) {

      select.tomselect.clear();
    }
  });

  /* =========================
     RESET SIGNATURE
  ========================= */

  signatureData = "";

  const preview =
    document.getElementById(
      "signaturePreview"
    );

  if (preview) {

    preview.src = "";
    preview.style.display = "none";
  }

  /* =========================
     CLEAR CANVAS
  ========================= */

  if (window.signaturePad) {

    signaturePad.clear();
  }

  const canvas =
    document.getElementById(
      "signatureCanvas"
    );

  if (canvas) {

    const ctx =
      canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  /* =========================
     RESET CHECKBOX
  ========================= */

  document
    .querySelectorAll(
      'input[type="checkbox"]'
    )
    .forEach(el => {

      el.checked = false;
    });

  /* =========================
     RESET RADIO
  ========================= */

  document
    .querySelectorAll(
      'input[type="radio"]'
    )
    .forEach(el => {

      el.checked = false;
    });

  /* =========================
     SCROLL TOP
  ========================= */

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function showLoading() {

  document
    .getElementById("loadingOverlay")
    .classList.add("show");
}

function hideLoading() {

  document
    .getElementById("loadingOverlay")
    .classList.remove("show");
}

function showSuccess() {

  const overlay =
    document.getElementById(
      "successOverlay"
    );

  if (!overlay) return;

  overlay.classList.add("show");

  setTimeout(() => {

    overlay.classList.remove("show");

  }, 2000);
}

function hideAppLoading() {

  const el =
    document.getElementById(
      "appLoading"
    );

  if (!el) return;

  el.classList.add("hide");

  setTimeout(() => {

    el.remove();

  }, 500);
}

let confirmCallback = null;

function goToMainMenu(){

  confirmCallback = function(){

    window.location.href = "/";
  };

  document
    .getElementById("confirmModal")
    .style.display = "flex";
}

function closeConfirm(result){

  document
    .getElementById("confirmModal")
    .style.display = "none";

  if(result && confirmCallback){
    confirmCallback();
  }

  confirmCallback = null;
}

function showToast(message, type = "success") {

  const toast = document.getElementById("toast");

  if(!toast) return;

  toast.className = "toast-notif show " + type;
  toast.innerText = message;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}