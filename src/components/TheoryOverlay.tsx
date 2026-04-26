// components/TheoryOverlay.tsx
import { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { TrendingUp, Eye, EyeOff, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { DoubleSlitStats, DoubleSlitParams } from '../simulations/DoubleSlit';

interface TheoryOverlayProps {
  stats: DoubleSlitStats;
  params: DoubleSlitParams;
}

export function TheoryOverlay({ stats, params }: TheoryOverlayProps) {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(true);
  const [showTheory, setShowTheory] = useState(true);
  const [showEnvelope, setShowEnvelope] = useState(false);
  
  const labels = {
    title: lang === 'ru' ? '📈 Сравнение с теорией' : '📈 Theory Comparison',
    showTheory: lang === 'ru' ? 'Теоретическая кривая' : 'Theoretical curve',
    showEnvelope: lang === 'ru' ? 'Огибающая (дифракция)' : 'Envelope (diffraction)',
    match: lang === 'ru' ? 'Совпадение' : 'Match',
    formula: lang === 'ru' ? 'Формула интенсивности' : 'Intensity formula',
    experimental: lang === 'ru' ? 'Эксперимент' : 'Experiment',
    theoretical: lang === 'ru' ? 'Теория' : 'Theory',
    deviation: lang === 'ru' ? 'Отклонение' : 'Deviation',
  };

  // Calculate theoretical distribution
  const theoreticalData = useMemo(() => {
    const bins = 50;
    const screenWidth = 7;
    const L = 8; // Distance to screen
    const d = params.slitDistance; // mm
    const lambda = params.wavelength / 1000; // nm -> μm
    const slitWidth = 0.1; // Effective slit width
    
    const theory: number[] = [];
    const envelope: number[] = [];
    
    for (let i = 0; i < bins; i++) {
      const z = ((i / bins) - 0.5) * screenWidth;
      
      // Phase difference for double-slit interference
      const phaseDiff = (2 * Math.PI * d * Math.abs(z)) / (lambda * L * 0.1);
      
      // Interference pattern: cos²(δ/2)
      const interference = Math.pow(Math.cos(phaseDiff / 2), 2);
      
      // Single-slit diffraction envelope
      const beta = (Math.PI * slitWidth * z) / (lambda * L * 0.5);
      const envelopeVal = z === 0 ? 1 : Math.pow(Math.sin(beta) / beta, 2);
      
      theory.push(interference * Math.max(0.1, envelopeVal));
      envelope.push(Math.max(0.1, envelopeVal));
    }
    
    // Normalize
    const maxTheory = Math.max(...theory);
    const maxEnvelope = Math.max(...envelope);
    
    return {
      theory: theory.map(v => v / maxTheory),
      envelope: envelope.map(v => v / maxEnvelope),
    };
  }, [params.wavelength, params.slitDistance]);

  // Calculate match percentage
  const matchPercentage = useMemo(() => {
    if (stats.totalParticles < 50) return null;
    
    const maxHist = Math.max(...stats.histogram, 1);
    const normalizedHist = stats.histogram.map(v => v / maxHist);
    
    // Calculate correlation coefficient
    let sumXY = 0, sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0;
    const n = normalizedHist.length;
    
    for (let i = 0; i < n; i++) {
      const x = normalizedHist[i];
      const y = theoreticalData.theory[i];
      sumXY += x * y;
      sumX += x;
      sumY += y;
      sumX2 += x * x;
      sumY2 += y * y;
    }
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0) return 0;
    
    const correlation = numerator / denominator;
    return Math.max(0, Math.round(correlation * 100));
  }, [stats.histogram, stats.totalParticles, theoreticalData.theory]);

  // Prepare combined chart data
  const chartData = useMemo(() => {
    const maxHist = Math.max(...stats.histogram, 1);
    return stats.histogram.map((count, i) => ({
      experimental: (count / maxHist) * 100,
      theory: theoreticalData.theory[i] * 100,
      envelope: theoreticalData.envelope[i] * 100,
    }));
  }, [stats.histogram, theoreticalData]);

  return (
    <div className="bg-emerald-900/60 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-emerald-500/30">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-emerald-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-400" />
          {labels.title}
        </h3>
        {expanded ? <ChevronUp size={20} className="text-emerald-300" /> : <ChevronDown size={20} className="text-emerald-300" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowTheory(!showTheory)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                showTheory 
                  ? 'bg-purple-500/40 text-purple-200 border border-purple-400/40' 
                  : 'bg-emerald-800/40 text-emerald-300 border border-emerald-700/30'
              }`}
            >
              {showTheory ? <Eye size={14} /> : <EyeOff size={14} />}
              {labels.showTheory}
            </button>
            
            <button
              onClick={() => setShowEnvelope(!showEnvelope)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                showEnvelope 
                  ? 'bg-yellow-500/40 text-yellow-200 border border-yellow-400/40' 
                  : 'bg-emerald-800/40 text-emerald-300 border border-emerald-700/30'
              }`}
            >
              {showEnvelope ? <Eye size={14} /> : <EyeOff size={14} />}
              {labels.showEnvelope}
            </button>
          </div>

          {/* Combined chart */}
          <div className="bg-emerald-950/50 rounded-lg p-3">
            <div className="flex items-end gap-px h-24 relative">
              {chartData.map((data, i) => (
                <div key={i} className="flex-1 relative h-full flex items-end">
                  {/* Experimental (main) */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-t transition-all ${
                      params.observerOn ? 'bg-orange-400/60' : 'bg-cyan-400/60'
                    }`}
                    style={{ height: `${data.experimental}%` }}
                  />
                  
                  {/* Theoretical curve */}
                  {showTheory && (
                    <div
                      className="absolute bottom-0 left-1/4 right-1/4 bg-purple-400 rounded-full"
                      style={{ 
                        height: '3px',
                        bottom: `${data.theory}%`,
                      }}
                    />
                  )}
                  
                  {/* Envelope */}
                  {showEnvelope && (
                    <div
                      className="absolute bottom-0 left-1/4 right-1/4 bg-yellow-400/80 rounded-full"
                      style={{ 
                        height: '2px',
                        bottom: `${data.envelope}%`,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex justify-center gap-4 mt-2 text-xs">
              <span className={`flex items-center gap-1 ${params.observerOn ? 'text-orange-300' : 'text-cyan-300'}`}>
                <span className={`w-3 h-2 rounded ${params.observerOn ? 'bg-orange-400' : 'bg-cyan-400'}`} />
                {labels.experimental}
              </span>
              {showTheory && (
                <span className="flex items-center gap-1 text-purple-300">
                  <span className="w-3 h-0.5 bg-purple-400 rounded" />
                  {labels.theoretical}
                </span>
              )}
              {showEnvelope && (
                <span className="flex items-center gap-1 text-yellow-300">
                  <span className="w-3 h-0.5 bg-yellow-400 rounded" />
                  Envelope
                </span>
              )}
            </div>
          </div>

          {/* Match percentage */}
          {matchPercentage !== null && !params.observerOn && (
            <div className="bg-emerald-800/40 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-emerald-200">{labels.match}:</span>
                <span className={`text-lg font-bold ${
                  matchPercentage >= 80 ? 'text-green-400' :
                  matchPercentage >= 60 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {matchPercentage}%
                </span>
              </div>
              <div className="w-full bg-emerald-900 rounded-full h-2">
                <div
                  className={`h-full rounded-full transition-all ${
                    matchPercentage >= 80 ? 'bg-green-500' :
                    matchPercentage >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${matchPercentage}%` }}
                />
              </div>
              <p className="text-xs text-emerald-400 mt-2">
                {matchPercentage >= 80 
                  ? (lang === 'ru' ? '✓ Отличное соответствие теории!' : '✓ Excellent match with theory!')
                  : matchPercentage >= 60
                  ? (lang === 'ru' ? '○ Хорошее соответствие. Соберите больше данных.' : '○ Good match. Collect more data.')
                  : (lang === 'ru' ? '✗ Слабое соответствие. Проверьте параметры.' : '✗ Weak match. Check parameters.')}
              </p>
            </div>
          )}

          {/* Formula reminder */}
          <div className="bg-emerald-800/30 rounded-lg p-2 flex items-start gap-2">
            <Info size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-emerald-300">
              <span className="font-medium">{labels.formula}:</span>
              <div className="font-mono mt-1 text-emerald-200">
                I(z) = I₀ · cos²(πdz/λL) · sinc²(πaz/λL)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
