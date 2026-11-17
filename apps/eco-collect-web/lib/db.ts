import { neon } from '@neondatabase/serverless';
import { env } from 'cloudflare:workers';
export function db(){const url=(env as unknown as Record<string,string>).DATABASE_URL;if(!url)throw new Error('Database unavailable');return neon(url);}
export function isAdmin(email:string){return ((env as unknown as Record<string,string>).ADMIN_EMAILS||'').split(',').map(s=>s.trim().toLowerCase()).includes(email.toLowerCase())}
