package com.mytelmed.core.prescription.mapper;

import com.mytelmed.core.address.mapper.AddressMapper;
import com.mytelmed.core.appointment.mapper.AppointmentMapper;
import com.mytelmed.core.pharmacist.mapper.PharmacistMapper;
import com.mytelmed.core.prescription.dto.PrescriptionDto;
import com.mytelmed.core.prescription.entity.Prescription;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;


@Mapper(componentModel = "spring", uses = {AddressMapper.class, PharmacistMapper.class})
public abstract class PrescriptionMapper {
    protected AddressMapper addressMapper;
    protected PharmacistMapper pharmacistMapper;
    protected AppointmentMapper appointmentMapper;

    @Autowired
    public void setAddressMapper(AddressMapper addressMapper) {
        this.addressMapper = addressMapper;
    }

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
    @Mapping(target = "address", expression = "java(prescription.getDeliveryAddress() != null ? addressMapper.toDto(prescription.getDeliveryAddress()) : null)")
    public abstract PrescriptionDto toDto(Prescription prescription, @Context AwsS3Service awsS3Service);
}