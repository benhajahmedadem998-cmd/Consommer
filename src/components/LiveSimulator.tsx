import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  CloudSun,
  Globe,
  Loader2,
  MapPin,
  Search,
  ShieldAlert,
  Terminal,
} from 'lucide-react';
import type { PaysRecord, VilleRecord } from '../data/tp07Database';

type PartKey = 'partie1' | 'partie2' | 'partie3';

interface MeteoPayload {
  ville: {
    id_ville: number;
    nom: string;
    latitude: number;
    longitude: number;
  };
  pays: string;
  meteo: {
    temperature: number | null;
    ressenti: number | null;
    temp_min: number | null;
    temp_max: number | null;
    vent: number | null;
    unite_temperature: string;
    unite_vent: string;
    heure_mesure: string | null;
  };
}

interface HttpTrace {
  id: number;
  part: PartKey;
  client: 'fetch()' | 'axios.get()' | 'Validation JS';
  url: string;
  status: string;
  durationMs: number | null;
  payload: unknown;
}

export default function LiveSimulator() {
  const [activePart, setActivePart] = useState<PartKey>('partie1');
  const [traces, setTraces] = useState<HttpTrace[]>([]);

  // Partie 1 state (Fetch)
  const [p1Input, setP1Input] = useState('abc');
  const [p1Error, setP1Error] = useState('');
  const [p1Result, setP1Result] = useState<PaysRecord | null>(null);
  const [p1Loading, setP1Loading] = useState(false);

  // Partie 2 state (Fetch)
  const [p2PaysList, setP2PaysList] = useState<PaysRecord[]>([]);
  const [p2VillesList, setP2VillesList] = useState<VilleRecord[]>([]);
  const [p2SelectedPays, setP2SelectedPays] = useState('');
  const [p2SelectedVille, setP2SelectedVille] = useState('');
  const [p2LoadingPays, setP2LoadingPays] = useState(false);
  const [p2LoadingVilles, setP2LoadingVilles] = useState(false);
  const [p2Error, setP2Error] = useState('');

  // Partie 3 state (Axios + Open-Meteo)
  const [p3PaysList, setP3PaysList] = useState<PaysRecord[]>([]);
  const [p3VillesList, setP3VillesList] = useState<VilleRecord[]>([]);
  const [p3SelectedPays, setP3SelectedPays] = useState('');
  const [p3SelectedVille, setP3SelectedVille] = useState('');
  const [p3Meteo, setP3Meteo] = useState<MeteoPayload | null>(null);
  const [p3LoadingPays, setP3LoadingPays] = useState(false);
  const [p3LoadingVilles, setP3LoadingVilles] = useState(false);
  const [p3LoadingMeteo, setP3LoadingMeteo] = useState(false);
  const [p3Error, setP3Error] = useState('');

  function pushTrace(trace: Omit<HttpTrace, 'id'>) {
    setTraces((prev) => [{ ...trace, id: Date.now() + Math.random() }, ...prev].slice(0, 6));
  }

  // Partie 1 : Recherche par identifiant avec Fetch et validation stricte
  async function handleP1Submit(e?: React.FormEvent, overrideValue?: string) {
    if (e) e.preventDefault();
    const rawValue = overrideValue !== undefined ? overrideValue : p1Input;
    if (overrideValue !== undefined) {
      setP1Input(overrideValue);
    }

    setP1Error('');
    setP1Result(null);

    const trimmed = rawValue.trim();

    if (trimmed === '') {
      const msg = 'Veuillez saisir un identifiant de pays.';
      setP1Error(msg);
      pushTrace({
        part: 'partie1',
        client: 'Validation JS',
        url: 'Aucune requête envoyée',
        status: 'Bloquée (champ vide)',
        durationMs: null,
        payload: { erreur_frontend: msg },
      });
      return;
    }

    if (!/^\d+$/.test(trimmed)) {
      const msg = "L'identifiant doit être un nombre entier.";
      setP1Error(msg);
      pushTrace({
        part: 'partie1',
        client: 'Validation JS',
        url: 'Aucune requête envoyée',
        status: 'Bloquée (non entier)',
        durationMs: null,
        payload: { saisie: trimmed, erreur_frontend: msg },
      });
      return;
    }

    const url = `/api/pays/${encodeURIComponent(trimmed)}`;
    setP1Loading(true);
    const start = performance.now();

    try {
      const response = await fetch(url);
      const data = await response.json();
      const durationMs = Math.round(performance.now() - start);

      pushTrace({
        part: 'partie1',
        client: 'fetch()',
        url,
        status: `${response.status} ${response.ok ? 'OK' : 'Non trouvé'}`,
        durationMs,
        payload: data,
      });

      if (!response.ok || !data.success) {
        setP1Error(data.message || "Le pays n'a pas été trouvé.");
        return;
      }

      setP1Result(data.pays);
    } catch {
      setP1Error('Erreur réseau lors de la communication avec le serveur.');
    } finally {
      setP1Loading(false);
    }
  }

  // Partie 2 : Charger tous les pays avec Fetch quand Partie 2 devient active
  useEffect(() => {
    if (activePart !== 'partie2') return;
    let cancelled = false;

    async function loadPaysP2() {
      setP2LoadingPays(true);
      setP2Error('');
      const url = '/api/pays';
      const start = performance.now();

      try {
        const res = await fetch(url);
        const data = await res.json();
        const durationMs = Math.round(performance.now() - start);

        if (!cancelled) {
          setP2PaysList(data.pays || []);
          pushTrace({
            part: 'partie2',
            client: 'fetch()',
            url,
            status: `${res.status} OK`,
            durationMs,
            payload: data,
          });
        }
      } catch {
        if (!cancelled) setP2Error('Impossible de charger les pays.');
      } finally {
        if (!cancelled) setP2LoadingPays(false);
      }
    }

    loadPaysP2();
    return () => {
      cancelled = true;
    };
  }, [activePart]);

  // Partie 2 : Charger les villes lors de la sélection d'un pays
  async function handleP2PaysChange(newIdPays: string) {
    setP2SelectedPays(newIdPays);
    setP2SelectedVille('');
    setP2VillesList([]);
    setP2Error('');

    if (!newIdPays) return;

    const url = `/api/villes?id_pays=${encodeURIComponent(newIdPays)}`;
    setP2LoadingVilles(true);
    const start = performance.now();

    try {
      const res = await fetch(url);
      const data = await res.json();
      const durationMs = Math.round(performance.now() - start);

      setP2VillesList(data.villes || []);
      pushTrace({
        part: 'partie2',
        client: 'fetch()',
        url,
        status: `${res.status} OK`,
        durationMs,
        payload: data,
      });
    } catch {
      setP2Error('Impossible de charger les villes pour ce pays.');
    } finally {
      setP2LoadingVilles(false);
    }
  }

  // Partie 3 : Charger tous les pays avec Axios quand Partie 3 devient active
  useEffect(() => {
    if (activePart !== 'partie3') return;
    let cancelled = false;

    async function loadPaysP3() {
      setP3LoadingPays(true);
      setP3Error('');
      const url = '/api/pays';
      const start = performance.now();

      try {
        const response = await axios.get(url);
        const durationMs = Math.round(performance.now() - start);

        if (!cancelled) {
          setP3PaysList(response.data.pays || []);
          pushTrace({
            part: 'partie3',
            client: 'axios.get()',
            url,
            status: `${response.status} OK`,
            durationMs,
            payload: response.data,
          });
        }
      } catch {
        if (!cancelled) setP3Error('Impossible de charger la liste des pays.');
      } finally {
        if (!cancelled) setP3LoadingPays(false);
      }
    }

    loadPaysP3();
    return () => {
      cancelled = true;
    };
  }, [activePart]);

  // Partie 3 : Charger les villes avec Axios lors de la sélection d'un pays
  async function handleP3PaysChange(newIdPays: string) {
    setP3SelectedPays(newIdPays);
    setP3SelectedVille('');
    setP3VillesList([]);
    setP3Meteo(null);
    setP3Error('');

    if (!newIdPays) return;

    const url = `/api/villes?id_pays=${encodeURIComponent(newIdPays)}`;
    setP3LoadingVilles(true);
    const start = performance.now();

    try {
      const response = await axios.get('/api/villes', {
        params: { id_pays: newIdPays },
      });
      const durationMs = Math.round(performance.now() - start);

      setP3VillesList(response.data.villes || []);
      pushTrace({
        part: 'partie3',
        client: 'axios.get()',
        url,
        status: `${response.status} OK`,
        durationMs,
        payload: response.data,
      });
    } catch {
      setP3Error('Impossible de charger les villes.');
    } finally {
      setP3LoadingVilles(false);
    }
  }

  // Partie 3 : Récupérer la température via Axios -> Backend -> Open-Meteo
  async function handleP3VilleChange(newIdVille: string) {
    setP3SelectedVille(newIdVille);
    setP3Meteo(null);
    setP3Error('');

    if (!newIdVille) return;

    const url = `/api/meteo?id_ville=${encodeURIComponent(newIdVille)}`;
    setP3LoadingMeteo(true);
    const start = performance.now();

    try {
      const response = await axios.get('/api/meteo', {
        params: { id_ville: newIdVille },
      });
      const durationMs = Math.round(performance.now() - start);

      setP3Meteo(response.data);
      pushTrace({
        part: 'partie3',
        client: 'axios.get()',
        url,
        status: `${response.status} OK`,
        durationMs,
        payload: response.data,
      });
    } catch {
      setP3Error('Impossible de récupérer la température depuis Open-Meteo.');
    } finally {
      setP3LoadingMeteo(false);
    }
  }

  const p2SelectedPaysObj = p2PaysList.find((p) => String(p.id_pays) === p2SelectedPays);
  const p2SelectedVilleObj = p2VillesList.find((v) => String(v.id_ville) === p2SelectedVille);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Interactive Stage: Faithful TP 07 Vue.js Preview */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {/* TP 07 Internal App Navbar (matching PDF screenshots) */}
        <div className="bg-[#0b192c] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
            <span className="font-bold tracking-tight text-sm">Vue.js</span>
            <span className="text-slate-500 text-sm" aria-hidden="true">
              |
            </span>
            <span className="text-slate-200 text-sm font-medium">Pays et villes</span>
          </div>

          <div className="flex items-center gap-1" role="tablist" aria-label="Parties du TP 07">
            {(
              [
                { id: 'partie1', label: 'Partie 1' },
                { id: 'partie2', label: 'Partie 2' },
                { id: 'partie3', label: 'Partie 3' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activePart === tab.id}
                onClick={() => setActivePart(tab.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activePart === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TP 07 Viewport Canvas */}
        <div className="p-6 sm:p-10 bg-slate-100/70 min-h-[440px] flex flex-col justify-start">
          {/* PARTIE 1 */}
          {activePart === 'partie1' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-5">
                Rechercher un pays par son identifiant
              </h2>

              <form onSubmit={(e) => handleP1Submit(e)} className="space-y-4">
                <div>
                  <label
                    htmlFor="p1-id-input"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Identifiant du pays
                  </label>
                  <input
                    id="p1-id-input"
                    type="text"
                    value={p1Input}
                    onChange={(e) => setP1Input(e.target.value)}
                    placeholder="Saisir un entier (ex : 1)"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={p1Loading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  {p1Loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  Rechercher
                </button>
              </form>

              {p1Error && (
                <div
                  role="alert"
                  className="mt-5 flex items-center gap-2.5 bg-red-600 text-white text-sm font-medium px-4 py-3 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{p1Error}</span>
                </div>
              )}

              {p1Result && (
                <div
                  role="status"
                  className="mt-5 flex items-center justify-between gap-3 bg-emerald-600 text-white text-sm font-medium px-4 py-3 rounded-lg"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Pays trouvé : <strong>{p1Result.nom}</strong>
                    </span>
                  </div>
                  <span className="font-mono text-xs opacity-90 tabular-nums">
                    id_pays = {p1Result.id_pays}
                  </span>
                </div>
              )}

              {/* Quick test scenarios */}
              <div className="mt-6 pt-5 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-500 mb-2.5">
                  Jeux de test rapides
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'id = 1 (Tunisie)', val: '1' },
                    { label: 'id = 2 (France)', val: '2' },
                    { label: 'id = "abc" (Non entier)', val: 'abc' },
                    { label: 'Champ vide', val: '' },
                    { label: 'id = 99 (Inexistant)', val: '99' },
                  ].map((sample) => (
                    <button
                      key={sample.label}
                      type="button"
                      onClick={() => handleP1Submit(undefined, sample.val)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PARTIE 2 */}
          {activePart === 'partie2' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Pays et villes</h2>
              <p className="text-sm text-slate-500 mt-1 mb-6">
                Sélectionnez un pays et une ville.
              </p>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="p2-pays"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Pays
                  </label>
                  <div className="relative">
                    <select
                      id="p2-pays"
                      value={p2SelectedPays}
                      onChange={(e) => handleP2PaysChange(e.target.value)}
                      disabled={p2LoadingPays}
                      className="w-full appearance-none px-3.5 py-2.5 pr-10 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                    >
                      <option value="">
                        {p2LoadingPays ? 'Chargement des pays...' : '-- Choisir un pays --'}
                      </option>
                      {p2PaysList.map((pays) => (
                        <option key={pays.id_pays} value={String(pays.id_pays)}>
                          {pays.nom}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="p2-ville"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Ville
                  </label>
                  <div className="relative">
                    <select
                      id="p2-ville"
                      value={p2SelectedVille}
                      onChange={(e) => setP2SelectedVille(e.target.value)}
                      disabled={!p2SelectedPays || p2LoadingVilles}
                      className="w-full appearance-none px-3.5 py-2.5 pr-10 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                    >
                      <option value="">
                        {!p2SelectedPays
                          ? '-- Sélectionnez d’abord un pays --'
                          : p2LoadingVilles
                            ? 'Chargement des villes...'
                            : '-- Choisir une ville --'}
                      </option>
                      {p2VillesList.map((ville) => (
                        <option key={ville.id_ville} value={String(ville.id_ville)}>
                          {ville.nom}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {p2Error && (
                <div className="mt-4 flex items-center gap-2 text-sm text-red-600 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{p2Error}</span>
                </div>
              )}

              {p2SelectedPaysObj && p2VillesList.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span>
                    {p2VillesList.length} villes chargées pour{' '}
                    <strong className="text-slate-900">{p2SelectedPaysObj.nom}</strong>
                  </span>
                  {p2SelectedVilleObj ? (
                    <span className="font-medium text-emerald-700">
                      Sélection : {p2SelectedVilleObj.nom} ({p2SelectedPaysObj.nom})
                    </span>
                  ) : (
                    <span className="text-slate-400">Aucune ville sélectionnée</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* PARTIE 3 */}
          {activePart === 'partie3' && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-5">
                Température de la ville
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="p3-pays"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Pays
                  </label>
                  <div className="relative">
                    <select
                      id="p3-pays"
                      value={p3SelectedPays}
                      onChange={(e) => handleP3PaysChange(e.target.value)}
                      disabled={p3LoadingPays}
                      className="w-full appearance-none px-3.5 py-2.5 pr-10 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                    >
                      <option value="">
                        {p3LoadingPays ? 'Chargement des pays...' : '-- Choisir un pays --'}
                      </option>
                      {p3PaysList.map((pays) => (
                        <option key={pays.id_pays} value={String(pays.id_pays)}>
                          {pays.nom}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="p3-ville"
                    className="block text-sm font-medium text-slate-700 mb-1.5"
                  >
                    Ville
                  </label>
                  <div className="relative">
                    <select
                      id="p3-ville"
                      value={p3SelectedVille}
                      onChange={(e) => handleP3VilleChange(e.target.value)}
                      disabled={!p3SelectedPays || p3LoadingVilles}
                      className="w-full appearance-none px-3.5 py-2.5 pr-10 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                    >
                      <option value="">
                        {!p3SelectedPays
                          ? '-- Sélectionnez d’abord un pays --'
                          : p3LoadingVilles
                            ? 'Chargement des villes...'
                            : '-- Choisir une ville --'}
                      </option>
                      {p3VillesList.map((ville) => (
                        <option key={ville.id_ville} value={String(ville.id_ville)}>
                          {ville.nom}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
              </div>

              {p3LoadingMeteo && (
                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-center gap-2.5 text-sm text-slate-600">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Interrogation d’Open-Meteo via le backend...</span>
                </div>
              )}

              {p3Error && (
                <div className="mt-6 flex items-center gap-2 text-sm text-red-600 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{p3Error}</span>
                </div>
              )}

              {p3Meteo && !p3LoadingMeteo && (
                <div className="mt-7 pt-6 border-t border-slate-200 text-center">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {p3Meteo.ville.nom} ({p3Meteo.pays})
                  </h3>

                  <p className="text-5xl font-bold text-[#0f4c81] tracking-tight my-3 tabular-nums">
                    {p3Meteo.meteo.temperature !== null
                      ? `${p3Meteo.meteo.temperature} °C`
                      : 'N/A'}
                  </p>

                  <p className="text-sm text-slate-600 tabular-nums">
                    Ressenti : {p3Meteo.meteo.ressenti ?? '—'} °C
                    <span className="mx-1.5" aria-hidden="true">
                      •
                    </span>
                    Min : {p3Meteo.meteo.temp_min ?? '—'} °C
                    <span className="mx-1.5" aria-hidden="true">
                      •
                    </span>
                    Max : {p3Meteo.meteo.temp_max ?? '—'} °C
                    <span className="mx-1.5" aria-hidden="true">
                      •
                    </span>
                    Vent : {p3Meteo.meteo.vent ?? '—'} km/h
                  </p>

                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500 font-mono tabular-nums">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Coordonnées : {p3Meteo.ville.latitude}, {p3Meteo.ville.longitude}
                  </p>
                </div>
              )}

              {!p3Meteo && !p3LoadingMeteo && !p3Error && (
                <div className="mt-7 pt-5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <CloudSun className="w-4 h-4 text-slate-400" />
                    Sélectionnez Tunisie puis Djerba pour tester Open-Meteo
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleP3PaysChange('1');
                      await handleP3VilleChange('1');
                    }}
                    className="font-medium text-emerald-700 hover:underline cursor-pointer whitespace-nowrap"
                  >
                    Tester Djerba
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Zone: Live HTTP & Database Reference Panel */}
      <aside className="lg:col-span-5 space-y-5">
        {/* Context card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {activePart === 'partie1' && 'Partie 1 · Validation et Fetch'}
              {activePart === 'partie2' && 'Partie 2 · Listes liées en JSON'}
              {activePart === 'partie3' && 'Partie 3 · Axios et Open-Meteo'}
            </h3>
            <span className="font-mono text-xs text-emerald-700 font-medium">
              {activePart === 'partie3' ? 'axios.get()' : 'fetch()'}
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {activePart === 'partie1' &&
              "Le frontend valide avant l'envoi que le champ n'est pas vide et correspond à un entier strict (/^\\d+$/). Sinon, aucune requête réseau n'est émise."}
            {activePart === 'partie2' &&
              "Au chargement, aucun pays n'est sélectionné. Lors du choix d'un pays, les villes correspondantes (clé étrangère id_pays) sont récupérées en JSON sans sélection par défaut."}
            {activePart === 'partie3' &&
              "Les échanges passent par Axios. Le serveur lit latitude et longitude en base puis interroge Open-Meteo côté backend avant de renvoyer la météo du jour."}
          </p>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Identifiants en base : 1 Tunisie · 2 France · 3 Maroc · 4 Italie · 5 Espagne · 6 Japon
            </span>
          </div>
        </div>

        {/* Real-time HTTP Request Trace */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900">
                Journal des requêtes HTTP
              </h3>
            </div>
            {traces.length > 0 && (
              <button
                type="button"
                onClick={() => setTraces([])}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Effacer
              </button>
            )}
          </div>

          {traces.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
              Interagissez avec le formulaire à gauche pour observer les appels Fetch / Axios et les réponses JSON.
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {traces.map((trace) => (
                <div
                  key={trace.id}
                  className="border border-slate-200 rounded-lg p-3 bg-slate-50/70"
                >
                  <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                    <span className="font-mono font-semibold text-slate-800 flex items-center gap-1.5">
                      {trace.client === 'Validation JS' && (
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      {trace.client}
                    </span>
                    <span
                      className={`font-mono tabular-nums ${
                        trace.status.startsWith('200')
                          ? 'text-emerald-700'
                          : trace.status.startsWith('Bloquée')
                            ? 'text-amber-700'
                            : 'text-red-600'
                      }`}
                    >
                      {trace.status}
                      {trace.durationMs !== null ? ` · ${trace.durationMs} ms` : ''}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-600 truncate mb-2">
                    {trace.url}
                  </p>
                  <pre className="text-[11px] leading-snug font-mono bg-slate-900 text-slate-100 p-2.5 rounded-md overflow-x-auto max-h-36">
                    {JSON.stringify(trace.payload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
