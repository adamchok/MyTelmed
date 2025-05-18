package com.mytelmed.service;

import com.mytelmed.mapper.QnAMapper;
import com.mytelmed.model.dto.QnADto;
import com.mytelmed.model.entity.QnA;
import com.mytelmed.repository.QnARepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.UUID;


@Service
public class QnAService {
    private final QnARepository qnARepository;
    private final QnAMapper qnAMapper;

    public QnAService(QnARepository qnARepository, QnAMapper qnAMapper) {
        this.qnARepository = qnARepository;
        this.qnAMapper = qnAMapper;
    }
    
    public QnADto createQnA(QnADto request) {
        QnA qnA = qnAMapper.toEntity(request);
        qnA.setId(UUID.randomUUID().toString());
        qnA.setCreatedAt(Instant.now());
        qnA.setUpdatedAt(Instant.now());
        
        QnA savedQnA = qnARepository.save(qnA);
        return qnAMapper.toDto(savedQnA);
    }
    
    public Page<QnADto> getAllQnA(int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<QnA> qnA = qnARepository.findAll(pageable);
        return qnA.map(qnAMapper::toDto);
    }
    
    public Page<QnADto> getQnAByDepartment(String department, int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<QnA> qnA = qnARepository.findByDepartment(department, pageable);
        return qnA.map(qnAMapper::toDto);
    }
    
    public QnADto getQnAById(String department, String id) {
        QnA qnA = qnARepository.findById(department, id)
                .orElseThrow(() -> new RuntimeException("QnA not found"));
        return qnAMapper.toDto(qnA);
    }
    
    public QnADto updateQnA(String department, String id, QnADto request) {
        QnA existingQnA = qnARepository.findById(department, id)
                .orElseThrow(() -> new RuntimeException("QnA not found"));
        
        qnAMapper.updateEntityFromDto(request, existingQnA);
        
        QnA updatedQnA = qnARepository.save(existingQnA);
        return qnAMapper.toDto(updatedQnA);
    }
    
    public void deleteQnA(String department, String id) {
        qnARepository.delete(department, id);
    }
}