require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Conexão MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prevenda_db',
    waitForConnections: true,
    connectionLimit: 10
});

// RF06: Endpoint POST - Registrar Pré-venda
app.post('/api/interessados', (req, res) => {
    const { nome, email, telefone, quantidade, aceita_notificacoes } = req.body;

    if (!nome || !email || !telefone || !quantidade) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    const query = `
        INSERT INTO interessados (nome, email, telefone, quantidade, aceita_notificacoes) 
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [nome, email, telefone, quantidade, aceita_notificacoes || false], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erro ao salvar no banco de dados.' });
        }
        res.status(201).json({ message: 'Pré-venda registrada com sucesso!', id: result.insertId });
    });
});

// RF06: Endpoint GET - Consultar Leads
app.get('/api/interessados', (req, res) => {
    db.query('SELECT * FROM interessados ORDER BY created_at DESC', (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro ao buscar registros.' });
        }
        res.json(results);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
