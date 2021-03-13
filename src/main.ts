import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { PORT, HOST } = process.env
  await app.listen(3000, () => {
    console.log(`
      Application running in http://${HOST}:${PORT}
    `);
  });
}
bootstrap();
