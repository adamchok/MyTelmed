export interface Department {
  id: string;
  name: string;
  shortName: string;
  description: string;
  imageUrl: string;
}

export interface Facility {
  id: number;
  name: string;
  address: string;
  state: string;
  city: string;
  type: string;
  telephone: string;
  imageUrl: string;
}

export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  facility: Facility;
  image: string;
  phone: string;
  email: string;
  description: string;
  availability?: { date: string; count: number; booking: 'none' | 'video' | 'physical' | 'both' }[];
}

export type BookingType = 'none' | 'video' | 'physical' | 'both';

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string;
  profileImage?: string;
  dateAdded: string;
  permissions: {
    appointmentBooking: boolean;
    appointmentManagement: boolean;
    viewMedicalRecords: boolean;
    managePrescriptions: boolean;
  };
}

export type Permission = 'appointmentBooking' | 'appointmentManagement' | 'viewMedicalRecords' | 'managePrescriptions';

export interface AppointmentDocument {
  id: string;
  name: string;
  type: 'medical_record' | 'prescription' | 'lab_result' | 'other';
  uploadDate: string;
  fileSize: string;
  fileUrl: string;
}

export interface PatientSymptom {
  id: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';
export type AppointmentMode = 'video' | 'physical';

export interface Appointment {
  id: string;
  doctorId: number;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string;
  facilityId: number;
  facilityName: string;
  facilityAddress: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number; // in minutes
  status: AppointmentStatus;
  mode: AppointmentMode;
  patientId: string;
  patientName: string;
  isForSelf: boolean;
  symptoms: PatientSymptom[];
  reason: string;
  documents: AppointmentDocument[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  department: string;
  author: string;
  imageUrl: string;
  featured: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface QA {
  id: number;
  question: string;
  answer: string;
  user: string;
  date: string;
}
