import { TEXT } from './templateParts/text'
import { BUTTON } from './templateParts/button'
import { LAYOUT } from './templateParts/layout'
import { BLUE_BOX } from './templateParts/blueBox'

export const Subject = "You've been invited to join a vault!"

const FirstBlueBoxContent = `
            ${TEXT('Hello! Just a friendly reminder that [full name] has allocated Vaultleap to you as a token of appreciation for your hard work on the [Project Name].')}
            ${TEXT("We noticed that you haven't claimed your Vault Key yet. Don't worry; it's not too late!")}`
const SecondBlueBoxContent = `
            ${TEXT("Vaultleap are tokens of ownership in your team's success. They represent your contribution to your team's achievements.")}
            ${TEXT('To claim your Vaultleap, you need to claim your Vault Key.')}
            <table align="center" cellspacing="24px;">
              <tr>
                <td align="right">
                  <img style="width: 96px; height: 70px" src="https://files.stage.vaultleap.com/images/key.png" alt="key" />
                </td>
                ${BUTTON(`${process.env.REDIRECT_URL}/activate-account`, 'CLICK TO CLAIM VAULT KEY')}
                <td align="left">
                  <img style="width: 105px; height: 105px" src="https://files.stage.vaultleap.com/images/vault.png" alt="vault" />
                </td>
              </tr>
              <tr>
                <td colspan="3" align="center">
                ${TEXT('Please Note:', '18px', 'text-decoration: underline; text-align: center')}
                ${TEXT("In accordance with KLYDO's Terms of Service, if a recipient fails to claim their Vault Key before 18 months from the date of allocation, a time lock mechanism will activate, allowing the Vault Creator the option to reclaim the unclaimed Vault Key. This mechanism ensures that funds are not indefinitely locked and provides Vault Creators with the flexibility to manage allocated funds effectively.", '18px', 'text-align: center')}
                </td>
              </tr>
            </table>`
const ThirdBlueBoxContent = `
            ${TEXT("Need Help? Reach out via [email] or create a support ticket on our [discord]. We're here to make this as smooth as possible! www.vaultleap.com")}`

export const Body = () => `
        ${BLUE_BOX(FirstBlueBoxContent)}
        ${BLUE_BOX(SecondBlueBoxContent)}
        ${BLUE_BOX(ThirdBlueBoxContent)}
        <tr>
          <td colspan="3">
          ${TEXT("Keep up the fantastic work! We're rooting for your success every step of the way. 🌟", '20px', 'font-weight: bold')}
          </td>
        </tr>`
export const ClaimYourVaultKeyReminderTemplate = () => ({
  Subject,
  Body: LAYOUT(Body()),
})
