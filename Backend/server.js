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

// Multer beállítása: A memóriában tartja a fájlt, amíg fel nem dolgozzuk
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// ==========================
// SEGÉDFÜGGVÉNYEK
// ==========================

// Kicseréli az image_url-t a mi BLOB végpontunkra, és megvédi a böngészőt a lefagyástól
const formatPostsForFrontend = (posts) => {
    return posts.map(post => {
        const formattedPost = { ...post };
        // Ha az adatbázisban a link 'BLOB', akkor tudjuk, hogy az új végpontot kell használni
        if (formattedPost.image_url === 'BLOB') {
            formattedPost.image_url = `http://localhost:3000/api/posts/${formattedPost.id}/image`;
        }
        // NAGYON FONTOS: Töröljük a nyers bináris adatot a válaszból, különben gigantikus lesz a JSON!
        delete formattedPost.image_data; 
        return formattedPost;
    });
};

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Nincs bejelentkezve!' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Érvénytelen token!' });
        req.user = user;
        next(); 
    });
}

async function isAdmin(req, res, next) {
    try {
        const [users] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0 || users[0].role !== 'admin') {
            return res.status(403).json({ error: 'Nincs admin jogosultságod ehhez a művelethez!' });
        }
        next(); 
    } catch (err) {
        res.status(500).json({ error: 'Szerver hiba az engedélyek ellenőrzésekor.' });
    }
}

// ==========================
// VÉGPONTOK
// ==========================

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
        res.status(500).json({ error: 'Hiba az adatbázis lekérdezésekor' });
    }
});

// GALÉRIA (BLOB formázással)
app.get('/api/gallery', async (req, res) => {
    try {
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
        res.json(formatPostsForFrontend(rows)); // Átengedjük a szűrőn!
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Hiba a galéria betöltésekor' });
    }
});

// REGISZTRÁCIÓ
app.post('/api/auth/register', upload.single('profileImage'), async (req, res) => {
    // ÚJ: Beolvassuk a full_name, bio és location adatokat is!
    const { username, email, password, full_name, bio, location } = req.body;

    if (!username || !email || !password) {
         return res.status(400).json({ error: 'Minden kötelező mező kitöltése szükséges!' });
    }
    
    try {
        const [existing] = await db.query('SELECT * FROM users WHERE email = ? OR username = ?', [email, username]);
        if (existing.length > 0) return res.status(400).json({ error: 'Foglalt felhasználónév vagy email!' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        let finalAvatar = '';

        if (req.file) {
            const filename = `user-${Date.now()}.jpeg`; 
            await sharp(req.file.buffer)
                .resize(500, 500, { fit: sharp.fit.cover, position: sharp.strategy.entropy })
                .toFormat('jpeg')
                .jpeg({ quality: 80 })
                .toFile(`uploads/${filename}`); 
            finalAvatar = `http://localhost:3000/uploads/${filename}`;
        } else {
            finalAvatar = `https://ui-avatars.com/api/?name=${username}&background=random&color=fff&size=128`;
        }

        // ÚJ: Bekerült a 3 új oszlop az SQL lekérdezésbe
        const sql = 'INSERT INTO users (username, email, password_hash, role, avatar_url, full_name, bio, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await db.query(sql, [username, email, passwordHash, 'user', finalAvatar, full_name || null, bio || null, location || null]);

        res.status(201).json({ message: 'Sikeres regisztráció!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Szerver hiba.' });
    }
});

// BEJELENTKEZÉS
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ error: 'Hibás email vagy jelszó!' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) return res.status(400).json({ error: 'Hibás email vagy jelszó!' });

        const token = jwt.sign(
            { id: user.id, role: user.role, username: user.username }, 
            JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar_url: user.avatar_url } });
    } catch (err) {
        res.status(500).json({ error: 'Szerver hiba a belépésnél.' });
    }
});

// ==========================
// POSZT FELTÖLTÉSE (BLOB MÓDSZER!)
// ==========================
app.post('/api/posts', authenticateToken, upload.single('image'), async (req, res) => {
    const { title, description, category_id, idea_id } = req.body;

    if (!title || !req.file) {
        return res.status(400).json({ error: 'Cím és Kép megadása kötelező!' });
    }

    try {
        // Kép feldolgozása ÉS memóriában tartása (buffer)
        const optimizedImageBuffer = await sharp(req.file.buffer)
            .resize(1200, 800, { fit: sharp.fit.inside, withoutEnlargement: true })
            .toFormat('jpeg')
            .jpeg({ quality: 85 })
            .toBuffer();

        let finalIdeaId = null;
        if (idea_id && idea_id !== 'null' && idea_id !== '') {
            finalIdeaId = parseInt(idea_id);
        }

        // Mentés az adatbázisba: az image_url-be egy 'BLOB' címkét teszünk
        const sql = `
            INSERT INTO posts (user_id, category_id, idea_id, title, description, image_url, image_data, image_type) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(sql, [
            req.user.id, 
            category_id || 1, 
            finalIdeaId, 
            title, 
            description, 
            'BLOB', // Ez jelzi a lekérésnél, hogy ez BLOB
            optimizedImageBuffer, 
            'image/jpeg'
        ]);

        res.status(201).json({ message: 'Poszt sikeresen létrehozva (BLOB)!' });

    } catch (err) {
        console.error("SQL HIBA:", err.message); 
        if (err.code === 'ER_NO_REFERENCED_ROW_2') {
             return res.status(400).json({ error: `Nincs ilyen azonosítójú ötlet az adatbázisban!` });
        }
        res.status(500).json({ error: 'Adatbázis hiba történt.' });
    }
});

// SAJÁT POSZTOK (BLOB formázással)
app.get('/api/my-posts', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(formatPostsForFrontend(rows));
    } catch (err) {
        res.status(500).json({ error: 'Hiba a posztok lekérdezésekor' });
    }
});

app.post('/api/ideas', authenticateToken, async (req, res) => {
    const { title, description, category_id } = req.body;
    if (!title || !description || !category_id) return res.status(400).json({ error: 'Minden mező kitöltése kötelező!' });

    try {
        await db.query('INSERT INTO ideas (user_id, category_id, title, description) VALUES (?, ?, ?, ?)', [req.user.id, category_id, title, description]);
        res.status(201).json({ message: 'Ötlet sikeresen közzétéve!' });
    } catch (err) {
        res.status(500).json({ error: 'Hiba az ötlet mentésekor.' });
    }
});

// FŐOLDAL LEGÚJABB (BLOB formázással)
app.get('/api/latest-posts', async (req, res) => {
    try {
        const sql = `
            SELECT posts.*, users.username, users.avatar_url 
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            WHERE posts.idea_id IS NULL
            ORDER BY posts.created_at DESC LIMIT 3
        `;
        const [rows] = await db.query(sql);
        res.json(formatPostsForFrontend(rows));
    } catch (err) {
        res.status(500).json({ error: 'Hiba a legújabb posztok lekérésekor.' });
    }
});

app.get('/api/my-likes', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT post_id FROM likes WHERE user_id = ?', [req.user.id]);
        res.json(rows.map(r => r.post_id));
    } catch (err) {
        res.status(500).json({ error: 'Hiba a lájkok lekérésekor.' });
    }
});

app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;
    try {
        const [existing] = await db.query('SELECT * FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
        if (existing.length > 0) {
            await db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
            res.json({ liked: false });
        } else {
            await db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId]);
            res.json({ liked: true });
        }
    } catch (err) {
        res.status(500).json({ error: 'Hiba a lájkolás során.' });
    }
});

app.get('/api/posts/:id/comments', async (req, res) => {
    try {
        const sql = 'SELECT comments.*, users.username, users.avatar_url FROM comments JOIN users ON comments.user_id = users.id WHERE comments.post_id = ? ORDER BY comments.created_at ASC';
        const [rows] = await db.query(sql, [req.params.id]);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Hiba a kommentek betöltésekor' });
    }
});

app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
    const { content } = req.body;
    if (!content || content.trim() === '') return res.status(400).json({ error: 'A komment nem lehet üres!' });

    try {
        await db.query('INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)', [req.user.id, req.params.id, content]);
        res.status(201).json({ message: 'Komment sikeresen elküldve!' });
    } catch (err) {
        res.status(500).json({ error: 'Hiba a komment mentésekor.' });
    }
});

// LÁJKOLT POSZTOK (BLOB formázással)
app.get('/api/my-liked-posts', authenticateToken, async (req, res) => {
    try {
        const sql = `
            SELECT posts.*, users.username, users.avatar_url 
            FROM posts JOIN likes ON posts.id = likes.post_id JOIN users ON posts.user_id = users.id
            WHERE likes.user_id = ? ORDER BY likes.created_at DESC
        `;
        const [rows] = await db.query(sql, [req.user.id]);
        res.json(formatPostsForFrontend(rows));
    } catch (err) {
        res.status(500).json({ error: 'Hiba a kedvelt posztok lekérésekor.' });
    }
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        const [post] = await db.query('SELECT * FROM posts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (post.length === 0) return res.status(403).json({ error: 'Nincs jogosultságod!' });
        await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Poszt sikeresen törölve!' });
    } catch (err) {
        res.status(500).json({ error: 'Hiba a törlés során.' });
    }
});

// ADMIN VÉGPONTOK
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (err) { res.status(500).json({ error: 'Hiba a felhasználók lekérésekor.' }); }
});

app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Felhasználó törölve!' });
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

app.delete('/api/admin/posts/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Poszt törölve!' });
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

app.post('/api/reports', authenticateToken, async (req, res) => {
    const { target_type, target_id, reason } = req.body;
    if (!target_type || !target_id || !reason) return res.status(400).json({ error: 'Minden mező kötelező!' });
    try {
        await db.query('INSERT INTO reports (reporter_id, target_type, target_id, reason) VALUES (?, ?, ?, ?)', [req.user.id, target_type, target_id, reason]);
        res.status(201).json({ message: 'Jelentés elküldve!' });
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

app.get('/api/admin/reports', authenticateToken, isAdmin, async (req, res) => {
    try {
        const sql = `
            SELECT reports.*, users.username AS reporter_name, posts.title AS post_title, posts.image_url AS post_image, comments.content AS comment_text
            FROM reports JOIN users ON reports.reporter_id = users.id 
            LEFT JOIN posts ON reports.target_type = 'post' AND reports.target_id = posts.id
            LEFT JOIN comments ON reports.target_type = 'comment' AND reports.target_id = comments.id
            ORDER BY reports.created_at DESC
        `;
        const [reports] = await db.query(sql);
        
        // Formázzuk a jelentésekben lévő képeket is, ha BLOB
        const formattedReports = reports.map(r => {
            if (r.post_image === 'BLOB') r.post_image = `http://localhost:3000/api/posts/${r.target_id}/image`;
            return r;
        });
        res.json(formattedReports);
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

app.delete('/api/admin/reports/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM reports WHERE id = ?', [req.params.id]);
        res.json({ message: 'Jelentés lezárva!' });
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

app.delete('/api/admin/comments/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
        res.json({ message: 'Komment törölve!' });
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

// NYILVÁNOS PROFIL (BLOB formázással)
app.get('/api/users/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const [users] = await db.query(`
            SELECT id, username, full_name, bio, avatar_url, location, created_at,
            (SELECT COUNT(*) FROM follows WHERE following_id = users.id) AS followers_count,
            (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) AS following_count
            FROM users WHERE username = ?
        `, [username]);

        if (users.length === 0) return res.status(404).json({ error: 'Felhasználó nem található!' });

        const [posts] = await db.query('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', [users[0].id]);
        
        res.json({ user: users[0], posts: formatPostsForFrontend(posts) });
    } catch (err) {
        res.status(500).json({ error: 'Hiba.' });
    }
});

app.get('/api/users/:id/is-following', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, req.params.id]);
        res.json({ isFollowing: rows.length > 0 });
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

app.post('/api/users/:id/follow', authenticateToken, async (req, res) => {
    const followerId = req.user.id;
    const followingId = req.params.id;
    if (followerId == followingId) return res.status(400).json({ error: 'Magadat nem követheted!' });

    try {
        const [existing] = await db.query('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
        if (existing.length > 0) {
            await db.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [followerId, followingId]);
            res.json({ followed: false });
        } else {
            await db.query('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [followerId, followingId]);
            res.json({ followed: true });
        }
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

app.get('/api/messages/:otherUserId', authenticateToken, async (req, res) => {
    const myId = req.user.id;
    const otherUserId = req.params.otherUserId;
    try {
        const sql = `
            SELECT messages.*, sender.username AS sender_name, sender.avatar_url AS sender_avatar, receiver.username AS receiver_name, receiver.avatar_url AS receiver_avatar
            FROM messages JOIN users AS sender ON messages.sender_id = sender.id JOIN users AS receiver ON messages.receiver_id = receiver.id
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
            ORDER BY created_at ASC
        `;
        const [messages] = await db.query(sql, [myId, otherUserId, otherUserId, myId]);
        res.json(messages);
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

app.post('/api/messages/:otherUserId', authenticateToken, async (req, res) => {
    const myId = req.user.id;
    const otherUserId = req.params.otherUserId;
    const { content } = req.body;
    if (!content || content.trim() === '') return res.status(400).json({ error: 'Üres!' });

    try {
        const [result] = await db.query('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', [myId, otherUserId, content]);
        res.status(201).json({ message: 'Elküldve!', messageId: result.insertId });
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

// ==========================
// KÉP KISZOLGÁLÁSA BLOB-BÓL (EZ KÜLDI KI A KÉPET A BÖNGÉSZŐNEK!)
// ==========================
app.get('/api/posts/:id/image', async (req, res) => {
    try {
        const [posts] = await db.query('SELECT image_data, image_type FROM posts WHERE id = ?', [req.params.id]);
        
        if (posts.length === 0 || !posts[0].image_data) {
            return res.status(404).send('Kép nem található');
        }

        res.setHeader('Content-Type', posts[0].image_type || 'image/jpeg');
        res.send(posts[0].image_data); 
    } catch (err) {
        res.status(500).send('Hiba a kép betöltésekor');
    }
});

// Profile szerkesztése

app.put('/api/users/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
    const { full_name, bio, location } = req.body;
    const userId = req.user.id;

    try {
        let finalAvatar = null;

        // Ha küldött új képet, feldolgozzuk a sharp-pal (mint a regisztrációnál)
        if (req.file) {
            const filename = `user-${Date.now()}.jpeg`;
            await sharp(req.file.buffer)
                .resize(500, 500, { fit: sharp.fit.cover, position: sharp.strategy.entropy })
                .toFormat('jpeg')
                .jpeg({ quality: 80 })
                .toFile(`uploads/${filename}`);
            
            finalAvatar = `http://localhost:3000/uploads/${filename}`;
        }

        // SQL frissítés: Ha van új kép, azt is beleírjuk, ha nincs, csak a szövegeket
        if (finalAvatar) {
            const sql = 'UPDATE users SET full_name = ?, bio = ?, location = ?, avatar_url = ? WHERE id = ?';
            await db.query(sql, [full_name, bio, location, finalAvatar, userId]);
        } else {
            const sql = 'UPDATE users SET full_name = ?, bio = ?, location = ? WHERE id = ?';
            await db.query(sql, [full_name, bio, location, userId]);
        }

        // Visszaküldjük a legfrissebb adatokat a frontendnek
        const [updatedUser] = await db.query('SELECT id, username, email, role, avatar_url, full_name, bio, location FROM users WHERE id = ?', [userId]);

        res.json({ message: 'Profil sikeresen frissítve!', user: updatedUser[0] });

    } catch (err) {
        console.error("Hiba a profil frissítésekor:", err);
        res.status(500).json({ error: 'Hiba a profil frissítésekor.' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend szerver fut: http://localhost:${PORT}`);
});