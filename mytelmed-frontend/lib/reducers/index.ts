import { combineReducers } from "redux";
import AuthenticationReducer from "./authentication-reducer";
import RegistrationReducer from "./registration-reducer";

const rootReducer = combineReducers({
  authenticationReducer: AuthenticationReducer,
  registration: RegistrationReducer,
});

export default rootReducer;
export type RootState = { rootReducer: ReturnType<typeof rootReducer> };
