'use client';

import Link from "next/link";


export const menuItems = (t: any, isLoggedIn: boolean) => {
	const baseMenus = [
		{
			key: '/login',
			label: (
				<Link href="/login">
					{t('login') ?? 'Login'}
				</Link>
			),
		},
		{
			key: '/forum',
			label: (
				<Link href="/forum">
					{t('knowledgeHub') ?? 'Knowledge Hub'}
				</Link>
			),
		},
	];

	const loggedInMenus = [
		{
			key: '/dashboard',
			label: (
				<Link href="/dashboard">
					{t('dashboard') ?? 'Dashboard'}
				</Link>
			),
		},
		{
			key: '/browse/facilities',
			label: <Link href="/browse/facilities">Healthcare Facilities</Link>,
		},
		{
			key: '/browse/doctors',
			label: <Link href="/browse/doctors">Doctors</Link>,
		},
		{
			key: '/appointments',
			label: <Link href="/appointments">Appointments</Link>,
		},
		{
			key: '/medical-records',
			label: <Link href="/medical-records">Medical Records</Link>,
		},
		{
			key: '/referrals',
			label: <Link href="/referrals">Referrals</Link>,
		},
		{
			key: '/family-access',
			label: <Link href="/family-access">Family Access</Link>,
		},
		{
			key: '/forum',
			label: (
				<Link href="/forum">
					{t('knowledgeHub') ?? 'Knowledge Hub'}
				</Link>
			),
		},
	];

	return !isLoggedIn ? loggedInMenus : baseMenus;
};
