export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Patient {
  id: number | string;
  firstName: string;
  lastName: string;
  name?: string; // Computed field (firstName + lastName)
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  bloodGroup: string;
  status: string;
  lastVisit: string;
  medicalHistory: string;
  allergies: string[];
  currentMedications: string[];
  currentMedication?: string; // Single medication field for edit form
  admissionDate?: string; // Admission date
  emergencyContact?: EmergencyContact;
}

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    dateOfBirth: '1985-03-15',
    gender: 'Male',
    email: 'john.doe@email.com',
    phone: '5550101000',
    address: '123 Main St, New York, NY 10001',
    bloodGroup: 'O+',
    status: 'Active',
    lastVisit: '2024-11-10',
    admissionDate: '2024-01-15',
    medicalHistory: 'Hypertension, managed with medication',
    allergies: ['Penicillin', 'Peanuts'],
    currentMedications: ['Lisinopril 10mg', 'Aspirin 81mg'],
    currentMedication: 'Lisinopril 10mg, Aspirin 81mg',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    name: 'Jane Smith',
    dateOfBirth: '1990-07-22',
    gender: 'Female',
    email: 'jane.smith@email.com',
    phone: '5550102000',
    address: '456 Oak Ave, Los Angeles, CA 90001',
    bloodGroup: 'A+',
    status: 'Active',
    lastVisit: '2024-11-12',
    admissionDate: '2024-03-20',
    medicalHistory: 'Type 2 Diabetes, controlled with diet and medication',
    allergies: ['Sulfa drugs'],
    currentMedications: ['Metformin 500mg', 'Atorvastatin 20mg'],
    currentMedication: 'Metformin 500mg, Atorvastatin 20mg',
  },
  {
    id: 3,
    firstName: 'Robert',
    lastName: 'Johnson',
    name: 'Robert Johnson',
    dateOfBirth: '1978-12-05',
    gender: 'Male',
    email: 'robert.j@email.com',
    phone: '5550103000',
    address: '789 Pine Rd, Chicago, IL 60601',
    bloodGroup: 'B+',
    status: 'Critical',
    lastVisit: '2024-11-15',
    admissionDate: '2024-11-10',
    medicalHistory: 'Recent cardiac event, under close monitoring',
    allergies: ['Latex'],
    currentMedications: ['Warfarin 5mg', 'Metoprolol 50mg', 'Clopidogrel 75mg'],
    currentMedication: 'Warfarin 5mg, Metoprolol 50mg, Clopidogrel 75mg',
  },
  {
    id: 4,
    firstName: 'Emily',
    lastName: 'Davis',
    name: 'Emily Davis',
    dateOfBirth: '1995-05-18',
    gender: 'Female',
    email: 'emily.davis@email.com',
    phone: '5550104000',
    address: '321 Elm St, Houston, TX 77001',
    bloodGroup: 'AB+',
    status: 'Active',
    lastVisit: '2024-11-08',
    admissionDate: '2024-05-12',
    medicalHistory: 'Asthma, well-controlled',
    allergies: ['Dust mites'],
    currentMedications: ['Albuterol inhaler', 'Fluticasone inhaler'],
    currentMedication: 'Albuterol inhaler, Fluticasone inhaler',
  },
  {
    id: 5,
    firstName: 'Michael',
    lastName: 'Brown',
    name: 'Michael Brown',
    dateOfBirth: '1982-09-30',
    gender: 'Male',
    email: 'michael.brown@email.com',
    phone: '5550105000',
    address: '654 Maple Dr, Phoenix, AZ 85001',
    bloodGroup: 'O-',
    status: 'Inactive',
    lastVisit: '2024-08-20',
    admissionDate: '2024-02-10',
    medicalHistory: 'No significant medical history',
    allergies: [],
    currentMedications: [],
    currentMedication: '',
  },
  {
    id: 6,
    firstName: 'Sarah',
    lastName: 'Wilson',
    name: 'Sarah Wilson',
    dateOfBirth: '1988-11-12',
    gender: 'Female',
    email: 'sarah.wilson@email.com',
    phone: '5550106000',
    address: '987 Cedar Ln, Philadelphia, PA 19101',
    bloodGroup: 'A-',
    status: 'Active',
    lastVisit: '2024-11-14',
    admissionDate: '2024-06-05',
    medicalHistory: 'Migraine headaches, episodic',
    allergies: ['Iodine'],
    currentMedications: ['Sumatriptan 50mg PRN'],
    currentMedication: 'Sumatriptan 50mg PRN',
  },
];
