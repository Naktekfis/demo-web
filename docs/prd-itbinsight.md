# !! README

**Hanya untuk Bidang:** Marketing, Competition, Event, Creative Branding

**Contoh Website Event:**
* https://www.sreitb.com/iyref
* https://arkavidia.com/
* https://www.pasarseniitb.com/

**Proses:** Diskusi Divisi -> Diskusi dan Pengisian bersama KaBid -> Iterasi

**Last Revision: 31 Maret 2026 -> 5 April**
*(Karena belum ada keputusan akhir RUA MPA: Oprec luar HMFT)*

Selanjutnya boleh **revisi dikit**, atau penambahan fitur kecil, namun tidak yang refactor framework besar-besaran. 
**Harap se-detail mungkin, we can’t read your minds!**

---

# DRAFT Unified PRD

**UNIFIED Product Requirements Document**
**Status:** Draft
**Penanggung Jawab (PIC):** Fathir & Farhan
**Tanggal:** -

## 1. Ringkasan Eksekutif
[ Insert last ]

## 2. Pernyataan Masalah & Tujuan
- Need easy register and pay for the event and competition
- Need easy to access information tracking

Several technical issues need to be addressed:
- Hundreds (or thousands) of concurrent users, especially during D-day
- Data leaks and sanitation

## 3. Persona Pengguna (Siapa yang menggunakan?)
- **Pengunjung Umum:** ingin lihat info acara, jadwal, lokasi, booth, dan bisa scan QR saat datang.
- **Peserta Lomba:** Butuh akses ke pengalaman interaktif seperti booth, gamification, dan reward tracking.
- **[ ] Admin Internal (Panitia):** Butuh dashboard data, rekap jumlah pengunjung, dan monitoring partisipasi.
- **[ ] Exhibitor/booth owner:** butuh tampil di list booth, punya QR booth, dan tahu jumlah kunjungan.
- **[ ] Peserta seminar / audience event khusus:** butuh info sesi, deskripsi acara, dan link RSVP.
- **[ ] Tim Inspirates / sekolah sasaran:** butuh info kegiatan, dokumentasi, dan rekap partisipasi per sekolah.
- **[ ] Peserta Inspirates (Siswa SMP/SMA):** ngisi feedback, lihat info Insight, potential future visitor
- **Pihak Perusahaan (Sponsor):** Mengunjungi website untuk memvalidasi kredibilitas ITB Insight sebelum memberikan dukungan.

## 4. Persyaratan Fungsional (Fitur yang Diminta)
Menggunakan metode MoSCoW (*Must-have, Should-have, Could-have, Won't-have*) untuk menentukan prioritas. ID Fitur memberikan hint divisi yang request.

*Looking at the items across the five divisions (MK, CP/CPT, EV, CB, SPON), here's the unified list — duplicate asks from different divisions are merged into one row with both IDs, everything else stays as-is.*

| ID | Category | Unified Requirement | Priority |
| :--- | :--- | :--- | :--- |
| **MK-01** | Auth/ Registration | Sign-up & login (optionally via Google) to fill profile data, then a single pre-registration button at the end of the form (or as a separate step after login, per the alternative flow) | Must |
| **MK-02/ EV-01** | Check-in | Automated QR check-in: a unique QR auto-generated per registrant and emailed to them; scanning at the gate validates in real time and shows name + registration status, replacing long forms and preventing double-counting | Must |
| **EV-02** | Check-in/Booth | Separate QR per booth so each visit is logged individually | Must |
| **EV-08** | Check-in/Booth | Booth-QR scanning only activates once the visitor has checked in at the gate | Should |
| **MK-04** | Landing Page | Landing page shows headline numbers — visitors, exhibitors, collaborators | Must |
| **MK-05/ CPT-04** | UI Component | Reusable countdown component: D-Day countdown on landing page, and a competition-registration countdown paired with fee, total prize pool, and timeline on competition pages | Should |
| **MK-06** | Landing Page | List of ITB Insight's social media accounts with links | Should |
| **MK-08/ EV-07** | RSVP | In-website RSVP for invited guests, including a dedicated Alumni Gathering page (info + rundown) with RSVP submission | Must |
| **CP-01** | Competition | Auto-group participants by the competition they registered for | Must |
| **CPT-02**| Competition | Confirmation email as proof of completed registration | Should |
| **CPT-03**| Competition | Description page per competition, including requirements | Must |
| **CPT-05**| Competition | Guidebook/syllabus link shown once a competition logo is clicked | Must |
| **CPT-06**| Competition | Layout: Registration section after description/guidebook/timeline; "Contact Us" below Registration | Should |
| **CPT-07**| Competition | Timeline + total prize pool repeated in each competition's own section | Must |
| **CPT-08**| Competition | FAQ section: how to register, event timing | Should |
| **CPT-09**| Competition | Competition info / finalist announcement section | *(unspecified)* |
| **CPT-10**| Competition | Robot competition registration includes a file-upload for the robot sketch | Must |
| **EV-03** | Dashboard | Central database & committee dashboard: visitor data, booth scans, participation recap, plus manual search for gate staff when QR fails | Must |
| **EV-04** | Event Info | Info pages for each main program: exhibition, play-tech, show-tech, tech seminar, Insight on Stage, Alumni Gathering, Inspirates | Must |
| **EV-05** | Registration | Button/section linking to external GForm for registrations better suited to stay external | Must |
| **EV-07** | Event Info | Inspirates info & overview page | Must |
| **EV-11** | Event Info | Session page per seminar/stage event: rundown, description, speaker, schedule, bookmark/reminder | Should |
| **EV-09** | Booth/Map | Filter booths by category (AI, energy, robotics, interactive games, etc.) | Should |
| **EV-10/ SPON-01 / CB-3** | Booth/Map | One interactive campus map layering all points of interest: filterable booths/zones, sponsor hotspots (click → profile card + "Visit Site"), and photo-spot/megaprop pins | Must |
| **EV-20** | Booth/Map | AI-based booth recommendations | Could |
| **EV-14** | Volunteer | Volunteer info page: open roles, descriptions, application link | Should |
| **EV-16** | Gamification | Points based on number of booths visited | Could |
| **EV-17** | Gamification | Reward/merch claim at a point threshold | Could |
| **EV-18** | Gamification | Leaderboard / booth-visit progress tracker | Could |
| **EV-06** | Inspirates | Committee panel to input per-school/activity Inspirates counts, feeding the dashboard recap | Must |
| **EV-15** | Inspirates | Per-school activity summary, including outreach members | Should |
| **EV-19** | Inspirates | Replayable digital content — infographics, teasers, educational material | Could |
| **EV-12** | Analytics | Internal analytics: total visitors, busiest booth, gate-to-booth conversion | Should |
| **EV-21** | Analytics | Real-time visitor heatmap | Could |
| **SPON-04**| Analytics | Click-tracking stats on sponsor logos | Could |
| **EV-22** | Social | One-click social sharing from within the site | Could |
| **CB-01** | Media | Documentation gallery / aftermovie from past ITB Insight events | Must |
| **CB-2** | Easter Egg | Hidden easter egg triggered by a unique action | Could |
| **MK-03/ EV-13** | Feedback | In-website feedback (via site or QR): required page for overall event feedback, optional per-booth feedback page, and for specific programs (e.g. Inspirates) either an embedded star+comment rating or a redirect to an external form | Must (core) / Should (program) |
| **EV-23** | Feedback | Lightweight dashboard visualizing feedback (avg rating, response count) | Could |
| **MK-09/ SPON-03** | Partnership Intake | Inquiry form for external parties reaching out on their own initiative (media, sponsors, etc.) — institution, position, industry, scale of cooperation — routed to the relevant division's database/email | Must |
| **MK-07/ SPON-02** | Partnership Display | Tiered partner/media-partner logo wall — sponsors grouped by tier (Diamond/Gold/Silver/Bronze), comparable section for major media partners, responsive with consistent visual treatment (soft shadow / grayscale-to-color) | Must |

## 5. Alur Pengguna (User Journey)
Langkah-langkah yang dilalui pengguna dari awal hingga akhir.
1. Pengguna masuk ke halaman "Pendaftaran Lomba".
2. Pengguna mengisi formulir yang terdiri dari 5 kolom input.
3. Sistem memvalidasi ukuran file (Maksimal 5MB, format PDF).
4. Pengguna menekan tombol "Submit" dan muncul **animasi physics-based** sebagai indikator loading.
5. Halaman menampilkan pesan sukses dan nomor registrasi.

## 6. Kebutuhan Desain & Konten
- **Gaya Visual:** (Contoh: "Harus konsisten dengan tema dark-mode dan elemen futuristik ITB Insight.")
- **Copywriting/Teks:** [Sertakan link Google Doc jika teks sudah final].
- **Aset Media:** [Sertakan link Drive untuk logo, gambar, atau video yang perlu dipasang].

## 7. Data & Analitik (Indikator Keberhasilan)
- **Data yang Dikumpulkan:** (Contoh: Nama, Email, Instansi, No. HP).
- **Metrik Keberhasilan:** Apa yang ingin diukur? (Contoh: Jumlah pendaftar harian, tingkat klik pada banner sponsor).

## 8. Batasan Teknis & Asumsi
- **Catatan untuk Tim WebDev:** Apakah butuh integrasi API pihak ketiga? *(Contoh: Midtrans untuk pembayaran, Google Maps API, atau Supabase untuk database).*

---

# Arahan Untuk Tim 3D Design
**Requester:** Fathir (Manager of WebDev Team)
*! Yg Drone pause dulu ! Utamakan model ITB:*

**Secara Ringkas:**
Low-poly. Berwarna (karena GDV belum final, bebasin dulu warnanya). Merupakan 3D (or semi-3D sesuai dengan shot yang diperlukan) dari ITB.
Ketika scroll page (mulai dari view countdown), kamera akan bergerak dari view gedung kembar dari Plawid hingga kolam InTel. Pada implementasinya, untuk mengurangi *load* website, merupakan GIF dari map ITB tersebut.

Sangat disarankan buat ambil inspirasi rekam POV jalannya ke ITB, tapi kalo udah terlanjur balik, pake GMaps aja.
📍 Monumen Kubus (InHarmoniaProgressio Monument)

**Catatan Visual (Referensi Gambar):**
- *Baru masuk gitu maksudnya (Gerbang depan).*
- *Standar lah ya (Gedung kembar/Plawid).*
- *Kek gini, trs di tembok atasnya itu (yg jendela-jendela) ada laser show “ITB Insight” seperti foto di bawah, jadi posisi ‘kamera’nya agak di atas. That laser show lamp photo thing from 2017. Art immitates life.*
- *Karena “se-Indonesia” gitu maksudnya wkw, dan yea POVnya looking at this way (buat yg frontend dev).*
- *Paling bakal ada scene “sisaan”, itu mungkin bisa dijadiin jadi BG page lain. Sangat dibebaskan kalo ada ngide tambahan/perlu penyesuaian kembali. Kasih tau Fathir aja ya! Goodluck 3D Team <3*

**Motion Example:**
- https://themonolithproject.net/ ← Best example
- https://www.jreyes-mc-portfolio.com/

**Timeline:**
- August 14th all models and GIFs ready

---

# [Strategic Request] Visi Digital & Narasi Utama Website ITB Insight (Ring 0 & 1)
**Status:** High-Level Visioning
**Pemohon:** Ring 0 / Ring 1 (Leadership)
**Tujuan:** Menyelaraskan Code dengan Value ITB Insight

## 1. Narasi Besar (The Grand Narrative)
*Website adalah wajah pertama ITB Insight di mata publik. Nilai filosofis apa yang harus langsung terasa saat user mendarat di landing page?*

- **Core Message:** ‘Beyond Frontiers: Technology for a Sustainable and Human-Centered Future”. Teknologi untuk masa depan yang berkelanjutan dan berpusat pada manusia. ITB Insight sebagai ruang kolaborasi lintas disiplin dan tempat di mana masyarakat dapat bukan hanya mengenal teknologi tapi menjadi subjek yang berdaya melalui sains dan inovasi
- **Tone of Voice:**
  - Futuristic, ‘canggih’, tapi mudah dipahami oleh siswa SMA hingga profesional industri → berikan elemen-elemen visual dan konten yang mencerminkan keilmuan teknik fisika atau fisika in general
  - Inclusive (accessible to everyone, jangan buat terlalu kompleks.)
  - Energetic, jangan ‘korporat’.
- **Fitur yang harus ada di Website:**
  - Landing page / homepage
  - Tentang / About (Visi misi ITB Insight, penjelasan HMFT-ITB dan teknik fisika sebagai penyelenggara, sambutan dari kaprodi, etc)
  - Program acara (penjelasan seluruh rangkaian kegiatan) dari pre-event, lomba, main event
  - Registrasi lomba & dashboard peserta
  - Peta acara interaktif (Alur mobilisasi, tempat parkir, area wahana, dll)
  - Pendaftaran (RSVP) ke acara
  - Sponsor & Partner → penempatan logo partner sesuai tier sponsorship, halaman khusus sponsor dengan deskripsi kontribusi, spotlight khusus untuk sponsor besar
  - FAQ & Contact

## 2. Representasi Nilai ITB Insight
*Bagaimana nilai-nilai utama acara diterjemahkan ke dalam fitur website?*

| Nilai (Value) | Implementasi Digital yang Diharapkan |
| :--- | :--- |
| **Interdisciplinary Technology** | Visualisasi narasi teknologi yang menunjukkan kolaborasi lintas bidang (AI, sains, rekayasa, seni). <br><br> *Nice to have:* landing page menceritakan ‘perjalanan’ inovasi dari ide hingga dampak nyata melalui elemen naratif. E.g., saat user scroll, pertama akan muncul visualisasi sederhana neural network node yang ‘menyala’ satu per satu, kemudian scroll lagi dan transisi ke showcase visual produk teknologi misalkan siluet drone lagi terbang, robot SAR bergerak, dll |
| **Human-centered innovation** | UX yang ramah pengguna, accessible, dan fokus pada pengalaman pengunjung. Participant journey yang jelas: Attraction → Exploration → Interaction → Insight → Action. Fitur registrasi yang meminimalisir human error. |
| **Future Sustainability** | Visual mengangkat tema keberlanjutan lingkungan dan teknologi hijau |
| **Inovasi Terdepan** | Kalo bisa, menggunakan animasi physics-based yang akurat untuk ciri khas Teknik Fisika / ITB [E.g., simulasi partikel interaktif, mekanika fluida, etc] |

## 3. High-Level "Wow Factor"
*Apa satu hal yang akan dibicarakan orang setelah menutup website kita?*
- **Target Impresi:** "Website-nya beneran all out. peta acaranya interaktif, animasinya kayak beneran physics simulation. bukan cuman website ‘formalitas’ biasa"
- **Ekspektasi Animasi:**
  - Peta acara interaktif: (Peta kampus yang menunjukkan lokasi setiap program) dengan navigasi intuitif
  - Countdown dinamis menuju hari-H yang terintegrasi dengan elemen visual utama
  - Transisi scroll-based yang menunjukkan suatu narasi (sesuai dengan implementasi digital yang diharapkan yang tertulis pada nilai Interdisciplinary Technology di tabel atas)

## 4. Keamanan & Integritas Data (Leadership's Priority)
*Pimpinan paling anti dengan berita "Data Peserta ITB Insight Bocor".*
- **Standar Keamanan:**
  - Enkripsi data peserta
  - Autentikasi aman untuk akun peserta (hashing password, rate limiting login)
  - Data pribadi peserta (email, nomor HP, other confidential factors) hanya diakses oleh panitia yang berwenang
  - Audit log untuk data sensitif
  - Role-based access control: admin panitia, peserta, dan pengunjung umum
- **Reliability:**
  - Rencana scaling untuk mengantisipasi spike trafik saat pembukaan registrasi, hari-H festival, dll
  - Monitoring uptime dan alert otomatis jika server down
  - Backup database berkala (minimum daily)
  - Target: 99.9% uptime selama periode registrasi lomba dan H-7 sampe H+1 acara

## 5. Dampak Strategis (Strategic Impact)
*Apa indikator keberhasilan di mata pimpinan?*

| Dimensi | Target | Cara Ukur |
| :--- | :--- | :--- |
| **Branding** | Website menjadi referensi standar kualitas acara ITB Insight yang technology-centered dan terasa ‘keren’ (WOW-factor) yang bisa viral | Orang terasa cukup terkesan dengan website hingga dapat membaginya di sosial media (jumlah shares/embed link di X, ig, whatsapp, etc) |
| **Engagement**| Rata-rata Time on Page > 3 menit; Bounce rate < 40% | Analytics |
| **Conversion**| Minimalisasi human error registrasi lomba. >90% peserta berhasil registrasi tanpa bantuan manual | Tracking error rate form submission, tiket support terkait registrasi |
| **Reach** | Website masuk top 3 hasil pencarian Google untuk keyword relevan seperti “festival teknologi mahasiswa 2026” atau “lomba robot nasional 2026” | Google search console, impressions, ctr, average position, etc |
| **Performance**| Loading time < 3 detik pada 3G; lighthouse score > 80 | Google Lighthouse audit berkala |

## 6. Pesan Khusus Pimpinan (Directives)
*Adakah arahan khusus mengenai sponsor besar, tokoh penting, atau institusi yang harus mendapatkan "spotlight" khusus di website?*
- Terkait partnership utk sponsor coba confirm lagi ke Pasha/Bidang Fundraising apakah akan ada kebutuhan khusus dari mereka

---

# Product Requirements Document | Marketing
**Status:** Draft
**Bidang Pemohon:** Marketing
**Penanggung Jawab (PIC):** Toge / subiitoge
**Tanggal:** 15 Maret 2026

## 1. Ringkasan Eksekutif
Marketing membutuhkan beberapa fitur yang terintegrasi dalam website, di antara lain seperti display jumlah exhibitor (industri, HMPS, laboratorium/dosen, project mahasiswa, dll) yang tertera di landing/homepage sebagai selling point yang memperlihatkan seberapa “legit” ITB Insight dan attracting pengunjung. Selain itu, bidang marketing membutuhkan counter pengunjung yang juga di-display di landing/homepage sebagai pembangkit rasa FOMO dan achievement ITB Insight sendiri yang berhasil menggaet banyak peserta/pengunjung. 
Selanjutnya bidang marketing membutuhkan data **estimasi kehadiran** dengan mengisi forms pre-regis yang sekaligus mendaftarkan data mereka agar mempermudah kebutuhan user di kemudian hari. Lalu ada kebutuhan untuk menyertakan **sistem presensi yang tinggal scan QR** (tanpa mengisi forms karna data pengunjung sudah diisi oleh peserta saat pre-regis atau saat daftar/login di website). Hal yang sama dibutuhkan untuk feedback, tinggal scan QR dan isi feedback atau rating tanpa mengisi biodata. Selain itu marketing butuh menunjukkan dan link ke seluruh sosial media ITB Insight, dan list jajaran media partner yang bekerjasama dengan ITB Insight.

**Tl;dr:** marketing mau **mempermudah user experience** agar mereka mau melakukan apa yang kami mau (mengisi pre-regis, presensi dan feedback) dengan cara interaktif, sekaligus ngedisplay angka buat alat marketing. Presensi kaya MySIX kurleb, dan feedback biar jadi kaya side-quest di website OSKM gt.

## 2. Pernyataan Masalah & Tujuan
1. Pengunjung seringkali malas mengisi forms kehadiran dan forms feedback, atau terkadang membutuhkan waktu yang lama sehingga menghambat mobilisasi sementara bidang marketing membutuhkan data itu untuk me-market-kan kesuksesan ITB Insight, evaluasi, dan memenuhi OKR bidang. Tujuan akhirnya adalah memberi akses mudah baik untuk peserta/pengunjung dan juga untuk panitia.
2. Agar memotong down-time pengguna dalam menggunakan fitur lain seperti tandai hadir, feedback, atau mengakses fitur user lainnya, pengguna dapat mengisi forms pre-regis sekaligus biodata dalam website sebelum hari-H.
3. Tidak adanya angka yang menunjukkan kehadiran peserta/pengunjung, exhibitor, sponsor, dll menurunkan image trustability suatu event atau organisasi. Maka dari itu sebuah display yang menunjukkan angka akan meningkatkan trust dari pihak luar, memoles image ITB Insight, dan menjadi selling point yang besar sebagai tujuan akhir.

## 3. Persona Pengguna (Siapa yang menggunakan?)
- **[ ] Pengunjung Umum:** (1) Menandai kehadiran dan mengisi forms feedback, (2) Melihat jumlah exhibitor dan jumlah pengunjung yang hadir, (3) Mendapat kemudahan saat hari-H karena sudah mengisi forms regis dan mendaftarkan biodata
- **[ ] Admin Internal (Panitia):** (1) Melihat angka kehadiran dan data dari feedback, (2) Menggunakan fitur yang menunjukkan angka jumlah exhibitor dan jumlah pengunjung sebagai alat marketing

## 4. Persyaratan Fungsional (Fitur yang Diminta)
| ID Fitur | Deskripsi Kebutuhan | Prioritas |
| :--- | :--- | :--- |
| **CPP-01** | User mengisi biodata dengan sign-up dan login ke website (**could have:** bisa login pake google account biar user-friendly dan easy buat mereka), lalu user tinggal pencet tombol pre-regis at the end of the form. <br> **Alternative:** user login dan tombol pre-regis terpisah dari form sign-up | Must have |
| **CPP-02** | Sistem presensi dengan **scan QR** atau tandai hadir tanpa harus mengisi forms yang panjang. Contoh: MySIX, but better | Must have |
| **CPP-03** | User dapat mengisi feedback **in-website** dengan mudah tanpa mengisi forms yang panjang, sistem hanya berisi (1) sebuah laman untuk memberi feedback ITB Insight secara keseluruhan (**MUST have**), dan (2) sebuah laman untuk memberi feedback untuk tiap booth yang dikunjungi (**Could Have**). Forms feedback ini dapat diakses user melalui laman di website atau melalui directory QR | Must have and Could have |
| **CPP-04** | Laman utama (tidak harus paling atas) menunjukkan angka angka pengunjung, exhibitor, dan kolaborator. *(Contoh referensi: web CES Tech)* | Must have |
| **CPP-05** | Countdown D-Day di landing page. *(Contoh referensi: web Teknofest)* | Could have |
| **CPP-06** | List sosial media ITB Insight berupa logo sosmed tersebut dan link ke SNS Page yang berkaitan. | Should have |
| **SP-01** | List media partner yang bekerjasama dengan ITB Insight, mirip seperti list jajaran sponsor namun untuk media partner yang besar | Should have |
| **SP-02** | Laman pengisian RSVP undangan untuk pihak pihak yang sudah diberikan undangan (in-website) | Must Have |
| **SP-03** | Laman pendaftaran partnership untuk media partner atau pihak eksternal yang ingin kolaborasi (atas inisiatif mereka, dan belum SP ITB Insight reach) | Could Have |

## 5. Alur Pengguna (User Journey)
**CPP-01**
1. Pengguna masuk ke laman utama website.
2. Pengguna menekan tombol login/sign-up dan mengisi biodata diri (atau kalau bisa sign-up with google account).
3. Pengguna mengkonfirmasi minat hadir dengan menekan tombol pre-regis ITB Insight.
4. Ketika selesai, halaman menunjukkan pesan sukses dan tulisan “Kami tunggu di ITB Insight!”.

**CPP-02**
1. Pengguna scan QR yang ada di venue saat hari-H.
2. QR directs the user to a page that enables them to tandai hadir.
3. Pengguna menekan tombol tandai hadir, dan halaman menunjukkan pesan yang mengkonfirmasi kehadiran pengguna, “Terima kasih! Bla bla bla…” dan direct pengguna ke fitur berikutnya (feedback).

**CPP-03**
*A. Feedback untuk keseluruhan ITB Insight:*
1. Setelah pengguna menandai kehadiran, pop-up tombol untuk mengisi feedback muncul dan pengguna ditawarkan untuk mengisi feedback.
2. Jika pengguna sudah mengkonfirmasi kehadiran sebelumnya dan meng-scan QR lagi maka akan langsung diarahkan untuk mengisi form feedback.
3. Pengguna mengisi form feedback [isi forms akan dikabarkan oleh bidang marketing di kemudian hari]. Note: forms hanya berisi feedback, tidak lagi mengisi biodata dll.
4. Pengguna menekan tombol submit, kemudian halaman menunjukkan konfirmasi pengisian dan ucapan terima kasih.

*B. Feedback untuk tiap booth yang dikunjungi:*
1. Pengguna mengunjungi booth yang dibuka pada hari-H.
2. Pengguna meng-scan QR yang berada di booth tersebut setelah diarahkan oleh penjaga booth.
3. QR redirect pengguna ke forms feedback untuk booth yang di-scan QR-nya.
4. Pengguna mengisi feedback untuk booth tersebut.
5. Pengguna menekan tombol submit, kemudian halaman menunjukkan konfirmasi pengisian dan ucapan terima kasih.

**CPP-04**
1. Website dibuka.
2. Halaman utama menunjukkan angka 1) pengunjung, 2) exhibitor, 3) kolaborator dalam satu kotak. Angka ditunjukkan dengan besar, dan keterangan fontnya lebih kecil.
*Note: Placement CPP-04 diserahkan kembali ke divisi website, namun bidang marketing menyarankan 2 opsi, antara paling atas halaman agar menjadi salah satu yang paling pertama dilihat oleh pengguna, atau pengguna harus scroll ke bawah dahulu baru dapat melihat dan diletakkan tepat sebelum jejeran sponsor yang umumnya ditaruh paling bawah halaman utama.*

**CPP-05**
1. Website dibuka.
2. Halaman utama menunjukkan countdown ITB Insight dalam hitungan hari (display paling besar), jam, menit, dan detik (display yang lebih kecil).
3. Pada H-7 hingga H-1 ada animasi/font/warna khusus yang menunjukkan kedekatan hari. Pada H-0 ada animasi/font/warna khusus selebratif yang menunjukkan festivity.

**CPP-06**
1. Website dibuka
2. Halaman utama menunjukkan jajaran sosial media yang dimiliki oleh ITB Insight.
3. Pengguna menekan logo sosial media yang dimiliki ITB Insight pada website.
4. Pengguna diarahkan ke laman sosial media yang ditekan.

**SP-01**
1. Website dibuka
2. Pengguna scroll ke bawah halaman utama.
3. Pengguna melihat jajaran logo media partner ternama/besar yang bekerjasama dengan ITB Insight.

**SP-02**
1. Pihak SP ngirim link khusus ke WA atau email ke stakeholder, alumni, perwakilan kampus atau sekolah lain barengan sama file surat undangan resmi.
2. Tamu undangan membuka link tsb, dan redirect ke halaman web eksklusif yang langsung ngasih ucapan selamat datang.
3. Tamu mengisi form konfirmasi yang isinya cuma nama, jabatan, asal institusi, email, terus ada pilihan status kehadiran (hadir, ngga bisa hadir, atau diwakilkan).
4. kalau mereka memilih opsi ‘diwakilkan’, sistem otomatis nampilin kolom tambahan buat ngisi nama orang yang bakal ngegantiin kehadiran mereka.
5. Tamu klik tombol submit buat ngirim data.
6. Muncul pesan sukses di layar yang ngucapin terima kasih sudah konfirmasi RSVP dan ditunggu kehadirannya di ITB Insight 2026.
7. Kalau memungkinkan sistem web bakal otomatis ngirimin email balasan ke tamu tersebut yang isinya e-ticket berupa QR Code plus info lokasi acara. nanti pas hari H tamu ini tinggal scan QR Code itu di meja registrasi khusus biar sat-set langsung dibantu sama LO.

**SP-03**
1. Website dibuka dan terdapat opsi pendaftaran partnership untuk media eksternal yang ingin kolaborasi di drop-down menu lama utama.
2. Pengguna membuka laman forms in-website untuk mengisi data organisasi, contact person, dan general gist kolaborasi atau liputan yang mereka ajukan.
3. Pengguna yang dapat mengisi hanya pengguna dengan akun email khusus perusahaan yang sudah dikonfirmasi (melalui email).
4. Pengguna submit forms dan muncul notifikasi konfirmasi pengiriman dan ucapan terima kasih.
5. Admin internal/panitia menerima hasil pendaftaran berupa list/sheets dari pengisian pihak eksternal.

## 6. Kebutuhan Desain & Konten
- **Gaya Visual:** Menyesuaikan tema besar dalam website dan GDV Creative Branding.
- **Copywriting/Teks:** [Link Google Docs akan disertakan jika teks sudah final].

## 7. Data & Analitik (Indikator Keberhasilan)
- **Data yang Dikumpulkan:**
  1. CPP-01: Nama, Email, Instansi, No. HP, minat kehadiran via pre-regis.
  2. CPP-02: Konfirmasi kehadiran yang terikat dengan akun user (headcount).
  3. CPP-03: Feedback keseluruhan ITB Insight, feedback booth.
  4. SP-02: Konfirmasi kehadiran RSVP dari sent invitations.
  5. SP-03: Media/instansi, Email, Contact Person, deskripsi pengajuan kolaborasi (long-text box).
- **Metrik Keberhasilan:**
  1. CPP-01: Jumlah pendaftar pre-regis
  2. CPP-02: Jumlah kehadiran Hari-H
  3. CPP-03: nilai feedback ITB Insight, nilai feedback booth, traffic number tiap booth, nilai rating likeability booth (ranked).
  4. SP-02: Jumlah kehadiran yang terkonfirmasi via undangan.
  5. SP-03: Data partnership request.

## 8. Batasan Teknis & Asumsi
- **Catatan untuk Tim WebDev:** Apakah butuh integrasi API pihak ketiga? Google-account integrated buat daftar akun, QR Reader embedded inside too.

**Extra Notes (WebDev Team):**
Perlu menggunakan Web Analytics platform (check postHog) untuk menampilkan total web visits sebagai leverage sponsor juga.

---

# Product Requirements Document | Competition
**Status:** Draft
**Bidang Pemohon:** Competition
**Penanggung Jawab (PIC):** Baginda & Erdi
**Tanggal:** -

## 1. Ringkasan Eksekutif
Website compe dirancang sebagai platform untuk pendaftaran dan menyebarkan info ke seluruh masyarakat. Pada halaman utama (landing page), pengunjung akan diberikan pillihan lomba yang dapat diikuti sesuai dengan jenjang masing-masing. Selain itu, ditampilkan pula total prize pool serta akses cepat menuju kompetisi yang tersedia, sehingga pengguna dapat langsung memahami skala dan daya tarik ITB Insight secara keseluruhan. Dari sisi website ini mengedepankan kemudahan dan interaktivitas melalui sistem yang terintegrasi. Pengunjung diwajibkan untuk melakukan sign in sebelum mengunjungi web yang tidak hanya berfungsi sebagai estimasi jumlah kehadiran, tetapi juga menjadi basis data utama untuk seluruh aktivitas selanjutnya. Dengan sistem ini, pengguna tidak perlu mengisi data berulang kali. Konsep ini dirancang untuk meminimalkan friction sekaligus meningkatkan kemungkinan pengguna mengikuti seluruh alur yang diharapkan oleh panitia, mulai dari registrasi hingga pemberian feedback.

Selain itu, website juga mengintegrasikan elemen interaktif dan dinamis sebagai bagian dari strategi marketing, seperti tampilan live counter pengunjung, prize pool, registration countdown, persyaratan daftar, hasil pengumuman, tata cara registrasi timeline, dan contact person. Hal ini dipadukan dengan penampilan media sosial ITB Insight serta daftar media partner untuk memperkuat social proof dan eksposur acara dibagian bawah setelah penjelasan keseluruhan mengenai pendaftaran insight.

## 2. Pernyataan Masalah & Tujuan
- Peserta lomba kesulitan melihat jadwal lomba secara real time.
- **Tujuannya:** Menyediakan dashboard pusat bagi peserta untuk memantau timeline perlombaan.
- Peserta lomba sulit mencari tahu perbedaan setiap mata lomba.
- **Tujuannya:** Menyediakan section penjelasan singkat setiap mata lomba.
- Peserta lomba sulit menghubungi contact person dalam setiap lomba.
- **Tujuannya:** Menyediakan section untuk “contact us” agar user dapat bertanya terkait mata lomba yang ingin diikutinya.

## 3. Persona Pengguna (Siapa yang menggunakan?)
- **Pengunjung Umum:** Mencari informasi dasar perlombaan dan jadwal acara.
- **Peserta Lomba:** Membutuhkan akses ke sistem pendaftaran dan unggah berkas.
- **Admin Internal (Panitia):** Membutuhkan fitur ekspor data peserta ke Excel/CSV.
- **Sponsor/Partner:** Membutuhkan visibilitas logo dan statistik klik agar terhighlight.

## 4. Persyaratan Fungsional (Fitur yang Diminta)

| ID Fitur | Deskripsi Kebutuhan | Prioritas |
| :--- | :--- | :--- |
| **MH-01** | Sistem harus bisa mengelompokkan peserta sesuai dengan mata lomba yang diikuti *(Referensi sketsa: pilihan card lomba)* | Wajib (Must) |
| **SH-02** | User mendapatkan notif email sebagai bukti telah menyelesaikan registrasi | Perlu (Should) |
| **MH-03** | Penjelasan setiap mata lomba dan persyaratannya | Wajib (Must) |
| **SH-04** | Terdapat fitur countdown untuk waktu registrasi dan registration fee pada bagian bawah waktu. Kemudian terdapat total prize pool dan timeline dibawah kedua fitur sebelumnya | Perlu (Should) |
| **MH-05** | Kolom klik guide book dan silabus ketika sudah mengklik logo lomba yang ingin diikuti | Wajib (Must) |
| **MH-06** | Kolom section Registration dibawah setelah penjelasan lomba, guidebook, timeline dll. Kemudian kolom section “contact us” dibawah registration | Perlu (Should) |
| **MH-07** | Terdapat timeline juga dan total prizepool pada setiap section mata lomba yang ingin diikuti | Harus (Must) |
| **MH-08** | Terdapat section FAQ ada how to regist, when will be held | Perlu (Should) |
| **MH-09** | Terdapat section info compe/ pengumuman finalis *(Referensi sketsa alur lolos/tidak lolos)* | |
| **MH-10** | Khusus untuk robot ada section file upload sketch robot pada bagian pendaftaran mata lomba tersebut | Harus (Must) |

## 5. Alur Pengguna (User Journey)
1. Membuka link
2. Sign in terlebih dahulu menggunakan email google
3. Memilih section competition
4. Terdapat ke 4 lomba beserta penjelasan singkat tiap lomba
5. Pengguna menekan logo lomba yang ingin diikuti
6. Terdapat beberapa kolom untuk mengisi biodata pendaftaran, tetapi jika terdeteksi belum sign in, maka user akan diarahkan ke laman sign in
7. Setelah biodata terisi biodata, dan melakukan pembayaran user menekan tombol submit
8. User akan mendapatkan email bukti verifikasi pendaftaran
9. Jika sudah waktunya pengumuman, user dapat melihat hasil/berbagai info pada laman web bagian bawah (diatas footer sponsor/partner)

## 6. Kebutuhan Desain & Konten
- **Gaya Visual:** Konsisten dengan tema dark-mode dan elemen futuristik ITB Insight
- **Aset Media:** Link google drive booklet/guide book setiap lomba, link whatsapp

## 7. Data & Analitik (Indikator Keberhasilan)
- **Data yang Dikumpulkan:** Nama team, Nama ketua, email ketua, nomor telepon ketua, asal instansi, nama anggota, foto KTM/Kartu identitas personal atau team,, bukti follow instagram ITB Insight, bukti share BC perlombaan ITB Insight, bukti transfer.
- **Metrik Keberhasilan:** Jumlah pendaftar lomba, dan jumlah kunjungan web compe setiap harinya

## 8. Batasan Teknis & Asumsi
*(File referensi visual dilampirkan terpisah dari dokumen).*
- sketch kasar web.pdf
- WEB INSIGHT COMPE.pdf (https://www.technocorner.id/en/)

---

# Product Requirements Document | Event
**Status:** Draft
**Bidang Pemohon:** Event
**Penanggung Jawab (PIC):** Alya dan Syadid
**Tanggal:** Kamis, 26 Maret 2026

## 1. Ringkasan Eksekutif
Website ITB Insight 2026 berfungsi sebagai pusat informasi terintegrasi untuk main event dan pre-event, sekaligus mendukung tracking pengunjung, pendaftaran, dan rekap data partisipasi. Untuk main event, website dipakai untuk menampilkan informasi acara, memfasilitasi akses pendaftaran via link terpusat, dan mencatat kunjungan melalui QR di gate dan booth. Untuk pre-event Inspirates, website dipakai sebagai halaman informasi dan pelengkap dokumentasi/rekap pelaksanaan diseminasi ke sekolah-sekolah agar jangkauan dan dampaknya bisa tercatat dengan rapi. Website juga berfungsi sebagai platform dokumentasi dan engagement termasuk feedback peserta (Inpsirates), open volunteer (Inspirates), dan rekap seluruh kegiatan.

## 2. Pernyataan Masalah & Tujuan
**Masalah:**
- Informasi acara ITB Insight masih tersebar di banyak channel, sehingga pengunjung sulit melihat info yang lengkap dan terpusat.
- Kegiatan main event membutuhkan sistem pencatatan pengunjung yang konsisten, terutama untuk gate check-in dan scan booth.
- Tim panitia membutuhkan dashboard data yang bisa menunjukkan total pengunjung, jumlah kunjungan booth, dan partisipasi per area.
- Untuk pre-event Inspirates, diperlukan cara sederhana untuk mendokumentasikan sebaran kegiatan dan rekap jumlah peserta/siswa yang terlibat tanpa membuat proses input terlalu ribet. Konsep Inspirates sendiri memang ditujukan sebagai diseminasi ke sekolah-sekolah dan melibatkan jaringan FKMTF lintas daerah.
- Tidak ada sistem feedback terstruktur dari peserta Inspirates.
- Informasi volunteer dan kegiatan pre-event belum terpusat.
- Dokumentasi kegiatan seluruh kegiatan belum terdigitalisasi dengan baik.

**Tujuan:**
- Menyediakan satu website pusat untuk info, registrasi, dan tracking acara ITB Insight.
- Memudahkan pengunjung mengenali agenda, lokasi, dan aktivitas yang tersedia.
- Menghasilkan data pengunjung yang bisa dipakai untuk evaluasi keberhasilan acara.
- Membantu pre-event Inspirates punya dokumentasi dan rekap partisipasi yang terukur.
- Mengumpulkan feedback peserta secara terpusat (untuk evaluasi).
- Menyediakan akses informasi volunteer secara mudah.
- Menampilkan dokumentasi kegiatan untuk meningkatkan branding & credibility.

## 3. Persona Pengguna (Siapa yang menggunakan?)
- **[ ] Pengunjung Umum:** ingin lihat info acara, jadwal, lokasi, booth, dan bisa scan QR saat datang.
- **[ ] Peserta Lomba:** butuh akses ke pengalaman interaktif seperti booth, gamification, dan reward tracking.
- **[ ] Admin Internal (Panitia):** butuh dashboard data, rekap jumlah pengunjung, dan monitoring partisipasi.
- **[ ] Exhibitor/booth owner:** butuh tampil di list booth, punya QR booth, dan tahu jumlah kunjungan.
- **[ ] Peserta seminar / audience event khusus:** butuh info sesi, deskripsi acara, dan link RSVP.
- **[ ] Tim Inspirates / sekolah sasaran:** butuh info kegiatan, dokumentasi, dan rekap partisipasi per sekolah.
- **[ ] Peserta Inspirates (Siswa SMP/SMA):** ngisi feedback, lihat info Insight, potential future visitor.

## 4. Persyaratan Fungsional (Fitur yang Diminta)

| ID Fitur | Deskripsi Kebutuhan | Prioritas |
| :--- | :--- | :--- |
| **EV-01** | **Gate Registration & Automated Validation System**<br>Sistem wajib mengintegrasikan data GForm pendaftaran ke dalam **Automated QR Generator** yang dikirimkan ke email peserta. Saat pemindaian di *gate*, sistem harus memvalidasi QR tersebut secara *real-time* dan menampilkan detail data pengunjung (Nama, dan Status Registration) untuk menghindari *double count* dan mempermudah kerja staf lapangan. | MUST |
| **EV-02** | **QR Booth Tracking System**<br>Setiap booth/wahana punya QR berbeda agar kunjungan bisa tercatat per titik. | MUST |
| **EV-03** | **Central Database & Dashboard**<br>Menyimpan data pengunjung, scan booth, dan rekap partisipasi yang bisa dilihat panitia (termasuk fitur *manual search* untuk membantu staf HR di *gate* jika QR bermasalah). | MUST |
| **EV-04** | **Event Information Pages**<br>Halaman info untuk program utama: exhibition, play-tech, show-tech, tech seminar, insight on stage, alumni gathering, dan Inspirates. | MUST |
| **EV-05** | **External Registration Link Integration**<br>Website menyediakan tombol/section yang mengarahkan user ke GForm untuk pendaftaran yang memang lebih cocok tetap pakai form eksternal. | MUST |
| **EV-06** | **Inspirates Recap Input for Panitia**<br>Panel sederhana untuk input jumlah peserta per sekolah / per kegiatan Inspirates agar rekap pre-event bisa masuk ke dashboard. | MUST |
| **EV-07** | **Pre-Event Information Pages**<br>Alumni Gathering page (info + rundown + RSVP link)<br>Inspirates page (info kegiatan & overview) | MUST |
| **EV-08** | **Integrasi Gate ↔ Booth System**<br>Scan booth hanya aktif untuk user yang sudah check-in di gate. | SHOULD |
| **EV-09** | **Search & Filter Booth / Wahana**<br>Filter booth berdasarkan kategori, misalnya AI, energy, robotics, interactive games, dan lain-lain. | SHOULD |
| **EV-10** | **Interactive Map / Zoning Booth**<br>Denah booth atau zona acara supaya pengunjung lebih mudah eksplorasi area. | SHOULD |
| **EV-11** | **Session Page untuk Seminar / Stage Event**<br>Halaman sesi khusus yang berisi rundown, deskripsi, narasumber, jadwal, dan bookmark/ingatkan sesi. | SHOULD |
| **EV-12** | **Basic Analytics**<br>Dashboard ringkas untuk total visitor, booth paling ramai, dan conversion dari gate ke booth. | SHOULD |
| **EV-13** | **Feedback System Inspirates**<br>2 opsi: <br> - Embedded simple rating (bintang + komentar) <br> - Redirect ke GForm feedback | SHOULD |
| **EV-14** | **Volunteer Information Page**<br> - Info open volunteer <br> - Deskripsi role <br> - Link GForm | SHOULD |
| **EV-15** | **Inspirates Activity Summary**<br> - Deskripsi kegiatan per sekolah <br> - List anggota yang melakukan diseminasi | SHOULD |
| **EV-16** | **Gamification / Point System**<br>Pengunjung mendapatkan poin berdasarkan jumlah booth yang dikunjungi. | COULD |
| **EV-17** | **Reward Claim System**<br>Jika mencapai jumlah poin tertentu, user bisa claim hadiah/merchandise/goodiebag. | COULD |
| **EV-18** | **Leaderboard / Progress Tracker**<br>Menampilkan progress kunjungan booth user, misalnya 15/25 booth. | COULD |
| **EV-19** | **Highlight Digital Content untuk Inspirates**<br>Menampilkan infografis, teaser, atau materi edukasi yang bisa diputar di website dan diakses ulang setelah kegiatan. | COULD |
| **EV-20** | **AI Recommendation Booth**<br>Rekomendasi booth otomatis berbasis preferensi user. | COULD |
| **EV-21** | **Real-time Heatmap Visitor**<br>Peta panas pengunjung secara live. | COULD |
| **EV-22** | **Social Sharing Otomatis**<br>Fitur share otomatis ke media sosial dari dalam web. | COULD |
| **EV-23** | **Feedback Visualization (Dashboard ringan)**<br> - rata-rata rating <br> - jumlah feedback | COULD |

## 5. Alur Pengguna (User Journey)
**A. Visitor Main Event**
1. User masuk ke homepage ITB Insight.
2. User melihat overview acara dan memilih program yang diminati.
3. User membuka halaman booth / event.
4. User melakukan check-in di gate dengan QR.
5. User mulai scan QR di booth/wahana.
6. Data kunjungan masuk ke database.
7. User melihat progress atau poin jika fitur gamification diaktifkan.
8. User melihat tampilan leaderboard poin, pemenang akan mendapatkan hadiah berupa merchandise ITB Insight.

**B. Visitor Seminar/Stage Event**
1. User masuk ke halaman acara khusus, misalnya TechTalks atau Insight on Stage.
2. User membaca deskripsi acara, waktu, lokasi, dan narasumber.
3. User klik tombol daftar yang mengarah ke GForm.
4. Setelah daftar, user mendapat konfirmasi atau informasi lanjut melalui channel yang ditentukan.

**C. Panitia/Admin**
1. Panitia login ke dashboard internal.
2. Panitia memantau total visitor dan scan booth.
3. Panitia input rekap manual untuk pre-event Inspirates jika diperlukan.
4. Panitia mengekspor data atau melihat ringkasan performa event.

**D. Inspirates**
1. User masuk ke halaman Inspirates.
2. User melihat info kegiatan, sekolah yang terlibat, dan tujuan program.
3. Jika perlu, user klik GForm untuk RSVP/volunteer.
4. Saat kegiatan berlangsung, panitia mencatat jumlah peserta per sekolah.
5. Panitia input angka rekap ke dashboard agar total partisipasi pre-event ikut terpantau.
6. Jika ada materi/infografis, user bisa mengaksesnya kembali lewat halaman yang sama.
7. Setelah kegiatan: user isi feedback: (langsung di web ATAU via GForm).
8. Data masuk ke sistem.

**E. Alumni Gathering**
1. User buka halaman Alumni
2. User lihat: lokasi, waktu, rundown.
3. User klik RSVP → GForm

## 6. Kebutuhan Desain & Konten
- **Gaya visual:** futuristik, informatif, dan konsisten dengan identitas ITB Insight.
- **Konten utama:** overview acara, daftar program, deskripsi booth/wahana, sesi seminar, dan halaman Inspirates.
- **CTA yang jelas:** “Daftar”, “Lihat Agenda”, “Lihat Booth”, “Scan Here”, “Lihat Inspirates”.
- **Untuk Inspirates, tampilkan:** tujuan kegiatan, sekolah/daerah yang terlibat, dokumentasi singkat, highlight kontribusi ke main event.

## 7. Data & Analitik (Indikator Keberhasilan)
- **Data yang Dikumpulkan:**
  - Nama, Email / nomor kontak
  - Status check-in gate
  - Riwayat scan booth/wahana
  - Jumlah kunjungan per booth
  - Data pendaftaran dari GForm jika diintegrasikan
  - Feedback atau rating kegiatan jika dibutuhkan
  - Jumlah peserta Inspirates (per sekolah)
  - Jumlah feedback yang masuk
  - Rata-rata kepuasan (kalau pakai rating)
  - Jumlah klik volunteer
  - Jumlah RSVP alumni
- **Metrik Keberhasilan: Apa yang ingin diukur?**
  - Total pengunjung yang check-in di gate
  - Total scan booth per zona
  - Jumlah pengunjung yang menyelesaikan target booth
  - Jumlah pendaftar pada event yang menggunakan GForm
  - Jumlah sekolah / peserta yang terlibat di Inspirates
  - Jumlah input rekap yang berhasil masuk ke dashboard
  - Tingkat akses halaman event di website

## 8. Batasan Teknis & Asumsi
- Pendaftaran tertentu tetap memakai GForm agar lebih familiar dan ringan untuk webdev, sementara website jadi pusat navigasi dan tracking.
- Sistem QR booth dan gate harus saling terhubung agar data tidak dobel.
- Inspirates tidak perlu sistem registrasi kompleks kalau tim lebih nyaman memakai pencatatan manual yang kemudian direkap ke dashboard.
- Jika fitur gamification dibuat, reward claim perlu dicek agar tidak double claim.

**Extra Notes**
- Halaman utama itu ada overview mata acaranya. Contoh: petrolida.com
- Link PPT overview Acara: EVENT DEPT ITB INSIGHT 2026 (Target Finalisasi Konsep Acara).pdf
- Link Finalisasi Konsep Acara: Dokumen Konsep Acara ITB Insight 2026 (2).pdf

---

# Product Requirements Document | Creative Branding
**Status:** Draft
**Bidang Pemohon:** Creative Branding
**Penanggung Jawab (PIC):** Tya / areikio
**Tanggal:** -

## 1. Ringkasan Eksekutif
Sebagai salah satu platform branding milik ITB Insight, sebagai acara dengan tema besar yang berfokus pada teknologi, website ini diharapkan bisa memberi experience yang berkesan dan “unique” ke semua pengguna website yang terlibat, tanpa sacrifice accessibility maupun fungsi utama dari website itu sendiri.

## 2. Pernyataan Masalah & Tujuan
- **Masalah apa yang ingin diselesaikan?**
  - Adanya trade off yang ekstrim antara readability dan aksesibilitas dengan keperluan estetika (e.g., warna yang terlalu heboh, icon atau assets yang bikin visual overload dan fatigue, text terlalu full untuk satu page, etc)
  - Informasi disampaikan dengan cara yang terlalu “hambar” ataupun ribet (sistem menu yang gak intuitive) sehingga orang lost interest dan berakhir tidak membuka web sampai akhir
  - Website yang tidak punya “flair” tersendiri sehingga terlihat generik dan cenderung “sepi” secara daya tarik visualnya
- **Apa tujuan akhirnya?**
  - Menjadikan website sebagai wadah informasi krusial yang terpusat, memiliki branding visual yang selaras dengan keseluruhan ITB Insight, dengan tingkat aksesibilitas yang baik, flow experience yang intuitive, tetapi tetap memiliki dekorasi yang meaningful

## 3. Persona Pengguna (Siapa yang menggunakan?)
- **[ ] Pengunjung Umum:** Mencari informasi jadwal dan ingin merasakan atmosfer acara melalui visual/animasi interaktif.
- **[ ] Peserta Lomba:** Membutuhkan akses panduan (infografis), sistem pendaftaran, serta pengunduhan berkas rulebook yang estetik.
- **[ ] Sponsor & Partner:** Membutuhkan penempatan logo yang representatif serta akses mudah ke press kit atau aset branding resmi.

## 4. Persyaratan Fungsional (Fitur yang Diminta)

| ID Fitur | Deskripsi Kebutuhan | Prioritas |
| :--- | :--- | :--- |
| **DCC-01** | Adanya galeri dokumentasi dan/atau aftermovie dari ITB Insight sebelumnya | Must Have |
| **CB-01** | Easter egg kalau a certain unique action is done (seperti added motion, animation, color change, etc) | Could Have |
| **PD-01** | Map dengan pin point untuk tempat megaprop atau photo spot | Could Have |

## 5. Alur Pengguna (User Journey)
1. Pengguna masuk ke landing page utama dan disambut oleh countdown real-time ke main event dan key visual utama yang merepresentasikan identitas visual dan tema besar acara.
2. Pengguna dapat dengan mudah menemukan tombol “Menu Utama” dengan berbagai page seperti timeline acara, past documentations, atau informasi lomba.
3. Pengguna dapat menelusuri halaman dengan "Informasi Lomba" yang menyajikan timeline interaktif serta infografis kategori lomba agar informasi mudah dipahami secara visual.
4. Pengguna melihat timeline acara, info lomba, mengunduh Guidebook resmi yang desain layout-nya konsisten dengan Visual Guideline (GDV) yang telah ditetapkan.
5. Pengguna mengisi formulir pendaftaran dengan elemen antarmuka (tombol & input) yang responsif dan mudah dipahami (tidak ada ikon yang ambigu).
6. Pengguna menekan tombol "Submit" dan muncul animasi simple sebagai indikator loading.
7. Halaman menampilkan pesan sukses yang tetap menarik secara visual dan diberi countdown lagi seperti “See You in [insert countdown live ke main event]!”

## 6. Kebutuhan Desain & Konten
- **Warna & Tipografi:** Pastikan align dan konsisten dengan GDV yang sudah dibuat (minor tweaks are allowed if needed)
- **Micro-interactions:** Ada effect yang bisa memberi efek emphasis ke menu atau button penting (e.g., kartu lomba, tombol pendaftaran, atau galeri past documentation) seperti adanya efek glow, grow, atau sedikit pergerakan.
- **Responsivitas:** Pastikan visual secara layout tetap konsisten rapi saat dilihat di layar apapun.

## 7. Data & Analitik (Indikator Keberhasilan)
- *(Kosong dari pemohon)*

## 8. Batasan Teknis & Asumsi
- *(Kosong dari pemohon)*

---

# Product Requirements Document | Sponsorship
**Status:** Draft
**Bidang Pemohon:** Sponsorsip
**Penanggung Jawab (PIC):** Affan Haidar
**Tanggal:** -

## 1. Ringkasan Eksekutif
Website ITB Insight 2026 berperan sebagai wajah digital utama untuk membangun kredibilitas bagi mitra industri. Bidang Sponsorship membutuhkan platform yang menggabungkan sisi visual yang menarik dengan fungsi profesionalitas yang kuat untuk menarik minat calon investor.

## 2. Pernyataan Masalah & Tujuan
- **Masalah:** Calon mitra seringkali mengalami hambatan informasi terkait skala acara dan kesulitan dalam menjangkau narahubung resmi secara cepat tanpa melalui perantara pihak ketiga.
- **Tujuan:** Menciptakan kanal komunikasi terpusat yang memudahkan proses *lead generation* (pencarian sponsor baru) dan memaksimalkan ROI (*Return on Investment*) digital bagi mitra yang sudah bekerja sama melalui eksposur logo yang interaktif.

## 3. Persona Pengguna (Siapa yang menggunakan?)
- **Pihak Perusahaan (Sponsor):** Mengunjungi website untuk memvalidasi kredibilitas ITB Insight sebelum memberikan dukungan.
- **Public & Participants:** Menggunakan website untuk melihat daftar perusahaan yang hadir guna mempersiapkan diri untuk kunjungan *booth*.

## 4. Persyaratan Fungsional (Fitur yang Diminta)

| ID Fitur | Deskripsi Kebutuhan | Prioritas |
| :--- | :--- | :--- |
| **SPON-01** | **Interactive Partner Hotspots (Ref: Pasar Seni ITB):** Peta interaktif area Kampus Ganesha yang menandai titik *booth* eksklusif sponsor. Saat titik diklik, muncul kartu profil perusahaan dengan deskripsi singkat dan tombol "Visit Site". | Must-have |
| **SPON-02** | **Tiered Partnership Wall (Ref: SRE ITB):** Tampilan logo mitra yang dikelompokkan berdasarkan tingkatan (Diamond, Gold, Silver, Bronze). Logo harus responsif, jernih, dan memiliki efek visual seragam (misal: *soft shadow* atau *grayscale to color*). | Must-have |
| **SPON-03** | **Integrated Partnership Inquiry Form:** Formulir minat kerjasama yang terintegrasi langsung dengan database internal/email divisi. Field wajib: Nama Instansi, Jabatan, Bidang Industri, dan Skala Kerjasama yang diminati. | Must-have |
| **SPON-04** | **Statistik Klik Logo:** Sistem di belakang layar untuk memantau jumlah interaksi pengunjung pada logo sponsor sebagai bahan laporan kontraprestasi | Could-have |

## 5. Alur Pengguna (User Journey)
1. **Tahap Eksplorasi:** Calon mitra mengakses Landing Page → Navigasi ke menu "Partnership"
2. **Tahap Pertimbangan:** Calon mitra membaca profil program (Play-Tech/Show-Tech) → Melihat potensi lokasi *booth* melalui Peta Interaktif.

## 6. Kebutuhan Desain & Konten
- **Visual:** Menggunakan elemen desain yang modern namun tetap bersih dan profesional.
- **Aset:** Logo mitra industri dalam format resolusi tinggi untuk menjaga kualitas visual di berbagai ukuran layar.
- **Dokumentasi:** Penempatan *high-quality photos* dari kesuksesan ITB Insight 2019 sebagai bukti nyata skala pengunjung.

## 7. Data & Analitik (Indikator Keberhasilan)
- **Conversion Rate:** Jumlah perusahaan yang mengisi formulir minat melalui website.
- **Interaction Rate:** Total klik pada logo-logo sponsor di *Partnership Wall*.

## 8. Batasan Teknis & Asumsi
- Website bisa nyaman dibuka melalui perangkat *mobile* karena akan sering diakses saat di lokasi acara.
- Tim Sponsorship mengasumsikan data logo mitra bisa diperbarui secara berkala seiring masuknya kerja sama baru.

---

*(Catatan: Halaman 19-21 pada dokumen PDF asli memuat form kosong yang berjudul "TEMPLATE PRD". Template tersebut tidak dicantumkan kembali di sini karena sudah diisi secara lengkap di bagian masing-masing divisi).*