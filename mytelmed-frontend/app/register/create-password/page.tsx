"use client";

import { useSelector } from "react-redux";
import { Form, message } from "antd";

import type { RootState } from "@/lib/reducers";
import { useState, useEffect } from "react";
import CreatePasswordPageComponent from "./component";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { CreatePatientRequest } from "@/app/api/patient/props";
import PatientApi from "@/app/api/patient";

export default function CreatePasswordPage() {
    const router: AppRouterInstance = useRouter();
    const { userInfo, email } = useSelector((state: RootState) => state.rootReducer.registration);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Debug: Log Redux state on component mount
    useEffect(() => {
        console.log("Create password page - Redux state on mount:", { userInfo, email });
    }, [userInfo, email]);

    const onFinish = async (values: any) => {
        if (!values.password) {
            message.error("Please enter your password first.");
            return;
        } else if (values.password !== values.confirmPassword) {
            message.error("Passwords do not match.");
            return;
        }

        // Debug: Log the current state
        console.log("Current Redux state:", { userInfo, email });
        console.log("Form values:", values);

        // Check if userInfo has the required data
        if (
            !userInfo.name ||
            !userInfo.nric ||
            !userInfo.serialNumber ||
            !userInfo.phone ||
            !userInfo.gender ||
            !userInfo.dob
        ) {
            message.error("Missing user information. Please go back and complete your profile.");
            return;
        }

        const dateParts = userInfo.dob.split("-");
        const formattedDateOfBirth = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`;

        // Convert gender to uppercase to match backend enum
        const formattedGender = userInfo.gender.toUpperCase();

        const registrationRequest: CreatePatientRequest = {
            name: userInfo.name,
            nric: userInfo.nric,
            serialNumber: userInfo.serialNumber,
            email: email,
            phone: userInfo.phone,
            gender: formattedGender,
            dateOfBirth: formattedDateOfBirth,
            password: values.password,
        };
        try {
            setLoading(true);
            console.log("Registration request: ", registrationRequest);
            const response = await PatientApi.createPatient(registrationRequest);
            const responseData = response.data;

            if (responseData.isSuccess) {
                message.success(responseData.message);
                router.push("/login/patient");
            } else {
                message.error(responseData.message);
            }
        } catch (err: any) {
            message.error(err?.response?.data?.message ?? "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        router.push("/register/user-info");
    };

    return (
        <CreatePasswordPageComponent form={form} loading={loading} onFinish={onFinish} handleCancel={handleCancel} />
    );
}
