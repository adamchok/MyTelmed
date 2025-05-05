'use client';

import { message, Modal } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from 'i18next';
import './index.css';

interface Props {
	show: boolean;
	setShow: (show: boolean) => void;
}

const LanguageSetting = ({
	show,
	setShow,
}: Props) => {
	const [lng, setLng] = useState('en');
	const { t } = useTranslation("header");

	const updateLanguage = (newLng: 'en' | 'cn' | 'my') => {
		if (lng === newLng) return;
		i18n.changeLanguage(newLng);
		localStorage.setItem('language', newLng);
		setLng(newLng);
		setShow(false);
		message.success(
			newLng === 'en' ? t("englishTranslation") :
				newLng === 'cn' ? t("chineseTranslation") :
					newLng === 'my' ? t("malayTranslation") :
						`Language changed to ${newLng === 'en' ? "English (EN)" : newLng === 'cn' ? "Chinese (CN)" : "Bahasa Melayu (MY)"}`
		);
	};

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setLng(localStorage.getItem('language') || 'en');
		}
	}, []);

	return (
		<Modal
			open={show}
			onCancel={() => setShow(false)}
			closable={false}
			footer={false}
			width={300}
			centered
		>
			<h5 className="mb-3">Language</h5>
			<div
				onClick={() => updateLanguage('en')}
				className={`language-option ${lng == 'en' ? 'language-option-selected' : ''}`}
			>
				English | EN
			</div>
			<div
				onClick={() => updateLanguage('cn')}
				className={`language-option ${lng == 'cn' ? 'language-option-selected' : ''}`}
			>
				Chinese | CN
			</div>
			<div
				onClick={() => updateLanguage('my')}
				className={`language-option ${lng == 'my' ? 'language-option-selected' : ''}`}
			>
				Bahasa Melayu | MY
			</div>
		</Modal>
	)
};

export default LanguageSetting;
