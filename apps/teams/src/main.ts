import {HttpAdapterHost, NestFactory} from '@nestjs/core';
import {AppModule} from './app/app.module';
import {AllExceptionFilter} from "./app/providers/all-exception.filter";

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
}

(async () => await bootstrap())()
