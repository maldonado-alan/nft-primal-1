// src/app/page.tsx (o tu NftCustomizerPage.tsx)
"use client"
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface TraitVariant {
  name: string;
  imageUrl: string;
}

interface CustomizationOption {
  currentValue: string;
  variants: TraitVariant[];
}

interface CustomizationOptions {
  [traitType: string]: CustomizationOption;
}

const NFT_DISPLAY_SIZE = 500;
const THUMBNAIL_SIZE = 80;

export default function NftCustomizerPage() {
  const [nftId, setNftId] = useState('515'); // Estado actual del NFT ID
  const [inputNftId, setInputNftId] = useState('515'); // NUEVO ESTADO: Para el valor del input
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTraitSection, setActiveTraitSection] = useState<string | null>(null); 

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api';

  useEffect(() => {
    async function loadNftData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${BACKEND_URL}/nft/${nftId}/customize-options`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: CustomizationOptions = await response.json();
        setCustomizationOptions(data);

        const initialSelected: { [key: string]: string } = {};
        for (const traitType in data) {
          if (data[traitType].currentValue && data[traitType].currentValue !== 'None') {
            initialSelected[traitType] = data[traitType].currentValue;
          } else if (data[traitType].variants.length > 0) {
            initialSelected[traitType] = data[traitType].variants[0].name; // Seleccionar el primer valor por defecto
          }
        }
        setSelectedVariants(initialSelected);
        
        // Establecer la primera sección de rasgo como activa por defecto, si existen opciones
        if (Object.keys(data).length > 0) {
            setActiveTraitSection(Object.keys(data)[0]);
        }

        await generateCustomNft(initialSelected); // Generar la imagen inicial
      } catch (e: any) {
        console.error("Error loading NFT data:", e);
        setError(`Failed to load customization options: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadNftData();
  }, [nftId]); // El useEffect se re-ejecuta cuando `nftId` cambia

  const generateCustomNft = async (currentSelections: { [key: string]: string }) => {
    setError(null);
    try {
      const response = await fetch(`${BACKEND_URL}/nft/customize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nftId, selectedVariants: currentSelections }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      setGeneratedImageUrl(`${BACKEND_URL.replace('/api', '')}${data.imageUrl}`);
    } catch (e: any) {
      console.error("Error generating NFT:", e);
      setError(`Failed to generate NFT image: ${e.message}`);
    }
  };

  const handleVariantChange = async (traitType: string, newVariantName: string) => {
    const updatedVariants = { ...selectedVariants, [traitType]: newVariantName };
    setSelectedVariants(updatedVariants);
    await generateCustomNft(updatedVariants);
  };

  // NUEVA FUNCIÓN: Para manejar el click del botón "Load NFT"
  const handleLoadNft = () => {
    if (inputNftId && inputNftId !== nftId) {
      setNftId(inputNftId); // Esto disparará el useEffect para cargar el nuevo NFT
    }
  };

  if (loading) return <div className="loading-message">Cargando opciones de personalización...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!customizationOptions) return <div className="no-options-message">No se encontraron opciones de personalización.</div>;

  return (
    <div className="customizer-layout">
      <h1 className="main-title">CUSTOMIZE: PRIMAL #{nftId}</h1>
      
      {/* NUEVA SECCIÓN: Input para el ID del NFT y botón */}
      <div className="nft-id-input-section">
        <input 
          type="text" 
          value={inputNftId} 
          onChange={(e) => setInputNftId(e.target.value)} 
          placeholder="Enter NFT ID"
          className="nft-id-input"
        />
        <button onClick={handleLoadNft} className="load-nft-button">Load NFT</button>
      </div>

      <div className="content-area">
        {/* Columna izquierda: NFT principal y botones */}
        <div className="left-column">
          <div className="nft-display-wrapper">
            {generatedImageUrl ? (
              <Image 
                src={generatedImageUrl} 
                alt={`Customized NFT ${nftId}`} 
                width={NFT_DISPLAY_SIZE} 
                height={NFT_DISPLAY_SIZE} 
                className="nft-image-main" 
              />
            ) : (
              <div className="nft-placeholder-main" style={{ width: NFT_DISPLAY_SIZE, height: NFT_DISPLAY_SIZE }}>
                Cargando NFT...
              </div>
            )}
          </div>
          <div className="action-buttons">
            <button className="action-button">EXPORT GIF</button>
            <button className="action-button">SUBMIT</button>
          </div>
        </div> {/* Fin left-column */}

        {/* Columna derecha: Selectores de Trait y Área de Miniaturas */}
        <div className="right-column">
          <div className="trait-category-selector">
            {Object.keys(customizationOptions).map((traitType) => (
              <div 
                key={traitType} 
                className={`trait-category-item ${activeTraitSection === traitType ? 'active' : ''}`}
                onClick={() => setActiveTraitSection(traitType)}
              >
                <span className="trait-type-name">{traitType.toUpperCase()}</span>
                <span className="selected-trait-value">{selectedVariants[traitType] || 'None'}</span>
              </div>
            ))}
          </div>

          <div className="trait-variants-display-area">
            {activeTraitSection && customizationOptions[activeTraitSection] ? (
              <div className="variants-grid">
                {customizationOptions[activeTraitSection].variants.map((variant) => (
                  <div 
                    key={variant.name} 
                    className={`variant-item ${selectedVariants[activeTraitSection] === variant.name ? 'selected' : ''}`}
                    onClick={() => handleVariantChange(activeTraitSection, variant.name)}
                  >
                    <Image 
                      src={`${BACKEND_URL.replace('/api', '')}${variant.imageUrl}`}
                      alt={variant.name} 
                      width={THUMBNAIL_SIZE} 
                      height={THUMBNAIL_SIZE} 
                      className="variant-thumbnail"
                    />
                    <p className="variant-name">{variant.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-trait-selected">Selecciona un tipo de rasgo para ver las opciones.</div>
            )}
          </div>
        </div> {/* Fin right-column */}
      </div> {/* Fin content-area */}
    </div>
  );
}
