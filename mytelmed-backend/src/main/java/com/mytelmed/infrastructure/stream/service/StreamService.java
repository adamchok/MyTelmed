package com.mytelmed.infrastructure.stream.service;

import com.mytelmed.core.appointment.entity.Appointment;
import com.mytelmed.core.doctor.entity.Doctor;
import com.mytelmed.core.patient.entity.Patient;

import io.getstream.exceptions.StreamException;
import io.getstream.models.CallRequest;
import io.getstream.models.CallResponse;
import io.getstream.models.ChannelInput;
import io.getstream.models.ChannelMember;
import io.getstream.models.ChannelResponse;
import io.getstream.models.CheckExternalStorageRequest;
import io.getstream.models.CreateExternalStorageRequest;
import io.getstream.models.GetOrCreateCallRequest;
import io.getstream.models.GetOrCreateChannelRequest;
import io.getstream.models.MemberRequest;
import io.getstream.models.S3Request;
import io.getstream.models.UpdateCallTypeRequest;
import io.getstream.models.UpdateUsersRequest;
import io.getstream.models.UserRequest;
import io.getstream.services.Call;
import io.getstream.services.Channel;
import io.getstream.services.framework.StreamSDKClient;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class StreamService {
    private final StreamSDKClient client;
    private final String awsRegion;
    private final String awsAccessKey;
    private final String awsSecret;
    private final String bucketName;

    private static final String externalStorageName = "stream-recording-storage";

    public StreamService(StreamSDKClient client,
            @Value("${aws.region}") String awsRegion,
            @Value("${aws.accessKey}") String awsAccessKey,
            @Value("${aws.secretKey}") String awsSecret,
            @Value("${aws.s3.bucket.name}") String bucketName) {
        this.client = client;
        this.awsRegion = awsRegion;
        this.awsAccessKey = awsAccessKey;
        this.awsSecret = awsSecret;
        this.bucketName = bucketName;
    }

    public String createOrUpdateUserAndGenerateToken(String userId, String name)
            throws StreamException {
        Map<String, UserRequest> userMap = Map.of(
                userId,
                UserRequest.builder()
                        .id(userId)
                        .name(name)
                        .build());

        UpdateUsersRequest usersRequest = UpdateUsersRequest.builder()
                .users(userMap)
                .build();

        client.updateUsers(usersRequest).execute();
        return client.tokenBuilder().createToken(userId, 24 * 60 * 60);
    }

    public CallResponse createCall(Appointment appointment, String accountId) throws StreamException {
        String callId = UUID.randomUUID().toString();
        Call call = new Call("development", callId, client.video());

        // Get ID for Stream
        String patientId = appointment.getPatient().getId().toString();
        String doctorId = appointment.getDoctor().getId().toString();

        // Get names for Stream
        String patientName = appointment.getPatient().getName();
        String doctorName = appointment.getDoctor().getName();

        createOrUpdateUsers(patientId, patientName, doctorId, doctorName);

        appointment.getPatient().getFamilyMemberList()
                .forEach(familyMember -> {
                    try {
                        createOrUpdateUser(familyMember.getMemberAccount().getId().toString(),
                                familyMember.getName());
                    } catch (StreamException e) {
                        log.warn("Unable to create Stream user for patient family member: {}",
                                familyMember.getId());
                    }
                });

        List<MemberRequest> members = List.of(
                MemberRequest.builder()
                        .userID(patientId)
                        .build(),
                MemberRequest.builder()
                        .userID(doctorId)
                        .build());

        appointment.getPatient().getFamilyMemberList()
                .forEach(familyMember -> members.add(MemberRequest.builder()
                        .userID(familyMember.getMemberAccount().getId().toString())
                        .build()));

        CallRequest callRequest = CallRequest.builder()
                .createdByID(accountId)
                .members(members)
                .startsAt(Date.from(Instant.now()))
                .video(true)
                .build();

        GetOrCreateCallRequest getOrCreateCallRequest = GetOrCreateCallRequest.builder()
                .data(callRequest)
                .video(true)
                .build();

        return call.getOrCreate(getOrCreateCallRequest).getData().getCall();
    }

    public ChannelResponse createChannel(Patient patient, Doctor doctor)
            throws StreamException {
        // Create Stream channel
        String channelId = UUID.randomUUID().toString();
        Channel channel = new Channel("messaging", channelId, client.chat());

        // Get ID for Stream
        String patientId = patient.getId().toString();
        String doctorId = doctor.getId().toString();

        // Get names for Stream
        String patientName = patient.getName();
        String doctorName = doctor.getName();

        createOrUpdateUsers(patientId, patientName, doctorId, doctorName);

        List<ChannelMember> members = List.of(
                ChannelMember.builder()
                        .userID(patientId)
                        .build(),
                ChannelMember.builder()
                        .userID(doctorId)
                        .build());

        ChannelInput channelInput = ChannelInput.builder()
                .createdByID(patient.getId().toString())
                .members(members)
                .build();

        GetOrCreateChannelRequest getOrCreateChannelRequest = GetOrCreateChannelRequest.builder()
                .data(channelInput)
                .state(true)
                .threadUnreadCounts(true)
                .build();

        return channel.getOrCreate(getOrCreateChannelRequest).getData().getChannel();
    }

    private void createOrUpdateUsers(String patientId, String patientName, String providerId, String providerName)
            throws StreamException {
        Map<String, UserRequest> userMap = Map.of(
                patientId,
                UserRequest.builder()
                        .id(patientId)
                        .name(patientName)
                        .build(),
                providerId,
                UserRequest.builder()
                        .id(providerId)
                        .name(providerName)
                        .build());

        UpdateUsersRequest usersRequest = UpdateUsersRequest.builder()
                .users(userMap)
                .build();

        client.updateUsers(usersRequest).execute();
    }

    private void createOrUpdateUser(String userId, String name) throws StreamException {
        Map<String, UserRequest> userMap = Map.of(
                userId,
                UserRequest.builder()
                        .id(userId)
                        .name(name)
                        .build());

        UpdateUsersRequest usersRequest = UpdateUsersRequest.builder()
                .users(userMap)
                .build();

        client.updateUsers(usersRequest).execute();
    }

    public void createRecordingS3Storage() throws StreamException {
        try {
            client.checkExternalStorage(externalStorageName).execute();
        } catch (StreamException e) {
            S3Request s3Request = S3Request.builder()
                    .s3Region(awsRegion)
                    .s3APIKey(awsAccessKey)
                    .s3Secret(awsSecret)
                    .build();

            CreateExternalStorageRequest externalStorageRequest = CreateExternalStorageRequest.builder()
                    .bucket(bucketName)
                    .name(externalStorageName)
                    .storageType("s3")
                    .path("/recording")
                    .awsS3(s3Request)
                    .build();

            client.createExternalStorage(externalStorageRequest).execute();

            UpdateCallTypeRequest updateCallTypeRequest = UpdateCallTypeRequest.builder()
                    .externalStorage(externalStorageName)
                    .build();

            client.video().updateCallType("development", updateCallTypeRequest).execute();
        }
    }
}
