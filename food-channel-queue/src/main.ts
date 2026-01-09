import { config } from 'dotenv';
config()

import {
  LogLevel,
  VersioningType,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as os from "os";
import { AppModule } from "./app.module";
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

    // app.connectMicroservice<MicroserviceOptions>(grpcServerOptions);
    await app.startAllMicroservices();
  
    app.enableVersioning({
      type: VersioningType.URI,
    });
  
    app.setGlobalPrefix("/api")

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
  
}
bootstrap();
