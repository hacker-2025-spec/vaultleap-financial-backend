import { DataMapper } from '@nova-odm/mapper'
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { UsersEntity } from './users.entity'
import { UserResponseDTO } from './users.dto'
import type { UpdateUserDetailsDTO, UpdateUserAvatarDto } from './users.dto'
import { MSG } from '../consts/exceptions-messages'
import { S3ExternalStorage } from '../aws/S3ExternalStorage'
import { ConfigKeys, type IConfig } from '../config/config.interface'
import { AlchemyTransactionService } from '../alchemy/services/alchemy-transaction.service'
import { AlchemyClientService } from '../alchemy/services/alchemy-client.service'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)
  private avatarBucketName: string
  public constructor(
    @Inject(DataMapper) protected dataMapper: DataMapper,
    @Inject(ConfigService) private readonly configService: ConfigService<IConfig, true>,
    private s3ExternalStorage: S3ExternalStorage,
    private readonly alchemyTransactionService: AlchemyTransactionService,
    private readonly alchemyClient: AlchemyClientService
  ) {
    this.avatarBucketName = this.configService.get<string>(ConfigKeys.USER_AVATAR_BUCKET_NAME)
  }

  async getUserById(auth0Id: string): Promise<UsersEntity> {
    try {
      return await this.dataMapper.get(Object.assign(new UsersEntity(), { auth0Id }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch {
      throw new BadRequestException(MSG.USER_NOT_FOUND)
    }
  }

  async updateUserDetails(auth0Id: string, userDetailsPayload: UpdateUserDetailsDTO): Promise<UserResponseDTO> {
    try {
      const databaseRecord = await this.dataMapper.get(Object.assign(new UsersEntity(), { auth0Id }))

      databaseRecord.name = userDetailsPayload.name
      databaseRecord.entityName = userDetailsPayload.entityName
      databaseRecord.jurisdiction = userDetailsPayload.jurisdiction
      databaseRecord.registrationId = userDetailsPayload.registrationId
      databaseRecord.countryOfResidence = userDetailsPayload.countryOfResidence

      const updatedRecord = await this.dataMapper.update(databaseRecord)

      return Object.assign(new UserResponseDTO(), updatedRecord)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error)
    }
  }

  async uploadAvatar(auth0Id: string, { avatar }: UpdateUserAvatarDto): Promise<UserResponseDTO | null> {
    this.logger.log('UserService => uploadAvatar => auth0Id', auth0Id)

    try {
      const matches = avatar.match(/^data:(.+);base64,(.+)$/)
      if (!matches) throw new Error('Invalid Base64 format')

      const mimeType = matches[1]
      const base64Data = matches[2]

      const buffer = Buffer.from(base64Data, 'base64')

      const extension = mimeType.split('/')[1]

      const avatarKey = this.s3ExternalStorage.createS3Key(`${auth0Id}-${extension}`)

      const data = {
        s3Key: avatarKey,
        fileBody: buffer,
        contentType: mimeType,
        bucketName: this.avatarBucketName,
      }
      await this.s3ExternalStorage.uploadFile(data)

      this.logger.log('UserService => uploadAvatar => update avatar in user record')
      return await this.updateUserAvatar(auth0Id, avatarKey)
    } catch (error) {
      this.logger.log('UserService => uploadAvatar => failure', error)
      return null
    }
  }

  async uploadAvatarFile(auth0Id: string, file: Express.Multer.File): Promise<UserResponseDTO | null> {
    this.logger.log('UserService => uploadAvatarFile => auth0Id', auth0Id)

    try {
      if (!file.mimetype.startsWith('image/')) {
        throw new Error('File must be an image')
      }

      const extension = file.mimetype.split('/')[1]
      const avatarKey = this.s3ExternalStorage.createS3Key(`${auth0Id}.${extension}`)

      const data = {
        s3Key: avatarKey,
        fileBody: file.buffer,
        contentType: file.mimetype,
        bucketName: this.avatarBucketName,
      }
      await this.s3ExternalStorage.uploadFile(data)

      this.logger.log('UserService => uploadAvatarFile => update avatar in user record')
      return await this.updateUserAvatar(auth0Id, avatarKey)
    } catch (error) {
      this.logger.log('UserService => uploadAvatarFile => failure', error)
      throw new Error('Failed to upload avatar file. File too large.')
    }
  }

  async deleteAvatar(auth0Id: string): Promise<UserResponseDTO> {
    this.logger.log('UserService => deleteAvatar => auth0Id', auth0Id)
    const { s3Key, user } = await this.deleteUserAvatar(auth0Id)

    if (!s3Key) {
      this.logger.log('UserService => deleteAvatar => avatar not found', auth0Id)
      return user
    }

    try {
      this.logger.log('UserService => deleteAvatar => user avatar removed')
      await this.s3ExternalStorage.deleteFile({
        s3Key,
        bucketName: this.avatarBucketName,
      })
    } catch (error) {
      this.logger.log('UserService => deleteAvatar => failure', error)
      return user
    }

    return user
  }

  private async updateUserAvatar(auth0Id: string, avatarS3Key: string): Promise<UserResponseDTO> {
    const { s3Key } = await this.deleteUserAvatar(auth0Id)
    if (s3Key) {
      await this.s3ExternalStorage.deleteFile({
        s3Key,
        bucketName: this.avatarBucketName,
      })
    }

    const databaseRecord = await this.dataMapper.get(Object.assign(new UsersEntity(), { auth0Id }))
    databaseRecord.avatarS3Key = avatarS3Key
    databaseRecord.avatar = this.getAvatarUrl(avatarS3Key)
    const updatedRecord = await this.dataMapper.update(databaseRecord)
    return Object.assign(new UserResponseDTO(), updatedRecord)
  }

  private async deleteUserAvatar(auth0Id: string): Promise<{ user: UserResponseDTO; s3Key?: string }> {
    const databaseRecord = await this.dataMapper.get(Object.assign(new UsersEntity(), { auth0Id }))
    const { avatarS3Key } = databaseRecord
    delete databaseRecord.avatarS3Key
    delete databaseRecord.avatar
    await this.dataMapper.update(databaseRecord)
    return { user: databaseRecord, s3Key: avatarS3Key }
  }

  async updatePrivyWalletAddresses(auth0Id: string, privyWalletAddress: string, privySmartWalletAddress: string): Promise<UserResponseDTO> {
    this.logger.log('UserService => updatePrivyWalletAddresses => auth0Id', auth0Id)

    try {
      const databaseRecord = await this.dataMapper.get(Object.assign(new UsersEntity(), { auth0Id }))

      databaseRecord.privyWalletAddress = privyWalletAddress.toLowerCase()
      databaseRecord.privySmartWalletAddress = privySmartWalletAddress.toLowerCase()

      const updatedRecord = await this.dataMapper.update(databaseRecord)

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      Promise.all([
        this.alchemyClient.updateWebhook([privySmartWalletAddress]),
        this.alchemyTransactionService.syncTransactions([privySmartWalletAddress]),
      ])

      return Object.assign(new UserResponseDTO(), updatedRecord)
    } catch (error) {
      this.logger.error('UserService => updatePrivyWalletAddresses => failure', error)
      throw new Error('Failed to update Privy wallet addresses')
    }
  }

  private getAvatarUrl(s3key: string) {
    return this.s3ExternalStorage.getPublicUrl(this.avatarBucketName, s3key)
  }

  async getUserByPrivySmartWalletAddress(privySmartWalletAddress: string): Promise<UserResponseDTO> {
    const iterator = this.dataMapper.query(
      UsersEntity,
      { privySmartWalletAddress },
      { indexName: 'privySmartWalletAddressIndex', limit: 1 }
    )

    const { value: user, done: isDone } = await iterator.next()

    if (isDone || !user) {
      throw new NotFoundException('User with this smart wallet address not found')
    }

    return Object.assign(new UserResponseDTO(), user)
  }

  async listAllUsers(): Promise<UsersEntity[]> {
    try {
      const scanIterator = this.dataMapper.scan(UsersEntity)
      const userList: UserResponseDTO[] = []

      for await (const record of scanIterator) {
        userList.push(record)
      }

      return userList
    } catch (error) {
      this.logger.error('UsersService => listAllUsers => failed', error)
      throw new Error('Failed to fetch users')
    }
  }
}
