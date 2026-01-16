import {
  Component,
  OnInit,
  ViewChild,
  ViewChildren,
  ContentChild,
  QueryList,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Appointment, TimeSlot } from '../../models/appointment.model';
import { Patient } from '../../models/patient.model';
import { PatientService } from '../../services/patient-service';
import { LoggerService } from '../../services/logger-service';
import { AuthService } from '../../services/auth-service';
import { AppointmentCardComponent } from './appointment-card/appointment-card';
import { TimeSlotComponent } from './time-slot/time-slot';

/**
 * Appointments Component - Demonstrates Advanced Component Features
 *
 * Phase 3 Advanced Features Demonstrated:
 * - @ViewChild: Access single child component/element
 * - @ViewChildren: Access multiple child components as QueryList
 * - @ContentChild: Query projected content (in child components)
 * - ng-content: Content projection for flexible layouts
 * - Component communication (parent-child)
 * - Lifecycle hooks (ngAfterViewInit)
 */
@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppointmentCardComponent, TimeSlotComponent],
  providers: [LoggerService],
  templateUrl: './appointments.html',
  styleUrl: './appointments.css',
})
export class AppointmentsComponent implements OnInit, AfterViewInit, OnDestroy {
  // ========== @ViewChild Demo ==========
  // Access single element reference
  @ViewChild('appointmentForm') appointmentFormElement!: ElementRef<HTMLFormElement>;
  @ViewChild('selectedDateInput') dateInput!: ElementRef<HTMLInputElement>;

  // Access single child component
  @ViewChild('todaySchedule') todayScheduleCard!: AppointmentCardComponent;

  // ========== @ViewChildren Demo ==========
  // Access multiple child components as QueryList
  @ViewChildren(AppointmentCardComponent) allAppointmentCards!: QueryList<AppointmentCardComponent>;
  @ViewChildren(TimeSlotComponent) timeSlots!: QueryList<TimeSlotComponent>;

  // Component state
  appointments: Appointment[] = [];
  patients: Patient[] = [];
  appointmentForm!: FormGroup;
  selectedDate: string = '';
  availableTimeSlots: TimeSlot[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Current user info
  currentDoctorName: string = '';

  private destroy$ = new Subject<void>();

  // Appointment types and statuses
  appointmentTypes = ['Consultation', 'Follow-up', 'Emergency', 'Surgery'];
  appointmentStatuses = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled'];

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private authService: AuthService,
    private logger: LoggerService
  ) {
    console.log('📅 AppointmentsComponent instantiated');
  }

  ngOnInit(): void {
    this.logger.log('AppointmentsComponent initialized');

    // Get current user
    const user = this.authService.getCurrentUser();
    this.currentDoctorName = user?.fullName || 'Dr. Unknown';

    // Initialize form
    this.initializeForm();

    // Set today's date as default
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.appointmentForm.patchValue({ appointmentDate: this.selectedDate });

    // Load data
    this.loadPatients();
    this.loadAppointments();
    this.generateTimeSlots();
  }

  ngAfterViewInit(): void {
    console.log('👁️ ngAfterViewInit: View and child components initialized');
    this.logger.log('ViewChild and ViewChildren are now available');

    // Demonstrate ViewChild access
    if (this.appointmentFormElement) {
      console.log('✅ ViewChild: Form element accessed', this.appointmentFormElement.nativeElement);
    }

    // Demonstrate ViewChildren access
    if (this.allAppointmentCards) {
      console.log('✅ ViewChildren: Found appointment cards:', this.allAppointmentCards.length);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ========== Form Initialization ==========

  initializeForm(): void {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
      duration: [30, [Validators.required, Validators.min(15)]],
      type: ['Consultation', Validators.required],
      notes: [''],
      roomNumber: [''],
    });
  }

  // ========== Data Loading ==========

  loadPatients(): void {
    this.patientService
      .getAllPatients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (patients) => {
          this.patients = patients;
          this.logger.log(`Loaded ${patients.length} patients`);
        },
        error: (error) => {
          this.errorMessage = 'Failed to load patients';
          this.logger.error(error.message);
        },
      });
  }

  loadAppointments(): void {
    // Mock appointments for demonstration
    this.appointments = this.getMockAppointments();
    this.logger.log(`Loaded ${this.appointments.length} appointments`);
  }

  generateTimeSlots(): void {
    const slots: TimeSlot[] = [];
    const startHour = 9; // 9 AM
    const endHour = 17; // 5 PM

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const hasAppointment = this.appointments.some(
          (apt) => apt.appointmentDate === this.selectedDate && apt.appointmentTime === time
        );

        slots.push({
          time,
          available: !hasAppointment,
          appointmentId: hasAppointment
            ? this.appointments.find((a) => a.appointmentTime === time)?.id
            : undefined,
        });
      }
    }

    this.availableTimeSlots = slots;
  }

  // ========== Form Actions ==========

  onSubmit(): void {
    if (this.appointmentForm.invalid) {
      Object.keys(this.appointmentForm.controls).forEach((key) => {
        this.appointmentForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.appointmentForm.value;
    const patient = this.patients.find((p) => p.id == formValue.patientId);

    if (!patient) {
      this.errorMessage = 'Patient not found';
      return;
    }

    const newAppointment: Appointment = {
      id: this.appointments.length + 1,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      doctorName: this.currentDoctorName,
      appointmentDate: formValue.appointmentDate,
      appointmentTime: formValue.appointmentTime,
      duration: formValue.duration,
      type: formValue.type,
      status: 'Scheduled',
      notes: formValue.notes,
      roomNumber: formValue.roomNumber,
    };

    this.appointments.push(newAppointment);
    this.successMessage = 'Appointment scheduled successfully!';
    this.appointmentForm.reset();
    this.appointmentForm.patchValue({
      duration: 30,
      type: 'Consultation',
      appointmentDate: this.selectedDate,
    });
    this.generateTimeSlots();

    this.logger.log(`Appointment created: ${newAppointment.patientName}`);

    setTimeout(() => (this.successMessage = null), 3000);
  }

  onDateChange(): void {
    this.selectedDate = this.appointmentForm.get('appointmentDate')?.value;
    this.generateTimeSlots();
    this.logger.log(`Date changed to: ${this.selectedDate}`);
  }

  onTimeSlotClick(slot: TimeSlot): void {
    if (slot.available) {
      this.appointmentForm.patchValue({ appointmentTime: slot.time });
      this.logger.log(`Time slot selected: ${slot.time}`);
    }
  }

  // ========== ViewChild/ViewChildren Demonstrations ==========

  /**
   * Demonstrates ViewChild: Access and manipulate single child component
   */
  highlightTodaySchedule(): void {
    if (this.todayScheduleCard) {
      this.todayScheduleCard.highlight();
      this.logger.log('Today schedule highlighted via ViewChild');
    }
  }

  /**
   * Demonstrates ViewChildren: Access and manipulate multiple child components
   */
  highlightAllAppointments(): void {
    if (this.allAppointmentCards) {
      let count = 0;
      this.allAppointmentCards.forEach((card) => {
        card.highlight();
        count++;
      });
      this.logger.log(`Highlighted ${count} appointment cards via ViewChildren`);
      alert(`Highlighted ${count} appointment cards via ViewChildren`);
    }
  }

  /**
   * Demonstrates ViewChildren with QueryList: Get count and iterate
   */
  getAppointmentCardsInfo(): void {
    if (this.allAppointmentCards) {
      const info = {
        total: this.allAppointmentCards.length,
        first: this.allAppointmentCards.first,
        last: this.allAppointmentCards.last,
      };
      console.log('📊 Appointment Cards Info (ViewChildren):', info);
      alert(`Total appointment cards: ${info.total}`);
    }
  }

  /**
   * Demonstrates ElementRef access via ViewChild
   */
  focusDateInput(): void {
    if (this.dateInput) {
      this.dateInput.nativeElement.focus();
      this.logger.log('Date input focused via ViewChild ElementRef');
    }
  }

  /**
   * Demonstrates form reset via ViewChild
   */
  resetFormViaViewChild(): void {
    if (this.appointmentFormElement) {
      this.appointmentFormElement.nativeElement.reset();
      this.initializeForm();
      this.logger.log('Form reset via ViewChild');
    }
  }

  // ========== Helper Methods ==========

  getAppointmentsForDate(date: string): Appointment[] {
    return this.appointments.filter((apt) => apt.appointmentDate === date);
  }

  getTodayAppointments(): Appointment[] {
    const today = new Date().toISOString().split('T')[0];
    return this.getAppointmentsForDate(today);
  }

  getUpcomingAppointments(): Appointment[] {
    const today = new Date().toISOString().split('T')[0];
    return this.appointments.filter((apt) => apt.appointmentDate >= today);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Scheduled':
        return 'bg-primary';
      case 'Confirmed':
        return 'bg-success';
      case 'Completed':
        return 'bg-secondary';
      case 'Cancelled':
        return 'bg-danger';
      default:
        return 'bg-info';
    }
  }

  // Mock data for demonstration
  getMockAppointments(): Appointment[] {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 1,
        patientId: 1,
        patientName: 'John Doe',
        doctorName: this.currentDoctorName,
        appointmentDate: today,
        appointmentTime: '09:00',
        duration: 30,
        type: 'Consultation',
        status: 'Confirmed',
        notes: 'Regular checkup',
        roomNumber: '101',
      },
      {
        id: 2,
        patientId: 2,
        patientName: 'Jane Smith',
        doctorName: this.currentDoctorName,
        appointmentDate: today,
        appointmentTime: '10:30',
        duration: 45,
        type: 'Follow-up',
        status: 'Scheduled',
        notes: 'Diabetes follow-up',
        roomNumber: '102',
      },
    ];
  }
}
