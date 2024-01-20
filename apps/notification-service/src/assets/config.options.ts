import {KafkaOptions, Transport} from "@nestjs/microservices";


export const KAFKA_OPTIONS: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: (process.env.KAFKA_BOOTSTRAP_SERVER || '').split(','),
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
    },
  }
}
