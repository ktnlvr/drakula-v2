require('dotenv').config();
const express = require('express');
//const bodyParser = require('body-parser');
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    connectionLimit: 3
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

//200 OK with the JSON data on success.
//201 Created
//202 Accepted
//404 Not Found
//409 Conflict
//400 Bad Request
//500 Internal Server Error

app.get('/', (req, res) => {
    res.send('Welcome to the Drakula-v2 API!');
});

app.post('/game',async(req,res)=>{
            const gameId = req.query.id;
            const gameData = req.body;

            if (!gameId){
                return res.status(400).json({
                    error:'Missing Id!'
                });   
            }

        let connect;

        try {
            connect = await pool.getConnection();
            const query = 'INSERT INTO games (id, data, created_at) VALUES (?, ?, NOW())';
            const values = [gameId, JSON,stringify(gameData)];
            await connect.query(query,values);
            return res.status(201).json({ id: gameId, data: gameData, created_at: new Date().toISOString() });
        } finally {
            if (connect) connect.release();
        }
    });

app.get('/game', async (req, res) =>{
    const gameId = req.query.id;

    if (!gameId){
        return res.status(400).json({
            error:'Missing Id!'
        });   
    }

    let connect;
    try {
        connect = await pool.getConnection();
        const query = 'SELECT data FROM games WHERE id=?';
        const row = await connect.query(query, [gameId]);

        if (row.length === 0) {
            return res.status(404).json({error:'Games data not found'});
        }

        const data = JSON.parse(row[0].data);
        return res.status(200).json(data);
    } finally {
        if (connect) connect.release();
      }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


