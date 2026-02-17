const express = require('express');
const cors = require('cors');
const db = require('./db'); // A db.js fájl, amit korábban csináltunk
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'szuper_titkos_vizsgaremek_kulcs_2024';

app.use(cors());
app.use(express.json());

// 1. VÉGPONT: Ötletek lekérdezése (Joinolva a userekkel és kategóriákkal)
app.get('/api/ideas', async (req, res) => {
    try {
        // Ez az SQL parancs összeköti az ötleteket a feltöltő nevével és a kategória nevével
        const sql = `
            SELECT ideas.*, users.username, users.avatar_url, categories.name as category_name 
            FROM ideas 
            JOIN users ON ideas.user_id = users.id 
            JOIN categories ON ideas.category_id = categories.id
            ORDER BY ideas.created_at DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows); // Visszaküldjük az adatokat JSON formátumban
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba az adatbázis lekérdezésekor' });
    }
});


// 2. VÉGPONT: Galéria képek lekérdezése
app.get('/api/gallery', async (req, res) => {
    try {
        // Lekérjük a posztokat, a felhasználó nevével együtt
        // FONTOS: Csak azokat, amik NEM válaszok ötletekre (idea_id IS NULL)
        const sql = `
            SELECT posts.*, users.username, users.avatar_url, categories.name as category_name
            FROM posts
            JOIN users ON posts.user_id = users.id
            JOIN categories ON posts.category_id = categories.id
            WHERE posts.idea_id IS NULL
            ORDER BY posts.created_at DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a galéria betöltésekor' });
    }
});

// ==========================
// 3. AUTH: REGISZTRÁCIÓ
// ==========================
app.post('/api/auth/register', async (req, res) => {
    // Kivesszük az avatar_url-t is a kérésből
    const { username, email, password, avatar_url } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Minden kötelező mező kitöltése szükséges!' });
    }

    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Ez a felhasználónév vagy email már foglalt!' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // --- ITT A LÉNYEG: ---
        // Ha van megadva kép, használjuk azt.
        // Ha NINCS (üres), akkor generálunk egyet a nevéből a ui-avatars.com segítségével.
        const finalAvatar = avatar_url && avatar_url.trim() !== '' 
            ? avatar_url 
            : `https://ui-avatars.com/api/?name=${username}&background=random&color=fff&size=128`;

        // Bővítettük az SQL-t az avatar_url mezővel
        const sql = 'INSERT INTO users (username, email, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?)';
        
        await db.query(sql, [username, email, passwordHash, 'user', finalAvatar]);

        res.status(201).json({ message: 'Sikeres regisztráció!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Szerver hiba a regisztrációnál.' });
    }
});

// ==========================
// 4. AUTH: BEJELENTKEZÉS
// ==========================
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Keressük meg a felhasználót email alapján
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(400).json({ error: 'Hibás email vagy jelszó!' });
        }

        const user = users[0];

        // 2. Jelszó ellenőrzése (Összehasonlítjuk a beírtat a hashelt verzióval)
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) {
            return res.status(400).json({ error: 'Hibás email vagy jelszó!' });
        }

        // 3. Token generálása (Ez lesz a "belépőkártyája")
        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username }, 
            JWT_SECRET, 
            { expiresIn: '2h' } // 2 óráig érvényes
        );

        // 4. Visszaküldjük a tokent és a user adatait
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar_url: user.avatar_url
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Szerver hiba a belépésnél.' });
    }
});


// Szerver indítása
app.listen(PORT, () => {
    console.log(`Backend szerver fut: http://localhost:${PORT}`);
});