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
import io.getstream.models.GetOrCreateCallRequest;
import io.getstream.models.GetOrCreateChannelRequest;
import io.getstream.models.MemberRequest;
import io.getstream.models.UpdateUsersRequest;
import io.getstream.models.UserRequest;
import io.getstream.services.Call;
import io.getstream.services.Channel;
import io.getstream.services.framework.StreamSDKClient;
import lombok.extern.slf4j.Slf4j;
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

    public StreamService(StreamSDKClient client) {
        this.client = client;
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

        List<MemberRequest> members = List.of(
                MemberRequest.builder()
                        .userID(patientId)
                        .build(),
                MemberRequest.builder()
                        .userID(doctorId)
                        .build());

        CallRequest callRequest = CallRequest.builder()
                .createdByID(accountId)
                .members(members)
                .startsAt(Date.from(Instant.now()))
                .video(true)
                .build();

        GetOrCreateCallRequest getOrCreateCallRequest = GetOrCreateCallRequest.builder()
                .data(callRequest)
                .membersLimit(2)
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
}
