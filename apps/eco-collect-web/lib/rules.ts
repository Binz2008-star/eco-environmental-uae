export const labels: Record<string,string> = {new:'طلب جديد',reviewing:'قيد المراجعة',quoted:'عرض سعر متاح',accepted:'تم قبول العرض',scheduled:'تمت الجدولة',completed:'مكتمل',cancelled:'ملغي'};
export const kinds=['مخلفات ترميم غير خطرة','خشب','معادن','مخلفات مختلطة غير خطرة'];
export const transitions:Record<string,string[]>={new:['reviewing','cancelled'],reviewing:['quoted','cancelled'],quoted:['reviewing','cancelled'],accepted:['scheduled','cancelled'],scheduled:['completed','cancelled'],completed:[],cancelled:[]};
export function validPhone(v:string){return /^(?:\+971|0)5\d{8}$/.test(v)}
export function validDate(v:string){return /^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v&&v>=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai'}).format(new Date())}
export function validUuid(v:string){return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)}
