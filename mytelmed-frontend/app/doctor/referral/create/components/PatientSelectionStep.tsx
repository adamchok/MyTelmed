"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, Typography, Avatar, Empty, Spin, message, Button, Pagination } from "antd";
import { User, ArrowRight } from "lucide-react";
import dayjs from "dayjs";
import { RootState } from "@/lib/store";
import { setSelectedAppointment, nextStep } from "@/lib/reducers/referral-creation-reducer";
import AppointmentApi from "@/app/api/appointment";
import { AppointmentDto, AppointmentSearchOptions } from "@/app/api/appointment/props";

const { Title, Text } = Typography;

export default function PatientSelectionStep() {
    const dispatch = useDispatch();
    const { selectedAppointment } = useSelector((state: RootState) => state.rootReducer.referralCreation);

    const [completedAppointments, setCompletedAppointments] = useState<AppointmentDto[]>([]);
    const [loading, setLoading] = useState(true);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(8);
    const [totalAppointments, setTotalAppointments] = useState(0);

    useEffect(() => {
        loadCompletedAppointments();
    }, [currentPage]);

    const loadCompletedAppointments = async () => {
        try {
            setLoading(true);
            // API doesn't support pagination parameters, so we get all appointments

            const options: AppointmentSearchOptions = {
                page: currentPage - 1,
                pageSize: pageSize,
            };

            const response = await AppointmentApi.getAppointmentsByAccount(options);
            if (response.data.isSuccess && response.data.data) {
                const appointmentsData = response.data.data.content || [];
                const totalElements = response.data.data.totalElements || 0;

                // Filter only completed appointments from the current page
                const completed = appointmentsData.filter((apt: AppointmentDto) => apt.status === "COMPLETED");

                setCompletedAppointments(completed);
                // Note: This shows total appointments, not just completed ones
                // If you need completed count only, you might need a separate API call or server-side filtering
                setTotalAppointments(totalElements);
            }
        } catch {
            message.error("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAppointment = (appointment: AppointmentDto) => {
        dispatch(setSelectedAppointment(appointment));
    };

    const handleNext = () => {
        if (!selectedAppointment) {
            message.warning("Please select a patient to continue");
            return;
        }
        dispatch(nextStep());
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Clear selection when changing pages
        if (selectedAppointment) {
            dispatch(setSelectedAppointment(null));
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <Title level={4}>Select Patient from Completed Appointments</Title>
                <Text type="secondary">You can only refer patients from appointments you have completed.</Text>
            </div>

            {completedAppointments.length === 0 ? (
                <div className="text-center py-8">
                    <Empty
                        description="No completed appointments found on this page"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Appointments List */}
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {completedAppointments.map((appointment) => (
                            <Card
                                key={appointment.id}
                                hoverable
                                className={`cursor-pointer border-2 transition-all ${
                                    selectedAppointment?.id === appointment.id
                                        ? "border-green-500 bg-green-50"
                                        : "border-gray-200 hover:border-green-300"
                                }`}
                                onClick={() => handleSelectAppointment(appointment)}
                                size="small"
                            >
                                <div className="flex items-center space-x-3">
                                    <Avatar
                                        src={appointment.patient.profileImageUrl}
                                        icon={<User className="w-4 h-4" />}
                                        size={40}
                                    />
                                    <div className="flex-1">
                                        <Text strong>{appointment.patient.name}</Text>
                                        <div className="text-xs text-gray-500">
                                            Completed:{" "}
                                            {appointment.completedAt && !isNaN(Number(appointment.completedAt))
                                                ? dayjs(Number(appointment.completedAt) * 1000).format(
                                                      "MMM DD, YYYY HH:mm"
                                                  )
                                                : "N/A"}
                                        </div>
                                        <div className="text-xs text-gray-500">{appointment.reasonForVisit}</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalAppointments > pageSize && (
                        <div className="flex justify-center pt-4">
                            <Pagination
                                current={currentPage}
                                pageSize={pageSize}
                                total={totalAppointments}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                                showQuickJumper={false}
                                showTotal={() => `Page ${currentPage} - Showing completed appointments`}
                                size="small"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-end pt-4 border-t">
                <Button
                    type="primary"
                    onClick={handleNext}
                    disabled={!selectedAppointment}
                    icon={<ArrowRight className="w-4 h-4" />}
                    className="bg-green-700 hover:bg-green-800 border-green-700 text-white"
                >
                    Next: Referral Type
                </Button>
            </div>
        </div>
    );
}
