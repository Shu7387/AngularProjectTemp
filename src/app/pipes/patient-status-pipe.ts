import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'patientStatus',
  standalone: true,
})
export class PatientStatusPipe implements PipeTransform {
  transform(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return '✓ Active';
      case 'inactive':
        return '○ Inactive';
      case 'critical':
        return '⚠ Critical';
      default:
        return status;
    }
  }
}
