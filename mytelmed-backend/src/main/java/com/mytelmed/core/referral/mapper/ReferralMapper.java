package com.mytelmed.core.referral.mapper;

import com.mytelmed.core.appointment.mapper.AppointmentMapper;
import com.mytelmed.core.doctor.mapper.DoctorMapper;
import com.mytelmed.core.patient.mapper.PatientMapper;
import com.mytelmed.core.referral.dto.ReferralDto;
import com.mytelmed.core.referral.entity.Referral;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Context;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;


@Mapper(componentModel = "spring", uses = {PatientMapper.class, DoctorMapper.class, AppointmentMapper.class})
public abstract class ReferralMapper {
    protected PatientMapper patientMapper;
    protected DoctorMapper doctorMapper;
    protected AppointmentMapper appointmentMapper;

    @Autowired
    public void setPatientMapper(PatientMapper patientMapper) {
        this.patientMapper = patientMapper;
    }

    @Autowired
    public void setDoctorMapper(DoctorMapper doctorMapper) {
        this.doctorMapper = doctorMapper;
    }

    @Autowired
    public void setAppointmentMapper(AppointmentMapper appointmentMapper) {
        this.appointmentMapper = appointmentMapper;
    }

    @Mapping(target = "id", expression = "java(referral.getId().toString())")
    @Mapping(target = "patient", expression = "java(patientMapper.toDto(referral.getPatient(), awsS3Service))")
    @Mapping(target = "referringDoctor",
            expression = "java(doctorMapper.toDto(referral.getReferringDoctor(), awsS3Service))")
    @Mapping(target = "referredDoctor",
            expression = "java(referral.getReferredDoctor() != null ? doctorMapper.toDto(referral.getReferredDoctor(), awsS3Service) : null)")
    @Mapping(target = "scheduledAppointment",
            expression = "java(referral.getScheduledAppointment() != null ? appointmentMapper.toDto(referral.getScheduledAppointment(), awsS3Service) : null)")
    public abstract ReferralDto toDto(Referral referral, @Context AwsS3Service awsS3Service);
}
