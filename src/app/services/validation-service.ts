import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable({
  providedIn: 'root', // Root level injection
})
export class ValidationService {
  constructor() {
    console.log('ValidationService instantiated at root level');
  }

  // Custom validator for age range
  public ageRangeValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const birthDate = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < min || age > max) {
        return { ageRange: { min, max, actual: age } };
      }

      return null;
    };
  }

  // Custom validator for blood group
  bloodGroupValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

      if (!validBloodGroups.includes(control.value)) {
        return { invalidBloodGroup: { value: control.value } };
      }

      return null;
    };
  }

  // Custom validator for phone number
  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const phoneRegex = /^\+?[\d\s\-()]{10,}$/;

      if (!phoneRegex.test(control.value)) {
        return { invalidPhone: true };
      }

      return null;
    };
  }

  // Email exists validator
  emailExistsValidator(existingEmails: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const emailExists = existingEmails.includes(control.value.toLowerCase());

      return emailExists ? { emailExists: true } : null;
    };
  }
}
