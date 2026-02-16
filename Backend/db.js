const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: 'localhost',         
    user: 'root',              
    password: 'rootpassword',  
    database: 'artisticeye_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


pool.getConnection((err, connection) => {
    if (err) {
        console.error('Hiba az adatbázis csatlakozásakor:', err.code);
        console.error('Fut a Docker? Elindítottad a docker-compose up-ot?');
    } else {
        console.log('✅ Sikeresen csatlakozva a MySQL adatbázishoz!');
        connection.release();
    }
});

module.exports = pool.promise();
module.exports = pool.promise();