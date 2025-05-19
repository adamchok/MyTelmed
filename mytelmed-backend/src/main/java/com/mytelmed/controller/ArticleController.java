package com.mytelmed.controller;

import com.mytelmed.model.dto.ArticleDto;
import com.mytelmed.service.ArticleService;
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
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequestMapping("/article")
public class ArticleController {
    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping("/{department}")
    public ResponseEntity<Page<ArticleDto>> getArticlesByDepartment(
            @PathVariable String department,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<ArticleDto> articles = articleService.getArticlesByDepartment(department, page, pageSize);
        return ResponseEntity.ok(articles);
    }

    @GetMapping("/{department}/{id}")
    public ResponseEntity<ArticleDto> getArticleByDepartmentAndId(
            @PathVariable String department,
            @PathVariable String id) {
        ArticleDto article = articleService.getArticleById(department, id);
        return ResponseEntity.ok(article);
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<ArticleDto> createArticleWithImage(
            @Valid @RequestPart("article") ArticleDto request,
            @RequestPart("image") MultipartFile imageFile) {
        ArticleDto response = articleService.createArticleWithImage(request, imageFile);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping
    public ResponseEntity<ArticleDto> createArticleWithoutImage(
            @Valid @RequestBody ArticleDto request) {
        ArticleDto response = articleService.createArticleWithoutImage(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{department}/{id}")
    public ResponseEntity<ArticleDto> updateArticleWithoutImage(
            @PathVariable String department,
            @PathVariable String id,
            @Valid @RequestBody ArticleDto request) {
        ArticleDto response = articleService.updateArticleWithoutImage(department, id, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/{department}/{id}", consumes = "multipart/form-data")
    public ResponseEntity<ArticleDto> updateArticleWithImage(
            @PathVariable String department,
            @PathVariable String id,
            @Valid @RequestPart("article") ArticleDto request,
            @RequestPart("image") MultipartFile imageFile) {
        ArticleDto response = articleService.updateArticleWithImage(department, id, request, imageFile);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{department}/{id}")
    public ResponseEntity<Void> deleteArticle(
            @PathVariable String department,
            @PathVariable String id) {
        articleService.deleteArticle(department, id);
        return ResponseEntity.noContent().build();
    }
}
