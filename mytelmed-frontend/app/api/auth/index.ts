import axios from "axios";
import repository from "../RepositoryManager";
import { SignInOptions } from "./props";

const Auth = {
  signIn(body: SignInOptions) {
    return repository.post("/auth/login", body);
  },
  refreshSession(refreshToken: string) {
    return axios.post(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/refresh-token`, { refreshToken });
  },
  logout() {
    return repository.post("/auth/logout");
  },
};

export default Auth;
