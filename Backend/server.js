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

// ==========================================
// 1. ALAPBEÁLLÍTÁSOK ÉS MIDDLEWARE-EK
// ==========================================
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// ==========================================
// 2. SEGÉDFÜGGVÉNYEK
// ==========================================
const formatPostsForFrontend = (posts) => {
    return posts.map(post => {
        const formattedPost = { ...post };
        if (formattedPost.image_url === 'BLOB') {
            formattedPost.image_url = `http://localhost:3000/api/posts/${formattedPost.id}/image`;
        }
        delete formattedPost.image_data; 
        return formattedPost;
    });
};

// ÉRTESÍTÉS KÜLDŐ SEGÉDFÜGGVÉNY
const sendNotification = async (userId, senderId, type, targetId = null) => {
    if (userId === senderId) return; // Magunknak nem küldünk értesítést!
    try {
        await db.query('INSERT INTO notifications (user_id, sender_id, type, target_id) VALUES (?, ?, ?, ?)', [userId, senderId, type, targetId]);
    } catch (err) { console.error("Hiba az értesítés mentésekor:", err); }
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

// ==========================================
// 3. AUTENTIKÁCIÓ (Regisztráció / Belépés)
// ==========================================
app.post('/api/auth/register', upload.single('profileImage'), async (req, res) => {
    const { username, email, password, full_name, bio, location } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Minden kötelező mező kitöltése szükséges!' });
    
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
                .toFormat('jpeg').jpeg({ quality: 80 }).toFile(`uploads/${filename}`); 
            finalAvatar = `http://localhost:3000/uploads/${filename}`;
        } else {
            finalAvatar = `https://ui-avatars.com/api/?name=${username}&background=random&color=fff&size=128`;
        }

        const sql = 'INSERT INTO users (username, email, password_hash, role, avatar_url, full_name, bio, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        await db.query(sql, [username, email, passwordHash, 'user', finalAvatar, full_name || null, bio || null, location || null]);
        res.status(201).json({ message: 'Sikeres regisztráció!' });
    } catch (err) { res.status(500).json({ error: 'Szerver hiba.' }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ error: 'Hibás email vagy jelszó!' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ error: 'Hibás email vagy jelszó!' });

        const token = jwt.sign({ id: user.id, role: user.role, username: user.username }, JWT_SECRET, { expiresIn: '2h' });
        res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, avatar_url: user.avatar_url } });
    } catch (err) { res.status(500).json({ error: 'Szerver hiba a belépésnél.' }); }
});

// ==========================================
// 4. FELHASZNÁLÓI PROFILOK ÉS KÖVETÉSEK
// ==========================================
app.put('/api/users/profile', authenticateToken, upload.single('avatar'), async (req, res) => {
    const { full_name, bio, location } = req.body;
    const userId = req.user.id;
    try {
        let finalAvatar = null;
        if (req.file) {
            const filename = `user-${Date.now()}.jpeg`;
            await sharp(req.file.buffer).resize(500, 500, { fit: sharp.fit.cover }).toFormat('jpeg').jpeg({ quality: 80 }).toFile(`uploads/${filename}`);
            finalAvatar = `http://localhost:3000/uploads/${filename}`;
        }
        if (finalAvatar) {
            await db.query('UPDATE users SET full_name = ?, bio = ?, location = ?, avatar_url = ? WHERE id = ?', [full_name, bio, location, finalAvatar, userId]);
        } else {
            await db.query('UPDATE users SET full_name = ?, bio = ?, location = ? WHERE id = ?', [full_name, bio, location, userId]);
        }
        const [updatedUser] = await db.query('SELECT id, username, email, role, avatar_url, full_name, bio, location FROM users WHERE id = ?', [userId]);
        res.json({ message: 'Profil sikeresen frissítve!', user: updatedUser[0] });
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

app.get('/api/users/:username', async (req, res) => {
    try {
        const [users] = await db.query(`SELECT id, username, full_name, bio, avatar_url, location, created_at, (SELECT COUNT(*) FROM follows WHERE following_id = users.id) AS followers_count, (SELECT COUNT(*) FROM follows WHERE follower_id = users.id) AS following_count FROM users WHERE username = ?`, [req.params.username]);
        if (users.length === 0) return res.status(404).json({ error: 'Nincs találat!' });
        const [posts] = await db.query('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', [users[0].id]);
        res.json({ user: users[0], posts: formatPostsForFrontend(posts) });
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

app.get('/api/users/:id/is-following', authenticateToken, async (req, res) => {
    try {
        const myId = req.user.id;
        const otherUserId = req.params.id;
        const [iFollowThem] = await db.query('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?', [myId, otherUserId]);
        const [theyFollowMe] = await db.query('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?', [otherUserId, myId]);
        res.json({ isFollowing: iFollowThem.length > 0, isFollowingMe: theyFollowMe.length > 0 });
    } catch (err) { res.status(500).json({ error: 'Hiba az ismerősök ellenőrzésekor.' }); }
});

app.post('/api/users/:id/follow', authenticateToken, async (req, res) => {
    if (req.user.id == req.params.id) return res.status(400).json({ error: 'Magadat nem követheted!' });
    try {
        const [existing] = await db.query('SELECT * FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, req.params.id]);
        if (existing.length > 0) {
            await db.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, req.params.id]);
            res.json({ followed: false });
        } else {
            await db.query('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.user.id, req.params.id]);
            res.json({ followed: true });
            await sendNotification(req.params.id, req.user.id, 'follow');
        }
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

// ==========================================
// 5. CSETELÉS ÉS ISMERŐSÖK (MESSAGES)
// ==========================================
app.get('/api/friends', authenticateToken, async (req, res) => {
    try {
        const myId = req.user.id;
        const sql = `
            SELECT u.id, u.username, u.avatar_url, u.full_name
            FROM users u
            JOIN follows f1 ON f1.following_id = u.id AND f1.follower_id = ?
            JOIN follows f2 ON f2.follower_id = u.id AND f2.following_id = ?
        `;
        const [friends] = await db.query(sql, [myId, myId]);
        res.json(friends);
    } catch (err) { res.status(500).json({ error: 'Hiba az ismerősök betöltésekor.' }); }
});

// 🔥 ÚJ VÉGPONT: ÜZENETEK LEKÉRÉSE 🔥
app.get('/api/messages/:otherUserId', authenticateToken, async (req, res) => {
    try {
        const myId = req.user.id;
        const otherId = req.params.otherUserId;
        const sql = `
            SELECT m.*, u.avatar_url as sender_avatar 
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = ? AND m.receiver_id = ?) 
               OR (m.sender_id = ? AND m.receiver_id = ?)
            ORDER BY m.created_at ASC
        `;
        const [messages] = await db.query(sql, [myId, otherId, otherId, myId]);
        res.json(messages);
    } catch (err) { res.status(500).json({ error: 'Hiba az üzenetek lekérésekor.' }); }
});

app.post('/api/messages/:otherUserId', authenticateToken, async (req, res) => {
    const myId = req.user.id;
    const otherUserId = req.params.otherUserId;
    const { content } = req.body;
    if (!content || content.trim() === '') return res.status(400).json({ error: 'Üres üzenet!' });

    try {
        const [mutual] = await db.query(
            `SELECT 
                (SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = ?) as iFollowThem,
                (SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = ?) as theyFollowMe`,
            [myId, otherUserId, otherUserId, myId]
        );

        if (Number(mutual[0].iFollowThem) === 0 || Number(mutual[0].theyFollowMe) === 0) {
            return res.status(403).json({ error: 'Csak kölcsönös követők küldhetnek üzenetet!' });
        }

        const [result] = await db.query('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', [myId, otherUserId, content]);
        res.status(201).json({ message: 'Elküldve!', messageId: result.insertId });
        await sendNotification(otherUserId, myId, 'message');
    } catch (err) { res.status(500).json({ error: 'Hiba az üzenet küldésekor.' }); }
});

// ==========================================
// 6. GALÉRIA ÉS POSZTOK KÜLDÉSE/TÖRLÉSE
// ==========================================
app.get('/api/gallery', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 9;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const category = req.query.category || '';
        const sort = req.query.sort || 'latest';

        let sql = `
            SELECT posts.*, users.username, users.avatar_url, categories.name as category_name,
                   COUNT(likes.user_id) AS like_count
            FROM posts
            JOIN users ON posts.user_id = users.id
            JOIN categories ON posts.category_id = categories.id
            LEFT JOIN likes ON posts.id = likes.post_id
            WHERE posts.idea_id IS NULL
        `;
        const queryParams = [];

        // 🔥 MÓDOSÍTOTT RÉSZ: Zárójelek között keressük a címben VAGY a címkékben!
        if (search) { 
            sql += ` AND (posts.title LIKE ? OR posts.tags LIKE ?)`; 
            queryParams.push(`%${search}%`, `%${search}%`); 
        }
        
        if (category) { 
            sql += ` AND categories.name = ?`; 
            queryParams.push(category); 
        }
        
        sql += ` GROUP BY posts.id `;

        if (sort === 'popular') sql += ` ORDER BY like_count DESC `; 
        else if (sort === 'oldest') sql += ` ORDER BY posts.created_at ASC `; 
        else sql += ` ORDER BY posts.created_at DESC `; 

        sql += ` LIMIT ? OFFSET ?`;
        queryParams.push(limit, offset);

        const [rows] = await db.query(sql, queryParams);
        res.json(formatPostsForFrontend(rows)); 
    } catch (err) { 
        res.status(500).json({ error: 'Hiba a galéria betöltésekor' }); 
    }
});

app.post('/api/posts', authenticateToken, upload.single('image'), async (req, res) => {
    // 🔥 ÚJ: tags is bejön a req.body-ból
    const { title, description, category_id, idea_id, tags } = req.body;
    if (!title || !req.file) return res.status(400).json({ error: 'Cím és Kép megadása kötelező!' });

    try {
        const optimizedImageBuffer = await sharp(req.file.buffer)
            .resize(1200, 800, { fit: sharp.fit.inside, withoutEnlargement: true })
            .toFormat('jpeg').jpeg({ quality: 85 }).toBuffer();

        let finalIdeaId = null;
        if (idea_id && idea_id !== 'null' && idea_id !== '') finalIdeaId = parseInt(idea_id);

        // 🔥 ÚJ: tags hozzáadása az SQL lekérdezéshez
        const sql = `INSERT INTO posts (user_id, category_id, idea_id, title, description, tags, image_url, image_data, image_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        await db.query(sql, [req.user.id, category_id || 1, finalIdeaId, title, description, tags || null, 'BLOB', optimizedImageBuffer, 'image/jpeg']);
        
        // (Opcionális: Értesítés az ötletgazdának, ha van)
        if (finalIdeaId) {
            const [idea] = await db.query('SELECT user_id FROM ideas WHERE id = ?', [finalIdeaId]);
            if (idea.length > 0 && idea[0].user_id !== req.user.id) {
                try { await db.query('INSERT INTO notifications (user_id, sender_id, type, target_id) VALUES (?, ?, ?, ?)', [idea[0].user_id, req.user.id, 'implementation', finalIdeaId]); } catch(e){}
            }
        }
        res.status(201).json({ message: 'Poszt sikeresen létrehozva!' });
    } catch (err) { res.status(500).json({ error: 'Adatbázis hiba történt.' }); }
});

app.put('/api/posts/:id', authenticateToken, async (req, res) => {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'A cím megadása kötelező!' });
    try {
        const [post] = await db.query('SELECT * FROM posts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (post.length === 0) return res.status(403).json({ error: 'Nincs jogosultságod!' });
        await db.query('UPDATE posts SET title = ?, description = ? WHERE id = ?', [title, description, req.params.id]);
        res.json({ message: 'Poszt sikeresen frissítve!' });
    } catch (err) { res.status(500).json({ error: 'Hiba a poszt frissítésekor.' }); }
});

app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    try {
        const [post] = await db.query('SELECT * FROM posts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        if (post.length === 0) return res.status(403).json({ error: 'Nincs jogosultságod!' });
        await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
        res.json({ message: 'Poszt törölve!' });
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

app.get('/api/posts/:id/image', async (req, res) => {
    try {
        const [posts] = await db.query('SELECT image_data, image_type FROM posts WHERE id = ?', [req.params.id]);
        if (posts.length === 0 || !posts[0].image_data) return res.status(404).send('Kép nem található');
        res.setHeader('Content-Type', posts[0].image_type || 'image/jpeg');
        res.send(posts[0].image_data); 
    } catch (err) { res.status(500).send('Hiba a kép betöltésekor'); }
});

// A bejelentkezett felhasználó posztjai
app.get('/api/my-posts', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(formatPostsForFrontend(rows));
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

app.get('/api/my-liked-posts', authenticateToken, async (req, res) => {
    try {
        const sql = `SELECT posts.*, users.username, users.avatar_url FROM posts JOIN likes ON posts.id = likes.post_id JOIN users ON posts.user_id = users.id WHERE likes.user_id = ? ORDER BY likes.created_at DESC`;
        const [rows] = await db.query(sql, [req.user.id]);
        res.json(formatPostsForFrontend(rows));
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

app.get('/api/latest-posts', async (req, res) => {
    try {
        const sql = `SELECT posts.*, users.username, users.avatar_url FROM posts JOIN users ON posts.user_id = users.id WHERE posts.idea_id IS NULL ORDER BY posts.created_at DESC LIMIT 3`;
        const [rows] = await db.query(sql);
        res.json(formatPostsForFrontend(rows));
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

// ==========================================
// 7. KOMMENTEK ÉS LÁJKOK
// ==========================================
app.get('/api/posts/:id/comments', async (req, res) => {
    try {
        const sql = 'SELECT comments.*, users.username, users.avatar_url FROM comments JOIN users ON comments.user_id = users.id WHERE comments.post_id = ? ORDER BY comments.created_at ASC';
        const [rows] = await db.query(sql, [req.params.id]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
    const { content } = req.body;
    if (!content || content.trim() === '') return res.status(400).json({ error: 'A komment nem lehet üres!' });
    try {
        await db.query('INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)', [req.user.id, req.params.id, content]);
        const [post] = await db.query('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
        if (post.length > 0) await sendNotification(post[0].user_id, req.user.id, 'comment', req.params.id);
        res.status(201).json({ message: 'Komment elküldve!' });
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

app.get('/api/my-likes', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query('SELECT post_id FROM likes WHERE user_id = ?', [req.user.id]);
        res.json(rows.map(r => r.post_id));
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
    try {
        const [existing] = await db.query('SELECT * FROM likes WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.id]);
        if (existing.length > 0) {
            await db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [req.user.id, req.params.id]);
            res.json({ liked: false });
        } else {
            await db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.user.id, req.params.id]);
            res.json({ liked: true });
            const [post] = await db.query('SELECT user_id FROM posts WHERE id = ?', [req.params.id]);
            if (post.length > 0) await sendNotification(post[0].user_id, req.user.id, 'like', req.params.id);
        }
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

// ==========================================
// 8. ÖTLETBÖRZE (IDEAS)
// ==========================================
app.get('/api/ideas', async (req, res) => {
    try {
        const sql = `
            SELECT ideas.*, users.username, users.avatar_url, categories.name as category_name 
            FROM ideas JOIN users ON ideas.user_id = users.id 
            JOIN categories ON ideas.category_id = categories.id
            ORDER BY ideas.created_at DESC
        `;
        const [rows] = await db.query(sql);
        res.json(rows); 
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

app.post('/api/ideas', authenticateToken, async (req, res) => {
    const { title, description, category_id } = req.body;
    if (!title || !description || !category_id) return res.status(400).json({ error: 'Minden mező kötelező!' });
    try {
        await db.query('INSERT INTO ideas (user_id, category_id, title, description) VALUES (?, ?, ?, ?)', [req.user.id, category_id, title, description]);
        res.status(201).json({ message: 'Ötlet sikeresen közzétéve!' });
    } catch (err) { res.status(500).json({ error: 'Hiba.' }); }
});

app.get('/api/ideas/:id/implementations', async (req, res) => {
    try {
        const sql = `
            SELECT posts.*, users.username, users.avatar_url, COUNT(likes.user_id) AS like_count
            FROM posts JOIN users ON posts.user_id = users.id LEFT JOIN likes ON posts.id = likes.post_id
            WHERE posts.idea_id = ? GROUP BY posts.id ORDER BY posts.created_at DESC
        `;
        const [rows] = await db.query(sql, [req.params.id]);
        res.json(formatPostsForFrontend(rows));
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

// ==========================================
// 9. ADMINISZTRÁCIÓ ÉS JELENTÉSEK
// ==========================================
app.get('/api/admin/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(users);
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
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

// ==========================================
// 10. VISSZAJELZÉSEK (FEEDBACK)
// ==========================================
app.post('/api/feedback', async (req, res) => {
    const { name, email, type, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Minden kötelező mezőt ki kell tölteni!' });
    try {
        await db.query('INSERT INTO feedbacks (name, email, type, message) VALUES (?, ?, ?, ?)', [name, email, type, message]);
        res.status(201).json({ message: 'Visszajelzés sikeresen elküldve!' });
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

app.get('/api/admin/feedbacks', authenticateToken, isAdmin, async (req, res) => {
    try {
        const [feedbacks] = await db.query('SELECT * FROM feedbacks ORDER BY created_at DESC');
        res.json(feedbacks);
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

app.delete('/api/admin/feedbacks/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM feedbacks WHERE id = ?', [req.params.id]);
        res.json({ message: 'Visszajelzés törölve!' });
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

// ==========================================
// 11. ÉRTESÍTÉSEK (NOTIFICATIONS)
// ==========================================
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const sql = `
            SELECT n.*, u.username, u.avatar_url, u.full_name
            FROM notifications n
            JOIN users u ON n.sender_id = u.id
            WHERE n.user_id = ?
            ORDER BY n.created_at DESC LIMIT 20
        `;
        const [notifications] = await db.query(sql, [req.user.id]);
        res.json(notifications);
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

app.put('/api/notifications/read', authenticateToken, async (req, res) => {
    try {
        await db.query('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Olvasottnak jelölve!' });
    } catch (err) { res.status(500).json({ error: 'Hiba' }); }
});

// ==========================================
// 12. GYŰJTEMÉNYEK / MOODBOARDOK (MENTÉS)
// ==========================================

// 1. A bejelentkezett felhasználó mappáinak lekérése
app.get('/api/collections', authenticateToken, async (req, res) => {
    try {
        const [collections] = await db.query('SELECT * FROM collections WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        res.json(collections);
    } catch (err) { res.status(500).json({ error: 'Hiba a gyűjtemények betöltésekor' }); }
});

// 2. Új mappa létrehozása
app.post('/api/collections', authenticateToken, async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'A mappa neve kötelező!' });
    try {
        const [result] = await db.query('INSERT INTO collections (user_id, name) VALUES (?, ?)', [req.user.id, name]);
        res.status(201).json({ id: result.insertId, name, user_id: req.user.id });
    } catch (err) { res.status(500).json({ error: 'Hiba a mappa létrehozásakor' }); }
});

// 3. Kép hozzáadása egy mappához
app.post('/api/collections/:collectionId/add', authenticateToken, async (req, res) => {
    const { postId } = req.body;
    const collectionId = req.params.collectionId;
    try {
        // Megnézzük, benne van-e már
        const [exists] = await db.query('SELECT * FROM collection_items WHERE collection_id = ? AND post_id = ?', [collectionId, postId]);
        if (exists.length > 0) return res.status(400).json({ error: 'Ez a kép már benne van ebben a gyűjteményben!' });

        await db.query('INSERT INTO collection_items (collection_id, post_id) VALUES (?, ?)', [collectionId, postId]);
        res.json({ message: 'Sikeresen hozzáadva a gyűjteményhez!' });
    } catch (err) { res.status(500).json({ error: 'Hiba a mentés során' }); }
});

// 4. Egy adott felhasználó gyűjteményeinek lekérése (borítóképpel és elemszámmal)
app.get('/api/users/:username/collections', async (req, res) => {
    try {
        const [users] = await db.query('SELECT id FROM users WHERE username = ?', [req.params.username]);
        if (users.length === 0) return res.status(404).json({ error: 'Felhasználó nem található' });

        // MÓDOSÍTÁS: Nem az image_url-t, hanem a legutolsó kép ID-ját (cover_post_id) kérjük le!
        const sql = `
            SELECT c.*, 
                   (SELECT ci.post_id FROM collection_items ci WHERE ci.collection_id = c.id ORDER BY ci.added_at DESC LIMIT 1) as cover_post_id,
                   (SELECT COUNT(*) FROM collection_items WHERE collection_id = c.id) as item_count
            FROM collections c
            WHERE c.user_id = ?
            ORDER BY c.created_at DESC
        `;
        const [collections] = await db.query(sql, [users[0].id]);

        // 🔥 ITT A VARÁZSLAT: Kézzel megcsináljuk a borítókép rendes linkjét a backend alapján!
        const formattedCollections = collections.map(col => ({
            ...col,
            cover_image: col.cover_post_id ? `http://localhost:3000/api/posts/${col.cover_post_id}/image` : null
        }));

        res.json(formattedCollections);
    } catch (err) { res.status(500).json({ error: 'Hiba a gyűjtemények betöltésekor' }); }
});

// 5. Egy konkrét gyűjtemény tartalmának (posztjainak) lekérése
app.get('/api/collections/:id/posts', async (req, res) => {
    try {
        const sql = `
            SELECT p.*, u.username, u.avatar_url, c.name as category_name,
                   (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as like_count
            FROM collection_items ci
            JOIN posts p ON ci.post_id = p.id
            JOIN users u ON p.user_id = u.id
            JOIN categories c ON p.category_id = c.id
            WHERE ci.collection_id = ?
            ORDER BY ci.added_at DESC
        `;
        const [posts] = await db.query(sql, [req.params.id]);
        res.json(formatPostsForFrontend(posts));
    } catch (err) { res.status(500).json({ error: 'Hiba a képek betöltésekor' }); }
});

// ==========================================
// SZERVER INDÍTÁSA
// ==========================================
app.listen(PORT, () => {
    console.log(`Backend szerver fut: http://localhost:${PORT}`);
});