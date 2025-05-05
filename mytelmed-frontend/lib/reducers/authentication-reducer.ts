interface AuthenticationState {
  data: string[];
  isLogin: boolean;
}

const initialLoginState = typeof window !== "undefined" ? localStorage.getItem("isLogin") == "true" : false;

const authenticationReducer: AuthenticationState = {
  data: [],
  isLogin: initialLoginState,
};

const AuthenticationReducer = (state = authenticationReducer, action: any): AuthenticationState => {
  switch (action.type) {
    case "ADD_DATA":
      return {
        ...state,
        data: [...state.data, action.payload],
      };
    case "SET_LOGIN_STATUS":
      return {
        ...state,
        isLogin: action.payload,
      };
    default:
      return state;
  }
};

export default AuthenticationReducer;
