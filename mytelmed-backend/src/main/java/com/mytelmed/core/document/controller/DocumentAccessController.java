package com.mytelmed.core.document.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.core.document.dto.DocumentAccessDto;
import com.mytelmed.core.document.dto.DocumentDto;
import com.mytelmed.core.document.dto.GrantAccessRequestDto;
import com.mytelmed.core.document.dto.UpdateAccessRequestDto;
import com.mytelmed.core.document.entity.Document;
import com.mytelmed.core.document.entity.DocumentAccess;
import com.mytelmed.core.document.mapper.DocumentAccessMapper;
import com.mytelmed.core.document.mapper.DocumentMapper;
import com.mytelmed.core.document.service.DocumentAccessService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;


@Slf4j
@RestController
@RequestMapping("/api/v1/document/access")
public class DocumentAccessController {
    private final DocumentAccessService documentAccessService;
    private final DocumentMapper documentMapper;
    private final DocumentAccessMapper documentAccessMapper;

    public DocumentAccessController(DocumentAccessService documentAccessService, DocumentMapper documentMapper,
                                    DocumentAccessMapper documentAccessMapper) {
        this.documentAccessService = documentAccessService;
        this.documentMapper = documentMapper;
        this.documentAccessMapper = documentAccessMapper;
    }

    @GetMapping("/{accessId}")
    public ResponseEntity<ApiResponse<DocumentAccessDto>> getAccessById(@PathVariable UUID accessId) {
        log.info("Received request to get document access with ID: {}", accessId);

        DocumentAccess access = documentAccessService.getDocumentAccessById(accessId);
        DocumentAccessDto dto = documentAccessMapper.toDto(access);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<ApiResponse<List<DocumentAccessDto>>> getAccessForDocument(@PathVariable UUID documentId) {
        log.info("Received request to get all access entries for document with ID: {}", documentId);
        List<DocumentAccess> accessList = documentAccessService.getAccessForDocument(documentId);
        List<DocumentAccessDto> dtos = accessList.stream()
                .map(documentAccessMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<ApiResponse<List<DocumentAccessDto>>> getDocumentsAccessibleByAccount(@PathVariable UUID accountId) {
        log.info("Received request to get all documents accessible by account with ID: {}", accountId);
        List<DocumentAccess> accessList = documentAccessService.getDocumentsAccessibleByAccount(accountId);
        List<DocumentAccessDto> dtos = accessList.stream()
                .map(documentAccessMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtos));
    }

    @GetMapping("/account/{accountId}/viewable")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getViewableDocuments(@PathVariable UUID accountId) {
        log.info("Received request to get viewable documents for account with ID: {}", accountId);
        List<Document> documentList = documentAccessService.getViewableDocuments(accountId);
        List<DocumentDto> documentDtoList = documentList.stream()
                .map(documentMapper::toDto)
                .toList();
        return ResponseEntity.ok(ApiResponse.success(documentDtoList));
    }

    @GetMapping("/account/{accountId}/downloadable")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getDownloadableDocuments(@PathVariable UUID accountId) {
        log.info("Received request to get downloadable documents for account with ID: {}", accountId);
        List<Document> documentList = documentAccessService.getDownloadableDocuments(accountId);
        List<DocumentDto> dtoList = documentList.stream()
                .map(documentMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(dtoList));
    }

    @GetMapping("/check")
    public ResponseEntity<ApiResponse<Boolean>> checkAccess(
            @RequestParam UUID documentId,
            @RequestParam UUID accountId,
            @RequestParam(defaultValue = "false") boolean checkDownload) {
        log.info("Received request to check if account {} has {} access to document {}", accountId, (checkDownload ? "download" : "view"), documentId);

        boolean hasAccess = documentAccessService.hasAccess(documentId, accountId, checkDownload);
        return ResponseEntity.ok(ApiResponse.success(hasAccess));
    }

    @PostMapping("/grant")
    public ResponseEntity<ApiResponse<Void>> grantAccess(@Valid @RequestBody GrantAccessRequestDto request) {
        log.info("Received request to grant access to document {} for account {}", request.documentId(), request.accountId());

        Optional<DocumentAccess> documentAccess = documentAccessService.grantOrUpdateDocumentAccess(
                UUID.fromString(request.documentId()),
                UUID.fromString(request.accountId()),
                request.canView(),
                request.canDownload(),
                DateTimeUtil.stringToLocalDate(request.expiryDate()).orElse(null)
        );

        return documentAccess
                .map(access -> ResponseEntity.ok(ApiResponse.success("Document access granted")))
                .orElse(ResponseEntity.internalServerError().body(ApiResponse.failure("Failed to grant document access")));
    }

    @PutMapping("/{accessId}")
    public ResponseEntity<ApiResponse<Void>> updateAccess(
            @PathVariable UUID accessId,
            @Valid @RequestBody UpdateAccessRequestDto request
    ) {
        log.info("Received request to update document access with ID: {}", accessId);

        Optional<DocumentAccess> updatedAccess = documentAccessService.updateAccess(
                accessId,
                request.canView(),
                request.canDownload(),
                DateTimeUtil.stringToLocalDate(request.expiryDate()).orElse(null)
        );

        return updatedAccess
                .map(access -> ResponseEntity.ok(ApiResponse.success("Document access updated")))
                .orElse(ResponseEntity.ok(ApiResponse.failure("Failed to update document access")));
    }

    @PatchMapping("/{accessId}/extend")
    public ResponseEntity<ApiResponse<Void>> extendAccessExpiry(
            @PathVariable UUID accessId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate newExpiryDate
    ) {
        log.info("Received request to extend access expiry for ID: {} to {}", accessId, newExpiryDate);

        Optional<DocumentAccess> updatedAccess = documentAccessService.extendAccessExpiry(accessId, newExpiryDate);

        return updatedAccess
                .map(access -> ResponseEntity.ok(ApiResponse.success("Document access extended")))
                .orElse(ResponseEntity.internalServerError().body(ApiResponse.failure("Failed to extend document access")));
    }

    @DeleteMapping("/revoke")
    public ResponseEntity<ApiResponse<Void>> revokeAccess(
            @RequestParam UUID documentId,
            @RequestParam UUID accountId
    ) {
        log.info("Received request to revoke access to document {} for account {}", documentId, accountId);

        boolean revoked = documentAccessService.revokeAccess(documentId, accountId);

        if (revoked) {
            return ResponseEntity.ok(ApiResponse.success("Document access revoked successfully"));
        } else {
            return ResponseEntity.internalServerError().body(ApiResponse.failure("Failed to revoke document access"));
        }
    }

    @DeleteMapping("/document/{documentId}/all")
    public ResponseEntity<ApiResponse<Void>> revokeAllAccessForDocument(@PathVariable UUID documentId) {
        log.info("Received request to revoke all access for document {}", documentId);

        boolean revokedAll = documentAccessService.revokeAllAccessForDocument(documentId);

        if (revokedAll) {
            return ResponseEntity.ok(ApiResponse.success("All access revoked successfully"));
        } else {
            return ResponseEntity.ok(ApiResponse.failure("Failed to revoke all access"));
        }
    }

    @DeleteMapping("/expired")
    public ResponseEntity<ApiResponse<Integer>> cleanupExpiredAccess() {
        log.info("Received request to clean up expired document access entries");

        int removedCount = documentAccessService.cleanupExpiredAccess();

        if (removedCount >= 0) {
            String message = removedCount + " expired access entries cleaned up";
            return ResponseEntity.ok(ApiResponse.success(removedCount, message));
        }

        return ResponseEntity.internalServerError().body(ApiResponse.success(null, "Failed to clean up expired access entries"));
    }
}
