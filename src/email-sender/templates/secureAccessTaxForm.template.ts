import { TEXT } from './templateParts/text'
import { LAYOUT } from './templateParts/layout'
import { BLUE_BOX } from './templateParts/blueBox'
import { BLUE_TEXT } from './templateParts/blueText'

export const Subject = 'Secure Access Code for Your Vaultleap Tax Documents'

const FirstBlueBoxContent = (name: string, code: string, timestamp: string, ipAddress: string) => `
            ${TEXT(`Hi ${name},`, '22px', 'margin-top: 0; margin-bottom: 6px;')}
            ${TEXT(`You recently requested access to your tax documents from your Vaultleap vault.`, '18px')}
            ${TEXT(`To maintain the highest level of security for your sensitive information, please follow these simple steps:`, '14px')}
            ${TEXT(`1. Navigate back to the Vaultleap tab in your browser`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`2. Enter Your One-Time Security Code`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${BLUE_TEXT(`Security Code: ${code}`)}
            
            ${TEXT(`Security Information:`, '14px')}
            ${TEXT(`• Access request recorded: ${timestamp}`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`• IP Address: ${ipAddress}`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('• Documents are secured with AES-256 encryption', '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`Didn't Request This? If you didn't request access to these documents:`, '14px')}
            ${TEXT(`Contact our security team immediately: <a href="mailto:support@klydo.io" style="color: white; text-decoration-color: white;">support@klydo.io</a>`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`Review your Vaultleap vault activity`, '14px', 'margin-top: 0; margin-bottom: 0;')}`

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

export const Body = (name: string, code: string, timestamp: string, ipAddress: string) => `
        ${BLUE_BOX(FirstBlueBoxContent(name, code, timestamp, ipAddress))}
        ${BLUE_BOX(SecondBlueBoxContent())}
        <tr>
          <td align="left">
            ${TEXT(`This email was intended for ${name}.`, '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('This communication is intended solely for the addressee and may contain confidential information.', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`<a href="${process.env.REDIRECT_URL}/faq" style="color: white; text-decoration-color: white">Help</a> | <a href="${process.env.REDIRECT_URL}/terms-of-service" style="color: white; text-decoration-color: white">Terms of Service</a> | <a href="${process.env.REDIRECT_URL}/privacy-policy" style="color: white; text-decoration-color: white">Privacy Policy</a>`, '12px', 'margin-top: 0; margin-bottom: 16px;')}
  
            ${TEXT('© 2025 Klydo LLC', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('447 Sutter St, Ste 405 #1066', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('San Francisco, CA 94108, USA', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('Klydo and the Klydo logo are registered trademarks of Klydo.', '12px', 'margin-top: 0; margin-bottom: 0;')}
          </td>
        </tr>`

export const SecureAccessTaxFormTemplate = (name: string, code: string, timestamp: string, ipAddress: string) => ({
  Subject,
  Body: LAYOUT(Body(name, code, timestamp, ipAddress)),
})
