export type UploadFile = {
  s3Key: string
  fileBody: Buffer | string
  contentType: string
  bucketName: string
  expires?: Date
}
