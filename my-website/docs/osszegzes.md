# Szoftverfejlesztő és tesztelő záróvizsga – Vizsgaremek

**Résztvevők:** Fodor Zsombor Dezső, Gerencsér Ákos

---

# Vizsgaremek – Interaktív galéria és közösségi platform

---

## Tartalomjegyzék

1. [Vizsgaremek célkitűzése](#vizsgaremek-célkitűzése)
2. [Feladat leírása és bemutatása](#feladat-leírása-és-bemutatása)
3. [Tervezett vállalások](#tervezett-vállalások)
4. [Közös munkafolyamatok](#közös-munkafolyamatok)
5. [Fejlesztési környezet](#fejlesztési-környezet)

---

## Vizsgaremek célkitűzése

Egy modern, webalapú **interaktív galéria és közösségi (szociális) platform** megvalósítása, amely lehetőséget biztosít a felhasználók számára digitális tartalmak (képek, illusztrációk, fotók, rövid videók) megosztására, felfedezésére, értékelésére és közösségi interakciókra.

A cél egy olyan rendszer létrehozása, amely ötvözi a vizuális galériák élményét a közösségi média funkcióival, miközben hangsúlyt fektet a felhasználói élményre, a személyre szabhatóságra és a biztonságra.

---

## Feladat leírása és bemutatása

Az alkalmazás egy nyilvánosan elérhető, ugyanakkor regisztrációhoz kötött funkciókkal rendelkező platform. A látogatók böngészhetik a feltöltött tartalmakat, míg a regisztrált és bejelentkezett felhasználók aktívan részt vehetnek a közösségi életben.

A felhasználók saját **profiloldallal** rendelkeznek, ahol bemutathatják magukat, feltölthetik alkotásaikat, valamint kezelhetik a fiókjukhoz tartozó beállításokat. A feltöltött tartalmak megjelennek egy interaktív galériában, amely lehetőséget biztosít szűrésre, keresésre és kategorizálásra.

A közösségi funkciók közé tartozik a tartalmak kedvelése, kommentelése, értékelése, valamint más felhasználók követése. A rendszer a felhasználói aktivitások alapján személyre szabott ajánlásokat jelenít meg, elősegítve az új és releváns tartalmak felfedezését.

A platform célja egy aktív, kreatív közösség kialakítása, ahol a felhasználók inspirációt meríthetnek egymás munkáiból, visszajelzéseket adhatnak, és kapcsolatokat építhetnek.

---

## Tervezett vállalások

A projekt fejlesztése **közös munkavégzésben** történik, ahol a résztvevők nem szigorúan elkülönítve frontend és backend területeken dolgoznak, hanem egymást kiegészítve, folyamatos egyeztetéssel vesznek részt a teljes rendszer kialakításában.

A feladatok megosztása rugalmas, a projekt aktuális állapotához igazodik, biztosítva, hogy minden funkció technikailag és felhasználói szempontból is megfelelően valósuljon meg.

**Közös fejlesztési feladatok:**

* A webalkalmazás teljes funkcionalitásának megtervezése és megvalósítása
* Felhasználói felület és szerveroldali logika összehangolt fejlesztése
* REST API végpontok közös tervezése és implementálása
* Felhasználói autentikáció és jogosultságkezelés kialakítása
* Interaktív galéria és közösségi funkciók megvalósítása
* Tartalomfeltöltési és -kezelési folyamatok fejlesztése
* Keresési, szűrési és ajánlórendszer kialakítása
* Adatbázis struktúra közös megtervezése és karbantartása
* Hibakezelés, validáció és biztonsági megoldások alkalmazása

---

## Közös munkafolyamatok

* **Közös tervezés és specifikáció**
  A projekt minden funkciója közös egyeztetés alapján kerül megtervezésre, beleértve a felhasználói folyamatokat és a technikai megoldásokat.

* **Párhuzamos fejlesztés**
  A frontend és backend elemek fejlesztése egymással összehangolva, folyamatos kommunikáció mellett történik.

* **Verziókezelés és együttműködés**
  A Git és GitHub használata biztosítja az átlátható munkavégzést, a kódellenőrzést és a változások követhetőségét.

* **Közös tesztelés**
  A funkciók ellenőrzése manuális és API-szintű teszteléssel, a hibák közös javításával történik.

* **Dokumentáció karbantartása**
  A projekt dokumentációja folyamatosan frissítésre kerül a fejlesztés előrehaladtával.

---

## Fejlesztési környezet

### Frontend

* HTML, CSS, JavaScript
* React
* Reszponzív design
* Interaktív UI elemek

### Backend

* Node.js
* Express.js
* REST API

### Külső szolgáltatások (opcionális)

* Felhőalapú tárhely médiatartalmakhoz
* Képoptimalizáló szolgáltatások

### Adatbázis

* **MySQL** – felhasználók, tartalmak, interakciók, értesítések tárolása

### Fejlesztői eszközök

* Visual Studio Code
* Postman / Thunder Client
* Git, GitHub

### Futtatási környezet

* Node.js
* MySQL szerver