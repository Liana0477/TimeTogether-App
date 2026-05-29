export type NutzerZeile = {
  nutzer_nr: number;
  vorname: string;
  name: string;
  universitaet: string | null;
  studiengang: string | null;
  geburtsdatum: string | null;
  avatar_farbe: string | null;
  bio: string | null;
};

export type KategorieZeile = {
  kategorie_nr: number;
  bezeichnung: string;
};

export type AktivitaetZeile = {
  aktivitaet_nr: number;
  titel: string;
  beschreibung: string | null;
  kategorie_nr: number | null;
  datum: string;
  uhrzeit: string;
  ort: string;
  max_anzahl: number | null;
  ersteller_nr: number;
};

export type TeilnahmeZeile = {
  nutzer_nr: number;
  aktivitaet_nr: number;
  anmeldedatum: string | null;
  status: 'angemeldet' | 'abgesagt' | 'teilgenommen';
};

export type KommentarZeile = {
  kommentar_nr: number;
  text: string;
  zeitstempel: string | null;
  nutzer_nr: number;
  aktivitaet_nr: number;
};

export type BewertungZeile = {
  nutzer_nr: number;
  aktivitaet_nr: number;
  bewertung: number;
};

export type InteresseZeile = {
  nutzer_nr: number;
  kategorie_nr: number;
};
