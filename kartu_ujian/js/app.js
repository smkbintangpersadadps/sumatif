const API_URL = "https://script.google.com/macros/s/AKfycbwbOC125TFg_9qmEvI8L69iqPgqKmxug1OfY2ofoI19PshqGmctrktH5nHPnxKor7En/exec";

let dataSiswa = [];

/* =========================
   UTILITIES
========================= */

function showLoading() {
  document.getElementById("loading").classList.add("show");
}

function hideLoading() {
  document.getElementById("loading").classList.remove("show");
}

function isToday(tanggal) {
  if (!tanggal) return false;

  const today = new Date();
  const tgl = new Date(tanggal);

  return (
    tgl.getDate() === today.getDate() &&
    tgl.getMonth() === today.getMonth() &&
    tgl.getFullYear() === today.getFullYear()
  );
}

function formatTanggal(tanggal) {
  if (!tanggal) return "-";

  const tgl = new Date(tanggal);

  return tgl.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function getStatusClass(status) {
  if (!status) return "status-bad";

  const s = status.toLowerCase().trim();

  if (s.includes("memenuhi") && !s.includes("belum")) {
    return "status-ok";
  }

  return "status-bad";
}

/* =========================
   API CALLS
========================= */

async function fetchAPI(action, params = {}) {
  const url = new URL(API_URL);

  url.searchParams.append("action", action);

  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Gagal menghubungi server");
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Terjadi kesalahan");
  }

  return json.data;
}

/* =========================
   LOAD DATA SISWA
========================= */

async function loadData() {
  const input = document.getElementById("search");

  input.disabled = true;
  showLoading();

  try {
    dataSiswa = await fetchAPI("getDataSiswa");
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    hideLoading();
    input.disabled = false;
  }
}

/* =========================
   SEARCH
========================= */

function cariNama() {
  const keyword = document.getElementById("search").value.toLowerCase();
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = "";

  if (!keyword) return;

  const filtered = dataSiswa.filter(s =>
    s.nama.toLowerCase().includes(keyword)
  );

  filtered.slice(0, 10).forEach(s => {
    const div = document.createElement("div");
    div.textContent = `${s.nama} - ${s.kelas}`;
    div.onclick = () => tampilkanKartu(s);
    resultDiv.appendChild(div);
  });
}

/* =========================
   RENDER JADWAL
========================= */

function renderJadwal(jadwal) {
  if (!jadwal || jadwal.length === 0) {
    return `<p class="jadwal-kosong">Tidak ada jadwal</p>`;
  }

  return `
    <div class="jadwal-table">

      <div class="jadwal-header">
        <div>No</div>
        <div>Tanggal</div>
        <div>Waktu</div>
        <div>Mapel</div>
        <div>Link</div>
      </div>

      ${jadwal.map((j, i) => `
        <div class="jadwal-row ${isToday(j.tanggal) ? "today" : ""}">
          
          <div>${i + 1}</div>

          <div>
            ${formatTanggal(j.tanggal)}
            ${isToday(j.tanggal)
              ? '<span class="badge-hari">Hari Ini</span>'
              : ""}
          </div>

          <div><center>${j.waktu}</center></div>

          <div>
            <span class="mapel-badge">${j.mapel || ""}</span>
            <span class="guru-badge">${j.guru || ""}</span>
            <span class="jenis-text">${j.jenis || ""}</span>
          </div>

        <div class="link-cell">
  ${renderLinkButton(j)}
</div>

        </div>
      `).join("")}

    </div>
  `;
}

/* =========================
   TAMPILKAN KARTU
========================= */

async function tampilkanKartu(s) {
  document.getElementById("result").innerHTML = "";

  showLoading();

  try {
    const jadwal = await fetchAPI("getJadwalByKelas", {
      kelas: s.kelas,
      nama: s.nama
    });

    const logo = "https://i.ibb.co.com/sdV75wcH/Logo.png";

    const html = `
      <div class="card">

        <div class="card-header">
          <img src="${logo}" class="logo">

          <div class="header-text">
            <h4>SMK BINTANG PERSADA DENPASAR</h4>
            <p>Tahun Ajaran 2025/2026</p>
            <div class="title">KARTU UJIAN</div>
          </div>
        </div>

        <div class="card-body">

          <div class="row">
            <span class="label">Nama</span>
            <span class="value">${s.nama}</span>
          </div>

          <div class="row hidden-row">
            <span class="label">Kelas</span>
            <span class="value">${s.kelas}</span>
          </div>

          <div class="row">
            <span class="label">Kelas</span>
            <span class="value">${s.kelas}</span>
          </div>

          <div class="row">
            <span class="label">Status</span>
            <span class="value">
              <span class="status ${getStatusClass(s.status)}">
                ${s.status}
              </span>
            </span>
          </div>

          <div class="row">
            <span class="label">Ruangan</span>
            <span class="value">${s.ruangan}</span>
          </div>

          <div class="row">
            <span class="label">Sesi</span>
            <span class="value">${s.sesi}</span>
          </div>

          <div class="row">
            <span class="label">NIPD</span>
            <span class="value">${s.nipd}</span>
          </div>
          
          <div class="row">
            <span class="label">NISN</span>
            <span class="value">${s.nisn}</span>
          </div>

          <div class="row">
            <span class="label">No Kursi</span>
            <span class="value">${s.kursi}</span>
          </div>

        </div>

        <div class="qr">
            <button class="tatib-btn" onclick="showTatib('${s.tatib || ""}')">
                📋 Tata Tertib Ujian
            </button>
        </div>

        <div class="jadwal">
        <h4>Jadwal Ujian</h4>
        <br>

        ${
          s.status &&
          s.status.toLowerCase().includes("belum memenuhi")
            ? `
              <div class="admin-warning">
                ⚠ Silakan Menghubungi Admin / FO
              </div>
            `
            : renderJadwal(jadwal)
        }
      </div>

      </div>
    `;

    document.getElementById("cardContainer").innerHTML = html;

  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    hideLoading();
  }
}

/* =========================
   INIT
========================= */

let searchTimeout;

document.addEventListener("DOMContentLoaded", () => {
  loadData();

  document
    .getElementById("search")
    .addEventListener("keyup", () => {
      clearTimeout(searchTimeout);

      searchTimeout = setTimeout(() => {
        cariNama();
      }, 250);
    });
});

//Cek Status Ujian
//LINK STATUS LINK SEBELUM NYA FIX TETAPI ERROR DI SAFARI TIDAK MUNCUL (TERLEWAT)
// function getLinkStatus(j) {
//   if (!j.link || j.link.trim() === "" || j.link === "-") {
//     return "belum";
//   }

//   const now = new Date();
//   const start = new Date(j.tanggalStart);
//   const end = new Date(j.tanggalEnd);

//   if (now < start) {
//     return "belumMulai";
//   }

//   if (now >= start && now <= end) {
//     return "aktif";
//   }

//   if (now > end && j.sudahAbsen) {
//     return "selesai";
//   }

//   return "terlewat";
// }

//SARAN LINK TERBARU TESTER UNTUK SAFARI

function parseDateSafe(dateStr) {
  if (!dateStr) return null;

  // ubah format iOS-safe
  const d = new Date(dateStr.replace(" ", "T"));

  return isNaN(d.getTime()) ? null : d;
}

function getLinkStatus(j) {
  

  const now = new Date();
  const start = parseDateSafe(j.tanggalStart);
  const end = parseDateSafe(j.tanggalEnd);

  if (!j.link || j.link.trim() === "" && now > end && j.sudahAbsen) {
    return "selesai";
  }
   if (!j.link || j.link.trim() === "") {
    return "belum";
  }
   
  // safety guard iOS
  if (!start || isNaN(start) || !end || isNaN(end)) {
    console.log("INVALID DATE:", j.tanggalStart, j.tanggalEnd);
    return "aktif"; // fallback aman
  }

  if (now < start) {
    return "belumMulai";
  }

  if (now >= start && now <= end) {
    return "aktif";
  }

  if (now > end && j.sudahAbsen) {
    return "selesai";
  }

  return "terlewat";
}

//render tombol
function renderLinkButton(j) {
  const status = getLinkStatus(j);
  console.log("=== DEBUG LINK ===");
  console.log("Mapel:", j.mapel);
  console.log("Sudah Absen:", j.sudahAbsen);
  console.log("Tanggal Start:", j.tanggalStart);
  console.log("Tanggal End:", j.tanggalEnd);
  console.log("Status:", status);
  console.log("Data Full:", j);

  switch (status) {
    case "belum":
      return `<span class="link-btn nonaktif">⏳ Paper</span>`;

    case "belumMulai":
      return `<span class="link-btn tunggu">🕒 Tunggu</span>`;

    case "aktif":
      return `<a href="${j.link}" target="_blank" class="link-btn aktif">▶ Buka</a>`;

    case "selesai":
      return `<span class="link-btn selesai">✓ Selesai</span>`;

    case "terlewat":
      return `<span class="link-btn terlewat">✕ Lewat</span>`;
  }
}

function showTatib(link) {
  Swal.fire({
    customClass: {
      popup: 'custom-popup'
    },

    showClass: {
      popup: 'animate__animated animate__zoomIn'
    },

    hideClass: {
      popup: 'animate__animated animate__fadeOut'
    },

    html: `
      <div style="text-align:center;">
        <img src="https://i.ibb.co.com/sdV75wcH/Logo.png" class="popup-logo">
        <div class="popup-title">Tata Tertib Ujian</div>
      </div>

      <div class="popup-content">
        <ol style="text-align:left; padding-left:18px;">
          <li>Jika Status : Belum Memenuhi, silahkan hubungi Admin/FO.</li>
          <li>Peserta wajib hadir tepat waktu sesuai jadwal ujian.</li>
          <li>Gunakan seragam sekolah sesuai ketentuan.</li>
          <li>Siapkan perangkat dan koneksi internet sebelum ujian dimulai.</li>
          <li>Dilarang membuka tab/aplikasi lain selain media ujian.</li>
          <li>Dilarang bekerja sama atau menyontek.</li>
          <li>Pastikan absensi telah dilakukan sebelum mengerjakan soal.</li>
          <li>Setelah selesai, pastikan jawaban sudah terkirim.</li>
        </ol>

        ${
          link && link.trim() !== "" && link !== "-"
            ? `
              <div style="margin-top:15px;">
                <a href="${link}" target="_blank" class="tatib-link-btn">
                  Lihat Dokumen Lengkap
                </a>
              </div>
            `
            : ""
        }
      </div>

      <div class="popup-footer">
        Kerjakan ujian dengan jujur, tertib, dan penuh tanggung jawab.
      </div>
    `,

    confirmButtonText: "Saya Mengerti",
    confirmButtonColor: "#003366",
    allowOutsideClick: false,
    width: 420
  });
}

function closeTatib() {
  document.getElementById("tatibModal").style.display = "none";
}

window.onclick = function(event) {
  const modal = document.getElementById("tatibModal");

  if (event.target === modal) {
    closeTatib();
  }
};
