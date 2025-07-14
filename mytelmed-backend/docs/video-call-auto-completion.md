# Video Call Automatic Completion

This document describes the automatic appointment completion feature when all participants leave a video call.

## Overview

The system now supports **automatic appointment completion** when all participants leave a video call through three mechanisms:

1. **Stream Webhooks** (Primary) - Real-time notifications from Stream when participants leave
2. **Stream API Fallback** - Direct API checks when manual leave is detected
3. **Manual EndCall** (Legacy) - Explicit user action to end the call

## How It Works

### 1. Stream Webhooks (Recommended)

Stream SDK sends webhook events to your application when call events occur:

-   `call.session_participant_joined` - When someone joins
-   `call.session_participant_left` - When someone leaves
-   `call.session_ended` - When the call ends

**Setup Required:**

1. Configure webhook URL in Stream Dashboard:

    ```
    https://yourdomain.com/api/v1/webhooks/stream/events
    ```

2. Subscribe to these events:

    - `call.session_participant_left`
    - `call.session_ended`

3. (Optional) Configure webhook signature verification for security

### 2. Stream API Fallback

When manual `endVideoCall` is called but not all participants have left according to our tracking, the system queries Stream's API directly to check the actual participant count.

### 3. Manual Check Endpoint

For testing/admin purposes, you can manually trigger a participant check:

```http
POST /api/v1/video-call/check-and-complete/{appointmentId}
Authorization: Bearer {token}
```

This endpoint is available to doctors and admins.

## Implementation Details

### Webhook Endpoint

```java
@PostMapping("/api/v1/webhooks/stream/events")
public ResponseEntity<String> handleStreamWebhook(
    @RequestBody Map<String, Object> payload,
    @RequestHeader(value = "X-Stream-Signature", required = false) String signature
)
```

### Automatic Completion Logic

1. **Webhook receives participant left event**
2. **Extract Stream call ID from payload**
3. **Query Stream API for current participant count**
4. **If count = 0:**
    - Mark video call as ended
    - Set appointment status to COMPLETED
    - Add completion note to doctor notes
    - Save changes to database

### Database Changes

The system updates these fields when auto-completing:

**VideoCall table:**

-   `meeting_ended_at` = current timestamp
-   `is_active` = false
-   `patient_left_at` = current timestamp (if null)
-   `provider_left_at` = current timestamp (if null)

**Appointment table:**

-   `status` = COMPLETED
-   `completed_at` = current timestamp
-   `doctor_notes` = appended with completion reason

## Benefits

1. **Reliability** - No dependence on users manually ending calls
2. **Accuracy** - Uses Stream's actual participant tracking
3. **Automatic** - No human intervention required
4. **Fallback** - Multiple mechanisms ensure completion
5. **Audit Trail** - All completions are logged with reason

## Configuration

### Stream Dashboard Setup

1. Go to your Stream Dashboard
2. Navigate to Chat → Webhooks
3. Add webhook URL: `https://yourdomain.com/api/v1/webhooks/stream/events`
4. Select events:
    - `call.session_participant_left`
    - `call.session_ended`
    - `call.session_participant_joined` (optional, for logging)

### Security (Production)

For production environments, enable webhook signature verification:

1. Generate webhook secret in Stream Dashboard
2. Add to application.properties:
    ```properties
    stream.webhook.secret=your-webhook-secret
    ```
3. Implement signature verification in `StreamWebhookController`

## Testing

### Test Webhook Functionality

1. Create a virtual appointment
2. Start video call
3. Have all participants join and then leave
4. Check logs for webhook events
5. Verify appointment status changes to COMPLETED

### Test Manual Check

```bash
curl -X POST \
  https://yourdomain.com/api/v1/video-call/check-and-complete/{appointmentId} \
  -H "Authorization: Bearer {admin-token}"
```

### Test Fallback Mechanism

1. Create appointment and start call
2. Have participants leave without triggering webhooks
3. Call manual `endVideoCall` method
4. Verify fallback API check triggers completion

## Monitoring

The system provides comprehensive logging:

```log
INFO  - Participant John Doe joined call: abc123
INFO  - Participant left call: abc123
DEBUG - Call abc123 has 0 participants remaining
INFO  - No participants remaining in call abc123, completing appointment
INFO  - Successfully completed appointment uuid-456 for call abc123
```

Monitor these logs to ensure automatic completion is working correctly.

## Troubleshooting

### Webhooks Not Received

1. Check Stream Dashboard webhook configuration
2. Verify webhook URL is accessible from internet
3. Check application logs for webhook processing errors
4. Test webhook endpoint manually

### Appointments Not Completing

1. Check if webhooks are being received (logs)
2. Verify Stream call ID mapping in database
3. Test manual completion endpoint
4. Check appointment status and video call state

### False Completions

1. Review participant tracking logic
2. Check for race conditions in webhook processing
3. Verify Stream API participant count accuracy
4. Add additional validation if needed

## Future Enhancements

1. **Webhook Signature Verification** - Enhanced security
2. **Configurable Completion Delay** - Wait X seconds before auto-completing
3. **Participant Tracking History** - Store join/leave timestamps for all participants
4. **Call Recording Integration** - Auto-stop recordings when calls end
5. **Admin Dashboard** - View auto-completion statistics and logs
