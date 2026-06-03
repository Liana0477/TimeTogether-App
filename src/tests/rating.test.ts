import { describe, expect, it } from 'vitest';
import { bewertungBereinigen } from './validators';

describe('Bewertungen', () => {
  it('lässt gültige Bewertungen zwischen 1 und 5 unverändert', () => {
    expect(bewertungBereinigen(1)).toBe(1);
    expect(bewertungBereinigen(3)).toBe(3);
    expect(bewertungBereinigen(5)).toBe(5);
  });

  it('begrenzt Bewertungen auf den erlaubten Bereich', () => {
    expect(bewertungBereinigen(0)).toBe(1);
    expect(bewertungBereinigen(6)).toBe(5);
  });
});