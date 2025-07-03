import { EmailTemplatesEnum } from './templates.enum'
import { PendingRewardTemplate } from './pendingReward.template'
import { CreatorSummaryTemplate } from './creatorSummary.template'
import { ReclaimVaultKeyTemplate } from './reclaimVaultKey.template'
import { SecureAccessTaxFormTemplate } from './secureAccessTaxForm.template'
import { ShareHolderInvitationTemplate } from './shareHolderInvitation.template'
import { ClaimYourVaultKeyReminderTemplate } from './claimVaultKeyReminder.template'
import { FundsSentTemplate } from './fundsSent.template'
import { WelcomeTemplate } from './welcome.template'
import { DirectVaultCreatorSummaryTemplate } from './directVaultCreatorSummary.template'
import { DirectVaultFundsSentTemplate } from './directVaultFundsSent.template'
import { VirtualAccountCreatorSummaryTemplate } from './virtualAccountCreatorSummary.template'
import { VirtualAccountFundsSentTemplate } from './virtualAccountFundsSent.template'
import { SupportTicketTemplate } from './supportTicket.template'

export const EmailTemplates = {
  [EmailTemplatesEnum.CREATOR_SUMMARY]: CreatorSummaryTemplate,
  [EmailTemplatesEnum.DIRECT_VAULT_CREATOR_SUMMARY]: DirectVaultCreatorSummaryTemplate,
  [EmailTemplatesEnum.VIRTUAL_ACCOUNT_CREATOR_SUMMARY]: VirtualAccountCreatorSummaryTemplate,
  [EmailTemplatesEnum.PENDING_REWARD]: PendingRewardTemplate,
  [EmailTemplatesEnum.SHARE_HOLDER_INVITATION]: ShareHolderInvitationTemplate,
  [EmailTemplatesEnum.SECURE_ACCESS_TAX_FORM]: SecureAccessTaxFormTemplate,
  [EmailTemplatesEnum.CLAIM_VAULT_KEY_REMINDER]: ClaimYourVaultKeyReminderTemplate,
  [EmailTemplatesEnum.RECLAIM_VAULT_KEY]: ReclaimVaultKeyTemplate,
  [EmailTemplatesEnum.FUNDS_SENT]: FundsSentTemplate,
  [EmailTemplatesEnum.WELCOME]: WelcomeTemplate,
  [EmailTemplatesEnum.DIRECT_VAULT_FUNDS_SENT]: DirectVaultFundsSentTemplate,
  [EmailTemplatesEnum.VIRTUAL_ACCOUNT_FUNDS_SENT]: VirtualAccountFundsSentTemplate,
  [EmailTemplatesEnum.SUPPORT]: SupportTicketTemplate,
}
