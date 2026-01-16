// Update tanggal
document.getElementById('current-date').textContent = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// Elemen
const form = document.getElementById('absenForm');
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const fotoInput = document.getElementById('foto');
const startBtn = document.getElementById('startCamera');
const captureBtn = document.getElementById('capture');
const mapsEmbed = document.getElementById('mapsEmbed');
const absensiList = document.getElementById('absensiList');
const emptyMessage = document.getElementById('emptyMessage');

// Load data absensi dari localStorage
let absensi = JSON.parse(localStorage.getItem('absensiFIK')) || [];
renderList();

// Render list absensi
function renderList() {
  absensiList.innerHTML = '';
  if (absensi.length === 0) {
    emptyMessage.style.display = 'block';
    return;
  }
  emptyMessage.style.display = 'none';
  absensi.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-500 transition shadow-lg card-hover fade-in';
    div.style.animationDelay = `${index * 0.1}s`;
    div.innerHTML = `
      <div class="flex flex-col md:flex-row items-center gap-4">
        <img src="${item.foto}" alt="Foto ${item.nama}" class="w-20 h-20 rounded-full object-cover border-2 border-cyan-500">
        <div class="flex-1 text-center md:text-left">
          <p class="font-bold text-cyan-300 text-lg">${item.nama}</p>
          <p class="text-sm text-gray-300">NPM: ${item.npm}</p>
          <p class="text-sm text-gray-300">Prodi: ${item.prodi}</p>
          <p class="text-sm text-gray-400">Lokasi: ${item.lokasi}</p>
          <p class="text-xs text-gray-500 mt-1">${item.tanggal}</p>
        </div>
        <div class="flex-shrink-0">
          <span class="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">Hadir</span>
        </div>
      </div>
    `;
    absensiList.appendChild(div);
  });
}

// Mulai kamera
startBtn.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
    captureBtn.disabled = false;
  } catch (err) {
    alert('Gagal akses kamera: ' + err.message + '. Pastikan izin kamera diizinkan.');
  }
});

// Capture foto
captureBtn.addEventListener('click', () => {
  canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);
  const dataUrl = canvas.toDataURL('image/png');
  preview.src = dataUrl;
  fotoInput.value = dataUrl; // simpan base64
  document.getElementById('previewContainer').classList.remove('hidden');
  alert('Foto berhasil diambil!');
});

// Stop kamera function
function stopCamera() {
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
  document.getElementById('cameraPlaceholder').style.display = 'flex';
  captureBtn.disabled = true;
}

// Update Maps embed berdasarkan lokasi (demo sederhana, ganti dengan API real kalau perlu)
document.getElementById('lokasi').addEventListener('input', (e) => {
  const lokasi = e.target.value;
  if (lokasi.trim() !== '') {
    // Encode lokasi untuk URL
    const encodedLokasi = encodeURIComponent(lokasi);
    // Embed Google Maps dengan lokasi yang diinput, termasuk traffic
    mapsEmbed.src = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dA2m3qbUOqBHEI&center=${encodedLokasi}&zoom=15&maptype=roadmap&layer=traffic`;
  } else {
    // Placeholder jika kosong
    mapsEmbed.src = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126845.509!2d106.8!3d-6.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3d!2sJakarta!5e0!3m2!1sid!2sid!4v1690000000000!5m2!1sid!2sid`;
  }
});

// Fungsi untuk mendapatkan lokasi user secara otomatis
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      // Set lokasi input dengan koordinat
      document.getElementById('lokasi').value = `${lat},${lng}`;
      // Update maps dengan lokasi user
      mapsEmbed.src = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dA2m3qbUOqBHEI&center=${lat},${lng}&zoom=15&maptype=roadmap&layer=traffic`;
    }, (error) => {
      console.error('Error getting location:', error);
      alert('Tidak dapat mendapatkan lokasi. Pastikan izin lokasi diizinkan.');
    });
  } else {
    alert('Geolocation tidak didukung oleh browser ini.');
  }
}

// Panggil getUserLocation saat halaman load
window.addEventListener('load', getUserLocation);

// Submit form
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const nama = document.getElementById('nama').value.trim();
  const npm = document.getElementById('npm').value.trim();
  const prodi = document.getElementById('prodi').value;
  const lokasi = document.getElementById('lokasi').value.trim();
  const foto = fotoInput.value;

  if (!nama || npm.length !== 10 || !prodi || !lokasi || !foto) {
    alert('Isi semua field dan ambil foto dulu!');
    return;
  }

  const data = { nama, npm, prodi, lokasi, foto, tanggal: new Date().toLocaleString('id-ID') };
  absensi.push(data);
  localStorage.setItem('absensiFIK', JSON.stringify(absensi));

  renderList();
  form.reset();
  preview.src = '';
  fotoInput.value = '';
  document.getElementById('previewContainer').classList.add('hidden');
  stopCamera(); // matikan kamera

  alert('Absen berhasil dengan foto & lokasi!');
});
