import { badRequest } from '../../lib/http-error.js';
// Preserve the class's local wall-clock time when a weekly series crosses DST.
export function addSessionWeeks(date: Date, weeks: number, timezone: string): Date {
  const formatter = new Intl.DateTimeFormat('en-CA', {timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  function localStamp(value:Date) {
    const p=Object.fromEntries(formatter.formatToParts(value).map(v=>[v.type,v.value]));
    return Date.UTC(Number(p.year),Number(p.month)-1,Number(p.day),Number(p.hour),Number(p.minute),Number(p.second));
  }
  const target=localStamp(date)+weeks*7*86400000;
  let result=date.getTime()+weeks*7*86400000;
  for(let i=0;i<4;i++) { const delta=target-localStamp(new Date(result));if(!delta)break;result+=delta; }
  const shifted=new Date(result);
  if(localStamp(shifted)!==target) throw badRequest('This local time does not exist in the selected timezone. Choose a different time.');
  return shifted;
}
