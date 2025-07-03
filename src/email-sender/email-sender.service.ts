import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SendEmailCommand, SESClient, type SendEmailResponse } from '@aws-sdk/client-ses'

import type { IConfig } from '../config/config.interface'
import { ConfigKeys } from '../config/config.interface'
import type { TShareRoleDto } from '../vault/vault.dto'

import { EmailTemplates } from './templates/templates.root'
import { EmailTemplatesEnum } from './templates/templates.enum'
import { EmailLogStatusesEnum } from './email-sender.service.types'
import type {
  VirtualAccountCreationEmailParams,
  EmailLogItem,
  FundsSendEmailParams,
  DirectVaultCreationEmailParams,
  DirectVaultFundsSentEmailParams,
  VirtualAccountFundsSentEmailParams,
} from './email-sender.service.types'

@Injectable()
export class EmailSenderService {
  private readonly logger = new Logger(EmailSenderService.name)
  constructor(
    private readonly ses: SESClient,
    private readonly configService: ConfigService<IConfig, true>
  ) {}

  private createSource(sesSender: string) {
    return `Vaultleap <${sesSender}>`
  }

  private async createLoggedDispatch(mailSending: Promise<SendEmailResponse>, logData: EmailLogItem): Promise<void> {
    this.logger.log('Sending email start', JSON.stringify({ ...logData, status: EmailLogStatusesEnum.START }))
    await mailSending
      .then((result) => {
        this.logger.log('Sending email end', JSON.stringify({ ...logData, status: EmailLogStatusesEnum.END, MessageId: result.MessageId }))
      })
      .catch((error) => {
        this.logger.log('Sending email fail', JSON.stringify({ ...logData, status: EmailLogStatusesEnum.FAIL, MessageId: error.MessageId }))
        throw error
      })
  }

  public async sendShareHolderInvitationEmail(
    creatorFullName: string,
    projectName: string,
    roleName: string, // Added roleName parameter
    shareHolderEmail: string,
    projectId: string,
    encryptedPrivateKey: string,
    address: string = ''
  ): Promise<void> {
    const sesSender = this.configService.get(ConfigKeys.SES_SENDER, { infer: true })

    const emailTemplate = EmailTemplates[EmailTemplatesEnum.SHARE_HOLDER_INVITATION](
      creatorFullName,
      projectName,
      roleName, // Passed roleName to the template
      encodeURIComponent(shareHolderEmail),
      encodeURIComponent(projectId),
      encodeURIComponent(encryptedPrivateKey),
      encodeURIComponent(address)
    )

    const logData = {
      type: EmailTemplatesEnum.SHARE_HOLDER_INVITATION,
      to: shareHolderEmail,
      time: Date.now(),
    }

    await this.createLoggedDispatch(
      this.ses.send(
        new SendEmailCommand({
          Source: this.createSource(sesSender),
          Message: {
            Subject: { Data: emailTemplate.Subject },
            Body: {
              Html: {
                Data: emailTemplate.Body,
              },
            },
          },
          Destination: { ToAddresses: [shareHolderEmail] },
        })
      ),
      logData
    )
  }

  public async sendOwnerSummaryEmail(
    creatorFullName: string, // Added creatorFullName parameter
    vaultAddress: string,
    projectName: string,
    roles: TShareRoleDto[],
    ownerEmail: string,
    vaultFeePercentage: number,
    profitSwitchAmount?: number,
    profitSwitchAddress?: string,
    isTaxFormEnabled?: boolean
  ): Promise<void> {
    const sesSender = this.configService.get(ConfigKeys.SES_SENDER, { infer: true })

    const emailTemplate = EmailTemplates[EmailTemplatesEnum.CREATOR_SUMMARY](
      creatorFullName, // Passed creatorFullName as the first parameter
      vaultAddress,
      projectName,
      roles,
      vaultFeePercentage,
      profitSwitchAmount,
      profitSwitchAddress,
      isTaxFormEnabled
    )

    const logData = {
      type: EmailTemplatesEnum.CREATOR_SUMMARY,
      to: ownerEmail,
      time: Date.now(),
    }

    await this.createLoggedDispatch(
      this.ses.send(
        new SendEmailCommand({
          Source: this.createSource(sesSender),
          Message: {
            Subject: { Data: emailTemplate.Subject },
            Body: {
              Html: {
                Data: emailTemplate.Body,
              },
            },
          },
          Destination: { ToAddresses: [ownerEmail] },
        })
      ),
      logData
    )
  }

  public async sendAdminReclaimVaultKeysEmail(
    creatorFullName: string,
    projectName: string,
    ownerEmail: string,
    adminWalletAddress: string,
    roleName: string,
    unclaimedAmount: string,
    projectId: string,
    tokenId: string,
    address: string = ''
  ): Promise<void> {
    const sesSender = this.configService.get(ConfigKeys.SES_SENDER, { infer: true })

    const emailTemplate = EmailTemplates[EmailTemplatesEnum.RECLAIM_VAULT_KEY](
      creatorFullName,
      projectName,
      adminWalletAddress,
      roleName,
      unclaimedAmount,
      encodeURIComponent(projectId),
      encodeURIComponent(address),
      encodeURIComponent(tokenId)
    )

    const logData = {
      type: EmailTemplatesEnum.RECLAIM_VAULT_KEY,
      to: ownerEmail,
      time: Date.now(),
    }
    this.logger.log({ ...logData, status: 'sending-start' })
    await this.ses
      .send(
        new SendEmailCommand({
          Source: this.createSource(sesSender),
          Message: {
            Subject: { Data: emailTemplate.Subject },
            Body: {
              Html: {
                Data: emailTemplate.Body,
              },
            },
          },
          Destination: { ToAddresses: [ownerEmail] },
        })
      )
      .then((result) => {
        this.logger.log({ ...logData, status: 'sending-end', MessageId: result.MessageId })
      })
      .catch((error) => {
        this.logger.log({ ...logData, status: 'sending-failed', MessageId: error.MessageId })
        throw error
      })
  }

  public async sendSecureAccessTaxFormEmail(
    email: string,
    name: string,
    code: string,
    timestamp: string,
    ipAddress: string
  ): Promise<void> {
    const sesSender = this.configService.get(ConfigKeys.SES_SENDER, { infer: true })

    const emailTemplate = EmailTemplates[EmailTemplatesEnum.SECURE_ACCESS_TAX_FORM](name, code, timestamp, ipAddress)

    const logData = {
      type: EmailTemplatesEnum.RECLAIM_VAULT_KEY,
      to: email,
      time: Date.now(),
    }

    await this.createLoggedDispatch(
      this.ses.send(
        new SendEmailCommand({
          Source: this.createSource(sesSender),
          Message: {
            Subject: { Data: emailTemplate.Subject },
            Body: {
              Html: {
                Data: emailTemplate.Body,
              },
            },
          },
          Destination: { ToAddresses: [email] },
        })
      ),
      logData
    )
  }

  public async sendFundsSent({
    email,
    fullName,
    amount,
    vaultName,
    transactionId,
    transactionLink,
    date,
    link,
    memo,
  }: FundsSendEmailParams): Promise<void> {
    const sesSender = this.configService.get(ConfigKeys.SES_SENDER, { infer: true })

    const emailTemplate = EmailTemplates[EmailTemplatesEnum.FUNDS_SENT](
      fullName,
      vaultName,
      amount,
      transactionId,
      transactionLink,
      date,
      link,
      memo
    )

    const logData = {
      type: EmailTemplatesEnum.FUNDS_SENT,
      to: email,
      time: Date.now(),
    }

    await this.createLoggedDispatch(
      this.ses.send(
        new SendEmailCommand({
          Source: this.createSource(sesSender),
          Message: {
            Subject: { Data: emailTemplate.Subject },
            Body: {
              Html: {
                Data: emailTemplate.Body,
              },
            },
          },
          Destination: { ToAddresses: [email] },
        })
      ),
      logData
    )
  }

  // public async sendWelcomeEmail(email: string): Promise<void> {
  //   const sesSender = this.configService.get(ConfigKeys.SES_SENDER, { infer: true })

  //   const emailTemplate = EmailTemplates[EmailTemplatesEnum.WELCOME]()

  //   const logData = {
  //     type: EmailTemplatesEnum.WELCOME,
  //     to: email,
  //     time: Date.now(),
  //   }

  //   await this.createLoggedDispatch(
  //     this.ses.send(
  //       new SendEmailCommand({
  //         Source: this.createSource(sesSender),
  //         Message: {
  //           Subject: { Data: emailTemplate.Subject },
  //           Body: {
  //             Html: {
  //               Data: emailTemplate.Body,
  //             },
  //           },
  //         },
  //         Destination: { ToAddresses: [email] },
  //       })
  //     ),
  //     logData
  //   )
  // }

  public async sendDirectVaultSummaryEmail(params: DirectVaultCreationEmailParams): Promise<void> {
    const { email } = params

    const sesSender = this.configService.get(ConfigKeys.SES_SENDER, { infer: true })

    const emailTemplate = EmailTemplates[EmailTemplatesEnum.DIRECT_VAULT_CREATOR_SUMMARY](params)

    const logData = {
      type: EmailTemplatesEnum.DIRECT_VAULT_CREATOR_SUMMARY,
      to: email,
      time: Date.now(),
    }

    await this.createLoggedDispatch(
      this.ses.send(
        new SendEmailCommand({
          Source: this.createSource(sesSender),
          Message: {
            Subject: { Data: emailTemplate.Subject },
            Body: {
              Html: {
                Data: emailTemplate.Body,
              },
            },
          },
          Destination: { ToAddresses: [email] },
        })
      ),
      logData
    )
  }

  public async sendDirectVaultFundsSentEmail(params: DirectVaultFundsSentEmailParams): Promise<void> {
    const { email } = params

    const sesSender = this.configService.get(ConfigKeys.SES_SENDER, { infer: true })

    const emailTemplate = EmailTemplates[EmailTemplatesEnum.DIRECT_VAULT_FUNDS_SENT](params)

    const logData = {
      type: EmailTemplatesEnum.DIRECT_VAULT_FUNDS_SENT,
      to: email,
      time: Date.now(),
    }

    await this.createLoggedDispatch(
      this.ses.send(
        new SendEmailCommand({
          Source: this.createSource(sesSender),
          Message: {
            Subject: { Data: emailTemplate.Subject },
            Body: {
              Html: {
                Data: emailTemplate.Body,
              },
            },
          },
          Destination: { ToAddresses: [email] },
        })
      ),
      logData
    )
  }

  public async sendVirtualAccountSummaryEmail(params: VirtualAccountCreationEmailParams): Promise<void> {
    const { email } = params

    const sesSender = this.configService.get(ConfigKeys.SES_SENDER, { infer: true })

    const emailTemplate = EmailTemplates[EmailTemplatesEnum.VIRTUAL_ACCOUNT_CREATOR_SUMMARY](params)

    const logData = {
      type: EmailTemplatesEnum.VIRTUAL_ACCOUNT_CREATOR_SUMMARY,
      to: email,
      time: Date.now(),
    }

    await this.createLoggedDispatch(
      this.ses.send(
        new SendEmailCommand({
          Source: this.createSource(sesSender),
          Message: {
            Subject: { Data: emailTemplate.Subject },
            Body: {
              Html: {
                Data: emailTemplate.Body,
              },
            },
          },
          Destination: { ToAddresses: [email] },
        })
      ),
      logData
    )
  }

  public async sendVirtualAccountFundsSentEmail(params: VirtualAccountFundsSentEmailParams): Promise<void> {
    const { email } = params

    const sesSender = this.configService.get(ConfigKeys.SES_SENDER, { infer: true })

    const emailTemplate = EmailTemplates[EmailTemplatesEnum.VIRTUAL_ACCOUNT_FUNDS_SENT](params)

    const logData = {
      type: EmailTemplatesEnum.VIRTUAL_ACCOUNT_FUNDS_SENT,
      to: email,
      time: Date.now(),
    }

    await this.createLoggedDispatch(
      this.ses.send(
        new SendEmailCommand({
          Source: this.createSource(sesSender),
          Message: {
            Subject: { Data: emailTemplate.Subject },
            Body: {
              Html: {
                Data: emailTemplate.Body,
              },
            },
          },
          Destination: { ToAddresses: [email] },
        })
      ),
      logData
    )
  }

  public async sendSupportTicketEmail(name: string, email: string, subject: string, message: string): Promise<void> {
    const supportEmail = this.configService.get<string>(ConfigKeys.SUPPORT_EMAIL, { infer: true })
    const sesSender = this.configService.get(ConfigKeys.SES_SENDER, { infer: true })

    const emailTemplate = EmailTemplates[EmailTemplatesEnum.SUPPORT]({
      name,
      email,
      subject,
      message,
    })

    const logData = {
      type: EmailTemplatesEnum.SUPPORT,
      to: supportEmail,
      time: Date.now(),
    }

    await this.createLoggedDispatch(
      this.ses.send(
        new SendEmailCommand({
          Source: this.createSource(sesSender),
          Message: {
            Subject: { Data: emailTemplate.Subject },
            Body: {
              Html: {
                Data: emailTemplate.Body,
              },
            },
          },
          Destination: { ToAddresses: [supportEmail] },
        })
      ),
      logData
    )
  }
}
