// components/ModeInfoPanel.tsx - Multilingual Mode Info
import { X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import type { AppMode } from './ModeSelector';

interface ModeInfoPanelProps { currentMode: AppMode; onClose: () => void; }
type L = Record<string, string>;

const UI: Record<string, L> = {
  close: { en: 'Close', ru: 'Закрыть', es: 'Cerrar', pt: 'Fechar', de: 'Schließen', fr: 'Fermer', zh: '关闭', ar: 'إغلاق' },
  audience: { en: 'For', ru: 'Для', es: 'Para', pt: 'Para', de: 'Für', fr: 'Pour', zh: '适用于', ar: 'لـ' },
  features: { en: 'Features', ru: 'Возможности', es: 'Funciones', pt: 'Recursos', de: 'Funktionen', fr: 'Fonctionnalités', zh: '功能', ar: 'الميزات' },
  tips: { en: 'Tips', ru: 'Советы', es: 'Consejos', pt: 'Dicas', de: 'Tipps', fr: 'Conseils', zh: '提示', ar: 'نصائح' },
};

const MODES: Record<string, { icon: string; title: L; desc: L; audience: L; features: string[]; tips: string[] }> = {
  demo: {
    icon: '👁️',
    title: { en: 'Demo Mode — Observe', ru: 'Демо режим — Наблюдай', es: 'Modo Demo — Observa', pt: 'Modo Demo — Observe', de: 'Demo-Modus — Beobachten', fr: 'Mode Démo — Observer', zh: '演示模式 — 观察', ar: 'الوضع التجريبي — راقب' },
    desc: { en: 'Beautiful 3D visualization for first-time users', ru: 'Красивая 3D визуализация для первого знакомства', es: 'Hermosa visualización 3D para nuevos usuarios', pt: 'Bela visualização 3D para novos usuários', de: 'Schöne 3D-Visualisierung für Erstbenutzer', fr: 'Belle visualisation 3D pour les nouveaux utilisateurs', zh: '初次使用者的精美3D可视化', ar: 'تصور ثلاثي الأبعاد جميل للمستخدمين الجدد' },
    audience: { en: 'curious minds, beginners', ru: 'любознательные, начинающие', es: 'mentes curiosas, principiantes', pt: 'mentes curiosas, iniciantes', de: 'Neugierige, Anfänger', fr: 'esprits curieux, débutants', zh: '好奇心强的人、初学者', ar: 'العقول الفضولية، المبتدئين' },
    features: ['3D visualization', 'Basic controls', 'Observer effect', 'Quiz'],
    tips: ['Toggle observer', 'Zoom with mouse wheel', 'Change wavelength'],
  },
  lab: {
    icon: '📚',
    title: { en: 'Lab Mode — Explore', ru: 'Лаборатория — Исследуй', es: 'Modo Lab — Explora', pt: 'Modo Lab — Explore', de: 'Labor-Modus — Erkunden', fr: 'Mode Labo — Explorer', zh: '实验室模式 — 探索', ar: 'وضع المختبر — استكشف' },
    desc: { en: 'Educational mode with tasks, XP, and data export', ru: 'Образовательный режим с заданиями, XP и экспортом', es: 'Modo educativo con tareas, XP y exportación', pt: 'Modo educativo com tarefas, XP e exportação', de: 'Bildungsmodus mit Aufgaben, XP und Export', fr: 'Mode éducatif avec tâches, XP et export', zh: '具有任务、XP和数据导出的教育模式', ar: 'وضع تعليمي مع مهام وXP وتصدير' },
    audience: { en: 'students, educators', ru: 'студенты, преподаватели', es: 'estudiantes, educadores', pt: 'estudantes, educadores', de: 'Studenten, Lehrer', fr: 'étudiants, éducateurs', zh: '学生、教育工作者', ar: 'الطلاب، المعلمين' },
    features: ['Guided tasks', 'XP & achievements', 'Data export', 'Theory comparison'],
    tips: ['Complete tasks for XP', 'Export data for reports', 'Use theory overlay'],
  },
  research: {
    icon: '🔬',
    title: { en: 'Research Mode — Analyze', ru: 'Научный режим — Анализируй', es: 'Modo Investigación — Analiza', pt: 'Modo Pesquisa — Analise', de: 'Forschungsmodus — Analysieren', fr: 'Mode Recherche — Analyser', zh: '研究模式 — 分析', ar: 'وضع البحث — حلل' },
    desc: { en: '30+ parameters based on Optica research for publication-quality data', ru: '30+ параметров на основе исследований Optica для публикаций', es: '30+ parámetros basados en investigación Optica', pt: '30+ parâmetros baseados em pesquisa Optica', de: '30+ Parameter basierend auf Optica-Forschung', fr: '30+ paramètres basés sur recherche Optica', zh: '基于Optica研究的30+参数', ar: '30+ معلمة مبنية على أبحاث Optica' },
    audience: { en: 'researchers, scientists', ru: 'исследователи, учёные', es: 'investigadores, científicos', pt: 'pesquisadores, cientistas', de: 'Forscher, Wissenschaftler', fr: 'chercheurs, scientifiques', zh: '研究人员、科学家', ar: 'الباحثين، العلماء' },
    features: ['30+ parameters', 'Statistical analysis', 'Publication export', 'Theory comparison'],
    tips: ['Use all source types', 'Compare with theory', 'Export for publication'],
  },
  simulation: {
    icon: '⚗️',
    title: { en: 'Simulation Mode — Coming Soon', ru: 'Симуляция — Скоро', es: 'Modo Simulación — Próximamente', pt: 'Modo Simulação — Em Breve', de: 'Simulationsmodus — Bald', fr: 'Mode Simulation — Bientôt', zh: '模拟模式 — 即将推出', ar: 'وضع المحاكاة — قريباً' },
    desc: { en: 'Advanced quantum simulations', ru: 'Продвинутые квантовые симуляции', es: 'Simulaciones cuánticas avanzadas', pt: 'Simulações quânticas avançadas', de: 'Erweiterte Quantensimulationen', fr: 'Simulations quantiques avancées', zh: '高级量子模拟', ar: 'محاكاة كمية متقدمة' },
    audience: { en: 'advanced users', ru: 'продвинутые пользователи', es: 'usuarios avanzados', pt: 'usuários avançados', de: 'fortgeschrittene Benutzer', fr: 'utilisateurs avancés', zh: '高级用户', ar: 'المستخدمين المتقدمين' },
    features: ['Custom scenarios', 'Advanced physics'], tips: ['Coming in future update'],
  },
  collaboration: {
    icon: '👥',
    title: { en: 'Collaboration Mode — Coming Soon', ru: 'Совместная работа — Скоро', es: 'Modo Colaboración — Próximamente', pt: 'Modo Colaboração — Em Breve', de: 'Kollaborationsmodus — Bald', fr: 'Mode Collaboration — Bientôt', zh: '协作模式 — 即将推出', ar: 'وضع التعاون — قريباً' },
    desc: { en: 'Real-time collaboration with other users', ru: 'Совместная работа в реальном времени', es: 'Colaboración en tiempo real', pt: 'Colaboração em tempo real', de: 'Echtzeit-Zusammenarbeit', fr: 'Collaboration en temps réel', zh: '与其他用户实时协作', ar: 'التعاون في الوقت الحقيقي' },
    audience: { en: 'teams, classes', ru: 'команды, классы', es: 'equipos, clases', pt: 'equipes, turmas', de: 'Teams, Klassen', fr: 'équipes, classes', zh: '团队、班级', ar: 'الفرق، الفصول' },
    features: ['Shared experiments', 'Chat'], tips: ['Coming in future update'],
  },
  sandbox: {
    icon: '🎨',
    title: { en: 'Sandbox Mode — Coming Soon', ru: 'Песочница — Скоро', es: 'Modo Sandbox — Próximamente', pt: 'Modo Sandbox — Em Breve', de: 'Sandbox-Modus — Bald', fr: 'Mode Bac à Sable — Bientôt', zh: '沙盒模式 — 即将推出', ar: 'وضع الحماية — قريباً' },
    desc: { en: 'Create custom experiments', ru: 'Создавайте свои эксперименты', es: 'Crea experimentos personalizados', pt: 'Crie experimentos personalizados', de: 'Eigene Experimente erstellen', fr: 'Créez des expériences personnalisées', zh: '创建自定义实验', ar: 'إنشاء تجارب مخصصة' },
    audience: { en: 'creators, experimenters', ru: 'творцы, экспериментаторы', es: 'creadores, experimentadores', pt: 'criadores, experimentadores', de: 'Kreative, Experimentierer', fr: 'créateurs, expérimentateurs', zh: '创作者、实验者', ar: 'المبدعين، المجربين' },
    features: ['Custom setups', 'Save/load'], tips: ['Coming in future update'],
  },
};

export function ModeInfoPanel({ currentMode, onClose }: ModeInfoPanelProps) {
  const { language } = useLanguage();
  const g = (k: string) => UI[k]?.[language] || UI[k]?.en || k;
  const gt = (obj: L) => obj[language] || obj.en;
  const mode = MODES[currentMode] || MODES.demo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden border border-indigo-500/30 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{mode.icon}</span>
            <h2 className="text-xl font-bold text-white">{gt(mode.title)}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg"><X className="text-slate-400" /></button>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
          <p className="text-slate-300">{gt(mode.desc)}</p>
          <div className="text-sm text-indigo-400"><span className="text-slate-500">{g('audience')}:</span> {gt(mode.audience)}</div>
          <div>
            <h4 className="text-white font-medium mb-2">{g('features')}</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              {mode.features.map((f, i) => <li key={i} className="flex items-center gap-2"><span className="text-green-400">✓</span>{f}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">{g('tips')}</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              {mode.tips.map((t, i) => <li key={i} className="flex items-center gap-2"><span className="text-yellow-400">💡</span>{t}</li>)}
            </ul>
          </div>
        </div>
        <div className="p-4 border-t border-slate-700 text-center">
          <button onClick={onClose} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white">{g('close')}</button>
        </div>
      </div>
    </div>
  );
}
