// App.tsx - Main Application with All Modes Integration
/**
 * DIU Physics Interactive v16.0
 *
 * An open-source educational platform for quantum physics visualization.
 * Built with respect for the scientific community and proper attribution.
 *
 * "If I have seen further, it is by standing on the shoulders of giants"
 * — Isaac Newton, 1675
 *
 * Experiments: Double-Slit, Quantum Tunneling, Hydrogen Orbitals
 * Modes: Demo, Laboratory, Research
 */

import { ComingSoonModal } from './components/ModeSelector';
import { ExperimentSelector } from './components/ExperimentSelector';
import { ModeSelectorDropdown } from './components/ModeSelectorDropdown';
import { ControlsSidebar } from './components/ControlsSidebar';
import { StatsSidebar } from './components/StatsSidebar';
import { SimulationCanvas } from './components/SimulationCanvas';
import { ModeInfoPanel } from './components/ModeInfoPanel';
import { ScientificCredits, CreditsButton } from './components/ScientificCredits';
import { LanguageProvider, useLanguage, LanguageSwitcher } from './i18n/LanguageContext';
import { useSimulationState } from './hooks/useSimulationState';

function AppContent() {
  const { t, language } = useLanguage();
  const {
    currentMode,
    currentExperiment, setCurrentExperiment,
    showComingSoon, setShowComingSoon,
    params, setParams,
    researchParams, setResearchParams,
    stats, setStats,
    tunnelingParams, setTunnelingParams,
    tunnelingStats, setTunnelingStats,
    hydrogenParams, setHydrogenParams,
    hydrogenStats, setHydrogenStats,
    screenMode, setScreenMode,
    heatmapOpacity, setHeatmapOpacity,
    showModeInfo, setShowModeInfo,
    showCredits, setShowCredits,
    isFullscreen, setIsFullscreen,
    cameraDistance,
    resetKey,
    canvasContainerRef,
    handleModeChange,
    handleReset,
    handleExport,
  } = useSimulationState();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      <header className="flex-none h-14 border-b border-slate-700/50 flex items-center justify-between px-4 bg-slate-900/80 backdrop-blur z-[100]">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-orange-400 bg-clip-text text-transparent">
            DIU Physics
          </h1>
          <ExperimentSelector
            current={currentExperiment}
            onChange={setCurrentExperiment}
            language={language}
          />
        </div>

        <div className="flex items-center gap-3">
          {currentExperiment === 'doubleSlit' && (
            <ModeSelectorDropdown
              current={currentMode}
              onChange={handleModeChange}
              language={language}
            />
          )}
          <CreditsButton onClick={() => setShowCredits(true)} />
          <button
            onClick={() => setShowModeInfo(true)}
            className="px-2 py-1 text-sm bg-slate-700/50 hover:bg-slate-600 rounded-md transition-colors"
          >
            ℹ️ {t('common.modeInfo') || 'Info'}
          </button>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {!isFullscreen && (
          <ControlsSidebar
            currentExperiment={currentExperiment}
            currentMode={currentMode}
            params={params}
            setParams={setParams}
            researchParams={researchParams}
            setResearchParams={setResearchParams}
            tunnelingParams={tunnelingParams}
            setTunnelingParams={setTunnelingParams}
            hydrogenParams={hydrogenParams}
            setHydrogenParams={setHydrogenParams}
            onReset={handleReset}
            onExport={handleExport}
            screenMode={screenMode}
            setScreenMode={setScreenMode}
            heatmapOpacity={heatmapOpacity}
            setHeatmapOpacity={setHeatmapOpacity}
            stats={stats}
          />
        )}

        <SimulationCanvas
          currentExperiment={currentExperiment}
          params={params}
          screenMode={screenMode}
          resetKey={resetKey}
          stats={stats}
          setStats={setStats}
          tunnelingParams={tunnelingParams}
          tunnelingStats={tunnelingStats}
          setTunnelingStats={setTunnelingStats}
          hydrogenParams={hydrogenParams}
          hydrogenStats={hydrogenStats}
          setHydrogenStats={setHydrogenStats}
          isFullscreen={isFullscreen}
          setIsFullscreen={setIsFullscreen}
          cameraDistance={cameraDistance}
          canvasContainerRef={canvasContainerRef}
        />

        {!isFullscreen && (
          <StatsSidebar
            currentExperiment={currentExperiment}
            currentMode={currentMode}
            params={params}
            researchParams={researchParams}
            stats={stats}
            tunnelingStats={tunnelingStats}
            hydrogenStats={hydrogenStats}
            onExport={handleExport}
          />
        )}
      </main>

      {showComingSoon && (
        <ComingSoonModal
          mode={showComingSoon}
          isOpen={true}
          onClose={() => setShowComingSoon(null)}
        />
      )}

      {showModeInfo && (
        <ModeInfoPanel
          currentMode={currentMode}
          onClose={() => setShowModeInfo(false)}
        />
      )}

      <ScientificCredits
        isOpen={showCredits}
        onClose={() => setShowCredits(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
