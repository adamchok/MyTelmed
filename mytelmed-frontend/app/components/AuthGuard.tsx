"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import { RootState } from "@/lib/store";

interface AuthGuardProps {
    children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const isLogin = useSelector((state: RootState) => state.rootReducer.authenticationReducer.isLogin);

    // Define public routes that don't require authentication
    const publicRoutes = [
        "/",
        "/login",
        "/login/patient",
        "/login/doctor",
        "/login/pharmacist",
        "/login/admin",
        "/register",
        "/register/user-info",
        "/register/verify-email",
        "/register/create-password",
        "/forgot",
        "/forgot/email",
        "/forgot/password",
        "/privacy",
        "/terms",
        "/knowledge",
    ];

    // Check if current path is a public route or starts with public path
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route ||
        pathname.startsWith(route + "/") ||
        (route === "/knowledge" && pathname.startsWith("/knowledge/"))
    );

    useEffect(() => {
        // Only redirect if user is not logged in and not on a public route
        if (!isLogin && !isPublicRoute) {
            router.push("/");
        }
    }, [isLogin, pathname, isPublicRoute, router]);

    // Always render children - the redirect happens in useEffect
    return <>{children}</>;
};

export default AuthGuard;