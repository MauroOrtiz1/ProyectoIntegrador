//src/routes/productos.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { uploadToS3, deleteFromS3 } = require('../services/s3Service');
const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'Productos';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'));
  },
});

// Crear producto
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, cantidad, categoriaId } = req.body;
    if (!nombre || !precio || !cantidad || !categoriaId) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const imageUrl = req.file ? await uploadToS3(req.file, 'imagenproducto') : null;
    const nuevoProducto = {
      id: uuidv4(),
      nombre,
      precio: parseFloat(precio),
      cantidad: parseInt(cantidad),
      imagen: imageUrl,
      categoriaId,
      fechaCreacion: new Date().toISOString(),
    };

    await dynamoDB.put({
      TableName: TABLE_NAME,
      Item: nuevoProducto,
    }).promise();

    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// Obtener productos por categoría
router.get('/:categoriaId', async (req, res) => {
  try {
    const { categoriaId } = req.params;
    const result = await dynamoDB.query({
      TableName: TABLE_NAME,
      IndexName: 'CategoriaIndex',
      KeyConditionExpression: 'categoriaId = :categoriaId',
      ExpressionAttributeValues: { ':categoriaId': categoriaId },
    }).promise();

    res.json(result.Items);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, cantidad, categoriaId } = req.body;

    if (!nombre || !precio || !cantidad || !categoriaId) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const result = await dynamoDB.get({ TableName: TABLE_NAME, Key: { id } }).promise();
    if (!result.Item) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const productoActualizado = {
      ...result.Item,
      nombre,
      precio: parseFloat(precio),
      cantidad: parseInt(cantidad),
    };

    await dynamoDB.put({
      TableName: TABLE_NAME,
      Item: productoActualizado,
    }).promise();

    res.status(200).json(productoActualizado);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// Eliminar producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dynamoDB.get({ TableName: TABLE_NAME, Key: { id } }).promise();
    if (!result.Item) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = result.Item;
    if (producto.imagen) {
      const key = new URL(producto.imagen).pathname.substring(1);
      await deleteFromS3(key);
    }

    await dynamoDB.delete({ TableName: TABLE_NAME, Key: { id } }).promise();
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

module.exports = router;
