import {NestFactory} from '@nestjs/core';
import {join} from 'path'

import {AppModule} from './app/app.module';
import {GrpcOptions, KafkaOptions, Transport} from "@nestjs/microservices";
import {Logger} from "@nestjs/common";
import {KAFKA_OPTIONS} from "./assets/config.options";
import {GRPC_HOST, GRPC_PORT} from "./assets/environments";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.connectMicroservice<GrpcOptions>({
    transport: Transport.GRPC,
    options: {
      url: `${GRPC_HOST}:${GRPC_PORT}`,
      package: 'notifications',
      protoPath: join(__dirname, '../../../apps/notification-service/src/app/protos/notifications.proto'),
    },
  });

  await app.connectMicroservice<KafkaOptions>(KAFKA_OPTIONS)

  app.startAllMicroservices();

  await app.listen(8086);

  Logger.log(`🚀 Notification service successfully started 🚀`);
}

(async () => await bootstrap())()
