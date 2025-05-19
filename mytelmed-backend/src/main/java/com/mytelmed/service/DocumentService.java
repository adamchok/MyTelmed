package com.mytelmed.service;

import com.mytelmed.constant.DocumentType;
import com.mytelmed.constant.EntityType;
import com.mytelmed.model.dto.DocumentDto;
import com.mytelmed.model.entity.Patient;
import com.mytelmed.model.entity.files.Document;
import com.mytelmed.repository.DocumentRepository;
import com.mytelmed.service.aws.AwsS3Service;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;
import java.util.UUID;


@Slf4j
@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final AwsS3Service awsS3Service;

    public DocumentService(DocumentRepository documentRepository, AwsS3Service awsS3Service) {
        this.documentRepository = documentRepository;
        this.awsS3Service = awsS3Service;
    }

    public Optional<Document> saveDocument(DocumentDto documentDto, Patient patient, MultipartFile documentFile) {
        try {
            Document document = Document.builder()
                    .fileName(documentDto.fileName())
                    .fileType(DocumentType.valueOf(documentDto.fileType()))
                    .patient(patient)
                    .build();
            document = documentRepository.save(document);
            String documentUrl = awsS3Service.saveFileToS3AndGetUrl(EntityType.FILE.name(), document.getId().toString(),
                    documentFile, false);
            document.setDocumentUrl(documentUrl);
            return Optional.of(documentRepository.save(document));
        } catch (Exception e) {
            log.error("Error saving document: {}", e.getMessage());
        }
        return Optional.empty();
    }

    public Optional<Document> updateDocumentWithImage(DocumentDto updatedDocumentDto, MultipartFile documentFile) {
        try {
            Document updatedDocument = documentRepository.findById(UUID.fromString(updatedDocumentDto.id()))
                    .orElseThrow(() -> new RuntimeException(
                            "Document not found with ID: " + updatedDocumentDto.id()));

            updatedDocument.setFileName(updatedDocumentDto.fileName());
            updatedDocument.setFileType(DocumentType.valueOf(updatedDocumentDto.fileType()));

            String oldDocumentUrl = updatedDocument.getDocumentUrl();
            String newDocumentUrl = awsS3Service.updateFileInS3(
                    EntityType.FILE.name(), updatedDocument.getId().toString(),
                    oldDocumentUrl, documentFile, false);
            updatedDocument.setDocumentUrl(newDocumentUrl);

            return Optional.of(documentRepository.save(updatedDocument));
        } catch (Exception e) {
            log.error("Error updating document: {}", e.getMessage(), e);
        }
        return Optional.empty();
    }

    public Optional<Document> updateDocumentWithoutImage(DocumentDto updatedDocumentDto) {
        try {
            Document updatedDocument = documentRepository.findById(UUID.fromString(updatedDocumentDto.id()))
                    .orElseThrow(() -> new RuntimeException(
                            "Document not found with ID: " + updatedDocumentDto.id()));

            updatedDocument.setFileName(updatedDocumentDto.fileName());
            updatedDocument.setFileType(DocumentType.valueOf(updatedDocumentDto.fileType()));

            return Optional.of(documentRepository.save(updatedDocument));
        } catch (Exception e) {
            log.error("Error updating document: {}", e.getMessage(), e);
        }
        return Optional.empty();
    }

    public void deleteDocumentById(String documentId) {
        try {
            Document document = documentRepository.findById(UUID.fromString(documentId))
                    .orElseThrow(() -> new RuntimeException(
                            "Document not found with ID: " + documentId));

            awsS3Service.deleteFileInS3ByUrl(document.getDocumentUrl(), false);
            documentRepository.delete(document);
        } catch (Exception e) {
            log.error("Error deleting document: {}", e.getMessage(), e);
        }
    }
}
