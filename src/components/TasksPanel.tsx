// components/TasksPanel.tsx
import { useMemo } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { DoubleSlitStats, DoubleSlitParams } from '../simulations/DoubleSlit';

interface TasksPanelProps {
  stats: DoubleSlitStats;
  params: DoubleSlitParams;
}

interface Task {
  id: number;
  labelKey: string;
  check: (stats: DoubleSlitStats, params: DoubleSlitParams) => boolean;
  xp: number;
}

const tasks: Task[] = [
  { id: 1, labelKey: 'tasks.task1', check: (s) => s.totalParticles > 0, xp: 10 },
  { id: 2, labelKey: 'tasks.task2', check: (s) => s.totalParticles >= 50, xp: 20 },
  { id: 3, labelKey: 'tasks.task3', check: (s) => s.fringeCount >= 3, xp: 30 },
  { id: 4, labelKey: 'tasks.task4', check: (_, p) => p.observerOn, xp: 15 },
  { id: 5, labelKey: 'tasks.task5', check: (s) => s.totalParticles >= 100, xp: 25 },
  { id: 6, labelKey: 'tasks.task6', check: (_, p) => p.wavelength !== 550, xp: 10 },
  { id: 7, labelKey: 'tasks.task7', check: (_, p) => p.slitDistance !== 0.5, xp: 10 },
  { id: 8, labelKey: 'tasks.task8', check: (s) => s.contrast > 0.5, xp: 40 },
  { id: 9, labelKey: 'tasks.task9', check: (s) => s.totalParticles >= 200, xp: 30 },
  { id: 10, labelKey: 'tasks.task10', check: (s) => s.fringeCount >= 5, xp: 50 },
];

export function TasksPanel({ stats, params }: TasksPanelProps) {
  const { t } = useLanguage();

  const completedTasks = useMemo(() => {
    return tasks.filter(task => task.check(stats, params));
  }, [stats, params]);

  const totalXP = useMemo(() => {
    return completedTasks.reduce((sum, task) => sum + task.xp, 0);
  }, [completedTasks]);

  const maxXP = tasks.reduce((sum, task) => sum + task.xp, 0);
  const progress = (totalXP / maxXP) * 100;

  return (
    <div className="bg-indigo-900/60 backdrop-blur-md rounded-xl p-4 shadow-lg border border-indigo-500/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white">{t('tasks.title')}</h3>
        <div className="text-sm">
          <span className="text-yellow-400 font-bold">{totalXP}</span>
          <span className="text-indigo-400">/{maxXP} XP</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 bg-indigo-700 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Tasks list */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
        {tasks.map((task) => {
          const completed = task.check(stats, params);
          return (
            <div 
              key={task.id}
              className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                completed 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-indigo-800/30'
              }`}
            >
              {completed ? (
                <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
              ) : (
                <Circle size={16} className="text-indigo-500 flex-shrink-0" />
              )}
              <span className={`text-xs flex-1 ${completed ? 'text-green-300' : 'text-indigo-300'}`}>
                {t(task.labelKey)}
              </span>
              <span className={`text-xs font-mono ${completed ? 'text-yellow-400' : 'text-indigo-600'}`}>
                +{task.xp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
