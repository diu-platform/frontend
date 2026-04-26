import { useCallback, useMemo } from 'react';

/**
 * Advanced interference calculations with full physical model
 * 
 * Based on Optica Publishing Group research:
 * - Pearson et al. 2018: Slit-width effects
 * - Hong & Noh 1998: Two-photon interference
 * - "What is the maximum attainable visibility": Partial coherence
 * 
 * Full formula with all corrections:
 * I(θ) = I₀ · V · cos²(πd·sinθ/λ) · sinc²(πa·sinθ/λ) · G(θ)
 * 
 * Where:
 * - V = visibility/coherence factor (0 to 1)
 * - sinc² = single-slit diffraction envelope
 * - G(θ) = Gaussian beam profile envelope
 */

export interface InterferenceParams {
  wavelength: number;      // nm
  slitDistance: number;    // mm
  slitWidth: number;       // mm
  barrierThickness: number; // mm (affects angular selection)
  coherence: number;       // 0-100%
  beamWidth: number;       // mm (Gaussian beam 1/e² width)
  screenDistance: number;  // arbitrary units (default 8)
}

export function useInterference(
  wavelength: number, 
  slitDistance: number,
  slitWidth: number = 0.05,
  coherence: number = 100,      // Source coherence 0-100%
  beamWidth: number = 2.0,      // Gaussian beam width
  screenDistance: number = 8,   // Adjustable screen distance
  barrierThickness: number = 0.1 // Barrier thickness (affects angular cutoff)
) {
  // Convert to consistent units
  const lambda = wavelength / 1000; // nm to μm
  const d = slitDistance;           // mm
  const a = slitWidth;              // mm
  const t = barrierThickness;       // mm - barrier thickness
  const V = coherence / 100;        // Visibility factor 0-1
  const w = beamWidth;              // Gaussian beam 1/e² width
  const L = screenDistance;
  
  // Maximum angle allowed through thick slit: θ_max = arctan(a/t)
  const maxAngle = Math.atan(a / Math.max(0.01, t));
  
  // Fringe spacing
  const fringeSpacing = useMemo(() => {
    return (lambda / d) * 2.5;
  }, [lambda, d]);

  /**
   * Sinc function: sin(x)/x with proper handling of x=0
   */
  const sinc = useCallback((x: number): number => {
    if (Math.abs(x) < 1e-10) return 1;
    return Math.sin(x) / x;
  }, []);

  /**
   * Gaussian envelope for beam profile
   * G(z) = exp(-2(z/w)²)
   * 
   * Based on: "Single-photon interference" - beam diameter 4.14 μm
   */
  const gaussianEnvelope = useCallback((z: number): number => {
    return Math.exp(-2 * Math.pow(z / w, 2));
  }, [w]);

  /**
   * Angular cutoff function for thick barrier
   * Models the collimation effect: thick slits block large angles
   * Uses smooth transition near cutoff angle
   */
  const angularCutoff = useCallback((z: number): number => {
    const theta = Math.atan(Math.abs(z) / (L * 0.5));
    if (theta < maxAngle * 0.8) return 1;
    if (theta > maxAngle) return 0;
    // Smooth transition
    const x = (theta - maxAngle * 0.8) / (maxAngle * 0.2);
    return 1 - x * x;
  }, [L, maxAngle]);

  /**
   * Calculate full intensity at position z
   * Includes all physical effects including barrier thickness
   */
  const getIntensity = useCallback((z: number): number => {
    const sinTheta = z / (L * 0.5);
    
    // 1. Two-slit interference with partial coherence
    // I = (1 + V·cos(δ))/2 where V is visibility
    const interferencePhase = Math.PI * d * sinTheta / lambda;
    const interference = 0.5 + 0.5 * V * Math.cos(2 * interferencePhase);
    
    // 2. Single-slit diffraction envelope
    const diffractionPhase = Math.PI * a * sinTheta / lambda;
    const envelope = Math.pow(sinc(diffractionPhase), 2);
    
    // 3. Gaussian beam profile
    const gaussian = gaussianEnvelope(z);
    
    // 4. Angular cutoff from barrier thickness
    const angular = angularCutoff(z);
    
    // Combined intensity
    return interference * envelope * gaussian * angular;
  }, [lambda, d, a, V, L, sinc, gaussianEnvelope, angularCutoff]);

  /**
   * Get random position following full interference probability distribution
   * Uses rejection sampling
   */
  const getInterferencePosition = useCallback(() => {
    const screenWidth = 5;
    const maxAttempts = 100;
    
    for (let i = 0; i < maxAttempts; i++) {
      const z = (Math.random() - 0.5) * screenWidth;
      
      const probability = getIntensity(z);
      // Add small floor to prevent complete dark regions
      const normalizedProb = 0.03 + 0.97 * probability;
      
      if (Math.random() < normalizedProb) {
        return z;
      }
    }
    
    // Fallback
    const fringeIndex = Math.floor(Math.random() * 7) - 3;
    return fringeIndex * fringeSpacing * (0.8 + Math.random() * 0.4);
  }, [getIntensity, fringeSpacing]);

  /**
   * Get theoretical intensity curve for overlay
   * Returns array of [z, intensity] pairs
   */
  const getTheoreticalCurve = useCallback((numPoints: number = 100): [number, number][] => {
    const screenWidth = 5;
    const curve: [number, number][] = [];
    
    for (let i = 0; i < numPoints; i++) {
      const z = (i / (numPoints - 1) - 0.5) * screenWidth;
      curve.push([z, getIntensity(z)]);
    }
    
    return curve;
  }, [getIntensity]);

  /**
   * Calculate expected number of visible fringes
   * Based on envelope width and fringe spacing
   */
  const getExpectedFringes = useCallback((): number => {
    // First zero of sinc at a·sinθ = λ → sinθ = λ/a
    // Number of fringes within central lobe ≈ 2·(d/a) + 1
    const centralLobeFringes = Math.floor(2 * d / a) + 1;
    
    // Also limited by Gaussian envelope
    // Effective width ≈ w at 1/e²
    const gaussianLimitedFringes = Math.floor(w / fringeSpacing);
    
    return Math.max(1, Math.min(15, Math.min(centralLobeFringes, gaussianLimitedFringes)));
  }, [d, a, w, fringeSpacing]);

  /**
   * Calculate theoretical visibility/contrast
   * V = (Imax - Imin) / (Imax + Imin)
   */
  const getTheoreticalVisibility = useCallback((): number => {
    // For partially coherent source, max visibility is V
    // But also limited by diffraction envelope ratio
    return V;
  }, [V]);

  return { 
    getInterferencePosition, 
    getIntensity,
    getTheoreticalCurve,
    getExpectedFringes,
    getTheoreticalVisibility,
    fringeSpacing,
    // Expose parameters for UI display
    params: {
      wavelength,
      slitDistance,
      slitWidth,
      barrierThickness,
      coherence,
      beamWidth,
      screenDistance,
    }
  };
}

/**
 * Count interference fringes (peaks) in histogram
 * Improved algorithm with adaptive thresholds
 */
export function calculateFringeCount(histogram: number[]): number {
  if (!histogram || histogram.length === 0) return 0;
  
  const total = histogram.reduce((a, b) => a + b, 0);
  if (total < 20) return 0;
  
  const maxVal = Math.max(...histogram);
  if (maxVal === 0) return 0;
  
  const normalized = histogram.map(v => v / maxVal);
  const smoothed = smoothHistogram(normalized, 3);
  
  // Adaptive threshold based on data quality
  const avgValue = smoothed.reduce((a, b) => a + b, 0) / smoothed.length;
  const minHeight = Math.max(0.1, avgValue * 0.5);
  
  const peaks: number[] = [];
  
  for (let i = 2; i < smoothed.length - 2; i++) {
    const isLocalMax = smoothed[i] > smoothed[i - 1] && 
                       smoothed[i] > smoothed[i + 1];
    const isAboveThreshold = smoothed[i] > minHeight;
    const isWiderPeak = smoothed[i] >= smoothed[i - 2] && 
                        smoothed[i] >= smoothed[i + 2];
    
    if (isLocalMax && isAboveThreshold && isWiderPeak) {
      const localAvg = (smoothed[i - 2] + smoothed[i - 1] + smoothed[i + 1] + smoothed[i + 2]) / 4;
      const prominence = smoothed[i] - localAvg;
      
      if (prominence > smoothed[i] * 0.08 || smoothed[i] > 0.4) {
        peaks.push(i);
      }
    }
  }
  
  // Merge close peaks
  const minDistance = 3;
  const filteredPeaks: number[] = [];
  for (const peak of peaks) {
    if (filteredPeaks.length === 0 || peak - filteredPeaks[filteredPeaks.length - 1] >= minDistance) {
      filteredPeaks.push(peak);
    } else {
      const lastIdx = filteredPeaks.length - 1;
      if (smoothed[peak] > smoothed[filteredPeaks[lastIdx]]) {
        filteredPeaks[lastIdx] = peak;
      }
    }
  }
  
  return filteredPeaks.length;
}

/**
 * Calculate interference contrast (visibility)
 * V = (Imax - Imin) / (Imax + Imin)
 */
export function calculateContrast(histogram: number[]): number {
  if (!histogram || histogram.length === 0) return 0;
  
  const total = histogram.reduce((a, b) => a + b, 0);
  if (total < 30) return 0;
  
  const maxVal = Math.max(...histogram);
  if (maxVal === 0) return 0;
  
  const normalized = histogram.map(v => v / maxVal);
  const smoothed = smoothHistogram(normalized, 2);
  
  const margin = Math.floor(smoothed.length * 0.1);
  const central = smoothed.slice(margin, smoothed.length - margin);
  
  const max = Math.max(...central);
  const minThreshold = max * 0.05;
  const validValues = central.filter(v => v > minThreshold);
  const min = validValues.length > 0 ? Math.min(...validValues) : 0;
  
  if (max + min === 0) return 0;
  
  const contrast = (max - min) / (max + min);
  return Math.max(0, Math.min(1, contrast));
}

/**
 * Calculate mean position (centroid)
 */
export function calculateMean(histogram: number[]): number {
  const total = histogram.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  
  let sum = 0;
  for (let i = 0; i < histogram.length; i++) {
    sum += i * histogram[i];
  }
  return sum / total;
}

/**
 * Calculate standard deviation
 */
export function calculateStdDev(histogram: number[]): number {
  const total = histogram.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  
  const mean = calculateMean(histogram);
  let variance = 0;
  for (let i = 0; i < histogram.length; i++) {
    variance += histogram[i] * Math.pow(i - mean, 2);
  }
  return Math.sqrt(variance / total);
}

/**
 * Calculate skewness (asymmetry)
 */
export function calculateSkewness(histogram: number[]): number {
  const total = histogram.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  
  const mean = calculateMean(histogram);
  const std = calculateStdDev(histogram);
  if (std === 0) return 0;
  
  let skew = 0;
  for (let i = 0; i < histogram.length; i++) {
    skew += histogram[i] * Math.pow((i - mean) / std, 3);
  }
  return skew / total;
}

/**
 * Calculate kurtosis (tailedness)
 */
export function calculateKurtosis(histogram: number[]): number {
  const total = histogram.reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  
  const mean = calculateMean(histogram);
  const std = calculateStdDev(histogram);
  if (std === 0) return 0;
  
  let kurt = 0;
  for (let i = 0; i < histogram.length; i++) {
    kurt += histogram[i] * Math.pow((i - mean) / std, 4);
  }
  return kurt / total - 3; // Excess kurtosis
}

/**
 * Simple moving average smoothing
 */
function smoothHistogram(histogram: number[], radius: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < histogram.length; i++) {
    let sum = 0;
    let count = 0;
    
    for (let j = Math.max(0, i - radius); j <= Math.min(histogram.length - 1, i + radius); j++) {
      sum += histogram[j];
      count++;
    }
    
    result.push(sum / count);
  }
  
  return result;
}

/**
 * Get expected fringe count based on parameters
 */
export function getExpectedFringeCount(
  wavelength: number, 
  slitDistance: number, 
  slitWidth: number = 0.05,
  screenWidth: number = 5
): number {
  const lambda = wavelength / 1000;
  const approxCount = Math.floor((slitDistance * screenWidth) / (lambda * 8 * 0.5));
  const envelopeLimit = Math.floor(slitDistance / slitWidth) * 2 + 1;
  return Math.max(1, Math.min(15, Math.min(approxCount, envelopeLimit)));
}
