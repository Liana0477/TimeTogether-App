export type AktivitaetFormular = {
  titel: string;
  beschreibung: string;
  datum: string;
  uhrzeit: string;
  ort: string;
  maxAnzahl: string;
};

export function kommentarIstGueltig(text: string): boolean {
  const bereinigt = text.trim();
  return bereinigt.length >= 3 && bereinigt.length <= 300;
}

export function bewertungBereinigen(wert: number): number {
  return Math.min(5, Math.max(1, wert));
}

export function aktivitaetFormularIstGueltig(formular: AktivitaetFormular): boolean {
  const titel = formular.titel.trim();
  const beschreibung = formular.beschreibung.trim();
  const ort = formular.ort.trim();
  const maxAnzahl = Number.parseInt(formular.maxAnzahl, 10);

  if (titel.length < 3 || titel.length > 60) return false;
  if (beschreibung.length < 10) return false;
  if (!ort || ort.length < 3) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(formular.datum)) return false;
  if (!/^\d{2}:\d{2}$/.test(formular.uhrzeit)) return false;
  if (Number.isNaN(maxAnzahl) || maxAnzahl < 2 || maxAnzahl > 50) return false;

  return true;
}

export type TeilnahmeStatus = {
  aktuelleTeilnehmer: number;
  maxAnzahl: number;
  bereitsAngemeldet: boolean;
};

export function kannAktivitaetBeitreten(status: TeilnahmeStatus): boolean {
  if (status.bereitsAngemeldet) return false;
  return status.aktuelleTeilnehmer < status.maxAnzahl;
}