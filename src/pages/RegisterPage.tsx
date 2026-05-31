
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../services/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import {
  User,
  Trophy,
  Theater,
  UtensilsCrossed,
  BookOpen,
  Trees,
  Gamepad2,
} from 'lucide-react';

type Schritt = 'konto' | 'profil' | 'interessen';

// Farb-Optionen für den Avatar
const AVATAR_FARBEN = [
  { id: 'blue',   hintergrund: 'bg-blue-200',   symbol: 'text-blue-600',   rahmen: 'border-blue-500'   },
  { id: 'green',  hintergrund: 'bg-green-200',  symbol: 'text-green-600',  rahmen: 'border-green-500'  },
  { id: 'purple', hintergrund: 'bg-purple-200', symbol: 'text-purple-600', rahmen: 'border-purple-500' },
  { id: 'orange', hintergrund: 'bg-orange-200', symbol: 'text-orange-600', rahmen: 'border-orange-500' },
  { id: 'red',    hintergrund: 'bg-red-200',    symbol: 'text-red-600',    rahmen: 'border-red-500'    },
  { id: 'pink',   hintergrund: 'bg-pink-200',   symbol: 'text-pink-600',   rahmen: 'border-pink-500'   },
];

// Interessen mit lucide-react Icons
const INTERESSEN_OPTIONEN = [
  { id: 'sport',   label: 'Sport',   Symbol: Trophy          },
  { id: 'kultur',  label: 'Kultur',  Symbol: Theater         },
  { id: 'essen',   label: 'Essen',   Symbol: UtensilsCrossed },
  { id: 'lernen',  label: 'Lernen',  Symbol: BookOpen        },
  { id: 'outdoor', label: 'Outdoor', Symbol: Trees           },
  { id: 'gaming',  label: 'Gaming',  Symbol: Gamepad2        },
];

export function Registrierungsseite() {
  const navigate        = useNavigate();
  const { registrieren} = useAuth();

  const [aktuellerSchritt, setAktuellerSchritt] = useState<Schritt>('konto');

  // Formular-Felder
  const [email,      setEmail]      = useState('');
  const [passwort,   setPasswort]   = useState('');
  const [vorname,    setVorname]    = useState('');
  const [name,       setName]       = useState('');
  const [alter,      setAlter]      = useState('');
  const [avatar,     setAvatar]     = useState(AVATAR_FARBEN[0].id);
  const [universitaet, setUniversitaet] = useState('');
  const [studiengang, setStudiengang] = useState('');
  const [bio,        setBio]        = useState('');
  const [interessen, setInteressen] = useState<string[]>([]);
  const [fehler,     setFehler]     = useState('');

  const weiter = async () => {
    setFehler('');
    if (aktuellerSchritt === 'konto') {
      if (!vorname || !name || !email || !passwort) {
        setFehler('Bitte alle Felder ausfüllen.');
        return;
      }
      setAktuellerSchritt('profil');
    } else if (aktuellerSchritt === 'profil') {
      if (!alter || !universitaet || !studiengang) {
        setFehler('Bitte alle Felder ausfüllen.');
        return;
      }
      setAktuellerSchritt('interessen');
    } else {
      if (interessen.length < 3) {
        setFehler('Bitte mindestens 3 Interessen auswählen.');
        return;
      }
      await registrieren({
        email,
        passwort,
        vorname,
        name,
        alter,
        universitaet,
        studiengang,
        avatar_farbe: avatar,
        bio,
        interessen,
      });
      navigate('/');
    }
  };

  const zurueck = () => {
    setFehler('');
    if (aktuellerSchritt === 'profil')    setAktuellerSchritt('konto');
    if (aktuellerSchritt === 'interessen') setAktuellerSchritt('profil');
  };

  const interesseUmschalten = (label: string) => {
    setInteressen(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  // Schritt-Anzeige als einfacher Text
  const schrittBeschriftung: Record<Schritt, string> = {
    konto:      'Schritt 1 von 3 – Konto',
    profil:     'Schritt 2 von 3 – Profil',
    interessen: 'Schritt 3 von 3 – Interessen',
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">

        {/* Titel */}
        <div className="text-center mb-5">
          <h1 className="text-2xl font-bold text-gray-900">Time Together</h1>
          <p className="text-sm text-gray-500 mt-1">Registrierung</p>
        </div>

        {/* Formular-Block */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg">

          {/* Schritt-Anzeige */}
          <p className="text-xs text-gray-400 mb-4 uppercase tracking-wide font-semibold">
            {schrittBeschriftung[aktuellerSchritt]}
          </p>

          {/* Schritt 1: Konto */}
          {aktuellerSchritt === 'konto' && (
            <div className="space-y-4">
              <Input label="Vorname" value={vorname}
                onChange={e => setVorname(e.target.value)} required />
              <Input label="Name" value={name}
                onChange={e => setName(e.target.value)} required />
              <Input type="email" label="E-Mail" value={email}
                onChange={e => setEmail(e.target.value)} required />
              <Input type="password" label="Passwort" value={passwort}
                onChange={e => setPasswort(e.target.value)} required />
            </div>
          )}

          {/* Schritt 2: Profil */}
          {aktuellerSchritt === 'profil' && (
            <div className="space-y-4">

              {/* Avatar-Farbe wählen */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profilfarbe
                </label>
                <div className="flex gap-2">
                  {AVATAR_FARBEN.map(farbe => (
                    <button
                      key={farbe.id}
                      type="button"
                      onClick={() => setAvatar(farbe.id)}
                      className={`w-9 h-9 rounded-full ${farbe.hintergrund} border-2 flex items-center justify-center transition-all ${
                        avatar === farbe.id ? `${farbe.rahmen} scale-110` : 'border-transparent'
                      }`}
                    >
                      <User className={`w-4 h-4 ${farbe.symbol}`} />
                    </button>
                  ))}
                </div>
              </div>

              <Input type="number" label="Alter" value={alter}
                onChange={e => setAlter(e.target.value)}
                min="18" max="99" required />
              <Input label="Universität" value={universitaet}
                onChange={e => setUniversitaet(e.target.value)} required />
              <Input label="Studiengang" value={studiengang}
                onChange={e => setStudiengang(e.target.value)} required />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Kurze Bio{' '}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2.5 border-2 border-gray-300 text-sm focus:outline-none focus:border-blue-500 resize-none bg-white rounded"
                  maxLength={150}
                />
              </div>
            </div>
          )}

          {/* Schritt 3: Interessen */}
          {aktuellerSchritt === 'interessen' && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                Mindestens 3 auswählen:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {INTERESSEN_OPTIONEN.map(interesse => (
                  <button
                    key={interesse.id}
                    type="button"
                    onClick={() => interesseUmschalten(interesse.label)}
                    className={`flex items-center gap-2 p-3 border-2 text-left transition-colors rounded ${
                      interessen.includes(interesse.label)
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <interesse.Symbol className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-semibold">{interesse.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {interessen.length} ausgewählt
              </p>
            </div>
          )}

          {/* Fehler */}
          {fehler && (
            <p className="mt-3 text-sm text-red-600">{fehler}</p>
          )}

          {/* Buttons */}
          <div className="flex gap-2 mt-5">
            {aktuellerSchritt !== 'konto' && (
              <Button variant="secondary" onClick={zurueck}>
                Zurück
              </Button>
            )}
            <Button fullWidth onClick={weiter}>
              {aktuellerSchritt === 'interessen' ? 'Registrieren' : 'Weiter'}
            </Button>
          </div>
        </div>

        {/* Zum Login */}
        {aktuellerSchritt === 'konto' && (
          <p className="text-center text-sm text-gray-600 mt-4">
            Schon registriert?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Zum Login
            </Link>
          </p>
        )}

      </div>
    </div>
  );
}
