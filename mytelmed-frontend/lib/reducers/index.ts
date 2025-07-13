import { combineReducers } from "redux";
import AuthenticationReducer from "./authentication-reducer";
import RegistrationReducer from "./registration-reducer";
import ProfileReducer from "./profile-reducer";
import AppointmentBookingReducer from "./appointment-booking-reducer";

const rootReducer = combineReducers({
    authenticationReducer: AuthenticationReducer,
    registration: RegistrationReducer,
    profile: ProfileReducer,
    appointmentBooking: AppointmentBookingReducer,
});

export default rootReducer;
export type RootState = { rootReducer: ReturnType<typeof rootReducer> };
