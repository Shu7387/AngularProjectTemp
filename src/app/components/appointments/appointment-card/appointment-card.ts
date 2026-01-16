import { Component, Input, Output, EventEmitter, ContentChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../../models/appointment.model';

/**
 * AppointmentCard Component - Demonstrates ContentChild and ng-content
 */
@Component({
  selector: 'app-appointment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-card.html',
  styleUrls: ['./appointment-card.css'],
})
export class AppointmentCardComponent {
  @Input() appointment!: Appointment;
  @Output() cardClicked = new EventEmitter<Appointment>();

  // Demonstrates ContentChild - query projected content
  @ContentChild('cardAction') cardAction?: ElementRef;

  isHighlighted = false;

  ngAfterContentInit(): void {
    if (!this.cardAction) {
      // Projected element with #cardAction was not provided
      return;
    }

    // Example 1: Read / set attributes
    this.cardAction.nativeElement.title = 'Click to trigger card action';

    // Example 2: Add an event listener (remember to remove it if needed)
    const handler = () => {
      console.log('Projected action clicked!');
      // ...your logic (emit event, highlight, etc.)
    };

    this.cardAction.nativeElement.addEventListener('click', handler);

    // If you add listeners, consider storing and removing them in ngOnDestroy
    // to avoid leaks (especially if the projected content changes).
  }

  highlight(): void {
    this.isHighlighted = true;
    setTimeout(() => (this.isHighlighted = false), 2000);
  }

  getCardClass(): string {
    return `border-${this.getColorForType()}`;
  }

  getColorForType(): string {
    switch (this.appointment.type) {
      case 'Emergency':
        return 'danger';
      case 'Surgery':
        return 'warning';
      case 'Follow-up':
        return 'info';
      default:
        return 'primary';
    }
  }

  getStatusClass(): string {
    switch (this.appointment.status) {
      case 'Confirmed':
        return 'bg-success';
      case 'Completed':
        return 'bg-secondary';
      case 'Cancelled':
        return 'bg-danger';
      default:
        return 'bg-primary';
    }
  }

  onClick(): void {
    this.cardClicked.emit(this.appointment);
  }
}
