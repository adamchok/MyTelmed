package com.mytelmed.core.document.controller;

import com.mytelmed.common.constants.file.DocumentType;
import com.mytelmed.common.dto.ApiResponse;
import com.mytelmed.core.document.dto.DocumentDto;
import com.mytelmed.core.document.dto.DocumentUrlDto;
import com.mytelmed.core.document.dto.RequestDocumentDto;
import com.mytelmed.core.document.entity.Document;
import com.mytelmed.core.document.mapper.DocumentMapper;
import com.mytelmed.core.document.service.DocumentService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    public DocumentController(DocumentService documentService, DocumentMapper documentMapper) {
        this.documentService = documentService;
        this.documentMapper = documentMapper;
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<DocumentDto> getDocumentById(@PathVariable UUID documentId) {
        log.info("Received request to get document with ID: {}", documentId);
        Document document = documentService.getDocumentById(documentId);
        return ResponseEntity.ok(documentMapper.toDto(document));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<DocumentDto>> getDocumentsByPatientId(@PathVariable UUID patientId) {
        log.info("Received request to get all documents for patient with ID: {}", patientId);
        List<Document> documentList = documentService.getDocumentsByPatientId(patientId);

        List<DocumentDto> documentDtoList = documentList.stream()
                .map(documentMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(documentDtoList);
    }

    @GetMapping("/patient/{patientId}/type/{type}")
    public ResponseEntity<ApiResponse<List<DocumentDto>>> getDocumentsByPatientAndType(
            @PathVariable UUID patientId,
            @PathVariable String type
    ) {
        log.info("Received request to get documents of type {} for patient with ID: {}", type, patientId);

        DocumentType documentType = DocumentType.fromString(type);
        List<Document> documents = documentService.findDocumentsByPatientAndType(patientId, documentType);

        List<DocumentDto> documentDtoList = documents.stream()
                .map(documentMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success(documentDtoList));
    }

    @GetMapping("/{documentId}/url")
    public ResponseEntity<ApiResponse<DocumentUrlDto>> getDocumentUrl(
            @PathVariable UUID documentId,
            @RequestParam(required = false, defaultValue = "15") Integer expirationMinutes
    ) {
        log.info("Received request for document URL with ID: {}, expiration: {} minutes", documentId, expirationMinutes);

        String url = documentService.getPresignedDocumentUrl(documentId, expirationMinutes);
        DocumentUrlDto urlDto = DocumentUrlDto.builder()
                .documentUrl(url)
                .expirationDuration(expirationMinutes)
                .build();
        return ResponseEntity.ok(ApiResponse.success(urlDto));
    }

    @PostMapping(value = "/upload/{patientId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> uploadDocument(
            @PathVariable UUID patientId,
            @Valid @RequestPart("metadata") RequestDocumentDto request,
            @RequestPart("file") MultipartFile file
    ) {
        log.info("Received request to upload document for patient with ID: {}, document type: {}", patientId, request.documentType());
        documentService.saveDocument(request, patientId, file);
        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully"));
    }

    @PutMapping(value = "/{documentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> updateDocument(
            @PathVariable UUID documentId,
            @Valid @RequestPart("metadata") RequestDocumentDto request,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        log.info("Received request to update document with ID: {}", documentId);
        documentService.updateDocument(request, documentId, file);
        return ResponseEntity.ok(ApiResponse.success("Document updated successfully"));
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable UUID documentId) {
        log.info("Received request to delete document with ID: {}", documentId);
        documentService.deleteDocument(documentId);
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully"));
    }
}
