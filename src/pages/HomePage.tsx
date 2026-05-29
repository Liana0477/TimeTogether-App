
import React, { useState } from 'react';
import { Link } from 'react-router';
import { Search, Users, Calendar, MapPin, Clock } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { useAuth } from '../services/useAuth';
import { useAktivitaeten } from '../services/useActivities';
import { KATEGORIEN } from '../data/mockData';
import { getCategoryColor } from '../utils/categoryUtils';

export function Startseite() {
  // Daten aus dem Context holen
  const { nutzer }        = useAuth();
  const { aktivitaeten }  = useAktivitaeten();

  // Filter-State
  const [suchbegriff,        setSuchbegriff]        = useState('');
  const [ausgewaehlteKategorie, setAusgewaehlteKategorie] = useState('alle');

  // Filtern: Suche + Kategorie + nur zukünftige Aktivitäten
  const gefilterteAktivitaeten = aktivitaeten.filter(aktivitaet => {
    const trefferSuche =
      aktivitaet.titel.toLowerCase().includes(suchbegriff.toLowerCase()) ||
      aktivitaet.beschreibung.toLowerCase().includes(suchbegriff.toLowerCase());
    const trefferKategorie =
      ausgewaehlteKategorie === 'alle' || aktivitaet.kategorie === ausgewaehlteKategorie;
    const istZukuenftig = new Date(aktivitaet.datum) >= new Date();
    return trefferSuche && trefferKategorie && istZukuenftig;
  });

  // Sortieren nach Datum
  const sortiertAktivitaeten = [...gefilterteAktivitaeten].sort(
    (a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime()
  );

  return (
    <div className="min-h-screen bg-gray-100 pb-20">

      {/* HEADER */}
      <header className="bg-blue-600 text-white sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-3">

          {/* Titel + Begrüßung */}
          <div className="mb-3">
            <h1 className="text-xl font-bold">Time Together</h1>
            <p className="text-blue-100 text-sm mt-0.5">
              Hallo, {nutzer?.vorname || nutzer?.name.split(' ')[0] || 'Gast'}!
            </p>
          </div>

          {/* Suchfeld */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={suchbegriff}
              onChange={(e) => setSuchbegriff(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-blue-400 text-sm text-gray-900 focus:outline-none focus:border-white bg-white rounded"
            />
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4">

        {/* KATEGORIE-FILTER */}
        <div className="py-3 flex items-center gap-2">
          <label htmlFor="kategorie-auswahl" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
            Kategorie:
          </label>
          <select
            id="kategorie-auswahl"
            value={ausgewaehlteKategorie}
            onChange={(e) => setAusgewaehlteKategorie(e.target.value)}
            className="flex-1 border border-gray-300 px-3 py-2 text-sm bg-white text-gray-800 focus:outline-none focus:border-blue-500 rounded"
          >
            {KATEGORIEN.map(kat => (
              <option key={kat.id} value={kat.id}>
                {kat.label}
              </option>
            ))}
          </select>
        </div>

        {/* AKTIVITÄTEN-LISTE */}
        {sortiertAktivitaeten.length > 0 ? (
          <div className="bg-white border border-gray-200 mb-6 rounded-lg overflow-hidden">
            {sortiertAktivitaeten.map((aktivitaet, index) => {
              const istAngemeldet = nutzer
                ? aktivitaet.teilnehmer.some(t => t.nutzer_nr === nutzer.nutzer_nr)
                : false;

              return (
                <React.Fragment key={aktivitaet.aktivitaeten_nr}>
                  {index > 0 && <hr className="border-gray-200" />}
                  <Link to={`/activity/${aktivitaet.aktivitaeten_nr}`}>
                    <div className="px-4 py-3 hover:bg-gray-50 transition-colors flex gap-0">

                      {/* Farbiger linker Streifen nach Kategorie */}
                      <div
                        className="w-1 rounded-sm flex-shrink-0 mr-3"
                        style={{ backgroundColor: getCategoryColor(aktivitaet.kategorie) }}
                      />

                      <div className="flex-1 min-w-0">
                        {/* Kategorie-Label */}
                        <p
                          className="text-xs font-bold uppercase tracking-wide mb-0.5"
                          style={{ color: getCategoryColor(aktivitaet.kategorie) }}
                        >
                          {aktivitaet.kategorie}
                        </p>

                        {/* Titel + Badge */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-bold text-gray-900 text-sm leading-snug">
                            {aktivitaet.titel}
                          </p>
                          {istAngemeldet && (
                            <span className="flex-shrink-0 text-xs font-semibold text-green-700">
                              ✓ Dabei
                            </span>
                          )}
                        </div>

                        {/* Beschreibung */}
                        <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                          {aktivitaet.beschreibung}
                        </p>

                        {/* Info-Zeile */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {new Date(aktivitaet.datum).toLocaleDateString('de-DE', {
                              weekday: 'short', day: '2-digit', month: '2-digit'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {aktivitaet.uhrzeit} Uhr
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-[160px]">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="truncate">{aktivitaet.ort}</span>
                          </span>
                          <span className="flex items-center gap-1 ml-auto">
                            <Users className="w-3 h-3 text-gray-400" />
                            {aktivitaet.aktuelle_teilnehmer}/{aktivitaet.max_anzahl}
                          </span>
                        </div>
                      </div>

                    </div>
                  </Link>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-base font-bold text-gray-800 mb-1">
              Keine Aktivitäten gefunden
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {suchbegriff
                ? 'Versuche einen anderen Suchbegriff'
                : 'Für diese Kategorie gibt es noch keine Aktivitäten'}
            </p>
            <Link to="/create">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors rounded">
                + Aktivität erstellen
              </button>
            </Link>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}
