import { ArrowDown, ArrowUp, Database, Layers, Server } from 'lucide-react';

export default function ArchitectureView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Architecture des composants (Chapitre 6) et flux API (TP 07)
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Organisation entre composants conteneurs (gestion d’état et appels Fetch/Axios), composants de présentation réutilisables et endpoints PHP PDO.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Component Tree */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Arbre des composants Vue.js
            </h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-slate-900">App.vue</span>
                <span className="text-xs text-slate-500">Conteneur racine</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Détient <code className="font-mono text-slate-800">partieActive</code> et orchestre l’affichage des trois vues.
              </p>
            </div>

            <div className="pl-6 space-y-2.5">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-slate-900">
                    BarreNavigation.vue
                  </span>
                  <span className="text-xs text-emerald-700 font-mono flex items-center gap-1">
                    <ArrowDown className="w-3 h-3" /> props
                    <ArrowUp className="w-3 h-3 ml-1" /> emit
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Reçoit <code className="font-mono">partieActive</code> (validé) et émet <code className="font-mono">changer-partie</code>.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-slate-900">
                    Partie1Recherche.vue
                  </span>
                  <span className="text-xs text-slate-500 font-mono">fetch()</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Valide que l’identifiant est non vide et entier avant d’appeler <code className="font-mono">rechercher_pays.php</code>.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-slate-900">
                    Partie2PaysVilles.vue
                  </span>
                  <span className="text-xs text-slate-500 font-mono">fetch()</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Récupère <code className="font-mono">pays</code> puis <code className="font-mono">ville</code> via deux instances de <code className="font-mono">SelecteurListe.vue</code> (<code className="font-mono">defineModel</code>).
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-slate-900">
                    Partie3MeteoAxios.vue
                  </span>
                  <span className="text-xs text-emerald-700 font-mono">axios.get()</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Duplique la Partie 2 avec Axios et délègue le rendu météo au composant de présentation <code className="font-mono">CarteMeteo.vue</code>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Backend & Database Schema */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-slate-900">
                Schéma MySQL (PDO)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
                <p className="font-semibold text-slate-900 mb-2">Table pays</p>
                <ul className="space-y-1 text-slate-600">
                  <li>id_pays (INT PK)</li>
                  <li>nom (VARCHAR)</li>
                </ul>
              </div>
              <div className="border border-slate-200 rounded-lg p-3.5 bg-slate-50">
                <p className="font-semibold text-slate-900 mb-2">Table ville</p>
                <ul className="space-y-1 text-slate-600">
                  <li>id_ville (INT PK)</li>
                  <li>nom (VARCHAR)</li>
                  <li>id_pays (INT FK → pays)</li>
                  <li>latitude (DECIMAL)</li>
                  <li>longitude (DECIMAL)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-semibold text-slate-900">
                Correspondance des endpoints PHP
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-3 font-medium">Partie</th>
                    <th className="py-2 pr-3 font-medium">Client HTTP</th>
                    <th className="py-2 font-medium">Endpoint PHP PDO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 pr-3 font-medium">Partie 1</td>
                    <td className="py-2.5 pr-3 font-mono">fetch()</td>
                    <td className="py-2.5 font-mono">rechercher_pays.php?id_pays=...</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-medium">Partie 2</td>
                    <td className="py-2.5 pr-3 font-mono">fetch()</td>
                    <td className="py-2.5 font-mono">get_pays.php & get_villes.php</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-medium">Partie 3</td>
                    <td className="py-2.5 pr-3 font-mono text-emerald-700">axios.get()</td>
                    <td className="py-2.5 font-mono">get_meteo.php → Open-Meteo API</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
