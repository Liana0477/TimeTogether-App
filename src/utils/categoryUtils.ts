
import { AktivitaetKategorie } from '../types';

export const getCategoryColor = (kategorie: AktivitaetKategorie): string => {
  const farben: Record<AktivitaetKategorie, string> = {
    sport:   '#10B981',
    kultur:  '#8B5CF6',
    essen:   '#F59E0B',
    lernen:  '#3B82F6',
    outdoor: '#059669',
    gaming:  '#EC4899',
    musik:   '#EF4444',
    kunst:   '#6366F1'
  };
  return farben[kategorie];
};
