import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // КРИТИЧНО: Настройка CORS ДО globalPrefix
  app.enableCors({
    origin: 'http://localhost:5173', // URL Vue приложения
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  // Глобальный префикс ДОЛЖЕН быть ПОСЛЕ CORS
  app.setGlobalPrefix('api');
  
  // Опционально: middleware для дополнительных CORS заголовков
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      console.log('OPTIONS preflight request');
      return res.status(200).end();
    }
    
    next();
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log('Server start: http://localhost:3000/api');
}
bootstrap();