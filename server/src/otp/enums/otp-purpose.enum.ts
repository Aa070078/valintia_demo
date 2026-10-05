/**
 * Purpose namespaces isolate temporary challenges. Registration and reset consume
 * distinct signed proofs; only the dedicated LOGIN endpoint issues access JWTs.
 */
export enum OtpPurpose {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  LOGIN = 'LOGIN',
}
