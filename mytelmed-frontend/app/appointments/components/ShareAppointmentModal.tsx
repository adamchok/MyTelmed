'use client';

import { useState } from 'react';
import { Modal, Typography, Button, Input, Space, message, Tooltip, QRCode } from 'antd';
import {
  ShareAltOutlined,
  CopyOutlined,
  WhatsAppOutlined,
  MailOutlined,
  FacebookOutlined,
  TwitterOutlined
} from '@ant-design/icons';
import { Appointment } from '@/app/props';
import { formatDate, formatTime } from '@/app/utils/DateUtils';

const { Title, Text, Paragraph } = Typography;

export interface ShareAppointmentModalProps {
  appointment: Appointment | null;
  isVisible: boolean;
  onClose: () => void;
}

const ShareAppointmentModal: React.FC<ShareAppointmentModalProps> = ({
  appointment,
  isVisible,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!appointment) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}/appointments/shared/${appointment.id}`;

  const appointmentDetails = `
Appointment with Dr. ${appointment.doctorName} (${appointment.doctorSpecialty})
Date: ${formatDate(appointment.appointmentDate)}
Time: ${formatTime(appointment.appointmentTime)}
Location: ${appointment.facilityName}
Mode: ${appointment.mode === 'video' ? 'Video Consultation' : 'In-person Visit'}
  `.trim();

  const shareText = `I have an upcoming appointment. Details: ${appointmentDetails}`;
  const encodedShareText = encodeURIComponent(shareText);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    message.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodedShareText}%0A%0AView details: ${encodeURIComponent(shareUrl)}`);
  };

  const shareViaEmail = () => {
    window.open(`mailto:?subject=My Medical Appointment&body=${encodedShareText}%0A%0AView details: ${encodeURIComponent(shareUrl)}`);
  };

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  const shareViaTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodedShareText}&url=${encodeURIComponent(shareUrl)}`);
  };

  return (
    <Modal
      title={(
        <div className="flex items-center">
          <ShareAltOutlined className="mr-2 text-blue-500" />
          <span>Share Appointment Details</span>
        </div>
      )}
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
    >
      <div className="py-2">
        <div className="mb-4">
          <Title level={5} className="mb-1">Appointment Summary</Title>
          <div className="p-4 bg-gray-50 rounded-lg mb-3">
            <Paragraph>
              <div className="font-semibold">Doctor: {appointment.doctorName}</div>
              <div>Specialty: {appointment.doctorSpecialty}</div>
              <div>Date: {formatDate(appointment.appointmentDate)}</div>
              <div>Time: {formatTime(appointment.appointmentTime)}</div>
              <div>Mode: {appointment.mode === 'video' ? 'Video Consultation' : 'In-person Visit'}</div>
              <div>Location: {appointment.facilityName}</div>
            </Paragraph>
          </div>
          <Text type="secondary">
            Share this appointment with family members or caregivers.
            The shared view is read-only.
          </Text>
        </div>

        <div className="mb-6">
          <Title level={5} className="mb-1">Share Link</Title>
          <Space.Compact className="w-full">
            <Input
              value={shareUrl}
              readOnly
            />
            <Tooltip title={copied ? "Copied!" : "Copy Link"}>
              <Button icon={<CopyOutlined />} onClick={handleCopyLink} />
            </Tooltip>
          </Space.Compact>
        </div>

        <div className="mb-6">
          <Title level={5} className="mb-3">Share via QR Code</Title>
          <div className="flex justify-center">
            <QRCode value={shareUrl} size={150} />
          </div>
        </div>

        <Title level={5} className="mb-3">Share via</Title>
        <div className="flex flex-wrap gap-2">
          <Button
            type="primary"
            icon={<WhatsAppOutlined />}
            onClick={shareViaWhatsApp}
            style={{ backgroundColor: '#25D366' }}
          >
            WhatsApp
          </Button>
          <Button
            type="primary"
            icon={<MailOutlined />}
            onClick={shareViaEmail}
            style={{ backgroundColor: '#D44638' }}
          >
            Email
          </Button>
          <Button
            type="primary"
            icon={<FacebookOutlined />}
            onClick={shareViaFacebook}
            style={{ backgroundColor: '#1877F2' }}
          >
            Facebook
          </Button>
          <Button
            type="primary"
            icon={<TwitterOutlined />}
            onClick={shareViaTwitter}
            style={{ backgroundColor: '#1DA1F2' }}
          >
            Twitter
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareAppointmentModal; 