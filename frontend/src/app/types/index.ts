// src/types/index.ts

export interface TraitVariant {
  name: string;
  imageUrl: string;
}

export interface TraitOptions {
  currentValue: string;
  variants: TraitVariant[];
}

export interface CustomizationOptions {
  [traitType: string]: TraitOptions; // Ej: { "Background": { ... }, "Hat": { ... } }
}

export interface GenerateImageResponse {
  imageUrl: string;
}