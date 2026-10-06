import { describe,expect,it } from 'vitest';
import { assertAttendanceOpen,assertUniqueStudents } from './attendance-policy.js';
import { markAttendanceSchema,updateAttendanceSchema } from './sessions.schema.js';
describe('attendance rules',()=>{
  const now=new Date('2026-10-05T10:00:00Z');
  it('rejects future and cancelled sessions',()=>{expect(()=>assertAttendanceOpen({status:'SCHEDULED',startAt:new Date('2026-10-06')},now)).toThrow();expect(()=>assertAttendanceOpen({status:'CANCELLED',startAt:new Date('2026-10-01')},now)).toThrow();});
  it('allows live and historical corrections',()=>{for(const status of ['LIVE','COMPLETED','RESCHEDULED'])expect(()=>assertAttendanceOpen({status,startAt:new Date('2026-10-01')},now)).not.toThrow();});
  it('rejects duplicate student records before writing',()=>{expect(()=>assertUniqueStudents([{studentId:'one'},{studentId:'one'}])).toThrow();expect(markAttendanceSchema.safeParse({records:[{studentId:'one',status:'PRESENT'},{studentId:'one',status:'ABSENT'}]}).success).toBe(false);});
  it('allows notes to be explicitly cleared, but only uses closed statuses',()=>{expect(updateAttendanceSchema.parse({note:null})).toEqual({note:null});expect(markAttendanceSchema.safeParse({records:[{studentId:'one',status:'UNKNOWN'}]}).success).toBe(false);});
});
