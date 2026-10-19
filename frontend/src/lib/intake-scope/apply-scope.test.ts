import type { InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders } from 'axios';
import { afterEach,beforeEach,describe,expect,it } from 'vitest';
import { applyIntakeScope } from './apply-scope';
import { bindIntakeScope,setIntakeScope } from './store';

const request = (url: string, extra: Partial<InternalAxiosRequestConfig> = {}) =>
  applyIntakeScope({ url, method: 'get', headers: new AxiosHeaders(), ...extra } as InternalAxiosRequestConfig);

describe('applyIntakeScope', () => {
  beforeEach(() => {
    bindIntakeScope('user-1');
    setIntakeScope('intake-9');
  });
  afterEach(() => {
    setIntakeScope(null);
    bindIntakeScope(null);
  });

  it('adds the intake to scoped staff GETs', () => {
    expect(request('/payments?page=2').params).toEqual({ intakeId: 'intake-9' });
  });
  it('keeps an intake the caller chose explicitly', () => {
    expect(request('/students?intakeId=other').params).toBeUndefined();
    expect(request('/students', { params: { intakeId: undefined } }).params).toEqual({ intakeId: undefined });
  });
  it('shows one student\'s whole history', () => {
    expect(request('/assessments/attempts?studentId=s1').params).toBeUndefined();
  });
  it('leaves writes and unscoped endpoints alone', () => {
    expect(request('/payments', { method: 'post' }).params).toBeUndefined();
    expect(request('/intakes').params).toBeUndefined();
  });
  it('does nothing when all intakes are selected', () => {
    setIntakeScope(null);
    expect(request('/payments').params).toBeUndefined();
  });
});
