export const LAYOUT = (content: string) => `
  <body
    style="
      background-color: #10628f;
      background-size: cover;
      background-image: url(https://files.stage.vaultleap.com/images/background-email.png);
      overflow-x: hidden;
    "
  >
    <table width="100%" style="border-spacing: 0; margin: 0; padding: 0 12px; width: 100%">
      <table align="center" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="text-align: center; margin-top: 26px">
        <tr>
          <td style="width: 100%" align="center">
            <img
              style="width: 300px"
              src="https://files.stage.vaultleap.com/images/VaultLeapLogo.png"
              alt="Vaultleap Logo"
            />
          </td>
        </tr>
      </table>

      <table
        role="presentation"
        width="90%"
        align="center"
        cellspacing="16px"
        cellpadding="0"
        style="text-align: center; border-radius: 8px; background-color: #15294A; margin-top: 24px"
      >
        ${content}
      </table>
      <table align="center" role="presentation" width="100%" cellspacing="0" cellpadding="0" style="text-align: center; margin-top: 16px">
        <tr>
          <td align="left" style="width: 40%">
            <p style="font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: white">© 2023 - 2025 KLYDO, LLC</p>
          </td>
          <td align="center" style="width: 20%"></td>
          <td align="right" style="width: 40%"></td>
        </tr>
      </table>
    </table>
  </body>
  `
