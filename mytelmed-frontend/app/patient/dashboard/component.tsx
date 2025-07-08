'use client';

import { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Statistic, Button, List, Tag, Calendar, Badge, Empty } from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  RightOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import type { Dayjs } from 'dayjs';

const { Title, Text } = Typography;

// Mock data (in real app, this would come from API)
const upcomingAppointments = [
  {
    id: '1',
    doctorName: 'Dr. Michael Chang',
    specialty: 'Cardiology',
    date: '2023-11-15',
    time: '10:00 AM',
    facility: 'Central Medical Center',
    status: 'confirmed'
  },
  {
    id: '2',
    doctorName: 'Dr. Lisa Wong',
    specialty: 'Dermatology',
    date: '2023-11-20',
    time: '2:30 PM',
    facility: 'Harbor Skin Clinic',
    status: 'pending'
  }
];

const activeReferrals = [
  {
    id: '1',
    type: 'Cardiology Consultation',
    referringDoctor: 'Dr. Michael Chang',
    expiryDate: '2023-12-01',
    daysRemaining: 25
  },
  {
    id: '3',
    type: 'Orthopedic Assessment',
    referringDoctor: 'Dr. David Martinez',
    expiryDate: '2024-01-20',
    daysRemaining: 75
  }
];

const recentMedicalRecords = [
  {
    id: '1',
    type: 'Lab Results',
    date: '2023-10-30',
    provider: 'Central Medical Center'
  },
  {
    id: '2',
    type: 'Prescription',
    date: '2023-10-25',
    provider: 'Dr. Lisa Wong'
  }
];

// Format dates for better display
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

interface ListData {
  type: string;
  content: string;
}

const getListData = (value: Dayjs): ListData[] => {
  const listData: ListData[] = [];

  // Convert appointments to calendar events
  upcomingAppointments.forEach(appointment => {
    if (value.format('YYYY-MM-DD') === appointment.date) {
      listData.push({
        type: 'success',
        content: `${appointment.time} - ${appointment.doctorName}`
      });
    }
  });

  return listData;
};

const dateCellRender = (value: Dayjs) => {
  const listData = getListData(value);
  return (
    <ul className="events">
      {listData.map((item, index) => (
        <li key={index}>
          <Badge status={item.type as any} text={item.content} />
        </li>
      ))}
    </ul>
  );
};

const Component = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-center items-center">
        <Title level={2} className="my-4 text-blue-900 dark:text-blue-100">Dashboard</Title>
      </div>

      {/* Quick Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={8}>
          <Card loading={loading}>
            <Statistic
              title="Upcoming Appointments"
              value={upcomingAppointments.length}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card loading={loading}>
            <Statistic
              title="Active Referrals"
              value={activeReferrals.length}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card loading={loading}>
            <Statistic
              title="Medical Records"
              value={recentMedicalRecords.length}
              prefix={<MedicineBoxOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24}>
          <Card
            title={<Title level={4} className="m-0">Quick Actions</Title>}
            loading={loading}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link href="/browse/doctors" className="no-underline">
                <Card
                  hoverable
                  className="text-center py-4 h-full flex flex-col justify-center"
                >
                  <CalendarOutlined className="text-2xl text-blue-500 mb-2" />
                  <Text strong>Book Appointment</Text>
                </Card>
              </Link>
              <Link href="/medical-records" className="no-underline">
                <Card
                  hoverable
                  className="text-center py-4 h-full flex flex-col justify-center"
                >
                  <FileTextOutlined className="text-2xl text-blue-500 mb-2" />
                  <Text strong>View Medical Records</Text>
                </Card>
              </Link>
              <Link href="/referrals" className="no-underline">
                <Card
                  hoverable
                  className="text-center py-4 h-full flex flex-col justify-center"
                >
                  <MedicineBoxOutlined className="text-2xl text-blue-500 mb-2" />
                  <Text strong>Manage Referrals</Text>
                </Card>
              </Link>
              <Link href="/family-access" className="no-underline">
                <Card
                  hoverable
                  className="text-center py-4 h-full flex flex-col justify-center"
                >
                  <UserOutlined className="text-2xl text-blue-500 mb-2" />
                  <Text strong>Family Access</Text>
                </Card>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Content Rows */}
      <Row gutter={[16, 16]}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          {/* Upcoming Appointments */}
          <Card
            title={<Title level={4} className="m-0">Upcoming Appointments</Title>}
            extra={<Link href="/appointments">View All</Link>}
            className="mb-6"
            loading={loading}
          >
            {upcomingAppointments.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={upcomingAppointments}
                renderItem={(appointment) => (
                  <List.Item
                    actions={[
                      <Link key="view" href={`/appointments/${appointment.id}`}>
                        View Details
                      </Link>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <div className="flex items-center">
                          <span>{appointment.doctorName}</span>
                          <Tag
                            color={appointment.status === 'confirmed' ? 'green' : 'orange'}
                            className="ml-2"
                          >
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <div><CalendarOutlined className="mr-2" />{formatDate(appointment.date)} at {appointment.time}</div>
                          <div><MedicineBoxOutlined className="mr-2" />{appointment.specialty} - {appointment.facility}</div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-4">
                <Text>No upcoming appointments</Text>
                <div className="mt-2">
                  <Link href="/browse/doctors">
                    <Button type="primary" icon={<PlusOutlined />}>Book an Appointment</Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>

          {/* Calendar View */}
          <Card
            title={<Title level={4} className="m-0">Calendar</Title>}
            className="mb-6"
            loading={loading}
          >
            <Calendar fullscreen={false} cellRender={dateCellRender} />
          </Card>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          {/* Active Referrals */}
          <Card
            title={<Title level={4} className="m-0">Active Referrals</Title>}
            extra={<Link href="/referrals">View All</Link>}
            className="mb-6"
            loading={loading}
          >
            <List
              itemLayout="vertical"
              dataSource={activeReferrals}
              renderItem={(referral) => (
                <List.Item>
                  <div>
                    <Text strong>{referral.type}</Text>
                    <div className="text-sm">
                      <UserOutlined className="mr-1" /> {referral.referringDoctor}
                    </div>
                    <div className="text-sm mt-1">
                      <ClockCircleOutlined className="mr-1" /> Expires: {formatDate(referral.expiryDate)}
                      <Text
                        type={referral.daysRemaining < 7 ? "danger" : "secondary"}
                        strong={referral.daysRemaining < 7}
                        className="ml-2"
                      >
                        ({referral.daysRemaining} days)
                      </Text>
                    </div>
                    <div className="mt-2">
                      <Link href={`/browse/doctors?referral=${referral.id}`}>
                        <Button type="primary" size="small">
                          Use Referral <RightOutlined />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </List.Item>
              )}
            />
            {activeReferrals.length === 0 && (
              <Empty description="No active referrals" />
            )}
          </Card>

          {/* Recent Medical Records */}
          <Card
            title={<Title level={4} className="m-0">Recent Medical Records</Title>}
            extra={<Link href="/medical-records">View All</Link>}
            loading={loading}
          >
            <List
              itemLayout="horizontal"
              dataSource={recentMedicalRecords}
              renderItem={(record) => (
                <List.Item>
                  <List.Item.Meta
                    title={record.type}
                    description={
                      <div>
                        <CalendarOutlined className="mr-1" /> {formatDate(record.date)}
                        <br />
                        <MedicineBoxOutlined className="mr-1" /> {record.provider}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            {recentMedicalRecords.length === 0 && (
              <Empty description="No recent medical records" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Component;
