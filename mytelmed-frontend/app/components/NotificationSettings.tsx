"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Switch,
  Typography,
  Space,
  Divider,
  TimePicker,
  Alert,
  Button,
  Badge,
  Tooltip,
  Row,
  Col,
} from "antd";
import {
  Bell,
  BellOff,
  Clock,
  Smartphone,
  Volume2,
  VolumeX,
  Vibrate,
  Calendar,
  Pill,
  Settings,
  TestTube,
  Shield,
} from "lucide-react";
import { usePushNotifications } from "../hooks/usePushNotifications";
import { PushNotificationSettings } from "../api/pushNotification/props";
import dayjs from "dayjs";

const { Title, Text } = Typography;

interface NotificationSettingsProps {
  className?: string;
  showTestButton?: boolean;
  onSettingsChange?: (settings: PushNotificationSettings) => void;
}

export default function NotificationSettings({
  className = "",
  showTestButton = true,
  onSettingsChange,
}: Readonly<NotificationSettingsProps>) {
  const {
    isSupported,
    hasPermission,
    isSubscribed,
    isLoading,
    settings,
    subscribe,
    unsubscribe,
    testNotification,
    updateSettings,
    error,
    clearError,
  } = usePushNotifications();

  const [localSettings, setLocalSettings] =
    useState<PushNotificationSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync with hook settings
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  // Check for unsaved changes
  useEffect(() => {
    const changed = JSON.stringify(localSettings) !== JSON.stringify(settings);
    setHasChanges(changed);
  }, [localSettings, settings]);

  /**
   * Handle master toggle for all notifications
   */
  const handleMasterToggle = async (enabled: boolean) => {
    if (enabled && !isSubscribed) {
      // Subscribe to notifications
      const success = await subscribe();
      if (!success) return;
    } else if (!enabled && isSubscribed) {
      // Unsubscribe from notifications
      const success = await unsubscribe();
      if (!success) return;
    }

    const newSettings = { ...localSettings, enabled };
    setLocalSettings(newSettings);
    await saveSettings(newSettings);
  };

  /**
   * Handle appointment settings change
   */
  const handleAppointmentChange = (
    key: keyof typeof localSettings.appointments,
    value: boolean
  ) => {
    const newSettings = {
      ...localSettings,
      appointments: {
        ...localSettings.appointments,
        [key]: value,
      },
    };
    setLocalSettings(newSettings);
  };

  /**
   * Handle prescription settings change
   */
  const handlePrescriptionChange = (
    key: keyof typeof localSettings.prescriptions,
    value: boolean
  ) => {
    const newSettings = {
      ...localSettings,
      prescriptions: {
        ...localSettings.prescriptions,
        [key]: value,
      },
    };
    setLocalSettings(newSettings);
  };

  /**
   * Handle quiet hours settings
   */
  const handleQuietHoursChange = (
    key: keyof typeof localSettings.quiet_hours,
    value: any
  ) => {
    const newSettings = {
      ...localSettings,
      quiet_hours: {
        ...localSettings.quiet_hours,
        [key]: value,
      },
    };
    setLocalSettings(newSettings);
  };

  /**
   * Handle general settings change
   */
  const handleGeneralSettingChange = (
    key: "sound" | "vibration",
    value: boolean
  ) => {
    const newSettings = {
      ...localSettings,
      [key]: value,
    };
    setLocalSettings(newSettings);
  };

  /**
   * Save settings
   */
  const saveSettings = async (
    settingsToSave: PushNotificationSettings = localSettings
  ) => {
    setIsSaving(true);
    clearError();

    try {
      await updateSettings(settingsToSave);
      setHasChanges(false);

      if (onSettingsChange) {
        onSettingsChange(settingsToSave);
      }
    } catch (err) {
      console.error("Failed to save notification settings:", err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Test notification functionality
   */
  const handleTestNotification = async () => {
    setTestingNotification(true);
    clearError();

    try {
      const success = await testNotification();
      if (success) {
        // Show success message could be added here
      }
    } catch (err) {
      console.error("Failed to test notification:", err);
    } finally {
      setTestingNotification(false);
    }
  };

  /**
   * Reset to defaults
   */
  const resetToDefaults = () => {
    setLocalSettings(settings);
    setHasChanges(false);
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <Alert
          message="Push Notifications Not Supported"
          description="Your browser doesn't support push notifications. Please use a modern browser like Chrome, Firefox, or Safari."
          type="warning"
          icon={<BellOff size={16} />}
          showIcon
        />
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Alert */}
      {error && (
        <Alert
          message="Notification Error"
          description={error}
          type="error"
          closable
          onClose={clearError}
          showIcon
        />
      )}

      {/* Master Toggle Card */}
      <Card className="border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <Space size="middle">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              {localSettings.enabled && isSubscribed ? (
                <Bell size={24} className="text-white" />
              ) : (
                <BellOff size={24} className="text-white" />
              )}
            </div>
            <div>
              <Title level={4} className="mb-1">
                Push Notifications
              </Title>
              <Text className="text-gray-600">
                {localSettings.enabled && isSubscribed
                  ? "Stay updated with important healthcare notifications"
                  : "Enable notifications to stay informed about appointments and prescriptions"}
              </Text>
            </div>
          </Space>

          <div className="flex items-center space-x-3">
            {hasChanges && (
              <Badge dot>
                <Button size="small" onClick={resetToDefaults}>
                  Reset
                </Button>
              </Badge>
            )}
            <Switch
              size="default"
              checked={localSettings.enabled && isSubscribed}
              loading={isLoading}
              onChange={handleMasterToggle}
            />
          </div>
        </div>
      </Card>

      {/* Detailed Settings */}
      {localSettings.enabled && (
        <div className="space-y-4">
          {/* Appointment Notifications */}
          <Card
            title={
              <Space>
                <Calendar size={20} className="text-blue-500" />
                <span>Appointment Notifications</span>
              </Space>
            }
            className="border border-gray-200 shadow-sm"
          >
            <div className="space-y-4">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong>Reminders</Text>
                      <br />
                      <Text className="text-xs text-gray-500">
                        Get reminded before appointments
                      </Text>
                    </div>
                    <Switch
                      checked={localSettings.appointments.reminders}
                      onChange={(checked) =>
                        handleAppointmentChange("reminders", checked)
                      }
                      disabled={!localSettings.appointments.enabled}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong>Confirmations</Text>
                      <br />
                      <Text className="text-xs text-gray-500">
                        Appointment booking confirmations
                      </Text>
                    </div>
                    <Switch
                      checked={localSettings.appointments.confirmations}
                      onChange={(checked) =>
                        handleAppointmentChange("confirmations", checked)
                      }
                      disabled={!localSettings.appointments.enabled}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong>Cancellations</Text>
                      <br />
                      <Text className="text-xs text-gray-500">
                        Appointment cancellation notices
                      </Text>
                    </div>
                    <Switch
                      checked={localSettings.appointments.cancellations}
                      onChange={(checked) =>
                        handleAppointmentChange("cancellations", checked)
                      }
                      disabled={!localSettings.appointments.enabled}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong>All Appointments</Text>
                      <br />
                      <Text className="text-xs text-gray-500">
                        Enable all appointment notifications
                      </Text>
                    </div>
                    <Switch
                      checked={localSettings.appointments.enabled}
                      onChange={(checked) =>
                        handleAppointmentChange("enabled", checked)
                      }
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Card>

          {/* Prescription Notifications */}
          <Card
            title={
              <Space>
                <Pill size={20} className="text-green-500" />
                <span>Prescription Notifications</span>
              </Space>
            }
            className="border border-gray-200 shadow-sm"
          >
            <div className="space-y-4">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong>New Prescriptions</Text>
                      <br />
                      <Text className="text-xs text-gray-500">
                        When prescriptions are created
                      </Text>
                    </div>
                    <Switch
                      checked={localSettings.prescriptions.created}
                      onChange={(checked) =>
                        handlePrescriptionChange("created", checked)
                      }
                      disabled={!localSettings.prescriptions.enabled}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong>Expiring Soon</Text>
                      <br />
                      <Text className="text-xs text-gray-500">
                        Before prescriptions expire
                      </Text>
                    </div>
                    <Switch
                      checked={localSettings.prescriptions.expiring}
                      onChange={(checked) =>
                        handlePrescriptionChange("expiring", checked)
                      }
                      disabled={!localSettings.prescriptions.enabled}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong>Delivery Updates</Text>
                      <br />
                      <Text className="text-xs text-gray-500">
                        Prescription delivery status
                      </Text>
                    </div>
                    <Switch
                      checked={localSettings.prescriptions.delivery}
                      onChange={(checked) =>
                        handlePrescriptionChange("delivery", checked)
                      }
                      disabled={!localSettings.prescriptions.enabled}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="flex items-center justify-between">
                    <div>
                      <Text strong>All Prescriptions</Text>
                      <br />
                      <Text className="text-xs text-gray-500">
                        Enable all prescription notifications
                      </Text>
                    </div>
                    <Switch
                      checked={localSettings.prescriptions.enabled}
                      onChange={(checked) =>
                        handlePrescriptionChange("enabled", checked)
                      }
                    />
                  </div>
                </Col>
              </Row>
            </div>
          </Card>

          {/* General Settings */}
          <Card
            title={
              <Space>
                <Settings size={20} className="text-purple-500" />
                <span>General Settings</span>
              </Space>
            }
            className="border border-gray-200 shadow-sm"
          >
            <div className="space-y-6">
              {/* Sound & Vibration */}
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div className="flex items-center justify-between">
                    <Space>
                      {localSettings.sound ? (
                        <Volume2 size={16} />
                      ) : (
                        <VolumeX size={16} />
                      )}
                      <div>
                        <Text strong>Sound</Text>
                        <br />
                        <Text className="text-xs text-gray-500">
                          Play notification sounds
                        </Text>
                      </div>
                    </Space>
                    <Switch
                      checked={localSettings.sound}
                      onChange={(checked) =>
                        handleGeneralSettingChange("sound", checked)
                      }
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12}>
                  <div className="flex items-center justify-between">
                    <Space>
                      <Vibrate size={16} />
                      <div>
                        <Text strong>Vibration</Text>
                        <br />
                        <Text className="text-xs text-gray-500">
                          Vibrate on notifications
                        </Text>
                      </div>
                    </Space>
                    <Switch
                      checked={localSettings.vibration}
                      onChange={(checked) =>
                        handleGeneralSettingChange("vibration", checked)
                      }
                    />
                  </div>
                </Col>
              </Row>

              <Divider />

              {/* Quiet Hours */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Space>
                    <Clock size={16} />
                    <div>
                      <Text strong>Quiet Hours</Text>
                      <br />
                      <Text className="text-xs text-gray-500">
                        Silence notifications during specified hours
                      </Text>
                    </div>
                  </Space>
                  <Switch
                    checked={localSettings.quiet_hours.enabled}
                    onChange={(checked) =>
                      handleQuietHoursChange("enabled", checked)
                    }
                  />
                </div>

                {localSettings.quiet_hours.enabled && (
                  <Row gutter={[16, 16]} className="ml-6">
                    <Col xs={12} sm={8}>
                      <div>
                        <Text className="text-sm text-gray-600 block mb-2">
                          Start Time
                        </Text>
                        <TimePicker
                          format="HH:mm"
                          value={dayjs(
                            localSettings.quiet_hours.start,
                            "HH:mm"
                          )}
                          onChange={(time) =>
                            handleQuietHoursChange(
                              "start",
                              time?.format("HH:mm") || "22:00"
                            )
                          }
                          size="small"
                          className="w-full"
                        />
                      </div>
                    </Col>
                    <Col xs={12} sm={8}>
                      <div>
                        <Text className="text-sm text-gray-600 block mb-2">
                          End Time
                        </Text>
                        <TimePicker
                          format="HH:mm"
                          value={dayjs(localSettings.quiet_hours.end, "HH:mm")}
                          onChange={(time) =>
                            handleQuietHoursChange(
                              "end",
                              time?.format("HH:mm") || "08:00"
                            )
                          }
                          size="small"
                          className="w-full"
                        />
                      </div>
                    </Col>
                  </Row>
                )}
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <Card className="border border-gray-200 shadow-sm">
            <Row gutter={[16, 16]} justify="space-between" align="middle">
              <Col>
                <Space>
                  {hasChanges && (
                    <Button
                      type="primary"
                      loading={isSaving}
                      onClick={() => saveSettings()}
                      icon={<Shield size={16} />}
                    >
                      Save Changes
                    </Button>
                  )}

                  {showTestButton && isSubscribed && (
                    <Tooltip title="Send a test notification to verify everything is working">
                      <Button
                        type="default"
                        loading={testingNotification}
                        onClick={handleTestNotification}
                        icon={<TestTube size={16} />}
                      >
                        Test Notification
                      </Button>
                    </Tooltip>
                  )}
                </Space>
              </Col>

              <Col>
                <Space className="text-xs text-gray-500">
                  <Smartphone size={12} />
                  <Text className="text-xs">
                    {hasPermission
                      ? "✓ Permission granted"
                      : "⚠ Permission needed"}
                  </Text>
                  {isSubscribed && (
                    <Text className="text-xs">• ✓ Subscribed</Text>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </div>
      )}

      {/* Information Card */}
      {!hasPermission && (
        <Card className="border border-blue-200 bg-blue-50">
          <Alert
            message="Enable Push Notifications"
            description="To receive important updates about your appointments and prescriptions, please enable push notifications by clicking the toggle above."
            type="info"
            showIcon
            icon={<Bell size={16} />}
          />
        </Card>
      )}
    </div>
  );
}
