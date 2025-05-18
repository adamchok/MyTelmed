'use client';

import { useState, useMemo } from 'react';
import { Button, Card, Form, Input, Radio, Select, Typography, Divider, Alert, Spin, Steps } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, FileTextOutlined, MedicineBoxOutlined, MessageOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import { PatientSymptom, AppointmentMode } from '../props';
import { BookingPageProps, BookingFormValues } from './props';
import SymptomInput from './components/SymptomInput';
import DocumentSelector from './components/DocumentSelector';
import ReferralSelector from './components/ReferralSelector';
import TimeSlotSelector from './components/TimeSlotSelector';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

const BookingComponent: React.FC<BookingPageProps> = ({
  isLoading,
  doctor,
  availableTimes,
  bookingDate,
  bookingType,
  medicalRecords,
  referrals,
  onSubmitBooking
}) => {
  const [form] = Form.useForm();
  const [selectedTime, setSelectedTime] = useState<string>(availableTimes[0] || '');
  const [symptoms, setSymptoms] = useState<PatientSymptom[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [newDocuments, setNewDocuments] = useState<File[]>([]);
  const [selectedReferral, setSelectedReferral] = useState<string | undefined>(undefined);
  const [bookingMode, setBookingMode] = useState<AppointmentMode>(
    bookingType === 'both' ? 'video' : bookingType === 'video' ? 'video' : 'physical'
  );
  const [currentStep, setCurrentStep] = useState(0);

  // Check which booking modes are available
  const canBook = useMemo(() => {
    return {
      video: bookingType === 'video' || bookingType === 'both',
      physical: bookingType === 'physical' || bookingType === 'both'
    };
  }, [bookingType]);

  // Handle adding a symptom
  const handleAddSymptom = (symptom: PatientSymptom) => {
    setSymptoms([...symptoms, { ...symptom, id: uuidv4() }]);
  };

  // Handle removing a symptom
  const handleRemoveSymptom = (id: string) => {
    setSymptoms(symptoms.filter(symptom => symptom.id !== id));
  };

  // Handle selecting/deselecting a medical record
  const handleSelectRecord = (recordId: string, selected: boolean) => {
    if (selected) {
      setSelectedRecords([...selectedRecords, recordId]);
    } else {
      setSelectedRecords(selectedRecords.filter(id => id !== recordId));
    }
  };

  // Handle adding a new document
  const handleAddNewDocument = (file: File) => {
    setNewDocuments([...newDocuments, file]);
  };

  // Handle removing a new document
  const handleRemoveNewDocument = (index: number) => {
    setNewDocuments(newDocuments.filter((_, i) => i !== index));
  };

  // Handle selecting a referral
  const handleSelectReferral = (referralId: string) => {
    setSelectedReferral(referralId);
  };

  // Handle time selection
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Handle form submission
  const handleSubmit = () => {
    form.validateFields().then(values => {
      const formValues: BookingFormValues = {
        symptoms,
        reason: values.reason,
        selectedRecords,
        selectedReferral,
        newDocuments,
        bookingMode,
        date: bookingDate,
        time: selectedTime
      };

      onSubmitBooking(formValues);
    });
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Conditional rendering for the booking component content based on step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Appointment details
        return (
          <>
            <div className="mb-6">
              <Title level={4} className="mb-2">Appointment Details</Title>
              <Card className="mb-4">
                <div className="mb-3">
                  <Text strong>Appointment Date:</Text>
                  <div className="text-blue-600 flex items-center gap-2">
                    <CalendarOutlined /> {bookingDate}
                  </div>
                </div>

                <div className="mb-3">
                  <Text strong>Select Time:</Text>
                  <TimeSlotSelector
                    date={bookingDate}
                    availableTimes={availableTimes}
                    selectedTime={selectedTime}
                    onTimeSelect={handleTimeSelect}
                  />
                </div>

                {bookingType === 'both' && (
                  <div className="mb-3">
                    <Text strong>Appointment Type:</Text>
                    <Radio.Group
                      onChange={(e) => setBookingMode(e.target.value)}
                      value={bookingMode}
                      className="mt-2 flex flex-wrap gap-2"
                    >
                      <Radio.Button value="video" disabled={!canBook.video}>
                        Video Consultation
                      </Radio.Button>
                      <Radio.Button value="physical" disabled={!canBook.physical}>
                        In-Person Visit
                      </Radio.Button>
                    </Radio.Group>
                  </div>
                )}
              </Card>
            </div>
          </>
        );

      case 1: // Symptoms & Reason
        return (
          <>
            <div className="mb-6">
              <Title level={4} className="mb-2">Symptoms & Reason</Title>
              <Card className="mb-4">
                <Form.Item name="reason" label="Reason for Visit" rules={[{ required: true, message: 'Please provide a reason for your visit' }]}>
                  <Select
                    placeholder="Select a reason"
                    options={[
                      { value: 'consultation', label: 'General Consultation' },
                      { value: 'follow_up', label: 'Follow-up Visit' },
                      { value: 'new_condition', label: 'New Medical Condition' },
                      { value: 'routine_checkup', label: 'Routine Check-up' },
                      { value: 'medication_review', label: 'Medication Review' },
                      { value: 'second_opinion', label: 'Second Opinion' },
                      { value: 'other', label: 'Other' }
                    ]}
                  />
                </Form.Item>

                <div className="mb-3">
                  <Text strong>Symptoms:</Text>
                  <SymptomInput
                    symptoms={symptoms}
                    onAddSymptom={handleAddSymptom}
                    onRemoveSymptom={handleRemoveSymptom}
                  />
                </div>

                <Form.Item name="notes" label="Additional Notes">
                  <Input.TextArea
                    rows={4}
                    placeholder="Please provide any additional details that may help the doctor."
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </Card>
            </div>
          </>
        );

      case 2: // Documents & Referrals
        return (
          <>
            <div className="mb-6">
              <Title level={4} className="mb-2">Medical Records & Referrals</Title>
              <Card className="mb-4">
                <div className="mb-5">
                  <Text strong>Medical Records to Share:</Text>
                  <Paragraph className="text-sm text-gray-500">
                    Select medical records you want to share with the doctor for this appointment.
                  </Paragraph>
                  <DocumentSelector
                    medicalRecords={medicalRecords}
                    selectedRecords={selectedRecords}
                    onSelectRecord={handleSelectRecord}
                    onAddNewDocument={handleAddNewDocument}
                    newDocuments={newDocuments}
                    onRemoveNewDocument={handleRemoveNewDocument}
                  />
                </div>

                {referrals.length > 0 && (
                  <div className="mt-5">
                    <Divider />
                    <Text strong>Referrals:</Text>
                    <Paragraph className="text-sm text-gray-500">
                      Select a referral if this appointment requires one.
                    </Paragraph>
                    <ReferralSelector
                      referrals={referrals}
                      selectedReferral={selectedReferral}
                      onSelectReferral={handleSelectReferral}
                    />
                  </div>
                )}
              </Card>
            </div>
          </>
        );

      case 3: // Summary & Confirmation
        return (
          <>
            <div className="mb-6">
              <Title level={4} className="mb-2">Appointment Summary</Title>
              <Card className="mb-4">
                <div className="space-y-4">
                  <div>
                    <Text strong className="block">Doctor</Text>
                    <div className="flex items-center mt-1">
                      {doctor?.image && (
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="w-12 h-12 rounded-full mr-3 object-cover"
                        />
                      )}
                      <div>
                        <Text className="block">{doctor?.name}</Text>
                        <Text type="secondary" className="text-sm">{doctor?.specialty}</Text>
                      </div>
                    </div>
                  </div>

                  <Divider className="my-3" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Text strong className="block">Appointment Details</Text>
                      <div className="mt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarOutlined /> {bookingDate}
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <ClockCircleOutlined /> {selectedTime}
                        </div>
                        <div className="flex items-center gap-2">
                          <FileTextOutlined /> {bookingMode === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Text strong className="block">Facility</Text>
                      <div className="mt-1">
                        <Text className="block">{doctor?.facility.name}</Text>
                        <Text type="secondary" className="text-sm">{doctor?.facility.address}</Text>
                      </div>
                    </div>
                  </div>

                  <Divider className="my-3" />

                  <div>
                    <Text strong className="block">Reason & Symptoms</Text>
                    <div className="mt-1">
                      <Text className="block">Reason: {form.getFieldValue('reason') ?
                        form.getFieldValue('reason').charAt(0).toUpperCase() + form.getFieldValue('reason').slice(1).replace('_', ' ') :
                        'Not specified'}</Text>

                      {symptoms.length > 0 ? (
                        <div className="mt-2">
                          <Text className="block mb-1">Symptoms:</Text>
                          <ul className="list-disc pl-5">
                            {symptoms.map(symptom => (
                              <li key={symptom.id} className="text-sm">
                                {symptom.description} - {symptom.severity}, {symptom.duration}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <Text type="secondary" className="block mt-1">No symptoms specified</Text>
                      )}
                    </div>
                  </div>

                  <Divider className="my-3" />

                  <div>
                    <Text strong className="block">Shared Records & Documents</Text>
                    <div className="mt-1">
                      {selectedRecords.length > 0 || newDocuments.length > 0 ? (
                        <div className="space-y-2">
                          {selectedRecords.length > 0 && (
                            <div>
                              <Text className="block mb-1">Selected Medical Records:</Text>
                              <ul className="list-disc pl-5">
                                {selectedRecords.map(recordId => {
                                  const record = medicalRecords.find(r => r.id === recordId);
                                  return (
                                    <li key={recordId} className="text-sm">
                                      {record?.name} ({record?.type === 'medical_report' ? 'Medical Report' : 'Prescription'})
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}

                          {newDocuments.length > 0 && (
                            <div>
                              <Text className="block mb-1">New Documents:</Text>
                              <ul className="list-disc pl-5">
                                {newDocuments.map((doc, index) => (
                                  <li key={index} className="text-sm">{doc.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <Text type="secondary">No records or documents shared</Text>
                      )}
                    </div>
                  </div>

                  {selectedReferral && (
                    <>
                      <Divider className="my-3" />
                      <div>
                        <Text strong className="block">Referral</Text>
                        <div className="mt-1">
                          {(() => {
                            const referral = referrals.find(r => r.id === selectedReferral);
                            return referral ? (
                              <div>
                                <Text className="block">{referral.type}</Text>
                                <Text type="secondary" className="text-sm block">
                                  From: Dr. {referral.referringDoctor}, {referral.referringClinic}
                                </Text>
                                <Text type="secondary" className="text-sm block">
                                  Date: {referral.referralDate}
                                </Text>
                              </div>
                            ) : (
                              <Text type="secondary">No referral selected</Text>
                            );
                          })()}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              <Alert
                type="info"
                message="Confirmation Information"
                description="By confirming this appointment, you agree to our appointment policies. Cancellations must be made at least 24 hours before the scheduled time to avoid charges."
                className="mb-4"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Main render
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          type="error"
          message="Doctor Not Found"
          description="The doctor information could not be found. Please try again or select a different doctor."
          className="mb-4"
        />
        <Button type="primary" onClick={() => window.history.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Title level={2} className="text-blue-900 dark:text-blue-100">Book an Appointment</Title>
        <Text className="text-gray-600 dark:text-gray-300">
          with Dr. {doctor.name}, {doctor.specialty}
        </Text>
      </div>

      <div className="mb-8">
        <Steps current={currentStep} responsive className="max-w-3xl mx-auto">
          <Step title="Appointment Details" icon={<CalendarOutlined />} />
          <Step title="Symptoms & Reason" icon={<MessageOutlined />} />
          <Step title="Documents & Referrals" icon={<FileTextOutlined />} />
          <Step title="Confirmation" icon={<MedicineBoxOutlined />} />
        </Steps>
      </div>

      <div className="max-w-3xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            reason: '',
            notes: ''
          }}
        >
          {renderStepContent()}

          <div className="flex justify-between mt-6">
            {currentStep > 0 && (
              <Button onClick={handlePrevStep}>
                Previous
              </Button>
            )}

            <div className="ml-auto">
              {currentStep < 3 ? (
                <Button type="primary" onClick={handleNextStep}>
                  Next
                </Button>
              ) : (
                <Button type="primary" onClick={handleSubmit} size="large">
                  Confirm Booking
                </Button>
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default BookingComponent; 