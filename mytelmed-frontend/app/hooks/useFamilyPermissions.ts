import { useState, useEffect } from "react";
import { FamilyMemberApi } from "@/app/api/family";
import { FamilyMember } from "@/app/api/family/props";
import PatientApi from "@/app/api/patient";
import { Patient } from "@/app/api/patient/props";

export interface FamilyPermissionContext {
    currentPatient: Patient | null;
    authorizedPatients: Patient[];
    familyMembers: FamilyMember[];
    loading: boolean;
    error: string | null;
    canManageBilling: (patientId: string) => boolean;
    canViewAppointments: (patientId: string) => boolean;
    canManageAppointments: (patientId: string) => boolean;
    canViewMedicalRecords: (patientId: string) => boolean;
    canViewPrescriptions: (patientId: string) => boolean;
    canManagePrescriptions: (patientId: string) => boolean;
    canViewBilling: (patientId: string) => boolean;

    // Helper methods for common combinations
    getAuthorizedPatientsForAppointments: () => Patient[];
    getAuthorizedPatientsForMedicalRecords: () => Patient[];
    getAuthorizedPatientsForBilling: () => Patient[];
    getAuthorizedPatientsForPrescriptions: () => Patient[];
    getPatientOption: (patientId: string) => { id: string; name: string; relationship: string } | null;
    refresh: () => Promise<void>;
}

export const useFamilyPermissions = (): FamilyPermissionContext => {
    const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
    const [authorizedPatients, setAuthorizedPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPermissions = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load current patient profile
            const patientResponse = await PatientApi.getPatientProfile();
            if (patientResponse.data.isSuccess && patientResponse.data.data) {
                const patient = patientResponse.data.data;
                setCurrentPatient(patient);
                setAuthorizedPatients([patient]); // Start with self
            }

            // Load family members
            try {
                const familyResponse = await FamilyMemberApi.getPatientsByMemberAccount();
                if (familyResponse.data.isSuccess && familyResponse.data.data) {
                    const members = familyResponse.data.data;
                    setFamilyMembers(members);

                    // Add family members with valid permissions to authorized patients
                    const familyPatients = members
                        .filter((member) => !member.pending && member.patient)
                        .map((member) => member.patient!)
                        .filter((patient) => patient != null);

                    setAuthorizedPatients((prev) => {
                        // Avoid duplicates by filtering out existing patients
                        const existingIds = prev.map((p) => p.id);
                        const newPatients = familyPatients.filter((p) => !existingIds.includes(p.id));
                        return [...prev, ...newPatients];
                    });
                }
            } catch (familyError) {
                console.warn("Failed to load family members:", familyError);
                // Don't set error since current patient is still available
            }
        } catch (error: any) {
            console.error("Error loading family permissions:", error);
            setError(error.response?.data?.message || error.message || "Failed to load permissions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPermissions();
    }, []);

    const canManageBilling = (patientId: string): boolean => {
        // Current patient can always manage their own billing
        if (currentPatient?.id === patientId) {
            return true;
        }

        // Check if family member has billing management permission
        const familyMember = familyMembers.find((member) => member.patient?.id === patientId);
        return familyMember?.canManageBilling || false;
    };

    const canViewAppointments = (patientId: string): boolean => {
        // Current patient can always view their own appointments
        if (currentPatient?.id === patientId) {
            return true;
        }

        // Check if family member has view appointments permission
        const familyMember = familyMembers.find((member) => member.patient?.id === patientId);
        return familyMember?.canViewAppointments || false;
    };

    const canManageAppointments = (patientId: string): boolean => {
        // Current patient can always manage their own appointments
        if (currentPatient?.id === patientId) {
            return true;
        }

        // Check if family member has manage appointments permission
        const familyMember = familyMembers.find((member) => member.patient?.id === patientId);
        return familyMember?.canManageAppointments || false;
    };

    const canViewMedicalRecords = (patientId: string): boolean => {
        // Current patient can always view their own medical records
        if (currentPatient?.id === patientId) {
            return true;
        }

        // Check if family member has view medical records permission
        const familyMember = familyMembers.find((member) => member.patient?.id === patientId);
        return familyMember?.canViewMedicalRecords || false;
    };

    const canViewPrescriptions = (patientId: string): boolean => {
        // Current patient can always view their own prescriptions
        if (currentPatient?.id === patientId) {
            return true;
        }

        // Check if family member has view prescriptions permission
        const familyMember = familyMembers.find((member) => member.patient?.id === patientId);
        return familyMember?.canViewPrescriptions || false;
    };

    const canManagePrescriptions = (patientId: string): boolean => {
        // Current patient can always manage their own prescriptions
        if (currentPatient?.id === patientId) {
            return true;
        }

        // Check if family member has manage prescriptions permission
        const familyMember = familyMembers.find((member) => member.patient?.id === patientId);
        return familyMember?.canManagePrescriptions || false;
    };

    const canViewBilling = (patientId: string): boolean => {
        // Current patient can always view their own billing
        if (currentPatient?.id === patientId) {
            return true;
        }

        // Check if family member has view billing permission
        const familyMember = familyMembers.find((member) => member.patient?.id === patientId);
        return familyMember?.canViewBilling || false;
    };

    // Helper methods for common combinations
    const getAuthorizedPatientsForAppointments = (): Patient[] => {
        return authorizedPatients.filter((patient) => canViewAppointments(patient.id) && canManageAppointments(patient.id));
    };

    const getAuthorizedPatientsForMedicalRecords = (): Patient[] => {
        return authorizedPatients.filter((patient) => canViewMedicalRecords(patient.id));
    };

    const getAuthorizedPatientsForBilling = (): Patient[] => {
        return authorizedPatients.filter((patient) => canViewBilling(patient.id) || canManageBilling(patient.id));
    };

    const getAuthorizedPatientsForPrescriptions = (): Patient[] => {
        return authorizedPatients.filter((patient) => canViewPrescriptions(patient.id));
    };

    const getPatientOption = (patientId: string): { id: string; name: string; relationship: string } | null => {
        if (currentPatient?.id === patientId) {
            return {
                id: currentPatient.id,
                name: "You",
                relationship: "You",
            };
        }

        const familyMember = familyMembers.find((member) => member.patient?.id === patientId);
        if (familyMember?.patient) {
            return {
                id: familyMember.patient.id,
                name: familyMember.patient.name,
                relationship: familyMember.relationship,
            };
        }

        return null;
    };

    const refresh = async () => {
        await loadPermissions();
    };

    return {
        currentPatient,
        authorizedPatients,
        familyMembers,
        loading,
        error,
        canManageBilling,
        canViewAppointments,
        canManageAppointments,
        canViewMedicalRecords,
        canViewPrescriptions,
        canManagePrescriptions,
        canViewBilling,
        getAuthorizedPatientsForAppointments,
        getAuthorizedPatientsForMedicalRecords,
        getAuthorizedPatientsForBilling,
        getAuthorizedPatientsForPrescriptions,
        getPatientOption,
        refresh,
    };
};
