const API_URL = "https://script.google.com/macros/s/AKfycbwbOC125TFg_9qmEvI8L69iqPgqKmxug1OfY2ofoI19PshqGmctrktH5nHPnxKor7En/exec";

let dataPengawas = [];

const searchInput = document.getElementById("search");
const resultDiv = document.getElementById("result");
const cardContainer = document.getElementById("cardContainer");
const loading = document.getElementById("loading");

searchInput.addEventListener("keyup", cariPengawas);

function showLoading() {
  loading.classList.add("show");
}

function hideLoading() {
  loading.classList.remove("show");
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

  return new Date(tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

async function fetchAPI(action, params = {}) {
  const query = new URLSearchParams({
    action,
    ...params
  });

  const res = await fetch(`${API_URL}?${query}`);
  return await res.json();
}

async function loadPengawas() {
  showLoading();

  try {
    const res = await fetchAPI("getPengawas");

    if (res.success) {
      dataPengawas = res.data;
    }
  } catch (err) {
    alert("Gagal memuat data");
    console.error(err);
  }

  hideLoading();
}

function cariPengawas() {
  const keyword = searchInput.value.toLowerCase();
  resultDiv.innerHTML = "";

  if (!keyword) return;

  const filtered = dataPengawas.filter(g =>
    g.nama.toLowerCase().includes(keyword)
  );

  filtered.forEach(g => {
    const div = document.createElement("div");
    div.textContent = g.nama;
    div.onclick = () => tampilkanKartu(g);
    resultDiv.appendChild(div);
  });
}

async function tampilkanKartu(g) {
  resultDiv.innerHTML = "";
  showLoading();

  try {
    const res = await fetchAPI("getJadwalPengawas", {
      panggilan: g.panggilan
    });

    const jadwal = res.data || [];
    renderKartu(g, jadwal);

  } catch (err) {
    alert("Gagal memuat jadwal");
    console.error(err);
  }

  hideLoading();
}

function renderKartu(g, jadwal) {
  const logo = "https://i.ibb.co.com/sdV75wcH/Logo.png";

  let jadwalHtml = "";

  if (!jadwal.length) {
    jadwalHtml = "<p>Tidak ada jadwal</p>";
  } else {
    jadwalHtml = `
      <div class="jadwal-table">
        <div class="jadwal-header">
          <div>No</div>
          <div>Hari/Tanggal</div>
          <div>Jam</div>
          <div>Sesi</div>
          <div>Ruang</div>
        </div>

        ${jadwal.map((j,i)=>`
          <div class="jadwal-row ${isToday(j.tanggal) ? 'today' : ''}">
            <div>${i+1}</div>
            <div>
              ${formatTanggal(j.tanggal)}
              ${isToday(j.tanggal) ? '<span class="badge-hari">Hari Ini</span>' : ''}
            </div>
            <div>${j.jam}</div>
            <div>${j.sesi}</div>
            <div>${j.ruangan}<br>
            ${
                  j.status && j.status.trim() !== "" && j.status !== "-"
                    ? `<span class="link-btn nonaktif">✅ ${j.pengawas}</span>`
                    : `<span class="link-btn nonaktif">❌ Belum</span>`
                }</div>
          </div>
        `).join("")}
      </div>
    `;
  }

  cardContainer.innerHTML = `
    <div class="card">
      <div class="card-header">
        <img src="${logo}" class="logo">
        <div class="header-text">
          <h4>SMK BINTANG PERSADA DENPASAR</h4>
          <p>Tahun Ajaran 2025/2026</p>
          <div class="title">KARTU PENGAWAS</div>
        </div>
      </div>

      <div class="card-body">
        <div class="row"><b>Nama</b><span>${g.nama}</span></div>
        <div class="row"><b>Jabatan</b><span>${g.jabatan}</span></div>
        <div class="row"><b>Panggilan</b><span>${g.panggilan}</span></div>
      </div>

      <div class="alert-elegan">
        <div class="alert-icon">ℹ</div>
        <div class="alert-text">
            Dimohon untuk tidak lupa mengisi Berita Acara setelah selesai mengawas.
        </div>
        </div>
      <button class="btn-popup" onclick="openImagePopup()">
        Lihat Full Jadwal
      </button>

      <div class="jadwal">
        <h4>Jadwal Mengawas</h4>
        ${jadwalHtml}
      </div>
    </div>
  `;
}

function openImagePopup() {
  document.getElementById("imageModal").classList.add("show");
}

function closeImagePopup() {
  document.getElementById("imageModal").classList.remove("show");
}

let zoomLevel = 1;

function openImagePopup(imageSrc = "/sumatif/kartu_pengawas/JadwalPengawas.png") {
    const img = document.getElementById("popupImage");

    img.src = imageSrc;
    zoomLevel = 1;
    img.style.transform = `scale(${zoomLevel})`;

    document.getElementById("imageModal").classList.add("show");
}

function closeImagePopup() {
    document.getElementById("imageModal").classList.remove("show");
}

function zoomIn() {
    zoomLevel += 0.2;
    updateZoom();
}

function zoomOut() {
    if (zoomLevel > 0.4) {
        zoomLevel -= 0.2;
        updateZoom();
    }
}

function resetZoom() {
    zoomLevel = 1;
    updateZoom();
}

function updateZoom() {
    document.getElementById("popupImage").style.transform =
        `scale(${zoomLevel})`;
}

loadPengawas();
