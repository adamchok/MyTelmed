package com.mytelmed.core.prescription.mapper;

import com.mytelmed.core.appointment.mapper.AppointmentMapper;
import com.mytelmed.core.pharmacist.mapper.PharmacistMapper;
import com.mytelmed.core.prescription.dto.PrescriptionDto;
import com.mytelmed.core.prescription.entity.Prescription;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Mapper for converting between Prescription entities and DTOs.
 * Focuses on medical prescription data only, delivery concerns are handled
 * separately.
 */
@Mapper(componentModel = "spring", uses = { PharmacistMapper.class })
public abstract class PrescriptionMapper {
    protected PharmacistMapper pharmacistMapper;
    protected AppointmentMapper appointmentMapper;

    @Autowired
    public void setPharmacistMapper(PharmacistMapper pharmacistMapper) {
        this.pharmacistMapper = pharmacistMapper;
    }

    @Autowired
    public void setAppointmentMapper(AppointmentMapper appointmentMapper) {
        this.appointmentMapper = appointmentMapper;
    }

    @Mapping(target = "id", expression = "java(prescription.getId().toString())")
    @Mapping(target = "appointment", expression = "java(appointmentMapper.toDto(prescription.getAppointment(), awsS3Service))")
    @Mapping(target = "pharmacist", expression = "java(prescription.getPharmacist() != null ? pharmacistMapper.toDto(prescription.getPharmacist(), awsS3Service) : null)")
    public abstract PrescriptionDto toDto(Prescription prescription, @Context AwsS3Service awsS3Service);
}