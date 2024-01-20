import {HttpAdapterHost, NestFactory} from '@nestjs/core';
import {AppModule} from './app/app.module';
import {AllExceptionFilter} from "./app/providers/filters/all-exception.filter";
import {Logger} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('/teams/api');
  app.enableShutdownHooks();
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,POST,DELETE,OPTIONS',
    exposedHeaders: 'hide-message',
    credentials: true,
  })


  app.useGlobalFilters(new AllExceptionFilter(app.get(HttpAdapterHost)))
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 9090);

  Logger.log(`🚀 Application started is running on: ${process.env.PORT || 9090}`);

}

(async () => await bootstrap())()
