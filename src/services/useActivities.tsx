
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Aktivitaet, Nutzer } from '../types';
import { aktivitaetService } from './activityService';

interface AktivitaetenContextTyp {
  aktivitaeten: Aktivitaet[];
  aktivitaetNachIdAbrufen: (id: string) => Aktivitaet | undefined;
  nutzerNachIdAbrufen: (id: string) => Nutzer | undefined;
  aktivitaetErstellen: (
    aktivitaet: Omit<Aktivitaet, 'aktivitaeten_nr' | 'aktuelle_teilnehmer' | 'teilnehmer' | 'kommentare' | 'bewertungen'>,
    ersteller: Nutzer
  ) => Promise<void>;
  aktivitaetBeitreten:  (aktivitaetId: string, nutzer: Nutzer)       => Promise<void>;
  aktivitaetVerlassen:  (aktivitaetId: string, nutzerNr: string)      => Promise<void>;
  // Kommentar-Funktionen
  kommentarHinzufuegen:  (aktivitaetId: string, nutzerNr: string, nutzerName: string, text: string) => Promise<void>;
  kommentarLoeschen:     (aktivitaetId: string, kommentareNr: string, nutzerNr: string)              => Promise<void>;
  // Bewertungs-Funktion
  bewertungAbgebenOderAktualisieren: (aktivitaetId: string, nutzerNr: string, bewertung: number) => Promise<void>;
}

const AktivitaetenContext = createContext<AktivitaetenContextTyp | undefined>(undefined);

export function AktivitaetenAnbieter({ children }: { children: ReactNode }) {
  const [aktivitaeten, setAktivitaeten] = useState<Aktivitaet[]>(aktivitaetService.alleAktivitaetenAbrufen());

  useEffect(() => {
    let aktiv = true;

    aktivitaetService.initialisieren().then(() => {
      if (aktiv) aktualisieren();
    });

    return () => {
      aktiv = false;
    };
  }, []);

  // State nach jeder Änderung aus dem Service neu laden
  const aktualisieren = () => {
    setAktivitaeten([...aktivitaetService.alleAktivitaetenAbrufen()]);
  };

  const aktivitaetErstellen = async (
    aktivitaet: Omit<Aktivitaet, 'aktivitaeten_nr' | 'aktuelle_teilnehmer' | 'teilnehmer' | 'kommentare' | 'bewertungen'>,
    ersteller: Nutzer
  ) => {
    await aktivitaetService.aktivitaetErstellen(aktivitaet, ersteller);
    aktualisieren();
  };

  const aktivitaetBeitreten = async (aktivitaetId: string, nutzer: Nutzer) => {
    await aktivitaetService.aktivitaetBeitreten(aktivitaetId, nutzer);
    aktualisieren();
  };

  const aktivitaetVerlassen = async (aktivitaetId: string, nutzerNr: string) => {
    await aktivitaetService.aktivitaetVerlassen(aktivitaetId, nutzerNr);
    aktualisieren();
  };

  // Kommentar hinzufügen
  const kommentarHinzufuegen = async (aktivitaetId: string, nutzerNr: string, nutzerName: string, text: string) => {
    await aktivitaetService.kommentarHinzufuegen(aktivitaetId, nutzerNr, nutzerName, text);
    aktualisieren();
  };

  // Kommentar löschen
  const kommentarLoeschen = async (aktivitaetId: string, kommentareNr: string, nutzerNr: string) => {
    await aktivitaetService.kommentarLoeschen(aktivitaetId, kommentareNr, nutzerNr);
    aktualisieren();
  };

  // Bewertung abgeben oder aktualisieren
  const bewertungAbgebenOderAktualisieren = async (aktivitaetId: string, nutzerNr: string, bewertung: number) => {
    await aktivitaetService.bewertungAbgebenOderAktualisieren(aktivitaetId, nutzerNr, bewertung);
    aktualisieren();
  };

  return (
    <AktivitaetenContext.Provider
      value={{
        aktivitaeten,
        aktivitaetNachIdAbrufen: (id) => aktivitaeten.find(a => a.aktivitaeten_nr === id),
        nutzerNachIdAbrufen:     aktivitaetService.nutzerNachIdAbrufen.bind(aktivitaetService),
        aktivitaetErstellen,
        aktivitaetBeitreten,
        aktivitaetVerlassen,
        kommentarHinzufuegen,
        kommentarLoeschen,
        bewertungAbgebenOderAktualisieren,
      }}
    >
      {children}
    </AktivitaetenContext.Provider>
  );
}

export function useAktivitaeten() {
  const context = useContext(AktivitaetenContext);
  if (context === undefined) {
    throw new Error('useAktivitaeten muss innerhalb von AktivitaetenAnbieter verwendet werden');
  }
  return context;
}
