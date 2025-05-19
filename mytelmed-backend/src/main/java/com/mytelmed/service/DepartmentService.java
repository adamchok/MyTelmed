package com.mytelmed.service;


import com.mytelmed.constant.EntityType;
import com.mytelmed.mapper.DepartmentMapper;
import com.mytelmed.model.dto.DepartmentDto;
import com.mytelmed.model.entity.Department;
import com.mytelmed.model.entity.files.Image;
import com.mytelmed.repository.DepartmentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Service
public class DepartmentService {
    private final ImageService imageService;
    private final DepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    public DepartmentService(ImageService imageService, DepartmentRepository departmentRepository,
                             DepartmentMapper departmentMapper) {
        this.imageService = imageService;
        this.departmentRepository = departmentRepository;
        this.departmentMapper = departmentMapper;
    }

    public List<DepartmentDto> getAllDepartments() {
        List<Department> departments = departmentRepository.findAll();
        return departments.stream().map(departmentMapper::toDto).toList();
    }

    public Page<DepartmentDto> getAllPaginatedDepartments(int page, int pageSize) {
        Pageable pageable = PageRequest.of(page, pageSize);
        Page<Department> departments = departmentRepository.findAll(pageable);
        return departments.map(departmentMapper::toDto);
    }

    public DepartmentDto getDepartmentByName(String name) {
        Optional<Department> departmentOpt = departmentRepository.findByName(name);
        return departmentOpt.map(departmentMapper::toDto).orElse(null);
    }

    public DepartmentDto createDepartment(DepartmentDto departmentDto) {
        Department department = departmentMapper.toEntity(departmentDto);
        department = departmentRepository.save(department);
        return departmentMapper.toDto(department);
    }

    public DepartmentDto uploadImage(String departmentId, MultipartFile imageFile) {
        Optional<Department> departmentOpt = departmentRepository.findById(UUID.fromString(departmentId));
        if (departmentOpt.isEmpty()) {
            throw new RuntimeException("Department not found");
        }
        Department department = departmentOpt.get();
        Optional<Image> image = imageService.saveImage(EntityType.DEPARTMENT, department.getId(), imageFile, true);
        if (image.isEmpty()) {
            throw new RuntimeException("Failed to save image for specified department");
        }
        department.setImage(image.get());
        Department updatedDepartment = departmentRepository.save(department);
        return departmentMapper.toDto(updatedDepartment);
    }
}
