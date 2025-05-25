package com.mytelmed.core.address.service;

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
import java.util.Optional;
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
    public List<Address> findAddressesByPatientAccountId(UUID accountId) {
        log.debug("Fetching addresses for patient with account ID: {}", accountId);
        return addressRepository.findByPatientAccountId(accountId);
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
    public Optional<Address> createAddressByAccountId(UUID accountId, RequestAddressDto request) throws ResourceNotFoundException {
        log.debug("Creating new address for patient with account ID: {}", accountId);

        try {
            Patient patient = patientService.getPatientByAccountId(accountId);

            Address address = Address.builder()
                    .address(request.address())
                    .postcode(request.postcode())
                    .city(request.city())
                    .state(request.state())
                    .patient(patient)
                    .build();

            Address savedAddress = addressRepository.save(address);
            log.info("Created new address {} for patient {}", savedAddress.getId(), patient.getId());

            return Optional.of(savedAddress);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while creating address for patient with account ID: {}", accountId, e);
            return Optional.empty();
        }
    }

    @Transactional
    public Optional<Address> updateAddress(UUID addressId, RequestAddressDto request) throws ResourceNotFoundException {
        log.debug("Updating address with ID: {}", addressId);

        try {
            Address existingAddress = findAddressById(addressId);

            existingAddress.setAddress(request.address());
            existingAddress.setPostcode(request.postcode());
            existingAddress.setCity(request.city());
            existingAddress.setState(request.state());

            Address updatedAddress = addressRepository.save(existingAddress);
            log.info("Updated address with ID: {}", addressId);

            return Optional.of(updatedAddress);
        }  catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while updating address: {}", addressId, e);
            return Optional.empty();
        }
    }

    @Transactional
    public boolean deleteAddress(UUID addressId) throws ResourceNotFoundException {
        log.debug("Deleting address with ID: {}", addressId);

        try {
            Address existingAddress = findAddressById(addressId);

            addressRepository.delete(existingAddress);
            log.info("Deleted address with ID: {}", addressId);

            return true;
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while deleting address: {}", addressId, e);
            return false;
        }
    }
}
