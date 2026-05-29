import { Aktivitaet, AktivitaetKategorie, Kommentar, Bewertung, Nutzer } from '../types';
import { INITIALE_AKTIVITAETEN, MOCK_NUTZER } from '../data/mockData';
import {
  AktivitaetZeile,
  BewertungZeile,
  InteresseZeile,
  KategorieZeile,
  KommentarZeile,
  NutzerZeile,
  TeilnahmeZeile,
} from './databaseTypes';
import {
  eq,
  supabaseDelete,
  supabaseInsert,
  supabaseIstKonfiguriert,
  supabaseSelect,
  supabaseUpsert,
} from './supabaseClient';

type DatenSnapshot = {
  nutzer: NutzerZeile[];
  kategorien: KategorieZeile[];
  aktivitaeten: AktivitaetZeile[];
  teilnahmen: TeilnahmeZeile[];
  kommentare: KommentarZeile[];
  bewertungen: BewertungZeile[];
  interessen: InteresseZeile[];
};

const bekannteKategorien: AktivitaetKategorie[] = [
  'sport',
  'kultur',
  'essen',
  'lernen',
  'outdoor',
  'gaming',
  'musik',
  'kunst',
];

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

function kategorieNormalisieren(bezeichnung?: string): AktivitaetKategorie {
  const normalisiert = (bezeichnung || 'sport').toLowerCase() as AktivitaetKategorie;
  return bekannteKategorien.includes(normalisiert) ? normalisiert : 'sport';
}

function nutzerAbbilden(
  zeile: NutzerZeile,
  interessen: InteresseZeile[],
  kategorienNachId: Map<number, KategorieZeile>
): Nutzer {
  return {
    nutzer_nr: String(zeile.nutzer_nr),
    vorname: zeile.vorname,
    name: zeile.name,
    geburtsdatum: alterAusGeburtsdatum(zeile.geburtsdatum),
    avatar_farbe: zeile.avatar_farbe || 'blue',
    bio: zeile.bio || '',
    interessen: interessen
      .filter(interesse => interesse.nutzer_nr === zeile.nutzer_nr)
      .map(interesse => kategorienNachId.get(interesse.kategorie_nr)?.bezeichnung || '')
      .filter(Boolean),
    universitaet: zeile.universitaet || undefined,
    studiengang: zeile.studiengang || undefined,
  };
}

function snapshotAbbilden(snapshot: DatenSnapshot): { aktivitaeten: Aktivitaet[]; nutzer: Nutzer[] } {
  const kategorienNachId = new Map(snapshot.kategorien.map(kategorie => [kategorie.kategorie_nr, kategorie]));
  const nutzerListe = snapshot.nutzer.map(nutzer =>
    nutzerAbbilden(nutzer, snapshot.interessen, kategorienNachId)
  );
  const nutzerNachId = new Map(nutzerListe.map(nutzer => [nutzer.nutzer_nr, nutzer]));

  const aktivitaeten = snapshot.aktivitaeten
    .map((aktivitaet): Aktivitaet => {
      const teilnehmer = snapshot.teilnahmen
        .filter(teilnahme => teilnahme.aktivitaet_nr === aktivitaet.aktivitaet_nr && teilnahme.status !== 'abgesagt')
        .map(teilnahme => nutzerNachId.get(String(teilnahme.nutzer_nr)))
        .filter((nutzer): nutzer is Nutzer => Boolean(nutzer));

      const kommentare: Kommentar[] = snapshot.kommentare
        .filter(kommentar => kommentar.aktivitaet_nr === aktivitaet.aktivitaet_nr)
        .map(kommentar => {
          const autor = nutzerNachId.get(String(kommentar.nutzer_nr));
          return {
            kommentare_nr: String(kommentar.kommentar_nr),
            nutzer_nr: String(kommentar.nutzer_nr),
            nutzer_name: autor ? `${autor.vorname || ''} ${autor.name}`.trim() : 'Unbekannt',
            text: kommentar.text,
            zeitstempel: kommentar.zeitstempel || new Date().toISOString(),
          };
        });

      const bewertungen: Bewertung[] = snapshot.bewertungen
        .filter(bewertung => bewertung.aktivitaet_nr === aktivitaet.aktivitaet_nr)
        .map(bewertung => ({
          nutzer_nr: String(bewertung.nutzer_nr),
          bewertung: bewertung.bewertung,
        }));

      const kategorie = kategorieNormalisieren(
        aktivitaet.kategorie_nr ? kategorienNachId.get(aktivitaet.kategorie_nr)?.bezeichnung : undefined
      );

      return {
        aktivitaeten_nr: String(aktivitaet.aktivitaet_nr),
        titel: aktivitaet.titel,
        beschreibung: aktivitaet.beschreibung || '',
        kategorie,
        datum: aktivitaet.datum,
        uhrzeit: aktivitaet.uhrzeit?.slice(0, 5) || '',
        ort: aktivitaet.ort,
        max_anzahl: aktivitaet.max_anzahl || teilnehmer.length || 1,
        aktuelle_teilnehmer: teilnehmer.length,
        teilnehmer,
        ersteller_nr: String(aktivitaet.ersteller_nr),
        kommentare,
        bewertungen,
      };
    })
    .sort((a, b) => `${a.datum} ${a.uhrzeit}`.localeCompare(`${b.datum} ${b.uhrzeit}`));

  return { aktivitaeten, nutzer: nutzerListe };
}

async function snapshotLaden(): Promise<DatenSnapshot> {
  const [nutzer, kategorien, aktivitaeten, teilnahmen, kommentare, bewertungen, interessen] =
    await Promise.all([
      supabaseSelect<NutzerZeile>('nutzer', 'select=*'),
      supabaseSelect<KategorieZeile>('kategorie', 'select=*'),
      supabaseSelect<AktivitaetZeile>('aktivitaet', 'select=*'),
      supabaseSelect<TeilnahmeZeile>('teilnahme', 'select=*'),
      supabaseSelect<KommentarZeile>('kommentar', 'select=*'),
      supabaseSelect<BewertungZeile>('bewertung', 'select=*'),
      supabaseSelect<InteresseZeile>('interesse', 'select=*'),
    ]);

  return { nutzer, kategorien, aktivitaeten, teilnahmen, kommentare, bewertungen, interessen };
}

class AktivitaetService {
  private aktivitaeten: Aktivitaet[] = [...INITIALE_AKTIVITAETEN];
  private nutzer: Nutzer[] = [...MOCK_NUTZER];

  alleAktivitaetenAbrufen(): Aktivitaet[] {
    return this.aktivitaeten;
  }

  async initialisieren(): Promise<void> {
    if (!supabaseIstKonfiguriert) return;

    try {
      const gemappt = snapshotAbbilden(await snapshotLaden());
      this.aktivitaeten = gemappt.aktivitaeten;
      this.nutzer = gemappt.nutzer;
    } catch (error) {
      console.warn('Supabase konnte nicht geladen werden. Mockdaten bleiben aktiv.', error);
    }
  }

  aktivitaetNachIdAbrufen(id: string): Aktivitaet | undefined {
    return this.aktivitaeten.find(a => a.aktivitaeten_nr === id);
  }

  nutzerNachIdAbrufen(id: string): Nutzer | undefined {
    return this.nutzer.find(n => n.nutzer_nr === id) || MOCK_NUTZER.find(n => n.nutzer_nr === id);
  }

  async kategorieNrAbrufen(kategorie: AktivitaetKategorie): Promise<number | null> {
    if (!supabaseIstKonfiguriert) return null;
    const treffer = await supabaseSelect<KategorieZeile>('kategorie', `select=*&bezeichnung=${eq(kategorie)}`);
    return treffer[0]?.kategorie_nr ?? null;
  }

  async aktivitaetErstellen(
    aktivitaet: Omit<Aktivitaet, 'aktivitaeten_nr' | 'aktuelle_teilnehmer' | 'teilnehmer' | 'kommentare' | 'bewertungen'>,
    ersteller: Nutzer
  ): Promise<Aktivitaet> {
    if (supabaseIstKonfiguriert) {
      try {
        const kategorieNr = await this.kategorieNrAbrufen(aktivitaet.kategorie);
        const [neueAktivitaet] = await supabaseInsert<AktivitaetZeile>('aktivitaet', {
          titel: aktivitaet.titel,
          beschreibung: aktivitaet.beschreibung,
          kategorie_nr: kategorieNr,
          datum: aktivitaet.datum,
          uhrzeit: aktivitaet.uhrzeit,
          ort: aktivitaet.ort,
          max_anzahl: aktivitaet.max_anzahl,
          ersteller_nr: Number(ersteller.nutzer_nr),
        });

        await supabaseUpsert<TeilnahmeZeile>('teilnahme', {
          nutzer_nr: Number(ersteller.nutzer_nr),
          aktivitaet_nr: neueAktivitaet.aktivitaet_nr,
          status: 'angemeldet',
        }, 'nutzer_nr,aktivitaet_nr');
        await this.initialisieren();
        return this.aktivitaetNachIdAbrufen(String(neueAktivitaet.aktivitaet_nr)) as Aktivitaet;
      } catch (error) {
        console.warn('Aktivität wurde lokal erstellt, weil Supabase nicht erreichbar war.', error);
      }
    }

    const neueAktivitaet: Aktivitaet = {
      ...aktivitaet,
      aktivitaeten_nr: String(Date.now()),
      aktuelle_teilnehmer: 1,
      teilnehmer: [ersteller],
      kommentare: [],
      bewertungen: [],
    };

    this.aktivitaeten = [neueAktivitaet, ...this.aktivitaeten];
    return neueAktivitaet;
  }

  async aktivitaetBeitreten(aktivitaetId: string, nutzer: Nutzer): Promise<void> {
    if (supabaseIstKonfiguriert) {
      try {
        await supabaseUpsert<TeilnahmeZeile>('teilnahme', {
          nutzer_nr: Number(nutzer.nutzer_nr),
          aktivitaet_nr: Number(aktivitaetId),
          status: 'angemeldet',
        }, 'nutzer_nr,aktivitaet_nr');
        await this.initialisieren();
        return;
      } catch (error) {
        console.warn('Beitritt wurde lokal durchgeführt, weil Supabase nicht erreichbar war.', error);
      }
    }

    this.aktivitaeten = this.aktivitaeten.map(aktivitaet => {
      if (aktivitaet.aktivitaeten_nr === aktivitaetId) {
        const bereitsAngemeldet = aktivitaet.teilnehmer.some(t => t.nutzer_nr === nutzer.nutzer_nr);
        if (!bereitsAngemeldet && aktivitaet.aktuelle_teilnehmer < aktivitaet.max_anzahl) {
          return {
            ...aktivitaet,
            aktuelle_teilnehmer: aktivitaet.aktuelle_teilnehmer + 1,
            teilnehmer: [...aktivitaet.teilnehmer, nutzer],
          };
        }
      }
      return aktivitaet;
    });
  }

  async aktivitaetVerlassen(aktivitaetId: string, nutzerNr: string): Promise<void> {
    if (supabaseIstKonfiguriert) {
      try {
        await supabaseDelete('teilnahme', `nutzer_nr=${eq(nutzerNr)}&aktivitaet_nr=${eq(aktivitaetId)}`);
        await this.initialisieren();
        return;
      } catch (error) {
        console.warn('Austritt wurde lokal durchgeführt, weil Supabase nicht erreichbar war.', error);
      }
    }

    this.aktivitaeten = this.aktivitaeten.map(aktivitaet => {
      if (aktivitaet.aktivitaeten_nr === aktivitaetId) {
        const istTeilnehmer = aktivitaet.teilnehmer.some(t => t.nutzer_nr === nutzerNr);
        if (istTeilnehmer) {
          return {
            ...aktivitaet,
            aktuelle_teilnehmer: Math.max(1, aktivitaet.aktuelle_teilnehmer - 1),
            teilnehmer: aktivitaet.teilnehmer.filter(t => t.nutzer_nr !== nutzerNr),
          };
        }
      }
      return aktivitaet;
    });
  }

  async kommentarHinzufuegen(aktivitaetId: string, nutzerNr: string, nutzerName: string, text: string): Promise<void> {
    if (supabaseIstKonfiguriert) {
      try {
        await supabaseInsert<KommentarZeile>('kommentar', {
          text: text.trim(),
          nutzer_nr: Number(nutzerNr),
          aktivitaet_nr: Number(aktivitaetId),
        });
        await this.initialisieren();
        return;
      } catch (error) {
        console.warn('Kommentar wurde lokal gespeichert, weil Supabase nicht erreichbar war.', error);
      }
    }

    const neuerKommentar: Kommentar = {
      kommentare_nr: String(Date.now()),
      nutzer_nr: nutzerNr,
      nutzer_name: nutzerName,
      text: text.trim(),
      zeitstempel: new Date().toISOString(),
    };

    this.aktivitaeten = this.aktivitaeten.map(aktivitaet =>
      aktivitaet.aktivitaeten_nr === aktivitaetId
        ? { ...aktivitaet, kommentare: [...aktivitaet.kommentare, neuerKommentar] }
        : aktivitaet
    );
  }

  async bewertungAbgebenOderAktualisieren(
    aktivitaetId: string,
    nutzerNr: string,
    bewertungWert: number
  ): Promise<void> {
    const bereinigterWert = Math.min(5, Math.max(1, bewertungWert));

    if (supabaseIstKonfiguriert) {
      try {
        await supabaseUpsert<BewertungZeile>('bewertung', {
          nutzer_nr: Number(nutzerNr),
          aktivitaet_nr: Number(aktivitaetId),
          bewertung: bereinigterWert,
        }, 'nutzer_nr,aktivitaet_nr');
        await this.initialisieren();
        return;
      } catch (error) {
        console.warn('Bewertung wurde lokal gespeichert, weil Supabase nicht erreichbar war.', error);
      }
    }

    this.aktivitaeten = this.aktivitaeten.map(aktivitaet => {
      if (aktivitaet.aktivitaeten_nr === aktivitaetId) {
        const aktualisterteBewertungen: Bewertung[] = [
          ...aktivitaet.bewertungen.filter(b => b.nutzer_nr !== nutzerNr),
          { nutzer_nr: nutzerNr, bewertung: bereinigterWert },
        ];
        return { ...aktivitaet, bewertungen: aktualisterteBewertungen };
      }
      return aktivitaet;
    });
  }

  async kommentarLoeschen(aktivitaetId: string, kommentareNr: string, nutzerNr: string): Promise<void> {
    if (supabaseIstKonfiguriert && !Number.isNaN(Number(kommentareNr))) {
      try {
        await supabaseDelete('kommentar', `kommentar_nr=${eq(kommentareNr)}&nutzer_nr=${eq(nutzerNr)}`);
        await this.initialisieren();
        return;
      } catch (error) {
        console.warn('Kommentar wurde lokal gelöscht, weil Supabase nicht erreichbar war.', error);
      }
    }

    this.aktivitaeten = this.aktivitaeten.map(aktivitaet =>
      aktivitaet.aktivitaeten_nr === aktivitaetId
        ? {
            ...aktivitaet,
            kommentare: aktivitaet.kommentare.filter(
              k => !(k.kommentare_nr === kommentareNr && k.nutzer_nr === nutzerNr)
            ),
          }
        : aktivitaet
    );
  }

  aktivitaetenFiltern(
    suchbegriff: string = '',
    kategorie: string = 'alle',
    nurZukuenftige: boolean = true
  ): Aktivitaet[] {
    return this.aktivitaeten.filter(aktivitaet => {
      const trefferSuche =
        aktivitaet.titel.toLowerCase().includes(suchbegriff.toLowerCase()) ||
        aktivitaet.beschreibung.toLowerCase().includes(suchbegriff.toLowerCase());

      const trefferKategorie = kategorie === 'alle' || aktivitaet.kategorie === kategorie;
      const trefferDatum = !nurZukuenftige || new Date(aktivitaet.datum) >= new Date();

      return trefferSuche && trefferKategorie && trefferDatum;
    }).sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime());
  }
}

export const aktivitaetService = new AktivitaetService();
