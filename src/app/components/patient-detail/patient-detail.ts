import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Patient } from '../../models/patient.model';
import { PatientStatusPipe } from '../../pipes/patient-status-pipe';
import { AgeCalculatorPipe } from '../../pipes/age-calculator-pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-patient-detail',
  imports: [CommonModule, PatientStatusPipe, AgeCalculatorPipe, RouterLink],
  templateUrl: './patient-detail.html',
  styleUrl: './patient-detail.css',
})
export class PatientDetailComponent implements OnInit, OnChanges {
  // Input property binding - receiving data from parent
  @Input() patient!: Patient;

  // Output event binding - sending events to parent
  @Output() closeDetail = new EventEmitter<void>();

  constructor() {
    console.log('PatientDetailComponent: Constructor called');
  }

  ngOnInit(): void {
    console.log('PatientDetailComponent: ngOnInit - Patient loaded:', this.patient);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patient']) {
      console.log(
        'PatientDetailComponent: Patient changed from',
        changes['patient'].previousValue,
        'to',
        changes['patient'].currentValue
      );
    }
  }

  // Event binding method - close detail view
  onClose(): void {
    console.log('PatientDetailComponent: Closing detail view');
    this.closeDetail.emit();
  }

  // Get status badge class
  getStatusBadgeClass(status: string): string {
    switch (status) {
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
}
