const express = require('express');
const router = express.Router();
const db = require('../models/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'tu_clave_secreta'; // Cambia esto por algo más seguro

// Ruta para registrar un usuario
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    try {
        // Verificar si el usuario ya existe
        const [existingUser] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar el nuevo usuario en la base de datos
        await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar el usuario', error });
    }
});

// Ruta para iniciar sesión (login)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = users[0];

        // Validar contraseña
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Generar token
        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token , user});
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor', error });
    }
});

module.exports = router;
