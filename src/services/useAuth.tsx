
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Nutzer } from '../types';
import { authService } from './authService';

interface AuthContextTyp {
  nutzer: Nutzer | null;
  anmelden: (email: string, passwort: string) => Promise<boolean>;
  abmelden: () => void;
  registrieren: (nutzerdaten: Partial<Nutzer> & { email: string; passwort: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextTyp | undefined>(undefined);

export function AuthAnbieter({ children }: { children: ReactNode }) {
  const [nutzer, setNutzer] = useState<Nutzer | null>(authService.aktuellenNutzerAbrufen());

  const anmelden = async (email: string, passwort: string): Promise<boolean> => {
    const erfolgreich = await authService.anmelden(email, passwort);
    if (erfolgreich) {
      setNutzer(authService.aktuellenNutzerAbrufen());
    }
    return erfolgreich;
  };

  const abmelden = () => {
    authService.abmelden();
    setNutzer(null);
  };

  const registrieren = async (nutzerdaten: Partial<Nutzer> & { email: string; passwort: string }) => {
    const neuerNutzer = await authService.registrieren(nutzerdaten);
    setNutzer(neuerNutzer);
  };

  return (
    <AuthContext.Provider value={{ nutzer, anmelden, abmelden, registrieren }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth muss innerhalb von AuthAnbieter verwendet werden');
  }
  return context;
}
