// components/HeatmapSettings.tsx
/**
 * Extended heatmap settings for Research mode
 * 
 * Features:
 * - Opacity control
 * - Color scheme selection
 * - Contour lines toggle
 * - Interpolation method
 * - Dynamic range adjustment
 */

import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { ChevronDown, ChevronRight } from 'lucide-react';

export type ColorScheme = 'wavelength' | 'thermal' | 'grayscale' | 'scientific' | 'viridis' | 'plasma' | 'inferno';
export type InterpolationMethod = 'none' | 'linear' | 'cubic' | 'gaussian';

interface HeatmapSettingsProps {
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  colorScheme: ColorScheme;
  onColorSchemeChange: (scheme: ColorScheme) => void;
  showContours: boolean;
  onShowContoursChange: (show: boolean) => void;
  interpolation: InterpolationMethod;
  onInterpolationChange: (method: InterpolationMethod) => void;
  dynamicRange?: { min: number; max: number };
  onDynamicRangeChange?: (range: { min: number; max: number }) => void;
  brightness?: number;
  onBrightnessChange?: (brightness: number) => void;
  contrast?: number;
  onContrastChange?: (contrast: number) => void;
}

const COLOR_SCHEMES: { value: ColorScheme; label: string; preview: string }[] = [
  { value: 'wavelength', label: 'Wavelength', preview: 'linear-gradient(to right, #8b5cf6, #3b82f6, #22c55e, #eab308, #ef4444)' },
  { value: 'thermal', label: 'Thermal', preview: 'linear-gradient(to right, #000000, #1e3a8a, #dc2626, #fbbf24, #ffffff)' },
  { value: 'grayscale', label: 'Grayscale', preview: 'linear-gradient(to right, #000000, #ffffff)' },
  { value: 'scientific', label: 'Scientific', preview: 'linear-gradient(to right, #000033, #0000ff, #00ff00, #ffff00, #ff0000)' },
  { value: 'viridis', label: 'Viridis', preview: 'linear-gradient(to right, #440154, #414487, #2a788e, #22a884, #7ad151, #fde725)' },
  { value: 'plasma', label: 'Plasma', preview: 'linear-gradient(to right, #0d0887, #6a00a8, #b12a90, #e16462, #fca636, #f0f921)' },
  { value: 'inferno', label: 'Inferno', preview: 'linear-gradient(to right, #000004, #420a68, #932667, #dd513a, #fca50a, #fcffa4)' },
];

const INTERPOLATION_METHODS: { value: InterpolationMethod; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'Raw pixel data' },
  { value: 'linear', label: 'Linear', description: 'Smooth interpolation' },
  { value: 'cubic', label: 'Cubic', description: 'Smoother edges' },
  { value: 'gaussian', label: 'Gaussian', description: 'Blur effect' },
];

export function HeatmapSettings({
  opacity,
  onOpacityChange,
  colorScheme,
  onColorSchemeChange,
  showContours,
  onShowContoursChange,
  interpolation,
  onInterpolationChange,
  dynamicRange = { min: 0, max: 100 },
  onDynamicRangeChange,
  brightness = 100,
  onBrightnessChange,
  contrast = 100,
  onContrastChange,
}: HeatmapSettingsProps) {
  const { language } = useLanguage();
  const isRu = language === 'ru';
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-orange-500/20 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 bg-orange-900/30 flex items-center justify-between hover:bg-orange-900/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🌡️</span>
          <span className="text-sm font-semibold text-white">
            {isRu ? 'Настройки тепловой карты' : 'Heatmap Settings'}
          </span>
        </div>
        {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>
      
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Opacity */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs text-gray-400">
                {isRu ? 'Прозрачность' : 'Opacity'}
              </label>
              <span className="text-xs font-mono text-orange-300">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded cursor-pointer accent-orange-500"
            />
          </div>
          
          {/* Color Scheme */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400">
              {isRu ? 'Цветовая схема' : 'Color Scheme'}
            </label>
            <div className="grid grid-cols-4 gap-1">
              {COLOR_SCHEMES.map((scheme) => (
                <button
                  key={scheme.value}
                  onClick={() => onColorSchemeChange(scheme.value)}
                  className={`
                    relative h-8 rounded-lg overflow-hidden transition-all
                    ${colorScheme === scheme.value 
                      ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-slate-900' 
                      : 'hover:ring-1 hover:ring-gray-600'
                    }
                  `}
                  title={scheme.label}
                >
                  <div
                    className="absolute inset-0"
                    style={{ background: scheme.preview }}
                  />
                </button>
              ))}
            </div>
            <div className="text-center text-[10px] text-gray-500">
              {COLOR_SCHEMES.find(s => s.value === colorScheme)?.label}
            </div>
          </div>
          
          {/* Interpolation */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400">
              {isRu ? 'Интерполяция' : 'Interpolation'}
            </label>
            <div className="flex gap-1">
              {INTERPOLATION_METHODS.map((method) => (
                <button
                  key={method.value}
                  onClick={() => onInterpolationChange(method.value)}
                  className={`
                    flex-1 py-1.5 px-2 text-xs rounded transition-colors
                    ${interpolation === method.value
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                    }
                  `}
                  title={method.description}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Contours Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">
              {isRu ? 'Контурные линии' : 'Contour Lines'}
            </label>
            <button
              onClick={() => onShowContoursChange(!showContours)}
              className={`
                px-3 py-1 text-xs rounded-full transition-colors
                ${showContours
                  ? 'bg-orange-600 text-white'
                  : 'bg-slate-700 text-gray-400'
                }
              `}
            >
              {showContours ? 'ON' : 'OFF'}
            </button>
          </div>
          
          {/* Dynamic Range */}
          {onDynamicRangeChange && (
            <div className="space-y-2">
              <label className="text-xs text-gray-400">
                {isRu ? 'Динамический диапазон' : 'Dynamic Range'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={dynamicRange.min}
                  onChange={(e) => onDynamicRangeChange({ ...dynamicRange, min: Number(e.target.value) })}
                  className="flex-1 h-1 bg-slate-700 rounded cursor-pointer accent-blue-500"
                />
                <span className="text-[10px] text-gray-500 w-8 text-center">
                  {dynamicRange.min}%
                </span>
                <input
                  type="range"
                  min={50}
                  max={100}
                  value={dynamicRange.max}
                  onChange={(e) => onDynamicRangeChange({ ...dynamicRange, max: Number(e.target.value) })}
                  className="flex-1 h-1 bg-slate-700 rounded cursor-pointer accent-red-500"
                />
                <span className="text-[10px] text-gray-500 w-8 text-center">
                  {dynamicRange.max}%
                </span>
              </div>
            </div>
          )}
          
          {/* Brightness & Contrast */}
          {(onBrightnessChange || onContrastChange) && (
            <div className="grid grid-cols-2 gap-3">
              {onBrightnessChange && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-[10px] text-gray-500">
                      {isRu ? 'Яркость' : 'Brightness'}
                    </label>
                    <span className="text-[10px] text-gray-400">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={brightness}
                    onChange={(e) => onBrightnessChange(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded cursor-pointer accent-yellow-500"
                  />
                </div>
              )}
              {onContrastChange && (
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <label className="text-[10px] text-gray-500">
                      {isRu ? 'Контраст' : 'Contrast'}
                    </label>
                    <span className="text-[10px] text-gray-400">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={150}
                    value={contrast}
                    onChange={(e) => onContrastChange(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded cursor-pointer accent-purple-500"
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Info */}
          <div className="pt-2 border-t border-slate-700">
            <p className="text-[10px] text-gray-500 text-center">
              {isRu 
                ? 'Тепловая карта показывает усреднённую интенсивность — эквивалент долгой экспозиции CCD камеры'
                : 'Heatmap shows averaged intensity — equivalent to long CCD camera exposure'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
