package com.mytelmed.controller;

import com.mytelmed.model.dto.ArticleDto;
import com.mytelmed.model.dto.request.CreateArticleRequestDto;
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
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/article")
public class ArticleController {
    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @PostMapping
    public ResponseEntity<ArticleDto> createArticle(@Valid @RequestBody CreateArticleRequestDto request) {
        ArticleDto response = articleService.createArticle(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<ArticleDto>> getAllArticles(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<ArticleDto> articles = articleService.getAllArticles(page, pageSize);
        return ResponseEntity.ok(articles);
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
    public ResponseEntity<ArticleDto> getArticleById(
            @PathVariable String department,
            @PathVariable String id) {
        ArticleDto article = articleService.getArticleById(department, id);
        return ResponseEntity.ok(article);
    }

    @PutMapping("/{department}/{id}")
    public ResponseEntity<ArticleDto> updateArticle(
            @PathVariable String department,
            @PathVariable String id,
            @Valid @RequestBody CreateArticleRequestDto request) {
        ArticleDto response = articleService.updateArticle(department, id, request);
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
