const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const bcrypt = require('bcrypt');
const { generateToken, verifyToken } = require('../services/authService'); // Importa los servicios

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Users';

// Registrar un usuario
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    try {
        // Verificar si el usuario ya existe
        const result = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: { email },
        }).promise();

        if (result.Item) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Cifrar la contraseña antes de almacenarla
        const hashedPassword = await bcrypt.hash(password, 10);

        const nuevoUsuario = {
            email,
            password: hashedPassword, // Guarda la contraseña cifrada
        };

        await dynamoDB.put({
            TableName: TABLE_NAME,
            Item: nuevoUsuario,
        }).promise();

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el usuario' });
    }
});

// Autenticación de usuario
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    try {
        const result = await dynamoDB.get({
            TableName: TABLE_NAME,
            Key: { email },
        }).promise();

        const user = result.Item;

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Verificar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        // Generar token JWT
        const token = generateToken({ email: user.email });
        res.json({ message: 'Inicio de sesión exitoso', token });
    } catch (error) {
        res.status(500).json({ error: 'Error al autenticar usuario' });
    }
});

module.exports = router;
