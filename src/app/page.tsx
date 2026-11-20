import Link from "next/link";
import styles from "./home.module.css";

const systems = [
  {
    number: "01",
    title: "Alasan membeli",
    description:
      "Kenali kebutuhan, dorongan emosional, urgensi, tekanan sosial, alternatif, dan manfaat yang kamu harapkan.",
  },
  {
    number: "02",
    title: "Kondisi keuangan",
    description:
      "Lihat dampak harga, biaya, dana tersedia, kewajiban yang sudah berjalan, dan cicilan baru terhadap arus kas.",
  },
  {
    number: "03",
    title: "Pertimbangan menyeluruh",
    description:
      "Pahami hasil kedua penilaian secara terpisah, alasan di baliknya, data yang belum lengkap, dan langkah berikutnya.",
  },
];

export default function HomePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link className={styles.wordmark} href="/" aria-label="THINK TWICE, beranda">
          THINK TWICE<span>.</span>
        </Link>
        <nav className={styles.navigation} aria-label="Navigasi utama">
          <a href="#cara-kerja">Cara kerja</a>
          <a href="#prinsip">Prinsip</a>
          <Link className={styles.navCta} href="/assess">Mulai evaluasi <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span /> A MOMENT BEFORE YOU BUY</p>
          <h1>Jangan buru-buru membeli. <em>Pahami dulu keputusanmu.</em></h1>
          <p className={styles.lead}>
            Sebuah jeda kecil sebelum transaksi. Pahami alasan di balik keinginan
            membeli dan dampaknya terhadap kondisi keuanganmu, sebelum menentukan
            langkah berikutnya.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryButton} href="/assess">
              Mulai evaluasi <span aria-hidden="true">→</span>
            </Link>
            <a className={styles.textLink} href="#cara-kerja">Pelajari cara kerjanya</a>
          </div>
          <p className={styles.heroNote}>Tidak perlu membuat akun. Tidak ada keputusan yang dibuat untukmu.</p>
        </div>
        <aside className={styles.heroAside} aria-label="Prinsip THINK TWICE">
          <span className={styles.asideNumber}>01 / 03</span>
          <p className={styles.asideQuote}>“Mampu membeli belum tentu berarti perlu membeli.”</p>
          <span className={styles.asideRule} />
          <p className={styles.asideCaption}>A PERSONAL FINANCIAL DECISION COMPANION</p>
        </aside>
      </section>

      <section className={styles.statement} id="cara-kerja">
        <div>
          <p className={styles.sectionKicker}>LEBIH DARI SEKADAR MAMPU MEMBELI</p>
          <h2>Keputusan yang baik dimulai dari <em>pertanyaan yang tepat.</em></h2>
        </div>
        <p className={styles.statementCopy}>
          Harga dan saldo hanya sebagian dari cerita. Alasan membeli, tekanan
          emosional, pilihan lain, dan kewajiban finansial juga layak
          dipertimbangkan. THINK TWICE. membantu melihat semuanya dengan lebih jernih.
        </p>
      </section>

      <section className={styles.systems} aria-labelledby="systems-title">
        <div className={styles.sectionHeading}>
          <p className={styles.sectionKicker}>TIGA BAGIAN, SATU PERTIMBANGAN</p>
          <h2 id="systems-title">Lihat keputusan dari berbagai sisi.</h2>
        </div>
        <div className={styles.systemGrid}>
          {systems.map((system) => (
            <article className={styles.systemCard} key={system.number}>
              <span className={styles.systemNumber}>{system.number}</span>
              <h3>{system.title}</h3>
              <p>{system.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.principles} id="prinsip">
        <div>
          <p className={styles.sectionKicker}>DIBANGUN DENGAN PERTIMBANGAN</p>
          <h2>Jernih dalam penilaian. <em>Terbuka tentang batasannya.</em></h2>
        </div>
        <div className={styles.principleList}>
          <article>
            <span>01</span>
            <div><h3>Kamu tetap memegang kendali</h3><p>THINK TWICE. memberi bahan pertimbangan, bukan mengambil keputusan akhir.</p></div>
          </article>
          <article>
            <span>02</span>
            <div><h3>Alasan dan angka tetap terpisah</h3><p>Penilaian perilaku dan kemampuan finansial ditampilkan terpisah agar konteksnya tidak tercampur.</p></div>
          </article>
          <article>
            <span>03</span>
            <div><h3>Data yang tidak diketahui tetap tidak diketahui</h3><p>Informasi yang belum tersedia tidak diam-diam dianggap nol atau diganti dengan asumsi.</p></div>
          </article>
          <article>
            <span>04</span>
            <div><h3>Privasi sejak awal</h3><p>Riwayat bersifat opsional dan disimpan di browser. Data formulir tidak dikirim ke server untuk penilaian V1.</p></div>
          </article>
        </div>
      </section>

      <section className={styles.closing}>
        <p className={styles.sectionKicker}>SEBELUM KAMU MEMUTUSKAN</p>
        <h2>Ambil jeda. Lihat gambaran utuhnya.</h2>
        <p>Mulai dengan satu rencana pembelian. Kamu bisa meninjau hasilnya sebelum menentukan pilihan.</p>
        <Link className={styles.primaryButton} href="/assess">Mulai evaluasi <span aria-hidden="true">→</span></Link>
      </section>

      <footer className={styles.footer}>
        <Link className={styles.wordmark} href="/">THINK TWICE<span>.</span></Link>
        <p>Think twice today. Thank yourself tomorrow.</p>
        <span>PERSONAL FINANCIAL DECISION COMPANION</span>
      </footer>
    </main>
  );
}
