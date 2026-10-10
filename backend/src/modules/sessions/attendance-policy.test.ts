import { describe,expect,it } from 'vitest';
import { assertAttendanceOpen,assertUniqueStudents,joinAttendanceStatus } from './attendance-policy.js';
import { markAttendanceSchema,updateAttendanceSchema } from './sessions.schema.js';
describe('attendance rules',()=>{
  const now=new Date('2026-10-05T10:00:00Z');
  it('rejects future and cancelled sessions',()=>{expect(()=>assertAttendanceOpen({status:'SCHEDULED',startAt:new Date('2026-10-06')},now)).toThrow();expect(()=>assertAttendanceOpen({status:'CANCELLED',startAt:new Date('2026-10-01')},now)).toThrow();});
  it('allows live and historical corrections',()=>{for(const status of ['LIVE','COMPLETED','RESCHEDULED'])expect(()=>assertAttendanceOpen({status,startAt:new Date('2026-10-01')},now)).not.toThrow();});
  it('rejects duplicate student records before writing',()=>{expect(()=>assertUniqueStudents([{studentId:'one'},{studentId:'one'}])).toThrow();expect(markAttendanceSchema.safeParse({records:[{studentId:'one',status:'PRESENT'},{studentId:'one',status:'ABSENT'}]}).success).toBe(false);});
  it('allows notes to be explicitly cleared, but only uses closed statuses',()=>{expect(updateAttendanceSchema.parse({note:null})).toEqual({note:null});expect(markAttendanceSchema.safeParse({records:[{studentId:'one',status:'UNKNOWN'}]}).success).toBe(false);});
});

describe('attendance from opening the class link', () => {
  const start = new Date('2026-10-20T16:00:00Z');
  const session = { status: 'SCHEDULED', startAt: start, endAt: new Date('2026-10-20T18:00:00Z') };
  const at = (minutes: number) => new Date(start.getTime() + minutes * 60_000);
  it('counts as present from 15 minutes before the start until 10 minutes after', () => {
    expect(joinAttendanceStatus(session, at(-15))).toBe('PRESENT');
    expect(joinAttendanceStatus(session, at(10))).toBe('PRESENT');
  });
  it('counts as late after the grace period and stops at the end', () => {
    expect(joinAttendanceStatus(session, at(11))).toBe('LATE');
    expect(joinAttendanceStatus(session, at(119))).toBe('LATE');
    expect(joinAttendanceStatus(session, at(120))).toBeNull();
  });
  it('ignores clicks well before the class and on cancelled or completed sessions', () => {
    expect(joinAttendanceStatus(session, at(-16))).toBeNull();
    expect(joinAttendanceStatus({ ...session, status: 'CANCELLED' }, at(0))).toBeNull();
    expect(joinAttendanceStatus({ ...session, status: 'COMPLETED' }, at(0))).toBeNull();
  });
});
