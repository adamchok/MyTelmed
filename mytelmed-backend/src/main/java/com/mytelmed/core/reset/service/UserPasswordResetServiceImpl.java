package com.mytelmed.core.reset.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidCredentialsException;
import com.mytelmed.common.constant.AccountType;
import com.mytelmed.core.admin.entity.Admin;
import com.mytelmed.core.admin.service.AdminService;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.doctor.service.DoctorService;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.core.pharmacist.entity.Pharmacist;
import com.mytelmed.core.pharmacist.service.PharmacistService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class UserPasswordResetServiceImpl implements UserPasswordResetService {
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final PharmacistService pharmacistService;
    private final AdminService adminService;

    public UserPasswordResetServiceImpl(PatientService patientService,
                                       DoctorService doctorService,
                                       PharmacistService pharmacistService,
                                       AdminService adminService) {
        this.patientService = patientService;
        this.doctorService = doctorService;
        this.pharmacistService = pharmacistService;
        this.adminService = adminService;
    }

    @Override
    @Transactional(readOnly = true)
    public Account validateUserForPasswordReset(String email, String nric, AccountType userType) throws AppException {
        log.debug("Validating user for password reset - Email: {}, NRIC: {}, Type: {}", email, nric, userType);

        try {
            return switch (userType) {
                case PATIENT -> validatePatient(email, nric);
                case DOCTOR -> validateDoctor(email, nric);
                case PHARMACIST -> validatePharmacist(email, nric);
                case ADMIN -> validateAdmin(email, nric);
            };
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error validating user for password reset: {}", e.getMessage(), e);
            throw new AppException("Failed to validate user credentials");
        }
    }

    private Account validatePatient(String email, String nric) throws AppException {
        Patient patient = patientService.findPatientByEmail(email);

        if (!patient.getNric().equals(nric)) {
            throw new InvalidCredentialsException("Email or NRIC does not match system records");
        }

        return patient.getAccount();
    }

    private Account validateDoctor(String email, String nric) throws AppException {
        Doctor doctor = doctorService.findByEmail(email);

        if (!doctor.getNric().equals(nric)) {
            throw new InvalidCredentialsException("Email or NRIC does not match system records");
        }

        return doctor.getAccount();
    }

    private Account validatePharmacist(String email, String nric) throws AppException {
        Pharmacist pharmacist = pharmacistService.findByEmail(email);

        if (!pharmacist.getNric().equals(nric)) {
            throw new InvalidCredentialsException("Email or NRIC does not match system records");
        }

        return pharmacist.getAccount();
    }

    private Account validateAdmin(String email, String nric) throws AppException {
        Admin admin = adminService.findByEmail(email);

        if (!admin.getNric().equals(nric)) {
            throw new InvalidCredentialsException("Email or NRIC does not match system records");
        }

        return admin.getAccount();
    }
} 