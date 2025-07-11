import { combineReducers } from "redux";
import AuthenticationReducer from "./authentication-reducer";
import RegistrationReducer from "./registration-reducer";
import ProfileReducer from "./profile-reducer";

const rootReducer = combineReducers({
    authenticationReducer: AuthenticationReducer,
    registration: RegistrationReducer,
    profile: ProfileReducer,
});

export default rootReducer;
export type RootState = { rootReducer: ReturnType<typeof rootReducer> };
