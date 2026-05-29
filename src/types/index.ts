
// Tabelle: nutzer
export interface Nutzer {
  nutzer_nr: string;
  name: string;          // Nachname (DB: name)
  vorname?: string;      // DB: vorname (optional im Frontend)
  geburtsdatum: number;  // Als Alter gespeichert (DB: geburtsdatum)
  avatar_farbe: string;  // DB: avatar_farbe
  bio?: string;          // Freitext, nicht in DB – nur im Frontend
  interessen: string[];  // DB: interessen
  universitaet?: string; // DB: universitaet
  studiengang?: string;  // DB: studiengang
}

// Tabelle: kommentare
export interface Kommentar {
  kommentare_nr: string;  // DB: kommentare_nr (PK)
  nutzer_nr: string;       // DB: nutzer_nr (FK)
  nutzer_name: string;     // Anzeigename (aus nutzer-Tabelle abgeleitet)
  text: string;            // DB: text
  zeitstempel: string;     // DB: zeitstempel (ISO-String)
}

// Tabelle: bewertung
export interface Bewertung {
  nutzer_nr: string;  // DB: nutzer_nr (FK)
  bewertung: number;  // DB: bewertung (1–5)
}

// Tabelle: aktivitaeten
export interface Aktivitaet {
  aktivitaeten_nr: string;    // DB: aktivitaeten_nr (PK)
  titel: string;              // DB: titel
  beschreibung: string;       // DB: beschreibung
  kategorie: AktivitaetKategorie; // DB: kategorie
  datum: string;              // DB: datum (YYYY-MM-DD)
  uhrzeit: string;            // DB: uhrzeit (HH:MM)
  ort: string;                // DB: ort
  max_anzahl: number;         // DB: max_anzahl
  aktuelle_teilnehmer: number; // Berechnet aus teilnahme-Tabelle
  teilnehmer: Nutzer[];        // DB: teilnahme (Join mit nutzer)
  ersteller_nr: string;        // DB: ersteller_nr (FK → nutzer)
  kommentare: Kommentar[];     // DB: kommentare (1:N)
  bewertungen: Bewertung[];    // DB: bewertung (N:M)
}

export type AktivitaetKategorie =
  | 'sport'
  | 'kultur'
  | 'essen'
  | 'lernen'
  | 'outdoor'
  | 'gaming'
  | 'musik'
  | 'kunst';

export interface Kategorie {
  id: string;
  label: string;
  icon: any; // Lucide React Icon Component
}
