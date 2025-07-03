import { promisify } from 'node:util'
import { expressJwtSecret } from 'jwks-rsa'
import { expressjwt as jwt } from 'express-jwt'
import type { GetVerificationKey } from 'express-jwt'
import JsonWebToken from 'jsonwebtoken'

import { DataMapper } from '@nova-odm/mapper'
import { ConfigService } from '@nestjs/config'
import type { CanActivate, ExecutionContext } from '@nestjs/common'
import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'

import { EmailSenderService } from '../email-sender/email-sender.service'
import { MSG } from '../consts/exceptions-messages'
import { UsersEntity } from '../users/users.entity'
import type { Auth0Payload } from './auth0.payload'
import type { LinkedAccount } from './baseUserPrivy.types'
import { ConfigKeys } from '../config/config.interface'

@Injectable()
export class BaseUserGuard implements CanActivate {
  private readonly logger = new Logger(BaseUserGuard.name)

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(DataMapper) protected dataMapper: DataMapper,
    @Inject(EmailSenderService) private readonly emailSenderService: EmailSenderService
  ) {}

  private async addUser(userPayload: Auth0Payload): Promise<UsersEntity> {
    try {
      const isPremium = userPayload.roles_list?.findIndex((role: string) => role === 'Premium') >= 0

      const existingUser = await this.dataMapper.get(Object.assign(new UsersEntity(), { auth0Id: userPayload.sub })).catch(() => false)
      if (existingUser && existingUser instanceof UsersEntity) {
        if (existingUser.isPremium === isPremium) {
          return existingUser
        }
        return await this.dataMapper.update(Object.assign(new UsersEntity(), { ...existingUser, isPremium }))
      }

      const newUser = Object.assign(new UsersEntity(), { email: userPayload.email, auth0Id: userPayload.sub, isPremium })

      // try {
      //   this.logger.log('BaseUserGuard => Sending welcome email')
      //   await this.emailSenderService.sendWelcomeEmail(newUser.email)
      //   this.logger.log('BaseUserGuard => Welcome email sent')
      // } catch (error) {
      //   this.logger.log('BaseUserGuard => Error when sending welcome email', error)
      // }

      return this.dataMapper.put(newUser)
    } catch {
      throw new UnauthorizedException(MSG.UNAUTHORIZED)
    }
  }

  private async addUserPrivy(accessTokenPayload: JsonWebToken.JwtPayload, identityTokenPayload: JsonWebToken.JwtPayload) {
    try {
      const accessTokenPrivyId = accessTokenPayload.sub
      const privyId = identityTokenPayload.sub

      if (!privyId || !accessTokenPrivyId || privyId !== accessTokenPrivyId) {
        throw new Error('Privy IDs does not match in access and identity tokens')
      }

      const linkedAccounts: LinkedAccount[] = JSON.parse(identityTokenPayload.linked_accounts as string)
      const emailAccount = linkedAccounts.find((account) => account.type === 'email')

      const email = emailAccount?.address
      // Need to add isPremium

      if (!email) {
        throw new Error('JWT payload does not contain expected info')
      }

      const existingUser = await this.dataMapper.get(Object.assign(new UsersEntity(), { auth0Id: privyId })).catch(() => false)
      if (existingUser && existingUser instanceof UsersEntity) {
        return existingUser
      }

      const newUser = Object.assign(new UsersEntity(), { email, auth0Id: privyId })

      // try {
      //   this.logger.log('BaseUserGuard => Sending welcome email')
      //   await this.emailSenderService.sendWelcomeEmail(newUser.email)
      //   this.logger.log('BaseUserGuard => Welcome email sent')
      // } catch (error) {
      //   this.logger.log('BaseUserGuard => Error when sending welcome email', error)
      // }

      return this.dataMapper.put(newUser)
    } catch {
      throw new UnauthorizedException(MSG.UNAUTHORIZED)
    }
  }

  async canActivate(_context: ExecutionContext): Promise<boolean> {
    const checkJwt = promisify(
      jwt({
        secret: expressJwtSecret({
          rateLimit: true,
          jwksUri: `${this.configService.get('AUTH0_ISSUER_URL')}.well-known/jwks.json`,
          jwksRequestsPerMinute: 5,
          cache: true,
        }) as GetVerificationKey,
        issuer: this.configService.get('AUTH0_ISSUER_URL'),
        audience: this.configService.get('AUTH0_AUDIENCE'),
        algorithms: ['RS256'],
      })
    )

    try {
      const context = _context.switchToHttp()
      const request = context.getRequest()
      const response = context.getResponse()

      if ((request as Request).headers['new-auth']) {
        const accessToken = this.extractTokenFromHeader(request)
        const identityToken = this.extractPrivyIdentityTokenFromHeader(request)

        if (!identityToken || !accessToken) {
          throw new Error('No access or identity token')
        }

        // const PRIVY_APP_ID = this.configService.get(ConfigKeys.PRIVY_APP_ID) as string
        const PRIVY_TOKENS_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----\r\n${this.configService.get(ConfigKeys.PRIVY_TOKENS_PUBLIC_KEY)}\r\n-----END PUBLIC KEY-----`

        const accessTokenPayload = JsonWebToken.verify(accessToken, PRIVY_TOKENS_PUBLIC_KEY, {
          issuer: 'privy.io',
          // audience: PRIVY_APP_ID,
        })

        const identityTokenPayload = JsonWebToken.verify(identityToken, PRIVY_TOKENS_PUBLIC_KEY, {
          issuer: 'privy.io',
          // audience: PRIVY_APP_ID,
          ignoreExpiration: true,
        })

        if (typeof identityTokenPayload === 'string' || typeof accessTokenPayload === 'string') {
          throw new TypeError('Invalid payload or accessTokenPayload type')
        }

        request.user = await this.addUserPrivy(accessTokenPayload, identityTokenPayload)

        return true
      }

      await checkJwt(request, response)
      const userData = request.auth
      request.user = await this.addUser(userData)

      return true
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.log('error', error)
      throw new UnauthorizedException(MSG.UNAUTHORIZED)
    }
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(' ') ?? []
    return type === 'Bearer' ? token : null
  }

  private extractPrivyIdentityTokenFromHeader(request: Request): string | null {
    const idTokenHeader = request.headers['id-token']

    if (typeof idTokenHeader !== 'string') {
      return null
    }

    return idTokenHeader
  }
}
