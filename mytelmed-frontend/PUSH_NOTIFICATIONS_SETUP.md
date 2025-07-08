# 🔔 Push Notifications Setup Guide

This document provides comprehensive instructions for setting up production-ready push notifications in the MyTelmed PWA.

## 📋 **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Backend Configuration](#backend-configuration)
3. [Frontend Configuration](#frontend-configuration)
4. [VAPID Keys Setup](#vapid-keys-setup)
5. [Environment Variables](#environment-variables)
6. [Testing Push Notifications](#testing-push-notifications)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

## 🔧 **Prerequisites**

### **Browser Support**

- Chrome 50+
- Firefox 44+
- Safari 16+
- Edge 17+

### **Required Features**

- HTTPS (required for push notifications)
- Service Worker support
- Push Manager API
- Notification API

### **Backend Requirements**

- VAPID keys configured
- Push subscription endpoints available
- Notification sending service

## 🚀 **Backend Configuration**

### **1. VAPID Keys**

The backend should already have VAPID keys configured. Verify these endpoints exist:

```bash
# Subscription management
POST /api/push-subscriptions/subscribe
DELETE /api/push-subscriptions/unsubscribe?endpoint=...
DELETE /api/push-subscriptions/unsubscribe/all

# Notification sending (backend internal)
POST /api/notifications/send
```

### **2. Get VAPID Public Key**

You need the VAPID public key from your backend configuration. Check:

```java
// In VapidConfiguration.java
@Value("${application.push.vapid.public-key}")
private String vapidPublicKey;
```

## 🎨 **Frontend Configuration**

### **1. Environment Variables**

Create a `.env.local` file in the frontend root:

```bash
# API Configuration
NEXT_PUBLIC_API_ENDPOINT=https://your-backend.com/api
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend.com

# Push Notification Configuration
NEXT_PUBLIC_VAPID_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY_HERE

# Optional Configuration
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
NEXT_PUBLIC_NOTIFICATION_DEFAULT_ICON=/assets/logos/mytelmed-logo.png
```

### **2. Required Dependencies**

The following dependencies are already included:

```json
{
  "@ducanh2912/next-pwa": "^10.2.9",
  "antd": "^5.25.1",
  "dayjs": "latest"
}
```

### **3. Service Worker Registration**

The service worker is automatically registered by Next.js PWA. Verify in browser DevTools:

```javascript
// Check in browser console
navigator.serviceWorker.getRegistrations().then((registrations) => {
  console.log("Service workers:", registrations);
});
```

## 🔑 **VAPID Keys Setup**

### **1. Backend VAPID Configuration**

Ensure your backend has VAPID keys configured in `application.properties`:

```properties
# Push notification configuration
application.push.vapid.public-key=YOUR_PUBLIC_KEY
application.push.vapid.private-key=YOUR_PRIVATE_KEY
application.push.vapid.subject=mailto:your-email@domain.com
application.push.notifications.enabled=true
```

### **2. Frontend VAPID Configuration**

Add the public key to your environment variables:

```bash
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNXxUuUAF8_TqjFWXX6r7dS2X6PkXX7GJgXXU8tXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**⚠️ Security Note:** Only the public key should be in the frontend. The private key stays on the backend.

## 🛠 **Environment Variables**

### **Required Variables**

```bash
# Essential for push notifications
NEXT_PUBLIC_API_ENDPOINT=https://api.mytelmed.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

### **Optional Variables**

```bash
# Feature toggles
NEXT_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=false

# Customization
NEXT_PUBLIC_NOTIFICATION_DEFAULT_ICON=/assets/logos/mytelmed-logo.png
NEXT_PUBLIC_NOTIFICATION_DEFAULT_BADGE=/assets/logos/mytelmed-logo.png

# Service worker settings
NEXT_PUBLIC_SW_UPDATE_POPUP=true
NEXT_PUBLIC_SW_SKIP_WAITING=true
```

## 🧪 **Testing Push Notifications**

### **1. Development Testing**

```typescript
// In your component
import { usePushNotifications } from "@/app/hooks/usePushNotifications";

function TestComponent() {
  const { subscribe, testNotification, isSubscribed } = usePushNotifications();

  const handleTest = async () => {
    if (!isSubscribed) {
      await subscribe();
    }
    await testNotification();
  };

  return <button onClick={handleTest}>Test Notification</button>;
}
```

### **2. Browser DevTools Testing**

```javascript
// Open browser console and test
const registration = await navigator.serviceWorker.ready;

// Test notification
registration.showNotification("Test", {
  body: "This is a test notification",
  icon: "/assets/logos/mytelmed-logo.png",
});
```

### **3. Using the Settings Component**

```typescript
import NotificationSettings from "@/app/components/NotificationSettings";

function SettingsPage() {
  return (
    <div>
      <h1>Notification Settings</h1>
      <NotificationSettings showTestButton={true} />
    </div>
  );
}
```

## 🚀 **Production Deployment**

### **1. HTTPS Requirement**

Push notifications require HTTPS in production:

```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name mytelmed.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### **2. Service Worker Scope**

Ensure service worker is served from root:

```javascript
// Verify service worker scope
navigator.serviceWorker.register("/sw.js", {
  scope: "/", // Important: serves entire app
});
```

### **3. Manifest.json Validation**

Verify your PWA manifest:

```bash
# Use Chrome DevTools
# Application tab > Manifest
# Check for errors and warnings
```

### **4. Build Configuration**

```json
{
  "scripts": {
    "build": "next build",
    "build:analyze": "ANALYZE=true next build",
    "lighthouse": "lighthouse https://mytelmed.com --output html"
  }
}
```

## 🔧 **Usage Examples**

### **1. Basic Usage in Components**

```typescript
import { usePushNotifications } from "@/app/hooks/usePushNotifications";

function NotificationButton() {
  const {
    isSupported,
    hasPermission,
    isSubscribed,
    subscribe,
    unsubscribe,
    error,
  } = usePushNotifications();

  if (!isSupported) {
    return <div>Push notifications not supported</div>;
  }

  return (
    <div>
      {error && <div className="error">{error}</div>}

      {!isSubscribed ? (
        <button onClick={subscribe}>Enable Notifications</button>
      ) : (
        <button onClick={unsubscribe}>Disable Notifications</button>
      )}
    </div>
  );
}
```

### **2. Settings Management**

```typescript
import NotificationSettings from "@/app/components/NotificationSettings";

function UserSettings() {
  return (
    <div className="settings-page">
      <h2>Notification Preferences</h2>
      <NotificationSettings
        showTestButton={true}
        onSettingsChange={(settings) => {
          console.log("Settings updated:", settings);
        }}
      />
    </div>
  );
}
```

### **3. Auto-Subscribe New Users**

```typescript
useEffect(() => {
  const autoSubscribe = async () => {
    if (isNewUser && isSupported && !isSubscribed) {
      const success = await subscribe();
      if (success) {
        showSuccessMessage("Notifications enabled!");
      }
    }
  };

  autoSubscribe();
}, [isNewUser, isSupported, isSubscribed]);
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. "Push notifications not supported"**

```javascript
// Check browser support
console.log("Notification" in window); // Should be true
console.log("serviceWorker" in navigator); // Should be true
console.log("PushManager" in window); // Should be true
```

#### **2. "Permission denied"**

```javascript
// Check permission status
console.log(Notification.permission); // Should be 'granted'

// Reset permission (user must do this manually)
// Chrome: Site Settings > Notifications > Reset
```

#### **3. "Subscription failed"**

```javascript
// Check VAPID key format
const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
console.log("VAPID key length:", vapidKey?.length); // Should be ~88 chars
console.log("VAPID key starts with B:", vapidKey?.startsWith("B")); // Should be true
```

#### **4. "Service worker not found"**

```javascript
// Check service worker registration
navigator.serviceWorker.getRegistrations().then((regs) => {
  console.log("Registered service workers:", regs);
});
```

### **Debug Mode**

Enable debug logging:

```bash
NEXT_PUBLIC_ENABLE_DEBUG_LOGS=true
```

### **Network Issues**

Check network requests in DevTools:

```javascript
// Monitor push subscription requests
// Network tab > Filter by "push-subscriptions"
```

## 📊 **Monitoring & Analytics**

### **1. Notification Metrics**

Track notification performance:

```typescript
// In your analytics
const trackNotificationEvent = (event: string, data: any) => {
  analytics.track("Push Notification", {
    event,
    notificationType: data.type,
    timestamp: Date.now(),
    userId: data.userId,
  });
};
```

### **2. Error Monitoring**

```typescript
// Use Sentry or similar
import * as Sentry from "@sentry/nextjs";

Sentry.captureException(new Error("Push notification failed"), {
  tags: { feature: "push-notifications" },
  extra: { subscription, error },
});
```

## 🔒 **Security Best Practices**

1. **Never expose private VAPID key** in frontend
2. **Validate all user inputs** before sending to backend
3. **Use HTTPS** in production
4. **Implement rate limiting** for subscription endpoints
5. **Validate subscription endpoints** before storing
6. **Sanitize notification content** to prevent XSS

## 📞 **Support**

If you encounter issues:

1. Check browser console for errors
2. Verify environment variables
3. Test in incognito mode
4. Check service worker registration
5. Validate VAPID keys with backend team

For additional support, contact the development team with:

- Browser version and OS
- Console error messages
- Steps to reproduce the issue
- Service worker registration status
