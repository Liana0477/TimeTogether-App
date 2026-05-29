const STANDARD_SUPABASE_URL = 'https://jhrveljlfowzjhfsdbrx.supabase.co';
const STANDARD_SUPABASE_ANON_KEY = 'sb_publishable_FZNvQQ_hkjtP5qlPin0GZA_WOW8s-on';

const SUPABASE_URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) || STANDARD_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || STANDARD_SUPABASE_ANON_KEY;

export const supabaseIstKonfiguriert = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

type SupabaseOptionen = {
  methode?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  prefer?: string;
};

async function supabaseAnfrage<T>(pfad: string, optionen: SupabaseOptionen = {}): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase ist nicht konfiguriert.');
  }

  const response = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${pfad}`, {
    method: optionen.methode || 'GET',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: optionen.prefer || 'return=representation',
    },
    body: optionen.body ? JSON.stringify(optionen.body) : undefined,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase-Fehler (${response.status}): ${details}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function eq(wert: string | number): string {
  return `eq.${encodeURIComponent(String(wert))}`;
}

export async function supabaseSelect<T>(tabelle: string, query = 'select=*'): Promise<T[]> {
  return supabaseAnfrage<T[]>(`${tabelle}?${query}`);
}

export async function supabaseInsert<T>(tabelle: string, body: unknown): Promise<T[]> {
  return supabaseAnfrage<T[]>(`${tabelle}?select=*`, {
    methode: 'POST',
    body,
  });
}

export async function supabaseUpsert<T>(
  tabelle: string,
  body: unknown,
  konfliktSpalten: string
): Promise<T[]> {
  return supabaseAnfrage<T[]>(`${tabelle}?on_conflict=${konfliktSpalten}&select=*`, {
    methode: 'POST',
    body,
    prefer: 'resolution=merge-duplicates,return=representation',
  });
}

export async function supabaseDelete(tabelle: string, filter: string): Promise<void> {
  await supabaseAnfrage<void>(`${tabelle}?${filter}`, {
    methode: 'DELETE',
    prefer: 'return=minimal',
  });
}
