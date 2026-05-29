import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import * as LucideIcons from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../services/useAuth';
import { useAktivitaeten } from '../services/useActivities';
import { AktivitaetKategorie } from '../types';
import { toast } from 'sonner';

// Kategorien
const KATEGORIE_LISTE = [
  { id: 'sport',   label: 'Sport',   symbol: LucideIcons.Trophy          },
  { id: 'kultur',  label: 'Kultur',  symbol: LucideIcons.Theater         },
  { id: 'essen',   label: 'Essen',   symbol: LucideIcons.UtensilsCrossed },
  { id: 'lernen',  label: 'Lernen',  symbol: LucideIcons.BookOpen        },
  { id: 'outdoor', label: 'Outdoor', symbol: LucideIcons.Trees           },
  { id: 'gaming',  label: 'Gaming',  symbol: LucideIcons.Gamepad2        },
  { id: 'musik',   label: 'Musik',   symbol: LucideIcons.Music           },
  { id: 'kunst',   label: 'Kunst',   symbol: LucideIcons.Palette         },
];

// Auto-Formatierung beim Tippen

// Datum: TT.MM.JJJJ
function datumAutoFormatieren(roh: string): string {
  const ziffern = roh.replace(/\D/g, '').slice(0, 8);
  if (ziffern.length <= 2) return ziffern;
  if (ziffern.length <= 4) return `${ziffern.slice(0, 2)}.${ziffern.slice(2)}`;
  return `${ziffern.slice(0, 2)}.${ziffern.slice(2, 4)}.${ziffern.slice(4)}`;
}

// Uhrzeit: HH:MM
function uhrzeitAutoFormatieren(roh: string): string {
  const ziffern = roh.replace(/\D/g, '').slice(0, 4);
  if (ziffern.length <= 2) return ziffern;
  return `${ziffern.slice(0, 2)}:${ziffern.slice(2)}`;
}

// Validierungsregeln

function titelValidieren(v: string): string {
  if (!v.trim())            return 'Bitte einen Titel eingeben.';
  if (v.trim().length < 3)  return 'Mindestens 3 Zeichen.';
  if (v.trim().length > 60) return 'Maximal 60 Zeichen.';
  return '';
}

function beschreibungValidieren(v: string): string {
  if (!v.trim())            return 'Bitte eine Beschreibung eingeben.';
  if (v.trim().length < 10) return 'Mindestens 10 Zeichen.';
  return '';
}

function datumValidieren(v: string): string {
  if (!v.trim()) return 'Bitte ein Datum eingeben (TT.MM.JJJJ).';

  const treffer = v.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!treffer) return 'Format ungültig – bitte TT.MM.JJJJ eingeben.';

  const tag   = parseInt(treffer[1], 10);
  const monat = parseInt(treffer[2], 10);
  const jahr  = parseInt(treffer[3], 10);

  if (monat < 1 || monat > 12) return 'Ungültiger Monat (01–12).';
  if (tag   < 1 || tag   > 31) return 'Ungültiger Tag (01–31).';

  const datumObjekt = new Date(jahr, monat - 1, tag);
  if (
    datumObjekt.getFullYear() !== jahr  ||
    datumObjekt.getMonth()    !== monat - 1 ||
    datumObjekt.getDate()     !== tag
  ) return 'Dieses Datum existiert nicht.';

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);
  if (datumObjekt < heute) return 'Datum muss in der Zukunft liegen.';

  return '';
}

function uhrzeitValidieren(v: string): string {
  if (!v.trim()) return 'Bitte eine Uhrzeit eingeben (HH:MM).';

  const treffer = v.match(/^(\d{2}):(\d{2})$/);
  if (!treffer) return 'Format ungültig – bitte HH:MM eingeben.';

  const stunden  = parseInt(treffer[1], 10);
  const minuten  = parseInt(treffer[2], 10);

  if (stunden > 23) return 'Ungültige Stunde (00–23).';
  if (minuten > 59) return 'Ungültige Minute (00–59).';

  return '';
}

function ortValidieren(v: string): string {
  if (!v.trim())                   return 'Bitte einen Ort eingeben.';
  if (v.trim().length < 3)         return 'Mindestens 3 Zeichen.';
  if (!/[a-zA-ZäöüÄÖÜß]/.test(v)) return 'Der Ort muss Buchstaben enthalten.';
  return '';
}

function maxTeilnehmerValidieren(v: string): string {
  const n = parseInt(v, 10);
  if (isNaN(n)) return 'Bitte eine gültige Zahl eingeben.';
  if (n < 2)    return 'Mindestens 2 Teilnehmer.';
  if (n > 50)   return 'Maximal 50 Teilnehmer.';
  return '';
}

// Datum von TT.MM.JJJJ → YYYY-MM-DD umwandeln für interne Speicherung als datum
function zuISODatum(ttmmjjjj: string): string {
  const [tag, monat, jahr] = ttmmjjjj.split('.');
  return `${jahr}-${monat.padStart(2,'0')}-${tag.padStart(2,'0')}`;
}

export function AktivitaetErstellenSeite() {
  const navigate = useNavigate();
  const { nutzer }  = useAuth();
  const { aktivitaetErstellen } = useAktivitaeten();

  // Variablennamen = DB-Spaltennamen
  const [titel,        setTitel]        = useState('');
  const [beschreibung, setBeschreibung] = useState('');
  const [kategorie,    setKategorie]    = useState<AktivitaetKategorie>('sport');
  const [datum,        setDatum]        = useState(''); // TT.MM.JJJJ (Eingabe)
  const [uhrzeit,      setUhrzeit]      = useState(''); // HH:MM
  const [ort,          setOrt]          = useState('');
  const [maxAnzahl,    setMaxAnzahl]    = useState('6'); // max_anzahl

  // Fehler erst nach Interaktion zeigen
  const [beruehrt,        setBeruehrt]        = useState<Record<string, boolean>>({});
  const [absendeVersucht, setAbsendeVersucht] = useState(false);

  const beruehren = (feld: string) =>
    setBeruehrt(prev => ({ ...prev, [feld]: true }));

  const fehlerAnzeigen = (feld: string, meldung: string) =>
    (beruehrt[feld] || absendeVersucht) ? meldung : '';

  // Aktuelle Validierungsergebnisse
  const fehler = {
    titel:       titelValidieren(titel),
    beschreibung: beschreibungValidieren(beschreibung),
    datum:       datumValidieren(datum),
    uhrzeit:     uhrzeitValidieren(uhrzeit),
    ort:         ortValidieren(ort),
    maxAnzahl:   maxTeilnehmerValidieren(maxAnzahl),
  };

  const formularGueltig = Object.values(fehler).every(f => f === '');

  // Formular absenden
  const absenden = async (e: React.FormEvent) => {
    e.preventDefault();
    setAbsendeVersucht(true);

    if (!formularGueltig) {
      toast.error('Bitte alle Felder korrekt ausfüllen.');
      return;
    }
    if (!nutzer) {
      toast.error('Du musst angemeldet sein!');
      return;
    }

    // Datum intern als YYYY-MM-DD speichern (DB-Format)
    await aktivitaetErstellen(
      {
        titel,
        beschreibung,
        kategorie,
        datum: zuISODatum(datum),
        uhrzeit,
        ort,
        max_anzahl: parseInt(maxAnzahl, 10),
        ersteller_nr: nutzer.nutzer_nr,
      },
      nutzer
    );

    toast.success('Aktivität wurde erfolgreich erstellt!');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">

      {/* HEADER */}
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center py-3">
            <h1 className="text-base font-bold text-gray-900">Neue Aktivität erstellen</h1>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-4">
        <form onSubmit={absenden} noValidate>

          <div className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">

            {/* Titel */}
            <div className="px-4 pt-4 pb-4">
              <Input
                label="Titel"
                value={titel}
                onChange={(e) => setTitel(e.target.value)}
                onBlur={() => beruehren('titel')}
                error={fehlerAnzeigen('titel', fehler.titel)}
                maxLength={60}
              />
            </div>

            <hr className="border-gray-200" />

            {/* Beschreibung */}
            <div className="px-4 py-4">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Beschreibung
              </label>
              <textarea
                value={beschreibung}
                onChange={(e) => setBeschreibung(e.target.value)}
                onBlur={() => beruehren('beschreibung')}
                rows={4}
                className={`w-full px-3 py-2 border-2 text-sm focus:outline-none resize-none bg-white transition-colors rounded
                  ${(beruehrt['beschreibung'] || absendeVersucht) && fehler.beschreibung
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:border-blue-500'
                  }`}
              />
              {(beruehrt['beschreibung'] || absendeVersucht) && fehler.beschreibung && (
                <p className="mt-1 text-xs text-red-600 font-medium">{fehler.beschreibung}</p>
              )}
            </div>

            <hr className="border-gray-200" />

            {/* Kategorie */}
            <div className="px-4 py-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                Kategorie
              </p>
              <div className="grid grid-cols-4 gap-2">
                {KATEGORIE_LISTE.map(kat => {
                  const Symbol = kat.symbol;
                  return (
                    <button
                      key={kat.id}
                      type="button"
                      onClick={() => setKategorie(kat.id as AktivitaetKategorie)}
                      className={`flex flex-col items-center gap-1 p-2.5 border-2 transition-colors rounded ${
                        kategorie === kat.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <Symbol className="w-5 h-5" />
                      <span className="text-xs font-semibold">{kat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Datum & Uhrzeit */}
            <div className="px-4 py-4">
              <div className="grid grid-cols-2 gap-3">

                {/* Datum (TT.MM.JJJJ → intern YYYY-MM-DD) */}
                <div>
                  <Input
                    label="Datum"
                    value={datum}
                    inputMode="numeric"
                    onChange={(e) => setDatum(datumAutoFormatieren(e.target.value))}
                    onBlur={() => beruehren('datum')}
                    error={fehlerAnzeigen('datum', fehler.datum)}
                    maxLength={10}
                  />
                  <p className="mt-0.5 text-xs text-gray-400">TT.MM.JJJJ</p>
                </div>

                {/* Uhrzeit (HH:MM) */}
                <div>
                  <Input
                    label="Uhrzeit"
                    value={uhrzeit}
                    inputMode="numeric"
                    onChange={(e) => setUhrzeit(uhrzeitAutoFormatieren(e.target.value))}
                    onBlur={() => beruehren('uhrzeit')}
                    error={fehlerAnzeigen('uhrzeit', fehler.uhrzeit)}
                    maxLength={5}
                  />
                  <p className="mt-0.5 text-xs text-gray-400">HH:MM</p>
                </div>

              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Ort */}
            <div className="px-4 py-4">
              <Input
                label="Treffpunkt / Ort"
                value={ort}
                onChange={(e) => setOrt(e.target.value)}
                onBlur={() => beruehren('ort')}
                error={fehlerAnzeigen('ort', fehler.ort)}
              />
            </div>

            <hr className="border-gray-200" />

            {/* Max. Teilnehmer */}
            <div className="px-4 py-4">
              <Input
                type="number"
                label="Max. Teilnehmer"
                value={maxAnzahl}
                onChange={(e) => setMaxAnzahl(e.target.value)}
                onBlur={() => beruehren('maxAnzahl')}
                error={fehlerAnzeigen('maxAnzahl', fehler.maxAnzahl)}
                min="2"
                max="50"
              />
            </div>

          </div>

          {/* VORSCHAU */}
          {(titel || beschreibung) && (
            <div className="bg-white border border-gray-200 shadow-sm mt-4 px-4 py-4 rounded-lg">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
                Vorschau
              </p>
              <p className="font-bold text-gray-900 text-sm">{titel || '–'}</p>
              {beschreibung && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{beschreibung}</p>
              )}
              {datum && uhrzeit && (
                <p className="text-xs text-gray-400 mt-1">{datum} · {uhrzeit} Uhr</p>
              )}
              {ort && (
                <p className="text-xs text-gray-400 mt-0.5">{ort}</p>
              )}
            </div>
          )}

          {/* SUBMIT */}
          <div className="mt-4">
            <Button type="submit" fullWidth>
              Aktivität erstellen
            </Button>
          </div>

        </form>
      </div>

      <BottomNav />
    </div>
  );
}
