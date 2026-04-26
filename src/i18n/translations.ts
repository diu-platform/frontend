// i18n/translations.ts
/**
 * DIU Physics Interactive — Multilingual Support
 * 8 Languages with complete translations
 */

export type Language = 'ru' | 'en' | 'es' | 'pt' | 'de' | 'fr' | 'zh' | 'ar';

export interface TranslationSet {
  ru: string; en: string; es: string; pt: string; de: string; fr: string; zh: string; ar: string;
}

export const LANGUAGES: Record<Language, { 
  name: string; nativeName: string; flag: string; rtl: boolean; verified: boolean; reviewNote?: string;
}> = {
  ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', rtl: false, verified: true },
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸', rtl: false, verified: true },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', rtl: false, verified: true },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', rtl: false, verified: true },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', rtl: false, verified: true },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷', rtl: false, verified: true },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳', rtl: false, verified: false, reviewNote: '需要母语人士审核' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true, verified: false, reviewNote: 'تحتاج مراجعة' },
};

type NestedTranslations = { [key: string]: TranslationSet | NestedTranslations; };

export const translations: NestedTranslations = {
  // HEADER
  title: { ru: '3D Квантовая Физика', en: '3D Quantum Physics', es: 'Física Cuántica 3D', pt: 'Física Quântica 3D', de: '3D-Quantenphysik', fr: 'Physique Quantique 3D', zh: '3D量子物理', ar: 'الفيزياء الكمية ثلاثية الأبعاد' },
  subtitle: { ru: 'Интерактивный туториал', en: 'Interactive Tutorial', es: 'Tutorial Interactivo', pt: 'Tutorial Interativo', de: 'Interaktives Tutorial', fr: 'Tutoriel Interactif', zh: '交互式教程', ar: 'برنامج تعليمي تفاعلي' },

  // CONTROLS - COMPLETE
  controls: {
    title: { ru: 'Управление', en: 'Controls', es: 'Controles', pt: 'Controles', de: 'Steuerung', fr: 'Contrôles', zh: '控制', ar: 'التحكم' },
    parameters: { ru: 'Параметры', en: 'Parameters', es: 'Parámetros', pt: 'Parâmetros', de: 'Parameter', fr: 'Paramètres', zh: '参数', ar: 'المعلمات' },
    wavelength: { ru: 'Длина волны', en: 'Wavelength', es: 'Longitud de Onda', pt: 'Comprimento de Onda', de: 'Wellenlänge', fr: 'Longueur d\'Onde', zh: '波长', ar: 'طول الموجة' },
    slitDistance: { ru: 'Расстояние щелей', en: 'Slit Distance', es: 'Distancia entre Rendijas', pt: 'Distância das Fendas', de: 'Spaltabstand', fr: 'Distance des Fentes', zh: '狭缝间距', ar: 'المسافة بين الشقوق' },
    slitWidth: { ru: 'Ширина щели', en: 'Slit Width', es: 'Ancho de Rendija', pt: 'Largura da Fenda', de: 'Spaltbreite', fr: 'Largeur de Fente', zh: '狭缝宽度', ar: 'عرض الشق' },
    intensity: { ru: 'Интенсивность', en: 'Intensity', es: 'Intensidad', pt: 'Intensidade', de: 'Intensität', fr: 'Intensité', zh: '强度', ar: 'الشدة' },
    coherence: { ru: 'Когерентность', en: 'Coherence', es: 'Coherencia', pt: 'Coerência', de: 'Kohärenz', fr: 'Cohérence', zh: '相干性', ar: 'التماسك' },
    detector: { ru: 'Детектор', en: 'Detector', es: 'Detector', pt: 'Detector', de: 'Detektor', fr: 'Détecteur', zh: '探测器', ar: 'الكاشف' },
    detectorOn: { ru: 'Детектор ВКЛ', en: 'Detector ON', es: 'Detector ACTIVADO', pt: 'Detector LIGADO', de: 'Detektor AN', fr: 'Détecteur ACTIVÉ', zh: '探测器开启', ar: 'الكاشف مُفعَّل' },
    detectorOff: { ru: 'Детектор ВЫКЛ', en: 'Detector OFF', es: 'Detector DESACTIVADO', pt: 'Detector DESLIGADO', de: 'Detektor AUS', fr: 'Détecteur DÉSACTIVÉ', zh: '探测器关闭', ar: 'الكاشف مُعطَّل' },
    reset: { ru: 'Сброс', en: 'Reset', es: 'Reiniciar', pt: 'Redefinir', de: 'Zurücksetzen', fr: 'Réinitialiser', zh: '重置', ar: 'إعادة تعيين' },
    // Additional controls
    slowMotion: { ru: 'Замедление', en: 'Slow Motion', es: 'Cámara Lenta', pt: 'Câmera Lenta', de: 'Zeitlupe', fr: 'Ralenti', zh: '慢动作', ar: 'حركة بطيئة' },
    sound: { ru: 'Звук', en: 'Sound', es: 'Sonido', pt: 'Som', de: 'Ton', fr: 'Son', zh: '声音', ar: 'صوت' },
    trails: { ru: 'Следы', en: 'Trails', es: 'Estelas', pt: 'Rastros', de: 'Spuren', fr: 'Traînées', zh: '轨迹', ar: 'المسارات' },
    heatmap: { ru: 'Тепловая карта', en: 'Heatmap', es: 'Mapa de Calor', pt: 'Mapa de Calor', de: 'Wärmebild', fr: 'Carte Thermique', zh: '热图', ar: 'خريطة حرارية' },
    points: { ru: 'Точки', en: 'Points', es: 'Puntos', pt: 'Pontos', de: 'Punkte', fr: 'Points', zh: '点', ar: 'نقاط' },
    theory: { ru: 'Теория', en: 'Theory', es: 'Teoría', pt: 'Teoria', de: 'Theorie', fr: 'Théorie', zh: '理论', ar: 'النظرية' },
    tip: { ru: '💡 Используйте мышь для вращения камеры', en: '💡 Use mouse to rotate camera', es: '💡 Usa el ratón para rotar', pt: '💡 Use o mouse para girar', de: '💡 Maus zum Drehen verwenden', fr: '💡 Utilisez la souris pour tourner', zh: '💡 使用鼠标旋转相机', ar: '💡 استخدم الماوس للتدوير' },
    // Slider hints
    narrowSlit: { ru: 'Узкая', en: 'Narrow', es: 'Estrecha', pt: 'Estreita', de: 'Eng', fr: 'Étroite', zh: '窄', ar: 'ضيق' },
    wideSlit: { ru: 'Широкая', en: 'Wide', es: 'Ancha', pt: 'Larga', de: 'Breit', fr: 'Large', zh: '宽', ar: 'واسع' },
    incoherent: { ru: 'Некогерентно', en: 'Incoherent', es: 'Incoherente', pt: 'Incoerente', de: 'Inkohärent', fr: 'Incohérent', zh: '非相干', ar: 'غير متماسك' },
    coherent: { ru: 'Когерентно', en: 'Coherent', es: 'Coherente', pt: 'Coerente', de: 'Kohärent', fr: 'Cohérent', zh: '相干', ar: 'متماسك' },
  },

  // STATISTICS
  stats: {
    title: { ru: 'Статистика', en: 'Statistics', es: 'Estadísticas', pt: 'Estatísticas', de: 'Statistik', fr: 'Statistiques', zh: '统计', ar: 'الإحصائيات' },
    particles: { ru: 'Частиц', en: 'Particles', es: 'Partículas', pt: 'Partículas', de: 'Teilchen', fr: 'Particules', zh: '粒子数', ar: 'الجسيمات' },
    fringes: { ru: 'Полос', en: 'Fringes', es: 'Franjas', pt: 'Franjas', de: 'Streifen', fr: 'Franges', zh: '条纹数', ar: 'الأهداب' },
    contrast: { ru: 'Контраст', en: 'Contrast', es: 'Contraste', pt: 'Contraste', de: 'Kontrast', fr: 'Contraste', zh: '对比度', ar: 'التباين' },
    pattern: { ru: 'Паттерн', en: 'Pattern', es: 'Patrón', pt: 'Padrão', de: 'Muster', fr: 'Motif', zh: '图样', ar: 'النمط' },
    distribution: { ru: 'Распределение на экране', en: 'Screen Distribution', es: 'Distribución en Pantalla', pt: 'Distribuição na Tela', de: 'Schirmverteilung', fr: 'Distribution sur Écran', zh: '屏幕分布', ar: 'التوزيع على الشاشة' },
  },

  // DISPLAY - Screen modes
  display: {
    screenMode: { ru: 'Режим экрана', en: 'Screen Mode', es: 'Modo de Pantalla', pt: 'Modo de Tela', de: 'Bildschirmmodus', fr: 'Mode d\'Écran', zh: '屏幕模式', ar: 'وضع الشاشة' },
    points: { ru: 'Точки', en: 'Points', es: 'Puntos', pt: 'Pontos', de: 'Punkte', fr: 'Points', zh: '点', ar: 'نقاط' },
    fringes: { ru: 'Полосы', en: 'Fringes', es: 'Franjas', pt: 'Franjas', de: 'Streifen', fr: 'Franges', zh: '条纹', ar: 'أهداب' },
    hybrid: { ru: 'Гибрид', en: 'Hybrid', es: 'Híbrido', pt: 'Híbrido', de: 'Hybrid', fr: 'Hybride', zh: '混合', ar: 'هجين' },
    heatmap: { ru: 'Тепловая карта', en: 'Heatmap', es: 'Mapa de Calor', pt: 'Mapa de Calor', de: 'Wärmebild', fr: 'Carte Thermique', zh: '热图', ar: 'خريطة حرارية' },
    opacity: { ru: 'Прозрачность', en: 'Opacity', es: 'Opacidad', pt: 'Opacidade', de: 'Deckkraft', fr: 'Opacité', zh: '不透明度', ar: 'الشفافية' },
    fullscreen: { ru: 'Полный экран', en: 'Fullscreen', es: 'Pantalla Completa', pt: 'Tela Cheia', de: 'Vollbild', fr: 'Plein Écran', zh: '全屏', ar: 'ملء الشاشة' },
    exit: { ru: 'Выйти', en: 'Exit', es: 'Salir', pt: 'Sair', de: 'Beenden', fr: 'Quitter', zh: '退出', ar: 'خروج' },
    help: { ru: 'Помощь', en: 'Help', es: 'Ayuda', pt: 'Ajuda', de: 'Hilfe', fr: 'Aide', zh: '帮助', ar: 'مساعدة' },
    // Help descriptions for each mode
    pointsHelp: { 
      ru: 'Режим "Точки" показывает отдельные попадания частиц на экран детектора. Каждая точка — это регистрация одной частицы. Со временем точки формируют интерференционную картину.',
      en: 'Points mode shows individual particle hits on the detector screen. Each dot is one particle detection. Over time, dots form the interference pattern.',
      es: 'El modo Puntos muestra los impactos individuales de partículas. Cada punto es una detección. Con el tiempo, forman el patrón de interferencia.',
      pt: 'O modo Pontos mostra impactos individuais de partículas. Cada ponto é uma detecção. Com o tempo, formam o padrão de interferência.',
      de: 'Der Punktemodus zeigt einzelne Teilchentreffer. Jeder Punkt ist eine Detektion. Mit der Zeit bilden sie das Interferenzmuster.',
      fr: 'Le mode Points montre les impacts individuels des particules. Chaque point est une détection. Avec le temps, ils forment le motif d\'interférence.',
      zh: '点模式显示单个粒子撞击探测器屏幕。每个点代表一次粒子检测。随着时间推移，点形成干涉图样。',
      ar: 'يُظهر وضع النقاط ضربات الجسيمات الفردية. كل نقطة هي كشف جسيم واحد. مع الوقت، تشكل نمط التداخل.',
    },
    fringesHelp: {
      ru: 'Режим "Полосы" показывает классическую интерференционную картину в виде светлых и тёмных полос. Яркость соответствует вероятности обнаружения частицы в данной точке.',
      en: 'Fringes mode shows the classic interference pattern as bright and dark bands. Brightness corresponds to the probability of detecting a particle at that location.',
      es: 'El modo Franjas muestra el patrón clásico de interferencia como bandas claras y oscuras. El brillo corresponde a la probabilidad de detección.',
      pt: 'O modo Franjas mostra o padrão clássico de interferência como faixas claras e escuras. O brilho corresponde à probabilidade de detecção.',
      de: 'Der Streifenmodus zeigt das klassische Interferenzmuster als helle und dunkle Bänder. Die Helligkeit entspricht der Detektionswahrscheinlichkeit.',
      fr: 'Le mode Franges montre le motif classique d\'interférence en bandes claires et sombres. La luminosité correspond à la probabilité de détection.',
      zh: '条纹模式以明暗条带显示经典干涉图样。亮度对应于在该位置检测到粒子的概率。',
      ar: 'يُظهر وضع الأهداب نمط التداخل الكلاسيكي كأشرطة فاتحة وداكنة. السطوع يتوافق مع احتمالية الكشف.',
    },
    hybridHelp: {
      ru: 'Гибридный режим сочетает оба представления: точки попаданий накладываются на тепловую карту интенсивности. Это позволяет видеть и отдельные события, и статистическое распределение.',
      en: 'Hybrid mode combines both views: particle hits are overlaid on the intensity heatmap. This allows seeing both individual events and statistical distribution.',
      es: 'El modo Híbrido combina ambas vistas: los impactos se superponen al mapa de calor. Permite ver eventos individuales y distribución estadística.',
      pt: 'O modo Híbrido combina ambas as visualizações: impactos são sobrepostos ao mapa de calor. Permite ver eventos individuais e distribuição estatística.',
      de: 'Der Hybridmodus kombiniert beide Ansichten: Treffer werden über die Wärmekarte gelegt. So sieht man Einzelereignisse und statistische Verteilung.',
      fr: 'Le mode Hybride combine les deux vues: les impacts sont superposés à la carte thermique. Cela permet de voir les événements individuels et la distribution.',
      zh: '混合模式结合两种视图：粒子撞击叠加在强度热图上。这样可以同时看到单个事件和统计分布。',
      ar: 'يجمع الوضع الهجين بين العرضين: تُركب ضربات الجسيمات على خريطة الحرارة. يسمح برؤية الأحداث الفردية والتوزيع الإحصائي.',
    },
    heatmapHelp: {
      ru: 'Тепловая карта показывает накопленную интенсивность интерференционной картины. Яркие области — максимумы конструктивной интерференции, тёмные — деструктивной.',
      en: 'Heatmap shows accumulated intensity of the interference pattern. Bright areas are constructive interference maxima, dark areas are destructive interference minima.',
      es: 'El mapa de calor muestra la intensidad acumulada. Las áreas brillantes son máximos de interferencia constructiva, las oscuras son mínimos destructivos.',
      pt: 'O mapa de calor mostra a intensidade acumulada. Áreas brilhantes são máximos de interferência construtiva, áreas escuras são mínimos destrutivos.',
      de: 'Die Wärmekarte zeigt die akkumulierte Intensität. Helle Bereiche sind konstruktive Maxima, dunkle Bereiche sind destruktive Minima.',
      fr: 'La carte thermique montre l\'intensité accumulée. Les zones claires sont des maxima constructifs, les zones sombres sont des minima destructifs.',
      zh: '热图显示干涉图样的累积强度。明亮区域是相长干涉极大值，暗区域是相消干涉极小值。',
      ar: 'تُظهر خريطة الحرارة الشدة المتراكمة. المناطق الساطعة هي قمم التداخل البناء، والمناطق المظلمة هي قيعان التداخل الهدام.',
    },
  },

  // THEORY
  theory: {
    title: { ru: 'Теория', en: 'Theory', es: 'Teoría', pt: 'Teoria', de: 'Theorie', fr: 'Théorie', zh: '理论', ar: 'النظرية' },
    doubleSlit: { ru: 'Двухщелевой эксперимент', en: 'Double-Slit Experiment', es: 'Experimento de Doble Rendija', pt: 'Experimento de Dupla Fenda', de: 'Doppelspaltexperiment', fr: 'Expérience de la Double Fente', zh: '双缝实验', ar: 'تجربة الشق المزدوج' },
    experiment: { ru: 'Эксперимент', en: 'Experiment', es: 'Experimento', pt: 'Experimento', de: 'Experiment', fr: 'Expérience', zh: '实验', ar: 'التجربة' },
    mathematics: { ru: 'Математика', en: 'Mathematics', es: 'Matemáticas', pt: 'Matemática', de: 'Mathematik', fr: 'Mathématiques', zh: '数学', ar: 'الرياضيات' },
    applications: { ru: 'Применения', en: 'Applications', es: 'Aplicaciones', pt: 'Aplicações', de: 'Anwendungen', fr: 'Applications', zh: '应用', ar: 'التطبيقات' },
    comparison: { ru: 'Теория vs Эксперимент', en: 'Theory vs Experiment', es: 'Teoría vs Experimento', pt: 'Teoria vs Experimento', de: 'Theorie vs Experiment', fr: 'Théorie vs Expérience', zh: '理论与实验对比', ar: 'النظرية مقابل التجربة' },
  },

  // RESEARCH
  research: {
    source: { ru: 'Источник', en: 'Source', es: 'Fuente', pt: 'Fonte', de: 'Quelle', fr: 'Source', zh: '光源', ar: 'المصدر' },
    geometry: { ru: 'Геометрия', en: 'Geometry', es: 'Geometría', pt: 'Geometria', de: 'Geometrie', fr: 'Géométrie', zh: '几何', ar: 'الهندسة' },
    detector: { ru: 'Детектор', en: 'Detector', es: 'Detector', pt: 'Detector', de: 'Detektor', fr: 'Détecteur', zh: '探测器', ar: 'الكاشف' },
    environment: { ru: 'Среда', en: 'Environment', es: 'Entorno', pt: 'Ambiente', de: 'Umgebung', fr: 'Environnement', zh: '环境', ar: 'البيئة' },
  },

  // COMMON
  common: {
    close: { ru: 'Закрыть', en: 'Close', es: 'Cerrar', pt: 'Fechar', de: 'Schließen', fr: 'Fermer', zh: '关闭', ar: 'إغلاق' },
    modeInfo: { ru: 'О режиме', en: 'Mode Info', es: 'Info del Modo', pt: 'Info do Modo', de: 'Modus-Info', fr: 'Info Mode', zh: '模式信息', ar: 'معلومات الوضع' },
    sources: { ru: 'Источники', en: 'Sources', es: 'Fuentes', pt: 'Fontes', de: 'Quellen', fr: 'Sources', zh: '来源', ar: 'المصادر' },
    help: { ru: 'Помощь', en: 'Help', es: 'Ayuda', pt: 'Ajuda', de: 'Hilfe', fr: 'Aide', zh: '帮助', ar: 'مساعدة' },
    loading: { ru: 'Загрузка...', en: 'Loading...', es: 'Cargando...', pt: 'Carregando...', de: 'Laden...', fr: 'Chargement...', zh: '加载中...', ar: 'جاري التحميل...' },
    error: { ru: 'Ошибка', en: 'Error', es: 'Error', pt: 'Erro', de: 'Fehler', fr: 'Erreur', zh: '错误', ar: 'خطأ' },
  },

  // CREDITS
  credits: {
    title: { ru: 'Научные источники', en: 'Scientific Sources', es: 'Fuentes Científicas', pt: 'Fontes Científicas', de: 'Wissenschaftliche Quellen', fr: 'Sources Scientifiques', zh: '科学来源', ar: 'المصادر العلمية' },
    quote: { ru: '"Мы стоим на плечах гигантов"', en: '"Standing on the shoulders of giants"', es: '"Sobre los hombros de gigantes"', pt: '"Sobre os ombros de gigantes"', de: '"Auf den Schultern von Riesen"', fr: '"Sur les épaules de géants"', zh: '"站在巨人的肩膀上"', ar: '"على أكتاف العمالقة"' },
    contribute: { ru: 'Внести вклад', en: 'Contribute', es: 'Contribuir', pt: 'Contribuir', de: 'Beitragen', fr: 'Contribuer', zh: '贡献', ar: 'المساهمة' },
  },

  // EXPERIMENTS
  experiments: {
    doubleSlit: { ru: 'Двухщелевой', en: 'Double Slit', es: 'Doble Rendija', pt: 'Dupla Fenda', de: 'Doppelspalt', fr: 'Double Fente', zh: '双缝', ar: 'الشق المزدوج' },
    tunneling: { ru: 'Туннелирование', en: 'Tunneling', es: 'Tunelización', pt: 'Tunelamento', de: 'Tunneleffekt', fr: 'Effet Tunnel', zh: '隧穿效应', ar: 'التأثير النفقي' },
    orbitals: { ru: 'Орбитали H', en: 'H Orbitals', es: 'Orbitales H', pt: 'Orbitais H', de: 'H-Orbitale', fr: 'Orbitales H', zh: 'H原子轨道', ar: 'مدارات H' },
  },

  // MODES
  mode: {
    demo: { ru: 'Демо', en: 'Demo', es: 'Demo', pt: 'Demo', de: 'Demo', fr: 'Démo', zh: '演示', ar: 'عرض' },
    lab: { ru: 'Лаборатория', en: 'Laboratory', es: 'Laboratorio', pt: 'Laboratório', de: 'Labor', fr: 'Laboratoire', zh: '实验室', ar: 'مختبر' },
    research: { ru: 'Исследование', en: 'Research', es: 'Investigación', pt: 'Pesquisa', de: 'Forschung', fr: 'Recherche', zh: '研究', ar: 'بحث' },
    simulation: { ru: 'Симуляция', en: 'Simulation', es: 'Simulación', pt: 'Simulação', de: 'Simulation', fr: 'Simulation', zh: '模拟', ar: 'محاكاة' },
    collaboration: { ru: 'Коллаборация', en: 'Collaboration', es: 'Colaboración', pt: 'Colaboração', de: 'Zusammenarbeit', fr: 'Collaboration', zh: '协作', ar: 'تعاون' },
    sandbox: { ru: 'Песочница', en: 'Sandbox', es: 'Sandbox', pt: 'Sandbox', de: 'Sandbox', fr: 'Bac à sable', zh: '沙盒', ar: 'صندوق الرمل' },
  },

  // QUIZ
  quiz: {
    title: { ru: 'Викторина', en: 'Quiz', es: 'Cuestionario', pt: 'Questionário', de: 'Quiz', fr: 'Quiz', zh: '测验', ar: 'اختبار' },
    question: { ru: 'Вопрос', en: 'Question', es: 'Pregunta', pt: 'Pergunta', de: 'Frage', fr: 'Question', zh: '问题', ar: 'سؤال' },
    correct: { ru: 'Правильно!', en: 'Correct!', es: '¡Correcto!', pt: 'Correto!', de: 'Richtig!', fr: 'Correct!', zh: '正确！', ar: 'صحيح!' },
    incorrect: { ru: 'Неправильно', en: 'Incorrect', es: 'Incorrecto', pt: 'Incorreto', de: 'Falsch', fr: 'Incorrect', zh: '错误', ar: 'خطأ' },
    next: { ru: 'Далее', en: 'Next', es: 'Siguiente', pt: 'Próximo', de: 'Weiter', fr: 'Suivant', zh: '下一个', ar: 'التالي' },
  },

  // UNITS
  units: {
    nm: { ru: 'нм', en: 'nm', es: 'nm', pt: 'nm', de: 'nm', fr: 'nm', zh: '纳米', ar: 'نانومتر' },
    mm: { ru: 'мм', en: 'mm', es: 'mm', pt: 'mm', de: 'mm', fr: 'mm', zh: '毫米', ar: 'ملم' },
    percent: { ru: '%', en: '%', es: '%', pt: '%', de: '%', fr: '%', zh: '%', ar: '%' },
  },
};

export function getTranslation(path: string, language: Language): string {
  const keys = path.split('.');
  let current: any = translations;
  for (const key of keys) {
    if (current[key] === undefined) return path;
    current = current[key];
  }
  return current[language] || current.en || path;
}
