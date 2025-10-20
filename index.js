document.getElementById('checkProgressBtn').addEventListener('click', function() {
        const kodeLaporan = document.getElementById('kodeLaporan').value.trim();
        const statusDiv = document.getElementById('progressStatus');

        if (kodeLaporan === '') {
            statusDiv.innerHTML = '<span class="text-danger">Masukkan kode laporan!</span>';
        } else if (kodeLaporan === 'PPKS123') {
            statusDiv.innerHTML = '<span class="text-success">Status: Laporan Anda sedang dalam tahap Verifikasi Awal oleh tim kami.</span>';
        } else if (kodeLaporan === 'PPKS456') {
            statusDiv.innerHTML = '<span class="text-primary">Status: Laporan telah dilanjutkan ke tahap Investigasi.</span>';
        } else {
            statusDiv.innerHTML = '<span class="text-warning">Kode laporan tidak ditemukan.</span>';
        }
    });