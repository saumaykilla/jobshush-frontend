import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { EventType } from 'aws-cdk-lib/aws-s3';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Duration } from 'aws-cdk-lib';
import { SqsDestination } from 'aws-cdk-lib/aws-s3-notifications';



const backend = defineBackend({
  auth,
  data,
  storage,
});


const uploadQueue = new Queue(
  backend.storage.stack,
  'UploadNotificationQueue',
  {
    queueName: 'upload-notification-queue',
    visibilityTimeout: Duration.seconds(300),
    retentionPeriod: Duration.days(14),
  }
);

backend.storage.resources.bucket.addEventNotification(
  EventType.OBJECT_CREATED,
  new SqsDestination(uploadQueue),
  {
    prefix: 'pdf/',
  },
);




