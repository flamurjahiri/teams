import {KafkaOptions, Transport} from "@nestjs/microservices";
import {Partitioners} from "kafkajs";
import {join} from "path";

export const KAFKA_OPTIONS: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: (process.env.KAFKA_BOOTSTRAP_SERVER || 'localhost').split(','),
      ssl: false,
      sasl: {
        mechanism: process.env.KAFKA_SASL_MECHANISM as any,
        username: process.env.KAFKA_SASL_USERNAME,
        password: process.env.KAFKA_SASL_PASSWORD,
      },
      connectionTimeout: 10000,
      requestTimeout: 10000,
      authenticationTimeout: 10000,
      retry: {
        maxRetryTime: 5,
        initialRetryTime: 1000
      }
    },
    consumer: {
      groupId: process.env.KAFKA_CONSUMER_GROUP
    }
  }
}


export const NOTIFICATION_SERVICE = {
  url: `${process.env.NOTIFICATION_SERVICE}:${process.env.NOTIFICATION_SERVICE}`,
  package: 'notifications',
  protoPath: join(__dirname, '../../../apps/teams/src/app/protos/notifications.proto')
}
