const express = require('express');
const cors = require('cors');
const db = require('./db'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer'); 
const path = require('path'); 
const sharp = require('sharp'); 
const fs = require('fs');       

const app = express();
const PORT = 3000;
const JWT_SECRET = 'szuper_titkos_vizsgaremek_kulcs_2024';


app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'));

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });


app.get('/api/ideas', async (req, res) => {
    try {
        
        const sql = `
            SELECT ideas.*, users.username, users.avatar_url, categories.name as category_name 
            FROM ideas 
            JOIN users ON ideas.user_id = users.id 
            JOIN categories ON ideas.category_id = categories.id
            ORDER BY ideas.created_at DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows); 
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
// 3. AUTH: REGISZTRÁCIÓ (Optimalizált képpel!)
// ==========================
app.post('/api/auth/register', upload.single('profileImage'), async (req, res) => {
    const { username, email, password } = req.body;

    // ... (Validáció és User ellenőrzés ugyanaz, mint eddig) ...
    if (!username || !email || !password) {
         return res.status(400).json({ error: 'Minden kötelező mező kitöltése szükséges!' });
    }
    
    try {
        // ... (User létezés ellenőrzése és Jelszó hash ugyanaz) ...
        const [existing] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existing.length > 0) return res.status(400).json({ error: 'Foglalt felhasználónév vagy email!' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);


        // --- KÉP OPTIMALIZÁLÁS (ITT A VARÁZSLAT) ---
        let finalAvatar = '';

        if (req.file) {
            // Generálunk egy fájlnevet
            const filename = `user-${Date.now()}.jpeg`; 
            
            // SHARP: Átméretezés és tömörítés
            await sharp(req.file.buffer)
                .resize(500, 500, { // Max 500x500 pixel legyen
                    fit: sharp.fit.cover, // Vágja le a felesleget, ha nem négyzetes
                    position: sharp.strategy.entropy // A legérdekesebb részt tartsa meg (arc)
                })
                .toFormat('jpeg') // Mindig JPEG legyen
                .jpeg({ quality: 80 }) // 80%-os minőség (alig látható romlás, de 1/10 méret!)
                .toFile(`uploads/${filename}`); // Ide mentjük

            // A szerver útvonalát mentjük az adatbázisba
            finalAvatar = `http://localhost:3000/uploads/${filename}`;
        } else {
            // Ha nincs kép, marad a generált
            finalAvatar = `https://ui-avatars.com/api/?name=${username}&background=random&color=fff&size=128`;
        }

        const sql = 'INSERT INTO users (username, email, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?)';
        await db.query(sql, [username, email, passwordHash, 'user', finalAvatar]);

        res.status(201).json({ message: 'Sikeres regisztráció!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Szerver hiba.' });
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