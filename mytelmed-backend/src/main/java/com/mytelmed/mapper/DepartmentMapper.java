package com.mytelmed.mapper;

import com.mytelmed.model.dto.DepartmentDto;
import com.mytelmed.model.entity.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;


@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DepartmentMapper {
    @Mapping(target = "id", expression = "java(department.getId().toString())")
    @Mapping(target = "imageUrl", expression = "java(department.getImage() != null ? department.getImage().getImageUrl() : null)")
    DepartmentDto toDto(Department department);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "image", ignore = true)
    Department toEntity(DepartmentDto departmentDto);
}
