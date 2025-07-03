import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger'
import { BadRequestException, Body, Controller, Delete, Get, Inject, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import { BaseUserGuard } from '../auth/baseUser.guard'

import { UsersEntity } from './users.entity'
import { UsersService } from './users.service'
import { UserContext } from './users.decorator'
import { UpdateUserAvatarDto, UpdateUserDetailsDTO, UserResponseDTO, UpdatePrivyWalletAddressesDto } from './users.dto'
import { CustomersService } from '../customers/customers.service'
import { BridgeKYCService } from '../bridge-kyc/bridge-kyc.service'

@ApiTags('User')
@UseGuards(BaseUserGuard)
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(
    public usersService: UsersService,
    @Inject(CustomersService) private customersService: CustomersService,
    @Inject(BridgeKYCService) private bridgeKycService: BridgeKYCService
  ) {}

  @Post('/update-details')
  @ApiResponse({ type: UserResponseDTO, status: 200 })
  async updateUserDetails(@UserContext() user: UsersEntity, @Body() userDetails: UpdateUserDetailsDTO): Promise<UserResponseDTO> {
    return await this.usersService.updateUserDetails(user.auth0Id, userDetails)
  }

  @Post('/update-privy-wallets')
  @ApiResponse({ type: UserResponseDTO, status: 200 })
  async updatePrivyWalletAddresses(
    @UserContext() user: UsersEntity,
    @Body() walletAddresses: UpdatePrivyWalletAddressesDto
  ): Promise<UserResponseDTO> {
    return await this.usersService.updatePrivyWalletAddresses(
      user.auth0Id,
      walletAddresses.privyWalletAddress,
      walletAddresses.privySmartWalletAddress
    )
  }

  @Post('/me/upload-avatar')
  @ApiResponse({ type: UserResponseDTO, status: 200 })
  async uploadAvatar(@UserContext() user: UsersEntity, @Body() updateUserAvatarDto: UpdateUserAvatarDto) {
    if (!updateUserAvatarDto.avatar) {
      throw new BadRequestException('User avatar base64 string is required')
    }

    return await this.usersService.uploadAvatar(user.auth0Id, updateUserAvatarDto)
  }

  @Post('/me/upload-avatar-file')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (request, file, callback) => {
        if (!file.mimetype.startsWith('image/')) {
          return callback(new BadRequestException('Only image files are allowed'), false)
        }
        callback(null, true)
      },
    })
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image file',
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (max 5MB)',
        },
      },
    },
  })
  @ApiResponse({ type: UserResponseDTO, status: 200 })
  async uploadAvatarFile(@UserContext() user: UsersEntity, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Avatar file is required')
    }

    return await this.usersService.uploadAvatarFile(user.auth0Id, file)
  }

  @Delete('/me/delete-avatar')
  @ApiResponse({ type: UserResponseDTO, status: 200 })
  async deleteAvatar(@UserContext() user: UsersEntity) {
    return await this.usersService.deleteAvatar(user.auth0Id)
  }

  @Get('/me')
  @ApiResponse({ type: UserResponseDTO, status: 200 })
  async getMe(@UserContext() user: UsersEntity): Promise<UserResponseDTO> {
    const [userRecord, customerRecord, bridgeKycRecord] = await Promise.all([
      this.usersService.getUserById(user.auth0Id),
      this.customersService.getCustomerByAuth0Id(user.auth0Id),
      this.bridgeKycService.getBridgeKYC(user.auth0Id),
    ])

    return Object.assign(new UserResponseDTO(), { ...userRecord, customer: customerRecord, bridgeKyc: bridgeKycRecord })
  }
}
