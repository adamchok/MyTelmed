import repository from "../RepositoryManager";
import {
  LoginRequestOptions,
  CodeVerificationRequestOptions,
  EmailVerificationLinkRequestOptions,
  RegistrationRequestOptions,
  PasswordResetLinkRequestOptions,
  ResetPasswordRequestOptions,
  ResetEmailRequestOptions,
  EmailResetLinkRequestOptions,
} from "./props";

const RESOURCE: string = "/auth";

const AuthApi = {
  signIn(body: LoginRequestOptions) {
    return repository.post(`${RESOURCE}/login`, body);
  },
  refreshSession(refreshToken: string) {
    return repository.post(`${RESOURCE}/refresh-token`, { refreshToken });
  },
  logout() {
    return repository.post(`${RESOURCE}/logout`);
  },
  verifyCode(body: CodeVerificationRequestOptions) {
    return repository.post(`${RESOURCE}/verify`, body);
  },
  requestVerificationCode(body: EmailVerificationLinkRequestOptions) {
    return repository.post(`${RESOURCE}/verify/send`, body);
  },
  register(body: RegistrationRequestOptions) {
    return repository.post(`${RESOURCE}/register`, body);
  },
  requestPasswordReset(body: PasswordResetLinkRequestOptions) {
    return repository.post(`${RESOURCE}/password/reset/request`, body);
  },
  resetPassword(body: ResetPasswordRequestOptions) {
    return repository.post(`${RESOURCE}/password/reset/${body.id}`, body.password);
  },
  requestEmailReset(body: EmailResetLinkRequestOptions) {
    return repository.post(`${RESOURCE}/email/reset/request`, body);
  },
  resetEmail(body: ResetEmailRequestOptions) {
    return repository.post(`${RESOURCE}/email/reset/${body.id}`, body.email);
  },
};

export default AuthApi;
