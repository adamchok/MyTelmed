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
import java.util.UUID;


@Slf4j
@Service
public class UserEmailResetServiceImpl implements UserEmailResetService {
    private final PatientService patientService;
    private final DoctorService doctorService;
    private final PharmacistService pharmacistService;
    private final AdminService adminService;

    public UserEmailResetServiceImpl(PatientService patientService,
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
    public Account validateUserForEmailReset(String nric, String phone, String serialNumber, String name, AccountType userType) throws AppException {
        log.debug("Validating user for email reset - NRIC: {}, Type: {}", nric, userType);

        try {
            return switch (userType) {
                case PATIENT -> validatePatient(nric, phone, serialNumber, name);
                case DOCTOR -> validateDoctor(nric, phone, name);
                case PHARMACIST -> validatePharmacist(nric, phone, name);
                case ADMIN -> validateAdmin(nric, phone, name);
            };
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error validating user for email reset: {}", e.getMessage(), e);
            throw new AppException("Failed to validate user credentials");
        }
    }

    @Override
    @Transactional
    public void resetEmailByAccountId(UUID accountId, String newEmail, AccountType userType) throws AppException {
        log.debug("Resetting email for account ID: {}, Type: {}", accountId, userType);

        try {
            switch (userType) {
                case PATIENT:
                    patientService.resetEmailByAccountId(accountId, newEmail);
                    break;
                case DOCTOR:
                    doctorService.resetEmailByAccountId(accountId, newEmail);
                    break;
                case PHARMACIST:
                    pharmacistService.resetEmailByAccountId(accountId, newEmail);
                    break;
                case ADMIN:
                    adminService.resetEmailByAccountId(accountId, newEmail);
                    break;
                default:
                    throw new AppException("Invalid user type: " + userType);
            }
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error resetting email: {}", e.getMessage(), e);
            throw new AppException("Failed to reset email");
        }
    }

    private Account validatePatient(String nric, String phone, String serialNumber, String name) throws AppException {
        Patient patient = patientService.findPatientByNric(nric);

        if (!patient.getName().equals(name)) {
            throw new InvalidCredentialsException("Full name does not match system records: " + name);
        } else if (!patient.getPhone().equals(phone)) {
            throw new InvalidCredentialsException("Phone does not match system records: " + phone);
        } else if (!patient.getSerialNumber().equals(serialNumber)) {
            throw new InvalidCredentialsException("Serial number does not match system records: " + serialNumber);
        }

        return patient.getAccount();
    }

    private Account validateDoctor(String nric, String phone, String name) throws AppException {
        Doctor doctor = doctorService.findByNric(nric);

        if (!doctor.getName().equals(name)) {
            throw new InvalidCredentialsException("Full name does not match system records: " + name);
        } else if (!doctor.getPhone().equals(phone)) {
            throw new InvalidCredentialsException("Phone does not match system records: " + phone);
        }

        return doctor.getAccount();
    }

    private Account validatePharmacist(String nric, String phone, String name) throws AppException {
        Pharmacist pharmacist = pharmacistService.findByNric(nric);

        if (!pharmacist.getName().equals(name)) {
            throw new InvalidCredentialsException("Full name does not match system records: " + name);
        } else if (!pharmacist.getPhone().equals(phone)) {
            throw new InvalidCredentialsException("Phone does not match system records: " + phone);
        }

        return pharmacist.getAccount();
    }

    private Account validateAdmin(String nric, String phone, String name) throws AppException {
        Admin admin = adminService.findByNric(nric);

        if (!admin.getName().equals(name)) {
            throw new InvalidCredentialsException("Full name does not match system records: " + name);
        } else if (!admin.getPhone().equals(phone)) {
            throw new InvalidCredentialsException("Phone does not match system records: " + phone);
        }

        return admin.getAccount();
    }
}
