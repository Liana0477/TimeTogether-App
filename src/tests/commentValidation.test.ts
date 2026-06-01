import { describe, expect, it } from 'vitest';
import { kommentarIstGueltig } from './validators';

describe('Kommentarvalidierung', () => {
  it('lehnt leere und zu kurze Kommentare ab', () => {
    expect(kommentarIstGueltig('')).toBe(false);
    expect(kommentarIstGueltig('  ')).toBe(false);
    expect(kommentarIstGueltig('Hi')).toBe(false);
  });

  it('akzeptiert gültige Kommentare', () => {
    expect(kommentarIstGueltig('Bin dabei!')).toBe(true);
    expect(kommentarIstGueltig('Ich freue mich auf die Aktivität.')).toBe(true);
  });

  it('lehnt Kommentare über 300 Zeichen ab', () => {
    expect(kommentarIstGueltig('a'.repeat(301))).toBe(false);
  });
});