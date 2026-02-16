const express = require('express');
const cors = require('cors');
const db = require('./db'); // A db.js fájl, amit korábban csináltunk

const app = express();
const PORT = 3000;

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

// Szerver indítása
app.listen(PORT, () => {
    console.log(`Backend szerver fut: http://localhost:${PORT}`);
});