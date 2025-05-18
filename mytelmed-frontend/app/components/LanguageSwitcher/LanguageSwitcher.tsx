import { useState } from "react";
import { TranslationOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcherModal from "./LanguageSwitcherModal";
import { Button } from "antd";


const LanguageSwitcher = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { t } = useTranslation('language');

  const handleModalVisibility = () => {
    setIsModalVisible(!isModalVisible);
  };

  return (
    <>
      <Button
        className="bg-transparent border-none text-[20px] px-0 text-gray-200 hover:text-sky-500"
        onClick={handleModalVisibility}
        type="text"
        title={t('changeLanguage') || 'Change Language'}
        aria-label={t('changeLanguage') || 'Change Language'}
      >
        <TranslationOutlined />
      </Button>
      <LanguageSwitcherModal show={isModalVisible} setShow={handleModalVisibility} />
    </>
  );
};

export default LanguageSwitcher;
