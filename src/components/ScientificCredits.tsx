// components/ScientificCredits.tsx - Multilingual Scientific Sources
import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { X, ExternalLink, BookOpen, Users, Building2, Award, Heart, Mail, Github } from 'lucide-react';

interface ScientificCreditsProps { isOpen: boolean; onClose: () => void; }
type L = Record<string, string>;

const UI: Record<string, L> = {
  title: { en: '📚 Scientific Sources', ru: '📚 Научные источники', es: '📚 Fuentes Científicas', pt: '📚 Fontes Científicas', de: '📚 Wissenschaftliche Quellen', fr: '📚 Sources Scientifiques', zh: '📚 科学来源', ar: '📚 المصادر العلمية' },
  subtitle: { en: 'This simulation is based on peer-reviewed research', ru: 'Эта симуляция основана на рецензируемых исследованиях', es: 'Esta simulación está basada en investigación revisada por pares', pt: 'Esta simulação é baseada em pesquisa revisada por pares', de: 'Diese Simulation basiert auf begutachteter Forschung', fr: 'Cette simulation est basée sur des recherches évaluées par des pairs', zh: '本模拟基于同行评审研究', ar: 'هذه المحاكاة مبنية على أبحاث محكمة' },
  papers: { en: 'Research Papers', ru: 'Научные статьи', es: 'Artículos de Investigación', pt: 'Artigos de Pesquisa', de: 'Forschungsarbeiten', fr: 'Articles de Recherche', zh: '研究论文', ar: 'أوراق البحث' },
  orgs: { en: 'Organizations', ru: 'Организации', es: 'Organizaciones', pt: 'Organizações', de: 'Organisationen', fr: 'Organisations', zh: '组织机构', ar: 'المنظمات' },
  team: { en: 'Team', ru: 'Команда', es: 'Equipo', pt: 'Equipe', de: 'Team', fr: 'Équipe', zh: '团队', ar: 'الفريق' },
  license: { en: 'License', ru: 'Лицензия', es: 'Licencia', pt: 'Licença', de: 'Lizenz', fr: 'Licence', zh: '许可证', ar: 'الرخصة' },
  openSource: { en: 'This project is open source', ru: 'Этот проект с открытым кодом', es: 'Este proyecto es de código abierto', pt: 'Este projeto é de código aberto', de: 'Dieses Projekt ist Open Source', fr: 'Ce projet est open source', zh: '本项目为开源项目', ar: 'هذا المشروع مفتوح المصدر' },
  contribution: { en: 'Used for', ru: 'Использовано для', es: 'Usado para', pt: 'Usado para', de: 'Verwendet für', fr: 'Utilisé pour', zh: '用于', ar: 'مستخدم لـ' },
  close: { en: 'Close', ru: 'Закрыть', es: 'Cerrar', pt: 'Fechar', de: 'Schließen', fr: 'Fermer', zh: '关闭', ar: 'إغلاق' },
};

interface Source { authors: string; title: string; journal: string; year: number; doi?: string; url?: string; contrib: L; }
interface Org { name: string; url: string; contrib: L; }

const SOURCES: Source[] = [
  { authors: 'Pearson, B.J., et al.', title: 'Measurements of slit-width effects in Young\'s double-slit experiment', journal: 'OSA Continuum (Optica)', year: 2018, doi: '10.1364/OSAC.1.000755', url: 'https://opg.optica.org/osac/abstract.cfm?uri=osac-1-2-755',
    contrib: { en: 'Slit width parameters and coherence effects', ru: 'Параметры ширины щели и эффекты когерентности', es: 'Parámetros de ancho de rendija', pt: 'Parâmetros de largura da fenda', de: 'Spaltbreitenparameter', fr: 'Paramètres de largeur de fente', zh: '狭缝宽度参数和相干效应', ar: 'معلمات عرض الشق' }},
  { authors: 'Dimitrova, T.L. & Weis, A.', title: 'The wave-particle duality of light: A demonstration experiment', journal: 'Am. J. Physics', year: 2008, doi: '10.1119/1.2757623',
    contrib: { en: 'Single-photon detection methodology', ru: 'Методология детекции одиночных фотонов', es: 'Metodología de detección de fotones únicos', pt: 'Metodologia de detecção de fóton único', de: 'Einzelphotonen-Detektionsmethodik', fr: 'Méthodologie de détection de photon unique', zh: '单光子探测方法', ar: 'منهجية كشف الفوتون المفرد' }},
  { authors: 'Tonomura, A., et al.', title: 'Demonstration of single-electron buildup of an interference pattern', journal: 'Am. J. Physics', year: 1989, doi: '10.1119/1.16104',
    contrib: { en: 'Particle-by-particle pattern formation', ru: 'Формирование картины частица за частицей', es: 'Formación de patrones partícula por partícula', pt: 'Formação de padrão partícula por partícula', de: 'Teilchen-für-Teilchen-Musterbildung', fr: 'Formation de motif particule par particule', zh: '逐粒子图样形成', ar: 'تشكيل النمط جسيمة بجسيمة' }},
  { authors: 'Feynman, R.P., Leighton, R.B., Sands, M.', title: 'The Feynman Lectures on Physics, Vol. III', journal: 'Addison-Wesley', year: 1965,
    contrib: { en: 'Fundamental quantum concepts and wave function formalism', ru: 'Фундаментальные квантовые концепции и формализм волновой функции', es: 'Conceptos cuánticos fundamentales', pt: 'Conceitos quânticos fundamentais', de: 'Grundlegende Quantenkonzepte', fr: 'Concepts quantiques fondamentaux', zh: '基本量子概念和波函数形式', ar: 'المفاهيم الكمية الأساسية' }},
];

const ORGS: Org[] = [
  { name: 'Optica Publishing Group', url: 'https://opg.optica.org',
    contrib: { en: 'Primary source for experimental parameters', ru: 'Основной источник экспериментальных параметров', es: 'Fuente principal de parámetros experimentales', pt: 'Fonte principal de parâmetros experimentais', de: 'Hauptquelle für experimentelle Parameter', fr: 'Source principale de paramètres expérimentaux', zh: '实验参数的主要来源', ar: 'المصدر الرئيسي للمعلمات التجريبية' }},
  { name: 'American Physical Society', url: 'https://journals.aps.org',
    contrib: { en: 'Peer-reviewed research validation', ru: 'Валидация рецензируемых исследований', es: 'Validación de investigación revisada', pt: 'Validação de pesquisa revisada', de: 'Peer-Review-Validierung', fr: 'Validation de recherche évaluée', zh: '同行评审研究验证', ar: 'التحقق من صحة الأبحاث المحكمة' }},
  { name: 'Three.js Community', url: 'https://threejs.org',
    contrib: { en: '3D visualization framework', ru: 'Фреймворк 3D-визуализации', es: 'Marco de visualización 3D', pt: 'Framework de visualização 3D', de: '3D-Visualisierungs-Framework', fr: 'Framework de visualisation 3D', zh: '3D可视化框架', ar: 'إطار التصور ثلاثي الأبعاد' }},
];

// Button to open credits
export function CreditsButton({ onClick }: { onClick: () => void }) {
  const { language } = useLanguage();
  const label = { en: 'Sources', ru: 'Источники', es: 'Fuentes', pt: 'Fontes', de: 'Quellen', fr: 'Sources', zh: '来源', ar: 'المصادر' };
  return (
    <button onClick={onClick} className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 rounded-lg text-gray-300 text-sm transition-colors">
      <BookOpen size={16} />
      {label[language as keyof typeof label] || label.en}
    </button>
  );
}

export function ScientificCredits({ isOpen, onClose }: ScientificCreditsProps) {
  const { language } = useLanguage();
  const [tab, setTab] = useState<'papers' | 'orgs' | 'team'>('papers');
  const g = (k: string) => UI[k]?.[language] || UI[k]?.en || k;
  const gt = (obj: L) => obj[language] || obj.en;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-indigo-500/30 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">{g('title')}</h2>
            <p className="text-sm text-slate-400">{g('subtitle')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg"><X className="text-slate-400" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-slate-700">
          {(['papers', 'orgs', 'team'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${tab === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
              {t === 'papers' && <BookOpen size={16} />}
              {t === 'orgs' && <Building2 size={16} />}
              {t === 'team' && <Users size={16} />}
              {g(t)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === 'papers' && SOURCES.map((s, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-white font-medium">{s.title}</p>
                  <p className="text-slate-400 text-sm">{s.authors} ({s.year})</p>
                  <p className="text-slate-500 text-xs">{s.journal}</p>
                </div>
                {s.url && <a href={s.url} target="_blank" rel="noopener" className="p-2 hover:bg-slate-700 rounded"><ExternalLink size={16} className="text-indigo-400" /></a>}
              </div>
              <div className="text-xs text-indigo-300 mt-2">
                <span className="text-slate-500">{g('contribution')}:</span> {gt(s.contrib)}
              </div>
              {s.doi && <p className="text-xs text-slate-600 mt-1">DOI: {s.doi}</p>}
            </div>
          ))}

          {tab === 'orgs' && ORGS.map((o, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex items-center gap-4">
              <Building2 size={32} className="text-indigo-400" />
              <div className="flex-1">
                <a href={o.url} target="_blank" rel="noopener" className="text-white font-medium hover:text-indigo-300">{o.name}</a>
                <p className="text-slate-400 text-sm">{gt(o.contrib)}</p>
              </div>
            </div>
          ))}

          {tab === 'team' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-lg p-6 border border-indigo-500/30 text-center">
                <Award size={48} className="text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">DIU — DeSci Intelligent Universe</h3>
                <p className="text-slate-300">Building the Scientific Operating System</p>
                <div className="flex justify-center gap-4 mt-4">
                  <a href="https://github.com/desci-intelligent-universe" target="_blank" rel="noopener" className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700">
                    <Github size={16} />GitHub
                  </a>
                  <a href="mailto:contact@diu.science" className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg text-white hover:bg-slate-700">
                    <Mail size={16} />Contact
                  </a>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 text-center">
                <Heart size={24} className="text-red-400 mx-auto mb-2" />
                <p className="text-slate-300 text-sm">{g('openSource')}</p>
                <p className="text-xs text-slate-500 mt-2">MIT License © 2024-2025</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 text-center">
          <button onClick={onClose} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white">{g('close')}</button>
        </div>
      </div>
    </div>
  );
}
