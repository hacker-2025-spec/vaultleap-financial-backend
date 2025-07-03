import { TEXT } from './templateParts/text'
import { BUTTON } from './templateParts/button'
import { LAYOUT } from './templateParts/layout'
import { BLUE_BOX } from './templateParts/blueBox'

export const Subject = 'Vaultleap: A Payment Has Been Successfully Sent'

export const FirstBlueBoxContent = (
  fullName: string,
  vaultName: string,
  amount: string,
  transactionId: string,
  transactionLink: string,
  date: string,
  link: string,
  memo?: string
) => `
            ${TEXT(`Hey ${fullName},`, '22px', 'margin-top: 0; margin-bottom: 4px')}

            ${TEXT(`Transaction Confirmation`, '18px', 'margin-top: 0; margin-bottom: 18px')}

            ${TEXT(`A payment has been successfully sent to ${vaultName}`, '14px', 'margin-top: 0; margin-bottom: 14px;')}

            ${TEXT(`Transaction Details:`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`Amount: ${amount} USDC`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${memo ? TEXT(`Memo: "${memo}"`, '14px', 'margin-top: 0; margin-bottom: 0;') : ''}
            ${TEXT(`Transaction ID: ${transactionId}`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`Date: ${date}`, '14px', 'margin-top: 0; margin-bottom: 18px;')}

            ${TEXT(`View transaction on Basescan:  <a href=${transactionLink} style="color: white; text-decoration-color: white;">link</a>`, '14px', 'margin-bottom: 0;')}

            ${BUTTON(`${link}`, `Go to My Dashboard`)}`

const SecondBlueBoxContent = () => `
            <table align="center" width="100%">
              <tr>
                <td align="left">
                  ${TEXT('If you have any questions or need assistance, our dedicated support team is available to help:', '14px', 'margin: 0;')}
                  <table style="border-spacing: 0;">
                    <tr>
                      <td align="left" style="vertical-align: middle;">
                        <img style="width: 20px; height: 20px; margin-top: 1px; margin-right: 4px;" src="https://files.stage.vaultleap.com/images/envelope-icon.png" alt="envelope" />
                      </td>
                      <td align="left" style="vertical-align: sub;">
                        <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-align: start; color: white; margin: 0;">
                          <a href="mailto:support@klydo.io" style="color: white; text-decoration-color: white;">support@klydo.io</a>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="left" style="vertical-align: middle;">
                        <img style="width: 20px; height: 20px; margin-top: 1px; margin-right: 4px;" src="https://files.stage.vaultleap.com/images/comments-icon.png" alt="comments" />
                      </td>
                      <td align="left" style="vertical-align: sub;">
                        <p style="font-family: Arial, Helvetica, sans-serif; font-size: 14px; text-align: start; color: white; margin: 0;">
                          <a href="https://discord.gg/jRyYNrVsmM" style="color: white; text-decoration-color: white;">discord</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                  ${TEXT('Support hours: Monday to Friday, 9 AM - 5 PM PST', '14px', 'margin-top: 0; margin-bottom: 0;')}                
                </td>
                <td></td>
                <td align="right">
                  <img
                    style="height: 125px; margin-right: 2px"
                    src="https://files.stage.vaultleap.com/images/klydo-logo.png"
                    alt="Klydo logo"
                  />
                </td>
              </tr>
            </table>`

export const Body = (
  fullName: string,
  vaultName: string,
  amount: string,
  transactionId: string,
  transactionLink: string,
  date: string,
  link: string,
  memo?: string
) => `
        ${BLUE_BOX(FirstBlueBoxContent(fullName, vaultName, amount, transactionId, transactionLink, date, link, memo))}
        ${BLUE_BOX(SecondBlueBoxContent())}
        <tr>
          <td align="left">
            ${TEXT(`This email was intended for ${fullName}.`, '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('This communication is intended solely for the addressee and may contain confidential information.', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`<a href="${process.env.REDIRECT_URL}/faq" style="color: white; text-decoration-color: white">Help</a> | <a href="${process.env.REDIRECT_URL}/terms-of-service" style="color: white; text-decoration-color: white">Terms of Service</a> | <a href="${process.env.REDIRECT_URL}/privacy-policy" style="color: white; text-decoration-color: white">Privacy Policy</a>`, '12px', 'margin-top: 0; margin-bottom: 16px;')}
  
            ${TEXT('© 2025 Klydo LLC', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('447 Sutter St, Ste 405 #1066', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('San Francisco, CA 94108, USA', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('Klydo and the Klydo logo are registered trademarks of Klydo.', '12px', 'margin-top: 0; margin-bottom: 0;')}
          </td>
        </tr>`

export const FundsSentTemplate = (
  fullName: string,
  vaultName: string,
  amount: string,
  transactionId: string,
  transactionLink: string,
  date: string,
  link: string,
  memo?: string
) => ({
  Subject,
  Body: LAYOUT(Body(fullName, vaultName, amount, transactionId, transactionLink, date, link, memo)),
})
