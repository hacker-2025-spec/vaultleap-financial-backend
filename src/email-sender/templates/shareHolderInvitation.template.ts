import { TEXT } from './templateParts/text'
import { BUTTON } from './templateParts/button'
import { LAYOUT } from './templateParts/layout'
import { BLUE_BOX } from './templateParts/blueBox'

export const Subject = "Vaultleap: You've Been Added to a Vault!"

const FirstBlueBoxContent = (
  creatorFullName: string,
  projectName: string,
  roleName: string,
  shareHolderEmail: string,
  projectId: string,
  encryptedPrivateKey: string,
  address: string
) => `
            ${TEXT(`Hey ${roleName}, Welcome to Your New Vaultleap Vault.`, '22px', 'margin-top: 0; margin-bottom: 6px;')}
            ${TEXT(`${creatorFullName} has set up a Vaultleap Vault for ${projectName}. This secure digital Vault streamlines your payment processes and enhances financial management.`, '14px', 'margin-top: 0; margin-bottom: 0;')}

            ${TEXT(`Your Vaultleap Vault offers these key advantages:`, '22px', 'line-height: 28.6px;')}

            ${TEXT(`• Automated Tax Compliance - Your W9/W8-BEN forms are generated instantly, with 1099s every tax season`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`• Gasless Smart Wallet - Claim funds with just your fingerprint or Face ID, no crypto knowledge needed`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`• Email-Based Access - Receive and manage payments using just your email address`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`• Smart Vault Dashboard - Track your earnings, download tax forms, and manage distributions in one place`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`• Instant USDC Payments - Receive stable digital dollars that can be withdrawn to your bank`, '14px', 'margin-top: 0; margin-bottom: 0;')}

            ${TEXT(`Next Step: Claim Vault Key`, '22px', 'text-decoration: underline')}

            ${TEXT(`By claiming your Vaultleap Vault Key, you're taking a significant step towards streamlined financial management for ${projectName}. We're excited to help you optimize your payment processes and look forward to supporting your team's success.`, '14px')}

            ${TEXT(`Ready to get started? Click the button below to claim your Vault Key and unlock the full potential of Vaultleap.`, '14px', 'margin-top: 0; margin-bottom: 14px;')}

            ${BUTTON(`${process.env.REDIRECT_URL}/activate-account?e=${shareHolderEmail}&p=${projectId}&s=${encryptedPrivateKey}&a=${address}&v=2`, `Claim ${roleName} Vault Key`)}

            ${TEXT(`Important Security Notice`, '22px', 'margin-top: 14px; line-height: 28.6px;')}

            <div style="background-color: #091f2eCC; padding: 16px; border-radius: 8px;">
              ${TEXT('This email contains a cryptographically generated one-time activation key that provides initial Vault access. This temporary key is securely encrypted and accessible only to you. Upon claiming, this key will be permanently invalidated as your Vault access transitions to your self-custodial wallet through an irreversible smart contract interaction.', '12px', 'margin-top: 0; margin-bottom: 0; line-height: 1.5;')}
              ${TEXT('Important: Vault Keys must be claimed within 18 months. After this period:', '12px', 'margin-top: 0; margin-bottom: 0; line-height: 1.5;')}
              ${TEXT('• The activation key becomes permanently invalid', '12px', 'margin-top: 0; margin-bottom: 0; line-height: 1.5;')}
              ${TEXT('• Associated funds become eligible for reclamation by the Vault Creator', '12px', 'margin-top: 0; margin-bottom: 0; line-height: 1.5;')}
              ${TEXT('• The unclaimed allocation may be redistributed', '12px', 'margin-top: 0; margin-bottom: 0; line-height: 1.5;')}
              ${TEXT('• This smart contract process cannot be reversed', '12px', 'margin-top: 0; margin-bottom: 0; line-height: 1.5;')}
              ${TEXT('For security, claim your key promptly and never share this activation link. Klydo never holds custody of your keys or funds.', '12px', 'margin-top: 0; margin-bottom: 0; line-height: 1.5;')}
            </div>`

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
  creatorFullName: string,
  projectName: string,
  roleName: string,
  shareHolderEmail: string,
  projectId: string,
  privateKey: string,
  address: string
) => `
        ${BLUE_BOX(FirstBlueBoxContent(creatorFullName, projectName, roleName, shareHolderEmail, projectId, privateKey, address))}
        ${BLUE_BOX(SecondBlueBoxContent())}
        <tr>
          <td align="left">
            ${TEXT(`This email was intended for ${roleName}.`, '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('This communication is intended solely for the addressee and may contain confidential information.', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`<a href="${process.env.REDIRECT_URL}/faq" style="color: white; text-decoration-color: white">Help</a> | <a href="${process.env.REDIRECT_URL}/terms-of-service" style="color: white; text-decoration-color: white">Terms of Service</a> | <a href="${process.env.REDIRECT_URL}/privacy-policy" style="color: white; text-decoration-color: white">Privacy Policy</a>`, '12px', 'margin-top: 0; margin-bottom: 16px;')}
  
            ${TEXT('© 2025 Klydo LLC', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('447 Sutter St, Ste 405 #1066', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('San Francisco, CA 94108, USA', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('Klydo and the Klydo logo are registered trademarks of Klydo.', '12px', 'margin-top: 0; margin-bottom: 0;')}
          </td>
        </tr>`

export const ShareHolderInvitationTemplate = (
  creatorFullName: string,
  projectName: string,
  roleName: string,
  shareHolderEmail: string,
  projectId: string,
  encryptedPrivateKey: string,
  address: string
) => ({
  Subject,
  Body: LAYOUT(Body(creatorFullName, projectName, roleName, shareHolderEmail, projectId, encryptedPrivateKey, address)),
})
