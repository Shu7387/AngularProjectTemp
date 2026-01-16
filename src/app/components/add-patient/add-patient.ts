import { Component, OnInit, OnDestroy, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { delay, finalize, takeUntil } from 'rxjs/operators';
import { PatientService } from '../../services/patient-service';
import { ValidationService } from '../../services/validation-service';
import { LoggerService } from '../../services/logger-service';
import { Patient } from '../../models/patient.model';

@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-patient.html',
  styleUrl: './add-patient.css',
  providers: [LoggerService], // Component-level injector - demonstrating hierarchical injection
})
export class AddPatientComponent implements OnInit, OnDestroy {
  @Output() patientAdded = new EventEmitter<Patient>();
  @Output() cancelled = new EventEmitter<void>();

  reactiveForm!: FormGroup;
  isSubmitting = signal(false);
  submitError: string | null = null;
  submitSuccess = false;

  private destroy$ = new Subject<void>();

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  statusOptions = ['Active', 'Inactive', 'Critical', 'Discharged'];
  genderOptions = ['Male', 'Female', 'Other'];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService, // Root level injection
    private validationService: ValidationService, // Root level injection
    private logger: LoggerService // Component level injection
  ) {
    this.logger.log('AddPatient component instantiated');
  }

  ngOnInit(): void {
    this.initializeReactiveForm();
    this.setupFormValueChanges();
    this.logger.log('AddPatient component initialized');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.logger.log('AddPatient component destroyed');
  }

  // Initialize Reactive Form with validators
  private initializeReactiveForm(): void {
    this.reactiveForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, this.validationService.phoneValidator()]],
      dateOfBirth: ['', [Validators.required, this.validationService.ageRangeValidator(0, 120)]],
      gender: ['Male', Validators.required],
      bloodGroup: ['', [Validators.required, this.validationService.bloodGroupValidator()]],
      address: ['', [Validators.required, Validators.minLength(10)]],
      status: ['active', Validators.required],
      medicalHistory: [''],
      allergies: this.fb.array([]),
      currentMedications: this.fb.array([]),
      emergencyContact: this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        relation: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        phone: ['', [Validators.required, this.validationService.phoneValidator()]],
      }),
    });

    this.logger.log('Reactive form initialized with validators');
  }

  // Setup form value changes with RxJS operators
  private setupFormValueChanges(): void {
    // Monitor email field changes
    this.reactiveForm
      .get('email')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.logger.log(`Email changed: ${value}`);
      });

    // Monitor form status changes
    this.reactiveForm.statusChanges.pipe(takeUntil(this.destroy$)).subscribe((status) => {
      this.logger.log(`Form status: ${status}`);
    });
  }

  // FormArray getters
  get allergies(): FormArray {
    return this.reactiveForm.get('allergies') as FormArray;
  }

  get currentMedications(): FormArray {
    return this.reactiveForm.get('currentMedications') as FormArray;
  }

  // Add allergy to FormArray
  addAllergy(): void {
    this.allergies.push(this.fb.control('', Validators.required));
    this.logger.log('Allergy field added');
  }

  removeAllergy(index: number): void {
    this.allergies.removeAt(index);
    this.logger.log(`Allergy field ${index} removed`);
  }

  // Add medication to FormArray
  addMedication(): void {
    this.currentMedications.push(this.fb.control('', Validators.required));
    this.logger.log('Medication field added');
  }

  removeMedication(index: number): void {
    this.currentMedications.removeAt(index);
    this.logger.log(`Medication field ${index} removed`);
  }

  // Submit Reactive Form - demonstrating POST request
  onReactiveSubmit(): void {
    if (this.reactiveForm.invalid) {
      this.markFormGroupTouched(this.reactiveForm);
      this.logger.error('Reactive form is invalid');
      return;
    }

    this.isSubmitting.set(true);
    this.submitError = null;

    const formValue = this.reactiveForm.value;
    const medications = formValue.currentMedications || [];
    const newPatient: Omit<Patient, 'id'> = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      name: `${formValue.firstName} ${formValue.lastName}`,
      email: formValue.email,
      phone: formValue.phone,
      dateOfBirth: formValue.dateOfBirth,
      gender: formValue.gender,
      bloodGroup: formValue.bloodGroup,
      address: formValue.address,
      status: formValue.status.charAt(0).toUpperCase() + formValue.status.slice(1),
      lastVisit: new Date().toISOString().split('T')[0],
      admissionDate: new Date().toISOString().split('T')[0],
      medicalHistory: formValue.medicalHistory || 'No medical history provided',
      allergies: formValue.allergies || [],
      currentMedications: medications,
      currentMedication: medications.join(', '),
    };

    this.patientService
      .createPatient(newPatient)
      .pipe(
        delay(5500), // <-- delay success emission by 5.5s
        takeUntil(this.destroy$),
        finalize(() => this.isSubmitting.set(false)) // stop spinner once done (success or error)
      )
      .subscribe({
        next: (patient) => {
          this.logger.log(`Patient created successfully: ${patient.id}`);
          this.submitSuccess = true;
          setTimeout(() => {
            this.patientAdded.emit(patient);
            this.resetForms();
            this.submitSuccess = false;
          }, 5500);
        },
        error: (error) => {
          this.submitError = error.message;
          this.logger.error(`Failed to create patient: ${error.message}`);
        },
        complete: () => {},
      });
  }

  // Reset forms
  resetForms(): void {
    this.reactiveForm.reset({
      status: 'Active',
      gender: 'Male',
    });
    this.allergies.clear();
    this.currentMedications.clear();
    this.submitSuccess = false;
    this.submitError = null;
  }

  // Cancel
  onCancel(): void {
    this.cancelled.emit();
    this.logger.log('Add patient cancelled');
  }

  // Helper to mark all fields as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((c) => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          } else {
            c.markAsTouched();
          }
        });
      }
    });
  }

  // Validation helpers for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.reactiveForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.reactiveForm.get(fieldName);
    if (!control || !control.errors) return '';

    const errors = control.errors;
    if (errors['required']) return 'This field is required';
    if (errors['email']) return 'Invalid email format';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength}`;
    if (errors['invalidPhone']) return 'Invalid phone number format (e.g., +1-555-1234)';
    if (errors['ageRange'])
      return `Age must be between ${errors['ageRange'].min} and ${errors['ageRange'].max}`;
    if (errors['invalidBloodGroup']) return 'Invalid blood group';

    return 'Invalid field';
  }
}
