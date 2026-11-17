import { authorize,body,json,failure,str } from '@/lib/api';
import {db,isAdmin} from '@/lib/db';
import {validPhone} from '@/lib/rules';
export async function GET(req:Request){try{const u=await authorize(req),sql=db();const rows=await sql`SELECT * FROM eco_collect.accounts WHERE user_id=${u.userId}`;return json({account:rows[0]||null,user:{name:u.displayName,email:u.email},admin:isAdmin(u.email)})}catch(e){return failure(e)}}
export async function POST(req:Request){try{const u=await authorize(req),b=await body(req),name=str(b.name,2,100),phone=str(b.phone,10,14),company=str(b.company||'',0,150);if(!validPhone(phone)||b.consent!==true)throw new Error('INPUT');const sql=db();await sql`INSERT INTO eco_collect.accounts(user_id,email,name,phone,company) VALUES(${u.userId},${u.email},${name},${phone},${company}) ON CONFLICT(user_id) DO UPDATE SET name=EXCLUDED.name,phone=EXCLUDED.phone,company=EXCLUDED.company,email=EXCLUDED.email`;return json({ok:true})}catch(e){return failure(e)}}
