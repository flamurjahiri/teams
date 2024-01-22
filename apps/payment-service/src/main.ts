import {NestApplication, NestFactory} from '@nestjs/core';
import {PaymentModule} from "./app/payment.module";
import {KAFKA_OPTIONS} from "./assets/configs";

async function bootstrap() {
  const app: NestApplication = await NestFactory.create(PaymentModule);
  app.setGlobalPrefix('/payment/api');

  await app.connectMicroservice(KAFKA_OPTIONS)

  await app.startAllMicroservices();

  await app.listen(9090);
}

(async () => await bootstrap())()
