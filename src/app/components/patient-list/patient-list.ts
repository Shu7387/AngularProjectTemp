import { Component, OnInit, OnDestroy, AfterViewInit, DoCheck, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Patient } from '../../models/patient.model';
import { PatientDetailComponent } from '../patient-detail/patient-detail';
import { PatientStatusPipe } from '../../pipes/patient-status-pipe';
import { AgeCalculatorPipe } from '../../pipes/age-calculator-pipe';
import { HighlightDirective } from '../../directives/highlight';
import { TooltipDirective } from '../../directives/tooltip';
import { PatientService } from '../../services/patient-service';
import { AddPatientComponent } from '../add-patient/add-patient';
import { EditPatientComponent } from '../edit-patient/edit-patient';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PatientDetailComponent,
    PatientStatusPipe,
    AgeCalculatorPipe,
    HighlightDirective,
    TooltipDirective,
    AddPatientComponent,
    EditPatientComponent,
  ],
  templateUrl: './patient-list.html',
  styleUrls: ['./patient-list.css'],
})
export class PatientListComponent implements OnInit, OnDestroy, AfterViewInit, DoCheck {
  // ---------- Data & UI state ----------
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  selectedPatient: Patient | null = null;

  searchTerm = '';
  filterStatus = 'all';

  showAddForm = false;
  showEditForm = false;
  showPatientDetails = false;
  editingPatientId: string | number | null = '';

  // Signals / UI
  isLoading = signal(false);
  componentTitle = 'Patient Management System';
  totalPatients = 0;
  errorMessage: string | null = null;

  // Lifecycle tracking
  private lifecycleLog: string[] = [];

  // RxJS
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(private patientService: PatientService) {
    console.log('Constructor: Component instance created');
    this.lifecycleLog.push('Constructor called');
  }

  // ---------- Lifecycle ----------
  ngOnInit(): void {
    console.log('ngOnInit: Component initialized');
    this.lifecycleLog.push('ngOnInit called');

    this.setupSearchSubscription();
    this.loadPatients();
  }

  ngDoCheck(): void {
    // Light; demonstrates change detection
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit: View initialized');
    this.lifecycleLog.push('ngAfterViewInit called');
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy: Component destroyed');
    this.lifecycleLog.push('ngOnDestroy called');

    this.destroy$.next();
    this.destroy$.complete();
  }

  // ---------- Streams ----------
  /** Debounced search pipeline: filters list when user stops typing */
  private setupSearchSubscription(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.filterPatients();
      });
  }

  // ---------- Data ----------
  /** Load patients from service (no mock), set counts, handle errors */
  loadPatients(): void {
    this.isLoading.set(true);
    this.errorMessage = null;

    this.patientService
      .getAllPatients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (patients) => {
          this.patients = patients;
          this.totalPatients = patients.length;
          this.filterPatients(); // initial filter with current search/status
          this.isLoading.set(false);
          console.log('Patients loaded:', patients.length);
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.isLoading.set(false);
        },
      });
  }

  // ---------- Events ----------
  /** Bound to input via (ngModelChange) */
  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  /** Bound to status <select> change */
  onFilterChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.filterStatus = selectElement.value.toLowerCase();
    this.filterPatients();
  }

  onCloseDetail(): void {
    console.log('Closing patient detail view');
    this.selectedPatient = null;
    this.showPatientDetails = false;
  }

  onToggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    console.log('Add form toggled:', this.showAddForm);
  }

  // ----- Phase 2 hooks preserved -----
  onPatientAdded(): void {
    this.showAddForm = false;
    this.loadPatients(); // Reload list after add
  }

  onCancelAddForm(): void {
    this.showAddForm = false;
  }

  onEditPatient(patient: Patient): void {
    this.showEditForm = true;
    this.editingPatientId = patient.id;
    this.showAddForm = false; // ensure add form is closed
  }

  onPatientUpdated(updatedPatient: Patient): void {
    this.showEditForm = false;
    this.editingPatientId = null;
    this.loadPatients(); // Reload list after update
  }

  onCancelEditForm(): void {
    this.showEditForm = false;
    this.editingPatientId = null;
  }

  onRefreshPatients(): void {
    console.log('Refreshing patient list');
    this.filterStatus = 'all';
    this.searchTerm = '';
    this.loadPatients();
  }

  clearError(): void {
    this.errorMessage = null;
  }

  onDeletePatient(patient: Patient): void {
    if (confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`)) {
      this.patientService
        .deletePatient(patient.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            if (this.selectedPatient?.id === patient.id) {
              this.selectedPatient = null;
            }
            this.loadPatients(); // Reload list after delete
          },
          error: (error) => {
            this.errorMessage = error.message;
          },
        });
    }
  }

  // ---------- Filtering ----------
  /** Client-side filtering (fast; avoids extra HTTP calls during search) */
  filterPatients(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredPatients = this.patients.filter((p) => {
      const matchesSearch =
        term === '' ||
        p.firstName?.toLowerCase().includes(term) ||
        p.lastName?.toLowerCase().includes(term) ||
        p.email?.toLowerCase().includes(term);

      const matchesStatus =
        this.filterStatus.toLowerCase() === 'all' || p.status.toLowerCase() === this.filterStatus;

      return matchesSearch && matchesStatus;
    });
  }

  // ---------- UI helpers ----------
  getStatusClass(status: string): string {
    return `status-badge status-${status.toLowerCase()}`;
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-success';
      case 'inactive':
        return 'bg-secondary';
      case 'critical':
        return 'bg-danger';
      default:
        return 'bg-primary';
    }
  }

  trackByPatientId(index: number, patient: Patient) {
    return patient.id;
  }

  onViewPatient(patient: Patient | null) {
    console.log('Patient selected:', patient?.firstName, patient?.lastName);
    this.selectedPatient = patient;
    this.showPatientDetails = true;
  }
}
