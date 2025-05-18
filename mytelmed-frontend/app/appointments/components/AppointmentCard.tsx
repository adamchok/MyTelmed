'use client';

import { Card, Badge, Button, Tooltip, Space, Typography, Avatar, Tag } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined,
  VideoCameraOutlined,
  EnvironmentOutlined,
  EditOutlined,
  CloseOutlined,
  UserOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import { AppointmentCardProps } from '../props';
import { formatDate, formatTime } from '@/app/utils/DateUtils';

const { Text, Title } = Typography;

const statusColors = {
  scheduled: 'blue',
  completed: 'green',
  cancelled: 'red',
  no_show: 'orange'
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancel,
  onReschedule,
  onUpdateDetails,
  onShare,
  showActions
}) => {
  const isUpcoming = appointment.status === 'scheduled';
  const statusText = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);

  return (
    <Badge.Ribbon
      text={statusText}
      color={statusColors[appointment.status]}
      className="z-10"
    >
      <Card
        className="mb-4 shadow-sm hover:shadow-md transition-shadow"
        actions={showActions && isUpcoming ? [
          <Tooltip title="Update Details" key="edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onUpdateDetails(appointment)}
            >
              Update
            </Button>
          </Tooltip>,
          <Tooltip title="Reschedule" key="reschedule">
            <Button
              type="text"
              icon={<CalendarOutlined />}
              onClick={() => onReschedule(appointment)}
            >
              Reschedule
            </Button>
          </Tooltip>,
          <Tooltip title="Share Appointment" key="share">
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              onClick={() => onShare(appointment)}
            >
              Share
            </Button>
          </Tooltip>,
          <Tooltip title="Cancel Appointment" key="cancel">
            <Button
              type="text"
              danger
              icon={<CloseOutlined />}
              onClick={() => onCancel(appointment.id)}
            >
              Cancel
            </Button>
          </Tooltip>
        ] : undefined}
      >
        <div className="flex items-start mb-4">
          <Avatar
            src={appointment.doctorImage}
            size={64}
            icon={<UserOutlined />}
            className="mr-4"
          />
          <div>
            <Title level={5} className="mb-0 mt-0">
              {appointment.doctorName}
            </Title>
            <Text type="secondary">{appointment.doctorSpecialty}</Text>
            <div>
              <Link
                href={`/browse/facilities?search=${encodeURIComponent(appointment.facilityName)}`}
                className="text-blue-500 hover:text-blue-700 hover:underline"
              >
                {appointment.facilityName}
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div>
            <Space direction="vertical" size="small">
              <div className="flex items-center">
                <CalendarOutlined className="mr-2 text-blue-500" />
                <Text>{formatDate(appointment.appointmentDate)}</Text>
              </div>
              <div className="flex items-center">
                <ClockCircleOutlined className="mr-2 text-blue-500" />
                <Text>{formatTime(appointment.appointmentTime)} ({appointment.duration} min)</Text>
              </div>
              <div className="flex items-center">
                {appointment.mode === 'video' ? (
                  <VideoCameraOutlined className="mr-2 text-blue-500" />
                ) : (
                  <EnvironmentOutlined className="mr-2 text-blue-500" />
                )}
                <Text>{appointment.mode === 'video' ? 'Video Consultation' : 'In-person Visit'}</Text>
              </div>
              {appointment.mode === 'physical' && (
                <div className="flex items-start">
                  <EnvironmentOutlined className="mr-2 text-blue-500 mt-1" />
                  <Text className="text-gray-600" style={{ fontSize: '0.9rem' }}>
                    {appointment.facilityAddress}
                  </Text>
                </div>
              )}
            </Space>
          </div>

          <div>
            <Space direction="vertical" size="small">
              <div className="flex items-center">
                <UserOutlined className="mr-2 text-blue-500" />
                <Text>Patient: {appointment.patientName}</Text>
              </div>
              <div className="flex items-center">
                <MedicineBoxOutlined className="mr-2 text-blue-500" />
                <Text>Reason: {appointment.reason}</Text>
              </div>
              {appointment.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {appointment.symptoms.map(symptom => (
                    <Tag
                      key={symptom.id}
                      color={
                        symptom.severity === 'severe' ? 'red' :
                          symptom.severity === 'moderate' ? 'orange' : 'green'
                      }
                    >
                      {symptom.description}
                    </Tag>
                  ))}
                </div>
              )}
            </Space>
          </div>
        </div>

        {!showActions && (
          <div className="flex justify-end mt-2">
            <Space>
              <Button
                type="link"
                onClick={() => onUpdateDetails(appointment)}
              >
                View Details
              </Button>
              {isUpcoming && (
                <Button
                  type="link"
                  icon={<ShareAltOutlined />}
                  onClick={() => onShare(appointment)}
                >
                  Share
                </Button>
              )}
            </Space>
          </div>
        )}
      </Card>
    </Badge.Ribbon>
  );
};

export default AppointmentCard; 