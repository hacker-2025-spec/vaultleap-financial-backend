import { TEXT } from './templateParts/text'
import { BUTTON } from './templateParts/button'
import { LAYOUT } from './templateParts/layout'
import { BLUE_BOX } from './templateParts/blueBox'
import type { VirtualAccountCreationEmailParams } from '../email-sender.service.types'

export const Subject = 'Vaultleap: Your Virtual Account Has Been Created!'

export const FirstBlueBoxContent = (params: VirtualAccountCreationEmailParams) => {
  const { creatorFullName, email, vaultFeePercentage, destination, source } = params

  const isIban = 'iban' in source

  const bankInfoStr = (() => {
    const descriptionPart =
      'iban' in source
        ? `${TEXT(`Identifier Code: ${source.bic}`, '14px', 'margin-top: 0; margin-bottom: 0;')}
          ${TEXT(`Account Number: ${source.iban}`, '14px', 'margin-top: 0; margin-bottom: 0;')}`
        : `${TEXT(`Routing Number: ${source.routingNumber}`, '14px', 'margin-top: 0; margin-bottom: 0;')}
          ${TEXT(`Account Number: ${source.accountNumber}`, '14px', 'margin-top: 0; margin-bottom: 0;')}`

    return `${TEXT(`Account Type: ${isIban ? 'IBAN Bank Account' : 'US Bank Account'}`, '14px', 'margin-top: 0; margin-bottom: 0;')}
          ${TEXT(`Name: ${source.bankName}`, '14px', 'margin-top: 0; margin-bottom: 0;')}
          ${source.accountHolderName ? TEXT(`Account Holder Name: ${source.accountHolderName}`, '14px', 'margin-top: 0; margin-bottom: 0;') : ''}
          ${source.bankBeneficiaryName ? TEXT(`Beneficiary Name: ${source.bankBeneficiaryName}`, '14px', 'margin-top: 0; margin-bottom: 0;') : ''}
          ${descriptionPart}
          ${TEXT(`Currency: ${source.currency}`, '14px', 'margin-top: 0; margin-bottom: 0;')}`
  })()

  return `${TEXT(`Hey, ${creatorFullName} Welcome to Your New Vaultleap Virtual Account`, '22px', 'margin-top: 0; margin-bottom: 6px;')}
      ${TEXT(`This secure digital Virtual Account will streamline your team's fund distribution and enhance financial management. Here's a summary of your Virtual Account setup:`, '14px', 'margin-top: 0; margin-bottom: 0;')}

      ${TEXT(`Virtual Account Details:`, '22px', 'line-height: 28.6px;')}

      ${TEXT(`Creator Full Name: ${creatorFullName}`, '14px', 'margin-top: 0; margin-bottom: 0;')}
      ${TEXT(`Email: ${email}`, '14px', 'margin-top: 0; margin-bottom: 0;')}
      ${TEXT(`Service Fee: ${vaultFeePercentage}%`, '14px', 'margin-top: 0; margin-bottom: 0;')}
      
      ${TEXT(`Destination Info:`, '22px', 'line-height: 28.6px;')}

      ${TEXT(`Payment Rail: ${destination.paymentRail}`, '14px', 'margin-top: 0; margin-bottom: 0;')}
      ${TEXT(`Address: ${destination.vaultAddress}`, '14px', 'margin-top: 0; margin-bottom: 0;')}
      ${TEXT(`Currency: ${destination.currency}`, '14px', 'margin-top: 0; margin-bottom: 0;')}

      ${TEXT(`Virtual Bank Account:`, '22px', 'line-height: 28.6px;')}

      ${bankInfoStr}

      ${BUTTON(`${process.env.REDIRECT_URL}/dashboard/vaults/`, `Go to My Dashboard`)}`
}

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

export const Body = (params: VirtualAccountCreationEmailParams) => `
        ${BLUE_BOX(FirstBlueBoxContent(params))}
        ${BLUE_BOX(SecondBlueBoxContent())}
        <tr>
          <td align="left">
            ${TEXT(`This email was intended for ${params.creatorFullName}.`, '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('This communication is intended solely for the addressee and may contain confidential information.', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`<a href="${process.env.REDIRECT_URL}/faq" style="color: white; text-decoration-color: white">Help</a> | <a href="${process.env.REDIRECT_URL}/terms-of-service" style="color: white; text-decoration-color: white">Terms of Service</a> | <a href="${process.env.REDIRECT_URL}/privacy-policy" style="color: white; text-decoration-color: white">Privacy Policy</a>`, '12px', 'margin-top: 0; margin-bottom: 16px;')}
  
            ${TEXT('© 2025 Klydo LLC', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('447 Sutter St, Ste 405 #1066', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('San Francisco, CA 94108, USA', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('Klydo and the Klydo logo are registered trademarks of Klydo.', '12px', 'margin-top: 0; margin-bottom: 0;')}
          </td>
        </tr>`

export const VirtualAccountCreatorSummaryTemplate = (params: VirtualAccountCreationEmailParams) => ({
  Subject,
  Body: LAYOUT(Body(params)),
})
