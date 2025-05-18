'use client';

import { Button, message, Modal } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LanguageProps } from "./props";
import i18n from 'i18next';
import './index.css'


const LanguageSwitcherModal = ({ show, setShow }: LanguageProps) => {
	const [lng, setLng] = useState('en');
	const { t } = useTranslation("language");

	const updateLanguage = (newLng: 'en' | 'cn' | 'my') => {
		if (lng === newLng) return;
		i18n.changeLanguage(newLng);
		localStorage.setItem('language', newLng);
		setLng(newLng);
		setShow(false);
		message.success(t(`${newLng}Translation`));
	};

	useEffect(() => {
		if (typeof window !== 'undefined') {
			setLng(localStorage.getItem('language') ?? 'en');
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
			<h5 className="mb-3">{t('title')}</h5>
			<Button
				type="default"
				onClick={() => updateLanguage('en')}
				className={`language-option ${lng === 'en' ? 'language-option-selected' : ''}`}
				aria-pressed={lng === 'en'}
				tabIndex={0}
			>
				{t('english')}
			</Button>
			<Button
				type="default"
				onClick={() => updateLanguage('cn')}
				className={`language-option ${lng === 'cn' ? 'language-option-selected' : ''}`}
				aria-pressed={lng === 'cn'}
				tabIndex={0}
			>
				{t('chinese')}
			</Button>
			<Button
				type="default"
				onClick={() => updateLanguage('my')}
				className={`language-option ${lng === 'my' ? 'language-option-selected' : ''}`}
				aria-pressed={lng === 'my'}
				tabIndex={0}
			>
				{t('malay')}
			</Button>
		</Modal>
	)
};

export default LanguageSwitcherModal;
