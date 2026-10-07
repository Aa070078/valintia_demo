export interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
    cid: string;
    contentDisposition: 'inline';
  }>;
}

export interface MailProvider {
  sendMail(options: SendMailOptions): Promise<void>;
}
