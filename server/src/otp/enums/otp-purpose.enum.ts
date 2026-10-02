/**
 * Purpose namespaces isolate OTP challenges. Only EMAIL_VERIFICATION currently
 * connects to registration; PASSWORD_RESET/LOGIN/GENERAL values alone do not
 * implement those business flows (password reset needs its own secure next stage).
 */
export enum OtpPurpose {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  LOGIN = 'LOGIN',
  GENERAL = 'GENERAL',
}
