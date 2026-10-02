export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export interface MailProvider {
  sendMail(options: SendMailOptions): Promise<void>;
}
