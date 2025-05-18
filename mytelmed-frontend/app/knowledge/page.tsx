"use client";

import { useEffect, useCallback, useState } from "react";
import KnowledgeHubLandingPageComponent from "./component";
import { Department } from "../props";
import { message, Spin } from "antd";
import DepartmentApi from "../api/department";

const KnowledgeHubLandingPage = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const findAllDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await DepartmentApi.findAllDepartments();
      setDepartments(data ?? []);
    } catch (error) {
      console.error("Error fetching department:", error);
      message.error("Failed to fetch department");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    findAllDepartments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" tip="Loading departments..." />
      </div>
    );
  }

  return (
    <KnowledgeHubLandingPageComponent departments={departments} />
  );
}

export default KnowledgeHubLandingPage;
