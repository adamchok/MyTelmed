import { UserInfo } from "@/app/register/user-info/props";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RegistrationState {
  userInfo: UserInfo;
  email: string;
  password: string;
}

const initialState: RegistrationState = {
  userInfo: {
    name: "",
    nric: "",
    serialNumber: "",
    phone: "",
    gender: "",
    dob: "",
  },
  email: "",
  password: "",
};

const registrationSlice = createSlice({
  name: "registration",
  initialState,
  reducers: {
    setUserInfo(state, action: PayloadAction<RegistrationState["userInfo"]>) {
      state.userInfo = action.payload;
    },
    setEmail(state, action: PayloadAction<string>) {
      state.email = action.payload;
    },
    resetRegistration(state) {
      state.userInfo = initialState.userInfo;
      state.email = initialState.email;
      state.password = initialState.password;
    },
  },
});

export const { setUserInfo, setEmail, resetRegistration } = registrationSlice.actions;
export default registrationSlice.reducer;
