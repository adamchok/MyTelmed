'use client';

import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { Doctor } from '../props';
import { BookingFormValues, Referral } from './props';
import BookingComponent from './component';

// Mock API data and functions
import { dummyMedicalRecords } from '../constants/dummy-data/dummyMedicalRecords';

// Mock referrals data (should be in a separate file in a real app)
const dummyReferrals: Referral[] = [
  {
    id: '1',
    type: 'Cardiology Consultation',
    referringDoctor: 'Dr. Michael Chang',
    referringClinic: 'Central Medical Center',
    referralDate: '2023-06-01',
    expiryDate: '2023-09-01',
    status: 'active',
    description: 'Patient requires cardiology evaluation due to abnormal ECG findings.'
  },
  {
    id: '2',
    type: 'Dermatology Follow-up',
    referringDoctor: 'Dr. Lisa Wong',
    referringClinic: 'Harbor Skin Clinic',
    referralDate: '2023-05-15',
    expiryDate: '2023-08-15',
    status: 'active',
    description: 'Follow-up evaluation of previously treated skin condition.'
  }
];

const BookingPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const doctorId = searchParams.get('doctorId');
  const dateParam = searchParams.get('date');
  const bookingType = searchParams.get('bookingType') as 'video' | 'physical' | 'both' || 'both';
  const doctorName = searchParams.get('doctorName');

  const [isLoading, setIsLoading] = useState(true);
  const [doctor, setDoctor] = useState<Doctor | undefined>(undefined);
  const [bookingDate] = useState<string>(dateParam || '');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctor = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be a fetch call to your API
        // For now, we'll simulate a delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // This is mock data - in a real app you'd get this from the API
        const mockDoctor: Doctor = {
          id: parseInt(doctorId || '1', 10),
          name: doctorName || 'Dr. Sarah Johnson',
          specialty: 'Cardiologist',
          facility: {
            id: 1,
            name: 'City General Hospital',
            address: '123 Medical Center Blvd, Kuala Lumpur',
            state: 'Kuala Lumpur',
            city: 'Kuala Lumpur',
            latitude: 3.139,
            longitude: 101.6869,
            type: 'hospital',
            telephone: '+60312345678',
            imageUrl: '/icons/facilities/hospital/hospital-2.jpg'
          },
          image: '/logos/doctor-1.jpg',
          phone: '+60312345678',
          email: 'sarah.johnson@cityhospital.com',
          description: 'Dr. Sarah Johnson is a renowned cardiologist with over 15 years of experience in treating various cardiac conditions.',
          availability: [
            { date: 'Mon, 10 Jun', count: 8, booking: 'both' },
            { date: 'Tue, 11 Jun', count: 6, booking: 'video' },
            { date: 'Wed, 12 Jun', count: 4, booking: 'physical' },
            { date: 'Thu, 13 Jun', count: 2, booking: 'both' },
            { date: 'Fri, 14 Jun', count: 0, booking: 'none' },
            { date: 'Sat, 15 Jun', count: 5, booking: 'video' },
            { date: 'Sun, 16 Jun', count: 0, booking: 'none' }
          ]
        };

        setDoctor(mockDoctor);

        // Generate available time slots
        const times = generateTimeSlotsForDate();
        setAvailableTimes(times);

        // Get referrals
        setReferrals(dummyReferrals);
      } catch (error) {
        console.error('Error fetching doctor details:', error);
        message.error('Failed to load doctor details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    } else {
      message.error('Doctor ID is required');
      router.push('/browse/doctors');
    }
  }, [doctorId, router, dateParam, doctorName]);

  // Generate time slots for a given date
  const generateTimeSlotsForDate = (): string[] => {
    // In a real app, this would come from the backend based on doctor's availability
    // For now, we'll generate some random time slots
    const morningSlots = ['09:00', '10:00', '11:00', '11:30'];
    const afternoonSlots = ['13:00', '14:30', '15:00', '16:00'];
    const eveningSlots = ['17:00', '18:00', '19:00'];

    // Randomly remove some slots to simulate varying availability
    const slots = [
      ...morningSlots.filter(() => Math.random() > 0.3),
      ...afternoonSlots.filter(() => Math.random() > 0.3),
      ...eveningSlots.filter(() => Math.random() > 0.3)
    ];

    return slots;
  };

  // Handle booking submission
  const handleSubmitBooking = useCallback((values: BookingFormValues) => {
    setIsLoading(true);

    // In a real app, this would be a POST to your API
    setTimeout(() => {
      // Construct the appointment object
      const appointment = {
        id: uuidv4(),
        doctorId: doctor?.id,
        doctorName: doctor?.name,
        doctorSpecialty: doctor?.specialty,
        doctorImage: doctor?.image,
        facilityId: doctor?.facility.id,
        facilityName: doctor?.facility.name,
        facilityAddress: doctor?.facility.address,
        appointmentDate: values.date,
        appointmentTime: values.time,
        duration: 30, // Default 30 minutes
        status: 'scheduled',
        mode: values.bookingMode,
        patientId: '123', // Would come from auth context
        patientName: 'Current User', // Would come from auth context
        isForSelf: true,
        symptoms: values.symptoms,
        reason: values.reason,
        documents: [],
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // In a real app, you'd save this to the database
      console.log('Booking submitted:', appointment);

      message.success('Appointment booked successfully!');

      // Redirect to appointments page
      router.push('/appointments');
    }, 1500);
  }, [doctor, router]);

  return (
    <BookingComponent
      isLoading={isLoading}
      doctor={doctor}
      availableTimes={availableTimes}
      bookingDate={bookingDate}
      bookingType={bookingType || 'both'}
      medicalRecords={dummyMedicalRecords}
      referrals={referrals}
      onSubmitBooking={handleSubmitBooking}
    />
  );
};

export default BookingPage; 