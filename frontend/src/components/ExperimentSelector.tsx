import { useState, useEffect, useRef } from 'react';

export type ExperimentType = 'doubleSlit' | 'tunneling' | 'hydrogen';

export interface ExperimentInfo {
  id: ExperimentType;
  name: string;
  nameRu: string;
  icon: string;
  color: string;
  badge?: string;
}

export const EXPERIMENTS: ExperimentInfo[] = [
  {
    id: 'doubleSlit',
    name: 'Double-Slit',
    nameRu: 'Двойная щель',
    icon: '🌊',
    color: '#3b82f6',
  },
  {
    id: 'tunneling',
    name: 'Quantum Tunneling',
    nameRu: 'Туннелирование',
    icon: '⚡',
    color: '#a855f7',
    badge: '🏆 Nobel 2025',
  },
  {
    id: 'hydrogen',
    name: 'Hydrogen Orbitals',
    nameRu: 'Орбитали H',
    icon: '⚛️',
    color: '#f97316',
  },
];

export function ExperimentSelector({
  current,
  onChange,
  language,
}: {
  current: ExperimentType;
  onChange: (exp: ExperimentType) => void;
  language: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentExp = EXPERIMENTS.find(e => e.id === current)!;

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
        style={{ borderLeftColor: currentExp.color, borderLeftWidth: '3px' }}
      >
        <span>{currentExp.icon}</span>
        <span className="font-medium">
          {language === 'ru' ? currentExp.nameRu : currentExp.name}
        </span>
        {currentExp.badge && (
          <span className="text-xs text-yellow-400">🏆</span>
        )}
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
        <div className="absolute top-full left-0 mt-1 w-56 bg-slate-800 border border-slate-600/50 rounded-lg shadow-xl z-[200] overflow-hidden">
          {EXPERIMENTS.map((exp) => (
            <button
              key={exp.id}
              onClick={() => {
                onChange(exp.id);
                setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors
                ${current === exp.id
                  ? 'bg-slate-700 text-white'
                  : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                }
              `}
              style={current === exp.id ? {
                borderLeft: `3px solid ${exp.color}`,
              } : {
                borderLeft: '3px solid transparent',
              }}
            >
              <span className="text-lg">{exp.icon}</span>
              <div className="flex-1">
                <div className="font-medium">
                  {language === 'ru' ? exp.nameRu : exp.name}
                </div>
                {exp.badge && (
                  <div className="text-xs text-yellow-400">{exp.badge}</div>
                )}
              </div>
              {current === exp.id && (
                <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
