// components/AdvancedStats.tsx
import { useMemo, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { BarChart3, ChevronDown, ChevronUp, Sigma, Activity, Zap } from 'lucide-react';
import type { DoubleSlitStats, DoubleSlitParams } from '../simulations/DoubleSlit';

interface AdvancedStatsProps {
  stats: DoubleSlitStats;
  params: DoubleSlitParams;
}

export function AdvancedStats({ stats, params }: AdvancedStatsProps) {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(true);
  
  const labels = {
    title: lang === 'ru' ? '🔬 Расширенная статистика' : '🔬 Advanced Statistics',
    peakAnalysis: lang === 'ru' ? 'Анализ пиков' : 'Peak Analysis',
    distribution: lang === 'ru' ? 'Распределение' : 'Distribution',
    theoretical: lang === 'ru' ? 'Теоретические' : 'Theoretical',
    measured: lang === 'ru' ? 'Измеренные' : 'Measured',
    mean: lang === 'ru' ? 'Среднее' : 'Mean',
    std: lang === 'ru' ? 'Ст. откл.' : 'Std. Dev.',
    skewness: lang === 'ru' ? 'Асимметрия' : 'Skewness',
    kurtosis: lang === 'ru' ? 'Эксцесс' : 'Kurtosis',
    peakPositions: lang === 'ru' ? 'Позиции пиков' : 'Peak Positions',
    fringeSpacing: lang === 'ru' ? 'Расстояние между полосами' : 'Fringe Spacing',
    expectedFringes: lang === 'ru' ? 'Ожидаемые полосы' : 'Expected Fringes',
    centralMax: lang === 'ru' ? 'Центральный максимум' : 'Central Maximum',
    signalToNoise: lang === 'ru' ? 'Сигнал/Шум' : 'Signal/Noise',
  };

  // Calculate advanced statistics
  const advancedMetrics = useMemo(() => {
    const histogram = stats.histogram;
    const total = histogram.reduce((a, b) => a + b, 0);
    if (total < 30) return null;

    const screenWidth = 7;
    const bins = histogram.length;
    
    // Normalize histogram
    const maxVal = Math.max(...histogram);
    const normalized = histogram.map(v => v / maxVal);
    
    // Calculate mean position
    let mean = 0;
    histogram.forEach((count, i) => {
      const z = ((i / bins) - 0.5) * screenWidth;
      mean += z * count;
    });
    mean /= total;
    
    // Calculate standard deviation
    let variance = 0;
    histogram.forEach((count, i) => {
      const z = ((i / bins) - 0.5) * screenWidth;
      variance += count * Math.pow(z - mean, 2);
    });
    variance /= total;
    const std = Math.sqrt(variance);
    
    // Calculate skewness
    let skewSum = 0;
    histogram.forEach((count, i) => {
      const z = ((i / bins) - 0.5) * screenWidth;
      skewSum += count * Math.pow((z - mean) / std, 3);
    });
    const skewness = skewSum / total;
    
    // Calculate kurtosis
    let kurtSum = 0;
    histogram.forEach((count, i) => {
      const z = ((i / bins) - 0.5) * screenWidth;
      kurtSum += count * Math.pow((z - mean) / std, 4);
    });
    const kurtosis = (kurtSum / total) - 3; // Excess kurtosis
    
    // Find peak positions
    const peaks: { bin: number; z: number; height: number }[] = [];
    const smoothed = smoothHistogram(normalized, 2);
    
    for (let i = 2; i < smoothed.length - 2; i++) {
      if (smoothed[i] > 0.15 &&
          smoothed[i] > smoothed[i-1] && 
          smoothed[i] > smoothed[i+1] &&
          smoothed[i] >= smoothed[i-2] &&
          smoothed[i] >= smoothed[i+2]) {
        const z = ((i / bins) - 0.5) * screenWidth;
        peaks.push({ bin: i, z, height: smoothed[i] });
      }
    }
    
    // Filter close peaks
    const filteredPeaks = peaks.filter((peak, idx) => {
      if (idx === 0) return true;
      return peak.bin - peaks[idx-1].bin >= 3;
    });
    
    // Calculate fringe spacing (average distance between peaks)
    let fringeSpacing = 0;
    if (filteredPeaks.length >= 2) {
      for (let i = 1; i < filteredPeaks.length; i++) {
        fringeSpacing += Math.abs(filteredPeaks[i].z - filteredPeaks[i-1].z);
      }
      fringeSpacing /= (filteredPeaks.length - 1);
    }
    
    // Theoretical fringe spacing
    const lambda = params.wavelength / 1000; // nm -> μm
    const d = params.slitDistance; // mm
    const L = 8; // screen distance
    const theoreticalSpacing = (lambda * L * 0.1) / d;
    
    // Expected number of fringes
    const expectedFringes = Math.floor(screenWidth / theoreticalSpacing);
    
    // Central maximum intensity (bin 25)
    const centralBin = Math.floor(bins / 2);
    const centralIntensity = normalized[centralBin];
    
    // Signal to noise ratio
    const signalMax = Math.max(...normalized.slice(5, bins-5));
    const noiseFloor = normalized.slice(0, 3).concat(normalized.slice(-3)).reduce((a,b) => a+b, 0) / 6;
    const snr = noiseFloor > 0 ? signalMax / noiseFloor : 0;
    
    return {
      mean,
      std,
      skewness,
      kurtosis,
      peaks: filteredPeaks,
      fringeSpacing,
      theoreticalSpacing,
      expectedFringes,
      centralIntensity,
      snr,
    };
  }, [stats.histogram, params.wavelength, params.slitDistance]);

  if (!advancedMetrics) {
    return (
      <div className="bg-emerald-900/60 backdrop-blur-md rounded-xl p-4 shadow-lg border border-emerald-500/30">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 size={20} className="text-emerald-400" />
          {labels.title}
        </h3>
        <p className="text-sm text-emerald-400/70 mt-2">
          {lang === 'ru' ? 'Недостаточно данных (мин. 30 частиц)' : 'Not enough data (min. 30 particles)'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-emerald-900/60 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-emerald-500/30">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-emerald-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <BarChart3 size={20} className="text-emerald-400" />
          {labels.title}
        </h3>
        {expanded ? <ChevronUp size={20} className="text-emerald-300" /> : <ChevronDown size={20} className="text-emerald-300" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Distribution metrics */}
          <div className="bg-emerald-800/40 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sigma size={16} className="text-emerald-400" />
              <span className="text-sm font-medium text-emerald-200">{labels.distribution}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-300">{labels.mean}:</span>
                <span className="text-white font-mono">{advancedMetrics.mean.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300">{labels.std}:</span>
                <span className="text-white font-mono">{advancedMetrics.std.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300">{labels.skewness}:</span>
                <span className="text-white font-mono">{advancedMetrics.skewness.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300">{labels.kurtosis}:</span>
                <span className="text-white font-mono">{advancedMetrics.kurtosis.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* Peak analysis */}
          <div className="bg-emerald-800/40 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-emerald-400" />
              <span className="text-sm font-medium text-emerald-200">{labels.peakAnalysis}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-300">{labels.fringeSpacing}:</span>
                <span className="text-white font-mono">
                  {advancedMetrics.fringeSpacing.toFixed(3)} 
                  <span className="text-emerald-400"> ({labels.theoretical}: {advancedMetrics.theoreticalSpacing.toFixed(3)})</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300">{labels.expectedFringes}:</span>
                <span className="text-white font-mono">~{advancedMetrics.expectedFringes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300">{labels.centralMax}:</span>
                <span className="text-white font-mono">{(advancedMetrics.centralIntensity * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-300">{labels.signalToNoise}:</span>
                <span className={`font-mono ${advancedMetrics.snr > 5 ? 'text-green-400' : advancedMetrics.snr > 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {advancedMetrics.snr.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Peak positions */}
          {advancedMetrics.peaks.length > 0 && (
            <div className="bg-emerald-800/40 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-emerald-400" />
                <span className="text-sm font-medium text-emerald-200">{labels.peakPositions}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {advancedMetrics.peaks.map((peak, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-emerald-700/50 rounded text-xs text-white font-mono"
                    title={`Height: ${(peak.height * 100).toFixed(1)}%`}
                  >
                    z={peak.z.toFixed(2)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interpretation */}
          <div className="text-xs text-emerald-400/80 bg-emerald-800/20 rounded-lg p-2">
            {advancedMetrics.snr > 5 && Math.abs(advancedMetrics.skewness) < 0.5 ? (
              lang === 'ru' 
                ? '✓ Высокое качество данных: симметричное распределение, хороший SNR'
                : '✓ High data quality: symmetric distribution, good SNR'
            ) : advancedMetrics.snr < 2 ? (
              lang === 'ru'
                ? '⚠ Низкий SNR: соберите больше статистики'
                : '⚠ Low SNR: collect more statistics'
            ) : Math.abs(advancedMetrics.skewness) > 1 ? (
              lang === 'ru'
                ? '⚠ Асимметричное распределение: проверьте выравнивание'
                : '⚠ Asymmetric distribution: check alignment'
            ) : (
              lang === 'ru'
                ? '○ Приемлемое качество данных'
                : '○ Acceptable data quality'
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function for smoothing
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
