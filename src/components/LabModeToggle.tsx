// components/LabModeToggle.tsx
import { useLanguage } from '../i18n/LanguageContext';
import { Beaker, Play } from 'lucide-react';

interface LabModeToggleProps {
  labMode: boolean;
  onToggle: (mode: boolean) => void;
}

export function LabModeToggle({ labMode, onToggle }: LabModeToggleProps) {
  const { lang } = useLanguage();
  
  const labels = {
    demo: lang === 'ru' ? 'Демо' : 'Demo',
    lab: lang === 'ru' ? 'Лаборатория' : 'Laboratory',
    demoDesc: lang === 'ru' ? 'Наблюдай' : 'Observe',
    labDesc: lang === 'ru' ? 'Исследуй' : 'Research',
  };

  return (
    <div className="flex items-center gap-1 bg-indigo-950/80 rounded-xl p-1 border border-indigo-500/30">
      <button
        onClick={() => onToggle(false)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          !labMode 
            ? 'bg-indigo-600 text-white shadow-lg' 
            : 'text-indigo-300 hover:text-white hover:bg-indigo-800/50'
        }`}
      >
        <Play size={16} />
        <div className="text-left">
          <div className="text-sm font-medium">{labels.demo}</div>
          <div className="text-xs opacity-70">{labels.demoDesc}</div>
        </div>
      </button>
      
      <button
        onClick={() => onToggle(true)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          labMode 
            ? 'bg-emerald-600 text-white shadow-lg' 
            : 'text-indigo-300 hover:text-white hover:bg-indigo-800/50'
        }`}
      >
        <Beaker size={16} />
        <div className="text-left">
          <div className="text-sm font-medium">{labels.lab}</div>
          <div className="text-xs opacity-70">{labels.labDesc}</div>
        </div>
      </button>
    </div>
  );
}
