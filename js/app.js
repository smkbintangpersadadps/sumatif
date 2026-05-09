const GAS_URL = "https://script.google.com/macros/s/AKfycbxddqccbMztTjVz_n338PmK8ZlAb261Nvwe9riI-VKJLJLxY3LkQTIN9-ZCkEC9_uCd/exec";

let dataAbsen = [];

const listRuangan = [
  "Classroom 1",
  "Classroom 2",
  "Classroom 3",
  "Classroom 4",
  "Classroom 5",
  "Classroom 6",
  "Classroom 7",
  "Classroom 8",
  "Classroom 9",
  "Classroom 10",
  "Classroom 11",
  "Classroom 12",
  "Classroom 13",
  "Classroom 14",
  "Classroom 15"
];

document.getElementById("tanggal").value =
  new Date().toLocaleDateString("en-CA");

function filterRuangan() {

  const keyword =
    document.getElementById("ruangan")
    .value
    .toLowerCase();

  const list =
    document.getElementById("ruanganList");

  list.innerHTML = "";

  if (!keyword) return;

  const hasil = listRuangan.filter(r =>
    r.toLowerCase().includes(keyword)
  );

  hasil.forEach(r => {

    const div = document.createElement("div");

    div.textContent = r;

    div.onclick = () => pilihRuangan(r);

    list.appendChild(div);

  });

}

function pilihRuangan(nama) {

  document.getElementById("ruangan").value = nama;

  document.getElementById("ruanganList").innerHTML = "";

}

async function loadData() {

  const tanggal =
    document.getElementById("tanggal").value;

  const ruangan =
    document.getElementById("ruangan").value;

  document.getElementById("loading")
    .classList.add("show");

  try {

    const response = await fetch(
      `${GAS_URL}?action=getAbsensi&tanggal=${tanggal}&ruangan=${encodeURIComponent(ruangan)}`
    );

    const result = await response.json();

    document.getElementById("loading")
      .classList.remove("show");

    dataAbsen = result.data.map(s => ({
      ...s,
      status: s.status || ""
    }));

    render();
    updateInfo();

  } catch (err) {

    document.getElementById("loading")
      .classList.remove("show");

    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: err.message
    });

  }

}

function render() {

  const div =
    document.getElementById("tableContainer");

  div.innerHTML = `

    <br>

    <div class="table-header">
      <div>No</div>
      <div>Nama</div>
      <div>K</div>
      <div>Kelas</div>
      <div>Status</div>
    </div>

    ${dataAbsen.map((s, i) => `

      <div class="table-row">

        <div>${i + 1}</div>

        <div>${s.nama}</div>

        <div>${s.kursi}</div>

        <div>${s.kelas}</div>

        <div
          onclick="toggle(${i})"
          class="status-btn ${getClass(s.status)}"
        >
          ${getText(s.status)}
        </div>

      </div>

    `).join("")}
  `;

}

function toggle(i) {

  const s = dataAbsen[i];

  if (!s.status) {
    s.status = "Hadir";
  } else if (s.status === "Hadir") {
    s.status = "Tidak Hadir";
  } else {
    s.status = "";
  }

  render();

  updateInfo();

  if (navigator.vibrate) {
    navigator.vibrate(30);
  }

}

function setAll(val) {

  dataAbsen.forEach(s => s.status = val);

  render();

  updateInfo();

}

function updateInfo() {

  const total = dataAbsen.length;

  const hadir =
    dataAbsen.filter(s =>
      s.status === "Hadir"
    ).length;

  const tidak =
    dataAbsen.filter(s =>
      s.status === "Tidak Hadir"
    ).length;

  document.getElementById("infoBox").innerHTML = `
    <div>👥 ${total}</div>
    <div>🟢 ${hadir}</div>
    <div>🔴 ${tidak}</div>
  `;

}

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

function resetFilter() {

  document.getElementById("ruangan").value = "";

  document.getElementById("tanggal").value =
    new Date().toLocaleDateString("en-CA");

  dataAbsen = [];

  document.getElementById("tableContainer")
    .innerHTML = "";

  document.getElementById("infoBox")
    .innerHTML = "";

}

async function simpan() {

  Swal.fire({
    title: "Menyimpan...",
    text: "Mohon tunggu",
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {

    const response = await fetch(GAS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        action: "simpanAbsensi",
        data: dataAbsen
      })
    });

    const result = await response.json();

    if (result.success) {

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Absensi berhasil disimpan",
        timer: 1500,
        showConfirmButton: false
      });

      resetFilter();

    } else {

      throw new Error(result.message);

    }

  } catch (err) {

    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: err.message
    });

  }

}