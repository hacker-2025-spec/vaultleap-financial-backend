import { type ExecutionContext } from '@nestjs/common'

import type { UploadFile } from '../aws/types'
import type { UsersEntity } from '../users/users.entity'

export class MockS3ExternalStorage {
  public createS3Key(fileName: string): string {
    return `${fileName}`
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public uploadFile({ s3Key, fileBody, contentType, bucketName }: UploadFile) {
    console.log(`Mock uploading file '${s3Key}' to S3`)
  }

  public async generateSignedDownloadUrl(s3Key: string, bucketName: string, _expiresIn = 180): Promise<string> {
    // eslint-disable-next-line unicorn/no-useless-promise-resolve-reject
    return Promise.resolve(`http://fake-s3/${bucketName}/${s3Key}`)
  }
}

export class MockBaseUserGuard {
  private static userData: Partial<UsersEntity> = {
    auth0Id: 'auth0|1234567890',
    email: 'logged-user@test.com',
  }

  public static getLoggedUserData() {
    return MockBaseUserGuard.userData
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    request.user = MockBaseUserGuard.userData
    return true
  }
}
