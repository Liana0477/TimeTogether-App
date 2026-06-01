import { describe, expect, it } from 'vitest';

type Nutzer = {
  nutzer_nr: string;
  name: string;
};

type Aktivitaet = {
  aktivitaeten_nr: string;
  titel: string;
  max_anzahl: number;
  teilnehmer: Nutzer[];
};

class AktivitaetTestService {
  private aktivitaeten: Aktivitaet[] = [];

  aktivitaetErstellen(titel: string, maxAnzahl: number, ersteller: Nutzer): Aktivitaet {
    const aktivitaet: Aktivitaet = {
      aktivitaeten_nr: String(this.aktivitaeten.length + 1),
      titel,
      max_anzahl: maxAnzahl,
      teilnehmer: [ersteller],
    };

    this.aktivitaeten = [aktivitaet, ...this.aktivitaeten];
    return aktivitaet;
  }

  beitreten(aktivitaetId: string, nutzer: Nutzer): void {
    this.aktivitaeten = this.aktivitaeten.map((aktivitaet) => {
      if (aktivitaet.aktivitaeten_nr !== aktivitaetId) return aktivitaet;
      if (aktivitaet.teilnehmer.some((teilnehmer) => teilnehmer.nutzer_nr === nutzer.nutzer_nr)) return aktivitaet;
      if (aktivitaet.teilnehmer.length >= aktivitaet.max_anzahl) return aktivitaet;

      return {
        ...aktivitaet,
        teilnehmer: [...aktivitaet.teilnehmer, nutzer],
      };
    });
  }

  aktivitaetNachId(id: string): Aktivitaet | undefined {
    return this.aktivitaeten.find((aktivitaet) => aktivitaet.aktivitaeten_nr === id);
  }
}

describe('Aktivitätsablauf', () => {
  it('erstellt eine Aktivität und erlaubt einem zweiten Nutzer den Beitritt', () => {
    const service = new AktivitaetTestService();
    const ersteller = { nutzer_nr: '1', name: 'Max' };
    const teilnehmer = { nutzer_nr: '2', name: 'Anna' };

    const aktivitaet = service.aktivitaetErstellen('Lerngruppe', 4, ersteller);
    service.beitreten(aktivitaet.aktivitaeten_nr, teilnehmer);

    const aktualisiert = service.aktivitaetNachId(aktivitaet.aktivitaeten_nr);

    expect(aktualisiert?.teilnehmer).toHaveLength(2);
    expect(aktualisiert?.teilnehmer.map((nutzer) => nutzer.nutzer_nr)).toContain('2');
  });
});