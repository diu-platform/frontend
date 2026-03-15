import { useState, useEffect, useRef } from 'react';
import { type AppMode } from './ModeSelector';

export interface ModeInfo {
  id: AppMode;
  name: string;
  nameRu: string;
  icon: string;
  color: string;
  description?: string;
  descriptionRu?: string;
}

export const MODES: ModeInfo[] = [
  {
    id: 'demo',
    name: 'Demo',
    nameRu: 'Демо',
    icon: '🎮',
    color: '#22c55e',
    description: 'Simplified for curious minds',
    descriptionRu: 'Упрощённый режим',
  },
  {
    id: 'lab',
    name: 'Laboratory',
    nameRu: 'Лаборатория',
    icon: '🔬',
    color: '#3b82f6',
    description: 'Tasks and XP for students',
    descriptionRu: 'Задания и XP',
  },
  {
    id: 'research',
    name: 'Research',
    nameRu: 'Исследование',
    icon: '🔭',
    color: '#a855f7',
    description: 'Extended parameters',
    descriptionRu: 'Расширенные параметры',
  },
  {
    id: 'simulation',
    name: 'Simulation',
    nameRu: 'Симуляция',
    icon: '🖥️',
    color: '#f97316',
    description: 'Coming soon',
    descriptionRu: 'Скоро',
  },
  {
    id: 'collaboration',
    name: 'Collaboration',
    nameRu: 'Совместная',
    icon: '👥',
    color: '#06b6d4',
    description: 'Coming soon',
    descriptionRu: 'Скоро',
  },
  {
    id: 'sandbox',
    name: 'Sandbox',
    nameRu: 'Песочница',
    icon: '🧪',
    color: '#eab308',
    description: 'Coming soon',
    descriptionRu: 'Скоро',
  },
];

export function ModeSelectorDropdown({
  current,
  onChange,
  language,
}: {
  current: AppMode;
  onChange: (mode: AppMode) => void;
  language: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModeInfo = MODES.find(m => m.id === current)!;
  const availableModes = MODES.filter(m => !['simulation', 'collaboration', 'sandbox'].includes(m.id));
  const comingSoonModes = MODES.filter(m => ['simulation', 'collaboration', 'sandbox'].includes(m.id));

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-[100]" ref={dropdownRef}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/70 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600/50"
        style={{ borderLeftColor: currentModeInfo.color, borderLeftWidth: '3px' }}
      >
        <span>{currentModeInfo.icon}</span>
        <span className="font-medium">
          {language === 'ru' ? currentModeInfo.nameRu : currentModeInfo.name}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-56 bg-slate-800 border border-slate-600/50 rounded-lg shadow-xl z-[200] overflow-hidden">
          {/* Available modes */}
          {availableModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                onChange(mode.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                ${current === mode.id
                  ? 'bg-slate-700 text-white'
                  : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                }
              `}
              style={current === mode.id ? {
                borderLeft: `3px solid ${mode.color}`,
              } : {
                borderLeft: '3px solid transparent',
              }}
            >
              <span className="text-lg">{mode.icon}</span>
              <div className="flex-1">
                <div className="font-medium">
                  {language === 'ru' ? mode.nameRu : mode.name}
                </div>
                <div className="text-xs text-gray-400">
                  {language === 'ru' ? mode.descriptionRu : mode.description}
                </div>
              </div>
              {current === mode.id && (
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-slate-600/50 my-1" />

          {/* Coming soon modes */}
          {comingSoonModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                onChange(mode.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-500 hover:bg-slate-700/30"
              style={{ borderLeft: '3px solid transparent' }}
            >
              <span className="text-lg opacity-50">{mode.icon}</span>
              <div className="flex-1">
                <div className="font-medium">
                  {language === 'ru' ? mode.nameRu : mode.name}
                </div>
                <div className="text-xs text-gray-500">
                  {language === 'ru' ? 'Скоро' : 'Coming soon'}
                </div>
              </div>
              <span className="text-xs text-gray-500">🔒</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
