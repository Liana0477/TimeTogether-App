
import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, User,
  Star, MessageSquare, Trash2, Send
} from 'lucide-react';
import { Button } from '../components/Button';
import { useAuth } from '../services/useAuth';
import { useAktivitaeten } from '../services/useActivities';
import { getCategoryColor } from '../utils/categoryUtils';

// Durchschnittsbewertung
function durchschnittBerechnen(bewertungen: { nutzer_nr: string; bewertung: number }[]): number | null {
  if (bewertungen.length === 0) return null;
  const summe = bewertungen.reduce((acc, b) => acc + b.bewertung, 0);
  return Math.round((summe / bewertungen.length) * 10) / 10; // eine Nachkommastelle
}

// Datum formatieren
function kommentarDatumFormatieren(isoString: string): string {
  const datum = new Date(isoString);
  return datum.toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  }) + ', ' + datum.toLocaleTimeString('de-DE', {
    hour: '2-digit', minute: '2-digit'
  }) + ' Uhr';
}

// Stern-Bewertung
interface SternBewertungEigenschaften {
  wert: number;       // aktueller Wert 0 = noch nicht bewertet
  beiAenderung: (v: number) => void;
  nurAnzeige?: boolean;
  groesse?: 'klein' | 'mittel';
}

function SternBewertung({ wert, beiAenderung, nurAnzeige = false, groesse = 'mittel' }: SternBewertungEigenschaften) {
  const [schwebend, setSchwebend] = useState(0);
  const symbolGroesse = groesse === 'klein' ? 'w-4 h-4' : 'w-6 h-6';
  const angezeigt = schwebend || wert;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(stern => (
        <button
          key={stern}
          type="button"
          disabled={nurAnzeige}
          onClick={() => !nurAnzeige && beiAenderung(stern)}
          onMouseEnter={() => !nurAnzeige && setSchwebend(stern)}
          onMouseLeave={() => !nurAnzeige && setSchwebend(0)}
          className={`${nurAnzeige ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          aria-label={`${stern} Stern${stern !== 1 ? 'e' : ''}`}
        >
          <Star
            className={`${symbolGroesse} transition-colors ${
              stern <= angezeigt
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-none text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}


export function AktivitaetDetailSeite() {

  const { id } = useParams<{ id: string }>();
  const { nutzer } = useAuth();
  const {
    aktivitaetNachIdAbrufen,
    nutzerNachIdAbrufen,
    aktivitaetBeitreten,
    aktivitaetVerlassen,
    kommentarHinzufuegen,
    kommentarLoeschen,
    bewertungAbgebenOderAktualisieren,
  } = useAktivitaeten();

  // Daten laden
  const aktivitaet = id ? aktivitaetNachIdAbrufen(id) : undefined;
  const ersteller  = aktivitaet ? nutzerNachIdAbrufen(aktivitaet.ersteller_nr) : undefined;


  const [istAngemeldet, setIstAngemeldet] = useState(
    nutzer && aktivitaet ? aktivitaet.teilnehmer.some(t => t.nutzer_nr === nutzer.nutzer_nr) : false
  );
  const [kommentarText,   setKommentarText]   = useState('');
  const [kommentarFehler, setKommentarFehler] = useState('');

  // Fehlerfall
  if (!aktivitaet || !ersteller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Aktivität nicht gefunden.</h2>
          <Link to="/" className="text-blue-600 text-sm hover:underline">
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const istVoll         = aktivitaet.aktuelle_teilnehmer >= aktivitaet.max_anzahl;
  const kategoriefarbe  = getCategoryColor(aktivitaet.kategorie);
  const durchschnitt    = durchschnittBerechnen(aktivitaet.bewertungen);

  // Eigene Bewertung des eingeloggten Nutzers 0 = noch keine
  const meineBewertung = nutzer
    ? (aktivitaet.bewertungen.find(b => b.nutzer_nr === nutzer.nutzer_nr)?.bewertung ?? 0)
    : 0;

  const beitreten = async () => {
    if (nutzer) { await aktivitaetBeitreten(aktivitaet.aktivitaeten_nr, nutzer); setIstAngemeldet(true); }
  };

  const verlassen = async () => {
    if (nutzer) { await aktivitaetVerlassen(aktivitaet.aktivitaeten_nr, nutzer.nutzer_nr); setIstAngemeldet(false); }
  };

  // Bewertung abgeben/aktualisieren
  const bewertenHandler = async (wert: number) => {
    if (!nutzer) return;
    if (nutzer.nutzer_nr === aktivitaet.ersteller_nr) return;

    await bewertungAbgebenOderAktualisieren(aktivitaet.aktivitaeten_nr, nutzer.nutzer_nr, wert);
  };

  // Kommentar absenden
  const kommentarAbsenden = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nutzer) return;

    if (!kommentarText.trim()) {
      setKommentarFehler('Bitte einen Kommentar eingeben.');
      return;
    }
    if (kommentarText.trim().length < 3) {
      setKommentarFehler('Mindestens 3 Zeichen.');
      return;
    }
    if (kommentarText.trim().length > 300) {
      setKommentarFehler('Maximal 300 Zeichen.');
      return;
    }

    // nutzer_name = Vorname + Nachname
    const nutzerName = nutzer.vorname ? `${nutzer.vorname} ${nutzer.name}` : nutzer.name;
    await kommentarHinzufuegen(aktivitaet.aktivitaeten_nr, nutzer.nutzer_nr, nutzerName, kommentarText);
    setKommentarText('');
    setKommentarFehler('');
  };

  // Kommentar löschen
  const kommentarLoeschenHandler = async (kommentareNr: string) => {
    if (!nutzer) return;
    await kommentarLoeschen(aktivitaet.aktivitaeten_nr, kommentareNr, nutzer.nutzer_nr);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-28">

      {/* HEADER */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center gap-2 py-3">
            <Link to="/">
              <button className="p-2 hover:bg-gray-100 text-gray-600 font-semibold text-sm flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                Zurück
              </button>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-700 truncate">
              {aktivitaet.titel}
            </span>
          </div>
        </div>
      </header>

      {/* INHALT */}
      <div
        className="max-w-lg mx-auto px-4 py-5 bg-white mt-4 border border-gray-200 shadow-sm rounded-lg"
        style={{ borderLeftWidth: '4px', borderLeftColor: kategoriefarbe }}
      >

        {/* Kategorie + Status */}
        <div className="mb-3">
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: kategoriefarbe }}
          >
            {aktivitaet.kategorie}
          </span>
          {istAngemeldet && (
            <span className="ml-3 text-xs font-semibold text-green-700">
              ✓ Du nimmst teil
            </span>
          )}
          {istVoll && !istAngemeldet && (
            <span className="ml-3 text-xs font-semibold text-red-600">
              Ausgebucht
            </span>
          )}
        </div>

        {/* Titel */}
        <h1 className="text-xl font-bold text-gray-900 mb-2">{aktivitaet.titel}</h1>

        {/* Beschreibung */}
        <p className="text-sm text-gray-700 leading-relaxed mb-5">
          {aktivitaet.beschreibung}
        </p>

        <hr className="border-gray-200 mb-4" />

        {/* Details als einfache Liste */}
        <div className="space-y-2 mb-5 text-sm text-gray-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>
              {new Date(aktivitaet.datum).toLocaleDateString('de-DE', {
                weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{aktivitaet.uhrzeit} Uhr</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{aktivitaet.ort}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span>{aktivitaet.aktuelle_teilnehmer}/{aktivitaet.max_anzahl} Teilnehmer</span>
          </div>
        </div>

        <hr className="border-gray-200 mb-4" />

        {/* Teilnehmerliste */}
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
          Teilnehmer ({aktivitaet.teilnehmer.length})
        </h2>

        {aktivitaet.teilnehmer.length === 0 ? (
          <p className="text-sm text-gray-400">Noch niemand dabei.</p>
        ) : (
          <ul className="space-y-1">
            {aktivitaet.teilnehmer.map(teilnehmer => (
              <li key={teilnehmer.nutzer_nr}>
                <Link to={`/profile/${teilnehmer.nutzer_nr}`}>
                  <div className="flex items-center gap-3 py-1.5 hover:bg-gray-50 rounded px-1 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-sm text-gray-900">
                      {teilnehmer.vorname ? `${teilnehmer.vorname} ${teilnehmer.name}` : teilnehmer.name}
                    </span>
                    {teilnehmer.nutzer_nr === ersteller.nutzer_nr && (
                      <span className="text-xs text-gray-400 ml-auto">Organisator</span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <hr className="border-gray-200 mt-4 mb-4" />

        {/* BEWERTUNG */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-gray-400" />
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Bewertung
            </h2>
          </div>

          {/* Durchschnitt anzeigen */}
          <div className="flex items-center gap-3 mb-3">
            {durchschnitt !== null ? (
              <>
                <SternBewertung
                  wert={Math.round(durchschnitt)}
                  beiAenderung={() => {}}
                  nurAnzeige
                  groesse="klein"
                />
                <span className="text-sm font-bold text-gray-800">{durchschnitt}</span>
                <span className="text-xs text-gray-400">
                  ({aktivitaet.bewertungen.length} Bewertung{aktivitaet.bewertungen.length !== 1 ? 'en' : ''})
                </span>
              </>
            ) : (
              <p className="text-sm text-gray-400">Noch keine Bewertungen.</p>
            )}
          </div>

          {/* Eigene Bewertung abgeben */}
          {nutzer ? (
            <div className="bg-gray-50 border-2 border-gray-200 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                {meineBewertung > 0 ? 'Deine Bewertung (zum Ändern anklicken):' : 'Aktivität bewerten:'}
              </p>
              <SternBewertung wert={meineBewertung} beiAenderung={bewertenHandler} />
              {meineBewertung > 0 && (
                <p className="text-xs text-green-700 mt-1 font-semibold">
                  ✓ Du hast {meineBewertung} Stern{meineBewertung !== 1 ? 'e' : ''} gegeben.
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400">Zum Bewerten bitte einloggen.</p>
          )}
        </div>

        <hr className="border-gray-200 mb-4" />

        {/*  KOMMENTARE  */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
              Kommentare ({aktivitaet.kommentare.length})
            </h2>
          </div>

          {/* Kommentarliste */}
          {aktivitaet.kommentare.length === 0 ? (
            <p className="text-sm text-gray-400 mb-4">Noch keine Kommentare. Sei der Erste!</p>
          ) : (
            <ul className="space-y-3 mb-4">
              {aktivitaet.kommentare.map(kommentar => (
                <li
                  key={kommentar.kommentare_nr}
                  className="bg-gray-50 border border-gray-200 p-3 rounded-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    {/* Autor & Datum */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
                        <User className="w-3 h-3 text-blue-500" />
                      </div>
                      <span className="text-xs font-bold text-gray-800">{kommentar.nutzer_name}</span>
                      <span className="text-xs text-gray-400">
                        {kommentarDatumFormatieren(kommentar.zeitstempel)}
                      </span>
                    </div>

                    {/* Löschen-Button nur eigene Kommentare */}
                    {nutzer && kommentar.nutzer_nr === nutzer.nutzer_nr && (
                      <button
                        onClick={() => kommentarLoeschenHandler(kommentar.kommentare_nr)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                        title="Kommentar löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Kommentartext */}
                  <p className="text-sm text-gray-700 leading-relaxed mt-1">
                    {kommentar.text}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {/* Neuen Kommentar schreiben */}
          {nutzer ? (
            <form onSubmit={kommentarAbsenden} noValidate>
              <div className="flex gap-2 items-start">
                {/* Textarea */}
                <div className="flex-1">
                  <textarea
                    value={kommentarText}
                    onChange={(e) => {
                      setKommentarText(e.target.value);
                      if (kommentarFehler) setKommentarFehler('');
                    }}
                    rows={2}
                    maxLength={300}
                    className={`w-full px-3 py-2 border-2 text-sm focus:outline-none resize-none bg-white transition-colors rounded ${
                      kommentarFehler
                        ? 'border-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                  />
                  {/* Zeichenzähler & Fehlermeldung */}
                  <div className="flex items-center justify-between mt-0.5">
                    {kommentarFehler ? (
                      <p className="text-xs text-red-600 font-medium">{kommentarFehler}</p>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-gray-400 ml-auto">
                      {kommentarText.length}/300
                    </span>
                  </div>
                </div>

                {/* Absenden-Button */}
                <button
                  type="submit"
                  className="mt-0.5 p-2.5 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-colors rounded"
                  disabled={!kommentarText.trim()}
                  title="Kommentar senden"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-gray-400">Zum Kommentieren bitte einloggen.</p>
          )}
        </div>

      </div>

      {/* TEILNAHME-BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 p-4 z-20">
        <div className="max-w-lg mx-auto">
          {istAngemeldet ? (
            <Button variant="danger" fullWidth onClick={verlassen}>
              Teilnahme absagen
            </Button>
          ) : (
            <Button fullWidth onClick={beitreten} disabled={istVoll}>
              {istVoll ? 'Leider ausgebucht' : 'Jetzt teilnehmen'}
            </Button>
          )}
        </div>
      </div>

    </div>
  );
}
