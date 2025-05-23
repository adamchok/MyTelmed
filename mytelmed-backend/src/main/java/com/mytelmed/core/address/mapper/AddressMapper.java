package com.mytelmed.core.address.mapper;

import com.mytelmed.core.address.dto.AddressDto;
import com.mytelmed.core.address.entity.Address;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;


@Mapper(componentModel = "spring")
public interface AddressMapper {
    @Mapping(target = "id", expression = "java(address.getId() != null ? address.getId().toString() : null)")
    AddressDto toDto(Address address);
}
