const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');

dotenv.config();
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
