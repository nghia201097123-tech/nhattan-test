import { config } from 'dotenv';
config()

import './polyfills';

import {
  HttpException,
  HttpStatus,
  LogLevel,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as os from "os";
import { AppModule } from "./app.module";
import { grpcServerOptions } from "./v1/grpc/server/grpc-server.options";
import { ExceptionResponseDetail } from "./utils.common/utils.exception.common/utils.exception.common";
import { MicroserviceOptions } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
const envConfig = dotenv.parse(fs.readFileSync(".env"));


async function bootstrap() {

  process.env.uv_threadpool_size = os.cpus().length.toString();
    const app = await NestFactory.create(AppModule, {
      logger: process.env.CONFIG_LOGGER_LEVEL.split(',').filter(
        (level: string): level is LogLevel => {
          return ['log', 'error', 'warn', 'debug', 'verbose'].includes(
            level as LogLevel,
          );
        },
      ),
    });

    app.connectMicroservice<MicroserviceOptions>(grpcServerOptions);
    await app.startAllMicroservices();

    const config = new DocumentBuilder()
    .setTitle("HỆ THỐNG CHANNEL FOOD")
    .setDescription(
      "HỆ THỐNG CHANNEL FOOD"
    )
    .setVersion("version 1.0.0")
    .setBasePath("/doc")
    .addBearerAuth({
      description: `Truyền Basic_secret phù hợp`,
      name: "Authorization",
      type: "http",
      in: "Header",
    })
    .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup("doc", app, document);
  
    app.enableVersioning({
      type: VersioningType.URI,
    });
  
    app.setGlobalPrefix("/api")
  
    app.useGlobalPipes(
      new ValidationPipe({
        exceptionFactory: (validationErrors: ValidationError[] = []) => {
          // Safely get the first validation error message
          const firstError = validationErrors[0];
          const errorMessage = firstError?.constraints
            ? Object.values(firstError.constraints)[0]
            : 'Validation failed';

          throw new HttpException(
            new ExceptionResponseDetail(
              HttpStatus.BAD_REQUEST,
              errorMessage
            ),
            HttpStatus.BAD_REQUEST // Fixed: Return correct HTTP status code
          );
        },
      })
    );
  
    app.enableCors();
    await app.listen(process.env.SERVICE_PORT, "0.0.0.0");
  
    let moment = require('moment-timezone');
    console.log(moment().tz("Asia/Ho_Chi_Minh").format());
  
    console.log('Ho Chi Minh TimeZone:',moment().tz("Asia/Ho_Chi_Minh").format('DD-MM-YYYY HH:MM:SS'));

    // Log only non-sensitive configuration in development
    if (["local", "beta", "staging"].includes(process.env.CONFIG_ENV_MODE)) {
      const sensitiveKeys = ['PASSWORD', 'SECRET', 'TOKEN', 'KEY', 'CREDENTIAL'];
      console.log('=== Application Configuration (non-sensitive) ===');
      for (const k in envConfig) {
        const isSensitive = sensitiveKeys.some(sk => k.toUpperCase().includes(sk));
        if (!isSensitive) {
          console.log(`${k}=${envConfig[k]}`);
        }
      }
      console.log('=================================================');
    } 
  }

bootstrap();
