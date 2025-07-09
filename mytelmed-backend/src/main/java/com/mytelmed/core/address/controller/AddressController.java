package com.mytelmed.core.address.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.address.dto.AddressDto;
import com.mytelmed.core.address.dto.RequestAddressDto;
import com.mytelmed.core.address.entity.Address;
import com.mytelmed.core.address.mapper.AddressMapper;
import com.mytelmed.core.address.service.AddressService;
import com.mytelmed.core.auth.entity.Account;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
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
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<AddressDto>> getAddressById(@PathVariable UUID addressId) {
        log.info("Received request to get address with ID: {}", addressId);
        Address address = addressService.findAddressById(addressId);
        return ResponseEntity.ok(ApiResponse.success(addressMapper.toDto(address)));
    }

    @GetMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<AddressDto>>> getAddressesByPatientAccount(@AuthenticationPrincipal Account account) {
        log.info("Received request to get all addresses for patient with ID: {}", account.getId());
        List<Address> addressList = addressService.findAddressListByPatientAccountId(account.getId());

        List<AddressDto> addressDtoList = addressList.stream()
                .map(addressMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(addressDtoList));
    }

    @GetMapping("/patient")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<AddressDto>>> getAddressesByPatientId(@RequestParam UUID patientId) {
        log.info("Received request to get all addresses for patient ID: {}", patientId);
        List<Address> addressList = addressService.findAddressListByPatientId(patientId);

        List<AddressDto> addressDtoList = addressList.stream()
                .map(addressMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(addressDtoList));
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> createAddressByAccount(
            @Valid @RequestBody RequestAddressDto request,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to create address for patient with account ID: {}", account.getId());
        addressService.createAddressByAccountId(account.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Address created successfully"));
    }

    @PutMapping("/{addressId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> updateAddressById(
            @PathVariable UUID addressId,
            @Valid @RequestBody RequestAddressDto request
    ) {
        log.info("Received request to update address with ID: {}", addressId);
        addressService.updateAddressById(addressId, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully"));
    }

    @DeleteMapping("/{addressId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> deleteAddressById(@PathVariable UUID addressId) {
        log.info("Received request to delete address with ID: {}", addressId);
        addressService.deleteAddressById(addressId);
        return ResponseEntity.ok(ApiResponse.success("Address deleted successfully"));
    }
}
