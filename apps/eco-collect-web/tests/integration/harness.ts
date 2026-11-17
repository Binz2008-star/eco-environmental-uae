import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const ADMIN_EMAIL = 'admin@eco.test';
export type TestUser = { userId: string; displayName: string; email: string; fullName: string | null };

export const state: { user: TestUser | null; pg: PGlite | null } = { user: null, pg: null };

export function asUser(id: string, email = `${id}@eco.test`): TestUser {
  const u = { userId: id, displayName: id, email, fullName: id };
  state.user = u;
  return u;
}
export function anonymous(): void { state.user = null; }

/** Real PostgreSQL (WASM) with the production migration applied into schema eco_collect. */
export async function freshDb(): Promise<PGlite> {
  const pg = new PGlite();
  await pg.exec('CREATE SCHEMA eco_collect');
  const migration = readFileSync(fileURLToPath(new URL('../../migrations/001_eco_collect.sql', import.meta.url)), 'utf8');
  await pg.exec(migration);
  state.pg = pg;
  return pg;
}

/** Tagged-template adapter with the same call shape as @neondatabase/serverless neon(). */
export function neonLike() {
  return async (strings: TemplateStringsArray, ...values: unknown[]) => {
    if (!state.pg) throw new Error('db not initialised');
    const text = strings.reduce((acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ''), '');
    const res = await state.pg.query(text, values as never[]);
    return res.rows as Record<string, any>[];
  };
}

export function req(path: string, method: 'GET' | 'POST', data?: unknown, origin = 'https://eco.test'): Request {
  return new Request(`https://eco.test${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(method === 'POST' ? { origin } : {}) },
    body: data === undefined ? undefined : typeof data === 'string' ? data : JSON.stringify(data),
  });
}
export async function read(res: Response): Promise<{ status: number; body: any }> {
  return { status: res.status, body: await res.json() };
}
