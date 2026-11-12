# RED BULL — Promo Landing Page

Landing page promosi dengan kaleng Red Bull **3D real-time (WebGL / Three.js)**.

![preview](./preview.png)

## Fitur

- Kaleng 3D asli — geometri `LatheGeometry` dengan shoulder melengkung, tutup logam, dan pull tab extruded
- Material `MeshPhysicalMaterial` dengan clearcoat + environment map studio (`RoomEnvironment` + PMREM) untuk refleksi HD
- Label HD 2048px digambar secara prosedural di Canvas 2D
- Rotasi kaleng mengikuti scroll (720°) + tilt mengikuti mouse
- Kaleng kedua di section "Formula" yang berputar otonom
- Loader, progress bar, cursor glow, marquee, counter angka, energy meter
- Fallback CSS kaleng jika browser tidak mendukung WebGL
- `prefers-reduced-motion` dihormati

## Struktur

```
.
├── index.html      # markup
├── styles.css      # seluruh styling
├── app.js          # Three.js scene + interaksi UI
├── vercel.json     # config hosting statis
└── package.json    # scripts dev lokal
```

## Jalankan lokal

Module ES butuh HTTP server (bukan `file://`):

```bash
npm run dev
```
Lalu buka http://localhost:3000

Alternatif tanpa npm:

```bash
python -m http.server 3000
```

## Deploy ke Vercel

Tidak perlu build step — ini pure static site.

1. Push repo ke GitHub (lihat bawah)
2. Buka https://vercel.com/new → pilih repo
3. **Framework Preset:** `Other`
4. **Build Command:** kosongkan
5. **Output Directory:** `.` (root)
6. Deploy

Atau lewat CLI:

```bash
npx vercel --prod
```

## Catatan

Ini adalah konsep desain untuk tujuan edukasi/portofolio — bukan situs resmi Red Bull.
Red Bull® adalah merek dagang Red Bull GmbH.
