import { describe, expect, it } from 'vitest';
import { aktivitaetFormularIstGueltig } from './validators';

describe('Aktivitätsformular validieren', () => {
  it('akzeptiert eine gültige Aktivität', () => {
    expect(aktivitaetFormularIstGueltig({
      titel: 'Fußball im Park',
      beschreibung: 'Gemeinsames Fußballspiel im Stadtpark.',
      datum: '2026-06-20',
      uhrzeit: '15:00',
      ort: 'Stadtpark Frankfurt',
      maxAnzahl: '10',
    })).toBe(true);
  });

  it('lehnt ungültige Pflichtfelder ab', () => {
    expect(aktivitaetFormularIstGueltig({
      titel: '',
      beschreibung: 'Zu kurz',
      datum: '20.06.2026',
      uhrzeit: '1500',
      ort: '',
      maxAnzahl: '1',
    })).toBe(false);
  });
});