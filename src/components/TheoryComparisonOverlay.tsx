import { useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface TheoryComparisonOverlayProps {
  histogram: number[];
  theoreticalCurve: [number, number][];
  wavelength: number;
  slitDistance: number;
  slitWidth: number;
  coherence: number;
  observerOn: boolean;
  showTheory: boolean;
  showExperimental: boolean;
}

/**
 * Overlay component showing theoretical curve vs experimental histogram
 * 
 * Features:
 * - Normalized theoretical intensity curve
 * - Experimental histogram bars
 * - Difference/residual plot option
 * - Statistical comparison metrics
 */
export function TheoryComparisonOverlay({
  histogram,
  theoreticalCurve,
  wavelength,
  slitDistance,
  slitWidth,
  coherence,
  observerOn,
  showTheory = true,
  showExperimental = true,
}: TheoryComparisonOverlayProps) {
  const { t } = useLanguage();
  
  // SVG dimensions
  const width = 320;
  const height = 180;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Normalize histogram
  const normalizedHistogram = useMemo(() => {
    const maxVal = Math.max(...histogram, 1);
    return histogram.map(v => v / maxVal);
  }, [histogram]);

  // Normalize theoretical curve
  const normalizedTheory = useMemo(() => {
    if (theoreticalCurve.length === 0) return [];
    const maxVal = Math.max(...theoreticalCurve.map(p => p[1]), 0.001);
    return theoreticalCurve.map(([z, i]) => [z, i / maxVal] as [number, number]);
  }, [theoreticalCurve]);

  // Calculate goodness of fit (R²)
  const rSquared = useMemo(() => {
    if (histogram.length === 0 || normalizedTheory.length === 0) return 0;
    
    const totalParticles = histogram.reduce((a, b) => a + b, 0);
    if (totalParticles < 50) return 0; // Not enough data
    
    // Resample theory to match histogram bins
    const theoryResampled: number[] = [];
    for (let i = 0; i < histogram.length; i++) {
      const z = (i / histogram.length - 0.5) * 5; // Map to z coordinate
      // Find closest theory point
      let closest = normalizedTheory[0][1];
      let minDist = Math.abs(normalizedTheory[0][0] - z);
      for (const [tz, ti] of normalizedTheory) {
        const dist = Math.abs(tz - z);
        if (dist < minDist) {
          minDist = dist;
          closest = ti;
        }
      }
      theoryResampled.push(closest);
    }
    
    // Calculate R²
    const meanExp = normalizedHistogram.reduce((a, b) => a + b, 0) / normalizedHistogram.length;
    let ssRes = 0, ssTot = 0;
    for (let i = 0; i < normalizedHistogram.length; i++) {
      ssRes += Math.pow(normalizedHistogram[i] - theoryResampled[i], 2);
      ssTot += Math.pow(normalizedHistogram[i] - meanExp, 2);
    }
    
    if (ssTot === 0) return 1;
    return Math.max(0, 1 - ssRes / ssTot);
  }, [histogram, normalizedHistogram, normalizedTheory]);

  // Generate histogram bars path
  const histogramPath = useMemo(() => {
    if (normalizedHistogram.length === 0) return '';
    
    const barWidth = plotWidth / normalizedHistogram.length;
    let path = '';
    
    for (let i = 0; i < normalizedHistogram.length; i++) {
      const x = padding.left + i * barWidth;
      const h = normalizedHistogram[i] * plotHeight;
      const y = padding.top + plotHeight - h;
      
      if (i === 0) {
        path += `M ${x} ${padding.top + plotHeight}`;
      }
      path += ` L ${x} ${y} L ${x + barWidth} ${y}`;
    }
    path += ` L ${padding.left + plotWidth} ${padding.top + plotHeight} Z`;
    
    return path;
  }, [normalizedHistogram, plotWidth, plotHeight, padding]);

  // Generate theory curve path
  const theoryPath = useMemo(() => {
    if (normalizedTheory.length === 0) return '';
    
    const points = normalizedTheory.map(([z, i]) => {
      const x = padding.left + ((z + 2.5) / 5) * plotWidth;
      const y = padding.top + plotHeight - i * plotHeight;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  }, [normalizedTheory, plotWidth, plotHeight, padding]);

  // Get wavelength color
  const getColor = (wl: number) => {
    if (wl >= 620) return '#ff4444';
    if (wl >= 590) return '#ffaa00';
    if (wl >= 565) return '#88ff00';
    if (wl >= 495) return '#00ffaa';
    if (wl >= 450) return '#0088ff';
    return '#8844ff';
  };

  const color = getColor(wavelength);
  const totalParticles = histogram.reduce((a, b) => a + b, 0);

  return (
    <div className="bg-slate-900/95 p-3 rounded-xl border border-indigo-500/20">
      <h3 className="text-white font-semibold text-sm mb-2 flex items-center justify-between">
        <span>📈 {t('theory.comparison') || 'Theory vs Experiment'}</span>
        {totalParticles > 50 && (
          <span className={`text-xs px-2 py-0.5 rounded ${
            rSquared > 0.8 ? 'bg-green-600/30 text-green-400' :
            rSquared > 0.5 ? 'bg-yellow-600/30 text-yellow-400' :
            'bg-red-600/30 text-red-400'
          }`}>
            R² = {rSquared.toFixed(3)}
          </span>
        )}
      </h3>
      
      <svg width={width} height={height} className="w-full">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect 
          x={padding.left} 
          y={padding.top} 
          width={plotWidth} 
          height={plotHeight} 
          fill="url(#grid)"
        />
        
        {/* Experimental histogram */}
        {showExperimental && histogramPath && (
          <path
            d={histogramPath}
            fill={observerOn ? 'rgba(255,100,100,0.3)' : `${color}33`}
            stroke={observerOn ? '#ff6666' : color}
            strokeWidth="1"
          />
        )}
        
        {/* Theoretical curve */}
        {showTheory && theoryPath && !observerOn && (
          <path
            d={theoryPath}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeDasharray="4,2"
            opacity="0.8"
          />
        )}
        
        {/* Axes */}
        <line 
          x1={padding.left} y1={padding.top + plotHeight}
          x2={padding.left + plotWidth} y2={padding.top + plotHeight}
          stroke="#64748b" strokeWidth="1"
        />
        <line
          x1={padding.left} y1={padding.top}
          x2={padding.left} y2={padding.top + plotHeight}
          stroke="#64748b" strokeWidth="1"
        />
        
        {/* Y-axis label */}
        <text 
          x={padding.left - 25} 
          y={padding.top + plotHeight / 2}
          fill="#94a3b8"
          fontSize="10"
          textAnchor="middle"
          transform={`rotate(-90, ${padding.left - 25}, ${padding.top + plotHeight / 2})`}
        >
          I/I₀
        </text>
        
        {/* X-axis label */}
        <text 
          x={padding.left + plotWidth / 2} 
          y={height - 5}
          fill="#94a3b8"
          fontSize="10"
          textAnchor="middle"
        >
          z (mm)
        </text>
        
        {/* X-axis ticks */}
        {[-2, -1, 0, 1, 2].map(z => {
          const x = padding.left + ((z + 2.5) / 5) * plotWidth;
          return (
            <g key={z}>
              <line x1={x} y1={padding.top + plotHeight} x2={x} y2={padding.top + plotHeight + 4} stroke="#64748b"/>
              <text x={x} y={padding.top + plotHeight + 15} fill="#94a3b8" fontSize="9" textAnchor="middle">
                {z}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-xs">
        {showExperimental && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: observerOn ? '#ff6666' : color, opacity: 0.5 }}/>
            <span className="text-gray-400">{t('theory.experimental') || 'Experimental'}</span>
          </div>
        )}
        {showTheory && !observerOn && (
          <div className="flex items-center gap-1">
            <div className="w-4 h-0.5 bg-white" style={{ borderStyle: 'dashed' }}/>
            <span className="text-gray-400">{t('theory.theoretical') || 'Theoretical'}</span>
          </div>
        )}
      </div>
      
      {/* Parameters display */}
      <div className="mt-2 pt-2 border-t border-slate-700 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div className="text-gray-500">λ = <span className="text-gray-300">{wavelength} nm</span></div>
        <div className="text-gray-500">d = <span className="text-gray-300">{slitDistance.toFixed(2)} mm</span></div>
        <div className="text-gray-500">a = <span className="text-gray-300">{slitWidth.toFixed(3)} mm</span></div>
        <div className="text-gray-500">V = <span className="text-gray-300">{coherence}%</span></div>
      </div>
      
      {/* Fit quality message */}
      {totalParticles > 50 && (
        <div className={`mt-2 text-xs text-center ${
          rSquared > 0.8 ? 'text-green-400' :
          rSquared > 0.5 ? 'text-yellow-400' :
          'text-red-400'
        }`}>
          {rSquared > 0.8 ? '✓ Excellent fit with theory' :
           rSquared > 0.5 ? '~ Moderate agreement' :
           '✗ Poor fit - check parameters'}
        </div>
      )}
    </div>
  );
}
