export const Subject = 'You have pending reward'

export const Body = () => `
    <tr>
      <td>
        <table width="100%" cellspacing="0" cellpadding="0" style="text-align: center;">
          <tr>
            <td>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `

export const PendingRewardTemplate = () => ({
  Subject,
  Body,
})
