// src/index.js
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

dotenv.config({ path: path.join(__dirname, '../.env') });

const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos'); 
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes); 
app.use('/api/auth', authRoutes);

app.listen(port, process.env.HOST || '192.168.1.102', () => {
    console.log(`Servidor backend corriendo en http://${process.env.HOST || '192.168.1.102'}:${port}`);
});