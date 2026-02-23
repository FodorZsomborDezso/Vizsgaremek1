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



// BIZTONSÁGI MW: Token ellenőrzése
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // A token formátuma: "Bearer <HOSSZÚ_TOKEN_SZÖVEG>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Nincs bejelentkezve!' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Érvénytelen token!' });
        
        // Ha minden oké, elmentjük a user adatait a kérésbe, 
        // így a következő lépésben tudni fogjuk, ki ő.
        req.user = user;
        next(); // Mehet tovább a kérés
    });
}


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

// 2. VÉGPONT: Galéria képek lekérdezése (Lájk számlálóval)
app.get('/api/gallery', async (req, res) => {
    try {
        // A COUNT(likes.user_id) összeszámolja, hányan lájkolták
        const sql = `
            SELECT posts.*, users.username, users.avatar_url, categories.name as category_name,
                   COUNT(likes.user_id) AS like_count
            FROM posts
            JOIN users ON posts.user_id = users.id
            JOIN categories ON posts.category_id = categories.id
            LEFT JOIN likes ON posts.id = likes.post_id
            WHERE posts.idea_id IS NULL
            GROUP BY posts.id
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

app.post('/api/posts', authenticateToken, upload.single('image'), async (req, res) => {
    // 1. Megnézzük, mit kapott a szerver (DEBUG)
    console.log("--- FELTÖLTÉS DEBUG ---");
    console.log("Body adatok:", req.body);
    console.log("Fájl:", req.file ? "Van fájl" : "Nincs fájl");

    const { title, description, category_id, idea_id } = req.body;

    if (!title || !req.file) {
        return res.status(400).json({ error: 'Cím és Kép megadása kötelező!' });
    }

    try {
        // 2. Kép feldolgozása (Sharp)
        const filename = `post-${Date.now()}.jpeg`;
        await sharp(req.file.buffer)
            .resize(1200, 800, { fit: sharp.fit.inside, withoutEnlargement: true })
            .toFormat('jpeg')
            .jpeg({ quality: 85 })
            .toFile(`uploads/${filename}`);

        const imageUrl = `http://localhost:3000/uploads/${filename}`;

        // 3. idea_id kezelése: Ha üres vagy "null" szöveg, akkor legyen SQL NULL, különben Szám
        let finalIdeaId = null;
        if (idea_id && idea_id !== 'null' && idea_id !== '') {
            finalIdeaId = parseInt(idea_id); // Számmá alakítjuk
        }

        // 4. Mentés az adatbázisba
        const sql = `
            INSERT INTO posts (user_id, category_id, idea_id, title, description, image_url) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        // user_id a tokenből jön (req.user.id)
        // category_id alapból 1, ha nincs megadva
        await db.query(sql, [req.user.id, category_id || 1, finalIdeaId, title, description, imageUrl]);

        console.log("SIKER: Poszt elmentve az adatbázisba.");
        res.status(201).json({ message: 'Poszt sikeresen létrehozva!' });

    } catch (err) {
        // ITT ÍRJUK KI A PONTOS HIBÁT A TERMINÁLBA!
        console.error("❌ SQL HIBA:", err.message); // Ezt figyeld a terminálban!
        
        // Ha Foreign Key hiba van (nem létező ötlet ID)
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(400).json({ error: `Nincs ilyen azonosítójú ötlet (ID: ${idea_id}) az adatbázisban!` });
        }

        res.status(500).json({ error: 'Adatbázis hiba történt.' });
    }
});

// ... (Helyezd el a többi route közé)

// 6. SAJÁT POSZTOK LEKÉRDEZÉSE (Profilhoz)
app.get('/api/my-posts', authenticateToken, async (req, res) => {
    try {
        const sql = `
            SELECT * FROM posts 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        `;
        // A req.user.id a tokenből jön
        const [rows] = await db.query(sql, [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a posztok lekérdezésekor' });
    }
});

// ==========================
// 7. ÚJ ÖTLET LÉTREHOZÁSA
// ==========================
app.post('/api/ideas', authenticateToken, async (req, res) => {
    const { title, description, category_id } = req.body;

    // Validáció
    if (!title || !description || !category_id) {
        return res.status(400).json({ error: 'Minden mező kitöltése kötelező!' });
    }

    try {
        const sql = `
            INSERT INTO ideas (user_id, category_id, title, description) 
            VALUES (?, ?, ?, ?)
        `;
        // req.user.id a tokenből jön (authenticateToken middleware)
        await db.query(sql, [req.user.id, category_id, title, description]);

        res.status(201).json({ message: 'Ötlet sikeresen közzétéve!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba az ötlet mentésekor.' });
    }
});

// ==========================
// 8. FŐOLDAL: Legújabb 3 poszt (Kiemelt alkotások)
// ==========================
app.get('/api/latest-posts', async (req, res) => {
    try {
        const sql = `
            SELECT posts.*, users.username, users.avatar_url 
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            WHERE posts.idea_id IS NULL -- Csak a sima galéria képeket mutatjuk
            ORDER BY posts.created_at DESC 
            LIMIT 3
        `;
        const [rows] = await db.query(sql);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a legújabb posztok lekérésekor.' });
    }
});

// ==========================
// 9. LÁJKOLÁS: A saját lájkok lekérése
// ==========================
app.get('/api/my-likes', authenticateToken, async (req, res) => {
    try {
        // Visszaadjuk azoknak a posztoknak az ID-ját, amiket a user lájkolt
        const [rows] = await db.query('SELECT post_id FROM likes WHERE user_id = ?', [req.user.id]);
        // Csak egy sima tömböt csinálunk a számokból: [1, 4, 5]
        const likedIds = rows.map(r => r.post_id); 
        res.json(likedIds);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a lájkok lekérésekor.' });
    }
});

// ==========================
// 10. LÁJKOLÁS: Kapcsoló (Like/Unlike)
// ==========================
app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        // Megnézzük, lájkolta-e már
        const [existing] = await db.query('SELECT * FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);

        if (existing.length > 0) {
            // HA MÁR LÁJKOLTA -> Töröljük (Unlike)
            await db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
            res.json({ liked: false });
        } else {
            // HA MÉG NEM LÁJKOLTA -> Hozzáadjuk (Like)
            await db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId]);
            res.json({ liked: true });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a lájkolás során.' });
    }
});

// ==========================
// 11. KOMMENTEK LEKÉRÉSE EGY POSZTHOZ
// ==========================
app.get('/api/posts/:id/comments', async (req, res) => {
    try {
        const sql = `
            SELECT comments.*, users.username, users.avatar_url 
            FROM comments 
            JOIN users ON comments.user_id = users.id 
            WHERE comments.post_id = ? 
            ORDER BY comments.created_at ASC
        `;
        const [rows] = await db.query(sql, [req.params.id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a kommentek betöltésekor' });
    }
});

// ==========================
// 12. ÚJ KOMMENT ÍRÁSA
// ==========================
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'A komment nem lehet üres!' });
    }

    try {
        const sql = 'INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)';
        await db.query(sql, [req.user.id, req.params.id, content]);
        
        res.status(201).json({ message: 'Komment sikeresen elküldve!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a komment mentésekor.' });
    }
});

// ==========================
// 13. A LÁJKOLT POSZTOK TELJES ADATAI (A Profilhoz)
// ==========================
app.get('/api/my-liked-posts', authenticateToken, async (req, res) => {
    try {
        // Összekapcsoljuk a posztokat a lájkokkal, és leszűrjük a bejelentkezett felhasználóra
        const sql = `
            SELECT posts.*, users.username, users.avatar_url 
            FROM posts
            JOIN likes ON posts.id = likes.post_id
            JOIN users ON posts.user_id = users.id
            WHERE likes.user_id = ?
            ORDER BY likes.created_at DESC
        `;
        const [rows] = await db.query(sql, [req.user.id]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a kedvelt posztok lekérésekor.' });
    }
});

// ==========================
// 14. POSZT TÖRLÉSE (Csak a sajátját törölheti!)
// ==========================
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        // 1. Megnézzük, létezik-e a poszt, és tényleg azé-e, aki törölni akarja
        const [post] = await db.query('SELECT * FROM posts WHERE id = ? AND user_id = ?', [postId, userId]);

        if (post.length === 0) {
            return res.status(403).json({ error: 'Nincs jogosultságod a törléshez, vagy a poszt nem létezik!' });
        }

        // 2. Ha minden OK, töröljük az adatbázisból
        await db.query('DELETE FROM posts WHERE id = ?', [postId]);

        res.json({ message: 'Poszt sikeresen törölve!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a törlés során.' });
    }
});

// Szerver indítása
app.listen(PORT, () => {
    console.log(`Backend szerver fut: http://localhost:${PORT}`);
});