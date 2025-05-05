import { combineReducers } from "redux";
import AuthenticationReducer from "./authentication-reducer";

const rootReducer = combineReducers({
  authenticationReducer: AuthenticationReducer,
});

export default rootReducer;
export type RootState = { rootReducer: ReturnType<typeof rootReducer> };
