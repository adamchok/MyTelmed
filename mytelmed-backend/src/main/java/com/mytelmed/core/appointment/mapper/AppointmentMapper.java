package com.mytelmed.core.appointment.mapper;

import com.mytelmed.core.appointment.dto.AppointmentDto;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.doctor.mapper.DoctorMapper;
import com.mytelmed.core.doctor.service.DoctorService;
import com.mytelmed.core.patient.mapper.PatientMapper;
import com.mytelmed.infrastructure.aws.service.AwsS3Service;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Mapper for appointment entities and DTOs in Malaysian public healthcare
 * telemedicine.
 * Handles both PHYSICAL and VIRTUAL appointment consultations.
 */
@Mapper(componentModel = "spring", uses = { PatientMapper.class, AppointmentDocumentMapper.class, DoctorMapper.class })
public abstract class AppointmentMapper {
    protected PatientMapper patientMapper;
    protected AppointmentDocumentMapper appointmentDocumentMapper;
    protected DoctorMapper doctorMapper;
    protected DoctorService doctorService;

    @Autowired
    public void setPatientMapper(PatientMapper patientMapper) {
        this.patientMapper = patientMapper;
    }

    @Autowired
    public void setAppointmentDocumentMapper(AppointmentDocumentMapper appointmentDocumentMapper) {
        this.appointmentDocumentMapper = appointmentDocumentMapper;
    }

    @Autowired
    public void setDoctorMapper(DoctorMapper doctorMapper) {
        this.doctorMapper = doctorMapper;
    }

    @Autowired
    public void setDoctorService(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @Mapping(target = "id", expression = "java(appointment.getId().toString())")
    @Mapping(target = "patient", expression = "java(patientMapper.toDto(appointment.getPatient(), awsS3Service))")
    @Mapping(target = "doctor", expression = "java(doctorMapper.toDto(appointment.getDoctor(), awsS3Service))")
    @Mapping(target = "appointmentDateTime", source = "appointment.timeSlot.startTime")
    @Mapping(target = "durationMinutes", source = "appointment.timeSlot.durationMinutes")
    @Mapping(target = "status", expression = "java(appointment.getStatus().name())")
    @Mapping(target = "consultationMode", source = "appointment.consultationMode")
    @Mapping(target = "doctorNotes", source = "appointment.doctorNotes")
    @Mapping(target = "attachedDocuments", expression = "java(appointment.getAppointmentDocuments().stream().map(doc -> appointmentDocumentMapper.toDto(doc, awsS3Service)).collect(java.util.stream.Collectors.toList()))")
    public abstract AppointmentDto toDto(Appointment appointment, AwsS3Service awsS3Service);
}
