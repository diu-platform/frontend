import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, BookOpen, Beaker } from 'lucide-react';

interface TheoryPanelProps {
  observerOn: boolean;
}

export function TheoryPanel({ observerOn }: TheoryPanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-gray-800/90 backdrop-blur rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white">📚 Теория</h3>
        </div>
        {expanded ? (
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Key insight based on mode */}
          <div
            className={`p-3 rounded-lg ${
              observerOn ? 'bg-red-900/30 border border-red-800/50' : 'bg-blue-900/30 border border-blue-800/50'
            }`}
          >
            <div className="flex items-start gap-2">
              <Lightbulb size={18} className={observerOn ? 'text-red-400' : 'text-blue-400'} />
              <div>
                <div className={`text-sm font-medium ${observerOn ? 'text-red-300' : 'text-blue-300'}`}>
                  {observerOn ? 'Эффект наблюдателя' : 'Волновая природа'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {observerOn ? (
                    <>
                      Когда мы пытаемся определить, через какую щель прошла частица,{' '}
                      <span className="text-red-400">интерференция исчезает</span>. Частица ведёт себя
                      как классический объект — проходит только через одну щель.
                    </>
                  ) : (
                    <>
                      Без наблюдения частица находится в{' '}
                      <span className="text-blue-400">суперпозиции</span> — проходит через обе щели
                      одновременно и интерферирует сама с собой, создавая характерную картину полос.
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Formulas */}
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="text-sm text-gray-300 mb-2">Ключевые формулы:</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-mono">λ = h/p</span>
                <span className="text-gray-500">— длина волны де Бройля</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-mono">Δx = λL/d</span>
                <span className="text-gray-500">— расстояние между полосами</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400 font-mono">I ∝ cos²(πdx/λL)</span>
                <span className="text-gray-500">— интенсивность</span>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Beaker size={16} className="text-green-400" />
              <span className="text-sm text-gray-300">Попробуй:</span>
            </div>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Измени длину волны — число полос изменится</li>
              <li>• Увеличь расстояние между щелями — полосы станут чаще</li>
              <li>• Переключи детектор — сравни квантовую и классическую картины</li>
              <li>• Уменьши интенсивность до 1 — даже одиночные частицы дают интерференцию!</li>
            </ul>
          </div>

          {/* Historical note */}
          <div className="text-xs text-gray-500 italic">
            💬 «Каждая частица интерферирует сама с собой» — парадокс, который озадачивал Эйнштейна.
            Этот эксперимент часто называют «самым красивым в физике».
          </div>
        </div>
      )}
    </div>
  );
}
