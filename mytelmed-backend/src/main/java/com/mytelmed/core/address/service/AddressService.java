package com.mytelmed.core.address.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.ResourceNotFoundException;
import com.mytelmed.core.address.dto.RequestAddressDto;
import com.mytelmed.core.address.entity.Address;
import com.mytelmed.core.address.repository.AddressRepository;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;


@Slf4j
@Service
public class AddressService {
    private final AddressRepository addressRepository;
    private final PatientService patientService;

    public AddressService(AddressRepository addressRepository, PatientService patientService) {
        this.addressRepository = addressRepository;
        this.patientService = patientService;
    }

    @Transactional(readOnly = true)
    public List<Address> findAddressListByPatientAccountId(UUID accountId) throws AppException {
        log.debug("Fetching addresses for patient with account ID: {}", accountId);

        try {
            return addressRepository.findByPatientAccountId(accountId);
        } catch (Exception e) {
            log.error("Unexpected error while fetching addresses for patient with account ID: {}", accountId, e);
            throw new AppException("Failed to fetch addresses");
        }
    }

    @Transactional(readOnly = true)
    public Address findAddressById(UUID addressId) throws ResourceNotFoundException {
        log.debug("Fetching address with ID: {}", addressId);
        return addressRepository.findById(addressId)
                .orElseThrow(() -> {
                    log.warn("Address not found with ID: {}", addressId);
                    return new ResourceNotFoundException("Address not found");
                });
    }

    @Transactional
    public void createAddressByAccountId(UUID accountId, RequestAddressDto request) throws AppException {
        log.debug("Creating new address for patient with account ID: {}", accountId);

        try {
            Patient patient = patientService.findPatientByAccountId(accountId);

            Address address = Address.builder()
                    .address(request.address())
                    .postcode(request.postcode())
                    .city(request.city())
                    .state(request.state())
                    .patient(patient)
                    .build();

            Address savedAddress = addressRepository.save(address);
            log.info("Created new address {} for patient {}", savedAddress.getId(), patient.getId());
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating address for patient with account ID: {}", accountId, e);
            throw new AppException("Failed to create address");
        }
    }

    @Transactional
    public void updateAddressById(UUID addressId, RequestAddressDto request) throws AppException {
        log.debug("Updating address with ID: {}", addressId);

        try {
            Address existingAddress = findAddressById(addressId);

            existingAddress.setAddress(request.address());
            existingAddress.setPostcode(request.postcode());
            existingAddress.setCity(request.city());
            existingAddress.setState(request.state());

            Address updatedAddress = addressRepository.save(existingAddress);
            log.info("Updated address with ID: {}", addressId);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating address: {}", addressId, e);
            throw new AppException("Failed to update address");
        }
    }

    @Transactional
    public void deleteAddressById(UUID addressId) throws AppException {
        log.debug("Deleting address with ID: {}", addressId);

        try {
            Address existingAddress = findAddressById(addressId);

            addressRepository.delete(existingAddress);
            log.info("Deleted address with ID: {}", addressId);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while deleting address: {}", addressId, e);
            throw new AppException("Failed to delete address");
        }
    }
}
