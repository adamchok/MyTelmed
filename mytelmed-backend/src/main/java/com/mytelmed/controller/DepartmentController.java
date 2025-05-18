package com.mytelmed.controller;

import com.mytelmed.model.dto.DepartmentDto;
import com.mytelmed.service.DepartmentService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;


@RestController
@RequestMapping("/department")
public class DepartmentController {
    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping("/list")
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        List<DepartmentDto> departments = departmentService.getAllDepartments();
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<DepartmentDto>> getAllPaginatedDepartments(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        Page<DepartmentDto> departments = departmentService.getAllPaginatedDepartments(page, pageSize);
        return ResponseEntity.ok(departments);
    }

    @GetMapping
    public ResponseEntity<DepartmentDto> getDepartmentByName(@RequestParam String name) {
        DepartmentDto department = departmentService.getDepartmentByName(name);
        return ResponseEntity.ok(department);
    }

    @PreAuthorize("hasAuthority('admin')")
    @PostMapping
    public ResponseEntity<DepartmentDto> createFacility(@RequestBody DepartmentDto departmentDto) {
        DepartmentDto createdDepartment = departmentService.createDepartment(departmentDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDepartment);
    }

    @PreAuthorize("hasAuthority('admin')")
    @PostMapping(consumes = "multipart/form-data" )
    public ResponseEntity<DepartmentDto> createFacilityWithImage(
            @RequestPart("department") DepartmentDto departmentDto,
            @RequestPart("image") MultipartFile imageFile
    ) {
        DepartmentDto createdDepartment = departmentService.createDepartment(departmentDto);
        DepartmentDto updatedDepartment = departmentService.uploadImage(createdDepartment.id(), imageFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(updatedDepartment);
    }

    @PreAuthorize("hasAuthority('admin')")
    @PostMapping("/{id}/image")
    public ResponseEntity<DepartmentDto> uploadImageForFacility(
            @PathVariable("id") String departmentId,
            @RequestPart("image") MultipartFile imageFile) {
        DepartmentDto updatedDepartment = departmentService.uploadImage(departmentId, imageFile);
        return ResponseEntity.status(HttpStatus.OK).body(updatedDepartment);
    }
}
