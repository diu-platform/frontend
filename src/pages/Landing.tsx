import { Link } from 'react-router-dom'
import { Play, ArrowRight, Beaker, Atom, Zap, Globe, Users, Award } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a1f] text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Cosmic Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a1f] via-[#1a1a3e] to-[#0f0f2e]" />
          <div className="stars absolute inset-0 opacity-50" style={{
            backgroundImage: `
              radial-gradient(2px 2px at 20px 30px, #eee, transparent),
              radial-gradient(2px 2px at 40px 70px, #ccc, transparent),
              radial-gradient(1px 1px at 90px 40px, #fff, transparent),
              radial-gradient(2px 2px at 130px 80px, #ddd, transparent),
              radial-gradient(1px 1px at 160px 120px, #eee, transparent)
            `,
            backgroundSize: '200px 200px'
          }} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <div className="mb-6">
            <span className="inline-block px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium">
              ✨ Scientific Operating System
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
            DIU OS
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Открытая научная платформа, где AI и люди сотрудничают как равные партнёры в открытии нового
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/demo" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all"
            >
              <Play className="w-5 h-5" />
              Попробовать демо
            </Link>
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-slate-800/50 border border-slate-700 rounded-lg font-semibold hover:bg-slate-800 transition-all"
            >
              Войти
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="mt-8 text-slate-500 text-sm">
            Уже есть аккаунт? <Link to="/login" className="text-purple-400 hover:underline">Войти</Link>
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 bg-[#0f0f2e]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Почему DIU OS?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Atom className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Квантовая физика</h3>
              <p className="text-slate-400">
                Интерактивные 3D симуляции экспериментов: двойная щель, квантовый туннель, атомные орбитали
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">AI Ассистент</h3>
              <p className="text-slate-400">
                AI-тьютор помогает в исследованиях, объясняет теорию и помогает формулировать гипотезы
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Открытая наука</h3>
              <p className="text-slate-400">
                DeSci: открытый доступ к исследованиям, совместная работа учёных по всему миру
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experiments Preview */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Доступные эксперименты
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-500/20 rounded-xl p-6">
              <Beaker className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Двойная щель</h3>
              <p className="text-slate-400 text-sm mb-4">
                Классический эксперимент о волновой природе света и корпускулярно-волновому дуализму
              </p>
              <Link to="/demo" className="text-blue-400 hover:underline text-sm">
                Запустить demo →
              </Link>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-orange-900/30 border border-purple-500/20 rounded-xl p-6">
              <Atom className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Квантовый туннель</h3>
              <p className="text-slate-400 text-sm mb-4">
                Прохождение частиц через потенциальный барьер — квантовое явление
              </p>
              <Link to="/demo" className="text-purple-400 hover:underline text-sm">
                Запустить demo →
              </Link>
            </div>

            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 border border-orange-500/20 rounded-xl p-6">
              <Globe className="w-8 h-8 text-orange-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Орбитали водорода</h3>
              <p className="text-slate-400 text-sm mb-4">
                Визуализация электронных о��bitа��ей атома водорода в 3D
              </p>
              <Link to="/demo" className="text-orange-400 hover:underline text-sm">
                Запустить demo →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0f0f2e] to-[#0a0a1f]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Готовы начать исследование?
          </h2>
          <p className="text-slate-400 mb-8">
            Присоединяйтесь к сообществу учёных и исследователей DIU OS
          </p>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all"
          >
            <Users className="w-5 h-5" />
            Начать бесплатно
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Award className="w-5 h-5" />
            <span>DIU OS — Open Science Platform</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 DIU Team. MIT License.
          </div>
        </div>
      </footer>
    </div>
  )
}