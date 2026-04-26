// components/TheorySection.tsx - Multilingual Theory Reference
import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { BookOpen, Calculator, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface TheorySectionProps { observerOn: boolean; }
type Tab = 'experiment' | 'math' | 'applications';
type Lang = 'en' | 'ru' | 'es' | 'pt' | 'de' | 'fr' | 'zh' | 'ar';

const T: Record<string, Record<Lang, string>> = {
  title: { en: '📚 Theory: Double-Slit Experiment', ru: '📚 Теория: Двухщелевой эксперимент', es: '📚 Teoría: Experimento Doble Rendija', pt: '📚 Teoria: Experimento Dupla Fenda', de: '📚 Theorie: Doppelspalt-Experiment', fr: '📚 Théorie: Expérience Double Fente', zh: '📚 理论：双缝实验', ar: '📚 النظرية: تجربة الشق المزدوج' },
  tabExperiment: { en: 'Experiment', ru: 'Эксперимент', es: 'Experimento', pt: 'Experimento', de: 'Experiment', fr: 'Expérience', zh: '实验', ar: 'التجربة' },
  tabMath: { en: 'Mathematics', ru: 'Математика', es: 'Matemáticas', pt: 'Matemática', de: 'Mathematik', fr: 'Mathématiques', zh: '数学', ar: 'الرياضيات' },
  tabApps: { en: 'Applications', ru: 'Применения', es: 'Aplicaciones', pt: 'Aplicações', de: 'Anwendungen', fr: 'Applications', zh: '应用', ar: 'التطبيقات' },
  // Experiment tab
  historyTitle: { en: '🔬 Historical Background', ru: '🔬 Историческая справка', es: '🔬 Antecedentes Históricos', pt: '🔬 Contexto Histórico', de: '🔬 Historischer Hintergrund', fr: '🔬 Contexte Historique', zh: '🔬 历史背景', ar: '🔬 الخلفية التاريخية' },
  historyText: { en: 'The double-slit experiment was first performed by Thomas Young in 1801 for light. The quantum version with single particles is the most profound experiment in physics history.', ru: 'Двухщелевой эксперимент впервые проведён Томасом Юнгом в 1801 году для света. Квантовая версия с одиночными частицами — самый глубокий эксперимент в истории физики.', es: 'El experimento de doble rendija fue realizado por Thomas Young en 1801. La versión cuántica con partículas individuales es el experimento más profundo de la física.', pt: 'O experimento de dupla fenda foi realizado por Thomas Young em 1801. A versão quântica com partículas individuais é o experimento mais profundo da física.', de: 'Das Doppelspalt-Experiment wurde 1801 von Thomas Young durchgeführt. Die Quantenversion mit Einzelteilchen ist das tiefgründigste Experiment der Physik.', fr: 'L\'expérience de la double fente a été réalisée par Thomas Young en 1801. La version quantique avec des particules uniques est l\'expérience la plus profonde de la physique.', zh: '双缝实验由托马斯·杨于1801年首次进行。单粒子量子版本是物理学史上最深刻的实验。', ar: 'أجرى توماس يونغ تجربة الشق المزدوج لأول مرة عام 1801. النسخة الكمية مع الجسيمات المفردة هي أعمق تجربة في تاريخ الفيزياء.' },
  classicalTitle: { en: 'Classical Expectation', ru: 'Классическое ожидание', es: 'Expectativa Clásica', pt: 'Expectativa Clássica', de: 'Klassische Erwartung', fr: 'Attente Classique', zh: '经典预期', ar: 'التوقع الكلاسيكي' },
  classicalText: { en: 'Particles as balls → two bands opposite slits', ru: 'Частицы как шарики → две полосы напротив щелей', es: 'Partículas como bolas → dos bandas frente a rendijas', pt: 'Partículas como bolas → duas faixas opostas às fendas', de: 'Teilchen als Kugeln → zwei Streifen gegenüber Spalten', fr: 'Particules comme billes → deux bandes face aux fentes', zh: '粒子如球→两条条纹对着狭缝', ar: 'الجسيمات ككرات ← شريطان مقابل الشقوق' },
  quantumTitle: { en: 'Quantum Reality', ru: 'Квантовая реальность', es: 'Realidad Cuántica', pt: 'Realidade Quântica', de: 'Quantenrealität', fr: 'Réalité Quantique', zh: '量子现实', ar: 'الواقع الكمي' },
  quantumText: { en: 'Interference pattern → alternating bands!', ru: 'Интерференционная картина → чередование полос!', es: '¡Patrón de interferencia → bandas alternadas!', pt: 'Padrão de interferência → bandas alternadas!', de: 'Interferenzmuster → abwechselnde Streifen!', fr: 'Motif d\'interférence → bandes alternées!', zh: '干涉图样→交替条纹！', ar: 'نمط التداخل ← أشرطة متناوبة!' },
  observerOn: { en: '👁 Observer Effect (active)', ru: '👁 Эффект наблюдателя (активен)', es: '👁 Efecto Observador (activo)', pt: '👁 Efeito Observador (ativo)', de: '👁 Beobachtereffekt (aktiv)', fr: '👁 Effet Observateur (actif)', zh: '👁 观察者效应（激活）', ar: '👁 تأثير المراقب (نشط)' },
  observerOff: { en: '🌊 Superposition Principle (active)', ru: '🌊 Принцип суперпозиции (активен)', es: '🌊 Principio de Superposición (activo)', pt: '🌊 Princípio de Superposição (ativo)', de: '🌊 Superpositionsprinzip (aktiv)', fr: '🌊 Principe de Superposition (actif)', zh: '🌊 叠加原理（激活）', ar: '🌊 مبدأ التراكب (نشط)' },
  observerOnText: { en: 'Measurement determines which slit the particle passed through. The wave function collapses, interference disappears.', ru: 'Измерение определяет, через какую щель прошла частица. Волновая функция коллапсирует, интерференция исчезает.', es: 'La medición determina por qué rendija pasó la partícula. La función de onda colapsa, la interferencia desaparece.', pt: 'A medição determina por qual fenda a partícula passou. A função de onda colapsa, a interferência desaparece.', de: 'Die Messung bestimmt, durch welchen Spalt das Teilchen ging. Die Wellenfunktion kollabiert, Interferenz verschwindet.', fr: 'La mesure détermine par quelle fente la particule est passée. La fonction d\'onde s\'effondre, l\'interférence disparaît.', zh: '测量决定粒子通过哪条狭缝。波函数坍缩，干涉消失。', ar: 'القياس يحدد أي شق مرت منه الجسيمة. تنهار دالة الموجة، يختفي التداخل.' },
  observerOffText: { en: 'The particle passes through BOTH slits simultaneously! Wave function is a superposition: Ψ = ψ₁ + ψ₂.', ru: 'Частица проходит через ОБЕ щели одновременно! Волновая функция — суперпозиция: Ψ = ψ₁ + ψ₂.', es: '¡La partícula pasa por AMBAS rendijas simultáneamente! Función de onda: Ψ = ψ₁ + ψ₂.', pt: 'A partícula passa por AMBAS as fendas simultaneamente! Função de onda: Ψ = ψ₁ + ψ₂.', de: 'Das Teilchen passiert BEIDE Spalte gleichzeitig! Wellenfunktion: Ψ = ψ₁ + ψ₂.', fr: 'La particule passe par LES DEUX fentes simultanément! Fonction d\'onde: Ψ = ψ₁ + ψ₂.', zh: '粒子同时通过两条狭缝！波函数叠加：Ψ = ψ₁ + ψ₂。', ar: 'الجسيمة تمر عبر كلا الشقين في وقت واحد! دالة الموجة: Ψ = ψ₁ + ψ₂.' },
  keyParams: { en: '💡 Key Parameters', ru: '💡 Ключевые параметры', es: '💡 Parámetros Clave', pt: '💡 Parâmetros Chave', de: '💡 Schlüsselparameter', fr: '💡 Paramètres Clés', zh: '💡 关键参数', ar: '💡 المعلمات الرئيسية' },
  wavelengthParam: { en: 'Wavelength λ → fringe width', ru: 'Длина волны λ → ширина полос', es: 'Longitud de onda λ → ancho de franjas', pt: 'Comprimento de onda λ → largura das franjas', de: 'Wellenlänge λ → Streifenbreite', fr: 'Longueur d\'onde λ → largeur des franges', zh: '波长 λ → 条纹宽度', ar: 'طول الموجة λ ← عرض الأهداب' },
  slitDistParam: { en: 'Slit distance d → fringe count', ru: 'Расстояние щелей d → количество полос', es: 'Distancia de rendijas d → número de franjas', pt: 'Distância das fendas d → número de franjas', de: 'Spaltabstand d → Streifenanzahl', fr: 'Distance des fentes d → nombre de franges', zh: '狭缝间距 d → 条纹数量', ar: 'المسافة بين الشقوق d ← عدد الأهداب' },
  slitWidthParam: { en: 'Slit width a → pattern clarity', ru: 'Ширина щелей a → чёткость картины', es: 'Ancho de rendija a → claridad del patrón', pt: 'Largura da fenda a → clareza do padrão', de: 'Spaltbreite a → Musterklarheit', fr: 'Largeur de fente a → clarté du motif', zh: '狭缝宽度 a → 图样清晰度', ar: 'عرض الشق a ← وضوح النمط' },
  barrierParam: { en: 'Barrier thickness t → angular selection', ru: 'Толщина барьера t → угловая селекция', es: 'Grosor de barrera t → selección angular', pt: 'Espessura da barreira t → seleção angular', de: 'Barrieredicke t → Winkelauswahl', fr: 'Épaisseur de barrière t → sélection angulaire', zh: '屏障厚度 t → 角度选择', ar: 'سمك الحاجز t ← الاختيار الزاوي' },
  // Math tab
  interferenceFormula: { en: '📐 Interference Formula', ru: '📐 Формула интерференции', es: '📐 Fórmula de Interferencia', pt: '📐 Fórmula de Interferência', de: '📐 Interferenzformel', fr: '📐 Formule d\'Interférence', zh: '📐 干涉公式', ar: '📐 صيغة التداخل' },
  maxima: { en: 'Maxima (bright fringes)', ru: 'Максимумы (светлые полосы)', es: 'Máximos (franjas brillantes)', pt: 'Máximos (franjas brilhantes)', de: 'Maxima (helle Streifen)', fr: 'Maxima (franges brillantes)', zh: '极大值（亮条纹）', ar: 'الحد الأقصى (الأهداب الساطعة)' },
  minima: { en: 'Minima (dark fringes)', ru: 'Минимумы (тёмные полосы)', es: 'Mínimos (franjas oscuras)', pt: 'Mínimos (franjas escuras)', de: 'Minima (dunkle Streifen)', fr: 'Minima (franges sombres)', zh: '极小值（暗条纹）', ar: 'الحد الأدنى (الأهداب المظلمة)' },
  intensityDist: { en: '📊 Intensity Distribution', ru: '📊 Распределение интенсивности', es: '📊 Distribución de Intensidad', pt: '📊 Distribuição de Intensidade', de: '📊 Intensitätsverteilung', fr: '📊 Distribution d\'Intensité', zh: '📊 强度分布', ar: '📊 توزيع الشدة' },
  visibilityFormula: { en: '🎯 Visibility Formula', ru: '🎯 Формула видности', es: '🎯 Fórmula de Visibilidad', pt: '🎯 Fórmula de Visibilidade', de: '🎯 Sichtbarkeitsformel', fr: '🎯 Formule de Visibilité', zh: '🎯 可见度公式', ar: '🎯 صيغة الرؤية' },
  angularCutoff: { en: '📐 Angular Cutoff (Thick Barrier)', ru: '📐 Угловое ограничение (толстый барьер)', es: '📐 Corte Angular (Barrera Gruesa)', pt: '📐 Corte Angular (Barreira Grossa)', de: '📐 Winkelabschnitt (Dicke Barriere)', fr: '📐 Coupure Angulaire (Barrière Épaisse)', zh: '📐 角度截止（厚屏障）', ar: '📐 القطع الزاوي (حاجز سميك)' },
  angularNote: { en: 'Thick barrier blocks large angles, acts as collimator', ru: 'Толстый барьер блокирует большие углы, работает как коллиматор', es: 'La barrera gruesa bloquea ángulos grandes, actúa como colimador', pt: 'Barreira grossa bloqueia grandes ângulos, atua como colimador', de: 'Dicke Barriere blockiert große Winkel, wirkt als Kollimator', fr: 'La barrière épaisse bloque les grands angles, agit comme collimateur', zh: '厚屏障阻挡大角度，起准直器作用', ar: 'الحاجز السميك يحجب الزوايا الكبيرة، يعمل كموحد' },
  // Applications tab
  quantumComputing: { en: '💻 Quantum Computing', ru: '💻 Квантовые компьютеры', es: '💻 Computación Cuántica', pt: '💻 Computação Quântica', de: '💻 Quantencomputer', fr: '💻 Informatique Quantique', zh: '💻 量子计算', ar: '💻 الحوسبة الكمية' },
  quantumComputingText: { en: 'Superposition enables qubits to exist in multiple states simultaneously, exponentially increasing computational power.', ru: 'Суперпозиция позволяет кубитам существовать в нескольких состояниях одновременно, экспоненциально увеличивая вычислительную мощность.', es: 'La superposición permite que los qubits existan en múltiples estados simultáneamente.', pt: 'A superposição permite que qubits existam em múltiplos estados simultaneamente.', de: 'Superposition ermöglicht Qubits, in mehreren Zuständen gleichzeitig zu existieren.', fr: 'La superposition permet aux qubits d\'exister dans plusieurs états simultanément.', zh: '叠加态使量子比特可以同时存在于多个状态，指数级提升计算能力。', ar: 'يتيح التراكب للكيوبتات الوجود في حالات متعددة في وقت واحد.' },
  electronMicroscopy: { en: '🔬 Electron Microscopy', ru: '🔬 Электронная микроскопия', es: '🔬 Microscopía Electrónica', pt: '🔬 Microscopia Eletrônica', de: '🔬 Elektronenmikroskopie', fr: '🔬 Microscopie Électronique', zh: '🔬 电子显微镜', ar: '🔬 المجهر الإلكتروني' },
  electronMicroscopyText: { en: 'Wave-particle duality of electrons enables atomic-resolution imaging.', ru: 'Корпускулярно-волновой дуализм электронов обеспечивает атомарное разрешение.', es: 'La dualidad onda-partícula de los electrones permite imágenes de resolución atómica.', pt: 'A dualidade onda-partícula dos elétrons permite imagens de resolução atômica.', de: 'Welle-Teilchen-Dualität ermöglicht atomare Auflösung.', fr: 'La dualité onde-particule permet une résolution atomique.', zh: '电子的波粒二象性实现原子分辨率成像。', ar: 'ازدواجية الموجة والجسيم للإلكترونات تمكن التصوير بدقة ذرية.' },
  cryptography: { en: '🔐 Quantum Cryptography', ru: '🔐 Квантовая криптография', es: '🔐 Criptografía Cuántica', pt: '🔐 Criptografia Quântica', de: '🔐 Quantenkryptographie', fr: '🔐 Cryptographie Quantique', zh: '🔐 量子密码学', ar: '🔐 التشفير الكمي' },
  cryptographyText: { en: 'Observer effect guarantees detection of eavesdropping attempts in quantum key distribution.', ru: 'Эффект наблюдателя гарантирует обнаружение попыток перехвата в квантовом распределении ключей.', es: 'El efecto observador garantiza la detección de intentos de espionaje.', pt: 'O efeito observador garante a detecção de tentativas de interceptação.', de: 'Beobachtereffekt garantiert Erkennung von Abhörversuchen.', fr: 'L\'effet observateur garantit la détection des tentatives d\'écoute.', zh: '观察者效应保证量子密钥分发中窃听尝试的检测。', ar: 'تأثير المراقب يضمن اكتشاف محاولات التنصت.' },
  sensors: { en: '📡 Quantum Sensors', ru: '📡 Квантовые сенсоры', es: '📡 Sensores Cuánticos', pt: '📡 Sensores Quânticos', de: '📡 Quantensensoren', fr: '📡 Capteurs Quantiques', zh: '📡 量子传感器', ar: '📡 المستشعرات الكمية' },
  sensorsText: { en: 'Interferometry enables ultra-precise measurements of gravity, magnetic fields, and time.', ru: 'Интерферометрия обеспечивает сверхточные измерения гравитации, магнитных полей и времени.', es: 'La interferometría permite mediciones ultraprecisas de gravedad y campos magnéticos.', pt: 'A interferometria permite medições ultraprecisas de gravidade e campos magnéticos.', de: 'Interferometrie ermöglicht ultrapräzise Messungen von Gravitation und Magnetfeldern.', fr: 'L\'interférométrie permet des mesures ultra-précises de la gravité et des champs magnétiques.', zh: '干涉测量实现重力、磁场和时间的超精密测量。', ar: 'قياس التداخل يتيح قياسات فائقة الدقة للجاذبية والمجالات المغناطيسية.' },
  // Quantum Statistics section
  quantumStatsTitle: { en: '🎲 Quantum Statistics', ru: '🎲 Квантовая статистика', es: '🎲 Estadística Cuántica', pt: '🎲 Estatística Quântica', de: '🎲 Quantenstatistik', fr: '🎲 Statistique Quantique', zh: '🎲 量子统计', ar: '🎲 الإحصائيات الكمية' },
  bornRule: { en: 'Born Rule: P(x) = |Ψ(x)|²', ru: 'Правило Борна: P(x) = |Ψ(x)|²', es: 'Regla de Born: P(x) = |Ψ(x)|²', pt: 'Regra de Born: P(x) = |Ψ(x)|²', de: 'Born-Regel: P(x) = |Ψ(x)|²', fr: 'Règle de Born: P(x) = |Ψ(x)|²', zh: '玻恩定则: P(x) = |Ψ(x)|²', ar: 'قاعدة بورن: P(x) = |Ψ(x)|²' },
  bornExplain: { en: 'Probability density = square of wave function amplitude', ru: 'Плотность вероятности = квадрат амплитуды волновой функции', es: 'Densidad de probabilidad = cuadrado de la amplitud de la función de onda', pt: 'Densidade de probabilidade = quadrado da amplitude da função de onda', de: 'Wahrscheinlichkeitsdichte = Quadrat der Wellenfunktionsamplitude', fr: 'Densité de probabilité = carré de l\'amplitude de la fonction d\'onde', zh: '概率密度 = 波函数振幅的平方', ar: 'كثافة الاحتمال = مربع سعة دالة الموجة' },
  statisticalNature: { en: 'Pattern forms statistically — individual outcomes are random, but distribution follows |Ψ|²', ru: 'Паттерн формируется статистически — отдельные исходы случайны, но распределение следует |Ψ|²', es: 'El patrón se forma estadísticamente — los resultados individuales son aleatorios', pt: 'O padrão se forma estatisticamente — resultados individuais são aleatórios', de: 'Muster bildet sich statistisch — Einzelergebnisse sind zufällig', fr: 'Le motif se forme statistiquement — les résultats individuels sont aléatoires', zh: '图样统计性形成——单次结果随机，但分布遵循|Ψ|²', ar: 'النمط يتشكل إحصائيًا — النتائج الفردية عشوائية' },
  confidenceFormula: { en: 'Statistical confidence: C = 1 - 1/√N', ru: 'Статистическая достоверность: C = 1 - 1/√N', es: 'Confianza estadística: C = 1 - 1/√N', pt: 'Confiança estatística: C = 1 - 1/√N', de: 'Statistische Konfidenz: C = 1 - 1/√N', fr: 'Confiance statistique: C = 1 - 1/√N', zh: '统计置信度: C = 1 - 1/√N', ar: 'الثقة الإحصائية: C = 1 - 1/√N' },
  lowNnormal: { en: 'Low particle count → high variance is NORMAL quantum behavior!', ru: 'Мало частиц → высокая дисперсия — это НОРМАЛЬНОЕ квантовое поведение!', es: 'Pocas partículas → alta varianza es comportamiento cuántico NORMAL', pt: 'Poucas partículas → alta variância é comportamento quântico NORMAL', de: 'Wenige Teilchen → hohe Varianz ist NORMALES Quantenverhalten!', fr: 'Peu de particules → variance élevée est un comportement quantique NORMAL!', zh: '粒子数少 → 高方差是正常量子行为！', ar: 'عدد قليل من الجسيمات ← التباين العالي هو سلوك كمي طبيعي!' },
};

const g = (key: string, lang: string): string => T[key]?.[lang as Lang] || T[key]?.en || key;

export function TheorySection({ observerOn }: TheorySectionProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('experiment');
  const [expanded, setExpanded] = useState(true);

  const tabs = [
    { id: 'experiment' as Tab, icon: <BookOpen size={14} />, label: g('tabExperiment', language) },
    { id: 'math' as Tab, icon: <Calculator size={14} />, label: g('tabMath', language) },
    { id: 'applications' as Tab, icon: <Lightbulb size={14} />, label: g('tabApps', language) },
  ];

  return (
    <div className="bg-indigo-900/60 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-indigo-500/30 h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-indigo-800/30 transition-colors flex-shrink-0" onClick={() => setExpanded(!expanded)}>
        <h3 className="text-lg font-semibold text-white">{g('title', language)}</h3>
        {expanded ? <ChevronUp size={20} className="text-indigo-300" /> : <ChevronDown size={20} className="text-indigo-300" />}
      </div>
      {expanded && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex gap-1 px-4 pb-2 flex-shrink-0">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id ? 'bg-purple-500/30 text-purple-300 border border-purple-400/40' : 'text-indigo-300 hover:text-white hover:bg-indigo-700/50'}`}>
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>
          <div className="px-4 pb-4 flex-1 overflow-y-auto">
            {activeTab === 'experiment' && <ExperimentContent observerOn={observerOn} lang={language} />}
            {activeTab === 'math' && <MathContent lang={language} />}
            {activeTab === 'applications' && <ApplicationsContent lang={language} />}
          </div>
        </div>
      )}
    </div>
  );
}

function ExperimentContent({ observerOn, lang }: { observerOn: boolean; lang: string }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-blue-400 font-medium mb-2">{g('historyTitle', lang)}</h4>
        <p className="text-gray-300 leading-relaxed">{g('historyText', lang)}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-800/50 rounded-lg p-3">
          <h5 className="text-orange-400 font-medium mb-1 text-xs">{g('classicalTitle', lang)}</h5>
          <p className="text-gray-400 text-xs">{g('classicalText', lang)}</p>
        </div>
        <div className="bg-gray-800/50 rounded-lg p-3">
          <h5 className="text-cyan-400 font-medium mb-1 text-xs">{g('quantumTitle', lang)}</h5>
          <p className="text-gray-400 text-xs">{g('quantumText', lang)}</p>
        </div>
      </div>
      <div className={`rounded-lg p-3 border ${observerOn ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/10 border-blue-500/30'}`}>
        <h4 className={`font-medium mb-2 ${observerOn ? 'text-red-400' : 'text-blue-400'}`}>
          {observerOn ? g('observerOn', lang) : g('observerOff', lang)}
        </h4>
        <p className="text-gray-300 text-xs leading-relaxed">
          {observerOn ? g('observerOnText', lang) : g('observerOffText', lang)}
        </p>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-purple-400 font-medium mb-2">{g('keyParams', lang)}</h4>
        <div className="space-y-2 text-xs">
          <div className="text-gray-300">{g('wavelengthParam', lang)}</div>
          <div className="text-gray-300">{g('slitDistParam', lang)}</div>
          <div className="text-gray-300">{g('slitWidthParam', lang)}</div>
          <div className="text-gray-300">{g('barrierParam', lang)}</div>
        </div>
      </div>
    </div>
  );
}

function MathContent({ lang }: { lang: string }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-blue-400 font-medium mb-2">{g('interferenceFormula', lang)}</h4>
        <div className="space-y-2 text-xs">
          <div className="bg-gray-900/50 p-2 rounded font-mono text-center text-green-400">d·sin(θ) = m·λ</div>
          <p className="text-gray-400">{g('maxima', lang)}: m = 0, ±1, ±2, ...</p>
          <div className="bg-gray-900/50 p-2 rounded font-mono text-center text-red-400">d·sin(θ) = (m+½)·λ</div>
          <p className="text-gray-400">{g('minima', lang)}: m = 0, ±1, ±2, ...</p>
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-purple-400 font-medium mb-2">{g('intensityDist', lang)}</h4>
        <div className="bg-gray-900/50 p-2 rounded font-mono text-center text-cyan-400 text-xs">
          I(θ) = I₀·cos²(πd·sin(θ)/λ)·sinc²(πa·sin(θ)/λ)
        </div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-amber-400 font-medium mb-2">{g('angularCutoff', lang)}</h4>
        <div className="bg-gray-900/50 p-2 rounded font-mono text-center text-amber-400 text-xs">
          θ_max = arctan(a/t)
        </div>
        <p className="text-gray-400 text-xs mt-2">{g('angularNote', lang)}</p>
        <div className="text-gray-500 text-xs mt-1">a = slit width, t = barrier thickness</div>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-orange-400 font-medium mb-2">{g('visibilityFormula', lang)}</h4>
        <div className="bg-gray-900/50 p-2 rounded font-mono text-center text-yellow-400 text-xs">
          V = (I_max - I_min) / (I_max + I_min)
        </div>
      </div>
      {/* Quantum Statistics */}
      <div className="bg-purple-800/30 rounded-lg p-3 border border-purple-500/20">
        <h4 className="text-purple-400 font-medium mb-2">{g('quantumStatsTitle', lang)}</h4>
        <div className="bg-gray-900/50 p-2 rounded font-mono text-center text-purple-400 text-xs mb-2">
          {g('bornRule', lang)}
        </div>
        <p className="text-gray-400 text-xs mb-2">{g('bornExplain', lang)}</p>
        <div className="bg-gray-900/50 p-2 rounded font-mono text-center text-cyan-400 text-xs mb-2">
          {g('confidenceFormula', lang)}
        </div>
        <p className="text-gray-400 text-xs mb-1">{g('statisticalNature', lang)}</p>
        <p className="text-yellow-400/80 text-xs font-medium">{g('lowNnormal', lang)}</p>
      </div>
    </div>
  );
}

function ApplicationsContent({ lang }: { lang: string }) {
  return (
    <div className="space-y-3 text-sm">
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-blue-400 font-medium mb-1">{g('quantumComputing', lang)}</h4>
        <p className="text-gray-400 text-xs">{g('quantumComputingText', lang)}</p>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-green-400 font-medium mb-1">{g('electronMicroscopy', lang)}</h4>
        <p className="text-gray-400 text-xs">{g('electronMicroscopyText', lang)}</p>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-purple-400 font-medium mb-1">{g('cryptography', lang)}</h4>
        <p className="text-gray-400 text-xs">{g('cryptographyText', lang)}</p>
      </div>
      <div className="bg-gray-800/50 rounded-lg p-3">
        <h4 className="text-orange-400 font-medium mb-1">{g('sensors', lang)}</h4>
        <p className="text-gray-400 text-xs">{g('sensorsText', lang)}</p>
      </div>
    </div>
  );
}
