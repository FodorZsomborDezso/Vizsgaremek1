# 👁️ ArtisticEye - Vizuális Közösségi Platform

Az **ArtisticEye** egy modern, teljes értékű közösségi képmegosztó és ötletbörze platform, amely összehozza a vizuális alkotókat és a művészetkedvelőket. A felhasználók megoszthatják saját alkotásaikat, inspirálódhatnak mások munkáiból, és valós időben tarthatják a kapcsolatot.

## ✨ Főbb Funkciók

* **Dinamikus Galéria:** Pinterest-stílusú (Masonry) elrendezés, letisztult Lightbox képnézegetővel és kategória alapú szűréssel.
* **Közösségi Ötletbörze:** Oszd meg a vizuális koncepcióidat szövegesen, és nézd meg, ahogy más alkotók életre keltik azokat!
* **Interaktív Profilok:** Testreszabható felhasználói adatlapok borítóképpel, avatárral és részletes statisztikákkal.
* **Közösségi Hálózat:** Kölcsönös követési rendszer (Ismerősök), amellyel privát hálózatot építhetsz.
* **Valós idejű Chat:** Beépített, élő üzenetküldő rendszer az ismerősök közötti kommunikációhoz.
* **Okos Értesítések:** Azonnali visszajelzés (harang ikon), ha valaki lájkolja a képedet, kommentel, vagy bekövet.
* **Profi Adminisztráció:** Dedikált admin felület a felhasználók, posztok és jelentések kezelésére.

## 🛠️ Használt Technológiák

**Frontend:**
* React.js (Vite)
* React Router DOM (Kliens oldali navigáció)
* Tiszta CSS3 (Reszponzív, modern UI, CSS változók, Animációk)
* React Icons & React Toastify

**Backend & Adatbázis:**
* Node.js & Express.js
* MySQL (Relációs adatbázis)
* JSON Web Token (JWT) alapú hitelesítés
* Bcrypt.js (Jelszó titkosítás)
* Multer & Sharp (Képfeldolgozás és optimalizálás)

## 🚀 Telepítés és Futtatás (Helyi környezetben)

### 1. Adatbázis beállítása
1. Telepíts egy lokális webszervert (pl. XAMPP).
2. Hozz létre egy új MySQL adatbázist.
3. Importáld be a projektben található SQL fájlt a táblák létrehozásához.
4. Módosítsd a `db.js` fájlban az adatbázis kapcsolati adatait.

### 2. Backend indítása
Nyiss egy terminált a backend mappában:
\`\`\`bash
npm install
node server.js
\`\`\`
*(A backend alapértelmezetten a `http://localhost:3000` porton indul el.)*

### 3. Frontend indítása
Nyiss egy új terminált a frontend mappában:
\`\`\`bash
npm install
npm run dev
\`\`\`
*(A frontend a Vite segítségével indul el, általában a `http://localhost:5173` címen.)*

---
*Készült vizsgamunkaként / Portfólió projektként - 2026*
