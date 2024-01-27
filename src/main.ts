import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowable methods
    // credentials: true, // This allows session cookie to be sent back and forth
  });

  await app.listen(4200);
}
bootstrap();
