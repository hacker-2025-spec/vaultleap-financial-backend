import { BLUE_BOX } from './templateParts/blueBox'
import { BUTTON } from './templateParts/button'
import { LAYOUT } from './templateParts/layout'
import { TEXT } from './templateParts/text'

export const Subject = 'Welcome to Vaultleap! 🚀 Simplify Your Payments & Compliance'

export const FirstBlueBoxContent = () => `
            ${TEXT(`Hello!`, '22px', 'margin-top: 0; margin-bottom: 6px;')}
            ${TEXT(`Welcome to <b>Vaultleap</b> — where modern businesses simplify payments, payroll, and compliance with ease! We’re excited to have you onboard and can’t wait for you to explore all the ways Vaultleap can streamline your processes.`, '14px', 'margin-top: 0; margin-bottom: 0;')}

            ${TEXT(`Here’s what you can do with Vaultleap:`, '22px', 'line-height: 28.6px;')}
            
            ${TEXT(`✅ Create secure, reusable Vaults for payments.`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`✅ Automate W9, W8-BEN, and 1099 compliance effortlessly.`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`✅ Send USDC payments globally—no gas fees, no delays.`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`✅ Invite team members via email—onboard instantly, no wallet needed!`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            
            ${TEXT(`Get started in minutes:`, '22px', 'line-height: 28.6px;')}
          
            ${TEXT(`1. Log in to your account: <a href="${process.env.REDIRECT_URL}/faq" style="color: white; text-decoration-color: white; font-weight: bold">Login link</a>`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`2. Create your first Vault: <a href="${process.env.REDIRECT_URL}/creator/" style="color: white; text-decoration-color: white; font-weight: bold">Create Your Vault Button</a>`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`3. Explore your dashboard and discover the tools built for your business needs.`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            
            ${TEXT(`Have questions or need help? Our support team is here for you!`, '22px', 'line-height: 28.6px;')}
            
            ${TEXT(` 📧 Email us: <a href="mailto:support@klydo.io" style="color: white; text-decoration-color: white; font-weight: bold">support@klydo.io</a>`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(` 📚 Visit our <a href="${process.env.REDIRECT_URL}/faq" style="color: white; text-decoration-color: white; font-weight: bold">Help Center</a>`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            
            ${TEXT(`Cheers,`, '14px', 'margin-top: 10px; margin-bottom: 0;')}
            ${TEXT(`The Vaultleap Team`, '14px', 'margin-top: 0; margin-bottom: 0;')}
            
            ${BUTTON(`${process.env.REDIRECT_URL}/dashboard/vaults/`, `Get Started Now`)}
            
            ${TEXT(`<b>P.S.</b> Ready to explore how Vaultleap can transform your payments? Dive in today and see the difference.`, '14px', 'margin-top: 0; margin-bottom: 0;')}
`
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

export const Body = () => `
        ${BLUE_BOX(FirstBlueBoxContent())}
        ${BLUE_BOX(SecondBlueBoxContent())}
        <tr>
          <td align="left">
            ${TEXT('This communication is intended solely for the addressee and may contain confidential information.', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT(`<a href="${process.env.REDIRECT_URL}/faq" style="color: white; text-decoration-color: white">Help</a> | <a href="${process.env.REDIRECT_URL}/terms-of-service" style="color: white; text-decoration-color: white">Terms of Service</a> | <a href="${process.env.REDIRECT_URL}/privacy-policy" style="color: white; text-decoration-color: white">Privacy Policy</a>`, '12px', 'margin-top: 0; margin-bottom: 16px;')}
  
            ${TEXT('© 2025 Klydo LLC', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('447 Sutter St, Ste 405 #1066', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('San Francisco, CA 94108, USA', '12px', 'margin-top: 0; margin-bottom: 0;')}
            ${TEXT('Klydo and the Klydo logo are registered trademarks of Klydo.', '12px', 'margin-top: 0; margin-bottom: 0;')}
          </td>
        </tr>`

export const WelcomeTemplate = () => ({
  Subject,
  Body: LAYOUT(Body()),
})
