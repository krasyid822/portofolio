# Rasyid Kurniawan — Retro Portofolio

Portofolio retro bergaya pixel-art milik **Rasyid Kurniawan**, mahasiswa **TRPL Polmed 2023**.
Menampilkan kompetensi di empat bidang utama: **Pengembangan Sistem & Aplikasi Mobile**,
**Kecerdasan Buatan & Data Mining**, **Sistem Prediksi & Pengendalian**, serta
**Perancangan Database & Prototype** — dirancang sebagai bekal magang dan skripsi.

## Kompetensi Utama

| Area | Deskripsi |
|------|-----------|
| 📱 **Pengembangan Sistem & Aplikasi Mobile** | Flutter, PWA, Vanilla JS, Kotlin (mendatang), React Native (mendatang) |
| 🧠 **Kecerdasan Buatan & Data Mining** | Python, pandas, scikit-learn, Jupyter, machine learning, klasifikasi, prediksi |
| 📈 **Sistem Prediksi & Pengendalian** | Time-series forecasting, algoritma greedy, sistem kontrol, optimasi |
| 🗄️ **Perancangan Database & Prototype** | MySQL, PostgreSQL, Firestore, Supabase, Flutter prototype |

## Tech Stack

- **Frontend** — HTML5, CSS3, Vanilla JavaScript, Flutter Web
- **AI/ML** — Python, pandas, scikit-learn, Jupyter Notebook
- **Backend** — PHP, REST API
- **Database** — MySQL, PostgreSQL, Firestore, Supabase
- **Mobile** — Flutter, PWA
- **Design** — Figma (UI/UX wireframe & prototype)

## Arsitektur

Proyek menggunakan **Clean Architecture** dengan pola **one feature, one file**:

```
assets/
├── css/
│   ├── design-system.css    # CSS variables, reset, base styles
│   ├── layout.css           # Header, nav, hero, grid, footer
│   ├── components.css       # Cards, buttons, badges, skill bars, tech logos
│   ├── transitions.css      # Scan overlay, circular reveal, page routing
│   ├── balloon-popup.css    # Popup styles
│   └── responsive.css       # Media queries
└── js/
    ├── main.js              # Entry point
    └── modules/
        ├── scan-transition.js    # Canvas scan-line page transition
        ├── theme-transition.js   # Circular reveal theme toggle
        ├── page-router.js        # SPA page routing
        ├── magnetic-cursor.js    # Mouse attraction effect
        ├── balloon-popup.js      # Iframe popup system
        ├── theme-toggle.js       # Light/dark mode
        ├── projects-loader.js    # Fetch & render projects.json
        └── service-worker.js     # PWA registration
```

## Fitur

- 🎨 **4 Tema** — Dark, Gold, Emerald, Light — dengan circular reveal transition
- 🖱️ **Magnetic Cursor** — Elemen tertarik ke arah kursor
- 🎞️ **Scan-line Transition** — Efek diagonal untuk navigasi halaman
- 🎈 **Balloon Popup** — Buka link eksternal dalam iframe popup
- 📱 **PWA Ready** — Service Worker, manifest, offline support
- 🔍 **SEO Optimized** — Open Graph, Twitter Card, JSON-LD, canonical URL
- ♿ **Accessible** — ARIA labels, semantic HTML, keyboard navigation

## Local Development

```bash
npx serve .
```

## Domain

Production: [https://portofolio.rasyidkurniawan.my.id](https://portofolio.rasyidkurniawan.my.id)
