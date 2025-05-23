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
        log.info("Address service initialized");
    }

    public List<Address> findAddressesByPatientId(UUID patientId) {
        log.debug("Finding addresses for patient with ID: {}", patientId);
        return addressRepository.findByPatientId(patientId);
    }

    public Address getAddressById(UUID addressId) {
        log.debug("Getting address with ID: {}", addressId);
        return addressRepository.findById(addressId)
                .orElseThrow(() -> {
                    log.warn("Address not found with ID: {}", addressId);
                    return new ResourceNotFoundException("Address not found");
                });
    }

    @Transactional
    public Optional<Address> createAddress(UUID patientId, RequestAddressDto request) {
        log.debug("Creating new address for patient with ID: {}", patientId);

        try {
            Patient patient = patientService.getPatientById(patientId);

            Address address = Address.builder()
                    .address(request.address())
                    .postcode(request.postcode())
                    .city(request.city())
                    .state(request.state())
                    .patient(patient)
                    .build();

            Address savedAddress = addressRepository.save(address);
            log.info("Created new address with ID: {} for patient with ID: {}", savedAddress.getId(), patientId);

            return Optional.of(savedAddress);
        } catch (Exception e) {
            log.error("Unexpected error while creating address for patient: {}", patientId, e);
            return Optional.empty();
        }
    }

    @Transactional
    public Optional<Address> updateAddress(UUID addressId, RequestAddressDto request) {
        log.debug("Updating address with ID: {}", addressId);

        try {
            Address existingAddress = addressRepository.findById(addressId)
                    .orElseThrow(() -> {
                        log.warn("Cannot update address - not found with ID: {}", addressId);
                        return new ResourceNotFoundException("Address not found");
                    });

            existingAddress.setAddress(request.address());
            existingAddress.setPostcode(request.postcode());
            existingAddress.setCity(request.city());
            existingAddress.setState(request.state());

            Address updatedAddress = addressRepository.save(existingAddress);
            log.info("Updated address with ID: {}", addressId);

            return Optional.of(updatedAddress);
        } catch (Exception e) {
            log.error("Unexpected error while updating address: {}", addressId, e);
            return Optional.empty();
        }
    }

    @Transactional
    public boolean deleteAddress(UUID addressId) {
        log.debug("Deleting address with ID: {}", addressId);

        try {
            if (!addressRepository.existsById(addressId)) {
                log.warn("Cannot delete address - not found with ID: {}", addressId);
                throw new ResourceNotFoundException("Address not found");
            }

            addressRepository.deleteById(addressId);
            log.info("Deleted address with ID: {}", addressId);

            return true;
        } catch (Exception e) {
            log.error("Unexpected error while deleting address: {}", addressId, e);
            return false;
        }
    }
}
