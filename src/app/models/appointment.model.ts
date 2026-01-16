export interface Appointment {
  id: number;
  patientId: number | string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number; // in minutes
  type: 'Consultation' | 'Follow-up' | 'Emergency' | 'Surgery';
  status: 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  roomNumber?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: number;
}
