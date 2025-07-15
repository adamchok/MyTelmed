import { combineReducers } from "redux";
import AuthenticationReducer from "./authentication-reducer";
import RegistrationReducer from "./registration-reducer";
import ProfileReducer from "./profile-reducer";
import AppointmentBookingReducer from "./appointment-booking-reducer";
import referralCreationReducer from "./referral-creation-reducer";
import prescriptionCreationReducer from "./prescription-creation-reducer";
import deliveryFlowReducer from "./delivery-flow-reducer";

const rootReducer = combineReducers({
    authenticationReducer: AuthenticationReducer,
    registration: RegistrationReducer,
    profile: ProfileReducer,
    appointmentBooking: AppointmentBookingReducer,
    referralCreation: referralCreationReducer,
    prescriptionCreation: prescriptionCreationReducer,
    deliveryFlow: deliveryFlowReducer,
});

export default rootReducer;
export type RootState = { rootReducer: ReturnType<typeof rootReducer> };
