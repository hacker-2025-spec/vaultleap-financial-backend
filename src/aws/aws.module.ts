import { Module } from '@nestjs/common'
import { S3Client } from '@aws-sdk/client-s3'
import { KMSClient } from '@aws-sdk/client-kms'
import { SESClient } from '@aws-sdk/client-ses'
import { SFNClient } from '@aws-sdk/client-sfn'
import { EventBridgeClient } from '@aws-sdk/client-eventbridge'

import { S3ExternalStorage } from './S3ExternalStorage'

@Module({
  providers: [
    {
      useFactory: () => new SESClient({ region: 'us-east-1' }),
      provide: SESClient,
    },
    {
      useFactory: () => new EventBridgeClient({ region: 'us-east-1' }),
      provide: EventBridgeClient,
    },
    {
      useFactory: () => new KMSClient({ region: 'us-east-1' }),
      provide: KMSClient,
    },
    {
      useFactory: () => new SFNClient({ region: 'us-east-1' }),
      provide: SFNClient,
    },
    S3ExternalStorage,
  {
      provide: S3Client,
      useValue: new S3Client(),
    },
  ],
  exports: [SESClient, EventBridgeClient, KMSClient, SFNClient, S3ExternalStorage],
})
export class AwsModule {}
