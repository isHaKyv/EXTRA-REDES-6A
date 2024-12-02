const express = require('express');
const router = express.Router();
const db = require('../models/database');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'DIEGO1234'; // Cambia esto por algo más seguro

// Middleware para verificar el token
const authenticate = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.id; // Guardar el ID del usuario en el request
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token inválido' });
    }
};

// Ruta para obtener todos los productos, incluyendo el creador
router.get('/', async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.id, p.name, p.price, p.created_at, u.username AS created_by
            FROM products p
            INNER JOIN users u ON p.user_id = u.id
        `);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos', error });
    }
});

// Ruta para obtener los productos del usuario autenticado
router.get('/my-products', async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT id, name, price, created_at
            FROM products
            WHERE user_id = ?
        `, [req.userId]);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los productos del usuario', error });
    }
});

// Ruta para agregar un producto (relacionado con el usuario autenticado)
router.post('/', async (req, res) => {
    const { name, price , userId } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    try {
        await db.query('INSERT INTO products (name, price, user_id) VALUES (?, ?, ?)', [name, price, userId]);
        res.status(201).json({ message: 'Producto agregado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al agregar el producto', error });
    }
});

// Ruta para eliminar un producto (solo por el creador)
router.delete('/:id', async (req, res) => {
    const productId = req.params.id;

    try {
        const [result] = await db.query('DELETE FROM products WHERE id = ? AND user_id = ?', [productId, req.userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado o no autorizado para eliminarlo' });
        }
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el producto', error });
    }
});

// Ruta para actualizar un producto (solo por el creador)
router.put('/:id', async (req, res) => {
    const productId = req.params.id;
    const { name, price } = req.body;

    if (!name || !price) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    try {
        const [result] = await db.query(`
            UPDATE products 
            SET name = ?, price = ?
            WHERE id = ? AND user_id = ?
        `, [name, price, productId, req.userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Producto no encontrado o no autorizado para actualizarlo' });
        }

        res.json({ message: 'Producto actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el producto', error });
    }
});

module.exports = router;
