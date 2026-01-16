import { Component, Input, Output, EventEmitter, HostListener, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSlot } from '../../../models/appointment.model';

/**
 * TimeSlot Component - Demonstrates @HostListener and @HostBinding
 */
@Component({
  selector: 'app-time-slot',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="time-slot-content">
      <span class="time">{{ slot.time }}</span>
      <span *ngIf="!slot.available" class="badge bg-danger ms-2">Booked</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: 10px;
        border: 2px solid #dee2e6;
        border-radius: 5px;
        text-align: center;
        transition: all 0.3s;
      }
      .time {
        font-weight: 600;
      }
    `,
  ],
})
export class TimeSlotComponent {
  @Input() slot!: TimeSlot;
  @Output() slotClicked = new EventEmitter<TimeSlot>();

  // ========== @HostBinding Demonstrations ==========
  @HostBinding('class.available') get isAvailable() {
    return this.slot.available;
  }
  @HostBinding('class.booked') get isBooked() {
    return !this.slot.available;
  }
  @HostBinding('class.selected') isSelected = false;
  @HostBinding('style.cursor') get cursor() {
    return this.slot.available ? 'pointer' : 'not-allowed';
  }
  @HostBinding('style.opacity') get opacity() {
    return this.slot.available ? '1' : '0.5';
  }
  @HostBinding('style.backgroundColor') bgColor = '#fff';
  @HostBinding('style.transform') transform = 'scale(1)';

  // ========== @HostListener Demonstrations ==========
  @HostListener('click')
  onClick(): void {
    if (this.slot.available) {
      this.isSelected = !this.isSelected;
      this.slotClicked.emit(this.slot);
      console.log(`⏰ Time slot clicked: ${this.slot.time}`);
    }
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.slot.available) {
      this.bgColor = '#e7f3ff';
      this.transform = 'scale(1.05)';
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.bgColor = '#fff';
    this.transform = 'scale(1)';
  }

  @HostListener('dblclick')
  onDoubleClick(): void {
    if (this.slot.available) {
      console.log(`⚡ Double-clicked on slot: ${this.slot.time}`);
    }
  }
}
