import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient-service';
import { LoggerService } from '../../services/logger-service';
import { ActivatedRoute, Route, Router, RouterLink } from '@angular/router';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-edit-patient',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-patient.html',
  styleUrl: './edit-patient.css',
  providers: [LoggerService], // Component-level injection
})
export class EditPatientComponent implements OnInit {
  @Input() patientId!: number | string;
  @Input() useRoutingCancel = true;
  @Output() patientUpdated = new EventEmitter<Patient>();
  @Output() cancelled = new EventEmitter<void>();

  // Template-driven form model - only editable fields
  editablePatient: Partial<Patient> = {};
  originalPatient: Patient | null = null;

  loading = signal(false);
  error: string | null = null;
  successMessage: string | null = null;

  // Status options for dropdown
  statusOptions = ['Active', 'Inactive', 'Discharged', 'Critical'];

  constructor(
    private patientService: PatientService,
    private logger: LoggerService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // PatientId comes from Parent-Child decorators, or Siblings route navigation
    if (!this.patientId) {
      this.activatedRoute.paramMap.subscribe((p) => {
        const id = p.get('id');

        if (id) {
          this.patientId = id;
        } else {
          console.log('PatientDetailComponent: ngOnInit - No id in route.');
          return;
        }
      });
    }

    this.loadPatient();
  }

  loadPatient(): void {
    this.loading.set(true);
    this.error = null;

    this.patientService.getPatientById(this.patientId).subscribe({
      next: (patient) => {
        this.originalPatient = patient;
        // Initialize editable fields only
        this.editablePatient = {
          id: patient.id,
          email: patient.email,
          phone: patient.phone,
          address: patient.address,
          status: patient.status,
          currentMedication: patient.currentMedication,
        };
        this.logger.log(`Loaded patient ${patient.name} for editing`);
        this.loading.set(false);
      },
      error: (err) => {
        this.error = 'Failed to load patient details';
        this.loading.set(false);
        this.logger.error(`Error loading patient: ${err.message}`);
      },
    });
  }

  onSubmit(form: any): void {
    if (form.invalid) {
      this.error = 'Please fix the validation errors before submitting';
      return;
    }

    if (!this.originalPatient) {
      this.error = 'Original patient data not available';
      return;
    }

    this.loading.set(true);
    this.error = null;
    this.successMessage = null;

    // Merge editable fields with original patient data
    const today = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
    const updatedPatient: Patient = {
      ...this.originalPatient,
      email: this.editablePatient.email!,
      phone: this.editablePatient.phone!,
      address: this.editablePatient.address!,
      status: this.editablePatient.status!,
      lastVisit: today, // Automatically set to current date
      currentMedication: this.editablePatient.currentMedication!,
    };

    this.patientService.updatePatient(updatedPatient.id, updatedPatient).subscribe({
      next: (patient) => {
        this.successMessage = 'Patient updated successfully!';
        this.loading.set(false);
        this.logger.log(`Patient ${patient.name} updated successfully`);
        setTimeout(() => {
          if (this.useRoutingCancel) {
            this.router.navigate(['/patients']);
          } else {
            this.patientUpdated.emit(patient);
          }
        }, 1500);
      },
      error: (err) => {
        this.error = 'Failed to update patient';
        this.loading.set(false);
        this.logger.error(`Error updating patient: ${err.message}`);
      },
    });
  }

  onCancel(): void {
    this.logger.log('Edit patient cancelled');
    if (this.useRoutingCancel) {
      this.router.navigate(['/patients']);
    } else {
      this.cancelled.emit();
    }
  }

  // Helper to check if form has changes
  hasChanges(): boolean {
    if (!this.originalPatient) return false;

    return (
      this.editablePatient.email !== this.originalPatient.email ||
      this.editablePatient.phone !== this.originalPatient.phone ||
      this.editablePatient.address !== this.originalPatient.address ||
      this.editablePatient.status !== this.originalPatient.status ||
      this.editablePatient.currentMedication !== this.originalPatient.currentMedication
    );
  }
}
