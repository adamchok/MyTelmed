package com.mytelmed.controller;

import com.mytelmed.model.dto.QnADto;
import com.mytelmed.service.QnAService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/qna")
public class QnAController {
    private final QnAService qnAService;

    public QnAController(QnAService qnAService) {
        this.qnAService = qnAService;
    }

    @PostMapping
    public ResponseEntity<QnADto> createQnA(@Valid @RequestBody QnADto request) {
        QnADto response = qnAService.createQnA(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<QnADto>> getAllQnA(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<QnADto> qnA = qnAService.getAllQnA(page, pageSize);
        return ResponseEntity.ok(qnA);
    }

    @GetMapping("/{department}")
    public ResponseEntity<Page<QnADto>> getQnAByDepartment(
            @PathVariable String department,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<QnADto> qnA = qnAService.getQnAByDepartment(department, page, pageSize);
        return ResponseEntity.ok(qnA);
    }

    @GetMapping("/{department}/{id}")
    public ResponseEntity<QnADto> getQnAByDepartmentAndId(
            @PathVariable String department,
            @PathVariable String id) {
        QnADto qnA = qnAService.getQnAById(department, id);
        return ResponseEntity.ok(qnA);
    }

    @PutMapping("/{department}/{id}")
    public ResponseEntity<QnADto> updateQnA(
            @PathVariable String department,
            @PathVariable String id,
            @Valid @RequestBody QnADto request) {
        QnADto response = qnAService.updateQnA(department, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{department}/{id}")
    public ResponseEntity<Void> deleteQnA(
            @PathVariable String department,
            @PathVariable String id) {
        qnAService.deleteQnA(department, id);
        return ResponseEntity.noContent().build();
    }
}
