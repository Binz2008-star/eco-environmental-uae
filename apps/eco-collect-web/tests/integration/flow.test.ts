import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ADMIN_EMAIL, anonymous, asUser, freshDb, neonLike, read, req, state } from './harness';

vi.mock('cloudflare:workers', () => ({ env: { DATABASE_URL: 'postgres://test', ADMIN_EMAILS: 'admin@eco.test' } }));
vi.mock('@neondatabase/serverless', () => ({ neon: () => neonLike() }));
vi.mock('@/app/chatgpt-auth', () => ({ getChatGPTUser: async () => state.user }));

const account = await import('@/app/api/account/route');
const requests = await import('@/app/api/requests/route');
const admin = await import('@/app/api/admin/route');

const future = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
const order = (over: Record<string, unknown> = {}) => ({
  location: 'Dubai Hills، فيلا 12', kind: 'خشب', quantity: '3 أمتار مكعبة', pickup_date: future(5), notes: '', consent: true, ...over,
});
const profile = { name: 'عميل تجريبي', phone: '0501234567', company: '', consent: true };
const dubaiSlot = (hoursAhead: number) => {
  const d = new Date(Date.now() + hoursAhead * 3_600_000 + 4 * 3_600_000);
  return d.toISOString().slice(0, 16) + ':00+04:00';
};

async function registered(id: string) {
  asUser(id);
  expect((await read(await account.POST(req('/api/account', 'POST', profile)))).status).toBe(200);
}
async function createOrder(id: string, over: Record<string, unknown> = {}): Promise<string> {
  asUser(id);
  const r = await read(await requests.POST(req('/api/requests', 'POST', order(over))));
  expect(r.status).toBe(201);
  return r.body.id as string;
}
const adminCall = async (data: unknown) => { asUser('admin', ADMIN_EMAIL); return read(await admin.POST(req('/api/admin', 'POST', data))); };
const status = async (id: string) => (await state.pg!.query<{ status: string }>('SELECT status FROM eco_collect.requests WHERE id=$1', [id])).rows[0].status;

beforeEach(async () => { await freshDb(); anonymous(); });

describe('authentication and origin', () => {
  it('rejects anonymous reads and writes', async () => {
    expect((await read(await requests.GET(req('/api/requests', 'GET')))).status).toBe(401);
    expect((await read(await account.POST(req('/api/account', 'POST', profile)))).status).toBe(401);
  });
  it('rejects cross-origin writes', async () => {
    asUser('u1');
    expect((await read(await account.POST(req('/api/account', 'POST', profile, 'https://evil.test')))).status).toBe(403);
  });
});

describe('customer cycle', () => {
  it('blocks ordering before the profile exists', async () => {
    asUser('u1');
    expect((await read(await requests.POST(req('/api/requests', 'POST', order())))).status).toBe(400);
  });
  it('validates the profile', async () => {
    asUser('u1');
    for (const bad of [{ ...profile, phone: '123' }, { ...profile, consent: false }, { ...profile, name: 'x' }]) {
      expect((await read(await account.POST(req('/api/account', 'POST', bad)))).status).toBe(400);
    }
  });
  it('validates the order', async () => {
    await registered('u1');
    for (const bad of [order({ kind: 'مواد كيميائية' }), order({ pickup_date: '2000-01-01' }), order({ consent: false }), order({ location: 'abc' })]) {
      expect((await read(await requests.POST(req('/api/requests', 'POST', bad)))).status).toBe(400);
    }
  });
  it('isolates users: no cross-tenant read, accept or cancel', async () => {
    await registered('a'); await registered('b');
    const id = await createOrder('a');
    asUser('b');
    expect((await read(await requests.GET(req('/api/requests', 'GET')))).body.requests).toHaveLength(0);
    expect((await read(await requests.POST(req('/api/requests', 'POST', { id, action: 'cancel' })))).status).toBe(409);
    expect(await status(id)).toBe('new');
  });
  it('limits to 10 orders per day', async () => {
    await registered('u1');
    for (let i = 0; i < 10; i++) await createOrder('u1', { quantity: `${i + 2} أكياس` });
    expect((await read(await requests.POST(req('/api/requests', 'POST', order())))).status).toBe(429);
  });
  it('rate limits writes per minute', async () => {
    asUser('u1');
    const codes: number[] = [];
    for (let i = 0; i < 22; i++) codes.push((await account.POST(req('/api/account', 'POST', profile))).status);
    expect(codes.slice(0, 20).every((c) => c === 200)).toBe(true);
    expect(codes[21]).toBe(429);
  });
});

describe('admin cycle', () => {
  it('denies non-admins', async () => {
    asUser('u1');
    expect((await read(await admin.GET(req('/api/admin', 'GET')))).status).toBe(403);
    expect((await read(await admin.POST(req('/api/admin', 'POST', { id: crypto.randomUUID(), status: 'reviewing' })))).status).toBe(403);
  });
  it('runs the full lifecycle with audit events', async () => {
    await registered('c1');
    const id = await createOrder('c1');
    expect((await adminCall({ id, status: 'reviewing' })).status).toBe(200);
    expect((await adminCall({ id, status: 'quoted', amount: 1250.5, quote_notes: 'نطاق العرض والشروط' })).status).toBe(200);
    asUser('c1');
    const mine = (await read(await requests.GET(req('/api/requests', 'GET')))).body.requests[0];
    expect(mine.quote_fils).toBe(125050);
    expect((await read(await requests.POST(req('/api/requests', 'POST', { id, action: 'accept' })))).status).toBe(200);
    expect((await adminCall({ id, status: 'scheduled', scheduled_at: dubaiSlot(48) })).status).toBe(200);
    expect((await adminCall({ id, status: 'completed' })).status).toBe(200);
    expect(await status(id)).toBe('completed');
    const ev = await state.pg!.query<{ action: string }>('SELECT action FROM eco_collect.events WHERE request_id=$1 ORDER BY id', [id]);
    expect(ev.rows.map((r) => r.action)).toEqual(['new', 'reviewing', 'quoted', 'accepted', 'scheduled', 'completed']);
  });
  it('shows the admin list with customer contact data', async () => {
    await registered('c1'); await createOrder('c1');
    asUser('admin', ADMIN_EMAIL);
    const r = await read(await admin.GET(req('/api/admin', 'GET')));
    expect(r.status).toBe(200);
    expect(r.body.requests[0]).toMatchObject({ phone: '0501234567', name: 'عميل تجريبي' });
  });
  it('rejects illegal transitions and admin-forged acceptance', async () => {
    await registered('c1');
    const id = await createOrder('c1');
    expect((await adminCall({ id, status: 'scheduled' })).status).toBe(409);
    expect((await adminCall({ id, status: 'accepted' })).status).toBe(409);
    expect(await status(id)).toBe('new');
  });
  it('validates quote amounts and schedule', async () => {
    await registered('c1');
    const id = await createOrder('c1');
    await adminCall({ id, status: 'reviewing' });
    for (const amount of [0, -5, 1_000_001, 10.555, 'abc']) {
      expect((await adminCall({ id, status: 'quoted', amount, quote_notes: 'ملاحظات كافية' })).status).toBe(400);
    }
    await adminCall({ id, status: 'quoted', amount: 100, quote_notes: 'ملاحظات كافية' });
    asUser('c1'); await requests.POST(req('/api/requests', 'POST', { id, action: 'accept' }));
    expect((await adminCall({ id, status: 'scheduled', scheduled_at: dubaiSlot(-24) })).status).toBe(400);
    expect((await adminCall({ id, status: 'scheduled', scheduled_at: '2099-01-01T10:00:00Z' })).status).toBe(400);
  });
  it('blocks customer cancel after acceptance and is idempotent on double accept', async () => {
    await registered('c1');
    const id = await createOrder('c1');
    await adminCall({ id, status: 'reviewing' });
    await adminCall({ id, status: 'quoted', amount: 100, quote_notes: 'ملاحظات كافية' });
    asUser('c1');
    expect((await read(await requests.POST(req('/api/requests', 'POST', { id, action: 'accept' })))).status).toBe(200);
    expect((await read(await requests.POST(req('/api/requests', 'POST', { id, action: 'accept' })))).status).toBe(409);
    expect((await read(await requests.POST(req('/api/requests', 'POST', { id, action: 'cancel' })))).status).toBe(409);
    const n = await state.pg!.query<{ n: number }>("SELECT count(*)::int n FROM eco_collect.events WHERE request_id=$1 AND action='accepted'", [id]);
    expect(n.rows[0].n).toBe(1);
  });
  it('customer cannot accept an order that was moved back to review', async () => {
    await registered('c1');
    const id = await createOrder('c1');
    await adminCall({ id, status: 'reviewing' });
    await adminCall({ id, status: 'quoted', amount: 100, quote_notes: 'ملاحظات كافية' });
    await adminCall({ id, status: 'reviewing' });
    asUser('c1');
    expect((await read(await requests.POST(req('/api/requests', 'POST', { id, action: 'accept' })))).status).toBe(409);
  });
});

describe('input robustness', () => {
  it('returns 400 (not 500) for malformed JSON', async () => {
    asUser('u1');
    expect((await read(await account.POST(req('/api/account', 'POST', '{not json')))).status).toBe(400);
  });
  it('returns 400 for non-object JSON bodies', async () => {
    asUser('u1');
    expect((await read(await account.POST(req('/api/account', 'POST', 'null')))).status).toBe(400);
  });
});

// Unexpected dependency errors may embed credentials or customer data.
it('logs unexpected failures without raw error details', async () => {
  const { failure } = await import('@/lib/api');
  const logger = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const response = failure(new Error('postgres://user:secret@example.test customer@example.test'));
    expect(response.status).toBe(500);
    expect(logger).toHaveBeenCalledExactlyOnceWith(JSON.stringify({ level: 'error', event: 'api_unhandled' }));
    expect(await response.text()).not.toContain('secret');
  } finally {
    logger.mockRestore();
  }
});
