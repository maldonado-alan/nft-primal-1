const axios = require('axios');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const METADATA_BASE_URL = 'https://ipfs.primalcult.xyz/metadata/';
const ASSETS_PATH = path.join(__dirname, '../assets');
const GENERATED_IMAGES_PATH = path.join(__dirname, '../generated_images');
const NFT_WIDTH = 2000;
const NFT_HEIGHT = 2000;

// Get metadata
async function getNftMetadata(nftId) {
  try {
    const { data } = await axios.get(`${METADATA_BASE_URL}${nftId}`);
    return data;
  } catch (err) {
    console.error(`[ERROR] No metadata for NFT ${nftId} →`, err.message);
    return null;
  }
}

// Find trait variants
function getTraitVariants(traitType, traitValue) {
  const dir = path.join(ASSETS_PATH, 'traits', traitType, traitValue);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.png') || f.endsWith('.gif'));
}

// GET customize-options
async function getCustomizationOptions(req, res) {
  const { nftId } = req.params;
  const metadata = await getNftMetadata(nftId);
  if (!metadata) return res.status(404).json({ error: 'Metadata not found' });

  const customizationOptions = {};
  const traitTypes = fs.readdirSync(path.join(ASSETS_PATH, 'traits'))
    .filter(d => fs.statSync(path.join(ASSETS_PATH, 'traits', d)).isDirectory());

  for (const traitType of traitTypes) {
    const typeDir = path.join(ASSETS_PATH, 'traits', traitType);
    const values = fs.readdirSync(typeDir).filter(f => fs.statSync(path.join(typeDir, f)).isDirectory());
    const variants = [];

    for (const val of values) {
      const files = getTraitVariants(traitType, val);
      if (files.length > 0) {
        variants.push({ name: val, imageUrl: `/assets/traits/${traitType}/${val}/${files[0]}` });
      }
    }

    const current = metadata.attributes.find(a => a.trait_type === traitType)?.value || 'None';
    customizationOptions[traitType] = { currentValue: current, variants };
  }

  res.json(customizationOptions);
}

// POST generate image (SHARP version)
async function generateAndSaveNftImage(req, res) {
  const { nftId, selectedVariants } = req.body;
  if (!nftId || !selectedVariants) return res.status(400).json({ error: 'Missing params' });

  const layerOrder = ['BACKGROUND', 'FUR', 'TUNIC', 'FACE', 'EYES', 'HAT', 'EFFECT'];

  const layers = [];

  for (const traitType of layerOrder) {
    const value = selectedVariants[traitType];
    if (!value || value === 'None') continue;

    const variantDir = path.join(ASSETS_PATH, 'traits', traitType, value);
    if (!fs.existsSync(variantDir)) continue;

    const files = getTraitVariants(traitType, value);
    if (files.length === 0) continue;

    const imgPath = path.join(variantDir, files[0]);
    if (!fs.existsSync(imgPath)) continue;

    try {
      layers.push({ input: imgPath, top: 0, left: 0 });
    } catch (err) {
      console.error(`[ERROR] Loading ${imgPath} →`, err.message);
    }
  }

  if (!fs.existsSync(GENERATED_IMAGES_PATH)) fs.mkdirSync(GENERATED_IMAGES_PATH, { recursive: true });

  const fileName = `custom_${nftId}_${Date.now()}.png`;
  const outputPath = path.join(GENERATED_IMAGES_PATH, fileName);

  try {
    await sharp({
      create: {
        width: NFT_WIDTH,
        height: NFT_HEIGHT,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite(layers)
    .png()
    .toFile(outputPath);
  } catch (err) {
    return res.status(500).json({ error: 'Image generation failed', detail: err.message });
  }

  res.json({ imageUrl: `/generated-images/${fileName}` });
}

module.exports = {
  getCustomizationOptions,
  generateAndSaveNftImage,
};
