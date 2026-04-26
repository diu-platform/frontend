// components/DataExport.tsx
import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { Download, FileJson, FileSpreadsheet, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import type { DoubleSlitStats, DoubleSlitParams } from '../simulations/DoubleSlit';
import type { LogEntry } from './ExperimentLog';

interface DataExportProps {
  stats: DoubleSlitStats;
  params: DoubleSlitParams;
  entries: LogEntry[];
}

export function DataExport({ stats, params, entries }: DataExportProps) {
  const { lang } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  
  const labels = {
    title: lang === 'ru' ? '📥 Экспорт данных' : '📥 Data Export',
    histogram: lang === 'ru' ? 'Гистограмма (CSV)' : 'Histogram (CSV)',
    journal: lang === 'ru' ? 'Журнал (JSON)' : 'Journal (JSON)',
    report: lang === 'ru' ? 'Отчёт (TXT)' : 'Report (TXT)',
    fullData: lang === 'ru' ? 'Полные данные (JSON)' : 'Full Data (JSON)',
    noData: lang === 'ru' ? 'Нет данных для экспорта' : 'No data to export',
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportHistogramCSV = () => {
    const headers = ['bin', 'position_z', 'count', 'normalized'];
    const maxVal = Math.max(...stats.histogram, 1);
    const screenWidth = 7;
    
    const rows = stats.histogram.map((count, i) => {
      const z = ((i / stats.histogram.length) - 0.5) * screenWidth;
      return [i, z.toFixed(3), count, (count / maxVal).toFixed(4)].join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadFile(csv, `histogram_${timestamp}.csv`, 'text/csv');
  };

  const exportJournalJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      experimentType: 'double-slit',
      totalEntries: entries.length,
      entries: entries.map(e => ({
        ...e,
        timestamp: e.timestamp.toISOString(),
      })),
    };
    
    const json = JSON.stringify(data, null, 2);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadFile(json, `experiment_journal_${timestamp}.json`, 'application/json');
  };

  const exportFullDataJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      experimentType: 'double-slit',
      currentParameters: {
        wavelength: params.wavelength,
        slitDistance: params.slitDistance,
        intensity: params.intensity,
        observerOn: params.observerOn,
      },
      currentStatistics: {
        totalParticles: stats.totalParticles,
        fringeCount: stats.fringeCount,
        contrast: stats.contrast,
        histogramBins: stats.histogram.length,
      },
      histogram: stats.histogram,
      journalEntries: entries.map(e => ({
        ...e,
        timestamp: e.timestamp.toISOString(),
      })),
      metadata: {
        screenWidth: 7,
        screenX: 8,
        barrierX: 0,
        sourceX: -8,
      },
    };
    
    const json = JSON.stringify(data, null, 2);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadFile(json, `full_experiment_data_${timestamp}.json`, 'application/json');
  };

  const exportReport = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US');
    const timeStr = now.toLocaleTimeString(lang === 'ru' ? 'ru-RU' : 'en-US');
    
    const title = lang === 'ru' 
      ? 'ОТЧЁТ ЭКСПЕРИМЕНТА: ДВУХЩЕЛЕВАЯ ИНТЕРФЕРЕНЦИЯ'
      : 'EXPERIMENT REPORT: DOUBLE-SLIT INTERFERENCE';
    
    const separator = '='.repeat(60);
    const lines = [
      separator,
      title,
      separator,
      '',
      `${lang === 'ru' ? 'Дата' : 'Date'}: ${dateStr}`,
      `${lang === 'ru' ? 'Время' : 'Time'}: ${timeStr}`,
      '',
      separator,
      lang === 'ru' ? 'ТЕКУЩИЕ ПАРАМЕТРЫ' : 'CURRENT PARAMETERS',
      separator,
      '',
      `${lang === 'ru' ? 'Длина волны (λ)' : 'Wavelength (λ)'}: ${params.wavelength} nm`,
      `${lang === 'ru' ? 'Расстояние между щелями (d)' : 'Slit distance (d)'}: ${params.slitDistance} mm`,
      `${lang === 'ru' ? 'Интенсивность' : 'Intensity'}: ${params.intensity}`,
      `${lang === 'ru' ? 'Детектор' : 'Detector'}: ${params.observerOn ? (lang === 'ru' ? 'ВКЛ' : 'ON') : (lang === 'ru' ? 'ВЫКЛ' : 'OFF')}`,
      '',
      separator,
      lang === 'ru' ? 'РЕЗУЛЬТАТЫ ИЗМЕРЕНИЙ' : 'MEASUREMENT RESULTS',
      separator,
      '',
      `${lang === 'ru' ? 'Всего частиц' : 'Total particles'}: ${stats.totalParticles}`,
      `${lang === 'ru' ? 'Обнаружено полос' : 'Fringes detected'}: ${stats.fringeCount}`,
      `${lang === 'ru' ? 'Контраст (видность)' : 'Contrast (visibility)'}: ${(stats.contrast * 100).toFixed(1)}%`,
      '',
      separator,
      lang === 'ru' ? 'ИНТЕРПРЕТАЦИЯ' : 'INTERPRETATION',
      separator,
      '',
    ];

    // Add interpretation
    if (params.observerOn) {
      lines.push(lang === 'ru' 
        ? 'Детектор включён. Наблюдается классическое распределение.'
        : 'Detector is ON. Classical distribution observed.');
      lines.push(lang === 'ru'
        ? 'Интерференция разрушена из-за декогеренции.'
        : 'Interference destroyed due to decoherence.');
    } else {
      if (stats.fringeCount >= 5 && stats.contrast > 0.5) {
        lines.push(lang === 'ru'
          ? 'Отличная интерференционная картина!'
          : 'Excellent interference pattern!');
        lines.push(lang === 'ru'
          ? 'Квантовое поведение подтверждено.'
          : 'Quantum behavior confirmed.');
      } else if (stats.fringeCount >= 3) {
        lines.push(lang === 'ru'
          ? 'Хорошая интерференция. Паттерн сформирован.'
          : 'Good interference. Pattern formed.');
      } else {
        lines.push(lang === 'ru'
          ? 'Интерференция слабая. Требуется больше статистики.'
          : 'Weak interference. More statistics needed.');
      }
    }

    // Add journal entries summary
    if (entries.length > 0) {
      lines.push('');
      lines.push(separator);
      lines.push(lang === 'ru' ? 'ЖУРНАЛ ИЗМЕРЕНИЙ' : 'MEASUREMENT LOG');
      lines.push(separator);
      lines.push('');
      lines.push(`${lang === 'ru' ? 'Всего записей' : 'Total entries'}: ${entries.length}`);
      lines.push('');
      
      entries.forEach((entry, idx) => {
        lines.push(`#${idx + 1} [${entry.timestamp.toLocaleTimeString()}]`);
        lines.push(`  λ=${entry.params.wavelength}nm, d=${entry.params.slitDistance}mm`);
        lines.push(`  ${lang === 'ru' ? 'Частиц' : 'Particles'}: ${entry.stats.totalParticles}, ${lang === 'ru' ? 'Полос' : 'Fringes'}: ${entry.stats.fringeCount}, ${lang === 'ru' ? 'Контраст' : 'Contrast'}: ${Math.round(entry.stats.contrast * 100)}%`);
        if (entry.note) {
          lines.push(`  ${lang === 'ru' ? 'Заметка' : 'Note'}: "${entry.note}"`);
        }
        lines.push('');
      });
    }

    // Add histogram summary
    lines.push(separator);
    lines.push(lang === 'ru' ? 'ГИСТОГРАММА (топ-10 бинов)' : 'HISTOGRAM (top 10 bins)');
    lines.push(separator);
    lines.push('');
    
    const sortedBins = stats.histogram
      .map((count, i) => ({ bin: i, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    sortedBins.forEach(({ bin, count }) => {
      const z = ((bin / stats.histogram.length) - 0.5) * 7;
      lines.push(`  Bin ${bin.toString().padStart(2)} (z=${z.toFixed(2).padStart(6)}): ${'█'.repeat(Math.min(30, Math.round(count / Math.max(...stats.histogram) * 30)))} ${count}`);
    });

    lines.push('');
    lines.push(separator);
    lines.push(lang === 'ru' ? 'Конец отчёта' : 'End of report');
    lines.push(separator);
    lines.push('');
    lines.push('DIU Physics Interactive | DeSci Intelligent Universe');

    const report = lines.join('\n');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    downloadFile(report, `experiment_report_${timestamp}.txt`, 'text/plain');
  };

  const hasData = stats.totalParticles > 0;

  return (
    <div className="bg-emerald-900/60 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-emerald-500/30">
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-emerald-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Download size={20} className="text-emerald-400" />
          {labels.title}
        </h3>
        {expanded ? <ChevronUp size={20} className="text-emerald-300" /> : <ChevronDown size={20} className="text-emerald-300" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4">
          {!hasData ? (
            <p className="text-sm text-emerald-400/70 text-center py-4">
              {labels.noData}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportHistogramCSV}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-700/50 hover:bg-emerald-600/50 rounded-lg text-sm text-white transition-colors border border-emerald-600/30"
              >
                <FileSpreadsheet size={16} />
                {labels.histogram}
              </button>
              
              <button
                onClick={exportJournalJSON}
                disabled={entries.length === 0}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-700/50 hover:bg-emerald-600/50 disabled:bg-emerald-800/30 disabled:opacity-50 rounded-lg text-sm text-white transition-colors border border-emerald-600/30"
              >
                <FileJson size={16} />
                {labels.journal}
              </button>
              
              <button
                onClick={exportReport}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-700/50 hover:bg-emerald-600/50 rounded-lg text-sm text-white transition-colors border border-emerald-600/30"
              >
                <FileText size={16} />
                {labels.report}
              </button>
              
              <button
                onClick={exportFullDataJSON}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-700/50 hover:bg-emerald-600/50 rounded-lg text-sm text-white transition-colors border border-emerald-600/30"
              >
                <FileJson size={16} />
                {labels.fullData}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
