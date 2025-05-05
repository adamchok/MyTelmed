'use client';

import Link from "next/link";


export const menus = (t: any) => {
	return [
		{
			key: '/dashboard',
			label: (
				<Link href="/dashboard">
					{t('dashboard') || 'Dashboard'}
				</Link>
			),
		},
		{
			key: '/dashboard',
			label: (
				<Link href="/dashboard">
					{t('dashboard') || 'Dashboard'}
				</Link>
			),
		},
		{
			key: '/dashboard',
			label: (
				<Link href="/dashboard">
					{t('dashboard') || 'Dashboard'}
				</Link>
			),
		},
		{
			key: '/dashboard',
			label: (
				<Link href="/dashboard">
					{t('dashboard') || 'Dashboard'}
				</Link>
			),
		},
		{
			key: '/dashboard',
			label: (
				<Link href="/dashboard">
					{t('dashboard') || 'Dashboard'}
				</Link>
			),
		},
	]
};
