import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ageCalculator',
  standalone: true,
})
export class AgeCalculatorPipe implements PipeTransform {
  transform(dateOfBirth: string, considerMonth: boolean): number {
    if (!dateOfBirth) return 0;

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();

    if (considerMonth) {
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    return age;
  }
}
