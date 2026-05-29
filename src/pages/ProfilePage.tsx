
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Calendar, LogOut, User } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/Button';
import { useAuth } from '../services/useAuth';
import { useAktivitaeten } from '../services/useActivities';
import { getCategoryColor } from '../utils/categoryUtils';

export function Profilseite() {
  // 1. HOOKS
  const { userId }                         = useParams<{ userId?: string }>();
  const navigate                           = useNavigate();
  const { nutzer: aktuellerNutzer, abmelden } = useAuth();
  const { aktivitaeten, nutzerNachIdAbrufen } = useAktivitaeten();

  // 2. Eigenes oder fremdes Profil?
  const istEigeneProfil = !userId || userId === aktuellerNutzer?.nutzer_nr;
  const nutzer = istEigeneProfil
    ? aktuellerNutzer
    : (userId ? nutzerNachIdAbrufen(userId) : null);

  // 3. Fehlerfall
  if (!nutzer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Profil nicht gefunden.</h2>
          <Link to="/" className="text-blue-600 text-sm hover:underline">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  // 4. Aktivitäten dieses Nutzers
  const nutzerAktivitaeten = aktivitaeten.filter(a =>
    a.teilnehmer.some(t => t.nutzer_nr === nutzer.nutzer_nr)
  );

  // 5. Abmelden
  const abmeldenHandler = () => {
    abmelden();
    navigate('/login');
  };

  // 6. Vollständiger Name
  const vollstaendigerName = nutzer.vorname ? `${nutzer.vorname} ${nutzer.name}` : nutzer.name;

  return (
    <div className="min-h-screen bg-gray-100 pb-20">

      {/* HEADER */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center gap-2 py-3">
            {!istEigeneProfil ? (
              <>
                <Link to="/">
                  <button className="p-2 hover:bg-gray-100 text-gray-600 font-semibold text-sm flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" />
                    Zurück
                  </button>
                </Link>
                <span className="text-gray-300">|</span>
                <span className="text-sm font-semibold text-gray-700 truncate">
                  {vollstaendigerName}
                </span>
              </>
            ) : (
              <h1 className="text-base font-bold text-gray-900">Mein Profil</h1>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">

        {/* PROFIL-BLOCK */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">

          {/* Name + Avatar */}
          <div className="px-4 pt-5 pb-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{vollstaendigerName}</h2>
              <p className="text-sm text-gray-500">{nutzer.geburtsdatum} Jahre</p>
              {nutzer.universitaet && (
                <p className="text-xs text-gray-400 mt-0.5">{nutzer.universitaet}</p>
              )}
              {nutzer.studiengang && (
                <p className="text-xs text-gray-400">{nutzer.studiengang}</p>
              )}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Bio */}
          <div className="px-4 py-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              Über mich
            </p>
            <p className="text-sm text-gray-700">{nutzer.bio || '–'}</p>
          </div>

          <hr className="border-gray-200" />

          {/* Interessen */}
          <div className="px-4 py-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
              Interessen
            </p>
            <div className="flex flex-wrap gap-2">
              {nutzer.interessen.map((interesse, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200 rounded"
                >
                  {interesse}
                </span>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Aktivitäten */}
          <div className="px-4 py-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
              {istEigeneProfil ? 'Meine Aktivitäten' : 'Aktivitäten'}
            </p>

            {nutzerAktivitaeten.length > 0 ? (
              <ul className="space-y-1">
                {nutzerAktivitaeten.slice(0, 5).map(aktivitaet => (
                  <li key={aktivitaet.aktivitaeten_nr}>
                    <Link to={`/activity/${aktivitaet.aktivitaeten_nr}`}>
                      <div className="flex items-center justify-between py-1.5 px-1 hover:bg-gray-50 rounded transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          {/* Farbiger Kategorie-Punkt */}
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: getCategoryColor(aktivitaet.kategorie) }}
                          />
                          <p className="text-sm text-gray-900 truncate">
                            {aktivitaet.titel}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 flex items-center gap-1 ml-3 flex-shrink-0">
                          <Calendar className="w-3 h-3" />
                          {new Date(aktivitaet.datum).toLocaleDateString('de-DE', {
                            day: '2-digit', month: '2-digit', year: '2-digit'
                          })}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Noch keine Aktivitäten.</p>
            )}
          </div>

        </div>

        {/* ABMELDEN */}
        {istEigeneProfil && (
          <div className="mt-4">
            <Button variant="danger" fullWidth onClick={abmeldenHandler}>
              <LogOut className="w-4 h-4 mr-2 inline" />
              Abmelden
            </Button>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  );
}
