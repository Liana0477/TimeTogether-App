import { Nutzer } from '../types';
import { InteresseZeile, KategorieZeile, NutzerZeile } from './databaseTypes';
import { supabaseInsert, supabaseIstKonfiguriert, supabaseSelect, supabaseUpsert } from './supabaseClient';

const SPEICHER_SCHLUESSEL = 'timetogether_nutzer';

function geburtsdatumAusAlter(alter: number): string {
  const datum = new Date();
  datum.setFullYear(datum.getFullYear() - alter);
  return datum.toISOString().slice(0, 10);
}

function alterAusGeburtsdatum(geburtsdatum: string | null): number {
  if (!geburtsdatum) return 18;
  const geboren = new Date(geburtsdatum);
  const heute = new Date();
  let alter = heute.getFullYear() - geboren.getFullYear();
  const hatteGeburtstag =
    heute.getMonth() > geboren.getMonth() ||
    (heute.getMonth() === geboren.getMonth() && heute.getDate() >= geboren.getDate());
  if (!hatteGeburtstag) alter -= 1;
  return Number.isFinite(alter) ? alter : 18;
}

function nutzerAusZeile(zeile: NutzerZeile, interessen: string[] = []): Nutzer {
  return {
    nutzer_nr: String(zeile.nutzer_nr),
    name: zeile.name,
    vorname: zeile.vorname,
    geburtsdatum: alterAusGeburtsdatum(zeile.geburtsdatum),
    avatar_farbe: zeile.avatar_farbe || 'blue',
    bio: zeile.bio || '',
    interessen,
    universitaet: zeile.universitaet || undefined,
    studiengang: zeile.studiengang || undefined,
  };
}

class AuthService {
  private aktuellerNutzer: Nutzer | null = null;

  constructor() {
    const gespeichert = localStorage.getItem(SPEICHER_SCHLUESSEL);
    if (gespeichert) {
      try {
        this.aktuellerNutzer = JSON.parse(gespeichert);
      } catch {
        this.aktuellerNutzer = null;
        localStorage.removeItem(SPEICHER_SCHLUESSEL);
      }
    }
  }

  async anmelden(email: string, passwort: string): Promise<boolean> {
    if (!email || !passwort) return false;

    if (supabaseIstKonfiguriert) {
      try {
        const nutzer = await supabaseSelect<NutzerZeile>('nutzer', 'select=*&limit=1');
        if (nutzer[0]) {
          this.aktuellerNutzer = nutzerAusZeile(nutzer[0]);
          localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(this.aktuellerNutzer));
          return true;
        }
      } catch (error) {
        console.warn('Supabase-Login nicht verfügbar. Demo-Login wird verwendet.', error);
      }
    }

    this.aktuellerNutzer = {
      nutzer_nr: '1',
      name: 'Mustermann',
      vorname: 'Max',
      geburtsdatum: 23,
      avatar_farbe: 'blue',
      bio: 'Informatik-Student | Liebt Kaffee, Klettern und gute Gespräche',
      interessen: ['Sport', 'Technologie', 'Reisen', 'Kaffee', 'Gaming'],
      universitaet: 'TU München',
      studiengang: 'Informatik',
    };
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(this.aktuellerNutzer));
    return true;
  }

  async registrieren(nutzerdaten: Partial<Nutzer> & { email: string; passwort: string }): Promise<Nutzer> {

    if (supabaseIstKonfiguriert) {
      try {
        const [neuerNutzer] = await supabaseInsert<NutzerZeile>('nutzer', {
          vorname: nutzerdaten.vorname,
          name: nutzerdaten.name,
          universitaet: nutzerdaten.universitaet || null,
          studiengang: nutzerdaten.studiengang || null,
          geburtsdatum: geburtsdatumAusAlter(nutzerdaten.geburtsdatum || 18),
          avatar_farbe: nutzerdaten.avatar_farbe || 'blue',
          bio: nutzerdaten.bio || '',
        });

        await this.interessenSpeichern(neuerNutzer.nutzer_nr, nutzerdaten.interessen || []);
        this.aktuellerNutzer = nutzerAusZeile(neuerNutzer, nutzerdaten.interessen || []);
        localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(this.aktuellerNutzer));
        return this.aktuellerNutzer;
      } catch (error) {
        console.warn('Registrierung wurde lokal durchgeführt, weil Supabase nicht erreichbar war.', error);
      }
    }

    const neuerNutzer: Nutzer = {
      nutzer_nr: String(Date.now()),
      name: name.name,
      vorname: nutzerdaten.vorname || name.vorname,
      geburtsdatum: nutzerdaten.geburtsdatum || 18,
      avatar_farbe: nutzerdaten.avatar_farbe || 'blue',
      bio: nutzerdaten.bio || '',
      interessen: nutzerdaten.interessen || [],
      universitaet: nutzerdaten.universitaet,
      studiengang: nutzerdaten.studiengang,
    };

    this.aktuellerNutzer = neuerNutzer;
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(neuerNutzer));
    return neuerNutzer;
  }

  private async interessenSpeichern(nutzerNr: number, interessen: string[]): Promise<void> {
    if (interessen.length === 0) return;

    const kategorien = await supabaseSelect<KategorieZeile>('kategorie', 'select=*');
    const kategorienNachName = new Map(kategorien.map(kategorie => [
      kategorie.bezeichnung.toLowerCase(),
      kategorie.kategorie_nr,
    ]));

    await Promise.all(interessen.map(async interesse => {
      const kategorieNr = kategorienNachName.get(interesse.toLowerCase());
      if (!kategorieNr) return;

      await supabaseUpsert<InteresseZeile>('interesse', {
        nutzer_nr: nutzerNr,
        kategorie_nr: kategorieNr,
      }, 'nutzer_nr,kategorie_nr');
    }));
  }

  abmelden(): void {
    this.aktuellerNutzer = null;
    localStorage.removeItem(SPEICHER_SCHLUESSEL);
  }

  aktuellenNutzerAbrufen(): Nutzer | null {
    return this.aktuellerNutzer;
  }

  istAngemeldet(): boolean {
    return this.aktuellerNutzer !== null;
  }
}

export const authService = new AuthService();
