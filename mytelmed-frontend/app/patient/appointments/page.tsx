'use client';

import { useState, useEffect, useMemo } from 'react';
import { message, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import dummyAppointments from '@/app/constants/dummy-data/dummyAppointments';
import { Appointment, AppointmentDocument, AppointmentStatus, PatientSymptom } from '../props';
import { AppointmentFilterOptions } from './props';
import AppointmentManagementComponent from './component';
import { isDateInPast } from '@/app/utils/DateUtils';

const ITEMS_PER_PAGE = 5;

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [upcomingCurrentPage, setUpcomingCurrentPage] = useState<number>(1);
  const [pastCurrentPage, setPastCurrentPage] = useState<number>(1);

  // Filter states
  const [filters, setFilters] = useState<AppointmentFilterOptions>({});
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Status options for filtering
  const statusOptions = [
    { label: 'Completed', value: 'completed' as AppointmentStatus },
    { label: 'Cancelled', value: 'cancelled' as AppointmentStatus },
    { label: 'No Show', value: 'no_show' as AppointmentStatus }
  ];

  // Patient options for filtering
  const patientOptions = useMemo(() => {
    const patients = new Set<string>();
    const labels: { [key: string]: string } = {
      'self': 'Yourself'
    };

    // Extract unique patients from appointments
    dummyAppointments.forEach(appointment => {
      patients.add(appointment.patientId);
    });

    return Array.from(patients).map(patientId => ({
      label: labels[patientId] || dummyAppointments.find(a => a.patientId === patientId)?.patientName || patientId,
      value: patientId
    }));
  }, []);

  // Load appointments with a small delay to simulate API
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppointments(dummyAppointments);
      setFilteredAppointments(dummyAppointments);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Apply filters whenever they change
  useEffect(() => {
    let filtered = [...appointments];

    // Filter by status
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(appointment =>
        filters.status?.includes(appointment.status)
      );
    }

    // Filter by patient
    if (filters.patientId) {
      filtered = filtered.filter(appointment =>
        appointment.patientId === filters.patientId
      );
    }

    // Filter by date range
    if (filters.dateRange && filters.dateRange.length === 2) {
      const [startDate, endDate] = filters.dateRange;
      filtered = filtered.filter(appointment => {
        const appDate = new Date(appointment.appointmentDate);
        return appDate >= new Date(startDate) && appDate <= new Date(endDate);
      });
    }

    // Filter by doctor name
    if (filters.doctorName) {
      const doctorName = filters.doctorName.toLowerCase();
      filtered = filtered.filter(appointment =>
        appointment.doctorName.toLowerCase().includes(doctorName)
      );
    }

    // Filter by facility
    if (filters.facility) {
      const facility = filters.facility.toLowerCase();
      filtered = filtered.filter(appointment =>
        appointment.facilityName.toLowerCase().includes(facility)
      );
    }

    // Apply search query (if any)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(appointment =>
        appointment.doctorName.toLowerCase().includes(query) ||
        appointment.facilityName.toLowerCase().includes(query) ||
        appointment.doctorSpecialty.toLowerCase().includes(query)
      );
    }

    setFilteredAppointments(filtered);
    // Reset pagination when filters change
    setUpcomingCurrentPage(1);
    setPastCurrentPage(1);
  }, [appointments, filters, searchQuery]);

  // Split appointments into upcoming and past
  const upcomingAppointments = useMemo(() => {
    return filteredAppointments
      .filter(appointment =>
        appointment.status === 'scheduled' &&
        !isDateInPast(appointment.appointmentDate)
      )
      .sort((a, b) => {
        // Sort by date (ascending)
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [filteredAppointments]);

  const pastAppointments = useMemo(() => {
    return filteredAppointments
      .filter(appointment =>
        appointment.status !== 'scheduled' ||
        isDateInPast(appointment.appointmentDate)
      )
      .sort((a, b) => {
        // Sort by date (descending)
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
        return dateB.getTime() - dateA.getTime();
      });
  }, [filteredAppointments]);

  // Paginate upcoming appointments
  const paginatedUpcomingAppointments = useMemo(() => {
    const startIndex = (upcomingCurrentPage - 1) * ITEMS_PER_PAGE;
    return upcomingAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [upcomingAppointments, upcomingCurrentPage]);

  // Paginate past appointments
  const paginatedPastAppointments = useMemo(() => {
    const startIndex = (pastCurrentPage - 1) * ITEMS_PER_PAGE;
    return pastAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [pastAppointments, pastCurrentPage]);

  // Calculate total pages
  const upcomingTotalPages = Math.ceil(upcomingAppointments.length / ITEMS_PER_PAGE) || 1;
  const pastTotalPages = Math.ceil(pastAppointments.length / ITEMS_PER_PAGE) || 1;

  // Handle cancellation
  const handleCancelAppointment = (appointmentId: string) => {
    Modal.confirm({
      title: 'Cancel Appointment',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to cancel this appointment? This action cannot be undone.',
      okText: 'Yes, Cancel',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        // Update appointment status in the state
        const updatedAppointments = appointments.map(appointment => {
          if (appointment.id === appointmentId) {
            return { ...appointment, status: 'cancelled' as AppointmentStatus };
          }
          return appointment;
        });

        setAppointments(updatedAppointments);
        message.success('Appointment cancelled successfully');
      }
    });
  };

  // Handle rescheduling
  const handleRescheduleAppointment = (appointment: Appointment, newDate: string, newTime: string) => {
    // Update appointment with new date and time
    const updatedAppointments = appointments.map(app => {
      if (app.id === appointment.id) {
        return {
          ...app,
          appointmentDate: newDate,
          appointmentTime: newTime,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return app;
    });

    setAppointments(updatedAppointments);
    message.success('Appointment rescheduled successfully');
  };

  // Handle updating appointment details
  const handleUpdateAppointmentDetails = (
    appointmentId: string,
    updateData: {
      symptoms?: PatientSymptom[];
      reason?: string;
      notes?: string;
    }
  ) => {
    // Update appointment details
    const updatedAppointments = appointments.map(app => {
      if (app.id === appointmentId) {
        return {
          ...app,
          symptoms: updateData.symptoms || app.symptoms,
          reason: updateData.reason || app.reason,
          notes: updateData.notes !== undefined ? updateData.notes : app.notes,
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return app;
    });

    setAppointments(updatedAppointments);
    message.success('Appointment details updated successfully');
  };

  // Handle adding a document
  const handleAddDocument = (appointmentId: string, document: AppointmentDocument) => {
    // Add document to appointment
    const updatedAppointments = appointments.map(app => {
      if (app.id === appointmentId) {
        return {
          ...app,
          documents: [...app.documents, document],
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return app;
    });

    setAppointments(updatedAppointments);
    message.success('Document uploaded successfully');
  };

  // Handle removing a document
  const handleRemoveDocument = (appointmentId: string, documentId: string) => {
    // Remove document from appointment
    const updatedAppointments = appointments.map(app => {
      if (app.id === appointmentId) {
        return {
          ...app,
          documents: app.documents.filter(doc => doc.id !== documentId),
          updatedAt: new Date().toISOString().split('T')[0]
        };
      }
      return app;
    });

    setAppointments(updatedAppointments);
    message.success('Document removed successfully');
  };

  // Handle search query changes
  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
  };

  // Handle sharing an appointment
  const handleShareAppointment = (appointment: Appointment) => {
    // In a real app, this might make an API call to generate a sharing token
    // or track analytics about sharing
    console.log(`Sharing appointment ${appointment.id}`);
    // We're not modifying the appointments state here since the ShareAppointmentModal
    // handles the actual sharing functionality
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<AppointmentFilterOptions>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  return (
    <AppointmentManagementComponent
      upcomingAppointments={paginatedUpcomingAppointments}
      pastAppointments={paginatedPastAppointments}
      upcomingCurrentPage={upcomingCurrentPage}
      upcomingTotalPages={upcomingTotalPages}
      pastCurrentPage={pastCurrentPage}
      pastTotalPages={pastTotalPages}
      filters={filters}
      statusOptions={statusOptions}
      patientOptions={patientOptions}
      searchQuery={searchQuery}
      onSearchChange={handleSearchQueryChange}
      onCancelAppointment={handleCancelAppointment}
      onRescheduleAppointment={handleRescheduleAppointment}
      onUpdateAppointmentDetails={handleUpdateAppointmentDetails}
      onAddDocument={handleAddDocument}
      onRemoveDocument={handleRemoveDocument}
      onShareAppointment={handleShareAppointment}
      onUpcomingPageChange={setUpcomingCurrentPage}
      onPastPageChange={setPastCurrentPage}
      onFilterChange={handleFilterChange}
      isLoading={isLoading}
    />
  );
};

export default AppointmentsPage; 