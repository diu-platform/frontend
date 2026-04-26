import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Convert wavelength (nm) to RGB color
 */
export function wavelengthToColor(wavelength: number): { r: number; g: number; b: number } {
  let r = 0, g = 0, b = 0;
  
  if (wavelength >= 380 && wavelength < 440) {
    r = -(wavelength - 440) / (440 - 380);
    g = 0;
    b = 1;
  } else if (wavelength >= 440 && wavelength < 490) {
    r = 0;
    g = (wavelength - 440) / (490 - 440);
    b = 1;
  } else if (wavelength >= 490 && wavelength < 510) {
    r = 0;
    g = 1;
    b = -(wavelength - 510) / (510 - 490);
  } else if (wavelength >= 510 && wavelength < 580) {
    r = (wavelength - 510) / (580 - 510);
    g = 1;
    b = 0;
  } else if (wavelength >= 580 && wavelength < 645) {
    r = 1;
    g = -(wavelength - 645) / (645 - 580);
    b = 0;
  } else if (wavelength >= 645 && wavelength <= 780) {
    r = 1;
    g = 0;
    b = 0;
  }
  
  // Intensity adjustment at edges
  let intensity = 1;
  if (wavelength >= 380 && wavelength < 420) {
    intensity = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
  } else if (wavelength >= 700 && wavelength <= 780) {
    intensity = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
  }
  
  return {
    r: Math.pow(r * intensity, 0.8),
    g: Math.pow(g * intensity, 0.8),
    b: Math.pow(b * intensity, 0.8),
  };
}

/**
 * Convert wavelength to hex color string
 */
export function wavelengthToHex(wavelength: number): string {
  const { r, g, b } = wavelengthToColor(wavelength);
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Hook to get THREE.Color from wavelength
 */
export function useWavelengthColor(wavelength: number): THREE.Color {
  return useMemo(() => {
    const { r, g, b } = wavelengthToColor(wavelength);
    return new THREE.Color(r, g, b);
  }, [wavelength]);
}
