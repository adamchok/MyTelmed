'use client'

import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import "./index.css";
import { BackButtonProps } from "./props";


const BackButton = ({ backLink: link, className }: BackButtonProps) => {
  return (
    <Link href={link}>
      <ArrowLeftOutlined className={`back-button ${className}`} />
    </Link>
  )
};

export default BackButton;
