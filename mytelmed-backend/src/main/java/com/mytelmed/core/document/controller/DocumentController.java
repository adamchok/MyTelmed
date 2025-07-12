package com.mytelmed.core.document.controller;

import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.document.dto.CreateDocumentRequestDto;
import com.mytelmed.core.document.dto.DocumentDto;
import com.mytelmed.core.document.dto.UpdateDocumentRequestDto;
import com.mytelmed.core.document.entity.Document;
import com.mytelmed.core.document.mapper.DocumentMapper;
import com.mytelmed.core.document.service.DocumentService;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Slf4j
@RestController
@RequestMapping("/api/v1/document")
public class DocumentController {
    private final DocumentService documentService;
    private final DocumentMapper documentMapper;
    private final AwsS3Service awsS3Service;

    public DocumentController(DocumentService documentService, DocumentMapper documentMapper, AwsS3Service awsS3Service) {
        this.documentService = documentService;
        this.documentMapper = documentMapper;
        this.awsS3Service = awsS3Service;
    }

    @GetMapping("/{documentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<DocumentDto>> getDocumentById(@PathVariable UUID documentId) {
        log.info("Received request to get document with ID: {}", documentId);

        Document document = documentService.findById(documentId);
        DocumentDto documentDto = documentMapper.toDto(document, awsS3Service);
        return ResponseEntity.ok(ApiResponse.success(documentDto));
    }

    @GetMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getDocumentsByPatientAccount(@AuthenticationPrincipal Account account) {
        log.info("Received request to get all documents for patient account with ID: {}", account.getId());

        List<Document> documentList = documentService.findAllByPatientAccount(account);

        List<DocumentDto> documentDtoList = documentList.stream()
                .map(document -> documentMapper.toDto(document, awsS3Service))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(documentDtoList));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getDocumentsByPatientId(
            @PathVariable UUID patientId,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to get all documents for patient with ID: {}", patientId);

        List<Document> documentList = documentService.findAllByPatientId(patientId, account);

        List<DocumentDto> documentDtoList = documentList.stream()
                .map(document -> documentMapper.toDto(document, awsS3Service))
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(documentDtoList));
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<UUID>> createDocumentByAccount(
            @Valid @RequestBody CreateDocumentRequestDto request,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to create document for patient with account ID: {}, document type: {}",
                account.getId(), request.documentType());

        UUID documentId = documentService.create(account, request);
        return ResponseEntity.ok(ApiResponse.success(documentId, "Document uploaded successfully"));
    }

    @PutMapping(value = "/{documentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> uploadDocument(
            @PathVariable UUID documentId,
            @RequestPart("file") MultipartFile file,
            @AuthenticationPrincipal Account account
    ) {
        log.info("Received request to upload document for patient with account ID: {} and document ID: {}",
                account.getId(), documentId);

        documentService.uploadDocument(account, documentId, file);
        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully"));
    }

    @PatchMapping(value = "/{documentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> updateDocument(
            @PathVariable UUID documentId,
            @Valid @RequestBody UpdateDocumentRequestDto request
    ) {
        log.info("Received request to update document with ID: {}", documentId);

        documentService.update(request, documentId);
        return ResponseEntity.ok(ApiResponse.success("Document updated successfully"));
    }

    @DeleteMapping("/{documentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable UUID documentId) {
        log.info("Received request to delete document with ID: {}", documentId);

        documentService.delete(documentId);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully"));
    }
}
