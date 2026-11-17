import { useState } from 'react';
import { Download } from 'lucide-react';
import LiveSimulator from './components/LiveSimulator';
import SourceCodeViewer from './components/SourceCodeViewer';
import ArchitectureView from './components/ArchitectureView';
import { TP07_SOURCE_FILES } from './data/tp07SourceFiles';

type MainTab = 'live' | 'vue' | 'backend' | 'architecture';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('live');

  function handleExportBundle() {
    const sections = TP07_SOURCE_FILES.map((file) => {
      const lang =
        file.category === 'vue'
          ? 'vue'
          : file.category === 'php'
            ? 'php'
            : 'sql';
      return [
        `## ${file.path} (${file.part})`,
        file.description,
        '',
        `\`\`\`${lang}`,
        file.code.trimEnd(),
        '```',
        '',
      ].join('\n');
    });

    const content = [
      '# TP 07 — Consommer une API avec Vue.js : Fetch et Axios',
      '',
      'Ensemble complet des fichiers Frontend Vue.js (Composition API + Composants), Backend PHP (PDO MySQL) et Base de données SQL.',
      '',
      ...sections,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tp07-vue-php-complet.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Three-Zone Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('live');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            TP 07 · Pays et villes
          </a>

          {/* Zone 2: Concise single-line navigation links */}
          <nav
            aria-label="Navigation principale"
            className="flex items-center gap-5 sm:gap-7 overflow-x-auto"
          >
            {(
              [
                { id: 'live', label: 'Application live' },
                { id: 'vue', label: 'Code Vue.js' },
                { id: 'backend', label: 'Backend PHP & SQL' },
                { id: 'architecture', label: 'Architecture' },
              ] as const
            ).map((item) => {
              const isCurrent = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'border-emerald-600 text-slate-900'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="hidden sm:flex items-center shrink-0">
            <button
              type="button"
              onClick={handleExportBundle}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Exporter TP 07
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'live' && <LiveSimulator />}
        {activeTab === 'vue' && <SourceCodeViewer mode="vue" />}
        {activeTab === 'backend' && <SourceCodeViewer mode="backend" />}
        {activeTab === 'architecture' && <ArchitectureView />}
      </main>
    </div>
  );
}
