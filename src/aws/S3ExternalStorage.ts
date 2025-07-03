import { v4 as uuid } from 'uuid'

import { Injectable } from '@nestjs/common'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import type { UploadFile } from './types'

const urlExpiration = 180 // seconds

@Injectable()
export class S3ExternalStorage {
  constructor(public s3Client: S3Client) {}

  public createS3Key(fileName: string): string {
    return `${uuid()}_${fileName}`
  }

  public async generateSignedDownloadUrl(s3Key: string, bucketName: string, expiresIn = urlExpiration): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    })
    return await getSignedUrl(this.s3Client, command, { expiresIn })
  }

  public async uploadFile({ s3Key, fileBody, contentType, bucketName, expires }: UploadFile) {
    console.log(`Uploading '${s3Key}' to ${bucketName} s3`)
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileBody,
      ContentType: contentType,
      Expires: expires,
    })
    await this.s3Client.send(command)
  }

  public async deleteFile({ s3Key, bucketName }: Pick<UploadFile, 's3Key' | 'bucketName'>) {
    console.log(`Deleting '${s3Key}' from ${bucketName} s3`)
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
    })
    await this.s3Client.send(command)
  }

  public getPublicUrl(bucketName: string, s3Key: string) {
    // TODO: remove providing strings here and in the module declaration, use config instead
    const region = 'us-east-1'
    const baseUrl = `https://s3.${region}.amazonaws.com/${bucketName}/`
    return `${baseUrl}${s3Key}`
  }
}
