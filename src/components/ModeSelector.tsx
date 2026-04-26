// components/ModeSelector.tsx
import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { X } from 'lucide-react';

export type AppMode = 'demo' | 'lab' | 'research' | 'simulation' | 'collaboration' | 'sandbox';

interface ModeSelectorProps {
  currentMode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

// Multilingual mode descriptions
const MODE_INFO: Record<AppMode, {
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  available: boolean;
  labels: Record<string, { name: string; subtitle: string; audience: string; description: string }>;
  features: Record<string, string[]>;
}> = {
  demo: {
    icon: '👁️',
    color: 'text-blue-400',
    bgColor: 'bg-blue-600',
    borderColor: 'border-blue-500',
    available: true,
    labels: {
      en: { name: 'Demo', subtitle: 'Observe', audience: 'Curious minds', description: 'Watch the quantum world unfold. Perfect for your first encounter with wave-particle duality.' },
      ru: { name: 'Демо', subtitle: 'Наблюдай', audience: 'Для любознательных', description: 'Наблюдайте за квантовым миром. Идеально для первого знакомства с корпускулярно-волновым дуализмом.' },
      es: { name: 'Demo', subtitle: 'Observa', audience: 'Mentes curiosas', description: 'Observa el mundo cuántico. Perfecto para tu primer encuentro con la dualidad onda-partícula.' },
      pt: { name: 'Demo', subtitle: 'Observe', audience: 'Mentes curiosas', description: 'Observe o mundo quântico. Perfeito para seu primeiro encontro com a dualidade onda-partícula.' },
      de: { name: 'Demo', subtitle: 'Beobachten', audience: 'Neugierige', description: 'Beobachten Sie die Quantenwelt. Perfekt für Ihre erste Begegnung mit dem Welle-Teilchen-Dualismus.' },
      fr: { name: 'Démo', subtitle: 'Observer', audience: 'Esprits curieux', description: 'Observez le monde quantique. Parfait pour votre première rencontre avec la dualité onde-particule.' },
      zh: { name: '演示', subtitle: '观察', audience: '好奇的人', description: '观察量子世界。非常适合首次接触波粒二象性。' },
      ar: { name: 'عرض', subtitle: 'راقب', audience: 'العقول الفضولية', description: 'شاهد العالم الكمي. مثالي للقاء الأول مع ازدواجية الموجة والجسيم.' },
    },
    features: {
      en: ['Simplified controls', 'Beautiful visualizations', 'Interactive explanations', 'Quiz mode'],
      ru: ['Упрощённое управление', 'Красивые визуализации', 'Интерактивные объяснения', 'Режим викторины'],
      es: ['Controles simplificados', 'Visualizaciones hermosas', 'Explicaciones interactivas', 'Modo quiz'],
      pt: ['Controles simplificados', 'Visualizações bonitas', 'Explicações interativas', 'Modo quiz'],
      de: ['Vereinfachte Steuerung', 'Schöne Visualisierungen', 'Interaktive Erklärungen', 'Quiz-Modus'],
      fr: ['Contrôles simplifiés', 'Belles visualisations', 'Explications interactives', 'Mode quiz'],
      zh: ['简化控制', '精美可视化', '交互式解释', '测验模式'],
      ar: ['تحكم مبسط', 'تصورات جميلة', 'شروحات تفاعلية', 'وضع الاختبار'],
    },
  },
  lab: {
    icon: '📚',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-600',
    borderColor: 'border-emerald-500',
    available: true,
    labels: {
      en: { name: 'Laboratory', subtitle: 'Explore', audience: 'Students & Educators', description: 'Hands-on learning with guided experiments. Complete tasks, earn XP, and master quantum physics.' },
      ru: { name: 'Лаборатория', subtitle: 'Исследуй', audience: 'Студенты и преподаватели', description: 'Практическое обучение с управляемыми экспериментами. Выполняйте задания, зарабатывайте XP.' },
      es: { name: 'Laboratorio', subtitle: 'Explora', audience: 'Estudiantes y educadores', description: 'Aprendizaje práctico con experimentos guiados. Completa tareas, gana XP.' },
      pt: { name: 'Laboratório', subtitle: 'Explore', audience: 'Estudantes e educadores', description: 'Aprendizado prático com experimentos guiados. Complete tarefas, ganhe XP.' },
      de: { name: 'Labor', subtitle: 'Erkunden', audience: 'Studenten & Pädagogen', description: 'Praktisches Lernen mit geführten Experimenten. Aufgaben erledigen, XP verdienen.' },
      fr: { name: 'Laboratoire', subtitle: 'Explorer', audience: 'Étudiants et éducateurs', description: 'Apprentissage pratique avec des expériences guidées. Accomplir des tâches, gagner de l\'XP.' },
      zh: { name: '实验室', subtitle: '探索', audience: '学生和教育者', description: '通过引导实验进行实践学习。完成任务，获得经验值。' },
      ar: { name: 'مختبر', subtitle: 'استكشف', audience: 'الطلاب والمعلمون', description: 'تعلم عملي مع تجارب موجهة. أكمل المهام، اكسب XP.' },
    },
    features: {
      en: ['Guided tasks with XP', 'Data export (CSV/JSON)', 'Theory comparison', 'Extended statistics'],
      ru: ['Задания с XP', 'Экспорт данных (CSV/JSON)', 'Сравнение с теорией', 'Расширенная статистика'],
      es: ['Tareas guiadas con XP', 'Exportación de datos', 'Comparación teórica', 'Estadísticas extendidas'],
      pt: ['Tarefas guiadas com XP', 'Exportação de dados', 'Comparação teórica', 'Estatísticas estendidas'],
      de: ['Geführte Aufgaben mit XP', 'Datenexport', 'Theorievergleich', 'Erweiterte Statistiken'],
      fr: ['Tâches guidées avec XP', 'Export de données', 'Comparaison théorique', 'Statistiques étendues'],
      zh: ['带XP的引导任务', '数据导出', '理论对比', '扩展统计'],
      ar: ['مهام موجهة مع XP', 'تصدير البيانات', 'مقارنة نظرية', 'إحصائيات موسعة'],
    },
  },
  research: {
    icon: '🔬',
    color: 'text-purple-400',
    bgColor: 'bg-purple-600',
    borderColor: 'border-purple-500',
    available: true,
    labels: {
      en: { name: 'Research', subtitle: 'Discover', audience: 'Scientists & Researchers', description: 'Full control over 30+ parameters. Reproduce real experiments with scientific precision.' },
      ru: { name: 'Исследование', subtitle: 'Открывай', audience: 'Учёные и исследователи', description: 'Полный контроль над 30+ параметрами. Воспроизводите реальные эксперименты с научной точностью.' },
      es: { name: 'Investigación', subtitle: 'Descubre', audience: 'Científicos e investigadores', description: 'Control total sobre 30+ parámetros. Reproduce experimentos reales con precisión científica.' },
      pt: { name: 'Pesquisa', subtitle: 'Descubra', audience: 'Cientistas e pesquisadores', description: 'Controle total sobre 30+ parâmetros. Reproduza experimentos reais com precisão científica.' },
      de: { name: 'Forschung', subtitle: 'Entdecken', audience: 'Wissenschaftler & Forscher', description: 'Volle Kontrolle über 30+ Parameter. Reproduzieren Sie echte Experimente mit wissenschaftlicher Präzision.' },
      fr: { name: 'Recherche', subtitle: 'Découvrir', audience: 'Scientifiques et chercheurs', description: 'Contrôle total sur 30+ paramètres. Reproduisez de vraies expériences avec précision scientifique.' },
      zh: { name: '研究', subtitle: '发现', audience: '科学家和研究人员', description: '完全控制30+个参数。以科学精度重现真实实验。' },
      ar: { name: 'بحث', subtitle: 'اكتشف', audience: 'العلماء والباحثون', description: 'تحكم كامل في أكثر من 30 معلمة. إعادة إنتاج التجارب الحقيقية بدقة علمية.' },
    },
    features: {
      en: ['30+ parameters', 'Gas medium selection', 'Detector settings', 'Quick presets (HeNe, Nd:YAG)'],
      ru: ['30+ параметров', 'Выбор газовой среды', 'Настройки детектора', 'Быстрые пресеты (HeNe, Nd:YAG)'],
      es: ['30+ parámetros', 'Selección de medio gaseoso', 'Ajustes de detector', 'Preajustes rápidos'],
      pt: ['30+ parâmetros', 'Seleção de meio gasoso', 'Configurações de detector', 'Predefinições rápidas'],
      de: ['30+ Parameter', 'Gasmedium-Auswahl', 'Detektor-Einstellungen', 'Schnellvorlagen'],
      fr: ['30+ paramètres', 'Sélection de milieu gazeux', 'Réglages détecteur', 'Préréglages rapides'],
      zh: ['30+个参数', '气体介质选择', '探测器设置', '快速预设'],
      ar: ['أكثر من 30 معلمة', 'اختيار الوسط الغازي', 'إعدادات الكاشف', 'إعدادات سريعة'],
    },
  },
  simulation: {
    icon: '🧪',
    color: 'text-orange-400',
    bgColor: 'bg-orange-600',
    borderColor: 'border-orange-500',
    available: false,
    labels: {
      en: { name: 'Simulation', subtitle: 'Model', audience: 'Computational Physicists', description: 'Run Monte Carlo simulations, parameter sweeps, and GPU-accelerated computations.' },
      ru: { name: 'Симуляция', subtitle: 'Моделируй', audience: 'Вычислительные физики', description: 'Запускайте симуляции Монте-Карло, развёртки параметров и GPU-ускоренные вычисления.' },
      es: { name: 'Simulación', subtitle: 'Modela', audience: 'Físicos computacionales', description: 'Ejecuta simulaciones Monte Carlo, barridos de parámetros y cálculos acelerados por GPU.' },
      pt: { name: 'Simulação', subtitle: 'Modele', audience: 'Físicos computacionais', description: 'Execute simulações Monte Carlo, varreduras de parâmetros e cálculos acelerados por GPU.' },
      de: { name: 'Simulation', subtitle: 'Modellieren', audience: 'Computerphysiker', description: 'Führen Sie Monte-Carlo-Simulationen, Parameterdurchläufe und GPU-beschleunigte Berechnungen durch.' },
      fr: { name: 'Simulation', subtitle: 'Modéliser', audience: 'Physiciens computationnels', description: 'Exécutez des simulations Monte Carlo, des balayages de paramètres et des calculs accélérés par GPU.' },
      zh: { name: '模拟', subtitle: '建模', audience: '计算物理学家', description: '运行蒙特卡罗模拟、参数扫描和GPU加速计算。' },
      ar: { name: 'محاكاة', subtitle: 'نمذجة', audience: 'فيزيائيون حاسوبيون', description: 'تشغيل محاكاة مونت كارلو ومسح المعلمات والحسابات المسرعة بـ GPU.' },
    },
    features: {
      en: ['Monte Carlo simulations', 'Batch parameter sweeps', 'GPU acceleration (WebGPU)', 'Custom physics models', 'Export to HDF5/NetCDF'],
      ru: ['Симуляции Монте-Карло', 'Пакетные развёртки параметров', 'GPU-ускорение (WebGPU)', 'Пользовательские модели', 'Экспорт в HDF5/NetCDF'],
      es: ['Simulaciones Monte Carlo', 'Barridos de parámetros', 'Aceleración GPU', 'Modelos personalizados', 'Exportar a HDF5/NetCDF'],
      pt: ['Simulações Monte Carlo', 'Varreduras de parâmetros', 'Aceleração GPU', 'Modelos personalizados', 'Exportar para HDF5/NetCDF'],
      de: ['Monte-Carlo-Simulationen', 'Parameter-Sweeps', 'GPU-Beschleunigung', 'Benutzerdefinierte Modelle', 'Export nach HDF5/NetCDF'],
      fr: ['Simulations Monte Carlo', 'Balayages de paramètres', 'Accélération GPU', 'Modèles personnalisés', 'Export vers HDF5/NetCDF'],
      zh: ['蒙特卡罗模拟', '批量参数扫描', 'GPU加速', '自定义物理模型', '导出到HDF5/NetCDF'],
      ar: ['محاكاة مونت كارلو', 'مسح المعلمات', 'تسريع GPU', 'نماذج مخصصة', 'تصدير إلى HDF5/NetCDF'],
    },
  },
  collaboration: {
    icon: '🤝',
    color: 'text-pink-400',
    bgColor: 'bg-pink-600',
    borderColor: 'border-pink-500',
    available: false,
    labels: {
      en: { name: 'Collaboration', subtitle: 'Cooperate', audience: 'Research Groups', description: 'Work together in real-time. Share experiments, annotate findings, and discuss with peers.' },
      ru: { name: 'Коллаборация', subtitle: 'Сотрудничай', audience: 'Исследовательские группы', description: 'Работайте вместе в реальном времени. Делитесь экспериментами и обсуждайте с коллегами.' },
      es: { name: 'Colaboración', subtitle: 'Coopera', audience: 'Grupos de investigación', description: 'Trabaja en tiempo real. Comparte experimentos y discute con colegas.' },
      pt: { name: 'Colaboração', subtitle: 'Coopere', audience: 'Grupos de pesquisa', description: 'Trabalhe em tempo real. Compartilhe experimentos e discuta com colegas.' },
      de: { name: 'Zusammenarbeit', subtitle: 'Kooperieren', audience: 'Forschungsgruppen', description: 'Arbeiten Sie in Echtzeit zusammen. Teilen Sie Experimente und diskutieren Sie mit Kollegen.' },
      fr: { name: 'Collaboration', subtitle: 'Coopérer', audience: 'Groupes de recherche', description: 'Travaillez ensemble en temps réel. Partagez des expériences et discutez avec vos pairs.' },
      zh: { name: '协作', subtitle: '合作', audience: '研究小组', description: '实时协作。分享实验，与同行讨论。' },
      ar: { name: 'تعاون', subtitle: 'تعاون', audience: 'مجموعات البحث', description: 'العمل معًا في الوقت الفعلي. مشاركة التجارب والنقاش مع الزملاء.' },
    },
    features: {
      en: ['Real-time shared sessions', 'Collaborative annotations', 'Team workspaces', 'Discussion threads', 'Version history'],
      ru: ['Совместные сессии', 'Коллаборативные аннотации', 'Командные пространства', 'Ветки обсуждений', 'История версий'],
      es: ['Sesiones compartidas', 'Anotaciones colaborativas', 'Espacios de trabajo', 'Hilos de discusión', 'Historial'],
      pt: ['Sessões compartilhadas', 'Anotações colaborativas', 'Espaços de trabalho', 'Threads', 'Histórico'],
      de: ['Echtzeit-Sitzungen', 'Kollaborative Annotationen', 'Team-Arbeitsbereiche', 'Diskussionsfäden', 'Versionsgeschichte'],
      fr: ['Sessions partagées', 'Annotations collaboratives', 'Espaces d\'équipe', 'Fils de discussion', 'Historique'],
      zh: ['实时共享会话', '协作注释', '团队工作区', '讨论串', '版本历史'],
      ar: ['جلسات مشتركة', 'تعليقات تعاونية', 'مساحات عمل', 'مواضيع النقاش', 'تاريخ الإصدارات'],
    },
  },
  sandbox: {
    icon: '🔧',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-600',
    borderColor: 'border-yellow-500',
    available: false,
    labels: {
      en: { name: 'Sandbox', subtitle: 'Create', audience: 'Developers', description: 'Build custom experiments, create plugins, and access the full API.' },
      ru: { name: 'Песочница', subtitle: 'Создавай', audience: 'Разработчики', description: 'Создавайте свои эксперименты, плагины и используйте полный API.' },
      es: { name: 'Sandbox', subtitle: 'Crea', audience: 'Desarrolladores', description: 'Crea experimentos personalizados, plugins y accede a la API completa.' },
      pt: { name: 'Sandbox', subtitle: 'Crie', audience: 'Desenvolvedores', description: 'Crie experimentos personalizados, plugins e acesse a API completa.' },
      de: { name: 'Sandbox', subtitle: 'Erstellen', audience: 'Entwickler', description: 'Erstellen Sie Experimente, Plugins und greifen Sie auf die API zu.' },
      fr: { name: 'Bac à sable', subtitle: 'Créer', audience: 'Développeurs', description: 'Créez des expériences, des plugins et accédez à l\'API.' },
      zh: { name: '沙盒', subtitle: '创建', audience: '开发者', description: '构建自定义实验，创建插件，访问完整API。' },
      ar: { name: 'صندوق الرمل', subtitle: 'أنشئ', audience: 'المطورون', description: 'بناء تجارب مخصصة وإنشاء إضافات والوصول إلى API.' },
    },
    features: {
      en: ['Custom experiment builder', 'Plugin system', 'Code editor', 'Full REST API', 'WebSocket streaming'],
      ru: ['Конструктор экспериментов', 'Система плагинов', 'Редактор кода', 'REST API', 'WebSocket'],
      es: ['Constructor de experimentos', 'Sistema de plugins', 'Editor de código', 'API REST', 'WebSocket'],
      pt: ['Construtor de experimentos', 'Sistema de plugins', 'Editor de código', 'API REST', 'WebSocket'],
      de: ['Experiment-Builder', 'Plugin-System', 'Code-Editor', 'REST-API', 'WebSocket'],
      fr: ['Constructeur d\'expériences', 'Système de plugins', 'Éditeur de code', 'API REST', 'WebSocket'],
      zh: ['实验构建器', '插件系统', '代码编辑器', 'REST API', 'WebSocket'],
      ar: ['منشئ التجارب', 'نظام الإضافات', 'محرر الكود', 'API REST', 'WebSocket'],
    },
  },
};

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  const { language } = useLanguage();
  const [showAllModes, setShowAllModes] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<AppMode | null>(null);
  
  const primaryModes: AppMode[] = ['demo', 'lab', 'research'];
  const secondaryModes: AppMode[] = ['simulation', 'collaboration', 'sandbox'];

  const getModeLabel = (mode: AppMode) => {
    return MODE_INFO[mode].labels[language] || MODE_INFO[mode].labels.en;
  };

  const handleModeClick = (mode: AppMode) => {
    if (MODE_INFO[mode].available) {
      onModeChange(mode);
    }
  };

  const comingSoonText: Record<string, string> = {
    en: 'Soon', ru: 'Скоро', es: 'Pronto', pt: 'Breve',
    de: 'Bald', fr: 'Bientôt', zh: '即将', ar: 'قريباً',
  };

  const featuresText: Record<string, string> = {
    en: 'Features:', ru: 'Возможности:', es: 'Características:', pt: 'Recursos:',
    de: 'Funktionen:', fr: 'Fonctionnalités:', zh: '功能：', ar: 'الميزات:',
  };

  const helpText: Record<string, string> = {
    en: 'Want to help develop this?', ru: 'Хотите участвовать в разработке?',
    es: '¿Quieres ayudar?', pt: 'Quer ajudar?',
    de: 'Möchten Sie mithelfen?', fr: 'Voulez-vous aider?',
    zh: '想帮助开发吗？', ar: 'هل تريد المساعدة؟',
  };

  return (
    <div className="relative">
      {/* Primary Mode Buttons */}
      <div className="flex gap-1 bg-slate-800/80 backdrop-blur-sm rounded-xl p-1">
        {primaryModes.map((modeId) => {
          const mode = MODE_INFO[modeId];
          const label = getModeLabel(modeId);
          return (
            <button
              key={modeId}
              onClick={() => handleModeClick(modeId)}
              onMouseEnter={() => setHoveredMode(modeId)}
              onMouseLeave={() => setHoveredMode(null)}
              className={`
                relative px-4 py-2 rounded-lg transition-all duration-200
                flex flex-col items-center min-w-[100px]
                ${currentMode === modeId 
                  ? `${mode.bgColor} text-white shadow-lg` 
                  : 'hover:bg-slate-700/50 text-gray-300'
                }
              `}
            >
              <span className="text-lg">{mode.icon}</span>
              <span className="text-xs font-medium mt-0.5">{label.name}</span>
              <span className="text-[10px] opacity-70">{label.subtitle}</span>
            </button>
          );
        })}
        
        {/* Expand Button */}
        <button
          onClick={() => setShowAllModes(!showAllModes)}
          className="px-3 py-2 rounded-lg transition-all duration-200 hover:bg-slate-700/50 text-gray-400"
        >
          <span className="text-lg">{showAllModes ? '◀' : '▶'}</span>
        </button>
      </div>

      {/* Secondary Modes (Expandable) */}
      {showAllModes && (
        <div 
          className="absolute top-full left-0 mt-2 flex gap-1 bg-slate-800/95 backdrop-blur-sm rounded-xl p-1 shadow-xl border border-slate-700 z-50"
          onMouseLeave={() => setHoveredMode(null)}
        >
          {secondaryModes.map((modeId) => {
            const mode = MODE_INFO[modeId];
            const label = getModeLabel(modeId);
            return (
              <div
                key={modeId}
                className="relative"
                onMouseEnter={() => setHoveredMode(modeId)}
              >
                <button
                  className="relative px-4 py-2 rounded-lg transition-all duration-200 flex flex-col items-center min-w-[100px] opacity-60 cursor-pointer hover:bg-slate-700/50 hover:opacity-100 text-gray-300"
                >
                  <span className="text-lg">{mode.icon}</span>
                  <span className="text-xs font-medium mt-0.5">{label.name}</span>
                  <span className="text-[10px] opacity-70">{label.subtitle}</span>
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-yellow-500 text-black text-[8px] font-bold rounded-full">
                    {comingSoonText[language] || 'SOON'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Hover Tooltip with Details - appears to the right of buttons */}
      {hoveredMode && (
        <div 
          className="absolute w-80 bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-slate-600 z-[60] pointer-events-none"
          style={{ 
            top: '0px',
            left: showAllModes ? '450px' : '350px',
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">{MODE_INFO[hoveredMode].icon}</span>
            <div className="flex-1">
              <h3 className={`font-bold ${MODE_INFO[hoveredMode].color}`}>
                {getModeLabel(hoveredMode).name}
              </h3>
              <p className="text-xs text-gray-400">{getModeLabel(hoveredMode).audience}</p>
            </div>
            {!MODE_INFO[hoveredMode].available && (
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                {comingSoonText[language]}
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-300 mt-3">
            {getModeLabel(hoveredMode).description}
          </p>
          
          <div className="mt-3 pt-3 border-t border-slate-700">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">
              {featuresText[language] || 'Features:'}
            </h4>
            <ul className="space-y-1">
              {(MODE_INFO[hoveredMode].features[language] || MODE_INFO[hoveredMode].features.en).map((feature, i) => (
                <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          {!MODE_INFO[hoveredMode].available && (
            <div className="mt-3 pt-3 border-t border-slate-700 text-center">
              <p className="text-xs text-gray-500 mb-1">
                {helpText[language]}
              </p>
              <a href="mailto:science@diu-os.dev" className="text-xs text-purple-400 hover:underline">
                science@diu-os.dev
              </a>
            </div>
          )}
        </div>
      )}

      {/* Current Mode Audience */}
      <div className="mt-2 text-center">
        <span className="text-xs text-gray-500">
          {getModeLabel(currentMode).audience}
        </span>
      </div>
    </div>
  );
}

/**
 * Coming Soon Modal
 */
export function ComingSoonModal({ mode, isOpen, onClose }: { mode: AppMode; isOpen: boolean; onClose: () => void; }) {
  const { language } = useLanguage();
  const modeInfo = MODE_INFO[mode];
  
  if (!isOpen || !modeInfo) return null;

  const label = modeInfo.labels[language] || modeInfo.labels.en;
  const features = modeInfo.features[language] || modeInfo.features.en;

  const texts: Record<string, { title: string; features: string; close: string; notify: string; help: string; }> = {
    en: { title: 'Coming Soon', features: 'Planned Features', close: 'Close', notify: 'Notify Me', help: 'Are you a scientist? Help us!' },
    ru: { title: 'Скоро', features: 'Запланированные функции', close: 'Закрыть', notify: 'Уведомить', help: 'Вы учёный? Помогите нам!' },
    es: { title: 'Próximamente', features: 'Características', close: 'Cerrar', notify: 'Notificar', help: '¿Eres científico? ¡Ayúdanos!' },
    pt: { title: 'Em Breve', features: 'Recursos', close: 'Fechar', notify: 'Notificar', help: 'É cientista? Ajude-nos!' },
    de: { title: 'Demnächst', features: 'Geplante Funktionen', close: 'Schließen', notify: 'Benachrichtigen', help: 'Wissenschaftler? Helfen Sie!' },
    fr: { title: 'Bientôt', features: 'Fonctionnalités', close: 'Fermer', notify: 'Me notifier', help: 'Scientifique? Aidez-nous!' },
    zh: { title: '即将推出', features: '计划功能', close: '关闭', notify: '通知我', help: '您是科学家吗？帮助我们！' },
    ar: { title: 'قريباً', features: 'الميزات المخططة', close: 'إغلاق', notify: 'أبلغني', help: 'هل أنت عالم؟ ساعدنا!' },
  };
  const t = texts[language] || texts.en;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md mx-4 border border-slate-700 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        <div className="text-center">
          <span className="text-5xl">{modeInfo.icon}</span>
          <h3 className={`text-xl font-bold mt-4 ${modeInfo.color}`}>{label.name}</h3>
          <span className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-full mt-2">{t.title}</span>
          <p className="text-gray-400 mt-3">{label.description}</p>
          
          <div className="mt-6 p-4 bg-slate-900/50 rounded-xl text-left">
            <h4 className="text-sm font-semibold text-gray-300 mb-3">{t.features}:</h4>
            <ul className="space-y-2">
              {features.map((feature, i) => (
                <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="text-green-400">✓</span>{feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6 flex gap-3 justify-center">
            <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white">{t.close}</button>
            <a href={`mailto:science@diu-os.dev?subject=${label.name} Mode`} className={`px-4 py-2 ${modeInfo.bgColor} rounded-lg text-white`}>{t.notify}</a>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            {t.help} <a href="mailto:science@diu-os.dev" className="text-purple-400 hover:underline">science@diu-os.dev</a>
          </p>
        </div>
      </div>
    </div>
  );
}
