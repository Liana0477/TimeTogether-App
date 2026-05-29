
// MOCK DATA - Später durch Supabase ersetzen


import { Nutzer, Aktivitaet, Kategorie, Kommentar, Bewertung } from '../types';
import * as LucideIcons from 'lucide-react';

// Kategorien
export const KATEGORIEN: Kategorie[] = [
  { id: 'alle',    label: 'Alle',    icon: LucideIcons.Sparkles        },
  { id: 'sport',   label: 'Sport',   icon: LucideIcons.Trophy          },
  { id: 'kultur',  label: 'Kultur',  icon: LucideIcons.Theater         },
  { id: 'essen',   label: 'Essen',   icon: LucideIcons.UtensilsCrossed },
  { id: 'lernen',  label: 'Lernen',  icon: LucideIcons.BookOpen        },
  { id: 'outdoor', label: 'Outdoor', icon: LucideIcons.Trees           },
  { id: 'gaming',  label: 'Gaming',  icon: LucideIcons.Gamepad2        },
  { id: 'musik',   label: 'Musik',   icon: LucideIcons.Music           },
  { id: 'kunst',   label: 'Kunst',   icon: LucideIcons.Palette         }
];

// Test-Nutzer (Attribute = DB-Spaltennamen)
export const MOCK_NUTZER: Nutzer[] = [
  {
    nutzer_nr: '1',
    name: 'Mustermann',
    vorname: 'Max',
    geburtsdatum: 23,
    avatar_farbe: 'blue',
    bio: 'Informatik-Student | Liebt Kaffee, Klettern und gute Gespräche',
    interessen: ['Sport', 'Technologie', 'Reisen', 'Kaffee', 'Gaming'],
    universitaet: 'TU München',
    studiengang: 'Informatik'
  },
  {
    nutzer_nr: '2',
    name: 'Schmidt',
    vorname: 'Anna',
    geburtsdatum: 22,
    avatar_farbe: 'pink',
    bio: 'BWL-Studentin | Yoga-Fan | Immer offen für neue Cafés',
    interessen: ['Yoga', 'Lesen', 'Kaffee', 'Reisen'],
    universitaet: 'LMU München',
    studiengang: 'BWL'
  },
  {
    nutzer_nr: '3',
    name: 'Weber',
    vorname: 'Tom',
    geburtsdatum: 25,
    avatar_farbe: 'green',
    bio: 'Physik-Student | Boulder-Enthusiast | Brettspielnerd',
    interessen: ['Klettern', 'Brettspiele', 'Wissenschaft', 'Outdoor'],
    universitaet: 'TU München',
    studiengang: 'Physik'
  },
  {
    nutzer_nr: '4',
    name: 'Müller',
    vorname: 'Lisa',
    geburtsdatum: 21,
    avatar_farbe: 'purple',
    bio: 'Kunstgeschichte | Museumsliebhaberin | Foodie',
    interessen: ['Kunst', 'Musik', 'Essen', 'Kultur'],
    universitaet: 'LMU München',
    studiengang: 'Kunstgeschichte'
  },
  {
    nutzer_nr: '5',
    name: 'Klein',
    vorname: 'Jonas',
    geburtsdatum: 24,
    avatar_farbe: 'orange',
    bio: 'Medizinstudent | Läufer | Kochbegeistert',
    interessen: ['Sport', 'Kochen', 'Gesundheit', 'Natur'],
    universitaet: 'TU München',
    studiengang: 'Medizin'
  }
];

// ── Beispiel-Kommentare & -Bewertungen ──────────────────

const KOMMENTARE_KLETTERN: Kommentar[] = [
  { kommentare_nr: 'c1', nutzer_nr: '1', nutzer_name: 'Max Mustermann',  text: 'Bin dabei! Seit Jahren nicht mehr geklettert 😅', zeitstempel: '2026-04-28T10:15:00' },
  { kommentare_nr: 'c2', nutzer_nr: '5', nutzer_name: 'Jonas Klein',     text: 'Super Idee, ich bring meine eigenen Schuhe mit.', zeitstempel: '2026-04-29T08:42:00' }
];

const BEWERTUNGEN_KLETTERN: Bewertung[] = [
  { nutzer_nr: '1', bewertung: 5 },
  { nutzer_nr: '5', bewertung: 4 }
];

const KOMMENTARE_CAFE: Kommentar[] = [
  { kommentare_nr: 'c3', nutzer_nr: '2', nutzer_name: 'Anna Schmidt', text: 'Lost Weekend hat super Kaffee, gute Wahl!', zeitstempel: '2026-04-27T16:00:00' }
];

const BEWERTUNGEN_CAFE: Bewertung[] = [
  { nutzer_nr: '2', bewertung: 4 }
];

const KOMMENTARE_SPAZIERGANG: Kommentar[] = [
  { kommentare_nr: 'c4', nutzer_nr: '2', nutzer_name: 'Anna Schmidt', text: 'Freue mich schon sehr! Das Wetter soll gut werden.', zeitstempel: '2026-04-26T12:30:00' },
  { kommentare_nr: 'c5', nutzer_nr: '4', nutzer_name: 'Lisa Müller',  text: 'Ich bin zum ersten Mal im Englischen Garten dabei.', zeitstempel: '2026-04-27T09:10:00' },
  { kommentare_nr: 'c6', nutzer_nr: '3', nutzer_name: 'Tom Weber',    text: 'Biergarten danach klingt perfekt!',               zeitstempel: '2026-04-28T18:05:00' }
];

const BEWERTUNGEN_SPAZIERGANG: Bewertung[] = [
  { nutzer_nr: '2', bewertung: 5 },
  { nutzer_nr: '3', bewertung: 4 },
  { nutzer_nr: '4', bewertung: 5 }
];

// Initiale Aktivitäten (Attribute = DB-Spaltennamen)
export const INITIALE_AKTIVITAETEN: Aktivitaet[] = [
  {
    aktivitaeten_nr: '1',
    titel: 'Klettern im Boulderraum',
    beschreibung: 'Lust auf eine entspannte Boulder-Session? Alle Level willkommen!',
    kategorie: 'sport',
    datum: '2026-05-02',
    uhrzeit: '18:00',
    ort: 'Boulderwelt München Ost',
    max_anzahl: 6,
    aktuelle_teilnehmer: 3,
    teilnehmer: [MOCK_NUTZER[2], MOCK_NUTZER[0], MOCK_NUTZER[4]],
    ersteller_nr: '3',
    kommentare: KOMMENTARE_KLETTERN,
    bewertungen: BEWERTUNGEN_KLETTERN
  },
  {
    aktivitaeten_nr: '2',
    titel: 'Café & Lernen',
    beschreibung: 'Gemeinsam für die Klausuren lernen bei Kaffee und guter Atmosphäre',
    kategorie: 'lernen',
    datum: '2026-04-30',
    uhrzeit: '14:00',
    ort: 'Lost Weekend Café',
    max_anzahl: 4,
    aktuelle_teilnehmer: 2,
    teilnehmer: [MOCK_NUTZER[1], MOCK_NUTZER[0]],
    ersteller_nr: '2',
    kommentare: KOMMENTARE_CAFE,
    bewertungen: BEWERTUNGEN_CAFE
  },
  {
    aktivitaeten_nr: '3',
    titel: 'Englischer Garten Spaziergang',
    beschreibung: 'Frühlingsspaziergang mit anschließendem Biergarten-Besuch',
    kategorie: 'outdoor',
    datum: '2026-05-01',
    uhrzeit: '16:00',
    ort: 'Englischer Garten',
    max_anzahl: 8,
    aktuelle_teilnehmer: 5,
    teilnehmer: [MOCK_NUTZER[1], MOCK_NUTZER[2], MOCK_NUTZER[3], MOCK_NUTZER[4], MOCK_NUTZER[0]],
    ersteller_nr: '1',
    kommentare: KOMMENTARE_SPAZIERGANG,
    bewertungen: BEWERTUNGEN_SPAZIERGANG
  },
  {
    aktivitaeten_nr: '4',
    titel: 'Museum Brandhorst Besuch',
    beschreibung: 'Neue Ausstellung anschauen und danach über Kunst quatschen',
    kategorie: 'kultur',
    datum: '2026-05-03',
    uhrzeit: '11:00',
    ort: 'Museum Brandhorst',
    max_anzahl: 5,
    aktuelle_teilnehmer: 2,
    teilnehmer: [MOCK_NUTZER[3], MOCK_NUTZER[1]],
    ersteller_nr: '4',
    kommentare: [],
    bewertungen: []
  },
  {
    aktivitaeten_nr: '5',
    titel: 'Veganes Restaurant ausprobieren',
    beschreibung: 'Neues veganes Restaurant testen - wer ist dabei?',
    kategorie: 'essen',
    datum: '2026-05-04',
    uhrzeit: '19:00',
    ort: 'Max Pett',
    max_anzahl: 6,
    aktuelle_teilnehmer: 4,
    teilnehmer: [MOCK_NUTZER[1], MOCK_NUTZER[3], MOCK_NUTZER[4], MOCK_NUTZER[0]],
    ersteller_nr: '5',
    kommentare: [],
    bewertungen: []
  },
  {
    aktivitaeten_nr: '6',
    titel: 'Gaming Night: Mario Kart',
    beschreibung: 'Klassische Mario Kart Session mit Pizza und Getränken',
    kategorie: 'gaming',
    datum: '2026-05-05',
    uhrzeit: '20:00',
    ort: 'Bei Tom zu Hause',
    max_anzahl: 4,
    aktuelle_teilnehmer: 3,
    teilnehmer: [MOCK_NUTZER[2], MOCK_NUTZER[0], MOCK_NUTZER[4]],
    ersteller_nr: '3',
    kommentare: [],
    bewertungen: []
  }
];
