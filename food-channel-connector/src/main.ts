import { config } from 'dotenv';
config()

import {
  HttpException,
  HttpStatus,
  LogLevel,
  ValidationError,
  ValidationPipe,
  VersioningType,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as os from "os";
import { AppModule } from "./app.module";
import { grpcServerOptions } from "./v1/grpc/server/grpc-server.options";
import { ExceptionResponseDetail } from "./utils.common/utils.exception.common/utils.exception.common";
import { MicroserviceOptions } from "@nestjs/microservices";
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
    
    
  // console.log(`
  //   ==============================TECHRES CHANNEL FOOD VALIDATOR=============================
  //     CONFIG_KAFKA_HOST : ${process.env.CONFIG_KAFKA_HOST},
  //     CONFIG_KAFKA_PORT : ${process.env.CONFIG_KAFKA_PORT},

  //     CONFIG_GRPC_NODEJS_FOOD_CHANNEL_PROCESSOR_HOST : ${process.env.CONFIG_GRPC_NODEJS_FOOD_CHANNEL_PROCESSOR_HOST},
  //     CONFIG_GRPC_NODEJS_FOOD_CHANNEL_PROCESSOR_PORT : ${process.env.CONFIG_GRPC_NODEJS_FOOD_CHANNEL_PROCESSOR_PORT},

  //     SERVICE_PORT:${process.env.SERVICE_PORT}, 
  //     GRPC_SERVICE_PORT :${process.env.GRPC_SERVICE_PORT},

  //   ==============================TECHRES CHANNEL FOOD VALIDATOR==============================`);
  
}
bootstrap();
