"use client";

import { Breadcrumb } from "antd";
import { HomeOutlined, BookOutlined, PlayCircleOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

interface BreadcrumbNavProps {
    currentPage: string;
    currentPageTitle?: string;
    showHome?: boolean;
}

const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ currentPage, currentPageTitle, showHome = true }) => {
    const router = useRouter();

    const getBreadcrumbItems = () => {
        const items = [];

        if (showHome) {
            items.push({
                title: (
                    <button
                        className="cursor-pointer hover:text-blue-600 transition-colors bg-transparent border-none p-0 text-left"
                        onClick={() => router.push("/")}
                        onKeyDown={(e) => e.key === "Enter" && router.push("/")}
                        tabIndex={0}
                        aria-label="Navigate to Home"
                    >
                        <HomeOutlined className="mr-1" />
                        Home
                    </button>
                ),
            });
        }

        items.push({
            title: (
                <button
                    className="cursor-pointer hover:text-blue-600 transition-colors bg-transparent border-none p-0 text-left"
                    onClick={() => router.push("/knowledge")}
                    onKeyDown={(e) => e.key === "Enter" && router.push("/knowledge")}
                    tabIndex={0}
                    aria-label="Navigate to Knowledge Hub"
                >
                    <BookOutlined className="mr-1" />
                    Knowledge Hub
                </button>
            ),
        });

        if (currentPage === "article") {
            items.push({
                title: (
                    <span className="text-blue-600">
                        <BookOutlined className="mr-1" />
                        Article
                    </span>
                ),
            });
        } else if (currentPage === "tutorial") {
            items.push({
                title: (
                    <span className="text-blue-600">
                        <PlayCircleOutlined className="mr-1" />
                        Tutorial
                    </span>
                ),
            });
        }

        if (currentPageTitle) {
            items.push({
                title: <span className="text-gray-600 font-medium truncate max-w-xs">{currentPageTitle}</span>,
            });
        }

        return items;
    };

    return (
        <div className="mb-4 p-4 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm bg-white/80">
            <Breadcrumb
                items={getBreadcrumbItems()}
                separator={<span className="text-gray-400">/</span>}
                className="text-sm"
            />
        </div>
    );
};

export default BreadcrumbNav;
