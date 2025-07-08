import { FormInstance } from "antd/es/form";

export interface UserInfo {
  name: string;
  nric: string;
  serialNumber: string;
  phone: string;
  gender: string;
  dob: string;
}

export interface UserInfoPageComponentProps {
  form: FormInstance;
  onFinish: (values: any) => void;
  userInfo: UserInfo;
  handleCancel: () => void;
}

