package com.mytelmed.core.document.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.common.utils.DateTimeUtil;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.document.dto.UpdateAccessRequestDto;
import com.mytelmed.core.document.service.DocumentAccessService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.UUID;


@Slf4j
@RestController
@RequestMapping("/api/v1/document/access")
public class DocumentAccessController {
    private final DocumentAccessService documentAccessService;

    public DocumentAccessController(DocumentAccessService documentAccessService) {
        this.documentAccessService = documentAccessService;
    }

    @PatchMapping("/{documentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> updateAccess(
            @PathVariable UUID documentId,
            @Valid @RequestBody UpdateAccessRequestDto request,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to update document access with ID: {}", documentId);

        documentAccessService.updateAccess(
                account,
                documentId,
                request.canView(),
                request.canAttach(),
                DateTimeUtil.stringToLocalDate(request.expiryDate()).orElse(null)
        );

        return ResponseEntity.ok(ApiResponse.success("Document access updated"));
    }

    @PatchMapping("/{documentId}/all")
    public ResponseEntity<ApiResponse<Void>> revokeAllAccessForDocument(@PathVariable UUID documentId,
                                                                        @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to revoke all access for document {}", documentId);

        documentAccessService.revokeAllAccessByDocumentId(account, documentId);
        return ResponseEntity.ok(ApiResponse.success("All access revoked successfully"));
    }
}
