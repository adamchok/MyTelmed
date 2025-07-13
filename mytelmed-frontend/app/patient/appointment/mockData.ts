import { Patient } from "@/app/api/patient/props";
import { AppointmentDto, AppointmentStatus, ConsultationMode } from "../../api/appointment/props";
import { DocumentType } from "../../api/props";
import { Doctor } from "@/app/api/doctor/props";

// Mock doctor data
const mockDoctors: Doctor[] = [
    {
        id: "doc-001",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@mytelmed.com",
        phone: "+65 9123 4567",
        gender: "FEMALE",
        dateOfBirth: "1985-03-15",
        profileImageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
        specialityList: ["Cardiology", "Internal Medicine"],
        languageList: ["English", "Mandarin"],
        qualifications: "MBBS, MD (Cardiology), FRCP (UK)",
        facility: {
            id: "facility-001",
            name: "Mount Elizabeth Medical Centre",
            facilityType: "HOSPITAL",
            address: "3 Mount Elizabeth",
            city: "Singapore",
            state: "Singapore",
            telephone: "+65 6737 2666",
            thumbnailUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=150&h=150&fit=crop",
        },
        nric: "S1234567A",
        enabled: true,
        createdAt: "2024-03-15T09:00:00Z",
        updatedAt: "2024-03-15T09:00:00Z",
    },
    {
        id: "doc-002",
        name: "Dr. Michael Chen",
        email: "michael.chen@mytelmed.com",
        phone: "+65 9234 5678",
        gender: "MALE",
        dateOfBirth: "1978-07-22",
        profileImageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
        specialityList: ["Dermatology", "Cosmetic Surgery"],
        languageList: ["English", "Mandarin", "Cantonese"],
        qualifications: "MBBS, MD (Dermatology), FAMS",
        facility: {
            id: "facility-002",
            name: "Gleneagles Hospital",
            facilityType: "HOSPITAL",
            address: "6A Napier Road",
            city: "Singapore",
            state: "Singapore",
            telephone: "+65 6470 5700",
            thumbnailUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=150&h=150&fit=crop",
        },
        nric: "S1234567A",
        enabled: true,
        createdAt: "2024-03-15T09:00:00Z",
        updatedAt: "2024-03-15T09:00:00Z",
    },
    {
        id: "doc-003",
        name: "Dr. Emily Wong",
        email: "emily.wong@mytelmed.com",
        phone: "+65 9345 6789",
        gender: "FEMALE",
        dateOfBirth: "1982-11-08",
        profileImageUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face",
        specialityList: ["Pediatrics", "General Practice"],
        languageList: ["English", "Mandarin", "Malay"],
        qualifications: "MBBS, MD (Pediatrics), MRCPCH",
        facility: {
            id: "facility-003",
            name: "Raffles Medical Group",
            facilityType: "CLINIC",
            address: "585 North Bridge Road",
            city: "Singapore",
            state: "Singapore",
            telephone: "+65 6311 1111",
            thumbnailUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=150&h=150&fit=crop",
        },
        nric: "S1234567A",
        enabled: true,
        createdAt: "2024-03-15T09:00:00Z",
        updatedAt: "2024-03-15T09:00:00Z",
    },
    {
        id: "doc-004",
        name: "Dr. David Tan",
        email: "david.tan@mytelmed.com",
        phone: "+65 9456 7890",
        gender: "MALE",
        dateOfBirth: "1975-05-12",
        profileImageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face",
        specialityList: ["Orthopedics", "Sports Medicine"],
        languageList: ["English", "Mandarin"],
        qualifications: "MBBS, MD (Orthopedics), FRCS (Orth)",
        facility: {
            id: "facility-004",
            name: "Singapore General Hospital",
            facilityType: "HOSPITAL",
            address: "Outram Road",
            city: "Singapore",
            state: "Singapore",
            telephone: "+65 6222 3322",
            thumbnailUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=150&h=150&fit=crop",
        },
        nric: "S1234567A",
        enabled: true,
        createdAt: "2024-03-15T09:00:00Z",
        updatedAt: "2024-03-15T09:00:00Z",
    },
];

// Mock patient data
const mockPatients: Patient[] = [
    {
        id: "patient-001",
        name: "John Smith",
        email: "john.smith@email.com",
        phone: "+65 8123 4567",
        gender: "MALE",
        dateOfBirth: "1990-01-15",
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        serialNumber: "1234567890",
        nric: "S1234567A",
        enabled: true,
        createdAt: "2024-03-15T09:00:00Z",
        updatedAt: "2024-03-15T09:00:00Z",
    },
    {
        id: "patient-002",
        name: "Emma Wilson",
        email: "emma.wilson@email.com",
        phone: "+65 8234 5678",
        gender: "FEMALE",
        dateOfBirth: "1988-06-20",
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        serialNumber: "1234567890",
        nric: "S1234567A",
        enabled: true,
        createdAt: "2024-03-15T09:00:00Z",
        updatedAt: "2024-03-15T09:00:00Z",
    },
    {
        id: "patient-003",
        name: "Alex Johnson",
        email: "alex.johnson@email.com",
        phone: "+65 8345 6789",
        gender: "MALE",
        dateOfBirth: "1995-03-10",
        profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        serialNumber: "1234567890",
        nric: "S1234567A",
        enabled: true,
        createdAt: "2024-03-15T09:00:00Z",
        updatedAt: "2024-03-15T09:00:00Z",
    },
];

// Mock appointment documents
const mockDocuments = [
    {
        id: "doc-attach-001",
        documentId: "doc-001",
        documentName: "Blood Test Results - March 2024",
        documentType: DocumentType.LAB_REPORT,
        documentUrl: "https://example.com/documents/blood-test-march-2024.pdf",
        documentSize: "245760",
        notes: "Recent blood work showing normal ranges",
        createdAt: "2024-03-15T10:30:00Z",
    },
    {
        id: "doc-attach-002",
        documentId: "doc-002",
        documentName: "Chest X-Ray Report",
        documentType: DocumentType.RADIOLOGY_REPORT,
        documentUrl: "https://example.com/documents/chest-xray-report.pdf",
        documentSize: "512000",
        notes: "Clear lungs, no abnormalities detected",
        createdAt: "2024-03-10T14:20:00Z",
    },
    {
        id: "doc-attach-003",
        documentId: "doc-003",
        documentName: "Previous Consultation Notes",
        documentType: DocumentType.CONSULTATION_NOTE,
        documentUrl: "https://example.com/documents/consultation-notes.pdf",
        documentSize: "128000",
        notes: "Follow-up from last month's visit",
        createdAt: "2024-02-28T09:15:00Z",
    },
    {
        id: "doc-attach-004",
        documentId: "doc-004",
        documentName: "ECG Results",
        documentType: DocumentType.DIAGNOSTIC_REPORT,
        documentUrl: "https://example.com/documents/ecg-results.pdf",
        documentSize: "768000",
        notes: "Normal sinus rhythm",
        createdAt: "2024-03-12T11:45:00Z",
    },
];

// Generate mock appointments
export const mockAppointments: AppointmentDto[] = [
    {
        id: "apt-001",
        patient: mockPatients[0],
        doctor: mockDoctors[0],
        appointmentDateTime: "2024-03-20T14:00:00Z",
        durationMinutes: 30,
        status: AppointmentStatus.CONFIRMED,
        consultationMode: ConsultationMode.VIRTUAL,
        patientNotes: "Experiencing chest pain and shortness of breath for the past week",
        doctorNotes: "Patient reports mild chest discomfort. Recommend ECG and blood work.",
        reasonForVisit: "Chest pain and shortness of breath",
        attachedDocuments: [mockDocuments[0], mockDocuments[3]],
        hasAttachedDocuments: true,
        createdAt: "2024-03-15T09:00:00Z",
        updatedAt: "2024-03-15T09:00:00Z",
    },
    {
        id: "apt-002",
        patient: mockPatients[1],
        doctor: mockDoctors[1],
        appointmentDateTime: "2024-03-21T10:30:00Z",
        durationMinutes: 45,
        status: AppointmentStatus.PENDING,
        consultationMode: ConsultationMode.PHYSICAL,
        patientNotes: "Skin rash on arms and legs, itchy and red patches",
        reasonForVisit: "Skin rash and itching",
        attachedDocuments: [],
        hasAttachedDocuments: false,
        createdAt: "2024-03-16T11:30:00Z",
        updatedAt: "2024-03-16T11:30:00Z",
    },
    {
        id: "apt-003",
        patient: mockPatients[2],
        doctor: mockDoctors[2],
        appointmentDateTime: "2024-03-19T16:00:00Z",
        durationMinutes: 30,
        status: AppointmentStatus.READY_FOR_CALL,
        consultationMode: ConsultationMode.VIRTUAL,
        patientNotes: "Fever and cough for 3 days, no improvement with over-the-counter medication",
        reasonForVisit: "Fever and persistent cough",
        attachedDocuments: [mockDocuments[1]],
        hasAttachedDocuments: true,
        createdAt: "2024-03-14T13:45:00Z",
        updatedAt: "2024-03-19T15:30:00Z",
    },
    {
        id: "apt-004",
        patient: mockPatients[0],
        doctor: mockDoctors[3],
        appointmentDateTime: "2024-03-18T11:00:00Z",
        durationMinutes: 60,
        status: AppointmentStatus.COMPLETED,
        consultationMode: ConsultationMode.PHYSICAL,
        patientNotes: "Knee pain after running, difficulty walking up stairs",
        doctorNotes: "Diagnosed with mild patellar tendinitis. Prescribed rest, ice, and physical therapy exercises.",
        reasonForVisit: "Knee pain and mobility issues",
        completedAt: "2024-03-18T12:00:00Z",
        attachedDocuments: [mockDocuments[2]],
        hasAttachedDocuments: true,
        createdAt: "2024-03-10T08:15:00Z",
        updatedAt: "2024-03-18T12:00:00Z",
    },
    {
        id: "apt-005",
        patient: mockPatients[1],
        doctor: mockDoctors[0],
        appointmentDateTime: "2024-03-22T09:00:00Z",
        durationMinutes: 30,
        status: AppointmentStatus.IN_PROGRESS,
        consultationMode: ConsultationMode.VIRTUAL,
        patientNotes: "Follow-up for blood pressure management",
        reasonForVisit: "Blood pressure follow-up",
        attachedDocuments: [mockDocuments[0]],
        hasAttachedDocuments: true,
        createdAt: "2024-03-17T10:00:00Z",
        updatedAt: "2024-03-22T09:15:00Z",
    },
    {
        id: "apt-006",
        patient: mockPatients[2],
        doctor: mockDoctors[1],
        appointmentDateTime: "2024-03-17T14:30:00Z",
        durationMinutes: 45,
        status: AppointmentStatus.CANCELLED,
        consultationMode: ConsultationMode.PHYSICAL,
        patientNotes: "Acne treatment consultation",
        reasonForVisit: "Acne treatment",
        cancellationReason: "Patient requested cancellation due to schedule conflict",
        cancelledBy: "PATIENT",
        attachedDocuments: [],
        hasAttachedDocuments: false,
        createdAt: "2024-03-12T15:20:00Z",
        updatedAt: "2024-03-16T16:45:00Z",
    },
    {
        id: "apt-007",
        patient: mockPatients[0],
        doctor: mockDoctors[2],
        appointmentDateTime: "2024-03-25T13:00:00Z",
        durationMinutes: 30,
        status: AppointmentStatus.PENDING,
        consultationMode: ConsultationMode.VIRTUAL,
        patientNotes: "Annual health check-up",
        reasonForVisit: "Annual health check-up",
        attachedDocuments: [],
        hasAttachedDocuments: false,
        createdAt: "2024-03-18T12:00:00Z",
        updatedAt: "2024-03-18T12:00:00Z",
    },
    {
        id: "apt-008",
        patient: mockPatients[1],
        doctor: mockDoctors[3],
        appointmentDateTime: "2024-03-23T15:30:00Z",
        durationMinutes: 60,
        status: AppointmentStatus.PENDING,
        consultationMode: ConsultationMode.PHYSICAL,
        patientNotes: "Back pain after lifting heavy objects",
        reasonForVisit: "Back pain and muscle strain",
        attachedDocuments: [],
        hasAttachedDocuments: false,
        createdAt: "2024-03-19T09:30:00Z",
        updatedAt: "2024-03-19T09:30:00Z",
    },
    {
        id: "apt-009",
        patient: mockPatients[2],
        doctor: mockDoctors[0],
        appointmentDateTime: "2024-03-24T10:00:00Z",
        durationMinutes: 30,
        status: AppointmentStatus.NO_SHOW,
        consultationMode: ConsultationMode.VIRTUAL,
        patientNotes: "Headache and dizziness",
        reasonForVisit: "Headache and dizziness",
        attachedDocuments: [],
        hasAttachedDocuments: false,
        createdAt: "2024-03-20T14:00:00Z",
        updatedAt: "2024-03-24T10:30:00Z",
    },
    {
        id: "apt-010",
        patient: mockPatients[0],
        doctor: mockDoctors[1],
        appointmentDateTime: "2024-03-26T16:00:00Z",
        durationMinutes: 45,
        status: AppointmentStatus.PENDING,
        consultationMode: ConsultationMode.PHYSICAL,
        patientNotes: "Mole check and skin examination",
        reasonForVisit: "Skin examination and mole check",
        attachedDocuments: [],
        hasAttachedDocuments: false,
        createdAt: "2024-03-21T11:15:00Z",
        updatedAt: "2024-03-21T11:15:00Z",
    },
];

// Helper function to get appointments by status
export const getAppointmentsByStatus = (status: AppointmentStatus): AppointmentDto[] => {
    return mockAppointments.filter((appointment) => appointment.status === status);
};

// Helper function to get appointments by consultation mode
export const getAppointmentsByMode = (mode: ConsultationMode): AppointmentDto[] => {
    return mockAppointments.filter((appointment) => appointment.consultationMode === mode);
};

// Helper function to get appointments for a specific date
export const getAppointmentsByDate = (date: string): AppointmentDto[] => {
    return mockAppointments.filter((appointment) => appointment.appointmentDateTime.startsWith(date.split("T")[0]));
};

// Helper function to get upcoming appointments
export const getUpcomingAppointments = (): AppointmentDto[] => {
    const now = new Date();
    return mockAppointments.filter(
        (appointment) =>
            new Date(appointment.appointmentDateTime) > now &&
            appointment.status !== AppointmentStatus.CANCELLED &&
            appointment.status !== AppointmentStatus.NO_SHOW
    );
};

// Helper function to get past appointments
export const getPastAppointments = (): AppointmentDto[] => {
    const now = new Date();
    return mockAppointments.filter((appointment) => new Date(appointment.appointmentDateTime) < now);
};

// Helper function to get today's appointments
export const getTodayAppointments = (): AppointmentDto[] => {
    const today = new Date().toISOString().split("T")[0];
    return getAppointmentsByDate(today);
};

export default mockAppointments;
