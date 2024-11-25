// src/routes/categorias.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { uploadToS3, deleteFromS3 } = require('../services/s3Service');
const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Categorias';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'));
  },
});

// Crear categoría
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre || !descripcion || !req.file) {
      return res.status(400).json({ error: 'Nombre, descripción e imagen son requeridos' });
    }

    const imageUrl = await uploadToS3(req.file);
    const nuevaCategoria = {
      id: uuidv4(),
      nombre,
      descripcion,
      imagen: imageUrl,
      fechaCreacion: new Date().toISOString(),
    };

    await dynamoDB.put({
      TableName: TABLE_NAME,
      Item: nuevaCategoria,
    }).promise();

    res.status(201).json(nuevaCategoria);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la categoría' });
  }
});

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const result = await dynamoDB.scan({ TableName: TABLE_NAME }).promise();
    res.json(result.Items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Eliminar categoría
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dynamoDB.get({ TableName: TABLE_NAME, Key: { id } }).promise();
    const categoria = result.Item;

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    if (categoria.imagen) {
      const key = new URL(categoria.imagen).pathname.substring(1);
      await deleteFromS3(key);
    }

    await dynamoDB.delete({ TableName: TABLE_NAME, Key: { id } }).promise();
    res.status(200).json({ message: 'Categoría e imagen eliminadas correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

module.exports = router;
