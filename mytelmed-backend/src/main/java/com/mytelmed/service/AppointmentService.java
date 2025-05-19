package com.mytelmed.service;

import com.mytelmed.constant.AppointmentModeType;
import com.mytelmed.constant.AppointmentStatusType;
import com.mytelmed.mapper.AppointmentMapper;
import com.mytelmed.model.dto.request.appointment.DoctorAppointmentRequestDto;
import com.mytelmed.model.dto.request.appointment.UpdateAppointmentRequestDto;
import com.mytelmed.model.entity.Appointment;
import com.mytelmed.model.entity.files.Document;
import com.mytelmed.model.entity.Doctor;
import com.mytelmed.model.entity.Patient;
import com.mytelmed.model.dto.AppointmentDto;
import com.mytelmed.model.dto.request.appointment.PatientAppointmentRequestDto;
import com.mytelmed.model.entity.security.User;
import com.mytelmed.repository.AppointmentRepository;
import com.mytelmed.repository.DocumentRepository;
import com.mytelmed.repository.DoctorRepository;
import com.mytelmed.repository.PatientRepository;
import com.mytelmed.utils.BlindIndex;
import com.mytelmed.utils.DateTimeUtil;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;


@Service
public class AppointmentService {
    private final AppointmentRepository appointmentRepository;
    private final DocumentRepository documentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentMapper appointmentMapper;

    public AppointmentService(AppointmentRepository appointmentRepository, DocumentRepository documentRepository,
                              DoctorRepository doctorRepository, PatientRepository patientRepository,
                              AppointmentMapper appointmentMapper) {
        this.appointmentRepository = appointmentRepository;
        this.documentRepository = documentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.appointmentMapper = appointmentMapper;
    }
    
    @Transactional(readOnly = true)
    public Page<AppointmentDto> getAppointmentsByDoctorId(UUID doctorId, Instant startDate, Instant endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return appointmentRepository.findByDoctorIdAndDateRange(doctorId, startDate, endDate, pageable)
                .map(appointmentMapper::toDto);
    }
    
    @Transactional(readOnly = true)
    public Page<AppointmentDto> getAppointmentsByPatientId(UUID patientId, Instant startDate, Instant endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return appointmentRepository.findByPatientIdAndDateRange(patientId, startDate, endDate, pageable)
                .map(appointmentMapper::toDto);
    }
    
    @Transactional(readOnly = true)
    public AppointmentDto getAppointmentById(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + appointmentId));
        return appointmentMapper.toDto(appointment);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentDto> getAppointments(Instant startDate, Instant endDate, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return appointmentRepository.findByDateRange(startDate, endDate, pageable)
                .map(appointmentMapper::toDto);
    }
    
    @Transactional
    public AppointmentDto createAppointmentForPatient(PatientAppointmentRequestDto requestDto, User auth) {
        Doctor doctor = doctorRepository.findById(UUID.fromString(requestDto.doctorId()))
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + requestDto.doctorId()));

        Patient patient = patientRepository.findByNricHash(BlindIndex.sha256(auth.getUsername()))
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + auth.getUsername()));

        Instant proposedStartTime = DateTimeUtil.toInstant(requestDto.appointmentDateTime());
        Instant proposedEndTime = proposedStartTime.plusSeconds(requestDto.duration() * 60L);
        
        // Check for conflicts
        boolean hasConflict = appointmentRepository.hasConflictingAppointmentForDoctor(
                doctor.getId(), proposedStartTime, proposedEndTime);
        
        if (hasConflict) {
            throw new IllegalStateException("Doctor has conflicting appointments in the requested time slot");
        }

        Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .appointmentDateTime(proposedStartTime)
                .appointmentEndDateTime(proposedEndTime)
                .duration(requestDto.duration())
                .status(AppointmentStatusType.SCHEDULED)
                .mode(AppointmentModeType.valueOf(requestDto.mode().toUpperCase()))
                .reason(requestDto.reason())
                .notes(requestDto.notes())
                .build();
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        return appointmentMapper.toDto(savedAppointment);
    }

    @Transactional
    public AppointmentDto createAppointmentForDoctor(DoctorAppointmentRequestDto requestDto, User auth) {
        Doctor doctor = doctorRepository.findByNricHash(BlindIndex.sha256(auth.getUsername()))
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + auth.getUsername()));

        Patient patient = patientRepository.findById(UUID.fromString(requestDto.patientId()))
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with id: " + requestDto.patientId()));

        Instant proposedStartTime = DateTimeUtil.toInstant(requestDto.appointmentDateTime());
        Instant proposedEndTime = proposedStartTime.plusSeconds(requestDto.duration() * 60L);

        // Check for conflicts
        boolean hasConflict = appointmentRepository.hasConflictingAppointmentForDoctor(
                doctor.getId(), proposedStartTime, proposedEndTime);

        if (hasConflict) {
            throw new IllegalStateException("Doctor has conflicting appointments in the requested time slot");
        }

        Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .appointmentDateTime(proposedStartTime)
                .duration(requestDto.duration())
                .status(AppointmentStatusType.SCHEDULED)
                .mode(AppointmentModeType.valueOf(requestDto.mode().toUpperCase()))
                .reason(requestDto.reason())
                .notes(requestDto.notes())
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        return appointmentMapper.toDto(savedAppointment);
    }
    
    @Transactional
    public AppointmentDto updateAppointment(UUID appointmentId, UpdateAppointmentRequestDto requestDto) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + appointmentId));
        
        // Check for conflicts
        Instant newProposedStartTime = DateTimeUtil.toInstant(requestDto.appointmentDateTime());
        if (appointment.getAppointmentDateTime().compareTo(newProposedStartTime) != 0) {
            Instant proposedEndTime = newProposedStartTime.plusSeconds(appointment.getDuration() * 60L);
            
            boolean hasConflict = appointmentRepository.hasConflictingAppointmentForDoctor(
                    appointment.getDoctor().getId(), newProposedStartTime, proposedEndTime);
            
            if (hasConflict) {
                throw new IllegalStateException("Doctor has conflicting appointments in the requested time slot");
            }
        }
        
        appointment.setAppointmentDateTime(newProposedStartTime);
        appointment.setMode(AppointmentModeType.valueOf(requestDto.mode().toUpperCase()));
        appointment.setReason(requestDto.reason());
        appointment.setNotes(requestDto.notes());
        
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        return appointmentMapper.toDto(updatedAppointment);
    }
    
    @Transactional
    public void cancelAppointment(UUID appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + appointmentId));
        
        appointment.setStatus(AppointmentStatusType.CANCELLED);
        appointmentRepository.save(appointment);
    }
    
    @Transactional
    public void deleteAppointment(UUID appointmentId) {
        if (!appointmentRepository.existsById(appointmentId)) {
            throw new EntityNotFoundException("Appointment not found with id: " + appointmentId);
        }
        appointmentRepository.deleteById(appointmentId);
    }
    
    @Transactional
    public AppointmentDto addDocumentToAppointment(UUID appointmentId, UUID documentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + appointmentId));
        
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + documentId));
        
        appointment.addDocument(document);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        return appointmentMapper.toDto(updatedAppointment);
    }
    
    @Transactional
    public AppointmentDto removeDocumentFromAppointment(UUID appointmentId, UUID documentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Appointment not found with id: " + appointmentId));
        
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + documentId));
        
        appointment.removeDocument(document);
        Appointment updatedAppointment = appointmentRepository.save(appointment);
        
        return appointmentMapper.toDto(updatedAppointment);
    }
}