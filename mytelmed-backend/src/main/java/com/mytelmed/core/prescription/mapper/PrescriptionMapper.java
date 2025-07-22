package com.mytelmed.core.prescription.mapper;

import com.mytelmed.core.appointment.mapper.AppointmentMapper;
import com.mytelmed.core.delivery.mapper.MedicationDeliveryMapper;
import com.mytelmed.core.pharmacist.mapper.PharmacistMapper;
import com.mytelmed.core.prescription.dto.PrescriptionDto;
import com.mytelmed.core.prescription.entity.Prescription;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;

/**
 * Mapper for converting between Prescription entities and DTOs.
 * Now includes delivery information for optimized API responses.
 */
@Mapper(componentModel = "spring", uses = { PharmacistMapper.class, PrescriptionItemMapper.class })
public abstract class PrescriptionMapper {
    protected PharmacistMapper pharmacistMapper;
    protected AppointmentMapper appointmentMapper;
    protected PrescriptionItemMapper prescriptionItemMapper;
    protected MedicationDeliveryMapper medicationDeliveryMapper;

    @Autowired
    public void setPharmacistMapper(PharmacistMapper pharmacistMapper) {
        this.pharmacistMapper = pharmacistMapper;
    }

    @Autowired
    public void setAppointmentMapper(AppointmentMapper appointmentMapper) {
        this.appointmentMapper = appointmentMapper;
    }

    @Autowired
    public void setPrescriptionItemMapper(PrescriptionItemMapper prescriptionItemMapper) {
        this.prescriptionItemMapper = prescriptionItemMapper;
    }

    @Autowired
    public void setMedicationDeliveryMapper(@Lazy MedicationDeliveryMapper medicationDeliveryMapper) {
        this.medicationDeliveryMapper = medicationDeliveryMapper;
    }

    @Mapping(target = "id", expression = "java(prescription.getId().toString())")
    @Mapping(target = "appointment", expression = "java(appointmentMapper.toDto(prescription.getAppointment(), awsS3Service))")
    @Mapping(target = "pharmacist", expression = "java(prescription.getPharmacist() != null ? pharmacistMapper.toDto(prescription.getPharmacist(), awsS3Service) : null)")
    @Mapping(target = "prescriptionItems", expression = "java(prescription.getPrescriptionItems().stream().map(prescriptionItemMapper::toDto).collect(java.util.stream.Collectors.toList()))")
    @Mapping(target = "delivery", expression = "java(getDeliveryInfo(prescription))")
    public abstract PrescriptionDto toDto(Prescription prescription, @Context AwsS3Service awsS3Service);

    /**
     * Gets the latest delivery information for a prescription from the OneToMany
     * relationship
     */
    protected com.mytelmed.core.delivery.dto.MedicationDeliverySimpleDto getDeliveryInfo(Prescription prescription) {
        if (prescription == null || prescription.getMedicationDeliveries() == null
                || prescription.getMedicationDeliveries().isEmpty()) {
            return null;
        }

        // Get the latest delivery (most recently created)
        return prescription.getLatestDelivery()
                .map(medicationDeliveryMapper::toSimpleDto)
                .orElse(null);
    }
}
