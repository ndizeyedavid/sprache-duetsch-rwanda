import { isScheduleWriteConflict } from './session-conflicts.js';
import { describe,it,expect } from 'vitest';
import { createSessionSchema, updateSessionSchema } from './sessions.schema.js';
import { checkSessionChange } from './session-policy.js';
import { addSessionWeeks } from './session-dates.js';
import type { ClassSession } from '../../generated/prisma/client.js';
const now=new Date('2026-10-05T12:00:00Z');
const base={status:'SCHEDULED',startAt:new Date('2026-10-05T11:00:00Z'),endAt:new Date('2026-10-05T13:00:00Z')} as ClassSession;
describe('session policy',()=>{
  it('recognizes query and commit serialization failures without hiding unrelated errors',()=>{
    expect(isScheduleWriteConflict({code:'P2034'})).toBe(true);
    expect(isScheduleWriteConflict({cause:{kind:'TransactionWriteConflict',originalCode:'40001'}})).toBe(true);
    expect(isScheduleWriteConflict(new Error('Other failure'))).toBe(false);
    expect(isScheduleWriteConflict({code:'P2002'})).toBe(false);
  });
  it('accepts safe links and rejects executable URLs and invalid zones',()=>{
    const input={classGroupId:'class',mode:'ONLINE',provider:'GOOGLE_MEET',startAt:now,endAt:new Date(now.getTime()+3600000),meetingUrl:'https://meet.google.com/test',timezone:'Africa/Kigali'};
    expect(createSessionSchema.safeParse(input).success).toBe(true);
    expect(createSessionSchema.safeParse({...input,meetingUrl:'javascript:alert(1)'}).success).toBe(false);
    expect(createSessionSchema.safeParse({...input,timezone:'Unknown/Zone'}).success).toBe(false);
    expect(updateSessionSchema.safeParse({recordingUrl:null,notes:null}).success).toBe(true);
  });
  it('allows live and completion only after the scheduled start',()=>{
    expect(()=>checkSessionChange(base,{status:'LIVE'},now)).not.toThrow();
    expect(()=>checkSessionChange({...base,startAt:new Date('2026-10-06')},{status:'LIVE'},now)).toThrow();
    expect(()=>checkSessionChange({...base,startAt:new Date('2026-10-06')},{status:'COMPLETED'},now)).toThrow();
  });
  it('locks closed sessions while permitting recording metadata',()=>{
    expect(()=>checkSessionChange({...base,status:'COMPLETED'},{startAt:now},now)).toThrow();
    expect(()=>checkSessionChange({...base,status:'COMPLETED'},{},now)).not.toThrow();
    expect(()=>checkSessionChange({...base,status:'CANCELLED'},{status:'SCHEDULED'},now)).toThrow();
  });
  it('preserves weekly wall-clock time across daylight saving changes',()=>{
    expect(addSessionWeeks(new Date('2026-10-30T13:00:00Z'),1,'America/New_York').toISOString()).toBe('2026-11-06T14:00:00.000Z');
    expect(addSessionWeeks(new Date('2026-10-05T08:00:00Z'),1,'Africa/Kigali').toISOString()).toBe('2026-10-12T08:00:00.000Z');
  });
});
