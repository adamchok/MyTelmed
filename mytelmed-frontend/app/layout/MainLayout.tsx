"use client";

import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { MainLayoutProps } from "./props";

const MainLayout: React.FC<MainLayoutProps> = ({ children }: MainLayoutProps) => {
    return (
        <Layout>
            <Content>{children}</Content>
        </Layout>
    );
};

export default MainLayout;
