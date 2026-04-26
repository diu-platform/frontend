// components/QuizPanel.tsx - Multilingual Quiz
import { useState, useMemo } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { CheckCircle, XCircle, HelpCircle, ChevronRight, RotateCcw, Award } from 'lucide-react';
import type { DoubleSlitStats, DoubleSlitParams } from '../simulations/DoubleSlit';

interface QuizPanelProps { stats: DoubleSlitStats; params: DoubleSlitParams; }
type L = Record<string, string>;

const UI: Record<string, L> = {
  title: { en: '🎯 Quiz', ru: '🎯 Викторина', es: '🎯 Cuestionario', pt: '🎯 Quiz', de: '🎯 Quiz', fr: '🎯 Quiz', zh: '🎯 测验', ar: '🎯 اختبار' },
  score: { en: 'Score', ru: 'Счёт', es: 'Puntuación', pt: 'Pontuação', de: 'Punktzahl', fr: 'Score', zh: '分数', ar: 'النتيجة' },
  question: { en: 'Question', ru: 'Вопрос', es: 'Pregunta', pt: 'Pergunta', de: 'Frage', fr: 'Question', zh: '问题', ar: 'سؤال' },
  locked: { en: '🔒 Complete experiment to unlock', ru: '🔒 Выполните эксперимент', es: '🔒 Complete el experimento', pt: '🔒 Complete o experimento', de: '🔒 Experiment abschließen', fr: '🔒 Terminez l\'expérience', zh: '🔒 完成实验解锁', ar: '🔒 أكمل التجربة' },
  correct: { en: '✓ Correct!', ru: '✓ Правильно!', es: '✓ ¡Correcto!', pt: '✓ Correto!', de: '✓ Richtig!', fr: '✓ Correct!', zh: '✓ 正确！', ar: '✓ صحيح!' },
  wrong: { en: '✗ Incorrect', ru: '✗ Неверно', es: '✗ Incorrecto', pt: '✗ Incorreto', de: '✗ Falsch', fr: '✗ Incorrect', zh: '✗ 错误', ar: '✗ خطأ' },
  next: { en: 'Next', ru: 'Далее', es: 'Siguiente', pt: 'Próximo', de: 'Weiter', fr: 'Suivant', zh: '下一题', ar: 'التالي' },
  restart: { en: 'Restart', ru: 'Заново', es: 'Reiniciar', pt: 'Reiniciar', de: 'Neustart', fr: 'Recommencer', zh: '重新开始', ar: 'إعادة البدء' },
  complete: { en: '🏆 Quiz Complete!', ru: '🏆 Викторина завершена!', es: '🏆 ¡Cuestionario Completo!', pt: '🏆 Quiz Completo!', de: '🏆 Quiz Abgeschlossen!', fr: '🏆 Quiz Terminé!', zh: '🏆 测验完成！', ar: '🏆 اكتمل الاختبار!' },
  yourScore: { en: 'Your score', ru: 'Ваш результат', es: 'Tu puntuación', pt: 'Sua pontuação', de: 'Ihre Punktzahl', fr: 'Votre score', zh: '您的分数', ar: 'نتيجتك' },
};

interface Q { q: L; opts: L[]; correct: number; expl: L; unlock?: (s: DoubleSlitStats, p: DoubleSlitParams) => boolean; }

const questions: Q[] = [
  {
    q: { en: 'What happens to a particle passing through the double-slit without observation?', ru: 'Что происходит с частицей при прохождении через двухщелевую систему без наблюдения?', es: '¿Qué sucede con una partícula al pasar por la doble rendija sin observación?', pt: 'O que acontece com uma partícula passando pela dupla fenda sem observação?', de: 'Was passiert mit einem Teilchen beim Durchgang ohne Beobachtung?', fr: 'Que se passe-t-il avec une particule passant sans observation?', zh: '粒子在没有观察的情况下通过双缝会发生什么？', ar: 'ماذا يحدث للجسيمة عند المرور بدون مراقبة؟' },
    opts: [
      { en: 'Passes through one slit only', ru: 'Проходит только через одну щель', es: 'Pasa por una sola rendija', pt: 'Passa por uma fenda apenas', de: 'Geht nur durch einen Spalt', fr: 'Passe par une seule fente', zh: '只通过一条狭缝', ar: 'يمر عبر شق واحد فقط' },
      { en: 'Passes through both slits simultaneously', ru: 'Проходит через обе щели одновременно', es: 'Pasa por ambas rendijas simultáneamente', pt: 'Passa por ambas as fendas simultaneamente', de: 'Geht durch beide Spalte gleichzeitig', fr: 'Passe par les deux fentes simultanément', zh: '同时通过两条狭缝', ar: 'يمر عبر كلا الشقين في وقت واحد' },
      { en: 'Reflects off the barrier', ru: 'Отражается от барьера', es: 'Se refleja en la barrera', pt: 'Reflete na barreira', de: 'Reflektiert an der Barriere', fr: 'Se réfléchit sur la barrière', zh: '从屏障反射', ar: 'ينعكس عن الحاجز' },
      { en: 'Disappears', ru: 'Исчезает', es: 'Desaparece', pt: 'Desaparece', de: 'Verschwindet', fr: 'Disparaît', zh: '消失', ar: 'يختفي' },
    ],
    correct: 1,
    expl: { en: 'In quantum mechanics, the particle is in superposition — passing through both slits simultaneously until measured.', ru: 'В квантовой механике частица находится в суперпозиции — проходит через обе щели одновременно до измерения.', es: 'En mecánica cuántica, la partícula está en superposición — pasa por ambas rendijas hasta ser medida.', pt: 'Na mecânica quântica, a partícula está em superposição — passa por ambas as fendas até ser medida.', de: 'In der Quantenmechanik ist das Teilchen in Superposition — es geht durch beide Spalte bis zur Messung.', fr: 'En mécanique quantique, la particule est en superposition — passant par les deux fentes jusqu\'à la mesure.', zh: '在量子力学中，粒子处于叠加态——同时通过两条狭缝，直到被测量。', ar: 'في ميكانيكا الكم، الجسيمة في حالة تراكب — تمر عبر كلا الشقين حتى القياس.' },
  },
  {
    q: { en: 'Why does the interference pattern disappear when the detector is on?', ru: 'Почему интерференционная картина исчезает при включении детектора?', es: '¿Por qué desaparece el patrón cuando se enciende el detector?', pt: 'Por que o padrão desaparece quando o detector está ligado?', de: 'Warum verschwindet das Muster bei eingeschaltetem Detektor?', fr: 'Pourquoi le motif disparaît quand le détecteur est allumé?', zh: '为什么探测器打开时干涉图样会消失？', ar: 'لماذا يختفي النمط عند تشغيل الكاشف؟' },
    opts: [
      { en: 'Detector blocks particles', ru: 'Детектор блокирует частицы', es: 'El detector bloquea partículas', pt: 'O detector bloqueia partículas', de: 'Detektor blockiert Teilchen', fr: 'Le détecteur bloque les particules', zh: '探测器阻挡粒子', ar: 'الكاشف يحجب الجسيمات' },
      { en: 'Measurement destroys superposition', ru: 'Измерение разрушает суперпозицию', es: 'La medición destruye la superposición', pt: 'A medição destrói a superposição', de: 'Messung zerstört Superposition', fr: 'La mesure détruit la superposition', zh: '测量破坏叠加态', ar: 'القياس يدمر التراكب' },
      { en: 'Particles slow down', ru: 'Частицы замедляются', es: 'Las partículas se ralentizan', pt: 'As partículas desaceleram', de: 'Teilchen werden langsamer', fr: 'Les particules ralentissent', zh: '粒子减速', ar: 'الجسيمات تتباطأ' },
      { en: 'Random chance', ru: 'Случайность', es: 'Azar', pt: 'Acaso', de: 'Zufall', fr: 'Hasard', zh: '随机', ar: 'صدفة' },
    ],
    correct: 1,
    expl: { en: 'Measurement causes wave function collapse. The particle "chooses" one slit, making interference impossible.', ru: 'Измерение вызывает коллапс волновой функции. Частица "выбирает" одну щель, интерференция невозможна.', es: 'La medición causa el colapso de la función de onda. La partícula "elige" una rendija.', pt: 'A medição causa o colapso da função de onda. A partícula "escolhe" uma fenda.', de: 'Messung verursacht Wellenfunktionskollaps. Das Teilchen "wählt" einen Spalt.', fr: 'La mesure cause l\'effondrement de la fonction d\'onde. La particule "choisit" une fente.', zh: '测量导致波函数坍缩。粒子"选择"一条狭缝，干涉变得不可能。', ar: 'القياس يسبب انهيار دالة الموجة. الجسيمة "تختار" شقًا واحدًا.' },
    unlock: (_, p) => p?.observerOn === true,
  },
  {
    q: { en: 'How does decreasing wavelength affect the interference pattern?', ru: 'Как уменьшение длины волны влияет на интерференционную картину?', es: '¿Cómo afecta la reducción de la longitud de onda al patrón?', pt: 'Como a diminuição do comprimento de onda afeta o padrão?', de: 'Wie beeinflusst kürzere Wellenlänge das Muster?', fr: 'Comment la réduction de la longueur d\'onde affecte le motif?', zh: '减小波长如何影响干涉图样？', ar: 'كيف يؤثر تقليل طول الموجة على النمط؟' },
    opts: [
      { en: 'Fewer fringes', ru: 'Меньше полос', es: 'Menos franjas', pt: 'Menos franjas', de: 'Weniger Streifen', fr: 'Moins de franges', zh: '条纹更少', ar: 'أهداب أقل' },
      { en: 'More fringes', ru: 'Больше полос', es: 'Más franjas', pt: 'Mais franjas', de: 'Mehr Streifen', fr: 'Plus de franges', zh: '条纹更多', ar: 'المزيد من الأهداب' },
      { en: 'No change', ru: 'Без изменений', es: 'Sin cambios', pt: 'Sem mudanças', de: 'Keine Änderung', fr: 'Pas de changement', zh: '无变化', ar: 'لا تغيير' },
      { en: 'Pattern disappears', ru: 'Картина исчезает', es: 'El patrón desaparece', pt: 'O padrão desaparece', de: 'Muster verschwindet', fr: 'Le motif disparaît', zh: '图样消失', ar: 'النمط يختفي' },
    ],
    correct: 1,
    expl: { en: 'Shorter wavelength = smaller fringe spacing = more fringes fit on the screen.', ru: 'Меньшая длина волны = меньше расстояние между полосами = больше полос на экране.', es: 'Longitud de onda más corta = menor espaciado = más franjas caben en la pantalla.', pt: 'Comprimento de onda menor = menor espaçamento = mais franjas na tela.', de: 'Kürzere Wellenlänge = kleinerer Abstand = mehr Streifen auf dem Schirm.', fr: 'Longueur d\'onde plus courte = espacement plus petit = plus de franges sur l\'écran.', zh: '波长越短 = 条纹间距越小 = 屏幕上条纹越多。', ar: 'طول موجة أقصر = تباعد أقل = المزيد من الأهداب على الشاشة.' },
    unlock: (s) => (s?.totalParticles || 0) >= 50,
  },
  {
    q: { en: 'What is wave-particle duality?', ru: 'Что такое корпускулярно-волновой дуализм?', es: '¿Qué es la dualidad onda-partícula?', pt: 'O que é a dualidade onda-partícula?', de: 'Was ist Welle-Teilchen-Dualität?', fr: 'Qu\'est-ce que la dualité onde-particule?', zh: '什么是波粒二象性？', ar: 'ما هي ازدواجية الموجة والجسيم؟' },
    opts: [
      { en: 'Particles can only be waves', ru: 'Частицы могут быть только волнами', es: 'Las partículas solo pueden ser ondas', pt: 'Partículas só podem ser ondas', de: 'Teilchen können nur Wellen sein', fr: 'Les particules ne peuvent être que des ondes', zh: '粒子只能是波', ar: 'الجسيمات يمكن أن تكون موجات فقط' },
      { en: 'Particles exhibit both wave and particle properties', ru: 'Частицы проявляют и волновые, и корпускулярные свойства', es: 'Las partículas exhiben propiedades de onda y partícula', pt: 'Partículas exibem propriedades de onda e partícula', de: 'Teilchen zeigen Wellen- und Teilcheneigenschaften', fr: 'Les particules présentent des propriétés d\'onde et de particule', zh: '粒子同时表现出波动性和粒子性', ar: 'الجسيمات تظهر خصائص الموجة والجسيم' },
      { en: 'Waves can only be particles', ru: 'Волны могут быть только частицами', es: 'Las ondas solo pueden ser partículas', pt: 'Ondas só podem ser partículas', de: 'Wellen können nur Teilchen sein', fr: 'Les ondes ne peuvent être que des particules', zh: '波只能是粒子', ar: 'الموجات يمكن أن تكون جسيمات فقط' },
      { en: 'There is no connection', ru: 'Связи нет', es: 'No hay conexión', pt: 'Não há conexão', de: 'Kein Zusammenhang', fr: 'Pas de connexion', zh: '没有联系', ar: 'لا توجد علاقة' },
    ],
    correct: 1,
    expl: { en: 'Quantum objects exhibit both wave-like (interference) and particle-like (detection) behavior.', ru: 'Квантовые объекты проявляют и волновое (интерференция), и корпускулярное (детекция) поведение.', es: 'Los objetos cuánticos exhiben comportamiento ondulatorio (interferencia) y de partícula (detección).', pt: 'Objetos quânticos exibem comportamento ondulatório (interferência) e de partícula (detecção).', de: 'Quantenobjekte zeigen Wellen- (Interferenz) und Teilchenverhalten (Detektion).', fr: 'Les objets quantiques présentent un comportement ondulatoire (interférence) et particulaire (détection).', zh: '量子物体表现出波动性（干涉）和粒子性（探测）行为。', ar: 'الأجسام الكمية تظهر سلوك الموجة (التداخل) والجسيم (الكشف).' },
    unlock: (s) => (s?.totalParticles || 0) >= 100,
  },
];

export function QuizPanel({ stats, params }: QuizPanelProps) {
  const { language } = useLanguage();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const g = (k: string) => UI[k]?.[language] || UI[k]?.en || k;
  const gt = (obj: L) => obj[language] || obj.en;

  // Safe defaults if stats or params are undefined
  const safeStats = stats || { totalParticles: 0, fringeCount: 0, contrast: 0, histogram: [] };
  const safeParams = params || { wavelength: 500, slitDistance: 0.3, slitWidth: 0.05, coherence: 100, intensity: 50, observerOn: false };

  const available = useMemo(() => questions.filter(q => !q.unlock || q.unlock(safeStats, safeParams)), [safeStats, safeParams]);
  const q = available[currentQ];

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (currentQ < available.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <div className="bg-indigo-900/60 backdrop-blur-md rounded-xl p-4 shadow-lg border border-indigo-500/30">
        <div className="text-center space-y-4">
          <Award size={48} className="text-yellow-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">{g('complete')}</h3>
          <p className="text-indigo-200">{g('yourScore')}: <span className="text-2xl font-bold text-cyan-400">{score}/{available.length}</span></p>
          <button onClick={handleRestart} className="flex items-center gap-2 mx-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white">
            <RotateCcw size={16} />{g('restart')}
          </button>
        </div>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="bg-indigo-900/60 backdrop-blur-md rounded-xl p-4 shadow-lg border border-indigo-500/30">
        <h3 className="text-lg font-semibold text-white mb-2">{g('title')}</h3>
        <p className="text-indigo-300 text-sm">{g('locked')}</p>
      </div>
    );
  }

  return (
    <div className="bg-indigo-900/60 backdrop-blur-md rounded-xl p-4 shadow-lg border border-indigo-500/30 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">{g('title')}</h3>
        <span className="text-sm text-indigo-300">{g('score')}: {score}/{available.length}</span>
      </div>
      
      <div className="text-xs text-indigo-400">{g('question')} {currentQ + 1}/{available.length}</div>
      <p className="text-white font-medium">{gt(q.q)}</p>
      
      <div className="space-y-2">
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
            className={`w-full text-left p-3 rounded-lg text-sm transition-all ${
              answered
                ? i === q.correct ? 'bg-green-600/30 border border-green-500 text-green-200'
                  : i === selected ? 'bg-red-600/30 border border-red-500 text-red-200'
                  : 'bg-gray-800/30 text-gray-400'
                : 'bg-indigo-800/40 hover:bg-indigo-700/50 text-indigo-100'
            }`}>
            <div className="flex items-center gap-2">
              {answered && i === q.correct && <CheckCircle size={16} className="text-green-400" />}
              {answered && i === selected && i !== q.correct && <XCircle size={16} className="text-red-400" />}
              {!answered && <HelpCircle size={16} className="text-indigo-400" />}
              {gt(opt)}
            </div>
          </button>
        ))}
      </div>
      
      {answered && (
        <div className={`p-3 rounded-lg text-sm ${selected === q.correct ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
          <div className="font-medium mb-1">{selected === q.correct ? g('correct') : g('wrong')}</div>
          <p className="text-xs opacity-80">{gt(q.expl)}</p>
        </div>
      )}
      
      {answered && (
        <button onClick={handleNext} className="flex items-center gap-1 ml-auto px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm">
          {g('next')}<ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
