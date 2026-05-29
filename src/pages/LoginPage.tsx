
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../services/useAuth';
import { Button } from '../components/Button';
import { Input } from '../components/Input';

export function Anmeldeseite() {
  const navigate     = useNavigate();
  const { anmelden } = useAuth();

  const [email,    setEmail]    = useState('');
  const [passwort, setPasswort] = useState('');
  const [fehler,   setFehler]   = useState('');

  const absenden = async (e: React.FormEvent) => {
    e.preventDefault();
    setFehler('');
    if (!email || !passwort) {
      setFehler('Bitte alle Felder ausfüllen.');
      return;
    }
    const erfolgreich = await anmelden(email, passwort);
    if (erfolgreich) {
      navigate('/');
    } else {
      setFehler('Falsche Zugangsdaten.');
    }
  };

  // Demo-Account direkt einloggen
  const demoAnmeldung = async () => {
    const erfolgreich = await anmelden('demo@timetogether.de', 'demo123');
    if (erfolgreich) navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* App-Titel */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Time Together</h1>
          <p className="text-gray-500 mt-1 text-sm">Neue Aktivitäten, neue Freunde.</p>
        </div>

        {/* Anmelde-Formular */}
        <div className="bg-white border border-gray-200 p-6 rounded-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Anmelden</h2>

          <form onSubmit={absenden} className="space-y-4">
            <Input
              type="email"
              label="E-Mail Adresse"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              label="Passwort"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
            />

            {fehler && (
              <p className="text-sm text-red-600">{fehler}</p>
            )}

            <Button type="submit" fullWidth>
              Anmelden
            </Button>
          </form>

          {/* Trennlinie */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">oder</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <Button variant="secondary" fullWidth onClick={demoAnmeldung}>
            Demo-Account benutzen
          </Button>
        </div>

        {/* Link zur Registrierung */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Noch kein Account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">
            Registrieren
          </Link>
        </p>

      </div>
    </div>
  );
}
