const GAS_URL = "https://script.google.com/macros/s/AKfycbwbOC125TFg_9qmEvI8L69iqPgqKmxug1OfY2ofoI19PshqGmctrktH5nHPnxKor7En/exec";

let dataPembayaran = [];

// =====================
// LOAD DATA BY NAMA
// =====================
async function loadPembayaran() {

  const nama = document.getElementById("nama").value.trim();

  if (!nama) {
    Swal.fire({
      icon: "warning",
      title: "Isi Nama",
      text: "Masukkan nama siswa"
    });
    return;
  }

  Swal.fire({
    title: "Loading...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {

    const url =
      `${GAS_URL}?action=getPembayaran&nama=${encodeURIComponent(nama)}`;

    const res = await fetch(url);
    const result = await res.json();

    Swal.close();

    if (!result.success) {
      throw new Error(result.message || "Gagal load data");
    }

    dataPembayaran = result.data || [];

    renderTable();

  } catch (err) {

    Swal.fire({
      icon: "error",
      title: "Gagal Load",
      text: err.message
    });
  }
}

// =====================
// RENDER TABLE
// =====================
function renderTable() {

  const div = document.getElementById("table");

  if (!dataPembayaran.length) {
    div.innerHTML = "<p style='text-align:center'>Data tidak ditemukan</p>";
    return;
  }

  div.innerHTML = dataPembayaran.map((s, i) => `

    <div class="row">

      <div>${i + 1}</div>
      <div>${s.nama}</div>
      <div>${s.kelas}</div>

      <div>
        <select onchange="ubahStatus(${i}, this.value)">
          <option value="Memenuhi" ${s.status === "Memenuhi" ? "selected" : ""}>Memenuhi</option>
          <option value="Belum Memenuhi" ${s.status === "Belum Memenuhi" ? "selected" : ""}>Belum Memenuhi</option>
        </select>
      </div>

    </div>

  `).join("");
}

// =====================
// UPDATE LOCAL DATA
// =====================
function ubahStatus(index, value) {
  dataPembayaran[index].status = value;
}

// =====================
// SIMPAN (GET - ANTI CORS)
// =====================
async function simpanPembayaran() {

  if (!dataPembayaran.length) {
    Swal.fire({
      icon: "warning",
      title: "Tidak ada data",
      text: "Cari data dulu"
    });
    return;
  }

  Swal.fire({
    title: "Menyimpan...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {

    const url =
      `${GAS_URL}?action=updatePembayaran` +
      `&data=${encodeURIComponent(JSON.stringify(dataPembayaran))}`;

    const res = await fetch(url);
    const result = await res.json();

    Swal.close();

    if (!result.success) {
      throw new Error(result.message || "Gagal simpan");
    }

    Swal.fire({
      icon: "success",
      title: "Berhasil",
      timer: 1500,
      showConfirmButton: false
    });

  } catch (err) {

    Swal.fire({
      icon: "error",
      title: "Gagal Simpan",
      text: err.message
    });
  }
}