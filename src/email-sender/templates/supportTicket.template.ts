import { BLUE_BOX } from './templateParts/blueBox'
import { TEXT } from './templateParts/text'
import { LAYOUT } from './templateParts/layout'

export const SupportTicketSubject = (ticketSubject: string) => `📩 New Support Ticket: ${ticketSubject}`

export const SupportTicketBody = ({ name, email, subject, message }: { name: string; email: string; subject: string; message: string }) => {
  const formattedMessage = message.replaceAll('\n', '<br/>')

  return LAYOUT(`
    ${BLUE_BOX(`
      ${TEXT('New Support Ticket Submitted', '22px', 'margin-top: 0; margin-bottom: 16px;')}
      ${TEXT(`<strong>Name:</strong> ${name}`, '14px', 'margin-top: 0; margin-bottom: 6px;')}
      ${TEXT(`<strong>Email:</strong> <a href="mailto:${email}" style="color: white; text-decoration-color: white;">${email}</a>`, '14px', 'margin-top: 0; margin-bottom: 6px;')}
      ${TEXT(`<strong>Subject:</strong> ${subject}`, '14px', 'margin-top: 0; margin-bottom: 6px;')}
      ${TEXT('<strong>Message:</strong>', '14px', 'margin-top: 12px; margin-bottom: 6px;')}
      ${TEXT(`${formattedMessage}`, '14px', 'margin-top: 0; margin-bottom: 0;')}
    `)}
  `)
}

export const SupportTicketTemplate = (data: { name: string; email: string; subject: string; message: string }) => ({
  Subject: SupportTicketSubject(data.subject),
  Body: SupportTicketBody(data),
})
