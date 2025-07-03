import type { TShareRoleDto } from '../../vault/vault.dto'

import { TEXT } from './templateParts/text'
import { BUTTON } from './templateParts/button'
import { LAYOUT } from './templateParts/layout'
import { BLUE_BOX } from './templateParts/blueBox'

export const Subject = 'Vaultleap: Your Vault Has Been Created!'

export const FirstBlueBoxContent = (
  creatorFullName: string,
  projectName: string,
  vaultAddress: string,
  vaultFeePercentage: number,
  roles: TShareRoleDto[],
  profitSwitchAmount?: number,
  profitSwitchAddress?: string,
  isTaxFormEnabled?: boolean
) => `
            ${TEXT(`Hey, ${creatorFullName} Welcome to Your New Vaultleap Vault: ${projectName}`, '22px', 'margin-top: 0; margin-bottom: 6px;')}
            ${TEXT(`This secure digital Vault will streamline your team's fund distribution and enhance financial management. Here's a summary of your Vault setup:`, '14px', 'margin-top: 0; margin-bottom: 0;')}

            ${TEXT(`Vault Details for ${projectName}:`, '22px', 'line-height: 28.6px;')}

            ${roles.map((role) => TEXT(`${role.name}: ${role.sharePercentage}% share`, '14px', 'margin-top: 0; margin-bottom: 0;')).join('')}
            ${TEXT(`Vault Address: ${vaultAddress}`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`Vault Fee: ${vaultFeePercentage}%`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${isTaxFormEnabled ? TEXT('Tax Tracking: Active', '14px', 'margin-top: 0; margin-bottom: 0;') : ''}

            ${isTaxFormEnabled ? TEXT(`W-BEN / W-9 forms will be available for download in your account dashboard once the recipient has claimed their Vault Key. 1099 forms will be accessible at the end of the tax year.`, '14px', 'margin-bottom: 0;') : ''}
            ${profitSwitchAmount && profitSwitchAmount > 0 ? TEXT(`A Profit Switch has been activated and will be triggered once the threshold of ${profitSwitchAmount} USD is reached.`, '14px', 'margin-top: 0; margin-bottom: 0;') : ''}

            ${profitSwitchAddress && TEXT(`Profit Switch Address: ${profitSwitchAddress}`, '14px')}

            ${TEXT(`Team Notification`, '22px', 'margin-bottom: 0; line-height: 31.9px;')}
            ${TEXT(`We've streamlined the onboarding process for you. Each member listed in your Vault has been automatically notified about their role and provided with simple, secure instructions to claim their unique Vault Key.`, '14px', 'margin-top: 0; margin-bottom: 0; line-height: 20.3px;')}
            
            ${TEXT(`Next Step: Fund Your Vault`, '22px', 'text-decoration: underline')}

            ${TEXT(`Method 1 (Preferred): Vaultleap Dashboard`, '14px', 'font-weight: bold')}

            ${TEXT(`a. Visit our secure dashboard.`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`b. Log in to your account`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`c. Navigate to your Vault and follow the on-screen instructions to fund it`, '14px', 'margin-top: 0; margin-bottom: 0;')}

            ${TEXT(`Method 2: Direct Transfer`, '14px', 'font-weight: bold')}

            ${TEXT(`If you prefer, you can send funds directly to your Vault address.`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`Disclaimer: For Vaults using the Profit Switch feature, only send funds via the Vaultleap Dashboard UI (Method 1). Do not send bare ERC-20 transactions directly to the Vault address, as this may result in improper fund allocation.`, '14px', 'margin-top: 0; margin-bottom: 14px;')}

            ${BUTTON(`${process.env.REDIRECT_URL}/dashboard/vaults/`, `Go to My Dashboard`)}`

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
  vaultAddress: string,
  projectName: string,
  roles: TShareRoleDto[],
  vaultFeePercentage: number,
  profitSwitchAmount?: number,
  profitSwitchAddress?: string,
  isTaxFormEnabled?: boolean
) => `
        ${BLUE_BOX(FirstBlueBoxContent(creatorFullName, projectName, vaultAddress, vaultFeePercentage, roles, profitSwitchAmount, profitSwitchAddress, isTaxFormEnabled))}
        ${BLUE_BOX(SecondBlueBoxContent())}
        <tr>
          <td align="left">
            ${TEXT(`This email was intended for ${creatorFullName}.`, '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('This communication is intended solely for the addressee and may contain confidential information.', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`<a href="${process.env.REDIRECT_URL}/faq" style="color: white; text-decoration-color: white">Help</a> | <a href="${process.env.REDIRECT_URL}/terms-of-service" style="color: white; text-decoration-color: white">Terms of Service</a> | <a href="${process.env.REDIRECT_URL}/privacy-policy" style="color: white; text-decoration-color: white">Privacy Policy</a>`, '12px', 'margin-top: 0; margin-bottom: 16px;')}
  
            ${TEXT('© 2025 Klydo LLC', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('447 Sutter St, Ste 405 #1066', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('San Francisco, CA 94108, USA', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('Klydo and the Klydo logo are registered trademarks of Klydo.', '12px', 'margin-top: 0; margin-bottom: 0;')}
          </td>
        </tr>`

export const CreatorSummaryTemplate = (
  creatorFullName: string,
  vaultAddress: string,
  projectName: string,
  roles: TShareRoleDto[],
  vaultFeePercentage: number,
  profitSwitchAmount?: number,
  profitSwitchAddress?: string,
  isTaxFormEnabled?: boolean
) => ({
  Subject,
  Body: LAYOUT(
    Body(creatorFullName, vaultAddress, projectName, roles, vaultFeePercentage, profitSwitchAmount, profitSwitchAddress, isTaxFormEnabled)
  ),
})
