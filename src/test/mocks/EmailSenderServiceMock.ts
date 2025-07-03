import type { EmailSenderService } from '../../email-sender/email-sender.service'

type EmailSenderServiceMock = Record<keyof EmailSenderService, jest.Mock>

export const EmailSenderServiceMock = {
  sendFundsSent: jest.fn(),
} satisfies Partial<EmailSenderServiceMock>
