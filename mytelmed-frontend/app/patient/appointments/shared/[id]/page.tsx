'use client';

import { useState, useEffect } from 'react';
import { Card, Typography, Avatar, Tag, Spin, Alert, Breadcrumb, Divider } from 'antd';
import {
  CalendarOutlined,
  MedicineBoxOutlined,
  VideoCameraOutlined,
  EnvironmentOutlined,
  UserOutlined,
  HomeOutlined
} from '@ant-design/icons';
import Link from 'next/link';
import dummyAppointments from '@/app/constants/dummy-data/dummyAppointments';
import { Appointment } from '@/app/props';
import { formatDate, formatTime } from '@/app/utils/DateUtils';

const { Title, Text, Paragraph } = Typography;

const statusColors = {
  scheduled: 'blue',
  completed: 'green',
  cancelled: 'red',
  no_show: 'orange'
};

export default function SharedAppointmentPage({ params }: { readonly params: { readonly id: string } }) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In a real app, this would fetch the appointment data from an API
    // For this demo, we'll simulate the API call with dummy data
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log(params.id);

        // Find the appointment in our dummy data
        const foundAppointment = dummyAppointments.find(appt => appt.id === params.id);

        if (!foundAppointment) {
          setError('Appointment not found. It may have been removed or the link is invalid.');
          return;
        }

        setAppointment(foundAppointment);
      } catch (err) {
        setError('Failed to load appointment details. Please try again later.');
        console.error('Error fetching appointment:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" tip="Loading appointment details..." />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto mt-8">
          <Alert
            message="Error"
            description={error || 'Something went wrong.'}
            type="error"
            showIcon
          />
          <div className="mt-4">
            <Link href="/" className="text-blue-500 hover:underline">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusText = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto mt-4">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item href="/">
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>Shared Appointment</Breadcrumb.Item>
        </Breadcrumb>

        <Alert
          message="Shared Appointment Information"
          description="This is a read-only view of a shared medical appointment."
          type="info"
          showIcon
          className="mb-6"
        />

        <Card className="shadow-md">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <Title level={3} className="mb-2 md:mb-0">
              Appointment Details
            </Title>
            <Tag color={statusColors[appointment.status]} className="text-base px-3 py-1">
              {statusText}
            </Tag>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4 mb-6">
            <Avatar
              src={appointment.doctorImage}
              size={80}
              icon={<UserOutlined />}
            />
            <div>
              <Title level={4} className="mb-0">
                Dr. {appointment.doctorName}
              </Title>
              <Text type="secondary" className="text-lg">
                {appointment.doctorSpecialty}
              </Text>
              <div className="mt-1">
                <Text className="text-base">
                  {appointment.facilityName}
                </Text>
              </div>
            </div>
          </div>

          <Divider />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Title level={5}>
                <CalendarOutlined className="text-blue-500 mr-2" />
                Appointment Time
              </Title>
              <div className="ml-8 mb-4">
                <div className="mb-1">
                  <Text strong>Date:</Text> {formatDate(appointment.appointmentDate)}
                </div>
                <div className="mb-1">
                  <Text strong>Time:</Text> {formatTime(appointment.appointmentTime)}
                </div>
                <div>
                  <Text strong>Duration:</Text> {appointment.duration} minutes
                </div>
              </div>

              <Title level={5}>
                <EnvironmentOutlined className="text-blue-500 mr-2" />
                Location
              </Title>
              <div className="ml-8 mb-4">
                <div className="mb-1">
                  <Text strong>Facility:</Text> {appointment.facilityName}
                </div>
                {appointment.mode === 'physical' && (
                  <div className="mb-1">
                    <Text strong>Address:</Text> {appointment.facilityAddress}
                  </div>
                )}
                <div>
                  <Text strong>Type:</Text> {
                    appointment.mode === 'video'
                      ? <span><VideoCameraOutlined className="text-blue-500 mr-1" /> Video Consultation</span>
                      : <span><EnvironmentOutlined className="text-blue-500 mr-1" /> In-person Visit</span>
                  }
                </div>
              </div>
            </div>

            <div>
              <Title level={5}>
                <UserOutlined className="text-blue-500 mr-2" />
                Patient
              </Title>
              <div className="ml-8 mb-4">
                <div>
                  <Text strong>{appointment.patientName}</Text>
                </div>
              </div>

              <Title level={5}>
                <MedicineBoxOutlined className="text-blue-500 mr-2" />
                Medical Information
              </Title>
              <div className="ml-8 mb-4">
                <div className="mb-2">
                  <Text strong>Reason:</Text> {appointment.reason}
                </div>

                {appointment.symptoms.length > 0 && (
                  <div>
                    <Text strong>Symptoms:</Text>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {appointment.symptoms.map(symptom => (
                        <Tag
                          key={symptom.id}
                          color={
                            symptom.severity === 'severe' ? 'red' :
                              symptom.severity === 'moderate' ? 'orange' : 'green'
                          }
                        >
                          {symptom.description} ({symptom.duration})
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {appointment.notes && (
            <>
              <Divider />
              <Title level={5}>Notes</Title>
              <Paragraph>{appointment.notes}</Paragraph>
            </>
          )}

          <Divider />

          <div className="text-sm text-gray-500 text-center mt-4">
            <p>This information is shared securely from MyTelMed. Please do not forward this link to unauthorized individuals.</p>
            <p>Appointment ID: {appointment.id}</p>
          </div>
        </Card>
      </div>
    </div>
  );
} 