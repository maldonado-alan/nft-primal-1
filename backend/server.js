const express = require('express');
const cors = require('cors');
const nftRoutes = require('./routes/nftRoutes');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuración de CORS más permisiva para depuración
app.use(cors({
  origin: '*', // Permite solicitudes de cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Permite todos los métodos comunes
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite estos encabezados
}));

app.use(express.json());

const GENERATED_IMAGES_PATH = path.join(__dirname, 'generated_images');
if (!fs.existsSync(GENERATED_IMAGES_PATH)) {
    fs.mkdirSync(GENERATED_IMAGES_PATH);
}
app.use('/generated-images', express.static(GENERATED_IMAGES_PATH));

const ASSETS_PATH = path.join(__dirname, 'assets');
app.use('/assets', express.static(ASSETS_PATH));

app.use('/api/nft', nftRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});