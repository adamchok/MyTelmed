package com.mytelmed.core.address.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.address.dto.AddressDto;
import com.mytelmed.core.address.dto.RequestAddressDto;
import com.mytelmed.core.address.entity.Address;
import com.mytelmed.core.address.mapper.AddressMapper;
import com.mytelmed.core.address.service.AddressService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


@Slf4j
@RestController
@RequestMapping("/api/v1/address")
public class AddressController {
    private final AddressService addressService;
    private final AddressMapper addressMapper;

    public AddressController(AddressService addressService, AddressMapper addressMapper) {
        this.addressService = addressService;
        this.addressMapper = addressMapper;
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<ApiResponse<AddressDto>> getAddressById(@PathVariable UUID addressId) {
        log.info("Received request to get address with ID: {}", addressId);
        Address address = addressService.getAddressById(addressId);
        return ResponseEntity.ok(ApiResponse.success(addressMapper.toDto(address)));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<List<AddressDto>>> getAddressesByPatientId(@PathVariable UUID patientId) {
        log.info("Received request to get all addresses for patient with ID: {}", patientId);
        List<Address> addresses = addressService.findAddressesByPatientId(patientId);

        List<AddressDto> addressResponses = addresses.stream()
                .map(addressMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(addressResponses));
    }

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse<Void>> createAddress(
            @PathVariable UUID patientId,
            @Valid @RequestBody RequestAddressDto request) {

        log.info("Received request to create address for patient with ID: {}", patientId);
        Optional<Address> createdAddress = addressService.createAddress(patientId, request);

        return createdAddress
                .map(address -> ResponseEntity.ok(ApiResponse.success("Address created successfully")))
                .orElseGet(() -> ResponseEntity.internalServerError().body(ApiResponse.failure("Failed to create address")));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> updateAddress(
            @PathVariable UUID addressId,
            @Valid @RequestBody RequestAddressDto request) {

        log.info("Received request to update address with ID: {}", addressId);
        Optional<Address> updatedAddress = addressService.updateAddress(addressId, request);

        return updatedAddress
                .map(address -> ResponseEntity.ok(ApiResponse.success("Address updated successfully")))
                .orElseGet(() -> ResponseEntity.internalServerError().body(ApiResponse.failure("Failed to update address")));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable UUID addressId) {
        log.info("Received request to delete address with ID: {}", addressId);

        if (!addressService.deleteAddress(addressId)) {
            return ResponseEntity.internalServerError().body(ApiResponse.failure("Failed to delete address"));
        }

        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully"));
    }
}
