package com.mytelmed.core.chat.service;

import com.mytelmed.common.advice.AppException;
import com.mytelmed.common.advice.exception.InvalidInputException;
import com.mytelmed.common.dto.StreamTokenAndUserResponseDto;
import com.mytelmed.core.auth.entity.Account;
import com.mytelmed.core.chat.entity.Chat;
import com.mytelmed.core.chat.repository.ChatRepository;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.doctor.service.DoctorService;
import com.mytelmed.core.patient.entity.Patient;
import com.mytelmed.core.patient.service.PatientService;
import com.mytelmed.infrastructure.stream.service.StreamService;
import io.getstream.exceptions.StreamException;
import io.getstream.models.ChannelResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Slf4j
@Service
public class ChatService {
    private final ChatRepository chatRepository;
    private final StreamService streamService;
    private final PatientService patientService;
    private final DoctorService doctorService;

    public ChatService(ChatRepository chatRepository, StreamService streamService,
                       PatientService patientService, DoctorService doctorService) {
        this.chatRepository = chatRepository;
        this.streamService = streamService;
        this.patientService = patientService;
        this.doctorService = doctorService;
    }

    @Transactional
    public void createChatAndStreamChannel(Patient patient, Doctor doctor) throws AppException {
        log.debug("Creating chat for patient {} and doctor {}", patient.getId(), doctor.getId());

        // Validate request inputs
        validateCreateChannelInput(patient, doctor);

        // Verify if a chat channel exists or not
        if (chatRepository.existsByPatientAndDoctor(patient, doctor)) {
            log.warn("Chat already exists for patient {} and doctor {}", patient.getId(), doctor.getId());
            return;
        }

        try {
            // Create a new Stream channel
            ChannelResponse channelResponse = streamService.createChannel(patient, doctor);

            // Create a new chat record
            Chat chat = Chat.builder()
                    .streamChannelId(channelResponse.getId())
                    .streamChannelType(channelResponse.getType())
                    .patient(patient)
                    .doctor(doctor)
                    .build();

            // Save the new chat
            chatRepository.save(chat);

            log.info("Successfully created chat for patient {} and doctor {} with Stream channel ID: {}",
                    patient.getId(), doctor.getId(), channelResponse.getId());
        } catch (StreamException e) {
            log.error("Stream SDK error creating Stream channel for patient {} and doctor {}",
                    patient.getId(), doctor.getId(), e);
            throw new AppException("Failed to create chat");
        } catch (Exception e) {
            log.error("Failed to create Stream channel for patient {} and doctor {}",
                    patient.getId(), doctor.getId(), e);
            throw new AppException("Failed to create chat");
        }
    }

    /**
     * Create a chat channel record and generate Stream user and Stream token
     */
    @Transactional
    public StreamTokenAndUserResponseDto createAndGetStreamUserAndToken(Account account) throws AppException {
        log.debug("Creating Stream user and token for user with account ID: {}", account.getId());

        // Find user ID and name
        String streamUserId = getUserIdByAccount(account);
        String streamUserName = getUserNameByAccount(account);

        try {
            // Generate a new token using StreamService
            String token = streamService.createOrUpdateUserAndGenerateToken(streamUserId, streamUserName);

            log.info("Successfully generated token for user with account ID: {}", account.getId());

            return StreamTokenAndUserResponseDto.builder()
                    .token(token)
                    .userId(streamUserId)
                    .name(streamUserName)
                    .build();
        } catch (StreamException e) {
            log.error("Stream SDK error creating or updating Stream user and generating token with account with ID: {}",
                    account.getId(), e);
            throw new AppException("Failed to generate token");
        } catch (Exception e) {
            log.error("Failed to create Stream user and generate token with account ID: {}", account.getId(), e);
            throw new AppException("Failed to generate token");
        }
    }

    private void validateCreateChannelInput(Patient patient, Doctor doctor) throws InvalidInputException {
        if (patient == null) {
            throw new InvalidInputException("Patient does not exist");
        }
        if (doctor == null) {
            throw new InvalidInputException("Doctor does not exist");
        }
    }

    private String getUserIdByAccount(Account account) throws AppException {
        switch (account.getPermission().getType()) {
            case PATIENT -> {
                Patient patient = patientService.findPatientByAccountId(account.getId());
                return patient.getId().toString();
            }
            case DOCTOR -> {
                Doctor doctor = doctorService.findByAccount(account);
                return doctor.getId().toString();
            }
            default -> throw new InvalidInputException("Account does not have permission to view chat");
        }
    }

    private String getUserNameByAccount(Account account) throws AppException {
        switch (account.getPermission().getType()) {
            case PATIENT -> {
                Patient patient = patientService.findPatientByAccountId(account.getId());
                return patient.getName();
            }
            case DOCTOR -> {
                Doctor doctor = doctorService.findByAccount(account);
                return doctor.getName();
            }
            default -> throw new InvalidInputException("Account does not have permission to view chat");
        }
    }
}
