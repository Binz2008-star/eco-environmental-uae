import { getChatGPTUser } from '@/app/chatgpt-auth';
import { db } from './db';
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
export async function authorize(req:Request){
 if(req.method!=='GET' && req.headers.get('origin')!==new URL(req.url).origin)throw new Error('ORIGIN');
 const user=await getChatGPTUser();if(!user)throw new Error('AUTH');
 if(req.method!=='GET'){
  const sql=db(),bucket=Math.floor(Date.now()/60000);const result=await sql`WITH purged AS (DELETE FROM eco_collect.rate_limits WHERE user_id=${user.userId} AND bucket<${bucket-10}) INSERT INTO eco_collect.rate_limits(user_id,bucket) VALUES(${user.userId},${bucket}) ON CONFLICT(user_id,bucket) DO UPDATE SET count=eco_collect.rate_limits.count+1 RETURNING count`;
  if(result[0].count>20)throw new Error('RATE');
 }
 return user;
}
export async function body(req:Request):Promise<Record<string,unknown>>{
 const text=await req.text();if(text.length>12000)throw new Error('INPUT');
 let parsed:unknown;try{parsed=JSON.parse(text)}catch{throw new Error('INPUT')}
 if(typeof parsed!=='object'||parsed===null||Array.isArray(parsed))throw new Error('INPUT');
 return parsed as Record<string,unknown>
}
export function failure(e:unknown){const code=e instanceof Error?e.message:'';if(!['AUTH','RATE','ORIGIN','INPUT'].includes(code))console.error(JSON.stringify({level:'error',event:'api_unhandled'}));return json({error:code==='AUTH'?'سجّل الدخول أولًا.':code==='RATE'?'طلبات كثيرة. حاول بعد دقيقة.':code==='ORIGIN'?'الطلب غير مسموح.':code==='INPUT'?'تحقق من البيانات المدخلة.':'تعذر تنفيذ العملية. حاول مجددًا.'},code==='AUTH'?401:code==='ORIGIN'?403:code==='RATE'?429:code==='INPUT'?400:500)}
export function str(v:unknown,min:number,max:number){if(typeof v!=='string'||v.trim().length<min||v.trim().length>max)throw new Error('INPUT');return v.trim()}
