package com.mytelmed.core.appointment.mapper;

import com.mytelmed.core.appointment.dto.AppointmentDto;
import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.doctor.dto.DoctorDto;
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
@Mapper(componentModel = "spring", uses = { PatientMapper.class, AppointmentDocumentMapper.class })
public abstract class AppointmentMapper {
    protected PatientMapper patientMapper;
    protected AppointmentDocumentMapper appointmentDocumentMapper;
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
    public void setDoctorService(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    @Mapping(target = "id", expression = "java(appointment.getId().toString())")
    @Mapping(target = "patient", expression = "java(patientMapper.toDto(appointment.getPatient(), awsS3Service))")
    @Mapping(target = "doctor", expression = "java(mapDoctor(appointment.getDoctor(), awsS3Service))")
    @Mapping(target = "appointmentDateTime", source = "appointment.timeSlot.startTime")
    @Mapping(target = "durationMinutes", source = "appointment.timeSlot.durationMinutes")
    @Mapping(target = "status", expression = "java(appointment.getStatus().name())")
    @Mapping(target = "consultationMode", source = "appointment.consultationMode")
    @Mapping(target = "doctorNotes", source = "appointment.doctorNotes")
    @Mapping(target = "attachedDocuments", expression = "java(appointment.getAppointmentDocuments().stream().map(doc -> appointmentDocumentMapper.toDto(doc, awsS3Service)).collect(java.util.stream.Collectors.toList()))")
    public abstract AppointmentDto toDto(Appointment appointment, AwsS3Service awsS3Service);

    protected DoctorDto mapDoctor(com.mytelmed.core.doctor.entity.Doctor doctor, AwsS3Service awsS3Service) {
        try {
            String profileImageUrl = doctor.getProfileImage() != null && doctor.getProfileImage().getImageKey() != null
                    ? awsS3Service.generatePresignedViewUrl(doctor.getProfileImage().getImageKey())
                    : null;

            return new DoctorDto(
                    doctor.getId().toString(),
                    doctor.getName(),
                    doctor.getNric(),
                    doctor.getEmail(),
                    doctor.getPhone(),
                    doctor.getDateOfBirth().toString(),
                    doctor.getGender().name(),
                    null, // facility - would need to be mapped if available
                    null, // specialityList - would need to be mapped if available
                    null, // languageList - would need to be mapped if available
                    null, // qualifications - would need to be mapped if available
                    profileImageUrl,
                    doctor.getCreatedAt(),
                    doctor.getUpdatedAt());
        } catch (Exception e) {
            // Return a basic DTO without the profile image URL if there's an error
            return new DoctorDto(
                    doctor.getId().toString(),
                    doctor.getName(),
                    doctor.getNric(),
                    doctor.getEmail(),
                    doctor.getPhone(),
                    doctor.getDateOfBirth().toString(),
                    doctor.getGender().name(),
                    null, // facility
                    null, // specialityList
                    null, // languageList
                    null, // qualifications
                    null, // profileImageUrl
                    doctor.getCreatedAt(),
                    doctor.getUpdatedAt());
        }
    }
}
