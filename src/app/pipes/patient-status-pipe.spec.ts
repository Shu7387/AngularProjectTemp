import { PatientStatusPipe } from './patient-status-pipe';

describe('PatientStatusPipe', () => {
  it('create an instance', () => {
    const pipe = new PatientStatusPipe();
    expect(pipe).toBeTruthy();
  });
});
