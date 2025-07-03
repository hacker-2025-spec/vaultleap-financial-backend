import { TEXT } from './templateParts/text'
import { BUTTON } from './templateParts/button'
import { LAYOUT } from './templateParts/layout'
import { BLUE_BOX } from './templateParts/blueBox'

export const Subject = 'Unclaimed Vaultleap: Reclaim Your Funds'

const FirstBlueBoxContent = (
  creatorFullName: string,
  projectName: string,
  adminWalletAddress: string,
  roleName: string,
  unclaimedAmount: string,
  projectId: string,
  address: string,
  tokenId: string
) => `
            ${TEXT(`Hey ${creatorFullName},`, '22px', 'margin-top: 0; margin-bottom: 6px;')}

            ${TEXT(`Important Notice: Unclaimed Vault Keys in ${projectName}`, '18px')}

            ${TEXT(`It has been 18 months since you created the vault "${projectName}" and allocated Vaultleap to your team members. Our records indicate that some team members have not claimed their Vault Keys within this period. As per our platform's terms and conditions, unclaimed vault keys after 18 months are eligible for reclamation by the Vault Creator.`, '14px')}

            ${TEXT(`Unclaimed Vault Keys Details:`, '22px', 'margin-bottom: 0;')}
            ${TEXT(`1. ${roleName}: ${unclaimedAmount} USDC`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`Admin Wallet Address: ${adminWalletAddress}`, '14px', 'margin-top: 0;')}
            
            ${TEXT(`Next Step: Reclaim Vault Key`, '22px', 'text-decoration: underline')}

            ${TEXT(`By reclaiming these unclaimed funds, you're ensuring efficient management of your team's financial resources. To reclaim these funds, please follow these steps:`, '14px')}
  
            ${TEXT(`1. Click the "Reclaim Vault Key" button below.`, '14px', 'margin-bottom: 0;')}
            ${TEXT(`2. Login to your existing Vaultleap account.`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`3. Navigate to the Claim Platform within your account dashboard.`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`4. Locate the claimable Vaultleap and click "Claim USDC" to initiate the process.`, '14px', 'margin-top: 0;')}
  
            ${TEXT(`Ready to reclaim? Click the button below to start the process and optimize your vault's fund allocation.`, '14px', 'margin-bottom: 14px;')}

            ${BUTTON(`${process.env.REDIRECT_URL}/reclaim-vault-keys?p=${projectId}&a=${address}&t=${tokenId}`, `Reclaim ${projectName} Vault Key`)}`

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
  adminWalletAddress: string,
  roleName: string,
  unclaimedAmount: string,
  projectId: string,
  address: string,
  tokenId: string
) => `
        ${BLUE_BOX(FirstBlueBoxContent(creatorFullName, projectName, adminWalletAddress, roleName, unclaimedAmount, projectId, address, tokenId))}
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

export const ReclaimVaultKeyTemplate = (
  creatorFullName: string,
  projectName: string,
  adminWalletAddress: string,
  roleName: string,
  unclaimedAmount: string,
  projectId: string,
  address: string,
  tokenId: string
) => ({
  Subject,
  Body: LAYOUT(Body(creatorFullName, projectName, adminWalletAddress, roleName, unclaimedAmount, projectId, address, tokenId)),
})
