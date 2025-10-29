// Logika untuk melacak progress laporan (Sama dengan sebelumnya)
document.getElementById('checkProgressBtn').addEventListener('click', function() {
    const kodeLaporan = document.getElementById('kodeLaporan').value.trim();
    const statusDiv = document.getElementById('progressStatus');

    if (kodeLaporan === '') {
        statusDiv.innerHTML = '<span style="color: red;">Masukkan kode laporan!</span>';
    } else if (kodeLaporan === 'PPKS123') {
        statusDiv.innerHTML = '<span style="color: green;">Status: Laporan Anda sedang dalam tahap Verifikasi Awal oleh tim kami.</span>';
    } else if (kodeLaporan === 'PPKS456') {
        statusDiv.innerHTML = '<span style="color: blue;">Status: Laporan telah dilanjutkan ke tahap Investigasi.</span>';
    } else {
        statusDiv.innerHTML = '<span style="color: orange;">Kode laporan tidak ditemukan.</span>';
    }
});


// Logika Sederhana untuk Accordion/FAQ
document.addEventListener('DOMContentLoaded', () => {
    const faqButtons = document.querySelectorAll('.faq-button');

    faqButtons.forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.nextElementSibling;
            
            // Tutup semua jawaban (opsional: agar hanya satu yang terbuka)
            document.querySelectorAll('.faq-answer').forEach(a => {
                if (a !== answer && a.classList.contains('show')) {
                    a.classList.remove('show');
                }
            });

            // Toggle jawaban yang diklik
            answer.classList.toggle('show');
        });
    });
});