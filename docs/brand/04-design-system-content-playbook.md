THINK TWICE.

# Design System & Content Playbook

Spesifikasi pengalaman produk, sistem komponen, dan pedoman konten

**Think twice today. Thank yourself tomorrow.**

Versi 1.1 · Refinement | Bahasa Indonesia

## 01. Prinsip pengalaman produk

THINK TWICE. dirancang untuk membantu pengguna membuat keputusan sebelum transaksi atau komitmen terjadi. Pengalaman harus terasa reflektif, jelas, tidak menghakimi, dan transparan terhadap data serta keterbatasannya.

- Assessment adalah entry point utama, bukan fitur tersembunyi.
- Satu tahap memiliki satu tujuan yang jelas.
- Pisahkan evaluasi perilaku dan evaluasi finansial.
- Jangan menganggap limit kredit sebagai pendapatan atau uang tersedia.
- Jelaskan dasar rekomendasi dan tampilkan data yang digunakan.
- Pengguna tetap memegang keputusan akhir.

## 02. Arsitektur inti produk

| Sistem | Pertanyaan utama | Output |
| --- | --- | --- |
| Purchase Decision Assessment | Mengapa pengguna ingin membeli? | Motivasi, kebutuhan, urgensi, tekanan sosial, potensi penyesalan, dan nilai guna |
| Financial Reality Check | Apakah keputusan ini dapat ditanggung secara finansial? | Ketersediaan dana, biaya total, dampak tabungan, kewajiban, dan arus kas |
| Decision Intelligence | Apa arti gabungan kedua evaluasi tersebut? | Ringkasan, dua dimensi risiko, simulasi, rekomendasi, dan alasan |

> **ATURAN ARSITEKTUR**  
> Ketiga sistem saling terhubung, tetapi tidak dilebur menjadi satu skor yang tidak dapat dijelaskan. Purchase Decision Assessment tetap menjadi fitur inti dan tidak boleh dihapus atau digantikan oleh kalkulator finansial.

## 03. Alur assessment end-to-end

1. **Purchase Information:** barang/jasa, harga, kategori, urgensi, dan konteks.
2. **Purchase Decision Assessment:** kebutuhan, keinginan, motivasi, tekanan sosial, alternatif, penyesalan, dan nilai jangka panjang.
3. **Payment Method Assessment:** tunai, tabungan, kartu kredit, PayLater, cicilan, pinjaman, pinjaman pribadi, atau metode gabungan.
4. **Financial Reality Check:** pendapatan, kebutuhan wajib, pengeluaran variabel, tabungan, dana darurat, dan semua kewajiban aktif.
5. **Future Cashflow Simulation:** dampak pembayaran terhadap periode mendatang berdasarkan jadwal dan asumsi.
6. **Decision Intelligence:** gabungkan temuan perilaku dan finansial, pertahankan dua dimensi risiko.
7. **Final Recommendation:** hasil, alasan, konsekuensi, ketidakpastian, dan langkah berikutnya.

## 04. Purchase Decision Assessment

| Dimensi | Contoh pertanyaan | Catatan |
| --- | --- | --- |
| Need vs. want | Apakah barang ini kebutuhan atau keinginan? | Jangan otomatis menganggap keinginan sebagai keputusan buruk. |
| Motivasi | Apa alasan utama ingin membeli? | Pisahkan kebutuhan, kenyamanan, tren, hadiah, dan validasi. |
| Social pressure | Apakah ada permintaan atau ekspektasi orang lain? | Termasuk pembelian untuk teman/keluarga. |
| Urgency | Apakah pembelian harus dilakukan sekarang? | Periksa alasan urgensi dan konsekuensi menunda. |
| Alternatives | Adakah opsi lebih murah atau meminjam sementara? | Jangan mengasumsikan alternatif selalu tersedia. |
| Expected regret | Bagaimana kemungkinan perasaan setelah membeli? | Gunakan sebagai refleksi, bukan prediksi psikologis pasti. |
| Long-term value | Apakah manfaatnya bertahan dan relevan? | Sesuaikan dengan jenis produk dan konteks. |

## 05. Financial Reality Check

| Kelompok data | Data yang dibutuhkan |
| --- | --- |
| Pendapatan | Pendapatan bersih, frekuensi, kestabilan, dan tanggal penerimaan |
| Kebutuhan wajib | Tempat tinggal, makan, transportasi, utilitas, kesehatan, tanggungan |
| Pengeluaran variabel | Belanja rutin dan pengeluaran fleksibel |
| Dana | Saldo operasional, tabungan tujuan, dana darurat; bedakan dana yang boleh digunakan |
| Kewajiban | Kartu kredit, PayLater, pinjaman online, pinjaman bank, cicilan, utang pribadi |
| Detail biaya | Pokok, bunga, biaya admin, biaya layanan, denda, total pembayaran |
| Jadwal | Nominal, tanggal jatuh tempo, tenor, sisa periode, dan status pembayaran |

Jangan menjumlahkan limit kredit sebagai aset atau pendapatan. Dana darurat dan tabungan dengan tujuan khusus tidak otomatis dianggap uang bebas. Perhitungan harus membedakan arus kas bulanan, saldo saat ini, dan total kewajiban.

## 06. Metode pembayaran dan perlakuan

| Metode | Evaluasi minimum |
| --- | --- |
| Tunai / saldo | Saldo yang benar-benar tersedia setelah kebutuhan dan kewajiban dekat |
| Tabungan | Tujuan tabungan, saldo sebelum/sesudah, dan dampak pada dana darurat |
| Kartu kredit | Tagihan berjalan, tanggal cetak/jatuh tempo, biaya, dan kemampuan melunasi |
| PayLater / BNPL | Total biaya, tenor, jadwal, biaya layanan, denda, dan kewajiban lintas penyedia |
| Cicilan | Uang muka, pokok, biaya/bunga, tenor, dan total pembayaran |
| Pinjaman online / bank | Dana bersih diterima, total pengembalian, bunga efektif bila diketahui, biaya, tenor, dan risiko keterlambatan |
| Pinjaman pribadi | Kesepakatan nominal, jadwal, fleksibilitas, dan dampak relasi |
| Metode gabungan | Evaluasi setiap sumber dana dan gabungkan semua komitmen tanpa duplikasi |

## 07. Future Cashflow Simulation

- Tampilkan proyeksi 1, 3, 6, dan 12 bulan jika data dan tenor mendukung.
- Masukkan tanggal penerimaan pendapatan dan tanggal jatuh tempo, bukan hanya total bulanan.
- Tampilkan skenario dasar dan skenario tekanan bila relevan.
- Nyatakan asumsi, data yang hilang, biaya yang belum diketahui, dan ketidakpastian.
- Jangan menyatakan proyeksi sebagai jaminan saldo masa depan.

## 08. Decision Intelligence dan klasifikasi hasil

| Hasil | Definisi operasional |
| --- | --- |
| SAFE TO BUY | Data yang tersedia menunjukkan pembelian sesuai prioritas dan batas kemampuan yang ditetapkan; tetap tampilkan asumsi. |
| BUY WITH CAUTION | Pembelian mungkin dilakukan, tetapi mengurangi fleksibilitas atau memiliki kompromi yang perlu dipahami. |
| WAIT & REASSESS | Tidak mendesak, data belum lengkap, atau kondisi dapat berubah; sarankan jeda dan evaluasi ulang. |
| FINANCIALLY RISKY | Pembelian berpotensi mengganggu kebutuhan, tabungan penting, atau kewajiban yang ada. |
| DO NOT BUY | Berdasarkan data yang tersedia, keputusan tidak sejalan dengan prioritas atau menimbulkan risiko yang tidak dapat ditanggung. |

Tampilkan secara terpisah: Behavioral Assessment (risiko perilaku) dan Financial Assessment (risiko finansial). Rekomendasi akhir menjelaskan kontribusi keduanya. Jangan menggunakan satu angka skor sebagai representasi lengkap kesehatan keuangan.

## 09. Aturan data dan ketidakpastian

- Setiap hasil mencantumkan tanggal evaluasi dan data yang digunakan.
- Data yang belum tersedia ditandai sebagai belum diketahui, bukan dianggap nol.
- Jika bunga atau biaya tidak diketahui, jangan mengarang; tampilkan perhitungan parsial dan minta input.
- Hindari presisi palsu pada proyeksi.
- Berikan pengguna kesempatan mengoreksi input sebelum hasil disimpan.
- Sediakan sumber perhitungan sederhana: rumus, komponen, dan asumsi yang memengaruhi hasil.

## 10. Design tokens

| Token | Nilai |
| --- | --- |
| space-1 / 2 / 3 / 4 | 4 / 8 / 12 / 16 px |
| space-5 / 6 / 8 | 20 / 24 / 32 px |
| space-10 / 12 / 16 | 40 / 48 / 64 px |
| radius-sm / md / lg / xl | 6 / 10 / 16 / 24 px |
| radius-full | 999 px |
| Mobile horizontal padding | 20 px |
| Tablet horizontal padding | 32 px |
| Desktop content max | 1200 px |
| Card gap | 16–24 px |

## 11. Komponen UI

| Komponen | Aturan |
| --- | --- |
| Primary / Secondary Button | Label berupa tindakan spesifik; state disabled/loading jelas. |
| Currency Input | Format Rupiah, validasi angka, dan konteks periode. |
| Radio / Checkbox | Opsi saling eksklusif atau multi-pilih dijelaskan. |
| Assessment Card | Satu pertanyaan utama, progres, dan pilihan yang mudah dipahami. |
| Financial Summary Card | Nominal, periode, sumber data, dan status kelengkapan. |
| Payment Method Selector | Mendukung lebih dari satu metode tanpa menggandakan kewajiban. |
| Debt Commitment Card | Penyedia, sisa pokok bila diketahui, cicilan, jatuh tempo, tenor. |
| Risk Indicator | Label teks, warna semantik, dan penjelasan. |
| Decision Result Card | Hasil, alasan utama, dampak, asumsi, dan langkah berikutnya. |
| Cashflow Chart | Sumbu, periode, satuan, dan nilai terbaca; sediakan ringkasan tekstual. |
| Cooling-off Timer | Durasi dapat dipilih; pengguna bisa mengubah atau membatalkan. |
| Empty / Error State | Jelaskan apa yang terjadi dan cara memperbaikinya. |

## 12. Interaksi dan aksesibilitas

- Simpan progres assessment ketika pengguna keluar dan jelaskan status penyimpanan.
- Jangan memaksa pengguna mengisi data yang tidak relevan dengan skenario.
- Sediakan jalur untuk melanjutkan dengan data terbatas dan tandai keterbatasan hasil.
- Berikan konfirmasi sebelum menghapus atau mengganti data finansial penting.
- Dukung keyboard, screen reader, ukuran teks, dan kontras yang memadai.
- Jangan memakai warna sebagai satu-satunya penanda.
- Jangan membuat dark pattern, urgensi palsu, atau alur yang mendorong utang.

## 13. Content playbook

| Pilar konten | Topik | Tujuan |
| --- | --- | --- |
| Spending Awareness | Impulsive buying, needs vs wants, jeda pembelian | Membangun kesadaran sebelum transaksi |
| Financial Literacy | Anggaran, arus kas, tabungan, dana darurat | Meningkatkan pemahaman kemampuan finansial |
| Credit & Debt Awareness | PayLater, pinjaman, kartu kredit, bunga, total repayment | Membuat kewajiban dan biaya terlihat |
| Social & Emotional Spending | FOMO, tekanan sosial, lifestyle inflation, batas finansial | Membantu pengguna mengenali pemicu |
| Product Education | Assessment, simulasi, hasil rekomendasi, riwayat | Mengajarkan penggunaan produk secara benar |

## 14. Format dan struktur konten

| Format | Struktur yang disarankan |
| --- | --- |
| Carousel 7 slide | Hook → situasi → fakta → penjelasan → langkah praktis → refleksi → closing/CTA |
| Video pendek | Hook 2–3 detik → satu masalah → satu insight → satu tindakan |
| In-app education | Konteks → penjelasan singkat → dampak → tautan bantuan |
| Product walkthrough | Tujuan → input → proses → hasil → batasan hasil |
| Kampanye | Masalah nyata → sudut pandang brand → edukasi → penggunaan produk |

## 15. Contoh tema kampanye

| Tema | Pesan |
| --- | --- |
| THINK BEFORE YOU BORROW | Pinjaman memberi akses dana hari ini sekaligus kewajiban pada masa depan. |
| THE REAL COST OF PAYLATER | Jangan hanya melihat cicilan per bulan. Hitung total biaya dan jadwalnya. |
| YOUR MONEY, YOUR PRIORITY | Permintaan orang lain tidak otomatis menjadi tanggung jawab finansialmu. |
| THE ART OF WAITING | Memberi waktu untuk berpikir bukan berarti kehilangan kesempatan. |

## 16. Metrik produk dan konten

| Area | Metrik dan definisi |
| --- | --- |
| Assessment | Start rate, completion rate, drop-off per tahap, revisi jawaban |
| Financial profile | Kelengkapan data dan persentase hasil dengan keterbatasan data |
| Decision quality | Pengguna membuka alasan, melihat simulasi, dan menggunakan cooling-off |
| Behavior change | Pembelian ditunda/dibatalkan; ukur sebagai tindakan yang dilaporkan atau diverifikasi |
| Content | Saves, shares, completion, klik ke edukasi, kualitas komentar |
| Trust | Koreksi hasil, laporan kesalahan, permintaan ekspor/penghapusan, keluhan privasi |

Estimasi uang yang tidak jadi dibelanjakan harus dilabeli sebagai estimasi, kecuali pembatalan transaksi atau keputusan tidak membeli dapat diverifikasi. Jangan mengklaim hubungan sebab-akibat hanya dari korelasi.

## 17. Trust, privacy, and safety

- Data finansial bersifat sensitif dan harus dilindungi dengan kontrol keamanan yang sesuai.
- Kumpulkan data minimum dan jelaskan alasan setiap permintaan data.
- Jangan meminta PIN, password, OTP, atau kredensial perbankan.
- Gunakan integrasi resmi dan persetujuan eksplisit bila tersedia.
- Sediakan pengelolaan, ekspor, dan penghapusan data sesuai kebijakan.
- Jelaskan bahwa hasil merupakan estimasi berbasis data pengguna dan bukan nasihat profesional.

> **ATURAN PRODUK YANG TIDAK BOLEH BERUBAH**  
> Purchase Decision Assessment tetap menjadi fitur inti. Financial Reality Check melengkapi, bukan menggantikannya. Decision Intelligence menggabungkan keduanya secara transparan.

> **IDENTITAS RESMI**  
> THINK TWICE.  
> Think twice today. Thank yourself tomorrow.
