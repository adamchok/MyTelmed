'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, DatePicker, Radio, Button, Alert, Typography, Space } from 'antd';
import dayjs from 'dayjs';
import { RescheduleModalProps } from '../props';

const { Title, Text } = Typography;

const RescheduleModal: React.FC<RescheduleModalProps> = ({
  appointment,
  isVisible,
  onClose,
  onReschedule,
  availableTimes
}) => {
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlotsForDate, setAvailableSlotsForDate] = useState<string[]>([]);

  // Reset form when modal opens with a new appointment
  useEffect(() => {
    if (isVisible && appointment) {
      form.resetFields();
      // Set default selected date to the appointment's date
      setSelectedDate(appointment.appointmentDate);
    }
  }, [isVisible, appointment, form]);

  // Update available slots when the selected date changes
  useEffect(() => {
    if (selectedDate) {
      // In a real app, we would fetch available times for this date from the API
      // For now, we'll use the availableTimes prop directly
      setAvailableSlotsForDate(availableTimes);
    }
  }, [selectedDate, availableTimes]);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      const dateString = date.format('YYYY-MM-DD');
      setSelectedDate(dateString);
      form.setFieldValue('time', null);
    } else {
      setSelectedDate('');
    }
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      if (appointment) {
        const newDate = values.date.format('YYYY-MM-DD');
        const newTime = values.time;
        onReschedule(appointment, newDate, newTime);
        onClose();
      }
    });
  };

  if (!appointment) return null;

  return (
    <Modal
      title={<Title className="mt-2" level={4}>Reschedule Appointment</Title>}
      open={isVisible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          date: dayjs(appointment.appointmentDate),
          time: appointment.appointmentTime
        }}
        onFinish={handleSubmit}
      >
        <div className="mb-4">
          <Space direction="vertical" className="w-full">
            <Text>
              Current appointment: <strong>{appointment.doctorName}</strong> on{' '}
              <strong>{dayjs(appointment.appointmentDate).format('MMMM D, YYYY')}</strong> at{' '}
              <strong>{dayjs(`2000-01-01T${appointment.appointmentTime}`).format('h:mm A')}</strong>
            </Text>
          </Space>
        </div>

        <Alert
          message="Please note"
          description="Rescheduling is subject to doctor availability. Some time slots may not be available."
          type="info"
          showIcon
          className="mb-4"
        />

        <Form.Item
          name="date"
          label="New Appointment Date"
          rules={[{ required: true, message: 'Please select a date' }]}
        >
          <DatePicker
            onChange={handleDateChange}
            className="w-full"
            disabledDate={(current) => {
              // Can't select days before today
              return current && current < dayjs().startOf('day');
            }}
            format="YYYY-MM-DD"
            placement="bottomRight"
            popupStyle={{ zIndex: "2000 !important" }}
          />
        </Form.Item>

        <Form.Item
          name="time"
          label="New Appointment Time"
          rules={[{ required: true, message: 'Please select a time slot' }]}
        >
          <Radio.Group disabled={!selectedDate}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {availableSlotsForDate.map(time => (
                <Radio.Button key={time} value={time} className="text-center mb-2">
                  {dayjs(`2000-01-01T${time}`).format('h:mm A')}
                </Radio.Button>
              ))}
            </div>
          </Radio.Group>
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit">
            Reschedule
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default RescheduleModal; 