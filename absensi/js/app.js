const GAS_URL = "https://script.google.com/macros/s/AKfycbwbOC125TFg_9qmEvI8L69iqPgqKmxug1OfY2ofoI19PshqGmctrktH5nHPnxKor7En/exec";

let dataAbsen = [];

// =====================
// INIT DEFAULT VALUE
// =====================
window.addEventListener("DOMContentLoaded", () => {

  document.getElementById("tanggal").value =
    new Date().toISOString().split("T")[0];

  document.getElementById("sesi").value = "1";
});

// =====================
// RUANGAN LIST
// =====================
const listRuangan = [
  "Classroom 1","Classroom 2","Classroom 3","Classroom 4","Classroom 5",
  "Classroom 6","Classroom 7","Classroom 8","Classroom 9","Classroom 10"
];

// =====================
// FILTER RUANGAN
// =====================
function filterRuangan() {

  const keyword = document.getElementById("ruangan").value.toLowerCase();
  const list = document.getElementById("ruanganList");

  list.innerHTML = "";

  if (!keyword) return;

  listRuangan
    .filter(r => r.toLowerCase().includes(keyword))
    .forEach(r => {
      const div = document.createElement("div");
      div.textContent = r;
      div.onclick = () => pilihRuangan(r);
      list.appendChild(div);
    });
}

function pilihRuangan(nama) {
  document.getElementById("ruangan").value = nama.trim();
  document.getElementById("ruanganList").innerHTML = "";
}

// =====================
// JSONP LOADER (ROBUST)
// =====================
function loadJSONP(url) {
  return new Promise((resolve, reject) => {

    const callbackName = "cb_" + Date.now() + Math.floor(Math.random() * 1000);

    const script = document.createElement("script");

    window[callbackName] = (data) => {
      resolve(data);
      delete window[callbackName];
      script.remove();
    };

    script.src = url + "&callback=" + callbackName;

    script.onerror = () => {
      delete window[callbackName];
      script.remove();
      reject(new Error("Gagal load JSONP"));
    };

    document.body.appendChild(script);
  });
}

// =====================
// LOAD DATA ABSENSI
// =====================
async function loadData() {

  const tanggal = document.getElementById("tanggal").value;
  const sesi = document.getElementById("sesi").value;
  const ruangan = document.getElementById("ruangan").value;

  // VALIDASI
  if (!tanggal || !sesi || !ruangan) {
    Swal.fire({
      icon: "warning",
      title: "Lengkapi Data",
      text: "Tanggal, sesi, dan ruangan wajib diisi"
    });
    return;
  }

  document.getElementById("loading").classList.add("show");

  try {

    const url =
      `${GAS_URL}?action=getAbsensi` +
      `&tanggal=${tanggal}` +
      `&sesi=${sesi}` +
      `&ruangan=${encodeURIComponent(ruangan.trim())}`;

    console.log("REQUEST:", url);

    const result = await loadJSONP(url);

    console.log("DEBUG RESULT:", JSON.stringify(result, null, 2));

    document.getElementById("loading").classList.remove("show");

    if (!result || !Array.isArray(result.data)) {
      throw new Error("Response tidak valid dari server");
    }

    dataAbsen = result.data.map(s => ({
      ...s,
      status: s.status || ""
    }));

    render();
    updateInfo();

  } catch (err) {

    document.getElementById("loading").classList.remove("show");

    Swal.fire({
      icon: "error",
      title: "Gagal Load Data",
      text: err.message
    });
  }
}

// =====================
// RENDER TABLE
// =====================
function render() {

  const div = document.getElementById("tableContainer");

  if (!dataAbsen.length) {
    div.innerHTML = "<p style='text-align:center'>Tidak ada data</p>";
    return;
  }

  div.innerHTML = `
    <br>

    <div class="table-scroll">
      <div class="table-inner">

        <div class="table-header">
          <div>No</div>
          <div>Nama</div>
          <div>Absensi</div>
          <div><center>Administrasi</center></div>
          <div>Kelas</div>
        </div>

        ${dataAbsen.map((s, i) => `
          <div class="table-row ${s.statuspembayaran?.toLowerCase() === 'belum memenuhi' ? 'row-danger' : ''}">
            <div>${i + 1}</div>
            <div>${s.nama}</div>
            <div
              onclick="toggle(${i})"
              class="status-btn ${getClass(s.status)}"
            >
              ${getText(s.status)}
            </div>
            <div><center>${s.statuspembayaran}</center></div>
            <div>${s.kelas}</div>
            
            
          </div>
        `).join("")}

      </div>
    </div>
  `;
}

// =====================
// TOGGLE STATUS
// =====================
function toggle(i) {

  const s = dataAbsen[i];

  if (!s.status) s.status = "Hadir";
  else if (s.status === "Hadir") s.status = "Tidak Hadir";
  else s.status = "";

  render();
  updateInfo();

  if (navigator.vibrate) navigator.vibrate(30);
}

// =====================
// SET ALL
// =====================
function setAll(val) {
  dataAbsen.forEach(s => s.status = val);
  render();
  updateInfo();
}

// =====================
// INFO BOX
// =====================
function updateInfo() {

  const total = dataAbsen.length;
  const hadir = dataAbsen.filter(s => s.status === "Hadir").length;
  const tidak = dataAbsen.filter(s => s.status === "Tidak Hadir").length;

  document.getElementById("infoBox").innerHTML = `
    <div>👥 ${total}</div>
    <div>🟢 ${hadir}</div>
    <div>🔴 ${tidak}</div>
  `;
}

// =====================
// STYLE HELPERS
// =====================
function getClass(s) {
  if (s === "Hadir") return "status-hadir";
  if (s === "Tidak Hadir") return "status-tidak";
  return "status-none";
}

function getText(s) {
  if (s === "Hadir") return "Hadir";
  if (s === "Tidak Hadir") return "Tidak";
  return "Tap";
}

// =====================
// RESET
// =====================
function resetFilter() {

  document.getElementById("ruangan").value = "";

  document.getElementById("tanggal").value =
    new Date().toISOString().split("T")[0];

  document.getElementById("sesi").value = "1";

  dataAbsen = [];

  document.getElementById("tableContainer").innerHTML = "";
  document.getElementById("infoBox").innerHTML = "";
  }

  // =====================
  // SIMPAN
  // =====================
//   async function simpan() {

//   Swal.fire({
//     title: "Menyimpan...",
//     allowOutsideClick: false,
//     didOpen: () => Swal.showLoading()
//   });

//   try {

//     const url =
//       `${GAS_URL}?action=simpanAbsensi` +
//       `&data=${encodeURIComponent(JSON.stringify(dataAbsen))}`;

//     const result = await loadJSONP(url);

//     console.log("SAVE RESULT:", result);

//     if (result.success) {

//       Swal.fire({
//         icon: "success",
//         title: "Berhasil",
//         timer: 1500,
//         showConfirmButton: false
//       });

//       resetFilter();

//     } else {
//       throw new Error(result.message || "Gagal simpan");
//     }

//   } catch (err) {

//     Swal.fire({
//       icon: "error",
//       title: "Gagal Simpan",
//       text: err.message
//     });
//   }
// }

async function simpan() {

  Swal.fire({
    title: "Menyimpan...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {

    const formData = new URLSearchParams();

    formData.append("action", "simpanAbsensi");
    formData.append("data", JSON.stringify(dataAbsen));

    const response = await fetch(GAS_URL, {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    console.log("SAVE RESULT:", result);

    if (result.success) {

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        timer: 1500,
        showConfirmButton: false
      });

      resetFilter();

    } else {
      throw new Error(result.message || "Gagal simpan");
    }

  } catch (err) {

    Swal.fire({
      icon: "error",
      title: "Gagal Simpan",
      text: err.message
    });
  }
}

let confirmCallback = null;

function goToMainMenu(){

  confirmCallback = function(){

    window.location.href = "/sumatif";
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
