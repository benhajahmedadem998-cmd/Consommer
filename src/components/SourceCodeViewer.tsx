import { useMemo, useState } from 'react';
import { Check, Copy, Download, FileCode2 } from 'lucide-react';
import { TP07_SOURCE_FILES, type SourceFileItem } from '../data/tp07SourceFiles';

interface SourceCodeViewerProps {
  mode: 'vue' | 'backend';
}

export default function SourceCodeViewer({ mode }: SourceCodeViewerProps) {
  const files = useMemo(() => {
    if (mode === 'vue') {
      return TP07_SOURCE_FILES.filter((f) => f.category === 'vue');
    }
    return TP07_SOURCE_FILES.filter((f) => f.category === 'php' || f.category === 'sql');
  }, [mode]);

  const [partFilter, setPartFilter] = useState<'Toutes' | 'Commun' | 'Partie 1' | 'Partie 2' | 'Partie 3'>('Toutes');
  const [selectedId, setSelectedId] = useState<string>(files[0]?.id ?? '');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredFiles = useMemo(() => {
    if (partFilter === 'Toutes') return files;
    return files.filter((f) => f.part === partFilter);
  }, [files, partFilter]);

  const activeFile: SourceFileItem =
    filteredFiles.find((f) => f.id === selectedId) || filteredFiles[0] || files[0];

  const lines = activeFile ? activeFile.code.split('\n') : [];

  async function handleCopy(file: SourceFileItem) {
    try {
      await navigator.clipboard.writeText(file.code);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // Clipboard fallback ignored if blocked
    }
  }

  function handleDownloadFile(file: SourceFileItem) {
    const blob = new Blob([file.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {mode === 'vue'
              ? 'Frontend Vue.js 3 (Composition API & Composants)'
              : 'Backend PHP (PDO MySQL) & Base de données SQL'}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            {mode === 'vue'
              ? 'Découpage modulaire conforme au Chapitre 6 : <script setup>, defineProps, defineEmits et defineModel.'
              : 'Scripts PHP PDO sécurisés par requêtes préparées et schéma MySQL avec coordonnées géographiques.'}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          {(['Toutes', 'Commun', 'Partie 1', 'Partie 2', 'Partie 3'] as const).map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => setPartFilter(part)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                partFilter === part
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {part}
            </button>
          ))}
        </div>
      </div>

      {/* Split Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* File list */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-3 shadow-sm space-y-1">
          {filteredFiles.map((file) => {
            const isActive = activeFile?.id === file.id;
            return (
              <button
                key={file.id}
                type="button"
                onClick={() => setSelectedId(file.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold truncate">
                    {file.path}
                  </span>
                  <span
                    className={`text-[11px] shrink-0 ${
                      isActive ? 'text-emerald-300' : 'text-slate-500'
                    }`}
                  >
                    {file.part}
                  </span>
                </div>
                <p
                  className={`text-xs mt-1 line-clamp-2 ${
                    isActive ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {file.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Code viewer */}
        {activeFile && (
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileCode2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-mono text-sm font-semibold text-slate-900 truncate">
                  {activeFile.path}
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline whitespace-nowrap">
                  · {lines.length} lignes
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadFile(activeFile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(activeFile)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedId === activeFile.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copié
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copier
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="px-5 py-2.5 bg-slate-50/50 border-b border-slate-200 text-xs text-slate-600">
              {activeFile.description}
            </div>

            <div className="bg-[#0f172a] text-slate-100 overflow-x-auto max-h-[560px]">
              <table className="w-full border-collapse font-mono text-xs leading-relaxed">
                <tbody>
                  {lines.map((line, index) => (
                    <tr key={index} className="hover:bg-white/5">
                      <td className="select-none text-right pr-4 pl-4 py-0.5 text-slate-500 w-12 align-top tabular-nums">
                        {index + 1}
                      </td>
                      <td className="pr-5 py-0.5 whitespace-pre text-slate-100">
                        {line || ' '}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
