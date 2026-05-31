import { Nutzer } from '../types';
import { InteresseZeile, KategorieZeile, NutzerZeile } from './databaseTypes';
import { supabaseInsert, supabaseIstKonfiguriert, supabaseSelect, supabaseUpsert } from './supabaseClient';

const SPEICHER_SCHLUESSEL = 'timetogether_nutzer';

function nutzerAusZeile(zeile: NutzerZeile, interessen: string[] = []): Nutzer {
  return {
    nutzer_nr: String(zeile.nutzer_nr),
    name: zeile.name,
    vorname: zeile.vorname,
    alter: zeile.alter,
    avatar_farbe: zeile.avatar_farbe || 'blue',
    bio: zeile.bio || '',
    interessen,
    universitaet: zeile.universitaet || null,
    studiengang: zeile.studiengang || null,
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
      alter: 23,
      avatar_farbe: 'blue',
      bio: 'Informatik-Student | Liebt Kaffee, Klettern und gute Gespräche',
      interessen: ['Sport', 'Technologie', 'Reisen', 'Kaffee', 'Gaming'],
      universitaet: 'TU München',
      studiengang: 'Informatik',
    };
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(this.aktuellerNutzer));
    return true;
  }

  async registrieren(nutzerdaten: NutzerInput): Promise<Nutzer> {
    if (!nutzerdaten.email || !nutzerdaten.passwort) {
      throw new Error("Email und Passwort sind Pflichtfelder");
    }

    if (supabaseIstKonfiguriert) {
      try {
        const [neuerNutzer] = await supabaseInsert<NutzerZeile>('nutzer', {
          vorname: nutzerdaten.vorname,
          name: nutzerdaten.name,
          universitaet: nutzerdaten.universitaet ?? null,
          studiengang: nutzerdaten.studiengang ?? null,
          alter: nutzerdaten.alter ?? null,
          avatar_farbe: nutzerdaten.avatar_farbe ?? 'blue',
          bio: nutzerdaten.bio ?? '',
          email: nutzerdaten.email,
          passwort: nutzerdaten.passwort,
        });

        if (!neuerNutzer) {
          throw new Error("Insert fehlgeschlagen");
        }

        await this.interessenSpeichern(
          neuerNutzer.nutzer_nr,
          nutzerdaten.interessen ?? []
        );

        this.aktuellerNutzer = nutzerAusZeile(
          neuerNutzer,
          nutzerdaten.interessen ?? []
        );

        localStorage.setItem(
          SPEICHER_SCHLUESSEL,
          JSON.stringify(this.aktuellerNutzer)
        );

        return this.aktuellerNutzer;
      } catch (error) {
        console.error("Supabase Registrierung fehlgeschlagen:", error);
      }
    }

    // Fallback lokal
    const neuerNutzer: Nutzer = {
      nutzer_nr: String(Date.now()),
      name: nutzerdaten.name,
      vorname: nutzerdaten.vorname,
      alter: nutzerdaten.alter ?? 18,
      avatar_farbe: nutzerdaten.avatar_farbe ?? 'blue',
      bio: nutzerdaten.bio ?? '',
      interessen: nutzerdaten.interessen ?? [],
      universitaet: nutzerdaten.universitaet ?? null,
      studiengang: nutzerdaten.studiengang ?? null,
    };

    this.aktuellerNutzer = neuerNutzer;
    localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(neuerNutzer));
    return neuerNutzer;
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
