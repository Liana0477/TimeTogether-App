import { describe, expect, it } from 'vitest';
import { kannAktivitaetBeitreten } from './validators';

describe('Teilnahme an Aktivität', () => {
  it('erlaubt Beitritt, wenn Plätze frei sind und Nutzer noch nicht angemeldet ist', () => {
    expect(kannAktivitaetBeitreten({
      aktuelleTeilnehmer: 3,
      maxAnzahl: 10,
      bereitsAngemeldet: false,
    })).toBe(true);
  });

  it('verhindert Beitritt, wenn die Aktivität voll ist', () => {
    expect(kannAktivitaetBeitreten({
      aktuelleTeilnehmer: 10,
      maxAnzahl: 10,
      bereitsAngemeldet: false,
    })).toBe(false);
  });

  it('verhindert doppelten Beitritt desselben Nutzers', () => {
    expect(kannAktivitaetBeitreten({
      aktuelleTeilnehmer: 3,
      maxAnzahl: 10,
      bereitsAngemeldet: true,
    })).toBe(false);
  });
});