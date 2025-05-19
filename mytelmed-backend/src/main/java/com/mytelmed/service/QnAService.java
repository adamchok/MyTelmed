package com.mytelmed.service;

import com.mytelmed.mapper.QnAMapper;
import com.mytelmed.model.dto.QnADto;
import com.mytelmed.model.dto.request.qna.CreateQnARequestDto;
import com.mytelmed.model.dto.request.qna.AnswerQnARequestDto;
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

    public QnADto createQnA(CreateQnARequestDto request) {
        QnA qnA = QnA.builder()
                .id(UUID.randomUUID().toString())
                .question(request.question())
                .department(request.department())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        QnA savedQnA = qnARepository.save(qnA);
        return qnAMapper.toDto(savedQnA);
    }
    
    public QnADto answerQnA(String department, String id, AnswerQnARequestDto request) {
        QnA existingQnA = qnARepository.findById(department, id)
                .orElseThrow(() -> new RuntimeException("QnA not found"));

        existingQnA.setAnswer(request.answer());
        existingQnA.setAnsweredBy(request.answeredBy());
        existingQnA.setUpdatedAt(Instant.now());
        existingQnA.setLastAnsweredAt(Instant.now());
        
        QnA updatedQnA = qnARepository.save(existingQnA);
        return qnAMapper.toDto(updatedQnA);
    }
    
    public void deleteQnA(String department, String id) {
        qnARepository.delete(department, id);
    }
}